#include <ESP8266httpUpdate.h>
#include <rBase64.h>                                  // add from Arduino library.  You may need http://arduino.esp8266.com/stable/package_esp8266com_index.json
#include <ESP8266HTTPClient.h>
#include <WiFiUdp.h>
#include <WiFiServer.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <ESP8266WiFiType.h>
#include <ESP8266WiFiSTA.h>
#include <ESP8266WiFiScan.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266WiFiGeneric.h>
#include <ESP8266WiFiAP.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>                             // add from Arduino library.  You may need http://arduino.esp8266.com/stable/package_esp8266com_index.json
                                                      // be sure to adjust packet size, stated here: https://kevinsaye.wordpress.com/2016/09/22/connecting-an-esp8266-to-azure-iot-remote-monitoring-solution/
#include "EmonLib.h"                                  // add from Arduino library.  You may need http://arduino.esp8266.com/stable/package_esp8266com_index.json
#include "FS.h"

WiFiClientSecure espClient;
PubSubClient client(espClient);
ESP8266HTTPUpdate OTA;
HTTPClient http;
EnergyMonitor emon1;

const char* ssid      = "your SSID";
const char* password  = "your WifiPassword";
String deviceName     = "your iot device Name";        // Example: myDevice
String Key            = "your key";                    // Example: ErNBy4a6NQL/3lBfcd+UwuOcIwfDURlIaDkacWcYhWA=
String serverName     = "your Azure IoT Hub Name";     // Example: kevinsayIoT.azure-devices.net
String SASGenerator   = "your SAS generagor";          // URL to generate the SAS token.  Example: http://january2017.azurewebsites.net/api/generateSAS?deviceId=
float callibration    = 92.75;                         // default value for callibration
float callibrationchg = .025;                          // for each callibration cycle, how much to move the callibration
float callibrationmtc = .05;                           // how close the callibration should get in "callibrationCount" cycles
float minimumReading  = 2;                             // if less than 2 amps, we don't care.  sensors are not exact
float sketchVersion   = 1.0;                           // just a version of this sketch.   Used for when you OTA and to ensure the correct version is running
String configFileName = "/config.txt";                 // a config file that we store the callibrated value
int loopCounter       = 1;                             // a loop counter for sampling current
int samplesPerMsg     = 30;                            // how many samples before we send an IoT message there is a half second delay, so for a 1 minute sample set to 30
float ampAverage;                                      // used to hold the weighted average of the samples

void log(String data) {
  Serial.println(data);
}

String getSAS() {
  String URL = SASGenerator;
  URL += deviceName;
  URL += "&iotHub=";
  URL += serverName;
  URL += "&key=";
  URL += rbase64.encode(Key);
  http.begin(URL);
  int httpCode = http.GET();
  String mySAS = ".";

  if (httpCode == HTTP_CODE_OK) {
    mySAS = http.getString();
    mySAS = mySAS.substring(1, mySAS.length() - 1);  // removing the leading and trailing quotes
  }
  else {
    Serial.print("Error getting SAS: ");
    Serial.println(httpCode);
    mySAS = "Error getting SASToken.";
  }

  return mySAS;
}

void connectToIoTHub() {
  while (client.connected() == false) {
    log("Connecting to IoT Hub");
    String userName = serverName;
    userName += "/";
    userName += deviceName;
    log(userName);

    client.connect(deviceName.c_str(), userName.c_str(), getSAS().c_str());
    if (client.connected()) {
      String subscribestring = "devices/";
      subscribestring += deviceName;
      subscribestring += "/messages/devicebound/#";
      log(subscribestring);
      client.subscribe(subscribestring.c_str());
    }
  }
}

void sendMessage(String keyName, String keyValue) {
    String json = "{ ";
    json += keyName;
    json += ": \"";
    json += keyValue;
    json += "\" }";
  
    String publishstring = "devices/";
    publishstring += deviceName;
    publishstring += "/messages/events/";

    client.publish(publishstring.c_str(), json.c_str());
}

void sendMessage(String keyName, float keyValue) {
    String json = "{ ";
    json += keyName;
    json += ": ";
    json += keyValue;
    json += " }";
  
    String publishstring = "devices/";
    publishstring += deviceName;
    publishstring += "/messages/events/";

    client.publish(publishstring.c_str(), json.c_str());
}

void callibrate(String callibrateTo) {
  float target = callibrateTo.toFloat();
  int mycounter = 1;
  float currentCallibration = callibration;                                 // where we start from
  double Irms;
  log("in callibrate()");
  bool complete = false;
  
  while (complete == false) {
    emon1.current(A0, currentCallibration);                                   // change the currentCallibration
    for (int i=0; i <= 6; i++){                                               // We have to read the sensor at least 4 times to get an accurate reading
      Irms = emon1.calcIrms(1480);
      delay(250);
    } 
    
    String logMessage = "count ";
    logMessage += mycounter;
    logMessage += " target is ";
    logMessage += target;
    logMessage += " reading was ";
    logMessage += Irms;
    log(logMessage);

    if (Irms < minimumReading) {
      complete = true;
    } else if (Irms >= target - callibrationmtc && Irms <= target + callibrationmtc) {
      String message = "Callibration Success: Target=";
      message += callibrateTo;
      message += " currentCallibration=";
      message += currentCallibration;
      message += " sensorReading=";
      message += Irms;
      sendMessage("callibrationStatus", message);
      log(message);
      complete = true;
    } else if (Irms < target) {
      currentCallibration = currentCallibration + callibrationchg;
      logMessage = "Adding to currentCallibration.  Value is now:";
      logMessage += currentCallibration;
      log(logMessage);
    } else {
      currentCallibration = currentCallibration - callibrationchg;
      logMessage = "Subtracting from currentCallibration.  Value is now:";
      logMessage += currentCallibration;
      log(logMessage);
    }
  }

  File configFile = SPIFFS.open(configFileName, "w");
  configFile.println(currentCallibration);
  
  Serial.print("Wrote value ");
  Serial.print(currentCallibration);
  Serial.print(" to config file ");
  Serial.println(configFileName);
  configFile.close();
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message+=(char)payload[i];
  }

  if (message.startsWith("Callibrate:")) {
    Serial.print("Callibrate to:");
    Serial.println(message.substring(11));
    callibrate(message.substring(11));
  } else if (message == "getCallibration") {
    sendMessage("currentCallibration", callibration); 
  } else if (message.startsWith("OTA:")){
    // We expect something like "OTA http://www.server.com/mypath/mystuff/binary.bin"

    String fullURL = message.substring(message.indexOf("://") -4);;
    Serial.print("OTA updating from: ");
    Serial.println(fullURL);
    t_httpUpdate_return OTAStatus = OTA.update(fullURL.c_str());
    switch(OTAStatus) {
    case HTTP_UPDATE_FAILED:
      Serial.printf("HTTP_UPDATE_FAILD Error (%d): %s", ESPhttpUpdate.getLastError(), ESPhttpUpdate.getLastErrorString().c_str());
      break;

    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("HTTP_UPDATE_NO_UPDATES");
      break;

    case HTTP_UPDATE_OK:
      Serial.println("HTTP_UPDATE_OK");
      break;
    } 
  } else {
    log(message);
  }
}

void setup()
{  
  Serial.begin(115200);
  SPIFFS.begin();

  if (SPIFFS.exists(configFileName)) {
    File configFile = SPIFFS.open(configFileName, "r");
    callibration = configFile.parseFloat();
    Serial.print("Read config file ");
    Serial.print(configFileName);
    Serial.print(" returned value: ");
    Serial.println(callibration);
    configFile.close();
  }
  
  emon1.current(A0, callibration);             // for NodeMCU, we only have one ADC

  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  client.setServer(serverName.c_str(), 8883);
  client.setCallback(callback);
  connectToIoTHub();
  sendMessage("booting", sketchVersion);
}

void loop()
{
  connectToIoTHub();
  client.loop();
  
  if (Serial.available() > 0) {
    String callibrateTo = Serial.readString();
    sendMessage("Callibrate", callibrateTo);
    callibrate(callibrateTo);
  }

  double Irms = emon1.calcIrms(1480);  // Calculate Irms only
  Serial.println(Irms);

  ampAverage = ((ampAverage * loopCounter) + Irms) / ( loopCounter + 1);

  if (loopCounter >= samplesPerMsg) {
    if (Irms > minimumReading) {                 // less than 2 Amps we don't care about
      sendMessage("amps", ampAverage);
    }
    loopCounter = 0;
    ampAverage = 0;
  }
  
  delay(500);

  loopCounter ++;
}

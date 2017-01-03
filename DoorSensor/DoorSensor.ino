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
#include <PubSubClient.h>

WiFiClientSecure espClient;
PubSubClient client(espClient);

String SASToken = "HostName=AustinIoT.azure-devices.net;DeviceId=FrontDoor;SharedAccessSignature=SharedAccessSignature sr=AustinIoT.azure-devices.net%2fdevices%2fFrontDoor&sig=23hrwREMOVED%3d&se=1513273225";
const char* SSID = "saye.org";
const char* PSK = "REMOVEDws";

int DoorPin = D1;    // What PIN to connect the Door sensor.  Other wire goes to ao GND
int DoorStatus;

String deviceName =  mySubString(SASToken, "DeviceId=", ";SharedAccessSignature=");
String serverName = mySubString(SASToken, "HostName=", ";DeviceId=");
String password = SASToken.substring(SASToken.indexOf("SharedAccessSignature sr"));

long startTime;
long postingInterval = 1000 * 60 * 1;

void setup()
{
  startTime = millis();
  pinMode(DoorPin, INPUT_PULLUP);
  Serial.begin(115200);
  client.setServer(serverName.c_str(), 8883);
  connectToIoTHub();
  checkDoor();
}

void loop()
{
  // All the real work is done here!
  connectToIoTHub();
  client.loop();
  checkDoor();
}

void connectToWiFi() {
  log("Connecting to WiFi");
  WiFi.stopSmartConfig();
  WiFi.hostname(deviceName);
  WiFi.enableAP(false);
  WiFi.begin(SSID, PSK);
  delay(5000);
  while (WiFi.isConnected() == false) {
    delay(5000);
    log("Connecting to WiFi");
    WiFi.begin(SSID, PSK);
  }
}

void connectToIoTHub() {
  if (WiFi.isConnected() == false) {
    connectToWiFi();
  }

  while (client.connected() == false) {
    log("Connecting to IoT Hub");
    String userName = serverName;
    userName += "/";
    userName += deviceName;
    log(userName);

    client.connect(deviceName.c_str(), userName.c_str(), password.c_str());
    if (client.connected()) {
      String subscribestring = "devices/";
      subscribestring += deviceName;
      subscribestring += "/messages/devicebound/#";
      log(subscribestring);
      client.subscribe(subscribestring.c_str());
    }
  }
}

void checkDoor() {
  int currentStatus = digitalRead(DoorPin);
  if (currentStatus != DoorStatus || millis() > startTime + postingInterval) {
    String json = "{ doorStatus: ";
    json += currentStatus;
    json += ", deviceId: '";
    json += deviceName;
    json += "', UpTimeMS: ";
    json += millis();
    json += "' }";

    String publishstring = "devices/";
    publishstring += deviceName;
    publishstring += "/messages/events/";
    log(json);

    client.publish(publishstring.c_str(), json.c_str());
    DoorStatus = currentStatus;
    startTime = millis();
  }
}

void log(String data) {
  Serial.println(data);
 }

String mySubString(String fullString, String start, String end) {
  int lenOfStart = start.length();
  int startPosition = fullString.indexOf(start.c_str());
  int endPosition = fullString.indexOf(end.c_str());

  return fullString.substring(startPosition + lenOfStart, endPosition);
}


#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiAP.h>
#include <ESP8266WiFiGeneric.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266WiFiScan.h>
#include <ESP8266WiFiSTA.h>
#include <ESP8266WiFiType.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <WiFiServer.h>
#include <WiFiUdp.h>

WiFiClientSecure espClient;
PubSubClient client(espClient);

String ssid           = "MyWiFi";
String password       = "MyPSK";
String deviceName     = "airOne";                               // Example: myDevice
String devicePassword = "SharedAccessSignature sr=myhub.azure-devices.net%2fdevices%2fairOne&sig=uP9jBnTPb%2fnAlK%2fuREMOVEDftvax3UQ%3d&se=1520551754";
String serverName     = "mythub.azure-devices.net";             // Example: kevinsayIoT.azure-devices.net
float sketchVersion   = 1.0;                                    // just a version of this sketch.   Used for when you OTA and to ensure the correct version is running
int sampleDealyMin    = 1;

void connectToWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    if(client.connected()){
      client.disconnect();
    }
    WiFi.stopSmartConfig();
    WiFi.hostname(deviceName);
    WiFi.enableAP(false);
    WiFi.begin(ssid.c_str(), password.c_str());
    
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
    }  
  Serial.println(WiFi.localIP());
  }
}

void connectToIoTHub() {
  int retry = 0;
  while (!client.connected() and retry < 5 and deviceName.length() > 0 and deviceName.length() > 0) {
    Serial.println("Connecting to IoT Hub");
    String userName = serverName;
    userName += "/";
    userName += deviceName;

    client.connect(deviceName.c_str(), userName.c_str(),devicePassword.c_str());
    if (client.connected()) {
      String subscribestring = "devices/";
      subscribestring += deviceName;
      subscribestring += "/messages/devicebound/#";
      client.subscribe(subscribestring.c_str());
    }
    retry++;
  }
}

void sendMessage(String keyName, float keyValue) {
    if (deviceName.length() > 0 and devicePassword.length() >0) {
      connectToIoTHub();
      
      String json = "{\"";
      json += keyName;
      json += "\":";
      json += keyValue;
      json += "}";
    
      String publishstring = "devices/";
      publishstring += deviceName;
      publishstring += "/messages/events/";
  
      client.publish(publishstring.c_str(), json.c_str());
    }
}

void sendMessage(String keyName, String keyValue) {
    if (deviceName.length() > 0 and devicePassword.length() >0) {
      connectToIoTHub();
  
      String json = "{\"";
      json += keyName;
      json += "\":\"";
      json += keyValue;
      json += "\" }";
    
      String publishstring = "devices/";
      publishstring += deviceName;
      publishstring += "/messages/events/";
  
      client.publish(publishstring.c_str(), json.c_str());
    }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message+=(char)payload[i];
  }

  Serial.println("Received message: " + message);
}

void setup() {
  Serial.begin(115200);

  connectToWiFi();

  client.setServer(serverName.c_str(), 8883);
  client.setCallback(callback);
  
  connectToIoTHub();

  sendMessage("status", "Booting");

  pinMode(D2, OUTPUT);
  digitalWrite(D2, LOW); 
}

void loop() {
  connectToWiFi();
  connectToIoTHub();
  client.loop();

  float voltage;
  voltage =  analogRead(A0);
  sendMessage("voltage", voltage);
  Serial.print("voltage=");
  Serial.println(voltage);
  
  delay(1000 * 60 * sampleDealyMin);
}

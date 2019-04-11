

/*
    Name:       ESP HTTP Endpoint.ino
    Created:  4/8/2019 2:46:23 PM
    Author:     HPELITEONE\ksaye
*/

#include <ESP8266WebServer.h>
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

#include "DHT.h"

#define DHTPIN D1     // what digital pin we're connected to

// Uncomment whatever type you're using!
//#define DHTTYPE DHT11   // DHT 11
#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321
//#define DHTTYPE DHT21   // DHT 21 (AM2301)

// Connect pin 1 (on the left) of the sensor to +5V
// NOTE: If using a board with 3.3V logic like an Arduino Due connect pin 1
// to 3.3V instead of 5V!
// Connect pin 2 of the sensor to whatever your DHTPIN is
// Connect pin 4 (on the right) of the sensor to GROUND
// Connect a 10K resistor from pin 2 (data) to pin 1 (power) of the sensor

// Initialize DHT sensor.
// Note that older versions of this library took an optional third parameter to
// tweak the timings for faster processors.  This parameter is no longer needed
// as the current DHT reading algorithm adjusts itself to work on faster procs.

DHT dht(DHTPIN, DHTTYPE);
ESP8266WebServer server(80);

String deviceName = "simpleweb";
String ssid = "msft";
String pass = "123Microsoft";
const int ledPin =  LED_BUILTIN;// the number of the LED pin
int ledState = LOW;
int counter = 0;

void lightChange() {
    if (ledState == LOW) {
      ledState = HIGH;
    } else {
      ledState = LOW;
    }

    // set the LED with the ledState of the variable:
    digitalWrite(ledPin, ledState);
    server.send(200, "text/plain", "Success changing the light!");
}

void handleRoot() {
  /*
  const char* www_username = "admin";
  const char* www_password = "esp8266";
  if (!server.authenticate(www_username, www_password))
    return server.requestAuthentication();
  */

  counter += 1;
  String  myresponse = "junk";
      myresponse += ":";
      //myresponse += String(counter);
      myresponse += dht.readTemperature(true);
      myresponse += ":";
      myresponse += "andmorejunk";
  server.send(200, "text/plain", myresponse);
}

void setup()
{
  Serial.begin(9600);
//  Serial.setDebugOutput(true);
  pinMode(ledPin, OUTPUT);
  WiFi.stopSmartConfig();
  WiFi.enableAP(false);
  WiFi.hostname(deviceName);
  WiFi.begin(ssid.c_str(), pass.c_str());
  Serial.print("Waiting for Wifi connection.");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/trigger", lightChange);
  server.begin();
  dht.begin();
}

void loop()
{
  server.handleClient();
}

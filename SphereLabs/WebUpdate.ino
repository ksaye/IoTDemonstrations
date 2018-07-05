/*
  To upload through terminal you can use: curl -F "image=@firmware.bin" esp8266-webupdate.local/update
*/

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

const char* host        = "esp8266-webupdate";
const char* ssid        = "IOTDEMO";
const char* password    = "iotDemo1";
const float codeversion = 2.0;      // we report this value via the UART
const int loopdelay     = 1000;
int loopcounter         = 0;
bool ledon              = false;

ESP8266WebServer server(80);
const char* serverIndex = "<form method='POST' action='/update' enctype='multipart/form-data'><input type='file' name='update'><input type='submit' value='Update'></form>";

void setup(void){
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println();
  Serial.println("Booting Sketch...");
  WiFi.stopSmartConfig();
  WiFi.enableAP(false);
  WiFi.hostname(host);
  WiFi.begin(ssid, password);
  if(WiFi.waitForConnectResult() == WL_CONNECTED){
    MDNS.begin(host);
    server.on("/", HTTP_GET, [](){
      server.sendHeader("Connection", "close");
      server.send(200, "text/html", serverIndex);
    });
    server.on("/update", HTTP_POST, [](){
      server.sendHeader("Connection", "close");
      server.send(200, "text/plain", (Update.hasError())?"FAIL":"OK");
      ESP.restart();
    },[](){
      HTTPUpload& upload = server.upload();
      if(upload.status == UPLOAD_FILE_START){
        Serial.setDebugOutput(true);
        WiFiUDP::stopAll();
        Serial.printf("Update: %s\n", upload.filename.c_str());
        uint32_t maxSketchSpace = (ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000;
        if(!Update.begin(maxSketchSpace)){//start with max available size
          Update.printError(Serial);
        }
      } else if(upload.status == UPLOAD_FILE_WRITE){
        if(Update.write(upload.buf, upload.currentSize) != upload.currentSize){
          Update.printError(Serial);
        }
      } else if(upload.status == UPLOAD_FILE_END){
        if(Update.end(true)){ //true to set the size to the current progress
          Serial.printf("Update Success: %u\nRebooting...\n", upload.totalSize);
        } else {
          Update.printError(Serial);
        }
        Serial.setDebugOutput(false);
      }
      yield();
    });
    server.begin();
    MDNS.addService("http", "tcp", 80);

//    Serial.printf("Ready! Open http://%s.local in your browser\n", host);
  } else {
//    Serial.println("WiFi Failed");
  }
}

void loop(void){
  if (loopcounter >= (loopdelay * codeversion * codeversion)) {
    loopcounter = 0;
    Serial.print("{\"version\":");
    Serial.print(codeversion);
    Serial.print(",\"IP\":\"");
    Serial.print(WiFi.localIP().toString());
    Serial.println("\"}");
    if (ledon) {
        digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
        ledon = false;
    } else {
        digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
        ledon = true;
    }
  }
  server.handleClient();
  delay(1);
  loopcounter++;
}

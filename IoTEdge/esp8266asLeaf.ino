#include <DHT_U.h>					// for DHT22 sensor
#include <DHT.h>					// for DHT22 sensor
#include <Adafruit_Sensor.h>		// for DHT22 sensor
#include <ESP8266httpUpdate.h>		// OTA
#include <ESP8266HTTPClient.h>		// OTA
#include <OneWire.h>				// Temp Sensor
#include <DallasTemperature.h>		// Temp Sensor
#include <WiFiUdp.h>
#include <WiFiServerSecure.h>
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
#include <AzureIoTUtility.h>		// Azure IoT
#include <AzureIoTHub.h>			// Azure IoT
#include <AzureIoTProtocol_MQTT.h>	// Azure IoT
#include <ArduinoJson.hpp>			// to parse the message to JSON
#include <ArduinoJson.h>			// to parse the message to JSON

#define MIN_EPOCH 40 * 365 * 24 * 3600
#define WaterTempPin    D2      // define what pin controls the waterTemp
#define DHTTYPE           DHT22     // DHT 22 (AM2302)
#define	DEBUG_HTTP_UPDATE
#define DHTPIN            D3         // Pin which is connected to the DHT sensor.

OneWire                 WaterTemp(WaterTempPin);
DallasTemperature       sensor(&WaterTemp);
DHT_Unified				dht(DHTPIN, DHTTYPE);

IOTHUB_CLIENT_LL_HANDLE iotHubClientHandle;
IOTHUB_CLIENT_STATUS	status;
ESP8266HTTPUpdate OTA;
DynamicJsonBuffer jsonBuffer;

String deviceName	= "leaf1";
String ssid			= "myWiFiNetwork";
String pass			= "myWiFiPassword";
static const char* connectionString = "HostName=myiothub.azure-devices.net;DeviceId=leaf1;SharedAccessKey=ep1S0d*************nNGb1HI=;GatewayHostName=gateway1.saye.org";
int counter = 0;
int counterFrequency = 1;			// how many miunutes until we send the status message

bool b_ota = false;					// needed for OTA operations
time_t otaTime = 0;
String otaURL = "";

char compile_date[] = __DATE__ " " __TIME__;	// when this version was compiled

void initIoTHub() {
	configTime(0, 0, "pool.ntp.org", "time.nist.gov");
	int counter = 0;
	if (time(NULL) < MIN_EPOCH && counter < 3) {
		Serial.println("Fetching NTP epoch time failed! Waiting 2 seconds to retry.");
		delay(2000);
		counter++;
	}

	iotHubClientHandle = IoTHubClient_LL_CreateFromConnectionString(connectionString, MQTT_Protocol);

	if (iotHubClientHandle == NULL)
	{
		(void)printf("ERROR: Failed on IoTHubClient_LL_Create\r\n");
	}
	else {
		IoTHubClient_LL_SetMessageCallback(iotHubClientHandle, IoTHubMessageCallback, NULL);
		IoTHubClient_LL_SetDeviceTwinCallback(iotHubClientHandle, deviceTwinCallback, NULL);

		(void)printf("Success on IoTHubClient_LL_Create\r\n");
	}
}

// for messages that are sent to this device
static IOTHUBMESSAGE_DISPOSITION_RESULT IoTHubMessageCallback(IOTHUB_MESSAGE_HANDLE message, void* userContextCallback)
{
	IOTHUBMESSAGE_DISPOSITION_RESULT result;
	const unsigned char* buffer;
	size_t size;
	String messageString;
	if (IoTHubMessage_GetByteArray(message, &buffer, &size) != IOTHUB_MESSAGE_OK)
	{
		printf("unable to IoTHubMessage_GetByteArray\r\n");
		result = IOTHUBMESSAGE_ABANDONED;
	}
	else {
		/*buffer is not zero terminated*/
		char* temp = (char*)malloc(size + 1);
		if (temp == NULL)
		{
			printf("failed to malloc\r\n");
			result = IOTHUBMESSAGE_ABANDONED;
		}
		else
		{
			(void)memcpy(temp, buffer, size);
			temp[size] = '\0';
			messageString = String(temp);
			Serial.println("Message received:" + messageString);

			// parse the message to JSON, so I can get the OTA URL you can send: {"OTA":"true", "URL":"http://doverpoc.blob.core.windows.net/ota/ESP8266-7-07.bin"}
			JsonObject& C2DMessage = jsonBuffer.parse(messageString);
			if (C2DMessage.success() && C2DMessage.containsKey("OTA") && C2DMessage.containsKey("URL")) {
				Serial.print(" received OTA, will apply at: ");
				
				otaURL = C2DMessage["URL"].asString();
				b_ota = true;
				if (C2DMessage.containsKey("otaTime")) {
					otaTime = timer_t(C2DMessage["otaTime"]);
				}
				else {
					otaTime = time(NULL) + 45;		// will ota in 45 seconds default
				}
				
				Serial.println(otaTime);
			}

			free(temp);
			result = IOTHUBMESSAGE_ACCEPTED;
		}
	}

	return result;
}

// confirmation to the device that a message send was successful
void sendMessageCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result, void* userContextCallback)
{
	if (result == IOTHUB_CLIENT_CONFIRMATION_OK) {
		unsigned long messageTrackingId = (unsigned long)(ulong)userContextCallback;
		(void)printf("Message Id: %u Received.\r\n", messageTrackingId);
		(void)printf("Message took: %u seconds.\r\n", time(NULL) - messageTrackingId);
	}
	else {
		Serial.println("ERROR: " + String(ENUM_TO_STRING(IOTHUB_CLIENT_CONFIRMATION_RESULT, result)));
	}
}

static void deviceTwinCallback(DEVICE_TWIN_UPDATE_STATE update_state, const unsigned char* payLoad, size_t size, void* userContextCallback)
{
	(void)userContextCallback;

	printf("Device Twin update received (state=%s, size=%u): \r\n",
		ENUM_TO_STRING(DEVICE_TWIN_UPDATE_STATE, update_state), size);
	for (size_t n = 0; n < size; n++)
	{
		printf("%c", payLoad[n]);
	}
	printf("\r\n");
}

void sendIoTMessage(const char* message, long trackingID) {
	if (IoTHubClient_LL_GetSendStatus(iotHubClientHandle, &status) == IOTHUB_CLIENT_OK) {
		IOTHUB_MESSAGE_HANDLE messageHandle = IoTHubMessage_CreateFromString(message);
		IOTHUB_CLIENT_RESULT localResult = IoTHubClient_LL_SendEventAsync(iotHubClientHandle, messageHandle, sendMessageCallback, (void*)(ulong)trackingID);
		IoTHubMessage_Destroy(messageHandle);
	}
}

static void reportedStateCallback(int status_code, void* userContextCallback)
{
	(void)userContextCallback;
	printf("Device Twin reported properties update completed with result: %d\r\n", status_code);
}

void sendTWIN(const char* reportedProperties) {
	if (IoTHubClient_LL_SendReportedState(iotHubClientHandle, (const unsigned char*)reportedProperties, strlen(reportedProperties), reportedStateCallback, NULL) != IOTHUB_CLIENT_OK)
	{
		Serial.println("Failed sending serialized reported state\n");
	}
	else {
		Serial.print("Success sending TWIN: ");
		Serial.println(reportedProperties);
	}
}

void ota() {

	if (b_ota && otaURL != "" && time(NULL) >= otaTime) {
		Serial.println("performing OTA Operation");

		// note, the OTA operation will fail if the ESP8266 is not reset inbetween flashing from PC and running
		t_httpUpdate_return ret = ESPhttpUpdate.update(otaURL);

		switch (ret) {
			case HTTP_UPDATE_FAILED:
				(void)printf("HTTP_UPDATE_FAILD Error (%d): %s\n", ESPhttpUpdate.getLastError(), ESPhttpUpdate.getLastErrorString().c_str());
				otaTime = time(NULL) + 60;
				break;
			case HTTP_UPDATE_NO_UPDATES:
				(void)printf("HTTP_UPDATE_NO_UPDATES\n");
				otaTime = time(NULL) + 60;
				break;
			case HTTP_UPDATE_OK:
				(void)printf("HTTP_UPDATE_OK\n");
				b_ota = false;
				break;
		}
	}
}

void setup()
{
	Serial.begin(9600);
	Serial.setDebugOutput(true);

	WiFi.stopSmartConfig();
	WiFi.enableAP(false);
	WiFi.hostname(deviceName);
	WiFi.begin(ssid.c_str(), pass.c_str());
	Serial.print("Waiting for Wifi connection.");
	while (WiFi.status() != WL_CONNECTED) {
		Serial.print(".");
		delay(500);
	}

	initIoTHub();
	sendIoTMessage("{\"connected\":\"now\"}", NULL);
	sensor.begin();
	dht.begin();

	String	myTwin = "{\"compile_date\": \"";
			myTwin += compile_date;
			myTwin += "\", \"localIP\":\"";
			myTwin += WiFi.localIP().toString();
			myTwin += "\", \"bootTime\":";
			myTwin += time(NULL);
			myTwin += "}";
	sendTWIN(myTwin.c_str());
}

void loop()
{
	if (b_ota) {	// checking for any OTA actions
		ota();	
	}

	counter += 1;
	if (counter >= (counterFrequency * 60)) {
		sensor.requestTemperatures();               // get the water temperature

		String mymessage = "{\"epcohTime\":";
			   mymessage += time(NULL);
			   mymessage += ", \"compileDate\": \"";
			   mymessage += compile_date;
			   mymessage += "\", \"waterTempF\":";
			   mymessage += sensor.getTempFByIndex(0);
			   sensors_event_t event;
			   dht.temperature().getEvent(&event);
			   mymessage += "\", \"airTempC\":";
			   mymessage += event.temperature;
			   mymessage += "}";
		Serial.println(mymessage);
		sendIoTMessage(mymessage.c_str(), time(NULL));
		counter = 0;
	}

	IoTHubClient_LL_DoWork(iotHubClientHandle);
	delay(1000);

	IOTHUB_CLIENT_RESULT currentClientState = IoTHubClient_LL_GetSendStatus(iotHubClientHandle, &status);
	if (currentClientState != IOTHUB_CLIENT_OK) {
		Serial.print("IOTHUB_CLIENT_Status is: ");
		Serial.println(currentClientState);
	}
}

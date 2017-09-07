#include <DHT_U.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <ESP8266httpUpdate.h>
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
#include <AzureIoTUtility.h>
#include <AzureIoTHub.h>
#include <AzureIoTHubClient.h>
#include <AzureIoTProtocol_MQTT.h>

#define DHTTYPE			DHT11   // DHT 11

#define AirTempPin		D1		// what digital pin we're connected to
#define WaterTempPin	D2		// define what pin controls the waterTemp
#define RelayPIN		D5		// what pins control the Relay

#define OFF				HIGH
#define ON				LOW

int timeDelay;

static AzureIoTHubClient	iotHubClient;
IOTHUB_CLIENT_LL_HANDLE		iotHubClientHandle;
IOTHUB_CLIENT_STATUS		status;

WiFiClientSecure		espClient;
DHT						dht(AirTempPin, DHTTYPE);
WiFiUDP					UDPClient;
OneWire					WaterTemp(WaterTempPin);
DallasTemperature		sensor(&WaterTemp);
time_t					epochTime;
time_t					bootTime;

static const char*		connectionString = "HostName=myIoT.azure-devices.net;DeviceId=HotTub;SharedAccessKey=Vxg3H2REMOVEDmUb9g=";

String  ssid			= "MySSID";
String  password		= "MyPassword";
String  deviceName		= "HotTub";
int     sampleTime		= 2;            // minutes between each water and air temp sample
int     sendUDP			= 5555;

void initWifi() {
	if (WiFi.status() != WL_CONNECTED)
	{
		WiFi.stopSmartConfig();
		WiFi.enableAP(false);
		WiFi.hostname(deviceName);

		// Connect to WPA/WPA2 network. Change this line if using open or WEP network:
		WiFi.begin(ssid.c_str(), password.c_str());

		Serial.print("Waiting for Wifi connection.");
		while (WiFi.status() != WL_CONNECTED) {
			Serial.print(".");
			delay(500);
		}

		Serial.println("Connected to wifi");

		initTime();
	}
	initIoTHub();
}

void initTime() {
	configTime(0, 0, "pool.ntp.org", "time.nist.gov");

	while (true) {
		epochTime = time(NULL);

		if (epochTime == 0) {
			Serial.println("Fetching NTP epoch time failed! Waiting 2 seconds to retry.");
			delay(2000);
		}
		else {
			Serial.print("Fetched NTP epoch time is: ");
			Serial.println(epochTime);
			break;
		}
	}
}

static void sendMessage(const char* message)
{
	static unsigned int messageTrackingId;
	IOTHUB_MESSAGE_HANDLE messageHandle = IoTHubMessage_CreateFromString(message);

	if (IoTHubClient_LL_SendEventAsync(iotHubClientHandle, messageHandle, sendMessageCallback, (void*)(uintptr_t)messageTrackingId) != IOTHUB_CLIENT_OK)
	{
		Serial.println(" ERROR: Failed to hand over the message to IoTHubClient");
	}
	else
	{
		(void)printf(" Message Id: %u Sent.\r\n", messageTrackingId);
	}

	IoTHubMessage_Destroy(messageHandle);
	messageTrackingId++;
}

void sendMessageCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result, void* userContextCallback)
{
	unsigned int messageTrackingId = (unsigned int)(uintptr_t)userContextCallback;

	(void)printf(" Message Id: %u Received.\r\n", messageTrackingId);
}

static IOTHUBMESSAGE_DISPOSITION_RESULT IoTHubMessageCallback(IOTHUB_MESSAGE_HANDLE message, void* userContextCallback)
{
	// this is called if we have a message
	IOTHUBMESSAGE_DISPOSITION_RESULT result = IOTHUBMESSAGE_ACCEPTED;

	const char* messageId = "UNKNOWN";      // in case there is not a messageId associated with the message -- not required
	messageId = IoTHubMessage_GetMessageId(message);

	const unsigned char* buffer;
	size_t size;

	// for some reason, if I parse the message the ESP sometimes reboots.  :(

	if (IoTHubMessage_GetByteArray(message, &buffer, &size) != IOTHUB_MESSAGE_OK)
	{
		Serial.println(" Error: Unable to IoTHubMessage_GetByteArray");

		UDPAnnounce(" Error: Unable to IoTHubMessage_GetByteArray");

		result = IOTHUBMESSAGE_ABANDONED;
	}
	else
	{
		result = IOTHUBMESSAGE_ACCEPTED;

		timeDelay = sampleTime * 60;

		if (digitalRead(RelayPIN) == OFF) {
			TurnOn();
		}
		else {
			TurnOff();
		}
	}

	return result;
}

void initIoTHub() {
	// connect to IoT Hub, if our status is not ok
	while (IoTHubClient_LL_GetSendStatus(iotHubClientHandle, &status) != IOTHUB_CLIENT_OK) {
		initTime();

		iotHubClient.begin(espClient);
		iotHubClientHandle = IoTHubClient_LL_CreateFromConnectionString(connectionString, MQTT_Protocol);
		if (iotHubClientHandle == NULL)
		{
			(void)printf("ERROR: Failed on IoTHubClient_LL_Create\r\n");

			UDPAnnounce("ERROR: Failed on IoTHubClient_LL_Create");
		}
		else {
			IoTHubClient_LL_SetMessageCallback(iotHubClientHandle, IoTHubMessageCallback, NULL);

			(void)printf("Connected to IoT Hub.\r\n");
		}
	}
}

void setup() {
	Serial.begin(115200);

	pinMode(RelayPIN, OUTPUT);

	TurnOff();

	dht.begin();
	initWifi();

	bootTime = epochTime;
	
	UDPAnnounce("Booting");
}

void TurnOn() {
	digitalWrite(RelayPIN, ON);
}

void TurnOff() {
	digitalWrite(RelayPIN, OFF);
}

void UDPAnnounce(String message) {
	UDPClient.beginPacket("255.255.255.255", sendUDP);
	UDPClient.println(message);
	UDPClient.endPacket();
}

void loop() {
	timeDelay = 0;
	initWifi();									// always checking the WiFi connection

	sensor.requestTemperatures();				// get the water temperature 
	float waterTemp = sensor.getTempFByIndex(0);

	float airTemp		= dht.readTemperature(true);
	float humidity		= dht.readHumidity();
	float heatIndex		= dht.computeHeatIndex(airTemp, humidity);

	String  JSONMessage = "{\"airTemperature\":";
	JSONMessage += airTemp;
	JSONMessage += ", \"humidity\":";
	JSONMessage += humidity;
	JSONMessage += ", \"heatIndex\":";
	JSONMessage += heatIndex;
	JSONMessage += ", \"waterTemperature\":";
	JSONMessage += waterTemp;
	JSONMessage += ", \"hostName\": \"";
	JSONMessage += deviceName;
	JSONMessage += "\", \"bootTime\":";
	JSONMessage += bootTime;
	JSONMessage += ", \"PowerStatus\":";

	if (digitalRead(RelayPIN) == OFF) {
		JSONMessage += "\"OFF\"";
		JSONMessage += ", \"PowerStatusBit\":";
		JSONMessage += OFF;
	}
	else {
		JSONMessage += "\"ON\"";
		JSONMessage += ", \"PowerStatusBit\":";
		JSONMessage += ON;
	}

	JSONMessage += "}";

	UDPAnnounce("TempUpdate:" + deviceName + " Air:" + airTemp);
	UDPAnnounce("TempUpdate:" + deviceName + " Water:" + waterTemp);

	//UDPAnnounce(JSONMessage);

	sendMessage(JSONMessage.c_str());

	// we will process every message in the Hub which includes sending and receiving, if any are there
	while (timeDelay <= sampleTime * 60) {
		if (IoTHubClient_LL_GetSendStatus(iotHubClientHandle, &status) == IOTHUB_CLIENT_OK)
		{
			IoTHubClient_LL_DoWork(iotHubClientHandle);
		}

		ThreadAPI_Sleep(1000);

		timeDelay++;
	}
}

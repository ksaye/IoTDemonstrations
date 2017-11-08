/*
	Project Name:	DogFoodMonitor
	Date:			November 8, 2017
	Author:			Kevin Saye (ksaye@saye.org)
	Hardware:		ESP8266, MPU6050
	Summary:		When the sensor detects movement (gyroscope changes) it sends a message
					indicating the dog food container has been opened.
*/

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
#include <AzureIoTHub.h>
#include <AzureIoTUtility.h>
#include <AzureIoTProtocol_MQTT.h>
#include "I2Cdev.h"
/* the following library is from https://github.com/jrowberg/i2cdevlib */
#include "MPU6050.h"

#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
    #include "Wire.h"
#endif

MPU6050 accelgyro;
IOTHUB_CLIENT_LL_HANDLE iotHubClientHandle;
IOTHUB_CLIENT_STATUS status;

String ssid = "REMOVED";
String pass = "REMOVED";
static const char* connectionString = "HostName=kevinsayIoT.azure-devices.net;DeviceId=DogFoodMonitor;SharedAccessKey=vaLSREMOVEDBSiYQ=";
int16_t ax, ay, az;
int16_t gx, gy, gz;

void initIoTHub() {
	iotHubClientHandle = IoTHubClient_LL_CreateFromConnectionString(connectionString, MQTT_Protocol);
	if (iotHubClientHandle == NULL)
	{
		Serial.println("ERROR: Failed on IoTHubClient_LL_Create");
	}
	else {
		IoTHubClient_LL_SetMessageCallback(iotHubClientHandle, IoTHubMessageCallback, NULL);
	}
}

static IOTHUBMESSAGE_DISPOSITION_RESULT IoTHubMessageCallback(IOTHUB_MESSAGE_HANDLE message, void* userContextCallback)
{
	IOTHUBMESSAGE_DISPOSITION_RESULT result = IOTHUBMESSAGE_ACCEPTED;

	const char* messageId = "UNKNOWN";      // in case there is not a messageId associated with the message -- not required
	messageId = IoTHubMessage_GetMessageId(message);

	const unsigned char* buffer;
	size_t size;
	if (IoTHubMessage_GetByteArray(message, &buffer, &size) != IOTHUB_MESSAGE_OK)
	{
		Serial.println(" Error: Unable to IoTHubMessage_GetByteArray");
		result = IOTHUBMESSAGE_ABANDONED;
	}
	else
	{
		char* tempBuffer = (char*)malloc(size + 1);
		if (tempBuffer == NULL)
		{
			Serial.println(" Error: failed to malloc");
			result = IOTHUBMESSAGE_ABANDONED;
		}
/*		else
		{
			result = IOTHUBMESSAGE_ACCEPTED;
			(void)memcpy(tempBuffer, buffer, size);

			String messageStringFull((char*)tempBuffer);
			String messageString = "UNKNOWN";
			messageString = messageStringFull.substring(0, size);

			String messageProperties = "";
			MAP_HANDLE mapProperties = IoTHubMessage_Properties(message);
			if (mapProperties != NULL)
			{
				const char*const* keys;
				const char*const* values;
				size_t propertyCount = 0;
				if (Map_GetInternals(mapProperties, &keys, &values, &propertyCount) == MAP_OK)
				{
					if (propertyCount > 0)
					{
						size_t index;
						for (index = 0; index < propertyCount; index++)
						{
							messageProperties += keys[index];
							messageProperties += "=";
							messageProperties += values[index];
							messageProperties += ",";
						}
					}
				}
			}

			Serial.print(" Message Id: ");
			Serial.print(messageId);
			Serial.print(" Received. Message: \"");
			Serial.print(messageString);
			Serial.print("\", Properties: \"");
			Serial.print(messageProperties);
			Serial.println("\"");
		}*/
		free(tempBuffer);
	}
	return result;
}

void initWifi() {
	if (WiFi.status() != WL_CONNECTED)
	{
		WiFi.stopSmartConfig();
		WiFi.enableAP(false);
		WiFi.hostname("DogFoodMonitor");

		// Connect to WPA/WPA2 network. Change this line if using open or WEP network:
		WiFi.begin(ssid.c_str(), pass.c_str());

		Serial.print("Waiting for Wifi connection.");
		while (WiFi.status() != WL_CONNECTED) {
			Serial.print(".");
			delay(500);
		}

		Serial.println("Connected to wifi");

		initTime();
		initIoTHub();
	}
}

void initTime() {
	time_t epochTime;

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

void sendMessageCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result, void* userContextCallback)
{
	unsigned int messageTrackingId = (unsigned int)(uintptr_t)userContextCallback;

	(void)printf(" Message Id: %u Received.\r\n", messageTrackingId);
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

void setup()
{
	Serial.begin(115200);
	initWifi();
	Wire.begin(D2, D1);
	accelgyro.initialize();
	Serial.println(accelgyro.testConnection() ? "MPU6050 connection successful" : "MPU6050 connection failed");
	sendMessage("{\'messageType\': \'DogFoodMonitor\', \'message\': \'booting\'}");
}

void loop()
{
	accelgyro.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
	if (gx / 1000 != 0 || gy / 1000 != 0 || gz / 1000 != 0) {
		time_t epochTime = time(NULL);
		String  JSONMessage = "{\'messageType\': \'DogFoodMonitor\', \'message\': \'movement\'";
				JSONMessage += ", \'epochTime\':";
				JSONMessage += epochTime;
				JSONMessage += "}";
		sendMessage(JSONMessage.c_str());
		delay(1000);
	}

	while ((IoTHubClient_LL_GetSendStatus(iotHubClientHandle, &status) == IOTHUB_CLIENT_OK) && (status == IOTHUB_CLIENT_SEND_STATUS_BUSY))
	{
		IoTHubClient_LL_DoWork(iotHubClientHandle);
		ThreadAPI_Sleep(1000);
	}

	delay(200);
}

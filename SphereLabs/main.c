#include <errno.h>
#include <signal.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

// applibs_versions.h defines the API struct versions to use for applibs APIs.
#include "applibs_versions.h"
#include <applibs/uart.h>
#include <applibs/gpio.h>
#include <applibs/log.h>

#include "mt3620_rdb.h"

#include <applibs/wificonfig.h>
#include "azure_c_shared_utility/threadapi.h"
#include "azure_iot_hub.h"
#include "stdio.h"


// This sample C application for a MT3620 Reference Development Board (Azure Sphere)
// demonstrates how to use a UART (serial port).
// The sample opens a UART with a baud rate of 115200. Pressing a button causes characters
// to be sent from the device over the UART; data received by the device from the UART is echoed to
// the Visual Studio Output Window, and causes an LED to blink.
//
// It uses the API for the following Azure Sphere application libraries:
// - UART (serial port)
// - GPIO (digital input for button)
// - log (messages shown in Visual Studio's Device Output window during debugging)

// File descriptors - initialized to invalid value
static int gpioButtonFd = -1;
static int gpioLedFd = -1;
static int uartFd = -1;

// GPIO state variable
static GPIO_Value_Type gpioButtonState = GPIO_Value_High;

// Termination state
static volatile sig_atomic_t terminationRequested = false;

// Connectivity state
static bool connectedToIoTHub = false;

// Arduio IP Address
const char *arduinoIPAddress;

/// <summary>
///     Signal handler for termination requests. This handler must be async-signal-safe.
/// </summary>
static void TerminationHandler(int signalNumber)
{
    // Don't use Log_Debug here, as it is not guaranteed to be async signal safe
    terminationRequested = true;
}

static void IoTHubConnectionStatusChanged(bool connected)
{
	connectedToIoTHub = connected;
}

static void UpdateDevice(const char arduinoIPAddress, const char updateURL) {

}

static void MessageReceived(const char *payload)
{
	JSON_Value *payloadJson = json_parse_string(payload);
	if (payloadJson != NULL) {
		JSON_Object *msgJSON = json_value_get_object(payloadJson);
		if (msgJSON != NULL) {
			const char *updateURL = json_object_get_string(msgJSON, "updateURL");
			if (updateURL != NULL) {
				Log_Debug("updateURL is %s\n", updateURL);
				UpdateDevice(arduinoIPAddress, updateURL);
			}
		}
	}
}

/// <summary>
///     Initialize peripherals and set up termination handler.
/// </summary>
/// <returns>0 on success, or -1 on failure</returns>
static int InitPeripheralsAndTerminationHandler(void)
{
    // Register a SIGTERM handler for termination requests
    struct sigaction action;
    memset(&action, 0, sizeof(struct sigaction));
    action.sa_handler = TerminationHandler;
    sigaction(SIGTERM, &action, NULL);

    // Create a UART_Config object and initialize it
    UART_Config uartConfig;
    UART_InitConfig(&uartConfig);
    uartConfig.baudRate = 9600;
    uartConfig.flowControl = UART_FlowControl_None;

    // Open the UART
    uartFd = UART_Open(MT3620_RDB_HEADER2_ISU0_UART, &uartConfig);
    if (uartFd < 0) {
        Log_Debug("ERROR: There was a problem opening the UART: %s (%d).\n", strerror(errno),
                  errno);
        return -1;
    }

    // Open button A GPIO and set as input
    Log_Debug("Opening MT3620_RDB_BUTTON_A as input\n");
    gpioButtonFd = GPIO_OpenAsInput(MT3620_RDB_BUTTON_A);
    if (gpioButtonFd < 0) {
        Log_Debug("ERROR: Could not open button GPIO\n");
        return -1;
    }

    // Open LED GPIO and set as output with value GPIO_Value_High (off)
    Log_Debug("Opening MT3620_RDB_LED2_RED\n");
    gpioLedFd = GPIO_OpenAsOutput(MT3620_RDB_LED2_RED, GPIO_OutputMode_PushPull, GPIO_Value_High);
    if (gpioLedFd < 0) {
        Log_Debug("ERROR: Could not open LED GPIO\n");
        return -1;
    }

	AzureIoT_Initialize();
	AzureIoT_SetConnectionStatusCallback(&IoTHubConnectionStatusChanged);
	AzureIoT_SetMessageReceivedCallback(&MessageReceived);
	AzureIoT_SetupClient();

    return 0;
}

/// <summary>
///     Close peripherals.
/// </summary>
void ClosePeripherals(void)
{
    Log_Debug("Closing GPIOs and UART\n");

    // Close the button file descriptor
    if (gpioButtonFd >= 0) {
        int result = close(gpioButtonFd);
        if (result != 0) {
            Log_Debug("WARNING: Problem occurred closing button GPIO: %s (%d).\n", strerror(errno),
                      errno);
        }
    }

    // Leave the LED off and close the LED file descriptor
    if (gpioLedFd >= 0) {
        GPIO_SetValue(gpioLedFd, GPIO_Value_High);
        int result = close(gpioLedFd);
        if (result != 0) {
            Log_Debug("WARNING: Problem occurred closing LED GPIO: %s (%d).\n", strerror(errno),
                      errno);
        }
    }

    // Close the UART file descriptor
    if (uartFd >= 0) {
        int result = close(uartFd);
        if (result != 0) {
            Log_Debug("WARNING: Problem occurred closing UART: %s (%d).\n", strerror(errno), errno);
        }
    }
}

/// <summary>
///     Send a fixed message via the given UART.
/// </summary>
/// <param name="uartFd">The open file descriptor of the UART to write to</param>
/// <returns>0 if the message was sent successfully, or -1 on failure</returns>
static int SendUartMessage(int uartFd)
{
    const char *messageToSend = "Hello world!\n";

    size_t totalBytesSent = 0;
    size_t totalBytesToSend = strlen(messageToSend);
    int sendIterations = 0;
    while (totalBytesSent < totalBytesToSend) {
        size_t bytesLeftToSend = totalBytesToSend - totalBytesSent;
        ssize_t bytesSent = 0;
        sendIterations++;

        const char *remainingMessageToSend = (const char *)(messageToSend + totalBytesSent);

        bytesSent = write(uartFd, remainingMessageToSend, bytesLeftToSend);

        if (bytesSent < 0) {
            Log_Debug("ERROR: Problem writing to UART: %s (%d).\n", strerror(errno), errno);
            return -1;
        }
        totalBytesSent += (size_t)bytesSent;
    }

    Log_Debug("Sent %d bytes over UART in %d calls\n", totalBytesSent, sendIterations);
    return 0;
}

static void ReadUARTtoJSON(int uartsFd) {
	const size_t receiveBufferSize = 256;
	uint8_t receiveBuffer[receiveBufferSize + 1]; // allow extra byte for string termination
	const struct timespec timespec_100ms = { 0, 100000000 };
	static char msgText[1024];

	// waiting 100 milliseconds to get most of the data
	nanosleep(&timespec_100ms, NULL);

	// Poll the UART
	ssize_t bytesRead;
	bytesRead = read(uartFd, receiveBuffer, receiveBufferSize);
	if (bytesRead > 0) {
		receiveBuffer[bytesRead] = 0;
		sprintf_s(msgText, sizeof(msgText), "%s", (char *)receiveBuffer);
		JSON_Value *payload = json_parse_string(msgText);
		JSON_Object *msgJSON = json_value_get_object(payload);
		if (msgJSON != NULL) {
			double arduinoAppVersion = json_object_get_number(msgJSON, "version");
			arduinoIPAddress = json_object_get_string(msgJSON, "IP");
			if (connectedToIoTHub) {
				AzureIoT_TwinReportState("arduinoAppVersion", arduinoAppVersion);
			}
		}
	}
}



/// <summary>
///     Main entry point for this application.
/// </summary>
int main(int argc, char *argv[])
{
    Log_Debug("UART application starting\n");

    int initResult = InitPeripheralsAndTerminationHandler();
    if (initResult != 0) {
        terminationRequested = true;
    }

    // Loop variables
    GPIO_Value_Type newGpioButtonState;
    size_t totalBytesReceived = 0;
    const size_t receiveBufferSize = 256;
    uint8_t receiveBuffer[receiveBufferSize + 1]; // allow extra byte for string termination
    const struct timespec timespec_1ms = {0, 1000000};

    // Main loop
	while (!terminationRequested) {
		AzureIoT_DoPeriodicTasks();
		//DownloadFile("https://github.com/ksaye/IoTDemonstrations/blob/master/SphereLabs/WebUpdate.2.bin");
		// Check for a button press
		int result = GPIO_GetValue(gpioButtonFd, &newGpioButtonState);
		if (result != 0) {
			Log_Debug("ERROR: Could not read button GPIO\n");
			break;
		}
		if (newGpioButtonState != gpioButtonState) {
			// The button has GPIO_Value_Low when pressed and GPIO_Value_High when released
			if (newGpioButtonState == GPIO_Value_Low) {
				// Button was pressed - send UART message
				result = SendUartMessage(uartFd);
				if (result != 0)
					break;
			}
			gpioButtonState = newGpioButtonState;
		}

		ReadUARTtoJSON(uartFd);

		/*// Poll the UART
		ssize_t bytesRead;
		bytesRead = read(uartFd, receiveBuffer, receiveBufferSize);
		if (bytesRead < 0) {
			Log_Debug("ERROR: Problem reading from UART: %s (%d).\n", strerror(errno), errno);
			break;
		}

		if (bytesRead > 0) {
			// Null terminate the buffer to make it a valid string, and print it
			receiveBuffer[bytesRead] = 0;
			Log_Debug("UART received %d bytes: '%s'\n", bytesRead, (char *)receiveBuffer);

			// If the total received bytes is odd, turn the LED on, otherwise turn it off
			totalBytesReceived += (size_t)bytesRead;
			result = GPIO_SetValue(
				gpioLedFd, (totalBytesReceived % 2) == 1 ? GPIO_Value_Low : GPIO_Value_High);
			if (result != 0) {
				Log_Debug("ERROR: Could not set LED output value\n");
				break;
			}
		}*/
	}

	ClosePeripherals();
	Log_Debug("Application exiting\n");
	return 0;
	
}

# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import random
import time
import sys
import iothub_client
# pylint: disable=E0611
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError
import datetime
import json
from pymodbus.client.sync import ModbusTcpClient as ModbusClient

# messageTimeout - the maximum time in milliseconds until a message times out.
# The timeout period starts at IoTHubModuleClient.send_event_async.
# By default, messages do not expire.
MESSAGE_TIMEOUT = 10000

# global counters
RECEIVE_CALLBACKS = 0
SEND_CALLBACKS = 0

# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
PROTOCOL = IoTHubTransportProvider.MQTT

POLLINGfrequency = 60
POLLINGHost = "widget"  # which will fail
messageCounter = 0
TWIN_CALLBACKS = 0
hub_manager = None

# Callback received when the message that we're forwarding is processed.
def send_confirmation_callback(message, result, user_context):
    global SEND_CALLBACKS
    print ( "Confirmation[%d] received for message with result = %s" % (user_context, result) )
    map_properties = message.properties()
    key_value_pair = map_properties.get_internals()
    print ( "    Properties: %s" % key_value_pair )
    SEND_CALLBACKS += 1
    print ( "    Total calls confirmed: %d" % SEND_CALLBACKS )

# module_twin_callback is invoked when the module twin's desired properties are updated.
def module_twin_callback(update_state, payload, user_context):
    global TWIN_CALLBACKS
    global POLLINGfrequency
    global POLLINGHost
    global hub_manager
    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\ncontext = %s" % (update_state, payload, user_context) )
    data = json.loads(payload)

    # this is a full TWIN update
    if "desired" in data and "POLLINGfrequency" in data["desired"]:
        POLLINGfrequency = data["desired"]["POLLINGfrequency"]
    # this is a partial TWIN update
    if "POLLINGfrequency" in data:
        POLLINGfrequency = data["POLLINGfrequency"]

    # this is a full TWIN update
    if "desired" in data and "POLLINGHost" in data["desired"]:
        POLLINGHost = data["desired"]["POLLINGHost"]
    # this is a partial TWIN update
    if "POLLINGHost" in data:
        POLLINGHost = data["POLLINGHost"]

    # now we are updating the Reported TWIN
    hub_manager.updateReportedTWIN()

    TWIN_CALLBACKS += 1
    print ( "Total calls confirmed: %d\n" % TWIN_CALLBACKS )

def send_reported_state_callback(status_code, user_context):
    print ( "Confirmation for reported state called with status_code: %d" % status_code )

class HubManager(object):

    def __init__(
            self,
            protocol=IoTHubTransportProvider.MQTT):
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)

        # set the time until a message times out
        self.client.set_option("messageTimeout", MESSAGE_TIMEOUT)

        # register for TWIN updates
        self.client.set_module_twin_callback(module_twin_callback, self)

    def updateReportedTWIN(self):
        reported_state = {}
        reported_state["POLLINGfrequency"] = POLLINGfrequency
        reported_state["POLLINGHost"] = POLLINGHost
        reported_statestr = json.dumps(reported_state)
        self.client.send_reported_state(reported_statestr, len(reported_statestr), send_reported_state_callback, self)

    # Forwards the message received onto the next stage in the process.
    def forward_event_to_output(self, outputQueueName, event, send_context):
        self.client.send_event_async(
            outputQueueName, event, send_confirmation_callback, send_context)

def main(protocol):
    global messageCounter
    global hub_manager
    try:
        print ( "\nPython %s\n" % sys.version )
        print ( "IoT Hub Client for Python" )

        hub_manager = HubManager(protocol)

        print ( "Starting the IoT Hub Python sample using protocol %s..." % hub_manager.client_protocol )
        while True:
            time.sleep(POLLINGfrequency)
            modbusclient = ModbusClient(POLLINGHost, port=502)
            try:
                modbusclient.connect()
                messageToSend = {}
                messageToSend['POLLINGHost'] = POLLINGHost
                messageToSend['dateTime'] = str(datetime.datetime.now())
                messageToSend['Las Vegas'] = modbusclient.read_holding_registers(0, 1, unit=0x01).registers[0]
                messageToSend['Stockholm'] = modbusclient.read_holding_registers(1, 1, unit=0x01).registers[0]
                messageToSend['Wadi Halfa'] = modbusclient.read_holding_registers(2, 1, unit=0x01).registers[0]
                messageToSend['MSFT Stock'] = modbusclient.read_holding_registers(3, 1, unit=0x01).registers[0]
                messageToSend['HPE Stock'] = modbusclient.read_holding_registers(4, 1, unit=0x01).registers[0]
                IoTmessageToSend = IoTHubMessage(bytearray(json.dumps(messageToSend), 'utf8'))
                hub_manager.forward_event_to_output("output1", IoTmessageToSend, messageCounter)
                messageCounter += 1
            except Exception:
                errorMessage = "{\"error\":\"" + str(sys.exc_info()[0]) + "\"}"
                IoTmessageToSend = IoTHubMessage(bytearray(errorMessage, 'utf8'))
                hub_manager.forward_event_to_output("output1", IoTmessageToSend, messageCounter)
                messageCounter += 1
            modbusclient.close()

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubModuleClient sample stopped" )

if __name__ == '__main__':
    main(PROTOCOL)

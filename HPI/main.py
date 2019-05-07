# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import random
import time
import sys
import json
import iothub_client
# pylint: disable=E0611
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider, DeviceMethodReturnValue
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError

# Demonstration modules
import requests             # note, updated requirements.txt to include this module
import datetime

# messageTimeout - the maximum time in milliseconds until a message times out.
# The timeout period starts at IoTHubModuleClient.send_event_async.
# By default, messages do not expire.
MESSAGE_TIMEOUT = 10000

# global counters
RECEIVE_CALLBACKS = 0
SEND_CALLBACKS = 0
TWIN_CALLBACKS = 0

# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
PROTOCOL = IoTHubTransportProvider.MQTT

# Demonstration variables
RESTTargetURL = None        # Example "http://192.168.15.15:8181/"
RESTTargetLocation = "Dallas"
POLINGInterval = 15

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

# receive_message_callback is invoked when an incoming message arrives on the specified 
# input queue (in the case of this sample, "input1").  Because this is a filter module, 
# we will forward this message onto the "output1" queue.
def receive_message_callback(message, hubManager):
    # Not used for this Workshop
    global RECEIVE_CALLBACKS
    message_buffer = message.get_bytearray()
    size = len(message_buffer)
    print ( "    Data: <<<%s>>> & Size=%d" % (message_buffer[:size].decode('utf-8'), size) )
    map_properties = message.properties()
    key_value_pair = map_properties.get_internals()
    print ( "    Properties: %s" % key_value_pair )
    RECEIVE_CALLBACKS += 1
    print ( "    Total calls received: %d" % RECEIVE_CALLBACKS )
    hubManager.forward_event_to_output("output1", message, 0)
    return IoTHubMessageDispositionResult.ACCEPTED

# module_twin_callback is invoked when the module twin's desired properties are updated.
def module_twin_callback(update_state, payload, user_context):
    global TWIN_CALLBACKS
    global RESTTargetURL
    global RESTTargetLocation
    global POLINGInterval
    global hub_manager
    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\ncontext = %s" % (update_state, payload, user_context) )
    data = json.loads(payload)

    # this is a full TWIN update
    if "desired" in data and "RESTTargetURL" in data["desired"]:
        RESTTargetURL = data["desired"]["RESTTargetURL"]
    # this is a partial TWIN update
    if "RESTTargetURL" in data:
        RESTTargetURL = data["RESTTargetURL"]

    # this is a full TWIN update
    if "desired" in data and "RESTTargetLocation" in data["desired"]:
        RESTTargetLocation = data["desired"]["RESTTargetLocation"]
    # this is a partial TWIN update
    if "RESTTargetLocation" in data:
        RESTTargetLocation = data["RESTTargetLocation"]

    # this is a full TWIN update
    if "desired" in data and "POLINGInterval" in data["desired"]:
        POLINGInterval = int(data["desired"]["POLINGInterval"])
    # this is a partial TWIN update
    if "POLINGInterval" in data:
       POLINGInterval = int(data["POLINGInterval"])

    # now we are updating the Reported TWIN
    hub_manager.updateReportedTWIN()

    TWIN_CALLBACKS += 1
    print ( "Total calls confirmed: %d\n" % TWIN_CALLBACKS )

# module_method_callback Example
def module_method_callback(method_name, payload, user_context):
    print('received method call:')
    print('\tmethod name:', method_name)
    print('\tpayload:', str(payload))

    retval = DeviceMethodReturnValue()

    if method_name.lower() == "getweather":
        methodWeather = getWeather()
        retval.response = json.dumps(methodWeather)
        retval.status = 200
    else:
        retval.response = "{\"key\":\"value\"}"
        retval.status = 404

    return retval

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
        
        # sets the callback when a message arrives on "input1" queue.  Messages sent to 
        # other inputs or to the default will be silently discarded.
        self.client.set_message_callback("input1", receive_message_callback, self)
        
        # items added to show the complete functionality
        self.client.set_module_twin_callback(module_twin_callback, self)
        self.client.set_module_method_callback(module_method_callback, self)

        # updating the Module TWIN with a started time
        reported_state = "{\"started\":\"" + str(datetime.datetime.now()) + "\"}"
        self.client.send_reported_state(reported_state, len(reported_state), send_reported_state_callback, self)

    def updateReportedTWIN(self):
        reported_state = {}
        reported_state["RESTTargetURL"] = RESTTargetURL
        reported_state["RESTTargetLocation"] = RESTTargetLocation
        reported_state["POLINGInterval"] = POLINGInterval
        reported_statestr = json.dumps(reported_state)
        self.client.send_reported_state(reported_statestr, len(reported_statestr), send_reported_state_callback, self)

    # Forwards the message received onto the next stage in the process.
    def forward_event_to_output(self, outputQueueName, event, send_context):
        self.client.send_event_async(
            outputQueueName, event, send_confirmation_callback, send_context)

def getWeather():
    returnContent = None
    try:
        returnContent = requests.get(RESTTargetURL + "weather?location=" + RESTTargetLocation).json()
    except Exception as e:
        print("Error: " +  e.message)
        returnContent = json.dumps("{\"error\":\"" + e.message + "\"}")
    return returnContent

def getOS():
    returnContent = None
    try:
        returnContent = requests.get(RESTTargetURL + "OS").json()
    except Exception as e:
        print("Error: " +  e.message)
        returnContent = json.dumps("{\"error\":\"" + e.message + "\"}")
    return returnContent

def main(protocol):
    global hub_manager
    try:
        print ( "\nPython %s\n" % sys.version )
        print ( "IoT Hub REST Module written in Python" )

        hub_manager = HubManager(protocol)
        moduleCounter = 0

        while True:
            time.sleep(POLINGInterval)
            if RESTTargetURL is not None:
                weather = getWeather()
                weather['ModuleCounter'] = moduleCounter
                weather['ModuleDateTime'] = str(datetime.datetime.now())
                messageToSend = json.dumps(weather)
                print(messageToSend)
                IoTmessageToSend = IoTHubMessage(bytearray(messageToSend, 'utf8'))
                hub_manager.client.send_event_async("output1", IoTmessageToSend, send_confirmation_callback, SEND_CALLBACKS)

                OS = getOS()
                OS['ModuleCounter'] = moduleCounter
                OS['ModuleDateTime'] = str(datetime.datetime.now())
                messageToSend = json.dumps(OS)
                print(messageToSend)
                IoTmessageToSend = IoTHubMessage(bytearray(messageToSend, 'utf8'))
                hub_manager.client.send_event_async("output2", IoTmessageToSend, send_confirmation_callback, SEND_CALLBACKS)
                print(" RESTModule: sendCounter=" + str(moduleCounter))
                moduleCounter += 1
            else:
                error = "{\"error\":\"Error, TWIN property RESTTargetURL is not set.\"}"
                print(error)
                hub_manager.client.send_event_async("output1", IoTHubMessage(bytearray(error, 'utf8')), send_confirmation_callback, SEND_CALLBACKS)

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubModuleClient sample stopped" )

if __name__ == '__main__':
    main(PROTOCOL)

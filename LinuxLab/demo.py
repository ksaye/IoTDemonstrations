#!/usr/bin/env python

import time
import random
import iothub_client
import json
from iothub_client import *

message_timeout = 1000
messageId = 0

protocol = IoTHubTransportProvider.AMQP
connection_string = "{insert connection string here}"

def receive_message_callback(message, counter):
    buffer = message.get_bytearray()
    size = len(buffer)
    message = buffer[:size].decode('utf-8')
    print("Message received: %s" % message)
    return IoTHubMessageDispositionResult.ACCEPTED

def send_confirmation_callback(message, result, user_context):
   print("Confirmation[%s] received for message with result = %s" % (user_context, result))

def iothub_client_init():
    iotHubClient = IoTHubClient(connection_string, protocol)
    iotHubClient.set_option("messageTimeout", message_timeout)
    iotHubClient.set_message_callback(receive_message_callback, 0)
    return iotHubClient

def sendMessage(message):
    global messageId
    messageId = messageId + 1	
    messageToSend = IoTHubMessage(bytearray(message.encode('utf8')))
    iotHubClient.send_event_async(messageToSend, send_confirmation_callback, messageId)
   
try:
    iotHubClient = iothub_client_init()

    while True:
        time.sleep(5)
        mytemp = random.randint(25, 29)
        JSONmessage = {'temperature': mytemp}
        sendMessage(json.dumps(JSONmessage))

except IoTHubError as e:
    print("Unexpected error %s from IoTHub" % e)

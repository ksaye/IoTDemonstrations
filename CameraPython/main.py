#!/usr/bin/env python

import time
import sys
import iothub_client
import picamera
import os
import json
from iothub_client import *
from datetime import datetime

message_timeout = 10000
receive_context = 0
weHavePicture = False
IoTMessage = ''

protocol = IoTHubTransportProvider.AMQP
connection_string = "HostName=AustinIoT.azure-devices.net;DeviceId=Camera;SharedAccessKey=fSREMOVEDuM="

def receive_message_callback(message, counter):
    global weHavePicture, IoTMessage
    buffer = message.get_bytearray()
    size = len(buffer)
    message = buffer[:size].decode('utf-8')
    print("Message received: %s" % message)
    IoTMessage = json.loads(message)
    if IoTMessage['action'] == "takePicture()":
      weHavePicture = True
#     print("action: %s" % IoTMessage['action'])
    return IoTHubMessageDispositionResult.ACCEPTED

def send_confirmation_callback(message, result, pictureName):
#   print("Confirmation[%s] received for message with result = %s" % (pictureName, result))
    dummyvar = ''

def takePicture(pictureName):
#   print("takePicture(%s)" % pictureName)
    camera.led = True
    camera.capture(pictureName)
    camera.led = False

def uploadPicture(pictureName):
    global iotHubClient 
    filename= pictureName
    realfilename = open(pictureName, "r")
    content = realfilename.read()
#   print("IoTHubClient is uploading blob to storage")
    iotHubClient.upload_blob_async(filename, content, len(content), blob_upload_confirmation_callback, 1001)
    
def notifyPicture(pictureName):
    messageText = "{event:\"pictureUpload()\", pictureName:\"%s\", scoredProbabilities:%s, deviceName:\"%s\", macaddress:\"%s\"}" % (pictureName, IoTMessage['scoredProbabilities'], IoTMessage['deviceName'], IoTMessage['macaddress'])
    print("sending message: %s" % messageText)
    message = IoTHubMessage(bytearray(messageText.encode('utf8')))
    iotHubClient.send_event_async(message, send_confirmation_callback, pictureName)
    os.remove(pictureName)

def blob_upload_confirmation_callback(result, pictureName):
#   print("Blob upload confirmation[%s] received for message with result = %s" % (pictureName, result))
    myresult = "%s" % result
    if myresult == "OK":
      notifyPicture(pictureName)

def iothub_client_init():
    iotHubClient = IoTHubClient(connection_string, protocol)
    iotHubClient.set_option("messageTimeout", message_timeout)
    iotHubClient.set_message_callback(receive_message_callback, receive_context)
    return iotHubClient

def print_last_message_time(iotHubClient):
    try:
        last_message = iotHubClient.get_last_message_receive_time()
        print("Last Message: %s" % time.asctime(time.localtime(last_message)))
        print("Actual time : %s" % time.asctime())
    except IoTHubClientError as e:
        if (e.args[0].result == IoTHubClientResult.INDEFINITE_TIME):
            print("No message received")
        else:
            print(e)

def main():
    global iotHubClient, camera, weHavePicture
    
    try:
        camera=picamera.PiCamera()
        camera.start_preview()
        camera.led = False
        
        iotHubClient = iothub_client_init()

        while True:
            if weHavePicture == True:
              weHavePicture = False
              pictureName = datetime.now().strftime("%Y-%m-%d_%H.%M.%S.jpg")
              takePicture(pictureName)
              filename= pictureName
              realfilename = open(pictureName, "r")
              content = realfilename.read()
#             print("pictureSize: %s" % len(content))
#             print("IoTHubClient is uploading blob to storage")
              iotHubClient.upload_blob_async(filename, content, len(content), blob_upload_confirmation_callback, filename)
#              notifyPicture(pictureName)

    except IoTHubError as e:
        print("Unexpected error %s from IoTHub" % e)
        return
    except KeyboardInterrupt:
        print("IoTHubClient sample stopped")

    print_last_message_time(iotHubClient)


if __name__ == '__main__':
    print("\nPython %s" % sys.version)
    print("IoT Hub for Python SDK Version: %s" % iothub_client.__version__)

    main()

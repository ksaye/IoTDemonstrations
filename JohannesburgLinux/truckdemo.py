#!/usr/bin/env python

import time
import random
import iothub_client
import json
import os
from iothub_client import *

message_timeout = 1000
messageId       = 0
fileUploaded    = False
response        = False
responseTimeout = 15

protocol = IoTHubTransportProvider.MQTT
connection_string   = "HostName=Johannesburg.azure-devices.net;DeviceId=mytruck;SharedAccessKey=FHREMOVEDypl1p0="
fileUploadPath      = "https://johannesburg2.blob.core.windows.net/iot/"
truck               = connection_string.split(";")[1].split("=")[1]

def receive_message_callback(message, counter):
    global response
    buffer = message.get_bytearray()
    size = len(buffer)
    message = buffer[:size].decode('utf-8')
    IoTMessage = json.loads(message)
    print("")
    print("-----------------------------------")
    print("Trip will take " + IoTMessage['travelTime'])
    print("")
    print(IoTMessage['route'].replace("\\r\\n", "\r\n"))
    print("-----------------------------------")
    response = True
    return IoTHubMessageDispositionResult.ACCEPTED

def send_confirmation_callback(message, result, user_context):
   print("")
   print("-----------------------------------")
   print("Confirmation [%s] received for message with result = %s" % (user_context, result))
   print("-----------------------------------")

def iothub_client_init():
    iotHubClient = IoTHubClient(connection_string, protocol)
    iotHubClient.set_option("messageTimeout", message_timeout)
    iotHubClient.set_message_callback(receive_message_callback, 0)
    print("")
    return iotHubClient

def uploadFile(fileName):
    global iotHubClient, fileUploaded
    fileUploaded = False
    realfilename = open(fileName, "r")
    content = realfilename.read()
    print("")
    print("-----------------------------------")
    print("Uploading File %s" % (fileName))
    print("-----------------------------------")
#   print("IoTHubClient is uploading blob to storage")
    iotHubClient.upload_blob_async(fileName, content, len(content), blob_upload_confirmation_callback, fileName)

def blob_upload_confirmation_callback(result, fileName):
   global fileUploaded
   print("")
   print("-----------------------------------")
   print("File upload confirmation [%s] received, result = %s" % (fileName, result))
   print("-----------------------------------")
   fileUploaded = True

def sendMessage(message):
    global messageId, response
    messageId = messageId + 1	
    messageToSend = IoTHubMessage(bytearray(message.encode('utf8')))
    iotHubClient.send_event_async(messageToSend, send_confirmation_callback, messageId)
    response = False
   
def waitForResponse():
    global responseTimeout
    counter = 0
    while (response == False) and (counter < responseTimeout):
      time.sleep(1)
      counter = counter + 1
    if (counter == responseTimeout):
     print("")
     print("-----------------------------------")
     print(" Error: Timout waiting for response")
     print("-----------------------------------")

try:
    iotHubClient = iothub_client_init()
    os.system('clear')
    print("For info and parameters of Johannesburg, look to: https://bmdevportal.blob.core.windows.net/labs/Project%20Johannesburg.pdf")
    while (True):
      choice = 0
      while (choice not in [1, 2, 3, 4]):
        print("-----------------------------------")
        print("Select your function:")
        print("   1 manually type the location")
        print("   2 speak the location")
        print("   3 facial recognition")
        print("   4 quit")
        print("-----------------------------------")
        choice = input("Select function: 1,2,3,4: ")    
  
      if (choice == 1):
          height         = raw_input("  Truck height [18]:")          or 18
          hc             = raw_input("  Truck cargo  [E]:")           or "E"
          currentLocLat  = raw_input("  Current Lat  [32.96074]:")    or 32.96074
          currentLocLong = raw_input("  Current Long [-96.73297]:")   or -96.73297
          targetLocLat   = raw_input("  Target Lat   [32.77815]:")    or 32.77815
          targetLocLong  = raw_input("  Target Long  [-96.7954]:")    or -96.7954
          
          JSONmessage = {'messageType':'requestRoute','truck':truck,'height':height,'hc':hc,'currentLocLat':currentLocLat,'currentLocLong':currentLocLong,'targetLocLat':targetLocLat,'targetLocLong':targetLocLong}
          print("")
          print("-----------------------------------")
          print("Sending message: " + json.dumps(JSONmessage))
          print("-----------------------------------")
  
          #    {'messageType':'requestRoute','truck':'mytruck','height':18,'hc':'F','currentLocLat':32.96074,'currentLocLong':-96.73297,'targetLocLat':32.77815,'targetLocLong':-96.7954}
          sendMessage(json.dumps(JSONmessage))    
          
          # waiting for our return message
          waitForResponse()  
          
      elif ( choice == 2):
          height         = raw_input("  Truck height [18]:")          or 18
          hc             = raw_input("  Truck cargo  [E]:")           or "E"
          currentLocLat  = raw_input("  Current Lat  [32.96074]:")    or 32.96074
          currentLocLong = raw_input("  Current Long [-96.73297]:")   or -96.73297
          voiceFile      = raw_input("  Voice File [English.wav]:")   or "English.wav"
   
          uploadFile(voiceFile)
          
          while (fileUploaded != True):
            time.sleep(1)
          
          JSONmessage = {'messageType':'requestVoiceRoute','truck':truck, 'voiceFile': fileUploadPath + truck + '/' + voiceFile, 'height':height,'hc':hc,'currentLocLat':currentLocLat,'currentLocLong':currentLocLong}
          print("")
          print("-----------------------------------")
          print("Sending message: " + json.dumps(JSONmessage))
          print("-----------------------------------")
  
          #    {'messageType':'requestVoiceRoute','truck':'mytruck','voiceFile':'http://kevinsayiot.blob.core.windows.net/johannesburg/English.wav','height':18,'hc':'F','currentLocLat':32.96074,'currentLocLong':-96.73297}
          sendMessage(json.dumps(JSONmessage))    
          
          # waiting for our return message
          waitForResponse()
          
      elif ( choice == 3):
          height         = raw_input("  Truck height [18]:")          or 18
          hc             = raw_input("  Truck cargo  [E]:")           or "E"
          currentLocLat  = raw_input("  Current Lat  [32.96074]:")    or 32.96074
          currentLocLong = raw_input("  Current Long [-96.73297]:")   or -96.73297
          pictureFile    = raw_input("  Picture File [Kevin.jpg]:")   or "Kevin.jpg"
   
          uploadFile(pictureFile)
          
          while (fileUploaded != True):
            time.sleep(1)
          
          JSONmessage = {'messageType':'requestPhotoRoute','truck':truck, 'photoFile': fileUploadPath + truck + '/' + pictureFile, 'height':height,'hc':hc,'currentLocLat':currentLocLat,'currentLocLong':currentLocLong}
          print("")
          print("-----------------------------------")
          print("Sending message: " + json.dumps(JSONmessage))
          print("-----------------------------------")
  
          #    {'messageType':'requestPhotoRoute','truck':'mytruck','photoFile':'http://kevinsayiot.blob.core.windows.net/johannesburg/KevinSayPicture.jpg','height':18,'hc':'F','currentLocLat':32.96074,'currentLocLong':-96.73297}
          sendMessage(json.dumps(JSONmessage))    
          
          # waiting for our return message
          waitForResponse()
          
      elif ( choice == 4):
          break
      
  

except IoTHubError as e:
    print("Unexpected error %s from IoTHub" % e)

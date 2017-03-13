#!/usr/bin/env python

import pytesseract
import pygame
import pygame.camera
import time
import httplib, urllib, base64
import socket
import json
import os
import iothub_client
from iothub_client import *
from pygame.locals import *
from PIL import Image
from PIL import ImageFilter
from StringIO import StringIO
from datetime import datetime

# Define global variables
cam = None
OcpApimSubscriptionKey   = "Put Your Cognitive Services Key Here"
message_timeout          = 10000
receive_context          = 0
workingDirectory         = "/opt/mydirectory"
protocol                 = IoTHubTransportProvider.MQTT
connection_string        = "Put Your IOT Device Connection String Here"
# Example:                  "HostName=myiothub.azure-devices.net;DeviceId=piThree;SharedAccessKey=ybCTHIcREMOVEDN1zJEQY="
azure_functionHost       = "myfunction.azurewebsites.net"
azure_functionURI        = "/api/changeContentType?code=4ULzREMOVEDDacmB5ulFN7zyrStJw=="
blobStorage              = "https://yourblobhere.blob.core.windows.net/uploads"
takePictureMessage       = False

def setupCamera():
  global cam
  # initialize the camera
  pygame.init()
  pygame.camera.init()
  
  # in the rare case we have multiple cameras and we set the resolution
  camlist = pygame.camera.list_cameras()
  if camlist:
    cam = pygame.camera.Camera(camlist[0],(1920, 1080))

def takePicture():
  # start and capture the image
  global cam
  cam.start()
  image = cam.get_image()
  cam.stop()
  pictureName = datetime.now().strftime("%Y-%m-%d_%H.%M.%S.jpg")
  pygame.image.save(image, workingDirectory + "/pictures/" + pictureName)
  return pictureName

def deleteOldImages(daysOld):
  path = workingDirectory + "/pictures/"
  now = time.time()
  for f in os.listdir(path):
    if os.stat(os.path.join(path,f)).st_mtime < now - daysOld * 86400:
      if f.endswith(".jpg"):
        os.remove(os.path.join(path,f))
        print "Removing: %s" % (os.path.join(path,f))

def localOCR(pictureName):
  return pytesseract.image_to_string(Image.open(workingDirectory + "/pictures/" + pictureName).filter(ImageFilter.SHARPEN)) 

def remoteOCR(pictureName):
  headers = {'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': OcpApimSubscriptionKey}
  params = urllib.urlencode({'language': 'en','detectOrientation ': 'true'})   
  body = "{\"url\":\"%s/%s/%s\"}" % (blobStorage, socket.gethostname(), pictureName)
  data = ""
  try:
      conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')
      conn.request("POST", "/vision/v1.0/ocr?%s" % params, body, headers)
      response = conn.getresponse()
      data = response.read()
      conn.close()
  except Exception as e:
      print("[Errno {0}] {1}".format(e.errno, e.strerror))
  
  return data
  
def receive_message_callback(message, counter):
    global takePictureMessage, IoTMessage
    buffer = message.get_bytearray()
    size = len(buffer)
    message = buffer[:size].decode('utf-8')
    if message == "OCRImage()":
      takePictureMessage = True
      print("Message received: %s" % message)
    return IoTHubMessageDispositionResult.ACCEPTED

def blob_upload_confirmation_callback(result, pictureName):
    myresult = "%s" % result

def updateContentType(fileName):
    conn = httplib.HTTPSConnection(azure_functionHost)
    conn.request("POST", azure_functionURI, fileName)

def send_confirmation_callback(message, result, pictureName):
    confirmation = "Confirmation[%s] received for message with result = %s" % (pictureName, result)
    
def iothub_client_init():
    iotHubClient = IoTHubClient(connection_string, protocol)
    iotHubClient.set_option("messageTimeout", message_timeout)
    iotHubClient.set_message_callback(receive_message_callback, receive_context)
    return iotHubClient

def sendMessage(json):
    message = IoTHubMessage(bytearray(json))
    #message = IoTHubMessage(bytearray(json.encode('utf8')))
    print "message sent %s" % (json)
    iotHubClient.send_event_async(message, send_confirmation_callback, "null")


# Real work here
setupCamera()
iotHubClient = iothub_client_init()

while True:
  deleteOldImages(1)   
  if takePictureMessage == True:
    pictureName = takePicture()
    text = localOCR(pictureName).strip()
    if len(text) < 5:
      print "localOCR() failed, using Azure ORC"
      realfilename = open(workingDirectory + "/pictures/" + pictureName, "r").read()
      iotHubClient.upload_blob_async(pictureName, realfilename, len(realfilename), blob_upload_confirmation_callback, pictureName)
      time.sleep(2)
      updateContentType("%s/%s/%s" % (blobStorage, socket.gethostname(), pictureName))
      time.sleep(2) # wait for the image to update before we OCR it
      OCRString = remoteOCR(pictureName)
      OCRJSON = json.loads(OCRString)
      OCRJSON["pictureName"] = "%s/%s/%s" % (blobStorage, socket.gethostname(), pictureName)
      sendMessage(json.dumps(OCRJSON))
    else:
      realfilename = open(workingDirectory + "/pictures/" + pictureName, "r").read()
      iotHubClient.upload_blob_async(pictureName, realfilename, len(realfilename), blob_upload_confirmation_callback, pictureName)
      updateContentType("%s/%s/%s" % (blobStorage, socket.gethostname(), pictureName))
      OCRString = "{\"localOCR\":\"%s\", \"pictureName\": \"%s/%s/%s\"}" % (text, blobStorage, socket.gethostname(), pictureName)
      sendMessage(OCRString)
    takePictureMessage = False

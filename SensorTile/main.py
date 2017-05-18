#!/usr/bin/env python

import iothub_client
import serial
import json
import time
import datetime
import sys
from iothub_client import *
from nested_dict import nested_dict

message_timeout = 10000
receive_context = 0
IoTMessage = ''
counter = 0
workingSecond = datetime.datetime.now().second
sensorDataDict = nested_dict(2, int)

protocol = IoTHubTransportProvider.AMQP
# example connection_string = "HostName=myhub.azure-devices.net;DeviceId=mydevice;SharedAccessKey=mykey="
connection_string = "{ Insert string here }"

def receive_message_callback(message, counter):
    global weHavePicture, IoTMessage
    buffer = message.get_bytearray()
    size = len(buffer)
    message = buffer[:size].decode('utf-8')
    print("Message received: %s" % message)
    try:
      IoTMessage = json.loads(message)
    except:
      print ("json exception")
    
    return IoTHubMessageDispositionResult.ACCEPTED

def send_confirmation_callback(message, result, pictureName):
    dummyvar = result

def blob_upload_confirmation_callback(result, pictureName):
    myresult = "%s" % result

def iothub_client_init():
    iotHubClient = IoTHubClient(connection_string, protocol)
    iotHubClient.set_option("messageTimeout", message_timeout)
    iotHubClient.set_message_callback(receive_message_callback, receive_context)
    return iotHubClient

def sendMessage(message):
    messageToSend = IoTHubMessage(bytearray(message.encode('utf8')))
    iotHubClient.send_event_async(messageToSend, send_confirmation_callback, 0)

time.sleep(5)
iotHubClient = iothub_client_init()

# we expect data like:    i0: 13340, 60, 100, -4264, -150, -46, -733, 17, -50, -2
# i#=inertial sensor # 
# RTC timestamp from clock at 32.768kHz
# ACC X Y Z
# MAG X Y Z
# GYRO X Y Z

ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
while True:
  currentSecond = datetime.datetime.now().second
  try:
    serialData = ser.readline().rstrip()
    sensor, data = serialData.split(":")
    sensor = sensor.replace("\r", " ").strip()    # removing the rogue \r from the sensor name
    clock, accX, accY, accZ, magX, magY, magZ, gyroX, gyroY, gyroZ = data.split(",")
    if workingSecond == currentSecond:
      # Averaging
      counter = counter + 1
      sensorDataDict[sensor]["GaccX"] = ((sensorDataDict[sensor]["GaccX"] * (counter - 1)) +  int(accX)) / counter 
      sensorDataDict[sensor]["GaccY"] = ((sensorDataDict[sensor]["GaccY"] * (counter - 1)) +  int(accY)) / counter
      sensorDataDict[sensor]["GaccZ"] = ((sensorDataDict[sensor]["GaccZ"] * (counter - 1)) +  int(accZ)) / counter
      sensorDataDict[sensor]["GmagX"] = ((sensorDataDict[sensor]["GmagX"] * (counter - 1)) +  int(magX)) / counter
      sensorDataDict[sensor]["GmagY"] = ((sensorDataDict[sensor]["GmagY"] * (counter - 1)) +  int(magY)) / counter
      sensorDataDict[sensor]["GmagZ"] = ((sensorDataDict[sensor]["GmagZ"] * (counter - 1)) +  int(magZ)) / counter
      sensorDataDict[sensor]["GgyroX"] = ((sensorDataDict[sensor]["GgyroX"] * (counter - 1)) +  int(gyroX)) / counter
      sensorDataDict[sensor]["GgyroY"] = ((sensorDataDict[sensor]["GgyroY"] * (counter - 1)) +  int(gyroY)) / counter
      sensorDataDict[sensor]["GgyroZ"] = ((sensorDataDict[sensor]["GgyroZ"] * (counter - 1)) +  int(gyroZ)) / counter
      sensorDataDict[sensor]["counter"] = counter
    else:
      # Sending the message(s), one for each sensor
      counter = 0
      workingSecond = currentSecond
      for sensor, value in sensorDataDict.to_dict().items():
        message = {'sensor':sensor,
          'clock':int(clock),
          'accX':sensorDataDict[sensor]["GaccX"],
          'accY':sensorDataDict[sensor]["GaccY"],
          'accZ':sensorDataDict[sensor]["GaccZ"],
          'magX':sensorDataDict[sensor]["GmagX"],
          'magY':sensorDataDict[sensor]["GmagX"],
          'magZ':sensorDataDict[sensor]["GmagX"],
          'gyroX':sensorDataDict[sensor]["GgyroX"],
          'gyroY':sensorDataDict[sensor]["GgyroY"],
          'gyroZ':sensorDataDict[sensor]["GgyroZ"],
          'samples':sensorDataDict[sensor]["counter"]}
        sendMessage(json.dumps(message))
        print("Sent message: %s" % json.dumps(message))
  except:
    ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
    #iotHubClient = iothub_client_init()

#!/usr/bin/env python

import time
import sys
import iothub_client
import serial
import pynmea2
import os
import json
from iothub_client import *
from datetime import datetime
from subprocess import call
import subprocess
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

# used to determine where the GPS Module is
USBNum=os.popen("dmesg | grep 'Product: u-blox 7 - GPS/GNSS Receiver' | tail -n1 | awk '{print $4}' | cut -f 1 -d ':'").read().replace("\n", "")
ttyAC=os.popen("dmesg | grep 'cdc_acm " + USBNum + "' | tail -n1 | awk '{print $5}' | cut -f 1 -d ':'").read().replace("\n", "")
ttyReal = "/dev/" + ttyAC
serialStream = serial.Serial("/dev/"+ ttyAC, 9600, timeout=0.5)
# send a message at least every minute, unless we are moving
averageCounter = 60

# send a message every 30 seconds, when moving
averageCounterMoving = 30
currentCounter = 0
averageLat = 0
averageLon = 0
averageAlt = 0
speedAvgCycles = 60

message_timeout = 10000
receive_context = 0
IoTMessage = ''

protocol = IoTHubTransportProvider.MQTT
connection_string = "HostName=kevinsayIoT.azure-devices.net;DeviceId=gps1;SharedAccessKey=Bi8/j___REMOVED___3GlZAkk="

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
    dummyvar = ''

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
    global iotHubClient, serialStream, averageCounter, currentCounter, averageCounterMoving, averageLat, averageLon, averageAlt, speedAvgCycles, s
    speedAvg = 0.0
    # in theory, we get a new trip name every time we boot
    tripName = 'Trip' + datetime.now().strftime('%Y-%m-%d_%H:%M:%S')
    speed = 0.0
    sequence = 1
    
    try:
        print('starting main.py')
        iotHubClient = iothub_client_init()

        while True:
          sentence = serialStream.readline()
          if sentence.find('VTG') > 0:
            # we are working with accelerometer data
            speed = sentence.split(',')
            if len(speed[7]) > 0:
              speed = float(speed[7]) * .62137
              speedAvg = ((speedAvg * speedAvgCycles) + round(speed, 0)) / (speedAvgCycles + 1)
            else:
              print('No Acceleeromoter data')
          
          if sentence.find('GGA') > 0:
            validData = True
            # we are working with lat long data
            try:
              data = pynmea2.parse(sentence)
            except:
              print('Exception in pynmea2.parse(' + sentence + ')')
              validData = False
            
            if (validData and (len(data.num_sats) > 0) and (data.num_sats > 4)):
              averageLat = ((averageLat * currentCounter) + float(data.latitude)) / (currentCounter + 1)
              averageLon = ((averageLon * currentCounter) + float(data.longitude)) / (currentCounter + 1)
              averageAlt = ((averageAlt * currentCounter) + float(data.altitude)) / (currentCounter + 1)
              latlong = {'lat':averageLat, 'long':averageLon, 'speed':round(speed, 0)}
              s.sendto(json.dumps(latlong), ('192.168.1.255', 2000)) 
              
              currentCounter = currentCounter + 1
              if averageCounter/(1+speed*.05) < currentCounter:
                cDateTime = str(datetime.now())
                gpsmessage = {'event': 'gpsMessage', 'sequence':sequence, 'speedMPH': round(speed, 0), 'tripName': tripName, 'latitude': round(averageLat, 6), 'longitude': round(averageLon, 6), 'altitude': round(averageAlt, 1), 'satelliteCount': data.num_sats, 'averageCount': averageCounter, 'submissionTime': cDateTime}
                sequence = sequence + 1
  
                # first we write to a local file, in case we can't write to IoT Hub 
                file = open('/opt/gps/gps.json','a')
                file.write(json.dumps(gpsmessage) + '\r')
  
                print(json.dumps(gpsmessage))
  
                try:
                  iotHubClient = iothub_client_init()
                  sendMessage(json.dumps(gpsmessage))
                except:
                  print ("exception")
                  
                currentCounter = 0
            else:
              print('Not enough satellites')
     
    except IoTHubError as e:
        print("Unexpected error %s from IoTHub" % e)
    except KeyboardInterrupt:
        print("IoTHubClient stopped")
    except:
        print("Unknown Error")

    print_last_message_time(iotHubClient)

if __name__ == '__main__':
    print("\nPython %s" % sys.version)
    print("IoT Hub for Python SDK Version: %s" % iothub_client.__version__)

    main()

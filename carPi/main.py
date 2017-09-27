import zlib
import StringIO
import gzip
import serial
import pynmea2
import os
import json
import iothub_client
from iothub_client import *
from datetime import datetime
import platform
import obd
from sets import Set

speed = 0
messageCounter = 0
messageMaxSize = 4096
messageToSend = []
protocol = IoTHubTransportProvider.AMQP
connection_string = "HostName=kevinsaycarpi.azure-devices.net;DeviceId=carPi;SharedAccessKey=MzpwREMOVEDuw="
sequence = 0

if os.name == 'nt':
    serialStream = serial.Serial('COM28', 9600, timeout=0.5)
else:
    USBNum=os.popen("dmesg | grep 'Product: u-blox 7 - GPS/GNSS Receiver' | tail -n1 | awk '{print $4}' | cut -f 1 -d ':'").read().replace("\n", "")
    ttyAC=os.popen("dmesg | grep 'cdc_acm " + USBNum + "' | tail -n1 | awk '{print $5}' | cut -f 1 -d ':'").read().replace("\n", "")
    ttyReal = "/dev/" + ttyAC
    print(ttyReal)
    serialStream = serial.Serial("/dev/"+ ttyAC, 9600, timeout=0.5)
    
def iothub_client_init():
    iotHubClient = IoTHubClient(connection_string, protocol)
    return iotHubClient

def send_confirmation_callback(message, result, user_context):
    print(" Confirmation[%d] received for message with result = %s" % (user_context, result))

def sendMessage(message):
    global messageCounter
    messageToSend = IoTHubMessage(bytearray(gZipString(message.encode('utf8'))))
    #messageToSend = IoTHubMessage(bytearray(message.encode('utf8')))
    iotHubClient.send_event_async(messageToSend, send_confirmation_callback, messageCounter)
    messageCounter += 1

def gZipString(stringtoZip):
    out = StringIO.StringIO()
    with gzip.GzipFile(fileobj=out, mode="w") as f:
        f.write(stringtoZip)
    return out.getvalue()

def addVehicleInfo():
    try:
        connection = obd.OBD(fast=True) # auto-connects to USB or RF port
        global messageToSend, sequence, bootTime
        message = {'type': 'vehicleData',
                        'bootTime': bootTime, 
                        'sequence': sequence}

        allCommands = connection.supported_commands
        for command in allCommands:
          try:
            response = connection.query(obd.commands[command.name])
            message[command.name] = str(response.value)  
          except:
            print "Error querying OBDII entry: " + command.name

        messageToSend.append(message)
    except:
        print("Error with OBDII")

try:
    iotHubClient = iothub_client_init()
    sendMessage(str({'status': 'Connected'}))
except IoTHubError as iothub_error:
    print ( "Unexpected error %s from IoTHub" % iothub_error )

bootTime = str(datetime.now())

while True:
        try:
            if (iotHubClient is None):
                iotHubClient = iothub_client_init()
                sendMessage(str({'status': 'Reconnected'}))

            messageSize = len(gZipString(''.join(str(e) for e in messageToSend)))
            if (messageSize > (messageMaxSize * .95) or (speed < 10 and messageSize > 400)):
               # or (speed < 10 and messageToSend.count > 2):     # making sure we maximize the packet size, unless traveling fast
                print('compressed: ' + str(messageSize) + ' uncompressed: ' + str(len(''.join(str(e) for e in messageToSend))))
                addVehicleInfo()
                # send the message!
                sendMessage(str(messageToSend))
                messageToSend = []
                
            sentence = serialStream.readline()
    
            if sentence.find('VTG') > 0:
                speed = sentence.split(',')
                if len(speed[7]) > 0:
                    speed = float(speed[7]) * .62137

            if sentence.find('GGA') > 0:
                gpsdata = pynmea2.parse(sentence)
                #print(gpsdata)
                if (gpsdata.num_sats > 4):
                    currentTime = str(datetime.now())
                    message = {'type': 'location',
                               'lat': float(gpsdata.latitude), 
                               'lon': float(gpsdata.longitude), 
                               'alt': float(gpsdata.altitude), 
                               'sats': int(gpsdata.num_sats), 
                               'speed': int(speed), 
                               'currentTime': currentTime, 
                               'bootTime': bootTime, 
                               'sequence': sequence}
                    #print(message)
                    messageToSend.append(message)
                    sequence = sequence + 1

        except:
                print("Unknown Error")


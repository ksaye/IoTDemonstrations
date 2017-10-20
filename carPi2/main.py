import zlib
import StringIO
import gzip
import serial
import pynmea2
import os
import json
import iothub_client
import time
from iothub_client import *
from datetime import datetime
from datetime import timedelta
import platform
import obd
import subprocess
import sys
from sets import Set
from obd import OBDCommand, Unit, protocols
from obd.protocols import ECU
from obd.utils import bytes_to_int

speed = 0
retryCounter = 0
retryDelay = 60
messageCounter = int(time.time())
messageMaxSize = 4096
messageToSend = []
protocol = IoTHubTransportProvider.AMQP
connection_string = "HostName=kevinsaycarpi.azure-devices.net;DeviceId=carPi;SharedAccessKey=MzREMOVEDw="
sequence = 0
dataDirectory = '/opt/carPi/data'
timeHasBeenSet = True

# create the directory if it does note exist
if not os.path.exists(dataDirectory):
    os.makedirs(dataDirectory)

if os.name == 'nt':
    serialStream = serial.Serial('COM28', 9600, timeout=0.5)
else:
    USBNum=os.popen("dmesg | grep 'Product: u-blox 7 - GPS/GNSS Receiver' | tail -n1 | awk '{print $4}' | cut -f 1 -d ':'").read().replace("\n", "")
    ttyAC=os.popen("dmesg | grep 'cdc_acm " + USBNum + "' | tail -n1 | awk '{print $5}' | cut -f 1 -d ':'").read().replace("\n", "")
    ttyReal = "/dev/" + ttyAC
    print(ttyReal)
    serialStream = serial.Serial("/dev/"+ ttyAC, 9600, timeout=0.5)
    
def iothub_client_init():
    global connection_string, protocol
    try:
        iotHubClient = IoTHubClient(connection_string, protocol)
        return iotHubClient
    except:
        print("Error initializing IoTHub: " + str(sys.exc_info()[0]))
        return None

def processOldMessages():
    for filename in os.listdir(dataDirectory):
        if filename != messageCounter:
            resendMessage(filename)

def confirmation_callback(message, result, user_context):
    global dataDirectory
    print(" Confirmation[%d] received for message with result = %s" % (int(user_context), result))
    if str(result) == 'OK':
        fileToRemove = ("%s/%d") % (dataDirectory, int(user_context))
        print(" Removing file: %s" % (str(user_context)))
        os.remove(fileToRemove)

def sendMessage():
    global messageCounter, dataDirectory, messageToSend, iotHubClient, timeHasBeenSet
    if timeHasBeenSet:
        file = open(dataDirectory + '/' + str(messageCounter))
        message = json.dumps(file.read().splitlines())
        message = message.replace('"', '')
        message = message.replace('\'', '"')
        messageToSend = IoTHubMessage(bytearray(gZipString(message.encode('utf8'))))
        iotHubClient.send_event_async(messageToSend, confirmation_callback, messageCounter)
        messageCounter += 1
        messageToSend = []      # empty out the messageToSend object

def resendMessage(fileName):
    global dataDirectory, iotHubClient
    print("Resending message [%s]" % (fileName))
    file = open(dataDirectory + '/' + str(fileName))
    message = json.dumps(file.read().splitlines())
    message = message.replace('"', '')
    message = message.replace('\'', '"')
    messageToSend = IoTHubMessage(bytearray(gZipString(message.encode('utf8'))))
    iotHubClient.send_event_async(messageToSend, confirmation_callback, fileName)

def gZipString(stringtoZip):
    out = StringIO.StringIO()
    with gzip.GzipFile(fileobj=out, mode="w") as f:
        f.write(stringtoZip)
    return out.getvalue()

def addMessage(message):
    global messageToSend, messageCounter, dataDirectory
    file = open(dataDirectory + '/' + str(messageCounter), 'a')
    file.write(message + '\r\n')
    file.close()
    messageToSend.append(message)       # still need the messageToSend object so we can understand the compressed size

def raw_string(messages):
    return "\n".join([m.raw() for m in messages])

def addVehicleInfo():
    global messageToSend, sequence, bootTime
    try:
        connection = obd.OBD() # auto-connects to USB or RF port
        try:
          c = obd.OBDCommand("VIN", "Get Vehicle Identification Number", b"0902",20,raw_string,ECU.ENGINE,True)
          connection.supported_commands.add(c)  
          VIN = str(connection.query(c).value)
        except:
          VIN = 'None'
        message = {'type': 'vehicleData',
                        'bootTime': bootTime, 
                        'sequence': sequence,
                        'currentTime': str(datetime.now().isoformat()),
                        'VIN': VIN}
    
        allCommands = connection.supported_commands
        for command in allCommands:
          try:
            response = connection.query(obd.commands[command.name])
            message[command.name] = str(response.value)  
          except:
            print("for command in allCommands: Error: " + str(sys.exc_info()[0]))
    
        #print message
        addMessage(str(message))
    except:
        print("addVehicleInfo() Error: " + str(sys.exc_info()[0]))

bootTime = str(datetime.now().isoformat())
iotHubClient = iothub_client_init()

while True:
        try:
            if (iotHubClient is None):
                iotHubClient = iothub_client_init()
    
            if len(os.listdir(dataDirectory)) > 2:
                if (retryCounter == 0) or (sequence > (retryCounter + retryDelay )):
                    if (str(os.system('ifconfig | grep wlan | grep UP')) == '0') or (str(os.system('ifconfig | grep eth | grep UP')) == '0'):
                        if str(os.system('ping -c1 www.msn.com ')) == '0':
                            retryCounter = sequence + 1
                            processOldMessages()
    
            messageSize = len(gZipString(''.join(str(e) for e in messageToSend)))
            if messageSize > (messageMaxSize * .98):     # making sure we maximize the packet size, unless traveling fast
                print('compressed: ' + str(messageSize) + ' uncompressed: ' + str(len(''.join(str(e) for e in messageToSend))))
                addVehicleInfo()
                sendMessage()
                
            sentence = serialStream.readline()
    
            if sentence.find('VTG') > 0:
                speed = sentence.split(',')
                if len(speed[7]) > 0:
                    speed = float(speed[7]) * .62137
    
            if sentence.find('GPZDA') > 0:
                gpsdate = sentence.split(',')
    
                utcHour = gpsdate[1][:2]
                utcMin  = gpsdate[1][2:4]
                utcSec  = gpsdate[1][4:6]
                day     = gpsdate[2]
                month   = gpsdate[3]
                year    = gpsdate[4]
    
                formattedTime = ("%s-%s-%s %s:%s:%s UTC") % (month, day, year, utcHour, utcMin, utcSec)
                fullGPSDate = datetime.strptime(formattedTime, '%m-%d-%Y %H:%M:%S %Z')
    
                # if we are over a second off in time, we set the date
                if (fullGPSDate - datetime.utcnow()) > timedelta(seconds=1):
                    formattedNewDateTime = fullGPSDate.strftime('%d %b %Y %H:%M:%S UTC')
                    print("setting clock to: " + str(formattedNewDateTime))
                    #os.system('sudo date -s "' + formattedNewDateTime + '"')
                timeHasBeenSet = True
    
            if sentence.find('GGA') > 0:
                gpsdata = pynmea2.parse(sentence)
                #print(gpsdata)
                if (gpsdata.num_sats > 4):
                    message = {'type': 'location',
                                'lat': float(gpsdata.latitude), 
                                'lon': float(gpsdata.longitude), 
                                'alt': float(gpsdata.altitude), 
                                'sats': int(gpsdata.num_sats), 
                                'speed': int(speed), 
                                'currentTime': str(datetime.now().isoformat()), 
                                'bootTime': bootTime, 
                                'sequence': sequence}
                    #print(message)
                    addMessage(str(message))
                    sequence = sequence + 1
    
        except:
                print("Unknown Error in Main Try: " + str(sys.exc_info()[0]))


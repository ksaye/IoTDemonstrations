#!/usr/bin/env python
import socket
import fcntl
import struct
import json
import math
import RPi.GPIO as GPIO

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(('', 2000))

GPIO.setmode(GPIO.BOARD)
GPIO.setup(7, GPIO.OUT)

myspeed = float(0)
mylat = float(0)
mylong = float(0)

# distance in feet
keepdistance = 100

try:
  while True:
    myIPAddress = socket.inet_ntoa(fcntl.ioctl(s.fileno(),0x8915,struct.pack('256s', 'wlan0'[:15]))[20:24])
    data, addr = s.recvfrom(256)
    message = json.loads(data)
    if addr[0] != myIPAddress:
      if (float(message['speed']) >= 6.0) and (mylat != 0.0) and (mylong != 0.0) and (myspeed != 0.0):
        otherlat = float(message['lat'])
        otherlong = float(message['long'])
        ourdistance = math.acos(math.cos(math.radians(90-mylat)) * math.cos(math.radians(90-otherlat)) + math.sin(math.radians(90-mylat)) * math.sin(math.radians(90-otherlat)) * math.cos(math.radians(mylong-otherlong))) * 3958.756 * 5280
        print "INFO: I am", mylat, mylong, "you are", otherlat, otherlong
        print "INFO: you are: " + str(ourdistance) + " feet away"
        if ourdistance <= keepdistance:
          print "too close!"
          #do something AMAZING
          GPIO.output(7,True)
      else:
        GPIO.output(7,False)
    else:
      mylat = float(message['lat'])
      mylong = float(message['long'])
      myspeed =  float(message['speed'])
finally:
  s.close()
  GPIO.cleanup()

import cv2
import numpy as np
import datetime
#import imutils
import os

counter=0
my_threshold = 75    # change Threshold

while True:
  try:
    cam = cv2.VideoCapture('rtsp://192.168.15.125:8900/live')
    avg1 = None
    firstFrame = None

    while True:
      frame = cam.read()[1]             # read a frame from the RTSP feed
      realFrame = frame.copy()		# we need a copy of the real image that is not modified
      frame = frame[493:842, 630:1334]  # zoooming in to only the area we need

      # converting to Greyscale and bluring to factor out small changes
      frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
      frame = cv2.GaussianBlur(frame, (21, 21), 0)

      if firstFrame is None:            # if we don't have a first frame, then this is our first
        firstFrame = frame
        avg1 = np.float32(frame)
        continue

      frameDelta = cv2.absdiff(firstFrame, frame)
      thresh = cv2.threshold(frameDelta, my_threshold, 255, cv2.THRESH_BINARY)[1]

      edges = cv2.Canny(thresh, 30, 150)
      cnts = cv2.findContours(edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
      cnts = cnts[0] if imutils.is_cv2() else cnts[1]

      if len(cnts) > 0:  # we have movement!
        print("movement detected at: " + str(datetime.datetime.now()))
        for i in range(20):
          # writing a few images for model building
          fileName = str(counter) + ".jpg"
          print("writing file: " + fileName)
          cv2.imwrite(fileName, realFrame)
          counter += 1
          realFrame = cam.read()[1]

      cv2.accumulateWeighted(frame,avg1,.3)
      firstFrame = cv2.convertScaleAbs(avg1)  

  except:
    print("Error")


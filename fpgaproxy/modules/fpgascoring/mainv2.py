# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import os
import sys
import asyncio
from six.moves import input
import threading
from azure.iot.device.aio import IoTHubModuleClient
from azure.iot.device import Message

from distutils import util
import json
from azureml.accel import PredictionClient
import azureml.accel._external.ssdvgg_utils as ssdvgg_utils
import urllib.request
import cv2
import coils
import datetime
import numpy as np

output_tensors = ['ssd_300_vgg/block4_box/Reshape_1:0', 'ssd_300_vgg/block7_box/Reshape_1:0', 'ssd_300_vgg/block8_box/Reshape_1:0',
 'ssd_300_vgg/block9_box/Reshape_1:0', 'ssd_300_vgg/block10_box/Reshape_1:0', 'ssd_300_vgg/block11_box/Reshape_1:0',
 'ssd_300_vgg/block4_box/Reshape:0', 'ssd_300_vgg/block7_box/Reshape:0', 'ssd_300_vgg/block8_box/Reshape:0',
 'ssd_300_vgg/block9_box/Reshape:0', 'ssd_300_vgg/block10_box/Reshape:0', 'ssd_300_vgg/block11_box/Reshape:0']
input_tensor = "Placeholder:0"
fps = coils.RateTicker((60,))

FPGAinCloudAddress= None
FPGAinCloudssl_enabled= None
FPGAinCloudPort= None
FPGAinCloudaks_servicename= None
CameraURL= None
predictClient = None
scoring = False
PauseBetweenScoreSeconds = 0

async def getInitialTWIN(module_client):
    global FPGAinCloudAddress
    global FPGAinCloudssl_enabled
    global FPGAinCloudPort
    global FPGAinCloudaks_servicename
    global CameraURL
    global PauseBetweenScoreSeconds
    try:
        data = await module_client.get_twin()
        print(data)
        if "desired" in data:   
            data = data["desired"]
        if "FPGAinCloudAddress" in data:
            FPGAinCloudAddress = data["FPGAinCloudAddress"]
        if "FPGAinCloudssl_enabled" in data:
            FPGAinCloudssl_enabled = util.strtobool(data["FPGAinCloudssl_enabled"])
        if "FPGAinCloudPort" in data:
            FPGAinCloudPort = int(data["FPGAinCloudPort"])
        if "FPGAinCloudaks_servicename" in data:
            FPGAinCloudaks_servicename = data["FPGAinCloudaks_servicename"]
        if "CameraURL" in data:
            CameraURL = data["CameraURL"]
        if "PauseBetweenScoreSeconds" in data:
            PauseBetweenScoreSeconds = data["PauseBetweenScoreSeconds"]
    except Exception as ex:
        print ( "Unexpected error in getInitialTWIN: %s" % ex )
    # updating the reported TWIN
    await update_reported_properties(module_client)

async def twin_patch_listener(module_client):
    print("in twin_patch_listener(module_client)")
    global FPGAinCloudAddress
    global FPGAinCloudssl_enabled
    global FPGAinCloudPort
    global FPGAinCloudaks_servicename
    global CameraURL
    global PauseBetweenScoreSeconds
    while True:
        try:
            # for some reason, this is not working yet  ?
            data = await module_client.receive_twin_desired_properties_patch()  # blocking call
            if "desired" in data:   
                data = data["desired"]
            print(data)
            if "FPGAinCloudAddress" in data:
                FPGAinCloudAddress = data["FPGAinCloudAddress"]
            if "FPGAinCloudssl_enabled" in data:
                FPGAinCloudssl_enabled = util.strtobool(data["FPGAinCloudssl_enabled"])
            if "FPGAinCloudPort" in data:
                FPGAinCloudPort = int(data["FPGAinCloudPort"])
            if "FPGAinCloudaks_servicename" in data:
                FPGAinCloudaks_servicename = data["FPGAinCloudaks_servicename"]
            if "CameraURL" in data:
                CameraURL = data["CameraURL"]
            if "PauseBetweenScoreSeconds" in data:
                PauseBetweenScoreSeconds = data["PauseBetweenScoreSeconds"]
        except Exception as ex:
            print ( "Unexpected error in twin_patch_listener: %s" % ex )

        # updating the reported TWIN
        await update_reported_properties(module_client)

async def update_reported_properties(module_client):
    reported_properties = { "FPGAinCloudAddress" : FPGAinCloudAddress,
        "FPGAinCloudssl_enabled" : FPGAinCloudssl_enabled,
        "FPGAinCloudPort": FPGAinCloudPort,
        "FPGAinCloudaks_servicename": FPGAinCloudaks_servicename,
        "CamaraURL" : CameraURL,
        "PauseBetweenScoreSeconds": PauseBetweenScoreSeconds}
    await module_client.patch_twin_reported_properties(reported_properties)

async def sendmessage(module_client, message):
    print("sending message: " + json.dumps(message))
    await module_client.send_message(Message(json.dumps(message)))

async def processImages(module_client):
    global scoring
    global predictClient
    global fps

    async def scoreImage(module_client):
        global scoring
        global predictClient
        global fps
        currentFPS = fps.tick()[0]
        image = cv2.imread("image.jpg")
        result = predictClient.score_file(path="image.jpg", input_name=input_tensor, outputs=output_tensors)
        classes, scores, bboxes = ssdvgg_utils.postprocess(result, select_threshold=0.5)
        if bboxes.size > 0:
            message = { "classes" : str(classes.tolist()).strip('[]'),  # because Azure IoT does not deal with list in JSON
                        "scores" : str(scores.tolist()).strip('[]'),
                        "boxes" : str(bboxes.tolist()).strip('[]'),
                        "datetime" : str(datetime.datetime.now()),
                        "imageH" : image.shape[0],
                        "imageW" : image.shape[1],
                        "CameraURL" : CameraURL,
                        "scoredFPS" : currentFPS}
            await sendmessage(module_client, message)
        scoring = False

    while True:
        try:
            global predictClient
            if FPGAinCloudAddress is not None and CameraURL is not None and FPGAinCloudaks_servicename is not None:
                predictClient = PredictionClient(address=FPGAinCloudAddress, port=FPGAinCloudPort,
                    use_ssl=FPGAinCloudssl_enabled, service_name=FPGAinCloudaks_servicename)
                if "RTSP" in str(CameraURL).upper():
                    OpenCV = cv2.VideoCapture(CameraURL)
                    while True:
                        image = OpenCV.read()[1]
                        if scoring == False:
                            scoring = True
                            cv2.imwrite(image, "image.jpg")
                            scoreImage(module_client)
                        if PauseBetweenScoreSeconds > 0:
                            print("sleeping " + str(PauseBetweenScoreSeconds) + " seconds between scoring")
                            time.sleep(PauseBetweenScoreSeconds)
                elif "HTTP" in str(CameraURL).upper():
                    while True:
                        urllib.request.urlretrieve(url=CameraURL, filename="image.jpg")
                        await scoreImage(module_client)
                        if PauseBetweenScoreSeconds > 0:
                            print("sleeping " + str(PauseBetweenScoreSeconds) + " seconds between scoring")
                            time.sleep(PauseBetweenScoreSeconds)
            else:
                print("FPGAinCloudAddress and/or CamaraURL and/or FPGAinCloudaks_servicename in TWINS are not set.")
                time.sleep(15)
        except Exception as e:
            print(e)
            print("sleeping for 15 seconds until retry")
            time.sleep(15)

async def main():
    try:
        if not sys.version >= "3.7":
            raise Exception( "The sample requires python 3.7+. Current version of Python: %s" % sys.version )

        # The client object is used to interact with your Azure IoT hub.
        module_client = IoTHubModuleClient.create_from_edge_environment()

        # connect the client.
        await module_client.connect()

        # Get the initial TWIN
        await getInitialTWIN(module_client)

        # run the async loops
        await asyncio.gather(twin_patch_listener(module_client), processImages(module_client))

        # Finally, disconnect
        await module_client.disconnect()

    except Exception as e:
        print ( "Unexpected error %s " % e )
        raise

if __name__ == "__main__":
    asyncio.run(main())
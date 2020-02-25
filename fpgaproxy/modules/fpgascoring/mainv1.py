# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import os
import sys
import iothub_client
from iothub_client import IoTHubClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError

import distutils
import json
from azureml.accel import PredictionClient
import azureml.accel._external.ssdvgg_utils as ssdvgg_utils
import urllib.request
import cv2
import coils
import datetime
import numpy as np

PROTOCOL = IoTHubTransportProvider.MQTT
CONNECTION_STRING = "[Device Connection String]"
MESSAGE_TIMEOUT = 10000
SEND_CALLBACKS = 0
TWIN_CALLBACKS = 0
SEND_MESSAGECOUNTER = 0
SEND_REPORTED_STATE_CALLBACKS = 0
hub_manager = None

output_tensors = ['ssd_300_vgg/block4_box/Reshape_1:0', 'ssd_300_vgg/block7_box/Reshape_1:0', 'ssd_300_vgg/block8_box/Reshape_1:0',
 'ssd_300_vgg/block9_box/Reshape_1:0', 'ssd_300_vgg/block10_box/Reshape_1:0', 'ssd_300_vgg/block11_box/Reshape_1:0',
 'ssd_300_vgg/block4_box/Reshape:0', 'ssd_300_vgg/block7_box/Reshape:0', 'ssd_300_vgg/block8_box/Reshape:0',
 'ssd_300_vgg/block9_box/Reshape:0', 'ssd_300_vgg/block10_box/Reshape:0', 'ssd_300_vgg/block11_box/Reshape:0']
input_tensor = "Placeholder:0"
fps = coils.RateTicker((60,))

FPGAinCloudAddress = None                   # get settings from Azure and define in TWIN
FPGAinCloudssl_enabled = False
FPGAinCloudPort = 80
FPGAinCloudaks_servicename = None
CameraURL = None
predictClient = None
scoring = False

def device_twin_callback(update_state, payload, user_context):
    global FPGAinCloudAddress
    global FPGAinCloudssl_enabled
    global FPGAinCloudPort
    global FPGAinCloudaks_servicename
    global CameraURL
    global hub_manager

    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\n" % (update_state, payload) )
    data = json.loads(payload)

    if "desired" in data:
        data = data["desired"]

    if "FPGAinCloudAddress" in data:
        FPGAinCloudAddress = data["FPGAinCloudAddress"]
    if "FPGAinCloudssl_enabled" in data:
        FPGAinCloudssl_enabled = distutils.util.strtobool(data["FPGAinCloudssl_enabled"])
    if "FPGAinCloudPort" in data:
        FPGAinCloudPort = int(data["FPGAinCloudPort"])
    if "FPGAinCloudaks_servicename" in data:
        FPGAinCloudaks_servicename = data["FPGAinCloudaks_servicename"]
    if "CameraURL" in data:
        CameraURL = data["CameraURL"]
    reportstate(hub_manager)

def reportstate(hub_manager):
    reported_stateJSON = {}
    reported_stateJSON["FPGAinCloudAddress"] = FPGAinCloudAddress
    reported_stateJSON["FPGAinCloudssl_enabled"] = FPGAinCloudssl_enabled
    reported_stateJSON["FPGAinCloudPort"] = FPGAinCloudPort
    reported_stateJSON["FPGAinCloudaks_servicename"] = FPGAinCloudaks_servicename
    reported_stateJSON["CameraURL"] = CameraURL
    reported_state = json.dumps(reported_stateJSON)
    hub_manager.send_reported_state(reported_state, len(reported_state), SEND_REPORTED_STATE_CALLBACKS)

def send_confirmation_callback(message, result, user_context):
    global SEND_CALLBACKS
    print ( "  Confirmation[%d] received for message with result = %s" % (user_context, result) )
    map_properties = message.properties()
    key_value_pair = map_properties.get_internals()
    print ( "    Properties: %s" % key_value_pair )
    SEND_CALLBACKS += 1
    print ( "    Total calls confirmed: %d" % SEND_CALLBACKS )

def send_reported_state_callback(status_code, user_context):
    global SEND_REPORTED_STATE_CALLBACKS
    print ( "Confirmation for reported state received with:\nstatus_code = [%d]\ncontext = %s" % (status_code, user_context) )
    SEND_REPORTED_STATE_CALLBACKS += 1
    print ( "    Total calls confirmed: %d" % SEND_REPORTED_STATE_CALLBACKS )

def processImages(module_client):
    global scoring
    global predictClient
    global fps

    def scoreImage(module_client):
        global scoring
        global predictClient
        global fps
        currentFPS = fps.tick()[0]
        image = cv2.imread("image.jpg")
        result = predictClient.score_file(path="image.jpg", input_name=input_tensor, outputs=output_tensors)
        classes, scores, bboxes = ssdvgg_utils.postprocess(result, select_threshold=0.5)
        if bboxes.size > 0:
            message = { "classes" : classes,
                        "scores" : scores,
                        "boxes" : bboxes,
                        "datetime" : str(datetime.datetime.now()),
                        "imageH" : image.shape[0],
                        "imageW" : image.shape[1],
                        "CameraURL" : CameraURL,
                        "scoredFPS" : currentFPS}
            IoTHubMessage = IoTHubMessage(bytearray(json.dumps(message)))
            module_client.forward_event_to_output("output1",IoTHubMessage, SEND_MESSAGECOUNTER)
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
                elif "HTTP" in str(CameraURL).upper():
                    while True:
                        urllib.request.urlretrieve(url=CameraURL, filename="image.jpg")
                        scoreImage(module_client)
            else:
                print("FPGAinCloudAddress and/or CamaraURL and/or FPGAinCloudaks_servicename in TWINS are not set.")
        except Exception as e:
            print(e)
            print("sleeping for 15 seconds until retry")
            time.sleep(15)

class HubManager(object):

    def __init__(
            self,
            connection_string):
        self.client_protocol = PROTOCOL
        self.client = IoTHubClient(connection_string, PROTOCOL)
        
        # set the time until a message times out
        self.client.set_option("messageTimeout", MESSAGE_TIMEOUT)
        # some embedded platforms need certificate information
        self.set_certificates()
        
        # sets the callback when a message arrives on "input1" queue.  Messages sent to 
        # other inputs or to the default will be silently discarded.
        self.client.set_device_twin_callback(device_twin_callback, self)

    def set_certificates(self):
        isWindows = sys.platform.lower() in ['windows', 'win32']
        if not isWindows:
            CERT_FILE = os.environ['EdgeModuleCACertificateFile']        
            print("Adding TrustedCerts from: {0}".format(CERT_FILE))
            
            # this brings in x509 privateKey and certificate
            file = open(CERT_FILE)
            try:
                self.client.set_option("TrustedCerts", file.read())
                print ( "set_option TrustedCerts successful" )
            except IoTHubClientError as iothub_client_error:
                print ( "set_option TrustedCerts failed (%s)" % iothub_client_error )

            file.close()

    # Forwards the message received onto the next stage in the process.
    def forward_event_to_output(self, outputQueueName, event, send_context):
        self.client.send_event_async(
            outputQueueName, event, send_confirmation_callback, send_context)

    def send_reported_state(self, reported_state, size, send_context):
        self.client.send_reported_state(
            reported_state, size, send_reported_state_callback, send_context)

def main(connection_string):
    global hub_manager
    try:
        hub_manager = HubManager(connection_string)

        reportstate(hub_manager)
        processImages(hub_manager)

    except Exception as e:
        print ( "Unexpected error %s " % e )
        raise

if __name__ == "__main__":
    try:
        CONNECTION_STRING = os.environ['EdgeHubConnectionString']

    except Exception as error:
        print ( error )
        sys.exit(1)

    main(CONNECTION_STRING)
        
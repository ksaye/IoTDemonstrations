# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import asyncio
import json
import os
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime, timedelta

from azure.iot.device import Message, MethodResponse
from azure.iot.device.aio import IoTHubModuleClient
from azure.storage.blob import BlobServiceClient, ContentSettings, BlobSasPermissions, generate_blob_sas # pip install azure-storage-blob
 
# Event indicating client stop
stop_event = threading.Event()
videoURL = None
videoLenghtSeconds = 15
azureblobconnectionString = None
azureblobstoragecontainer = None
client = None
sasTokenDurationHours = 2

def removePasswordFromRTSP(url):
    try:
        splitString = str(url).split('@')
        password = splitString[0].split(':')[2]
        return str(url).replace(password, '*******')
    except:
        return url

def create_client():
    global videoURL, videoLenghtSeconds, azureblobconnectionString, azureblobstoragecontainer, client, videoLenghtSeconds
    client = IoTHubModuleClient.create_from_edge_environment()

    async def method_request_handler(method_request):
        # Send the response used for testing or instant response
        message = "{}"
        method_response = MethodResponse.create_from_method_request(method_request, 200, message)
        await client.send_method_response(method_response)
        await recordanduploadvideo(message)

    # Define function for handling received messages
    async def receive_message_handler(message):       
        JSONMessage = json.loads(message.data.decode('utf-8').replace('"', '"'))
        
        # should be something like
        if JSONMessage["machine"]["temperature"] >= 100:
            await recordanduploadvideo(JSONMessage)
        else:
            print(str(datetime.now()) + " " + str(JSONMessage))

    async def recordanduploadvideo(origionalmessage):
        print(str(datetime.now()) + " recording " + removePasswordFromRTSP(videoURL) + " for " + str(videoLenghtSeconds) + " seconds.")
        try:
            startTime       = datetime.now()
            filename        = str(datetime.now().timestamp()) + ".mp4"
            
                                # using ffmpeg to avoid the complexity of openCV.  Also disableing encoding to save CPU
            runCommand      = str('ffmpeg -i ' + videoURL + ' -to ' + str(videoLenghtSeconds) + ' -c:v copy -c:a copy ' + filename).split()
            videoProcess    = subprocess.Popen(runCommand, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, encoding="utf-8")
            while videoProcess.poll() == None:
                time.sleep(.05)  # still running

            blob_service_client =  BlobServiceClient.from_connection_string(azureblobconnectionString)
            blob_client = blob_service_client.get_blob_client(container=azureblobstoragecontainer, blob=filename)
            
            # with the MIME type set, we can view it in a simple web browser
            my_content_settings = ContentSettings(content_type="video/mp4")
            blob_client.upload_blob(open(filename, 'rb'), overwrite=True, content_settings=my_content_settings)
            videoProperties = {'startTime' : str(startTime), 'endTime' : str(datetime.now()), 'videoLenghtSeconds': str(videoLenghtSeconds), 'sourceURL' : removePasswordFromRTSP(videoURL), 'sourceMessage': str(origionalmessage)}
            blob_client.set_blob_metadata(videoProperties)
            print(str(datetime.now()) + " uploaded " + blob_client.url)
            os.remove(filename)

            cloudURL = None
            if (blob_service_client.get_container_client(container=azureblobstoragecontainer).get_container_access_policy()['public_access'] == None):
                cloudURL = blob_client.url + "?" + generate_blob_sas(account_name=blob_service_client.account_name, container_name=azureblobstoragecontainer, account_key=blob_service_client.credential.account_key,
                                                                        blob_name=filename, permission=BlobSasPermissions(read=True), expiry=datetime.utcnow() + timedelta(hours=sasTokenDurationHours))
            else:
                cloudURL = blob_client.url

            message = {'startTime' : str(startTime), 'endTime' : str(datetime.now()), 'videoLenghtSeconds': videoLenghtSeconds, 'cloudURL': cloudURL, 'sourceURL' : removePasswordFromRTSP(videoURL), 'sourceMessage': origionalmessage}
            print(str(datetime.now()) + " sending message " + str(message))

            iotMessage = Message(json.dumps(message))
            iotMessage.content_encoding = "utf-8"
            iotMessage.content_type = "application/json"
            await client.send_message(iotMessage)

        except:
            print(str(datetime.now()) +  " Error : " + str(sys.exc_info()[0])) 

    try:
        # Set handler on the client
        client.on_message_received = receive_message_handler

        # for testing the recording process
        client.on_method_request_received = method_request_handler

        # deal with any twin changes and get the initial twin
        client.on_twin_desired_properties_patch_received = twin_handler

    except:
        # Cleanup if failure occurs
        client.shutdown()
        raise

    return client

async def twin_handler(patch):
    global videoURL, videoLenghtSeconds, azureblobconnectionString, azureblobstoragecontainer, videoLenghtSeconds   
    if "videoURL" in patch.keys():
        videoURL = patch["videoURL"]
        print(str(datetime.now()) + " videoURL=" + removePasswordFromRTSP(videoURL))
    
    if "videoLenghtSeconds" in patch.keys():
        videoLenghtSeconds = patch["videoLenghtSeconds"]
        print(str(datetime.now()) + " videoLenghtSeconds=" + str(videoLenghtSeconds))

    if "azureblobconnectionString" in patch.keys():
        azureblobconnectionString = patch["azureblobconnectionString"]
        print(str(datetime.now()) + " azureblobconnectionString=" + azureblobconnectionString)

    if "azureblobstoragecontainer" in patch.keys():
        azureblobstoragecontainer = patch["azureblobstoragecontainer"]
        print(str(datetime.now()) + " azureblobstoragecontainer=" + azureblobstoragecontainer)

    reported_properties = {"videoURL": videoURL, "azureblobconnectionString": azureblobconnectionString, "azureblobstoragecontainer": azureblobstoragecontainer}
    await client.patch_twin_reported_properties(reported_properties)

async def module_run(client):
    # getting the initial twin
    twin = await client.get_twin()
    await twin_handler(twin['desired'])
    
    while True:
        await asyncio.sleep(1000)

def main():
    if not sys.version >= "3.5.3":
        raise Exception( "The sample requires python 3.5.3+. Current version of Python: %s" % sys.version )
    print(str(datetime.now()) + " IoT Hub Client for Python" )

    # NOTE: Client is implicitly connected due to the handler being set on it
    client = create_client()

    # Define a handler to cleanup when module is is terminated by Edge
    def module_termination_handler(signal, frame):
        print (str(datetime.now()) + " Module stopped by Edge")
        stop_event.set()

    # Set the Edge termination handler
    signal.signal(signal.SIGTERM, module_termination_handler)

    # Run the sample
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(module_run(client))
    except Exception as e:
        print(str(datetime.now()) + " Unexpected error %s " % e)
        raise
    finally:
        print(str(datetime.now()) + " Shutting down IoT Edge Module...")
        loop.run_until_complete(client.shutdown())
        loop.close()

if __name__ == "__main__":
    main()

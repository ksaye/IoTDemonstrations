# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import os
import random
import datetime
import time
import sys
import json
import imageio
import iothub_client
import tensorflow as tf
import numpy as np
import scipy
import requests
from scipy import misc
from urllib import urlopen
from iothub_client import IoTHubClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError

# messageTimeout - the maximum time in milliseconds until a message times out.
# The timeout period starts at IoTHubClient.send_event_async.
# By default, messages do not expire.
MESSAGE_TIMEOUT = 10000

# global counters
RECEIVE_CALLBACKS = 0
SEND_CALLBACKS = 0
TWIN_CALLBACKS = 0

# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
PROTOCOL = IoTHubTransportProvider.MQTT

# String containing Hostname, Device Id & Device Key & Module Id in the format:
# "HostName=<host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>;ModuleId=<module_id>;GatewayHostName=<gateway>"
CONNECTION_STRING = "[Device Connection String]"

MESSAGECOUNTER = 0

modelDateTime = None

graph_def = tf.GraphDef()

# Default names
filename = "model.pb"
labels_filename = "labels.txt"

urlKey = "imageURL"

# we have to resize the images to match the model build but Custom Computer Vision
network_input_size = 227
size = (network_input_size, network_input_size)

# Static values, but we could derive them.
output_layer = 'loss:0'
input_node = 'Placeholder:0'

labels = []

# device_twin_callback is invoked when twin's desired properties are updated.
def device_twin_callback(update_state, payload, user_context):
    global TWIN_CALLBACKS
    global urlKey

    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\n" % (update_state, payload) )
    data = json.loads(payload)
    # for full TWIN messages
    if "desired" in data and "urlKey" in data["desired"]:
        urlKey = json.dumps(data["desired"]["urlKey"])
    if "desired" in data and "model" in data["desired"]:
        updateModel(json.dumps(data["desired"]["model"]).replace('\"',''))

    # for partial TWIN message
    if "urlKey" in data:
        urlKey = data["urlKey"]
    if "model" in data:
        updateModel(data["model"].replace('\"',''))
    
    TWIN_CALLBACKS += 1
    print ( "Total calls confirmed: %d\n" % TWIN_CALLBACKS )

def updateModel(modelURL):
    r = requests.get(modelURL)
    with open("model.zip", "wb") as code:
        code.write(r.content)
    os.system('unzip -o model.zip')
    
    # re initialize the graph
    initialize()

# Callback received when the message that we're forwarding is processed.
def send_confirmation_callback(message, result, user_context):
    global SEND_CALLBACKS
    print ( "Confirmation[%d] received for message with result = %s" % (user_context, result) )
    map_properties = message.properties()
    SEND_CALLBACKS += 1

# receive_message_callback is invoked when an incoming message arrives on the specified 
# input queue (in the case of this sample, "input1").  Because this is a filter module, 
# we will forward this message onto the "output1" queue.
def receive_message_callback(message, hubManager):
    global RECEIVE_CALLBACKS, MESSAGECOUNTER
    message_buffer = message.get_bytearray()
    size = len(message_buffer)

    IOTMessage = json.loads(message_buffer[:size].decode('utf-8'))
    IOTMessage['Predicted'] = False
    if IOTMessage.has_key(urlKey) == True:
        try:
            start = datetime.datetime.now()
            # prediction is a set where predictions is a list
            # prediction is the top rated prediction
            prediction, predictions = predict_url(IOTMessage[urlKey])
            scoringTime = datetime.datetime.now() - start
            IOTMessage['Tag'] = prediction.get('Tag')
            IOTMessage['Probability'] = prediction.get('Probability')
            IOTMessage['Predictions'] = predictions
            IOTMessage['ScoringTimeMS'] = scoringTime.total_seconds() * 1000
            IOTMessage['Predicted'] = True
            IOTMessage['modelDateTime'] = modelDateTime.strftime('%Y-%m-%dT%H:%M:%S')
        except:
            e = sys.exc_info()[0]
            print ( "Unexpected error with prediction: %s" % e )

    newIOTmessage = IoTHubMessage(bytearray(json.dumps(IOTMessage), 'utf8'))
    hubManager.forward_event_to_output("output1", newIOTmessage, MESSAGECOUNTER)
    print "MessageId: [", MESSAGECOUNTER, "] ",json.dumps(IOTMessage)
    MESSAGECOUNTER += 1
    return IoTHubMessageDispositionResult.ACCEPTED

def initialize():
    global modelDateTime
    with tf.gfile.FastGFile(filename, 'rb') as f:        
        graph_def.ParseFromString(f.read())
        tf.import_graph_def(graph_def, name='')
    
    modelDateTime = datetime.datetime.fromtimestamp(os.stat(filename).st_mtime)

    with open(labels_filename, 'rt') as lf:
        for l in lf:
            labels.append(l.strip())
    
def crop_center(img,cropx,cropy):
    y,x,z = img.shape
    startx = x//2-(cropx//2)
    starty = y//2-(cropy//2)    
    return img[starty:starty+cropy,startx:startx+cropx]

def predict_url(imageUrl):
    image = imageio.imread(imageUrl)
    return predict_image(image)

def predict_image(image):
    tf.reset_default_graph()
    tf.import_graph_def(graph_def, name='')
    
    with tf.Session() as sess:

        prob_tensor = sess.graph.get_tensor_by_name(output_layer)

        w = image.shape[0]
        h = image.shape[1]

        # scaling
        if w > h:
            new_size = (int((float(size[1]) / h) * w), size[1], 3)
        else:
            new_size = (size[0], int((float(size[0]) / w) * h), 3)

        # resize
        temp = scipy.misc.imresize(image, (420, 600, 3))

        # crop center
        try:
            temp = crop_center(temp, network_input_size, network_input_size)
        except: 
            print(filename, ":-1", ":-1")
            return "error: crop_center"

        image = temp.astype(float)

        # RGB -> BGR
        red, green, blue = tf.split(axis=2, num_or_size_splits=3, value=image)

        image_normalized = tf.concat(axis=2, values=[
            blue - 104.,
            green - 117.,
            red - 124.,
        ])

        image_normalized = image_normalized.eval()
        image_normalized = np.expand_dims(image_normalized, axis=0)

        predictions, = sess.run(prob_tensor, {input_node: image_normalized})

        # uncomment if you want just the top prediction       
        idx = np.argmax(predictions)
        truncated_probablity = np.float64(round(predictions[idx],8))
        primary = {"Tag": labels[idx], "Probability": float("{0:.8f}".format(truncated_probablity)) }       
        
        result = []
        idx = 0       
        for p in predictions:
            truncated_probablity = np.float64(round(p,8))
            result.append({"Tag": labels[idx], "Probability": float("{0:.8f}".format(truncated_probablity)) })
            idx += 1
        return primary, result

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
        
        # set a TWIN callback
        self.client.set_device_twin_callback(device_twin_callback, self)

        # sets the callback when a message arrives on "input1" queue.  Messages sent to 
        # other inputs or to the default will be silently discarded.
        self.client.set_message_callback("input1", receive_message_callback, self)

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

def main(connection_string):
    try:
        hub_manager = HubManager(connection_string)

        print ("Starting the IoT Hub Python TensorFlow Module using protocol %s..." % hub_manager.client_protocol )
        print "Expecting messages on 'input1' queue with the schema '", urlKey, "' and will add 'tag', 'probability' and 'predictions' to the message."

        initialize()

        print "waiting for message."

        while True:
            time.sleep(1000)

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubClient sample stopped" )

if __name__ == '__main__':
    try:
        CONNECTION_STRING = os.environ['EdgeHubConnectionString']

    except Exception as error:
        print ( error )
        sys.exit(1)

    main(CONNECTION_STRING)

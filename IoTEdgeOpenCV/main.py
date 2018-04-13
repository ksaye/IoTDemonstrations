# Much of the OpenCV is from: https://stackoverflow.com/questions/189943/how-can-i-quantify-difference-between-two-images

import os
import random
import time
import sys
import iothub_client
import json
import cv2
import base64
import SimpleHTTPServer
import SocketServer
import thread
import socket

from scipy.misc import imread
from scipy.linalg import norm
from scipy import sum, average

#import cv2.cv as cv
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
SEND_MESSAGECOUNTER = 0

# Web Service port
WebServicePort = 8080

# how long we keep older files in seconds
keepImageFiles = 3600   # one hour

# camara JSON, updated from the desired properties
camaraJSON = '{"publicURL":"rtsp://184.72.239.149/vod/mp4:BigBuckBunny_175k.mov"}'

# Default imageProcessing interval in seconds
imageProcessingInterval = 30

# Weather or not we conver the images to Gray Scale to eliminate color issues
imageToGrayScale = False

# Weather or not we normalize the images, for different sizes and etc
imageNormalization = False

# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
PROTOCOL = IoTHubTransportProvider.MQTT

# String containing Hostname, Device Id & Device Key & Module Id in the format:
# "HostName=<host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>;ModuleId=<module_id>;GatewayHostName=<gateway>"
CONNECTION_STRING = "[Device Connection String]"

# Callback received when the message that we're forwarding is processed.
def send_confirmation_callback(message, result, user_context):
    global SEND_CALLBACKS
    print ( "  Confirmation[%d] received for message with result = %s" % (user_context, result) )
    map_properties = message.properties()
    key_value_pair = map_properties.get_internals()
    #print ( "    Properties: %s" % key_value_pair )
    SEND_CALLBACKS += 1
    #print ( "    Total calls confirmed: %d" % SEND_CALLBACKS )

# device_twin_callback is invoked when twin's desired properties are updated.
def device_twin_callback(update_state, payload, user_context):
    global TWIN_CALLBACKS
    global camaraJSON
    global imageProcessingInterval
    global imageToGrayScale
    global imageNormalization

    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\n" % (update_state, payload) )
    data = json.loads(payload)
    # for full TWIN messages
    if "desired" in data and "imageNormalization" in data["desired"]:
        imageNormalization = json.dumps(data["desired"]["imageNormalization"])
    if "desired" in data  and "imageToGrayScale" in data["desired"]:
        imageToGrayScale = json.dumps(data["desired"]["imageToGrayScale"])
    if "desired" in data and "camaraArray" in data["desired"]:
        camaraJSON = json.dumps(data["desired"]["camaraArray"])
        print "  List of camaras: ", camaraJSON
    if "desired" in data and "imageProcessingInterval" in data["desired"]:
        imageProcessingInterval = data["desired"]["imageProcessingInterval"]
        print ( "  Image processing interval is: %d\n" % imageProcessingInterval )

    # for partial TWIN message
    if "imageNormalization" in data:
        imageNormalization = data["imageNormalization"]
    if "imageToGrayScale" in data:
        imageToGrayScale = data["imageToGrayScale"]
    if "camaraArray" in data:
        camaraJSON = json.dumps(data["camaraArray"])
        print "  New list of camaras: ", camaraJSON
    if "imageProcessingInterval" in data:
        imageProcessingInterval = data["imageProcessingInterval"]
        print ( "  New image processing interval is: %d\n" % imageProcessingInterval )
    
    TWIN_CALLBACKS += 1
    print ( "Total calls confirmed: %d\n" % TWIN_CALLBACKS )

# receive_message_callback is invoked when an incoming message arrives on the specified 
# input queue (in the case of this sample, "input1").  Because this is a filter module, 
# we will forward this message onto the "output1" queue.
def receive_message_callback(message, hubManager):
    global RECEIVE_CALLBACKS
    message_buffer = message.get_bytearray()
    size = len(message_buffer)
    print ( "    Data: <<<%s>>> & Size=%d" % (message_buffer[:size].decode('utf-8'), size) )
    map_properties = message.properties()
    key_value_pair = map_properties.get_internals()
    print ( "    Properties: %s" % key_value_pair )
    RECEIVE_CALLBACKS += 1
    print ( "    Total calls received: %d" % RECEIVE_CALLBACKS )
    hubManager.forward_event_to_output("output1", message, 0)
    return IoTHubMessageDispositionResult.ACCEPTED

def to_grayscale(arr):
    "If arr is a color image (3D array), convert it to grayscale (2D array)."
    if len(arr.shape) == 3:
        return average(arr, -1)  # average over the last axis (color channels)
    else:
        return arr

def normalize(arr):
    rng = arr.max()-arr.min()
    amin = arr.min()
    return (arr-amin)*255/rng

def compare_images(img1, img2):
    try:
        # normalize to compensate for exposure difference
        if imageNormalization:
            img1 = normalize(img1)
            img2 = normalize(img2)
        
        # calculate the difference and its norms
        diff = img1 - img2  # elementwise for scipy arrays
        m_norm = sum(abs(diff))  # Manhattan norm
        z_norm = norm(diff.ravel(), 0)  # Zero norm
        return (m_norm, z_norm)
    except:
        return (0.0, 0.0)

def startWebService():
    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("", WebServicePort), Handler)

    print "Listening for remote connections on port:", WebServicePort
    httpd.serve_forever()

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
        self.client.set_message_callback("input1", receive_message_callback, self)
        self.client.set_device_twin_callback(device_twin_callback, self)

        # start the background web service
        thread.start_new_thread(startWebService, ())

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
    global SEND_MESSAGECOUNTER

#    try:
    print ( "\nPython %s\n" % sys.version )
    print ( "IoT Hub Client for Python" )

    hub_manager = HubManager(connection_string)

    print ( "Starting the IoT Hub Python sample using protocol %s..." % hub_manager.client_protocol )

    priorImage = [None] * 1

    while True:
#            try:
        # removing old files
        now = time.time()
        for f in os.listdir("."):
            if "-image.jpg" in f:
                fullpath = os.path.join(".", f)
                if os.stat(fullpath).st_mtime < (now - keepImageFiles):
                    if os.path.isfile(fullpath):
                        os.remove(fullpath)
        
        time.sleep(imageProcessingInterval)

        camaraArray = json.loads(camaraJSON)

        # in case we have additionl cameras to monitor, we have to expand the priorImage array
        if len(camaraArray) != len(priorImage):
            priorImage = [None] * len(camaraArray)

        arrayCounter = 0

        # for each camara or URL we manage
        for camara in camaraArray:
            camaraName = camara
            camaraURL = camaraArray[camara]
            filename = str(camaraName + '-' + time.strftime('%Y-%m-%d-%H-%M-%S') +'-image.jpg')

            print "Processing camera: ", camaraName, " with URL: ", camaraURL

            vcap = cv2.VideoCapture(camaraURL)
            ret, frame = vcap.read()

            if priorImage[arrayCounter] is None:
                # we don't have a prior image, must be the first time we saw this camera or TWIN change
                ManhattanImageChange = 0.0
                ZeroImageChange = 0.0

                # naming and writing the image file
                cv2.imwrite(filename, frame)
                
            else:
                priorFrame = priorImage[arrayCounter]

                if imageToGrayScale:
                    img1 = to_grayscale(priorFrame.astype(float))
                    img2 = to_grayscale(frame.astype(float))
                else:
                    img1 = priorFrame.astype(float)
                    img2 = frame.astype(float)
            
                # if we want to convert to grayscale -- possible future enhancement
                # img1 = to_grayscale(priorFrame.astype(float))
                # img2 = to_grayscale(frame.astype(float)) 
                # n_m, n_0 = compare_images(img1, img2)
                # also note we can normalize in: def compare_images(img1, img2):
                
                n_m, n_0 = compare_images(img1, img2)
                ManhattanImageChange = n_0*1.0/frame.size
                ZeroImageChange = n_m*1.0/frame.size

                # naming and writing the image file
                cv2.imwrite(filename, frame)

            # reading and encoding the file for the JSON message
            with open(filename, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read())

            # creating the JSON for the IoTMessage
            IoTMessageJSON = {}
            #IoTMessageJSON['imageBase64'] = encoded_string
            IoTMessageJSON['GrayScale'] = imageToGrayScale
            IoTMessageJSON['Normalized'] = imageNormalization
            IoTMessageJSON['ManhattanImageChange'] = ManhattanImageChange 
            IoTMessageJSON['imageFileName'] = filename
            IoTMessageJSON['imageURL'] = str("http://" + socket.gethostname() + ":" + str(WebServicePort) + "/" + filename)
            IoTMessageJSON['ZeroImageChange'] = ZeroImageChange
            IoTMessageJSON['imageSize'] = os.path.getsize(filename)
#                        IoTMessageJSON['imageWidth'] = cv2.VideoCapture.get(cv.CV_CAP_PROP_FRAME_WIDTH)
#                        IoTMessageJSON['imageHeight'] = cv2.VideoCapture.get(cv.CV_CAP_PROP_FRAME_HEIGHT)
#                        IoTMessageJSON['imageFPS'] = cv2.VideoCapture.get(cv.CV_CAP_PROP_FPS)
#                        IoTMessageJSON['imageFormat'] = cv2.VideoCapture.get(cv.CV_CAP_PROP_FRAME_FORMAT)
            IoTMessageJSON['camaraName'] = camaraName
            IoTMessageJSON['camaraURL'] = camaraURL
            IoTMessageJSON['dateTime'] = time.strftime('%Y-%m-%dT%H:%M:%S')

            IoTMessage = IoTHubMessage(bytearray(json.dumps(IoTMessageJSON), 'utf8'))

            hub_manager.forward_event_to_output("output1", IoTMessage, SEND_MESSAGECOUNTER)
            SEND_MESSAGECOUNTER += 1

            priorImage[arrayCounter] = frame
            arrayCounter += 1

            vcap.release()

        #except: # catch *all* exceptions
            #   e = sys.exc_info()[0]
            #  print ( "Unexpected error in while camaraChange == False loop %s" % e )

    #except IoTHubError as iothub_error:
    #    print ( "Unexpected error %s from IoTHub" % iothub_error )
    #    return
    #except KeyboardInterrupt:
    #    print ( "IoTHubClient sample stopped" )

if __name__ == '__main__':
    try:
        CONNECTION_STRING = os.environ['EdgeHubConnectionString']

    except Exception as error:
        print ( error )
        sys.exit(1)

    main(CONNECTION_STRING)
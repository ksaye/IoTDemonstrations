# Much of the OpenCV is from: https://stackoverflow.com/questions/189943/how-can-i-quantify-difference-between-two-images

import os
import random
import datetime
import time
import sys
import json
import cv2
import thread
import socket
import commands
import tensorflow as tf
import numpy as np
import scipy

#from scipy.misc import imread
from scipy.linalg import norm
from scipy import sum, average

# Default names
filename = "model.pb"
labels_filename = "labels.txt"

# we have to resize the images to match the model build but Custom Computer Vision
network_input_size = 227
size = (network_input_size, network_input_size)

# Static values, but we could derive them.
output_layer = 'loss:0'
input_node = 'Placeholder:0'

labels = []

# camara JSON, updated from the desired properties
camaraJSON = '{"mailCheck":"rtsp://userid:password@192.168.1.5:88/videoMain"}'

# Default imageProcessing interval in seconds
imageProcessingInterval = 1

graph_def = tf.GraphDef()

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

def main():
    initialize()

    while True:
        try:
            # for the future, we could check MANY cameras 
            camaraArray = json.loads(camaraJSON)

            # for each camara or URL we manage
            for camara in camaraArray:
                camaraURL = camaraArray[camara]
                vcap = cv2.VideoCapture(camaraURL)

                while vcap.isOpened():
                    time.sleep(imageProcessingInterval)
                    
                    ret, frame = vcap.read()
                    
                    prediction, predictions = predict_image(frame)

                    if prediction.get('Tag') == 'Mail Truck':
                        print "We have a ", prediction.get('Tag'), " with ", prediction.get('Probability'), " probability."
                        counter=1
                        while counter <= 255:
                            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                            sock.sendto("Speak:Mail is here\n", ("192.168.1." + str(counter), 5555))
                            counter += 1
                    else:
                        print prediction.get('Tag'), " with ", prediction.get('Probability'), " probability."
                
                    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                    sock.sendto("PackageUpdate:" + str(prediction.get('Tag')) + ":" + str(prediction.get('Probability') * 100), ("192.168.1.157", 5555))

                vcap.release()

        except: # catch *all* exceptions
            e = sys.exc_info()[0]
            print ( "Unexpected error: %s" % e )

if __name__ == '__main__':
    main()
    

# based on https://github.com/movidius/ncsdk/blob/master/examples/tensorflow/inception_v3/run.py
from mvnc import mvncapi as mvnc
import sys
import numpy
import cv2
import json
import io
import datetime
import time

# Imports for the REST API
from flask import Flask, request, jsonify

# Imports for image procesing
from PIL import Image

path_to_networks = './'
graph_filename = 'graph'
maxreturnedlables=25
minscore=.01
HTTPPort=88

app = Flask(__name__)

#mvnc.global_set_option(mvnc.GlobalOption.RW_LOG_LEVEL, 2)
devices = mvnc.enumerate_devices()
if len(devices) == 0:
    print('No devices found. is the compute stick plugged in and is docker started with ''--net=host --privileged -v /dev:/dev''?')
    quit()

device = mvnc.Device(devices[0])
device.open()

#Load graph
with open(path_to_networks + graph_filename, mode='rb') as f:
    print("loading the graph file: " + str(path_to_networks + graph_filename))
    graphFileBuff = f.read()

#Load preprocessing data
mean = 128
std = 1/128

#Load categories
categories = []
with open(path_to_networks + 'categories.txt', 'r') as f:
    for line in f:
        cat = line.split('\n')[0]
        if cat != 'classes':
            categories.append(cat)
    f.close()
    print('loaded the file: ' + str(path_to_networks + 'categories.txt'))
    print('Number of categories:', len(categories))

#Load image size
with open(path_to_networks + 'inputsize.txt', 'r') as f:
    print ('loading the inputsize: ' + str(path_to_networks + 'inputsize.txt'))
    reqsize = int(f.readline().split('\n')[0])

graph = mvnc.Graph('graph')
fifoIn, fifoOut = graph.allocate_with_fifos(device, graphFileBuff)

# 4MB Max image size limit
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024 

# Default route just shows simple text
@app.route('/')
def index():
    return 'Movidius model host harness.<br/>  Post to the harness using a command like: curl -H "Content-type: application/octet-stream" -X POST --data-binary @1.jpg "http://\{IPAddress\}:\{PORT\}/image"'

@app.route('/image', methods=['POST'])
def predict_image_handler(project=None):
    startTime = time.time()
    try:
        imageData = io.BytesIO(request.get_data())
        img = Image.open(imageData)
        results = predict_image(img, startTime)
        return jsonify(results)
    except Exception as e:
        print('EXCEPTION:', str(e))
        return 'Error processing image', 500

def predict_image(image, startTime):
    img = numpy.array(image).astype(numpy.float32)
    dx,dy,dz= img.shape
    delta=float(abs(dy-dx))
    if dx > dy: #crop the x dimension
        img=img[int(0.5*delta):dx-int(0.5*delta),0:dy]
    else:
        img=img[0:dx,int(0.5*delta):dy-int(0.5*delta)]

    img=cv2.resize(img,(reqsize, reqsize))
    img=cv2.cvtColor(img,cv2.COLOR_BGR2RGB)

    for i in range(3):
        img[:,:,i] = (img[:,:,i] - mean) * std

    graph.queue_inference_with_fifo_elem(fifoIn, fifoOut, img, 'user object')
    output, userobj = fifoOut.read_elem()

    top_inds = output.argsort()[::-1][:maxreturnedlables]
    result = []

    for i in range(maxreturnedlables):
        probability = round(output[top_inds[i]], 8)
        if probability >= minscore:
            result.append({
                'tagName': str(categories[top_inds[i]]),
                'probability': float(probability),
                'tagId': int(top_inds[i]),
                'boundingBox': None })
    response = { 
        'id': '',
        # ~600 MS on Ubuntu x64 4 core Intel(R) Core(TM) i5-2400 CPU @ 3.10GHz, CPUs running at ~4%, MEM usage is 110MB
        # ~701 MS on Pi3 4 ARMv7 Processor rev 4 (v7l), CPUs running at ~20%
        # test = remotely CURL posting a 172K file using inception_v3 running in container
        'inferenceTimeMS': int((time.time() - startTime) * 1000),
        'project': '',
        'iteration': '',
        'created': datetime.datetime.utcnow().isoformat(),
        'predictions': result 
    }
    return response

app.run(host='0.0.0.0', port=HTTPPort)

fifoIn.destroy()
fifoOut.destroy()
graph.destroy()
device.close()
print('Finished')
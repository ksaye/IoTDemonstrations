"""
    Python file to process an image directory to classifying images
    I should have used the custom-vision-service python SDK
    but there were some issues so I just used the requests object
"""
from shutil import copyfile
import requests
import json
import os

projectId="de14REMOVEDREMOVEDREMOVEDd569"
prediction_key="81bREMOVEDREMOVEDREMOVEDb13cc"
endpoint="https://southcentralus.api.cognitive.microsoft.com/customvision/v3.0/Prediction/"
publishedIteration="Iteration1"

headers = {'Content-type': 'application/octet-stream', 'Prediction-Key': prediction_key}
url = endpoint + projectId + "/classify/iterations/" + publishedIteration + "/image"

dirToProcess = "C:\\Users\\ksaye\\Desktop\\movement"

for filename in os.listdir(dirToProcess):
    sourceFile = os.path.join(dirToProcess,filename)
    data = open(sourceFile, mode="rb").read()
    results = requests.post(url, data=data, headers=headers).json()
    # in the response JSON, the predictions are sorted by hightes score, so you can just grab [0]
    tag = results["predictions"][0]["tagName"]
    percent = results["predictions"][0]["probability"]
    targetDir = os.path.join(dirToProcess,tag)
    if os.path.exists(targetDir) == False:
        os.mkdir(targetDir)
    print(sourceFile + " = " + tag + " at " + str(percent))
    copyfile(sourceFile, os.path.join(targetDir,filename))

from http.server import HTTPServer, BaseHTTPRequestHandler
import _thread
import os
import cgi

from distutils import util
import json
import time
from azureml.accel import PredictionClient
import azureml.accel._external.ssdvgg_utils as ssdvgg_utils
import datetime

output_tensors = ['ssd_300_vgg/block4_box/Reshape_1:0', 'ssd_300_vgg/block7_box/Reshape_1:0', 'ssd_300_vgg/block8_box/Reshape_1:0',
 'ssd_300_vgg/block9_box/Reshape_1:0', 'ssd_300_vgg/block10_box/Reshape_1:0', 'ssd_300_vgg/block11_box/Reshape_1:0',
 'ssd_300_vgg/block4_box/Reshape:0', 'ssd_300_vgg/block7_box/Reshape:0', 'ssd_300_vgg/block8_box/Reshape:0',
 'ssd_300_vgg/block9_box/Reshape:0', 'ssd_300_vgg/block10_box/Reshape:0', 'ssd_300_vgg/block11_box/Reshape:0']
input_tensor = "Placeholder:0"
predictClient = None

def webServer(port):
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, RequestHandler)
    print('running HTTP server on port: ' + str(port))
    httpd.serve_forever()

class RequestHandler(BaseHTTPRequestHandler):
    global predictClient
    
    def respond(self, response, status=200):
        self.send_response(status)
        self.send_header("Content-type", "text/json")
        self.send_header("Content-length", len(response))
        self.end_headers()
        self.wfile.write(response)  
        self.wfile

    def do_POST(self):
        global predictClient
        fs = cgi.FieldStorage( fp = self.rfile, headers = self.headers, environ={ 'REQUEST_METHOD':'POST' })
        fileitem = fs["file"]
        if fileitem.filename:
            fn = os.path.basename(fileitem.filename)
            open(fn, 'wb').write(fileitem.file.read())
        
        result = predictClient.score_file(path=fn, input_name=input_tensor, outputs=output_tensors)
        classes, scores, bboxes = ssdvgg_utils.postprocess(result, select_threshold=0.5)
        
        if bboxes.size > 0:
            message = { "classes" : str(classes.tolist()).strip('[]'),  # because Azure IoT does not deal with list in JSON
                        "scores" : str(scores.tolist()).strip('[]'),
                        "boxes" : str(bboxes.tolist()).strip('[]'),
                        "datetime" : str(datetime.datetime.now())}
            self.respond(bytes(json.dumps(message), "utf8"))
        else:
            self.respond(bytes("{}", "utf8"))
        return

if __name__ == "__main__":
    FPGAinCloudAddress = "addyourIPAddressHere"
    FPGAinCloudPort = 80
    FPGAinCloudssl_enabled = False
    FPGAinCloudaks_servicename = "fpga-aks-service"

    if 'FPGAinCloudAddress' in os.environ.keys():
        FPGAinCloudAddress = os.environ['FPGAinCloudAddress']
    if 'FPGAinCloudPort' in os.environ.keys():
        FPGAinCloudPort = os.environ['FPGAinCloudPort']
    if 'FPGAinCloudssl_enabled' in os.environ.keys():
        FPGAinCloudssl_enabled = util.strtobool(os.environ['FPGAinCloudssl_enabled'])
    if 'FPGAinCloudaks_servicename' in os.environ.keys():
        FPGAinCloudaks_servicename = os.environ['FPGAinCloudaks_servicename']

    print("Connecting to " + FPGAinCloudAddress + ":" + str(FPGAinCloudPort) + " ssl:" + str(FPGAinCloudssl_enabled) + " service:" + FPGAinCloudaks_servicename)

    # starting the PredictClient
    predictClient = PredictionClient(address=FPGAinCloudAddress, port=FPGAinCloudPort,
                    use_ssl=FPGAinCloudssl_enabled, service_name=FPGAinCloudaks_servicename)

    # starting the web server thread
    _thread.start_new_thread(webServer, (80, ))

    while True:
        time.sleep(60)  # allow the background thread to serve web request
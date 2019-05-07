import SimpleHTTPServer
import SocketServer
import json
import datetime
import requests
import platform
import os

APIKey="REMOVED"

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def do_GET(self):
        path = str(self.path)
        returnContent = None
        print("path is: " + str(path))
        if path.find("/hello") > -1:
            response = {}
            response['dateTime'] = str(datetime.datetime.now())
            response['text'] = "Well hello back to you."
            returnContent = json.dumps(response)

        if path.find("/weather") > -1:
            pathlist= path.split("location=")
            if len(pathlist) == 2:
                location = pathlist[1]
                url = 'https://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=' + APIKey + '&units=imperial'
            else:
                url = 'https://api.openweathermap.org/data/2.5/weather?q=Dallas&appid=' + APIKey + '&units=imperial'
            r = requests.get(url)
            returnContent = json.dumps(r.json())

        if path.find("/OS") > -1:
            response = {}
            response['dateTime'] = str(datetime.datetime.now())
            response['platform'] = str(platform.platform())
            response['name'] = str(os.name)
            returnContent = json.dumps(response)

        # Construct a server response.
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(returnContent)
        return

print('Server listening on port 8181...')
httpd = SocketServer.TCPServer(('', 8181), Handler)
httpd.serve_forever()

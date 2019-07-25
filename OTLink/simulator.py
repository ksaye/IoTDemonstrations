from iothub_client import IoTHubClient, IoTHubTransportProvider, IoTHubMessage
import time
import requests

CONNECTION_STRING = "HostName=kevinsayeotlink35.azure-devices.net;DeviceId=demo1;SharedAccessKey=AeVnKZeOixfqbAHV5juulArKFFssbRpDgAO+wC1j0zM="
PROTOCOL = IoTHubTransportProvider.MQTT
BASEURL = "http://modbus.centralus.azurecontainer.io/"

def send_confirmation_callback(message, result, user_context):
    print("Confirmation received for message with result = %s" % (result))

client = IoTHubClient(CONNECTION_STRING, PROTOCOL)
print("Connected")

while True:
  try:
    for i in range(1, 6):
      print(i)
      r = requests.get(BASEURL + str(i)).content
      message = IoTHubMessage(r)
      client.send_event_async(message, send_confirmation_callback, None)
  except:
    print("Error")


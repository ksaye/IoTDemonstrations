import sys
import time

import machine
import network
import ntptime
import ujson
import utime
from ubinascii import hexlify
from umqtt.simple import MQTTClient, MQTTException

from azureiotutil import dpsprovision, generate_sas_token, humanreadabletime

# optional if using DPS
dpsScopeId = "YOURDPSCOPEHERE"
dpsProvisionKey = 'YOURDPSGROUPENROLLMENTKEYHERE'

# if dpsScopeId and dpsProvisionKey above are set, these values will be overwritten
iotHubhostname = ""
device_id = ""
device_shared_access_key = ""

# constants
twin_topic = '$iothub/twin/res/#'
twin_report = '$iothub/twin/PATCH/properties/reported/?$rid={}'
twin_desired = '$iothub/twin/PATCH/properties/desired/#'
twin_get = '$iothub/twin/GET/?$rid={}'
dm_topic = '$iothub/methods/POST/#'
dm_response = '$iothub/methods/res/{}/?$rid={}'
c2d_topic = 'devices/{}/messages/devicebound/#'
fullTwin = ujson.loads('{}')

connected = False
errorCounter = 1
twinCounter = 1

def mqttcallback(topic, message):
    """Callback function for subscribed topics"""
    topic = topic.decode()
    message = message.decode()

    # if this is a direct method, must respond
    if str(topic).find('methods') >= 0:
        dm_rid = int(str(topic).split("rid=")[1])
        dm_name = str(str(topic).split("$iothub/methods/POST/")[1].split("/?$rid=")[0])
        dm_payload = str(message)
        print(str(humanreadabletime()) + "   Received direct method '" + dm_name + "' with payload " + dm_payload)
        mqttc.publish(dm_response.format(200, dm_rid), ujson.dumps({'statusText': "Success"}))
        print(str(humanreadabletime()) + "   Responded to direct method")
        if dm_name == "reboot":
            print(str(humanreadabletime()) + "   Rebooting in 2 seconds")
            time.sleep(2)
            machine.reset()

    # if this is a status response to a twin update
    elif str(topic).find('twin/res/204') >= 0:
        print(str(humanreadabletime()) + "   Twin successfully updated")

    elif str(topic).find('twin/res/200') >= 0:
        fullTwin = ujson.loads(message)
        if "test" in fullTwin["desired"]:
            # example of how to access properties
            print(str(humanreadabletime()) + "   'test'=" + str(fullTwin["desired"]["test"]) + " in the desired twin")
        print(str(humanreadabletime()) + "   Twin received " + ujson.dumps(fullTwin))

    else:
        print(str(humanreadabletime()) + ' Received topic={} message={}'.format(topic, message))

def publishdata(payload):
    d2c_topic = 'devices/{}/messages/events/'.format(device_id)
    mqttc.publish(d2c_topic, ujson.dumps(payload))      # assuming all data will be json

ntptime.host = "0.pool.ntp.org"
ntptime.settime()

print(str(humanreadabletime()) + " Booting")
#### Main code ####
while True:
    ntptime.settime()
    if device_id == "":         # if the device_id is not set, using the WLAN MAC address
        device_id = str(hexlify(network.WLAN().config('mac'),':').decode()).replace(":", "")

    print(str(humanreadabletime()) + " Main loop")
    try:
        if dpsScopeId != "" and dpsProvisionKey != "" and device_id != "" and errorCounter >= 1:
            iotHubhostname, device_id, device_shared_access_key = dpsprovision(dpsScopeId, dpsProvisionKey, device_id)

        uri = '{}/devices/{}'.format(iotHubhostname, device_id)
        password = generate_sas_token(uri=uri, key=device_shared_access_key)
        username = '{}/{}/api-version=2018-06-30'.format(iotHubhostname, device_id)

        mqttc = MQTTClient(
            device_id, iotHubhostname, user=username, password=password, ssl=True
        )
        mqttc.set_callback(mqttcallback)
        
        print(str(humanreadabletime()) + " Attempting connection to " + str(iotHubhostname) + " as '" + str(username) + "' with password '" + str(password) + "'")
        if mqttc.connect() == 0:
            connected = True
            errorCounter=0

            # optional, subscribe to cloud to device message
            mqttc.subscribe(c2d_topic.format(device_id))

            # optional, subscribe to direct method
            mqttc.subscribe(dm_topic)

            # optional, subscribe to incremental desired properties update
            mqttc.subscribe(twin_desired)

            # optional, subscribe to the initial full twin
            mqttc.subscribe(twin_topic)

            # optional, request the initial twin
            mqttc.publish(twin_get.format(twinCounter), "")
            twinCounter+=1

            # example, publish twin property if not set.  Note this is populated by the subscribe and publish above
            if "reported" in fullTwin:
                if "clientversion" in fullTwin["reported"]:
                    if str(fullTwin["reported"]["clientversion"]) != str(sys.version):
                        mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'clientversion': str(sys.version)}))
                        twinCounter+=1

            # example, publishing data
            publishdata({'connected': True})

            print(str(humanreadabletime()) + " Connected")

        while True:
            mqttc.check_msg()

            # do real work here!
            time.sleep(1)
    
    except Exception as er:
        connected=False
        errorCounter+=1
        print(str(humanreadabletime()) + " Error count " + str(errorCounter) + ", Reconnecting after 15 seconds.  Possible sas token expired, network connection lost or quota exceeded. Error " + str(er))
        time.sleep(15)

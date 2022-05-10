import sys, gc
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
dpsScopeId = "YOURSCOPEID"
dpsProvisionKey = 'YOURDPSSymmetricalKey'

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
SASTokenHours = 24              # this determines how ofter we reconnect.  A higher number lowers the bandwidth but MQTT will always see this as a 'unauthorized - disconnect - reconnect'
MQTTPingCounterMinutes = 5      # without a PING or activitiy, it might lose connection -- based on the firewalls
MQTTLastPing = 0
DPSRetryCounter = 5             # because we sometimes have network issues, waiting until 5 errors until we make a DPS call again
MaximumErrors = 10              # this helps with out of memory and stabilty issues

connected = False
errorCounter = 1
if dpsScopeId != "" and dpsProvisionKey != "":
    errorCounter = 4
twinCounter = 1

def mqttcallback(topic, message):
    global MQTTPingCounterMinutes, SASTokenHours, DPSRetryCounter, MaximumErrors, fullTwin
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
        elif dm_name == "getWLANs":
            publishWLANs()

    # if this is a status response to a twin update
    elif str(topic).find('twin/res/204') >= 0:        
        print(str(humanreadabletime()) + "   Twin successfully updated")

    # incremental twin update
    elif str(topic).find('$iothub/twin/PATCH/properties/desired/') >= 0:
        incrementalTwin = ujson.loads(message)
        if "SASTokenHours" in incrementalTwin:
            SASTokenHours = int(incrementalTwin["SASTokenHours"])
        if "MQTTPingCounterMinutes" in incrementalTwin:
            MQTTPingCounterMinutes = int(incrementalTwin["MQTTPingCounterMinutes"])
        if "DPSRetryCounter" in incrementalTwin:
            DPSRetryCounter = int(incrementalTwin["DPSRetryCounter"])
        if "MaximumErrors" in incrementalTwin:
            MaximumErrors = int(incrementalTwin["MaximumErrors"])       
        print(str(humanreadabletime()) + "   Incremental twin received " + ujson.dumps(incrementalTwin))
        publishreportedproperties()

    # full twin received
    elif str(topic).find('twin/res/200') >= 0:
        fullTwin = ujson.loads(message)
        if "SASTokenHours" in fullTwin["desired"]:
            SASTokenHours = int(fullTwin["desired"]["SASTokenHours"])
        if "MQTTPingCounterMinutes" in fullTwin["desired"]:
            MQTTPingCounterMinutes = int(fullTwin["desired"]["MQTTPingCounterMinutes"])
        if "DPSRetryCounter" in fullTwin["desired"]:
            DPSRetryCounter = int(fullTwin["desired"]["DPSRetryCounter"])
        if "MaximumErrors" in fullTwin["desired"]:
            MaximumErrors = int(fullTwin["desired"]["MaximumErrors"])
        print(str(humanreadabletime()) + "   Full twin received " + ujson.dumps(fullTwin))
        publishreportedproperties()

    else:
        print(str(humanreadabletime()) + '   Received topic={} message={}'.format(topic, message))

def publishdata(payload):
    d2c_topic = 'devices/{}/messages/events/'.format(device_id)
    mqttc.publish(d2c_topic, ujson.dumps(payload))      # assuming all data will be json

def escapeWLAN(data):
    data = str(data).replace(" ", "-SPACE-")
    data = str(data).replace(".", "-DOT-")
    data = str(data).replace("$", "-DOLLAR-")
    data = str(data).replace("#", "-POUND-")
    data = str(data).replace(",", "-COMMA-")
    return data

def publishWLANs():
    global twinCounter
    wlan = network.WLAN()
    for item in wlan.scan():
        ssid = item[0].decode()
        bssid = hexlify(item[1]).decode()
        channel = item[2]
        rssi = item[3]
        authmode = item[4]
        hidden = item[5]
        mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'WLANS':{ escapeWLAN(ssid): {'ssid': ssid, 'bssid': bssid, 'channel': channel, 'rssi': rssi, 'authmode': authmode, 'hidden': hidden}}}))
        twinCounter+=1

def publishreportedproperties():
    global twinCounter
    for property in ["SASTokenHours", "MQTTPingCounterMinutes", "MaximumErrors", "DPSRetryCounter"]:
        if "reported" not in fullTwin or property not in fullTwin["reported"] or fullTwin["reported"][property] != globals()[property]:
            mqttc.publish(twin_report.format(twinCounter), ujson.dumps({property: globals()[property]}))
            twinCounter+=1
            print(str(humanreadabletime()) + "   publishing twin " + str({property: globals()[property]}))

def publishNetworkStats():
    global twinCounter
    # publish some network statistics
    if "reported" not in fullTwin or "WLAN_rssi" not in fullTwin["reported"] or str(fullTwin["reported"]["WLAN_rssi"]) != str(network.WLAN().status('rssi')):
        mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'WLAN_rssi': network.WLAN().status('rssi')}))
        twinCounter+=1
        print(str(humanreadabletime()) + "   publishing twin " + str({'WLAN_rssi': network.WLAN().status('rssi')}))
    
    if "reported" not in fullTwin or "WLAN_essid" not in fullTwin["reported"] or str(fullTwin["reported"]["WLAN_essid"]) != network.WLAN().config('essid'):
        mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'WLAN_essid': str(network.WLAN().config("essid"))}))
        twinCounter+=1
        print(str(humanreadabletime()) + "   publishing twin " + str({'WLAN_essid': str(network.WLAN().config("essid"))}))
    
    if "reported" not in fullTwin or "WLAN_DNS" not in fullTwin["reported"] or str(fullTwin["reported"]["WLAN_DNS"]) != str(network.WLAN().ifconfig()[3]):
        mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'WLAN_DNS': str(network.WLAN().ifconfig()[3])}))
        twinCounter+=1
        print(str(humanreadabletime()) + "   publishing twin " + str({'WLAN_DNS': str(network.WLAN().ifconfig()[3])}))
    
    if "reported" not in fullTwin or "WLAN_IP" not in fullTwin["reported"] or str(fullTwin["reported"]["WLAN_IP"]) != str(network.WLAN().ifconfig()[0]):
        mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'WLAN_IP': str(network.WLAN().ifconfig()[0])}))
        twinCounter+=1
        print(str(humanreadabletime()) + "   publishing twin " + str({'WLAN_IP': str(network.WLAN().ifconfig()[0])}))
    
    if "reported" not in fullTwin or "WLAN_GW" not in fullTwin["reported"] or str(fullTwin["reported"]["WLAN_GW"]) != str(network.WLAN().ifconfig()[2]):
        mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'WLAN_GW': str(network.WLAN().ifconfig()[2])}))
        twinCounter+=1
        print(str(humanreadabletime()) + "   publishing twin " + str({'WLAN_GW': str(network.WLAN().ifconfig()[2])}))

gc.enable()

print(str(humanreadabletime()) + " Booting")
#### Main code ####
while True:
    if device_id == "":         # if the device_id is not set, using the WLAN MAC address
        device_id = str(hexlify(network.WLAN().config('mac'),':').decode()).replace(":", "")

    print(str(humanreadabletime()) + " Main loop")
    try:
        ntptime.settime()
        if dpsScopeId != "" and dpsProvisionKey != "" and device_id != "" and errorCounter >= 4:
            iotHubhostname, device_id, device_shared_access_key = dpsprovision(dpsScopeId, dpsProvisionKey, device_id)

        uri = '{}/devices/{}'.format(iotHubhostname, device_id)

        print(str(humanreadabletime()) + " Generating a SAS token for " + str(SASTokenHours) + " hours")
        password = generate_sas_token(uri=uri, key=device_shared_access_key, expiry=int(3600 * SASTokenHours))
        username = '{}/{}/api-version=2018-06-30'.format(iotHubhostname, device_id)

        mqttc = MQTTClient(
            device_id, iotHubhostname, user=username, password=password, ssl=True
        )
        mqttc.set_callback(mqttcallback)
        
        print(str(humanreadabletime()) + " Attempting connection to " + str(iotHubhostname) + " as '" + str(username) + "' with password '" + str(password) + "'")
        if mqttc.connect() == 0:
            print(str(humanreadabletime()) + " Connected")
            connected = True
            errorCounter=0
            MQTTLastPing = int(time.time())

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
            
            # wait to get the full twin before we write the reported values
            counter = 0     
            while counter <= 3:
                mqttc.check_msg()
                counter+=1
                time.sleep(1)       

            # example, publish twin property if not set.  Note this is populated by the subscribe and publish above
            if "reported" not in fullTwin or "clientversion" not in fullTwin["reported"] or  str(fullTwin["reported"]["clientversion"]) != str(sys.version):
                mqttc.publish(twin_report.format(twinCounter), ujson.dumps({'clientversion': str(sys.version)}))
                twinCounter+=1
                print(str(humanreadabletime()) + "   publishing twin " + str({'clientversion': str(sys.version)}))

            # publish network stats
            publishNetworkStats()

            # example, publishing data
            publishdata({'connected': True})

        pingCounter = 0
        while True:
            mqttc.check_msg()
            if MQTTLastPing <= int(time.time()) - int(MQTTPingCounterMinutes * 60):
                print(str(humanreadabletime()) + " MQTT Ping to keep network connections alive")
                mqttc.ping()
                MQTTLastPing = int(time.time())

            # do real work here!
            time.sleep(1)
    
    except Exception as er:
        gc.collect()
        connected=False
        errorCounter+=1
        sleepTime = errorCounter * errorCounter * 1
        print(str(humanreadabletime()) + " Error count " + str(errorCounter) + ", Reconnecting after " + str(sleepTime) + " seconds.  Possible sas token expired, network connection lost or quota exceeded. Error " + str(er))
        
        if errorCounter >= MaximumErrors:       # seems to be a ssl error in MicroPython: https://github.com/micropython/micropython/issues/5219
            machine.reset()
        time.sleep(sleepTime)

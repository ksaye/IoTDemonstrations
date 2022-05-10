import collections
import hmac
import time
import sys

import urequests
import utime
import ujson
from ubinascii import a2b_base64, b2a_base64, hexlify
#from uhashlib import sha256  # open issue here https://github.com/micropython/micropython-lib/issues/369
from hashlib._sha256 import sha256

#from urllib.parse import quote_plus, urlencode # this fails on EPS32 :()


def quote_plus(content):
    content = str(content).replace("/", "%2F")
    content = str(content).replace("=", "%3D")
    content = str(content).replace("+", "%2B")
    return content

def humanreadabletime():
    localtime = time.localtime()
    month = localtime[1]
    if month < 10:
        month = str('0'+ str(month))
    day = localtime[2]
    if day < 10:
        day = str('0'+ str(day))
    hour = localtime[3]
    if hour < 10:
        hour = str('0'+ str(hour))
    minute = localtime[4]
    if minute < 10:
        minute = str('0'+ str(minute))
    second = localtime[5]
    if second < 10:
        second = str('0'+ str(second))

    return '{}-{}-{} {}:{}:{}'.format(localtime[0], month, day, hour, minute, second)

def get_time():
    t = utime.time()
    t += 946684800
    return t

def generate_sas_token(uri, key, policy_name=None, expiry=3600):
    ttl = int(time.time() + 946684800)  + expiry
    sign_key = '{}\n{}'.format(quote_plus(uri), ttl)
    signature = b2a_base64(hmac.new(a2b_base64(key), sign_key, sha256).digest())
    # strip off the trailing newline
    signature = signature[:-1]

#from urllib.parse import quote_plus, urlencode # this fails on EPS32 :()
#    rawtoken = {'sr': uri, 'sig': signature, 'se': ttl}
#    if policy_name:
#        rawtoken['skn'] = policy_name
    #return 'SharedAccessSignature {}'.format(urlencode(rawtoken))

    returnvalue = 'sr=' + quote_plus(uri) + '&sig=' + quote_plus(signature.decode()) + '&se=' + str(ttl)

    if policy_name:
        returnvalue += '&skn=' + policy_name

    return 'SharedAccessSignature {}'.format(returnvalue)   

def dpsprovision(dpsScopeId, dpsProvisionKey, device_id, dpsHostName = "global.azure-devices-provisioning.net"):
    print(str(humanreadabletime()) + " Provisioning with DPS")
    registrationCounter = 5        

    # create the device key by signing the device_id with the DPS Key
    device_shared_access_key = b2a_base64(hmac.new(a2b_base64(dpsProvisionKey), device_id, sha256).digest())[:-1]
    print(str(humanreadabletime()) + "   DPS calculated device key: " + str(device_shared_access_key))

    dpsuri = '{}/registrations/{}'.format(dpsScopeId, device_id)
    dpsSASToken = generate_sas_token(dpsuri, device_shared_access_key, 'registration')
    
    # make the DPS request and get the operationId
    headers = {'Authorization': dpsSASToken, 'User-Agent': str(sys.version), 'content-type': 'application/json', 'Content-Encoding': 'utf-8'}
    url = "https://" + dpsHostName + "/" + dpsuri + "/register?api-version=2021-06-01"
    data = '{"registrationId": "'+ device_id +'"}'

    print(str(humanreadabletime()) + "   DPS URL is " + url)
    print(str(humanreadabletime()) + "   DPS headers are " + str(headers))
    print(str(humanreadabletime()) + "   DPS data is " + str(data))

    res = urequests.request(method="PUT", url=url, data=data, headers=headers).json()

    if "operationId" in res:
        operationId = str(res["operationId"])
    else:
        print(str(humanreadabletime()) + "   DPS Error " + str(res))
        return "","",""

    # loop until we have a registration
    while registrationCounter >= 0:
        time.sleep(1)
        url = "https://" + dpsHostName + "/" + dpsScopeId + "/registrations/" + device_id + "/operations/" + operationId + "?api-version=2021-06-01"
        res = urequests.request(method="GET", url=url, data=None, headers=headers).json()
        if "status" in res and res["status"] == "assigned":
            iotHubhostname = str(res["registrationState"]["assignedHub"])
            device_id = str(res["registrationState"]["deviceId"])        # this may not change but it could if a DPS policy defines in
            device_shared_access_key = b2a_base64(hmac.new(a2b_base64(dpsProvisionKey), device_id, sha256).digest())[:-1]
            print(str(humanreadabletime()) + "   DPS status: " + str(res["status"]))
            print(str(humanreadabletime()) + "   DPS assigned IoT Hub: " + iotHubhostname)
            print(str(humanreadabletime()) + "   DPS assigned DeviceId: " + device_id)
            print(str(humanreadabletime()) + "   DPS calculated device key: " + str(device_shared_access_key))
            return iotHubhostname, device_id, device_shared_access_key
        else:
            registrationCounter-=1
            print(str(humanreadabletime()) + " Waiting for DPS provision " + str(res) + " will retry " + str(registrationCounter) + " more times.")

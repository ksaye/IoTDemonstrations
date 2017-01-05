using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Common.Security;

/*  add the following to project.json  {"frameworks":{"net46":{"dependencies":{"Microsoft.Azure.Devices":"1.1.4"}}}}  */
// Note, if sending the iotHub and Key, you need to base64 encode the key, as it sometimes contains a +

const string connectionString = "HostName=January2017.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=VKQ3REMOVEDevM=";

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    // parse query parameter
    string deviceId = req.GetQueryNameValuePairs().FirstOrDefault(q => string.Compare(q.Key, "deviceId", true) == 0).Value;
    string iotHub = req.GetQueryNameValuePairs().FirstOrDefault(q => string.Compare(q.Key, "iotHub", true) == 0).Value;
    string key = req.GetQueryNameValuePairs().FirstOrDefault(q => string.Compare(q.Key, "key", true) == 0).Value;
    byte[] keyConverted = Convert.FromBase64String(key);
    key = Encoding.UTF8.GetString(keyConverted);

    return deviceId == null
        ? req.CreateResponse(HttpStatusCode.BadRequest, "Error: No deviceId on the query string.")
        : req.CreateResponse(HttpStatusCode.OK, getSASToken(deviceId, log, iotHub, key).Result);
}

private static async Task<String> getSASToken(string deviceId, TraceWriter log, string iotHub = null, string key = null,  int ttl = 1)
{
    string mySAS = null;
    try
    {
        if (iotHub == null && key == null) {
            RegistryManager registryManager = RegistryManager.CreateFromConnectionString(connectionString);
            Device myDevice = await registryManager.GetDeviceAsync(deviceId);
            key = myDevice.Authentication.SymmetricKey.PrimaryKey;
            iotHub = connectionString.Split(Convert.ToChar(";"))[0].Substring(9);
            log.Info($"Generated SAS for: {deviceId}.  Key not provided, using connectionString.");
        } else {
            log.Info($"Generated SAS for: {deviceId}.  Key and IotHub: {iotHub} provided not using connectionString.");
        }

        SharedAccessSignatureBuilder sasBuilder = new SharedAccessSignatureBuilder()
        {
            Key = key,
            Target = String.Format("{0}/devices/{1}", iotHub, System.Net.WebUtility.UrlEncode(deviceId)),
            TimeToLive = TimeSpan.FromDays(Convert.ToDouble(ttl))
        };
        mySAS = sasBuilder.ToSignature();
    }
    catch (Exception er) {
        log.Info($"Error: {er.Message}");
     }
    return mySAS;
}
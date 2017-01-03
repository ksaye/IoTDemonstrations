#r "Newtonsoft.Json"
#r "System.Web"
#r "System.Runtime"
#r "System.Collections"

using System;
using System.IO;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using Newtonsoft.Json;
using System.Runtime;
using System.Collections;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

/* using the next gen client https://www.twilio.com/docs/libraries/csharp
    added         "Twilio": "5.0.0-rca2" to the project.json
*/
const string BlobConnectionString = "DefaultEndpointsProtocol=https;AccountName=austioniotfiles;AccountKey=T4dREMOVEDVqA==";
const string CognitiveFaceURL = "https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,glasses";
const string CognitiveIdentifyURL = "https://api.projectoxford.ai/face/v1.0/identify";
const string CognitiveKey = "87REMOVED8d";
const string TwilioAccountSid = "ACREMOVEDdd"; 
const string TwilioAuthToken = "4cREMOVED9e";
const string fromPhoneNumber = "+146REMOVED72";
const string toPhoneNumber= "+1REMOVED381";
const float identifyConfidence = (float).75;

public static async Task Run(string myEventHubMessage, TraceWriter log)
{
    log.Info($"Started with message: {myEventHubMessage}");
    IoTMessageReceived msg = JsonConvert.DeserializeObject<IoTMessageReceived>(myEventHubMessage);
    if (msg.action == "verifyPicture()"){
        string imageInfo = "";
        Face face = null;
        StringContent body = new StringContent("{\"url\":\"" +  msg.url + "\"}", System.Text.Encoding.UTF8, "application/json");
        HttpClient client = new HttpClient();
        HttpResponseMessage response = null;
        client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", CognitiveKey);
        try {
            response = await client.PostAsync(CognitiveFaceURL, body);
            imageInfo = await response.Content.ReadAsStringAsync();
            if (imageInfo != "[]") {
                // normalizing the JSON
                if (imageInfo.StartsWith("[")) { imageInfo = imageInfo.Substring(1); }
                if (imageInfo.EndsWith("]")) { imageInfo = imageInfo.Substring(0,imageInfo.Length-1); }
                face = JsonConvert.DeserializeObject<Face>(imageInfo);
            }
        } catch (Exception er) { 
            log.Error($"Error calling CognitiveFaceURL: {er.Message}");
        }    

        if (imageInfo != "[]") {
            string stringIdentify = "{\"personGroupId\":\"austiniot\",\"faceIds\":[\"" + face.faceId + "\"],\"maxNumOfCandidatesReturned\":1,\"confidenceThreshold\":0.5}";
            StringContent identifyBody = new StringContent(stringIdentify, System.Text.Encoding.UTF8, "application/json");
            response = await client.PostAsync(CognitiveIdentifyURL, identifyBody);
            string identifyInfo = await response.Content.ReadAsStringAsync();
            if (identifyInfo.StartsWith("[")) { identifyInfo = identifyInfo.Substring(1); }
            if (identifyInfo.EndsWith("]")) { identifyInfo = identifyInfo.Substring(0,identifyInfo.Length-1); }
            identifyResponse identify = JsonConvert.DeserializeObject<identifyResponse>(identifyInfo);
            if (identify.candidates.Count == 0 || identify.candidates[0].confidence < identifyConfidence) {
                string SMSMessage = "WARNING: " + Convert.ToString(((float)1.00000 - Math.Round(msg.scoredprobabilities, 5)) * 100) + "% chance " + msg.fromdevicename + " open in error.  ";
                SMSMessage = SMSMessage + "{" + face.faceId + "} identified as {" + identify.candidates[0].personId + "} with " + Convert.ToString(Math.Round(identify.candidates[0].confidence, 2)*100) + "% confidence.  ";
                SMSMessage = SMSMessage + " Unauthorized User: " +  face.faceAttributes.gender + ", age " + face.faceAttributes.age + ", with " + face.faceAttributes.glasses + ".";
                notify(toPhoneNumber, SMSMessage, msg.url, log);
            } else {
                log.Info($"User {{{face.faceId}}} at {msg.url} identified as {{{identify.candidates[0].personId}}} with {Convert.ToString(Math.Round(identify.candidates[0].confidence, 2)*100)}% confidence.");
            }

        } else {
            log.Info($"Error: no faceId.");
            string SMSMessage = "WARNING Unidentified User: Unable to identify face.";
            notify(toPhoneNumber, SMSMessage, msg.url, log);
        }
    }
}
public static void notify(string phoneNumber, string SMSMessage, string imageUrl, TraceWriter log) {
    log.Info($"notify: {SMSMessage}");
    ChangeContentType(imageUrl);        // Because the default content type is application/x-www-form-urlencoded and Twilio does not like that
    List<Uri> media = new List<Uri>() { new Uri(imageUrl) };
    TwilioClient.Init(TwilioAccountSid, TwilioAuthToken);
    var message = MessageResource.Create(to: new PhoneNumber(phoneNumber), from: new PhoneNumber(fromPhoneNumber), body: SMSMessage, mediaUrl: media);
    log.Info($"MessageStatus: {message.Status}, {message.Sid}"); 
}

public static void ChangeContentType(string URI)
{
    //Parse the connection string for the storage account.
    CloudStorageAccount storageAccount = CloudStorageAccount.Parse(BlobConnectionString);

    //Create the service client object for credentialed access to the Blob service.
    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

    ICloudBlob imageFile = blobClient.GetBlobReferenceFromServer(new Uri(URI));
    imageFile.Properties.ContentType = "image/jpeg";
    imageFile.SetProperties();
}

class IoTMessageReceived
{
    public string action { get; set; }
    public string url { get; set; }
    public float scoredprobabilities {get; set;}
    public string fromdevicename { get; set;}
    public string frommacaddress { get; set;}
    public string devicename { get; set;}
}

class Face
{
    public string faceId {get; set;}
    public FaceAttributes faceAttributes {get; set;}
    public class FaceAttributes 
    {
        public string gender {get; set;}
        public string age {get; set;}
        public string glasses {get; set;}
    }

}

class identifyResponse
{
    public string faceId { get; set;}
    public List<candidates> candidates { get; set;}
}

public class candidates {
    public string personId { get; set;}
    public float confidence { get; set;}
}
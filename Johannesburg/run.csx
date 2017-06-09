using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

// For the Lab, modify the following 3 lines
const string IoTConnectionString    = "HostName=Johannesburg.azure-devices.net;SharedAccessKeyName=deviceExplorer;SharedAccessKey=fPuPREMOVEDjFAO6m2KXLQ=";
const string BlobConnectionString   = "DefaultEndpointsProtocol=https;AccountName=kevinsayiot;AccountKey=MjKh6y3QDM8tPCi8PwjYREMOVEDm9iwl9ZJKsinqxNbEPzg==;EndpointSuffix=core.windows.net";
const string JohannesburgKey        = "40c1REMOVED978e13";

const string DocumentDBURI          = "https://johannesburg.documents.azure.com:443/";
const string DocumentDBKEY          = "iujkEZ3NiS7lBoWREMOVEDLitB4AIWFw94uPHYfhhw==";
const string BingMAPSKey            = "AsNQVqREMOVEDfRnSCfyU-Aew5cIN";
const string FetchTokenUri          = "https://api.cognitive.microsoft.com/sts/v1.0";
const string SpeechKey              = "d6REMOVEDc1b3";
const string FaceKey                = "f285REMOVEDfc069";
const string SpeechURI              = "https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1?language=en-US";
const string CognitiveFaceURL       = "https://eastus2.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true";
const string CognitiveIdentifyURL   = "https://eastus2.api.cognitive.microsoft.com/face/v1.0/identify";
const string targetGroup            = "face1";
public static string personGUID;

/*  We expect the following types of messages from the Truck (Python) code
    {'messageType':'requestRoute','truck':'mytruck','height':18,'hc':'F','currentLocLat':32.96074,'currentLocLong':-96.73297,'targetLocLat':32.77815,'targetLocLong':-96.7954}
    {'messageType':'requestVoiceRoute','truck':'mytruck','voiceFile':'http://kevinsayiot.blob.core.windows.net/johannesburg/English.wav','height':18,'hc':'F','currentLocLat':32.96074,'currentLocLong':-96.73297}
    {'messageType':'requestPhotoRoute','truck':'mytruck','photoFile':'http://kevinsayiot.blob.core.windows.net/johannesburg/KevinSayPicture.jpg','height':18,'hc':'F','currentLocLat':32.96074,'currentLocLong':-96.73297}
*/

public static async Task Run(string myEventHubMessage, TraceWriter log)
{
    dynamic jsonMessage     = JObject.Parse(myEventHubMessage);
    string voiceFile        = jsonMessage.voiceFile;
    string photoFile        = jsonMessage.photoFile;
    int height              = jsonMessage.height;
    double currentLocLat    = jsonMessage.currentLocLat;
    double currentLocLong   = jsonMessage.currentLocLong;
    double targetLocLat     = 0;
    if (jsonMessage.targetLocLat != null ) {
        targetLocLat        = jsonMessage.targetLocLat;
    }
    double targetLocLong    = 0;
    if (jsonMessage.targetLocLong != null ) {
        targetLocLong       = jsonMessage.targetLocLong;
    }
    string truck            = jsonMessage.truck;
    string hc               = jsonMessage.hc;

    if (jsonMessage.messageType == "requestRoute")
    {
        dynamic route = JObject.Parse(getRoute(height, currentLocLat, currentLocLong, targetLocLat, targetLocLong, hc));
        await sendRoute(truck, route.directions.ToString(), route.time.ToString());
        log.Info("Method: requestRoute,Sent: "+ route.directions.ToString());
    }
    else if (jsonMessage.messageType == "requestVoiceRoute")
    {
        dynamic coordinates = JObject.Parse(getCoordinates(getAddressFromVoice(voiceFile).Result.ToString()));
        targetLocLat = coordinates.targetLocLat.Value;
        targetLocLong = coordinates.targetLocLong.Value;

        dynamic route = JObject.Parse(getRoute(height, currentLocLat, currentLocLong, targetLocLat, targetLocLong, hc));
        await sendRoute(truck, route.directions.ToString(), route.time.ToString());
        log.Info("Method: requestVoiceRoute,Sent: "+ route.directions.ToString());
    }
    else if (jsonMessage.messageType == "requestPhotoRoute" && verifyPerson(photoFile).Result == true)
    {
        DocumentClient client = new DocumentClient(new Uri(DocumentDBURI), DocumentDBKEY);
        List<Schedule> scheduleList = client.CreateDocumentQuery<Schedule>(UriFactory.CreateDocumentCollectionUri("routedatabase", "routecollection"),
                "SELECT * FROM c WHERE c.PersonGUID = \"" + personGUID + "\"",
                new FeedOptions { EnableCrossPartitionQuery = true }).ToList();

        targetLocLat = scheduleList[0].targetLocLat;
        targetLocLong = scheduleList[0].targetLocLong;

        dynamic route = JObject.Parse(getRoute(height, currentLocLat, currentLocLong, targetLocLat, targetLocLong, hc));
        await sendRoute(truck, route.directions.ToString(), route.time.ToString());
        log.Info("Method: requestPhotoRoute,Sent: "+ route.directions.ToString());
    }
}

public static Stream getStream(string fileURL)
{
    CloudStorageAccount storageAccount = CloudStorageAccount.Parse(BlobConnectionString);
    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
    ICloudBlob imageFile = blobClient.GetBlobReferenceFromServer(new Uri(fileURL));
    Stream fs = new MemoryStream();
    imageFile.DownloadToStream(fs);
    fs.Position = 0;
    Console.WriteLine("returned stream for "+fileURL);
    return fs;
}

public static async Task<bool> verifyPerson (string pictureURL)
{
    StringContent body = new StringContent("{\"url\":\"" + pictureURL + "\"}", System.Text.Encoding.UTF8, "application/json");

    HttpClient httpClient = new HttpClient();
    httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", FaceKey);
    HttpResponseMessage response = await httpClient.PostAsync(CognitiveFaceURL, body);

    string faceResponse = await response.Content.ReadAsStringAsync();
    // normalizing the JSON for JObject.Parse()
    if (faceResponse.StartsWith("[")) { faceResponse = faceResponse.Substring(1); }
    if (faceResponse.EndsWith("]")) { faceResponse = faceResponse.Substring(0, faceResponse.Length - 1); }

    dynamic faceInfo = JObject.Parse(faceResponse);
    string faceID = faceInfo.faceId.Value;
    if (faceID != null)
    {
        bool match = await personMatch(faceID, targetGroup, .75);
        personGUID = faceID;
        Console.WriteLine("verifyPerson="+match);
        return match;
    } else
    {
        Console.WriteLine("verifyPerson=Null faceId");
        return false;
    }
}

public static async Task<bool> personMatch(string faceID, string targetGroup, double probability)
{
    string stringIdentify = "{\"personGroupId\":\"" + targetGroup + "\",\"faceIds\":[\"" + faceID + "\"],\"maxNumOfCandidatesReturned\":1,\"confidenceThreshold\":0.5}";
    StringContent identifyBody = new StringContent(stringIdentify, System.Text.Encoding.UTF8, "application/json");
    HttpClient httpClient = new HttpClient();
    httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", FaceKey);

    HttpResponseMessage response = await httpClient.PostAsync(CognitiveIdentifyURL, identifyBody);

    string identifyInfo = await response.Content.ReadAsStringAsync();
    if (identifyInfo.StartsWith("[")) { identifyInfo = identifyInfo.Substring(1); }
    if (identifyInfo.EndsWith("]")) { identifyInfo = identifyInfo.Substring(0, identifyInfo.Length - 1); }

    dynamic personMatch = JObject.Parse(identifyInfo);

    if (personMatch.candidates.Count == 0 || personMatch.candidates[0].confidence.Value < probability )
    {
        Console.WriteLine("PersonMatch=False");
        return false;
    }
    else
    {
        Console.WriteLine("PersonMatch=True");
        return true;
    }
}

public static string convertTime(string time)
{
    string[] separators = { "S", "M", "H", "D", "PT" };
    string[] timevar = time.Split(separators, StringSplitOptions.RemoveEmptyEntries);
    Array.Reverse(timevar);

    if (timevar.Length == 1)
    {
        return timevar[0].ToString() + " seconds";
    }
    else if (timevar.Length == 2)
    {
        return timevar[1].ToString() + " minutes " + timevar[0].ToString() + " seconds";
    }
    else if (timevar.Length == 3)
    {
        return timevar[2].ToString() + " hours " + timevar[1].ToString() + " minutes " + timevar[0].ToString() + " seconds";
    }
    else
    {
        return time;
    }
}

public static string getRoute(int height, double currentLocLat, double currentLocLong, double targetLocLat, double targetLocLong, string hc)
{
    string URL = "https://api.labs.cognitive.microsoft.com/Routes/Truck?" +
                "waypoint.0=" + currentLocLat + "," + currentLocLong + "&" +
                "waypoint.1=" + targetLocLat + "," + targetLocLong + "&" +
                "vehicleHeight=" + height + "&" +
                "vehicleHazardousMaterials=" + hc + "&" +
                "vehicleAxles=5";

    HttpClient httpClient = new HttpClient();
    httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", JohannesburgKey);

    dynamic route = JObject.Parse(httpClient.GetStringAsync(URL).Result.ToString());
    string routeTime = convertTime(route.Routes[0].Legs[0].LegSummary.TrafficTime.Value);

    string directions = null;
    var routeText = route.Routes[0].Legs[0].Itinerary.Items;

    foreach (var step in routeText)
    {
        directions = directions + step.Text.Text.Value + " for " + convertTime(step.ItemSummary.Time.Value) + Environment.NewLine;
    }

    dynamic returnRoute = new JObject();
    returnRoute.directions = directions;
    returnRoute.time = routeTime;

    httpClient.Dispose();

    return JsonConvert.SerializeObject(returnRoute);
}

public static string getCoordinates(string address)
{
    // info here: https://msdn.microsoft.com/en-us/library/ff701714.aspx

    string URL = "https://dev.virtualearth.net/REST/v1/Locations/" + Uri.EscapeDataString(address) + "?key=" + BingMAPSKey;
    HttpClient httpClient = new HttpClient();

    dynamic coordinates = JObject.Parse(httpClient.GetStringAsync(URL).Result.ToString());
    dynamic returnCoordinates = new JObject();
    returnCoordinates.targetLocLat = coordinates.resourceSets[0].resources[0].point.coordinates[0];
    returnCoordinates.targetLocLong = coordinates.resourceSets[0].resources[0].point.coordinates[1];

    httpClient.Dispose();

    return JsonConvert.SerializeObject(returnCoordinates);
}

public static async Task<string> getAddressFromVoice(string voiceFileURL)
{
    // just using REST vs the SDK for a simple demo

    // we need a Bearer token
    HttpClient httpclient = new HttpClient();
    httpclient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", SpeechKey);
    UriBuilder uriBuilder = new UriBuilder(FetchTokenUri);
    uriBuilder.Path += "/issueToken";
    String responseString;

    var request1 = await httpclient.PostAsync(uriBuilder.Uri.AbsoluteUri, null);
    var token = await request1.Content.ReadAsStringAsync();

    httpclient.Dispose();

    // now we make a request to the Speech to Text Service
    HttpWebRequest request2 = null;
    request2 = (HttpWebRequest)HttpWebRequest.Create(SpeechURI);
    request2.SendChunked = true;
    request2.Accept = @"application/json;text/xml";
    request2.Method = "POST";
    request2.ProtocolVersion = HttpVersion.Version11;
    request2.Host = @"speech.platform.bing.com";
    request2.ContentType = @"audio/wav; codec=""audio/pcm""; samplerate=16000";
    request2.Headers["Authorization"] = "Bearer " + token;

    // open the file and read to a stream with 1024 chunks and wrote to the request2 object
    //using (FileStream fs = new FileStream(voiceFile, FileMode.Open, FileAccess.Read))
    using (Stream fs = getStream(voiceFileURL))
    {
        byte[] buffer = null;
        int bytesRead = 0;
        using (Stream requestStream = request2.GetRequestStream())
        {
            buffer = new Byte[checked((uint)Math.Min(1024, (int)fs.Length))];
            while ((bytesRead = fs.Read(buffer, 0, buffer.Length)) != 0)
            {
                requestStream.Write(buffer, 0, bytesRead);
            }
            requestStream.Flush();
        }
    }

    // get our response
    using (WebResponse response = request2.GetResponse())
    {
        using (StreamReader sr = new StreamReader(response.GetResponseStream()))
        {
            responseString = sr.ReadToEnd();
        }
    }

    // put the response in a JSON object
    dynamic speech = JObject.Parse(responseString);
    return JsonConvert.SerializeObject(speech.DisplayText.Value);
}

public static async Task sendRoute(string truck, string route, string travelTime)
{
    dynamic IoTMessage = new JObject();
    IoTMessage.messageType = "responseRoute";
    IoTMessage.travelTime = travelTime;
    IoTMessage.route = route;

    ServiceClient serviceClient = ServiceClient.CreateFromConnectionString(IoTConnectionString);
    Message sendMessage = new Message(Encoding.ASCII.GetBytes(JsonConvert.SerializeObject(IoTMessage)));
    await serviceClient.SendAsync(truck, sendMessage);
}

public class Schedule
{
    public string id { get; set; }
    public string PersonGUID { get; set; }
    public float targetLocLat { get; set; }
    public float targetLocLong { get; set; }
}
using Microsoft.Azure.Devices;
using System.Net;
using System.Threading;

const string IoTConnectionString = "HostName=kevinsayIoT.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=cHCZREMOVEDBsPc=";
const string device = "TivoControl";
static ServiceClient serviceClient;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    dynamic data = await req.Content.ReadAsAsync<object>();
    log.Info($"Content={data}");

    // Set name to query string or body data
    string intentName = data.request.intent.name;
    log.Info($"intentName={intentName}");           
    switch (intentName)
    {
        case "Pause":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE PAUSE", log)
                    },
                    shouldEndSession = true
                }
            });
        case "Play":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE PLAY", log)
                    },
                    shouldEndSession = true
                }
            });
        case "ShowTheGuide":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("TELEPORT GUIDE", log)
                    },
                    shouldEndSession = true
                }
            });
        case "GoToLiveTV":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("TELEPORT LIVETV", log)
                    },
                    shouldEndSession = true
                }
            });
        case "ShowNowPlaying":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("TELEPORT NOWPLAYING", log)
                    },
                    shouldEndSession = true
                }
            });
        case "ShowTivoMenu":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("TELEPORT TIVO", log)
                    },
                    shouldEndSession = true
                }
            });    
        case "ShowInfo":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE INFO", log)
                    },
                    shouldEndSession = true
                }
            });    
        case "Exit":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE EXIT", log)
                    },
                    shouldEndSession = true
                }
            });    
        case "Down":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE DOWN", log)
                    },
                    shouldEndSession = false
                }
            });    
        case "UP":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE UP", log)
                    },
                    shouldEndSession = false
                }
            });    
        case "Right":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE RIGHT", log)
                    },
                    shouldEndSession = false
                }
            });    
        case "Select":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE SELECT", log)
                    },
                    shouldEndSession = true
                }
            });    
        case "Record":
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("IRCODE Record", log)
                    },
                    shouldEndSession = true
                }
            });    
        case "ChangeChannel":
            string channel = data.request.intent.slots.Channel.value;

            switch (channel.ToLower()){
                case "fox":{
                    channel = "4.1";
                    break;
                };
                case "nbc":{
                    channel = "5.1";
                    break;
                };
                case "abc":{
                    channel = "8.1";
                    break;
                };
                case "cbs":{
                    channel = "11.1";
                    break;
                };
                case "pbs":{
                    channel = "13.1";
                    break;
                };
                case "cw":{
                    channel = "33.1";
                    break;
                };
            }

            callMethod("TELEPORT LIVETV", log);
            
            return req.CreateResponse(HttpStatusCode.OK, new
            {
                version = "1.1",
                sessionAttributes = new { },
                response = new
                {
                    outputSpeech = new
                    {
                        type = "PlainText",
                        text = callMethod("FORCECH " + channel.Replace(".", " "), log)
                    },
                    shouldEndSession = false
                }
            });    
                          
    }
    return null;
}

static string callMethod(string commandToSend, TraceWriter log)
{
    serviceClient = ServiceClient.CreateFromConnectionString(IoTConnectionString);

    // create a method with response 5 seconds and connection 10 seconds
    CloudToDeviceMethod C2Dmethod = new CloudToDeviceMethod("sendCommand", new TimeSpan(0,0,10), new TimeSpan(0,0,10));
    C2Dmethod.SetPayloadJson("{\"command\":\"" + commandToSend + "\"}");

    // call the method
    CloudToDeviceMethodResult myresult = serviceClient.InvokeDeviceMethodAsync(device, C2Dmethod).Result;

    log.Info(myresult.ToString());

    string resultJson = myresult.GetPayloadAsJson();
    log.Info("response: " + resultJson);
    return null ;
}
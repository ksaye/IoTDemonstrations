#r "Newtonsoft.Json"
// added a project.json in the directory with the setting:  "Microsoft.Azure.Devices.Client": "1.1.4", "Microsoft.Azure.Devices": "1.1.4",         

using System;
//using Microsoft.Azure.Devices.Client;
using Microsoft.Azure.Devices;
using System.Text;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

const string iotHubString = "HostName=AustinIoT.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=KeC1MREMOVEDiI1YQ8=";
const string AMLapiKey = "LaSaREMVOVEDxkTQ==";
const string AMLURL = "https://ussouthcentral.services.azureml.net/subscriptions/dc6f7CHANGEME6722/services/0515eb3CHANGEME11/execute?api-version=2.0&format=swagger";
const float AMLaccuracy = (float).75;

public static async Task Run(string myEventHubMessage, TraceWriter log)
{
    log.Info($"Received message: {myEventHubMessage}");
    IoTMessageReceive iotMessage = JsonConvert.DeserializeObject<IoTMessageReceive>(myEventHubMessage);
    if (iotMessage.doorStatus == 1) {
        // call the AML to calculate the probability
        HttpClient client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AMLapiKey);
        client.BaseAddress = new Uri(AMLURL);

        var scoreRequest = new
            {
                Inputs = new Dictionary<string, List<Dictionary<string, string>>>() {
                        {
                            "input1",
                            new List<Dictionary<string, string>>(){new Dictionary<string, string>(){
                                            {  "minute", Convert.ToString(iotMessage.minute)          },
                                            {  "hour", Convert.ToString(iotMessage.hour)              },
                                            {  "day", iotMessage.day                                  },
                                            {  "month", iotMessage.month                              },
                                            {  "year", Convert.ToString(iotMessage.year)              },
                                            {  "devicename", iotMessage.deviceName                    },
                                            {  "macaddress", iotMessage.macaddress                    },
                                            {  "doorstatus", Convert.ToString(iotMessage.doorStatus)  },
                                            {  "uptimems", Convert.ToString(iotMessage.UpTimeMS)      },
                                }
                            }
                        },
                    },
                GlobalParameters = new Dictionary<string, string>()    {}
            };

        HttpResponseMessage response = await client.PostAsJsonAsync("", scoreRequest);
        if (response.IsSuccessStatusCode) {
                string result = await response.Content.ReadAsStringAsync();
                AMLMessage AMLresult = JsonConvert.DeserializeObject<AMLMessage>(result);
                if (AMLresult.Results.output1[0].scoredProbabilities < AMLaccuracy) {
                    // we have less than AMLaccuracy% accuracy, sending a message
                    string IoTHubConnectionString = iotHubString;
                    IoTMessageSend messageSend = new IoTMessageSend();
                    messageSend.scoredProbabilities = AMLresult.Results.output1[0].scoredProbabilities;
                    messageSend.action = "takePicture()";
                    messageSend.deviceName = iotMessage.deviceName;
                    messageSend.macaddress = iotMessage.macaddress;
                    ServiceClient serviceClient = ServiceClient.CreateFromConnectionString(IoTHubConnectionString);
                    Message sendMessage = new Message(Encoding.ASCII.GetBytes(JsonConvert.SerializeObject(messageSend)));
                    log.Info($"Sent message {JsonConvert.SerializeObject(messageSend)}");
                    await serviceClient.SendAsync("Camera", sendMessage);
                }
        } else {
            log.Info($"Error: {response.StatusCode}");
        }

    }
}


public class AMLMessage {
    public result Results { get; set; }
    public class result {
        public List<AMLoutput> output1 { get; set; }
    }
}

public class AMLoutput {
    public string macaddress { get; set; }
    public string devicename { get; set; }

    [JsonProperty(PropertyName = "Scored Lables")]
    public int scoredLables { get; set; }
    [JsonProperty(PropertyName = "Scored Probabilities")]
    public float scoredProbabilities { get; set; }
}

class IoTMessageReceive {
    public int minute { get; set; }
    public int hour { get; set; }
    public string day { get; set; }
    public string month { get; set; }
    public int year { get; set; }
    public string deviceName { get; set; }
    public string macaddress { get; set; }
    public int doorStatus { get; set; }
    public int UpTimeMS { get; set; }
}

class IoTMessageSend {
    public string action { get; set;}
    public float scoredProbabilities { get; set;}
    public string deviceName { get; set; }
    public string macaddress { get; set; }
}


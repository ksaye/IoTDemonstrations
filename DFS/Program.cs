namespace RESTClient
{
    using System;
    using System.IO;
    using System.Runtime.InteropServices;
    using System.Runtime.Loader;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Net;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Devices.Client;
    using Microsoft.Azure.Devices.Shared;
    using Microsoft.Azure.Devices.Client.Transport.Mqtt;
    using Newtonsoft.Json.Linq;

    class Program
    {
        static ModuleClient ioTHubModuleClient;
        static string RESTTargetURL = null;    // Example "http://192.168.15.150:8181/"
        static string RESTTargetLocation = "Dallas";
        static int POLLINGInterval = 15;
        static WebRequest request;

        static void Main(string[] args)
        {
            Init().Wait();

            while (true) {
                Thread.Sleep(1000 * POLLINGInterval);
                string messageToSend = getRESTResponse();
                Console.WriteLine("Sending: " + messageToSend.ToString());
                Message iotMessage = new Message(Encoding.UTF8.GetBytes(messageToSend.ToString()));
                ioTHubModuleClient.SendEventAsync("output1", iotMessage);
            }

        }

        /// <summary>
        /// Initializes the ModuleClient and sets up the callback to receive
        /// messages containing temperature information
        /// </summary>
        static async Task Init()
        {
            MqttTransportSettings mqttSetting = new MqttTransportSettings(TransportType.Mqtt_Tcp_Only);
            ITransportSettings[] settings = { mqttSetting };

            // Open a connection to the Edge runtime
            ioTHubModuleClient = await ModuleClient.CreateFromEnvironmentAsync(settings);
            await ioTHubModuleClient.OpenAsync();

            // register our default Method callback
            await ioTHubModuleClient.SetMethodDefaultHandlerAsync(MethodCallback, null);

            // register our TWIN callback
            await ioTHubModuleClient.SetDesiredPropertyUpdateCallbackAsync(OnDesiredPropertiesUpdated, 
                ioTHubModuleClient);
        }

        static string getRESTResponse() {
            if (RESTTargetURL != null) {
                    request = WebRequest.Create(RESTTargetURL + "weather?location=" + RESTTargetLocation);
                    try {
                        HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                        StreamReader reader = new StreamReader(response.GetResponseStream());
                        dynamic RESTResponse = JObject.Parse(reader.ReadToEnd());
                        JObject messageToSend = new JObject();
                        messageToSend["location"] = RESTResponse.name;
                        messageToSend["temperature"] = RESTResponse.main.temp;
                        return messageToSend.ToString();
                    } catch (Exception e) {
                        Console.WriteLine("ERROR: " + e.ToString());
                    } 
                    return "{}";
                } else {
                    Console.WriteLine("ERROR: TWIN RESTTargetURL not set.");
                    return "{}";
                }
        }

        static async Task OnDesiredPropertiesUpdated(TwinCollection desiredPropertiesPatch, object userContext)
        {
            if (desiredPropertiesPatch.Contains("RESTTargetURL"))
            {
                RESTTargetURL = (string)desiredPropertiesPatch["RESTTargetURL"];
            }

            if (desiredPropertiesPatch.Contains("RESTTargetLocation"))
            {
                RESTTargetLocation = (string)desiredPropertiesPatch["RESTTargetLocation"];
            }

            if (desiredPropertiesPatch.Contains("POLLINGInterval"))
            {
                POLLINGInterval = (int)desiredPropertiesPatch["POLLINGInterval"];
            }

            JObject twinResponse = new JObject();
            twinResponse["RESTTargetURL"] = RESTTargetURL;
            twinResponse["RESTTargetLocation"] = RESTTargetLocation;
            twinResponse["POLLINGInterval"] = POLLINGInterval;
            Console.WriteLine("Sending TWIN: " + twinResponse.ToString());
            TwinCollection patch = new TwinCollection(twinResponse.ToString());
            await ioTHubModuleClient.UpdateReportedPropertiesAsync(patch); // report back reported property.
        }

        static Task<MethodResponse> MethodCallback(MethodRequest methodRequest, object userContext)
        {
            MethodResponse methodResponse;
            Console.WriteLine("Received direct method call named" + methodRequest.Name);
            if (methodRequest.Name == "getWeather") {
                string messageToSend = getRESTResponse();
                methodResponse = new MethodResponse(Encoding.UTF8.GetBytes(messageToSend.ToString()),
                    (int)HttpStatusCode.OK);
            } else {
                methodResponse = new MethodResponse((int)HttpStatusCode.NotFound);
            }

            return Task.FromResult(methodResponse);
        }
    }
}

namespace modbusclient
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Net;
    using System.Runtime.InteropServices;
    using System.Runtime.Loader;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Devices.Client;
    using Microsoft.Azure.Devices.Client.Transport.Mqtt;
    using Microsoft.Azure.Devices.Shared;
    using AMWD.Modbus.Tcp.Client;
    using Newtonsoft.Json.Linq; 

    class Program
    {
        static int counter;
        static ModuleClient ioTHubModuleClient;
        static ModbusClient modbusClient;
        static int POLLINGfrequency = 60;
        static string POLLINGHost = "widget";  // this will fail

        static void Main(string[] args)
        {
            Init().Wait();  // initialize the module

            Run().Wait();   // do our real work
        }
        static async Task Run()
        {
            while (true) {
                Message IoTMessage;
                dynamic messageToSend = new JObject();
                try 
                {
                    Thread.Sleep(1000 * POLLINGfrequency);
                    modbusClient = new ModbusClient(POLLINGHost, 502);
                    await modbusClient.Connect();
                    counter += 1;
                    messageToSend["messagecounter"] = counter;
                    messageToSend["POLLINGHost"] = POLLINGHost;
                    messageToSend["dateTime"] = DateTime.Now.ToString();
                    messageToSend["Las Vegas"] = getRegister(0).Result;
                    messageToSend["Stockholm"] = getRegister(1).Result;
                    messageToSend["Wadi Halfa"] = getRegister(2).Result;
                    messageToSend["MSFT Stock"] = getRegister(3).Result;
                    messageToSend["HPE Stock"] = getRegister(4).Result;
                    await modbusClient.Disconnect();
                } catch (Exception e) {
                    messageToSend["Error"] = e.Message;
                    if (modbusClient.IsConnected){
                        modbusClient.Disconnect().Wait();
                    }
                }
                Console.WriteLine("Sending message: " + messageToSend.ToString());
                IoTMessage = new Message(Encoding.UTF8.GetBytes(messageToSend.ToString()));
                await ioTHubModuleClient.SendEventAsync("output1", IoTMessage);
            }
        }

        static async Task<int>getRegister(int counter)
        {
            List<AMWD.Modbus.Common.Structures.Register> mydata = await modbusClient.ReadHoldingRegisters(0, (ushort)counter, 1);
            return (int)mydata[0].Value;
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

            // register our TWIN callback
            await ioTHubModuleClient.SetDesiredPropertyUpdateCallbackAsync(OnDesiredPropertiesUpdate, 
                ioTHubModuleClient);

            // get our first TWIN update
            var moduleTwin = await ioTHubModuleClient.GetTwinAsync();
            await OnDesiredPropertiesUpdate(moduleTwin.Properties.Desired, ioTHubModuleClient);
            
            // register our callback
            await ioTHubModuleClient.SetMethodDefaultHandlerAsync(MethodCallback, null);

            Console.WriteLine("IoT Hub module client initialized.");
        }

        static Task OnDesiredPropertiesUpdate(TwinCollection desiredProperties, object userContext)
        {
            if (desiredProperties.Contains("POLLINGfrequency"))
            {
                POLLINGfrequency = (int)desiredProperties["POLLINGfrequency"];
            }

            if (desiredProperties.Contains("POLLINGHost"))
            {
                POLLINGHost = (string)desiredProperties["POLLINGHost"];
            }

            // also reporting our Reported properties
            JObject twinResponse = new JObject();
            twinResponse["POLLINGfrequency"] = POLLINGfrequency;
            twinResponse["POLLINGHost"] = POLLINGHost;
            Console.WriteLine("Sending TWIN: " + twinResponse.ToString());
            TwinCollection patch = new TwinCollection(twinResponse.ToString());
            ioTHubModuleClient.UpdateReportedPropertiesAsync(patch);
            
            return Task.CompletedTask;
        }

        static Task<MethodResponse> MethodCallback(MethodRequest methodRequest, object userContext)
        {
            MethodResponse methodResponse;
            Console.WriteLine("Received direct method call named" + methodRequest.Name);
            if (methodRequest.Name == "get") {
                dynamic messageToSend = new JObject();
                messageToSend["POLLINGHost"] = POLLINGHost;
                messageToSend["Las Vegas"] = getRegister(0).Result;
                messageToSend["Stockholm"] = getRegister(1).Result;
                messageToSend["Wadi Halfa"] = getRegister(2).Result;
                messageToSend["MSFT Stock"] = getRegister(3).Result;
                messageToSend["HPE Stock"] = getRegister(4).Result;
                methodResponse = new MethodResponse(Encoding.UTF8.GetBytes(messageToSend.ToString()),
                    (int)HttpStatusCode.OK);
            } else {
                methodResponse = new MethodResponse((int)HttpStatusCode.NotFound);
            }
            return Task.FromResult(methodResponse);
        }
    }
}

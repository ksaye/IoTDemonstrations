namespace SampleModule
{
    using System;
    using System.IO;
    using System.Runtime.InteropServices;
    using System.Runtime.Loader;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Devices.Client;
    using Microsoft.Azure.Devices.Client.Transport.Mqtt;
    // following https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-csharp-module#create-an-iot-edge-module-project
    using System.Collections.Generic;       // For KeyValuePair<>
    using Microsoft.Azure.Devices.Shared;   // For TwinCollection
    using Newtonsoft.Json;                  // For JsonConvert
    using Newtonsoft.Json.Linq;             
    using System.Net.Http;

    // Kevin
    using System.Timers;

    class Program
    {
        static int counter;

        // Kevin
        static System.Timers.Timer moduleTimer = new System.Timers.Timer();
        static int timerInterval = 60; // default value is 60 seconds
        static string targetMachines = null; // simple value "machinename:URL:parser;machinename2:URL2:parser"
        static ModuleClient ioTHubModuleClient; // at global level

        static void Main(string[] args)
        {
            Init().Wait();

            // Wait until the app unloads or is cancelled
            var cts = new CancellationTokenSource();
            AssemblyLoadContext.Default.Unloading += (ctx) => cts.Cancel();
            Console.CancelKeyPress += (sender, cpe) => cts.Cancel();
            WhenCancelled(cts.Token).Wait();
        }

        /// <summary>
        /// Handles cleanup operations when app is cancelled or unloads
        /// </summary>
        public static Task WhenCancelled(CancellationToken cancellationToken)
        {
            var tcs = new TaskCompletionSource<bool>();
            cancellationToken.Register(s => ((TaskCompletionSource<bool>)s).SetResult(true), tcs);
            return tcs.Task;
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
            Console.WriteLine("IoT Hub module client initialized.");

            // Kevin
            var moduleTwin = await ioTHubModuleClient.GetTwinAsync();
            await OnDesiredPropertiesUpdate(moduleTwin.Properties.Desired, ioTHubModuleClient);

            await ioTHubModuleClient.SetDesiredPropertyUpdateCallbackAsync(OnDesiredPropertiesUpdate, null);
            await ioTHubModuleClient.SetMethodDefaultHandlerAsync(methodHandler, null);
            
            Console.Write("starting the Timer");
            moduleTimer.Interval = timerInterval*1000;
            moduleTimer.Elapsed += OnTimedEvent;
            moduleTimer.AutoReset = true;
            moduleTimer.Enabled = true;
            moduleTimer.Start();

            // Register callback to be called when a message is received by the module
            Console.Write("setting the callback");
            await ioTHubModuleClient.SetInputMessageHandlerAsync("input1", PipeMessage, ioTHubModuleClient);
        }

        private static Task<MethodResponse> methodHandler(MethodRequest methodRequest, object userContext)
        {
            Console.WriteLine(methodRequest.Name + " called with payload "+ methodRequest.DataAsJson);

            // Do something amazing with the device update

            string result = "{\"status\":\"Success\"}";
            var retValue = new MethodResponse(Encoding.UTF8.GetBytes(result), 200);
            return Task.FromResult(retValue);
        }

        static Task OnDesiredPropertiesUpdate(TwinCollection desiredProperties, object userContext)
        {
            try
            {
                Console.WriteLine("Desired property change:");
                Console.WriteLine(JsonConvert.SerializeObject(desiredProperties));

                if (desiredProperties.Contains("timerInterval") && desiredProperties["timerInterval"]!=null)
                    timerInterval = (int)desiredProperties["timerInterval"];
                    Console.WriteLine(" set timerInterval=" + timerInterval);
                    moduleTimer.Interval = timerInterval*1000;
                if (desiredProperties.Contains("targetMachines") && desiredProperties["targetMachines"]!=null)
                    targetMachines = desiredProperties["targetMachines"];
                    Console.WriteLine(" set targetMachines=" + targetMachines);
            }
            catch (AggregateException ex)
            {
                foreach (Exception exception in ex.InnerExceptions)
                {
                    Console.WriteLine();
                    Console.WriteLine("Error when receiving desired property: {0}", exception);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine();
                Console.WriteLine("Error when receiving desired property: {0}", ex.Message);
            }
            return Task.CompletedTask;
        }

        // Kevin
        static void OnTimedEvent(Object source, ElapsedEventArgs e)
        {
            // if we have machines to target work on
            Console.WriteLine("onTimedEvent()");
            if (targetMachines != null) {
                // simple value "machinename:URL:parser;machinename2:URL2:parser"
                string[] machines = targetMachines.Split(";");
                foreach (string machine in machines)
                {
                    Console.WriteLine("processing: " + machine);
                    string[] machinedata = machine.Split(":");
                    string machineName = machinedata[0];
                    string machineURL = machinedata[1];
                    string machineParser = machinedata[2];

                    string returnedData = getData(machineName, machineURL, machineParser).Result.ToString();                   
                    Console.WriteLine("response was: " + returnedData);

                    dynamic message = new JObject();
                            message.machineName = machineName;
                            message.machineURL = machineURL;
                            message.machineParser = machineParser;
                            message.data = returnedData;
                            message.processed = DateTime.UtcNow.ToString();

                    Message ioTMessage = new Message(Encoding.UTF8.GetBytes(message.ToString()));
                    ioTMessage.Properties.Add("processedUTC", DateTime.UtcNow.ToString());
                    ioTHubModuleClient.SendEventAsync("output1", ioTMessage).Wait();
                    Console.WriteLine("sent message: " + message.ToString());
                }
                Console.WriteLine("The Elapsed event was raised at {0:HH:mm:ss.fff}", e.SignalTime);
            } else {
                Console.WriteLine("Error: set the \"targetMachines\" TWIN property");
            }

        }
        static async Task<string> getData(string machineName, string machineURL, string machineParser)
        {
            Console.WriteLine("getData()");
            if (machineParser == "parser") {
                HttpClient HttpClient = new HttpClient();
                HttpResponseMessage response = await HttpClient.GetAsync("http://"+ machineURL + "/");
                HttpContent content = response.Content;
                string realContent = await content.ReadAsStringAsync();
                Console.WriteLine("returned data is: " + realContent);
                realContent = realContent.Split(":")[1];
                return realContent;
            } else {
                Console.WriteLine("no returned data");
                return "Error unknown parser: " + machineParser;
            }
        }

         static async Task<MessageResponse> PipeMessage(Message message, object userContext)
        {
            Console.WriteLine("this module does not accept routed messages");

            return MessageResponse.Completed;
        }

    }
}

namespace csharpclient
{
    using System;
    using System.IO;
    using System.Runtime.InteropServices;
    using System.Runtime.Loader;
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Devices.Client;
    using Microsoft.Azure.Devices.Client.Transport.Mqtt;
    using Newtonsoft.Json.Linq;

    class Program
    {
        static int counter;
        static ModuleClient ioTHubModuleClient;

        static void Main(string[] args)
        {
            Init().Wait();

            processImages();

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
        }
        static void processImages(){
            Console.WriteLine("processImages()");
            WebClient webClient = new WebClient();
            string filename = @"c:\image.jpg";
            while (true)
            {
                try
                {
                    // get the file
                    webClient.DownloadFile("http://url", filename);
                    // send the file to fpgaproxy
                    byte[] responseArray = webClient.UploadFile("http://fpgaproxy", filename);
                    // get the response json
                    string response = System.Text.Encoding.ASCII.GetString(responseArray);
                    Console.WriteLine(response);

                    JObject jsonResponse = JObject.Parse(response);                    
                    if (jsonResponse.ContainsKey("boxes")){
                        Message iotMessage = new Message(System.Text.Encoding.UTF8.GetBytes(jsonResponse.ToString()));
                        ioTHubModuleClient.SendEventAsync(iotMessage);
                    }
                }
                catch (Exception e) {
                    Console.WriteLine("{0} Exception caught.", e);
                }
                // sleep 15 seconds
                System.Threading.Thread.Sleep(5 * 1000);
            }
        }
    }
}

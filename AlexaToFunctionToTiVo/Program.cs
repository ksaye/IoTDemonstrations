using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;
using Newtonsoft.Json;
using System.IO;
using System.Threading;

namespace TivoControlService
{
    class Program
    {
        static DeviceClient deviceClient;
        static string tivo;
        static string connectionString;
        static string logfile;

        static void LoadJson()
        {
            using (StreamReader r = new StreamReader("configuration.json"))
            {
                string json = r.ReadToEnd();
                dynamic config =  JsonConvert.DeserializeObject(json);
                tivo = config.tivo;
                connectionString = config.connectionString;
                logfile = config.logFile;
            }
        }

        static void connectToIoTHub()
        {
            deviceClient = DeviceClient.CreateFromConnectionString(connectionString, TransportType.Amqp);
            deviceClient.OpenAsync().Wait();

            deviceClient.SetMethodHandlerAsync("sendCommand", sendCommand, null).Wait();

            Console.WriteLine("Connected to: " + connectionString);
            Log("Connected to: " + connectionString);
        }

        private static Task<MethodResponse> sendCommand(MethodRequest methodRequest, object userContext)
        {
            Console.WriteLine("Method:" + methodRequest.Name + " called with payload:" + methodRequest.DataAsJson);
            Log("Method:" + methodRequest.Name + " called with payload:" + methodRequest.DataAsJson);
            string result = "{\"status\":\"Success\"}";
            message message = JsonConvert.DeserializeObject<message>(methodRequest.DataAsJson);
            sendData(tivo, message.command);
            MethodResponse retValue = new MethodResponse(Encoding.UTF8.GetBytes(result), 200);
            return Task.FromResult(retValue);
        }

        static void sendData(string hostname, string command)
        {
            try { 
                IPHostEntry address = Dns.GetHostEntry(hostname);
                IPEndPoint ipe = new IPEndPoint(address.AddressList[0].Address, 31339);
                Socket socket = new Socket(ipe.AddressFamily, SocketType.Stream, ProtocolType.Tcp);

                socket.Connect(ipe);

                if (socket.Connected)
                {
                    Byte[] bytesSent = Encoding.ASCII.GetBytes(command + "\r");
                    socket.Send(bytesSent, bytesSent.Length, SocketFlags.None);
                } else
                {
                    Console.WriteLine("Error: Not connected.");
                    Log("Error: Not connected.");
                }
                Console.WriteLine("Sent: " + command);
                Log("Sent: " + command);

                socket.Disconnect(true);

            } catch (Exception er)
            {
                Console.WriteLine("Error: " + er.Message);
                Log("Error: " + er.Message);
            }
        }

        static void Main(string[] args)
        {
            LoadJson();
            
            Log("Starting");
            // all commands are here: https://www.tivo.com/assets/images/abouttivo/resources/downloads/brochures/TiVo_TCP_Network_Remote_Control_Protocol.pdf
            //sendData("TIVO-6520001805FC650", "PAUSE");
            connectToIoTHub();

            receiveMessage();

            Console.WriteLine("Press any key to exit");
            while (true)
            {
                Thread.Sleep(1000 * 60);
            }
            Log("Ending");
        }

        static async void receiveMessage()
        {
            while (true)
            {
                try
                {
                    Message IoTMessage = await deviceClient.ReceiveAsync(new TimeSpan(0, 0, 0, 30));
                    if (IoTMessage != null)
                    {
                        Console.WriteLine(Encoding.ASCII.GetString(IoTMessage.GetBytes()));
                        foreach (var property in IoTMessage.Properties)
                        {
                            Console.WriteLine(" " + property.Key.ToString() + "=" + property.Value.ToString());
                        }

                        await deviceClient.CompleteAsync(IoTMessage);
                    }
                }
                catch (Exception er)
                {
                    if (er.Message != "Cannot access a disposed object.\r\nObject name: 'The object has been closed and cannot be reopened.'.")
                    {
                        Console.WriteLine("receiveMessage Error: " + er.Message.ToString());
                    }
                }
            }
        }

        static void Log(string data)
        {
            using (System.IO.StreamWriter file =
                new System.IO.StreamWriter(logfile, true))
            {
                file.WriteLine(DateTime.Now + "==>" + data + "\r");
            }
        }
    }
    public class message
    {
        public string command;
    }
}

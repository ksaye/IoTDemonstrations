using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;
using Newtonsoft.Json;
using System.IO;
using System.Threading;
using System.Net.Http;
using System.Timers;
using System.Collections.Generic;

namespace OSMCControl
{

    /*  Control the OSMC from Alexa
     *  Intent is "Home Media"
     *  commands to include:
     *      pause
     *      resume
     *      skip song
     *      louder (volume goes up 10%)
     *      softer (volume goes down 10%)
     *      get channels (calls the web service that retuns them all including a sequence number)
     *      change to channel #
     *      what song is this
     */

    class Program
    {
        static DeviceClient deviceClient;
        static string osmcHost;
        static string connectionString;
        static string logfile;
        static int volume;

        static async Task updateVolumeAsync()
        {
            try
            {
                HttpClient client = new HttpClient();
                string postData = "{\"jsonrpc\": \"2.0\", \"method\": \"Application.GetProperties\", \"params\": {\"properties\": [\"volume\"] }, \"id\": 1}";
                StringContent body = new StringContent(postData, System.Text.Encoding.UTF8, "application/json");
                HttpResponseMessage response = await client.PostAsync($"{osmcHost}/jsonrpc?awx", body);
                System.IO.Stream streamResponse = await response.Content.ReadAsStreamAsync();
                StreamReader streamReader = new StreamReader(streamResponse);
                volume localVolume = JsonConvert.DeserializeObject<volume>(streamReader.ReadToEnd());

                if (volume != localVolume.result.volume)
                {
                    volume = localVolume.result.volume;
                    Console.WriteLine("volume updated, volume is " + Convert.ToString(volume));
                }

                streamResponse.Close();
                streamReader.Close();
                client.Dispose();
                response.Dispose();
            }
            catch (Exception) { }
        }

        static void volumeUp()
        {
            updateVolumeAsync().Wait();

            setVolume(Convert.ToInt16(volume * 1.25));
        }

        static void volumeDown()
        {
            updateVolumeAsync().Wait();

            setVolume(Convert.ToInt16(volume * .75));
        }

        static void setVolume(int volume)
        {
            string myJSON = "{\"jsonrpc\": \"2.0\", \"method\": \"Application.SetVolume\", \"params\": { \"volume\": " + Convert.ToString(volume) + "}, \"id\": 1}";
            postToOSMC(myJSON);
        }

        static void pause()
        {
            string myJSON = "{\"jsonrpc\": \"2.0\", \"method\": \"Player.PlayPause\", \"params\": { \"playerid\": 0 }, \"id\": 1}";
            postToOSMC(myJSON);
        }

        static void skipSong()
        {
            string myJSON = "{\"jsonrpc\": \"2.0\", \"method\": \"Player.GoTo\", \"params\": { \"to\": \"next\", \"playerid\": 0}, \"id\": 1}";
            postToOSMC(myJSON);
        }

        static void changeChannel(string channel)
        {
            string ID = channel;
            string myJSON = "{\"jsonrpc\": \"2.0\", \"method\": \"Player.Open\", \"params\": { \"item\": { \"file\": \"plugin://plugin.audio.pandoki/?play=" + ID + "\" }  }, \"id\": \"libPlayerOpen\"}";
            postToOSMC(myJSON);
        }

        static async void postToOSMC(string PostData){
            try
            {
                HttpClient client = new HttpClient();
                StringContent body = new StringContent(PostData, System.Text.Encoding.UTF8, "application/json");
                HttpResponseMessage response = await client.PostAsync($"{osmcHost}/jsonrpc?awx", body);

                client.Dispose();
                response.Dispose();
            }
            catch (Exception er)
            {
                Console.WriteLine("postToOSMC()==>Error: " + er.Message);
            }
        }

        static void LoadJson()
        {
            using (StreamReader r = new StreamReader("configuration.json"))
            {
                string json = r.ReadToEnd();
                dynamic config = JsonConvert.DeserializeObject(json);
                osmcHost = config.osmc;
                connectionString = config.connectionString;
                logfile = config.logFile;
            }
        }

        static async Task<string> whatSong()
        {
            try { 
            HttpClient client = new HttpClient();
            string postData = "{\"jsonrpc\": \"2.0\", \"method\": \"Player.GetItem\", \"params\": { \"properties\": [\"title\", \"thumbnail\", \"artist\", \"file\"], \"playerid\": 0 }, \"id\": \"OnPlayGetItem\"}";
            StringContent body = new StringContent(postData, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync($"{osmcHost}/jsonrpc?awx", body);
            System.IO.Stream streamResponse = await response.Content.ReadAsStreamAsync();
            StreamReader streamReader = new StreamReader(streamResponse);
            string mystuff = streamReader.ReadToEnd();
            nowPlaying nowPlaying = JsonConvert.DeserializeObject<nowPlaying>(mystuff);

            client.Dispose();
            response.Dispose();
            streamReader.Dispose();
            streamResponse.Dispose();

            string title = nowPlaying.result.item.title;
            string artist = String.Join(" & ", nowPlaying.result.item.artist);
            return title + " by " + artist;
            } catch (Exception)
            {
                return "Nothing is Playing";
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
            
            message message = JsonConvert.DeserializeObject<message>(methodRequest.DataAsJson);

            /*      pause
             *      resume
             *      louder (volume goes up 10%)
             *      softer (volume goes down 10%)
             *      get channels (calls the web service that retuns them all including a sequence number)
             *      change to channel #
             *      skip song
             *      what song is this
             */

            string result = "{\"status\":\"success\"}";

            if (message.command != null)
            {
                switch (message.command)
                {
                    case "louder":
                        {
                            volumeUp();
                            break;
                        }
                    case "softer":
                        {
                            volumeDown();
                            break;
                        }
                    case "pause":
                        {
                            pause();
                            break;
                        }
                    case "resume":
                        {
                            pause();
                            break;
                        }
                    case "skipSong":
                        {
                            skipSong();
                            Thread.Sleep(1000 * 3);
                            result = "{\"status\":\"" + whatSong().Result + "\"}";
                            break;
                        }
                    case "whatSong":
                        {
                            result = "{\"status\":\"" + whatSong().Result + "\"}"; 
                            break;
                        }
                    default:
                        {
                            result = "{\"status\":\"Unknown method:" + message.command + "\"}";
                            break;
                        }
                }

                MethodResponse retValue = new MethodResponse(Encoding.UTF8.GetBytes(result), 200);
                return Task.FromResult(retValue);

            }
            else if (message.station != null)
            {
                changeChannel(message.station);
                return Task.FromResult(new MethodResponse(Encoding.UTF8.GetBytes("{\"status\":\"Station=" + message.station + "\"}"), 200));
            } else
            {
                return Task.FromResult(new MethodResponse(Encoding.UTF8.GetBytes("{\"status\":\"Unknown message\"}"), 500));
            }
            
        }

        static void Main(string[] args)
        {
            LoadJson();

            Log("Starting");

            connectToIoTHub();

            while (true)
            {
                Thread.Sleep(1000 * 60);
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
        public string station;
    }

    public class volume
    {
        public string id { get; set; }
        public float jsonrpc { get; set; }
        public Result result { get; set; }
        public class Result
        {
            public int volume { get; set; }
        }
    }

    public class nowPlaying
    {
        public string id { get; set; }
        public float jsonrpc { get; set; }

        public Result result { get; set; }
        public class Result
        {
            public Item item { get; set; }
            public class Item
            {
                public string file { get; set; }
                public List<string> artist { get; set; }
                public string label { get; set; }
                public string thumbnail { get; set; }
                public string title { get; set; }
                public string type { get; set; }
            }
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;
using System.Threading;
using Microsoft.Azure.Devices;

namespace IoTLoadDemo
{
    class Program
    {
        // needed when creating devices
        //                              Example   "HostName=myhub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=0U1REMOVEDvrfUDo=";
        static string iotHubConnectionString    = "{Your Hub here}";
        static string IoTHub                    = iotHubConnectionString.Split(';')[0].Split('=')[1];
        static string IoTDevicePrefix           = "loadTest";
        static string commonKey                 = "GDX4tNsIpZXa3+c8OnMqhI2Vc4ToRu2yUvHU+FK71mw=";

        static int deviceCount                  = 1000;     // how many devices we will create and clients we will launch
        static int maxMessages                  = 20;       // once this count of messages are sent, the cient shuts down
        static int messageDelaySeconds          = 0;        // how long between each message, honoring IoT Hub Quotas
        static int runningDevices               = 0;
        static bool allDevicesDeleted           = false;
        static int totalMessageSent             = 0;
        static int allClientStarted             = 0;

        static void Main(string[] args)
        {
            // if the devices already exist, you can comment out this line
            createDevices(deviceCount);

            DateTime startTime = DateTime.Now;
            for (int deviceNumber = 1; deviceNumber <= deviceCount; deviceNumber++)
            {
                startClient(IoTHub, IoTDevicePrefix, deviceNumber, commonKey, maxMessages, messageDelaySeconds);
            }

            // wait for the first few to start
            Thread.Sleep(1000 * 4);

            while (runningDevices != 0)
            {
                // if we still have devices running, wait
                Thread.Sleep(1000);
            }
            DateTime endTime = DateTime.Now;

            deleteDevices(deviceCount);

            while (allDevicesDeleted != true)
            {
                // if we still have devices being deleted, wait
                Thread.Sleep(1000);
            }

            Console.WriteLine("Total Client: " + deviceCount);
            Console.WriteLine("Total Client Started: " + allClientStarted);
            Console.WriteLine("Total Messages Sent: " + totalMessageSent + " Expected: " + deviceCount * maxMessages);
            Console.WriteLine("Total Execution Time: " + (endTime - startTime).TotalSeconds + " seconds");
            Console.WriteLine("Messages Per Second: " + totalMessageSent / (endTime - startTime).TotalSeconds);
            Console.WriteLine("Press any key to end");
            Console.ReadKey();
        }

        static async Task startClient(string IoTHub, string IoTDevicePrefix, int deviceNumber, string commonKey, int maxMessages, int messageDelaySeconds)
        {
            allClientStarted++;
            runningDevices++;
            string connectionString = "HostName=" + IoTHub + ";DeviceId=" + IoTDevicePrefix + deviceNumber + ";SharedAccessKey=" + commonKey;
            DeviceClient device = DeviceClient.CreateFromConnectionString(connectionString, Microsoft.Azure.Devices.Client.TransportType.Mqtt);
            await device.OpenAsync();
            Random rnd = new Random();
            int mycounter = 0;
            Console.WriteLine("Device " + IoTDevicePrefix + deviceNumber + " started");

            while (mycounter <= maxMessages)
            {
                Thread.Sleep((messageDelaySeconds * 1000) + rnd.Next(1, 100));
                string message = "{ \'loadTest\':\'True\', 'sequenceNumber': " + mycounter + ", \'SubmitTime\': \'" + DateTime.UtcNow + "\', \'randomValue\':" + rnd.Next(1, 4096 * 4096) + " }";
                Microsoft.Azure.Devices.Client.Message IoTMessage = new Microsoft.Azure.Devices.Client.Message(Encoding.UTF8.GetBytes(message));
                await device.SendEventAsync(IoTMessage);
                totalMessageSent++;
                mycounter++;
            }
            await device.CloseAsync();
            Console.WriteLine("Device " + IoTDevicePrefix + deviceNumber + " ended");
            runningDevices--;
        }

        static void createDevices(int number)
        {
            for (int i = 1; i <= number; i++)
            {
                var registryManager = RegistryManager.CreateFromConnectionString(iotHubConnectionString);
                Device mydevice = new Device(IoTDevicePrefix + i.ToString());
                mydevice.Authentication = new AuthenticationMechanism();
                mydevice.Authentication.SymmetricKey.PrimaryKey = commonKey;
                mydevice.Authentication.SymmetricKey.SecondaryKey = commonKey;
                try
                {
                    registryManager.AddDeviceAsync(mydevice).Wait();
                    Console.WriteLine("Adding device: " + IoTDevicePrefix + i.ToString());
                }
                catch (Exception er)
                {
                    Console.WriteLine("  Error adding device: " + IoTDevicePrefix + i.ToString() + " error: " + er.InnerException.Message);
                }
            }
            
        }
        static async void deleteDevices(int number)
        {
            for (int i = 1; i <= number; i++)
            {
                var registryManager = RegistryManager.CreateFromConnectionString(iotHubConnectionString);

                try
                {
                    Device mydevice = await registryManager.GetDeviceAsync(IoTDevicePrefix + i.ToString());
                    registryManager.RemoveDeviceAsync(mydevice).Wait();
                    Console.WriteLine("Deleting device " + IoTDevicePrefix + i.ToString());
                }
                catch (Exception er) { }

            }
            allDevicesDeleted = true;

        }
    }
}

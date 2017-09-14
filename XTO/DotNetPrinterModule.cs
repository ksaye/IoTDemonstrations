// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using System.Text;
using Microsoft.Azure.Devices.Gateway;
using Microsoft.Azure.Devices.Client;

namespace PrinterModule
{
    public class DotNetPrinterModule : IGatewayModule
    {
        private Broker broker;
        private string configuration;
        static DeviceClient deviceClient;

        public void Create(Broker broker, byte[] configuration)
        {
            this.broker = broker;
            this.configuration = System.Text.Encoding.UTF8.GetString(configuration);
            dynamic connectionString = JObject.Parse(this.configuration);

            if (connectionString.connectionString != null) { 
                deviceClient = DeviceClient.CreateFromConnectionString(connectionString.connectionString.ToString());
                checkIoTHubForMessages();                // we start an async listner, which can respond to Cloud to Device messages
            } else
            {
                Console.WriteLine("Error: No connectionString in the arguments.");
                Console.WriteLine("Expected something like:  \"args\": {\"connectionString\": \"HostName=myIoT.azure-devices.net;DeviceId=XTO;SharedAccessKey=UFytva5RfREMOVEDp/cpHwwj7/U=\"}");
                Destroy();
            }
        }

        public async void Destroy()
        {
            await deviceClient.CloseAsync();        // gracefully shut down our connection
        }

        // note below, because both .Client and .Gateway impement Message, I had to be explicit
        public void Receive(Microsoft.Azure.Devices.Gateway.Message received_message)
        {
            dynamic mymessage = new JObject();      // creating a JSON object as the message
            mymessage.text = System.Text.Encoding.UTF8.GetString(received_message.Content, 0, received_message.Content.Length);
            deviceClient.SendEventAsync(new Microsoft.Azure.Devices.Client.Message(Encoding.UTF8.GetBytes(mymessage.ToString())));
            Console.WriteLine("Sent message: " + mymessage.ToString());
        }

        public async void checkIoTHubForMessages()
        {
            while (true)
            {
                try
                {
                    Microsoft.Azure.Devices.Client.Message IoTMessage = await deviceClient.ReceiveAsync();
                    if (IoTMessage != null)
                    {
                        string IoTMessageString = Encoding.ASCII.GetString(IoTMessage.GetBytes());
                        Dictionary<string, string> thisIsMyProperty = new Dictionary<string, string>();
                        thisIsMyProperty.Add("source", "IoTHub");

                        // create a gateway message from IoTMessageString
                        Microsoft.Azure.Devices.Gateway.Message messageToPublish = new Microsoft.Azure.Devices.Gateway.Message("Data: " + IoTMessageString, thisIsMyProperty);

                        this.broker.Publish(messageToPublish);          // publish message
                        await deviceClient.CompleteAsync(IoTMessage);   // mark the message received
                        Console.WriteLine("received message: " + IoTMessageString);
                        Console.WriteLine(" code not implemented to handle messages.  Finish me!");
                    }
                }
                catch { }
            }
        }

    }
}

#r "Microsoft.WindowsAzure.Storage"

using System;
using System.Text;
using Newtonsoft.Json.Linq;
using Microsoft.Azure.Devices;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System.Collections.Generic;
using System.Linq;

const string connectionString = "DefaultEndpointsProtocol=https;AccountName=kevinsayiot;AccountKey=MjKREMOVEDEPzg==;EndpointSuffix=core.windows.net";
static CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connectionString);
static CloudTableClient tableClient = storageAccount.CreateCloudTableClient();

public static void Run(TimerInfo myTimer, TraceWriter log)
{
    CloudTable table = tableClient.GetTableReference("FeedTheDogTable");

    string whereClause = "(PartitionKey eq 'FeedTheDog') and (message eq 'movement')";

    TableQuery gpsentry = new TableQuery().Where(whereClause);

    IEnumerable<Microsoft.WindowsAzure.Storage.Table.DynamicTableEntity> myquery = table.ExecuteQuery(gpsentry);

    if (myquery.Last().Timestamp < DateTime.Now.AddDays(-1))
    {
        log.Info("need to remind");
        log.Info(myquery.Last().Timestamp.ToString());
        log.Info(DateTime.Now.AddDays(-1).ToString());
        sendMessage("Remember to feed the dog");
    }
    else
    {
        log.Info(myquery.Last().Timestamp.ToString());
        log.Info(DateTime.Now.AddDays(-1).ToString());
        log.Info("no need to remind");
    }
    log.Info($"C# Timer trigger function executed at: {DateTime.Now}");
}

static async void sendMessage(string message)
{
    string IoTHubConnectionString = "HostName=kevinsayIoT.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=cHREMOVEDPc=";

    ServiceClient serviceClient = ServiceClient.CreateFromConnectionString(IoTHubConnectionString);

    string messageSend = "{ \"action\": \"speak\", ";
    messageSend = messageSend + "\"data\": \"" + message + "\" }";

    Message sendMessage = new Message(Encoding.ASCII.GetBytes(messageSend));
    await serviceClient.SendAsync("HomeGateway", sendMessage);
}

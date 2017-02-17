using System.Net;
using System.Xml;
using Microsoft.Azure.Devices.Client;
using System.Text;

public static async Task Run(HttpRequestMessage req, TraceWriter log)
{
    /*  expecting an XML document like this below
        * 
    <!DOCTYPE group PUBLIC "-//ESL/DTD eGauge 1.0//EN" "http://www.egauge.net/DTD/egauge-hist.dtd">
    <group serial="0x29f2bdcd">
        <data columns="5" time_stamp="0x58a61c6c" time_delta="60" epoch="0x58a602a4">
        <cname t="P">use</cname>
        <cname t="P">gen</cname>
        <cname t="V">L1 voltage</cname>
        <cname t="P">P112 Mains Power</cname>
        <cname t="S">P112 Mains Apparent Power</cname>
        <r>
            <c>35043976589</c>
            <c>0</c>
            <c>838059860</c>
            <c>35043976589</c>
            <c>20560593960</c>
        </r>
        </data>
    </group>
    */
   
    DeviceClient deviceClient;
    string iotHubUri = "MyIoTHub.azure-devices.net";
    string deviceName = "MyDevice";
    string deviceKey = "bC2CHANGEMEPE2ELioo03k8=";
    
    string body = req.Content.ReadAsStringAsync().Result;
    //log.Info(body);
    XmlDocument mydocument = new XmlDocument();
    mydocument.LoadXml(body);                                                           // read the data that is posted

    XmlNodeList groupList = mydocument.GetElementsByTagName("group");
    XmlNode groupNode = groupList.Item(0);                                              // get the group node
    XmlNode dataNode = groupNode.ChildNodes.Item(0);                                    // get the data node
    Double timeStamp = Convert.ToInt64(dataNode.Attributes["time_stamp"].InnerText, 16);// get the timestamp of this event
    Double epoch = Convert.ToInt64(dataNode.Attributes["epoch"].InnerText, 16);         // get the epoc of the start time of recording
    int columnCount = int.Parse(dataNode.Attributes["columns"].InnerText);              // how many columns we have in the XML
    XmlNodeList rNodeList = dataNode.ChildNodes;                                        // all the values
    string[] columns = new string[columnCount];                                         // create an array for the column names

    for (int localCounter = 0; localCounter < columnCount; localCounter++)
    {
        columns[localCounter] = rNodeList.Item(localCounter).InnerText.Replace(" ", "_");   // in case there are spaces in the column names
    }

    DateTime entryTime = new DateTime(1970, 1, 1, 0, 0, 0).AddSeconds(Convert.ToDouble(timeStamp));
    string entryTimestr = entryTime.ToUniversalTime().ToString();

    DateTime startTime = new DateTime(1970, 1, 1, 0, 0, 0).AddSeconds(Convert.ToDouble(epoch));
    string startTimestr = startTime.ToUniversalTime().ToString();

    foreach (XmlNode record in rNodeList)
    {
        if (record.Name == "r")                                                         // for each usage record
        {
            
            XmlNodeList r = record.ChildNodes;
            string json = "{ ";

            for (int localCounter = 0; localCounter < columnCount; localCounter++)
            {
                json = json + "\"" + columns[localCounter] + "\": " + Convert.ToDouble(r.Item(localCounter).InnerText).ToString() + ", ";
            }
            json = json + "\"entryTime\": \"" + entryTimestr + "\", ";
            json = json + "\"startReportTime\": \"" + startTimestr + "\" }";

            deviceClient = DeviceClient.Create(iotHubUri, new DeviceAuthenticationWithRegistrySymmetricKey(deviceName, deviceKey), Microsoft.Azure.Devices.Client.TransportType.Amqp);

            Message message = new Message(Encoding.ASCII.GetBytes(json));
            await deviceClient.SendEventAsync(message);
        }
    }
}
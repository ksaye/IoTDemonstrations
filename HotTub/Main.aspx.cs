using Microsoft.Azure.Devices;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.UI.WebControls;

namespace HotTubWeb
{
    
    public partial class Main : System.Web.UI.Page
    {
        string allowedUsers = "fe0fb07998ae48cd,what is Cyndi's ID";      // there are the Microsoft IDs

        string ConnectionString = "DefaultEndpointsProtocol=https;AccountName=myhottub;AccountKey=F0ucREMOVEDXtIL+6u8ds248Tg==;EndpointSuffix=core.windows.net";
        string IoTHubConnectionString = "HostName=myIoT.azure-devices.net;SharedAccessKeyName=webClient;SharedAccessKey=eF/MREMOVEDecUQOtYI=";

        string DeviceName = "HotTub";
        string XMSCLIENTPRINCIPALID;
        string XMSCLIENTFullName;

        public CloudStorageAccount Account;
        public CloudTableClient TableClient;
        static ServiceClient serviceClient;
        public RegistryManager registryManager;

        protected void Page_Load(object sender, EventArgs e)
        {
            verifyUser();
            connectToTable(ConnectionString);
            addDeviceStatus();
        }

        protected void connectToTable(String ConnectionString)
        {
            Account = CloudStorageAccount.Parse(ConnectionString);
            TableClient = Account.CreateCloudTableClient();
        }
        
        protected void addDeviceStatus()
        {
            TimeZoneInfo cstZone = TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time");

            CloudTable table = TableClient.GetTableReference("hottub");

            TableQuery query = new TableQuery().Where(TableQuery.GenerateFilterCondition("PartitionKey",
               QueryComparisons.Equal, DeviceName)); ;
            
            var list = table.ExecuteQuery(query).ToList();

            if (list.Count > 0) { 

                var lastEntry = list.OrderBy(entry => entry.Timestamp).Last();

                TableRow trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Logged in as:" });
                trName.Cells.Add(new TableCell() { Text = XMSCLIENTFullName });
                deviceStatus.Rows.Add(trName);

                trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Device Name:" });
                trName.Cells.Add(new TableCell() { Text = lastEntry.Properties["hostName"].StringValue});
                deviceStatus.Rows.Add(trName);

                trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Air Temperature:"});
                trName.Cells.Add(new TableCell() { Text = lastEntry.Properties["airTemperature"].DoubleValue.ToString() + "°F" });
                deviceStatus.Rows.Add(trName);

                trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Air Humidity:" });
                trName.Cells.Add(new TableCell() { Text = lastEntry.Properties["humidity"].DoubleValue.ToString() + "%" });
                deviceStatus.Rows.Add(trName);

                trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Air Heat Index:" });
                trName.Cells.Add(new TableCell() { Text = lastEntry.Properties["heatIndex"].DoubleValue.ToString() + "°F" });
                deviceStatus.Rows.Add(trName);

                trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Water Temperature:" });
                trName.Cells.Add(new TableCell() { Text = lastEntry.Properties["waterTemperature"].DoubleValue.ToString() + "°F" });
                deviceStatus.Rows.Add(trName);

                trName = new TableRow();
                trName.ID = "PowerStatus";
                trName.Cells.Add(new TableCell() { Text = "Power State:" });
                trName.Cells.Add(new TableCell() { Text = lastEntry.Properties["PowerStatus"].StringValue });
                deviceStatus.Rows.Add(trName);

                /*trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Connected State:" });
                trName.Cells.Add(new TableCell() { Text = getDeviceStatus(lastEntry.Properties["hostName"].StringValue).Result });
                deviceStatus.Rows.Add(trName);*/

                trName = new TableRow();
                trName.Cells.Add(new TableCell() { Text = "Last Changed:" });
                DateTime cstTime = TimeZoneInfo.ConvertTimeFromUtc(lastEntry.Timestamp.UtcDateTime, cstZone);

                trName.Cells.Add(new TableCell() { Text = cstTime.ToShortDateString() + " " + cstTime.ToShortTimeString() + " CST"});
                deviceStatus.Rows.Add(trName);

                if (lastEntry.Properties["PowerStatus"].StringValue == "ON")
                {
                    ChangeState.Text = "Power Off";
                } else
                {
                    ChangeState.Text = "Power On";
                }

            }
        }

        protected async Task<string> getDeviceStatus(string deviceName)
        {
            string myConnectionState = "UNKNOWN";

            try
            {
                registryManager = RegistryManager.CreateFromConnectionString(IoTHubConnectionString);
                Device mydevice = await registryManager.GetDeviceAsync(deviceName);
                myConnectionState = mydevice.ConnectionState.ToString();
            }
            catch { }

            return myConnectionState;
        }

        protected void verifyUser()
        {
            XMSCLIENTPRINCIPALID = Request.Headers.Get("X-MS-CLIENT-PRINCIPAL-ID");
            XMSCLIENTFullName = Request.Headers.Get("X-MS-CLIENT-PRINCIPAL-NAME");

            bool allowedUser = false;
            string[] allAllowedUsers = allowedUsers.Split(',');
            
            foreach(string ID in allAllowedUsers)
            {
                if (ID == XMSCLIENTPRINCIPALID) { allowedUser = true; }
            }
            
            if (allowedUser == false)
            {
                Response.Write("Unauthenticated User.</br>");
                Response.Write("You are: " + XMSCLIENTFullName + " (" + XMSCLIENTPRINCIPALID  + ")");
                Response.End();
            } 
        }

        protected async void ChangeState_Click(object sender, EventArgs e)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(IoTHubConnectionString);

            Message IoTMessage = new Message(Encoding.UTF8.GetBytes(ChangeState.Text));
            await serviceClient.SendAsync(DeviceName, IoTMessage);

            await serviceClient.CloseAsync();

            deviceStatus.Rows.Clear();

            ChangeState.Enabled = false;
        }
    }
}
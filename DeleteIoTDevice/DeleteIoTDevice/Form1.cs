using Microsoft.Azure.Devices;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DeleteIoTDevice
{

    public partial class Form1 : Form
    {
        RegistryManager registryManager;

        public Form1()
        {
            InitializeComponent();
        }
        
        private async void button1_Click(object sender, EventArgs e)
        {
            try
            {
                registryManager = RegistryManager.CreateFromConnectionString(connectionString.Text);
                await registryManager.RemoveDeviceAsync(deviceId.Text);
                MessageBox.Show("Success: " + deviceId.Text + " deleted.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception er)
            {
                MessageBox.Show("Error: " + er.Message, null, MessageBoxButtons.OK, MessageBoxIcon.Error);
            }

        }

        private void Form1_Load(object sender, EventArgs e)
        {
            connectionString.Text = "HostName=test2.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=MuO8hHlWt15t1zEm1Y2th/JbFxp48vAHNDzDWZZfpNk=";
        }

    }
}

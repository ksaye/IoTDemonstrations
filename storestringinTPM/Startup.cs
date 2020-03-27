using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Tpm2Lib; // Microsoft.TSS version 2.1.1

/*  external documentation here: https://github.com/Azure/iotedge/blob/master/doc/ExternalProvisioning.md
 */

namespace IoTEdgeExternalConfig
{
    public class Startup
    {
        public static int indexTMPSlot = 3001;
        public static int stringLength = 150;
        public static AuthValue nvAuthValue = new AuthValue(new byte[] { 0,3,27,20,20 });

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
/*        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
        }*/

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/device/provisioninginformation", defaultGetEndpoint);
                endpoints.MapPost("/device/reprovision", defaultPostEndpoint);
                endpoints.MapGet("/write", writeEndpoint);
                endpoints.MapGet("/", defaultEndpoint);
            });
        }

        private async Task defaultEndpoint(HttpContext context)
        {
            Console.WriteLine("info: " + context.Request.Protocol.ToString() + " to " + context.Request.Path.ToString() + " request from: " + context.Connection.LocalIpAddress.ToString());

            await context.Response.WriteAsync("IoTEdgeExternalConfig Service.<br>");
            await context.Response.WriteAsync("more info here: https://github.com/Azure/iotedge/blob/master/doc/ExternalProvisioning.md");
        }

        private async Task defaultPostEndpoint(HttpContext context)
        {
            Console.WriteLine("info: " + context.Request.Protocol.ToString() + " to " + context.Request.Path.ToString() + " request from: " + context.Connection.LocalIpAddress.ToString());

            Console.WriteLine("Error: reprovisining is not supported");
            await context.Response.WriteAsync("Error: reporvision is not supported");
        }

        private async Task writeEndpoint(HttpContext context)
        {
            Console.WriteLine("info: " + context.Request.Protocol.ToString() + " to " + context.Request.Path.ToString() + " request from: " + context.Connection.LocalIpAddress.ToString());

            string connectionString = context.Request.Query["connectionString"].ToString();
            if (connectionString == null || connectionString.Length < 5)
            {
                await context.Response.WriteAsync("No Connection String provided.  try /write?connectionString=xxxxxxxx");
            } else
            {
                StoreData(Encoding.ASCII.GetBytes(context.Request.Query["connectionString"].ToString()));
                await context.Response.WriteAsync("Success: Saved to TPM.");
                Console.WriteLine("Success: Saved to TPM.");
            }
        }

        private async Task defaultGetEndpoint(HttpContext context)
        {
            Console.WriteLine("info: " + context.Request.Protocol.ToString() + " to " + context.Request.Path.ToString() + " request from: " + context.Connection.LocalIpAddress.ToString());

            string connectionString = Encoding.ASCII.GetString(ReadData(stringLength));
            string[] connectionStringParts = connectionString.Split(";");
            
            JObject response = new JObject();
            JObject credentials = new JObject();

            response["hubName"] = connectionStringParts[0].Split("=")[1];
            response["deviceId"] = connectionStringParts[1].Split("=")[1];
            credentials["authType"] = "symmetric-key";
            credentials["source"] = "payload";
            credentials["key"] = connectionStringParts[2].Split("=")[1];
            response["credentials"] = credentials;
            response["status"] = "none";
            response["substatus"] = "none";

            Console.WriteLine(response.ToString());

            await context.Response.WriteAsync(response.ToString());
        }

        public static void StoreData(byte[] data)
        {
            Tpm2Device tpmDevice;
            if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows))
            {
                tpmDevice = new TbsDevice();
            } else
            {
                tpmDevice = new LinuxTpmDevice();
            }
            
            tpmDevice.Connect();
            var tpm = new Tpm2(tpmDevice);

            var ownerAuth = new AuthValue();
            TpmHandle nvHandle = TpmHandle.NV(indexTMPSlot);
            tpm[ownerAuth]._AllowErrors().NvUndefineSpace(TpmHandle.RhOwner, nvHandle);

            AuthValue nvAuth = nvAuthValue;

            tpm[ownerAuth].NvDefineSpace(TpmHandle.RhOwner, nvAuth,
            new NvPublic(nvHandle, TpmAlgId.Sha1, NvAttr.Authwrite | NvAttr.Authread, new byte[0], (ushort)stringLength));

            tpm[nvAuth].NvWrite(nvHandle, nvHandle, data, 0);
            tpm.Dispose();
        }

        public static byte[] ReadData(int tailleData)
        {
            Tpm2Device tpmDevice;
            if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows))
            {
                tpmDevice = new TbsDevice();
            }
            else
            {
                tpmDevice = new LinuxTpmDevice();
            }
            tpmDevice.Connect();
            var tpm = new Tpm2(tpmDevice);

            TpmHandle nvHandle = TpmHandle.NV(indexTMPSlot);

            AuthValue nvAuth = nvAuthValue;

            byte[] newData = tpm[nvAuth].NvRead(nvHandle, nvHandle, (ushort)tailleData, 0);

            tpm.Dispose();
            return newData;
        }

    }
}

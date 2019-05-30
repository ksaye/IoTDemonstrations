using System;
using System.Collections.Generic;
using AMWD.Modbus.Tcp.Client;
using System.Threading.Tasks;

namespace ConsoleApp8
{
    class Program
    {
        private static ModbusClient modbusClient;
        static void Main(string[] args)
        {
            Run().Wait();
            Console.ReadKey();
        }

        static async Task Run()
        {

            modbusClient = new ModbusClient("modbus.centralus.azurecontainer.io", 502);
            await modbusClient.Connect();

            int counter = 0;
            do
            {
                Console.WriteLine(getRegister(counter).Result);
                counter += 1;
            } while (counter <= 4);

            await modbusClient.Disconnect();
        }

        private static async Task<int>getRegister(int counter)
        {
            List<AMWD.Modbus.Common.Structures.Register> mydata = await modbusClient.ReadHoldingRegisters(0, (ushort)counter, 1);
            return (int)mydata[0].Value;
        }
    }
}

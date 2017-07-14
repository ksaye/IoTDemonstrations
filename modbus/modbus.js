'use strict';

var fs = require('fs');
var modbusMap = JSON.parse(fs.readFileSync('modules/src/modbusmap.json', 'utf8'));
const node_modbus = require('node-modbus');

const cid = '115';
const sv = 1;
const MT_TELEMETRY = 0;
const MT_ALERT = 1;
const tmpAlertThreshold = 100;

const initialData = [{
    name: 'input',
    content: [
    {
        cid: modbusMap.controllerId,
        //sv: sv,
        data: {
        }
    }]
}];

const client = node_modbus.client.tcp.complete({
    'host': modbusMap.controllerIPAddress,  /* IP or name of server host */
    'port': modbusMap.controllerIPPort,     /* well known Modbus port */
    'unitId': 1,
    'timeout': 2000,                        /* 2 sec */
    'autoReconnect': true,                  /* reconnect on connection is lost */
    'reconnectTimeout': 15000,              /* wait 15 sec if auto reconnect fails to often */
    'logLabel': 'ModbusClientTCP',          /* label to identify in log files */
    'logLevel': 'error',                    /* for less log use: info, warn or error */
    'logEnabled': true
})

module.exports = {
    broker: null,
    configuration: null,
    data: initialData,

    create: function (broker, configuration) {
        this.broker = broker;
        this.configuration = configuration;

        return true;
    },

    start: function () {
        var self = this;
        // connect the modbus client.
        // we also need to handle disconnect, timeout and etc

        client.connect();
        console.log(' connecting to: ' + modbusMap.controllerIPAddress + ':' + modbusMap.controllerIPPort);

        client.on('connect', function () {
            setInterval(() => {
                self.poll();
            }, 1000 * modbusMap.pollingFrequencySeconds);
        })
    },

    receive: function (message) {
    },

    destroy: function () {
        console.log('sensor.destroy');
    },

    poll: function () {
        var newmessage = {};

        for (let sensor of modbusMap.sensors) {
            //            setTimeout('', 2000);
            var tagName = sensor.tagName;
            var firstRegister = sensor.firstRegister;
            var lastRegister = sensor.lastRegister || (firstRegister + 1);
            var totalLength = lastRegister - firstRegister;

            console.log('working on ' + tagName);
            newmessage['cid'] = modbusMap.controllerId;
            newmessage['pollingFrequencySeconds'] = modbusMap.pollingFrequencySeconds;
            // newmessage = {
            //  cid: '',
            //  polling: '',
            //  0: {}
            //
            newmessage['measures'] = [];
            var tempMeasure = {};
            tempMeasure.type = tagName;

            console.log(sensor);
            for (var i = 0; i <= totalLength+1 ; i++) {
                console.log('firstRegister:' + firstRegister);

                if (firstRegister >= 400001 && firstRegister <= 465536) {
                    console.log('section1');
                    // write or read a holding register (integer or float)
                    client.readHoldingRegisters(firstRegister - 400000 - 1, lastRegister - 400000).then(function (resp) {
                        console.log(resp.register);
                        console.log('there are ' + resp.register.length + ' entries in the response');

                        /* note, we need to flip the values
                            we are getting  [ 39322, 16561, 0, 16780 ]
                            but should get [ 16561, 39322, 16780, 0 ]
                            */

                        tempMeasure.val = resp.register;
                        tempMeasure.cr = new Date().valueOf() / 1000;
                    })
                    continue;
                } else if (firstRegister >= 1 && firstRegister <= 65536) {
                    console.log('section2');
                    console.log(firstRegister);
                    // read and write to a coil (boolean)
                    client.readCoils(firstRegister, 1).then(function (resp) {
                        console.log('here');
                        console.log(resp);
                        tempMeasure.val = resp;
                        tempMeasure.cr = new Date().valueOf() / 1000;
                    }, function (err) { console.log(err); })
                } else if (firstRegister >= 300001 && firstRegister <= 365536) {
                    console.log('section3');
                    // read an input registers (integer or float)
                    /*                    console.log('reading input register');
                                        console.log(firstRegister - 300000);
                                        console.log(lastRegister - 300000);
                                        */
                    client.readInputRegisters(firstRegister - 300000, lastRegister - 300000).then(function (resp) {
                        tempMeasure.val = resp;
                        tempMeasure.cr = new Date().valueOf() / 1000;
                    })
                    continue;
                } else if (firstRegister >= 100001 && firstRegister <= 165536) {
                    console.log('section4');
                    // read an input (boolean)
                    client.readDiscreteInputs(firstRegister - 100000, firstRegister - 100000 + 1).then(function (resp) {
                        console.log(resp);
                        tempMeasure.val = resp;
                        tempMeasure.cr = new Date().valueOf() / 1000;
                    })
                } else {
                    console.log('got no value');
                    console.error("incorrect register");
                }
                console.log('adding')
                console.log(tempMeasure);
                newmessage['measures'].push(tempMeasure);
            }
        }
        // we also need to record locally, just in case
        console.log(newmessage);
        this.publish(newmessage);
    },

    publish: function (newmessage) {
        //console.log('Publishing data.');
        console.log(JSON.stringify(newmessage));
        /*console.log({
            properties: {
                source: 'sensor',
                name: 'input'
            },
            content: new Uint8Array(Buffer.from(JSON.stringify(newmessage), 'utf8'))
        });*/

        this.broker.publish({
            properties: {
                source: 'sensor',
                name: 'input'
            },
            content: new Uint8Array(Buffer.from(JSON.stringify(newmessage), 'utf8'))
        });
    }
};

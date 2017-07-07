// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var mosca = require('mosca');

function MqttBrokerModule() {
    this.server = null;
};

MqttBrokerModule.prototype.create = function (messageBus, configuration) {
    var moscaSettings = {
        interfaces: [{
            type: "mqtt",
            port: 1883,
            host: configuration != null ? configuration.LocalAddress : null
        }],
        persistence: mosca.persistence.Memory
    };
	
//    console.log('MQTT Broker starting...');
    this.server = new mosca.Server(moscaSettings, function () {
        console.log('MQTT Broker running.');
    });

    this.server.messageBus = messageBus;

    // we received a message from an MQTT client
    this.server.published = function (packet, client, cb) {
        if (packet.topic.indexOf("/messages/events/") != -1) {        
            try {
                var JSONMessage = JSON.parse(packet.payload.toString('utf8'));
                let data = [{
                    name: 'input',
                    content: [{
                        'sensorid': JSONMessage.sensorid,
                        temp: JSONMessage.temp,
                        hmdt: JSONMessage.hmdt
                    }]
                }];

                this.messageBus.publish({
                    properties: {
                        source: 'sensor',
                        name: 'data'
                    },
                    content: new Uint8Array(Buffer.from(JSON.stringify(data), 'utf8'))
                });

                //console.log(" mqtt.published: " + JSON.stringify(data));

            } catch (er) {
                console.log(er);
            }
        } else {
            //console.log('unparsed packet');
            //console.log(packet);
        }
        return cb();
    }

    this.server.authenticate = function (client, username, password, cb) {
        // we are authenticating anything.  Could use a file or reach out to Azure IoT 
        client.username = username.substr(username.indexOf('/') + 1);
        client.password = password;
        cb(null, client.password != null);
//        console.log(`  authenticated: ${client.username}`);
    }
    return true;
};

MqttBrokerModule.prototype.receive = function (message) {
   let data = Buffer.from(message.content).toString('utf8');
   if (message.properties.deviceName !== "undefined") {
       var topic = 'devices/' + message.properties.deviceName + '/messages/devicebound/'

       //console.log('matt publish message \'%s\' to %s', data, topic);
       this.server.publish(
       {
           topic: topic,
           payload: data
       });
   }
};

MqttBrokerModule.prototype.destroy = function () {
    this.server.close(function () {
        console.log('MQTT Broker stopped.');
    });
};

module.exports = new MqttBrokerModule()

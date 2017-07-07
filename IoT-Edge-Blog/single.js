var mqtt = require('mqtt')
var randomnumber = Math.floor(Math.random() * 100)
var clientName = "client1000";
var client = mqtt.connect('mqtt://127.0.0.1:1883',
        {
            username: 'dummy/' + clientName,
            password: 'myPassword'
        }
    )

client.on('connect', function () {
    client.subscribe('devices/' + clientName + '/messages/devicebound/#')
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
//  client.end()
})

var sendInterval = setInterval(function () {
    var temp = 60 + (Math.random() * 20); // range: [60, 80]
    var hmdt = 20 + (Math.random() * 10); // range: [60, 80]
    var mymessage = { sensorid: clientName, temp: temp, hmdt, hmdt, sendTime: Date().toString() }
    client.publish('devices/'+ clientName + '/messages/events/', JSON.stringify(mymessage));
    //console.log('Sent message: ' + JSON.stringify(mymessage));
}, 10000);

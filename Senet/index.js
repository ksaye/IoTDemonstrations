module.exports = function (context, myEventHubTrigger) {

    var https = require('https');

    //context.log('JavaScript eventhub trigger function processed work item', myEventHubTrigger);
    if (myEventHubTrigger.PDU != null) {
        //context.log('Working on', myEventHubTrigger.PDU);  // Example: 88EB0007018327260E00
        var json = parsezenseio(parseHexString(myEventHubTrigger.PDU));

        var options = {
        hostname: 'collidevillage.azure-devices.net',
        port: 443,
        path: '/devices/sampleDevice1/messages/events?api-version=2016-02-03',
        method: 'POST',
        headers: {
            'Authorization': 'SharedAccessSignature sr=collidevillage.azure-devices.net%2Fdevices%2FsampleDevice1&sig=%2BMUK537REMOVED%3D&se=1516401030'
            }
        };

        var post_req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
            });
        });
        
        // adding the hostname
        json.data['EUI'] = myEventHubTrigger.EUI;

        // post the data
        post_req.write(JSON.stringify(json.data));
        post_req.end();
    }
    
    context.done();
};

function parseHexString(str) { 
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
}

function parsezenseio (bytes) {
    // decodes the payload into json.
    // bytes is of type Buffer.
    var length = bytes.length;
     if(bytes[0] == 0x88) { 
        var temperature = (bytes[2]<<8 | bytes[1])/10;
        var humidity = (bytes[4]<<8 | bytes[3])/10;
        var pressure = (bytes[6]<<8 | bytes[5])/10;
        var luminance = (bytes[9]<<16 | bytes[8]<<8 | bytes[7])/10;
        var data = {"Value2" : temperature.toFixed(1), "humidity" : humidity.toFixed(1), 
                    "pressure" : pressure.toFixed(1), "lux" : luminance.toFixed(1)};
    } else if(bytes[0] == 0x89) {
        var temperature = (bytes[2]<<8 | bytes[1])/10;
        var humidity = (bytes[4]<<8 | bytes[3])/10;
        var pressure = (bytes[6]<<8 | bytes[5])/10;
        var luminance = (bytes[9]<<16 | bytes[8]<<8 | bytes[7])/10;
        var noise = bytes[10];
        var data = {"Value2" : temperature.toFixed(1), "humidity" : humidity.toFixed(1), 
                    "pressure" : pressure.toFixed(1), "lux" : luminance.toFixed(1), "noise" : noise.toFixed(1)};
    } else if(bytes[0]== 0x8A) {
        var CO2 = (bytes[2]<<8 | bytes[1])/10;
        var tVOC = (bytes[4]<<8 | bytes[3])/10;
        var data = {"CO2" : CO2.toFixed(1), "tVOC" : tVOC.toFixed(1)};
    } else if(bytes[0]== 0x8B) {
        var X = (bytes[2]<<8 | bytes[1])/1000 - 30;
        var Y = (bytes[4]<<8 | bytes[3])/1000 - 30;
        var Z = (bytes[6]<<8 | bytes[5])/1000 - 30;
        var data = {"X" : X.toFixed(3), "Y" : Y.toFixed(3), "Z" : Z.toFixed(3)};
    } else if(bytes[0] == 0x82) {
        var latitude = (bytes[3]<<16 | bytes[2]<<8 | bytes[1])/10000 - 180;
        var longitude= (bytes[6]<<16 | bytes[5]<<8 | bytes[4])/10000 - 180;
        var altitude= (bytes[9]<<16 | bytes[8]<<8 | bytes[7])/100 - 500;
        var data = {"lat" : lat.toFixed(4), "lng" : lng.toFixed(4), "alt" : lng.toFixed(2)};
    }
 
    // return an object
    return {
        payload: bytes,
        length: length,
        opcode: bytes[0],
        data: data
    };
}
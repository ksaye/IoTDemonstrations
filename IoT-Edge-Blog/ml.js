'use strict';

module.exports = {
  broker: null,
  configuration: null,

  create: function (broker, configuration) {
    this.broker = broker;
    this.configuration = configuration;
    console.log(`ml.create`);
    return true;
  },

  receive: function (message) {
      let data = Buffer.from(message.content).toString('utf8');
      var newmessage = [ { } ];
      //console.log(`ml.receive - ${data}`);

      // our data from Stream is like: {"errors":[],"results":{"output":[{"deviceid":"device1","temperaturef":100.41666666666667,"humidity":50.483333333333334},{"deviceid":"device2","temperaturef":109.88333333333334,"humidity":50.666666666666664},{"deviceid":"device3","temperaturef":105.54166666666667,"humidity":47.025}]}}

      // do somethign amazing with the information
      try {
          var JSONdata = JSON.parse(data);
          for (var entries in JSONdata.results.output) {
              var entry = JSONdata.results.output[entries];
              // now we have each entry, like entry.deviceid, entry.temperaturef and etc
              // we can call the ML REST api for each entry or just pass it:   JSONdata.results.output
              //console.log(entry.deviceid);
              // you can add to the object as shown below
              entry.newval = 1;
              newmessage.push(entry);
	      }

          console.log(' ml received a message with ' + JSONdata.results.output.length + ' entries');
      }
      catch (err) {
          console.error(err);
      }

      // sending to the next module
      this.broker.publish({
          properties: { },
          content: new Uint8Array(Buffer.from(JSON.stringify(newmessage), 'utf8'))
      });

      //console.log(`ml.publish - ${data}`);
  },

  destroy: function () {
    console.log('ml.destroy');
  }
};

'use strict';

var fs = require('fs');
var TStreamsMain = null;

/// ASA module 
module.exports = {
    messageBus: null,
    configuration: null,
    output: null,
    query: null,
    querypath: null,
    referencePath: null,
    udfFunctionPath: null,
    inputNames: {},
    outputNames: {},
    reorderLatency: null,
    reorderPolicy: null,
    registeredFunctions: {},

    create: function (messageBus, configuration) {
        this.messageBus = messageBus;
        this.configuration = configuration;
        this.querypath = this.configuration.compiledqueryPath;
        this.referencePath = this.configuration.referenceDataPath;
        this.udfFunctionPath = this.configuration.udfFunctionPath;
        this.reorderLatency = this.configuration.eventsOutOfOrderMaxDelayInMs;
        this.reorderPolicy = this.configuration.eventsOutOfOrderPolicy;

        fs.stat(this.querypath, function(err, stats) {
            if (err) {
                console.log('[ASA] Invalid query path - ' + this.querypath + ' ASA failed to initialize');
                return;
            }

            this.query = fs.readFileSync(this.querypath, 'utf8');
            if (!this.query) {
                console.log('[ASA] Get empty query, please validate your query, ASA failed to initialize');
                return;
            }
            console.log('[ASA] Get query');
            this.addQuery(this.query);

            try {
                var inputNameJson = JSON.parse(this.configuration.inputName);
            } catch (e) {
                console.log('[ASA] Invalid JSON format of input Name,  ASA failed to initialize - ' + e);
                return;
            }
            if (inputNameJson.length === 0) {
                console.log('[ASA] No Input Name Defined, ASA failed to initialize');
                return;
            }
            inputNameJson.forEach((element) => {
                if (!element.hasOwnProperty("Name")) {
                    console.log('[ASA] Invalid Input Name Format - ' + JSON.stringify(element));
                }
                this.inputNames[element.Name] = null;
            });

            if (this.reorderLatency) {
                console.log('[ASA] Get reorder latency - ' + this.reorderLatency);
                TStreamsMain.addReorderLatency(this.reorderLatency);
                console.log('[ASA] Get reorder policy - ' + this.reorderPolicy);
                TStreamsMain.addReorderPolicy(this.reorderPolicy);
            }

            fs.stat(this.referencePath, (err, stats) => {
                if (!err) {
                    var referenceData;
                    try {
                        referenceData = JSON.parse(fs.readFileSync(this.referencePath, 'utf8'));
                    } catch (e) {
                        console.log('[ASA] Read ReferenceData.txt failed, ASA failed to initialize - ' + e);
                        return;
                    }
                    console.log('[ASA] Get reference data');

                    referenceData.forEach((element) => {
                        try {
                            this.addData(JSON.parse(fs.readFileSync(element.RefDataLocalPath, 'utf8')));
                        } catch (e) {
                            console.log('[ASA] Got error when loading reference, ASA failed to initialize - ' + e);
                            return;
                        }
                    });
                }
            });

            fs.stat(this.udfFunctionPath, (err, stats) => {
                if (!err) {
                    var udfFunction;
                    try {
                        udfFunction = JSON.parse(fs.readFileSync(this.udfFunctionPath, 'utf8') + "");
                    } catch (e) {
                        console.log('[ASA] Parse UDF function failed - ' + e);
                        return;
                    }
                    console.log('[ASA] Get UDF Function');
                    udfFunction.forEach((element) => {
                        var code = {};
                        var udfScript = "(" + element.Script + ")";
                        try {
                            var funcObject = eval(udfScript);
                        } catch (e) {
                            console.log('[ASA] Parse UDF function from script failed, ASA failed to initialize - ' + e);
                            return;
                        }
                        if (typeof funcObject === "undefined") {
                            console.log('[ASA] Parse UDF function from script failed, ASA failed to initialize - ' + e);
                            return;
                        }
                        code["code"] = funcObject;

                        this.registeredFunctions[element.Name] = code;
                        TStreamsMain.addUDFfunction(this.registeredFunctions);
                    });
                }
            });
        }.bind(this));
        return true;
    },

    receive: function (message) {
        try {
            var buf = Buffer.from(message.content);
            var receive = buf.toString();
            if (message.properties.name === 'Query') {
                this.query = receive;
                this.addQuery(this.query);
            } else if (message.properties.name === 'data') {
                var jsonData = JSON.parse(receive);
                if (this.inputNames.hasOwnProperty(jsonData[0].name)) {
                    this.addData(jsonData);
                }
            }
        } catch (e) {
            console.log('[ASA] Got error when processing input events - ' + e);
        }
    },

    addQuery: function (q) {
        var serializedQuery = JSON.parse(q);
        TStreamsMain = this.requireUncached('TStreamsMain');
        TStreamsMain.startTStreamsQuery(serializedQuery);
    },

    addData: function (jsonObject) {
        this.output = TStreamsMain.addInputs(jsonObject);
        var validOutput = false;
        Object.keys(this.output.results).forEach((key) => {
            if (this.output.results[key] !== undefined && this.output.results[key].length > 0) {
                validOutput = true;
            }
        });
        if (validOutput) {
            this.messageBus.publish({
                properties: {
                    'source': 'ASAmodule',
                    'name': this.configuration.outputName
                },
                content: new Uint8Array(Buffer.from(JSON.stringify(this.output)))
            });
        }
    },

    requireUncached: function (module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    },

    destroy: function () {
        console.log('asa.destroy');
    }
};
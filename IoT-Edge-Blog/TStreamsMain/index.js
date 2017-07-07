/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <disable>JS2074.IdentifierNameIsMisspelled</disable>
/*globals window*/

(function (exports, undefined) {
    "use strict";
    var TStreams = require('./TStreams.js');
    var moment = require('./moment.js');
    var Microsoft = {
        EventProcessing: {
            SteamR: require('./SteamR.js')
        }
    };

    var TStreamsBonsaiSerializer = require('./TStreamsBonsaiSerializer.js');

    /// <param name="serializedQuery">serialized query ready to be fed into tstream for processing</param>
    /// <param name="jsonInputs">
    /// collection of input sample data, with thedirasd documented structure
    /// [ { name: "input name", content: [ "an array of event objects to process" ]  } ]
    /// </param>
    var results = {};
    var errors = [];
    var inputs = {};
    var outputs = {};
    var inputDefinition = {};
    var laststepname = {}; // for remove previous result events
    var referenceDataStartTime = 0; 

    exports.startTStreamsQuery = function (serializedQuery) {
        // global.Shell.Diagnostics.Telemetry.traceEvent("RunTStream", global.StreamAnalyticsExtension.name, "StartTStream");
        // global.Shell.Diagnostics.Telemetry.timerStart("StreamAnalytics.startTStreamQuery");

        // Reset the engine
        TStreams.reset();

        // Subscribe error messages
        TStreams.subscribeMessageStream(function (event) {
            if (!!event.payload && !!event.payload.level && event.payload.level === TStreams.Diagnostics.Level.error) {
                errors.push(event.payload);
            }
        });

        serializedQuery.Steps.forEach(function (step) {
            step.Inputs.forEach(function (input) {
                if (!inputs.hasOwnProperty(input.Name) && !outputs.hasOwnProperty(input.Name)) {
                    inputs[input.Name] = TStreams.createInput(input.Name);
                    inputDefinition[input.Name] = input;
                }
            });

            outputs[step.OutputName] = 1;

            if (step.IsLast) {
                results[step.StepName] = [];
                laststepname[step.StepName] = [];
                TStreams.createOutput(step.StepName, function (event) {
                    pushResult(event, step.StepName);
                });
            } else {
                TStreams.createOutput(step.OutputName);
            }
        });

        // Now deserialize and deploy all queries
        serializedQuery.Steps.forEach(function (step) {
            TStreams.deploy(TStreamsBonsaiSerializer.deserializeSteamRToTStreams(step.Expression)());
        });

        // This call is blocking until all events are processed
        // this.addInputs();

        // global.Shell.Diagnostics.Telemetry.timerStopAndLog("StreamAnalytics.startTStreamQuery");

        // global.Shell.Diagnostics.Telemetry.traceEvent("RunTStream", global.StreamAnalyticsExtension.name, "TStream Output " + (!!this.results ? this.results.length : "no") + " result rows and " + (!!this.errors ? this.errors.length : "no") + " errors");
    }

    exports.addUDFfunction = function (javaScriptFunction) {
        Microsoft.EventProcessing.SteamR.HostedFunctions.HostedFunctionBinding.registeredFunctions = javaScriptFunction;
    } 

    exports.addReorderLatency = function (latency) {
        Object.keys(inputs).forEach((val) => {
            inputs[val].setReorderLatency(latency);
        });
    }

    exports.addReorderPolicy = function(policy) {
        Object.keys(inputs).forEach((val) => {
            inputs[val].setReorderPolicy(policy);
        });
    }

    exports.addInputs = function (jsonInputs) {
        for (var key in laststepname) {
            results[key] = [];
        }
        jsonInputs.forEach(function (jsonInput) {
            // Only add the input items if it was used in a defined in a compiled step
            jsonInput.name = jsonInput.name.toLowerCase();
            var definition = inputDefinition[jsonInput.name];

            if (!!definition) {
                if (definition.InputType === "Reference") {
                    addRefInput(jsonInput.name, jsonItemsToTStreamsInput(jsonInput.content, definition));
                } else {
                    addInput(jsonInput.name, jsonItemsToTStreamsInput(jsonInput.content, definition));
                }
            }
        });

        var result = {
            errors: errors,
            results: {}
        };

        for (var outputName in results) {
            if (results.hasOwnProperty(outputName)) {
                result.results[outputName] = eventsToJsonResults(results[outputName]);
            }
        }

        return result;
    }

    function pushResult(event, outputName) {
        results[outputName].push(event);
    }

    function genenerateOuputCallback(output) {
        return function (event) {
            output.push(event);
        };
    }

    function addInput(inputName, events) {
        // global.Shell.Diagnostics.Telemetry.traceEvent("RunTStream", global.StreamAnalyticsExtension.name, "Add data stream input '" + inputName + "' which has " + (!!events ? events.length : "no") + " rows");
        var testDateTime = new Date();
        events.forEach(function (event) {
            insertEvent(inputName, event, testDateTime);
        });

        ///endOfStream(inputName);
    }

    function addRefInput(inputName, events) {
        // global.Shell.Diagnostics.Telemetry.traceEvent("RunTStream", global.StreamAnalyticsExtension.name, "Add reference data input '" + inputName + "' which has " + (!!events ? events.length : "no") + " rows");     
        events.forEach(function (event) {
            inputs[inputName].insertEdgeEvent(event, referenceDataStartTime);
        });
        endOfStream(inputName);
    }

    function insertEvent(inputName, event, testDateTime) {
        var timestamp = null, timestampFunction;

        if (inputDefinition[inputName] && inputDefinition[inputName].TimestampExpression) {
            timestampFunction = TStreamsBonsaiSerializer.deserializeSteamRToTStreams(inputDefinition[inputName].TimestampExpression);
            timestamp = timestampFunction(event);
        }

        if (inputs.hasOwnProperty(inputName)) {
            if (typeof (timestamp) === "undefined" || !timestamp) {
                inputs[inputName].insertEvent(event, testDateTime);
            } else {
                inputs[inputName].insertPointEvent(event, timestamp);
            }
        }
    }

    function endOfStream(inputName) {
        if (inputs.hasOwnProperty(inputName)) {
            inputs[inputName].flush();
        }
    }

    function _createJsonResult(payload) {
        var result, key, mapping;

        if (Array.isArray(payload)) {
            return payload.map(_createJsonResult);
        } else if (payload instanceof Microsoft.EventProcessing.SteamR.Sql.ValueArray) {
            return payload._values.map(_createJsonResult);
        } else if (isNestedObject(payload)) {
            if (payload instanceof Microsoft.EventProcessing.SteamR.Sql.CollectionBasedRecord) {
                result = {};

                for (key in payload._mappings) {
                    if (payload._mappings.hasOwnProperty(key)) {
                        mapping = payload._mappings[key];
                        result[key] = _createJsonResult(payload._members[mapping]);
                    }
                }

                return result;
            }
        }
        return payload === undefined ? null : payload;
    }

    function eventsToJsonResults(events) {
        if (events && events.length) {
            return events.map(function (event) {
                return _createJsonResult(event.payload);
            });
        } else {
            return [];
        }
    }

    function _convertPayloadField(columnValue, schemaType) {
        switch (schemaType) {
            case "System.DateTime":
                var momentJsDate = new moment(columnValue);
                return momentJsDate.isValid() ? momentJsDate.toDate() : columnValue;
            case "System.Double":
                return parseFloat(columnValue);
            case "System.Long":
                return parseInt(columnValue, 10);
            default:
                return columnValue;
        }
    }

    function _createTStreamsField(jsonField) {
        if (Array.isArray(jsonField)) {
            return new Microsoft.EventProcessing.SteamR.Sql.ValueArray(jsonField.map(_createTStreamsField));
        } else if (isNestedObject(jsonField)) {
            return createTStreamsEvent(jsonField, null);
        } else {
            return jsonField;
        }
    }

    function _createTStreamsSchema(jsonItem, inputDefinition) {
        var ordinal,
            nextIndex = 0,
            schema = Microsoft.EventProcessing.SteamR.Sql.createEmptySchema();

        if (inputDefinition) {
            for (ordinal in inputDefinition.Schema.Ordinals) {
                if (inputDefinition.Schema.Ordinals.hasOwnProperty(ordinal)) {
                    schema.properties[ordinal] = nextIndex++;
                    schema.strict = inputDefinition.Schema.IsStrict;
                    schema.timestamp = inputDefinition.Schema.timestamp;
                    schema.typeSchema = inputDefinition.Schema.TypeSchema;
                }
            }
        }

        createJsonColumns(jsonItem).forEach(function (column) {
            var lowerCaseColumn = column.toLowerCase();
            if (!schema.properties.hasOwnProperty(lowerCaseColumn)) {
                schema.properties[lowerCaseColumn] = nextIndex++;
            }
        });

        return schema;
    }

    function checkSchema(jsonItem, schema) {
        var inputcolumns = [];

        inputcolumns = createJsonColumnsWithLowerCase(jsonItem);
        for (var key in schema.properties) {
            if (schema.strict && inputcolumns.indexOf(key) == -1) {
                return true;
            }
        }
        return false;
    }

    function createTStreamsEvent(jsonItem, inputDefinition) {
        var schema = _createTStreamsSchema(jsonItem, inputDefinition),
            inputPayload = Microsoft.EventProcessing.SteamR.Sql.createRecord(schema),
            key,
            lowerCaseKey,
            value,
            hasLessColumn;

        hasLessColumn = checkSchema(jsonItem, schema);

            for (key in jsonItem) {
                if (jsonItem.hasOwnProperty(key)) {
                    value = jsonItem[key];
                    lowerCaseKey = key.toLowerCase();

                    if (value === null) {
                        value = undefined;
                    } else if (inputDefinition && inputDefinition.Schema.TypeSchema[lowerCaseKey]) {
                        value = _convertPayloadField(value, inputDefinition.Schema.TypeSchema[lowerCaseKey]);
                    } else if (isNestedObject(value)) {
                        value = _createTStreamsField(value);
                    } else if (typeof value === "boolean") {
                        value = value ? 1 : 0;
                    }

                    inputPayload.add(lowerCaseKey, value);
                }
            }

        return hasLessColumn ? undefined : inputPayload;
    }

    function jsonItemsToTStreamsInput(jsonItems, inputDefinition) {
        var events = jsonItems.map(function (jsonItem) {
            return createTStreamsEvent(jsonItem, inputDefinition);
        });

        for (var i = 0; i < events.length; i++) {
            if (typeof events[i] === "undefined") {
                events.splice(i, 1);
                i--;
            }
        }
        return events;
    }

    function createJsonColumns(jsonItem) {
        var column, columns = [];

        for (column in jsonItem) {
            if (jsonItem.hasOwnProperty(column)) {
                columns.push(column);
            }
        }

        return columns;
    }

    function createJsonColumnsWithLowerCase(jsonItem) {
        var column, columns = [];
        for (column in jsonItem) {
            if (jsonItem.hasOwnProperty(column)) {
                columns.push(column.toLowerCase());
            }
        }
        return columns;
    }

    function isNestedObject(value) {
        return typeof value === "object" && value !== null && !(value instanceof Date);
    }

})(typeof (exports) === "undefined" ? (this.TStreamsMain = {}) : exports);
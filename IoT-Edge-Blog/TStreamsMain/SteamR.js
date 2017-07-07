var Microsoft;
(function (Microsoft) {
    var EventProcessing;
    (function (EventProcessing) {
        var SteamR;
        (function (SteamR) {
            if (!Object.keys) {
                var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable("toString");
                var dontEnums = [
                    "toString",
                    "toLocaleString",
                    "valueOf",
                    "hasOwnProperty",
                    "isPrototypeOf",
                    "propertyIsEnumerable",
                    "constructor"
                ];
                var dontEnumsLength = dontEnums.length;
                Object.keys = (o) => {
                    if (typeof o !== "object" && (typeof o !== "function" || o === null)) {
                        throw new TypeError("Object.keys called on non-object");
                    }
                    var result = [];
                    for (var prop in o) {
                        if (o.hasOwnProperty(prop)) {
                            result.push(prop);
                        }
                    }
                    if (hasDontEnumBug) {
                        for (var i = 0; i < dontEnumsLength; i++) {
                            if (o.hasOwnProperty(dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            }
            if (typeof exports !== "undefined" &&
                typeof module !== "undefined" &&
                typeof module.exports !== "undefined") {
                exports = module.exports = Microsoft.EventProcessing.SteamR;
                _tstreams = require("./TStreams.js");
                _moment = require("./moment.js");
            }
            else {
                _tstreams = TStreams;
                _moment = moment;
            }
            var Contracts;
            (function (Contracts) {
                var ReferenceDataSourceExtensions;
                (function (ReferenceDataSourceExtensions) {
                    function fromName(name, id) {
                        return _tstreams.fromInput(name, id);
                    }
                    ReferenceDataSourceExtensions.fromName = fromName;
                    function select(source, selector) {
                        return source.select(selector);
                    }
                    ReferenceDataSourceExtensions.select = select;
                })(ReferenceDataSourceExtensions = Contracts.ReferenceDataSourceExtensions || (Contracts.ReferenceDataSourceExtensions = {}));
                class IsFirst {
                    constructor(duration) {
                        this._intervalId = -1;
                        this._duration = duration;
                    }
                    cleanup(timestamp) {
                    }
                    update(payload, included, timestamp) {
                        if (!included) {
                            return 0;
                        }
                        var intervalId = Math.floor((timestamp - 1) / this._duration);
                        if (intervalId >= this._intervalId) {
                            this._intervalId = intervalId + 1;
                            return 1;
                        }
                        return 0;
                    }
                }
                Contracts.IsFirst = IsFirst;
                class Lag {
                    constructor(timeout, order, defaultValue, typeChecker) {
                        this._checkTypes = true;
                        this._timeout = timeout;
                        this._order = order;
                        this._defaultValue = defaultValue;
                        this._typeChecker = typeChecker;
                        this._queue = [];
                        this._checkTypes = this._checkTypes && (typeof defaultValue !== "undefined") && (defaultValue !== null);
                        this._checkTypes = this._checkTypes && (typeof typeChecker !== "undefined") && (typeChecker !== null);
                    }
                    cleanup(timestamp) {
                        var queue = this._queue;
                        while (queue.length > 0 && queue[0].timestamp < timestamp) {
                            queue.shift();
                        }
                    }
                    update(payload, included, timestamp) {
                        if (this._checkTypes && (typeof payload !== "undefined") && (payload !== null)) {
                            this._typeChecker(this._defaultValue, payload);
                            this._checkTypes = false;
                        }
                        var queue = this._queue;
                        var result = this._defaultValue;
                        if (this._order == 0 && included) {
                            result = payload;
                        }
                        else if (queue.length >= this._order && queue.length > 0 && queue[0].timestamp >= timestamp) {
                            result = queue[0].value;
                        }
                        this.cleanup(timestamp);
                        if (included) {
                            if (queue.length >= this._order && queue.length > 0) {
                                queue.shift();
                            }
                            queue.push({ timestamp: timestamp + this._timeout, value: payload });
                        }
                        return result;
                    }
                }
                Contracts.Lag = Lag;
            })(Contracts = SteamR.Contracts || (SteamR.Contracts = {}));
            var Sql;
            (function (Sql) {
                class ErrorStrings {
                }
                ErrorStrings.keysCalledOnNonObject = "Object.keys called on non - object";
                ErrorStrings.operatorNotAllowedForOperands = "{0} is not allowed for operands of type '{1}' and '{2}' in expression '{3}'.";
                ErrorStrings.unsuportedKeyTypeInRecord = "Unsuported key type detected in CollectionBasedRecord.";
                ErrorStrings.cannotUpdateProperties = "Updating of properties isn't supported.";
                ErrorStrings.cannotCastValueToType = "Cannot cast value '{0}' to type '{1}' in expression '{2}'.";
                ErrorStrings.cannotCastTypeToType = "Cannot cast type '{0}' to type '{1}' in expression '{2}'.";
                ErrorStrings.cannotCastToRecord = "Unable to cast type '{0}' to 'Record'.";
                ErrorStrings.cannotCastToArray = "Unable to cast type '{0}' to 'Array'.";
                ErrorStrings.negationNotSupportedForType = "Negation is not applicable to type '{0}' in expression '{1}'.";
                ErrorStrings.absoluteNotSupportedForType = "Function 'abs' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.exponentialNotSupportedForType = "Function 'exp' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.floorNotSupportedForType = "Function 'floor' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.ceilingNotSupportedForType = "Function 'ceiling' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.signNotSupportedForType = "Function 'sign' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.squareNotSupportedForType = "Function 'square' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.sqrtNotSupportedForType = "Function 'sqrt' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.sqrtExpectsNonNegative = "Function 'sqrt' expects non negative argument value in expression '{0}'.";
                ErrorStrings.powerNotSupportedForType = "Function 'power' has invalid types '{0}' and '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.divisionByZeroNotSupportedForType = "Division by zero is not supported for operands of type '{0}'.";
                ErrorStrings.moduloZeroNotSupportedForType = "Modulo zero is not supported for operands of type '{0}'.";
                ErrorStrings.comparisonNotSupportedForType = "Comparison is not allowed for operands of type '{0}' and '{1}' in expression '{2}'.";
                ErrorStrings.unexpectedType = "Unexpected type. Parameter name: exp";
                ErrorStrings.firstParameterHasWrongType = "First parameter of '{0}' in expression '{1}' has invalid type '{2}'. '{3}' is expected.";
                ErrorStrings.secondParameterHasWrongType = "Second parameter of '{0}' in expression '{1}' has invalid type '{2}'. '{3}' is expected.";
                ErrorStrings.thirdParameterHasWrongType = "Third parameter of '{0}' in expression '{1}' has invalid type '{2}'. '{3}' is expected.";
                ErrorStrings.lengthMustBePositive = "Length parameter of 'Substring' in expression '{0}' is not allowed to be negative: '{1}'.";
                ErrorStrings.parameterStringOfConcatNotDefined = "The parameter strings of 'Concat' in expression '{0}' is not defined.";
                ErrorStrings.wrongNumberOfParametersInConcat = "At least two parameters should be provided to 'Concat' in expression '{0}'.";
                ErrorStrings.invalidOperandsTypesInLike = "'Like' in expression '{0}' has operands of invalid types '{1}' and '{2}'. 'nvarchar(max)' is expected.";
                ErrorStrings.ncharNotSupportedForType = "Function 'nchar' is not applicable to type '{0}' in expression '{1}'. 'bigint' or 'float' is expected.";
                ErrorStrings.dateTimePartsMustBeBigint = "'DateTimeFromParts' in expression '{0}' expects all parameters to be of type 'bigint'.";
                ErrorStrings.wrongYearRange = "The 'year' parameter in 'DateTimeFromParts' in expression '{0}' needs to be an integer higher than 1900.";
                ErrorStrings.wrongMonthRange = "The 'month' parameter in 'DateTimeFromParts' in expression '{0}' needs to be an integer between 1 and 12.";
                ErrorStrings.wrongDayRange = "The 'day' parameter in 'DateTimeFromParts' in expression '{0}' needs to be an integer between 1 and {1}.";
                ErrorStrings.wrongHourRange = "The 'hour' parameter in 'DateTimeFromParts' in expression '{0}' needs to be an integer between 0 and 24.";
                ErrorStrings.wrongMinuteRange = "The 'minute' parameter in 'DateTimeFromParts' in expression '{0}' needs to be an integer between 0 and 60.";
                ErrorStrings.wrongSecondRange = "The 'second' parameter in 'DateTimeFromParts' in expression '{0}' needs to be an integer between 0 and 60.";
                ErrorStrings.wrongMillisecondRange = "The 'millisecond' parameter in 'DateTimeFromParts' in expression '{0}' needs to be an integer between 0 and 1000.";
                ErrorStrings.wrongsecondParameterOfDateAdd = "Second parameter of 'DateAdd' in expression '{0}' is not an integer number: '{1}'. ";
                ErrorStrings.submillisecondResolutionNotSupported = "'DateAdd' in expression '{0}' uses sub millisecond resolution not supported by JavaScript.";
                ErrorStrings.unknownTimeIntervalUnit = "Unknown time interval '{0}' in expression '{1}'.";
                ErrorStrings.notSupportedPart = "Part descriptor isn't supported.";
                ErrorStrings.orderingNotSupported = "Type '{0}' currently does not support ordering.";
                ErrorStrings.orderingBetween2TypesNotSupported = "Ordering between type '{0}' and type '{1}' is not supported.";
                ErrorStrings.orderByWithoutIdentifiers = "'Order by' does not contain any valid identifiers.";
                ErrorStrings.timestampCanNotBeNull = "Timestamp property cannot be null.";
                ErrorStrings.javaScriptRuntimeError = "Function '{0}' resulted in an error: '{1}'";
                ErrorStrings.javaScriptRuntimeErrorWithStack = "Function '{0}' resulted an error: '{1}' Stack: {2}";
                ErrorStrings.unsupportedJavaScriptReturnTypeError = "Function '{0}' returns a value of unsupported type: '{1}'. Only 'Number', 'Date', 'String', 'Object' and 'Array' types are supported.";
                ErrorStrings.javaScriptMustContainFunctionDefinition = "Function '{0}' has invalid script definition. The body of the script must be a function. Example: function() { }. Found '{1}' instead.";
                Sql.ErrorStrings = ErrorStrings;
                class Utils {
                    static formatString(text, ...params) {
                        var result = text;
                        for (var i = 0; i < params.length; i++) {
                            var val = params[i];
                            if (typeof val === "undefined" || val === null) {
                                val = "";
                            }
                            result = result.replace("{" + i + "}", val);
                        }
                        return result;
                    }
                }
                Sql.Utils = Utils;
                if (!Object.keys) {
                    var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable("toString");
                    var dontEnums = [
                        "toString",
                        "toLocaleString",
                        "valueOf",
                        "hasOwnProperty",
                        "isPrototypeOf",
                        "propertyIsEnumerable",
                        "constructor"
                    ];
                    var dontEnumsLength = dontEnums.length;
                    Object.keys = (o) => {
                        if (typeof o !== "object" && (typeof o !== "function" || o === null)) {
                            throw new TypeError(ErrorStrings.keysCalledOnNonObject);
                        }
                        var result = [];
                        for (var prop in o) {
                            if (o.hasOwnProperty(prop)) {
                                result.push(prop);
                            }
                        }
                        if (hasDontEnumBug) {
                            for (var i = 0; i < dontEnumsLength; i++) {
                                if (o.hasOwnProperty(dontEnums[i])) {
                                    result.push(dontEnums[i]);
                                }
                            }
                        }
                        return result;
                    };
                }
                function bitwiseNot(a) {
                    return (eitherNull([a])) ? a : ~a;
                }
                Sql.bitwiseNot = bitwiseNot;
                function not(a) {
                    return (eitherNull([a])) ? a : !a;
                }
                Sql.not = not;
                function minus(a) {
                    return eitherNull([a]) ? a : -a;
                }
                Sql.minus = minus;
                function plus(a) {
                    return eitherNull([a]) ? a : +a;
                }
                Sql.plus = plus;
                function add(a, b) {
                    return eitherNull([a, b]) ? undefined : a + b;
                }
                Sql.add = add;
                function subtract(a, b) {
                    return eitherNull([a, b]) ? undefined : a - b;
                }
                Sql.subtract = subtract;
                function multiply(a, b) {
                    return eitherNull([a, b]) ? undefined : a * b;
                }
                Sql.multiply = multiply;
                function divide(a, b) {
                    return eitherNull([a, b]) ? undefined : a / b;
                }
                Sql.divide = divide;
                function modulo(a, b) {
                    return eitherNull([a, b]) ? undefined : a % b;
                }
                Sql.modulo = modulo;
                function left(a, b) {
                    return eitherNull([a, b]) ? undefined : a << b;
                }
                Sql.left = left;
                function right(a, b) {
                    return eitherNull([a, b]) ? undefined : a >> b;
                }
                Sql.right = right;
                function lt(a, b) {
                    return eitherNull([a, b]) ? undefined : a < b;
                }
                Sql.lt = lt;
                function leq(a, b) {
                    return eitherNull([a, b]) ? undefined : a <= b;
                }
                Sql.leq = leq;
                function gt(a, b) {
                    return eitherNull([a, b]) ? undefined : a > b;
                }
                Sql.gt = gt;
                function geq(a, b) {
                    return eitherNull([a, b]) ? undefined : a >= b;
                }
                Sql.geq = geq;
                function or(a, b) {
                    return (eitherNull([a])) ? (b || a) : (a || b);
                }
                Sql.or = or;
                function and(a, b) {
                    return (eitherNull([a])) ? (b && a) : (a && b);
                }
                Sql.and = and;
                function xor(a, b) {
                    return (eitherNull([a, b])) ? undefined : a ^ b;
                }
                Sql.xor = xor;
                function checkTypes(context, left, right, name) {
                    if (typeof left !== "number" ||
                        typeof right !== "number") {
                        throw new TypeError(Utils.formatString(ErrorStrings.operatorNotAllowedForOperands, name, getSqlType(left), getSqlType(right), context.expression));
                    }
                }
                function eitherNull(values) {
                    var length = values.length;
                    for (var i = 0; i < length; i++) {
                        var value = values[i];
                        if (typeof value === "undefined" ||
                            value === null) {
                            return true;
                        }
                    }
                    return false;
                }
                function getSqlType(value) {
                    if (value instanceof CollectionBasedRecord) {
                        return "record";
                    }
                    if (value instanceof ValueArray) {
                        return "array";
                    }
                    switch (typeof value) {
                        case "number":
                            return (value % 1 === 0) ? "bigint" : "float";
                        case "string":
                            return "nvarchar(max)";
                        case "object":
                            return (value instanceof Date) ? "datetime" : "any";
                        default:
                            return "unknown type";
                    }
                }
                function createEmptySchema() {
                    return { index: undefined, strict: undefined, timestamp: undefined, properties: {}, nested: {} };
                }
                Sql.createEmptySchema = createEmptySchema;
                function createRecord(schema) {
                    return new CollectionBasedRecord(schema);
                }
                Sql.createRecord = createRecord;
                function createArray(values, schema) {
                    return new ValueArray(values, schema);
                }
                Sql.createArray = createArray;
                class Record {
                    static create(schema, values) {
                        return new CollectionBasedRecord(schema, values);
                    }
                }
                Sql.Record = Record;
                class CollectionBasedRecord {
                    constructor(schema, values) {
                        this._mappings = {};
                        this._members = [];
                        if (typeof schema !== "undefined") {
                            for (var key in schema.properties) {
                                if (schema.properties.hasOwnProperty(key)) {
                                    this._mappings[key.toLowerCase()] = schema.properties[key];
                                }
                            }
                        }
                        if (typeof (values) !== "undefined") {
                            for (var i = 0; i < values.length; i++) {
                                this.add(i, values[i]);
                            }
                        }
                    }
                    get_Item(key) {
                        var index;
                        if (typeof (key) === "number") {
                            index = key;
                        }
                        else {
                            if (typeof (key) !== "string") {
                                throw new TypeError(ErrorStrings.unsuportedKeyTypeInRecord);
                            }
                            key = key.toLowerCase();
                            if (this._mappings.hasOwnProperty(key) === false) {
                                return undefined;
                            }
                            index = this._mappings[key];
                        }
                        return this._members[index];
                    }
                    add(key, value) {
                        var index;
                        if (typeof (key) === "number") {
                            index = key;
                        }
                        else {
                            if (typeof (key) !== "string") {
                                throw new TypeError(ErrorStrings.unsuportedKeyTypeInRecord);
                            }
                            key = key.toLowerCase();
                            if (this._mappings.hasOwnProperty(key) === false) {
                                var newIndex = Object.keys(this._mappings).length;
                                this._mappings[key] = newIndex;
                            }
                            index = this._mappings[key];
                        }
                        if (typeof this._members[index] !== "undefined") {
                            throw new Error(ErrorStrings.cannotUpdateProperties);
                        }
                        this._members[index] = value;
                        return this;
                    }
                    getPropertyNames() {
                        var results = [];
                        for (var propertyName in this._mappings) {
                            if (this._mappings.hasOwnProperty(propertyName)) {
                                results.push(propertyName);
                            }
                        }
                        return results;
                    }
                    unionLeft(right) {
                        var result = new CollectionBasedRecord();
                        for (var propertyName in this._mappings) {
                            if (this._mappings.hasOwnProperty(propertyName)) {
                                result._mappings[propertyName] = this._mappings[propertyName];
                            }
                        }
                        for (var i = 0; i < this._members.length; i++) {
                            result._members[i] = this._members[i];
                        }
                        var ri = this._members.length;
                        for (var rightPropertyName in right._mappings) {
                            if (right._mappings.hasOwnProperty(rightPropertyName) &&
                                !result._mappings.hasOwnProperty(rightPropertyName)) {
                                result._mappings[rightPropertyName] = ri;
                                result._members[ri++] = right.get_Item(rightPropertyName);
                            }
                        }
                        return result;
                    }
                    toString() {
                        return JSON.stringify(this);
                    }
                    equals(that) {
                        for (var propertyName in this._mappings) {
                            if (this._mappings.hasOwnProperty(propertyName)) {
                                if (!that._mappings.hasOwnProperty(propertyName)) {
                                    return false;
                                }
                            }
                        }
                        var length = this._members.length;
                        if (length != that._members.length) {
                            return false;
                        }
                        for (var i = 0; i < length; i++) {
                            var x = this._members[i];
                            var y = that._members[i];
                            if (!Arithmetics.equal(x, y)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    clone() {
                        var copy = new CollectionBasedRecord();
                        for (var propertyName in this._mappings) {
                            if (this._mappings.hasOwnProperty(propertyName)) {
                                copy._mappings[propertyName] = this._mappings[propertyName];
                            }
                        }
                        for (var i = 0; i < this._members.length; i++) {
                            copy._members[i] = this._members[i];
                        }
                        return copy;
                    }
                }
                Sql.CollectionBasedRecord = CollectionBasedRecord;
                class ValueArray {
                    constructor(values, schema) {
                        this._values = (!!values) ? values : [];
                    }
                    length() {
                        return this._values.length;
                    }
                    get(index) {
                        return this._values[index];
                    }
                    static select(valueArray, selectorCallback) {
                        if (!!valueArray && !!(valueArray._values)) {
                            return valueArray._values.map(selectorCallback);
                        }
                        return [];
                    }
                    static selectWithDefault(valueArray, selectorCallback, defaultCallback) {
                        var result;
                        if (!!valueArray && !!(valueArray._values)) {
                            result = valueArray._values.map(selectorCallback);
                            if (!!result && result.length > 0) {
                                return result;
                            }
                        }
                        result = [defaultCallback()];
                        return result;
                    }
                    toString() {
                        return JSON.stringify(this._values);
                    }
                }
                Sql.ValueArray = ValueArray;
                class CompilerPosition {
                    constructor(startLine, startColumn, startOffset, endLine, endColumn, endOffset, expression) {
                        this.startLine = startLine;
                        this.startColumn = startColumn;
                        this.startOffset = startOffset;
                        this.endLine = endLine;
                        this.endColumn = endColumn;
                        this.endOffset = endOffset;
                        this.expression = expression;
                    }
                }
                Sql.CompilerPosition = CompilerPosition;
                class Cast {
                    static toDouble(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value === "number") {
                            return value;
                        }
                        if (typeof value === "string") {
                            var result = +value;
                            if (!isNaN(result)) {
                                return result;
                            }
                            throw new TypeError(Utils.formatString(ErrorStrings.cannotCastValueToType, value, "float", context.expression));
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastTypeToType, getSqlType(value), "float", context.expression));
                    }
                    static toLong(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value === "number") {
                            return value - value % 1;
                        }
                        if (typeof value === "string") {
                            var result = +value;
                            if (!isNaN(result)) {
                                return result - result % 1;
                            }
                            throw new TypeError(Utils.formatString(ErrorStrings.cannotCastValueToType, value, "bigint", context.expression));
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastTypeToType, getSqlType(value), "bigint", context.expression));
                    }
                    static toStr(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value === "string") {
                            return value;
                        }
                        if (typeof value === "number") {
                            return "" + value;
                        }
                        if (value instanceof Date) {
                            return value.toISOString();
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastTypeToType, getSqlType(value), "nvarchar(max)", context.expression));
                    }
                    static toDateTime(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof Date) {
                            return value;
                        }
                        if (typeof value === "string") {
                            var date = _moment.utc(value);
                            if (date.isValid()) {
                                return date.toDate();
                            }
                            throw new TypeError(Utils.formatString(ErrorStrings.cannotCastValueToType, value, "datetime", context.expression));
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastTypeToType, getSqlType(value), "datetime", context.expression));
                    }
                    static toRecordInternal(value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof CollectionBasedRecord) {
                            return value;
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastToRecord, typeof value));
                    }
                    static toArrayInternal(value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof ValueArray) {
                            return value;
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastToArray, typeof value));
                    }
                    static toRecord(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof CollectionBasedRecord) {
                            return value;
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastTypeToType, getSqlType(value), 'record', context.expression));
                    }
                    static toArray(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof ValueArray) {
                            return value;
                        }
                        throw new TypeError(Utils.formatString(ErrorStrings.cannotCastTypeToType, getSqlType(value), 'array', context.expression));
                    }
                    static getObjectType(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        return getSqlType(value);
                    }
                }
                Sql.Cast = Cast;
                class TryCast {
                    static toDouble(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value === "number") {
                            return value;
                        }
                        if (typeof value === "string") {
                            var result = +value;
                            if (!isNaN(result)) {
                                return result;
                            }
                            return undefined;
                        }
                        return undefined;
                    }
                    static toLong(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value === "number") {
                            return value - value % 1;
                        }
                        if (typeof value === "string") {
                            var result = +value;
                            if (!isNaN(result)) {
                                return result - result % 1;
                            }
                            return undefined;
                        }
                        return undefined;
                    }
                    static toStr(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value === "string") {
                            return value;
                        }
                        if (typeof value === "number") {
                            return "" + value;
                        }
                        if (value instanceof Date) {
                            return value.toISOString();
                        }
                        return undefined;
                    }
                    static toDateTime(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof Date) {
                            return value;
                        }
                        if (typeof value === "string") {
                            var date = _moment.utc(value);
                            if (date.isValid()) {
                                return date.toDate();
                            }
                            return undefined;
                        }
                        return undefined;
                    }
                    static toRecord(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof CollectionBasedRecord) {
                            return value;
                        }
                        return undefined;
                    }
                    static toArray(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (value instanceof ValueArray) {
                            return value;
                        }
                        return undefined;
                    }
                }
                Sql.TryCast = TryCast;
                class Arithmetics {
                    static not(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        return !value;
                    }
                    static add(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        checkTypes(context, left, right, "Addition");
                        return left + right;
                    }
                    static subtract(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        checkTypes(context, left, right, "Subtraction");
                        return left - right;
                    }
                    static negate(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.negationNotSupportedForType, getSqlType(value), context.expression));
                        }
                        return -(value);
                    }
                    static absolute(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.absoluteNotSupportedForType, getSqlType(value), context.expression));
                        }
                        return Math.abs(value);
                    }
                    static exponential(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.exponentialNotSupportedForType, getSqlType(value), context.expression));
                        }
                        return Math.exp(value);
                    }
                    static floor(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.floorNotSupportedForType, getSqlType(value), context.expression));
                        }
                        return Math.floor(value);
                    }
                    static ceiling(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.ceilingNotSupportedForType, getSqlType(value), context.expression));
                        }
                        return Math.ceil(value);
                    }
                    static sign(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.ceilingNotSupportedForType, getSqlType(value), context.expression));
                        }
                        if (value < 0) {
                            return -1;
                        }
                        if (value === 0) {
                            return 0;
                        }
                        return 1;
                    }
                    static power(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        if (typeof left !== "number" || typeof right !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.powerNotSupportedForType, getSqlType(left), getSqlType(right), context.expression));
                        }
                        return Math.pow(left, right);
                    }
                    static square(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.squareNotSupportedForType, getSqlType(value), context.expression));
                        }
                        return Math.pow(value, 2);
                    }
                    static sqrt(context, value) {
                        if (eitherNull([value])) {
                            return undefined;
                        }
                        if (typeof value !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.sqrtNotSupportedForType, getSqlType(value), context.expression));
                        }
                        if (value < 0) {
                            throw new RangeError(Utils.formatString(ErrorStrings.sqrtExpectsNonNegative, context.expression));
                        }
                        return Math.sqrt(value);
                    }
                    static divide(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        checkTypes(context, left, right, "Division");
                        if (right === 0) {
                            throw new TypeError(Utils.formatString(ErrorStrings.divisionByZeroNotSupportedForType, getSqlType(left)));
                        }
                        return left / right;
                    }
                    static modulo(context, left, right) {
                        if (eitherNull([left, right])) {
                            return null;
                        }
                        checkTypes(context, left, right, "Modulo");
                        if (right === 0) {
                            throw new TypeError(Utils.formatString(ErrorStrings.moduloZeroNotSupportedForType, getSqlType(left)));
                        }
                        return left % right;
                    }
                    static multiply(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        checkTypes(context, left, right, "Multiply");
                        return left * right;
                    }
                    static normalizeForEquality(operand) {
                        return operand;
                    }
                    static equal(left, right) {
                        if (typeof left !== typeof right) {
                            return false;
                        }
                        if (left instanceof Date && right instanceof Date) {
                            return left.getTime() === right.getTime();
                        }
                        if (left instanceof CollectionBasedRecord && right instanceof CollectionBasedRecord) {
                            return left.equals(right);
                        }
                        return left === right;
                    }
                    static equalTo(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        if (typeof left !== typeof right) {
                            throw new TypeError(Utils.formatString(ErrorStrings.comparisonNotSupportedForType, getSqlType(left), getSqlType(right), context.expression));
                        }
                        return Arithmetics.equal(left, right);
                    }
                    static notEqual(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        return !Arithmetics.equalTo(context, left, right);
                    }
                    static between(context, first, second, third) {
                        if (eitherNull([first, second, third])) {
                            return undefined;
                        }
                        if (first instanceof Date && second instanceof Date && third instanceof Date) {
                            return first >= second && first <= third;
                        }
                        checkTypes(context, second, first, "Comparison");
                        checkTypes(context, first, third, "Comparison");
                        return first >= second && first <= third;
                    }
                    static greaterThan(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        if (left instanceof Date && right instanceof Date) {
                            return left > right;
                        }
                        checkTypes(context, left, right, "Comparison");
                        return left > right;
                    }
                    static greaterThanOrEqual(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        if (left instanceof Date && right instanceof Date) {
                            return left >= right;
                        }
                        checkTypes(context, left, right, "Comparison");
                        return left >= right;
                    }
                    static lessThan(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        if (left instanceof Date && right instanceof Date) {
                            return left < right;
                        }
                        checkTypes(context, left, right, "Comparison");
                        return left < right;
                    }
                    static lessThanOrEqual(context, left, right) {
                        if (eitherNull([left, right])) {
                            return undefined;
                        }
                        if (left instanceof Date && right instanceof Date) {
                            return left <= right;
                        }
                        checkTypes(context, left, right, "Comparison");
                        return left <= right;
                    }
                    static ensureEqualTypes(context, left, right, errorMsg) {
                        var throwException = false;
                        if (typeof left !== typeof right) {
                            throwException = true;
                        }
                        else if (typeof left === "object" && !(left instanceof Date && right instanceof Date)) {
                            throwException = true;
                        }
                        else if (typeof left === "number") {
                        }
                        if (throwException) {
                            throw new TypeError(Utils.formatString(errorMsg, getSqlType(left), getSqlType(right), context.expression));
                        }
                    }
                }
                Sql.Arithmetics = Arithmetics;
                class ExpressionEx {
                    static castToBool(exp) {
                        if (exp === null || exp === undefined || typeof (exp) === "boolean") {
                            return !!exp;
                        }
                        throw new TypeError(ErrorStrings.unexpectedType);
                    }
                }
                Sql.ExpressionEx = ExpressionEx;
                class StringEx {
                    static substring(context, expression, start, length) {
                        if (eitherNull([expression, start, length])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Substring", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        if (typeof start !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.secondParameterHasWrongType, "Substring", context.expression, getSqlType(expression), "bigint"));
                        }
                        if (typeof length !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.thirdParameterHasWrongType, "Substring", context.expression, getSqlType(expression), "bigint"));
                        }
                        if (start > expression.length) {
                            return "";
                        }
                        if (start < 1) {
                            length = Math.max(start + length - 1, 0);
                            start = 1;
                        }
                        if (length < 0) {
                            throw new RangeError(Utils.formatString(ErrorStrings.lengthMustBePositive, context.expression, length));
                        }
                        return expression.substr(start - 1, length);
                    }
                    static replace(context, strObj, oldValueObj, newValueObj) {
                        if (eitherNull([strObj, oldValueObj, newValueObj])) {
                            return undefined;
                        }
                        var str = Cast.toStr(context, strObj);
                        var oldValue = Cast.toStr(context, oldValueObj);
                        var newValue = Cast.toStr(context, newValueObj);
                        if (oldValue.length === 0) {
                            return str;
                        }
                        return str.replace(oldValue, newValue);
                    }
                    static concat(context, expressions) {
                        if (eitherNull([expressions])) {
                            throw new Error(Utils.formatString(ErrorStrings.parameterStringOfConcatNotDefined, context.expression));
                        }
                        if (expressions.length < 2) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongNumberOfParametersInConcat, context.expression));
                        }
                        var result = expressions.shift() || "";
                        var length = expressions.length;
                        for (var i = 0; i < length; i++) {
                            if (typeof (expressions[i]) !== "undefined" &&
                                expressions[i] !== null) {
                                result = result + expressions[i];
                            }
                        }
                        return result;
                    }
                    static len(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Len", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        return expression.length;
                    }
                    static lower(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Lower", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        return expression.toLowerCase();
                    }
                    static upper(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Upper", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        return expression.toUpperCase();
                    }
                    static leftTrim(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "LTrim", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        return expression.replace(StringEx.leftWhitespace, '');
                        ;
                    }
                    static trim(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Trim", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        return expression.trim();
                    }
                    static rightTrim(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "RTrim", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        return expression.replace(StringEx.rightWhitespace, '');
                    }
                    static unicode(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Unicode", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        if (0 === expression.length) {
                            return undefined;
                        }
                        return expression.codePointAt(0);
                    }
                    static nchar(context, expression) {
                        if (eitherNull([expression])) {
                            return undefined;
                        }
                        if (typeof expression !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.ncharNotSupportedForType, getSqlType(expression), context.expression));
                        }
                        expression = Math.floor(expression);
                        return String.fromCodePoint(expression);
                    }
                    static charIndex(context, expressionToFind, expressionToSearch, startIndex) {
                        if (eitherNull([expressionToFind, expressionToSearch])) {
                            return undefined;
                        }
                        if (typeof expressionToFind !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "CharIndex", context.expression, getSqlType(expressionToFind), "nvarchar(max)"));
                        }
                        if (typeof expressionToSearch !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.secondParameterHasWrongType, "CharIndex", context.expression, getSqlType(expressionToSearch), "nvarchar(max)"));
                        }
                        if (typeof startIndex !== "number" && typeof startIndex !== "undefined") {
                            throw new TypeError(Utils.formatString(ErrorStrings.thirdParameterHasWrongType, "CharIndex", context.expression, getSqlType(startIndex), "bigint"));
                        }
                        if (typeof startIndex === "undefined" ||
                            startIndex === null ||
                            startIndex <= 0) {
                            startIndex = 1;
                        }
                        return expressionToSearch.indexOf(expressionToFind, startIndex - 1) + 1;
                    }
                    static like(context, expression, pattern) {
                        if (eitherNull([expression, pattern])) {
                            return undefined;
                        }
                        if (typeof expression !== "string" || typeof pattern !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.invalidOperandsTypesInLike, context.expression, getSqlType(expression), getSqlType(pattern)));
                        }
                        var first = true;
                        var last = true;
                        if (pattern[0] === "%") {
                            pattern = pattern.slice(1);
                            first = false;
                        }
                        if (pattern[pattern.length - 1] === "%") {
                            pattern = pattern.substr(0, pattern.length - 1);
                            last = false;
                        }
                        pattern = pattern.replace(/%/g, ".*?");
                        pattern = pattern.replace(/_/g, ".");
                        pattern = pattern.replace(/\[/g, "[");
                        pattern = pattern.replace(/\]/g, "]");
                        pattern = pattern.replace(/\^/g, "^");
                        if (first && pattern.indexOf("^") !== 0) {
                            pattern = "^" + pattern;
                        }
                        if (last) {
                            pattern = pattern + "$";
                        }
                        return expression.search(pattern) > -1;
                    }
                    static patindex(context, pattern, expression) {
                        if (eitherNull([expression, pattern])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Patindex", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        if (typeof pattern !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.secondParameterHasWrongType, "Patindex", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        var first = true;
                        var last = true;
                        if (pattern[0] === "%") {
                            pattern = pattern.slice(1);
                            first = false;
                        }
                        if (pattern[pattern.length - 1] === "%") {
                            pattern = pattern.substr(0, pattern.length - 1);
                            last = false;
                        }
                        pattern = pattern.replace(/%/g, ".*?");
                        pattern = pattern.replace(/_/g, ".");
                        pattern = pattern.replace(/\[/g, "[");
                        pattern = pattern.replace(/\]/g, "]");
                        pattern = pattern.replace(/\^/g, "^");
                        if (first && pattern.indexOf("^") !== 0) {
                            pattern = "^" + pattern;
                        }
                        if (last) {
                            pattern = pattern + "$";
                        }
                        return expression.search(pattern) + 1;
                    }
                    static like2(context, expression, pattern) {
                        if (eitherNull([expression, pattern])) {
                            return undefined;
                        }
                        if (typeof expression !== "string" || typeof pattern !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.invalidOperandsTypesInLike, context.expression, getSqlType(expression), getSqlType(pattern)));
                        }
                        if (pattern.length === 0) {
                            return false;
                        }
                        pattern = StringEx.likeToRegexPattern(pattern);
                        return expression.search(new RegExp(pattern, "i")) > -1;
                    }
                    static patindex2(context, pattern, expression) {
                        if (eitherNull([expression, pattern])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "Patindex", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        if (typeof pattern !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.secondParameterHasWrongType, "Patindex", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        if (pattern.length === 0) {
                            return 0;
                        }
                        pattern = StringEx.likeToRegexPattern(pattern);
                        return expression.search(new RegExp(pattern, "i")) + 1;
                    }
                    static regExMatch(context, expression, pattern) {
                        if (eitherNull([expression, pattern])) {
                            return undefined;
                        }
                        if (typeof expression !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "RegExMatch", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        if (typeof pattern !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.secondParameterHasWrongType, "RegExMatch", context.expression, getSqlType(expression), "nvarchar(max)"));
                        }
                        try {
                            return expression.search(new RegExp(pattern, "i")) + 1;
                        }
                        catch (err) {
                            return 0;
                        }
                    }
                    static escapeRegex(pattern) {
                        return pattern.replace(/[-\\., *+?^$[\](){}!=|#<>:]/g, "\\$&");
                    }
                    static likeToRegexPattern(pattern) {
                        pattern = StringEx.escapeRegex(pattern);
                        var patternLength = pattern.length;
                        var result = "";
                        var i = 0;
                        for (; i < patternLength && pattern[i] === "%"; i++)
                            ;
                        if (i > 0) {
                            i--;
                        }
                        var isFirst = true;
                        for (; i < patternLength; i++) {
                            var isLast = i === (patternLength - 1);
                            if (pattern[i] === "%") {
                                if (!isFirst && !isLast) {
                                    result += ".*?";
                                }
                            }
                            else {
                                if (isFirst) {
                                    result += "^";
                                }
                                result += pattern[i] === "_" ? "." : pattern[i];
                                if (isLast) {
                                    result += "$";
                                }
                            }
                            isFirst = false;
                        }
                        return result;
                    }
                }
                StringEx.leftWhitespace = /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]*/;
                StringEx.rightWhitespace = /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]*$/;
                Sql.StringEx = StringEx;
                var DateInterval;
                (function (DateInterval) {
                    DateInterval[DateInterval["Year"] = 0] = "Year";
                    DateInterval[DateInterval["Quarter"] = 1] = "Quarter";
                    DateInterval[DateInterval["Month"] = 2] = "Month";
                    DateInterval[DateInterval["DayOfYear"] = 3] = "DayOfYear";
                    DateInterval[DateInterval["Day"] = 4] = "Day";
                    DateInterval[DateInterval["Week"] = 5] = "Week";
                    DateInterval[DateInterval["Weekday"] = 6] = "Weekday";
                    DateInterval[DateInterval["Hour"] = 7] = "Hour";
                    DateInterval[DateInterval["Minute"] = 8] = "Minute";
                    DateInterval[DateInterval["Second"] = 9] = "Second";
                    DateInterval[DateInterval["Millisecond"] = 10] = "Millisecond";
                    DateInterval[DateInterval["Microsecond"] = 11] = "Microsecond";
                    DateInterval[DateInterval["Nanosecond"] = 12] = "Nanosecond";
                })(DateInterval || (DateInterval = {}));
                var Intervals = {
                    "year": DateInterval.Year,
                    "yy": DateInterval.Year,
                    "yyyy": DateInterval.Year,
                    "quarter": DateInterval.Quarter,
                    "qq": DateInterval.Quarter,
                    "q": DateInterval.Quarter,
                    "month": DateInterval.Month,
                    "mm": DateInterval.Month,
                    "m": DateInterval.Month,
                    "dayofyear": DateInterval.DayOfYear,
                    "dy": DateInterval.DayOfYear,
                    "y": DateInterval.DayOfYear,
                    "day": DateInterval.Day,
                    "dd": DateInterval.Day,
                    "d": DateInterval.Day,
                    "week": DateInterval.Week,
                    "ww": DateInterval.Week,
                    "wk": DateInterval.Week,
                    "weekday": DateInterval.Weekday,
                    "dw": DateInterval.Weekday,
                    "w": DateInterval.Weekday,
                    "hour": DateInterval.Hour,
                    "hh": DateInterval.Hour,
                    "minute": DateInterval.Minute,
                    "mi": DateInterval.Minute,
                    "n": DateInterval.Minute,
                    "second": DateInterval.Second,
                    "ss": DateInterval.Second,
                    "s": DateInterval.Second,
                    "millisecond": DateInterval.Millisecond,
                    "ms": DateInterval.Millisecond,
                    "microsecond": DateInterval.Microsecond,
                    "mcs": DateInterval.Microsecond,
                    "nanosecond": DateInterval.Nanosecond,
                    "ns": DateInterval.Nanosecond
                };
                class DateAndTime {
                    static timestampToTicks(t) {
                        if ((typeof t === "undefined") || (t === null)) {
                            throw new TypeError(ErrorStrings.timestampCanNotBeNull);
                        }
                        return t.getTime();
                    }
                    static dateTimeFromParts(context, year, month, day, hour, minute, second, millisecond) {
                        if (eitherNull([year, month, day, hour, minute, second, millisecond])) {
                            return undefined;
                        }
                        if (typeof year !== "number" ||
                            typeof month !== "number" ||
                            typeof day !== "number" ||
                            typeof hour !== "number" ||
                            typeof minute !== "number" ||
                            typeof second !== "number" ||
                            typeof millisecond !== "number") {
                            throw new TypeError(Utils.formatString(ErrorStrings.dateTimePartsMustBeBigint, context.expression));
                        }
                        if (year < 1900 || year % 1 !== 0) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongYearRange, context.expression));
                        }
                        if (month < 1 || month % 1 !== 0 || month > 12) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongMonthRange, context.expression));
                        }
                        var daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
                        if (day < 1 || day % 1 !== 0 || day > daysInMonth) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongDayRange, context.expression, daysInMonth));
                        }
                        if (hour < 0 || hour % 1 !== 0 || hour > 24) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongHourRange, context.expression));
                        }
                        if (minute < 0 || minute % 1 !== 0 || minute > 60) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongMinuteRange, context.expression));
                        }
                        if (second < 0 || second % 1 !== 0 || second > 60) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongSecondRange, context.expression));
                        }
                        if (millisecond < 0 || millisecond % 1 !== 0 || millisecond > 1000) {
                            throw new RangeError(Utils.formatString(ErrorStrings.wrongMillisecondRange, context.expression));
                        }
                        var date = new Date(0);
                        date.setUTCFullYear(year);
                        date.setUTCMonth(month - 1);
                        date.setUTCDate(day);
                        date.setUTCHours(hour);
                        date.setUTCMinutes(minute);
                        date.setUTCSeconds(second);
                        date.setUTCMilliseconds(millisecond);
                        return date;
                    }
                    static dateAdd(context, unit, valueObj, original) {
                        if (eitherNull([valueObj, original])) {
                            return undefined;
                        }
                        if (typeof unit !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "DateAdd", context.expression, getSqlType(unit), "nvarchar(max)"));
                        }
                        var value = Cast.toLong(context, valueObj);
                        var originalDate = DateAndTime.toDateTime(context, original, ErrorStrings.thirdParameterHasWrongType, "DateAdd");
                        var result = new Date(originalDate.getTime());
                        var interval = Intervals[unit];
                        switch (interval) {
                            case DateInterval.Year:
                                result.setUTCFullYear(result.getUTCFullYear() + value);
                                break;
                            case DateInterval.Quarter:
                                result.setUTCMonth(result.getUTCMonth() + (3 * value));
                                break;
                            case DateInterval.Month:
                                result.setUTCMonth(result.getUTCMonth() + value);
                                break;
                            case DateInterval.Week:
                                result.setUTCDate(result.getUTCDate() + (value * 7));
                                break;
                            case DateInterval.Day:
                            case DateInterval.DayOfYear:
                            case DateInterval.Weekday:
                                result.setUTCDate(result.getUTCDate() + value);
                                break;
                            case DateInterval.Hour:
                                result.setUTCHours(result.getUTCHours() + value);
                                break;
                            case DateInterval.Minute:
                                result.setUTCMinutes(result.getUTCMinutes() + value);
                                break;
                            case DateInterval.Second:
                                result.setUTCSeconds(result.getUTCSeconds() + value);
                                break;
                            case DateInterval.Millisecond:
                                result.setUTCMilliseconds(result.getUTCMilliseconds() + value);
                                break;
                            case DateInterval.Microsecond:
                                if (value % 1000 !== 0) {
                                    throw new RangeError(Utils.formatString(ErrorStrings.submillisecondResolutionNotSupported, context.expression));
                                }
                                result.setMilliseconds(result.getMilliseconds() + (value / 1000));
                                break;
                            case DateInterval.Nanosecond:
                                if (value % (1000 * 1000) !== 0) {
                                    throw new RangeError(Utils.formatString(ErrorStrings.submillisecondResolutionNotSupported, context.expression));
                                }
                                result.setMilliseconds(result.getMilliseconds() + (value / (1000 * 1000)));
                                break;
                            default:
                                throw new RangeError(Utils.formatString(ErrorStrings.unknownTimeIntervalUnit, unit, context.expression));
                        }
                        return result;
                    }
                    static dateDiff(context, unit, startDateObject, endDateObject) {
                        if (eitherNull([startDateObject, endDateObject])) {
                            return undefined;
                        }
                        if (typeof unit !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "DateDiff", context.expression, getSqlType(unit), "nvarchar(max)"));
                        }
                        var startDate = DateAndTime.toDateTime(context, startDateObject, ErrorStrings.secondParameterHasWrongType, "DateDiff");
                        var endDate = DateAndTime.toDateTime(context, endDateObject, ErrorStrings.thirdParameterHasWrongType, "DateDiff");
                        var startPartNumber = DateAndTime.datePart(context, unit, startDate);
                        var endPartNumber = DateAndTime.datePart(context, unit, endDate);
                        var endTime = endDate.getTime();
                        var startTime = startDate.getTime();
                        var interval = Intervals[unit];
                        var coeff;
                        switch (interval) {
                            case DateInterval.Year:
                                return endPartNumber - startPartNumber;
                            case DateInterval.Quarter:
                                var fullYearQuarters = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 4;
                                return fullYearQuarters + (endPartNumber - startPartNumber);
                            case DateInterval.Month:
                                var fullYearMonths = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12;
                                return fullYearMonths + (endPartNumber - startPartNumber);
                            case DateInterval.Day:
                            case DateInterval.DayOfYear:
                                coeff = 24 * 60 * 60 * 1000;
                                break;
                            case DateInterval.Week:
                                coeff = 7 * 24 * 60 * 60 * 1000;
                                break;
                            case DateInterval.Hour:
                                coeff = 60 * 60 * 1000;
                                break;
                            case DateInterval.Minute:
                                coeff = 60 * 1000;
                                break;
                            case DateInterval.Second:
                                coeff = 1000;
                                break;
                            case DateInterval.Millisecond:
                                return (endTime - startTime);
                            case DateInterval.Microsecond:
                                return (endTime - startTime) * 1000;
                            case DateInterval.Nanosecond:
                                return (endTime - startTime) * 1000 * 1000;
                            default:
                                throw new RangeError(Utils.formatString(ErrorStrings.unknownTimeIntervalUnit, unit, context.expression));
                        }
                        return Math.floor(endTime / coeff) - Math.floor(startTime / coeff);
                    }
                    static dateName(context, part, dateObject) {
                        if (eitherNull([dateObject])) {
                            return undefined;
                        }
                        if (typeof part !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "DateName", context.expression, getSqlType(part), "nvarchar(max)"));
                        }
                        var date = DateAndTime.toDateTime(context, dateObject, ErrorStrings.secondParameterHasWrongType, "DateName");
                        var name;
                        switch (part) {
                            case "month":
                            case "m":
                            case "mm":
                                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                name = months[date.getMonth()];
                                break;
                            case "weekday":
                            case "dw":
                                var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                name = weekdays[date.getDay()];
                                break;
                            default:
                                name = DateAndTime.datePart(context, part, date).toString();
                                break;
                        }
                        return name;
                    }
                    static datePart(context, part, dateObject) {
                        if (eitherNull([dateObject])) {
                            return undefined;
                        }
                        if (typeof part !== "string") {
                            throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "DatePart", context.expression, getSqlType(part), "nvarchar(max)"));
                        }
                        var date = DateAndTime.toDateTime(context, dateObject, ErrorStrings.secondParameterHasWrongType, "DatePart");
                        var newYear;
                        switch (part) {
                            case "year":
                            case "yy":
                            case "yyyy":
                                return date.getUTCFullYear();
                            case "quarter":
                            case "q":
                            case "qq":
                                return Math.ceil((date.getUTCMonth() + 1) / 3);
                            case "month":
                            case "m":
                            case "mm":
                                return date.getUTCMonth() + 1;
                            case "dayofyear":
                            case "y":
                            case "dy":
                                newYear = new Date(0);
                                newYear.setUTCFullYear(date.getFullYear());
                                return Math.floor((date.getTime() - newYear.getTime()) / 86400000) + 1;
                            case "day":
                            case "d":
                            case "dd":
                                return date.getUTCDate();
                            case "week":
                            case "wk":
                            case "ww":
                                newYear = new Date(0);
                                newYear.setUTCFullYear(date.getFullYear());
                                var newYearWeekday = newYear.getUTCDay();
                                newYearWeekday = newYearWeekday === 0 ? newYearWeekday + 7 : newYearWeekday;
                                var daynum = Math.floor((date.getTime() - newYear.getTime()) / 86400000) + 1;
                                var weeknum = Math.floor((daynum + newYearWeekday - 1) / 7);
                                if (newYearWeekday < 4) {
                                    weeknum += 1;
                                    if (weeknum > 52) {
                                        newYear = new Date(0);
                                        newYear.setUTCFullYear(date.getUTCFullYear() + 1);
                                        newYearWeekday = newYear.getUTCDay();
                                        newYearWeekday = newYearWeekday === 0 ? newYearWeekday + 7 : newYearWeekday;
                                        weeknum = newYearWeekday < 4 ? 1 : 53;
                                    }
                                }
                                return weeknum;
                            case "weekday":
                            case "dw":
                                return date.getUTCDay() + 1;
                            case "hour":
                            case "hh":
                                return date.getUTCHours();
                            case "minute":
                            case "mi":
                            case "n":
                                return date.getUTCMinutes();
                            case "second":
                            case "s":
                            case "ss":
                                return date.getUTCSeconds();
                            case "millisecond":
                            case "ms":
                                return date.getUTCMilliseconds();
                            case "microsecond":
                            case "mcs":
                            case "nanosecond":
                            case "ns":
                                return 0;
                            default:
                                throw new TypeError(ErrorStrings.notSupportedPart);
                        }
                    }
                    static toDateTime(context, dateObject, errorMessage, functionName) {
                        if (typeof (dateObject) === "string") {
                            return Cast.toDateTime(context, dateObject);
                        }
                        if (!(dateObject instanceof Date)) {
                            throw new TypeError(Utils.formatString(errorMessage, functionName, context.expression, getSqlType(dateObject), "datetime"));
                        }
                        return dateObject;
                    }
                }
                Sql.DateAndTime = DateAndTime;
                class ExpressionHelpers {
                    static compare(context, leftValue, rightValue, asc) {
                        if ((leftValue === null || typeof leftValue === "undefined") && (rightValue === null || typeof rightValue === "undefined")) {
                            return 0;
                        }
                        if (leftValue === null || typeof leftValue === "undefined") {
                            return asc ? -1 : 1;
                        }
                        if (rightValue === null || typeof rightValue === "undefined") {
                            return asc ? 1 : -1;
                        }
                        if ((typeof leftValue === "number" && typeof rightValue === "number")
                            || (leftValue instanceof Date && rightValue instanceof Date)) {
                            var ltmp = leftValue;
                            var rtmp = rightValue;
                            var result = ltmp < rtmp ? -1 : ltmp > rtmp ? 1 : 0;
                            return asc ? result : -1 * result;
                        }
                        var ltype = getSqlType(leftValue);
                        var rtype = getSqlType(rightValue);
                        if (ltype == rtype) {
                            throw new TypeError(Utils.formatString(ErrorStrings.orderingNotSupported, ltype));
                        }
                        else {
                            throw new TypeError(Utils.formatString(ErrorStrings.orderingBetween2TypesNotSupported, ltype, rtype));
                        }
                    }
                }
                Sql.ExpressionHelpers = ExpressionHelpers;
                var Utilities;
                (function (Utilities) {
                    class Records {
                        static select(record, selectorCallback) {
                            if (!!record) {
                                var propertyNames = record.getPropertyNames();
                                if (!!propertyNames && propertyNames.length > 0) {
                                    return propertyNames.map(((v, i, a) => { return selectorCallback(record.get_Item(v), v); }));
                                }
                            }
                            return [];
                        }
                        static selectWithDefault(record, selectorCallback, defaultCallback) {
                            var result;
                            if (!!record) {
                                var propertyNames = record.getPropertyNames();
                                if (!!propertyNames && propertyNames.length > 0) {
                                    result = propertyNames.map(((v, i, a) => { return selectorCallback(record.get_Item(v), v); }));
                                    if (!!result && result.length > 0) {
                                        return result;
                                    }
                                }
                            }
                            return [defaultCallback()];
                        }
                        static getPropertyValue(context, recordObject, pathObject) {
                            if (eitherNull([recordObject, pathObject])) {
                                return undefined;
                            }
                            if (!(recordObject instanceof CollectionBasedRecord)) {
                                throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "GetRecordPropertyValue", context.expression, getSqlType(recordObject), "Record"));
                            }
                            if (getSqlType(pathObject) !== "nvarchar(max)") {
                                throw new TypeError(Utils.formatString(ErrorStrings.secondParameterHasWrongType, "GetRecordPropertyValue", context.expression, getSqlType(pathObject), "nvarchar(max)"));
                            }
                            var segments = Records.parsePath(pathObject);
                            if (!!segments) {
                                var result = recordObject;
                                for (var i = 0; i < segments.length; i++) {
                                    var segment = segments[i];
                                    if (!(result instanceof CollectionBasedRecord)) {
                                        return null;
                                    }
                                    result = result.get_Item(segment);
                                }
                                return result;
                            }
                            else {
                                return undefined;
                            }
                        }
                        static memberAccessById(obj, index) {
                            if (obj instanceof CollectionBasedRecord) {
                                return obj.get_Item(index);
                            }
                            else {
                                return undefined;
                            }
                        }
                        static memberAccessByName(obj, name) {
                            if (obj instanceof CollectionBasedRecord) {
                                return obj.get_Item(name);
                            }
                            else {
                                return undefined;
                            }
                        }
                        static tryCastRecord(obj) {
                            if (obj instanceof CollectionBasedRecord) {
                                return obj;
                            }
                            else {
                                return new CollectionBasedRecord();
                            }
                        }
                        static unionLeft(left, right) {
                            return left.unionLeft(right);
                        }
                        static parsePath(path) {
                            var brackets = false;
                            var currentSegment = "";
                            var results = [];
                            for (var i = 0; i < path.length; i++) {
                                var c = path[i];
                                if (brackets) {
                                    if (c == ']') {
                                        var nextChar = i < path.length - 1 ? path[i + 1] : null;
                                        if (nextChar == ']') {
                                            i++;
                                            currentSegment += ']';
                                            continue;
                                        }
                                        else {
                                            if (currentSegment.length == 0) {
                                                return null;
                                            }
                                            if (nextChar != '.' && nextChar != null) {
                                                return null;
                                            }
                                            brackets = false;
                                        }
                                    }
                                    else {
                                        currentSegment += c;
                                    }
                                }
                                else {
                                    switch (c) {
                                        case '"':
                                            {
                                                return null;
                                            }
                                        case '[':
                                            {
                                                if (currentSegment.length > 0) {
                                                    return null;
                                                }
                                                brackets = true;
                                                continue;
                                            }
                                        case ']':
                                            {
                                                return null;
                                            }
                                        case '.':
                                            {
                                                if (currentSegment.length == 0) {
                                                    return null;
                                                }
                                                results.push(currentSegment);
                                                currentSegment = "";
                                                break;
                                            }
                                        default:
                                            {
                                                currentSegment += c;
                                                break;
                                            }
                                    }
                                }
                            }
                            if (brackets) {
                                return null;
                            }
                            if (currentSegment.length > 0) {
                                results.push(currentSegment);
                            }
                            return results;
                        }
                    }
                    Utilities.Records = Records;
                    class Arrays {
                        static convertToRanked(values, schema) {
                            var results = [];
                            for (var i = 0; i < values.length; i++) {
                                var record = new CollectionBasedRecord(schema);
                                record.add("rank", values[i].rank);
                                record.add("value", values[i].value);
                                results.push(record);
                            }
                            return new ValueArray(results);
                        }
                        static getElement(context, arrayObject, indexObject) {
                            if (eitherNull([arrayObject, indexObject])) {
                                return undefined;
                            }
                            if (!(arrayObject instanceof ValueArray)) {
                                throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "GetArrayElement", context.expression, getSqlType(arrayObject), "Array"));
                            }
                            if (getSqlType(indexObject) !== "bigint") {
                                throw new TypeError(Utils.formatString(ErrorStrings.secondParameterHasWrongType, "GetArrayElement", context.expression, getSqlType(indexObject), "bigint"));
                            }
                            return arrayObject.get(indexObject);
                        }
                        static getLength(context, arrayObject) {
                            if (eitherNull([arrayObject])) {
                                return undefined;
                            }
                            if (!(arrayObject instanceof ValueArray)) {
                                throw new TypeError(Utils.formatString(ErrorStrings.firstParameterHasWrongType, "GetArrayLength", context.expression, getSqlType(arrayObject), "Array"));
                            }
                            return arrayObject.length();
                        }
                    }
                    Utilities.Arrays = Arrays;
                })(Utilities = Sql.Utilities || (Sql.Utilities = {}));
            })(Sql = SteamR.Sql || (SteamR.Sql = {}));
            var HostedFunctions;
            (function (HostedFunctions) {
                var CollectionBasedRecord = EventProcessing.SteamR.Sql.CollectionBasedRecord;
                var ValueArray = EventProcessing.SteamR.Sql.ValueArray;
                var ErrorStrings = EventProcessing.SteamR.Sql.ErrorStrings;
                var Utils = EventProcessing.SteamR.Sql.Utils;
                class HostedFunctionBinding {
                    static FromObject(obj) {
                        if (obj instanceof CollectionBasedRecord) {
                            var jsRec = {};
                            var propNames = obj.getPropertyNames();
                            for (var i = 0; i < propNames.length; i++) {
                                var key = propNames[i];
                                jsRec[key] = HostedFunctionBinding.FromObject(obj.get_Item(key));
                            }
                            return jsRec;
                        }
                        if (obj instanceof ValueArray) {
                            var jsArr = [];
                            for (var i = 0; i < obj.length(); i++) {
                                jsArr[i] = HostedFunctionBinding.FromObject(obj.get(i));
                            }
                            return jsArr;
                        }
                        return obj;
                    }
                    static ToObject(functionName, obj) {
                        if (obj === undefined || obj instanceof Date) {
                            return obj;
                        }
                        if (obj.constructor === Array) {
                            return new ValueArray(obj.map(a => HostedFunctionBinding.ToObject(functionName, a)));
                        }
                        if (obj instanceof Error) {
                            if (obj.stack != null) {
                                throw new TypeError(Utils.formatString(ErrorStrings.javaScriptRuntimeErrorWithStack, functionName, obj.message, obj.stack));
                            }
                            else {
                                throw new TypeError(Utils.formatString(ErrorStrings.javaScriptRuntimeError, functionName, obj.message));
                            }
                        }
                        if (typeof obj === "function") {
                            throw new TypeError(Utils.formatString(ErrorStrings.unsupportedJavaScriptReturnTypeError, functionName, 'Function'));
                        }
                        if (typeof obj === "object") {
                            var record = new CollectionBasedRecord();
                            for (var key in obj) {
                                if (obj.hasOwnProperty(key)) {
                                    record.add(key, HostedFunctionBinding.ToObject(functionName, obj[key]));
                                }
                            }
                            return record;
                        }
                        if (typeof obj === "boolean") {
                            if (obj === true) {
                                return 1;
                            }
                            else {
                                return 0;
                            }
                        }
                        return obj;
                    }
                    static callFunction(name, parameters) {
                        if (typeof HostedFunctionBinding.registeredFunctions === "undefined") {
                            throw new TypeError("JavaScript functions are not initialized");
                        }
                        if (!HostedFunctionBinding.registeredFunctions.hasOwnProperty(name)) {
                            throw new TypeError("JavaScript function " + name + " is not registered");
                        }
                        var code = HostedFunctionBinding.registeredFunctions[name].code;
                        var argsCode = Array.apply(0, Array(parameters.length))
                            .map(function (element, index) {
                            return "HostedFunctionBinding.FromObject(parameters[" + index + "])";
                        }).join();
                        var source = "var fn = " + code + "\n if (typeof fn != 'function') throw new TypeError(Utils.formatString(ErrorStrings.javaScriptMustContainFunctionDefinition, name, typeof fn)); \n fn(" + argsCode + ")";
                        try {
                            return HostedFunctionBinding.ToObject(name, eval(source));
                        }
                        catch (e) {
                            throw new TypeError(Utils.formatString(ErrorStrings.javaScriptRuntimeErrorWithStack, name, e.message, e.stack));
                        }
                    }
                }
                HostedFunctions.HostedFunctionBinding = HostedFunctionBinding;
            })(HostedFunctions = SteamR.HostedFunctions || (SteamR.HostedFunctions = {}));
        })(SteamR = EventProcessing.SteamR || (EventProcessing.SteamR = {}));
    })(EventProcessing = Microsoft.EventProcessing || (Microsoft.EventProcessing = {}));
})(Microsoft || (Microsoft = {}));

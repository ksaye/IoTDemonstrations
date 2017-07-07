var TStreams;
(function (TStreams) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.compare = function (left, right) {
            var returnValue = true;
            if (typeof left !== "object" || left === null) {
                returnValue = left === right;
            }
            else {
                for (var propertyName in left) {
                    if (left.hasOwnProperty(propertyName)) {
                        if (right.hasOwnProperty(propertyName)) {
                            if (Array.isArray(left[propertyName])) {
                                var leftProperty = left[propertyName];
                                var rightProperty = right[propertyName];
                                var length = leftProperty.length;
                                for (var i = 0; i < length; i++) {
                                    if (Utils.compare(leftProperty[i], rightProperty[i]) === false) {
                                        returnValue = false;
                                        break;
                                    }
                                }
                            }
                            else if (typeof left[propertyName] === "object") {
                                if (Utils.compare(left[propertyName], right[propertyName]) === false) {
                                    returnValue = false;
                                    break;
                                }
                            }
                            else {
                                if (left[propertyName] !== right[propertyName]) {
                                    returnValue = false;
                                    break;
                                }
                            }
                        }
                        else {
                            returnValue = false;
                            break;
                        }
                    }
                }
            }
            return returnValue;
        };
        Utils.formatString = function (text) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            var result = text;
            for (var i = 0; i < params.length; i++) {
                result = result.replace("{" + i + "}", params[i]);
            }
            return result;
        };
        return Utils;
    })();
    TStreams.Utils = Utils;
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Diagnostics;
    (function (Diagnostics) {
        if (typeof Array.isArray === "undefined") {
            Array.isArray = function (a) {
                return Object.prototype.toString.call(a) === "[object Array]";
            };
        }
        var Assert = (function () {
            function Assert() {
            }
            Assert.isArray = function (a, parameterName) {
                if (Array.isArray(a) === false) {
                    throw new TypeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeAnArray, parameterName));
                }
            };
            Assert.isString = function (s, parameterName) {
                if (typeof s !== "string") {
                    throw new TypeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeAString, parameterName));
                }
            };
            Assert.isFunction = function (f, parameterName) {
                if (typeof f !== "function") {
                    throw new TypeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeAFunction, parameterName));
                }
            };
            Assert.isNumber = function (n, parameterName) {
                if (typeof n !== "number") {
                    throw new TypeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeANumber, parameterName));
                }
            };
            Assert.isLegalObject = function (p, parameterName) {
                if (typeof p === "undefined" || p === null) {
                    throw new TypeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustNotBeUndefinedOrNull, parameterName));
                }
            };
            Assert.isFiniteNumber = function (n, parameterName) {
                if (typeof n !== "number") {
                    throw new TypeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeANumber, parameterName));
                }
                if (isFinite(n) === false) {
                    throw new RangeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeAFiniteNumber, parameterName));
                }
            };
            Assert.isFinitePositiveInteger = function (n, parameterName) {
                Assert.isFiniteNumber(n, parameterName);
                if (n <= 0 || n % 1 !== 0) {
                    throw new RangeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeAnIntegralNumberGreaterThanZero, parameterName));
                }
            };
            Assert.isFinitePositiveOrNullInteger = function (n, parameterName) {
                Assert.isFiniteNumber(n, parameterName);
                if (n < 0 || n % 1 !== 0) {
                    throw new RangeError(TStreams.Utils.formatString(TStreams.ErrorStrings.parameterMustBeAnIntegralNumberGreaterThanOrEqualToZero, parameterName));
                }
            };
            Assert.isInstanceOf = function (o, ctor, message) {
                if (o instanceof ctor === false) {
                    throw new TypeError(message);
                }
            };
            Assert.has = function (dict, key, message) {
                if (dict.has(key) === false) {
                    throw new Error(message);
                }
            };
            Assert.hasNot = function (dict, key, message) {
                if (dict.has(key) === true) {
                    throw new Error(message);
                }
            };
            Assert.isGroupKey = function (k) {
                if (typeof k !== "number" && typeof k !== "string") {
                    throw new TypeError(TStreams.ErrorStrings.keyOfAGroupMustBeANumberOrAString);
                }
            };
            Assert.isFalse = function (b, message) {
                if (typeof b !== "boolean") {
                    throw new TypeError(TStreams.ErrorStrings.onlyCheckBooleanForFalse);
                }
                if (b !== false) {
                    throw new Error(message);
                }
            };
            return Assert;
        })();
        Diagnostics.Assert = Assert;
    })(Diagnostics = TStreams.Diagnostics || (TStreams.Diagnostics = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Collections;
    (function (Collections) {
        var KeyValuePair = (function () {
            function KeyValuePair(key, value) {
                this.key = key;
                this.value = value;
            }
            return KeyValuePair;
        })();
        Collections.KeyValuePair = KeyValuePair;
    })(Collections = TStreams.Collections || (TStreams.Collections = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var ErrorStrings = (function () {
        function ErrorStrings() {
        }
        ErrorStrings.parameterMustBeAnArray = "The parameter {0} must be an array.";
        ErrorStrings.parameterMustBeAString = "The parameter {0} must be a string.";
        ErrorStrings.parameterMustBeAFunction = "The parameter {0} must be a function.";
        ErrorStrings.parameterMustBeANumber = "The parameter {0} must be a number.";
        ErrorStrings.parameterMustNotBeUndefinedOrNull = "The parameter {0} mustn't be undefined nor null.";
        ErrorStrings.parameterMustBeAFiniteNumber = "The parameter {0} must be a finite number.";
        ErrorStrings.parameterMustBeAnIntegralNumberGreaterThanZero = "The parameter {0} must be an integral number greater than zero.";
        ErrorStrings.parameterMustBeAnIntegralNumberGreaterThanOrEqualToZero = "The parameter {0} must be an integral number greater than or equal to zero.";
        ErrorStrings.keyOfAGroupMustBeANumberOrAString = "The key of a group must be a number or a string.";
        ErrorStrings.onlyCheckBooleanForFalse = "You should only check objects of type boolean for false.";
        ErrorStrings.queryContainsAGroupOperatorWithoutAMatchingUnion = "The query contains a group operator without a matching union.";
        ErrorStrings.nestedGroupingNotSupported = "Nested grouping isn't supported. Use a union and re-group with the composite key selector.";
        ErrorStrings.hopSizeNeedsToBeSmallerOrEqualToWindowSize = "The hop size of a hopping window needs to be smaller or equal to the window size.";
        ErrorStrings.parameterOffsetMustBeAnInteger = "The parameter offset must be an integer.";
        ErrorStrings.alterStartTimeWithOffset0 = "An alter-start-time operator with an offset of 0 can be removed.";
        ErrorStrings.alterEndTimeWithOffset0 = "An alter-end-time operator with an offset of 0 can be removed.";
        ErrorStrings.moveEventInTimeWithOffset0 = "A move-event-in-time operator with an offset of 0 can be removed.";
        ErrorStrings.operationViolatedSyncTimeOrder = "An {0} operation violated sync time order.";
        ErrorStrings.alterEventDurationExpressionMustReturnNumber = "The alter event duration expression must return a number.";
        ErrorStrings.alterEventDurationExpressionMustReturnPositiveInteger = "The alter event duration expression must return a finite positive integer.";
        ErrorStrings.dictionaryDoNotContainKey = "The dictionary doesn't contain a value with that key.";
        ErrorStrings.endTimeMustBeAfterStart = "The end time of an event needs to be later than its start time.";
        ErrorStrings.atLeastTwoOperatorsInMultiAggregate = "Please specify at least two operators to be used as multi-aggregate.";
        ErrorStrings.queryContainsGroupUnionWithoutGroupOperator = "The query contains a group union without a matching group operator.";
        ErrorStrings.missingOperator = "Please create the operator before using it in a query.";
        ErrorStrings.expressionMustStartWithInputOrOutput = "The start of an expression must be an Input or an Output.";
        ErrorStrings.noInputWithGivenName = "No input with the given name exists.";
        ErrorStrings.mustBeDeployableObject = "The deployable object needs to be an instance of DeployableObject.";
        ErrorStrings.expressionWithSameNameAlreadyDeployed = "An expression with that name has already been deployed.";
        ErrorStrings.expressionTargetingThisOutputAlreadyDeployed = "An expression targeting this output has already been deployed.";
        ErrorStrings.operatorWithSameNameAlreadyExists = "An operator with that name already exists.";
        ErrorStrings.noOutputWithGivenName = "No output with the given name exists.";
        ErrorStrings.windowOperatorWithSameNameAlreadyExists = "A window operator with that name already exists.";
        ErrorStrings.streamingOperatorWithSameNameAlreadyExists = "A streaming operator with that name already exists.";
        ErrorStrings.customOperatorMustBeCreatedFirst = "A custom operator with that name needs to be created first.";
        ErrorStrings.cannotFindAggregateOperator = "Couldn't find aggregate operator named {0}.";
        ErrorStrings.endOfExpressionMustBeOutput = "The end of an expression must be an Output.";
        ErrorStrings.expressionHasError = "The expression {0} experienced an error: {1}\nIt will be disabled.";
        ErrorStrings.eventInsertedOutOfOrder = "An event was inserted out of order into input {0} and will be dropped.";
        ErrorStrings.syncTimeReachedInfinity = "The sync time of input {0} has reached infinity. No further events can be inserted.";
        return ErrorStrings;
    })();
    TStreams.ErrorStrings = ErrorStrings;
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Collections;
    (function (Collections) {
        var Node = (function () {
            function Node(key, value) {
                this.key = key;
                this.value = value;
                this.left = undefined;
                this.right = undefined;
                this.parent = undefined;
                this.weight = 0;
            }
            return Node;
        })();
        var Dictionary = (function () {
            function Dictionary() {
                this._root = undefined;
                this._count = 0;
            }
            Dictionary.prototype.set = function (key, value) {
                this._count += 1;
                var newNode = new Node(key, value);
                if (typeof this._root === "undefined") {
                    this._root = newNode;
                }
                else {
                    var current = this._root;
                    while (typeof current !== "undefined") {
                        if (key < current.key) {
                            if (typeof current.left === "undefined") {
                                current.left = newNode;
                                newNode.parent = current;
                                this._insertBalance(current, 1);
                                current = undefined;
                            }
                            else {
                                current = current.left;
                            }
                        }
                        else if (key > current.key) {
                            if (typeof current.right === "undefined") {
                                current.right = newNode;
                                newNode.parent = current;
                                this._insertBalance(current, -1);
                                current = undefined;
                            }
                            else {
                                current = current.right;
                            }
                        }
                        else {
                            this._count -= 1;
                            current.value = value;
                            current = undefined;
                        }
                    }
                }
                return this;
            };
            Dictionary.prototype.remove = function (key) {
                var current = this._root;
                while (typeof current !== "undefined") {
                    if (key < current.key) {
                        current = current.left;
                    }
                    else if (key > current.key) {
                        current = current.right;
                    }
                    else {
                        this._count -= 1;
                        var left = current.left;
                        var right = current.right;
                        if (typeof left === "undefined") {
                            if (typeof right === "undefined") {
                                if (current === this._root) {
                                    this._root = undefined;
                                }
                                else {
                                    var parent = current.parent;
                                    if (parent.left === current) {
                                        parent.left = undefined;
                                        this._deleteBalance(parent, -1);
                                    }
                                    else {
                                        parent.right = undefined;
                                        this._deleteBalance(parent, 1);
                                    }
                                }
                            }
                            else {
                                Dictionary._replace(current, right);
                                this._deleteBalance(current, 0);
                            }
                        }
                        else if (typeof right === "undefined") {
                            Dictionary._replace(current, left);
                            this._deleteBalance(current, 0);
                        }
                        else {
                            var successor = right;
                            if (typeof successor.left === "undefined") {
                                parent = current.parent;
                                successor.parent = parent;
                                successor.left = left;
                                successor.weight = current.weight;
                                if (typeof left !== "undefined") {
                                    left.parent = successor;
                                }
                                if (current === this._root) {
                                    this._root = successor;
                                }
                                else {
                                    if (parent.left === current) {
                                        parent.left = successor;
                                    }
                                    else {
                                        parent.right = successor;
                                    }
                                }
                                this._deleteBalance(successor, 1);
                            }
                            else {
                                while (typeof successor.left !== "undefined") {
                                    successor = successor.left;
                                }
                                parent = current.parent;
                                var successorParent = successor.parent;
                                var successorRight = successor.right;
                                if (successorParent.left === successor) {
                                    successorParent.left = successorRight;
                                }
                                else {
                                    successorParent.right = successorRight;
                                }
                                if (typeof successorRight !== "undefined") {
                                    successorRight.parent = successorParent;
                                }
                                successor.parent = parent;
                                successor.left = left;
                                successor.right = right;
                                successor.weight = current.weight;
                                right.parent = successor;
                                if (typeof left !== "undefined") {
                                    left.parent = successor;
                                }
                                if (current === this._root) {
                                    this._root = successor;
                                }
                                else {
                                    if (parent.left === current) {
                                        parent.left = successor;
                                    }
                                    else {
                                        parent.right = successor;
                                    }
                                }
                                this._deleteBalance(successorParent, -1);
                            }
                        }
                        return;
                    }
                }
            };
            Dictionary.prototype.get = function (key) {
                var current = this._root;
                while (typeof current !== "undefined") {
                    if (key < current.key) {
                        current = current.left;
                    }
                    else if (key > current.key) {
                        current = current.right;
                    }
                    else {
                        return current.value;
                    }
                }
                throw new Error(TStreams.ErrorStrings.dictionaryDoNotContainKey);
            };
            Dictionary.prototype.getKeys = function () {
                var keys = new Array(this._count);
                var arrayIndex = 0;
                if (typeof this._root === "undefined") {
                    return keys;
                }
                var stack = [];
                var current = this._root;
                var done = false;
                while (done === false) {
                    if (typeof current !== "undefined") {
                        stack.push(current);
                        current = current.left;
                    }
                    else {
                        if (stack.length === 0) {
                            done = true;
                        }
                        else {
                            current = stack.pop();
                            keys[arrayIndex] = current.key;
                            arrayIndex += 1;
                            current = current.right;
                        }
                    }
                }
                return keys;
            };
            Dictionary.prototype.getItems = function () {
                var values = new Array(this._count);
                var arrayIndex = 0;
                if (typeof this._root === "undefined") {
                    return values;
                }
                var stack = [];
                var current = this._root;
                var done = false;
                while (done === false) {
                    if (typeof current !== "undefined") {
                        stack.push(current);
                        current = current.left;
                    }
                    else {
                        if (stack.length === 0) {
                            done = true;
                        }
                        else {
                            current = stack.pop();
                            values[arrayIndex] = new Collections.KeyValuePair(current.key, current.value);
                            arrayIndex += 1;
                            current = current.right;
                        }
                    }
                }
                return values;
            };
            Dictionary.prototype.has = function (key) {
                var found = false;
                var current = this._root;
                while (found === false && typeof current !== "undefined") {
                    if (key < current.key) {
                        current = current.left;
                    }
                    else if (key > current.key) {
                        current = current.right;
                    }
                    else {
                        found = true;
                    }
                }
                return found;
            };
            Dictionary._replace = function (target, source) {
                var left = source.left;
                var right = source.right;
                target.weight = source.weight;
                target.key = source.key;
                target.value = source.value;
                target.left = source.left;
                target.right = source.right;
                if (typeof left !== "undefined") {
                    left.parent = target;
                }
                if (typeof right !== "undefined") {
                    right.parent = target;
                }
            };
            Dictionary.prototype._rotateRight = function (node) {
                var left = node.left;
                var leftRight = left.right;
                var parent = node.parent;
                left.parent = parent;
                left.right = node;
                node.left = leftRight;
                node.parent = left;
                if (typeof leftRight !== "undefined") {
                    leftRight.parent = node;
                }
                if (node === this._root) {
                    this._root = left;
                }
                else if (parent.left === node) {
                    parent.left = left;
                }
                else {
                    parent.right = left;
                }
                left.weight -= 1;
                node.weight = -(left.weight);
                return left;
            };
            Dictionary.prototype._rotateLeft = function (node) {
                var right = node.right;
                var rightLeft = right.left;
                var parent = node.parent;
                right.parent = parent;
                right.left = node;
                node.right = rightLeft;
                node.parent = right;
                if (typeof rightLeft !== "undefined") {
                    rightLeft.parent = node;
                }
                if (node === this._root) {
                    this._root = right;
                }
                else if (parent.right === node) {
                    parent.right = right;
                }
                else {
                    parent.left = right;
                }
                right.weight += 1;
                node.weight = -(right.weight);
                return right;
            };
            Dictionary.prototype._rotateLeftRight = function (node) {
                var left = node.left;
                var leftRight = left.right;
                var parent = node.parent;
                var leftRightRight = leftRight.right;
                var leftRightLeft = leftRight.left;
                leftRight.parent = parent;
                node.left = leftRightRight;
                left.right = leftRightLeft;
                leftRight.left = left;
                leftRight.right = node;
                left.parent = leftRight;
                node.parent = leftRight;
                if (typeof leftRightRight !== "undefined") {
                    leftRightRight.parent = node;
                }
                if (typeof leftRightLeft !== "undefined") {
                    leftRightLeft.parent = left;
                }
                if (node === this._root) {
                    this._root = leftRight;
                }
                else if (parent.left === node) {
                    parent.left = leftRight;
                }
                else {
                    parent.right = leftRight;
                }
                if (leftRight.weight === -1) {
                    node.weight = 0;
                    left.weight = 1;
                }
                else if (leftRight.weight === 0) {
                    node.weight = 0;
                    left.weight = 0;
                }
                else {
                    node.weight = -1;
                    left.weight = 0;
                }
                leftRight.weight = 0;
                return leftRight;
            };
            Dictionary.prototype._rotateRightLeft = function (node) {
                var right = node.right;
                var rightLeft = right.left;
                var parent = node.parent;
                var rightLeftLeft = rightLeft.left;
                var rightLeftRight = rightLeft.right;
                rightLeft.parent = parent;
                node.right = rightLeftLeft;
                right.left = rightLeftRight;
                rightLeft.right = right;
                rightLeft.left = node;
                right.parent = rightLeft;
                node.parent = rightLeft;
                if (typeof rightLeftLeft !== "undefined") {
                    rightLeftLeft.parent = node;
                }
                if (typeof rightLeftRight !== "undefined") {
                    rightLeftRight.parent = right;
                }
                if (node === this._root) {
                    this._root = rightLeft;
                }
                else if (parent.right === node) {
                    parent.right = rightLeft;
                }
                else {
                    parent.left = rightLeft;
                }
                if (rightLeft.weight === 1) {
                    node.weight = 0;
                    right.weight = -1;
                }
                else if (rightLeft.weight === 0) {
                    node.weight = 0;
                    right.weight = 0;
                }
                else {
                    node.weight = 1;
                    right.weight = 0;
                }
                rightLeft.weight = 0;
                return rightLeft;
            };
            Dictionary.prototype._insertBalance = function (node, weight) {
                while (typeof node !== "undefined") {
                    weight = (node.weight += weight);
                    if (weight === 0) {
                        return;
                    }
                    else if (weight === 2) {
                        if (node.left.weight === 1) {
                            this._rotateRight(node);
                        }
                        else {
                            this._rotateLeftRight(node);
                        }
                        return;
                    }
                    else if (weight === -2) {
                        if (node.right.weight === -1) {
                            this._rotateLeft(node);
                        }
                        else {
                            this._rotateRightLeft(node);
                        }
                        return;
                    }
                    var parent = node.parent;
                    if (typeof parent !== "undefined") {
                        weight = parent.left === node ? 1 : -1;
                    }
                    node = parent;
                }
            };
            Dictionary.prototype._deleteBalance = function (node, weight) {
                while (typeof node !== "undefined") {
                    weight = (node.weight += weight);
                    if (weight === 2) {
                        if (node.left.weight >= 0) {
                            node = this._rotateRight(node);
                            if (node.weight === -1) {
                                return;
                            }
                        }
                        else {
                            node = this._rotateLeftRight(node);
                        }
                    }
                    else if (weight === -2) {
                        if (node.right.weight <= 0) {
                            node = this._rotateLeft(node);
                            if (node.weight === 1) {
                                return;
                            }
                        }
                        else {
                            node = this._rotateRightLeft(node);
                        }
                    }
                    else if (weight !== 0) {
                        return;
                    }
                    var parent = node.parent;
                    if (typeof parent !== "undefined") {
                        weight = parent.left === node ? -1 : 1;
                    }
                    node = parent;
                }
            };
            return Dictionary;
        })();
        Collections.Dictionary = Dictionary;
    })(Collections = TStreams.Collections || (TStreams.Collections = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    (function (EventKind) {
        EventKind[EventKind["point"] = 0] = "point";
        EventKind[EventKind["interval"] = 1] = "interval";
        EventKind[EventKind["edgeStart"] = 2] = "edgeStart";
        EventKind[EventKind["edgeEnd"] = 3] = "edgeEnd";
        EventKind[EventKind["punctuation"] = 4] = "punctuation";
    })(TStreams.EventKind || (TStreams.EventKind = {}));
    var EventKind = TStreams.EventKind;
    var Event = (function () {
        function Event(payload, startTime, endTime, kind) {
            this.payload = payload;
            this.startTime = startTime;
            this.endTime = endTime;
            this.kind = kind;
        }
        Event.create = function (payload, startTime, endTime, kind) {
            TStreams.Diagnostics.Assert.isFiniteNumber(startTime, "startTime");
            TStreams.Diagnostics.Assert.isNumber(endTime, "endTime");
            if (endTime <= startTime) {
                throw new RangeError(TStreams.ErrorStrings.endTimeMustBeAfterStart);
            }
            if (startTime + 1 === endTime) {
                kind = 0 /* point */;
            }
            else if (isFinite(endTime) === false) {
                kind = 2 /* edgeStart */;
            }
            else if (kind === 3 /* edgeEnd */) {
                kind = 3 /* edgeEnd */;
            }
            else {
                kind = 1 /* interval */;
            }
            var event = new Event(payload, startTime, endTime, kind);
            return event;
        };
        Event.retract = function (events, edgeEnd) {
            var length = events.length;
            for (var i = 0; i < length; i++) {
                var event = events[i];
                if (event.kind === 2 /* edgeStart */ && TStreams.Utils.compare(event.payload, edgeEnd.payload) && event.startTime === edgeEnd.startTime) {
                    var intervalEvent = Event.create(edgeEnd.payload, edgeEnd.startTime, edgeEnd.endTime, 1 /* interval */);
                    events.splice(i, 1, intervalEvent);
                }
            }
        };
        Event.compareSyncTime = function (left, right) {
            return left.getSyncTime() - right.getSyncTime();
        };
        Event.prototype.isPayloadEqual = function (other) {
            return TStreams.Utils.compare(this.payload, other.payload);
        };
        Event.prototype.isEqual = function (other) {
            var returnValue = true;
            if (this.startTime !== other.startTime) {
                returnValue = false;
            }
            else if (this.endTime !== other.endTime) {
                returnValue = false;
            }
            else if (TStreams.Utils.compare(this.payload, other.payload) === false) {
                returnValue = false;
            }
            return returnValue;
        };
        Event.prototype.getSyncTime = function () {
            if (this.kind === 3 /* edgeEnd */) {
                return this.endTime;
            }
            else {
                return this.startTime;
            }
        };
        return Event;
    })();
    TStreams.Event = Event;
})(TStreams || (TStreams = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var Operator = (function () {
            function Operator(name) {
                this.name = name;
                TStreams.Diagnostics.Assert.isString(name, "name");
            }
            Operator.prototype._processEvent = function (event, context) {
                return context.output(event);
            };
            return Operator;
        })();
        Internals.Operator = Operator;
        var UserDefinedOperator = (function (_super) {
            __extends(UserDefinedOperator, _super);
            function UserDefinedOperator(name, process) {
                _super.call(this, name);
                this._userDefinedExpression = process;
            }
            UserDefinedOperator.prototype._processEvent = function (event, context) {
                var stateClear = false;
                if (event.kind === 4 /* punctuation */) {
                    context.output(event);
                }
                else {
                    var eventCopy = TStreams.Event.create(event.payload, event.startTime, event.endTime, event.kind);
                    var ctxt = context;
                    var thisFreeCallback = function (e) {
                        return context.output(e);
                    };
                    stateClear = this._userDefinedExpression(eventCopy, ctxt._windowContext.results[0].state, thisFreeCallback);
                }
                return stateClear;
            };
            return UserDefinedOperator;
        })(Operator);
        Internals.UserDefinedOperator = UserDefinedOperator;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Collections;
    (function (Collections) {
        function outputWindowResult(context) {
            var windowContext = context._windowContext;
            var operatorLenght = windowContext.aggregates.length;
            for (var i = 0; i < operatorLenght; i++) {
                var aggregate = windowContext.aggregates[i];
                windowContext.results[0].state[i] = aggregate.windowOperator.close(windowContext.results[0].state[i], aggregate.parameters);
            }
            if (windowContext.aggregates.length === 1) {
                if (windowContext.clipToWindowEnd === true) {
                    return context.output(TStreams.Event.create(windowContext.results[0].state[0], windowContext.results[0].end, windowContext.results[0].end + 1, 0 /* point */));
                }
                else {
                    return context.output(TStreams.Event.create(windowContext.results[0].state[0], windowContext.results[0].start, windowContext.results[0].end, 1 /* interval */));
                }
            }
            else if (windowContext.aggregates.length > 1) {
                var groupContext = context._groupContext;
                if (windowContext.clipToWindowEnd === true) {
                    return context.output(TStreams.Event.create(windowContext.projectExpression(windowContext.results[0].state, windowContext.results[0].end, windowContext.results[0].end + 1, groupContext.key), windowContext.results[0].end, windowContext.results[0].end + 1, 0 /* point */));
                }
                else {
                    return context.output(TStreams.Event.create(windowContext.projectExpression(windowContext.results[0].state, windowContext.results[0].start, windowContext.results[0].end, groupContext.key), windowContext.results[0].start, windowContext.results[0].end, 1 /* interval */));
                }
            }
            else {
                return true;
            }
        }
        function updateWindowResult(windowContext, windowIndex, event) {
            var length = windowContext.aggregates.length;
            for (var operatorIndex = 0; operatorIndex < length; operatorIndex++) {
                var aggregate = windowContext.aggregates[operatorIndex];
                windowContext.results[windowIndex].state[operatorIndex] = aggregate.windowOperator.update(event, windowContext.results[windowIndex].state[operatorIndex] || new TStreams.Internals.Results(), aggregate.parameters);
            }
        }
        function updateEvents(events, event) {
            var syncTime;
            if (event.kind === 3 /* edgeEnd */) {
                syncTime = event.endTime;
                TStreams.Event.retract(events, event);
            }
            else {
                syncTime = event.startTime;
                if (event.kind !== 4 /* punctuation */) {
                    events.push(event);
                }
            }
            return syncTime;
        }
        function pruneEvents(events, syncTime) {
            var survivers = [];
            var length = events.length;
            for (var i = 0; i < length; i++) {
                var event = events[i];
                if (event.endTime > syncTime) {
                    survivers.push(event);
                }
            }
            return survivers;
        }
        function checkEventAndOutput(event, context, operatorName) {
            var newSyncTime = event.getSyncTime();
            if (newSyncTime < context.syncTime) {
                throw new Error(TStreams.Utils.formatString(TStreams.ErrorStrings.operationViolatedSyncTimeOrder, operatorName));
            }
            else {
                context.syncTime = newSyncTime;
            }
            return context.output(event);
        }
        var OperatorDictionary = (function () {
            function OperatorDictionary(dict) {
                this._items = dict;
            }
            OperatorDictionary.createEmpty = function (dict) {
                return new OperatorDictionary(dict);
            };
            OperatorDictionary.createInitialized = function (dict) {
                var operatorDictionary = new OperatorDictionary(dict);
                var op = new TStreams.Internals.Operator("passThrough");
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("groupUnion");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var groupContext = ctxt._groupContext;
                    if (typeof groupContext.keyProjector !== "undefined" && event.kind !== 4 /* punctuation */) {
                        event = TStreams.Event.create(groupContext.keyProjector(event.payload, event.startTime, event.endTime, groupContext.key), event.startTime, event.endTime, event.kind);
                    }
                    groupContext.unionedNode._groupContext.unionEvents.push(event);
                    return true;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("where");
                op._processEvent = function (event, context) {
                    if (event.kind === 4 /* punctuation */) {
                        return context.output(event);
                    }
                    if (context.filter(event.payload, event.startTime, event.endTime)) {
                        return context.output(event);
                    }
                    return false;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("select");
                op._processEvent = function (event, context) {
                    if (event.kind === 4 /* punctuation */) {
                        return context.output(event);
                    }
                    var groupContext = context._groupContext;
                    var newPayload = context.project(event.payload, event.startTime, event.endTime, groupContext.key);
                    var newEvent = TStreams.Event.create(newPayload, event.startTime, event.endTime, event.kind);
                    return context.output(newEvent);
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("selectMany");
                op._processEvent = function (event, context) {
                    if (event.kind === 4 /* punctuation */) {
                        return context.output(event);
                    }
                    var groupContext = context._groupContext;
                    var newPayloads = context.project(event.payload, event.startTime, event.endTime, groupContext.key);
                    var canCleanState = true;
                    for (var i = 0; i < newPayloads.length; i++) {
                        var newEvent = TStreams.Event.create(newPayloads[i], event.startTime, event.endTime, event.kind);
                        canCleanState = context.output(newEvent) && canCleanState;
                    }
                    return canCleanState;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("groupBy");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var groupContext = ctxt._groupContext;
                    var groups = groupContext.groups;
                    var keyString;
                    var expression;
                    if (event.kind !== 4 /* punctuation */) {
                        var key = groupContext.keySelector(event.payload);
                        keyString = key.toString();
                        TStreams.Diagnostics.Assert.isGroupKey(keyString);
                        if (!groups.has(keyString)) {
                            var template = groupContext.groupTemplate;
                            var newExpression = template.clone(key);
                            groups.set(keyString, newExpression);
                        }
                    }
                    var cti = undefined;
                    var groupsWithKeys = groups.getItems();
                    var length = groupsWithKeys.length;
                    var stateClear;
                    var groupKey;
                    var removedGroups = 0;
                    for (var i = 0; i < length; i++) {
                        expression = groupsWithKeys[i].value;
                        groupKey = groupsWithKeys[i].key;
                        if (groupKey === keyString || event.kind === 4 /* punctuation */) {
                            stateClear = expression.insert(event);
                        }
                        else {
                            if (typeof cti === "undefined") {
                                var syncTime = event.getSyncTime();
                                cti = new TStreams.Event(false, syncTime, syncTime + 1, 4 /* punctuation */);
                            }
                            stateClear = expression.insert(cti);
                        }
                        if (stateClear === true) {
                            groups.remove(groupKey);
                            removedGroups++;
                        }
                    }
                    if (length == 0 && event.kind === 4 /* punctuation */) {
                        groupContext.unionedNode.output(event);
                    }
                    var results = groupContext.unionedNode._groupContext.unionEvents;
                    results.sort(TStreams.Event.compareSyncTime);
                    var length = results.length;
                    for (var i = 0; i < length; i++) {
                        groupContext.unionedNode.output(results[i]);
                    }
                    groupContext.unionedNode._groupContext.unionEvents.length = 0;
                    return removedGroups === length;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("join");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var joinContext = ctxt._joinContext;
                    var isFrom = joinContext.isFrom;
                    var windowContext;
                    var otherWindowContext;
                    if (isFrom === 0 /* left */) {
                        windowContext = joinContext.leftContext._windowContext;
                        otherWindowContext = joinContext.rightContext._windowContext;
                    }
                    else {
                        windowContext = joinContext.rightContext._windowContext;
                        otherWindowContext = joinContext.leftContext._windowContext;
                    }
                    var syncTime = updateEvents(windowContext.events, event);
                    var minSyncTime = Math.min(syncTime, otherWindowContext.results[0].end);
                    var joinStart = joinContext.leftContext._windowContext.results[0].start;
                    if (windowContext.results[0].end < syncTime) {
                        var leftEvents = joinContext.leftContext._windowContext.events;
                        var leftLength = leftEvents.length;
                        var rightEvents = joinContext.rightContext._windowContext.events;
                        var rightLength = rightEvents.length;
                        var outputEvents = [];
                        for (var leftIndex = 0; leftIndex < leftLength; leftIndex++) {
                            var leftEvent = leftEvents[leftIndex];
                            if (leftEvent.startTime > minSyncTime || leftEvent.endTime < joinStart) {
                                continue;
                            }
                            for (var rightIndex = 0; rightIndex < rightLength; rightIndex++) {
                                var rightEvent = rightEvents[rightIndex];
                                if (rightEvent.startTime > minSyncTime || rightEvent.endTime < joinStart || rightEvent.startTime >= leftEvent.endTime || rightEvent.endTime <= leftEvent.startTime) {
                                    continue;
                                }
                                var overlapStart = Math.max(leftEvent.startTime, rightEvent.startTime, joinStart);
                                var overlapEnd = Math.min(leftEvent.endTime, rightEvent.endTime, minSyncTime);
                                if (overlapStart < overlapEnd && joinContext.predicate(leftEvent.payload, rightEvent.payload)) {
                                    var payload = joinContext.project(leftEvent.payload, rightEvent.payload);
                                    outputEvents.push(TStreams.Event.create(payload, overlapStart, overlapEnd));
                                }
                            }
                        }
                        outputEvents.sort(TStreams.Event.compareSyncTime);
                        var outputLength = outputEvents.length;
                        var downstreamStateClear = true;
                        for (leftIndex = 0; leftIndex < outputLength; leftIndex++) {
                            downstreamStateClear = joinContext.leftContext.output(outputEvents[leftIndex]);
                        }
                    }
                    windowContext.events = pruneEvents(windowContext.events, minSyncTime);
                    windowContext.results[0].end = syncTime;
                    windowContext.results[0].start = minSyncTime;
                    otherWindowContext.events = pruneEvents(otherWindowContext.events, minSyncTime);
                    otherWindowContext.results[0].start = minSyncTime;
                    if (event.kind === 4 /* punctuation */) {
                        downstreamStateClear = context.output(event);
                    }
                    return joinContext.leftContext._windowContext.events.length === 0 && joinContext.rightContext._windowContext.events.length === 0 && downstreamStateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("steamr_join");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var joinContext = ctxt._joinContext;
                    var queue = ctxt._joinContext.joinQueue;
                    var fromLeft = (joinContext.isFrom === 0 /* left */);
                    var windowContext = fromLeft ? joinContext.leftContext._windowContext : joinContext.rightContext._windowContext;
                    var otherWindowContext = fromLeft ? joinContext.rightContext._windowContext : joinContext.leftContext._windowContext;
                    var timestamp = updateEvents(windowContext.events, event);
                    var syncTime = Math.min(timestamp, otherWindowContext.results[0].end);
                    var currentTime = windowContext.results[0].start;
                    var otherEvents = otherWindowContext.events;
                    if (event.kind === 4 /* punctuation */) {
                        queue.push(event);
                    }
                    if (syncTime > currentTime) {
                        var leftEvents = joinContext.leftContext._windowContext.events;
                        var rightEvents = joinContext.rightContext._windowContext.events;
                        for (var i = 0; i < leftEvents.length; i++) {
                            var leftEvent = leftEvents[i];
                            if (leftEvent.startTime >= syncTime)
                                break;
                            if (leftEvent.startTime >= currentTime && leftEvent.startTime < syncTime) {
                                for (var j = 0; j < rightEvents.length; j++) {
                                    var rightEvent = rightEvents[j];
                                    if (rightEvent.startTime >= leftEvent.endTime)
                                        break;
                                    var start = Math.max(leftEvent.startTime, rightEvent.startTime);
                                    var end = Math.min(leftEvent.endTime, rightEvent.endTime);
                                    if (start < end && joinContext.predicate(leftEvent.payload, rightEvent.payload)) {
                                        start = Math.max(start, rightEvent.startTime + joinContext.steamrOffset);
                                        var payload = joinContext.project(leftEvent.payload, rightEvent.payload);
                                        queue.push(TStreams.Event.create(payload, start, start + 1));
                                    }
                                }
                            }
                        }
                    }
                    queue.sort(TStreams.Event.compareSyncTime);
                    var downstreamStateClear = true;
                    while (queue.length > 0) {
                        if (queue[0].startTime > syncTime)
                            break;
                        downstreamStateClear = joinContext.leftContext.output(queue.shift());
                    }
                    windowContext.events = pruneEvents(windowContext.events, syncTime);
                    windowContext.results[0].end = timestamp;
                    windowContext.results[0].start = syncTime;
                    otherWindowContext.events = pruneEvents(otherWindowContext.events, syncTime);
                    otherWindowContext.results[0].start = syncTime;
                    return joinContext.leftContext._windowContext.events.length === 0 && joinContext.rightContext._windowContext.events.length === 0 && downstreamStateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("steamr_left_join");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var joinContext = ctxt._joinContext;
                    var queue = ctxt._joinContext.joinQueue;
                    var fromLeft = (joinContext.isFrom === 0 /* left */);
                    var windowContext = fromLeft ? joinContext.leftContext._windowContext : joinContext.rightContext._windowContext;
                    var otherWindowContext = fromLeft ? joinContext.rightContext._windowContext : joinContext.leftContext._windowContext;
                    var timestamp = updateEvents(windowContext.events, event);
                    var syncTime = Math.min(timestamp, otherWindowContext.results[0].end);
                    var currentTime = windowContext.results[0].start;
                    if (event.kind === 4 /* punctuation */) {
                        queue.push(event);
                    }
                    if (syncTime > currentTime) {
                        var leftEvents = joinContext.leftContext._windowContext.events;
                        var rightEvents = joinContext.rightContext._windowContext.events;
                        for (var i = 0; i < leftEvents.length; i++) {
                            var leftEvent = leftEvents[i];
                            if (leftEvent.startTime >= syncTime)
                                break;
                            if (leftEvent.startTime >= currentTime && leftEvent.startTime < syncTime) {
                                var joined = false;
                                for (var j = 0; j < rightEvents.length; j++) {
                                    var rightEvent = rightEvents[j];
                                    if (rightEvent.startTime >= leftEvent.endTime)
                                        break;
                                    var start = Math.max(leftEvent.startTime, rightEvent.startTime);
                                    var end = Math.min(leftEvent.endTime, rightEvent.endTime);
                                    if (start < end && joinContext.predicate(leftEvent.payload, rightEvent.payload)) {
                                        start = Math.max(start, rightEvent.startTime + joinContext.steamrOffset);
                                        var payload = joinContext.project(leftEvent.payload, rightEvent.payload);
                                        queue.push(TStreams.Event.create(payload, start, start + 1));
                                        joined = true;
                                    }
                                }
                                if (!joined) {
                                    var start = Math.max(leftEvent.startTime, leftEvent.startTime + joinContext.steamrOffset);
                                    var payload = joinContext.project(leftEvent.payload, undefined);
                                    queue.push(TStreams.Event.create(payload, start, start + 1));
                                }
                            }
                        }
                    }
                    queue.sort(TStreams.Event.compareSyncTime);
                    var downstreamStateClear = true;
                    while (queue.length > 0) {
                        if (queue[0].startTime > syncTime)
                            break;
                        downstreamStateClear = joinContext.leftContext.output(queue.shift());
                    }
                    windowContext.events = pruneEvents(windowContext.events, syncTime);
                    windowContext.results[0].end = timestamp;
                    windowContext.results[0].start = syncTime;
                    otherWindowContext.events = pruneEvents(otherWindowContext.events, syncTime);
                    otherWindowContext.results[0].start = syncTime;
                    return joinContext.leftContext._windowContext.events.length === 0 && joinContext.rightContext._windowContext.events.length === 0 && downstreamStateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("leftJoin");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var joinContext = ctxt._joinContext;
                    var isFrom = joinContext.isFrom;
                    var windowContext;
                    var otherWindowContext;
                    if (isFrom === 0 /* left */) {
                        windowContext = joinContext.leftContext._windowContext;
                        otherWindowContext = joinContext.rightContext._windowContext;
                    }
                    else {
                        windowContext = joinContext.rightContext._windowContext;
                        otherWindowContext = joinContext.leftContext._windowContext;
                    }
                    var syncTime = updateEvents(windowContext.events, event);
                    var minSyncTime = Math.min(syncTime, otherWindowContext.results[0].end);
                    var joinStart = joinContext.leftContext._windowContext.results[0].start;
                    if (windowContext.results[0].end < syncTime) {
                        var leftEvents = joinContext.leftContext._windowContext.events;
                        var leftLength = leftEvents.length;
                        var rightEvents = joinContext.rightContext._windowContext.events;
                        var rightLength = rightEvents.length;
                        var outputEvents = [];
                        for (var leftIndex = 0; leftIndex < leftLength; leftIndex++) {
                            var leftEvent = leftEvents[leftIndex];
                            if (leftEvent.startTime > minSyncTime || leftEvent.endTime < joinStart) {
                                continue;
                            }
                            var unmatchedStart = Math.max(leftEvent.startTime, joinStart);
                            var unmatchedEnd = Math.min(leftEvent.endTime, minSyncTime);
                            for (var rightIndex = 0; rightIndex < rightLength; rightIndex++) {
                                var rightEvent = rightEvents[rightIndex];
                                if (rightEvent.startTime > minSyncTime || rightEvent.endTime < joinStart || rightEvent.startTime >= leftEvent.endTime || rightEvent.endTime <= leftEvent.startTime) {
                                    continue;
                                }
                                var overlapStart = Math.max(leftEvent.startTime, rightEvent.startTime, joinStart);
                                unmatchedEnd = Math.min(unmatchedEnd, overlapStart);
                                var overlapEnd = Math.min(leftEvent.endTime, rightEvent.endTime, minSyncTime);
                                unmatchedStart = Math.max(unmatchedStart, overlapEnd);
                                if (joinContext.anti === false && overlapStart < overlapEnd && joinContext.predicate(leftEvent.payload, rightEvent.payload)) {
                                    var payload = joinContext.project(leftEvent.payload, rightEvent.payload);
                                    outputEvents.push(TStreams.Event.create(payload, overlapStart, overlapEnd));
                                }
                            }
                            if (unmatchedEnd > Math.max(leftEvent.startTime, joinStart)) {
                                var payload = joinContext.project(leftEvent.payload, undefined);
                                outputEvents.push(TStreams.Event.create(payload, Math.max(leftEvent.startTime, joinStart), unmatchedEnd));
                            }
                            if (unmatchedStart < Math.min(leftEvent.endTime, minSyncTime) && (unmatchedEnd !== leftEvent.endTime || unmatchedStart !== leftEvent.startTime)) {
                                var payload = joinContext.project(leftEvent.payload, undefined);
                                outputEvents.push(TStreams.Event.create(payload, unmatchedStart, Math.min(leftEvent.endTime, minSyncTime)));
                            }
                        }
                        outputEvents.sort(TStreams.Event.compareSyncTime);
                        var outputLength = outputEvents.length;
                        var downstreamStateClear = true;
                        for (leftIndex = 0; leftIndex < outputLength; leftIndex++) {
                            downstreamStateClear = joinContext.leftContext.output(outputEvents[leftIndex]);
                        }
                    }
                    windowContext.events = pruneEvents(windowContext.events, minSyncTime);
                    windowContext.results[0].end = syncTime;
                    windowContext.results[0].start = minSyncTime;
                    otherWindowContext.events = pruneEvents(otherWindowContext.events, minSyncTime);
                    otherWindowContext.results[0].start = minSyncTime;
                    if (event.kind === 4 /* punctuation */) {
                        downstreamStateClear = context.output(event);
                    }
                    return joinContext.leftContext._windowContext.events.length === 0 && joinContext.rightContext._windowContext.events.length === 0 && downstreamStateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("union");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var joinContext = ctxt._joinContext;
                    var fromLeft = (joinContext.isFrom === 0 /* left */);
                    var windowContext = fromLeft ? joinContext.leftContext._windowContext : joinContext.rightContext._windowContext;
                    var otherWindowContext = fromLeft ? joinContext.rightContext._windowContext : joinContext.leftContext._windowContext;

                    var syncTime = updateEvents(windowContext.events, event);
                    var minSyncTime = Math.min(syncTime, otherWindowContext.results[0].end);

                    var outputEvents = [];

                    var length1 = windowContext.events.length;
                    if (length1 > 0) {
                        /* This means there will be at least one output event. */
                        if (windowContext.events[0].endTime <= minSyncTime) {
                            var windowContextSurvivers = [];
                            for (var i1 = 0; i1 < length1; i1++) {
                                var event1 = windowContext.events[i1];
                                if (event1.endTime > minSyncTime) {
                                    windowContextSurvivers.push(event1);
                                } else {
                                    outputEvents.push(event1);
                                }
                            }
                            windowContext.events = windowContextSurvivers;
                        }
                    }
                    
                    windowContext.results[0].end = syncTime;
                    windowContext.results[0].start = minSyncTime;

                    var length2 = otherWindowContext.events.length;
                    if (length2 > 0) {
                        /* This means there will be at least one output event. */
                        if (otherWindowContext.events[0].endTime <= minSyncTime) {
                            var otherWindowContextSurvivers = [];
                            for (var i2 = 0; i2 < length2; i2++) {
                                var event2 = otherWindowContext.events[i2];
                                if (event2.endTime > minSyncTime) {
                                    otherWindowContextSurvivers.push(event2);
                                } else {
                                    outputEvents.push(event2);
                                }
                            }
                            otherWindowContext.events = otherWindowContextSurvivers;
                        }
                    }

                    otherWindowContext.results[0].start = minSyncTime;

                    var downstreamStateClear = true;
                    var outputLength = outputEvents.length;
                    if (outputLength > 0) {
                        outputEvents.sort(TStreams.Event.compareSyncTime);
                        for (var l1 = 0; l1 < outputLength; l1++) {
                            downstreamStateClear = joinContext.leftContext.output(outputEvents[l1]);
                        }
                    }

                    if (event.kind === 4 /* punctuation */ && syncTime <= minSyncTime) {
                        downstreamStateClear = context.output(event);
                    }

                    return joinContext.leftContext._windowContext.events.length === 0 && joinContext.rightContext._windowContext.events.length === 0 && downstreamStateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("snapshot");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var windowContext = ctxt._windowContext;
                    var syncTime = updateEvents(windowContext.events, event);
                    if (event.kind === 4 /* punctuation */ && windowContext.results[0].start < syncTime) {
                        var haveFullWindows = false;
                        var eventLength = windowContext.events.length;
                        for (var e = 0; e < eventLength; e++) {
                            if (windowContext.events[e].endTime <= syncTime) {
                                haveFullWindows = true;
                                break;
                            }
                        }
                        if (!haveFullWindows) {
                            return context.output(event) && eventLength === 0;
                        }
                    }
                    var downstreamStateClear = true;
                    while (windowContext.results[0].start < syncTime) {
                        var windowEndTime = syncTime;
                        var eventLength = windowContext.events.length;
                        windowContext.results[0].state.length = 0;
                        for (var e = 0; e < eventLength; e++) {
                            var windowEvent = windowContext.events[e];
                            if (windowEvent.startTime < syncTime) {
                                updateWindowResult(windowContext, 0, windowEvent);
                            }
                            windowEndTime = Math.min(windowEndTime, windowEvent.endTime);
                        }
                        windowContext.results[0].end = windowEndTime;
                        if (windowContext.results[0].state.length > 0) {
                            downstreamStateClear = outputWindowResult(ctxt);
                        }
                        windowContext.events = pruneEvents(windowContext.events, windowEndTime);
                        windowContext.results[0].start = windowEndTime;
                        if (event.kind === 4 /* punctuation */) {
                            downstreamStateClear = context.output(event);
                        }
                    }
                    return windowContext.events.length === 0 && downstreamStateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("steamr_snapshot");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var windowContext = ctxt._windowContext;
                    var windowResult = windowContext.results[0];
                    var windowEvents = windowContext.events;
                    var syncTime = updateEvents(windowEvents, event);
                    var currentTime = windowResult.start;
                    var downstreamStateClear = true;
                    if (currentTime < syncTime) {
                        var timestamps = [];
                        var eventLength = windowEvents.length;
                        for (var e = 0; e < eventLength; e++) {
                            var windowEvent = windowEvents[e];
                            if (windowEvent.startTime >= currentTime && windowEvent.startTime < syncTime) {
                                timestamps.push(windowEvent.startTime);
                            }
                            if (windowEvent.endTime >= currentTime && windowEvent.endTime < syncTime) {
                                timestamps.push(windowEvent.endTime);
                            }
                        }
                        timestamps.sort();
                        for (var t = 0; t < timestamps.length;) {
                            var timestamp = timestamps[t];
                            windowContext.results[0].state.length = 0;
                            eventLength = windowEvents.length;
                            for (var e = 0; e < eventLength; e++) {
                                var windowEvent = windowEvents[e];
                                if (windowEvent.startTime <= timestamp && windowEvent.endTime > timestamp) {
                                    updateWindowResult(windowContext, 0, windowEvent);
                                }
                            }
                            if (windowResult.state.length > 0) {
                                windowResult.start = timestamp;
                                windowResult.end = timestamp + 1;
                                downstreamStateClear = outputWindowResult(ctxt);
                            }
                            windowEvents = pruneEvents(windowEvents, timestamp);
                            while (timestamps[++t] == timestamp)
                                ;
                        }
                    }
                    if (event.kind === 4 /* punctuation */) {
                        downstreamStateClear = context.output(event);
                    }
                    windowResult.start = syncTime;
                    return windowEvents.length === 0 && downstreamStateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("count");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var windowContext = ctxt._windowContext;
                    if (event.kind === 3 /* edgeEnd */) {
                        return windowContext.count === 0;
                    }
                    if (windowContext.count === 0) {
                        windowContext.results[0].start = event.startTime;
                    }
                    if (event.kind !== 4 /* punctuation */) {
                        updateWindowResult(windowContext, 0, event);
                        windowContext.count++;
                    }
                    var stateClear = false;
                    if (windowContext.count === windowContext.size || isFinite(event.startTime) === false) {
                        if (event.startTime === windowContext.results[0].start || isFinite(event.startTime) === false) {
                            windowContext.results[0].end = windowContext.results[0].start + 1;
                        }
                        else {
                            windowContext.results[0].end = event.startTime;
                        }
                        stateClear = outputWindowResult(ctxt);
                        windowContext.count = 0;
                        windowContext.results[0].state.length = 0;
                    }
                    if (event.kind === 4 /* punctuation */) {
                        if (stateClear === true) {
                            stateClear = context.output(event);
                        }
                        else {
                            context.output(event);
                        }
                    }
                    return stateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("condition");
                op._processEvent = function (event, context) {
                    if (event.kind === 3 /* edgeEnd */) {
                        return false;
                    }
                    var ctxt = context;
                    var windowContext = ctxt._windowContext;
                    if (windowContext.results[0].isStarted === false && event.kind !== 4 /* punctuation */ && windowContext.startExpression(event.payload, event.startTime, event.endTime)) {
                        windowContext.results[0].start = event.startTime;
                        windowContext.results[0].isStarted = true;
                    }
                    var stateClear = false;
                    if (windowContext.results[0].isStarted === true) {
                        if (event.kind !== 4 /* punctuation */) {
                            windowContext.results[0].end = event.startTime;
                            updateWindowResult(windowContext, 0, event);
                        }
                        if (windowContext.stopExpression(event.payload, event.startTime, event.endTime) || isFinite(event.startTime) === false) {
                            if (windowContext.results[0].end === windowContext.results[0].start) {
                                windowContext.results[0].end = windowContext.results[0].start + 1;
                            }
                            stateClear = outputWindowResult(ctxt);
                            windowContext.results[0].isStarted = false;
                            windowContext.results[0].start = 0;
                            windowContext.results[0].state.length = 0;
                        }
                    }
                    if (event.kind === 4 /* punctuation */) {
                        if (stateClear === true) {
                            stateClear = context.output(event);
                        }
                        else {
                            context.output(event);
                        }
                    }
                    return stateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("hopping");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var windowContext = ctxt._windowContext;
                    var syncTime = event.getSyncTime();
                    var stateClear = false;
                    while (windowContext.results[0].end <= syncTime) {
                        if (windowContext.results[0].state.length > 0) {
                            if (stateClear === true) {
                                stateClear = outputWindowResult(ctxt);
                            }
                            else {
                                outputWindowResult(ctxt);
                            }
                            windowContext.results[0].state.length = 0;
                        }
                        if (windowContext.results.length > 1) {
                            windowContext.results.shift();
                        }
                        else if (isFinite(syncTime)) {
                            var duration = event.startTime - windowContext.results[0].end;
                            if (duration >= 0) {
                                var hops = duration / windowContext.hopSize;
                                hops = Math.floor(hops) + 1;
                                duration = hops * windowContext.hopSize;
                                windowContext.results[0].end = windowContext.results[0].end + duration;
                                windowContext.results[0].start = windowContext.results[0].end - windowContext.size;
                            }
                            stateClear = true;
                        }
                        else {
                            if (event.kind === 4 /* punctuation */) {
                                context.output(event);
                            }
                            return true;
                        }
                    }
                    if (event.kind === 4 /* punctuation */) {
                        if (stateClear === true) {
                            stateClear = context.output(event);
                        }
                        else {
                            context.output(event);
                        }
                    }
                    else if (event.kind !== 3 /* edgeEnd */) {
                        var windowIndex = 0;
                        var windowStartTime = windowContext.results[windowIndex].start;
                        while (windowStartTime < event.endTime) {
                            updateWindowResult(windowContext, windowIndex, event);
                            stateClear = false;
                            windowIndex++;
                            if (windowIndex === windowContext.results.length && windowStartTime + windowContext.hopSize < event.endTime) {
                                var results = new TStreams.Internals.Results();
                                windowStartTime = windowStartTime + windowContext.hopSize;
                                results.start = windowStartTime;
                                results.end = results.start + windowContext.size;
                                windowContext.results.push(results);
                            }
                            else if (windowIndex === windowContext.results.length) {
                                windowStartTime = event.endTime;
                                break;
                            }
                            else {
                                windowStartTime = windowContext.results[windowIndex].start;
                            }
                        }
                    }
                    return stateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("steamr_hopping");
                op._processEvent = function (event, context) {
                    var ctxt = context;
                    var windowContext = ctxt._windowContext;
                    var syncTime = event.getSyncTime();
                    var stateClear = false;
                    while (windowContext.results[0].end < syncTime) {
                        if (windowContext.results[0].state.length > 0) {
                            if (stateClear === true) {
                                stateClear = outputWindowResult(ctxt);
                            }
                            else {
                                outputWindowResult(ctxt);
                            }
                            windowContext.results[0].state.length = 0;
                        }
                        if (windowContext.results.length > 1) {
                            windowContext.results.shift();
                        }
                        else if (isFinite(syncTime)) {
                            var duration = event.startTime - windowContext.results[0].end;
                            var hops = duration / windowContext.hopSize;
                            hops = Math.ceil(hops);
                            duration = hops * windowContext.hopSize;
                            windowContext.results[0].end = windowContext.results[0].end + duration;
                            windowContext.results[0].start = windowContext.results[0].end - windowContext.size;
                            stateClear = true;
                        }
                        else {
                            if (event.kind === 4 /* punctuation */) {
                                context.output(event);
                            }
                            return true;
                        }
                    }
                    if (event.kind === 4 /* punctuation */) {
                        if (stateClear === true) {
                            stateClear = context.output(event);
                        }
                        else {
                            context.output(event);
                        }
                    }
                    else {
                        var windowIndex = 0;
                        var windowStartTime = windowContext.results[windowIndex].start;
                        while (windowStartTime < syncTime) {
                            updateWindowResult(windowContext, windowIndex, event);
                            stateClear = false;
                            windowIndex++;
                            if (windowIndex === windowContext.results.length && windowStartTime < syncTime) {
                                var results = new TStreams.Internals.Results();
                                windowStartTime = windowStartTime + windowContext.hopSize;
                                results.start = windowStartTime;
                                results.end = results.start + windowContext.size;
                                windowContext.results.push(results);
                            }
                            else if (windowIndex === windowContext.results.length) {
                                break;
                            }
                            else {
                                windowStartTime = windowContext.results[windowIndex].start;
                            }
                        }
                    }
                    return stateClear;
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("alterEventStartTime");
                op._processEvent = function (event, context) {
                    var startTime = event.startTime + context.offset;
                    if (startTime < 0)
                        startTime = 0;
                    var endTime = event.endTime;
                    var kind = event.kind;
                    if (kind === 4 /* punctuation */) {
                        endTime = startTime + 1;
                    }
                    else {
                        if (endTime <= startTime) {
                            endTime = startTime + 1;
                        }
                        if (kind !== 3 /* edgeEnd */) {
                            if (endTime === startTime + 1) {
                                kind = 0 /* point */;
                            }
                            else if (isFinite(endTime)) {
                                kind = 1 /* interval */;
                            }
                        }
                    }
                    return checkEventAndOutput(new TStreams.Event(event.payload, startTime, endTime, kind), context, "alter event start time");
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("alterEventEndTime");
                op._processEvent = function (event, context) {
                    var endTime = event.endTime + context.offset;
                    if (endTime < 1)
                        endTime = 1;
                    var startTime = event.startTime;
                    var kind = event.kind;
                    if (kind === 4 /* punctuation */) {
                        startTime = endTime - 1;
                    }
                    else {
                        if (endTime <= startTime) {
                            startTime = endTime - 1;
                        }
                        if (kind !== 3 /* edgeEnd */) {
                            if (endTime === startTime + 1) {
                                kind = 0 /* point */;
                            }
                            else if (isFinite(endTime)) {
                                kind = 1 /* interval */;
                            }
                        }
                    }
                    return checkEventAndOutput(new TStreams.Event(event.payload, startTime, endTime, kind), context, "alter event end time");
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("alterEventDuration");
                op._processEvent = function (event, context) {
                    if (event.kind === 4 /* punctuation */ || event.kind === 2 /* edgeStart */) {
                        return context.output(event);
                    }
                    else {
                        var duration = context.offsetExpression(event.startTime, event.endTime);
                        if (typeof duration !== "number") {
                            throw new TypeError(TStreams.ErrorStrings.alterEventDurationExpressionMustReturnNumber);
                        }
                        if (duration <= 0 || duration % 1 !== 0 || isFinite(duration) === false) {
                            throw new RangeError(TStreams.ErrorStrings.alterEventDurationExpressionMustReturnPositiveInteger);
                        }
                        var kind;
                        if (event.kind === 3 /* edgeEnd */) {
                            kind = 3 /* edgeEnd */;
                        }
                        else {
                            if (duration === 1) {
                                kind = 0 /* point */;
                            }
                            else {
                                kind = 1 /* interval */;
                            }
                        }
                    }
                    return checkEventAndOutput(new TStreams.Event(event.payload, event.startTime, event.startTime + duration, kind), context, "alter event duration");
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("moveEventInTime");
                op._processEvent = function (event, context) {
                    var duration = event.endTime - event.startTime;
                    var startTime = event.startTime + context.offset;
                    if (startTime < 0)
                        startTime = 0;
                    var endTime = startTime + duration;
                    return checkEventAndOutput(new TStreams.Event(event.payload, startTime, endTime, event.kind), context, "move event in time");
                };
                operatorDictionary.add(op);
                op = new TStreams.Internals.Operator("getTimeFromEvent");
                op._processEvent = function (event, context) {
                    var realContext = context;
                    var startTime;
                    var endTime;
                    var kind = event.kind;
                    if (event.kind === 4 /* punctuation */) {
                        startTime = event.startTime + realContext.offset;
                        endTime = startTime + 1;
                    }
                    else {
                        if (typeof (realContext.startTimeSelector) !== "undefined") {
                            startTime = realContext.startTimeSelector(event.payload);
                        }
                        else {
                            startTime = event.startTime;
                        }
                        realContext.offset = startTime - event.startTime;
                        if (typeof (realContext.endTimeSelector) !== "undefined") {
                            endTime = realContext.endTimeSelector(event.payload);
                        }
                        else {
                            endTime = startTime + 1;
                        }
                        if (endTime - startTime > 1) {
                            kind = 1 /* interval */;
                        }
                        else {
                            kind = 0 /* point */;
                        }
                    }
                    return context.output(new TStreams.Event(event.payload, startTime, endTime, kind));
                };
                operatorDictionary.add(op);
                return operatorDictionary;
            };
            OperatorDictionary.prototype.add = function (value) {
                this._items.set(value.name, value);
            };
            OperatorDictionary.prototype.get = function (key) {
                return this._items.get(key);
            };
            OperatorDictionary.prototype.getKeys = function () {
                return this._items.getKeys();
            };
            OperatorDictionary.prototype.getValues = function () {
                var results = [];
                var keyValuePairs = this._items.getItems();
                var length = keyValuePairs.length;
                for (var i = 0; i < length; i++) {
                    results.push(keyValuePairs[i].value);
                }
                return results;
            };
            OperatorDictionary.prototype.has = function (key) {
                return this._items.has(key);
            };
            return OperatorDictionary;
        })();
        Collections.OperatorDictionary = OperatorDictionary;
    })(Collections = TStreams.Collections || (TStreams.Collections = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var WindowOperator = (function () {
            function WindowOperator(name, update, close) {
                this.name = name;
                this.update = update;
                this.close = close;
            }
            return WindowOperator;
        })();
        Internals.WindowOperator = WindowOperator;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Collections;
    (function (Collections) {
        var WindowOperatorDictionary = (function () {
            function WindowOperatorDictionary(dict) {
                this._items = dict;
                var op = new TStreams.Internals.WindowOperator("average", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    var payload = selector(event.payload);
                    state.count = (state.count || 0) + (typeof payload !== "undefined" ? 1 : 0);
                    state.sum = WindowOperatorDictionary._traverse(payload, state.sum, function (value, result) { return (typeof value === "number") ? (result || 0) + value : undefined; });
                    return state;
                }, function (state) {
                    var returnValue;
                    if (state.hasOwnProperty("count")) {
                        returnValue = WindowOperatorDictionary._traverse(state.sum, state.sum, function (value) { return (typeof value === "number") ? value / state.count : undefined; });
                    }
                    return returnValue;
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("count", function (event, state) {
                    state.count = (state.count || 0) + 1;
                    return state;
                }, function (state) {
                    var returnValue;
                    if (state.hasOwnProperty("count")) {
                        returnValue = state.count;
                    }
                    return returnValue || 0;
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("sum", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    state.sum = WindowOperatorDictionary._traverse(selector(event.payload), state.sum, function (value, result) { return (typeof value === "number") ? (result || 0) + value : undefined; });
                    return state;
                }, function (state) {
                    var returnValue;
                    returnValue = WindowOperatorDictionary._traverse(state.sum, state.sum, function (value) { return value; });
                    return returnValue;
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("min", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    state.min = WindowOperatorDictionary._traverse(selector(event.payload), state.min, function (value, result) { return ((typeof (result) === "undefined") ? value : (result < value ? result : value)); });
                    return state;
                }, function (state) {
                    var returnValue;
                    returnValue = WindowOperatorDictionary._traverse(state.min, state.min, function (value) { return value; });
                    return returnValue;
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("max", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    state.max = WindowOperatorDictionary._traverse(selector(event.payload), state.max, function (value, result) { return ((typeof (result) === "undefined") ? value : (result > value ? result : value)); });
                    return state;
                }, function (state) {
                    var returnValue;
                    returnValue = WindowOperatorDictionary._traverse(state.max, state.max, function (value) { return value; });
                    return returnValue;
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("topK", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    var k = parameters.get("k");
                    state.events = state.events || [];
                    var currentLength = state.events.length;
                    if (currentLength < k || (currentLength === k && selector(event.payload) > selector(state.events[currentLength - 1].payload))) {
                        state.events.push(event);
                        state.events.sort(function (e1, e2) {
                            var p1 = selector(e1.payload);
                            var p2 = selector(e2.payload);
                            if (p1 > p2)
                                return -1;
                            if (p1 < p2)
                                return 1;
                            return 0;
                        });
                    }
                    if (state.events.length > k) {
                        state.events.pop();
                    }
                    return state;
                }, function (state) {
                    var returnValue;
                    if (state.hasOwnProperty("events")) {
                        returnValue = state;
                    }
                    return returnValue || [];
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("bottomK", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    var k = parameters.get("k");
                    state.events = state.events || [];
                    var currentLength = state.events.length;
                    if (currentLength < k || (currentLength === k && selector(event.payload) < selector(state.events[currentLength - 1].payload))) {
                        state.events.push(event);
                        state.events.sort(function (e1, e2) {
                            var p1 = selector(e1.payload);
                            var p2 = selector(e2.payload);
                            if (p1 > p2)
                                return 1;
                            if (p1 < p2)
                                return -1;
                            return 0;
                        });
                    }
                    if (state.events.length > k) {
                        state.events.pop();
                    }
                    return state;
                }, function (state) {
                    var returnValue;
                    if (state.hasOwnProperty("events")) {
                        returnValue = state;
                    }
                    return returnValue || [];
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("var", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    state.elements = state.elements || [];
                    var element = selector(event.payload);
                    if (element !== null && element != undefined) {
                        state.elements.push(element);
                    }
                    return state;
                }, function (state) {
                    return StatHelper.computeVariance(state.elements, false);
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("varp", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    state.elements = state.elements || [];
                    var element = selector(event.payload);
                    if (element !== null && element != undefined) {
                        state.elements.push(element);
                    }
                    return state;
                }, function (state) {
                    return StatHelper.computeVariance(state.elements, true);
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("stdev", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    state.elements = state.elements || [];
                    var element = selector(event.payload);
                    if (element !== null && element != undefined) {
                        state.elements.push(element);
                    }
                    return state;
                }, function (state) {
                    return StatHelper.computeStedev(state.elements, false);
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("stdevp", function (event, state, parameters) {
                    var selector;
                    if (parameters.has("selector")) {
                        selector = parameters.get("selector");
                    }
                    else {
                        selector = function (p) { return p; };
                    }
                    state.elements = state.elements || [];
                    var element = selector(event.payload);
                    if (element !== null && element != undefined) {
                        state.elements.push(element);
                    }
                    return state;
                }, function (state) {
                    return StatHelper.computeStedev(state.elements, true);
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("toList", function (event, state, parameters) {
                    var project;
                    if (parameters.has("project")) {
                        project = parameters.get("project");
                    }
                    else {
                        project = null;
                    }
                    state.elements = state.elements || [];
                    var element = (project !== null) ? project(event.payload) : event.payload;
                    state.elements.push(element);
                    return state;
                }, function (state) {
                    var result = state.elements;
                    state.elements = [];
                    return result;
                });
                this.add(op);
                op = new TStreams.Internals.WindowOperator("_steamr_topK", function (event, state, parameters) {
                    var comparer = parameters.get("comparer");
                    var k = parameters.get("k");
                    state.elements = state.elements || [];
                    state.k = k;
                    state.comparer = comparer;
                    state.elements.push(event.payload);
                    return state;
                }, function (state) {
                    var result = [];
                    state.elements.sort(state.comparer);
                    var count = Math.min(state.k, state.elements.length);
                    var nextRank = 1;
                    var outputRank = 1;
                    var first = true;
                    var rankValue;
                    for (var i = 0; i < state.elements.length; i++) {
                        var value = state.elements[i];
                        if (first || state.comparer(rankValue, value) != 0) {
                            if (result.length >= count) {
                                break;
                            }
                            outputRank = nextRank;
                            rankValue = value;
                            first = false;
                        }

                        // Ranking has gaps on it, this is expected
                        // Rank value follows the same as Sql Rank and not Dense_Rank
                        result.push({ rank: outputRank, value: value });
                        nextRank++;
                    }
                    state.elements = [];
                    return result;
                });
                this.add(op);
            }
            WindowOperatorDictionary.prototype.add = function (value) {
                this._items.set(value.name, value);
            };
            WindowOperatorDictionary.prototype.get = function (key) {
                return this._items.get(key);
            };
            WindowOperatorDictionary.prototype.getKeys = function () {
                return this._items.getKeys();
            };
            WindowOperatorDictionary.prototype.getValues = function () {
                var results = [];
                var keyValuePairs = this._items.getItems();
                var length = keyValuePairs.length;
                for (var i = 0; i < length; i++) {
                    results.push(keyValuePairs[i].value);
                }
                return results;
            };
            WindowOperatorDictionary.prototype.has = function (key) {
                return this._items.has(key);
            };
            WindowOperatorDictionary._traverse = function (value, result, expression) {
                if (typeof value === "number" || typeof value === "string" || value instanceof Date) {
                    result = expression(value, result);
                }
                else if (Array.isArray(value)) {
                    if (Array.isArray(result) === false) {
                        result = [];
                    }
                    var length = value.length;
                    for (var i = 0; i < length; i++) {
                        result[i] = expression(value[i], result[i]);
                    }
                }
                else if (typeof value === "object") {
                    if (typeof result !== "object") {
                        result = {};
                    }
                    if (value !== null) {
                        for (var propertyName in value) {
                            if (value.hasOwnProperty(propertyName)) {
                                result[propertyName] = this._traverse(value[propertyName], result[propertyName], expression);
                            }
                        }
                    }
                }
                return result;
            };
            return WindowOperatorDictionary;
        })();
        Collections.WindowOperatorDictionary = WindowOperatorDictionary;
        var StatHelper = (function () {
            function StatHelper() {
            }
            StatHelper.computeVariance = function (elements, asPopulation) {
                if (elements === null || elements === undefined || elements.length == 0) {
                    return null;
                }
                if (elements.length == 1) {
                    return (asPopulation) ? 0.0 : null;
                }
                var size = elements.length;
                var mean = 0;
                for (var i = 0; i < size; i++) {
                    mean += elements[i] / size;
                }
                var divisor = asPopulation ? size : size - 1;
                var variance = 0;
                for (var i = 0; i < size; i++) {
                    var difference = elements[i] - mean;
                    variance += (difference * difference) / divisor;
                }
                if (!isFinite(variance)) {
                    return null;
                }
                return variance;
            };
            StatHelper.computeStedev = function (elements, asPopulation) {
                var variance = StatHelper.computeVariance(elements, asPopulation);
                return (variance === null) ? null : Math.sqrt(variance);
            };
            return StatHelper;
        })();
    })(Collections = TStreams.Collections || (TStreams.Collections = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var DeployableObject = (function () {
            function DeployableObject(name, expression) {
                this.name = name;
                this.expression = expression;
                this._state = 0 /* created */;
            }
            DeployableObject.prototype.getState = function () {
                return this._state;
            };
            DeployableObject.prototype.setState = function (state) {
                this._state = state;
            };
            DeployableObject.prototype.syncState = function (deployable) {
                this._state = deployable._state;
            };
            return DeployableObject;
        })();
        Internals.DeployableObject = DeployableObject;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var Microsoft;
(function (Microsoft) {
    var EventProcessing;
    (function (EventProcessing) {
        var SteamR;
        (function (SteamR) {
            var Contracts;
            (function (Contracts) {
                var SteamRUnit = (function () {
                    function SteamRUnit() {
                    }
                    SteamRUnit.Default = '';
                    return SteamRUnit;
                })();
                Contracts.SteamRUnit = SteamRUnit;
                var EventStream;
                (function (EventStream) {
                    function FromInput(name, id, startTimeSelector, keySelector) {
                        return TStreams.fromInput(name, id, startTimeSelector, keySelector);
                    }
                    EventStream.FromInput = FromInput;
                    function ToOutput(q, name) {
                        return q.toOutput(name);
                    }
                    EventStream.ToOutput = ToOutput;
                    var StatefulSelect = (function (_super) {
                        __extends(StatefulSelect, _super);
                        function StatefulSelect(seed, inputSelector, whenFilter, outputSelector, timeout) {
                            _super.call(this, "StatefulSelect");
                            this._seed = seed;
                            this._inputSelector = inputSelector;
                            this._whenFilter = whenFilter;
                            this._outputSelector = outputSelector;
                            this._timeout = timeout;
                        }
                        StatefulSelect.prototype._processEvent = function (event, context) {
                            var ctxt = context;
                            var stateArray = ctxt._windowContext.results[0].state;
                            if (stateArray.length == 0) {
                                stateArray.push(this._seed());
                            }
                            var state = stateArray[0];
                            if (event.kind === 4 /* punctuation */) {
                                state.cleanup(event.startTime);
                                context.output(event);
                            }
                            else {
                                var input = this._inputSelector(event.payload, event.startTime);
                                var included = this._whenFilter(event.payload);
                                var result = state.update(input, included, event.startTime);
                                var output = this._outputSelector(event.payload, event.startTime, result);
                                var outputEvent = TStreams.Event.create(output, event.startTime, event.endTime, event.kind);
                                context.output(outputEvent);
                            }
                            return !isFinite(event.startTime);
                        };
                        return StatefulSelect;
                    })(TStreams.Internals.Operator);
                    EventStream.StatefulSelect = StatefulSelect;
                })(EventStream = Contracts.EventStream || (Contracts.EventStream = {}));
            })(Contracts = SteamR.Contracts || (SteamR.Contracts = {}));
        })(SteamR = EventProcessing.SteamR || (EventProcessing.SteamR = {}));
    })(EventProcessing = Microsoft.EventProcessing || (Microsoft.EventProcessing = {}));
})(Microsoft || (Microsoft = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var SteamRContracts = Microsoft.EventProcessing.SteamR.Contracts;
        var Expression = (function () {
            function Expression(operators, windowOperators) {
                this._joinExpressions = [];
                this._operators = operators;
                this._windowOperators = windowOperators;
            }
            Expression.create = function (start, operators, windowOperators) {
                var expr = new Expression(operators, windowOperators);
                var op = start;
                var context = TStreams.Internals.Context.create(op);
                expr._head = context;
                expr._lastNode = context;
                return expr;
            };
            Expression.prototype.clone = function (groupKey) {
                var copy = new Expression(this._operators, this._windowOperators);
                copy._head = this._head.clone(groupKey);
                return copy;
            };
            Expression.prototype.to = function (output) {
                TStreams.Diagnostics.Assert.isInstanceOf(output, Internals.Output, TStreams.ErrorStrings.endOfExpressionMustBeOutput);
                if (typeof this._head._groupContext.groupExpression !== "undefined") {
                    throw new TypeError(TStreams.ErrorStrings.queryContainsAGroupOperatorWithoutAMatchingUnion);
                }
                var op = output;
                this._addNode(TStreams.Internals.Context.create(op));
                return new Internals.DeployableObject(output.name, this);
            };
            Expression.prototype.toOutput = function (outputName) {
                var output = TStreams.getOutput(outputName);
                this.to(output);
                return new Internals.DeployableObject(outputName, this);
            };
            Expression.prototype.where = function (filter) {
                TStreams.Diagnostics.Assert.isFunction(filter, "filter");
                var context = TStreams.Internals.Context.create(this._operators.get("where"));
                context.filter = filter;
                this._addNode(context);
                return this;
            };
            Expression.prototype.select = function (project) {
                TStreams.Diagnostics.Assert.isFunction(project, "project");
                var context = TStreams.Internals.Context.create(this._operators.get("select"));
                context.project = project;
                this._addNode(context);
                return this;
            };
            Expression.prototype.selectMany = function (project) {
                TStreams.Diagnostics.Assert.isFunction(project, "project");
                var context = TStreams.Internals.Context.create(this._operators.get("selectMany"));
                context.project = project;
                this._addNode(context);
                return this;
            };
            Expression.prototype._steamr_stateful_select = function (partitionKeySelector, seed, inputSelector, whenFilter, outputSelector, timeout) {
                var that = this;
                if (!!partitionKeySelector) {
                    TStreams.Diagnostics.Assert.isFunction(partitionKeySelector, "partitionKeySelector");
                    that = that.groupBy(partitionKeySelector);
                }
                TStreams.Diagnostics.Assert.isFunction(seed, "seed");
                TStreams.Diagnostics.Assert.isFunction(inputSelector, "inputSelector");
                TStreams.Diagnostics.Assert.isFunction(whenFilter, "inputSelector");
                TStreams.Diagnostics.Assert.isFunction(outputSelector, "outputSelector");
                var operator = new SteamRContracts.EventStream.StatefulSelect(seed, inputSelector, whenFilter, outputSelector, timeout);
                var context = TStreams.Internals.Context.create(operator);
                that._addNode(context);
                return (!!partitionKeySelector) ? that.groupUnion() : that;
            };
            Expression.prototype.groupBy = function (keySelector) {
                if (typeof this._head._groupContext.groupExpression !== "undefined") {
                    throw new TypeError(TStreams.ErrorStrings.nestedGroupingNotSupported);
                }
                var context = TStreams.Internals.Context.create(this._operators.get("groupBy"));
                context._groupContext.keySelector = keySelector;
                this._addNode(context);
                context._groupContext.groupExpression = this;
                var expr = new Expression(this._operators, this._windowOperators);
                expr._head = TStreams.Internals.Context.create(this._operators.get("passThrough"));
                expr._head._groupContext.groupExpression = this;
                expr._lastNode = expr._head;
                context._groupContext.groupTemplate = expr;
                return expr;
            };
            Expression.prototype.groupUnion = function (keyProjector) {
                TStreams.Diagnostics.Assert.isInstanceOf(this._head._groupContext.groupExpression, Expression, TStreams.ErrorStrings.queryContainsGroupUnionWithoutGroupOperator);
                var expr = this._head._groupContext.groupExpression;
                var context = TStreams.Internals.Context.create(this._operators.get("groupUnion"));
                context._groupContext.keyProjector = keyProjector;
                this._addNode(context);
                var unionedContext = TStreams.Internals.Context.create(this._operators.get("passThrough"));
                expr._lastNode._groupContext.unionedNode = unionedContext;
                expr._addNode(unionedContext);
                context._groupContext.unionedNode = unionedContext;
                return expr;
            };
            Expression.prototype.snapshotWindow = function (clipToWindowEnd) {
                var context = TStreams.Internals.Context.create(this._operators.get("snapshot"));
                if (typeof clipToWindowEnd !== "undefined") {
                    context._windowContext.clipToWindowEnd = clipToWindowEnd;
                }
                this._addNode(context);
                return Internals.WindowExpression.create(this, this._windowOperators);
            };
            Expression.prototype.hoppingWindow = function (windowSize, hopSize, alignment, clipToWindowEnd) {
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(windowSize, "windowSize");
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(hopSize, "hopSize");
                if (hopSize > windowSize) {
                    throw new RangeError(TStreams.ErrorStrings.hopSizeNeedsToBeSmallerOrEqualToWindowSize);
                }
                if (typeof alignment === "number") {
                    TStreams.Diagnostics.Assert.isFinitePositiveOrNullInteger(alignment, "alignment");
                }
                else {
                    var pastMidnight = new Date();
                    pastMidnight.setHours(0, 0, 0, 0);
                    alignment = pastMidnight.getTime();
                }
                var context = TStreams.Internals.Context.create(this._operators.get("hopping"));
                context._windowContext.results[0].start = alignment;
                context._windowContext.results[0].end = alignment + windowSize;
                context._windowContext.size = windowSize;
                context._windowContext.hopSize = hopSize;
                if (typeof clipToWindowEnd !== "undefined") {
                    context._windowContext.clipToWindowEnd = clipToWindowEnd;
                }
                this._addNode(context);
                return Internals.WindowExpression.create(this, this._windowOperators);
            };
            Expression.prototype.tumblingWindow = function (windowSize, alignment, clipToWindowEnd) {
                return this.hoppingWindow(windowSize, windowSize, alignment, clipToWindowEnd);
            };
            Expression.prototype.countWindow = function (events, clipToWindowEnd) {
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(events, "events");
                var context = TStreams.Internals.Context.create(this._operators.get("count"));
                context._windowContext.size = events;
                if (typeof clipToWindowEnd !== "undefined") {
                    context._windowContext.clipToWindowEnd = clipToWindowEnd;
                }
                this._addNode(context);
                return Internals.WindowExpression.create(this, this._windowOperators);
            };
            Expression.prototype.conditionWindow = function (start, stop, clipToWindowEnd) {
                TStreams.Diagnostics.Assert.isFunction(start, "start");
                TStreams.Diagnostics.Assert.isFunction(stop, "stop");
                var context = TStreams.Internals.Context.create(this._operators.get("condition"));
                context._windowContext.startExpression = start;
                context._windowContext.stopExpression = stop;
                if (typeof clipToWindowEnd !== "undefined") {
                    context._windowContext.clipToWindowEnd = clipToWindowEnd;
                }
                this._addNode(context);
                return Internals.WindowExpression.create(this, this._windowOperators);
            };
            Expression.prototype._buildJoin = function (joinName, right, predicate, project, offset) {
                var leftContext = TStreams.Internals.Context.create(this._operators.get(joinName));
                var rightContext = TStreams.Internals.Context.create(this._operators.get(joinName));
                var joinQueue = [];
                leftContext._joinContext.leftContext = leftContext;
                leftContext._joinContext.rightContext = rightContext;
                leftContext._joinContext.isFrom = 0 /* left */;
                leftContext._joinContext.joinQueue = joinQueue;
                rightContext._joinContext.rightContext = rightContext;
                rightContext._joinContext.leftContext = leftContext;
                rightContext._joinContext.isFrom = 1 /* right */;
                rightContext._joinContext.joinQueue = joinQueue;
                if (typeof predicate !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(predicate, "predicate");
                    leftContext._joinContext.predicate = predicate;
                    rightContext._joinContext.predicate = predicate;
                }
                if (typeof project !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(project, "project");
                    leftContext._joinContext.project = project;
                    rightContext._joinContext.project = project;
                }
                if (!!offset) {
                    leftContext._joinContext.steamrOffset = offset;
                    rightContext._joinContext.steamrOffset = offset;
                }
                var expression = right;
                expression._addNode(rightContext);
                this._joinExpressions.push(expression);
                this._addNode(leftContext);
                return this;
            };
            Expression.prototype.join = function (right, predicate, project) {
                return this._buildJoin("join", right, predicate, project);
            };
            Expression.prototype._offset_and_extend = function (joinable, offset, duration) {
                if (offset != 0) {
                    joinable = joinable.moveEventInTime(offset);
                }
                if (!!duration && duration != 0) {
                    joinable = joinable.alterEventDuration(function () { return duration; });
                }
                return joinable;
            };
            Expression.prototype._steamr_join = function (right, rightDuration, leftDuration, predicate, project) {
                right = this._offset_and_extend(right, -1 * leftDuration, leftDuration + rightDuration);
                return this._buildJoin("steamr_join", right, predicate, project, leftDuration);
            };
            Expression.prototype._steamr_join_with_key_selectors = function (right, rightDuration, leftDuration, leftKeySelector, rightKeySelector, predicate, project) {
                right = this._offset_and_extend(right, -1 * leftDuration, leftDuration + rightDuration);
                var fullPredicate = function (leftPayload, rightPayload) {
                    var leftKey = leftKeySelector(leftPayload);
                    var rightKey = rightKeySelector(rightPayload);
                    if (typeof (leftKey) === "undefined" || leftKey === null || typeof (rightKey) === "undefined" || rightKey === null) {
                        return false;
                    }
                    if (!TStreams.Utils.compare(leftKey, rightKey)) {
                        return false;
                    }
                    return predicate(leftPayload, rightPayload);
                };
                return this._buildJoin("steamr_join", right, fullPredicate, project, leftDuration);
            };
            Expression.prototype._steamr_join_ref_data = function (right, leftKeySelector, rightKeySelector, project) {
                var predicate = function (leftPayload, rightPayload) {
                    var leftKey = leftKeySelector(leftPayload);
                    var rightKey = rightKeySelector(rightPayload);
                    if (typeof (leftKey) === "undefined" || leftKey === null || typeof (rightKey) === "undefined" || rightKey === null) {
                        return false;
                    }
                    return TStreams.Utils.compare(leftKey, rightKey);
                };
                return this._buildJoin("steamr_join", right, predicate, project);
            };
            Expression.prototype._steamr_left_join = function (right, rightDuration, leftDuration, predicate, innerResultSelector, outerResultSelector) {
                var project = function (l, r) {
                    if (typeof (r) === "undefined") {
                        return outerResultSelector(l);
                    }
                    return innerResultSelector(l, r);
                };
                right = this._offset_and_extend(right, -1 * leftDuration, leftDuration - rightDuration);
                return this._buildJoin("steamr_left_join", right, predicate, project, leftDuration);
            };
            Expression.prototype._steamr_left_join_with_key_selectors = function (right, rightDuration, leftDuration, leftKeySelector, rightKeySelector, predicate, innerResultSelector, outerResultSelector) {
                var project = function (l, r) {
                    if (typeof (r) === "undefined") {
                        return outerResultSelector(l);
                    }
                    return innerResultSelector(l, r);
                };
                var fullPredicate = function (leftPayload, rightPayload) {
                    var leftKey = leftKeySelector(leftPayload);
                    var rightKey = rightKeySelector(rightPayload);
                    if (typeof (leftKey) === "undefined" || leftKey === null || typeof (rightKey) === "undefined" || rightKey === null) {
                        return false;
                    }
                    if (!TStreams.Utils.compare(leftKey, rightKey)) {
                        return false;
                    }
                    return predicate(leftPayload, rightPayload);
                };
                right = this._offset_and_extend(right, -1 * leftDuration, leftDuration - rightDuration);
                return this._buildJoin("steamr_left_join", right, fullPredicate, project, leftDuration);
            };
            Expression.prototype._steamr_left_join_ref_data = function (right, leftKeySelector, rightKeySelector, outerResultSelector, innerResultSelector) {
                var project = function (l, r) {
                    if (typeof (r) === "undefined") {
                        return outerResultSelector(l);
                    }
                    return innerResultSelector(l, r);
                };
                var predicate = function (leftPayload, rightPayload) {
                    var leftKey = leftKeySelector(leftPayload);
                    var rightKey = rightKeySelector(rightPayload);
                    if (typeof (leftKey) === "undefined" || leftKey === null || typeof (rightKey) === "undefined" || rightKey === null) {
                        return false;
                    }
                    return TStreams.Utils.compare(leftKey, rightKey);
                };
                return this._buildJoin("steamr_left_join", right, predicate, project);
            };
            Expression.prototype._steamr_sliding_window = function (size, hop, offset, hopping) {
                if (!!hopping) {
                    return this._steamr_hopping_window(size, hop, offset);
                }
                else {
                    if (size != 0) {
                        this.alterEventDuration(function () { return size; });
                    }
                    var context = TStreams.Internals.Context.create(this._operators.get("steamr_snapshot"));
                    this._addNode(context);
                    return Internals.WindowExpression.create(this, this._windowOperators);
                }
            };
            Expression.prototype._steamr_hopping_window = function (size, hop, offset) {
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(size, "window size");
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(hop, "hop size");
                if (hop > size) {
                    throw new RangeError(TStreams.ErrorStrings.hopSizeNeedsToBeSmallerOrEqualToWindowSize);
                }
                if (typeof offset !== "number" || offset % 1 !== 0) {
                    throw new RangeError(TStreams.ErrorStrings.parameterOffsetMustBeAnInteger);
                }
                var context = TStreams.Internals.Context.create(this._operators.get("steamr_hopping"));
                context._windowContext.results[0].end = offset;
                context._windowContext.results[0].start = offset - size;
                context._windowContext.size = size;
                context._windowContext.hopSize = hop;
                context._windowContext.clipToWindowEnd = true;
                this._addNode(context);
                return Internals.WindowExpression.create(this, this._windowOperators);
            };
            Expression.prototype.leftJoin = function (right, predicate, project) {
                return this._buildJoin("leftJoin", right, predicate, project);
            };
            Expression.prototype.leftAntiSemiJoin = function (right) {
                var leftContext = TStreams.Internals.Context.create(this._operators.get("leftJoin"));
                var rightContext = TStreams.Internals.Context.create(this._operators.get("leftJoin"));
                leftContext._joinContext.leftContext = leftContext;
                leftContext._joinContext.rightContext = rightContext;
                leftContext._joinContext.isFrom = 0 /* left */;
                leftContext._joinContext.anti = true;
                leftContext._joinContext.project = function (left) { return left; };
                rightContext._joinContext.rightContext = rightContext;
                rightContext._joinContext.leftContext = leftContext;
                rightContext._joinContext.isFrom = 1 /* right */;
                rightContext._joinContext.anti = true;
                rightContext._joinContext.project = function (left) { return left; };
                var expression = right;
                expression._addNode(rightContext);
                this._joinExpressions.push(expression);
                this._addNode(leftContext);
                return this;
            };
            Expression.prototype.union = function (right) {
                var leftContext = TStreams.Internals.Context.create(this._operators.get("union"));
                var rightContext = TStreams.Internals.Context.create(this._operators.get("union"));
                var leftEvents = [];
                var rightEvents = [];
                leftContext._windowContext.events = leftEvents;
                leftContext._joinContext.leftContext = leftContext;
                leftContext._joinContext.rightContext = rightContext;
                leftContext._joinContext.isFrom = 0 /* left */;
                rightContext._windowContext.events = rightEvents;
                rightContext._joinContext.rightContext = rightContext;
                rightContext._joinContext.leftContext = leftContext;
                rightContext._joinContext.isFrom = 1 /* right */;
                var expression = right;
                expression._addNode(rightContext);
                this._joinExpressions.push(expression);
                this._addNode(leftContext);
                return this;
            };
            Expression.prototype.alterEventStartTime = function (offset) {
                TStreams.Diagnostics.Assert.isFiniteNumber(offset, "offset");
                if (offset === 0) {
                    throw new RangeError(TStreams.ErrorStrings.alterStartTimeWithOffset0);
                }
                var context = TStreams.Internals.Context.create(this._operators.get("alterEventStartTime"));
                context.offset = offset;
                this._addNode(context);
                return this;
            };
            Expression.prototype.alterEventEndTime = function (offset) {
                TStreams.Diagnostics.Assert.isFiniteNumber(offset, "offset");
                if (offset === 0) {
                    throw new RangeError(TStreams.ErrorStrings.alterEndTimeWithOffset0);
                }
                var context = TStreams.Internals.Context.create(this._operators.get("alterEventEndTime"));
                context.offset = offset;
                this._addNode(context);
                return this;
            };
            Expression.prototype.alterEventDuration = function (eventDurationFunction) {
                TStreams.Diagnostics.Assert.isFunction(eventDurationFunction, "eventDurationFunction");
                var context = TStreams.Internals.Context.create(this._operators.get("alterEventDuration"));
                context.offsetExpression = eventDurationFunction;
                this._addNode(context);
                return this;
            };
            Expression.prototype.moveEventInTime = function (offset) {
                TStreams.Diagnostics.Assert.isFiniteNumber(offset, "offset");
                if (offset === 0) {
                    throw new RangeError(TStreams.ErrorStrings.moveEventInTimeWithOffset0);
                }
                var context = TStreams.Internals.Context.create(this._operators.get("moveEventInTime"));
                context.offset = offset;
                this._addNode(context);
                return this;
            };
            Expression.prototype.getTimeFromEvent = function (startTimeSelector, endTimeSelector) {
                if (typeof (startTimeSelector) !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(startTimeSelector, "startTimeSelector");
                }
                if (typeof (endTimeSelector) !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(endTimeSelector, "endTimeSelector");
                }
                var context = TStreams.Internals.Context.create(this._operators.get("getTimeFromEvent"));
                context.startTimeSelector = startTimeSelector;
                context.endTimeSelector = endTimeSelector;
                this._addNode(context);
                return this;
            };
            Expression.prototype.streamingOperator = function (name) {
                TStreams.Diagnostics.Assert.isString(name, "name");
                TStreams.Diagnostics.Assert.has(this._operators, name, TStreams.ErrorStrings.missingOperator);
                var context = TStreams.Internals.Context.create(this._operators.get(name));
                this._addNode(context);
                return this;
            };
            Expression.prototype.insert = function (event) {
                return this._head.output(event);
            };
            Expression.prototype._addNode = function (node) {
                this._lastNode.addSuccessor(node);
                this._lastNode = node;
            };
            return Expression;
        })();
        Internals.Expression = Expression;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var Results = (function () {
            function Results() {
                this.isStarted = false;
                this.start = 0;
                this.end = 0;
                this.state = [];
            }
            return Results;
        })();
        Internals.Results = Results;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Diagnostics;
    (function (Diagnostics) {
        (function (Level) {
            Level[Level["error"] = 1] = "error";
            Level[Level["warning"] = 2] = "warning";
            Level[Level["info"] = 3] = "info";
        })(Diagnostics.Level || (Diagnostics.Level = {}));
        var Level = Diagnostics.Level;
        var Trace = (function () {
            function Trace() {
            }
            Trace.error = function (message, stack) {
                console.error(message);
                var stream = TStreams.getInput("stdInput");
                stream.insertEvent({ level: 1 /* error */, message: message, stack: stack });
            };
            Trace.info = function (message) {
                console.info(message);
                var stream = TStreams.getInput("stdInput");
                stream.insertEvent({ level: 3 /* info */, message: message });
            };
            return Trace;
        })();
        Diagnostics.Trace = Trace;
    })(Diagnostics = TStreams.Diagnostics || (TStreams.Diagnostics = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        (function (IsFrom) {
            IsFrom[IsFrom["left"] = 0] = "left";
            IsFrom[IsFrom["right"] = 1] = "right";
        })(Internals.IsFrom || (Internals.IsFrom = {}));
        var IsFrom = Internals.IsFrom;
        ;
        var JoinContext = (function () {
            function JoinContext() {
                this.predicate = function () { return true; };
                this.project = function (left, right) {
                    return { left: left, right: right };
                };
                this.isFrom = 0 /* left */;
                this.anti = false;
                this.steamrOffset = 0;
            }
            return JoinContext;
        })();
        Internals.JoinContext = JoinContext;
        var WindowContext = (function () {
            function WindowContext() {
                this.events = [];
                this.count = 0;
                this.size = 0;
                this.hopSize = 0;
                this.clipToWindowEnd = false;
                this.results = [new Internals.Results()];
                this.aggregates = [];
            }
            return WindowContext;
        })();
        Internals.WindowContext = WindowContext;
        var GroupContext = (function () {
            function GroupContext() {
                this.unionEvents = [];
                this.groups = new TStreams.Collections.Dictionary();
            }
            return GroupContext;
        })();
        Internals.GroupContext = GroupContext;
        var Context = (function () {
            function Context(operator) {
                this.syncTime = 0;
                this._this = this;
                this._operator = operator;
                this._successors = [];
                this._windowContext = new WindowContext();
                this._joinContext = new JoinContext();
                this._groupContext = new GroupContext();
            }
            Context.create = function (operator) {
                return new Context(operator);
            };
            Context.prototype.clone = function (groupKey) {
                var clone = new Context(this._operator);
                clone.filter = this.filter;
                clone.project = this.project;
                clone.offset = this.offset;
                clone.offsetExpression = this.offsetExpression;
                clone._windowContext = Object.create(this._windowContext);
                clone._windowContext.events = [];
                clone._windowContext.results = [new Internals.Results()];
                clone._windowContext.results[0].start = this._windowContext.results[0].start;
                clone._windowContext.results[0].end = this._windowContext.results[0].end;
                clone._joinContext = Object.create(this._joinContext);
                clone._groupContext = Object.create(this._groupContext);
                clone._groupContext.key = groupKey;
                var length = this._successors.length;
                for (var i = 0; i < length; i++) {
                    clone.addSuccessor(this._successors[i].clone(groupKey));
                }
                return clone;
            };
            Context.prototype.addSuccessor = function (context) {
                var length = this._successors.length;
                var contains = false;
                for (var i = 0; i < length; i++) {
                    if (context === this._successors[i]) {
                        contains = true;
                        break;
                    }
                }
                if (contains === false) {
                    this._successors.push(context);
                }
            };
            Context.prototype.output = function (event) {
                var length = this._successors.length;
                var stateClear = true;
                for (var i = 0; i < length; i++) {
                    var successor = this._successors[i];
                    if (stateClear === true) {
                        stateClear = successor._operator._processEvent(event, successor);
                    }
                    else {
                        successor._operator._processEvent(event, successor);
                    }
                }
                return stateClear;
            };
            return Context;
        })();
        Internals.Context = Context;
        var ExpressionStartContext = (function () {
            function ExpressionStartContext() {
            }
            ExpressionStartContext.create = function (operator) {
                var context = new ExpressionStartContext();
                context._operator = operator;
                context._successors = [];
                return context;
            };
            ExpressionStartContext.prototype.addSuccessor = function (deployableObject) {
                this._successors.push(deployableObject);
            };
            ExpressionStartContext.prototype.output = function (event) {
                var length = this._successors.length;
                var stateClean = true;
                for (var i = 0; i < length; i++) {
                    var deployable = this._successors[i];
                    try {
                        var expression = deployable.expression;
                        if (deployable.getState() === 1 /* running */) {
                            if (stateClean === true) {
                                stateClean = expression.insert(event);
                            }
                            else {
                                expression.insert(event);
                            }
                        }
                    }
                    catch (e) {
                        TStreams.Diagnostics.Trace.error(TStreams.Utils.formatString(TStreams.ErrorStrings.expressionHasError, deployable.name, e.message), e.stack);
                        deployable.setState(4 /* stopped */);
                    }
                }
                return stateClean;
            };
            return ExpressionStartContext;
        })();
        Internals.ExpressionStartContext = ExpressionStartContext;
        var Aggregate = (function () {
            function Aggregate(windowOperator, parameters) {
                this.windowOperator = windowOperator;
                this.parameters = parameters;
            }
            Aggregate.create = function (windowOperator, parameters) {
                return new Aggregate(windowOperator, parameters);
            };
            return Aggregate;
        })();
        Internals.Aggregate = Aggregate;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var ExpressionStart = (function (_super) {
            __extends(ExpressionStart, _super);
            function ExpressionStart(name) {
                _super.call(this, name);
                this._context = Internals.ExpressionStartContext.create(this);
            }
            ExpressionStart.prototype.getContext = function () {
                return this._context;
            };
            ExpressionStart.prototype._processEvent = function (event, context) {
                return this._context.output(event);
            };
            return ExpressionStart;
        })(Internals.Operator);
        Internals.ExpressionStart = ExpressionStart;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    var Heap = require('heap');
    var reorderPolicyEnum = {
        Drop: "Drop",
        Adjust: "Adjust"    
    };
    (function (Internals) {
        var Input = (function (_super) {
            __extends(Input, _super);
            function Input(name) {
                _super.call(this, name);
                this._syncTime = 0;
                this.reorderLatency = null;
                this.currentTime = 0;
                this.highWaterMark = 0;
                this.reorderPolicy = null;
                this.pqSorter = null;
            }
            Input.prototype.insertEvent = function (payload) {
                TStreams.Diagnostics.Assert.isLegalObject(payload, "payload");
                if (payload instanceof TStreams.Event) {
                    this.reorder(payload);
                }
                else {
                    var now = Date.now();
                    this.reorder(TStreams.Event.create(payload, now, now + 1, 0 /* point */));
                }
            };
            Input.prototype.insertPointEvent = function (payload, startTime) {
                TStreams.Diagnostics.Assert.isLegalObject(payload, "payload");
                this.reorder(TStreams.Event.create(payload, startTime, startTime + 1, 0 /* point */));
            };
            Input.prototype.insertIntervalEvent = function (payload, startTime, endTime) {
                TStreams.Diagnostics.Assert.isLegalObject(payload, "payload");
                this.reorder(TStreams.Event.create(payload, startTime, endTime, 1 /* interval */));
            };
            Input.prototype.insertEdgeEvent = function (payload, startTime, endTime) {
                TStreams.Diagnostics.Assert.isLegalObject(payload, "payload");
                if (typeof endTime !== "number") {
                    this._insert(TStreams.Event.create(payload, startTime, Infinity, 2 /* edgeStart */));
                }
                else {
                    this._insert(TStreams.Event.create(payload, startTime, endTime, 3 /* edgeEnd */));
                }
            };
            Input.prototype.incrementTime = function (timeSpan) {
                var newSyncTime = this._syncTime + timeSpan;
                var cti = new TStreams.Event(undefined, newSyncTime, newSyncTime + 1, 4 /* punctuation */);
                this._insert(cti);
            };
            Input.prototype.flush = function () {
                this.incrementTime(Infinity);
            };
            Input.prototype._insert = function (event) {
                var newSyncTime;
                if (event.kind === 3 /* edgeEnd */) {
                    newSyncTime = event.endTime;
                }
                else {
                    newSyncTime = event.startTime;
                }
                if (newSyncTime < this._syncTime) {
                    TStreams.Diagnostics.Trace.info(TStreams.Utils.formatString(TStreams.ErrorStrings.eventInsertedOutOfOrder, this.name));
                }
                else {
                    this._syncTime = newSyncTime;
                    this._processEvent(event, undefined);
                }
                if (isFinite(newSyncTime) === false) {
                    TStreams.Diagnostics.Trace.info(TStreams.Utils.formatString(TStreams.ErrorStrings.syncTimeReachedInfinity, this.name));
                }
            };
            Input.prototype.setReorderLatency = function (latency) {
                this.reorderLatency = latency;
                this.pqSorter = new Heap(function (a, b) {
                    return a.startTime - b.startTime;
                });
            };
            Input.prototype.setReorderPolicy = function (policy) {
                if (policy === reorderPolicyEnum.Drop || policy === reorderPolicyEnum.Adjust) {
                    this.reorderPolicy = policy;
                }
            };
            Input.prototype.reorder = function (event) {
                if (!this.reorderLatency || !this.reorderPolicy) {
                    this._insert(event);
                    return;
                }
                var moveFrom = this.currentTime;
                var moveTo = moveFrom;
                var timestamp = event.startTime;

                if (timestamp <= moveFrom) {
                    if (this.reorderPolicy === reorderPolicyEnum.Drop) {
                        this.processDropWithLatency(event);
                    } else if (this.reorderPolicy === reorderPolicyEnum.Adjust) {
                        this.processAdjustWithLatency(event);
                    }
                    return;
                }
                if (timestamp > this.highWaterMark) {
                    this.highWaterMark = timestamp;
                    moveTo = timestamp - this.reorderLatency;
                    if (moveTo < moveFrom) {
                        moveTo = moveFrom;
                    }
                }
                // Tstream does not have punctuation event insert
                if (moveTo > moveFrom) {
                    if (this.pqSorter) {
                        while (!this.pqSorter.empty() && this.pqSorter.peek().startTime <= moveTo) {
                            this._insert(this.pqSorter.pop());
                        }
                    }
                }

                if (timestamp === moveTo) {
                    this._insert(event);
                    return;
                }

                if (this.pqSorter) {
                    this.pqSorter.push(event);
                }

                this.currentTime = moveTo;
            };
            Input.prototype.processDropWithLatency = function(event) {
                var current = this.currentTime;
                var outOfOrder = event.startTime < current;
                if (outOfOrder) {
                    return;
                }
                this._insert(event);
            };
            Input.prototype.processAdjustWithLatency = function(event) {
                var current = this.currentTime;
                var outOfOrder = event.startTime < current;
                if (outOfOrder) {
                    if (event.kind !== 0 && event.kind !== 1) {
                        return;
                    }
                    event.startTime = current;
                    event.endTime = current + 1;
                }
                this._insert(event);
            };
            return Input;
        })(Internals.ExpressionStart);
        Internals.Input = Input;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var Output = (function (_super) {
            __extends(Output, _super);
            function Output(name, callback) {
                _super.call(this, name);
                this._isTarget = false;
                if (typeof callback === "function") {
                    this.subscribe(callback);
                }
            }
            Output.prototype.subscribe = function (callback) {
                var _this = this;
                this._processEvent = function (event, context) {
                    if (event.kind !== 4 /* punctuation */) {
                        callback(event);
                    }
                    return _super.prototype._processEvent.call(_this, event, context);
                };
            };
            Output.prototype.subscribeExternalFunction = function (extFunction) {
                var _this = this;
                TStreams.Diagnostics.Assert.isFunction(extFunction, "extFunction");
                this._processEvent = function (event, context) {
                    if (event.kind !== 4 /* punctuation */) {
                        var newPayload = extFunction(event.payload);
                        var event = TStreams.Event.create(newPayload, event.startTime, event.endTime, event.kind);
                    }
                    return _super.prototype._processEvent.call(_this, event, context);
                };
            };
            Output.prototype.isTarget = function () {
                return this._isTarget;
            };
            Output.prototype._targeted = function (value) {
                if (value === void 0) { value = true; }
                this._isTarget = value;
            };
            return Output;
        })(Internals.ExpressionStart);
        Internals.Output = Output;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    if (typeof Date.now === "undefined") {
        Date.now = function () {
            return new Date().getTime();
        };
    }
    (function (State) {
        State[State["created"] = 0] = "created";
        State[State["running"] = 1] = "running";
        State[State["suspended"] = 2] = "suspended";
        State[State["stopping"] = 3] = "stopping";
        State[State["stopped"] = 4] = "stopped";
    })(TStreams.State || (TStreams.State = {}));
    var State = TStreams.State;
    var operators;
    var windowOperators;
    var queries;
    function from(input) {
        TStreams.Diagnostics.Assert.isInstanceOf(input, TStreams.Internals.ExpressionStart, TStreams.ErrorStrings.expressionMustStartWithInputOrOutput);
        var exp = TStreams.Internals.Expression.create(input, operators, windowOperators);
        return exp;
    }
    TStreams.from = from;
    function fromInput(inputName, inputId, startTimeSelector, keySelector) {
        var operator;
        if (operators.has(inputName)) {
            operator = operators.get(inputName);
        }
        if (!operator || !(operator instanceof TStreams.Internals.Output) && !(operator instanceof TStreams.Internals.Input)) {
            throw new TypeError(TStreams.ErrorStrings.noInputWithGivenName);
        }
        var source = operator;
        var expression = TStreams.from(source);
        if (typeof startTimeSelector !== "undefined") {
            return expression.getTimeFromEvent(startTimeSelector);
        }
        return expression;
    }
    TStreams.fromInput = fromInput;
    function deploy(deployableObject) {
        TStreams.Diagnostics.Assert.isInstanceOf(deployableObject, TStreams.Internals.DeployableObject, TStreams.ErrorStrings.mustBeDeployableObject);
        var name = deployableObject.name;
        TStreams.Diagnostics.Assert.hasNot(queries, name, TStreams.ErrorStrings.expressionWithSameNameAlreadyDeployed);
        var expression = deployableObject.expression;
        var output = expression._lastNode._operator;
        TStreams.Diagnostics.Assert.isFalse(output.isTarget(), TStreams.ErrorStrings.expressionTargetingThisOutputAlreadyDeployed);
        output._targeted();
        var deployable = deployableObject;
        queries.set(name, deployable);
        var expressionStartContext = expression._head;
        var startOperator = (expressionStartContext._operator);
        startOperator.getContext().addSuccessor(deployable);
        deployable.setState(1 /* running */);
        setJoinDeployables(deployable, expression);
    }
    TStreams.deploy = deploy;
    function setJoinDeployables(deploayble, exp) {
        for (var i = 0; i < exp._joinExpressions.length; i++) {
            var rhsExpression = exp._joinExpressions[i];
            var joinDeployable = new TStreams.Internals.DeployableObject(deploayble.name + "_" + i, rhsExpression);
            joinDeployable.syncState(deploayble);
            setJoinDeployables(joinDeployable, rhsExpression);
            var rhsContext = rhsExpression._head;
            var startOperator = (rhsContext._operator);
            startOperator.getContext().addSuccessor(joinDeployable);
        }
    }
    function reset() {
        operators = TStreams.Collections.OperatorDictionary.createInitialized(new TStreams.Collections.Dictionary());
        windowOperators = new TStreams.Collections.WindowOperatorDictionary(new TStreams.Collections.Dictionary());
        queries = new TStreams.Collections.Dictionary();
        var input = TStreams.createInput("stdInput");
        var output = TStreams.createOutput("stdOutput");
        var deployableObject = TStreams.from(input).to(output);
        TStreams.deploy(deployableObject);
    }
    TStreams.reset = reset;
    function initialize() {
        reset();
    }
    function subscribeMessageStream(callback) {
        TStreams.Diagnostics.Assert.isFunction(callback, "callback");
        var outputInterface = TStreams.getOutput("stdOutput");
        var output = outputInterface;
        output.subscribe(callback);
    }
    TStreams.subscribeMessageStream = subscribeMessageStream;
    function createInput(name) {
        TStreams.Diagnostics.Assert.isString(name, "name");
        TStreams.Diagnostics.Assert.hasNot(operators, name, TStreams.ErrorStrings.operatorWithSameNameAlreadyExists);
        var input = new TStreams.Internals.Input(name);
        operators.add(input);
        return input;
    }
    TStreams.createInput = createInput;
    function getInput(name) {
        var operator;
        if (operators.has(name)) {
            operator = operators.get(name);
        }
        TStreams.Diagnostics.Assert.isInstanceOf(operator || {}, TStreams.Internals.Input, TStreams.ErrorStrings.noInputWithGivenName);
        return operator;
    }
    TStreams.getInput = getInput;
    function getInputNames() {
        var names = [];
        var ops = operators.getValues();
        var length = ops.length;
        for (var i = 0; i < length; i++) {
            if (ops[i] instanceof TStreams.Internals.Input === true) {
                names.push(ops[i].name);
            }
        }
        return names;
    }
    TStreams.getInputNames = getInputNames;
    function createOutput(name, callback) {
        TStreams.Diagnostics.Assert.isString(name, "name");
        TStreams.Diagnostics.Assert.hasNot(operators, name, TStreams.ErrorStrings.operatorWithSameNameAlreadyExists);
        var output = new TStreams.Internals.Output(name, callback);
        operators.add(output);
        return output;
    }
    TStreams.createOutput = createOutput;
    function getOutput(name) {
        var operator;
        if (operators.has(name)) {
            operator = operators.get(name);
        }
        TStreams.Diagnostics.Assert.isInstanceOf(operator || {}, TStreams.Internals.Output, TStreams.ErrorStrings.noOutputWithGivenName);
        return operator;
    }
    TStreams.getOutput = getOutput;
    function getOutputNames() {
        var names = [];
        var ops = operators.getValues();
        var length = ops.length;
        for (var i = 0; i < length; i++) {
            if (ops[i] instanceof TStreams.Internals.Output === true) {
                names.push(ops[i].name);
            }
        }
        return names;
    }
    TStreams.getOutputNames = getOutputNames;
    function createAggregate(name, update, close) {
        TStreams.Diagnostics.Assert.isString(name, "name");
        TStreams.Diagnostics.Assert.isFunction(update, "update");
        TStreams.Diagnostics.Assert.isFunction(close, "close");
        TStreams.Diagnostics.Assert.hasNot(windowOperators, name, TStreams.ErrorStrings.windowOperatorWithSameNameAlreadyExists);
        var op = new TStreams.Internals.WindowOperator(name, update, close);
        windowOperators.add(op);
    }
    TStreams.createAggregate = createAggregate;
    function getAggregateNames() {
        return windowOperators.getKeys().filter(function (x) { return x.indexOf('_') !== 0; });
    }
    TStreams.getAggregateNames = getAggregateNames;
    function createStreamingOperator(name, process) {
        TStreams.Diagnostics.Assert.isString(name, "name");
        TStreams.Diagnostics.Assert.isFunction(process, "process");
        TStreams.Diagnostics.Assert.hasNot(operators, name, TStreams.ErrorStrings.streamingOperatorWithSameNameAlreadyExists);
        var op = new TStreams.Internals.UserDefinedOperator(name, process);
        operators.add(op);
    }
    TStreams.createStreamingOperator = createStreamingOperator;
    function getStreamingOperatorNames() {
        var names = [];
        var ops = operators.getValues();
        var length = ops.length;
        for (var i = 0; i < length; i++) {
            if (ops[i] instanceof TStreams.Internals.UserDefinedOperator === true) {
                names.push(ops[i].name);
            }
        }
        return names;
    }
    TStreams.getStreamingOperatorNames = getStreamingOperatorNames;
    initialize();
    if (typeof exports !== "undefined" && typeof module !== "undefined" && typeof module.exports !== "undefined") {
        exports = module.exports = TStreams;
    }
})(TStreams || (TStreams = {}));
var TStreams;
(function (TStreams) {
    var Internals;
    (function (Internals) {
        var WindowExpression = (function () {
            function WindowExpression() {
            }
            WindowExpression.create = function (expression, windowOperators) {
                var windowExpression = new WindowExpression();
                windowExpression._expression = expression;
                windowExpression._windowOperators = windowOperators;
                return windowExpression;
            };
            WindowExpression.prototype.average = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("average"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.count = function () {
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("count"), null);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.sum = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("sum"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.min = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("min"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.max = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("max"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.topK = function (k, selector) {
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(k, "k");
                var parameters = new TStreams.Collections.Dictionary();
                parameters.set("k", k);
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var topKwithParameters = TStreams.Internals.Aggregate.create(this._windowOperators.get("topK"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(topKwithParameters);
                return this._expression;
            };
            WindowExpression.prototype._steamr_topK = function (comparer, k) {
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(k, "k");
                var parameters = new TStreams.Collections.Dictionary();
                parameters.set("k", k);
                TStreams.Diagnostics.Assert.isFunction(comparer, "comparer");
                parameters.set("comparer", comparer);
                var topKwithParameters = TStreams.Internals.Aggregate.create(this._windowOperators.get("_steamr_topK"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(topKwithParameters);
                return this._expression;
            };
            WindowExpression.prototype.bottomK = function (k, selector) {
                TStreams.Diagnostics.Assert.isFinitePositiveInteger(k, "k");
                var parameters = new TStreams.Collections.Dictionary();
                parameters.set("k", k);
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var bottomKwithParameters = TStreams.Internals.Aggregate.create(this._windowOperators.get("bottomK"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(bottomKwithParameters);
                return this._expression;
            };
            WindowExpression.prototype.stdev = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("stdev"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.stdevP = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("stdevp"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.variance = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("var"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.varianceP = function (selector) {
                var parameters = new TStreams.Collections.Dictionary();
                if (selector !== null && typeof selector !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(selector, "selector");
                    parameters.set("selector", selector);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("varp"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.toList = function (project) {
                var parameters = new TStreams.Collections.Dictionary();
                if (project !== null && typeof project !== "undefined") {
                    TStreams.Diagnostics.Assert.isFunction(project, "project");
                    parameters.set("project", project);
                }
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get("toList"), parameters);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.aggregate = function (name, params) {
                TStreams.Diagnostics.Assert.isString(name, "name");
                TStreams.Diagnostics.Assert.has(this._windowOperators, name, TStreams.ErrorStrings.customOperatorMustBeCreatedFirst);
                var aggregate = TStreams.Internals.Aggregate.create(this._windowOperators.get(name), params);
                this._expression._lastNode._windowContext.aggregates.push(aggregate);
                return this._expression;
            };
            WindowExpression.prototype.aggregates = function (aggregates, project) {
                TStreams.Diagnostics.Assert.isFunction(project, "project");
                this._expression._lastNode._windowContext.projectExpression = project;
                TStreams.Diagnostics.Assert.isArray(aggregates, "aggregates");
                var length = aggregates.length;
                if (length < 2) {
                    throw new RangeError(TStreams.ErrorStrings.atLeastTwoOperatorsInMultiAggregate);
                }
                for (var i = 0; i < length; i++) {
                    var aggregate = aggregates[i];
                    TStreams.Diagnostics.Assert.isString(aggregate.windowOperatorName, "windowOperatorName");
                    TStreams.Diagnostics.Assert.has(this._windowOperators, aggregate.windowOperatorName, TStreams.Utils.formatString(TStreams.ErrorStrings.cannotFindAggregateOperator, aggregate.windowOperatorName));
                    var instance = TStreams.Internals.Aggregate.create(this._windowOperators.get(aggregate.windowOperatorName), aggregate.parameters);
                    this._expression._lastNode._windowContext.aggregates.push(instance);
                }
                return this._expression;
            };
            return WindowExpression;
        })();
        Internals.WindowExpression = WindowExpression;
    })(Internals = TStreams.Internals || (TStreams.Internals = {}));
})(TStreams || (TStreams = {}));

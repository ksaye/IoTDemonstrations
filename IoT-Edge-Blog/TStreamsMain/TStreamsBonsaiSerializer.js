var TStreamsBonsaiSerializer;
(function (TStreamsBonsaiSerializer) {
    class TypeDescriptor {
    }
    TypeDescriptor.simple = "::";
    TypeDescriptor.array = "[]";
    TypeDescriptor.generic = "<>";
    TypeDescriptor.anonymousStructural = "{}";
    TypeDescriptor.recordStructual = "{,}";
    class MemberDescriptor {
    }
    MemberDescriptor.fieldInfo = "F";
    MemberDescriptor.propertyInfo = "P";
    MemberDescriptor.constructorInfo = "C";
    MemberDescriptor.simpleMethodInfo = "M";
    MemberDescriptor.genericMethodInfo = "M`";
    MemberDescriptor.closedGenericMethodInfo = "M<>";
    class ExpressionDescriptor {
    }
    ExpressionDescriptor.constant = ":";
    ExpressionDescriptor.onesComplement = "~";
    ExpressionDescriptor.not = "!";
    ExpressionDescriptor.arrayLength = "#";
    ExpressionDescriptor.quote = "`";
    ExpressionDescriptor.add = "+";
    ExpressionDescriptor.addChecked = "+$";
    ExpressionDescriptor.subtract = "-";
    ExpressionDescriptor.subtractChecked = "-$";
    ExpressionDescriptor.multiply = "*";
    ExpressionDescriptor.multiplyChecked = "*$";
    ExpressionDescriptor.divide = "/";
    ExpressionDescriptor.modulo = "%";
    ExpressionDescriptor.power = "^^";
    ExpressionDescriptor.leftShift = "<<";
    ExpressionDescriptor.rightShift = ">>";
    ExpressionDescriptor.coalesce = "??";
    ExpressionDescriptor.lessThan = "<";
    ExpressionDescriptor.lessThanOrEqual = "<=";
    ExpressionDescriptor.greaterThan = ">";
    ExpressionDescriptor.greaterThanOrEqual = ">=";
    ExpressionDescriptor.equal = "=";
    ExpressionDescriptor.equalCissle = "==";
    ExpressionDescriptor.notEqual = "!=";
    ExpressionDescriptor.and = "&";
    ExpressionDescriptor.andAlso = "&&";
    ExpressionDescriptor.or = "|";
    ExpressionDescriptor.orElse = "||";
    ExpressionDescriptor.exclusiveOr = "^";
    ExpressionDescriptor.conditional = "?:";
    ExpressionDescriptor.typeIs = "is";
    ExpressionDescriptor.typeAs = "as";
    ExpressionDescriptor.convert = ":>";
    ExpressionDescriptor.convertCissle = "<:";
    ExpressionDescriptor.convertChecked = ":>$";
    ExpressionDescriptor.lambdaExpression = "=>";
    ExpressionDescriptor.parameterExpression = "$";
    ExpressionDescriptor.invocationExpression = "()";
    ExpressionDescriptor.callExpression = ".()";
    ExpressionDescriptor.memberExpression = ".";
    ExpressionDescriptor.arrayIndexExpression = "[]";
    ExpressionDescriptor.newExpression = "new";
    ExpressionDescriptor.memberMemberBindingInitializationExpression = "{.}";
    ExpressionDescriptor.memberAssignmentBindingInitializationExpression = "{=}";
    ExpressionDescriptor.memberListBindingInitializationExpression = "{+}";
    ExpressionDescriptor.newVectorExpression = "new[]";
    ExpressionDescriptor.newVectorWithRankExpression = "new[*]";
    class SteamRAPIName {
    }
    SteamRAPIName.aggregate = "Aggregate";
    SteamRAPIName.aggregateN = "AggregateN";
    SteamRAPIName.average = "Average";
    SteamRAPIName.count = "Count";
    SteamRAPIName.from = "From";
    SteamRAPIName.fromInput = "FromInput";
    SteamRAPIName.getLocalSink = "GetLocalSink";
    SteamRAPIName.getLocalSource = "GetLocalSource";
    SteamRAPIName.max = "Max";
    SteamRAPIName.min = "Min";
    SteamRAPIName.select = "Select";
    SteamRAPIName.sum = "Sum";
    SteamRAPIName.to = "To";
    SteamRAPIName.toList = "ToList";
    SteamRAPIName.toOutput = "ToOutput";
    SteamRAPIName.union = "Union";
    SteamRAPIName.where = "Where";
    SteamRAPIName.temporalJoin = "TemporalJoin";
    SteamRAPIName.temporalLeftOuterJoin = "TemporalLeftOuterJoin";
    SteamRAPIName.stdev = "Stdev";
    SteamRAPIName.stdevp = "Stdevp";
    SteamRAPIName.variance = "Var";
    SteamRAPIName.variancep = "Varp";
    SteamRAPIName.toArray = "ToArray";
    SteamRAPIName.topK = "TopK";
    SteamRAPIName.selectMany = "SelectManyFromEnumerable";
    SteamRAPIName.statefulSelect = "StatefulSelect";
    class TSqlName {
    }
    TSqlName.dateTimeFromParts = "DateTimeFromParts";
    TSqlName.dateAdd = "DateAdd";
    TSqlName.dateDiff = "DateDiff";
    TSqlName.datePart = "DatePart";
    TSqlName.dateName = "DateName";
    TSqlName.substring = "Substring";
    TSqlName.concat = "Concat";
    TSqlName.len = "Len";
    TSqlName.charIndex = "CharIndex";
    TSqlName.like = "Like";
    TSqlName.patindex = "Patindex";
    TSqlName.indexOf = "IndexOf";
    TSqlName.castToBool = "CastToBool";
    class ErrorStrings {
    }
    ErrorStrings.bonsaiVersionNotSupported = "The version of bonsai isn't supported: {0}";
    ErrorStrings.nodeTypeNotSupported = "The node type isn't supported yet: {0}";
    ErrorStrings.multidimensionalArraysNotSupported = "Multidimensional arrays aren't supported. Use arrays of arrays instead.";
    ErrorStrings.unknownNodeFoundInExpression = "Unknown node found in expression.";
    ErrorStrings.unknownTypeDiscriminatorInExpression = "Unknown type discriminator found in expression.";
    ErrorStrings.selectWithWrongNumberOfParameters = "Currently only select operators with one and three parameters can be mapped.";
    ErrorStrings.aggregateMustHaveDownstreamOperator = "An aggregate needs a downstream operator or it can't be mapped.";
    ErrorStrings.windowTypeNotSupported = "The window definition type isn't supported yet.";
    ErrorStrings.aggregateMustBeClosedGenericMethod = "Expected the aggregate to be a closed generic method.";
    ErrorStrings.aggregateWithWrongNumberOfParameters = "The aggregate has too many parameters.";
    ErrorStrings.notSupportedAggregate = "The {0} aggregate isn't supported in TStreams.";
    ErrorStrings.unknownAggregate = "Unexpected aggregate: {0}";
    TStreamsBonsaiSerializer.ErrorStrings = ErrorStrings;
    class Utils {
        static formatString(text, ...params) {
            var result = text;
            for (var i = 0; i < params.length; i++) {
                result = result.replace("{" + i + "}", params[i]);
            }
            return result;
        }
    }
    TStreamsBonsaiSerializer.Utils = Utils;
    var _tstreams;
    var _microsoft;
    var _moment;
    var _nextParamterId = 0;
    function deserialize(bonsaiString) {
        var bonsaiObject = JSON.parse(bonsaiString);
        var versionParts = bonsaiObject.Context.Version.split(".");
        if (parseInt(versionParts[0], 10) !== 0 ||
            parseInt(versionParts[1], 10) !== 9) {
            throw new TypeError(Utils.formatString(ErrorStrings.bonsaiVersionNotSupported, bonsaiObject.Context.Version));
        }
        var resultExpression = deserializeExpression(bonsaiObject, bonsaiObject.Expression);
        return new Function(resultExpression);
    }
    TStreamsBonsaiSerializer.deserialize = deserialize;
    function deserializeSteamRToTStreams(bonsaiString) {
        var bonsaiObject = JSON.parse(bonsaiString);
        var versionParts = bonsaiObject.Context.Version.split(".");
        if (parseInt(versionParts[0], 10) !== 0 ||
            parseInt(versionParts[1], 10) !== 9) {
            throw new TypeError(Utils.formatString(ErrorStrings.bonsaiVersionNotSupported, bonsaiObject.Context.Version));
        }
        var length = bonsaiObject.Context.Types.length;
        for (var i = 0; i < length; i++) {
            var type = bonsaiObject.Context.Types[i];
            if (type[0] === TypeDescriptor.simple) {
                if (type[1].indexOf("SteamRLocalContext") > -1 ||
                    type[1].indexOf("EventStream") > -1) {
                    type[1] = "TStreams";
                }
                else if (type[1].indexOf("System.DateTime") > -1 &&
                    type[1].indexOf("System.DateTimeKind") === -1) {
                    type[1] = "Date";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.RecordN") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Sql.CollectionBasedRecord";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.Record") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Sql.Record";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.CollectionBasedRecord") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Sql.CollectionBasedRecord";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.IArray") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Dsl.IArray";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.IArraySchema") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Dsl.IArraySchema";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.ValueArray") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Sql.ValueArray";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.IRecord") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Dsl.IRecord";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.StrictRecordSchema") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Sql.StrictRecordSchema";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.LaxRecordSchema") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Sql.LaxRecordSchema";
                }
                else if (type[1].indexOf("Microsoft.EventProcessing.RuntimeTypes.IRecordSchema") > -1) {
                    type[1] = "Microsoft.EventProcessing.SteamR.Dsl.IRecordSchema";
                }
            }
        }
        expressionWalker(bonsaiObject.Expression, expressionNode => {
            if (expressionNode[0] === ExpressionDescriptor.newExpression &&
                bonsaiObject.Context.Types[bonsaiObject.Context.Members[expressionNode[1]][1]][1] === "Date") {
                var parameters = bonsaiObject.Context.Members[expressionNode[1]][2];
                if (bonsaiObject.Context.Types[parameters[parameters.length - 1]][1] === "System.DateTimeKind") {
                    parameters.pop();
                }
                expressionNode[2] = expressionNode[2].splice(0, parameters.length);
            }
        });
        remapSQLSteamRExpressionToTStreams(bonsaiObject, bonsaiObject.Expression, undefined, undefined);
        remapSQLSteamRMembersToTStreams(bonsaiObject);
        var resultExpression = deserializeExpression(bonsaiObject, bonsaiObject.Expression);
        return eval("(function(TStreams, Microsoft, moment) { var empty = ''; var _default = empty; return " + resultExpression + ";})(_tstreams, _microsoft, _moment);");
    }
    TStreamsBonsaiSerializer.deserializeSteamRToTStreams = deserializeSteamRToTStreams;
    function expressionWalker(node, callback) {
        var length;
        var i;
        callback(node);
        switch (node[0]) {
            case ExpressionDescriptor.convert:
            case ExpressionDescriptor.convertChecked:
            case ExpressionDescriptor.convertCissle:
            case ExpressionDescriptor.typeIs:
            case ExpressionDescriptor.typeAs:
                expressionWalker(node[2], callback);
                break;
            case ExpressionDescriptor.subtract:
            case ExpressionDescriptor.subtractChecked:
            case ExpressionDescriptor.add:
                expressionWalker(node[1], callback);
                if (node.length > 2 && typeof node[2] !== "number") {
                    expressionWalker(node[2], callback);
                }
                break;
            case ExpressionDescriptor.onesComplement:
            case ExpressionDescriptor.not:
            case ExpressionDescriptor.arrayLength:
            case ExpressionDescriptor.quote:
                expressionWalker(node[1], callback);
                break;
            case ExpressionDescriptor.addChecked:
            case ExpressionDescriptor.multiply:
            case ExpressionDescriptor.multiplyChecked:
            case ExpressionDescriptor.divide:
            case ExpressionDescriptor.modulo:
            case ExpressionDescriptor.power:
            case ExpressionDescriptor.leftShift:
            case ExpressionDescriptor.rightShift:
            case ExpressionDescriptor.coalesce:
            case ExpressionDescriptor.lessThan:
            case ExpressionDescriptor.lessThanOrEqual:
            case ExpressionDescriptor.greaterThan:
            case ExpressionDescriptor.greaterThanOrEqual:
            case ExpressionDescriptor.equal:
            case ExpressionDescriptor.equalCissle:
            case ExpressionDescriptor.notEqual:
            case ExpressionDescriptor.and:
            case ExpressionDescriptor.andAlso:
            case ExpressionDescriptor.or:
            case ExpressionDescriptor.orElse:
            case ExpressionDescriptor.exclusiveOr:
                expressionWalker(node[1], callback);
                expressionWalker(node[2], callback);
                break;
            case ExpressionDescriptor.conditional:
                expressionWalker(node[1], callback);
                expressionWalker(node[2], callback);
                if (node.length > 3 && typeof node[3] !== "number") {
                    expressionWalker(node[3], callback);
                }
                break;
            case ExpressionDescriptor.newVectorExpression:
                length = node.length;
                for (i = 2; i < length; i++) {
                    expressionWalker(node[i], callback);
                }
                break;
            default:
                if (Array.isArray(node[0])) {
                    length = node.length;
                    for (i = 0; i < length; i++) {
                        expressionWalker(node[i], callback);
                    }
                }
                else if (typeof (node[0]) === "number" ||
                    node[0] === ExpressionDescriptor.quote) {
                    length = node.length;
                    for (i = 1; i < length; i++) {
                        expressionWalker(node[i], callback);
                    }
                }
                else if (Array.isArray(node[2])) {
                    if (Array.isArray(node[2][0])) {
                        length = node[2].length;
                        for (i = 0; i < length; i++) {
                            expressionWalker(node[2][i], callback);
                        }
                    }
                    else {
                        expressionWalker(node[2], callback);
                        if (node[0] === ExpressionDescriptor.lambdaExpression) {
                            length = node[3].length;
                            for (i = 0; i < length; i++) {
                                expressionWalker(node[3][i], callback);
                            }
                        }
                    }
                }
                break;
        }
    }
    function deserializeUnaryExpression(expression, expressionNode, parameters) {
        var type = expressionNode[0];
        var op;
        switch (type) {
            case ExpressionDescriptor.onesComplement:
                op = "bitwiseNot";
                break;
            case ExpressionDescriptor.not:
                op = "not";
                break;
            case ExpressionDescriptor.add:
                op = "plus";
                break;
            case ExpressionDescriptor.subtract:
                op = "minus";
                break;
            default:
                throw new SyntaxError(ErrorStrings.unknownNodeFoundInExpression);
        }
        var x = deserializeExpression(expression, expressionNode[1], parameters);
        return "Microsoft.EventProcessing.SteamR.Sql." + op + "(" + x + ")";
    }
    function deserializeBinaryExpression(expression, expressionNode, parameters) {
        var type = expressionNode[0];
        var op;
        switch (type) {
            case ExpressionDescriptor.add:
                op = "add";
                break;
            case ExpressionDescriptor.subtract:
                op = "subtract";
                break;
            case ExpressionDescriptor.multiply:
                op = "multiply";
                break;
            case ExpressionDescriptor.modulo:
                op = "modulo";
                break;
            case ExpressionDescriptor.divide:
                op = "divide";
                break;
            case ExpressionDescriptor.leftShift:
                op = "left";
                break;
            case ExpressionDescriptor.rightShift:
                op = "right";
                break;
            case ExpressionDescriptor.lessThan:
                op = "lt";
                break;
            case ExpressionDescriptor.lessThanOrEqual:
                op = "leq";
                break;
            case ExpressionDescriptor.greaterThan:
                op = "gt";
                break;
            case ExpressionDescriptor.greaterThanOrEqual:
                op = "geq";
                break;
            case ExpressionDescriptor.and:
                op = "and";
                break;
            case ExpressionDescriptor.or:
                op = "or";
                break;
            case ExpressionDescriptor.exclusiveOr:
                op = "xor";
                break;
            default:
                throw new SyntaxError(ErrorStrings.unknownNodeFoundInExpression);
        }
        var x = deserializeExpression(expression, expressionNode[1], parameters);
        var y = deserializeExpression(expression, expressionNode[2], parameters);
        return "Microsoft.EventProcessing.SteamR.Sql." + op + "(" + x + ", " + y + ")";
    }
    function deserializeExpression(expression, expressionNode, parameters) {
        if (!Array.isArray(parameters)) {
            parameters = [];
        }
        var deserialized = "";
        var length;
        var i;
        var namespace = "Microsoft.EventProcessing.SteamR.Sql.";
        switch (expressionNode[0]) {
            case ExpressionDescriptor.constant:
                if (expressionNode.length > 2) {
                    var typeIndex = expressionNode[2];
                    deserialized = deserializeConstant(expressionNode[1], expression.Context, expression.Context.Types[typeIndex]);
                }
                else {
                    deserialized = deserializeConstant(expressionNode[1]);
                }
                break;
            case ExpressionDescriptor.onesComplement:
            case ExpressionDescriptor.not:
                return deserializeUnaryExpression(expression, expressionNode, parameters);
            case ExpressionDescriptor.arrayLength:
                deserialized = deserialized.concat(deserializeExpression(expression, expressionNode[1], parameters), ".length");
                break;
            case ExpressionDescriptor.quote:
                deserialized = deserializeExpression(expression, expressionNode[1], parameters);
                break;
            case ExpressionDescriptor.add:
            case ExpressionDescriptor.subtract:
                if (expressionNode.length === 2) {
                    return deserializeUnaryExpression(expression, expressionNode, parameters);
                }
            case ExpressionDescriptor.multiply:
            case ExpressionDescriptor.divide:
            case ExpressionDescriptor.modulo:
            case ExpressionDescriptor.leftShift:
            case ExpressionDescriptor.rightShift:
            case ExpressionDescriptor.lessThan:
            case ExpressionDescriptor.lessThanOrEqual:
            case ExpressionDescriptor.greaterThan:
            case ExpressionDescriptor.greaterThanOrEqual:
            case ExpressionDescriptor.and:
            case ExpressionDescriptor.or:
            case ExpressionDescriptor.exclusiveOr:
                return deserializeBinaryExpression(expression, expressionNode, parameters);
            case ExpressionDescriptor.addChecked:
            case ExpressionDescriptor.subtractChecked:
            case ExpressionDescriptor.multiplyChecked:
            case ExpressionDescriptor.power:
                throw new SyntaxError(Utils.formatString(ErrorStrings.nodeTypeNotSupported, expressionNode[0]));
            case ExpressionDescriptor.coalesce:
                deserialized = deserialized.concat(deserializeExpression(expression, expressionNode[1], parameters), " === null || typeof(", deserializeExpression(expression, expressionNode[1], parameters), ") === \"undefined\" ? ", deserializeExpression(expression, expressionNode[2], parameters), " : ", deserializeExpression(expression, expressionNode[1], parameters));
                break;
            case ExpressionDescriptor.equal:
            case ExpressionDescriptor.equalCissle:
                var rightOperand = deserializeExpression(expression, expressionNode[2], parameters);
                if (rightOperand === "null") {
                    deserialized = "typeof (".concat(deserializeExpression(expression, expressionNode[1], parameters), ") === \"undefined\" || ", deserializeExpression(expression, expressionNode[1], parameters), " === null");
                }
                else {
                    deserialized = deserializeExpression(expression, expressionNode[1], parameters).concat(" === ", rightOperand);
                }
                break;
            case ExpressionDescriptor.notEqual:
                var rightOperand = deserializeExpression(expression, expressionNode[2], parameters);
                if (rightOperand === "null") {
                    deserialized = "typeof (".concat(deserializeExpression(expression, expressionNode[1], parameters), ") !== \"undefined\" && ", deserializeExpression(expression, expressionNode[1], parameters), " !== null");
                }
                else {
                    deserialized = deserializeExpression(expression, expressionNode[1], parameters).concat(" !== ", rightOperand);
                }
                break;
            case ExpressionDescriptor.andAlso:
                deserialized = deserialized.concat("(", deserializeExpression(expression, expressionNode[1], parameters), " && ", deserializeExpression(expression, expressionNode[2], parameters), ")");
                break;
            case ExpressionDescriptor.orElse:
                deserialized = deserialized.concat("(", deserializeExpression(expression, expressionNode[1], parameters), " || ", deserializeExpression(expression, expressionNode[2], parameters), ")");
                break;
            case ExpressionDescriptor.conditional:
                deserialized = deserialized.concat("(", deserializeExpression(expression, expressionNode[1], parameters), " ? ", deserializeExpression(expression, expressionNode[2], parameters), " : ", deserializeExpression(expression, expressionNode[3], parameters), ")");
                break;
            case ExpressionDescriptor.typeIs:
                throw new SyntaxError(Utils.formatString(ErrorStrings.nodeTypeNotSupported, expressionNode[0]));
            case ExpressionDescriptor.typeAs:
            case ExpressionDescriptor.convert:
            case ExpressionDescriptor.convertCissle:
                deserialized = deserializeExpression(expression, expressionNode[2], parameters);
                var type = expression.Context.Types[expressionNode[1]];
                var typeName = type[1];
                if (typeName === "Microsoft.EventProcessing.SteamR.Dsl.IRecord") {
                    deserialized = "Microsoft.EventProcessing.SteamR.Sql.Cast.toRecordInternal(" + deserialized + ")";
                }
                if (typeName === "Microsoft.EventProcessing.SteamR.Dsl.IArray") {
                    deserialized = "Microsoft.EventProcessing.SteamR.Sql.Cast.toArrayInternal(" + deserialized + ")";
                }
                break;
            case ExpressionDescriptor.convertChecked:
                throw new SyntaxError(Utils.formatString(ErrorStrings.nodeTypeNotSupported, expressionNode[0]));
            case ExpressionDescriptor.lambdaExpression:
                deserialized = "function(";
                var parameterDeclarations = expressionNode[3];
                length = parameterDeclarations.length;
                for (i = 0; i < length; i++) {
                    var parameterDeclaration = parameterDeclarations[i];
                    var name = parameterDeclaration[1];
                    if (!!name) {
                        name = escapeIdentifiers(name);
                        parameterDeclaration[1] = name;
                    }
                    else {
                        name = "$parameter_" + _nextParamterId++;
                        parameterDeclaration.push(name);
                    }
                    deserialized += name;
                    if (i < length - 1) {
                        deserialized += ", ";
                    }
                }
                deserialized += ") { return ";
                parameters.unshift(parameterDeclarations);
                deserialized += deserializeExpression(expression, expressionNode[2], parameters);
                parameters.shift();
                deserialized += "; }";
                break;
            case ExpressionDescriptor.parameterExpression:
                deserialized = parameters[expressionNode[1]][expressionNode[2]][1];
                break;
            case ExpressionDescriptor.invocationExpression:
                deserialized = deserializeExpression(expression, expressionNode[1], parameters);
                length = expressionNode[2].length;
                if (length === 0) {
                    deserialized += "()";
                }
                else {
                    deserialized += "(";
                    for (i = 0; i < length - 1; i++) {
                        deserialized = deserialized.concat(deserializeExpression(expression, expressionNode[2][i], parameters), ", ");
                    }
                    deserialized += deserializeExpression(expression, expressionNode[2][length - 1], parameters) + ")";
                }
                break;
            case ExpressionDescriptor.callExpression:
                if (expressionNode.length === 4) {
                    deserialized = deserializeExpression(expression, expressionNode[2], parameters) + ".";
                    deserialized += deserializeMember(expression, expressionNode[1], false);
                    length = expressionNode[3].length;
                    if (length === 0) {
                        deserialized += "()";
                    }
                    else {
                        deserialized += "(";
                        for (i = 0; i < length - 1; i++) {
                            deserialized = deserialized.concat(deserializeExpression(expression, expressionNode[3][i], parameters), ", ");
                        }
                        deserialized += deserializeExpression(expression, expressionNode[3][length - 1], parameters) + ")";
                    }
                }
                else {
                    var member = expression.Context.Members[expressionNode[1]];
                    if (member[0] === MemberDescriptor.closedGenericMethodInfo) {
                        member = expression.Context.Members[member[1]];
                    }
                    var declaringType = expression.Context.Types[member[1]];
                    if (declaringType[1].indexOf("TStreams") > -1 && member[2].indexOf("From") < 0) {
                        deserialized = deserializeExpression(expression, expressionNode[2][0], parameters) + ".";
                        deserialized += deserializeMember(expression, expressionNode[1], false);
                        var index = 0;
                        while (index < expressionNode[2].length) {
                            if (typeof (expressionNode[2][index]) === "undefined" ||
                                expressionNode[2][index] === null) {
                                expressionNode[2].splice(index, 1);
                            }
                            else {
                                index++;
                            }
                        }
                        length = expressionNode[2].length;
                        if (length === 1) {
                            deserialized += "()";
                        }
                        else {
                            deserialized += "(";
                            for (i = 1; i < length - 1; i++) {
                                deserialized = deserialized.concat(deserializeExpression(expression, expressionNode[2][i], parameters), ", ");
                            }
                            deserialized += deserializeExpression(expression, expressionNode[2][length - 1], parameters) + ")";
                        }
                    }
                    else {
                        deserialized = deserializeMember(expression, expressionNode[1], true);
                        length = expressionNode[2].length;
                        deserialized += "(";
                        for (i = 0; i < length - 1; i++) {
                            deserialized += deserializeExpression(expression, expressionNode[2][i], parameters) + ", ";
                        }
                        deserialized += deserializeExpression(expression, expressionNode[2][length - 1], parameters) + ")";
                    }
                }
                break;
            case ExpressionDescriptor.memberExpression:
                if (expressionNode.length > 2) {
                    deserialized = deserializeExpression(expression, expressionNode[2], parameters);
                }
                if (deserialized.length > 0) {
                    deserialized += ".";
                }
                deserialized += deserializeMember(expression, expressionNode[1], false);
                break;
            case ExpressionDescriptor.arrayIndexExpression:
                deserialized = deserializeExpression(expression, expressionNode[1], parameters).concat("[", deserializeExpression(expression, expressionNode[2], parameters), "]");
                break;
            case ExpressionDescriptor.newExpression:
                if (Array.isArray(expressionNode[1])) {
                    deserialized = "{ ";
                    length = expressionNode[1].length;
                    for (i = 0; i < length - 1; i++) {
                        deserialized += expressionNode[1][i][0] + ": ";
                        deserialized += deserializeExpression(expression, expressionNode[1][i][1], parameters) + ", ";
                    }
                    deserialized += expressionNode[1][length - 1][0] + ": ";
                    deserialized += deserializeExpression(expression, expressionNode[1][length - 1][1], parameters) + " }";
                }
                else {
                    deserialized = deserialized.concat("new ", deserializeMember(expression, expressionNode[1], false));
                    length = expressionNode[2].length;
                    if (length === 0) {
                        deserialized += "()";
                    }
                    else {
                        deserialized += "(";
                        for (i = 0; i < length - 1; i++) {
                            deserialized += deserializeExpression(expression, expressionNode[2][i], parameters) + ", ";
                        }
                        deserialized += deserializeExpression(expression, expressionNode[2][length - 1], parameters) + ")";
                    }
                }
                break;
            case ExpressionDescriptor.memberMemberBindingInitializationExpression:
                throw new SyntaxError(Utils.formatString(ErrorStrings.nodeTypeNotSupported, expressionNode[0]));
            case ExpressionDescriptor.memberAssignmentBindingInitializationExpression:
                throw new SyntaxError(Utils.formatString(ErrorStrings.nodeTypeNotSupported, expressionNode[0]));
            case ExpressionDescriptor.memberListBindingInitializationExpression:
                deserialized = deserializeExpression(expression, expressionNode[1], parameters);
                length = expressionNode[2].length;
                for (i = 0; i < length; i++) {
                    deserialized += "." + deserializeMember(expression, expressionNode[2][i][0], false);
                    var parameterLength = expressionNode[2][i].length;
                    if (parameterLength === 1) {
                        deserialized += "()";
                    }
                    else {
                        deserialized += "(";
                        for (var j = 1; j < parameterLength - 1; j++) {
                            deserialized += deserializeExpression(expression, expressionNode[2][i][j], parameters) + ", ";
                        }
                        deserialized += deserializeExpression(expression, expressionNode[2][i][parameterLength - 1], parameters) + ")";
                    }
                }
                break;
            case ExpressionDescriptor.newVectorExpression:
                length = expressionNode.length;
                if (length === 2) {
                    deserialized = " []";
                }
                else {
                    deserialized = " [";
                    for (i = 2; i < length - 1; i++) {
                        deserialized += deserializeExpression(expression, expressionNode[i], parameters) + ", ";
                    }
                    deserialized += deserializeExpression(expression, expressionNode[length - 1], parameters) + "]";
                }
                break;
            case ExpressionDescriptor.newVectorWithRankExpression:
                if (expressionNode.length > 3) {
                    throw new TypeError(ErrorStrings.multidimensionalArraysNotSupported);
                }
                deserialized = "new Array(".concat(deserializeExpression(expression, expressionNode[2], parameters), ")");
                break;
            default:
                throw new SyntaxError(ErrorStrings.unknownNodeFoundInExpression);
        }
        return deserialized;
    }
    function deserializeConstant(value, context, type) {
        if (value === null || typeof value === "undefined") {
            return "undefined";
        }
        if (!type) {
            return JSON.stringify(value);
        }
        var typeName;
        if (type[0] === TypeDescriptor.generic) {
            var genericType = context.Types[type[1]];
            var genericTypeName = genericType[1];
            if (genericTypeName.indexOf("Nullable") > -1) {
                typeName = context.Types[type[2]][1];
            }
            else if (genericTypeName.indexOf("System.Tuple") > -1) {
                var deserialized = "{";
                var size = value["System.ITuple.Size"];
                for (var i = 0; i < size; i++) {
                    var elementTypeIndex = type[2][i];
                    var elementType = context.Types[elementTypeIndex];
                    var id = "Item" + (i + 1);
                    deserialized += id + ":" + deserializeConstant(value[id], context, elementType);
                    if (i < size - 1) {
                        deserialized += ",";
                    }
                }
                deserialized += "}";
                return deserialized;
            }
            else if (genericTypeName.indexOf("System.Collections.Generic.List") > -1) {
                var elementTypeIndex = type[2][0];
                var elementType = context.Types[elementTypeIndex];
                var deserialized = "[";
                var array = value;
                for (var i = 0; i < array.length; i++) {
                    deserialized += deserializeConstant(array[i], context, elementType);
                    if (i < array.length - 1) {
                        deserialized += ",";
                    }
                }
                deserialized += "]";
                return deserialized;
            }
        }
        if (type[0] === TypeDescriptor.array) {
            if (type.length > 2) {
                throw new TypeError(ErrorStrings.multidimensionalArraysNotSupported);
            }
            var elementTypeIndex = type[1];
            var elementType = context.Types[elementTypeIndex];
            var deserialized = "[";
            var array = value;
            for (var i = 0; i < array.length; i++) {
                deserialized += deserializeConstant(array[i], context, elementType);
                if (i < array.length - 1) {
                    deserialized += ",";
                }
            }
            deserialized += "]";
            return deserialized;
        }
        else {
            typeName = type[1];
        }
        switch (typeName) {
            case "Microsoft.EventProcessing.SteamR.Sql.StrictRecordSchema":
                var schemaInitializer = { index: undefined, strict: undefined, timestamp: undefined, properties: {}, nested: {} };
                var length = value.properties.length;
                for (var propertyIndex = 0; propertyIndex < length; propertyIndex++) {
                    var propertyName = value.properties[propertyIndex].name;
                    schemaInitializer.properties[propertyName] = propertyIndex;
                }
                return JSON.stringify(schemaInitializer);
            case "System.TimeSpan":
                if (typeof (value) === "string") {
                    return convertTimeSpanToMilliseconds(value).toString();
                }
                break;
            case "Microsoft.EventProcessing.SteamR.Dsl.CompilerPosition":
                var values = value;
                var cmplPosition = new _microsoft.EventProcessing.SteamR.Sql.CompilerPosition(values.StartLine, values.StartColumn, values.StartOffset, values.EndLine, values.EndColumn, values.EndOffset, values.Expression);
                return JSON.stringify(cmplPosition);
            default:
                return JSON.stringify(value);
        }
    }
    function toCamelCase(name) {
        return name.charAt(0).toLowerCase() + name.substring(1);
    }
    function deserializeMember(expression, memberIndex, isStatic) {
        var member = expression.Context.Members[memberIndex];
        var result;
        switch (member[0]) {
            case MemberDescriptor.constructorInfo:
                var parts = getTypeName(expression, member[1]).split("+");
                length = parts.length;
                result = parts[length - 1];
                break;
            case MemberDescriptor.closedGenericMethodInfo:
                result = deserializeMember(expression, member[1], isStatic);
                break;
            default:
                var name = toCamelCase(member[2]);
                if (isStatic) {
                    var parts = getTypeName(expression, member[1]).split("+");
                    length = parts.length;
                    result = parts[length - 1] + "." + name;
                }
                else {
                    result = name;
                }
        }
        return result;
    }
    function getTypeName(expression, typeIndex) {
        var type = expression.Context.Types[typeIndex];
        var result;
        switch (type[0]) {
            case TypeDescriptor.simple:
                result = type[1];
                break;
            case TypeDescriptor.array:
            case TypeDescriptor.generic:
                result = getTypeName(expression, type[1]);
                break;
            default:
                throw new TypeError(ErrorStrings.unknownTypeDiscriminatorInExpression);
        }
        var result = result.replace(/`\d+$/, '');
        return result;
    }
    function remapParameters(expression, parameterList, parameters) {
        var length = parameterList.length;
        for (var i = 0; i < length; i++) {
            remapSQLSteamRExpressionToTStreams(expression, parameterList[i], undefined, parameters);
        }
    }
    function remapSQLSteamRMembersToTStreams(expression) {
        var members = expression.Context.Members;
        var length = members.length;
        for (var i = 0; i < length; i++) {
            var memberNode = members[i];
            switch (memberNode[0]) {
                case MemberDescriptor.fieldInfo:
                    var typeName = getTypeName(expression, memberNode[3]);
                    if (typeName === "TStreams") {
                        memberNode[2] = "TStreams";
                    }
                    break;
                case MemberDescriptor.propertyInfo:
                    if (memberNode[2] === "Ticks") {
                        memberNode[2] = "getTime";
                        memberNode[0] = "M";
                    }
                    if (memberNode[2] === "Default") {
                        memberNode[2] = "_default";
                    }
                    break;
                case MemberDescriptor.simpleMethodInfo:
                case MemberDescriptor.genericMethodInfo:
                    switch (memberNode[2]) {
                        case SteamRAPIName.getLocalSource:
                            memberNode[2] = "createInput";
                            break;
                        case SteamRAPIName.getLocalSink:
                            memberNode[2] = "createOutput";
                            break;
                        case SteamRAPIName.selectMany:
                            memberNode[2] = "selectMany";
                            break;
                        case SteamRAPIName.statefulSelect:
                            memberNode[2] = "_steamr_stateful_select";
                            break;
                        case TSqlName.indexOf:
                            memberNode[2] = "indexOf";
                            memberNode[3].pop();
                            break;
                        case SteamRAPIName.temporalJoin:
                            if (memberNode[4].length == 6) {
                                memberNode[2] = "_steamr_join";
                            }
                            else if (memberNode[4].length == 8) {
                                memberNode[2] = "_steamr_join_with_key_selectors";
                            }
                            else if (memberNode[4].length == 5) {
                                memberNode[2] = "_steamr_join_ref_data";
                            }
                            break;
                        case SteamRAPIName.temporalLeftOuterJoin:
                            if (memberNode[4].length == 7) {
                                memberNode[2] = "_steamr_left_join";
                            }
                            else if (memberNode[4].length == 9) {
                                memberNode[2] = "_steamr_left_join_with_key_selectors";
                            }
                            else if (memberNode[4].length == 6) {
                                memberNode[2] = "_steamr_left_join_ref_data";
                            }
                            break;
                        default:
                            break;
                    }
                    break;
            }
        }
    }
    function remapSQLSteamRExpressionToTStreams(expression, expressionNode, tailingNode, parameters) {
        if (!Array.isArray(parameters)) {
            parameters = [];
        }
        var length, i;
        switch (expressionNode[0]) {
            case ExpressionDescriptor.constant:
                break;
            case ExpressionDescriptor.onesComplement:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                break;
            case ExpressionDescriptor.not:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                break;
            case ExpressionDescriptor.arrayLength:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.quote:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                break;
            case ExpressionDescriptor.add:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                if (expressionNode.length === 3) {
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                }
                break;
            case ExpressionDescriptor.addChecked:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.subtract:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                if (expressionNode.length === 3) {
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                }
                break;
            case ExpressionDescriptor.subtractChecked:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                if (expressionNode.length === 3) {
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                }
                break;
            case ExpressionDescriptor.multiply:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.multiplyChecked:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.divide:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.modulo:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.power:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.leftShift:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.rightShift:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.coalesce:
                break;
            case ExpressionDescriptor.lessThan:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.lessThanOrEqual:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.greaterThan:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.greaterThanOrEqual:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.equal:
            case ExpressionDescriptor.equalCissle:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.notEqual:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.and:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.andAlso:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.or:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.orElse:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.exclusiveOr:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.conditional:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[3], undefined, parameters);
                break;
            case ExpressionDescriptor.typeIs:
                break;
            case ExpressionDescriptor.typeAs:
            case ExpressionDescriptor.convert:
            case ExpressionDescriptor.convertCissle:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], undefined, parameters);
                break;
            case ExpressionDescriptor.convertChecked:
                break;
            case ExpressionDescriptor.lambdaExpression:
                var parameterDeclarations = expressionNode[3];
                parameters.unshift(parameterDeclarations);
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], expressionNode, parameters);
                parameters.shift();
                break;
            case ExpressionDescriptor.parameterExpression:
                break;
            case ExpressionDescriptor.invocationExpression:
                remapSQLSteamRExpressionToTStreams(expression, expressionNode[1], undefined, parameters);
                if (expressionNode[1].length > 2) {
                    var length = expressionNode[2].length;
                    for (var i = 0; i < length; i++) {
                        remapSQLSteamRExpressionToTStreams(expression, expressionNode[2][i], undefined, parameters);
                    }
                }
                break;
            case ExpressionDescriptor.callExpression:
                if (expression.Context.Types[expression.Context.Members[expressionNode[1]][1]][0] === TypeDescriptor.simple &&
                    expression.Context.Types[expression.Context.Members[expressionNode[1]][1]][1].indexOf("System.String") > -1 &&
                    expression.Context.Members[expressionNode[1]][2] === "IndexOf") {
                    expressionNode[3].pop();
                }
                else if (expression.Context.Types[expression.Context.Members[expressionNode[1]][1]][0] === TypeDescriptor.simple &&
                    expression.Context.Types[expression.Context.Members[expressionNode[1]][1]][1].indexOf("System.Convert") > -1) {
                    tailingNode = expressionNode[2][0];
                    expressionNode.length = 0;
                    length = tailingNode.length;
                    for (i = 0; i < length; i++) {
                        expressionNode.push(tailingNode[i]);
                    }
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode, undefined, parameters);
                    break;
                }
                else if (expression.Context.Members[expressionNode[1]][0] === MemberDescriptor.closedGenericMethodInfo) {
                    var genericMethod = expression.Context.Members[expression.Context.Members[expressionNode[1]][1]];
                    if (genericMethod[2] === SteamRAPIName.select &&
                        expressionNode[2][1][1][3].length > 1) {
                        if (expressionNode[2][1][1][3].length !== 3) {
                            throw new TypeError(ErrorStrings.selectWithWrongNumberOfParameters);
                        }
                        var projectExpression = expressionNode[2][1][1];
                        projectExpression[3][3] = projectExpression[3][0];
                        projectExpression[3][0] = projectExpression[3][2];
                        projectExpression[3][2] = [projectExpression[3][1][0], "endTime"];
                        var scopeIndex = parameters.length - 1;
                        expressionWalker(projectExpression[2], n => {
                            if (n[0] === ExpressionDescriptor.parameterExpression &&
                                n[1] === scopeIndex) {
                                if (n[2] === 0) {
                                    n[2] = 3;
                                }
                                else if (n[2] === 2) {
                                    n[2] = 0;
                                }
                            }
                        });
                    }
                    else if (genericMethod[2] === SteamRAPIName.aggregate || genericMethod[2] === SteamRAPIName.aggregateN) {
                        if (typeof (tailingNode) === "undefined") {
                            throw new TypeError(ErrorStrings.aggregateMustHaveDownstreamOperator);
                        }
                        if (genericMethod[2] === SteamRAPIName.aggregateN) {
                            var aggregatesIndex = 3;
                            var outputSelectorIndex = 4;
                            var aggs = expressionNode[2][aggregatesIndex].splice(2);
                            var selector = expressionNode[2][outputSelectorIndex];
                            for (i = 0; i < aggs.length; i++) {
                                expressionNode[2][3 + i] = aggs[i];
                            }
                            expressionNode[2][3 + i] = selector;
                        }
                        var windowExpression = expressionNode[2].splice(1, 1)[0];
                        var groupExpression = undefined;
                        if (!(expression.Context.Types[expressionNode[2][1][1][3][0][0]][0] === TypeDescriptor.generic &&
                            expression.Context.Types[expression.Context.Types[expressionNode[2][1][1][3][0][0]][1]][1].indexOf("IGroupedWindow") > -1)) {
                            groupExpression = expressionNode[2].splice(1, 1)[0];
                        }
                        var projectExpression = expressionNode[2].splice(expressionNode[2].length - 1)[0];
                        remapSQLSteamRExpressionToTStreams(expression, projectExpression, undefined, parameters);
                        var aggregateExpressions = expressionNode[2].splice(1);
                        var numberOfAggregates = aggregateExpressions.length;
                        for (i = 0; i < numberOfAggregates; i++) {
                            remapSQLSteamRExpressionToTStreams(expression, aggregateExpressions[i], undefined, parameters);
                        }
                        projectExpression[1][3][3] = projectExpression[1][3][0];
                        projectExpression[1][3][0] = projectExpression[1][3][2];
                        projectExpression[1][3][2] = [projectExpression[1][3][1][0], "endTime"];
                        var node = projectExpression[1][2];
                        var scopeIndex = parameters.length - 1;
                        if (numberOfAggregates === 1) {
                            expressionWalker(node, n => {
                                if (n[0] === ExpressionDescriptor.parameterExpression) {
                                    if (n[1] === scopeIndex) {
                                        if (n[2] === 0) {
                                            n[2] = 3;
                                        }
                                        else if (n[2] === 2) {
                                            n[2] = 0;
                                        }
                                    }
                                }
                            });
                        }
                        else {
                            expressionWalker(node, n => {
                                if (n[0] === ExpressionDescriptor.parameterExpression &&
                                    n[1] === scopeIndex) {
                                    if (n[2] === 0) {
                                        n[2] = 3;
                                    }
                                    else if (n[2] > 1) {
                                        n[0] = ExpressionDescriptor.arrayIndexExpression;
                                        n[1] = [ExpressionDescriptor.parameterExpression, scopeIndex, 0];
                                        var numberTypeIndex = expression.Context.Types.length - 1;
                                        if (expression.Context.Types[numberTypeIndex][1] !== "number") {
                                            numberTypeIndex = expression.Context.Types.length;
                                            expression.Context.Types.push([TypeDescriptor.simple, "number"]);
                                        }
                                        n[2] = [ExpressionDescriptor.constant, n[2] - 2, numberTypeIndex];
                                    }
                                }
                            });
                            projectExpression[1][3].splice(4);
                        }
                        var expressionTypeIndex = expression.Context.Types.length;
                        var newType = [TypeDescriptor.simple, "TStreams.IExpression"];
                        expression.Context.Types.push(newType);
                        var windowExpressionTypeIndex = expression.Context.Types.length;
                        newType = [TypeDescriptor.simple, "TStreams.IWindowExpression"];
                        expression.Context.Types.push(newType);
                        var numberTypeIndex = expression.Context.Types.length;
                        newType = [TypeDescriptor.simple, "number"];
                        expression.Context.Types.push(newType);
                        var booleanTypeIndex = expression.Context.Types.length;
                        newType = [TypeDescriptor.simple, "boolean"];
                        expression.Context.Types.push(newType);
                        expressionNode[1] = expression.Context.Members.length;
                        var newMember = [MemberDescriptor.simpleMethodInfo, expressionTypeIndex];
                        var windowDefinitionType = expression.Context.Types[windowExpression[2]];
                        if (windowDefinitionType[1].indexOf("TumblingWindowDefinition") > -1) {
                            newMember.push("_steamr_hopping_window");
                            newMember.push([numberTypeIndex, numberTypeIndex, numberTypeIndex]);
                            newMember.push(windowExpressionTypeIndex);
                            var windowSize = convertTimeSpanToMilliseconds(windowExpression[1].duration);
                            var offset = convertWindowOffsetToMilliseconds(windowExpression[1].offset);
                            expressionNode[2].splice(1);
                            expressionNode[2].push([ExpressionDescriptor.constant, windowSize, numberTypeIndex]);
                            expressionNode[2].push([ExpressionDescriptor.constant, windowSize, numberTypeIndex]);
                            expressionNode[2].push([ExpressionDescriptor.constant, offset, numberTypeIndex]);
                        }
                        else if (windowDefinitionType[1].indexOf("HoppingWindowDefinition") > -1) {
                            newMember.push("_steamr_hopping_window");
                            newMember.push([numberTypeIndex, numberTypeIndex, numberTypeIndex]);
                            newMember.push(windowExpressionTypeIndex);
                            var windowSize = convertTimeSpanToMilliseconds(windowExpression[1].duration);
                            var hopSize = convertTimeSpanToMilliseconds(windowExpression[1].hopSize);
                            var offset = convertWindowOffsetToMilliseconds(windowExpression[1].offset);
                            expressionNode[2].splice(1);
                            expressionNode[2].push([ExpressionDescriptor.constant, windowSize, numberTypeIndex]);
                            expressionNode[2].push([ExpressionDescriptor.constant, hopSize, numberTypeIndex]);
                            expressionNode[2].push([ExpressionDescriptor.constant, offset, numberTypeIndex]);
                        }
                        else if (windowDefinitionType[1].indexOf("SlidingWindowDefinition") > -1) {
                            newMember.push("_steamr_sliding_window");
                            newMember.push([numberTypeIndex, numberTypeIndex, numberTypeIndex, booleanTypeIndex]);
                            newMember.push(windowExpressionTypeIndex);
                            var windowSize = convertTimeSpanToMilliseconds(windowExpression[1].duration);
                            var hopSize = convertTimeSpanToMilliseconds(windowExpression[1].hopSize);
                            var offset = convertWindowOffsetToMilliseconds(windowExpression[1].offset);
                            var hopping = windowExpression[1].hopping;
                            expressionNode[2].splice(1);
                            expressionNode[2].push([ExpressionDescriptor.constant, windowSize, numberTypeIndex]);
                            expressionNode[2].push([ExpressionDescriptor.constant, hopSize, numberTypeIndex]);
                            expressionNode[2].push([ExpressionDescriptor.constant, offset, numberTypeIndex]);
                            expressionNode[2].push([ExpressionDescriptor.constant, hopping, booleanTypeIndex]);
                        }
                        else {
                            throw new TypeError(ErrorStrings.windowTypeNotSupported);
                        }
                        expression.Context.Members.push(newMember);
                        if (typeof groupExpression !== "undefined") {
                            var newExpression = [ExpressionDescriptor.callExpression, expression.Context.Members.length, [expressionNode[2][0], groupExpression]];
                            newMember = [MemberDescriptor.simpleMethodInfo,
                                expressionTypeIndex,
                                "groupBy",
                                [groupExpression[1][1]],
                                expressionTypeIndex];
                            expression.Context.Members.push(newMember);
                            expressionNode[2][0] = newExpression;
                            if (numberOfAggregates === 1) {
                                newExpression = [ExpressionDescriptor.callExpression, expression.Context.Members.length, [tailingNode[2][0], projectExpression]];
                            }
                            else {
                                newExpression = [ExpressionDescriptor.callExpression, expression.Context.Members.length, [tailingNode[2][0]]];
                            }
                            newMember = [
                                MemberDescriptor.simpleMethodInfo,
                                expressionTypeIndex,
                                "groupUnion",
                                [projectExpression[1][1]],
                                expressionTypeIndex
                            ];
                            expression.Context.Members.push(newMember);
                            tailingNode[2][0] = newExpression;
                        }
                        else if (numberOfAggregates === 1) {
                            newExpression = [ExpressionDescriptor.callExpression, expression.Context.Members.length, [tailingNode[2][0], projectExpression]];
                            newMember = [
                                MemberDescriptor.simpleMethodInfo,
                                expressionTypeIndex,
                                "select",
                                [projectExpression[1][1]],
                                expressionTypeIndex
                            ];
                            expression.Context.Members.push(newMember);
                            tailingNode[2][0] = newExpression;
                        }
                        tailingNode = newExpression;
                        if (numberOfAggregates === 1) {
                            newExpression = [ExpressionDescriptor.callExpression, expression.Context.Members.length, [tailingNode[2][0]].concat(aggregateExpressions[0][1][2][2].splice(1))];
                            var aggregateMember = expression.Context.Members[aggregateExpressions[0][1][2][1]];
                            if (aggregateMember[0] !== MemberDescriptor.closedGenericMethodInfo) {
                                throw new TypeError(ErrorStrings.aggregateMustBeClosedGenericMethod);
                            }
                            var genericAggregateMember = expression.Context.Members[aggregateMember[1]];
                            var aggregateName = convertSteamRToTStreamsAggregateName(genericAggregateMember[2]);
                            newMember = [
                                MemberDescriptor.simpleMethodInfo,
                                windowExpressionTypeIndex,
                                aggregateName,
                                [aggregateExpressions[0][1][2][1]],
                                expressionTypeIndex
                            ];
                        }
                        else {
                            var aggregatesArrayTypeIndex = expression.Context.Types.length;
                            expression.Context.Types.push([TypeDescriptor.array, aggregateExpressions[0][1][1]]);
                            var stringTypeIndex = expression.Context.Types.length;
                            expression.Context.Types.push([TypeDescriptor.simple, "string"]);
                            var dictionaryTypeIndex = expression.Context.Types.length;
                            expression.Context.Types.push([TypeDescriptor.simple, "TStreams.Collections.Dictionary"]);
                            var newDictionaryExpression = [ExpressionDescriptor.newExpression, expression.Context.Members.length, []];
                            expression.Context.Members.push([MemberDescriptor.constructorInfo, dictionaryTypeIndex, []]);
                            var setMemberIndex = expression.Context.Members.length;
                            expression.Context.Members.push([MemberDescriptor.simpleMethodInfo, dictionaryTypeIndex, "set", [stringTypeIndex, aggregateExpressions[0][1][1]]]);
                            var aggregatesArrayExpression = [ExpressionDescriptor.newVectorExpression, aggregateExpressions[0][1][1]];
                            for (i = 0; i < numberOfAggregates; i++) {
                                var aggregateMember = expression.Context.Members[aggregateExpressions[i][1][2][1]];
                                if (aggregateMember[0] !== MemberDescriptor.closedGenericMethodInfo) {
                                    throw new TypeError(ErrorStrings.aggregateMustBeClosedGenericMethod);
                                }
                                var genericAggregateMember = expression.Context.Members[aggregateMember[1]];
                                var aggregateName = convertSteamRToTStreamsAggregateName(genericAggregateMember[2]);
                                var elementInit = [];
                                var arguments = aggregateExpressions[i][1][2][2].splice(1);
                                if (SteamRAPIName.topK === genericAggregateMember[2]) {
                                    if (arguments.length > 3) {
                                        throw new Error(ErrorStrings.aggregateWithWrongNumberOfParameters);
                                    }
                                    elementInit.push([setMemberIndex, [ExpressionDescriptor.constant, "comparer", stringTypeIndex], arguments[0]]);
                                    elementInit.push([setMemberIndex, [ExpressionDescriptor.constant, "k", stringTypeIndex], arguments[1]]);
                                }
                                else if (arguments.length > 0) {
                                    if (arguments.length > 1) {
                                        throw new Error(ErrorStrings.aggregateWithWrongNumberOfParameters);
                                    }
                                    elementInit.push([setMemberIndex, [ExpressionDescriptor.constant, "selector", stringTypeIndex], arguments[0]]);
                                }
                                var structuralArgumentList = [["windowOperatorName", [ExpressionDescriptor.constant, aggregateName, stringTypeIndex]],
                                    ["parameters", [ExpressionDescriptor.memberListBindingInitializationExpression, newDictionaryExpression, elementInit]]];
                                var aggregateExpression = [ExpressionDescriptor.newExpression, structuralArgumentList];
                                aggregatesArrayExpression.push(aggregateExpression);
                            }
                            newExpression = [ExpressionDescriptor.callExpression, expression.Context.Members.length, [tailingNode[2][0], aggregatesArrayExpression, projectExpression]];
                            newMember = [
                                MemberDescriptor.simpleMethodInfo,
                                windowExpressionTypeIndex,
                                "aggregates",
                                [aggregatesArrayTypeIndex, projectExpression[1][1]],
                                expressionTypeIndex
                            ];
                        }
                        expression.Context.Members.push(newMember);
                        tailingNode[2][0] = newExpression;
                    }
                }
                if (expressionNode.length === 4) {
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], expressionNode, parameters);
                    var remappedFunction = expression.Context.Members[expressionNode[1]][2];
                    switch (remappedFunction) {
                        case SteamRAPIName.getLocalSource:
                            expressionNode[3].splice(1, 2);
                            remapParameters(expression, expressionNode[3], parameters);
                            break;
                        default:
                            remapParameters(expression, expressionNode[3], parameters);
                    }
                }
                else {
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2][0], expressionNode, parameters);
                    var member = expression.Context.Members[expressionNode[1]];
                    if (member[2] === "Create" &&
                        member[0] === MemberDescriptor.closedGenericMethodInfo &&
                        expression.Context.Types[expression.Context.Members[member[1]][1]][1].indexOf("Observer") > -1) {
                        length = 3;
                        var firstParameter = expressionNode[2][0];
                        expressionNode.length = 0;
                        for (i = 0; i < length; i++) {
                            expressionNode.push(firstParameter[i]);
                        }
                    }
                    else {
                        length = expressionNode[2].length;
                        for (i = 1; i < length; i++) {
                            remapSQLSteamRExpressionToTStreams(expression, expressionNode[2][i], expressionNode, parameters);
                        }
                    }
                }
                break;
            case ExpressionDescriptor.memberExpression:
                if (expressionNode.length > 2) {
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2], expressionNode, parameters);
                }
                var memberName = expression.Context.Members[expressionNode[1]][2];
                if (memberName === "Ticks") {
                    expressionNode[0] = ExpressionDescriptor.callExpression;
                    expressionNode[3] = [];
                }
                if (memberName === "UtcNow") {
                    expressionNode[0] = ExpressionDescriptor.newExpression;
                    expression.Context.Members[expressionNode[1]][0] = MemberDescriptor.constructorInfo;
                    expression.Context.Members[expressionNode[1]][2] = [];
                    expression.Context.Members[expressionNode[1]].splice(3);
                    expressionNode[2] = [];
                }
                break;
            case ExpressionDescriptor.arrayIndexExpression:
                break;
            case ExpressionDescriptor.newExpression:
                break;
            case ExpressionDescriptor.memberMemberBindingInitializationExpression:
                break;
            case ExpressionDescriptor.memberAssignmentBindingInitializationExpression:
                break;
            case ExpressionDescriptor.memberListBindingInitializationExpression:
                length = expressionNode[2].length;
                for (i = 0; i < length; i++) {
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2][i][1], undefined, parameters);
                    remapSQLSteamRExpressionToTStreams(expression, expressionNode[2][i][2], undefined, parameters);
                }
                break;
            case ExpressionDescriptor.newVectorExpression:
                break;
            case ExpressionDescriptor.newVectorWithRankExpression:
                break;
            default:
                throw new SyntaxError(ErrorStrings.unknownNodeFoundInExpression);
        }
        function convertSteamRToTStreamsAggregateName(aggregateName) {
            switch (aggregateName) {
                case SteamRAPIName.average:
                    aggregateName = "average";
                    break;
                case SteamRAPIName.count:
                    aggregateName = "count";
                    break;
                case SteamRAPIName.max:
                    aggregateName = "max";
                    break;
                case SteamRAPIName.min:
                    aggregateName = "min";
                    break;
                case SteamRAPIName.sum:
                    aggregateName = "sum";
                    break;
                case SteamRAPIName.stdev:
                    aggregateName = "stdev";
                    break;
                case SteamRAPIName.stdevp:
                    aggregateName = "stdevP";
                    break;
                case SteamRAPIName.variance:
                    aggregateName = "variance";
                    break;
                case SteamRAPIName.variancep:
                    aggregateName = "varianceP";
                    break;
                case SteamRAPIName.toList:
                    aggregateName = "toList";
                    break;
                case SteamRAPIName.topK:
                    aggregateName = "_steamr_topK";
                    break;
                default:
                    throw new TypeError(Utils.formatString(ErrorStrings.unknownAggregate, aggregateName));
            }
            return aggregateName;
        }
    }
    var invalidCharactersRE = /[^a-z0-9_$]/gi;
    var firstValidCharacterRE = /^[a-z_$]/i;
    function escapeIdentifiers(name) {
        var name = name.replace(invalidCharactersRE, '_');
        if (!firstValidCharacterRE.test(name)) {
            name = '_' + name;
        }
        return name;
    }
    var timespanRE = /(-?)(?:(\d+)\.)?(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/;
    function convertTimeSpanToMilliseconds(timeSpan) {
        var parts = timespanRE.exec(timeSpan);
        if (!!parts) {
            var minus = parts[1];
            var days = parts[2];
            var hours = parts[3];
            var minutes = parts[4];
            var seconds = parts[5];
            var ticks = parts[6];
            var ms = (!!days) ? parseInt(days) : 0;
            ms = ms * 24 + parseInt(hours);
            ms = ms * 60 + parseInt(minutes);
            ms = ms * 60 + parseInt(seconds);
            ms = ms * 1000 + ((!!ticks) ? Math.floor(parseInt(ticks) / 10000) : 0);
            return (!!minus) ? -ms : ms;
        }
        return undefined;
    }
    function convertWindowOffsetToMilliseconds(timeSpan) {
        return convertTimeSpanToMilliseconds(timeSpan) - 62135596800000;
    }
    if (typeof exports !== "undefined" &&
        typeof module !== "undefined" &&
        typeof module.exports !== "undefined") {
        exports = module.exports = TStreamsBonsaiSerializer;
        _tstreams = require("./TStreams.js");
        _microsoft = {
            EventProcessing: {
                SteamR: require("./SteamR.js")
            }
        };
        _moment = require("./moment.js");
    }
    else {
        _tstreams = TStreams;
        _microsoft = Microsoft;
        _moment = moment;
    }
})(TStreamsBonsaiSerializer || (TStreamsBonsaiSerializer = {}));

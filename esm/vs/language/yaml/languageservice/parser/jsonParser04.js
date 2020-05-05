/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import * as objects from '../utils/objects.js';
import * as nls from '../../fillers/vscode-nls.js';
var localize = nls.loadMessageBundle();
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Undefined"] = 0] = "Undefined";
    ErrorCode[ErrorCode["EnumValueMismatch"] = 1] = "EnumValueMismatch";
    ErrorCode[ErrorCode["CommentsNotAllowed"] = 2] = "CommentsNotAllowed";
})(ErrorCode || (ErrorCode = {}));
export var ProblemSeverity;
(function (ProblemSeverity) {
    ProblemSeverity[ProblemSeverity["Error"] = 0] = "Error";
    ProblemSeverity[ProblemSeverity["Warning"] = 1] = "Warning";
})(ProblemSeverity || (ProblemSeverity = {}));
var ASTNode = /** @class */ (function () {
    function ASTNode(parent, type, location, start, end) {
        this.type = type;
        this.location = location;
        this.start = start;
        this.end = end;
        this.parent = parent;
        this.parserSettings = {
            isKubernetes: false,
        };
    }
    ASTNode.prototype.setParserSettings = function (parserSettings) {
        this.parserSettings = parserSettings;
    };
    ASTNode.prototype.getPath = function () {
        var path = this.parent ? this.parent.getPath() : [];
        if (this.location !== null) {
            path.push(this.location);
        }
        return path;
    };
    ASTNode.prototype.getChildNodes = function () {
        return [];
    };
    ASTNode.prototype.getLastChild = function () {
        return null;
    };
    // tslint:disable-next-line: no-any
    ASTNode.prototype.getValue = function () {
        // override in children
        return;
    };
    ASTNode.prototype.contains = function (offset, includeRightBound) {
        if (includeRightBound === void 0) { includeRightBound = false; }
        return ((offset >= this.start && offset < this.end) ||
            (includeRightBound && offset === this.end));
    };
    ASTNode.prototype.toString = function () {
        return ('type: ' +
            this.type +
            ' (' +
            this.start +
            '/' +
            this.end +
            ')' +
            (this.parent ? ' parent: {' + this.parent.toString() + '}' : ''));
    };
    ASTNode.prototype.visit = function (visitor) {
        return visitor(this);
    };
    ASTNode.prototype.getNodeFromOffset = function (offset) {
        var findNode = function (node) {
            if (offset >= node.start && offset < node.end) {
                var children = node.getChildNodes();
                for (var i = 0; i < children.length && children[i].start <= offset; i++) {
                    var item = findNode(children[i]);
                    if (item) {
                        return item;
                    }
                }
                return node;
            }
            return null;
        };
        return findNode(this);
    };
    ASTNode.prototype.getNodeCollectorCount = function (offset) {
        var collector = [];
        var findNode = function (node) {
            var children = node.getChildNodes();
            for (var i = 0; i < children.length; i++) {
                var item = findNode(children[i]);
                if (item && item.type === 'property') {
                    collector.push(item);
                }
            }
            return node;
        };
        var foundNode = findNode(this);
        return collector.length;
    };
    ASTNode.prototype.getNodeFromOffsetEndInclusive = function (offset) {
        var collector = [];
        var findNode = function (node) {
            if (offset >= node.start && offset <= node.end) {
                var children = node.getChildNodes();
                for (var i = 0; i < children.length && children[i].start <= offset; i++) {
                    var item = findNode(children[i]);
                    if (item) {
                        collector.push(item);
                    }
                }
                return node;
            }
            return null;
        };
        var foundNode = findNode(this);
        var currMinDist = Number.MAX_VALUE;
        var currMinNode = null;
        for (var possibleNode in collector) {
            var currNode = collector[possibleNode];
            var minDist = currNode.end - offset + (offset - currNode.start);
            if (minDist < currMinDist) {
                currMinNode = currNode;
                currMinDist = minDist;
            }
        }
        return currMinNode || foundNode;
    };
    ASTNode.prototype.validate = function (schema, validationResult, matchingSchemas) {
        var e_1, _a;
        var _this = this;
        if (!matchingSchemas.include(this)) {
            return;
        }
        if (Array.isArray(schema.type)) {
            if (schema.type.indexOf(this.type) === -1) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: schema.errorMessage ||
                        localize('typeArrayMismatchWarning', 'Incorrect type. Expected one of {0}.', schema.type.join(', ')),
                });
            }
        }
        else if (schema.type) {
            if (this.type !== schema.type) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: schema.errorMessage ||
                        localize('typeMismatchWarning', 'Incorrect type. Expected "{0}".', schema.type),
                });
            }
        }
        if (Array.isArray(schema.allOf)) {
            schema.allOf.forEach(function (subSchema) {
                _this.validate(subSchema, validationResult, matchingSchemas);
            });
        }
        if (schema.not) {
            var subValidationResult = new ValidationResult();
            var subMatchingSchemas = matchingSchemas.newSub();
            this.validate(schema.not, subValidationResult, subMatchingSchemas);
            if (!subValidationResult.hasProblems()) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('notSchemaWarning', 'Matches a schema that is not allowed.'),
                });
            }
            subMatchingSchemas.schemas.forEach(function (ms) {
                ms.inverted = !ms.inverted;
                matchingSchemas.add(ms);
            });
        }
        var testAlternatives = function (alternatives, maxOneMatch) {
            var matches = [];
            // remember the best match that is used for error messages
            var bestMatch = null;
            alternatives.forEach(function (subSchema) {
                var subValidationResult = new ValidationResult();
                var subMatchingSchemas = matchingSchemas.newSub();
                _this.validate(subSchema, subValidationResult, subMatchingSchemas);
                if (!subValidationResult.hasProblems()) {
                    matches.push(subSchema);
                }
                if (!bestMatch) {
                    bestMatch = {
                        schema: subSchema,
                        validationResult: subValidationResult,
                        matchingSchemas: subMatchingSchemas,
                    };
                }
                else if (_this.parserSettings.isKubernetes) {
                    bestMatch = alternativeComparison(subValidationResult, bestMatch, subSchema, subMatchingSchemas);
                }
                else {
                    bestMatch = genericComparison(maxOneMatch, subValidationResult, bestMatch, subSchema, subMatchingSchemas);
                }
            });
            if (matches.length > 1 &&
                maxOneMatch &&
                !_this.parserSettings.isKubernetes) {
                validationResult.problems.push({
                    location: { start: _this.start, end: _this.start + 1 },
                    severity: ProblemSeverity.Warning,
                    message: localize('oneOfWarning', 'Matches multiple schemas when only one must validate.'),
                });
            }
            if (bestMatch !== null) {
                validationResult.merge(bestMatch.validationResult);
                validationResult.propertiesMatches +=
                    bestMatch.validationResult.propertiesMatches;
                validationResult.propertiesValueMatches +=
                    bestMatch.validationResult.propertiesValueMatches;
                matchingSchemas.merge(bestMatch.matchingSchemas);
            }
            return matches.length;
        };
        if (Array.isArray(schema.anyOf)) {
            testAlternatives(schema.anyOf, false);
        }
        if (Array.isArray(schema.oneOf)) {
            testAlternatives(schema.oneOf, true);
        }
        if (Array.isArray(schema.enum)) {
            var val = this.getValue();
            var enumValueMatch = false;
            try {
                for (var _b = __values(schema.enum), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var e = _c.value;
                    if (objects.equals(val, e)) {
                        enumValueMatch = true;
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            validationResult.enumValues = schema.enum;
            validationResult.enumValueMatch = enumValueMatch;
            if (!enumValueMatch) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    code: ErrorCode.EnumValueMismatch,
                    message: schema.errorMessage ||
                        localize('enumWarning', 'Value is not accepted. Valid values: {0}.', schema.enum.map(function (v) { return JSON.stringify(v); }).join(', ')),
                });
            }
        }
        if (schema.deprecationMessage && this.parent) {
            validationResult.problems.push({
                location: { start: this.parent.start, end: this.parent.end },
                severity: ProblemSeverity.Warning,
                message: schema.deprecationMessage,
            });
        }
        matchingSchemas.add({ node: this, schema: schema });
    };
    return ASTNode;
}());
export { ASTNode };
var NullASTNode = /** @class */ (function (_super) {
    __extends(NullASTNode, _super);
    function NullASTNode(parent, name, start, end) {
        return _super.call(this, parent, 'null', name, start, end) || this;
    }
    // tslint:disable-next-line: no-any
    NullASTNode.prototype.getValue = function () {
        return null;
    };
    return NullASTNode;
}(ASTNode));
export { NullASTNode };
var BooleanASTNode = /** @class */ (function (_super) {
    __extends(BooleanASTNode, _super);
    function BooleanASTNode(parent, name, value, start, end) {
        var _this = _super.call(this, parent, 'boolean', name, start, end) || this;
        _this.value = value;
        return _this;
    }
    // tslint:disable-next-line: no-any
    BooleanASTNode.prototype.getValue = function () {
        return this.value;
    };
    return BooleanASTNode;
}(ASTNode));
export { BooleanASTNode };
var ArrayASTNode = /** @class */ (function (_super) {
    __extends(ArrayASTNode, _super);
    function ArrayASTNode(parent, name, start, end) {
        var _this = _super.call(this, parent, 'array', name, start, end) || this;
        _this.items = [];
        return _this;
    }
    ArrayASTNode.prototype.getChildNodes = function () {
        return this.items;
    };
    ArrayASTNode.prototype.getLastChild = function () {
        return this.items[this.items.length - 1];
    };
    // tslint:disable-next-line: no-any
    ArrayASTNode.prototype.getValue = function () {
        return this.items.map(function (v) { return v.getValue(); });
    };
    ArrayASTNode.prototype.addItem = function (item) {
        if (item) {
            this.items.push(item);
            return true;
        }
        return false;
    };
    ArrayASTNode.prototype.visit = function (visitor) {
        var ctn = visitor(this);
        for (var i = 0; i < this.items.length && ctn; i++) {
            ctn = this.items[i].visit(visitor);
        }
        return ctn;
    };
    ArrayASTNode.prototype.validate = function (schema, validationResult, matchingSchemas) {
        var _this = this;
        if (!matchingSchemas.include(this)) {
            return;
        }
        _super.prototype.validate.call(this, schema, validationResult, matchingSchemas);
        if (Array.isArray(schema.items)) {
            var subSchemas_1 = schema.items;
            subSchemas_1.forEach(function (subSchema, index) {
                var itemValidationResult = new ValidationResult();
                var item = _this.items[index];
                if (item) {
                    item.validate(subSchema, itemValidationResult, matchingSchemas);
                    validationResult.mergePropertyMatch(itemValidationResult);
                }
                else if (_this.items.length >= subSchemas_1.length) {
                    validationResult.propertiesValueMatches++;
                }
            });
            if (this.items.length > subSchemas_1.length) {
                if (typeof schema.additionalItems === 'object') {
                    for (var i = subSchemas_1.length; i < this.items.length; i++) {
                        var itemValidationResult = new ValidationResult();
                        // tslint:disable-next-line: no-any
                        this.items[i].validate(schema.additionalItems, itemValidationResult, matchingSchemas);
                        validationResult.mergePropertyMatch(itemValidationResult);
                    }
                }
                else if (schema.additionalItems === false) {
                    validationResult.problems.push({
                        location: { start: this.start, end: this.end },
                        severity: ProblemSeverity.Warning,
                        message: localize('additionalItemsWarning', 'Array has too many items according to schema. Expected {0} or fewer.', subSchemas_1.length),
                    });
                }
            }
        }
        else if (schema.items) {
            this.items.forEach(function (item) {
                var itemValidationResult = new ValidationResult();
                item.validate(schema.items, itemValidationResult, matchingSchemas);
                validationResult.mergePropertyMatch(itemValidationResult);
            });
        }
        if (schema.minItems && this.items.length < schema.minItems) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: ProblemSeverity.Warning,
                message: localize('minItemsWarning', 'Array has too few items. Expected {0} or more.', schema.minItems),
            });
        }
        if (schema.maxItems && this.items.length > schema.maxItems) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: ProblemSeverity.Warning,
                message: localize('maxItemsWarning', 'Array has too many items. Expected {0} or fewer.', schema.minItems),
            });
        }
        if (schema.uniqueItems === true) {
            var values_1 = this.items.map(function (node) { return node.getValue(); });
            var duplicates = values_1.some(function (value, index) { return index !== values_1.lastIndexOf(value); });
            if (duplicates) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('uniqueItemsWarning', 'Array has duplicate items.'),
                });
            }
        }
    };
    return ArrayASTNode;
}(ASTNode));
export { ArrayASTNode };
var NumberASTNode = /** @class */ (function (_super) {
    __extends(NumberASTNode, _super);
    function NumberASTNode(parent, name, start, end) {
        var _this = _super.call(this, parent, 'number', name, start, end) || this;
        _this.isInteger = true;
        _this.value = Number.NaN;
        return _this;
    }
    // tslint:disable-next-line: no-any
    NumberASTNode.prototype.getValue = function () {
        return this.value;
    };
    NumberASTNode.prototype.validate = function (schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        // work around type validation in the base class
        var typeIsInteger = false;
        if (schema.type === 'integer' ||
            (Array.isArray(schema.type) &&
                schema.type.indexOf('integer') !== -1)) {
            typeIsInteger = true;
        }
        if (typeIsInteger && this.isInteger === true) {
            this.type = 'integer';
        }
        _super.prototype.validate.call(this, schema, validationResult, matchingSchemas);
        this.type = 'number';
        var val = this.getValue();
        if (typeof schema.multipleOf === 'number') {
            if (val % schema.multipleOf !== 0) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('multipleOfWarning', 'Value is not divisible by {0}.', schema.multipleOf),
                });
            }
        }
        if (typeof schema.minimum === 'number') {
            if (schema.exclusiveMinimum && val <= schema.minimum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('exclusiveMinimumWarning', 'Value is below the exclusive minimum of {0}.', schema.minimum),
                });
            }
            if (!schema.exclusiveMinimum && val < schema.minimum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('minimumWarning', 'Value is below the minimum of {0}.', schema.minimum),
                });
            }
        }
        if (typeof schema.maximum === 'number') {
            if (schema.exclusiveMaximum && val >= schema.maximum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('exclusiveMaximumWarning', 'Value is above the exclusive maximum of {0}.', schema.maximum),
                });
            }
            if (!schema.exclusiveMaximum && val > schema.maximum) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('maximumWarning', 'Value is above the maximum of {0}.', schema.maximum),
                });
            }
        }
    };
    return NumberASTNode;
}(ASTNode));
export { NumberASTNode };
var StringASTNode = /** @class */ (function (_super) {
    __extends(StringASTNode, _super);
    function StringASTNode(parent, name, isKey, start, end) {
        var _this = _super.call(this, parent, 'string', name, start, end) || this;
        _this.isKey = isKey;
        _this.value = '';
        return _this;
    }
    // tslint:disable-next-line: no-any
    StringASTNode.prototype.getValue = function () {
        return this.value;
    };
    StringASTNode.prototype.validate = function (schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        _super.prototype.validate.call(this, schema, validationResult, matchingSchemas);
        if (schema.minLength && this.value.length < schema.minLength) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: ProblemSeverity.Warning,
                message: localize('minLengthWarning', 'String is shorter than the minimum length of {0}.', schema.minLength),
            });
        }
        if (schema.maxLength && this.value.length > schema.maxLength) {
            validationResult.problems.push({
                location: { start: this.start, end: this.end },
                severity: ProblemSeverity.Warning,
                message: localize('maxLengthWarning', 'String is longer than the maximum length of {0}.', schema.maxLength),
            });
        }
        if (schema.pattern) {
            var regex = new RegExp(schema.pattern);
            if (!regex.test(this.value)) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: schema.patternErrorMessage ||
                        schema.errorMessage ||
                        localize('patternWarning', 'String does not match the pattern of "{0}".', schema.pattern),
                });
            }
        }
    };
    return StringASTNode;
}(ASTNode));
export { StringASTNode };
var PropertyASTNode = /** @class */ (function (_super) {
    __extends(PropertyASTNode, _super);
    function PropertyASTNode(parent, key) {
        var _this = _super.call(this, parent, 'property', null, key.start) || this;
        _this.key = key;
        key.parent = _this;
        key.location = key.value;
        _this.colonOffset = -1;
        return _this;
    }
    PropertyASTNode.prototype.getChildNodes = function () {
        return this.value ? [this.key, this.value] : [this.key];
    };
    PropertyASTNode.prototype.getLastChild = function () {
        return this.value;
    };
    PropertyASTNode.prototype.setValue = function (value) {
        this.value = value;
        return value !== null;
    };
    PropertyASTNode.prototype.visit = function (visitor) {
        return (visitor(this) &&
            this.key.visit(visitor) &&
            this.value &&
            this.value.visit(visitor));
    };
    PropertyASTNode.prototype.validate = function (schema, validationResult, matchingSchemas) {
        if (!matchingSchemas.include(this)) {
            return;
        }
        if (this.value) {
            this.value.validate(schema, validationResult, matchingSchemas);
        }
    };
    return PropertyASTNode;
}(ASTNode));
export { PropertyASTNode };
var ObjectASTNode = /** @class */ (function (_super) {
    __extends(ObjectASTNode, _super);
    function ObjectASTNode(parent, name, start, end) {
        var _this = _super.call(this, parent, 'object', name, start, end) || this;
        _this.properties = [];
        return _this;
    }
    ObjectASTNode.prototype.getChildNodes = function () {
        return this.properties;
    };
    ObjectASTNode.prototype.getLastChild = function () {
        return this.properties[this.properties.length - 1];
    };
    ObjectASTNode.prototype.addProperty = function (node) {
        if (!node) {
            return false;
        }
        this.properties.push(node);
        return true;
    };
    ObjectASTNode.prototype.getFirstProperty = function (key) {
        for (var i = 0; i < this.properties.length; i++) {
            if (this.properties[i].key.value === key) {
                return this.properties[i];
            }
        }
        return null;
    };
    ObjectASTNode.prototype.getKeyList = function () {
        return this.properties.map(function (p) { return p.key.getValue(); });
    };
    // tslint:disable-next-line: no-any
    ObjectASTNode.prototype.getValue = function () {
        // tslint:disable-next-line: no-any
        var value = Object.create(null);
        this.properties.forEach(function (p) {
            var v = p.value && p.value.getValue();
            if (typeof v !== 'undefined') {
                value[p.key.getValue()] = v;
            }
        });
        return value;
    };
    ObjectASTNode.prototype.visit = function (visitor) {
        var ctn = visitor(this);
        for (var i = 0; i < this.properties.length && ctn; i++) {
            ctn = this.properties[i].visit(visitor);
        }
        return ctn;
    };
    ObjectASTNode.prototype.validate = function (schema, validationResult, matchingSchemas) {
        var _this = this;
        if (!matchingSchemas.include(this)) {
            return;
        }
        _super.prototype.validate.call(this, schema, validationResult, matchingSchemas);
        var seenKeys = Object.create(null);
        var unprocessedProperties = [];
        this.properties.forEach(function (node) {
            var key = node.key.value;
            //Replace the merge key with the actual values of what the node value points to in seen keys
            if (key === '<<' && node.value) {
                switch (node.value.type) {
                    case 'object': {
                        node.value['properties'].forEach(function (propASTNode) {
                            var propKey = propASTNode.key.value;
                            seenKeys[propKey] = propASTNode.value;
                            unprocessedProperties.push(propKey);
                        });
                        break;
                    }
                    case 'array': {
                        node.value['items'].forEach(function (sequenceNode) {
                            sequenceNode['properties'].forEach(function (propASTNode) {
                                var seqKey = propASTNode.key.value;
                                seenKeys[seqKey] = propASTNode.value;
                                unprocessedProperties.push(seqKey);
                            });
                        });
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
            else {
                seenKeys[key] = node.value;
                unprocessedProperties.push(key);
            }
        });
        if (Array.isArray(schema.required)) {
            schema.required.forEach(function (propertyName) {
                if (!seenKeys[propertyName]) {
                    var key = _this.parent && _this.parent && _this.parent.key;
                    var location_1 = key
                        ? { start: key.start, end: key.end }
                        : { start: _this.start, end: _this.start + 1 };
                    validationResult.problems.push({
                        location: location_1,
                        severity: ProblemSeverity.Warning,
                        message: localize('MissingRequiredPropWarning', 'Missing property "{0}".', propertyName),
                    });
                }
            });
        }
        var propertyProcessed = function (prop) {
            var index = unprocessedProperties.indexOf(prop);
            while (index >= 0) {
                unprocessedProperties.splice(index, 1);
                index = unprocessedProperties.indexOf(prop);
            }
        };
        if (schema.properties) {
            Object.keys(schema.properties).forEach(function (propertyName) {
                propertyProcessed(propertyName);
                var prop = schema.properties[propertyName];
                var child = seenKeys[propertyName];
                if (child) {
                    var propertyValidationResult = new ValidationResult();
                    child.validate(prop, propertyValidationResult, matchingSchemas);
                    validationResult.mergePropertyMatch(propertyValidationResult);
                }
            });
        }
        if (schema.patternProperties) {
            Object.keys(schema.patternProperties).forEach(function (propertyPattern) {
                var regex = new RegExp(propertyPattern);
                unprocessedProperties.slice(0).forEach(function (propertyName) {
                    if (regex.test(propertyName)) {
                        propertyProcessed(propertyName);
                        var child = seenKeys[propertyName];
                        if (child) {
                            var propertyValidationResult = new ValidationResult();
                            child.validate(schema.patternProperties[propertyPattern], propertyValidationResult, matchingSchemas);
                            validationResult.mergePropertyMatch(propertyValidationResult);
                        }
                    }
                });
            });
        }
        if (typeof schema.additionalProperties === 'object') {
            unprocessedProperties.forEach(function (propertyName) {
                var child = seenKeys[propertyName];
                if (child) {
                    var propertyValidationResult = new ValidationResult();
                    // tslint:disable-next-line: no-any
                    child.validate(schema.additionalProperties, propertyValidationResult, matchingSchemas);
                    validationResult.mergePropertyMatch(propertyValidationResult);
                }
            });
        }
        else if (schema.additionalProperties === false) {
            if (unprocessedProperties.length > 0) {
                unprocessedProperties.forEach(function (propertyName) {
                    var child = seenKeys[propertyName];
                    if (child) {
                        var propertyNode = null;
                        if (child.type !== 'property') {
                            propertyNode = child.parent;
                            if (propertyNode.type === 'object') {
                                propertyNode = propertyNode.properties[0];
                            }
                        }
                        else {
                            propertyNode = child;
                        }
                        validationResult.problems.push({
                            location: {
                                start: propertyNode.key.start,
                                end: propertyNode.key.end,
                            },
                            severity: ProblemSeverity.Warning,
                            message: schema.errorMessage ||
                                localize('DisallowedExtraPropWarning', 'Unexpected property {0}', propertyName),
                        });
                    }
                });
            }
        }
        if (schema.maxProperties) {
            if (this.properties.length > schema.maxProperties) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('MaxPropWarning', 'Object has more properties than limit of {0}.', schema.maxProperties),
                });
            }
        }
        if (schema.minProperties) {
            if (this.properties.length < schema.minProperties) {
                validationResult.problems.push({
                    location: { start: this.start, end: this.end },
                    severity: ProblemSeverity.Warning,
                    message: localize('MinPropWarning', 'Object has fewer properties than the required number of {0}', schema.minProperties),
                });
            }
        }
        if (schema.dependencies) {
            Object.keys(schema.dependencies).forEach(function (key) {
                var prop = seenKeys[key];
                if (prop) {
                    var propertyDep = schema.dependencies[key];
                    if (Array.isArray(propertyDep)) {
                        propertyDep.forEach(function (requiredProp) {
                            if (!seenKeys[requiredProp]) {
                                validationResult.problems.push({
                                    location: { start: _this.start, end: _this.end },
                                    severity: ProblemSeverity.Warning,
                                    message: localize('RequiredDependentPropWarning', 'Object is missing property {0} required by property {1}.', requiredProp, key),
                                });
                            }
                            else {
                                validationResult.propertiesValueMatches++;
                            }
                        });
                    }
                    else if (propertyDep) {
                        var propertyvalidationResult = new ValidationResult();
                        _this.validate(propertyDep, propertyvalidationResult, matchingSchemas);
                        validationResult.mergePropertyMatch(propertyvalidationResult);
                    }
                }
            });
        }
    };
    return ObjectASTNode;
}(ASTNode));
export { ObjectASTNode };
export var EnumMatch;
(function (EnumMatch) {
    EnumMatch[EnumMatch["Key"] = 0] = "Key";
    EnumMatch[EnumMatch["Enum"] = 1] = "Enum";
})(EnumMatch || (EnumMatch = {}));
var SchemaCollector = /** @class */ (function () {
    function SchemaCollector(focusOffset, exclude) {
        if (focusOffset === void 0) { focusOffset = -1; }
        if (exclude === void 0) { exclude = null; }
        this.focusOffset = focusOffset;
        this.exclude = exclude;
        this.schemas = [];
    }
    SchemaCollector.prototype.add = function (schema) {
        this.schemas.push(schema);
    };
    SchemaCollector.prototype.merge = function (other) {
        var _a;
        (_a = this.schemas).push.apply(_a, __spread(other.schemas));
    };
    SchemaCollector.prototype.include = function (node) {
        return ((this.focusOffset === -1 || node.contains(this.focusOffset)) &&
            node !== this.exclude);
    };
    SchemaCollector.prototype.newSub = function () {
        return new SchemaCollector(-1, this.exclude);
    };
    return SchemaCollector;
}());
var NoOpSchemaCollector = /** @class */ (function () {
    function NoOpSchemaCollector() {
    }
    Object.defineProperty(NoOpSchemaCollector.prototype, "schemas", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    NoOpSchemaCollector.prototype.add = function (schema) { };
    NoOpSchemaCollector.prototype.merge = function (other) { };
    NoOpSchemaCollector.prototype.include = function (node) {
        return true;
    };
    NoOpSchemaCollector.prototype.newSub = function () {
        return this;
    };
    return NoOpSchemaCollector;
}());
var ValidationResult = /** @class */ (function () {
    function ValidationResult() {
        this.problems = [];
        this.propertiesMatches = 0;
        this.propertiesValueMatches = 0;
        this.primaryValueMatches = 0;
        this.enumValueMatch = false;
        this.enumValues = null;
        this.warnings = [];
        this.errors = [];
    }
    ValidationResult.prototype.hasProblems = function () {
        return !!this.problems.length;
    };
    ValidationResult.prototype.mergeAll = function (validationResults) {
        var _this = this;
        validationResults.forEach(function (validationResult) {
            _this.merge(validationResult);
        });
    };
    ValidationResult.prototype.merge = function (validationResult) {
        this.problems = this.problems.concat(validationResult.problems);
    };
    ValidationResult.prototype.mergeEnumValues = function (validationResult) {
        var e_2, _a;
        if (!this.enumValueMatch &&
            !validationResult.enumValueMatch &&
            this.enumValues &&
            validationResult.enumValues) {
            this.enumValues = this.enumValues.concat(validationResult.enumValues);
            try {
                for (var _b = __values(this.problems), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var error = _c.value;
                    if (error.code === ErrorCode.EnumValueMismatch) {
                        error.message = localize('enumWarning', 'Value is not accepted. Valid values: {0}.', this.enumValues.map(function (v) { return JSON.stringify(v); }).join(', '));
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    };
    ValidationResult.prototype.mergePropertyMatch = function (propertyValidationResult) {
        this.merge(propertyValidationResult);
        this.propertiesMatches++;
        if (propertyValidationResult.enumValueMatch ||
            (!this.hasProblems() && propertyValidationResult.propertiesMatches)) {
            this.propertiesValueMatches++;
        }
        if (propertyValidationResult.enumValueMatch &&
            propertyValidationResult.enumValues) {
            this.primaryValueMatches++;
        }
    };
    ValidationResult.prototype.compareGeneric = function (other) {
        var hasProblems = this.hasProblems();
        if (hasProblems !== other.hasProblems()) {
            return hasProblems ? -1 : 1;
        }
        if (this.enumValueMatch !== other.enumValueMatch) {
            return other.enumValueMatch ? -1 : 1;
        }
        if (this.propertiesValueMatches !== other.propertiesValueMatches) {
            return this.propertiesValueMatches - other.propertiesValueMatches;
        }
        if (this.primaryValueMatches !== other.primaryValueMatches) {
            return this.primaryValueMatches - other.primaryValueMatches;
        }
        return this.propertiesMatches - other.propertiesMatches;
    };
    ValidationResult.prototype.compareKubernetes = function (other) {
        var hasProblems = this.hasProblems();
        if (this.propertiesMatches !== other.propertiesMatches) {
            return this.propertiesMatches - other.propertiesMatches;
        }
        if (this.enumValueMatch !== other.enumValueMatch) {
            return other.enumValueMatch ? -1 : 1;
        }
        if (this.primaryValueMatches !== other.primaryValueMatches) {
            return this.primaryValueMatches - other.primaryValueMatches;
        }
        if (this.propertiesValueMatches !== other.propertiesValueMatches) {
            return this.propertiesValueMatches - other.propertiesValueMatches;
        }
        if (hasProblems !== other.hasProblems()) {
            return hasProblems ? -1 : 1;
        }
        return this.propertiesMatches - other.propertiesMatches;
    };
    return ValidationResult;
}());
export { ValidationResult };
var JSONDocument = /** @class */ (function () {
    function JSONDocument(root, syntaxErrors) {
        this.root = root;
        this.syntaxErrors = syntaxErrors;
    }
    JSONDocument.prototype.getNodeFromOffset = function (offset) {
        return this.root && this.root.getNodeFromOffset(offset);
    };
    JSONDocument.prototype.getNodeFromOffsetEndInclusive = function (offset) {
        return this.root && this.root.getNodeFromOffsetEndInclusive(offset);
    };
    JSONDocument.prototype.visit = function (visitor) {
        if (this.root) {
            this.root.visit(visitor);
        }
    };
    JSONDocument.prototype.configureSettings = function (parserSettings) {
        if (this.root) {
            this.root.setParserSettings(parserSettings);
        }
    };
    JSONDocument.prototype.validate = function (schema) {
        if (this.root && schema) {
            var validationResult = new ValidationResult();
            this.root.validate(schema, validationResult, new NoOpSchemaCollector());
            return validationResult.problems;
        }
        return null;
    };
    JSONDocument.prototype.getMatchingSchemas = function (schema, focusOffset, exclude) {
        if (focusOffset === void 0) { focusOffset = -1; }
        if (exclude === void 0) { exclude = null; }
        var matchingSchemas = new SchemaCollector(focusOffset, exclude);
        var validationResult = new ValidationResult();
        if (this.root && schema) {
            this.root.validate(schema, validationResult, matchingSchemas);
        }
        return matchingSchemas.schemas;
    };
    JSONDocument.prototype.getValidationProblems = function (schema, focusOffset, exclude) {
        if (focusOffset === void 0) { focusOffset = -1; }
        if (exclude === void 0) { exclude = null; }
        var matchingSchemas = new SchemaCollector(focusOffset, exclude);
        var validationResult = new ValidationResult();
        if (this.root && schema) {
            this.root.validate(schema, validationResult, matchingSchemas);
        }
        return validationResult.problems;
    };
    return JSONDocument;
}());
export { JSONDocument };
//Alternative comparison is specifically used by the kubernetes/openshift schema but may lead to better results then genericComparison depending on the schema
function alternativeComparison(subValidationResult, bestMatch, subSchema, subMatchingSchemas) {
    var compareResult = subValidationResult.compareKubernetes(bestMatch.validationResult);
    if (compareResult > 0) {
        // our node is the best matching so far
        bestMatch = {
            schema: subSchema,
            validationResult: subValidationResult,
            matchingSchemas: subMatchingSchemas,
        };
    }
    else if (compareResult === 0) {
        // there's already a best matching but we are as good
        bestMatch.matchingSchemas.merge(subMatchingSchemas);
        bestMatch.validationResult.mergeEnumValues(subValidationResult);
    }
    return bestMatch;
}
//genericComparison tries to find the best matching schema using a generic comparison
function genericComparison(maxOneMatch, subValidationResult, bestMatch, subSchema, subMatchingSchemas) {
    if (!maxOneMatch &&
        !subValidationResult.hasProblems() &&
        !bestMatch.validationResult.hasProblems()) {
        // no errors, both are equally good matches
        bestMatch.matchingSchemas.merge(subMatchingSchemas);
        bestMatch.validationResult.propertiesMatches +=
            subValidationResult.propertiesMatches;
        bestMatch.validationResult.propertiesValueMatches +=
            subValidationResult.propertiesValueMatches;
    }
    else {
        var compareResult = subValidationResult.compareGeneric(bestMatch.validationResult);
        if (compareResult > 0) {
            // our node is the best matching so far
            bestMatch = {
                schema: subSchema,
                validationResult: subValidationResult,
                matchingSchemas: subMatchingSchemas,
            };
        }
        else if (compareResult === 0) {
            // there's already a best matching but we are as good
            bestMatch.matchingSchemas.merge(subMatchingSchemas);
            bestMatch.validationResult.mergeEnumValues(subValidationResult);
        }
    }
    return bestMatch;
}

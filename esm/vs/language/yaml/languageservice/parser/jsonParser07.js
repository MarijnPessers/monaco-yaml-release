/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import * as Json from '../../_deps/jsonc-parser/main.js';
import { isNumber, equals, isString, isDefined, isBoolean, } from '../utils/objects.js';
import { ErrorCode } from '../../_deps/vscode-json-languageservice/lib/esm/jsonLanguageService.js';
import * as nls from '../../fillers/vscode-nls.js';
import { URI } from '../../_deps/vscode-uri/index.js';
import { Diagnostic, DiagnosticSeverity, Range, } from '../../_deps/vscode-languageserver-types/main.js';
var localize = nls.loadMessageBundle();
var colorHexPattern = /^#([0-9A-Fa-f]{3,4}|([0-9A-Fa-f]{2}){3,4})$/;
var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var ASTNodeImpl = /** @class */ (function () {
    function ASTNodeImpl(parent, offset, length) {
        this.offset = offset;
        this.length = length;
        this.parent = parent;
    }
    Object.defineProperty(ASTNodeImpl.prototype, "children", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    ASTNodeImpl.prototype.toString = function () {
        return ('type: ' +
            this.type +
            ' (' +
            this.offset +
            '/' +
            this.length +
            ')' +
            (this.parent ? ' parent: {' + this.parent.toString() + '}' : ''));
    };
    return ASTNodeImpl;
}());
export { ASTNodeImpl };
var NullASTNodeImpl = /** @class */ (function (_super) {
    __extends(NullASTNodeImpl, _super);
    function NullASTNodeImpl(parent, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = 'null';
        _this.value = null;
        return _this;
    }
    return NullASTNodeImpl;
}(ASTNodeImpl));
export { NullASTNodeImpl };
var BooleanASTNodeImpl = /** @class */ (function (_super) {
    __extends(BooleanASTNodeImpl, _super);
    function BooleanASTNodeImpl(parent, boolValue, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = 'boolean';
        _this.value = boolValue;
        return _this;
    }
    return BooleanASTNodeImpl;
}(ASTNodeImpl));
export { BooleanASTNodeImpl };
var ArrayASTNodeImpl = /** @class */ (function (_super) {
    __extends(ArrayASTNodeImpl, _super);
    function ArrayASTNodeImpl(parent, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = 'array';
        _this.items = [];
        return _this;
    }
    Object.defineProperty(ArrayASTNodeImpl.prototype, "children", {
        get: function () {
            return this.items;
        },
        enumerable: true,
        configurable: true
    });
    return ArrayASTNodeImpl;
}(ASTNodeImpl));
export { ArrayASTNodeImpl };
var NumberASTNodeImpl = /** @class */ (function (_super) {
    __extends(NumberASTNodeImpl, _super);
    function NumberASTNodeImpl(parent, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = 'number';
        _this.isInteger = true;
        _this.value = Number.NaN;
        return _this;
    }
    return NumberASTNodeImpl;
}(ASTNodeImpl));
export { NumberASTNodeImpl };
var StringASTNodeImpl = /** @class */ (function (_super) {
    __extends(StringASTNodeImpl, _super);
    function StringASTNodeImpl(parent, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = 'string';
        _this.value = '';
        return _this;
    }
    return StringASTNodeImpl;
}(ASTNodeImpl));
export { StringASTNodeImpl };
var PropertyASTNodeImpl = /** @class */ (function (_super) {
    __extends(PropertyASTNodeImpl, _super);
    function PropertyASTNodeImpl(parent, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = 'property';
        _this.colonOffset = -1;
        return _this;
    }
    Object.defineProperty(PropertyASTNodeImpl.prototype, "children", {
        get: function () {
            return this.valueNode ? [this.keyNode, this.valueNode] : [this.keyNode];
        },
        enumerable: true,
        configurable: true
    });
    return PropertyASTNodeImpl;
}(ASTNodeImpl));
export { PropertyASTNodeImpl };
var ObjectASTNodeImpl = /** @class */ (function (_super) {
    __extends(ObjectASTNodeImpl, _super);
    function ObjectASTNodeImpl(parent, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = 'object';
        _this.properties = [];
        return _this;
    }
    Object.defineProperty(ObjectASTNodeImpl.prototype, "children", {
        get: function () {
            return this.properties;
        },
        enumerable: true,
        configurable: true
    });
    return ObjectASTNodeImpl;
}(ASTNodeImpl));
export { ObjectASTNodeImpl };
export function asSchema(schema) {
    if (isBoolean(schema)) {
        return schema ? {} : { not: {} };
    }
    return schema;
}
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
        return ((this.focusOffset === -1 || contains(node, this.focusOffset)) &&
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
    NoOpSchemaCollector.instance = new NoOpSchemaCollector();
    return NoOpSchemaCollector;
}());
var ValidationResult = /** @class */ (function () {
    function ValidationResult(isKubernetes) {
        this.problems = [];
        this.propertiesMatches = 0;
        this.propertiesValueMatches = 0;
        this.primaryValueMatches = 0;
        this.enumValueMatch = false;
        if (isKubernetes) {
            this.enumValues = [];
        }
        else {
            this.enumValues = null;
        }
    }
    ValidationResult.prototype.hasProblems = function () {
        return !!this.problems.length;
    };
    ValidationResult.prototype.mergeAll = function (validationResults) {
        var e_1, _a;
        try {
            for (var validationResults_1 = __values(validationResults), validationResults_1_1 = validationResults_1.next(); !validationResults_1_1.done; validationResults_1_1 = validationResults_1.next()) {
                var validationResult = validationResults_1_1.value;
                this.merge(validationResult);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (validationResults_1_1 && !validationResults_1_1.done && (_a = validationResults_1.return)) _a.call(validationResults_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
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
                        error.message = localize('enumWarning', 'Value is not accepted. Valid values: {0}.', __spread(new Set(this.enumValues)).map(function (v) { return JSON.stringify(v); }).join(', '));
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
            (!propertyValidationResult.hasProblems() &&
                propertyValidationResult.propertiesMatches)) {
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
export function newJSONDocument(root, diagnostics) {
    if (diagnostics === void 0) { diagnostics = []; }
    return new JSONDocument(root, diagnostics, []);
}
// tslint:disable-next-line: no-any
export function getNodeValue(node) {
    return Json.getNodeValue(node);
}
export function getNodePath(node) {
    return Json.getNodePath(node);
}
export function contains(node, offset, includeRightBound) {
    if (includeRightBound === void 0) { includeRightBound = false; }
    return ((offset >= node.offset && offset < node.offset + node.length) ||
        (includeRightBound && offset === node.offset + node.length));
}
var JSONDocument = /** @class */ (function () {
    function JSONDocument(root, syntaxErrors, comments) {
        if (syntaxErrors === void 0) { syntaxErrors = []; }
        if (comments === void 0) { comments = []; }
        this.root = root;
        this.syntaxErrors = syntaxErrors;
        this.comments = comments;
    }
    JSONDocument.prototype.getNodeFromOffset = function (offset, includeRightBound) {
        if (includeRightBound === void 0) { includeRightBound = false; }
        if (this.root) {
            return (Json.findNodeAtOffset(this.root, offset, includeRightBound));
        }
        return void 0;
    };
    JSONDocument.prototype.visit = function (visitor) {
        if (this.root) {
            var doVisit_1 = function (node) {
                var ctn = visitor(node);
                var children = node.children;
                if (Array.isArray(children)) {
                    for (var i = 0; i < children.length && ctn; i++) {
                        ctn = doVisit_1(children[i]);
                    }
                }
                return ctn;
            };
            doVisit_1(this.root);
        }
    };
    JSONDocument.prototype.validate = function (textDocument, schema) {
        if (this.root && schema) {
            var validationResult = new ValidationResult(this.isKubernetes);
            validate(this.root, schema, validationResult, NoOpSchemaCollector.instance, this.isKubernetes);
            return validationResult.problems.map(function (p) {
                var range = Range.create(textDocument.positionAt(p.location.offset), textDocument.positionAt(p.location.offset + p.location.length));
                return Diagnostic.create(range, p.message, p.severity, p.code);
            });
        }
        return null;
    };
    JSONDocument.prototype.getMatchingSchemas = function (schema, focusOffset, exclude) {
        if (focusOffset === void 0) { focusOffset = -1; }
        if (exclude === void 0) { exclude = null; }
        var matchingSchemas = new SchemaCollector(focusOffset, exclude);
        if (this.root && schema) {
            validate(this.root, schema, new ValidationResult(this.isKubernetes), matchingSchemas, this.isKubernetes);
        }
        return matchingSchemas.schemas;
    };
    return JSONDocument;
}());
export { JSONDocument };
function validate(node, schema, validationResult, matchingSchemas, isKubernetes) {
    if (!node || !matchingSchemas.include(node)) {
        return;
    }
    switch (node.type) {
        case 'object':
            _validateObjectNode(node, schema, validationResult, matchingSchemas);
            break;
        case 'array':
            _validateArrayNode(node, schema, validationResult, matchingSchemas);
            break;
        case 'string':
            _validateStringNode(node, schema, validationResult, matchingSchemas);
            break;
        case 'number':
            _validateNumberNode(node, schema, validationResult, matchingSchemas);
            break;
        case 'property':
            return validate(node.valueNode, schema, validationResult, matchingSchemas, isKubernetes);
    }
    _validateNode();
    matchingSchemas.add({ node: node, schema: schema });
    function _validateNode() {
        var e_3, _a, e_4, _b, e_5, _c;
        function matchesType(type) {
            return (node.type === type ||
                (type === 'integer' && node.type === 'number' && node.isInteger));
        }
        if (Array.isArray(schema.type)) {
            if (!schema.type.some(matchesType)) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.errorMessage ||
                        localize('typeArrayMismatchWarning', 'Incorrect type. Expected one of {0}.', schema.type.join(', ')),
                });
            }
        }
        else if (schema.type) {
            if (!matchesType(schema.type)) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.errorMessage ||
                        localize('typeMismatchWarning', 'Incorrect type. Expected "{0}".', schema.type),
                });
            }
        }
        if (Array.isArray(schema.allOf)) {
            try {
                for (var _d = __values(schema.allOf), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var subSchemaRef = _e.value;
                    validate(node, asSchema(subSchemaRef), validationResult, matchingSchemas, isKubernetes);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        var notSchema = asSchema(schema.not);
        if (notSchema) {
            var subValidationResult = new ValidationResult(isKubernetes);
            var subMatchingSchemas = matchingSchemas.newSub();
            validate(node, notSchema, subValidationResult, subMatchingSchemas, isKubernetes);
            if (!subValidationResult.hasProblems()) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('notSchemaWarning', 'Matches a schema that is not allowed.'),
                });
            }
            try {
                for (var _f = __values(subMatchingSchemas.schemas), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var ms = _g.value;
                    ms.inverted = !ms.inverted;
                    matchingSchemas.add(ms);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        var testAlternatives = function (alternatives, maxOneMatch) {
            var e_6, _a;
            var matches = [];
            // remember the best match that is used for error messages
            var bestMatch = null;
            try {
                for (var alternatives_1 = __values(alternatives), alternatives_1_1 = alternatives_1.next(); !alternatives_1_1.done; alternatives_1_1 = alternatives_1.next()) {
                    var subSchemaRef = alternatives_1_1.value;
                    var subSchema = asSchema(subSchemaRef);
                    var subValidationResult = new ValidationResult(isKubernetes);
                    var subMatchingSchemas = matchingSchemas.newSub();
                    validate(node, subSchema, subValidationResult, subMatchingSchemas, isKubernetes);
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
                    else if (isKubernetes) {
                        bestMatch = alternativeComparison(subValidationResult, bestMatch, subSchema, subMatchingSchemas);
                    }
                    else {
                        bestMatch = genericComparison(maxOneMatch, subValidationResult, bestMatch, subSchema, subMatchingSchemas);
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (alternatives_1_1 && !alternatives_1_1.done && (_a = alternatives_1.return)) _a.call(alternatives_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            if (matches.length > 1 && maxOneMatch) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: 1 },
                    severity: DiagnosticSeverity.Warning,
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
        var testBranch = function (schema) {
            var subValidationResult = new ValidationResult(isKubernetes);
            var subMatchingSchemas = matchingSchemas.newSub();
            validate(node, asSchema(schema), subValidationResult, subMatchingSchemas, isKubernetes);
            validationResult.merge(subValidationResult);
            validationResult.propertiesMatches +=
                subValidationResult.propertiesMatches;
            validationResult.propertiesValueMatches +=
                subValidationResult.propertiesValueMatches;
            matchingSchemas.merge(subMatchingSchemas);
        };
        var testCondition = function (ifSchema, thenSchema, elseSchema) {
            var subSchema = asSchema(ifSchema);
            var subValidationResult = new ValidationResult(isKubernetes);
            var subMatchingSchemas = matchingSchemas.newSub();
            validate(node, subSchema, subValidationResult, subMatchingSchemas, isKubernetes);
            matchingSchemas.merge(subMatchingSchemas);
            if (!subValidationResult.hasProblems()) {
                if (thenSchema) {
                    testBranch(thenSchema);
                }
            }
            else if (elseSchema) {
                testBranch(elseSchema);
            }
        };
        var ifSchema = asSchema(schema.if);
        if (ifSchema) {
            testCondition(ifSchema, asSchema(schema.then), asSchema(schema.else));
        }
        if (Array.isArray(schema.enum)) {
            var val = getNodeValue(node);
            var enumValueMatch = false;
            try {
                for (var _h = __values(schema.enum), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var e = _j.value;
                    if (equals(val, e)) {
                        enumValueMatch = true;
                        break;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_5) throw e_5.error; }
            }
            validationResult.enumValues = schema.enum;
            validationResult.enumValueMatch = enumValueMatch;
            if (!enumValueMatch) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    code: ErrorCode.EnumValueMismatch,
                    message: schema.errorMessage ||
                        localize('enumWarning', 'Value is not accepted. Valid values: {0}.', schema.enum.map(function (v) { return JSON.stringify(v); }).join(', ')),
                });
            }
        }
        if (isDefined(schema.const)) {
            var val = getNodeValue(node);
            if (!equals(val, schema.const)) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    code: ErrorCode.EnumValueMismatch,
                    message: schema.errorMessage ||
                        localize('constWarning', 'Value must be {0}.', JSON.stringify(schema.const)),
                });
                validationResult.enumValueMatch = false;
            }
            else {
                validationResult.enumValueMatch = true;
            }
            validationResult.enumValues = [schema.const];
        }
        if (schema.deprecationMessage && node.parent) {
            validationResult.problems.push({
                location: { offset: node.parent.offset, length: node.parent.length },
                severity: DiagnosticSeverity.Warning,
                message: schema.deprecationMessage,
            });
        }
    }
    function _validateNumberNode(node, schema, validationResult, matchingSchemas) {
        var val = node.value;
        if (isNumber(schema.multipleOf)) {
            if (val % schema.multipleOf !== 0) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('multipleOfWarning', 'Value is not divisible by {0}.', schema.multipleOf),
                });
            }
        }
        function getExclusiveLimit(limit, exclusive) {
            if (isNumber(exclusive)) {
                return exclusive;
            }
            if (isBoolean(exclusive) && exclusive) {
                return limit;
            }
            return void 0;
        }
        function getLimit(limit, exclusive) {
            if (!isBoolean(exclusive) || !exclusive) {
                return limit;
            }
            return void 0;
        }
        var exclusiveMinimum = getExclusiveLimit(schema.minimum, schema.exclusiveMinimum);
        if (isNumber(exclusiveMinimum) && val <= exclusiveMinimum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('exclusiveMinimumWarning', 'Value is below the exclusive minimum of {0}.', exclusiveMinimum),
            });
        }
        var exclusiveMaximum = getExclusiveLimit(schema.maximum, schema.exclusiveMaximum);
        if (isNumber(exclusiveMaximum) && val >= exclusiveMaximum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('exclusiveMaximumWarning', 'Value is above the exclusive maximum of {0}.', exclusiveMaximum),
            });
        }
        var minimum = getLimit(schema.minimum, schema.exclusiveMinimum);
        if (isNumber(minimum) && val < minimum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('minimumWarning', 'Value is below the minimum of {0}.', minimum),
            });
        }
        var maximum = getLimit(schema.maximum, schema.exclusiveMaximum);
        if (isNumber(maximum) && val > maximum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('maximumWarning', 'Value is above the maximum of {0}.', maximum),
            });
        }
    }
    function _validateStringNode(node, schema, validationResult, matchingSchemas) {
        if (isNumber(schema.minLength) && node.value.length < schema.minLength) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('minLengthWarning', 'String is shorter than the minimum length of {0}.', schema.minLength),
            });
        }
        if (isNumber(schema.maxLength) && node.value.length > schema.maxLength) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('maxLengthWarning', 'String is longer than the maximum length of {0}.', schema.maxLength),
            });
        }
        if (isString(schema.pattern)) {
            var regex = new RegExp(schema.pattern);
            if (!regex.test(node.value)) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.patternErrorMessage ||
                        schema.errorMessage ||
                        localize('patternWarning', 'String does not match the pattern of "{0}".', schema.pattern),
                });
            }
        }
        if (schema.format) {
            switch (schema.format) {
                case 'uri':
                case 'uri-reference':
                    {
                        var errorMessage = void 0;
                        if (!node.value) {
                            errorMessage = localize('uriEmpty', 'URI expected.');
                        }
                        else {
                            try {
                                var uri = URI.parse(node.value);
                                if (!uri.scheme && schema.format === 'uri') {
                                    errorMessage = localize('uriSchemeMissing', 'URI with a scheme is expected.');
                                }
                            }
                            catch (e) {
                                errorMessage = e.message;
                            }
                        }
                        if (errorMessage) {
                            validationResult.problems.push({
                                location: { offset: node.offset, length: node.length },
                                severity: DiagnosticSeverity.Warning,
                                message: schema.patternErrorMessage ||
                                    schema.errorMessage ||
                                    localize('uriFormatWarning', 'String is not a URI: {0}', errorMessage),
                            });
                        }
                    }
                    break;
                case 'email':
                    {
                        if (!node.value.match(emailPattern)) {
                            validationResult.problems.push({
                                location: { offset: node.offset, length: node.length },
                                severity: DiagnosticSeverity.Warning,
                                message: schema.patternErrorMessage ||
                                    schema.errorMessage ||
                                    localize('emailFormatWarning', 'String is not an e-mail address.'),
                            });
                        }
                    }
                    break;
                case 'color-hex':
                    {
                        if (!node.value.match(colorHexPattern)) {
                            validationResult.problems.push({
                                location: { offset: node.offset, length: node.length },
                                severity: DiagnosticSeverity.Warning,
                                // tslint:disable-next-line: max-line-length
                                message: schema.patternErrorMessage ||
                                    schema.errorMessage ||
                                    localize('colorHexFormatWarning', 'Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA.'),
                            });
                        }
                    }
                    break;
                default:
            }
        }
    }
    function _validateArrayNode(node, schema, validationResult, matchingSchemas) {
        var e_7, _a;
        if (Array.isArray(schema.items)) {
            var subSchemas = schema.items;
            for (var index = 0; index < subSchemas.length; index++) {
                var subSchemaRef = subSchemas[index];
                var subSchema = asSchema(subSchemaRef);
                var itemValidationResult = new ValidationResult(isKubernetes);
                var item = node.items[index];
                if (item) {
                    validate(item, subSchema, itemValidationResult, matchingSchemas, isKubernetes);
                    validationResult.mergePropertyMatch(itemValidationResult);
                    validationResult.mergeEnumValues(itemValidationResult);
                }
                else if (node.items.length >= subSchemas.length) {
                    validationResult.propertiesValueMatches++;
                }
            }
            if (node.items.length > subSchemas.length) {
                if (typeof schema.additionalItems === 'object') {
                    for (var i = subSchemas.length; i < node.items.length; i++) {
                        var itemValidationResult = new ValidationResult(isKubernetes);
                        // tslint:disable-next-line: no-any
                        validate(node.items[i], schema.additionalItems, itemValidationResult, matchingSchemas, isKubernetes);
                        validationResult.mergePropertyMatch(itemValidationResult);
                        validationResult.mergeEnumValues(itemValidationResult);
                    }
                }
                else if (schema.additionalItems === false) {
                    validationResult.problems.push({
                        location: { offset: node.offset, length: node.length },
                        severity: DiagnosticSeverity.Warning,
                        message: localize('additionalItemsWarning', 'Array has too many items according to schema. Expected {0} or fewer.', subSchemas.length),
                    });
                }
            }
        }
        else {
            var itemSchema = asSchema(schema.items);
            if (itemSchema) {
                try {
                    for (var _b = __values(node.items), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var item = _c.value;
                        var itemValidationResult = new ValidationResult(isKubernetes);
                        validate(item, itemSchema, itemValidationResult, matchingSchemas, isKubernetes);
                        validationResult.mergePropertyMatch(itemValidationResult);
                        validationResult.mergeEnumValues(itemValidationResult);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
        }
        var containsSchema = asSchema(schema.contains);
        if (containsSchema) {
            var doesContain = node.items.some(function (item) {
                var itemValidationResult = new ValidationResult(isKubernetes);
                validate(item, containsSchema, itemValidationResult, NoOpSchemaCollector.instance, isKubernetes);
                return !itemValidationResult.hasProblems();
            });
            if (!doesContain) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.errorMessage ||
                        localize('requiredItemMissingWarning', 'Array does not contain required item.'),
                });
            }
        }
        if (isNumber(schema.minItems) && node.items.length < schema.minItems) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('minItemsWarning', 'Array has too few items. Expected {0} or more.', schema.minItems),
            });
        }
        if (isNumber(schema.maxItems) && node.items.length > schema.maxItems) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('maxItemsWarning', 'Array has too many items. Expected {0} or fewer.', schema.maxItems),
            });
        }
        if (schema.uniqueItems === true) {
            var values_1 = getNodeValue(node);
            var duplicates = values_1.some(function (value, index) { return index !== values_1.lastIndexOf(value); });
            if (duplicates) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('uniqueItemsWarning', 'Array has duplicate items.'),
                });
            }
        }
    }
    function _validateObjectNode(node, schema, validationResult, matchingSchemas) {
        var e_8, _a, e_9, _b, e_10, _c, e_11, _d, e_12, _e, e_13, _f, e_14, _g, e_15, _h, e_16, _j, e_17, _k;
        var seenKeys = Object.create(null);
        var unprocessedProperties = [];
        try {
            for (var _l = __values(node.properties), _m = _l.next(); !_m.done; _m = _l.next()) {
                var propertyNode = _m.value;
                var key = propertyNode.keyNode.value;
                seenKeys[key] = propertyNode.valueNode;
                unprocessedProperties.push(key);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_m && !_m.done && (_a = _l.return)) _a.call(_l);
            }
            finally { if (e_8) throw e_8.error; }
        }
        if (Array.isArray(schema.required)) {
            try {
                for (var _o = __values(schema.required), _p = _o.next(); !_p.done; _p = _o.next()) {
                    var propertyName = _p.value;
                    if (!seenKeys[propertyName]) {
                        var keyNode = node.parent &&
                            node.parent.type === 'property' &&
                            node.parent.keyNode;
                        var location_1 = keyNode
                            ? { offset: keyNode.offset, length: keyNode.length }
                            : { offset: node.offset, length: 1 };
                        validationResult.problems.push({
                            location: location_1,
                            severity: DiagnosticSeverity.Warning,
                            message: localize('MissingRequiredPropWarning', 'Missing property "{0}".', propertyName),
                        });
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_p && !_p.done && (_b = _o.return)) _b.call(_o);
                }
                finally { if (e_9) throw e_9.error; }
            }
        }
        var propertyProcessed = function (prop) {
            var index = unprocessedProperties.indexOf(prop);
            while (index >= 0) {
                unprocessedProperties.splice(index, 1);
                index = unprocessedProperties.indexOf(prop);
            }
        };
        if (schema.properties) {
            try {
                for (var _q = __values(Object.keys(schema.properties)), _r = _q.next(); !_r.done; _r = _q.next()) {
                    var propertyName = _r.value;
                    propertyProcessed(propertyName);
                    var propertySchema = schema.properties[propertyName];
                    var child = seenKeys[propertyName];
                    if (child) {
                        if (isBoolean(propertySchema)) {
                            if (!propertySchema) {
                                var propertyNode = child.parent;
                                validationResult.problems.push({
                                    location: {
                                        offset: propertyNode.keyNode.offset,
                                        length: propertyNode.keyNode.length,
                                    },
                                    severity: DiagnosticSeverity.Warning,
                                    message: schema.errorMessage ||
                                        localize('DisallowedExtraPropWarning', 'Property {0} is not allowed.', propertyName),
                                });
                            }
                            else {
                                validationResult.propertiesMatches++;
                                validationResult.propertiesValueMatches++;
                            }
                        }
                        else {
                            var propertyValidationResult = new ValidationResult(isKubernetes);
                            validate(child, propertySchema, propertyValidationResult, matchingSchemas, isKubernetes);
                            validationResult.mergePropertyMatch(propertyValidationResult);
                            validationResult.mergeEnumValues(propertyValidationResult);
                        }
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_r && !_r.done && (_c = _q.return)) _c.call(_q);
                }
                finally { if (e_10) throw e_10.error; }
            }
        }
        if (schema.patternProperties) {
            try {
                for (var _s = __values(Object.keys(schema.patternProperties)), _t = _s.next(); !_t.done; _t = _s.next()) {
                    var propertyPattern = _t.value;
                    var regex = new RegExp(propertyPattern);
                    try {
                        for (var _u = (e_12 = void 0, __values(unprocessedProperties.slice(0))), _v = _u.next(); !_v.done; _v = _u.next()) {
                            var propertyName = _v.value;
                            if (regex.test(propertyName)) {
                                propertyProcessed(propertyName);
                                var child = seenKeys[propertyName];
                                if (child) {
                                    var propertySchema = schema.patternProperties[propertyPattern];
                                    if (isBoolean(propertySchema)) {
                                        if (!propertySchema) {
                                            var propertyNode = child.parent;
                                            validationResult.problems.push({
                                                location: {
                                                    offset: propertyNode.keyNode.offset,
                                                    length: propertyNode.keyNode.length,
                                                },
                                                severity: DiagnosticSeverity.Warning,
                                                message: schema.errorMessage ||
                                                    localize('DisallowedExtraPropWarning', 'Property {0} is not allowed.', propertyName),
                                            });
                                        }
                                        else {
                                            validationResult.propertiesMatches++;
                                            validationResult.propertiesValueMatches++;
                                        }
                                    }
                                    else {
                                        var propertyValidationResult = new ValidationResult(isKubernetes);
                                        validate(child, propertySchema, propertyValidationResult, matchingSchemas, isKubernetes);
                                        validationResult.mergePropertyMatch(propertyValidationResult);
                                        validationResult.mergeEnumValues(propertyValidationResult);
                                    }
                                }
                            }
                        }
                    }
                    catch (e_12_1) { e_12 = { error: e_12_1 }; }
                    finally {
                        try {
                            if (_v && !_v.done && (_e = _u.return)) _e.call(_u);
                        }
                        finally { if (e_12) throw e_12.error; }
                    }
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_t && !_t.done && (_d = _s.return)) _d.call(_s);
                }
                finally { if (e_11) throw e_11.error; }
            }
        }
        if (typeof schema.additionalProperties === 'object') {
            try {
                for (var unprocessedProperties_1 = __values(unprocessedProperties), unprocessedProperties_1_1 = unprocessedProperties_1.next(); !unprocessedProperties_1_1.done; unprocessedProperties_1_1 = unprocessedProperties_1.next()) {
                    var propertyName = unprocessedProperties_1_1.value;
                    var child = seenKeys[propertyName];
                    if (child) {
                        var propertyValidationResult = new ValidationResult(isKubernetes);
                        // tslint:disable-next-line: no-any
                        validate(child, schema.additionalProperties, propertyValidationResult, matchingSchemas, isKubernetes);
                        validationResult.mergePropertyMatch(propertyValidationResult);
                        validationResult.mergeEnumValues(propertyValidationResult);
                    }
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (unprocessedProperties_1_1 && !unprocessedProperties_1_1.done && (_f = unprocessedProperties_1.return)) _f.call(unprocessedProperties_1);
                }
                finally { if (e_13) throw e_13.error; }
            }
        }
        else if (schema.additionalProperties === false) {
            if (unprocessedProperties.length > 0) {
                try {
                    for (var unprocessedProperties_2 = __values(unprocessedProperties), unprocessedProperties_2_1 = unprocessedProperties_2.next(); !unprocessedProperties_2_1.done; unprocessedProperties_2_1 = unprocessedProperties_2.next()) {
                        var propertyName = unprocessedProperties_2_1.value;
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
                                    offset: propertyNode.keyNode.offset,
                                    length: propertyNode.keyNode.length,
                                },
                                severity: DiagnosticSeverity.Warning,
                                message: schema.errorMessage ||
                                    localize('DisallowedExtraPropWarning', 'Property {0} is not allowed.', propertyName),
                            });
                        }
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (unprocessedProperties_2_1 && !unprocessedProperties_2_1.done && (_g = unprocessedProperties_2.return)) _g.call(unprocessedProperties_2);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
            }
        }
        if (isNumber(schema.maxProperties)) {
            if (node.properties.length > schema.maxProperties) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('MaxPropWarning', 'Object has more properties than limit of {0}.', schema.maxProperties),
                });
            }
        }
        if (isNumber(schema.minProperties)) {
            if (node.properties.length < schema.minProperties) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('MinPropWarning', 'Object has fewer properties than the required number of {0}', schema.minProperties),
                });
            }
        }
        if (schema.dependencies) {
            try {
                for (var _w = __values(Object.keys(schema.dependencies)), _x = _w.next(); !_x.done; _x = _w.next()) {
                    var key = _x.value;
                    var prop = seenKeys[key];
                    if (prop) {
                        var propertyDep = schema.dependencies[key];
                        if (Array.isArray(propertyDep)) {
                            try {
                                for (var propertyDep_1 = (e_16 = void 0, __values(propertyDep)), propertyDep_1_1 = propertyDep_1.next(); !propertyDep_1_1.done; propertyDep_1_1 = propertyDep_1.next()) {
                                    var requiredProp = propertyDep_1_1.value;
                                    if (!seenKeys[requiredProp]) {
                                        validationResult.problems.push({
                                            location: { offset: node.offset, length: node.length },
                                            severity: DiagnosticSeverity.Warning,
                                            message: localize('RequiredDependentPropWarning', 'Object is missing property {0} required by property {1}.', requiredProp, key),
                                        });
                                    }
                                    else {
                                        validationResult.propertiesValueMatches++;
                                    }
                                }
                            }
                            catch (e_16_1) { e_16 = { error: e_16_1 }; }
                            finally {
                                try {
                                    if (propertyDep_1_1 && !propertyDep_1_1.done && (_j = propertyDep_1.return)) _j.call(propertyDep_1);
                                }
                                finally { if (e_16) throw e_16.error; }
                            }
                        }
                        else {
                            var propertySchema = asSchema(propertyDep);
                            if (propertySchema) {
                                var propertyValidationResult = new ValidationResult(isKubernetes);
                                validate(node, propertySchema, propertyValidationResult, matchingSchemas, isKubernetes);
                                validationResult.mergePropertyMatch(propertyValidationResult);
                                validationResult.mergeEnumValues(propertyValidationResult);
                            }
                        }
                    }
                }
            }
            catch (e_15_1) { e_15 = { error: e_15_1 }; }
            finally {
                try {
                    if (_x && !_x.done && (_h = _w.return)) _h.call(_w);
                }
                finally { if (e_15) throw e_15.error; }
            }
        }
        var propertyNames = asSchema(schema.propertyNames);
        if (propertyNames) {
            try {
                for (var _y = __values(node.properties), _z = _y.next(); !_z.done; _z = _y.next()) {
                    var f = _z.value;
                    var key = f.keyNode;
                    if (key) {
                        validate(key, propertyNames, validationResult, NoOpSchemaCollector.instance, isKubernetes);
                    }
                }
            }
            catch (e_17_1) { e_17 = { error: e_17_1 }; }
            finally {
                try {
                    if (_z && !_z.done && (_k = _y.return)) _k.call(_y);
                }
                finally { if (e_17) throw e_17.error; }
            }
        }
    }
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
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
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
import { ErrorCode, BooleanASTNode, NullASTNode, ArrayASTNode, NumberASTNode, ObjectASTNode, PropertyASTNode, StringASTNode, JSONDocument, } from './jsonParser04.js';
import * as nls from '../../fillers/vscode-nls.js';
var localize = nls.loadMessageBundle();
import * as Yaml from '../../yaml-ast-parser-custom-tags/index.js';
import { Schema, Type } from '../../../../js-yaml.js';
import { getLineStartPositions, } from '../utils/documentPositionCalculator.js';
import { parseYamlBoolean } from './scalar-type.js';
import { filterInvalidCustomTags } from '../utils/arrUtils.js';
var SingleYAMLDocument = /** @class */ (function (_super) {
    __extends(SingleYAMLDocument, _super);
    function SingleYAMLDocument(lines) {
        var _this = _super.call(this, null, []) || this;
        _this.lines = lines;
        _this.root = null;
        _this.errors = [];
        _this.warnings = [];
        return _this;
    }
    SingleYAMLDocument.prototype.getSchemas = function (schema, doc, node) {
        var matchingSchemas = [];
        doc.validate(schema, matchingSchemas, node.start);
        return matchingSchemas;
    };
    SingleYAMLDocument.prototype.getNodeFromOffset = function (offset) {
        return this.getNodeFromOffsetEndInclusive(offset);
    };
    return SingleYAMLDocument;
}(JSONDocument));
export { SingleYAMLDocument };
function recursivelyBuildAst(parent, node) {
    var e_1, _a, e_2, _b;
    if (!node) {
        return;
    }
    switch (node.kind) {
        case Yaml.Kind.MAP: {
            var instance = node;
            var result = new ObjectASTNode(parent, null, node.startPosition, node.endPosition);
            try {
                for (var _c = __values(instance.mappings), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var mapping = _d.value;
                    result.addProperty(recursivelyBuildAst(result, mapping));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        }
        case Yaml.Kind.MAPPING: {
            var instance = node;
            var key = instance.key;
            // Technically, this is an arbitrary node in YAML
            // I doubt we would get a better string representation by parsing it
            var keyNode = new StringASTNode(null, null, true, key.startPosition, key.endPosition);
            keyNode.value = key.value;
            var result = new PropertyASTNode(parent, keyNode);
            result.end = instance.endPosition;
            var valueNode = instance.value
                ? recursivelyBuildAst(result, instance.value)
                : new NullASTNode(parent, key.value, instance.endPosition, instance.endPosition);
            valueNode.location = key.value;
            result.setValue(valueNode);
            return result;
        }
        case Yaml.Kind.SEQ: {
            var instance = node;
            var result = new ArrayASTNode(parent, null, instance.startPosition, instance.endPosition);
            var count = 0;
            try {
                for (var _e = __values(instance.items), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var item = _f.value;
                    if (item === null && count === instance.items.length - 1) {
                        break;
                    }
                    // Be aware of https://github.com/nodeca/js-yaml/issues/321
                    // Cannot simply work around it here because we need to know if we are in Flow or Block
                    var itemNode = item === null
                        ? new NullASTNode(parent, null, instance.endPosition, instance.endPosition)
                        : recursivelyBuildAst(result, item);
                    itemNode.location = count++;
                    result.addItem(itemNode);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        }
        case Yaml.Kind.SCALAR: {
            var instance = node;
            var type = Yaml.determineScalarType(instance);
            // The name is set either by the sequence or the mapping case.
            var name_1 = null;
            var value = instance.value;
            //This is a patch for redirecting values with these strings to be boolean nodes because its not supported in the parser.
            var possibleBooleanValues = [
                'y',
                'Y',
                'yes',
                'Yes',
                'YES',
                'n',
                'N',
                'no',
                'No',
                'NO',
                'on',
                'On',
                'ON',
                'off',
                'Off',
                'OFF',
            ];
            if (instance.plainScalar &&
                possibleBooleanValues.indexOf(value.toString()) !== -1) {
                return new BooleanASTNode(parent, name_1, parseYamlBoolean(value), node.startPosition, node.endPosition);
            }
            switch (type) {
                case Yaml.ScalarType.null: {
                    return new StringASTNode(parent, name_1, false, instance.startPosition, instance.endPosition);
                }
                case Yaml.ScalarType.bool: {
                    return new BooleanASTNode(parent, name_1, Yaml.parseYamlBoolean(value), node.startPosition, node.endPosition);
                }
                case Yaml.ScalarType.int: {
                    var result = new NumberASTNode(parent, name_1, node.startPosition, node.endPosition);
                    result.value = Yaml.parseYamlInteger(value);
                    result.isInteger = true;
                    return result;
                }
                case Yaml.ScalarType.float: {
                    var result = new NumberASTNode(parent, name_1, node.startPosition, node.endPosition);
                    result.value = Yaml.parseYamlFloat(value);
                    result.isInteger = false;
                    return result;
                }
                case Yaml.ScalarType.string: {
                    var result = new StringASTNode(parent, name_1, false, node.startPosition, node.endPosition);
                    result.value = node.value;
                    return result;
                }
            }
            break;
        }
        case Yaml.Kind.ANCHOR_REF: {
            var instance = node.value;
            return (recursivelyBuildAst(parent, instance) ||
                new NullASTNode(parent, null, node.startPosition, node.endPosition));
        }
        case Yaml.Kind.INCLUDE_REF: {
            var result = new StringASTNode(parent, null, false, node.startPosition, node.endPosition);
            result.value = node.value;
            return result;
        }
    }
}
function convertError(e) {
    return {
        message: "" + e.reason,
        location: {
            start: e.mark.position,
            end: e.mark.position + e.mark.column,
            code: ErrorCode.Undefined,
        },
    };
}
function createJSONDocument(yamlDoc, startPositions, text) {
    var _doc = new SingleYAMLDocument(startPositions);
    _doc.root = recursivelyBuildAst(null, yamlDoc);
    if (!_doc.root) {
        // TODO: When this is true, consider not pushing the other errors.
        _doc.errors.push({
            message: localize('Invalid symbol', 'Expected a YAML object, array or literal'),
            code: ErrorCode.Undefined,
            location: { start: yamlDoc.startPosition, end: yamlDoc.endPosition },
        });
    }
    var duplicateKeyReason = 'duplicate key';
    //Patch ontop of yaml-ast-parser to disable duplicate key message on merge key
    var isDuplicateAndNotMergeKey = function (error, yamlText) {
        var errorConverted = convertError(error);
        var errorStart = errorConverted.location.start;
        var errorEnd = errorConverted.location.end;
        if (error.reason === duplicateKeyReason &&
            yamlText.substring(errorStart, errorEnd).startsWith('<<')) {
            return false;
        }
        return true;
    };
    var errors = yamlDoc.errors
        .filter(function (e) { return e.reason !== duplicateKeyReason && !e.isWarning; })
        .map(function (e) { return convertError(e); });
    var warnings = yamlDoc.errors
        .filter(function (e) {
        return (e.reason === duplicateKeyReason &&
            isDuplicateAndNotMergeKey(e, text)) ||
            e.isWarning;
    })
        .map(function (e) { return convertError(e); });
    errors.forEach(function (e) { return _doc.errors.push(e); });
    warnings.forEach(function (e) { return _doc.warnings.push(e); });
    return _doc;
}
var YAMLDocument = /** @class */ (function () {
    function YAMLDocument(documents) {
        this.documents = documents;
        this.errors = [];
        this.warnings = [];
    }
    return YAMLDocument;
}());
export { YAMLDocument };
export function parse(text, customTags) {
    if (customTags === void 0) { customTags = []; }
    var startPositions = getLineStartPositions(text);
    // This is documented to return a YAMLNode even though the
    // typing only returns a YAMLDocument
    var yamlDocs = [];
    var filteredTags = filterInvalidCustomTags(customTags);
    var schemaWithAdditionalTags = Schema.create(filteredTags.map(function (tag) {
        var typeInfo = tag.split(' ');
        return new Type(typeInfo[0], {
            kind: (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar',
        });
    }));
    /**
     * Collect the additional tags into a map of string to possible tag types
     */
    var tagWithAdditionalItems = new Map();
    filteredTags.forEach(function (tag) {
        var typeInfo = tag.split(' ');
        var tagName = typeInfo[0];
        var tagType = (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar';
        if (tagWithAdditionalItems.has(tagName)) {
            tagWithAdditionalItems.set(tagName, tagWithAdditionalItems.get(tagName).concat([tagType]));
        }
        else {
            tagWithAdditionalItems.set(tagName, [tagType]);
        }
    });
    tagWithAdditionalItems.forEach(function (additionalTagKinds, key) {
        var newTagType = new Type(key, {
            kind: additionalTagKinds[0] || 'scalar',
        });
        newTagType.additionalKinds = additionalTagKinds;
        schemaWithAdditionalTags.compiledTypeMap[key] = newTagType;
    });
    var additionalOptions = {
        schema: schemaWithAdditionalTags,
    };
    Yaml.loadAll(text, function (doc) { return yamlDocs.push(doc); }, additionalOptions);
    return new YAMLDocument(yamlDocs.map(function (doc) { return createJSONDocument(doc, startPositions, text); }));
}

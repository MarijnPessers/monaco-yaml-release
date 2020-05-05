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
import { ResolvedSchema, JSONSchemaService, } from '../../_deps/vscode-json-languageservice/lib/esm/services/jsonSchemaService.js';
import * as nls from '../../fillers/vscode-nls.js';
import { convertSimple2RegExpPattern } from '../utils/strings.js';
var localize = nls.loadMessageBundle();
var FilePatternAssociation = /** @class */ (function () {
    function FilePatternAssociation(pattern) {
        try {
            this.patternRegExp = new RegExp(convertSimple2RegExpPattern(pattern) + '$');
        }
        catch (e) {
            // invalid pattern
            this.patternRegExp = null;
        }
        this.schemas = [];
    }
    FilePatternAssociation.prototype.addSchema = function (id) {
        this.schemas.push(id);
    };
    FilePatternAssociation.prototype.matchesPattern = function (fileName) {
        return this.patternRegExp && this.patternRegExp.test(fileName);
    };
    FilePatternAssociation.prototype.getSchemas = function () {
        return this.schemas;
    };
    return FilePatternAssociation;
}());
export { FilePatternAssociation };
var YAMLSchemaService = /** @class */ (function (_super) {
    __extends(YAMLSchemaService, _super);
    function YAMLSchemaService(requestService, contextService, promiseConstructor) {
        var _this = _super.call(this, requestService, contextService, promiseConstructor) || this;
        _this.customSchemaProvider = undefined;
        return _this;
    }
    YAMLSchemaService.prototype.registerCustomSchemaProvider = function (customSchemaProvider) {
        this.customSchemaProvider = customSchemaProvider;
    };
    //tslint:disable
    YAMLSchemaService.prototype.resolveSchemaContent = function (schemaToResolve, schemaURL, dependencies) {
        var _this = this;
        var resolveErrors = schemaToResolve.errors.slice(0);
        var schema = schemaToResolve.schema;
        var contextService = this.contextService;
        var findSection = function (schema, path) {
            if (!path) {
                return schema;
            }
            var current = schema;
            if (path[0] === '/') {
                path = path.substr(1);
            }
            path.split('/').some(function (part) {
                current = current[part];
                return !current;
            });
            return current;
        };
        var merge = function (target, sourceRoot, sourceURI, path) {
            var section = findSection(sourceRoot, path);
            if (section) {
                for (var key in section) {
                    if (section.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
                        target[key] = section[key];
                    }
                }
            }
            else {
                resolveErrors.push(localize('json.schema.invalidref', "$ref '{0}' in '{1}' can not be resolved.", path, sourceURI));
            }
        };
        var resolveExternalLink = function (node, uri, linkPath, parentSchemaURL, parentSchemaDependencies) {
            if (contextService && !/^\w+:\/\/.*/.test(uri)) {
                uri = contextService.resolveRelativePath(uri, parentSchemaURL);
            }
            uri = _this.normalizeId(uri);
            var referencedHandle = _this.getOrAddSchemaHandle(uri);
            return referencedHandle.getUnresolvedSchema().then(function (unresolvedSchema) {
                parentSchemaDependencies[uri] = true;
                if (unresolvedSchema.errors.length) {
                    var loc = linkPath ? uri + '#' + linkPath : uri;
                    resolveErrors.push(localize('json.schema.problemloadingref', "Problems loading reference '{0}': {1}", loc, unresolvedSchema.errors[0]));
                }
                merge(node, unresolvedSchema.schema, uri, linkPath);
                return resolveRefs(node, unresolvedSchema.schema, uri, referencedHandle.dependencies);
            });
        };
        var resolveRefs = function (node, parentSchema, parentSchemaURL, parentSchemaDependencies) {
            if (!node || typeof node !== 'object') {
                return Promise.resolve(null);
            }
            var toWalk = [node];
            var seen = [];
            var openPromises = [];
            var collectEntries = function () {
                var e_1, _a;
                var entries = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    entries[_i] = arguments[_i];
                }
                try {
                    for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                        var entry = entries_1_1.value;
                        if (typeof entry === 'object') {
                            toWalk.push(entry);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            };
            var collectMapEntries = function () {
                var e_2, _a;
                var maps = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    maps[_i] = arguments[_i];
                }
                try {
                    for (var maps_1 = __values(maps), maps_1_1 = maps_1.next(); !maps_1_1.done; maps_1_1 = maps_1.next()) {
                        var map = maps_1_1.value;
                        if (typeof map === 'object') {
                            for (var key in map) {
                                var entry = map[key];
                                if (typeof entry === 'object') {
                                    toWalk.push(entry);
                                }
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (maps_1_1 && !maps_1_1.done && (_a = maps_1.return)) _a.call(maps_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            };
            var collectArrayEntries = function () {
                var e_3, _a, e_4, _b;
                var arrays = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    arrays[_i] = arguments[_i];
                }
                try {
                    for (var arrays_1 = __values(arrays), arrays_1_1 = arrays_1.next(); !arrays_1_1.done; arrays_1_1 = arrays_1.next()) {
                        var array = arrays_1_1.value;
                        if (Array.isArray(array)) {
                            try {
                                for (var array_1 = (e_4 = void 0, __values(array)), array_1_1 = array_1.next(); !array_1_1.done; array_1_1 = array_1.next()) {
                                    var entry = array_1_1.value;
                                    if (typeof entry === 'object') {
                                        toWalk.push(entry);
                                    }
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (array_1_1 && !array_1_1.done && (_b = array_1.return)) _b.call(array_1);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (arrays_1_1 && !arrays_1_1.done && (_a = arrays_1.return)) _a.call(arrays_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            };
            var handleRef = function (next) {
                var seenRefs = [];
                while (next.$ref) {
                    var ref = next.$ref;
                    var segments = ref.split('#', 2);
                    delete next.$ref;
                    if (segments[0].length > 0) {
                        openPromises.push(resolveExternalLink(next, segments[0], segments[1], parentSchemaURL, parentSchemaDependencies));
                        return;
                    }
                    else {
                        if (seenRefs.indexOf(ref) === -1) {
                            merge(next, parentSchema, parentSchemaURL, segments[1]); // can set next.$ref again, use seenRefs to avoid circle
                            seenRefs.push(ref);
                        }
                    }
                }
                collectEntries(next.items, next.additionalProperties, next.not, next.contains, next.propertyNames, next.if, next.then, next.else);
                collectMapEntries(next.definitions, next.properties, next.patternProperties, next.dependencies);
                collectArrayEntries(next.anyOf, next.allOf, next.oneOf, next.items, next.schemaSequence);
            };
            while (toWalk.length) {
                var next = toWalk.pop();
                if (seen.indexOf(next) >= 0) {
                    continue;
                }
                seen.push(next);
                handleRef(next);
            }
            return Promise.all(openPromises);
        };
        return resolveRefs(schema, schema, schemaURL, dependencies).then(function (_) { return new ResolvedSchema(schema, resolveErrors); });
    };
    //tslint:enable
    YAMLSchemaService.prototype.getSchemaForResource = function (resource, doc) {
        var _this = this;
        if (doc === void 0) { doc = undefined; }
        var resolveSchema = function () {
            var e_5, _a, e_6, _b;
            var seen = Object.create(null);
            var schemas = [];
            try {
                for (var _c = __values(_this.filePatternAssociations), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var entry = _d.value;
                    if (entry.matchesPattern(resource)) {
                        try {
                            for (var _e = (e_6 = void 0, __values(entry.getSchemas())), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var schemaId = _f.value;
                                if (!seen[schemaId]) {
                                    schemas.push(schemaId);
                                    seen[schemaId] = true;
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_5) throw e_5.error; }
            }
            if (schemas.length > 0) {
                return _super.prototype.createCombinedSchema.call(_this, resource, schemas)
                    .getResolvedSchema()
                    .then(function (schema) {
                    if (schema.schema &&
                        schema.schema.schemaSequence &&
                        schema.schema.schemaSequence[doc.currentDocIndex]) {
                        return new ResolvedSchema(schema.schema.schemaSequence[doc.currentDocIndex]);
                    }
                    return schema;
                });
            }
            return Promise.resolve(null);
        };
        if (this.customSchemaProvider) {
            return this.customSchemaProvider(resource)
                .then(function (schemaUri) {
                if (!schemaUri) {
                    return resolveSchema();
                }
                return _this.loadSchema(schemaUri).then(function (unsolvedSchema) {
                    return _this.resolveSchemaContent(unsolvedSchema, schemaUri, []).then(function (schema) {
                        if (schema.schema &&
                            schema.schema.schemaSequence &&
                            schema.schema.schemaSequence[doc.currentDocIndex]) {
                            return new ResolvedSchema(schema.schema.schemaSequence[doc.currentDocIndex]);
                        }
                        return schema;
                    });
                });
            })
                .then(function (schema) { return schema; }, function (err) { return resolveSchema(); });
        }
        else {
            return resolveSchema();
        }
    };
    /**
     * Everything below here is needed because we're importing from vscode-json-languageservice umd and we need
     * to provide a wrapper around the javascript methods we are calling since they have no type
     */
    YAMLSchemaService.prototype.normalizeId = function (id) {
        return _super.prototype.normalizeId.call(this, id);
    };
    YAMLSchemaService.prototype.getOrAddSchemaHandle = function (id, unresolvedSchemaContent) {
        return _super.prototype.getOrAddSchemaHandle.call(this, id, unresolvedSchemaContent);
    };
    // tslint:disable-next-line: no-any
    YAMLSchemaService.prototype.loadSchema = function (schemaUri) {
        return _super.prototype.loadSchema.call(this, schemaUri);
    };
    YAMLSchemaService.prototype.registerExternalSchema = function (uri, filePatterns, unresolvedSchema) {
        return _super.prototype.registerExternalSchema.call(this, uri, filePatterns, unresolvedSchema);
    };
    YAMLSchemaService.prototype.clearExternalSchemas = function () {
        _super.prototype.clearExternalSchemas.call(this);
    };
    YAMLSchemaService.prototype.setSchemaContributions = function (schemaContributions) {
        _super.prototype.setSchemaContributions.call(this, schemaContributions);
    };
    YAMLSchemaService.prototype.getRegisteredSchemaIds = function (filter) {
        return _super.prototype.getRegisteredSchemaIds.call(this, filter);
    };
    YAMLSchemaService.prototype.getResolvedSchema = function (schemaId) {
        return _super.prototype.getResolvedSchema.call(this, schemaId);
    };
    YAMLSchemaService.prototype.onResourceChange = function (uri) {
        return _super.prototype.onResourceChange.call(this, uri);
    };
    return YAMLSchemaService;
}(JSONSchemaService));
export { YAMLSchemaService };

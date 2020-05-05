/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
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
import { parse as parseYAML } from '../parser/yamlParser07.js';
import { JSONDocumentSymbols } from '../../_deps/vscode-json-languageservice/lib/esm/services/jsonDocumentSymbols.js';
var YAMLDocumentSymbols = /** @class */ (function () {
    function YAMLDocumentSymbols(schemaService) {
        this.jsonDocumentSymbols = new JSONDocumentSymbols(schemaService);
    }
    YAMLDocumentSymbols.prototype.findDocumentSymbols = function (document) {
        var e_1, _a;
        var doc = parseYAML(document.getText());
        if (!doc || doc['documents'].length === 0) {
            return null;
        }
        var results = [];
        try {
            for (var _b = __values(doc['documents']), _c = _b.next(); !_c.done; _c = _b.next()) {
                var yamlDoc = _c.value;
                if (yamlDoc.root) {
                    results = results.concat(this.jsonDocumentSymbols.findDocumentSymbols(document, yamlDoc));
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
        return results;
    };
    YAMLDocumentSymbols.prototype.findHierarchicalDocumentSymbols = function (document) {
        var e_2, _a;
        var doc = parseYAML(document.getText());
        if (!doc || doc['documents'].length === 0) {
            return null;
        }
        var results = [];
        try {
            for (var _b = __values(doc['documents']), _c = _b.next(); !_c.done; _c = _b.next()) {
                var yamlDoc = _c.value;
                if (yamlDoc.root) {
                    results = results.concat(this.jsonDocumentSymbols.findDocumentSymbols2(document, yamlDoc));
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
        return results;
    };
    return YAMLDocumentSymbols;
}());
export { YAMLDocumentSymbols };

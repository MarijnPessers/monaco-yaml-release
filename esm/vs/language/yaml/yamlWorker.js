/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var Promise = monaco.Promise;
import * as ls from './_deps/vscode-languageserver-types/main.js';
import * as yamlService from './languageservice/yamlLanguageService.js';
var defaultSchemaRequestService;
if (typeof fetch !== 'undefined') {
    defaultSchemaRequestService = function (url) {
        return fetch(url).then(function (response) { return response.text(); });
    };
}
var YAMLWorker = /** @class */ (function () {
    function YAMLWorker(ctx, createData) {
        var prefix = createData.prefix || '';
        var service = function (url) {
            return defaultSchemaRequestService("" + prefix + url);
        };
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        this._languageService = yamlService.getLanguageService(createData.enableSchemaRequest && service, null, []);
        this._isKubernetes = createData.isKubernetes || false;
        this._languageService.configure(__assign(__assign({}, this._languageSettings), { hover: true, isKubernetes: this._isKubernetes }));
    }
    YAMLWorker.prototype.doValidation = function (uri) {
        var document = this._getTextDocument(uri);
        if (document) {
            return this._languageService.doValidation(document, this._isKubernetes);
        }
        return Promise.as([]);
    };
    YAMLWorker.prototype.doComplete = function (uri, position) {
        var document = this._getTextDocument(uri);
        return this._languageService.doComplete(document, position, this._isKubernetes);
    };
    YAMLWorker.prototype.doResolve = function (item) {
        return this._languageService.doResolve(item);
    };
    YAMLWorker.prototype.doHover = function (uri, position) {
        var document = this._getTextDocument(uri);
        return this._languageService.doHover(document, position);
    };
    YAMLWorker.prototype.format = function (uri, range, options) {
        var document = this._getTextDocument(uri);
        var textEdits = this._languageService.doFormat(document, options);
        return Promise.as(textEdits);
    };
    YAMLWorker.prototype.resetSchema = function (uri) {
        return Promise.as(this._languageService.resetSchema(uri));
    };
    YAMLWorker.prototype.findDocumentSymbols = function (uri) {
        var document = this._getTextDocument(uri);
        var symbols = this._languageService.findDocumentSymbols2(document);
        return Promise.as(symbols);
    };
    YAMLWorker.prototype._getTextDocument = function (uri) {
        var e_1, _a;
        var models = this._ctx.getMirrorModels();
        try {
            for (var models_1 = __values(models), models_1_1 = models_1.next(); !models_1_1.done; models_1_1 = models_1.next()) {
                var model = models_1_1.value;
                if (model.uri.toString() === uri) {
                    return ls.TextDocument.create(uri, this._languageId, model.version, model.getValue());
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (models_1_1 && !models_1_1.done && (_a = models_1.return)) _a.call(models_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    };
    return YAMLWorker;
}());
export { YAMLWorker };
export function create(ctx, createData) {
    return new YAMLWorker(ctx, createData);
}

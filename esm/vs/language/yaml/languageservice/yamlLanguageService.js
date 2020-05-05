/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { YAMLSchemaService, } from './services/yamlSchemaService.js';
import { YAMLDocumentSymbols } from './services/documentSymbols.js';
import { YAMLCompletion } from './services/yamlCompletion.js';
import { YAMLHover } from './services/yamlHover.js';
import { YAMLValidation } from './services/yamlValidation.js';
import { YAMLFormatter } from './services/yamlFormatter.js';
export function getLanguageService(schemaRequestService, workspaceContext, contributions, promiseConstructor) {
    var promise = promiseConstructor || Promise;
    var schemaService = new YAMLSchemaService(schemaRequestService, workspaceContext);
    var completer = new YAMLCompletion(schemaService, contributions, promise);
    var hover = new YAMLHover(schemaService, promise);
    var yamlDocumentSymbols = new YAMLDocumentSymbols(schemaService);
    var yamlValidation = new YAMLValidation(schemaService, promise);
    var formatter = new YAMLFormatter();
    return {
        configure: function (settings) {
            schemaService.clearExternalSchemas();
            if (settings.schemas) {
                settings.schemas.forEach(function (settings) {
                    schemaService.registerExternalSchema(settings.uri, settings.fileMatch, settings.schema);
                });
            }
            yamlValidation.configure(settings);
            hover.configure(settings);
            var customTagsSetting = settings && settings['customTags'] ? settings['customTags'] : [];
            completer.configure(settings, customTagsSetting);
            formatter.configure(settings);
        },
        registerCustomSchemaProvider: function (schemaProvider) {
            schemaService.registerCustomSchemaProvider(schemaProvider);
        },
        doComplete: completer.doComplete.bind(completer),
        doResolve: completer.doResolve.bind(completer),
        doValidation: yamlValidation.doValidation.bind(yamlValidation),
        doHover: hover.doHover.bind(hover),
        findDocumentSymbols: yamlDocumentSymbols.findDocumentSymbols.bind(yamlDocumentSymbols),
        findDocumentSymbols2: yamlDocumentSymbols.findHierarchicalDocumentSymbols.bind(yamlDocumentSymbols),
        resetSchema: function (uri) { return schemaService.onResourceChange(uri); },
        doFormat: formatter.format.bind(formatter),
    };
}

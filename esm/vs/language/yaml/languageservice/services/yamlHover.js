/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { matchOffsetToDocument2 } from '../utils/arrUtils.js';
import { parse as parseYAML } from '../parser/yamlParser07.js';
import { JSONHover } from '../../_deps/vscode-json-languageservice/lib/esm/services/jsonHover.js';
var YAMLHover = /** @class */ (function () {
    function YAMLHover(schemaService, promiseConstructor) {
        this.promise = promiseConstructor || Promise;
        this.shouldHover = true;
        this.jsonHover = new JSONHover(schemaService, [], Promise);
    }
    YAMLHover.prototype.configure = function (languageSettings) {
        if (languageSettings) {
            this.shouldHover = languageSettings.hover;
        }
    };
    YAMLHover.prototype.doHover = function (document, position) {
        if (!this.shouldHover || !document) {
            return this.promise.resolve(void 0);
        }
        var doc = parseYAML(document.getText());
        var offset = document.offsetAt(position);
        var currentDoc = matchOffsetToDocument2(offset, doc);
        if (currentDoc === null) {
            return this.promise.resolve(void 0);
        }
        var currentDocIndex = doc.documents.indexOf(currentDoc);
        currentDoc.currentDocIndex = currentDocIndex;
        return this.jsonHover.doHover(document, position, currentDoc);
    };
    return YAMLHover;
}());
export { YAMLHover };

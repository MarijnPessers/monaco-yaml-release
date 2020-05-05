/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Range, Position, TextEdit, } from '../../_deps/vscode-languageserver-types/main.js';
var YAMLFormatter = /** @class */ (function () {
    function YAMLFormatter() {
        this.formatterEnabled = true;
    }
    YAMLFormatter.prototype.configure = function (shouldFormat) {
        if (shouldFormat) {
            this.formatterEnabled = shouldFormat.format;
        }
    };
    YAMLFormatter.prototype.format = function (document, options) {
        if (!this.formatterEnabled) {
            return [];
        }
        try {
            var prettier = require('prettier/standalone');
            var parser = require('prettier/parser-yaml');
            var text = document.getText();
            var formatted = prettier.format(text, Object.assign(options, { parser: 'yaml', plugins: [parser] }));
            return [
                TextEdit.replace(Range.create(Position.create(0, 0), document.positionAt(text.length)), formatted),
            ];
        }
        catch (error) {
            return [];
        }
    };
    return YAMLFormatter;
}());
export { YAMLFormatter };

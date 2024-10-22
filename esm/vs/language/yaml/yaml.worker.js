/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as worker from '../../editor/editor.worker.js';
import { YAMLWorker } from './yamlWorker.js';
self.onmessage = function () {
    // ignore the first message
    worker.initialize(function (ctx, createData) {
        return new YAMLWorker(ctx, createData);
    });
};

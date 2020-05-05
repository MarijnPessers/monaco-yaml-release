/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
export function insertionPointReturnValue(pt) {
    return -pt - 1;
}
export function binarySearch(array, sought) {
    var lower = 0;
    var upper = array.length - 1;
    while (lower <= upper) {
        var idx = Math.floor((lower + upper) / 2);
        var value = array[idx];
        if (value === sought) {
            return idx;
        }
        if (lower === upper) {
            var insertionPoint = value < sought ? idx + 1 : idx;
            return insertionPointReturnValue(insertionPoint);
        }
        if (sought > value) {
            lower = idx + 1;
        }
        else if (sought < value) {
            upper = idx - 1;
        }
    }
}
export function getLineStartPositions(text) {
    var lineStartPositions = [0];
    for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (c === '\r') {
            // Check for Windows encoding, otherwise we are old Mac
            if (i + 1 < text.length && text[i + 1] === '\n') {
                i++;
            }
            lineStartPositions.push(i + 1);
        }
        else if (c === '\n') {
            lineStartPositions.push(i + 1);
        }
    }
    return lineStartPositions;
}
export function getPosition(pos, lineStartPositions) {
    var line = binarySearch(lineStartPositions, pos);
    if (line < 0) {
        var insertionPoint = -1 * line - 1;
        line = insertionPoint - 1;
    }
    return { line: line, column: pos - lineStartPositions[line] };
}

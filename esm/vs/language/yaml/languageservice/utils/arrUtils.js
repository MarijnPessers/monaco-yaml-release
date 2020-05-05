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
export function removeDuplicates(arr, prop) {
    var new_arr = [];
    var lookup = {};
    for (var i in arr) {
        lookup[arr[i][prop]] = arr[i];
    }
    for (var i in lookup) {
        new_arr.push(lookup[i]);
    }
    return new_arr;
}
export function getLineOffsets(textDocString) {
    var lineOffsets = [];
    var text = textDocString;
    var isLineStart = true;
    for (var i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        var ch = text.charAt(i);
        isLineStart = ch === '\r' || ch === '\n';
        if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}
export function removeDuplicatesObj(objArray) {
    var nonDuplicateSet = new Set();
    var nonDuplicateArr = [];
    for (var obj in objArray) {
        var currObj = objArray[obj];
        var stringifiedObj = JSON.stringify(currObj);
        if (!nonDuplicateSet.has(stringifiedObj)) {
            nonDuplicateArr.push(currObj);
            nonDuplicateSet.add(stringifiedObj);
        }
    }
    return nonDuplicateArr;
}
export function matchOffsetToDocument(offset, jsonDocuments) {
    for (var jsonDoc in jsonDocuments.documents) {
        var currJsonDoc = jsonDocuments.documents[jsonDoc];
        if (currJsonDoc.root &&
            currJsonDoc.root.end >= offset &&
            currJsonDoc.root.start <= offset) {
            return currJsonDoc;
        }
    }
    // TODO: Fix this so that it returns the correct document
    return jsonDocuments.documents[0];
}
export function matchOffsetToDocument2(offset, jsonDocuments) {
    var e_1, _a;
    try {
        for (var _b = __values(jsonDocuments.documents), _c = _b.next(); !_c.done; _c = _b.next()) {
            var jsonDoc = _c.value;
            if (jsonDoc.root &&
                jsonDoc.root.offset <= offset &&
                jsonDoc.root.length + jsonDoc.root.offset >= offset) {
                return jsonDoc;
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
    // TODO: Fix this so that it returns the correct document
    return null;
}
export function filterInvalidCustomTags(customTags) {
    var validCustomTags = ['mapping', 'scalar', 'sequence'];
    return customTags.filter(function (tag) {
        if (typeof tag === 'string') {
            var typeInfo = tag.split(' ');
            var type = (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar';
            // We need to check if map is a type because map will throw an error within the yaml-ast-parser
            if (type === 'map') {
                return false;
            }
            return validCustomTags.indexOf(type) !== -1;
        }
        return false;
    });
}

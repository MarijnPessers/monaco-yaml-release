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
var YAMLException = /** @class */ (function () {
    function YAMLException(reason, mark, isWarning) {
        if (mark === void 0) { mark = null; }
        if (isWarning === void 0) { isWarning = false; }
        this.name = 'YAMLException';
        this.reason = reason;
        this.mark = mark;
        this.message = this.toString(false);
        this.isWarning = isWarning;
    }
    YAMLException.isInstance = function (instance) {
        var e_1, _a;
        if (instance != null &&
            instance.getClassIdentifier &&
            typeof instance.getClassIdentifier == 'function') {
            try {
                for (var _b = __values(instance.getClassIdentifier()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var currentIdentifier = _c.value;
                    if (currentIdentifier == YAMLException.CLASS_IDENTIFIER)
                        return true;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return false;
    };
    YAMLException.prototype.getClassIdentifier = function () {
        var superIdentifiers = [];
        return superIdentifiers.concat(YAMLException.CLASS_IDENTIFIER);
    };
    YAMLException.prototype.toString = function (compact) {
        if (compact === void 0) { compact = false; }
        var result;
        result = 'JS-YAML: ' + (this.reason || '(unknown reason)');
        if (!compact && this.mark) {
            result += ' ' + this.mark.toString();
        }
        return result;
    };
    YAMLException.CLASS_IDENTIFIER = 'yaml-ast-parser.YAMLException';
    return YAMLException;
}());
export default YAMLException;

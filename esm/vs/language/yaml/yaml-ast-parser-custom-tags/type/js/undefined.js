'use strict';
import { Type } from '../../type.js';
function resolveJavascriptUndefined() {
    return true;
}
function constructJavascriptUndefined() {
    /*eslint-disable no-undefined*/
    return undefined;
}
function representJavascriptUndefined() {
    return '';
}
function isUndefined(object) {
    return 'undefined' === typeof object;
}
export default new Type('tag:yaml.org,2002:js/undefined', {
    kind: 'scalar',
    resolve: resolveJavascriptUndefined,
    construct: constructJavascriptUndefined,
    predicate: isUndefined,
    represent: representJavascriptUndefined,
});

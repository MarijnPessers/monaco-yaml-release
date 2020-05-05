// JS-YAML's default schema for `load` function.
// It is not described in the YAML specification.
//
// This schema is based on JS-YAML's default safe schema and includes
// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
//
// Also this schema is used as default base schema at `Schema.create` function.
'use strict';
import { Schema } from '../schema.js';
import defaultSafe from './default_safe.js';
import jsUndefined from '../type/js/undefined.js';
import jsRegexp from '../type/js/regexp.js';
var schema = new Schema({
    include: [defaultSafe],
    explicit: [jsUndefined, jsRegexp],
});
Schema.DEFAULT = schema;
export default schema;

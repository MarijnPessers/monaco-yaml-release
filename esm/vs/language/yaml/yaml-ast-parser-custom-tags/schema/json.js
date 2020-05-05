// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.
'use strict';
import { Schema } from '../schema.js';
import failsafe from './failsafe.js';
import typeNull from '../type/null.js';
import typeBool from '../type/bool.js';
import typeInt from '../type/int.js';
import typeFloat from '../type/float.js';
export default new Schema({
    include: [failsafe],
    implicit: [typeNull, typeBool, typeInt, typeFloat],
});

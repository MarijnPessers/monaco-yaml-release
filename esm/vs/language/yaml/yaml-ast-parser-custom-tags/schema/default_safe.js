// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)
'use strict';
import { Schema } from '../schema.js';
import core from './core.js';
import typeTimestamp from '../type/timestamp.js';
import typeMerge from '../type/merge.js';
import typeBinary from '../type/binary.js';
import typeOmap from '../type/omap.js';
import typePairs from '../type/pairs.js';
import typeSet from '../type/set.js';
var schema = new Schema({
    include: [core],
    implicit: [typeTimestamp, typeMerge],
    explicit: [typeBinary, typeOmap, typePairs, typeSet],
});
export default schema;

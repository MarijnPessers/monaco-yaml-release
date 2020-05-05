// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346
'use strict';
import { Schema } from '../schema.js';
import typeStr from '../type/str.js';
import typeSeq from '../type/seq.js';
import typeMap from '../type/map.js';
export default new Schema({
    explicit: [typeStr, typeSeq, typeMap],
});

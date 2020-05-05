'use strict';
import { Type } from '../type.js';
export default new Type('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: function (data) {
        return null !== data ? data : [];
    },
});

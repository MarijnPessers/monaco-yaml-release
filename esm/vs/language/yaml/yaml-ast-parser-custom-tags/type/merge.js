'use strict';
import { Type } from '../type.js';
function resolveYamlMerge(data) {
    return '<<' === data || null === data;
}
export default new Type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge,
});

/**
 * Created by kor on 06/05/15.
 */
export { load, loadAll, safeLoad, safeLoadAll } from './loader.js';
export { dump, safeDump } from './dumper.js';
export * from './yamlAST.js';
function deprecated(name) {
    return function () {
        throw new Error('Function ' + name + ' is deprecated and cannot be used.');
    };
}
export * from './scalarInference.js';

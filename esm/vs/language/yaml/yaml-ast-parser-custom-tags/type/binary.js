'use strict';
import { Type } from '../type.js';
// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';
function resolveYamlBinary(data) {
    if (null === data) {
        return false;
    }
    var code, idx, bitlen = 0, len = 0, max = data.length, map = BASE64_MAP;
    // Convert one by one.
    for (idx = 0; idx < max; idx++) {
        code = map.indexOf(data.charAt(idx));
        // Skip CR/LF
        if (code > 64) {
            continue;
        }
        // Fail on illegal characters
        if (code < 0) {
            return false;
        }
        bitlen += 6;
    }
    // If there are any bits left, source was corrupted
    return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
    var code, idx, tailbits, input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
    max = input.length, map = BASE64_MAP, bits = 0, result = [];
    // Collect by 6*4 bits (3 bytes)
    for (idx = 0; idx < max; idx++) {
        if (idx % 4 === 0 && idx) {
            result.push((bits >> 16) & 0xff);
            result.push((bits >> 8) & 0xff);
            result.push(bits & 0xff);
        }
        bits = (bits << 6) | map.indexOf(input.charAt(idx));
    }
    // Dump tail
    tailbits = (max % 4) * 6;
    if (tailbits === 0) {
        result.push((bits >> 16) & 0xff);
        result.push((bits >> 8) & 0xff);
        result.push(bits & 0xff);
    }
    else if (tailbits === 18) {
        result.push((bits >> 10) & 0xff);
        result.push((bits >> 2) & 0xff);
    }
    else if (tailbits === 12) {
        result.push((bits >> 4) & 0xff);
    }
    // Wrap into Buffer for NodeJS and leave Array for browser
    if (NodeBuffer) {
        return new NodeBuffer(result);
    }
    return result;
}
function representYamlBinary(object /*, style*/) {
    var result = '', bits = 0, idx, tail, max = object.length, map = BASE64_MAP;
    // Convert every three bytes to 4 ASCII characters.
    for (idx = 0; idx < max; idx++) {
        if (idx % 3 === 0 && idx) {
            result += map[(bits >> 18) & 0x3f];
            result += map[(bits >> 12) & 0x3f];
            result += map[(bits >> 6) & 0x3f];
            result += map[bits & 0x3f];
        }
        bits = (bits << 8) + object[idx];
    }
    // Dump tail
    tail = max % 3;
    if (tail === 0) {
        result += map[(bits >> 18) & 0x3f];
        result += map[(bits >> 12) & 0x3f];
        result += map[(bits >> 6) & 0x3f];
        result += map[bits & 0x3f];
    }
    else if (tail === 2) {
        result += map[(bits >> 10) & 0x3f];
        result += map[(bits >> 4) & 0x3f];
        result += map[(bits << 2) & 0x3f];
        result += map[64];
    }
    else if (tail === 1) {
        result += map[(bits >> 2) & 0x3f];
        result += map[(bits << 4) & 0x3f];
        result += map[64];
        result += map[64];
    }
    return result;
}
function isBinary(object) {
    return NodeBuffer && NodeBuffer.isBuffer(object);
}
export default new Type('tag:yaml.org,2002:binary', {
    kind: 'scalar',
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary,
});

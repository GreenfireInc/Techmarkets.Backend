import require$$0$1, { Buffer as Buffer$2 } from 'node:buffer';
import require$$1 from 'node:crypto';
import require$$0$2 from 'node:fs';
import require$$1$1 from 'node:path';
import require$$3 from 'node:util';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var ed25519 = {};

var random = {};

var system = {};

var browser = {};

// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
Object.defineProperty(browser, "__esModule", { value: true });
browser.BrowserRandomSource = void 0;
const QUOTA = 65536;
class BrowserRandomSource {
    constructor() {
        this.isAvailable = false;
        this.isInstantiated = false;
        const browserCrypto = typeof self !== 'undefined'
            ? (self.crypto || self.msCrypto) // IE11 has msCrypto
            : null;
        if (browserCrypto && browserCrypto.getRandomValues !== undefined) {
            this._crypto = browserCrypto;
            this.isAvailable = true;
            this.isInstantiated = true;
        }
    }
    randomBytes(length) {
        if (!this.isAvailable || !this._crypto) {
            throw new Error("Browser random byte generator is not available.");
        }
        const out = new Uint8Array(length);
        for (let i = 0; i < out.length; i += QUOTA) {
            this._crypto.getRandomValues(out.subarray(i, i + Math.min(out.length - i, QUOTA)));
        }
        return out;
    }
}
browser.BrowserRandomSource = BrowserRandomSource;

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var node = {};

var wipe$1 = {};

// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
Object.defineProperty(wipe$1, "__esModule", { value: true });
/**
 * Sets all values in the given array to zero and returns it.
 *
 * The fact that it sets bytes to zero can be relied on.
 *
 * There is no guarantee that this function makes data disappear from memory,
 * as runtime implementation can, for example, have copying garbage collector
 * that will make copies of sensitive data before we wipe it. Or that an
 * operating system will write our data to swap or sleep image. Another thing
 * is that an optimizing compiler can remove calls to this function or make it
 * no-op. There's nothing we can do with it, so we just do our best and hope
 * that everything will be okay and good will triumph over evil.
 */
function wipe(array) {
    // Right now it's similar to array.fill(0). If it turns
    // out that runtimes optimize this call away, maybe
    // we can try something else.
    for (var i = 0; i < array.length; i++) {
        array[i] = 0;
    }
    return array;
}
wipe$1.wipe = wipe;

// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
Object.defineProperty(node, "__esModule", { value: true });
node.NodeRandomSource = void 0;
const wipe_1 = wipe$1;
class NodeRandomSource {
    constructor() {
        this.isAvailable = false;
        this.isInstantiated = false;
        if (typeof commonjsRequire !== "undefined") {
            const nodeCrypto = require$$1;
            if (nodeCrypto && nodeCrypto.randomBytes) {
                this._crypto = nodeCrypto;
                this.isAvailable = true;
                this.isInstantiated = true;
            }
        }
    }
    randomBytes(length) {
        if (!this.isAvailable || !this._crypto) {
            throw new Error("Node.js random byte generator is not available.");
        }
        // Get random bytes (result is Buffer).
        let buffer = this._crypto.randomBytes(length);
        // Make sure we got the length that we requested.
        if (buffer.length !== length) {
            throw new Error("NodeRandomSource: got fewer bytes than requested");
        }
        // Allocate output array.
        const out = new Uint8Array(length);
        // Copy bytes from buffer to output.
        for (let i = 0; i < out.length; i++) {
            out[i] = buffer[i];
        }
        // Cleanup.
        (0, wipe_1.wipe)(buffer);
        return out;
    }
}
node.NodeRandomSource = NodeRandomSource;

// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
Object.defineProperty(system, "__esModule", { value: true });
system.SystemRandomSource = void 0;
const browser_1 = browser;
const node_1 = node;
class SystemRandomSource {
    constructor() {
        this.isAvailable = false;
        this.name = "";
        // Try browser.
        this._source = new browser_1.BrowserRandomSource();
        if (this._source.isAvailable) {
            this.isAvailable = true;
            this.name = "Browser";
            return;
        }
        // If no browser source, try Node.
        this._source = new node_1.NodeRandomSource();
        if (this._source.isAvailable) {
            this.isAvailable = true;
            this.name = "Node";
            return;
        }
        // No sources, we're out of options.
    }
    randomBytes(length) {
        if (!this.isAvailable) {
            throw new Error("System random byte generator is not available.");
        }
        return this._source.randomBytes(length);
    }
}
system.SystemRandomSource = SystemRandomSource;

var binary = {};

var int = {};

(function (exports) {
	// Copyright (C) 2016 Dmitry Chestnykh
	// MIT License. See LICENSE file for details.
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * Package int provides helper functions for integerss.
	 */
	// Shim using 16-bit pieces.
	function imulShim(a, b) {
	    var ah = (a >>> 16) & 0xffff, al = a & 0xffff;
	    var bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
	    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
	}
	/** 32-bit integer multiplication.  */
	// Use system Math.imul if available, otherwise use our shim.
	exports.mul = Math.imul || imulShim;
	/** 32-bit integer addition.  */
	function add(a, b) {
	    return (a + b) | 0;
	}
	exports.add = add;
	/**  32-bit integer subtraction.  */
	function sub(a, b) {
	    return (a - b) | 0;
	}
	exports.sub = sub;
	/** 32-bit integer left rotation */
	function rotl(x, n) {
	    return x << n | x >>> (32 - n);
	}
	exports.rotl = rotl;
	/** 32-bit integer left rotation */
	function rotr(x, n) {
	    return x << (32 - n) | x >>> n;
	}
	exports.rotr = rotr;
	function isIntegerShim(n) {
	    return typeof n === "number" && isFinite(n) && Math.floor(n) === n;
	}
	/**
	 * Returns true if the argument is an integer number.
	 *
	 * In ES2015, Number.isInteger.
	 */
	exports.isInteger = Number.isInteger || isIntegerShim;
	/**
	 *  Math.pow(2, 53) - 1
	 *
	 *  In ES2015 Number.MAX_SAFE_INTEGER.
	 */
	exports.MAX_SAFE_INTEGER = 9007199254740991;
	/**
	 * Returns true if the argument is a safe integer number
	 * (-MIN_SAFE_INTEGER < number <= MAX_SAFE_INTEGER)
	 *
	 * In ES2015, Number.isSafeInteger.
	 */
	exports.isSafeInteger = function (n) {
	    return exports.isInteger(n) && (n >= -exports.MAX_SAFE_INTEGER && n <= exports.MAX_SAFE_INTEGER);
	};
	
} (int));

// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
Object.defineProperty(binary, "__esModule", { value: true });
/**
 * Package binary provides functions for encoding and decoding numbers in byte arrays.
 */
var int_1 = int;
// TODO(dchest): add asserts for correct value ranges and array offsets.
/**
 * Reads 2 bytes from array starting at offset as big-endian
 * signed 16-bit integer and returns it.
 */
function readInt16BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return (((array[offset + 0] << 8) | array[offset + 1]) << 16) >> 16;
}
binary.readInt16BE = readInt16BE;
/**
 * Reads 2 bytes from array starting at offset as big-endian
 * unsigned 16-bit integer and returns it.
 */
function readUint16BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return ((array[offset + 0] << 8) | array[offset + 1]) >>> 0;
}
binary.readUint16BE = readUint16BE;
/**
 * Reads 2 bytes from array starting at offset as little-endian
 * signed 16-bit integer and returns it.
 */
function readInt16LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return (((array[offset + 1] << 8) | array[offset]) << 16) >> 16;
}
binary.readInt16LE = readInt16LE;
/**
 * Reads 2 bytes from array starting at offset as little-endian
 * unsigned 16-bit integer and returns it.
 */
function readUint16LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return ((array[offset + 1] << 8) | array[offset]) >>> 0;
}
binary.readUint16LE = readUint16LE;
/**
 * Writes 2-byte big-endian representation of 16-bit unsigned
 * value to byte array starting at offset.
 *
 * If byte array is not given, creates a new 2-byte one.
 *
 * Returns the output byte array.
 */
function writeUint16BE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(2); }
    if (offset === void 0) { offset = 0; }
    out[offset + 0] = value >>> 8;
    out[offset + 1] = value >>> 0;
    return out;
}
binary.writeUint16BE = writeUint16BE;
binary.writeInt16BE = writeUint16BE;
/**
 * Writes 2-byte little-endian representation of 16-bit unsigned
 * value to array starting at offset.
 *
 * If byte array is not given, creates a new 2-byte one.
 *
 * Returns the output byte array.
 */
function writeUint16LE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(2); }
    if (offset === void 0) { offset = 0; }
    out[offset + 0] = value >>> 0;
    out[offset + 1] = value >>> 8;
    return out;
}
binary.writeUint16LE = writeUint16LE;
binary.writeInt16LE = writeUint16LE;
/**
 * Reads 4 bytes from array starting at offset as big-endian
 * signed 32-bit integer and returns it.
 */
function readInt32BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return (array[offset] << 24) |
        (array[offset + 1] << 16) |
        (array[offset + 2] << 8) |
        array[offset + 3];
}
binary.readInt32BE = readInt32BE;
/**
 * Reads 4 bytes from array starting at offset as big-endian
 * unsigned 32-bit integer and returns it.
 */
function readUint32BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return ((array[offset] << 24) |
        (array[offset + 1] << 16) |
        (array[offset + 2] << 8) |
        array[offset + 3]) >>> 0;
}
binary.readUint32BE = readUint32BE;
/**
 * Reads 4 bytes from array starting at offset as little-endian
 * signed 32-bit integer and returns it.
 */
function readInt32LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return (array[offset + 3] << 24) |
        (array[offset + 2] << 16) |
        (array[offset + 1] << 8) |
        array[offset];
}
binary.readInt32LE = readInt32LE;
/**
 * Reads 4 bytes from array starting at offset as little-endian
 * unsigned 32-bit integer and returns it.
 */
function readUint32LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    return ((array[offset + 3] << 24) |
        (array[offset + 2] << 16) |
        (array[offset + 1] << 8) |
        array[offset]) >>> 0;
}
binary.readUint32LE = readUint32LE;
/**
 * Writes 4-byte big-endian representation of 32-bit unsigned
 * value to byte array starting at offset.
 *
 * If byte array is not given, creates a new 4-byte one.
 *
 * Returns the output byte array.
 */
function writeUint32BE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(4); }
    if (offset === void 0) { offset = 0; }
    out[offset + 0] = value >>> 24;
    out[offset + 1] = value >>> 16;
    out[offset + 2] = value >>> 8;
    out[offset + 3] = value >>> 0;
    return out;
}
binary.writeUint32BE = writeUint32BE;
binary.writeInt32BE = writeUint32BE;
/**
 * Writes 4-byte little-endian representation of 32-bit unsigned
 * value to array starting at offset.
 *
 * If byte array is not given, creates a new 4-byte one.
 *
 * Returns the output byte array.
 */
function writeUint32LE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(4); }
    if (offset === void 0) { offset = 0; }
    out[offset + 0] = value >>> 0;
    out[offset + 1] = value >>> 8;
    out[offset + 2] = value >>> 16;
    out[offset + 3] = value >>> 24;
    return out;
}
binary.writeUint32LE = writeUint32LE;
binary.writeInt32LE = writeUint32LE;
/**
 * Reads 8 bytes from array starting at offset as big-endian
 * signed 64-bit integer and returns it.
 *
 * IMPORTANT: due to JavaScript limitation, supports exact
 * numbers in range -9007199254740991 to 9007199254740991.
 * If the number stored in the byte array is outside this range,
 * the result is not exact.
 */
function readInt64BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var hi = readInt32BE(array, offset);
    var lo = readInt32BE(array, offset + 4);
    return hi * 0x100000000 + lo - ((lo >> 31) * 0x100000000);
}
binary.readInt64BE = readInt64BE;
/**
 * Reads 8 bytes from array starting at offset as big-endian
 * unsigned 64-bit integer and returns it.
 *
 * IMPORTANT: due to JavaScript limitation, supports values up to 2^53-1.
 */
function readUint64BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var hi = readUint32BE(array, offset);
    var lo = readUint32BE(array, offset + 4);
    return hi * 0x100000000 + lo;
}
binary.readUint64BE = readUint64BE;
/**
 * Reads 8 bytes from array starting at offset as little-endian
 * signed 64-bit integer and returns it.
 *
 * IMPORTANT: due to JavaScript limitation, supports exact
 * numbers in range -9007199254740991 to 9007199254740991.
 * If the number stored in the byte array is outside this range,
 * the result is not exact.
 */
function readInt64LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var lo = readInt32LE(array, offset);
    var hi = readInt32LE(array, offset + 4);
    return hi * 0x100000000 + lo - ((lo >> 31) * 0x100000000);
}
binary.readInt64LE = readInt64LE;
/**
 * Reads 8 bytes from array starting at offset as little-endian
 * unsigned 64-bit integer and returns it.
 *
 * IMPORTANT: due to JavaScript limitation, supports values up to 2^53-1.
 */
function readUint64LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var lo = readUint32LE(array, offset);
    var hi = readUint32LE(array, offset + 4);
    return hi * 0x100000000 + lo;
}
binary.readUint64LE = readUint64LE;
/**
 * Writes 8-byte big-endian representation of 64-bit unsigned
 * value to byte array starting at offset.
 *
 * Due to JavaScript limitation, supports values up to 2^53-1.
 *
 * If byte array is not given, creates a new 8-byte one.
 *
 * Returns the output byte array.
 */
function writeUint64BE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(8); }
    if (offset === void 0) { offset = 0; }
    writeUint32BE(value / 0x100000000 >>> 0, out, offset);
    writeUint32BE(value >>> 0, out, offset + 4);
    return out;
}
binary.writeUint64BE = writeUint64BE;
binary.writeInt64BE = writeUint64BE;
/**
 * Writes 8-byte little-endian representation of 64-bit unsigned
 * value to byte array starting at offset.
 *
 * Due to JavaScript limitation, supports values up to 2^53-1.
 *
 * If byte array is not given, creates a new 8-byte one.
 *
 * Returns the output byte array.
 */
function writeUint64LE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(8); }
    if (offset === void 0) { offset = 0; }
    writeUint32LE(value >>> 0, out, offset);
    writeUint32LE(value / 0x100000000 >>> 0, out, offset + 4);
    return out;
}
binary.writeUint64LE = writeUint64LE;
binary.writeInt64LE = writeUint64LE;
/**
 * Reads bytes from array starting at offset as big-endian
 * unsigned bitLen-bit integer and returns it.
 *
 * Supports bit lengths divisible by 8, up to 48.
 */
function readUintBE(bitLength, array, offset) {
    if (offset === void 0) { offset = 0; }
    // TODO(dchest): implement support for bitLengths non-divisible by 8
    if (bitLength % 8 !== 0) {
        throw new Error("readUintBE supports only bitLengths divisible by 8");
    }
    if (bitLength / 8 > array.length - offset) {
        throw new Error("readUintBE: array is too short for the given bitLength");
    }
    var result = 0;
    var mul = 1;
    for (var i = bitLength / 8 + offset - 1; i >= offset; i--) {
        result += array[i] * mul;
        mul *= 256;
    }
    return result;
}
binary.readUintBE = readUintBE;
/**
 * Reads bytes from array starting at offset as little-endian
 * unsigned bitLen-bit integer and returns it.
 *
 * Supports bit lengths divisible by 8, up to 48.
 */
function readUintLE(bitLength, array, offset) {
    if (offset === void 0) { offset = 0; }
    // TODO(dchest): implement support for bitLengths non-divisible by 8
    if (bitLength % 8 !== 0) {
        throw new Error("readUintLE supports only bitLengths divisible by 8");
    }
    if (bitLength / 8 > array.length - offset) {
        throw new Error("readUintLE: array is too short for the given bitLength");
    }
    var result = 0;
    var mul = 1;
    for (var i = offset; i < offset + bitLength / 8; i++) {
        result += array[i] * mul;
        mul *= 256;
    }
    return result;
}
binary.readUintLE = readUintLE;
/**
 * Writes a big-endian representation of bitLen-bit unsigned
 * value to array starting at offset.
 *
 * Supports bit lengths divisible by 8, up to 48.
 *
 * If byte array is not given, creates a new one.
 *
 * Returns the output byte array.
 */
function writeUintBE(bitLength, value, out, offset) {
    if (out === void 0) { out = new Uint8Array(bitLength / 8); }
    if (offset === void 0) { offset = 0; }
    // TODO(dchest): implement support for bitLengths non-divisible by 8
    if (bitLength % 8 !== 0) {
        throw new Error("writeUintBE supports only bitLengths divisible by 8");
    }
    if (!int_1.isSafeInteger(value)) {
        throw new Error("writeUintBE value must be an integer");
    }
    var div = 1;
    for (var i = bitLength / 8 + offset - 1; i >= offset; i--) {
        out[i] = (value / div) & 0xff;
        div *= 256;
    }
    return out;
}
binary.writeUintBE = writeUintBE;
/**
 * Writes a little-endian representation of bitLen-bit unsigned
 * value to array starting at offset.
 *
 * Supports bit lengths divisible by 8, up to 48.
 *
 * If byte array is not given, creates a new one.
 *
 * Returns the output byte array.
 */
function writeUintLE(bitLength, value, out, offset) {
    if (out === void 0) { out = new Uint8Array(bitLength / 8); }
    if (offset === void 0) { offset = 0; }
    // TODO(dchest): implement support for bitLengths non-divisible by 8
    if (bitLength % 8 !== 0) {
        throw new Error("writeUintLE supports only bitLengths divisible by 8");
    }
    if (!int_1.isSafeInteger(value)) {
        throw new Error("writeUintLE value must be an integer");
    }
    var div = 1;
    for (var i = offset; i < offset + bitLength / 8; i++) {
        out[i] = (value / div) & 0xff;
        div *= 256;
    }
    return out;
}
binary.writeUintLE = writeUintLE;
/**
 * Reads 4 bytes from array starting at offset as big-endian
 * 32-bit floating-point number and returns it.
 */
function readFloat32BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    return view.getFloat32(offset);
}
binary.readFloat32BE = readFloat32BE;
/**
 * Reads 4 bytes from array starting at offset as little-endian
 * 32-bit floating-point number and returns it.
 */
function readFloat32LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    return view.getFloat32(offset, true);
}
binary.readFloat32LE = readFloat32LE;
/**
 * Reads 8 bytes from array starting at offset as big-endian
 * 64-bit floating-point number ("double") and returns it.
 */
function readFloat64BE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    return view.getFloat64(offset);
}
binary.readFloat64BE = readFloat64BE;
/**
 * Reads 8 bytes from array starting at offset as little-endian
 * 64-bit floating-point number ("double") and returns it.
 */
function readFloat64LE(array, offset) {
    if (offset === void 0) { offset = 0; }
    var view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    return view.getFloat64(offset, true);
}
binary.readFloat64LE = readFloat64LE;
/**
 * Writes 4-byte big-endian floating-point representation of value
 * to byte array starting at offset.
 *
 * If byte array is not given, creates a new 4-byte one.
 *
 * Returns the output byte array.
 */
function writeFloat32BE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(4); }
    if (offset === void 0) { offset = 0; }
    var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
    view.setFloat32(offset, value);
    return out;
}
binary.writeFloat32BE = writeFloat32BE;
/**
 * Writes 4-byte little-endian floating-point representation of value
 * to byte array starting at offset.
 *
 * If byte array is not given, creates a new 4-byte one.
 *
 * Returns the output byte array.
 */
function writeFloat32LE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(4); }
    if (offset === void 0) { offset = 0; }
    var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
    view.setFloat32(offset, value, true);
    return out;
}
binary.writeFloat32LE = writeFloat32LE;
/**
 * Writes 8-byte big-endian floating-point representation of value
 * to byte array starting at offset.
 *
 * If byte array is not given, creates a new 8-byte one.
 *
 * Returns the output byte array.
 */
function writeFloat64BE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(8); }
    if (offset === void 0) { offset = 0; }
    var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
    view.setFloat64(offset, value);
    return out;
}
binary.writeFloat64BE = writeFloat64BE;
/**
 * Writes 8-byte little-endian floating-point representation of value
 * to byte array starting at offset.
 *
 * If byte array is not given, creates a new 8-byte one.
 *
 * Returns the output byte array.
 */
function writeFloat64LE(value, out, offset) {
    if (out === void 0) { out = new Uint8Array(8); }
    if (offset === void 0) { offset = 0; }
    var view = new DataView(out.buffer, out.byteOffset, out.byteLength);
    view.setFloat64(offset, value, true);
    return out;
}
binary.writeFloat64LE = writeFloat64LE;

(function (exports) {
	// Copyright (C) 2016 Dmitry Chestnykh
	// MIT License. See LICENSE file for details.
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.randomStringForEntropy = exports.randomString = exports.randomUint32 = exports.randomBytes = exports.defaultRandomSource = void 0;
	const system_1 = system;
	const binary_1 = binary;
	const wipe_1 = wipe$1;
	exports.defaultRandomSource = new system_1.SystemRandomSource();
	function randomBytes(length, prng = exports.defaultRandomSource) {
	    return prng.randomBytes(length);
	}
	exports.randomBytes = randomBytes;
	/**
	 * Returns a uniformly random unsigned 32-bit integer.
	 */
	function randomUint32(prng = exports.defaultRandomSource) {
	    // Generate 4-byte random buffer.
	    const buf = randomBytes(4, prng);
	    // Convert bytes from buffer into a 32-bit integer.
	    // It's not important which byte order to use, since
	    // the result is random.
	    const result = (0, binary_1.readUint32LE)(buf);
	    // Clean the buffer.
	    (0, wipe_1.wipe)(buf);
	    return result;
	}
	exports.randomUint32 = randomUint32;
	/** 62 alphanumeric characters for default charset of randomString() */
	const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	/**
	 * Returns a uniform random string of the given length
	 * with characters from the given charset.
	 *
	 * Charset must not have more than 256 characters.
	 *
	 * Default charset generates case-sensitive alphanumeric
	 * strings (0-9, A-Z, a-z).
	 */
	function randomString(length, charset = ALPHANUMERIC, prng = exports.defaultRandomSource) {
	    if (charset.length < 2) {
	        throw new Error("randomString charset is too short");
	    }
	    if (charset.length > 256) {
	        throw new Error("randomString charset is too long");
	    }
	    let out = '';
	    const charsLen = charset.length;
	    const maxByte = 256 - (256 % charsLen);
	    while (length > 0) {
	        const buf = randomBytes(Math.ceil(length * 256 / maxByte), prng);
	        for (let i = 0; i < buf.length && length > 0; i++) {
	            const randomByte = buf[i];
	            if (randomByte < maxByte) {
	                out += charset.charAt(randomByte % charsLen);
	                length--;
	            }
	        }
	        (0, wipe_1.wipe)(buf);
	    }
	    return out;
	}
	exports.randomString = randomString;
	/**
	 * Returns uniform random string containing at least the given
	 * number of bits of entropy.
	 *
	 * For example, randomStringForEntropy(128) will return a 22-character
	 * alphanumeric string, while randomStringForEntropy(128, "0123456789")
	 * will return a 39-character numeric string, both will contain at
	 * least 128 bits of entropy.
	 *
	 * Default charset generates case-sensitive alphanumeric
	 * strings (0-9, A-Z, a-z).
	 */
	function randomStringForEntropy(bits, charset = ALPHANUMERIC, prng = exports.defaultRandomSource) {
	    const length = Math.ceil(bits / (Math.log(charset.length) / Math.LN2));
	    return randomString(length, charset, prng);
	}
	exports.randomStringForEntropy = randomStringForEntropy;
	
} (random));

var sha512 = {};

(function (exports) {
	// Copyright (C) 2016 Dmitry Chestnykh
	// MIT License. See LICENSE file for details.
	Object.defineProperty(exports, "__esModule", { value: true });
	var binary_1 = binary;
	var wipe_1 = wipe$1;
	exports.DIGEST_LENGTH = 64;
	exports.BLOCK_SIZE = 128;
	/**
	 * SHA-2-512 cryptographic hash algorithm.
	 */
	var SHA512 = /** @class */ (function () {
	    function SHA512() {
	        /** Length of hash output */
	        this.digestLength = exports.DIGEST_LENGTH;
	        /** Block size */
	        this.blockSize = exports.BLOCK_SIZE;
	        // Note: Int32Array is used instead of Uint32Array for performance reasons.
	        this._stateHi = new Int32Array(8); // hash state, high bytes
	        this._stateLo = new Int32Array(8); // hash state, low bytes
	        this._tempHi = new Int32Array(16); // temporary state, high bytes
	        this._tempLo = new Int32Array(16); // temporary state, low bytes
	        this._buffer = new Uint8Array(256); // buffer for data to hash
	        this._bufferLength = 0; // number of bytes in buffer
	        this._bytesHashed = 0; // number of total bytes hashed
	        this._finished = false; // indicates whether the hash was finalized
	        this.reset();
	    }
	    SHA512.prototype._initState = function () {
	        this._stateHi[0] = 0x6a09e667;
	        this._stateHi[1] = 0xbb67ae85;
	        this._stateHi[2] = 0x3c6ef372;
	        this._stateHi[3] = 0xa54ff53a;
	        this._stateHi[4] = 0x510e527f;
	        this._stateHi[5] = 0x9b05688c;
	        this._stateHi[6] = 0x1f83d9ab;
	        this._stateHi[7] = 0x5be0cd19;
	        this._stateLo[0] = 0xf3bcc908;
	        this._stateLo[1] = 0x84caa73b;
	        this._stateLo[2] = 0xfe94f82b;
	        this._stateLo[3] = 0x5f1d36f1;
	        this._stateLo[4] = 0xade682d1;
	        this._stateLo[5] = 0x2b3e6c1f;
	        this._stateLo[6] = 0xfb41bd6b;
	        this._stateLo[7] = 0x137e2179;
	    };
	    /**
	     * Resets hash state making it possible
	     * to re-use this instance to hash other data.
	     */
	    SHA512.prototype.reset = function () {
	        this._initState();
	        this._bufferLength = 0;
	        this._bytesHashed = 0;
	        this._finished = false;
	        return this;
	    };
	    /**
	     * Cleans internal buffers and resets hash state.
	     */
	    SHA512.prototype.clean = function () {
	        wipe_1.wipe(this._buffer);
	        wipe_1.wipe(this._tempHi);
	        wipe_1.wipe(this._tempLo);
	        this.reset();
	    };
	    /**
	     * Updates hash state with the given data.
	     *
	     * Throws error when trying to update already finalized hash:
	     * instance must be reset to update it again.
	     */
	    SHA512.prototype.update = function (data, dataLength) {
	        if (dataLength === void 0) { dataLength = data.length; }
	        if (this._finished) {
	            throw new Error("SHA512: can't update because hash was finished.");
	        }
	        var dataPos = 0;
	        this._bytesHashed += dataLength;
	        if (this._bufferLength > 0) {
	            while (this._bufferLength < exports.BLOCK_SIZE && dataLength > 0) {
	                this._buffer[this._bufferLength++] = data[dataPos++];
	                dataLength--;
	            }
	            if (this._bufferLength === this.blockSize) {
	                hashBlocks(this._tempHi, this._tempLo, this._stateHi, this._stateLo, this._buffer, 0, this.blockSize);
	                this._bufferLength = 0;
	            }
	        }
	        if (dataLength >= this.blockSize) {
	            dataPos = hashBlocks(this._tempHi, this._tempLo, this._stateHi, this._stateLo, data, dataPos, dataLength);
	            dataLength %= this.blockSize;
	        }
	        while (dataLength > 0) {
	            this._buffer[this._bufferLength++] = data[dataPos++];
	            dataLength--;
	        }
	        return this;
	    };
	    /**
	     * Finalizes hash state and puts hash into out.
	     * If hash was already finalized, puts the same value.
	     */
	    SHA512.prototype.finish = function (out) {
	        if (!this._finished) {
	            var bytesHashed = this._bytesHashed;
	            var left = this._bufferLength;
	            var bitLenHi = (bytesHashed / 0x20000000) | 0;
	            var bitLenLo = bytesHashed << 3;
	            var padLength = (bytesHashed % 128 < 112) ? 128 : 256;
	            this._buffer[left] = 0x80;
	            for (var i = left + 1; i < padLength - 8; i++) {
	                this._buffer[i] = 0;
	            }
	            binary_1.writeUint32BE(bitLenHi, this._buffer, padLength - 8);
	            binary_1.writeUint32BE(bitLenLo, this._buffer, padLength - 4);
	            hashBlocks(this._tempHi, this._tempLo, this._stateHi, this._stateLo, this._buffer, 0, padLength);
	            this._finished = true;
	        }
	        for (var i = 0; i < this.digestLength / 8; i++) {
	            binary_1.writeUint32BE(this._stateHi[i], out, i * 8);
	            binary_1.writeUint32BE(this._stateLo[i], out, i * 8 + 4);
	        }
	        return this;
	    };
	    /**
	     * Returns the final hash digest.
	     */
	    SHA512.prototype.digest = function () {
	        var out = new Uint8Array(this.digestLength);
	        this.finish(out);
	        return out;
	    };
	    /**
	     * Function useful for HMAC/PBKDF2 optimization. Returns hash state to be
	     * used with restoreState(). Only chain value is saved, not buffers or
	     * other state variables.
	     */
	    SHA512.prototype.saveState = function () {
	        if (this._finished) {
	            throw new Error("SHA256: cannot save finished state");
	        }
	        return {
	            stateHi: new Int32Array(this._stateHi),
	            stateLo: new Int32Array(this._stateLo),
	            buffer: this._bufferLength > 0 ? new Uint8Array(this._buffer) : undefined,
	            bufferLength: this._bufferLength,
	            bytesHashed: this._bytesHashed
	        };
	    };
	    /**
	     * Function useful for HMAC/PBKDF2 optimization. Restores state saved by
	     * saveState() and sets bytesHashed to the given value.
	     */
	    SHA512.prototype.restoreState = function (savedState) {
	        this._stateHi.set(savedState.stateHi);
	        this._stateLo.set(savedState.stateLo);
	        this._bufferLength = savedState.bufferLength;
	        if (savedState.buffer) {
	            this._buffer.set(savedState.buffer);
	        }
	        this._bytesHashed = savedState.bytesHashed;
	        this._finished = false;
	        return this;
	    };
	    /**
	     * Cleans state returned by saveState().
	     */
	    SHA512.prototype.cleanSavedState = function (savedState) {
	        wipe_1.wipe(savedState.stateHi);
	        wipe_1.wipe(savedState.stateLo);
	        if (savedState.buffer) {
	            wipe_1.wipe(savedState.buffer);
	        }
	        savedState.bufferLength = 0;
	        savedState.bytesHashed = 0;
	    };
	    return SHA512;
	}());
	exports.SHA512 = SHA512;
	// Constants
	var K = new Int32Array([
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	]);
	function hashBlocks(wh, wl, hh, hl, m, pos, len) {
	    var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
	    var h, l;
	    var th, tl;
	    var a, b, c, d;
	    while (len >= 128) {
	        for (var i = 0; i < 16; i++) {
	            var j = 8 * i + pos;
	            wh[i] = binary_1.readUint32BE(m, j);
	            wl[i] = binary_1.readUint32BE(m, j + 4);
	        }
	        for (var i = 0; i < 80; i++) {
	            var bh0 = ah0;
	            var bh1 = ah1;
	            var bh2 = ah2;
	            var bh3 = ah3;
	            var bh4 = ah4;
	            var bh5 = ah5;
	            var bh6 = ah6;
	            var bh7 = ah7;
	            var bl0 = al0;
	            var bl1 = al1;
	            var bl2 = al2;
	            var bl3 = al3;
	            var bl4 = al4;
	            var bl5 = al5;
	            var bl6 = al6;
	            var bl7 = al7;
	            // add
	            h = ah7;
	            l = al7;
	            a = l & 0xffff;
	            b = l >>> 16;
	            c = h & 0xffff;
	            d = h >>> 16;
	            // Sigma1
	            h = ((ah4 >>> 14) | (al4 << (32 - 14))) ^ ((ah4 >>> 18) |
	                (al4 << (32 - 18))) ^ ((al4 >>> (41 - 32)) | (ah4 << (32 - (41 - 32))));
	            l = ((al4 >>> 14) | (ah4 << (32 - 14))) ^ ((al4 >>> 18) |
	                (ah4 << (32 - 18))) ^ ((ah4 >>> (41 - 32)) | (al4 << (32 - (41 - 32))));
	            a += l & 0xffff;
	            b += l >>> 16;
	            c += h & 0xffff;
	            d += h >>> 16;
	            // Ch
	            h = (ah4 & ah5) ^ (~ah4 & ah6);
	            l = (al4 & al5) ^ (~al4 & al6);
	            a += l & 0xffff;
	            b += l >>> 16;
	            c += h & 0xffff;
	            d += h >>> 16;
	            // K
	            h = K[i * 2];
	            l = K[i * 2 + 1];
	            a += l & 0xffff;
	            b += l >>> 16;
	            c += h & 0xffff;
	            d += h >>> 16;
	            // w
	            h = wh[i % 16];
	            l = wl[i % 16];
	            a += l & 0xffff;
	            b += l >>> 16;
	            c += h & 0xffff;
	            d += h >>> 16;
	            b += a >>> 16;
	            c += b >>> 16;
	            d += c >>> 16;
	            th = c & 0xffff | d << 16;
	            tl = a & 0xffff | b << 16;
	            // add
	            h = th;
	            l = tl;
	            a = l & 0xffff;
	            b = l >>> 16;
	            c = h & 0xffff;
	            d = h >>> 16;
	            // Sigma0
	            h = ((ah0 >>> 28) | (al0 << (32 - 28))) ^ ((al0 >>> (34 - 32)) |
	                (ah0 << (32 - (34 - 32)))) ^ ((al0 >>> (39 - 32)) | (ah0 << (32 - (39 - 32))));
	            l = ((al0 >>> 28) | (ah0 << (32 - 28))) ^ ((ah0 >>> (34 - 32)) |
	                (al0 << (32 - (34 - 32)))) ^ ((ah0 >>> (39 - 32)) | (al0 << (32 - (39 - 32))));
	            a += l & 0xffff;
	            b += l >>> 16;
	            c += h & 0xffff;
	            d += h >>> 16;
	            // Maj
	            h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
	            l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);
	            a += l & 0xffff;
	            b += l >>> 16;
	            c += h & 0xffff;
	            d += h >>> 16;
	            b += a >>> 16;
	            c += b >>> 16;
	            d += c >>> 16;
	            bh7 = (c & 0xffff) | (d << 16);
	            bl7 = (a & 0xffff) | (b << 16);
	            // add
	            h = bh3;
	            l = bl3;
	            a = l & 0xffff;
	            b = l >>> 16;
	            c = h & 0xffff;
	            d = h >>> 16;
	            h = th;
	            l = tl;
	            a += l & 0xffff;
	            b += l >>> 16;
	            c += h & 0xffff;
	            d += h >>> 16;
	            b += a >>> 16;
	            c += b >>> 16;
	            d += c >>> 16;
	            bh3 = (c & 0xffff) | (d << 16);
	            bl3 = (a & 0xffff) | (b << 16);
	            ah1 = bh0;
	            ah2 = bh1;
	            ah3 = bh2;
	            ah4 = bh3;
	            ah5 = bh4;
	            ah6 = bh5;
	            ah7 = bh6;
	            ah0 = bh7;
	            al1 = bl0;
	            al2 = bl1;
	            al3 = bl2;
	            al4 = bl3;
	            al5 = bl4;
	            al6 = bl5;
	            al7 = bl6;
	            al0 = bl7;
	            if (i % 16 === 15) {
	                for (var j = 0; j < 16; j++) {
	                    // add
	                    h = wh[j];
	                    l = wl[j];
	                    a = l & 0xffff;
	                    b = l >>> 16;
	                    c = h & 0xffff;
	                    d = h >>> 16;
	                    h = wh[(j + 9) % 16];
	                    l = wl[(j + 9) % 16];
	                    a += l & 0xffff;
	                    b += l >>> 16;
	                    c += h & 0xffff;
	                    d += h >>> 16;
	                    // sigma0
	                    th = wh[(j + 1) % 16];
	                    tl = wl[(j + 1) % 16];
	                    h = ((th >>> 1) | (tl << (32 - 1))) ^ ((th >>> 8) |
	                        (tl << (32 - 8))) ^ (th >>> 7);
	                    l = ((tl >>> 1) | (th << (32 - 1))) ^ ((tl >>> 8) |
	                        (th << (32 - 8))) ^ ((tl >>> 7) | (th << (32 - 7)));
	                    a += l & 0xffff;
	                    b += l >>> 16;
	                    c += h & 0xffff;
	                    d += h >>> 16;
	                    // sigma1
	                    th = wh[(j + 14) % 16];
	                    tl = wl[(j + 14) % 16];
	                    h = ((th >>> 19) | (tl << (32 - 19))) ^ ((tl >>> (61 - 32)) |
	                        (th << (32 - (61 - 32)))) ^ (th >>> 6);
	                    l = ((tl >>> 19) | (th << (32 - 19))) ^ ((th >>> (61 - 32)) |
	                        (tl << (32 - (61 - 32)))) ^ ((tl >>> 6) | (th << (32 - 6)));
	                    a += l & 0xffff;
	                    b += l >>> 16;
	                    c += h & 0xffff;
	                    d += h >>> 16;
	                    b += a >>> 16;
	                    c += b >>> 16;
	                    d += c >>> 16;
	                    wh[j] = (c & 0xffff) | (d << 16);
	                    wl[j] = (a & 0xffff) | (b << 16);
	                }
	            }
	        }
	        // add
	        h = ah0;
	        l = al0;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[0];
	        l = hl[0];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[0] = ah0 = (c & 0xffff) | (d << 16);
	        hl[0] = al0 = (a & 0xffff) | (b << 16);
	        h = ah1;
	        l = al1;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[1];
	        l = hl[1];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[1] = ah1 = (c & 0xffff) | (d << 16);
	        hl[1] = al1 = (a & 0xffff) | (b << 16);
	        h = ah2;
	        l = al2;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[2];
	        l = hl[2];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[2] = ah2 = (c & 0xffff) | (d << 16);
	        hl[2] = al2 = (a & 0xffff) | (b << 16);
	        h = ah3;
	        l = al3;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[3];
	        l = hl[3];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[3] = ah3 = (c & 0xffff) | (d << 16);
	        hl[3] = al3 = (a & 0xffff) | (b << 16);
	        h = ah4;
	        l = al4;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[4];
	        l = hl[4];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[4] = ah4 = (c & 0xffff) | (d << 16);
	        hl[4] = al4 = (a & 0xffff) | (b << 16);
	        h = ah5;
	        l = al5;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[5];
	        l = hl[5];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[5] = ah5 = (c & 0xffff) | (d << 16);
	        hl[5] = al5 = (a & 0xffff) | (b << 16);
	        h = ah6;
	        l = al6;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[6];
	        l = hl[6];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[6] = ah6 = (c & 0xffff) | (d << 16);
	        hl[6] = al6 = (a & 0xffff) | (b << 16);
	        h = ah7;
	        l = al7;
	        a = l & 0xffff;
	        b = l >>> 16;
	        c = h & 0xffff;
	        d = h >>> 16;
	        h = hh[7];
	        l = hl[7];
	        a += l & 0xffff;
	        b += l >>> 16;
	        c += h & 0xffff;
	        d += h >>> 16;
	        b += a >>> 16;
	        c += b >>> 16;
	        d += c >>> 16;
	        hh[7] = ah7 = (c & 0xffff) | (d << 16);
	        hl[7] = al7 = (a & 0xffff) | (b << 16);
	        pos += 128;
	        len -= 128;
	    }
	    return pos;
	}
	function hash(data) {
	    var h = new SHA512();
	    h.update(data);
	    var digest = h.digest();
	    h.clean();
	    return digest;
	}
	exports.hash = hash;
	
} (sha512));

(function (exports) {
	// Copyright (C) 2016 Dmitry Chestnykh
	// MIT License. See LICENSE file for details.
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.convertSecretKeyToX25519 = exports.convertPublicKeyToX25519 = exports.verify = exports.sign = exports.extractPublicKeyFromSecretKey = exports.generateKeyPair = exports.generateKeyPairFromSeed = exports.SEED_LENGTH = exports.SECRET_KEY_LENGTH = exports.PUBLIC_KEY_LENGTH = exports.SIGNATURE_LENGTH = void 0;
	/**
	 * Package ed25519 implements Ed25519 public-key signature algorithm.
	 */
	const random_1 = random;
	const sha512_1 = sha512;
	const wipe_1 = wipe$1;
	exports.SIGNATURE_LENGTH = 64;
	exports.PUBLIC_KEY_LENGTH = 32;
	exports.SECRET_KEY_LENGTH = 64;
	exports.SEED_LENGTH = 32;
	// Returns new zero-filled 16-element GF (Float64Array).
	// If passed an array of numbers, prefills the returned
	// array with them.
	//
	// We use Float64Array, because we need 48-bit numbers
	// for this implementation.
	function gf(init) {
	    const r = new Float64Array(16);
	    if (init) {
	        for (let i = 0; i < init.length; i++) {
	            r[i] = init[i];
	        }
	    }
	    return r;
	}
	// Base point.
	const _9 = new Uint8Array(32);
	_9[0] = 9;
	const gf0 = gf();
	const gf1 = gf([1]);
	const D = gf([
	    0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
	    0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203
	]);
	const D2 = gf([
	    0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
	    0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406
	]);
	const X = gf([
	    0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
	    0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169
	]);
	const Y = gf([
	    0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
	    0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666
	]);
	const I = gf([
	    0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
	    0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83
	]);
	function set25519(r, a) {
	    for (let i = 0; i < 16; i++) {
	        r[i] = a[i] | 0;
	    }
	}
	function car25519(o) {
	    let c = 1;
	    for (let i = 0; i < 16; i++) {
	        let v = o[i] + c + 65535;
	        c = Math.floor(v / 65536);
	        o[i] = v - c * 65536;
	    }
	    o[0] += c - 1 + 37 * (c - 1);
	}
	function sel25519(p, q, b) {
	    const c = ~(b - 1);
	    for (let i = 0; i < 16; i++) {
	        const t = c & (p[i] ^ q[i]);
	        p[i] ^= t;
	        q[i] ^= t;
	    }
	}
	function pack25519(o, n) {
	    const m = gf();
	    const t = gf();
	    for (let i = 0; i < 16; i++) {
	        t[i] = n[i];
	    }
	    car25519(t);
	    car25519(t);
	    car25519(t);
	    for (let j = 0; j < 2; j++) {
	        m[0] = t[0] - 0xffed;
	        for (let i = 1; i < 15; i++) {
	            m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1);
	            m[i - 1] &= 0xffff;
	        }
	        m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1);
	        const b = (m[15] >> 16) & 1;
	        m[14] &= 0xffff;
	        sel25519(t, m, 1 - b);
	    }
	    for (let i = 0; i < 16; i++) {
	        o[2 * i] = t[i] & 0xff;
	        o[2 * i + 1] = t[i] >> 8;
	    }
	}
	function verify32(x, y) {
	    let d = 0;
	    for (let i = 0; i < 32; i++) {
	        d |= x[i] ^ y[i];
	    }
	    return (1 & ((d - 1) >>> 8)) - 1;
	}
	function neq25519(a, b) {
	    const c = new Uint8Array(32);
	    const d = new Uint8Array(32);
	    pack25519(c, a);
	    pack25519(d, b);
	    return verify32(c, d);
	}
	function par25519(a) {
	    const d = new Uint8Array(32);
	    pack25519(d, a);
	    return d[0] & 1;
	}
	function unpack25519(o, n) {
	    for (let i = 0; i < 16; i++) {
	        o[i] = n[2 * i] + (n[2 * i + 1] << 8);
	    }
	    o[15] &= 0x7fff;
	}
	function add(o, a, b) {
	    for (let i = 0; i < 16; i++) {
	        o[i] = a[i] + b[i];
	    }
	}
	function sub(o, a, b) {
	    for (let i = 0; i < 16; i++) {
	        o[i] = a[i] - b[i];
	    }
	}
	function mul(o, a, b) {
	    let v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
	    v = a[0];
	    t0 += v * b0;
	    t1 += v * b1;
	    t2 += v * b2;
	    t3 += v * b3;
	    t4 += v * b4;
	    t5 += v * b5;
	    t6 += v * b6;
	    t7 += v * b7;
	    t8 += v * b8;
	    t9 += v * b9;
	    t10 += v * b10;
	    t11 += v * b11;
	    t12 += v * b12;
	    t13 += v * b13;
	    t14 += v * b14;
	    t15 += v * b15;
	    v = a[1];
	    t1 += v * b0;
	    t2 += v * b1;
	    t3 += v * b2;
	    t4 += v * b3;
	    t5 += v * b4;
	    t6 += v * b5;
	    t7 += v * b6;
	    t8 += v * b7;
	    t9 += v * b8;
	    t10 += v * b9;
	    t11 += v * b10;
	    t12 += v * b11;
	    t13 += v * b12;
	    t14 += v * b13;
	    t15 += v * b14;
	    t16 += v * b15;
	    v = a[2];
	    t2 += v * b0;
	    t3 += v * b1;
	    t4 += v * b2;
	    t5 += v * b3;
	    t6 += v * b4;
	    t7 += v * b5;
	    t8 += v * b6;
	    t9 += v * b7;
	    t10 += v * b8;
	    t11 += v * b9;
	    t12 += v * b10;
	    t13 += v * b11;
	    t14 += v * b12;
	    t15 += v * b13;
	    t16 += v * b14;
	    t17 += v * b15;
	    v = a[3];
	    t3 += v * b0;
	    t4 += v * b1;
	    t5 += v * b2;
	    t6 += v * b3;
	    t7 += v * b4;
	    t8 += v * b5;
	    t9 += v * b6;
	    t10 += v * b7;
	    t11 += v * b8;
	    t12 += v * b9;
	    t13 += v * b10;
	    t14 += v * b11;
	    t15 += v * b12;
	    t16 += v * b13;
	    t17 += v * b14;
	    t18 += v * b15;
	    v = a[4];
	    t4 += v * b0;
	    t5 += v * b1;
	    t6 += v * b2;
	    t7 += v * b3;
	    t8 += v * b4;
	    t9 += v * b5;
	    t10 += v * b6;
	    t11 += v * b7;
	    t12 += v * b8;
	    t13 += v * b9;
	    t14 += v * b10;
	    t15 += v * b11;
	    t16 += v * b12;
	    t17 += v * b13;
	    t18 += v * b14;
	    t19 += v * b15;
	    v = a[5];
	    t5 += v * b0;
	    t6 += v * b1;
	    t7 += v * b2;
	    t8 += v * b3;
	    t9 += v * b4;
	    t10 += v * b5;
	    t11 += v * b6;
	    t12 += v * b7;
	    t13 += v * b8;
	    t14 += v * b9;
	    t15 += v * b10;
	    t16 += v * b11;
	    t17 += v * b12;
	    t18 += v * b13;
	    t19 += v * b14;
	    t20 += v * b15;
	    v = a[6];
	    t6 += v * b0;
	    t7 += v * b1;
	    t8 += v * b2;
	    t9 += v * b3;
	    t10 += v * b4;
	    t11 += v * b5;
	    t12 += v * b6;
	    t13 += v * b7;
	    t14 += v * b8;
	    t15 += v * b9;
	    t16 += v * b10;
	    t17 += v * b11;
	    t18 += v * b12;
	    t19 += v * b13;
	    t20 += v * b14;
	    t21 += v * b15;
	    v = a[7];
	    t7 += v * b0;
	    t8 += v * b1;
	    t9 += v * b2;
	    t10 += v * b3;
	    t11 += v * b4;
	    t12 += v * b5;
	    t13 += v * b6;
	    t14 += v * b7;
	    t15 += v * b8;
	    t16 += v * b9;
	    t17 += v * b10;
	    t18 += v * b11;
	    t19 += v * b12;
	    t20 += v * b13;
	    t21 += v * b14;
	    t22 += v * b15;
	    v = a[8];
	    t8 += v * b0;
	    t9 += v * b1;
	    t10 += v * b2;
	    t11 += v * b3;
	    t12 += v * b4;
	    t13 += v * b5;
	    t14 += v * b6;
	    t15 += v * b7;
	    t16 += v * b8;
	    t17 += v * b9;
	    t18 += v * b10;
	    t19 += v * b11;
	    t20 += v * b12;
	    t21 += v * b13;
	    t22 += v * b14;
	    t23 += v * b15;
	    v = a[9];
	    t9 += v * b0;
	    t10 += v * b1;
	    t11 += v * b2;
	    t12 += v * b3;
	    t13 += v * b4;
	    t14 += v * b5;
	    t15 += v * b6;
	    t16 += v * b7;
	    t17 += v * b8;
	    t18 += v * b9;
	    t19 += v * b10;
	    t20 += v * b11;
	    t21 += v * b12;
	    t22 += v * b13;
	    t23 += v * b14;
	    t24 += v * b15;
	    v = a[10];
	    t10 += v * b0;
	    t11 += v * b1;
	    t12 += v * b2;
	    t13 += v * b3;
	    t14 += v * b4;
	    t15 += v * b5;
	    t16 += v * b6;
	    t17 += v * b7;
	    t18 += v * b8;
	    t19 += v * b9;
	    t20 += v * b10;
	    t21 += v * b11;
	    t22 += v * b12;
	    t23 += v * b13;
	    t24 += v * b14;
	    t25 += v * b15;
	    v = a[11];
	    t11 += v * b0;
	    t12 += v * b1;
	    t13 += v * b2;
	    t14 += v * b3;
	    t15 += v * b4;
	    t16 += v * b5;
	    t17 += v * b6;
	    t18 += v * b7;
	    t19 += v * b8;
	    t20 += v * b9;
	    t21 += v * b10;
	    t22 += v * b11;
	    t23 += v * b12;
	    t24 += v * b13;
	    t25 += v * b14;
	    t26 += v * b15;
	    v = a[12];
	    t12 += v * b0;
	    t13 += v * b1;
	    t14 += v * b2;
	    t15 += v * b3;
	    t16 += v * b4;
	    t17 += v * b5;
	    t18 += v * b6;
	    t19 += v * b7;
	    t20 += v * b8;
	    t21 += v * b9;
	    t22 += v * b10;
	    t23 += v * b11;
	    t24 += v * b12;
	    t25 += v * b13;
	    t26 += v * b14;
	    t27 += v * b15;
	    v = a[13];
	    t13 += v * b0;
	    t14 += v * b1;
	    t15 += v * b2;
	    t16 += v * b3;
	    t17 += v * b4;
	    t18 += v * b5;
	    t19 += v * b6;
	    t20 += v * b7;
	    t21 += v * b8;
	    t22 += v * b9;
	    t23 += v * b10;
	    t24 += v * b11;
	    t25 += v * b12;
	    t26 += v * b13;
	    t27 += v * b14;
	    t28 += v * b15;
	    v = a[14];
	    t14 += v * b0;
	    t15 += v * b1;
	    t16 += v * b2;
	    t17 += v * b3;
	    t18 += v * b4;
	    t19 += v * b5;
	    t20 += v * b6;
	    t21 += v * b7;
	    t22 += v * b8;
	    t23 += v * b9;
	    t24 += v * b10;
	    t25 += v * b11;
	    t26 += v * b12;
	    t27 += v * b13;
	    t28 += v * b14;
	    t29 += v * b15;
	    v = a[15];
	    t15 += v * b0;
	    t16 += v * b1;
	    t17 += v * b2;
	    t18 += v * b3;
	    t19 += v * b4;
	    t20 += v * b5;
	    t21 += v * b6;
	    t22 += v * b7;
	    t23 += v * b8;
	    t24 += v * b9;
	    t25 += v * b10;
	    t26 += v * b11;
	    t27 += v * b12;
	    t28 += v * b13;
	    t29 += v * b14;
	    t30 += v * b15;
	    t0 += 38 * t16;
	    t1 += 38 * t17;
	    t2 += 38 * t18;
	    t3 += 38 * t19;
	    t4 += 38 * t20;
	    t5 += 38 * t21;
	    t6 += 38 * t22;
	    t7 += 38 * t23;
	    t8 += 38 * t24;
	    t9 += 38 * t25;
	    t10 += 38 * t26;
	    t11 += 38 * t27;
	    t12 += 38 * t28;
	    t13 += 38 * t29;
	    t14 += 38 * t30;
	    // t15 left as is
	    // first car
	    c = 1;
	    v = t0 + c + 65535;
	    c = Math.floor(v / 65536);
	    t0 = v - c * 65536;
	    v = t1 + c + 65535;
	    c = Math.floor(v / 65536);
	    t1 = v - c * 65536;
	    v = t2 + c + 65535;
	    c = Math.floor(v / 65536);
	    t2 = v - c * 65536;
	    v = t3 + c + 65535;
	    c = Math.floor(v / 65536);
	    t3 = v - c * 65536;
	    v = t4 + c + 65535;
	    c = Math.floor(v / 65536);
	    t4 = v - c * 65536;
	    v = t5 + c + 65535;
	    c = Math.floor(v / 65536);
	    t5 = v - c * 65536;
	    v = t6 + c + 65535;
	    c = Math.floor(v / 65536);
	    t6 = v - c * 65536;
	    v = t7 + c + 65535;
	    c = Math.floor(v / 65536);
	    t7 = v - c * 65536;
	    v = t8 + c + 65535;
	    c = Math.floor(v / 65536);
	    t8 = v - c * 65536;
	    v = t9 + c + 65535;
	    c = Math.floor(v / 65536);
	    t9 = v - c * 65536;
	    v = t10 + c + 65535;
	    c = Math.floor(v / 65536);
	    t10 = v - c * 65536;
	    v = t11 + c + 65535;
	    c = Math.floor(v / 65536);
	    t11 = v - c * 65536;
	    v = t12 + c + 65535;
	    c = Math.floor(v / 65536);
	    t12 = v - c * 65536;
	    v = t13 + c + 65535;
	    c = Math.floor(v / 65536);
	    t13 = v - c * 65536;
	    v = t14 + c + 65535;
	    c = Math.floor(v / 65536);
	    t14 = v - c * 65536;
	    v = t15 + c + 65535;
	    c = Math.floor(v / 65536);
	    t15 = v - c * 65536;
	    t0 += c - 1 + 37 * (c - 1);
	    // second car
	    c = 1;
	    v = t0 + c + 65535;
	    c = Math.floor(v / 65536);
	    t0 = v - c * 65536;
	    v = t1 + c + 65535;
	    c = Math.floor(v / 65536);
	    t1 = v - c * 65536;
	    v = t2 + c + 65535;
	    c = Math.floor(v / 65536);
	    t2 = v - c * 65536;
	    v = t3 + c + 65535;
	    c = Math.floor(v / 65536);
	    t3 = v - c * 65536;
	    v = t4 + c + 65535;
	    c = Math.floor(v / 65536);
	    t4 = v - c * 65536;
	    v = t5 + c + 65535;
	    c = Math.floor(v / 65536);
	    t5 = v - c * 65536;
	    v = t6 + c + 65535;
	    c = Math.floor(v / 65536);
	    t6 = v - c * 65536;
	    v = t7 + c + 65535;
	    c = Math.floor(v / 65536);
	    t7 = v - c * 65536;
	    v = t8 + c + 65535;
	    c = Math.floor(v / 65536);
	    t8 = v - c * 65536;
	    v = t9 + c + 65535;
	    c = Math.floor(v / 65536);
	    t9 = v - c * 65536;
	    v = t10 + c + 65535;
	    c = Math.floor(v / 65536);
	    t10 = v - c * 65536;
	    v = t11 + c + 65535;
	    c = Math.floor(v / 65536);
	    t11 = v - c * 65536;
	    v = t12 + c + 65535;
	    c = Math.floor(v / 65536);
	    t12 = v - c * 65536;
	    v = t13 + c + 65535;
	    c = Math.floor(v / 65536);
	    t13 = v - c * 65536;
	    v = t14 + c + 65535;
	    c = Math.floor(v / 65536);
	    t14 = v - c * 65536;
	    v = t15 + c + 65535;
	    c = Math.floor(v / 65536);
	    t15 = v - c * 65536;
	    t0 += c - 1 + 37 * (c - 1);
	    o[0] = t0;
	    o[1] = t1;
	    o[2] = t2;
	    o[3] = t3;
	    o[4] = t4;
	    o[5] = t5;
	    o[6] = t6;
	    o[7] = t7;
	    o[8] = t8;
	    o[9] = t9;
	    o[10] = t10;
	    o[11] = t11;
	    o[12] = t12;
	    o[13] = t13;
	    o[14] = t14;
	    o[15] = t15;
	}
	function square(o, a) {
	    mul(o, a, a);
	}
	function inv25519(o, i) {
	    const c = gf();
	    let a;
	    for (a = 0; a < 16; a++) {
	        c[a] = i[a];
	    }
	    for (a = 253; a >= 0; a--) {
	        square(c, c);
	        if (a !== 2 && a !== 4) {
	            mul(c, c, i);
	        }
	    }
	    for (a = 0; a < 16; a++) {
	        o[a] = c[a];
	    }
	}
	function pow2523(o, i) {
	    const c = gf();
	    let a;
	    for (a = 0; a < 16; a++) {
	        c[a] = i[a];
	    }
	    for (a = 250; a >= 0; a--) {
	        square(c, c);
	        if (a !== 1) {
	            mul(c, c, i);
	        }
	    }
	    for (a = 0; a < 16; a++) {
	        o[a] = c[a];
	    }
	}
	function edadd(p, q) {
	    const a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h = gf(), t = gf();
	    sub(a, p[1], p[0]);
	    sub(t, q[1], q[0]);
	    mul(a, a, t);
	    add(b, p[0], p[1]);
	    add(t, q[0], q[1]);
	    mul(b, b, t);
	    mul(c, p[3], q[3]);
	    mul(c, c, D2);
	    mul(d, p[2], q[2]);
	    add(d, d, d);
	    sub(e, b, a);
	    sub(f, d, c);
	    add(g, d, c);
	    add(h, b, a);
	    mul(p[0], e, f);
	    mul(p[1], h, g);
	    mul(p[2], g, f);
	    mul(p[3], e, h);
	}
	function cswap(p, q, b) {
	    for (let i = 0; i < 4; i++) {
	        sel25519(p[i], q[i], b);
	    }
	}
	function pack(r, p) {
	    const tx = gf(), ty = gf(), zi = gf();
	    inv25519(zi, p[2]);
	    mul(tx, p[0], zi);
	    mul(ty, p[1], zi);
	    pack25519(r, ty);
	    r[31] ^= par25519(tx) << 7;
	}
	function scalarmult(p, q, s) {
	    set25519(p[0], gf0);
	    set25519(p[1], gf1);
	    set25519(p[2], gf1);
	    set25519(p[3], gf0);
	    for (let i = 255; i >= 0; --i) {
	        const b = (s[(i / 8) | 0] >> (i & 7)) & 1;
	        cswap(p, q, b);
	        edadd(q, p);
	        edadd(p, p);
	        cswap(p, q, b);
	    }
	}
	function scalarbase(p, s) {
	    const q = [gf(), gf(), gf(), gf()];
	    set25519(q[0], X);
	    set25519(q[1], Y);
	    set25519(q[2], gf1);
	    mul(q[3], X, Y);
	    scalarmult(p, q, s);
	}
	// Generates key pair from secret 32-byte seed.
	function generateKeyPairFromSeed(seed) {
	    if (seed.length !== exports.SEED_LENGTH) {
	        throw new Error(`ed25519: seed must be ${exports.SEED_LENGTH} bytes`);
	    }
	    const d = (0, sha512_1.hash)(seed);
	    d[0] &= 248;
	    d[31] &= 127;
	    d[31] |= 64;
	    const publicKey = new Uint8Array(32);
	    const p = [gf(), gf(), gf(), gf()];
	    scalarbase(p, d);
	    pack(publicKey, p);
	    const secretKey = new Uint8Array(64);
	    secretKey.set(seed);
	    secretKey.set(publicKey, 32);
	    return {
	        publicKey,
	        secretKey
	    };
	}
	exports.generateKeyPairFromSeed = generateKeyPairFromSeed;
	function generateKeyPair(prng) {
	    const seed = (0, random_1.randomBytes)(32, prng);
	    const result = generateKeyPairFromSeed(seed);
	    (0, wipe_1.wipe)(seed);
	    return result;
	}
	exports.generateKeyPair = generateKeyPair;
	function extractPublicKeyFromSecretKey(secretKey) {
	    if (secretKey.length !== exports.SECRET_KEY_LENGTH) {
	        throw new Error(`ed25519: secret key must be ${exports.SECRET_KEY_LENGTH} bytes`);
	    }
	    return new Uint8Array(secretKey.subarray(32));
	}
	exports.extractPublicKeyFromSecretKey = extractPublicKeyFromSecretKey;
	const L = new Float64Array([
	    0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2,
	    0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10
	]);
	function modL(r, x) {
	    let carry;
	    let i;
	    let j;
	    let k;
	    for (i = 63; i >= 32; --i) {
	        carry = 0;
	        for (j = i - 32, k = i - 12; j < k; ++j) {
	            x[j] += carry - 16 * x[i] * L[j - (i - 32)];
	            carry = Math.floor((x[j] + 128) / 256);
	            x[j] -= carry * 256;
	        }
	        x[j] += carry;
	        x[i] = 0;
	    }
	    carry = 0;
	    for (j = 0; j < 32; j++) {
	        x[j] += carry - (x[31] >> 4) * L[j];
	        carry = x[j] >> 8;
	        x[j] &= 255;
	    }
	    for (j = 0; j < 32; j++) {
	        x[j] -= carry * L[j];
	    }
	    for (i = 0; i < 32; i++) {
	        x[i + 1] += x[i] >> 8;
	        r[i] = x[i] & 255;
	    }
	}
	function reduce(r) {
	    const x = new Float64Array(64);
	    for (let i = 0; i < 64; i++) {
	        x[i] = r[i];
	    }
	    for (let i = 0; i < 64; i++) {
	        r[i] = 0;
	    }
	    modL(r, x);
	}
	// Returns 64-byte signature of the message under the 64-byte secret key.
	function sign(secretKey, message) {
	    const x = new Float64Array(64);
	    const p = [gf(), gf(), gf(), gf()];
	    const d = (0, sha512_1.hash)(secretKey.subarray(0, 32));
	    d[0] &= 248;
	    d[31] &= 127;
	    d[31] |= 64;
	    const signature = new Uint8Array(64);
	    signature.set(d.subarray(32), 32);
	    const hs = new sha512_1.SHA512();
	    hs.update(signature.subarray(32));
	    hs.update(message);
	    const r = hs.digest();
	    hs.clean();
	    reduce(r);
	    scalarbase(p, r);
	    pack(signature, p);
	    hs.reset();
	    hs.update(signature.subarray(0, 32));
	    hs.update(secretKey.subarray(32));
	    hs.update(message);
	    const h = hs.digest();
	    reduce(h);
	    for (let i = 0; i < 32; i++) {
	        x[i] = r[i];
	    }
	    for (let i = 0; i < 32; i++) {
	        for (let j = 0; j < 32; j++) {
	            x[i + j] += h[i] * d[j];
	        }
	    }
	    modL(signature.subarray(32), x);
	    return signature;
	}
	exports.sign = sign;
	function unpackneg(r, p) {
	    const t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
	    set25519(r[2], gf1);
	    unpack25519(r[1], p);
	    square(num, r[1]);
	    mul(den, num, D);
	    sub(num, num, r[2]);
	    add(den, r[2], den);
	    square(den2, den);
	    square(den4, den2);
	    mul(den6, den4, den2);
	    mul(t, den6, num);
	    mul(t, t, den);
	    pow2523(t, t);
	    mul(t, t, num);
	    mul(t, t, den);
	    mul(t, t, den);
	    mul(r[0], t, den);
	    square(chk, r[0]);
	    mul(chk, chk, den);
	    if (neq25519(chk, num)) {
	        mul(r[0], r[0], I);
	    }
	    square(chk, r[0]);
	    mul(chk, chk, den);
	    if (neq25519(chk, num)) {
	        return -1;
	    }
	    if (par25519(r[0]) === (p[31] >> 7)) {
	        sub(r[0], gf0, r[0]);
	    }
	    mul(r[3], r[0], r[1]);
	    return 0;
	}
	function verify(publicKey, message, signature) {
	    const t = new Uint8Array(32);
	    const p = [gf(), gf(), gf(), gf()];
	    const q = [gf(), gf(), gf(), gf()];
	    if (signature.length !== exports.SIGNATURE_LENGTH) {
	        throw new Error(`ed25519: signature must be ${exports.SIGNATURE_LENGTH} bytes`);
	    }
	    if (unpackneg(q, publicKey)) {
	        return false;
	    }
	    const hs = new sha512_1.SHA512();
	    hs.update(signature.subarray(0, 32));
	    hs.update(publicKey);
	    hs.update(message);
	    const h = hs.digest();
	    reduce(h);
	    scalarmult(p, q, h);
	    scalarbase(q, signature.subarray(32));
	    edadd(p, q);
	    pack(t, p);
	    if (verify32(signature, t)) {
	        return false;
	    }
	    return true;
	}
	exports.verify = verify;
	/**
	 * Convert Ed25519 public key to X25519 public key.
	 *
	 * Throws if given an invalid public key.
	 */
	function convertPublicKeyToX25519(publicKey) {
	    let q = [gf(), gf(), gf(), gf()];
	    if (unpackneg(q, publicKey)) {
	        throw new Error("Ed25519: invalid public key");
	    }
	    // Formula: montgomeryX = (edwardsY + 1)*inverse(1 - edwardsY) mod p
	    let a = gf();
	    let b = gf();
	    let y = q[1];
	    add(a, gf1, y);
	    sub(b, gf1, y);
	    inv25519(b, b);
	    mul(a, a, b);
	    let z = new Uint8Array(32);
	    pack25519(z, a);
	    return z;
	}
	exports.convertPublicKeyToX25519 = convertPublicKeyToX25519;
	/**
	 *  Convert Ed25519 secret (private) key to X25519 secret key.
	 */
	function convertSecretKeyToX25519(secretKey) {
	    const d = (0, sha512_1.hash)(secretKey.subarray(0, 32));
	    d[0] &= 248;
	    d[31] &= 127;
	    d[31] |= 64;
	    const o = new Uint8Array(d.subarray(0, 32));
	    (0, wipe_1.wipe)(d);
	    return o;
	}
	exports.convertSecretKeyToX25519 = convertSecretKeyToX25519;
	
} (ed25519));

var blake2b$1 = {};

(function (exports) {
	// Copyright (C) 2017 Dmitry Chestnykh
	// MIT License. See LICENSE file for details.
	Object.defineProperty(exports, "__esModule", { value: true });
	var binary_1 = binary;
	var wipe_1 = wipe$1;
	exports.BLOCK_SIZE = 128;
	exports.DIGEST_LENGTH = 64;
	exports.KEY_LENGTH = 64;
	exports.PERSONALIZATION_LENGTH = 16;
	exports.SALT_LENGTH = 16;
	exports.MAX_LEAF_SIZE = Math.pow(2, 32) - 1;
	exports.MAX_FANOUT = 255;
	exports.MAX_MAX_DEPTH = 255; // not a typo
	var IV = new Uint32Array([
	    // low bits // high bits
	    0xf3bcc908, 0x6a09e667,
	    0x84caa73b, 0xbb67ae85,
	    0xfe94f82b, 0x3c6ef372,
	    0x5f1d36f1, 0xa54ff53a,
	    0xade682d1, 0x510e527f,
	    0x2b3e6c1f, 0x9b05688c,
	    0xfb41bd6b, 0x1f83d9ab,
	    0x137e2179, 0x5be0cd19,
	]);
	// Note: sigma values are doubled since we store
	// 64-bit ints as two 32-bit ints in arrays.
	var SIGMA = [
	    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
	    [28, 20, 8, 16, 18, 30, 26, 12, 2, 24, 0, 4, 22, 14, 10, 6],
	    [22, 16, 24, 0, 10, 4, 30, 26, 20, 28, 6, 12, 14, 2, 18, 8],
	    [14, 18, 6, 2, 26, 24, 22, 28, 4, 12, 10, 20, 8, 0, 30, 16],
	    [18, 0, 10, 14, 4, 8, 20, 30, 28, 2, 22, 24, 12, 16, 6, 26],
	    [4, 24, 12, 20, 0, 22, 16, 6, 8, 26, 14, 10, 30, 28, 2, 18],
	    [24, 10, 2, 30, 28, 26, 8, 20, 0, 14, 12, 6, 18, 4, 16, 22],
	    [26, 22, 14, 28, 24, 2, 6, 18, 10, 0, 30, 8, 16, 12, 4, 20],
	    [12, 30, 28, 18, 22, 6, 0, 16, 24, 4, 26, 14, 2, 8, 20, 10],
	    [20, 4, 16, 8, 14, 12, 2, 10, 30, 22, 18, 28, 6, 24, 26, 0],
	    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
	    [28, 20, 8, 16, 18, 30, 26, 12, 2, 24, 0, 4, 22, 14, 10, 6]
	];
	/**
	 * BLAKE2b hash function.
	 */
	var BLAKE2b = /** @class */ (function () {
	    function BLAKE2b(digestLength, config) {
	        if (digestLength === void 0) { digestLength = 64; }
	        this.digestLength = digestLength;
	        this.blockSize = exports.BLOCK_SIZE;
	        // Note: Int32Arrays for state and message are used for performance reasons.
	        this._state = new Int32Array(IV); // hash state, initialized with IV
	        this._buffer = new Uint8Array(exports.BLOCK_SIZE); // buffer for data
	        this._bufferLength = 0; // number of bytes in buffer
	        this._ctr = new Uint32Array(4);
	        this._flag = new Uint32Array(4);
	        this._lastNode = false;
	        this._finished = false;
	        this._vtmp = new Uint32Array(32);
	        this._mtmp = new Uint32Array(32);
	        // Validate digest length.
	        if (digestLength < 1 || digestLength > exports.DIGEST_LENGTH) {
	            throw new Error("blake2b: wrong digest length");
	        }
	        // Validate config, if present.
	        if (config) {
	            this.validateConfig(config);
	        }
	        // Get key length from config.
	        var keyLength = 0;
	        if (config && config.key) {
	            keyLength = config.key.length;
	        }
	        // Get tree fanout and maxDepth from config.
	        var fanout = 1;
	        var maxDepth = 1;
	        if (config && config.tree) {
	            fanout = config.tree.fanout;
	            maxDepth = config.tree.maxDepth;
	        }
	        // Xor common parameters into state.
	        this._state[0] ^= digestLength | (keyLength << 8) | (fanout << 16) | (maxDepth << 24);
	        // Xor tree parameters into state.
	        if (config && config.tree) {
	            this._state[1] ^= config.tree.leafSize;
	            this._state[2] ^= config.tree.nodeOffsetLowBits;
	            this._state[3] ^= config.tree.nodeOffsetHighBits;
	            this._state[4] ^= config.tree.nodeDepth | (config.tree.innerDigestLength << 8);
	            this._lastNode = config.tree.lastNode;
	        }
	        // Xor salt into state.
	        if (config && config.salt) {
	            this._state[8] ^= binary_1.readUint32LE(config.salt, 0);
	            this._state[9] ^= binary_1.readUint32LE(config.salt, 4);
	            this._state[10] ^= binary_1.readUint32LE(config.salt, 8);
	            this._state[11] ^= binary_1.readUint32LE(config.salt, 12);
	        }
	        // Xor personalization into state.
	        if (config && config.personalization) {
	            this._state[12] ^= binary_1.readUint32LE(config.personalization, 0);
	            this._state[13] ^= binary_1.readUint32LE(config.personalization, 4);
	            this._state[14] ^= binary_1.readUint32LE(config.personalization, 8);
	            this._state[15] ^= binary_1.readUint32LE(config.personalization, 12);
	        }
	        // Save a copy of initialized state for reset.
	        this._initialState = new Uint32Array(this._state);
	        // Process key.
	        if (config && config.key && keyLength > 0) {
	            this._paddedKey = new Uint8Array(exports.BLOCK_SIZE);
	            this._paddedKey.set(config.key);
	            // Put padded key into buffer.
	            this._buffer.set(this._paddedKey);
	            this._bufferLength = exports.BLOCK_SIZE;
	        }
	    }
	    BLAKE2b.prototype.reset = function () {
	        // Restore initial state.
	        this._state.set(this._initialState);
	        if (this._paddedKey) {
	            // Put padded key into buffer.
	            this._buffer.set(this._paddedKey);
	            this._bufferLength = exports.BLOCK_SIZE;
	        }
	        else {
	            this._bufferLength = 0;
	        }
	        // Clear counters and flags.
	        wipe_1.wipe(this._ctr);
	        wipe_1.wipe(this._flag);
	        this._finished = false;
	        return this;
	    };
	    BLAKE2b.prototype.validateConfig = function (config) {
	        if (config.key && config.key.length > exports.KEY_LENGTH) {
	            throw new Error("blake2b: wrong key length");
	        }
	        if (config.salt && config.salt.length !== exports.SALT_LENGTH) {
	            throw new Error("blake2b: wrong salt length");
	        }
	        if (config.personalization &&
	            config.personalization.length !== exports.PERSONALIZATION_LENGTH) {
	            throw new Error("blake2b: wrong personalization length");
	        }
	        if (config.tree) {
	            if (config.tree.fanout < 0 || config.tree.fanout > exports.MAX_FANOUT) {
	                throw new Error("blake2b: wrong tree fanout");
	            }
	            if (config.tree.maxDepth < 0 || config.tree.maxDepth > exports.MAX_MAX_DEPTH) {
	                throw new Error("blake2b: wrong tree depth");
	            }
	            if (config.tree.leafSize < 0 || config.tree.leafSize > exports.MAX_LEAF_SIZE) {
	                throw new Error("blake2b: wrong leaf size");
	            }
	            if (config.tree.innerDigestLength < 0 ||
	                config.tree.innerDigestLength > exports.DIGEST_LENGTH) {
	                throw new Error("blake2b: wrong tree inner digest length");
	            }
	        }
	    };
	    BLAKE2b.prototype.update = function (data, dataLength) {
	        if (dataLength === void 0) { dataLength = data.length; }
	        if (this._finished) {
	            throw new Error("blake2b: can't update because hash was finished.");
	        }
	        var left = exports.BLOCK_SIZE - this._bufferLength;
	        var dataPos = 0;
	        if (dataLength === 0) {
	            return this;
	        }
	        // Finish buffer.
	        if (dataLength > left) {
	            for (var i = 0; i < left; i++) {
	                this._buffer[this._bufferLength + i] = data[dataPos + i];
	            }
	            this._processBlock(exports.BLOCK_SIZE);
	            dataPos += left;
	            dataLength -= left;
	            this._bufferLength = 0;
	        }
	        // Process data blocks.
	        while (dataLength > exports.BLOCK_SIZE) {
	            for (var i = 0; i < exports.BLOCK_SIZE; i++) {
	                this._buffer[i] = data[dataPos + i];
	            }
	            this._processBlock(exports.BLOCK_SIZE);
	            dataPos += exports.BLOCK_SIZE;
	            dataLength -= exports.BLOCK_SIZE;
	            this._bufferLength = 0;
	        }
	        // Copy leftovers to buffer.
	        for (var i = 0; i < dataLength; i++) {
	            this._buffer[this._bufferLength + i] = data[dataPos + i];
	        }
	        this._bufferLength += dataLength;
	        return this;
	    };
	    BLAKE2b.prototype.finish = function (out) {
	        if (!this._finished) {
	            for (var i = this._bufferLength; i < exports.BLOCK_SIZE; i++) {
	                this._buffer[i] = 0;
	            }
	            // Set last block flag.
	            this._flag[0] = 0xffffffff;
	            this._flag[1] = 0xffffffff;
	            // Set last node flag if last node in tree.
	            if (this._lastNode) {
	                this._flag[2] = 0xffffffff;
	                this._flag[3] = 0xffffffff;
	            }
	            this._processBlock(this._bufferLength);
	            this._finished = true;
	        }
	        // Reuse buffer as temporary space for digest.
	        var tmp = this._buffer.subarray(0, 64);
	        for (var i = 0; i < 16; i++) {
	            binary_1.writeUint32LE(this._state[i], tmp, i * 4);
	        }
	        out.set(tmp.subarray(0, out.length));
	        return this;
	    };
	    BLAKE2b.prototype.digest = function () {
	        var out = new Uint8Array(this.digestLength);
	        this.finish(out);
	        return out;
	    };
	    BLAKE2b.prototype.clean = function () {
	        wipe_1.wipe(this._vtmp);
	        wipe_1.wipe(this._mtmp);
	        wipe_1.wipe(this._state);
	        wipe_1.wipe(this._buffer);
	        wipe_1.wipe(this._initialState);
	        if (this._paddedKey) {
	            wipe_1.wipe(this._paddedKey);
	        }
	        this._bufferLength = 0;
	        wipe_1.wipe(this._ctr);
	        wipe_1.wipe(this._flag);
	        this._lastNode = false;
	        this._finished = false;
	    };
	    BLAKE2b.prototype.saveState = function () {
	        if (this._finished) {
	            throw new Error("blake2b: cannot save finished state");
	        }
	        return {
	            state: new Uint32Array(this._state),
	            buffer: new Uint8Array(this._buffer),
	            bufferLength: this._bufferLength,
	            ctr: new Uint32Array(this._ctr),
	            flag: new Uint32Array(this._flag),
	            lastNode: this._lastNode,
	            paddedKey: this._paddedKey ? new Uint8Array(this._paddedKey) : undefined,
	            initialState: new Uint32Array(this._initialState)
	        };
	    };
	    BLAKE2b.prototype.restoreState = function (savedState) {
	        this._state.set(savedState.state);
	        this._buffer.set(savedState.buffer);
	        this._bufferLength = savedState.bufferLength;
	        this._ctr.set(savedState.ctr);
	        this._flag.set(savedState.flag);
	        this._lastNode = savedState.lastNode;
	        if (this._paddedKey) {
	            wipe_1.wipe(this._paddedKey);
	        }
	        this._paddedKey = savedState.paddedKey ? new Uint8Array(savedState.paddedKey) : undefined;
	        this._initialState.set(savedState.initialState);
	        return this;
	    };
	    BLAKE2b.prototype.cleanSavedState = function (savedState) {
	        wipe_1.wipe(savedState.state);
	        wipe_1.wipe(savedState.buffer);
	        wipe_1.wipe(savedState.initialState);
	        if (savedState.paddedKey) {
	            wipe_1.wipe(savedState.paddedKey);
	        }
	        savedState.bufferLength = 0;
	        wipe_1.wipe(savedState.ctr);
	        wipe_1.wipe(savedState.flag);
	        savedState.lastNode = false;
	    };
	    BLAKE2b.prototype._G = function (v, al, bl, cl, dl, ah, bh, ch, dh, ml0, mh0, ml1, mh1) {
	        var vla = v[al], vha = v[ah], vlb = v[bl], vhb = v[bh], vlc = v[cl], vhc = v[ch], vld = v[dl], vhd = v[dh];
	        // 64-bit: va += vb
	        var w = vla & 0xffff, x = vla >>> 16, y = vha & 0xffff, z = vha >>> 16;
	        w += vlb & 0xffff;
	        x += vlb >>> 16;
	        y += vhb & 0xffff;
	        z += vhb >>> 16;
	        x += w >>> 16;
	        y += x >>> 16;
	        z += y >>> 16;
	        vha = (y & 0xffff) | (z << 16);
	        vla = (w & 0xffff) | (x << 16);
	        // 64-bit: va += m[sigma[r][2 * i + 0]]
	        w = vla & 0xffff;
	        x = vla >>> 16;
	        y = vha & 0xffff;
	        z = vha >>> 16;
	        w += ml0 & 0xffff;
	        x += ml0 >>> 16;
	        y += mh0 & 0xffff;
	        z += mh0 >>> 16;
	        x += w >>> 16;
	        y += x >>> 16;
	        z += y >>> 16;
	        vha = (y & 0xffff) | (z << 16);
	        vla = (w & 0xffff) | (x << 16);
	        // 64-bit: vd ^= va
	        vld ^= vla;
	        vhd ^= vha;
	        // 64-bit: rot(vd, 32)
	        w = vhd;
	        vhd = vld;
	        vld = w;
	        // 64-bit: vc += vd
	        w = vlc & 0xffff;
	        x = vlc >>> 16;
	        y = vhc & 0xffff;
	        z = vhc >>> 16;
	        w += vld & 0xffff;
	        x += vld >>> 16;
	        y += vhd & 0xffff;
	        z += vhd >>> 16;
	        x += w >>> 16;
	        y += x >>> 16;
	        z += y >>> 16;
	        vhc = (y & 0xffff) | (z << 16);
	        vlc = (w & 0xffff) | (x << 16);
	        // 64-bit: vb ^= vc
	        vlb ^= vlc;
	        vhb ^= vhc;
	        // 64-bit: rot(vb, 24)
	        w = vlb << 8 | vhb >>> 24;
	        vlb = vhb << 8 | vlb >>> 24;
	        vhb = w;
	        // 64-bit: va += vb
	        w = vla & 0xffff;
	        x = vla >>> 16;
	        y = vha & 0xffff;
	        z = vha >>> 16;
	        w += vlb & 0xffff;
	        x += vlb >>> 16;
	        y += vhb & 0xffff;
	        z += vhb >>> 16;
	        x += w >>> 16;
	        y += x >>> 16;
	        z += y >>> 16;
	        vha = (y & 0xffff) | (z << 16);
	        vla = (w & 0xffff) | (x << 16);
	        // 64-bit: va += m[sigma[r][2 * i + 1]
	        w = vla & 0xffff;
	        x = vla >>> 16;
	        y = vha & 0xffff;
	        z = vha >>> 16;
	        w += ml1 & 0xffff;
	        x += ml1 >>> 16;
	        y += mh1 & 0xffff;
	        z += mh1 >>> 16;
	        x += w >>> 16;
	        y += x >>> 16;
	        z += y >>> 16;
	        vha = (y & 0xffff) | (z << 16);
	        vla = (w & 0xffff) | (x << 16);
	        // 64-bit: vd ^= va
	        vld ^= vla;
	        vhd ^= vha;
	        // 64-bit: rot(vd, 16)
	        w = vld << 16 | vhd >>> 16;
	        vld = vhd << 16 | vld >>> 16;
	        vhd = w;
	        // 64-bit: vc += vd
	        w = vlc & 0xffff;
	        x = vlc >>> 16;
	        y = vhc & 0xffff;
	        z = vhc >>> 16;
	        w += vld & 0xffff;
	        x += vld >>> 16;
	        y += vhd & 0xffff;
	        z += vhd >>> 16;
	        x += w >>> 16;
	        y += x >>> 16;
	        z += y >>> 16;
	        vhc = (y & 0xffff) | (z << 16);
	        vlc = (w & 0xffff) | (x << 16);
	        // 64-bit: vb ^= vc
	        vlb ^= vlc;
	        vhb ^= vhc;
	        // 64-bit: rot(vb, 63)
	        w = vhb << 1 | vlb >>> 31;
	        vlb = vlb << 1 | vhb >>> 31;
	        vhb = w;
	        v[al] = vla;
	        v[ah] = vha;
	        v[bl] = vlb;
	        v[bh] = vhb;
	        v[cl] = vlc;
	        v[ch] = vhc;
	        v[dl] = vld;
	        v[dh] = vhd;
	    };
	    BLAKE2b.prototype._incrementCounter = function (n) {
	        for (var i = 0; i < 3; i++) {
	            var a = this._ctr[i] + n;
	            this._ctr[i] = a >>> 0;
	            if (this._ctr[i] === a) {
	                return;
	            }
	            n = 1;
	        }
	    };
	    BLAKE2b.prototype._processBlock = function (length) {
	        this._incrementCounter(length);
	        var v = this._vtmp;
	        v.set(this._state);
	        v.set(IV, 16);
	        v[12 * 2 + 0] ^= this._ctr[0];
	        v[12 * 2 + 1] ^= this._ctr[1];
	        v[13 * 2 + 0] ^= this._ctr[2];
	        v[13 * 2 + 1] ^= this._ctr[3];
	        v[14 * 2 + 0] ^= this._flag[0];
	        v[14 * 2 + 1] ^= this._flag[1];
	        v[15 * 2 + 0] ^= this._flag[2];
	        v[15 * 2 + 1] ^= this._flag[3];
	        var m = this._mtmp;
	        for (var i = 0; i < 32; i++) {
	            m[i] = binary_1.readUint32LE(this._buffer, i * 4);
	        }
	        for (var r = 0; r < 12; r++) {
	            this._G(v, 0, 8, 16, 24, 1, 9, 17, 25, m[SIGMA[r][0]], m[SIGMA[r][0] + 1], m[SIGMA[r][1]], m[SIGMA[r][1] + 1]);
	            this._G(v, 2, 10, 18, 26, 3, 11, 19, 27, m[SIGMA[r][2]], m[SIGMA[r][2] + 1], m[SIGMA[r][3]], m[SIGMA[r][3] + 1]);
	            this._G(v, 4, 12, 20, 28, 5, 13, 21, 29, m[SIGMA[r][4]], m[SIGMA[r][4] + 1], m[SIGMA[r][5]], m[SIGMA[r][5] + 1]);
	            this._G(v, 6, 14, 22, 30, 7, 15, 23, 31, m[SIGMA[r][6]], m[SIGMA[r][6] + 1], m[SIGMA[r][7]], m[SIGMA[r][7] + 1]);
	            this._G(v, 0, 10, 20, 30, 1, 11, 21, 31, m[SIGMA[r][8]], m[SIGMA[r][8] + 1], m[SIGMA[r][9]], m[SIGMA[r][9] + 1]);
	            this._G(v, 2, 12, 22, 24, 3, 13, 23, 25, m[SIGMA[r][10]], m[SIGMA[r][10] + 1], m[SIGMA[r][11]], m[SIGMA[r][11] + 1]);
	            this._G(v, 4, 14, 16, 26, 5, 15, 17, 27, m[SIGMA[r][12]], m[SIGMA[r][12] + 1], m[SIGMA[r][13]], m[SIGMA[r][13] + 1]);
	            this._G(v, 6, 8, 18, 28, 7, 9, 19, 29, m[SIGMA[r][14]], m[SIGMA[r][14] + 1], m[SIGMA[r][15]], m[SIGMA[r][15] + 1]);
	        }
	        for (var i = 0; i < 16; i++) {
	            this._state[i] ^= v[i] ^ v[i + 16];
	        }
	    };
	    return BLAKE2b;
	}());
	exports.BLAKE2b = BLAKE2b;
	function hash(data, digestLength, config) {
	    if (digestLength === void 0) { digestLength = exports.DIGEST_LENGTH; }
	    var h = new BLAKE2b(digestLength, config);
	    h.update(data);
	    var digest = h.digest();
	    h.clean();
	    return digest;
	}
	exports.hash = hash;
	
} (blake2b$1));

const ERROR_MSG_INPUT = 'Input must be an string, Buffer or Uint8Array';

// For convenience, let people hash a string, not just a Uint8Array
function normalizeInput (input) {
  let ret;
  if (input instanceof Uint8Array) {
    ret = input;
  } else if (typeof input === 'string') {
    const encoder = new TextEncoder();
    ret = encoder.encode(input);
  } else {
    throw new Error(ERROR_MSG_INPUT)
  }
  return ret
}

// Converts a Uint8Array to a hexadecimal string
// For example, toHex([255, 0, 255]) returns "ff00ff"
function toHex$1 (bytes) {
  return Array.prototype.map
    .call(bytes, function (n) {
      return (n < 16 ? '0' : '') + n.toString(16)
    })
    .join('')
}

// Converts any value in [0...2^32-1] to an 8-character hex string
function uint32ToHex (val) {
  return (0x100000000 + val).toString(16).substring(1)
}

// For debugging: prints out hash state in the same format as the RFC
// sample computation exactly, so that you can diff
function debugPrint (label, arr, size) {
  let msg = '\n' + label + ' = ';
  for (let i = 0; i < arr.length; i += 2) {
    if (size === 32) {
      msg += uint32ToHex(arr[i]).toUpperCase();
      msg += ' ';
      msg += uint32ToHex(arr[i + 1]).toUpperCase();
    } else if (size === 64) {
      msg += uint32ToHex(arr[i + 1]).toUpperCase();
      msg += uint32ToHex(arr[i]).toUpperCase();
    } else throw new Error('Invalid size ' + size)
    if (i % 6 === 4) {
      msg += '\n' + new Array(label.length + 4).join(' ');
    } else if (i < arr.length - 2) {
      msg += ' ';
    }
  }
  console.log(msg);
}

// For performance testing: generates N bytes of input, hashes M times
// Measures and prints MB/second hash performance each time
function testSpeed (hashFn, N, M) {
  let startMs = new Date().getTime();

  const input = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    input[i] = i % 256;
  }
  const genMs = new Date().getTime();
  console.log('Generated random input in ' + (genMs - startMs) + 'ms');
  startMs = genMs;

  for (let i = 0; i < M; i++) {
    const hashHex = hashFn(input);
    const hashMs = new Date().getTime();
    const ms = hashMs - startMs;
    startMs = hashMs;
    console.log('Hashed in ' + ms + 'ms: ' + hashHex.substring(0, 20) + '...');
    console.log(
      Math.round((N / (1 << 20) / (ms / 1000)) * 100) / 100 + ' MB PER SECOND'
    );
  }
}

var util$3 = {
  normalizeInput: normalizeInput,
  toHex: toHex$1,
  debugPrint: debugPrint,
  testSpeed: testSpeed
};

// Blake2B in pure Javascript
// Adapted from the reference implementation in RFC7693
// Ported to Javascript by DC - https://github.com/dcposch

const util$2 = util$3;

// 64-bit unsigned addition
// Sets v[a,a+1] += v[b,b+1]
// v should be a Uint32Array
function ADD64AA (v, a, b) {
  const o0 = v[a] + v[b];
  let o1 = v[a + 1] + v[b + 1];
  if (o0 >= 0x100000000) {
    o1++;
  }
  v[a] = o0;
  v[a + 1] = o1;
}

// 64-bit unsigned addition
// Sets v[a,a+1] += b
// b0 is the low 32 bits of b, b1 represents the high 32 bits
function ADD64AC (v, a, b0, b1) {
  let o0 = v[a] + b0;
  if (b0 < 0) {
    o0 += 0x100000000;
  }
  let o1 = v[a + 1] + b1;
  if (o0 >= 0x100000000) {
    o1++;
  }
  v[a] = o0;
  v[a + 1] = o1;
}

// Little-endian byte access
function B2B_GET32 (arr, i) {
  return arr[i] ^ (arr[i + 1] << 8) ^ (arr[i + 2] << 16) ^ (arr[i + 3] << 24)
}

// G Mixing function
// The ROTRs are inlined for speed
function B2B_G (a, b, c, d, ix, iy) {
  const x0 = m$1[ix];
  const x1 = m$1[ix + 1];
  const y0 = m$1[iy];
  const y1 = m$1[iy + 1];

  ADD64AA(v$1, a, b); // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
  ADD64AC(v$1, a, x0, x1); // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits

  // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
  let xor0 = v$1[d] ^ v$1[a];
  let xor1 = v$1[d + 1] ^ v$1[a + 1];
  v$1[d] = xor1;
  v$1[d + 1] = xor0;

  ADD64AA(v$1, c, d);

  // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
  xor0 = v$1[b] ^ v$1[c];
  xor1 = v$1[b + 1] ^ v$1[c + 1];
  v$1[b] = (xor0 >>> 24) ^ (xor1 << 8);
  v$1[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

  ADD64AA(v$1, a, b);
  ADD64AC(v$1, a, y0, y1);

  // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
  xor0 = v$1[d] ^ v$1[a];
  xor1 = v$1[d + 1] ^ v$1[a + 1];
  v$1[d] = (xor0 >>> 16) ^ (xor1 << 16);
  v$1[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

  ADD64AA(v$1, c, d);

  // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
  xor0 = v$1[b] ^ v$1[c];
  xor1 = v$1[b + 1] ^ v$1[c + 1];
  v$1[b] = (xor1 >>> 31) ^ (xor0 << 1);
  v$1[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
}

// Initialization Vector
const BLAKE2B_IV32 = new Uint32Array([
  0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85, 0xfe94f82b, 0x3c6ef372,
  0x5f1d36f1, 0xa54ff53a, 0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c,
  0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19
]);

const SIGMA8 = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13,
  6, 1, 12, 0, 2, 11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1,
  9, 4, 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4,
  10, 15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5,
  15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11, 13, 11, 7,
  14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11, 3, 0, 8, 12, 2,
  13, 7, 1, 4, 10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0, 0,
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6,
  1, 12, 0, 2, 11, 7, 5, 3
];

// These are offsets into a uint64 buffer.
// Multiply them all by 2 to make them offsets into a uint32 buffer,
// because this is Javascript and we don't have uint64s
const SIGMA82 = new Uint8Array(
  SIGMA8.map(function (x) {
    return x * 2
  })
);

// Compression function. 'last' flag indicates last block.
// Note we're representing 16 uint64s as 32 uint32s
const v$1 = new Uint32Array(32);
const m$1 = new Uint32Array(32);
function blake2bCompress (ctx, last) {
  let i = 0;

  // init work variables
  for (i = 0; i < 16; i++) {
    v$1[i] = ctx.h[i];
    v$1[i + 16] = BLAKE2B_IV32[i];
  }

  // low 64 bits of offset
  v$1[24] = v$1[24] ^ ctx.t;
  v$1[25] = v$1[25] ^ (ctx.t / 0x100000000);
  // high 64 bits not supported, offset may not be higher than 2**53-1

  // last block flag set ?
  if (last) {
    v$1[28] = ~v$1[28];
    v$1[29] = ~v$1[29];
  }

  // get little-endian words
  for (i = 0; i < 32; i++) {
    m$1[i] = B2B_GET32(ctx.b, 4 * i);
  }

  // twelve rounds of mixing
  // uncomment the DebugPrint calls to log the computation
  // and match the RFC sample documentation
  // util.debugPrint('          m[16]', m, 64)
  for (i = 0; i < 12; i++) {
    // util.debugPrint('   (i=' + (i < 10 ? ' ' : '') + i + ') v[16]', v, 64)
    B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
    B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
    B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
    B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
    B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
    B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
    B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
    B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
  }
  // util.debugPrint('   (i=12) v[16]', v, 64)

  for (i = 0; i < 16; i++) {
    ctx.h[i] = ctx.h[i] ^ v$1[i] ^ v$1[i + 16];
  }
  // util.debugPrint('h[8]', ctx.h, 64)
}

// reusable parameterBlock
const parameterBlock = new Uint8Array([
  0,
  0,
  0,
  0, //  0: outlen, keylen, fanout, depth
  0,
  0,
  0,
  0, //  4: leaf length, sequential mode
  0,
  0,
  0,
  0, //  8: node offset
  0,
  0,
  0,
  0, // 12: node offset
  0,
  0,
  0,
  0, // 16: node depth, inner length, rfu
  0,
  0,
  0,
  0, // 20: rfu
  0,
  0,
  0,
  0, // 24: rfu
  0,
  0,
  0,
  0, // 28: rfu
  0,
  0,
  0,
  0, // 32: salt
  0,
  0,
  0,
  0, // 36: salt
  0,
  0,
  0,
  0, // 40: salt
  0,
  0,
  0,
  0, // 44: salt
  0,
  0,
  0,
  0, // 48: personal
  0,
  0,
  0,
  0, // 52: personal
  0,
  0,
  0,
  0, // 56: personal
  0,
  0,
  0,
  0 // 60: personal
]);

// Creates a BLAKE2b hashing context
// Requires an output length between 1 and 64 bytes
// Takes an optional Uint8Array key
// Takes an optinal Uint8Array salt
// Takes an optinal Uint8Array personal
function blake2bInit (outlen, key, salt, personal) {
  if (outlen === 0 || outlen > 64) {
    throw new Error('Illegal output length, expected 0 < length <= 64')
  }
  if (key && key.length > 64) {
    throw new Error('Illegal key, expected Uint8Array with 0 < length <= 64')
  }
  if (salt && salt.length !== 16) {
    throw new Error('Illegal salt, expected Uint8Array with length is 16')
  }
  if (personal && personal.length !== 16) {
    throw new Error('Illegal personal, expected Uint8Array with length is 16')
  }

  // state, 'param block'
  const ctx = {
    b: new Uint8Array(128),
    h: new Uint32Array(16),
    t: 0, // input count
    c: 0, // pointer within buffer
    outlen: outlen // output length in bytes
  };

  // initialize parameterBlock before usage
  parameterBlock.fill(0);
  parameterBlock[0] = outlen;
  if (key) parameterBlock[1] = key.length;
  parameterBlock[2] = 1; // fanout
  parameterBlock[3] = 1; // depth
  if (salt) parameterBlock.set(salt, 32);
  if (personal) parameterBlock.set(personal, 48);

  // initialize hash state
  for (let i = 0; i < 16; i++) {
    ctx.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(parameterBlock, i * 4);
  }

  // key the hash, if applicable
  if (key) {
    blake2bUpdate(ctx, key);
    // at the end
    ctx.c = 128;
  }

  return ctx
}

// Updates a BLAKE2b streaming hash
// Requires hash context and Uint8Array (byte array)
function blake2bUpdate (ctx, input) {
  for (let i = 0; i < input.length; i++) {
    if (ctx.c === 128) {
      // buffer full ?
      ctx.t += ctx.c; // add counters
      blake2bCompress(ctx, false); // compress (not last)
      ctx.c = 0; // counter to zero
    }
    ctx.b[ctx.c++] = input[i];
  }
}

// Completes a BLAKE2b streaming hash
// Returns a Uint8Array containing the message digest
function blake2bFinal (ctx) {
  ctx.t += ctx.c; // mark last block offset

  while (ctx.c < 128) {
    // fill up with zeros
    ctx.b[ctx.c++] = 0;
  }
  blake2bCompress(ctx, true); // final block flag = 1

  // little endian convert and store
  const out = new Uint8Array(ctx.outlen);
  for (let i = 0; i < ctx.outlen; i++) {
    out[i] = ctx.h[i >> 2] >> (8 * (i & 3));
  }
  return out
}

// Computes the BLAKE2B hash of a string or byte array, and returns a Uint8Array
//
// Returns a n-byte Uint8Array
//
// Parameters:
// - input - the input bytes, as a string, Buffer or Uint8Array
// - key - optional key Uint8Array, up to 64 bytes
// - outlen - optional output length in bytes, default 64
// - salt - optional salt bytes, string, Buffer or Uint8Array
// - personal - optional personal bytes, string, Buffer or Uint8Array
function blake2b (input, key, outlen, salt, personal) {
  // preprocess inputs
  outlen = outlen || 64;
  input = util$2.normalizeInput(input);
  if (salt) {
    salt = util$2.normalizeInput(salt);
  }
  if (personal) {
    personal = util$2.normalizeInput(personal);
  }

  // do the math
  const ctx = blake2bInit(outlen, key, salt, personal);
  blake2bUpdate(ctx, input);
  return blake2bFinal(ctx)
}

// Computes the BLAKE2B hash of a string or byte array
//
// Returns an n-byte hash in hex, all lowercase
//
// Parameters:
// - input - the input bytes, as a string, Buffer, or Uint8Array
// - key - optional key Uint8Array, up to 64 bytes
// - outlen - optional output length in bytes, default 64
// - salt - optional salt bytes, string, Buffer or Uint8Array
// - personal - optional personal bytes, string, Buffer or Uint8Array
function blake2bHex (input, key, outlen, salt, personal) {
  const output = blake2b(input, key, outlen, salt, personal);
  return util$2.toHex(output)
}

var blake2b_1 = {
  blake2b: blake2b,
  blake2bHex: blake2bHex,
  blake2bInit: blake2bInit,
  blake2bUpdate: blake2bUpdate,
  blake2bFinal: blake2bFinal
};

// BLAKE2s hash function in pure Javascript
// Adapted from the reference implementation in RFC7693
// Ported to Javascript by DC - https://github.com/dcposch

const util$1 = util$3;

// Little-endian byte access.
// Expects a Uint8Array and an index
// Returns the little-endian uint32 at v[i..i+3]
function B2S_GET32 (v, i) {
  return v[i] ^ (v[i + 1] << 8) ^ (v[i + 2] << 16) ^ (v[i + 3] << 24)
}

// Mixing function G.
function B2S_G (a, b, c, d, x, y) {
  v[a] = v[a] + v[b] + x;
  v[d] = ROTR32(v[d] ^ v[a], 16);
  v[c] = v[c] + v[d];
  v[b] = ROTR32(v[b] ^ v[c], 12);
  v[a] = v[a] + v[b] + y;
  v[d] = ROTR32(v[d] ^ v[a], 8);
  v[c] = v[c] + v[d];
  v[b] = ROTR32(v[b] ^ v[c], 7);
}

// 32-bit right rotation
// x should be a uint32
// y must be between 1 and 31, inclusive
function ROTR32 (x, y) {
  return (x >>> y) ^ (x << (32 - y))
}

// Initialization Vector.
const BLAKE2S_IV = new Uint32Array([
  0x6a09e667,
  0xbb67ae85,
  0x3c6ef372,
  0xa54ff53a,
  0x510e527f,
  0x9b05688c,
  0x1f83d9ab,
  0x5be0cd19
]);

const SIGMA = new Uint8Array([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3,
  11,
  8,
  12,
  0,
  5,
  2,
  15,
  13,
  10,
  14,
  3,
  6,
  7,
  1,
  9,
  4,
  7,
  9,
  3,
  1,
  13,
  12,
  11,
  14,
  2,
  6,
  5,
  10,
  4,
  0,
  15,
  8,
  9,
  0,
  5,
  7,
  2,
  4,
  10,
  15,
  14,
  1,
  11,
  12,
  6,
  8,
  3,
  13,
  2,
  12,
  6,
  10,
  0,
  11,
  8,
  3,
  4,
  13,
  7,
  5,
  15,
  14,
  1,
  9,
  12,
  5,
  1,
  15,
  14,
  13,
  4,
  10,
  0,
  7,
  6,
  3,
  9,
  2,
  8,
  11,
  13,
  11,
  7,
  14,
  12,
  1,
  3,
  9,
  5,
  0,
  15,
  4,
  8,
  6,
  2,
  10,
  6,
  15,
  14,
  9,
  11,
  3,
  0,
  8,
  12,
  2,
  13,
  7,
  1,
  4,
  10,
  5,
  10,
  2,
  8,
  4,
  7,
  6,
  1,
  5,
  15,
  11,
  9,
  14,
  3,
  12,
  13,
  0
]);

// Compression function. "last" flag indicates last block
const v = new Uint32Array(16);
const m = new Uint32Array(16);
function blake2sCompress (ctx, last) {
  let i = 0;
  for (i = 0; i < 8; i++) {
    // init work variables
    v[i] = ctx.h[i];
    v[i + 8] = BLAKE2S_IV[i];
  }

  v[12] ^= ctx.t; // low 32 bits of offset
  v[13] ^= ctx.t / 0x100000000; // high 32 bits
  if (last) {
    // last block flag set ?
    v[14] = ~v[14];
  }

  for (i = 0; i < 16; i++) {
    // get little-endian words
    m[i] = B2S_GET32(ctx.b, 4 * i);
  }

  // ten rounds of mixing
  // uncomment the DebugPrint calls to log the computation
  // and match the RFC sample documentation
  // util.debugPrint('          m[16]', m, 32)
  for (i = 0; i < 10; i++) {
    // util.debugPrint('   (i=' + i + ')  v[16]', v, 32)
    B2S_G(0, 4, 8, 12, m[SIGMA[i * 16 + 0]], m[SIGMA[i * 16 + 1]]);
    B2S_G(1, 5, 9, 13, m[SIGMA[i * 16 + 2]], m[SIGMA[i * 16 + 3]]);
    B2S_G(2, 6, 10, 14, m[SIGMA[i * 16 + 4]], m[SIGMA[i * 16 + 5]]);
    B2S_G(3, 7, 11, 15, m[SIGMA[i * 16 + 6]], m[SIGMA[i * 16 + 7]]);
    B2S_G(0, 5, 10, 15, m[SIGMA[i * 16 + 8]], m[SIGMA[i * 16 + 9]]);
    B2S_G(1, 6, 11, 12, m[SIGMA[i * 16 + 10]], m[SIGMA[i * 16 + 11]]);
    B2S_G(2, 7, 8, 13, m[SIGMA[i * 16 + 12]], m[SIGMA[i * 16 + 13]]);
    B2S_G(3, 4, 9, 14, m[SIGMA[i * 16 + 14]], m[SIGMA[i * 16 + 15]]);
  }
  // util.debugPrint('   (i=10) v[16]', v, 32)

  for (i = 0; i < 8; i++) {
    ctx.h[i] ^= v[i] ^ v[i + 8];
  }
  // util.debugPrint('h[8]', ctx.h, 32)
}

// Creates a BLAKE2s hashing context
// Requires an output length between 1 and 32 bytes
// Takes an optional Uint8Array key
function blake2sInit (outlen, key) {
  if (!(outlen > 0 && outlen <= 32)) {
    throw new Error('Incorrect output length, should be in [1, 32]')
  }
  const keylen = key ? key.length : 0;
  if (key && !(keylen > 0 && keylen <= 32)) {
    throw new Error('Incorrect key length, should be in [1, 32]')
  }

  const ctx = {
    h: new Uint32Array(BLAKE2S_IV), // hash state
    b: new Uint8Array(64), // input block
    c: 0, // pointer within block
    t: 0, // input count
    outlen: outlen // output length in bytes
  };
  ctx.h[0] ^= 0x01010000 ^ (keylen << 8) ^ outlen;

  if (keylen > 0) {
    blake2sUpdate(ctx, key);
    ctx.c = 64; // at the end
  }

  return ctx
}

// Updates a BLAKE2s streaming hash
// Requires hash context and Uint8Array (byte array)
function blake2sUpdate (ctx, input) {
  for (let i = 0; i < input.length; i++) {
    if (ctx.c === 64) {
      // buffer full ?
      ctx.t += ctx.c; // add counters
      blake2sCompress(ctx, false); // compress (not last)
      ctx.c = 0; // counter to zero
    }
    ctx.b[ctx.c++] = input[i];
  }
}

// Completes a BLAKE2s streaming hash
// Returns a Uint8Array containing the message digest
function blake2sFinal (ctx) {
  ctx.t += ctx.c; // mark last block offset
  while (ctx.c < 64) {
    // fill up with zeros
    ctx.b[ctx.c++] = 0;
  }
  blake2sCompress(ctx, true); // final block flag = 1

  // little endian convert and store
  const out = new Uint8Array(ctx.outlen);
  for (let i = 0; i < ctx.outlen; i++) {
    out[i] = (ctx.h[i >> 2] >> (8 * (i & 3))) & 0xff;
  }
  return out
}

// Computes the BLAKE2S hash of a string or byte array, and returns a Uint8Array
//
// Returns a n-byte Uint8Array
//
// Parameters:
// - input - the input bytes, as a string, Buffer, or Uint8Array
// - key - optional key Uint8Array, up to 32 bytes
// - outlen - optional output length in bytes, default 64
function blake2s (input, key, outlen) {
  // preprocess inputs
  outlen = outlen || 32;
  input = util$1.normalizeInput(input);

  // do the math
  const ctx = blake2sInit(outlen, key);
  blake2sUpdate(ctx, input);
  return blake2sFinal(ctx)
}

// Computes the BLAKE2S hash of a string or byte array
//
// Returns an n-byte hash in hex, all lowercase
//
// Parameters:
// - input - the input bytes, as a string, Buffer, or Uint8Array
// - key - optional key Uint8Array, up to 32 bytes
// - outlen - optional output length in bytes, default 64
function blake2sHex (input, key, outlen) {
  const output = blake2s(input, key, outlen);
  return util$1.toHex(output)
}

var blake2s_1 = {
  blake2s: blake2s,
  blake2sHex: blake2sHex,
  blake2sInit: blake2sInit,
  blake2sUpdate: blake2sUpdate,
  blake2sFinal: blake2sFinal
};

const b2b = blake2b_1;
const b2s = blake2s_1;

({
  blake2b: b2b.blake2b,
  blake2bHex: b2b.blake2bHex,
  blake2bInit: b2b.blake2bInit,
  blake2bUpdate: b2b.blake2bUpdate,
  blake2bFinal: b2b.blake2bFinal,
  blake2s: b2s.blake2s,
  blake2sHex: b2s.blake2sHex,
  blake2sInit: b2s.blake2sInit,
  blake2sUpdate: b2s.blake2sUpdate,
  blake2sFinal: b2s.blake2sFinal
});

var createHash$1 = require$$1.createHash;

var safeBuffer = {exports: {}};

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

(function (module, exports) {
	/* eslint-disable node/no-deprecated-api */
	var buffer = require$$0$1;
	var Buffer = buffer.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	SafeBuffer.prototype = Object.create(Buffer.prototype);

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	}; 
} (safeBuffer, safeBuffer.exports));

var safeBufferExports = safeBuffer.exports;

// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// @ts-ignore
var _Buffer = safeBufferExports.Buffer;
function base$2 (ALPHABET) {
  if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
  var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
  function encode (source) {
    if (Array.isArray(source) || source instanceof Uint8Array) { source = _Buffer.from(source); }
    if (!_Buffer.isBuffer(source)) { throw new TypeError('Expected Buffer') }
    if (source.length === 0) { return '' }
        // Skip & count leading zeroes.
    var zeroes = 0;
    var length = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
        // Allocate enough space in big-endian base58 representation.
    var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
    var b58 = new Uint8Array(size);
        // Process the bytes.
    while (pbegin !== pend) {
      var carry = source[pbegin];
            // Apply "b58 = b58 * 256 + ch".
      var i = 0;
      for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
        carry += (256 * b58[it1]) >>> 0;
        b58[it1] = (carry % BASE) >>> 0;
        carry = (carry / BASE) >>> 0;
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i;
      pbegin++;
    }
        // Skip leading zeroes in base58 result.
    var it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
        // Translate the result into a string.
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]); }
    return str
  }
  function decodeUnsafe (source) {
    if (typeof source !== 'string') { throw new TypeError('Expected String') }
    if (source.length === 0) { return _Buffer.alloc(0) }
    var psz = 0;
        // Skip and count leading '1's.
    var zeroes = 0;
    var length = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
        // Allocate enough space in big-endian base256 representation.
    var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
    var b256 = new Uint8Array(size);
        // Process the characters.
    while (source[psz]) {
            // Decode character
      var carry = BASE_MAP[source.charCodeAt(psz)];
            // Invalid character
      if (carry === 255) { return }
      var i = 0;
      for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
        carry += (BASE * b256[it3]) >>> 0;
        b256[it3] = (carry % 256) >>> 0;
        carry = (carry / 256) >>> 0;
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i;
      psz++;
    }
        // Skip leading zeroes in b256.
    var it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
    vch.fill(0x00, 0, zeroes);
    var j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch
  }
  function decode (string) {
    var buffer = decodeUnsafe(string);
    if (buffer) { return buffer }
    throw new Error('Non-base' + BASE + ' character')
  }
  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}
var src = base$2;

var basex = src;
var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

var bs58 = basex(ALPHABET);

var base58 = bs58;
var Buffer$1 = safeBufferExports.Buffer;

var base$1 = function (checksumFn) {
  // Encode a buffer as a base58-check encoded string
  function encode (payload) {
    var checksum = checksumFn(payload);

    return base58.encode(Buffer$1.concat([
      payload,
      checksum
    ], payload.length + 4))
  }

  function decodeRaw (buffer) {
    var payload = buffer.slice(0, -4);
    var checksum = buffer.slice(-4);
    var newChecksum = checksumFn(payload);

    if (checksum[0] ^ newChecksum[0] |
        checksum[1] ^ newChecksum[1] |
        checksum[2] ^ newChecksum[2] |
        checksum[3] ^ newChecksum[3]) return

    return payload
  }

  // Decode a base58-check encoded string to a buffer, no result if checksum is wrong
  function decodeUnsafe (string) {
    var buffer = base58.decodeUnsafe(string);
    if (!buffer) return

    return decodeRaw(buffer)
  }

  function decode (string) {
    var buffer = base58.decode(string);
    var payload = decodeRaw(buffer);
    if (!payload) throw new Error('Invalid checksum')
    return payload
  }

  return {
    encode: encode,
    decode: decode,
    decodeUnsafe: decodeUnsafe
  }
};

var createHash = createHash$1;
var bs58checkBase = base$1;

// SHA256(SHA256(buffer))
function sha256x2 (buffer) {
  var tmp = createHash('sha256').update(buffer).digest();
  return createHash('sha256').update(tmp).digest()
}

var bs58check = bs58checkBase(sha256x2);

var bs58check$1 = /*@__PURE__*/getDefaultExportFromCjs(bs58check);

/*
 *      bignumber.js v9.1.2
 *      A JavaScript library for arbitrary-precision arithmetic.
 *      https://github.com/MikeMcl/bignumber.js
 *      Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
 *      MIT Licensed.
 *
 *      BigNumber.prototype methods     |  BigNumber methods
 *                                      |
 *      absoluteValue            abs    |  clone
 *      comparedTo                      |  config               set
 *      decimalPlaces            dp     |      DECIMAL_PLACES
 *      dividedBy                div    |      ROUNDING_MODE
 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
 *      exponentiatedBy          pow    |      RANGE
 *      integerValue                    |      CRYPTO
 *      isEqualTo                eq     |      MODULO_MODE
 *      isFinite                        |      POW_PRECISION
 *      isGreaterThan            gt     |      FORMAT
 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
 *      isInteger                       |  isBigNumber
 *      isLessThan               lt     |  maximum              max
 *      isLessThanOrEqualTo      lte    |  minimum              min
 *      isNaN                           |  random
 *      isNegative                      |  sum
 *      isPositive                      |
 *      isZero                          |
 *      minus                           |
 *      modulo                   mod    |
 *      multipliedBy             times  |
 *      negated                         |
 *      plus                            |
 *      precision                sd     |
 *      shiftedBy                       |
 *      squareRoot               sqrt   |
 *      toExponential                   |
 *      toFixed                         |
 *      toFormat                        |
 *      toFraction                      |
 *      toJSON                          |
 *      toNumber                        |
 *      toPrecision                     |
 *      toString                        |
 *      valueOf                         |
 *
 */


var
  isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
  mathceil = Math.ceil,
  mathfloor = Math.floor,

  bignumberError = '[BigNumber Error] ',
  tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

  BASE = 1e14,
  LOG_BASE = 14,
  MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
  // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
  POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
  SQRT_BASE = 1e7,

  // EDITABLE
  // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
  // the arguments to toExponential, toFixed, toFormat, and toPrecision.
  MAX = 1E9;                                   // 0 to MAX_INT32


/*
 * Create and return a BigNumber constructor.
 */
function clone(configObject) {
  var div, convertBase, parseNumeric,
    P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
    ONE = new BigNumber(1),


    //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


    // The default values below must be integers within the inclusive ranges stated.
    // The values can also be changed at run-time using BigNumber.set.

    // The maximum number of decimal places for operations involving division.
    DECIMAL_PLACES = 20,                     // 0 to MAX

    // The rounding mode used when rounding to the above decimal places, and when using
    // toExponential, toFixed, toFormat and toPrecision, and round (default value).
    // UP         0 Away from zero.
    // DOWN       1 Towards zero.
    // CEIL       2 Towards +Infinity.
    // FLOOR      3 Towards -Infinity.
    // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
    // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
    // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
    // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
    // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
    ROUNDING_MODE = 4,                       // 0 to 8

    // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

    // The exponent value at and beneath which toString returns exponential notation.
    // Number type: -7
    TO_EXP_NEG = -7,                         // 0 to -MAX

    // The exponent value at and above which toString returns exponential notation.
    // Number type: 21
    TO_EXP_POS = 21,                         // 0 to MAX

    // RANGE : [MIN_EXP, MAX_EXP]

    // The minimum exponent value, beneath which underflow to zero occurs.
    // Number type: -324  (5e-324)
    MIN_EXP = -1e7,                          // -1 to -MAX

    // The maximum exponent value, above which overflow to Infinity occurs.
    // Number type:  308  (1.7976931348623157e+308)
    // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
    MAX_EXP = 1e7,                           // 1 to MAX

    // Whether to use cryptographically-secure random number generation, if available.
    CRYPTO = false,                          // true or false

    // The modulo mode used when calculating the modulus: a mod n.
    // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
    // The remainder (r) is calculated as: r = a - n * q.
    //
    // UP        0 The remainder is positive if the dividend is negative, else is negative.
    // DOWN      1 The remainder has the same sign as the dividend.
    //             This modulo mode is commonly known as 'truncated division' and is
    //             equivalent to (a % n) in JavaScript.
    // FLOOR     3 The remainder has the same sign as the divisor (Python %).
    // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
    // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
    //             The remainder is always positive.
    //
    // The truncated division, floored division, Euclidian division and IEEE 754 remainder
    // modes are commonly used for the modulus operation.
    // Although the other rounding modes can also be used, they may not give useful results.
    MODULO_MODE = 1,                         // 0 to 9

    // The maximum number of significant digits of the result of the exponentiatedBy operation.
    // If POW_PRECISION is 0, there will be unlimited significant digits.
    POW_PRECISION = 0,                       // 0 to MAX

    // The format specification used by the BigNumber.prototype.toFormat method.
    FORMAT = {
      prefix: '',
      groupSize: 3,
      secondaryGroupSize: 0,
      groupSeparator: ',',
      decimalSeparator: '.',
      fractionGroupSize: 0,
      fractionGroupSeparator: '\xA0',        // non-breaking space
      suffix: ''
    },

    // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
    // '-', '.', whitespace, or repeated character.
    // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz',
    alphabetHasNormalDecimalDigits = true;


  //------------------------------------------------------------------------------------------


  // CONSTRUCTOR


  /*
   * The BigNumber constructor and exported function.
   * Create and return a new instance of a BigNumber object.
   *
   * v {number|string|BigNumber} A numeric value.
   * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
   */
  function BigNumber(v, b) {
    var alphabet, c, caseChanged, e, i, isNum, len, str,
      x = this;

    // Enable constructor call without `new`.
    if (!(x instanceof BigNumber)) return new BigNumber(v, b);

    if (b == null) {

      if (v && v._isBigNumber === true) {
        x.s = v.s;

        if (!v.c || v.e > MAX_EXP) {
          x.c = x.e = null;
        } else if (v.e < MIN_EXP) {
          x.c = [x.e = 0];
        } else {
          x.e = v.e;
          x.c = v.c.slice();
        }

        return;
      }

      if ((isNum = typeof v == 'number') && v * 0 == 0) {

        // Use `1 / n` to handle minus zero also.
        x.s = 1 / v < 0 ? (v = -v, -1) : 1;

        // Fast path for integers, where n < 2147483648 (2**31).
        if (v === ~~v) {
          for (e = 0, i = v; i >= 10; i /= 10, e++);

          if (e > MAX_EXP) {
            x.c = x.e = null;
          } else {
            x.e = e;
            x.c = [v];
          }

          return;
        }

        str = String(v);
      } else {

        if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

        x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
      }

      // Decimal point?
      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

      // Exponential form?
      if ((i = str.search(/e/i)) > 0) {

        // Determine exponent.
        if (e < 0) e = i;
        e += +str.slice(i + 1);
        str = str.substring(0, i);
      } else if (e < 0) {

        // Integer.
        e = str.length;
      }

    } else {

      // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
      intCheck(b, 2, ALPHABET.length, 'Base');

      // Allow exponential notation to be used with base 10 argument, while
      // also rounding to DECIMAL_PLACES as with other bases.
      if (b == 10 && alphabetHasNormalDecimalDigits) {
        x = new BigNumber(v);
        return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
      }

      str = String(v);

      if (isNum = typeof v == 'number') {

        // Avoid potential interpretation of Infinity and NaN as base 44+ values.
        if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

        x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
        if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
          throw Error
           (tooManyDigits + v);
        }
      } else {
        x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
      }

      alphabet = ALPHABET.slice(0, b);
      e = i = 0;

      // Check that str is a valid base b number.
      // Don't use RegExp, so alphabet can contain special characters.
      for (len = str.length; i < len; i++) {
        if (alphabet.indexOf(c = str.charAt(i)) < 0) {
          if (c == '.') {

            // If '.' is not the first character and it has not be found before.
            if (i > e) {
              e = len;
              continue;
            }
          } else if (!caseChanged) {

            // Allow e.g. hexadecimal 'FF' as well as 'ff'.
            if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                str == str.toLowerCase() && (str = str.toUpperCase())) {
              caseChanged = true;
              i = -1;
              e = 0;
              continue;
            }
          }

          return parseNumeric(x, String(v), isNum, b);
        }
      }

      // Prevent later check for length on converted number.
      isNum = false;
      str = convertBase(str, b, 10, x.s);

      // Decimal point?
      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
      else e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(--len) === 48;);

    if (str = str.slice(i, ++len)) {
      len -= i;

      // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
      if (isNum && BigNumber.DEBUG &&
        len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
          throw Error
           (tooManyDigits + (x.s * v));
      }

       // Overflow?
      if ((e = e - i - 1) > MAX_EXP) {

        // Infinity.
        x.c = x.e = null;

      // Underflow?
      } else if (e < MIN_EXP) {

        // Zero.
        x.c = [x.e = 0];
      } else {
        x.e = e;
        x.c = [];

        // Transform base

        // e is the base 10 exponent.
        // i is where to slice str to get the first element of the coefficient array.
        i = (e + 1) % LOG_BASE;
        if (e < 0) i += LOG_BASE;  // i < 1

        if (i < len) {
          if (i) x.c.push(+str.slice(0, i));

          for (len -= LOG_BASE; i < len;) {
            x.c.push(+str.slice(i, i += LOG_BASE));
          }

          i = LOG_BASE - (str = str.slice(i)).length;
        } else {
          i -= len;
        }

        for (; i--; str += '0');
        x.c.push(+str);
      }
    } else {

      // Zero.
      x.c = [x.e = 0];
    }
  }


  // CONSTRUCTOR PROPERTIES


  BigNumber.clone = clone;

  BigNumber.ROUND_UP = 0;
  BigNumber.ROUND_DOWN = 1;
  BigNumber.ROUND_CEIL = 2;
  BigNumber.ROUND_FLOOR = 3;
  BigNumber.ROUND_HALF_UP = 4;
  BigNumber.ROUND_HALF_DOWN = 5;
  BigNumber.ROUND_HALF_EVEN = 6;
  BigNumber.ROUND_HALF_CEIL = 7;
  BigNumber.ROUND_HALF_FLOOR = 8;
  BigNumber.EUCLID = 9;


  /*
   * Configure infrequently-changing library-wide settings.
   *
   * Accept an object with the following optional properties (if the value of a property is
   * a number, it must be an integer within the inclusive range stated):
   *
   *   DECIMAL_PLACES   {number}           0 to MAX
   *   ROUNDING_MODE    {number}           0 to 8
   *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
   *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
   *   CRYPTO           {boolean}          true or false
   *   MODULO_MODE      {number}           0 to 9
   *   POW_PRECISION       {number}           0 to MAX
   *   ALPHABET         {string}           A string of two or more unique characters which does
   *                                       not contain '.'.
   *   FORMAT           {object}           An object with some of the following properties:
   *     prefix                 {string}
   *     groupSize              {number}
   *     secondaryGroupSize     {number}
   *     groupSeparator         {string}
   *     decimalSeparator       {string}
   *     fractionGroupSize      {number}
   *     fractionGroupSeparator {string}
   *     suffix                 {string}
   *
   * (The values assigned to the above FORMAT object properties are not checked for validity.)
   *
   * E.g.
   * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
   *
   * Ignore properties/parameters set to null or undefined, except for ALPHABET.
   *
   * Return an object with the properties current values.
   */
  BigNumber.config = BigNumber.set = function (obj) {
    var p, v;

    if (obj != null) {

      if (typeof obj == 'object') {

        // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
        // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          DECIMAL_PLACES = v;
        }

        // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
        // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
          v = obj[p];
          intCheck(v, 0, 8, p);
          ROUNDING_MODE = v;
        }

        // EXPONENTIAL_AT {number|number[]}
        // Integer, -MAX to MAX inclusive or
        // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
        // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, 0, p);
            intCheck(v[1], 0, MAX, p);
            TO_EXP_NEG = v[0];
            TO_EXP_POS = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
          }
        }

        // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
        // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
        // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
        if (obj.hasOwnProperty(p = 'RANGE')) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, -1, p);
            intCheck(v[1], 1, MAX, p);
            MIN_EXP = v[0];
            MAX_EXP = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            if (v) {
              MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
            } else {
              throw Error
               (bignumberError + p + ' cannot be zero: ' + v);
            }
          }
        }

        // CRYPTO {boolean} true or false.
        // '[BigNumber Error] CRYPTO not true or false: {v}'
        // '[BigNumber Error] crypto unavailable'
        if (obj.hasOwnProperty(p = 'CRYPTO')) {
          v = obj[p];
          if (v === !!v) {
            if (v) {
              if (typeof crypto != 'undefined' && crypto &&
               (crypto.getRandomValues || crypto.randomBytes)) {
                CRYPTO = v;
              } else {
                CRYPTO = !v;
                throw Error
                 (bignumberError + 'crypto unavailable');
              }
            } else {
              CRYPTO = v;
            }
          } else {
            throw Error
             (bignumberError + p + ' not true or false: ' + v);
          }
        }

        // MODULO_MODE {number} Integer, 0 to 9 inclusive.
        // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
          v = obj[p];
          intCheck(v, 0, 9, p);
          MODULO_MODE = v;
        }

        // POW_PRECISION {number} Integer, 0 to MAX inclusive.
        // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          POW_PRECISION = v;
        }

        // FORMAT {object}
        // '[BigNumber Error] FORMAT not an object: {v}'
        if (obj.hasOwnProperty(p = 'FORMAT')) {
          v = obj[p];
          if (typeof v == 'object') FORMAT = v;
          else throw Error
           (bignumberError + p + ' not an object: ' + v);
        }

        // ALPHABET {string}
        // '[BigNumber Error] ALPHABET invalid: {v}'
        if (obj.hasOwnProperty(p = 'ALPHABET')) {
          v = obj[p];

          // Disallow if less than two characters,
          // or if it contains '+', '-', '.', whitespace, or a repeated character.
          if (typeof v == 'string' && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
            alphabetHasNormalDecimalDigits = v.slice(0, 10) == '0123456789';
            ALPHABET = v;
          } else {
            throw Error
             (bignumberError + p + ' invalid: ' + v);
          }
        }

      } else {

        // '[BigNumber Error] Object expected: {v}'
        throw Error
         (bignumberError + 'Object expected: ' + obj);
      }
    }

    return {
      DECIMAL_PLACES: DECIMAL_PLACES,
      ROUNDING_MODE: ROUNDING_MODE,
      EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
      RANGE: [MIN_EXP, MAX_EXP],
      CRYPTO: CRYPTO,
      MODULO_MODE: MODULO_MODE,
      POW_PRECISION: POW_PRECISION,
      FORMAT: FORMAT,
      ALPHABET: ALPHABET
    };
  };


  /*
   * Return true if v is a BigNumber instance, otherwise return false.
   *
   * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
   *
   * v {any}
   *
   * '[BigNumber Error] Invalid BigNumber: {v}'
   */
  BigNumber.isBigNumber = function (v) {
    if (!v || v._isBigNumber !== true) return false;
    if (!BigNumber.DEBUG) return true;

    var i, n,
      c = v.c,
      e = v.e,
      s = v.s;

    out: if ({}.toString.call(c) == '[object Array]') {

      if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

        // If the first element is zero, the BigNumber value must be zero.
        if (c[0] === 0) {
          if (e === 0 && c.length === 1) return true;
          break out;
        }

        // Calculate number of digits that c[0] should have, based on the exponent.
        i = (e + 1) % LOG_BASE;
        if (i < 1) i += LOG_BASE;

        // Calculate number of digits of c[0].
        //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
        if (String(c[0]).length == i) {

          for (i = 0; i < c.length; i++) {
            n = c[i];
            if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
          }

          // Last element cannot be zero, unless it is the only element.
          if (n !== 0) return true;
        }
      }

    // Infinity/NaN
    } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
      return true;
    }

    throw Error
      (bignumberError + 'Invalid BigNumber: ' + v);
  };


  /*
   * Return a new BigNumber whose value is the maximum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.maximum = BigNumber.max = function () {
    return maxOrMin(arguments, -1);
  };


  /*
   * Return a new BigNumber whose value is the minimum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.minimum = BigNumber.min = function () {
    return maxOrMin(arguments, 1);
  };


  /*
   * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
   * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
   * zeros are produced).
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
   * '[BigNumber Error] crypto unavailable'
   */
  BigNumber.random = (function () {
    var pow2_53 = 0x20000000000000;

    // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
    // Check if Math.random() produces more than 32 bits of randomness.
    // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
    // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
    var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
     ? function () { return mathfloor(Math.random() * pow2_53); }
     : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
       (Math.random() * 0x800000 | 0); };

    return function (dp) {
      var a, b, e, k, v,
        i = 0,
        c = [],
        rand = new BigNumber(ONE);

      if (dp == null) dp = DECIMAL_PLACES;
      else intCheck(dp, 0, MAX);

      k = mathceil(dp / LOG_BASE);

      if (CRYPTO) {

        // Browsers supporting crypto.getRandomValues.
        if (crypto.getRandomValues) {

          a = crypto.getRandomValues(new Uint32Array(k *= 2));

          for (; i < k;) {

            // 53 bits:
            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
            //                                     11111 11111111 11111111
            // 0x20000 is 2^21.
            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

            // Rejection sampling:
            // 0 <= v < 9007199254740992
            // Probability that v >= 9e15, is
            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
            if (v >= 9e15) {
              b = crypto.getRandomValues(new Uint32Array(2));
              a[i] = b[0];
              a[i + 1] = b[1];
            } else {

              // 0 <= v <= 8999999999999999
              // 0 <= (v % 1e14) <= 99999999999999
              c.push(v % 1e14);
              i += 2;
            }
          }
          i = k / 2;

        // Node.js supporting crypto.randomBytes.
        } else if (crypto.randomBytes) {

          // buffer
          a = crypto.randomBytes(k *= 7);

          for (; i < k;) {

            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
            // 0x100000000 is 2^32, 0x1000000 is 2^24
            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
            // 0 <= v < 9007199254740992
            v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
               (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
               (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

            if (v >= 9e15) {
              crypto.randomBytes(7).copy(a, i);
            } else {

              // 0 <= (v % 1e14) <= 99999999999999
              c.push(v % 1e14);
              i += 7;
            }
          }
          i = k / 7;
        } else {
          CRYPTO = false;
          throw Error
           (bignumberError + 'crypto unavailable');
        }
      }

      // Use Math.random.
      if (!CRYPTO) {

        for (; i < k;) {
          v = random53bitInt();
          if (v < 9e15) c[i++] = v % 1e14;
        }
      }

      k = c[--i];
      dp %= LOG_BASE;

      // Convert trailing digits to zeros according to dp.
      if (k && dp) {
        v = POWS_TEN[LOG_BASE - dp];
        c[i] = mathfloor(k / v) * v;
      }

      // Remove trailing elements which are zero.
      for (; c[i] === 0; c.pop(), i--);

      // Zero?
      if (i < 0) {
        c = [e = 0];
      } else {

        // Remove leading elements which are zero and adjust exponent accordingly.
        for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

        // Count the digits of the first element of c to determine leading zeros, and...
        for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

        // adjust the exponent accordingly.
        if (i < LOG_BASE) e -= LOG_BASE - i;
      }

      rand.e = e;
      rand.c = c;
      return rand;
    };
  })();


   /*
   * Return a BigNumber whose value is the sum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.sum = function () {
    var i = 1,
      args = arguments,
      sum = new BigNumber(args[0]);
    for (; i < args.length;) sum = sum.plus(args[i++]);
    return sum;
  };


  // PRIVATE FUNCTIONS


  // Called by BigNumber and BigNumber.prototype.toString.
  convertBase = (function () {
    var decimal = '0123456789';

    /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. toBaseOut('255', 10, 16) returns [15, 15].
     * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
     */
    function toBaseOut(str, baseIn, baseOut, alphabet) {
      var j,
        arr = [0],
        arrL,
        i = 0,
        len = str.length;

      for (; i < len;) {
        for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

        arr[0] += alphabet.indexOf(str.charAt(i++));

        for (j = 0; j < arr.length; j++) {

          if (arr[j] > baseOut - 1) {
            if (arr[j + 1] == null) arr[j + 1] = 0;
            arr[j + 1] += arr[j] / baseOut | 0;
            arr[j] %= baseOut;
          }
        }
      }

      return arr.reverse();
    }

    // Convert a numeric string of baseIn to a numeric string of baseOut.
    // If the caller is toString, we are converting from base 10 to baseOut.
    // If the caller is BigNumber, we are converting from baseIn to base 10.
    return function (str, baseIn, baseOut, sign, callerIsToString) {
      var alphabet, d, e, k, r, x, xc, y,
        i = str.indexOf('.'),
        dp = DECIMAL_PLACES,
        rm = ROUNDING_MODE;

      // Non-integer.
      if (i >= 0) {
        k = POW_PRECISION;

        // Unlimited precision.
        POW_PRECISION = 0;
        str = str.replace('.', '');
        y = new BigNumber(baseIn);
        x = y.pow(str.length - i);
        POW_PRECISION = k;

        // Convert str as if an integer, then restore the fraction part by dividing the
        // result by its base raised to a power.

        y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
         10, baseOut, decimal);
        y.e = y.c.length;
      }

      // Convert the number as integer.

      xc = toBaseOut(str, baseIn, baseOut, callerIsToString
       ? (alphabet = ALPHABET, decimal)
       : (alphabet = decimal, ALPHABET));

      // xc now represents str as an integer and converted to baseOut. e is the exponent.
      e = k = xc.length;

      // Remove trailing zeros.
      for (; xc[--k] == 0; xc.pop());

      // Zero?
      if (!xc[0]) return alphabet.charAt(0);

      // Does str represent an integer? If so, no need for the division.
      if (i < 0) {
        --e;
      } else {
        x.c = xc;
        x.e = e;

        // The sign is needed for correct rounding.
        x.s = sign;
        x = div(x, y, dp, rm, baseOut);
        xc = x.c;
        r = x.r;
        e = x.e;
      }

      // xc now represents str converted to baseOut.

      // THe index of the rounding digit.
      d = e + dp + 1;

      // The rounding digit: the digit to the right of the digit that may be rounded up.
      i = xc[d];

      // Look at the rounding digits and mode to determine whether to round up.

      k = baseOut / 2;
      r = r || d < 0 || xc[d + 1] != null;

      r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
            : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
             rm == (x.s < 0 ? 8 : 7));

      // If the index of the rounding digit is not greater than zero, or xc represents
      // zero, then the result of the base conversion is zero or, if rounding up, a value
      // such as 0.00001.
      if (d < 1 || !xc[0]) {

        // 1^-dp or 0
        str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
      } else {

        // Truncate xc to the required number of decimal places.
        xc.length = d;

        // Round up?
        if (r) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (--baseOut; ++xc[--d] > baseOut;) {
            xc[d] = 0;

            if (!d) {
              ++e;
              xc = [1].concat(xc);
            }
          }
        }

        // Determine trailing zeros.
        for (k = xc.length; !xc[--k];);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

        // Add leading zeros, decimal point and trailing zeros as required.
        str = toFixedPoint(str, e, alphabet.charAt(0));
      }

      // The caller will add the sign.
      return str;
    };
  })();


  // Perform division in the specified base. Called by div and convertBase.
  div = (function () {

    // Assume non-zero x and k.
    function multiply(x, k, base) {
      var m, temp, xlo, xhi,
        carry = 0,
        i = x.length,
        klo = k % SQRT_BASE,
        khi = k / SQRT_BASE | 0;

      for (x = x.slice(); i--;) {
        xlo = x[i] % SQRT_BASE;
        xhi = x[i] / SQRT_BASE | 0;
        m = khi * xlo + xhi * klo;
        temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
        carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
        x[i] = temp % base;
      }

      if (carry) x = [carry].concat(x);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, cmp;

      if (aL != bL) {
        cmp = aL > bL ? 1 : -1;
      } else {

        for (i = cmp = 0; i < aL; i++) {

          if (a[i] != b[i]) {
            cmp = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return cmp;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1; a.splice(0, 1));
    }

    // x: dividend, y: divisor.
    return function (x, y, dp, rm, base) {
      var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
        yL, yz,
        s = x.s == y.s ? 1 : -1,
        xc = x.c,
        yc = y.c;

      // Either NaN, Infinity or 0?
      if (!xc || !xc[0] || !yc || !yc[0]) {

        return new BigNumber(

         // Return NaN if either NaN, or both Infinity or 0.
         !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

          // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
          xc && xc[0] == 0 || !yc ? s * 0 : s / 0
       );
      }

      q = new BigNumber(s);
      qc = q.c = [];
      e = x.e - y.e;
      s = dp + e + 1;

      if (!base) {
        base = BASE;
        e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
        s = s / LOG_BASE | 0;
      }

      // Result exponent may be one less then the current value of e.
      // The coefficients of the BigNumbers from convertBase may have trailing zeros.
      for (i = 0; yc[i] == (xc[i] || 0); i++);

      if (yc[i] > (xc[i] || 0)) e--;

      if (s < 0) {
        qc.push(1);
        more = true;
      } else {
        xL = xc.length;
        yL = yc.length;
        i = 0;
        s += 2;

        // Normalise xc and yc so highest order digit of yc is >= base / 2.

        n = mathfloor(base / (yc[0] + 1));

        // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
        // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
        if (n > 1) {
          yc = multiply(yc, n, base);
          xc = multiply(xc, n, base);
          yL = yc.length;
          xL = xc.length;
        }

        xi = yL;
        rem = xc.slice(0, yL);
        remL = rem.length;

        // Add zeros to make remainder as long as divisor.
        for (; remL < yL; rem[remL++] = 0);
        yz = yc.slice();
        yz = [0].concat(yz);
        yc0 = yc[0];
        if (yc[1] >= base / 2) yc0++;
        // Not necessary, but to prevent trial digit n > base, when using base 3.
        // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

        do {
          n = 0;

          // Compare divisor and remainder.
          cmp = compare(yc, rem, yL, remL);

          // If divisor < remainder.
          if (cmp < 0) {

            // Calculate trial digit, n.

            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

            // n is how many times the divisor goes into the current remainder.
            n = mathfloor(rem0 / yc0);

            //  Algorithm:
            //  product = divisor multiplied by trial digit (n).
            //  Compare product and remainder.
            //  If product is greater than remainder:
            //    Subtract divisor from product, decrement trial digit.
            //  Subtract product from remainder.
            //  If product was less than remainder at the last compare:
            //    Compare new remainder and divisor.
            //    If remainder is greater than divisor:
            //      Subtract divisor from remainder, increment trial digit.

            if (n > 1) {

              // n may be > base only when base is 3.
              if (n >= base) n = base - 1;

              // product = divisor * trial digit.
              prod = multiply(yc, n, base);
              prodL = prod.length;
              remL = rem.length;

              // Compare product and remainder.
              // If product > remainder then trial digit n too high.
              // n is 1 too high about 5% of the time, and is not known to have
              // ever been more than 1 too high.
              while (compare(prod, rem, prodL, remL) == 1) {
                n--;

                // Subtract divisor from product.
                subtract(prod, yL < prodL ? yz : yc, prodL, base);
                prodL = prod.length;
                cmp = 1;
              }
            } else {

              // n is 0 or 1, cmp is -1.
              // If n is 0, there is no need to compare yc and rem again below,
              // so change cmp to 1 to avoid it.
              // If n is 1, leave cmp as -1, so yc and rem are compared again.
              if (n == 0) {

                // divisor < remainder, so n must be at least 1.
                cmp = n = 1;
              }

              // product = divisor
              prod = yc.slice();
              prodL = prod.length;
            }

            if (prodL < remL) prod = [0].concat(prod);

            // Subtract product from remainder.
            subtract(rem, prod, remL, base);
            remL = rem.length;

             // If product was < remainder.
            if (cmp == -1) {

              // Compare divisor and new remainder.
              // If divisor < new remainder, subtract divisor from remainder.
              // Trial digit n too low.
              // n is 1 too low about 5% of the time, and very rarely 2 too low.
              while (compare(yc, rem, yL, remL) < 1) {
                n++;

                // Subtract divisor from remainder.
                subtract(rem, yL < remL ? yz : yc, remL, base);
                remL = rem.length;
              }
            }
          } else if (cmp === 0) {
            n++;
            rem = [0];
          } // else cmp === 1 and n will be 0

          // Add the next digit, n, to the result array.
          qc[i++] = n;

          // Update the remainder.
          if (rem[0]) {
            rem[remL++] = xc[xi] || 0;
          } else {
            rem = [xc[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] != null) && s--);

        more = rem[0] != null;

        // Leading zero?
        if (!qc[0]) qc.splice(0, 1);
      }

      if (base == BASE) {

        // To calculate q.e, first get the number of digits of qc[0].
        for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

        round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

      // Caller is convertBase.
      } else {
        q.e = e;
        q.r = +more;
      }

      return q;
    };
  })();


  /*
   * Return a string representing the value of BigNumber n in fixed-point or exponential
   * notation rounded to the specified decimal places or significant digits.
   *
   * n: a BigNumber.
   * i: the index of the last digit required (i.e. the digit that may be rounded up).
   * rm: the rounding mode.
   * id: 1 (toExponential) or 2 (toPrecision).
   */
  function format(n, i, rm, id) {
    var c0, e, ne, len, str;

    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);

    if (!n.c) return n.toString();

    c0 = n.c[0];
    ne = n.e;

    if (i == null) {
      str = coeffToString(n.c);
      str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
       ? toExponential(str, ne)
       : toFixedPoint(str, ne, '0');
    } else {
      n = round(new BigNumber(n), i, rm);

      // n.e may have changed if the value was rounded up.
      e = n.e;

      str = coeffToString(n.c);
      len = str.length;

      // toPrecision returns exponential notation if the number of significant digits
      // specified is less than the number of digits necessary to represent the integer
      // part of the value in fixed-point notation.

      // Exponential notation.
      if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

        // Append zeros?
        for (; len < i; str += '0', len++);
        str = toExponential(str, e);

      // Fixed-point notation.
      } else {
        i -= ne;
        str = toFixedPoint(str, e, '0');

        // Append zeros?
        if (e + 1 > len) {
          if (--i > 0) for (str += '.'; i--; str += '0');
        } else {
          i += e - len;
          if (i > 0) {
            if (e + 1 == len) str += '.';
            for (; i--; str += '0');
          }
        }
      }
    }

    return n.s < 0 && c0 ? '-' + str : str;
  }


  // Handle BigNumber.max and BigNumber.min.
  // If any number is NaN, return NaN.
  function maxOrMin(args, n) {
    var k, y,
      i = 1,
      x = new BigNumber(args[0]);

    for (; i < args.length; i++) {
      y = new BigNumber(args[i]);
      if (!y.s || (k = compare(x, y)) === n || k === 0 && x.s === n) {
        x = y;
      }
    }

    return x;
  }


  /*
   * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
   * Called by minus, plus and times.
   */
  function normalise(n, c, e) {
    var i = 1,
      j = c.length;

     // Remove trailing zeros.
    for (; !c[--j]; c.pop());

    // Calculate the base 10 exponent. First get the number of digits of c[0].
    for (j = c[0]; j >= 10; j /= 10, i++);

    // Overflow?
    if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

      // Infinity.
      n.c = n.e = null;

    // Underflow?
    } else if (e < MIN_EXP) {

      // Zero.
      n.c = [n.e = 0];
    } else {
      n.e = e;
      n.c = c;
    }

    return n;
  }


  // Handle values that fail the validity test in BigNumber.
  parseNumeric = (function () {
    var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
      dotAfter = /^([^.]+)\.$/,
      dotBefore = /^\.([^.]+)$/,
      isInfinityOrNaN = /^-?(Infinity|NaN)$/,
      whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

    return function (x, str, isNum, b) {
      var base,
        s = isNum ? str : str.replace(whitespaceOrPlus, '');

      // No exception on ±Infinity or NaN.
      if (isInfinityOrNaN.test(s)) {
        x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
      } else {
        if (!isNum) {

          // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
          s = s.replace(basePrefix, function (m, p1, p2) {
            base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
            return !b || b == base ? p1 : m;
          });

          if (b) {
            base = b;

            // E.g. '1.' to '1', '.1' to '0.1'
            s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
          }

          if (str != s) return new BigNumber(s, base);
        }

        // '[BigNumber Error] Not a number: {n}'
        // '[BigNumber Error] Not a base {b} number: {n}'
        if (BigNumber.DEBUG) {
          throw Error
            (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
        }

        // NaN
        x.s = null;
      }

      x.c = x.e = null;
    }
  })();


  /*
   * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
   * If r is truthy, it is known that there are more digits after the rounding digit.
   */
  function round(x, sd, rm, r) {
    var d, i, j, k, n, ni, rd,
      xc = x.c,
      pows10 = POWS_TEN;

    // if x is not Infinity or NaN...
    if (xc) {

      // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
      // n is a base 1e14 number, the value of the element of array x.c containing rd.
      // ni is the index of n within x.c.
      // d is the number of digits of n.
      // i is the index of rd within n including leading zeros.
      // j is the actual index of rd within n (if < 0, rd is a leading zero).
      out: {

        // Get the number of digits of the first element of xc.
        for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
        i = sd - d;

        // If the rounding digit is in the first element of xc...
        if (i < 0) {
          i += LOG_BASE;
          j = sd;
          n = xc[ni = 0];

          // Get the rounding digit at index j of n.
          rd = mathfloor(n / pows10[d - j - 1] % 10);
        } else {
          ni = mathceil((i + 1) / LOG_BASE);

          if (ni >= xc.length) {

            if (r) {

              // Needed by sqrt.
              for (; xc.length <= ni; xc.push(0));
              n = rd = 0;
              d = 1;
              i %= LOG_BASE;
              j = i - LOG_BASE + 1;
            } else {
              break out;
            }
          } else {
            n = k = xc[ni];

            // Get the number of digits of n.
            for (d = 1; k >= 10; k /= 10, d++);

            // Get the index of rd within n.
            i %= LOG_BASE;

            // Get the index of rd within n, adjusted for leading zeros.
            // The number of leading zeros of n is given by LOG_BASE - d.
            j = i - LOG_BASE + d;

            // Get the rounding digit at index j of n.
            rd = j < 0 ? 0 : mathfloor(n / pows10[d - j - 1] % 10);
          }
        }

        r = r || sd < 0 ||

        // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
         xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

        r = rm < 4
         ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
         : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
           rm == (x.s < 0 ? 8 : 7));

        if (sd < 1 || !xc[0]) {
          xc.length = 0;

          if (r) {

            // Convert sd to decimal places.
            sd -= x.e + 1;

            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
            xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
            x.e = -sd || 0;
          } else {

            // Zero.
            xc[0] = x.e = 0;
          }

          return x;
        }

        // Remove excess digits.
        if (i == 0) {
          xc.length = ni;
          k = 1;
          ni--;
        } else {
          xc.length = ni + 1;
          k = pows10[LOG_BASE - i];

          // E.g. 56700 becomes 56000 if 7 is the rounding digit.
          // j > 0 means i > number of leading zeros of n.
          xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
        }

        // Round up?
        if (r) {

          for (; ;) {

            // If the digit to be rounded up is in the first element of xc...
            if (ni == 0) {

              // i will be the length of xc[0] before k is added.
              for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
              j = xc[0] += k;
              for (k = 1; j >= 10; j /= 10, k++);

              // if i != k the length has increased.
              if (i != k) {
                x.e++;
                if (xc[0] == BASE) xc[0] = 1;
              }

              break;
            } else {
              xc[ni] += k;
              if (xc[ni] != BASE) break;
              xc[ni--] = 0;
              k = 1;
            }
          }
        }

        // Remove trailing zeros.
        for (i = xc.length; xc[--i] === 0; xc.pop());
      }

      // Overflow? Infinity.
      if (x.e > MAX_EXP) {
        x.c = x.e = null;

      // Underflow? Zero.
      } else if (x.e < MIN_EXP) {
        x.c = [x.e = 0];
      }
    }

    return x;
  }


  function valueOf(n) {
    var str,
      e = n.e;

    if (e === null) return n.toString();

    str = coeffToString(n.c);

    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
      ? toExponential(str, e)
      : toFixedPoint(str, e, '0');

    return n.s < 0 ? '-' + str : str;
  }


  // PROTOTYPE/INSTANCE METHODS


  /*
   * Return a new BigNumber whose value is the absolute value of this BigNumber.
   */
  P.absoluteValue = P.abs = function () {
    var x = new BigNumber(this);
    if (x.s < 0) x.s = 1;
    return x;
  };


  /*
   * Return
   *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
   *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
   *   0 if they have the same value,
   *   or null if the value of either is NaN.
   */
  P.comparedTo = function (y, b) {
    return compare(this, new BigNumber(y, b));
  };


  /*
   * If dp is undefined or null or true or false, return the number of decimal places of the
   * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
   *
   * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
   * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
   * ROUNDING_MODE if rm is omitted.
   *
   * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.decimalPlaces = P.dp = function (dp, rm) {
    var c, n, v,
      x = this;

    if (dp != null) {
      intCheck(dp, 0, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      return round(new BigNumber(x), dp + x.e + 1, rm);
    }

    if (!(c = x.c)) return null;
    n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

    // Subtract the number of trailing zeros of the last number.
    if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
    if (n < 0) n = 0;

    return n;
  };


  /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
   * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
   */
  P.dividedBy = P.div = function (y, b) {
    return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
  };


  /*
   * Return a new BigNumber whose value is the integer part of dividing the value of this
   * BigNumber by the value of BigNumber(y, b).
   */
  P.dividedToIntegerBy = P.idiv = function (y, b) {
    return div(this, new BigNumber(y, b), 0, 1);
  };


  /*
   * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
   *
   * If m is present, return the result modulo m.
   * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
   * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
   *
   * The modular power operation works efficiently when x, n, and m are integers, otherwise it
   * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
   *
   * n {number|string|BigNumber} The exponent. An integer.
   * [m] {number|string|BigNumber} The modulus.
   *
   * '[BigNumber Error] Exponent not an integer: {n}'
   */
  P.exponentiatedBy = P.pow = function (n, m) {
    var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
      x = this;

    n = new BigNumber(n);

    // Allow NaN and ±Infinity, but not other non-integers.
    if (n.c && !n.isInteger()) {
      throw Error
        (bignumberError + 'Exponent not an integer: ' + valueOf(n));
    }

    if (m != null) m = new BigNumber(m);

    // Exponent of MAX_SAFE_INTEGER is 15.
    nIsBig = n.e > 14;

    // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
    if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

      // The sign of the result of pow when x is negative depends on the evenness of n.
      // If +n overflows to ±Infinity, the evenness of n would be not be known.
      y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? n.s * (2 - isOdd(n)) : +valueOf(n)));
      return m ? y.mod(m) : y;
    }

    nIsNeg = n.s < 0;

    if (m) {

      // x % m returns NaN if abs(m) is zero, or m is NaN.
      if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

      isModExp = !nIsNeg && x.isInteger() && m.isInteger();

      if (isModExp) x = x.mod(m);

    // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
    // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
    } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
      // [1, 240000000]
      ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
      // [80000000000000]  [99999750000000]
      : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

      // If x is negative and n is odd, k = -0, else k = 0.
      k = x.s < 0 && isOdd(n) ? -0 : 0;

      // If x >= 1, k = ±Infinity.
      if (x.e > -1) k = 1 / k;

      // If n is negative return ±0, else return ±Infinity.
      return new BigNumber(nIsNeg ? 1 / k : k);

    } else if (POW_PRECISION) {

      // Truncating each coefficient array to a length of k after each multiplication
      // equates to truncating significant digits to POW_PRECISION + [28, 41],
      // i.e. there will be a minimum of 28 guard digits retained.
      k = mathceil(POW_PRECISION / LOG_BASE + 2);
    }

    if (nIsBig) {
      half = new BigNumber(0.5);
      if (nIsNeg) n.s = 1;
      nIsOdd = isOdd(n);
    } else {
      i = Math.abs(+valueOf(n));
      nIsOdd = i % 2;
    }

    y = new BigNumber(ONE);

    // Performs 54 loop iterations for n of 9007199254740991.
    for (; ;) {

      if (nIsOdd) {
        y = y.times(x);
        if (!y.c) break;

        if (k) {
          if (y.c.length > k) y.c.length = k;
        } else if (isModExp) {
          y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
        }
      }

      if (i) {
        i = mathfloor(i / 2);
        if (i === 0) break;
        nIsOdd = i % 2;
      } else {
        n = n.times(half);
        round(n, n.e + 1, 1);

        if (n.e > 14) {
          nIsOdd = isOdd(n);
        } else {
          i = +valueOf(n);
          if (i === 0) break;
          nIsOdd = i % 2;
        }
      }

      x = x.times(x);

      if (k) {
        if (x.c && x.c.length > k) x.c.length = k;
      } else if (isModExp) {
        x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
      }
    }

    if (isModExp) return y;
    if (nIsNeg) y = ONE.div(y);

    return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
   * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
   *
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
   */
  P.integerValue = function (rm) {
    var n = new BigNumber(this);
    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);
    return round(n, n.e + 1, rm);
  };


  /*
   * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isEqualTo = P.eq = function (y, b) {
    return compare(this, new BigNumber(y, b)) === 0;
  };


  /*
   * Return true if the value of this BigNumber is a finite number, otherwise return false.
   */
  P.isFinite = function () {
    return !!this.c;
  };


  /*
   * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isGreaterThan = P.gt = function (y, b) {
    return compare(this, new BigNumber(y, b)) > 0;
  };


  /*
   * Return true if the value of this BigNumber is greater than or equal to the value of
   * BigNumber(y, b), otherwise return false.
   */
  P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
    return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

  };


  /*
   * Return true if the value of this BigNumber is an integer, otherwise return false.
   */
  P.isInteger = function () {
    return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
  };


  /*
   * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isLessThan = P.lt = function (y, b) {
    return compare(this, new BigNumber(y, b)) < 0;
  };


  /*
   * Return true if the value of this BigNumber is less than or equal to the value of
   * BigNumber(y, b), otherwise return false.
   */
  P.isLessThanOrEqualTo = P.lte = function (y, b) {
    return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
  };


  /*
   * Return true if the value of this BigNumber is NaN, otherwise return false.
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this BigNumber is negative, otherwise return false.
   */
  P.isNegative = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this BigNumber is positive, otherwise return false.
   */
  P.isPositive = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
   */
  P.isZero = function () {
    return !!this.c && this.c[0] == 0;
  };


  /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new BigNumber whose value is the value of this BigNumber minus the value of
   * BigNumber(y, b).
   */
  P.minus = function (y, b) {
    var i, j, t, xLTy,
      x = this,
      a = x.s;

    y = new BigNumber(y, b);
    b = y.s;

    // Either NaN?
    if (!a || !b) return new BigNumber(NaN);

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }

    var xe = x.e / LOG_BASE,
      ye = y.e / LOG_BASE,
      xc = x.c,
      yc = y.c;

    if (!xe || !ye) {

      // Either Infinity?
      if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

      // Either zero?
      if (!xc[0] || !yc[0]) {

        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
        return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

         // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
         ROUNDING_MODE == 3 ? -0 : 0);
      }
    }

    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();

    // Determine which is the bigger number.
    if (a = xe - ye) {

      if (xLTy = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }

      t.reverse();

      // Prepend zeros to equalise exponents.
      for (b = a; b--; t.push(0));
      t.reverse();
    } else {

      // Exponents equal. Check digit by digit.
      j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

      for (a = b = 0; b < j; b++) {

        if (xc[b] != yc[b]) {
          xLTy = xc[b] < yc[b];
          break;
        }
      }
    }

    // x < y? Point xc to the array of the bigger number.
    if (xLTy) {
      t = xc;
      xc = yc;
      yc = t;
      y.s = -y.s;
    }

    b = (j = yc.length) - (i = xc.length);

    // Append zeros to xc if shorter.
    // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
    if (b > 0) for (; b--; xc[i++] = 0);
    b = BASE - 1;

    // Subtract yc from xc.
    for (; j > a;) {

      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i]; xc[i] = b);
        --xc[i];
        xc[j] += BASE;
      }

      xc[j] -= yc[j];
    }

    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] == 0; xc.splice(0, 1), --ye);

    // Zero?
    if (!xc[0]) {

      // Following IEEE 754 (2008) 6.3,
      // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
      y.s = ROUNDING_MODE == 3 ? -1 : 1;
      y.c = [y.e = 0];
      return y;
    }

    // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
    // for finite x and y.
    return normalise(y, xc, ye);
  };


  /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
   * BigNumber(y, b). The result depends on the value of MODULO_MODE.
   */
  P.modulo = P.mod = function (y, b) {
    var q, s,
      x = this;

    y = new BigNumber(y, b);

    // Return NaN if x is Infinity or NaN, or y is NaN or zero.
    if (!x.c || !y.s || y.c && !y.c[0]) {
      return new BigNumber(NaN);

    // Return x if y is Infinity or x is zero.
    } else if (!y.c || x.c && !x.c[0]) {
      return new BigNumber(x);
    }

    if (MODULO_MODE == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // r = x - qy    where  0 <= r < abs(y)
      s = y.s;
      y.s = 1;
      q = div(x, y, 0, 3);
      y.s = s;
      q.s *= s;
    } else {
      q = div(x, y, 0, MODULO_MODE);
    }

    y = x.minus(q.times(y));

    // To match JavaScript %, ensure sign of zero is sign of dividend.
    if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

    return y;
  };


  /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
   * of BigNumber(y, b).
   */
  P.multipliedBy = P.times = function (y, b) {
    var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
      base, sqrtBase,
      x = this,
      xc = x.c,
      yc = (y = new BigNumber(y, b)).c;

    // Either NaN, ±Infinity or ±0?
    if (!xc || !yc || !xc[0] || !yc[0]) {

      // Return NaN if either is NaN, or one is 0 and the other is Infinity.
      if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
        y.c = y.e = y.s = null;
      } else {
        y.s *= x.s;

        // Return ±Infinity if either is ±Infinity.
        if (!xc || !yc) {
          y.c = y.e = null;

        // Return ±0 if either is ±0.
        } else {
          y.c = [0];
          y.e = 0;
        }
      }

      return y;
    }

    e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
    y.s *= x.s;
    xcL = xc.length;
    ycL = yc.length;

    // Ensure xc points to longer array and xcL to its length.
    if (xcL < ycL) {
      zc = xc;
      xc = yc;
      yc = zc;
      i = xcL;
      xcL = ycL;
      ycL = i;
    }

    // Initialise the result array with zeros.
    for (i = xcL + ycL, zc = []; i--; zc.push(0));

    base = BASE;
    sqrtBase = SQRT_BASE;

    for (i = ycL; --i >= 0;) {
      c = 0;
      ylo = yc[i] % sqrtBase;
      yhi = yc[i] / sqrtBase | 0;

      for (k = xcL, j = i + k; j > i;) {
        xlo = xc[--k] % sqrtBase;
        xhi = xc[k] / sqrtBase | 0;
        m = yhi * xlo + xhi * ylo;
        xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
        c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
        zc[j--] = xlo % base;
      }

      zc[j] = c;
    }

    if (c) {
      ++e;
    } else {
      zc.splice(0, 1);
    }

    return normalise(y, zc, e);
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber negated,
   * i.e. multiplied by -1.
   */
  P.negated = function () {
    var x = new BigNumber(this);
    x.s = -x.s || null;
    return x;
  };


  /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new BigNumber whose value is the value of this BigNumber plus the value of
   * BigNumber(y, b).
   */
  P.plus = function (y, b) {
    var t,
      x = this,
      a = x.s;

    y = new BigNumber(y, b);
    b = y.s;

    // Either NaN?
    if (!a || !b) return new BigNumber(NaN);

    // Signs differ?
     if (a != b) {
      y.s = -b;
      return x.minus(y);
    }

    var xe = x.e / LOG_BASE,
      ye = y.e / LOG_BASE,
      xc = x.c,
      yc = y.c;

    if (!xe || !ye) {

      // Return ±Infinity if either ±Infinity.
      if (!xc || !yc) return new BigNumber(a / 0);

      // Either zero?
      // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
      if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
    }

    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();

    // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
    if (a = xe - ye) {
      if (a > 0) {
        ye = xe;
        t = yc;
      } else {
        a = -a;
        t = xc;
      }

      t.reverse();
      for (; a--; t.push(0));
      t.reverse();
    }

    a = xc.length;
    b = yc.length;

    // Point xc to the longer array, and b to the shorter length.
    if (a - b < 0) {
      t = yc;
      yc = xc;
      xc = t;
      b = a;
    }

    // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
    for (a = 0; b;) {
      a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
      xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
    }

    if (a) {
      xc = [a].concat(xc);
      ++ye;
    }

    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    // ye = MAX_EXP + 1 possible
    return normalise(y, xc, ye);
  };


  /*
   * If sd is undefined or null or true or false, return the number of significant digits of
   * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
   * If sd is true include integer-part trailing zeros in the count.
   *
   * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
   * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
   * ROUNDING_MODE if rm is omitted.
   *
   * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
   *                     boolean: whether to count integer-part trailing zeros: true or false.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
   */
  P.precision = P.sd = function (sd, rm) {
    var c, n, v,
      x = this;

    if (sd != null && sd !== !!sd) {
      intCheck(sd, 1, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      return round(new BigNumber(x), sd, rm);
    }

    if (!(c = x.c)) return null;
    v = c.length - 1;
    n = v * LOG_BASE + 1;

    if (v = c[v]) {

      // Subtract the number of trailing zeros of the last element.
      for (; v % 10 == 0; v /= 10, n--);

      // Add the number of digits of the first element.
      for (v = c[0]; v >= 10; v /= 10, n++);
    }

    if (sd && x.e + 1 > n) n = x.e + 1;

    return n;
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
   * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
   *
   * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
   */
  P.shiftedBy = function (k) {
    intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
    return this.times('1e' + k);
  };


  /*
   *  sqrt(-n) =  N
   *  sqrt(N) =  N
   *  sqrt(-I) =  N
   *  sqrt(I) =  I
   *  sqrt(0) =  0
   *  sqrt(-0) = -0
   *
   * Return a new BigNumber whose value is the square root of the value of this BigNumber,
   * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, r, rep, t,
      x = this,
      c = x.c,
      s = x.s,
      e = x.e,
      dp = DECIMAL_PLACES + 4,
      half = new BigNumber('0.5');

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !c || !c[0]) {
      return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
    }

    // Initial estimate.
    s = Math.sqrt(+valueOf(x));

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = coeffToString(c);
      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(+n);
      e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new BigNumber(n);
    } else {
      r = new BigNumber(s + '');
    }

    // Check for zero.
    // r could be zero if MIN_EXP is changed after the this value was created.
    // This would cause a division by zero (x/t) and hence Infinity below, which would cause
    // coeffToString to throw.
    if (r.c[0]) {
      e = r.e;
      s = e + dp;
      if (s < 3) s = 0;

      // Newton-Raphson iteration.
      for (; ;) {
        t = r;
        r = half.times(t.plus(div(x, t, dp, 1)));

        if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

          // The exponent of r may here be one less than the final result exponent,
          // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
          // are indexed correctly.
          if (r.e < e) --s;
          n = n.slice(s - 3, s + 1);

          // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
          // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
          // iteration.
          if (n == '9999' || !rep && n == '4999') {

            // On the first iteration only, check to see if rounding up gives the
            // exact result as the nines may infinitely repeat.
            if (!rep) {
              round(t, t.e + DECIMAL_PLACES + 2, 0);

              if (t.times(t).eq(x)) {
                r = t;
                break;
              }
            }

            dp += 4;
            s += 4;
            rep = 1;
          } else {

            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
            // result. If not, then there are further digits and m will be truthy.
            if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

              // Truncate to the first rounding digit.
              round(r, r.e + DECIMAL_PLACES + 2, 1);
              m = !r.times(r).eq(x);
            }

            break;
          }
        }
      }
    }

    return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
  };


  /*
   * Return a string representing the value of this BigNumber in exponential notation and
   * rounded using ROUNDING_MODE to dp fixed decimal places.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.toExponential = function (dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp++;
    }
    return format(this, dp, rm, 1);
  };


  /*
   * Return a string representing the value of this BigNumber in fixed-point notation rounding
   * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
   *
   * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
   * but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.toFixed = function (dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp = dp + this.e + 1;
    }
    return format(this, dp, rm);
  };


  /*
   * Return a string representing the value of this BigNumber in fixed-point notation rounded
   * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
   * of the format or FORMAT object (see BigNumber.set).
   *
   * The formatting object may contain some or all of the properties shown below.
   *
   * FORMAT = {
   *   prefix: '',
   *   groupSize: 3,
   *   secondaryGroupSize: 0,
   *   groupSeparator: ',',
   *   decimalSeparator: '.',
   *   fractionGroupSize: 0,
   *   fractionGroupSeparator: '\xA0',      // non-breaking space
   *   suffix: ''
   * };
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   * [format] {object} Formatting options. See FORMAT pbject above.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   * '[BigNumber Error] Argument not an object: {format}'
   */
  P.toFormat = function (dp, rm, format) {
    var str,
      x = this;

    if (format == null) {
      if (dp != null && rm && typeof rm == 'object') {
        format = rm;
        rm = null;
      } else if (dp && typeof dp == 'object') {
        format = dp;
        dp = rm = null;
      } else {
        format = FORMAT;
      }
    } else if (typeof format != 'object') {
      throw Error
        (bignumberError + 'Argument not an object: ' + format);
    }

    str = x.toFixed(dp, rm);

    if (x.c) {
      var i,
        arr = str.split('.'),
        g1 = +format.groupSize,
        g2 = +format.secondaryGroupSize,
        groupSeparator = format.groupSeparator || '',
        intPart = arr[0],
        fractionPart = arr[1],
        isNeg = x.s < 0,
        intDigits = isNeg ? intPart.slice(1) : intPart,
        len = intDigits.length;

      if (g2) {
        i = g1;
        g1 = g2;
        g2 = i;
        len -= i;
      }

      if (g1 > 0 && len > 0) {
        i = len % g1 || g1;
        intPart = intDigits.substr(0, i);
        for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
        if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
        if (isNeg) intPart = '-' + intPart;
      }

      str = fractionPart
       ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
        ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
         '$&' + (format.fractionGroupSeparator || ''))
        : fractionPart)
       : intPart;
    }

    return (format.prefix || '') + str + (format.suffix || '');
  };


  /*
   * Return an array of two BigNumbers representing the value of this BigNumber as a simple
   * fraction with an integer numerator and an integer denominator.
   * The denominator will be a positive non-zero value less than or equal to the specified
   * maximum denominator. If a maximum denominator is not specified, the denominator will be
   * the lowest value necessary to represent the number exactly.
   *
   * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
   *
   * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
   */
  P.toFraction = function (md) {
    var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
      x = this,
      xc = x.c;

    if (md != null) {
      n = new BigNumber(md);

      // Throw if md is less than one or is not an integer, unless it is Infinity.
      if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
        throw Error
          (bignumberError + 'Argument ' +
            (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
      }
    }

    if (!xc) return new BigNumber(x);

    d = new BigNumber(ONE);
    n1 = d0 = new BigNumber(ONE);
    d1 = n0 = new BigNumber(ONE);
    s = coeffToString(xc);

    // Determine initial denominator.
    // d is a power of 10 and the minimum max denominator that specifies the value exactly.
    e = d.e = s.length - x.e - 1;
    d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
    md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

    exp = MAX_EXP;
    MAX_EXP = 1 / 0;
    n = new BigNumber(s);

    // n0 = d1 = 0
    n0.c[0] = 0;

    for (; ;)  {
      q = div(n, d, 0, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.comparedTo(md) == 1) break;
      d0 = d1;
      d1 = d2;
      n1 = n0.plus(q.times(d2 = n1));
      n0 = d2;
      d = n.minus(q.times(d2 = d));
      n = d2;
    }

    d2 = div(md.minus(d0), d1, 0, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;
    e = e * 2;

    // Determine which fraction is closer to x, n0/d0 or n1/d1
    r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
        div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

    MAX_EXP = exp;

    return r;
  };


  /*
   * Return the value of this BigNumber converted to a number primitive.
   */
  P.toNumber = function () {
    return +valueOf(this);
  };


  /*
   * Return a string representing the value of this BigNumber rounded to sd significant digits
   * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
   * necessary to represent the integer part of the value in fixed-point notation, then use
   * exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
   */
  P.toPrecision = function (sd, rm) {
    if (sd != null) intCheck(sd, 1, MAX);
    return format(this, sd, rm, 2);
  };


  /*
   * Return a string representing the value of this BigNumber in base b, or base 10 if b is
   * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
   * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
   * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
   * TO_EXP_NEG, return exponential notation.
   *
   * [b] {number} Integer, 2 to ALPHABET.length inclusive.
   *
   * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
   */
  P.toString = function (b) {
    var str,
      n = this,
      s = n.s,
      e = n.e;

    // Infinity or NaN?
    if (e === null) {
      if (s) {
        str = 'Infinity';
        if (s < 0) str = '-' + str;
      } else {
        str = 'NaN';
      }
    } else {
      if (b == null) {
        str = e <= TO_EXP_NEG || e >= TO_EXP_POS
         ? toExponential(coeffToString(n.c), e)
         : toFixedPoint(coeffToString(n.c), e, '0');
      } else if (b === 10 && alphabetHasNormalDecimalDigits) {
        n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
        str = toFixedPoint(coeffToString(n.c), n.e, '0');
      } else {
        intCheck(b, 2, ALPHABET.length, 'Base');
        str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
      }

      if (s < 0 && n.c[0]) str = '-' + str;
    }

    return str;
  };


  /*
   * Return as toString, but do not accept a base argument, and include the minus sign for
   * negative zero.
   */
  P.valueOf = P.toJSON = function () {
    return valueOf(this);
  };


  P._isBigNumber = true;

  P[Symbol.toStringTag] = 'BigNumber';

  // Node.js v10.12.0+
  P[Symbol.for('nodejs.util.inspect.custom')] = P.valueOf;

  if (configObject != null) BigNumber.set(configObject);

  return BigNumber;
}


// PRIVATE HELPER FUNCTIONS

// These functions don't need access to variables,
// e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


function bitFloor(n) {
  var i = n | 0;
  return n > 0 || n === i ? i : i - 1;
}


// Return a coefficient array as a string of base 10 digits.
function coeffToString(a) {
  var s, z,
    i = 1,
    j = a.length,
    r = a[0] + '';

  for (; i < j;) {
    s = a[i++] + '';
    z = LOG_BASE - s.length;
    for (; z--; s = '0' + s);
    r += s;
  }

  // Determine trailing zeros.
  for (j = r.length; r.charCodeAt(--j) === 48;);

  return r.slice(0, j + 1 || 1);
}


// Compare the value of BigNumbers x and y.
function compare(x, y) {
  var a, b,
    xc = x.c,
    yc = y.c,
    i = x.s,
    j = y.s,
    k = x.e,
    l = y.e;

  // Either NaN?
  if (!i || !j) return null;

  a = xc && !xc[0];
  b = yc && !yc[0];

  // Either zero?
  if (a || b) return a ? b ? 0 : -j : i;

  // Signs differ?
  if (i != j) return i;

  a = i < 0;
  b = k == l;

  // Either Infinity?
  if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

  // Compare exponents.
  if (!b) return k > l ^ a ? 1 : -1;

  j = (k = xc.length) < (l = yc.length) ? k : l;

  // Compare digit by digit.
  for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

  // Compare lengths.
  return k == l ? 0 : k > l ^ a ? 1 : -1;
}


/*
 * Check that n is a primitive number, an integer, and in range, otherwise throw.
 */
function intCheck(n, min, max, name) {
  if (n < min || n > max || n !== mathfloor(n)) {
    throw Error
     (bignumberError + (name || 'Argument') + (typeof n == 'number'
       ? n < min || n > max ? ' out of range: ' : ' not an integer: '
       : ' not a primitive number: ') + String(n));
  }
}


// Assumes finite n.
function isOdd(n) {
  var k = n.c.length - 1;
  return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
}


function toExponential(str, e) {
  return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
   (e < 0 ? 'e' : 'e+') + e;
}


function toFixedPoint(str, e, z) {
  var len, zs;

  // Negative exponent?
  if (e < 0) {

    // Prepend zeros.
    for (zs = z + '.'; ++e; zs += z);
    str = zs + str;

  // Positive exponent
  } else {
    len = str.length;

    // Append zeros.
    if (++e > len) {
      for (zs = z, e -= len; --e; zs += z);
      str += zs;
    } else if (e < len) {
      str = str.slice(0, e) + '.' + str.slice(e);
    }
  }

  return str;
}


// EXPORT


clone();

var elliptic$1 = {};

var name = "elliptic";
var version = "6.5.5";
var description = "EC cryptography";
var main = "lib/elliptic.js";
var files = [
	"lib"
];
var scripts = {
	lint: "eslint lib test",
	"lint:fix": "npm run lint -- --fix",
	unit: "istanbul test _mocha --reporter=spec test/index.js",
	test: "npm run lint && npm run unit",
	version: "grunt dist && git add dist/"
};
var repository = {
	type: "git",
	url: "git@github.com:indutny/elliptic"
};
var keywords = [
	"EC",
	"Elliptic",
	"curve",
	"Cryptography"
];
var author = "Fedor Indutny <fedor@indutny.com>";
var license = "MIT";
var bugs = {
	url: "https://github.com/indutny/elliptic/issues"
};
var homepage = "https://github.com/indutny/elliptic";
var devDependencies = {
	brfs: "^2.0.2",
	coveralls: "^3.1.0",
	eslint: "^7.6.0",
	grunt: "^1.2.1",
	"grunt-browserify": "^5.3.0",
	"grunt-cli": "^1.3.2",
	"grunt-contrib-connect": "^3.0.0",
	"grunt-contrib-copy": "^1.0.0",
	"grunt-contrib-uglify": "^5.0.0",
	"grunt-mocha-istanbul": "^5.0.2",
	"grunt-saucelabs": "^9.0.1",
	istanbul: "^0.4.5",
	mocha: "^8.0.1"
};
var dependencies = {
	"bn.js": "^4.11.9",
	brorand: "^1.1.0",
	"hash.js": "^1.0.0",
	"hmac-drbg": "^1.0.1",
	inherits: "^2.0.4",
	"minimalistic-assert": "^1.0.1",
	"minimalistic-crypto-utils": "^1.0.1"
};
var require$$0 = {
	name: name,
	version: version,
	description: description,
	main: main,
	files: files,
	scripts: scripts,
	repository: repository,
	keywords: keywords,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	devDependencies: devDependencies,
	dependencies: dependencies
};

var utils$m = {};

var bn = {exports: {}};

bn.exports;

(function (module) {
	(function (module, exports) {

	  // Utils
	  function assert (val, msg) {
	    if (!val) throw new Error(msg || 'Assertion failed');
	  }

	  // Could use `inherits` module, but don't want to move from single file
	  // architecture yet.
	  function inherits (ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  }

	  // BN

	  function BN (number, base, endian) {
	    if (BN.isBN(number)) {
	      return number;
	    }

	    this.negative = 0;
	    this.words = null;
	    this.length = 0;

	    // Reduction context
	    this.red = null;

	    if (number !== null) {
	      if (base === 'le' || base === 'be') {
	        endian = base;
	        base = 10;
	      }

	      this._init(number || 0, base || 10, endian || 'be');
	    }
	  }
	  if (typeof module === 'object') {
	    module.exports = BN;
	  } else {
	    exports.BN = BN;
	  }

	  BN.BN = BN;
	  BN.wordSize = 26;

	  var Buffer;
	  try {
	    if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
	      Buffer = window.Buffer;
	    } else {
	      Buffer = require('buffer').Buffer;
	    }
	  } catch (e) {
	  }

	  BN.isBN = function isBN (num) {
	    if (num instanceof BN) {
	      return true;
	    }

	    return num !== null && typeof num === 'object' &&
	      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
	  };

	  BN.max = function max (left, right) {
	    if (left.cmp(right) > 0) return left;
	    return right;
	  };

	  BN.min = function min (left, right) {
	    if (left.cmp(right) < 0) return left;
	    return right;
	  };

	  BN.prototype._init = function init (number, base, endian) {
	    if (typeof number === 'number') {
	      return this._initNumber(number, base, endian);
	    }

	    if (typeof number === 'object') {
	      return this._initArray(number, base, endian);
	    }

	    if (base === 'hex') {
	      base = 16;
	    }
	    assert(base === (base | 0) && base >= 2 && base <= 36);

	    number = number.toString().replace(/\s+/g, '');
	    var start = 0;
	    if (number[0] === '-') {
	      start++;
	      this.negative = 1;
	    }

	    if (start < number.length) {
	      if (base === 16) {
	        this._parseHex(number, start, endian);
	      } else {
	        this._parseBase(number, base, start);
	        if (endian === 'le') {
	          this._initArray(this.toArray(), base, endian);
	        }
	      }
	    }
	  };

	  BN.prototype._initNumber = function _initNumber (number, base, endian) {
	    if (number < 0) {
	      this.negative = 1;
	      number = -number;
	    }
	    if (number < 0x4000000) {
	      this.words = [ number & 0x3ffffff ];
	      this.length = 1;
	    } else if (number < 0x10000000000000) {
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff
	      ];
	      this.length = 2;
	    } else {
	      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff,
	        1
	      ];
	      this.length = 3;
	    }

	    if (endian !== 'le') return;

	    // Reverse the bytes
	    this._initArray(this.toArray(), base, endian);
	  };

	  BN.prototype._initArray = function _initArray (number, base, endian) {
	    // Perhaps a Uint8Array
	    assert(typeof number.length === 'number');
	    if (number.length <= 0) {
	      this.words = [ 0 ];
	      this.length = 1;
	      return this;
	    }

	    this.length = Math.ceil(number.length / 3);
	    this.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      this.words[i] = 0;
	    }

	    var j, w;
	    var off = 0;
	    if (endian === 'be') {
	      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
	        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
	        this.words[j] |= (w << off) & 0x3ffffff;
	        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	        off += 24;
	        if (off >= 26) {
	          off -= 26;
	          j++;
	        }
	      }
	    } else if (endian === 'le') {
	      for (i = 0, j = 0; i < number.length; i += 3) {
	        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
	        this.words[j] |= (w << off) & 0x3ffffff;
	        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	        off += 24;
	        if (off >= 26) {
	          off -= 26;
	          j++;
	        }
	      }
	    }
	    return this.strip();
	  };

	  function parseHex4Bits (string, index) {
	    var c = string.charCodeAt(index);
	    // 'A' - 'F'
	    if (c >= 65 && c <= 70) {
	      return c - 55;
	    // 'a' - 'f'
	    } else if (c >= 97 && c <= 102) {
	      return c - 87;
	    // '0' - '9'
	    } else {
	      return (c - 48) & 0xf;
	    }
	  }

	  function parseHexByte (string, lowerBound, index) {
	    var r = parseHex4Bits(string, index);
	    if (index - 1 >= lowerBound) {
	      r |= parseHex4Bits(string, index - 1) << 4;
	    }
	    return r;
	  }

	  BN.prototype._parseHex = function _parseHex (number, start, endian) {
	    // Create possibly bigger array to ensure that it fits the number
	    this.length = Math.ceil((number.length - start) / 6);
	    this.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      this.words[i] = 0;
	    }

	    // 24-bits chunks
	    var off = 0;
	    var j = 0;

	    var w;
	    if (endian === 'be') {
	      for (i = number.length - 1; i >= start; i -= 2) {
	        w = parseHexByte(number, start, i) << off;
	        this.words[j] |= w & 0x3ffffff;
	        if (off >= 18) {
	          off -= 18;
	          j += 1;
	          this.words[j] |= w >>> 26;
	        } else {
	          off += 8;
	        }
	      }
	    } else {
	      var parseLength = number.length - start;
	      for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
	        w = parseHexByte(number, start, i) << off;
	        this.words[j] |= w & 0x3ffffff;
	        if (off >= 18) {
	          off -= 18;
	          j += 1;
	          this.words[j] |= w >>> 26;
	        } else {
	          off += 8;
	        }
	      }
	    }

	    this.strip();
	  };

	  function parseBase (str, start, end, mul) {
	    var r = 0;
	    var len = Math.min(str.length, end);
	    for (var i = start; i < len; i++) {
	      var c = str.charCodeAt(i) - 48;

	      r *= mul;

	      // 'a'
	      if (c >= 49) {
	        r += c - 49 + 0xa;

	      // 'A'
	      } else if (c >= 17) {
	        r += c - 17 + 0xa;

	      // '0' - '9'
	      } else {
	        r += c;
	      }
	    }
	    return r;
	  }

	  BN.prototype._parseBase = function _parseBase (number, base, start) {
	    // Initialize as zero
	    this.words = [ 0 ];
	    this.length = 1;

	    // Find length of limb in base
	    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
	      limbLen++;
	    }
	    limbLen--;
	    limbPow = (limbPow / base) | 0;

	    var total = number.length - start;
	    var mod = total % limbLen;
	    var end = Math.min(total, total - mod) + start;

	    var word = 0;
	    for (var i = start; i < end; i += limbLen) {
	      word = parseBase(number, i, i + limbLen, base);

	      this.imuln(limbPow);
	      if (this.words[0] + word < 0x4000000) {
	        this.words[0] += word;
	      } else {
	        this._iaddn(word);
	      }
	    }

	    if (mod !== 0) {
	      var pow = 1;
	      word = parseBase(number, i, number.length, base);

	      for (i = 0; i < mod; i++) {
	        pow *= base;
	      }

	      this.imuln(pow);
	      if (this.words[0] + word < 0x4000000) {
	        this.words[0] += word;
	      } else {
	        this._iaddn(word);
	      }
	    }

	    this.strip();
	  };

	  BN.prototype.copy = function copy (dest) {
	    dest.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      dest.words[i] = this.words[i];
	    }
	    dest.length = this.length;
	    dest.negative = this.negative;
	    dest.red = this.red;
	  };

	  BN.prototype.clone = function clone () {
	    var r = new BN(null);
	    this.copy(r);
	    return r;
	  };

	  BN.prototype._expand = function _expand (size) {
	    while (this.length < size) {
	      this.words[this.length++] = 0;
	    }
	    return this;
	  };

	  // Remove leading `0` from `this`
	  BN.prototype.strip = function strip () {
	    while (this.length > 1 && this.words[this.length - 1] === 0) {
	      this.length--;
	    }
	    return this._normSign();
	  };

	  BN.prototype._normSign = function _normSign () {
	    // -0 = 0
	    if (this.length === 1 && this.words[0] === 0) {
	      this.negative = 0;
	    }
	    return this;
	  };

	  BN.prototype.inspect = function inspect () {
	    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
	  };

	  /*

	  var zeros = [];
	  var groupSizes = [];
	  var groupBases = [];

	  var s = '';
	  var i = -1;
	  while (++i < BN.wordSize) {
	    zeros[i] = s;
	    s += '0';
	  }
	  groupSizes[0] = 0;
	  groupSizes[1] = 0;
	  groupBases[0] = 0;
	  groupBases[1] = 0;
	  var base = 2 - 1;
	  while (++base < 36 + 1) {
	    var groupSize = 0;
	    var groupBase = 1;
	    while (groupBase < (1 << BN.wordSize) / base) {
	      groupBase *= base;
	      groupSize += 1;
	    }
	    groupSizes[base] = groupSize;
	    groupBases[base] = groupBase;
	  }

	  */

	  var zeros = [
	    '',
	    '0',
	    '00',
	    '000',
	    '0000',
	    '00000',
	    '000000',
	    '0000000',
	    '00000000',
	    '000000000',
	    '0000000000',
	    '00000000000',
	    '000000000000',
	    '0000000000000',
	    '00000000000000',
	    '000000000000000',
	    '0000000000000000',
	    '00000000000000000',
	    '000000000000000000',
	    '0000000000000000000',
	    '00000000000000000000',
	    '000000000000000000000',
	    '0000000000000000000000',
	    '00000000000000000000000',
	    '000000000000000000000000',
	    '0000000000000000000000000'
	  ];

	  var groupSizes = [
	    0, 0,
	    25, 16, 12, 11, 10, 9, 8,
	    8, 7, 7, 7, 7, 6, 6,
	    6, 6, 6, 6, 6, 5, 5,
	    5, 5, 5, 5, 5, 5, 5,
	    5, 5, 5, 5, 5, 5, 5
	  ];

	  var groupBases = [
	    0, 0,
	    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
	    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
	    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
	    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
	    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
	  ];

	  BN.prototype.toString = function toString (base, padding) {
	    base = base || 10;
	    padding = padding | 0 || 1;

	    var out;
	    if (base === 16 || base === 'hex') {
	      out = '';
	      var off = 0;
	      var carry = 0;
	      for (var i = 0; i < this.length; i++) {
	        var w = this.words[i];
	        var word = (((w << off) | carry) & 0xffffff).toString(16);
	        carry = (w >>> (24 - off)) & 0xffffff;
	        if (carry !== 0 || i !== this.length - 1) {
	          out = zeros[6 - word.length] + word + out;
	        } else {
	          out = word + out;
	        }
	        off += 2;
	        if (off >= 26) {
	          off -= 26;
	          i--;
	        }
	      }
	      if (carry !== 0) {
	        out = carry.toString(16) + out;
	      }
	      while (out.length % padding !== 0) {
	        out = '0' + out;
	      }
	      if (this.negative !== 0) {
	        out = '-' + out;
	      }
	      return out;
	    }

	    if (base === (base | 0) && base >= 2 && base <= 36) {
	      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
	      var groupSize = groupSizes[base];
	      // var groupBase = Math.pow(base, groupSize);
	      var groupBase = groupBases[base];
	      out = '';
	      var c = this.clone();
	      c.negative = 0;
	      while (!c.isZero()) {
	        var r = c.modn(groupBase).toString(base);
	        c = c.idivn(groupBase);

	        if (!c.isZero()) {
	          out = zeros[groupSize - r.length] + r + out;
	        } else {
	          out = r + out;
	        }
	      }
	      if (this.isZero()) {
	        out = '0' + out;
	      }
	      while (out.length % padding !== 0) {
	        out = '0' + out;
	      }
	      if (this.negative !== 0) {
	        out = '-' + out;
	      }
	      return out;
	    }

	    assert(false, 'Base should be between 2 and 36');
	  };

	  BN.prototype.toNumber = function toNumber () {
	    var ret = this.words[0];
	    if (this.length === 2) {
	      ret += this.words[1] * 0x4000000;
	    } else if (this.length === 3 && this.words[2] === 0x01) {
	      // NOTE: at this stage it is known that the top bit is set
	      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
	    } else if (this.length > 2) {
	      assert(false, 'Number can only safely store up to 53 bits');
	    }
	    return (this.negative !== 0) ? -ret : ret;
	  };

	  BN.prototype.toJSON = function toJSON () {
	    return this.toString(16);
	  };

	  BN.prototype.toBuffer = function toBuffer (endian, length) {
	    assert(typeof Buffer !== 'undefined');
	    return this.toArrayLike(Buffer, endian, length);
	  };

	  BN.prototype.toArray = function toArray (endian, length) {
	    return this.toArrayLike(Array, endian, length);
	  };

	  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
	    var byteLength = this.byteLength();
	    var reqLength = length || Math.max(1, byteLength);
	    assert(byteLength <= reqLength, 'byte array longer than desired length');
	    assert(reqLength > 0, 'Requested array length <= 0');

	    this.strip();
	    var littleEndian = endian === 'le';
	    var res = new ArrayType(reqLength);

	    var b, i;
	    var q = this.clone();
	    if (!littleEndian) {
	      // Assume big-endian
	      for (i = 0; i < reqLength - byteLength; i++) {
	        res[i] = 0;
	      }

	      for (i = 0; !q.isZero(); i++) {
	        b = q.andln(0xff);
	        q.iushrn(8);

	        res[reqLength - i - 1] = b;
	      }
	    } else {
	      for (i = 0; !q.isZero(); i++) {
	        b = q.andln(0xff);
	        q.iushrn(8);

	        res[i] = b;
	      }

	      for (; i < reqLength; i++) {
	        res[i] = 0;
	      }
	    }

	    return res;
	  };

	  if (Math.clz32) {
	    BN.prototype._countBits = function _countBits (w) {
	      return 32 - Math.clz32(w);
	    };
	  } else {
	    BN.prototype._countBits = function _countBits (w) {
	      var t = w;
	      var r = 0;
	      if (t >= 0x1000) {
	        r += 13;
	        t >>>= 13;
	      }
	      if (t >= 0x40) {
	        r += 7;
	        t >>>= 7;
	      }
	      if (t >= 0x8) {
	        r += 4;
	        t >>>= 4;
	      }
	      if (t >= 0x02) {
	        r += 2;
	        t >>>= 2;
	      }
	      return r + t;
	    };
	  }

	  BN.prototype._zeroBits = function _zeroBits (w) {
	    // Short-cut
	    if (w === 0) return 26;

	    var t = w;
	    var r = 0;
	    if ((t & 0x1fff) === 0) {
	      r += 13;
	      t >>>= 13;
	    }
	    if ((t & 0x7f) === 0) {
	      r += 7;
	      t >>>= 7;
	    }
	    if ((t & 0xf) === 0) {
	      r += 4;
	      t >>>= 4;
	    }
	    if ((t & 0x3) === 0) {
	      r += 2;
	      t >>>= 2;
	    }
	    if ((t & 0x1) === 0) {
	      r++;
	    }
	    return r;
	  };

	  // Return number of used bits in a BN
	  BN.prototype.bitLength = function bitLength () {
	    var w = this.words[this.length - 1];
	    var hi = this._countBits(w);
	    return (this.length - 1) * 26 + hi;
	  };

	  function toBitArray (num) {
	    var w = new Array(num.bitLength());

	    for (var bit = 0; bit < w.length; bit++) {
	      var off = (bit / 26) | 0;
	      var wbit = bit % 26;

	      w[bit] = (num.words[off] & (1 << wbit)) >>> wbit;
	    }

	    return w;
	  }

	  // Number of trailing zero bits
	  BN.prototype.zeroBits = function zeroBits () {
	    if (this.isZero()) return 0;

	    var r = 0;
	    for (var i = 0; i < this.length; i++) {
	      var b = this._zeroBits(this.words[i]);
	      r += b;
	      if (b !== 26) break;
	    }
	    return r;
	  };

	  BN.prototype.byteLength = function byteLength () {
	    return Math.ceil(this.bitLength() / 8);
	  };

	  BN.prototype.toTwos = function toTwos (width) {
	    if (this.negative !== 0) {
	      return this.abs().inotn(width).iaddn(1);
	    }
	    return this.clone();
	  };

	  BN.prototype.fromTwos = function fromTwos (width) {
	    if (this.testn(width - 1)) {
	      return this.notn(width).iaddn(1).ineg();
	    }
	    return this.clone();
	  };

	  BN.prototype.isNeg = function isNeg () {
	    return this.negative !== 0;
	  };

	  // Return negative clone of `this`
	  BN.prototype.neg = function neg () {
	    return this.clone().ineg();
	  };

	  BN.prototype.ineg = function ineg () {
	    if (!this.isZero()) {
	      this.negative ^= 1;
	    }

	    return this;
	  };

	  // Or `num` with `this` in-place
	  BN.prototype.iuor = function iuor (num) {
	    while (this.length < num.length) {
	      this.words[this.length++] = 0;
	    }

	    for (var i = 0; i < num.length; i++) {
	      this.words[i] = this.words[i] | num.words[i];
	    }

	    return this.strip();
	  };

	  BN.prototype.ior = function ior (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuor(num);
	  };

	  // Or `num` with `this`
	  BN.prototype.or = function or (num) {
	    if (this.length > num.length) return this.clone().ior(num);
	    return num.clone().ior(this);
	  };

	  BN.prototype.uor = function uor (num) {
	    if (this.length > num.length) return this.clone().iuor(num);
	    return num.clone().iuor(this);
	  };

	  // And `num` with `this` in-place
	  BN.prototype.iuand = function iuand (num) {
	    // b = min-length(num, this)
	    var b;
	    if (this.length > num.length) {
	      b = num;
	    } else {
	      b = this;
	    }

	    for (var i = 0; i < b.length; i++) {
	      this.words[i] = this.words[i] & num.words[i];
	    }

	    this.length = b.length;

	    return this.strip();
	  };

	  BN.prototype.iand = function iand (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuand(num);
	  };

	  // And `num` with `this`
	  BN.prototype.and = function and (num) {
	    if (this.length > num.length) return this.clone().iand(num);
	    return num.clone().iand(this);
	  };

	  BN.prototype.uand = function uand (num) {
	    if (this.length > num.length) return this.clone().iuand(num);
	    return num.clone().iuand(this);
	  };

	  // Xor `num` with `this` in-place
	  BN.prototype.iuxor = function iuxor (num) {
	    // a.length > b.length
	    var a;
	    var b;
	    if (this.length > num.length) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    for (var i = 0; i < b.length; i++) {
	      this.words[i] = a.words[i] ^ b.words[i];
	    }

	    if (this !== a) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    this.length = a.length;

	    return this.strip();
	  };

	  BN.prototype.ixor = function ixor (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuxor(num);
	  };

	  // Xor `num` with `this`
	  BN.prototype.xor = function xor (num) {
	    if (this.length > num.length) return this.clone().ixor(num);
	    return num.clone().ixor(this);
	  };

	  BN.prototype.uxor = function uxor (num) {
	    if (this.length > num.length) return this.clone().iuxor(num);
	    return num.clone().iuxor(this);
	  };

	  // Not ``this`` with ``width`` bitwidth
	  BN.prototype.inotn = function inotn (width) {
	    assert(typeof width === 'number' && width >= 0);

	    var bytesNeeded = Math.ceil(width / 26) | 0;
	    var bitsLeft = width % 26;

	    // Extend the buffer with leading zeroes
	    this._expand(bytesNeeded);

	    if (bitsLeft > 0) {
	      bytesNeeded--;
	    }

	    // Handle complete words
	    for (var i = 0; i < bytesNeeded; i++) {
	      this.words[i] = ~this.words[i] & 0x3ffffff;
	    }

	    // Handle the residue
	    if (bitsLeft > 0) {
	      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
	    }

	    // And remove leading zeroes
	    return this.strip();
	  };

	  BN.prototype.notn = function notn (width) {
	    return this.clone().inotn(width);
	  };

	  // Set `bit` of `this`
	  BN.prototype.setn = function setn (bit, val) {
	    assert(typeof bit === 'number' && bit >= 0);

	    var off = (bit / 26) | 0;
	    var wbit = bit % 26;

	    this._expand(off + 1);

	    if (val) {
	      this.words[off] = this.words[off] | (1 << wbit);
	    } else {
	      this.words[off] = this.words[off] & ~(1 << wbit);
	    }

	    return this.strip();
	  };

	  // Add `num` to `this` in-place
	  BN.prototype.iadd = function iadd (num) {
	    var r;

	    // negative + positive
	    if (this.negative !== 0 && num.negative === 0) {
	      this.negative = 0;
	      r = this.isub(num);
	      this.negative ^= 1;
	      return this._normSign();

	    // positive + negative
	    } else if (this.negative === 0 && num.negative !== 0) {
	      num.negative = 0;
	      r = this.isub(num);
	      num.negative = 1;
	      return r._normSign();
	    }

	    // a.length > b.length
	    var a, b;
	    if (this.length > num.length) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    var carry = 0;
	    for (var i = 0; i < b.length; i++) {
	      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
	      this.words[i] = r & 0x3ffffff;
	      carry = r >>> 26;
	    }
	    for (; carry !== 0 && i < a.length; i++) {
	      r = (a.words[i] | 0) + carry;
	      this.words[i] = r & 0x3ffffff;
	      carry = r >>> 26;
	    }

	    this.length = a.length;
	    if (carry !== 0) {
	      this.words[this.length] = carry;
	      this.length++;
	    // Copy the rest of the words
	    } else if (a !== this) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    return this;
	  };

	  // Add `num` to `this`
	  BN.prototype.add = function add (num) {
	    var res;
	    if (num.negative !== 0 && this.negative === 0) {
	      num.negative = 0;
	      res = this.sub(num);
	      num.negative ^= 1;
	      return res;
	    } else if (num.negative === 0 && this.negative !== 0) {
	      this.negative = 0;
	      res = num.sub(this);
	      this.negative = 1;
	      return res;
	    }

	    if (this.length > num.length) return this.clone().iadd(num);

	    return num.clone().iadd(this);
	  };

	  // Subtract `num` from `this` in-place
	  BN.prototype.isub = function isub (num) {
	    // this - (-num) = this + num
	    if (num.negative !== 0) {
	      num.negative = 0;
	      var r = this.iadd(num);
	      num.negative = 1;
	      return r._normSign();

	    // -this - num = -(this + num)
	    } else if (this.negative !== 0) {
	      this.negative = 0;
	      this.iadd(num);
	      this.negative = 1;
	      return this._normSign();
	    }

	    // At this point both numbers are positive
	    var cmp = this.cmp(num);

	    // Optimization - zeroify
	    if (cmp === 0) {
	      this.negative = 0;
	      this.length = 1;
	      this.words[0] = 0;
	      return this;
	    }

	    // a > b
	    var a, b;
	    if (cmp > 0) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    var carry = 0;
	    for (var i = 0; i < b.length; i++) {
	      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
	      carry = r >> 26;
	      this.words[i] = r & 0x3ffffff;
	    }
	    for (; carry !== 0 && i < a.length; i++) {
	      r = (a.words[i] | 0) + carry;
	      carry = r >> 26;
	      this.words[i] = r & 0x3ffffff;
	    }

	    // Copy rest of the words
	    if (carry === 0 && i < a.length && a !== this) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    this.length = Math.max(this.length, i);

	    if (a !== this) {
	      this.negative = 1;
	    }

	    return this.strip();
	  };

	  // Subtract `num` from `this`
	  BN.prototype.sub = function sub (num) {
	    return this.clone().isub(num);
	  };

	  function smallMulTo (self, num, out) {
	    out.negative = num.negative ^ self.negative;
	    var len = (self.length + num.length) | 0;
	    out.length = len;
	    len = (len - 1) | 0;

	    // Peel one iteration (compiler can't do it, because of code complexity)
	    var a = self.words[0] | 0;
	    var b = num.words[0] | 0;
	    var r = a * b;

	    var lo = r & 0x3ffffff;
	    var carry = (r / 0x4000000) | 0;
	    out.words[0] = lo;

	    for (var k = 1; k < len; k++) {
	      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	      // note that ncarry could be >= 0x3ffffff
	      var ncarry = carry >>> 26;
	      var rword = carry & 0x3ffffff;
	      var maxJ = Math.min(k, num.length - 1);
	      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	        var i = (k - j) | 0;
	        a = self.words[i] | 0;
	        b = num.words[j] | 0;
	        r = a * b + rword;
	        ncarry += (r / 0x4000000) | 0;
	        rword = r & 0x3ffffff;
	      }
	      out.words[k] = rword | 0;
	      carry = ncarry | 0;
	    }
	    if (carry !== 0) {
	      out.words[k] = carry | 0;
	    } else {
	      out.length--;
	    }

	    return out.strip();
	  }

	  // TODO(indutny): it may be reasonable to omit it for users who don't need
	  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
	  // multiplication (like elliptic secp256k1).
	  var comb10MulTo = function comb10MulTo (self, num, out) {
	    var a = self.words;
	    var b = num.words;
	    var o = out.words;
	    var c = 0;
	    var lo;
	    var mid;
	    var hi;
	    var a0 = a[0] | 0;
	    var al0 = a0 & 0x1fff;
	    var ah0 = a0 >>> 13;
	    var a1 = a[1] | 0;
	    var al1 = a1 & 0x1fff;
	    var ah1 = a1 >>> 13;
	    var a2 = a[2] | 0;
	    var al2 = a2 & 0x1fff;
	    var ah2 = a2 >>> 13;
	    var a3 = a[3] | 0;
	    var al3 = a3 & 0x1fff;
	    var ah3 = a3 >>> 13;
	    var a4 = a[4] | 0;
	    var al4 = a4 & 0x1fff;
	    var ah4 = a4 >>> 13;
	    var a5 = a[5] | 0;
	    var al5 = a5 & 0x1fff;
	    var ah5 = a5 >>> 13;
	    var a6 = a[6] | 0;
	    var al6 = a6 & 0x1fff;
	    var ah6 = a6 >>> 13;
	    var a7 = a[7] | 0;
	    var al7 = a7 & 0x1fff;
	    var ah7 = a7 >>> 13;
	    var a8 = a[8] | 0;
	    var al8 = a8 & 0x1fff;
	    var ah8 = a8 >>> 13;
	    var a9 = a[9] | 0;
	    var al9 = a9 & 0x1fff;
	    var ah9 = a9 >>> 13;
	    var b0 = b[0] | 0;
	    var bl0 = b0 & 0x1fff;
	    var bh0 = b0 >>> 13;
	    var b1 = b[1] | 0;
	    var bl1 = b1 & 0x1fff;
	    var bh1 = b1 >>> 13;
	    var b2 = b[2] | 0;
	    var bl2 = b2 & 0x1fff;
	    var bh2 = b2 >>> 13;
	    var b3 = b[3] | 0;
	    var bl3 = b3 & 0x1fff;
	    var bh3 = b3 >>> 13;
	    var b4 = b[4] | 0;
	    var bl4 = b4 & 0x1fff;
	    var bh4 = b4 >>> 13;
	    var b5 = b[5] | 0;
	    var bl5 = b5 & 0x1fff;
	    var bh5 = b5 >>> 13;
	    var b6 = b[6] | 0;
	    var bl6 = b6 & 0x1fff;
	    var bh6 = b6 >>> 13;
	    var b7 = b[7] | 0;
	    var bl7 = b7 & 0x1fff;
	    var bh7 = b7 >>> 13;
	    var b8 = b[8] | 0;
	    var bl8 = b8 & 0x1fff;
	    var bh8 = b8 >>> 13;
	    var b9 = b[9] | 0;
	    var bl9 = b9 & 0x1fff;
	    var bh9 = b9 >>> 13;

	    out.negative = self.negative ^ num.negative;
	    out.length = 19;
	    /* k = 0 */
	    lo = Math.imul(al0, bl0);
	    mid = Math.imul(al0, bh0);
	    mid = (mid + Math.imul(ah0, bl0)) | 0;
	    hi = Math.imul(ah0, bh0);
	    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
	    w0 &= 0x3ffffff;
	    /* k = 1 */
	    lo = Math.imul(al1, bl0);
	    mid = Math.imul(al1, bh0);
	    mid = (mid + Math.imul(ah1, bl0)) | 0;
	    hi = Math.imul(ah1, bh0);
	    lo = (lo + Math.imul(al0, bl1)) | 0;
	    mid = (mid + Math.imul(al0, bh1)) | 0;
	    mid = (mid + Math.imul(ah0, bl1)) | 0;
	    hi = (hi + Math.imul(ah0, bh1)) | 0;
	    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
	    w1 &= 0x3ffffff;
	    /* k = 2 */
	    lo = Math.imul(al2, bl0);
	    mid = Math.imul(al2, bh0);
	    mid = (mid + Math.imul(ah2, bl0)) | 0;
	    hi = Math.imul(ah2, bh0);
	    lo = (lo + Math.imul(al1, bl1)) | 0;
	    mid = (mid + Math.imul(al1, bh1)) | 0;
	    mid = (mid + Math.imul(ah1, bl1)) | 0;
	    hi = (hi + Math.imul(ah1, bh1)) | 0;
	    lo = (lo + Math.imul(al0, bl2)) | 0;
	    mid = (mid + Math.imul(al0, bh2)) | 0;
	    mid = (mid + Math.imul(ah0, bl2)) | 0;
	    hi = (hi + Math.imul(ah0, bh2)) | 0;
	    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
	    w2 &= 0x3ffffff;
	    /* k = 3 */
	    lo = Math.imul(al3, bl0);
	    mid = Math.imul(al3, bh0);
	    mid = (mid + Math.imul(ah3, bl0)) | 0;
	    hi = Math.imul(ah3, bh0);
	    lo = (lo + Math.imul(al2, bl1)) | 0;
	    mid = (mid + Math.imul(al2, bh1)) | 0;
	    mid = (mid + Math.imul(ah2, bl1)) | 0;
	    hi = (hi + Math.imul(ah2, bh1)) | 0;
	    lo = (lo + Math.imul(al1, bl2)) | 0;
	    mid = (mid + Math.imul(al1, bh2)) | 0;
	    mid = (mid + Math.imul(ah1, bl2)) | 0;
	    hi = (hi + Math.imul(ah1, bh2)) | 0;
	    lo = (lo + Math.imul(al0, bl3)) | 0;
	    mid = (mid + Math.imul(al0, bh3)) | 0;
	    mid = (mid + Math.imul(ah0, bl3)) | 0;
	    hi = (hi + Math.imul(ah0, bh3)) | 0;
	    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
	    w3 &= 0x3ffffff;
	    /* k = 4 */
	    lo = Math.imul(al4, bl0);
	    mid = Math.imul(al4, bh0);
	    mid = (mid + Math.imul(ah4, bl0)) | 0;
	    hi = Math.imul(ah4, bh0);
	    lo = (lo + Math.imul(al3, bl1)) | 0;
	    mid = (mid + Math.imul(al3, bh1)) | 0;
	    mid = (mid + Math.imul(ah3, bl1)) | 0;
	    hi = (hi + Math.imul(ah3, bh1)) | 0;
	    lo = (lo + Math.imul(al2, bl2)) | 0;
	    mid = (mid + Math.imul(al2, bh2)) | 0;
	    mid = (mid + Math.imul(ah2, bl2)) | 0;
	    hi = (hi + Math.imul(ah2, bh2)) | 0;
	    lo = (lo + Math.imul(al1, bl3)) | 0;
	    mid = (mid + Math.imul(al1, bh3)) | 0;
	    mid = (mid + Math.imul(ah1, bl3)) | 0;
	    hi = (hi + Math.imul(ah1, bh3)) | 0;
	    lo = (lo + Math.imul(al0, bl4)) | 0;
	    mid = (mid + Math.imul(al0, bh4)) | 0;
	    mid = (mid + Math.imul(ah0, bl4)) | 0;
	    hi = (hi + Math.imul(ah0, bh4)) | 0;
	    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
	    w4 &= 0x3ffffff;
	    /* k = 5 */
	    lo = Math.imul(al5, bl0);
	    mid = Math.imul(al5, bh0);
	    mid = (mid + Math.imul(ah5, bl0)) | 0;
	    hi = Math.imul(ah5, bh0);
	    lo = (lo + Math.imul(al4, bl1)) | 0;
	    mid = (mid + Math.imul(al4, bh1)) | 0;
	    mid = (mid + Math.imul(ah4, bl1)) | 0;
	    hi = (hi + Math.imul(ah4, bh1)) | 0;
	    lo = (lo + Math.imul(al3, bl2)) | 0;
	    mid = (mid + Math.imul(al3, bh2)) | 0;
	    mid = (mid + Math.imul(ah3, bl2)) | 0;
	    hi = (hi + Math.imul(ah3, bh2)) | 0;
	    lo = (lo + Math.imul(al2, bl3)) | 0;
	    mid = (mid + Math.imul(al2, bh3)) | 0;
	    mid = (mid + Math.imul(ah2, bl3)) | 0;
	    hi = (hi + Math.imul(ah2, bh3)) | 0;
	    lo = (lo + Math.imul(al1, bl4)) | 0;
	    mid = (mid + Math.imul(al1, bh4)) | 0;
	    mid = (mid + Math.imul(ah1, bl4)) | 0;
	    hi = (hi + Math.imul(ah1, bh4)) | 0;
	    lo = (lo + Math.imul(al0, bl5)) | 0;
	    mid = (mid + Math.imul(al0, bh5)) | 0;
	    mid = (mid + Math.imul(ah0, bl5)) | 0;
	    hi = (hi + Math.imul(ah0, bh5)) | 0;
	    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
	    w5 &= 0x3ffffff;
	    /* k = 6 */
	    lo = Math.imul(al6, bl0);
	    mid = Math.imul(al6, bh0);
	    mid = (mid + Math.imul(ah6, bl0)) | 0;
	    hi = Math.imul(ah6, bh0);
	    lo = (lo + Math.imul(al5, bl1)) | 0;
	    mid = (mid + Math.imul(al5, bh1)) | 0;
	    mid = (mid + Math.imul(ah5, bl1)) | 0;
	    hi = (hi + Math.imul(ah5, bh1)) | 0;
	    lo = (lo + Math.imul(al4, bl2)) | 0;
	    mid = (mid + Math.imul(al4, bh2)) | 0;
	    mid = (mid + Math.imul(ah4, bl2)) | 0;
	    hi = (hi + Math.imul(ah4, bh2)) | 0;
	    lo = (lo + Math.imul(al3, bl3)) | 0;
	    mid = (mid + Math.imul(al3, bh3)) | 0;
	    mid = (mid + Math.imul(ah3, bl3)) | 0;
	    hi = (hi + Math.imul(ah3, bh3)) | 0;
	    lo = (lo + Math.imul(al2, bl4)) | 0;
	    mid = (mid + Math.imul(al2, bh4)) | 0;
	    mid = (mid + Math.imul(ah2, bl4)) | 0;
	    hi = (hi + Math.imul(ah2, bh4)) | 0;
	    lo = (lo + Math.imul(al1, bl5)) | 0;
	    mid = (mid + Math.imul(al1, bh5)) | 0;
	    mid = (mid + Math.imul(ah1, bl5)) | 0;
	    hi = (hi + Math.imul(ah1, bh5)) | 0;
	    lo = (lo + Math.imul(al0, bl6)) | 0;
	    mid = (mid + Math.imul(al0, bh6)) | 0;
	    mid = (mid + Math.imul(ah0, bl6)) | 0;
	    hi = (hi + Math.imul(ah0, bh6)) | 0;
	    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
	    w6 &= 0x3ffffff;
	    /* k = 7 */
	    lo = Math.imul(al7, bl0);
	    mid = Math.imul(al7, bh0);
	    mid = (mid + Math.imul(ah7, bl0)) | 0;
	    hi = Math.imul(ah7, bh0);
	    lo = (lo + Math.imul(al6, bl1)) | 0;
	    mid = (mid + Math.imul(al6, bh1)) | 0;
	    mid = (mid + Math.imul(ah6, bl1)) | 0;
	    hi = (hi + Math.imul(ah6, bh1)) | 0;
	    lo = (lo + Math.imul(al5, bl2)) | 0;
	    mid = (mid + Math.imul(al5, bh2)) | 0;
	    mid = (mid + Math.imul(ah5, bl2)) | 0;
	    hi = (hi + Math.imul(ah5, bh2)) | 0;
	    lo = (lo + Math.imul(al4, bl3)) | 0;
	    mid = (mid + Math.imul(al4, bh3)) | 0;
	    mid = (mid + Math.imul(ah4, bl3)) | 0;
	    hi = (hi + Math.imul(ah4, bh3)) | 0;
	    lo = (lo + Math.imul(al3, bl4)) | 0;
	    mid = (mid + Math.imul(al3, bh4)) | 0;
	    mid = (mid + Math.imul(ah3, bl4)) | 0;
	    hi = (hi + Math.imul(ah3, bh4)) | 0;
	    lo = (lo + Math.imul(al2, bl5)) | 0;
	    mid = (mid + Math.imul(al2, bh5)) | 0;
	    mid = (mid + Math.imul(ah2, bl5)) | 0;
	    hi = (hi + Math.imul(ah2, bh5)) | 0;
	    lo = (lo + Math.imul(al1, bl6)) | 0;
	    mid = (mid + Math.imul(al1, bh6)) | 0;
	    mid = (mid + Math.imul(ah1, bl6)) | 0;
	    hi = (hi + Math.imul(ah1, bh6)) | 0;
	    lo = (lo + Math.imul(al0, bl7)) | 0;
	    mid = (mid + Math.imul(al0, bh7)) | 0;
	    mid = (mid + Math.imul(ah0, bl7)) | 0;
	    hi = (hi + Math.imul(ah0, bh7)) | 0;
	    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
	    w7 &= 0x3ffffff;
	    /* k = 8 */
	    lo = Math.imul(al8, bl0);
	    mid = Math.imul(al8, bh0);
	    mid = (mid + Math.imul(ah8, bl0)) | 0;
	    hi = Math.imul(ah8, bh0);
	    lo = (lo + Math.imul(al7, bl1)) | 0;
	    mid = (mid + Math.imul(al7, bh1)) | 0;
	    mid = (mid + Math.imul(ah7, bl1)) | 0;
	    hi = (hi + Math.imul(ah7, bh1)) | 0;
	    lo = (lo + Math.imul(al6, bl2)) | 0;
	    mid = (mid + Math.imul(al6, bh2)) | 0;
	    mid = (mid + Math.imul(ah6, bl2)) | 0;
	    hi = (hi + Math.imul(ah6, bh2)) | 0;
	    lo = (lo + Math.imul(al5, bl3)) | 0;
	    mid = (mid + Math.imul(al5, bh3)) | 0;
	    mid = (mid + Math.imul(ah5, bl3)) | 0;
	    hi = (hi + Math.imul(ah5, bh3)) | 0;
	    lo = (lo + Math.imul(al4, bl4)) | 0;
	    mid = (mid + Math.imul(al4, bh4)) | 0;
	    mid = (mid + Math.imul(ah4, bl4)) | 0;
	    hi = (hi + Math.imul(ah4, bh4)) | 0;
	    lo = (lo + Math.imul(al3, bl5)) | 0;
	    mid = (mid + Math.imul(al3, bh5)) | 0;
	    mid = (mid + Math.imul(ah3, bl5)) | 0;
	    hi = (hi + Math.imul(ah3, bh5)) | 0;
	    lo = (lo + Math.imul(al2, bl6)) | 0;
	    mid = (mid + Math.imul(al2, bh6)) | 0;
	    mid = (mid + Math.imul(ah2, bl6)) | 0;
	    hi = (hi + Math.imul(ah2, bh6)) | 0;
	    lo = (lo + Math.imul(al1, bl7)) | 0;
	    mid = (mid + Math.imul(al1, bh7)) | 0;
	    mid = (mid + Math.imul(ah1, bl7)) | 0;
	    hi = (hi + Math.imul(ah1, bh7)) | 0;
	    lo = (lo + Math.imul(al0, bl8)) | 0;
	    mid = (mid + Math.imul(al0, bh8)) | 0;
	    mid = (mid + Math.imul(ah0, bl8)) | 0;
	    hi = (hi + Math.imul(ah0, bh8)) | 0;
	    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
	    w8 &= 0x3ffffff;
	    /* k = 9 */
	    lo = Math.imul(al9, bl0);
	    mid = Math.imul(al9, bh0);
	    mid = (mid + Math.imul(ah9, bl0)) | 0;
	    hi = Math.imul(ah9, bh0);
	    lo = (lo + Math.imul(al8, bl1)) | 0;
	    mid = (mid + Math.imul(al8, bh1)) | 0;
	    mid = (mid + Math.imul(ah8, bl1)) | 0;
	    hi = (hi + Math.imul(ah8, bh1)) | 0;
	    lo = (lo + Math.imul(al7, bl2)) | 0;
	    mid = (mid + Math.imul(al7, bh2)) | 0;
	    mid = (mid + Math.imul(ah7, bl2)) | 0;
	    hi = (hi + Math.imul(ah7, bh2)) | 0;
	    lo = (lo + Math.imul(al6, bl3)) | 0;
	    mid = (mid + Math.imul(al6, bh3)) | 0;
	    mid = (mid + Math.imul(ah6, bl3)) | 0;
	    hi = (hi + Math.imul(ah6, bh3)) | 0;
	    lo = (lo + Math.imul(al5, bl4)) | 0;
	    mid = (mid + Math.imul(al5, bh4)) | 0;
	    mid = (mid + Math.imul(ah5, bl4)) | 0;
	    hi = (hi + Math.imul(ah5, bh4)) | 0;
	    lo = (lo + Math.imul(al4, bl5)) | 0;
	    mid = (mid + Math.imul(al4, bh5)) | 0;
	    mid = (mid + Math.imul(ah4, bl5)) | 0;
	    hi = (hi + Math.imul(ah4, bh5)) | 0;
	    lo = (lo + Math.imul(al3, bl6)) | 0;
	    mid = (mid + Math.imul(al3, bh6)) | 0;
	    mid = (mid + Math.imul(ah3, bl6)) | 0;
	    hi = (hi + Math.imul(ah3, bh6)) | 0;
	    lo = (lo + Math.imul(al2, bl7)) | 0;
	    mid = (mid + Math.imul(al2, bh7)) | 0;
	    mid = (mid + Math.imul(ah2, bl7)) | 0;
	    hi = (hi + Math.imul(ah2, bh7)) | 0;
	    lo = (lo + Math.imul(al1, bl8)) | 0;
	    mid = (mid + Math.imul(al1, bh8)) | 0;
	    mid = (mid + Math.imul(ah1, bl8)) | 0;
	    hi = (hi + Math.imul(ah1, bh8)) | 0;
	    lo = (lo + Math.imul(al0, bl9)) | 0;
	    mid = (mid + Math.imul(al0, bh9)) | 0;
	    mid = (mid + Math.imul(ah0, bl9)) | 0;
	    hi = (hi + Math.imul(ah0, bh9)) | 0;
	    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
	    w9 &= 0x3ffffff;
	    /* k = 10 */
	    lo = Math.imul(al9, bl1);
	    mid = Math.imul(al9, bh1);
	    mid = (mid + Math.imul(ah9, bl1)) | 0;
	    hi = Math.imul(ah9, bh1);
	    lo = (lo + Math.imul(al8, bl2)) | 0;
	    mid = (mid + Math.imul(al8, bh2)) | 0;
	    mid = (mid + Math.imul(ah8, bl2)) | 0;
	    hi = (hi + Math.imul(ah8, bh2)) | 0;
	    lo = (lo + Math.imul(al7, bl3)) | 0;
	    mid = (mid + Math.imul(al7, bh3)) | 0;
	    mid = (mid + Math.imul(ah7, bl3)) | 0;
	    hi = (hi + Math.imul(ah7, bh3)) | 0;
	    lo = (lo + Math.imul(al6, bl4)) | 0;
	    mid = (mid + Math.imul(al6, bh4)) | 0;
	    mid = (mid + Math.imul(ah6, bl4)) | 0;
	    hi = (hi + Math.imul(ah6, bh4)) | 0;
	    lo = (lo + Math.imul(al5, bl5)) | 0;
	    mid = (mid + Math.imul(al5, bh5)) | 0;
	    mid = (mid + Math.imul(ah5, bl5)) | 0;
	    hi = (hi + Math.imul(ah5, bh5)) | 0;
	    lo = (lo + Math.imul(al4, bl6)) | 0;
	    mid = (mid + Math.imul(al4, bh6)) | 0;
	    mid = (mid + Math.imul(ah4, bl6)) | 0;
	    hi = (hi + Math.imul(ah4, bh6)) | 0;
	    lo = (lo + Math.imul(al3, bl7)) | 0;
	    mid = (mid + Math.imul(al3, bh7)) | 0;
	    mid = (mid + Math.imul(ah3, bl7)) | 0;
	    hi = (hi + Math.imul(ah3, bh7)) | 0;
	    lo = (lo + Math.imul(al2, bl8)) | 0;
	    mid = (mid + Math.imul(al2, bh8)) | 0;
	    mid = (mid + Math.imul(ah2, bl8)) | 0;
	    hi = (hi + Math.imul(ah2, bh8)) | 0;
	    lo = (lo + Math.imul(al1, bl9)) | 0;
	    mid = (mid + Math.imul(al1, bh9)) | 0;
	    mid = (mid + Math.imul(ah1, bl9)) | 0;
	    hi = (hi + Math.imul(ah1, bh9)) | 0;
	    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
	    w10 &= 0x3ffffff;
	    /* k = 11 */
	    lo = Math.imul(al9, bl2);
	    mid = Math.imul(al9, bh2);
	    mid = (mid + Math.imul(ah9, bl2)) | 0;
	    hi = Math.imul(ah9, bh2);
	    lo = (lo + Math.imul(al8, bl3)) | 0;
	    mid = (mid + Math.imul(al8, bh3)) | 0;
	    mid = (mid + Math.imul(ah8, bl3)) | 0;
	    hi = (hi + Math.imul(ah8, bh3)) | 0;
	    lo = (lo + Math.imul(al7, bl4)) | 0;
	    mid = (mid + Math.imul(al7, bh4)) | 0;
	    mid = (mid + Math.imul(ah7, bl4)) | 0;
	    hi = (hi + Math.imul(ah7, bh4)) | 0;
	    lo = (lo + Math.imul(al6, bl5)) | 0;
	    mid = (mid + Math.imul(al6, bh5)) | 0;
	    mid = (mid + Math.imul(ah6, bl5)) | 0;
	    hi = (hi + Math.imul(ah6, bh5)) | 0;
	    lo = (lo + Math.imul(al5, bl6)) | 0;
	    mid = (mid + Math.imul(al5, bh6)) | 0;
	    mid = (mid + Math.imul(ah5, bl6)) | 0;
	    hi = (hi + Math.imul(ah5, bh6)) | 0;
	    lo = (lo + Math.imul(al4, bl7)) | 0;
	    mid = (mid + Math.imul(al4, bh7)) | 0;
	    mid = (mid + Math.imul(ah4, bl7)) | 0;
	    hi = (hi + Math.imul(ah4, bh7)) | 0;
	    lo = (lo + Math.imul(al3, bl8)) | 0;
	    mid = (mid + Math.imul(al3, bh8)) | 0;
	    mid = (mid + Math.imul(ah3, bl8)) | 0;
	    hi = (hi + Math.imul(ah3, bh8)) | 0;
	    lo = (lo + Math.imul(al2, bl9)) | 0;
	    mid = (mid + Math.imul(al2, bh9)) | 0;
	    mid = (mid + Math.imul(ah2, bl9)) | 0;
	    hi = (hi + Math.imul(ah2, bh9)) | 0;
	    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
	    w11 &= 0x3ffffff;
	    /* k = 12 */
	    lo = Math.imul(al9, bl3);
	    mid = Math.imul(al9, bh3);
	    mid = (mid + Math.imul(ah9, bl3)) | 0;
	    hi = Math.imul(ah9, bh3);
	    lo = (lo + Math.imul(al8, bl4)) | 0;
	    mid = (mid + Math.imul(al8, bh4)) | 0;
	    mid = (mid + Math.imul(ah8, bl4)) | 0;
	    hi = (hi + Math.imul(ah8, bh4)) | 0;
	    lo = (lo + Math.imul(al7, bl5)) | 0;
	    mid = (mid + Math.imul(al7, bh5)) | 0;
	    mid = (mid + Math.imul(ah7, bl5)) | 0;
	    hi = (hi + Math.imul(ah7, bh5)) | 0;
	    lo = (lo + Math.imul(al6, bl6)) | 0;
	    mid = (mid + Math.imul(al6, bh6)) | 0;
	    mid = (mid + Math.imul(ah6, bl6)) | 0;
	    hi = (hi + Math.imul(ah6, bh6)) | 0;
	    lo = (lo + Math.imul(al5, bl7)) | 0;
	    mid = (mid + Math.imul(al5, bh7)) | 0;
	    mid = (mid + Math.imul(ah5, bl7)) | 0;
	    hi = (hi + Math.imul(ah5, bh7)) | 0;
	    lo = (lo + Math.imul(al4, bl8)) | 0;
	    mid = (mid + Math.imul(al4, bh8)) | 0;
	    mid = (mid + Math.imul(ah4, bl8)) | 0;
	    hi = (hi + Math.imul(ah4, bh8)) | 0;
	    lo = (lo + Math.imul(al3, bl9)) | 0;
	    mid = (mid + Math.imul(al3, bh9)) | 0;
	    mid = (mid + Math.imul(ah3, bl9)) | 0;
	    hi = (hi + Math.imul(ah3, bh9)) | 0;
	    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
	    w12 &= 0x3ffffff;
	    /* k = 13 */
	    lo = Math.imul(al9, bl4);
	    mid = Math.imul(al9, bh4);
	    mid = (mid + Math.imul(ah9, bl4)) | 0;
	    hi = Math.imul(ah9, bh4);
	    lo = (lo + Math.imul(al8, bl5)) | 0;
	    mid = (mid + Math.imul(al8, bh5)) | 0;
	    mid = (mid + Math.imul(ah8, bl5)) | 0;
	    hi = (hi + Math.imul(ah8, bh5)) | 0;
	    lo = (lo + Math.imul(al7, bl6)) | 0;
	    mid = (mid + Math.imul(al7, bh6)) | 0;
	    mid = (mid + Math.imul(ah7, bl6)) | 0;
	    hi = (hi + Math.imul(ah7, bh6)) | 0;
	    lo = (lo + Math.imul(al6, bl7)) | 0;
	    mid = (mid + Math.imul(al6, bh7)) | 0;
	    mid = (mid + Math.imul(ah6, bl7)) | 0;
	    hi = (hi + Math.imul(ah6, bh7)) | 0;
	    lo = (lo + Math.imul(al5, bl8)) | 0;
	    mid = (mid + Math.imul(al5, bh8)) | 0;
	    mid = (mid + Math.imul(ah5, bl8)) | 0;
	    hi = (hi + Math.imul(ah5, bh8)) | 0;
	    lo = (lo + Math.imul(al4, bl9)) | 0;
	    mid = (mid + Math.imul(al4, bh9)) | 0;
	    mid = (mid + Math.imul(ah4, bl9)) | 0;
	    hi = (hi + Math.imul(ah4, bh9)) | 0;
	    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
	    w13 &= 0x3ffffff;
	    /* k = 14 */
	    lo = Math.imul(al9, bl5);
	    mid = Math.imul(al9, bh5);
	    mid = (mid + Math.imul(ah9, bl5)) | 0;
	    hi = Math.imul(ah9, bh5);
	    lo = (lo + Math.imul(al8, bl6)) | 0;
	    mid = (mid + Math.imul(al8, bh6)) | 0;
	    mid = (mid + Math.imul(ah8, bl6)) | 0;
	    hi = (hi + Math.imul(ah8, bh6)) | 0;
	    lo = (lo + Math.imul(al7, bl7)) | 0;
	    mid = (mid + Math.imul(al7, bh7)) | 0;
	    mid = (mid + Math.imul(ah7, bl7)) | 0;
	    hi = (hi + Math.imul(ah7, bh7)) | 0;
	    lo = (lo + Math.imul(al6, bl8)) | 0;
	    mid = (mid + Math.imul(al6, bh8)) | 0;
	    mid = (mid + Math.imul(ah6, bl8)) | 0;
	    hi = (hi + Math.imul(ah6, bh8)) | 0;
	    lo = (lo + Math.imul(al5, bl9)) | 0;
	    mid = (mid + Math.imul(al5, bh9)) | 0;
	    mid = (mid + Math.imul(ah5, bl9)) | 0;
	    hi = (hi + Math.imul(ah5, bh9)) | 0;
	    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
	    w14 &= 0x3ffffff;
	    /* k = 15 */
	    lo = Math.imul(al9, bl6);
	    mid = Math.imul(al9, bh6);
	    mid = (mid + Math.imul(ah9, bl6)) | 0;
	    hi = Math.imul(ah9, bh6);
	    lo = (lo + Math.imul(al8, bl7)) | 0;
	    mid = (mid + Math.imul(al8, bh7)) | 0;
	    mid = (mid + Math.imul(ah8, bl7)) | 0;
	    hi = (hi + Math.imul(ah8, bh7)) | 0;
	    lo = (lo + Math.imul(al7, bl8)) | 0;
	    mid = (mid + Math.imul(al7, bh8)) | 0;
	    mid = (mid + Math.imul(ah7, bl8)) | 0;
	    hi = (hi + Math.imul(ah7, bh8)) | 0;
	    lo = (lo + Math.imul(al6, bl9)) | 0;
	    mid = (mid + Math.imul(al6, bh9)) | 0;
	    mid = (mid + Math.imul(ah6, bl9)) | 0;
	    hi = (hi + Math.imul(ah6, bh9)) | 0;
	    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
	    w15 &= 0x3ffffff;
	    /* k = 16 */
	    lo = Math.imul(al9, bl7);
	    mid = Math.imul(al9, bh7);
	    mid = (mid + Math.imul(ah9, bl7)) | 0;
	    hi = Math.imul(ah9, bh7);
	    lo = (lo + Math.imul(al8, bl8)) | 0;
	    mid = (mid + Math.imul(al8, bh8)) | 0;
	    mid = (mid + Math.imul(ah8, bl8)) | 0;
	    hi = (hi + Math.imul(ah8, bh8)) | 0;
	    lo = (lo + Math.imul(al7, bl9)) | 0;
	    mid = (mid + Math.imul(al7, bh9)) | 0;
	    mid = (mid + Math.imul(ah7, bl9)) | 0;
	    hi = (hi + Math.imul(ah7, bh9)) | 0;
	    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
	    w16 &= 0x3ffffff;
	    /* k = 17 */
	    lo = Math.imul(al9, bl8);
	    mid = Math.imul(al9, bh8);
	    mid = (mid + Math.imul(ah9, bl8)) | 0;
	    hi = Math.imul(ah9, bh8);
	    lo = (lo + Math.imul(al8, bl9)) | 0;
	    mid = (mid + Math.imul(al8, bh9)) | 0;
	    mid = (mid + Math.imul(ah8, bl9)) | 0;
	    hi = (hi + Math.imul(ah8, bh9)) | 0;
	    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
	    w17 &= 0x3ffffff;
	    /* k = 18 */
	    lo = Math.imul(al9, bl9);
	    mid = Math.imul(al9, bh9);
	    mid = (mid + Math.imul(ah9, bl9)) | 0;
	    hi = Math.imul(ah9, bh9);
	    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
	    w18 &= 0x3ffffff;
	    o[0] = w0;
	    o[1] = w1;
	    o[2] = w2;
	    o[3] = w3;
	    o[4] = w4;
	    o[5] = w5;
	    o[6] = w6;
	    o[7] = w7;
	    o[8] = w8;
	    o[9] = w9;
	    o[10] = w10;
	    o[11] = w11;
	    o[12] = w12;
	    o[13] = w13;
	    o[14] = w14;
	    o[15] = w15;
	    o[16] = w16;
	    o[17] = w17;
	    o[18] = w18;
	    if (c !== 0) {
	      o[19] = c;
	      out.length++;
	    }
	    return out;
	  };

	  // Polyfill comb
	  if (!Math.imul) {
	    comb10MulTo = smallMulTo;
	  }

	  function bigMulTo (self, num, out) {
	    out.negative = num.negative ^ self.negative;
	    out.length = self.length + num.length;

	    var carry = 0;
	    var hncarry = 0;
	    for (var k = 0; k < out.length - 1; k++) {
	      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	      // note that ncarry could be >= 0x3ffffff
	      var ncarry = hncarry;
	      hncarry = 0;
	      var rword = carry & 0x3ffffff;
	      var maxJ = Math.min(k, num.length - 1);
	      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	        var i = k - j;
	        var a = self.words[i] | 0;
	        var b = num.words[j] | 0;
	        var r = a * b;

	        var lo = r & 0x3ffffff;
	        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
	        lo = (lo + rword) | 0;
	        rword = lo & 0x3ffffff;
	        ncarry = (ncarry + (lo >>> 26)) | 0;

	        hncarry += ncarry >>> 26;
	        ncarry &= 0x3ffffff;
	      }
	      out.words[k] = rword;
	      carry = ncarry;
	      ncarry = hncarry;
	    }
	    if (carry !== 0) {
	      out.words[k] = carry;
	    } else {
	      out.length--;
	    }

	    return out.strip();
	  }

	  function jumboMulTo (self, num, out) {
	    var fftm = new FFTM();
	    return fftm.mulp(self, num, out);
	  }

	  BN.prototype.mulTo = function mulTo (num, out) {
	    var res;
	    var len = this.length + num.length;
	    if (this.length === 10 && num.length === 10) {
	      res = comb10MulTo(this, num, out);
	    } else if (len < 63) {
	      res = smallMulTo(this, num, out);
	    } else if (len < 1024) {
	      res = bigMulTo(this, num, out);
	    } else {
	      res = jumboMulTo(this, num, out);
	    }

	    return res;
	  };

	  // Cooley-Tukey algorithm for FFT
	  // slightly revisited to rely on looping instead of recursion

	  function FFTM (x, y) {
	    this.x = x;
	    this.y = y;
	  }

	  FFTM.prototype.makeRBT = function makeRBT (N) {
	    var t = new Array(N);
	    var l = BN.prototype._countBits(N) - 1;
	    for (var i = 0; i < N; i++) {
	      t[i] = this.revBin(i, l, N);
	    }

	    return t;
	  };

	  // Returns binary-reversed representation of `x`
	  FFTM.prototype.revBin = function revBin (x, l, N) {
	    if (x === 0 || x === N - 1) return x;

	    var rb = 0;
	    for (var i = 0; i < l; i++) {
	      rb |= (x & 1) << (l - i - 1);
	      x >>= 1;
	    }

	    return rb;
	  };

	  // Performs "tweedling" phase, therefore 'emulating'
	  // behaviour of the recursive algorithm
	  FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
	    for (var i = 0; i < N; i++) {
	      rtws[i] = rws[rbt[i]];
	      itws[i] = iws[rbt[i]];
	    }
	  };

	  FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
	    this.permute(rbt, rws, iws, rtws, itws, N);

	    for (var s = 1; s < N; s <<= 1) {
	      var l = s << 1;

	      var rtwdf = Math.cos(2 * Math.PI / l);
	      var itwdf = Math.sin(2 * Math.PI / l);

	      for (var p = 0; p < N; p += l) {
	        var rtwdf_ = rtwdf;
	        var itwdf_ = itwdf;

	        for (var j = 0; j < s; j++) {
	          var re = rtws[p + j];
	          var ie = itws[p + j];

	          var ro = rtws[p + j + s];
	          var io = itws[p + j + s];

	          var rx = rtwdf_ * ro - itwdf_ * io;

	          io = rtwdf_ * io + itwdf_ * ro;
	          ro = rx;

	          rtws[p + j] = re + ro;
	          itws[p + j] = ie + io;

	          rtws[p + j + s] = re - ro;
	          itws[p + j + s] = ie - io;

	          /* jshint maxdepth : false */
	          if (j !== l) {
	            rx = rtwdf * rtwdf_ - itwdf * itwdf_;

	            itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
	            rtwdf_ = rx;
	          }
	        }
	      }
	    }
	  };

	  FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
	    var N = Math.max(m, n) | 1;
	    var odd = N & 1;
	    var i = 0;
	    for (N = N / 2 | 0; N; N = N >>> 1) {
	      i++;
	    }

	    return 1 << i + 1 + odd;
	  };

	  FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
	    if (N <= 1) return;

	    for (var i = 0; i < N / 2; i++) {
	      var t = rws[i];

	      rws[i] = rws[N - i - 1];
	      rws[N - i - 1] = t;

	      t = iws[i];

	      iws[i] = -iws[N - i - 1];
	      iws[N - i - 1] = -t;
	    }
	  };

	  FFTM.prototype.normalize13b = function normalize13b (ws, N) {
	    var carry = 0;
	    for (var i = 0; i < N / 2; i++) {
	      var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
	        Math.round(ws[2 * i] / N) +
	        carry;

	      ws[i] = w & 0x3ffffff;

	      if (w < 0x4000000) {
	        carry = 0;
	      } else {
	        carry = w / 0x4000000 | 0;
	      }
	    }

	    return ws;
	  };

	  FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
	    var carry = 0;
	    for (var i = 0; i < len; i++) {
	      carry = carry + (ws[i] | 0);

	      rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
	      rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
	    }

	    // Pad with zeroes
	    for (i = 2 * len; i < N; ++i) {
	      rws[i] = 0;
	    }

	    assert(carry === 0);
	    assert((carry & ~0x1fff) === 0);
	  };

	  FFTM.prototype.stub = function stub (N) {
	    var ph = new Array(N);
	    for (var i = 0; i < N; i++) {
	      ph[i] = 0;
	    }

	    return ph;
	  };

	  FFTM.prototype.mulp = function mulp (x, y, out) {
	    var N = 2 * this.guessLen13b(x.length, y.length);

	    var rbt = this.makeRBT(N);

	    var _ = this.stub(N);

	    var rws = new Array(N);
	    var rwst = new Array(N);
	    var iwst = new Array(N);

	    var nrws = new Array(N);
	    var nrwst = new Array(N);
	    var niwst = new Array(N);

	    var rmws = out.words;
	    rmws.length = N;

	    this.convert13b(x.words, x.length, rws, N);
	    this.convert13b(y.words, y.length, nrws, N);

	    this.transform(rws, _, rwst, iwst, N, rbt);
	    this.transform(nrws, _, nrwst, niwst, N, rbt);

	    for (var i = 0; i < N; i++) {
	      var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
	      iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
	      rwst[i] = rx;
	    }

	    this.conjugate(rwst, iwst, N);
	    this.transform(rwst, iwst, rmws, _, N, rbt);
	    this.conjugate(rmws, _, N);
	    this.normalize13b(rmws, N);

	    out.negative = x.negative ^ y.negative;
	    out.length = x.length + y.length;
	    return out.strip();
	  };

	  // Multiply `this` by `num`
	  BN.prototype.mul = function mul (num) {
	    var out = new BN(null);
	    out.words = new Array(this.length + num.length);
	    return this.mulTo(num, out);
	  };

	  // Multiply employing FFT
	  BN.prototype.mulf = function mulf (num) {
	    var out = new BN(null);
	    out.words = new Array(this.length + num.length);
	    return jumboMulTo(this, num, out);
	  };

	  // In-place Multiplication
	  BN.prototype.imul = function imul (num) {
	    return this.clone().mulTo(num, this);
	  };

	  BN.prototype.imuln = function imuln (num) {
	    assert(typeof num === 'number');
	    assert(num < 0x4000000);

	    // Carry
	    var carry = 0;
	    for (var i = 0; i < this.length; i++) {
	      var w = (this.words[i] | 0) * num;
	      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
	      carry >>= 26;
	      carry += (w / 0x4000000) | 0;
	      // NOTE: lo is 27bit maximum
	      carry += lo >>> 26;
	      this.words[i] = lo & 0x3ffffff;
	    }

	    if (carry !== 0) {
	      this.words[i] = carry;
	      this.length++;
	    }

	    return this;
	  };

	  BN.prototype.muln = function muln (num) {
	    return this.clone().imuln(num);
	  };

	  // `this` * `this`
	  BN.prototype.sqr = function sqr () {
	    return this.mul(this);
	  };

	  // `this` * `this` in-place
	  BN.prototype.isqr = function isqr () {
	    return this.imul(this.clone());
	  };

	  // Math.pow(`this`, `num`)
	  BN.prototype.pow = function pow (num) {
	    var w = toBitArray(num);
	    if (w.length === 0) return new BN(1);

	    // Skip leading zeroes
	    var res = this;
	    for (var i = 0; i < w.length; i++, res = res.sqr()) {
	      if (w[i] !== 0) break;
	    }

	    if (++i < w.length) {
	      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
	        if (w[i] === 0) continue;

	        res = res.mul(q);
	      }
	    }

	    return res;
	  };

	  // Shift-left in-place
	  BN.prototype.iushln = function iushln (bits) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var r = bits % 26;
	    var s = (bits - r) / 26;
	    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
	    var i;

	    if (r !== 0) {
	      var carry = 0;

	      for (i = 0; i < this.length; i++) {
	        var newCarry = this.words[i] & carryMask;
	        var c = ((this.words[i] | 0) - newCarry) << r;
	        this.words[i] = c | carry;
	        carry = newCarry >>> (26 - r);
	      }

	      if (carry) {
	        this.words[i] = carry;
	        this.length++;
	      }
	    }

	    if (s !== 0) {
	      for (i = this.length - 1; i >= 0; i--) {
	        this.words[i + s] = this.words[i];
	      }

	      for (i = 0; i < s; i++) {
	        this.words[i] = 0;
	      }

	      this.length += s;
	    }

	    return this.strip();
	  };

	  BN.prototype.ishln = function ishln (bits) {
	    // TODO(indutny): implement me
	    assert(this.negative === 0);
	    return this.iushln(bits);
	  };

	  // Shift-right in-place
	  // NOTE: `hint` is a lowest bit before trailing zeroes
	  // NOTE: if `extended` is present - it will be filled with destroyed bits
	  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var h;
	    if (hint) {
	      h = (hint - (hint % 26)) / 26;
	    } else {
	      h = 0;
	    }

	    var r = bits % 26;
	    var s = Math.min((bits - r) / 26, this.length);
	    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	    var maskedWords = extended;

	    h -= s;
	    h = Math.max(0, h);

	    // Extended mode, copy masked part
	    if (maskedWords) {
	      for (var i = 0; i < s; i++) {
	        maskedWords.words[i] = this.words[i];
	      }
	      maskedWords.length = s;
	    }

	    if (s === 0) ; else if (this.length > s) {
	      this.length -= s;
	      for (i = 0; i < this.length; i++) {
	        this.words[i] = this.words[i + s];
	      }
	    } else {
	      this.words[0] = 0;
	      this.length = 1;
	    }

	    var carry = 0;
	    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
	      var word = this.words[i] | 0;
	      this.words[i] = (carry << (26 - r)) | (word >>> r);
	      carry = word & mask;
	    }

	    // Push carried bits as a mask
	    if (maskedWords && carry !== 0) {
	      maskedWords.words[maskedWords.length++] = carry;
	    }

	    if (this.length === 0) {
	      this.words[0] = 0;
	      this.length = 1;
	    }

	    return this.strip();
	  };

	  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
	    // TODO(indutny): implement me
	    assert(this.negative === 0);
	    return this.iushrn(bits, hint, extended);
	  };

	  // Shift-left
	  BN.prototype.shln = function shln (bits) {
	    return this.clone().ishln(bits);
	  };

	  BN.prototype.ushln = function ushln (bits) {
	    return this.clone().iushln(bits);
	  };

	  // Shift-right
	  BN.prototype.shrn = function shrn (bits) {
	    return this.clone().ishrn(bits);
	  };

	  BN.prototype.ushrn = function ushrn (bits) {
	    return this.clone().iushrn(bits);
	  };

	  // Test if n bit is set
	  BN.prototype.testn = function testn (bit) {
	    assert(typeof bit === 'number' && bit >= 0);
	    var r = bit % 26;
	    var s = (bit - r) / 26;
	    var q = 1 << r;

	    // Fast case: bit is much higher than all existing words
	    if (this.length <= s) return false;

	    // Check bit and return
	    var w = this.words[s];

	    return !!(w & q);
	  };

	  // Return only lowers bits of number (in-place)
	  BN.prototype.imaskn = function imaskn (bits) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var r = bits % 26;
	    var s = (bits - r) / 26;

	    assert(this.negative === 0, 'imaskn works only with positive numbers');

	    if (this.length <= s) {
	      return this;
	    }

	    if (r !== 0) {
	      s++;
	    }
	    this.length = Math.min(s, this.length);

	    if (r !== 0) {
	      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	      this.words[this.length - 1] &= mask;
	    }

	    return this.strip();
	  };

	  // Return only lowers bits of number
	  BN.prototype.maskn = function maskn (bits) {
	    return this.clone().imaskn(bits);
	  };

	  // Add plain number `num` to `this`
	  BN.prototype.iaddn = function iaddn (num) {
	    assert(typeof num === 'number');
	    assert(num < 0x4000000);
	    if (num < 0) return this.isubn(-num);

	    // Possible sign change
	    if (this.negative !== 0) {
	      if (this.length === 1 && (this.words[0] | 0) < num) {
	        this.words[0] = num - (this.words[0] | 0);
	        this.negative = 0;
	        return this;
	      }

	      this.negative = 0;
	      this.isubn(num);
	      this.negative = 1;
	      return this;
	    }

	    // Add without checks
	    return this._iaddn(num);
	  };

	  BN.prototype._iaddn = function _iaddn (num) {
	    this.words[0] += num;

	    // Carry
	    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
	      this.words[i] -= 0x4000000;
	      if (i === this.length - 1) {
	        this.words[i + 1] = 1;
	      } else {
	        this.words[i + 1]++;
	      }
	    }
	    this.length = Math.max(this.length, i + 1);

	    return this;
	  };

	  // Subtract plain number `num` from `this`
	  BN.prototype.isubn = function isubn (num) {
	    assert(typeof num === 'number');
	    assert(num < 0x4000000);
	    if (num < 0) return this.iaddn(-num);

	    if (this.negative !== 0) {
	      this.negative = 0;
	      this.iaddn(num);
	      this.negative = 1;
	      return this;
	    }

	    this.words[0] -= num;

	    if (this.length === 1 && this.words[0] < 0) {
	      this.words[0] = -this.words[0];
	      this.negative = 1;
	    } else {
	      // Carry
	      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
	        this.words[i] += 0x4000000;
	        this.words[i + 1] -= 1;
	      }
	    }

	    return this.strip();
	  };

	  BN.prototype.addn = function addn (num) {
	    return this.clone().iaddn(num);
	  };

	  BN.prototype.subn = function subn (num) {
	    return this.clone().isubn(num);
	  };

	  BN.prototype.iabs = function iabs () {
	    this.negative = 0;

	    return this;
	  };

	  BN.prototype.abs = function abs () {
	    return this.clone().iabs();
	  };

	  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
	    var len = num.length + shift;
	    var i;

	    this._expand(len);

	    var w;
	    var carry = 0;
	    for (i = 0; i < num.length; i++) {
	      w = (this.words[i + shift] | 0) + carry;
	      var right = (num.words[i] | 0) * mul;
	      w -= right & 0x3ffffff;
	      carry = (w >> 26) - ((right / 0x4000000) | 0);
	      this.words[i + shift] = w & 0x3ffffff;
	    }
	    for (; i < this.length - shift; i++) {
	      w = (this.words[i + shift] | 0) + carry;
	      carry = w >> 26;
	      this.words[i + shift] = w & 0x3ffffff;
	    }

	    if (carry === 0) return this.strip();

	    // Subtraction overflow
	    assert(carry === -1);
	    carry = 0;
	    for (i = 0; i < this.length; i++) {
	      w = -(this.words[i] | 0) + carry;
	      carry = w >> 26;
	      this.words[i] = w & 0x3ffffff;
	    }
	    this.negative = 1;

	    return this.strip();
	  };

	  BN.prototype._wordDiv = function _wordDiv (num, mode) {
	    var shift = this.length - num.length;

	    var a = this.clone();
	    var b = num;

	    // Normalize
	    var bhi = b.words[b.length - 1] | 0;
	    var bhiBits = this._countBits(bhi);
	    shift = 26 - bhiBits;
	    if (shift !== 0) {
	      b = b.ushln(shift);
	      a.iushln(shift);
	      bhi = b.words[b.length - 1] | 0;
	    }

	    // Initialize quotient
	    var m = a.length - b.length;
	    var q;

	    if (mode !== 'mod') {
	      q = new BN(null);
	      q.length = m + 1;
	      q.words = new Array(q.length);
	      for (var i = 0; i < q.length; i++) {
	        q.words[i] = 0;
	      }
	    }

	    var diff = a.clone()._ishlnsubmul(b, 1, m);
	    if (diff.negative === 0) {
	      a = diff;
	      if (q) {
	        q.words[m] = 1;
	      }
	    }

	    for (var j = m - 1; j >= 0; j--) {
	      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
	        (a.words[b.length + j - 1] | 0);

	      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
	      // (0x7ffffff)
	      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

	      a._ishlnsubmul(b, qj, j);
	      while (a.negative !== 0) {
	        qj--;
	        a.negative = 0;
	        a._ishlnsubmul(b, 1, j);
	        if (!a.isZero()) {
	          a.negative ^= 1;
	        }
	      }
	      if (q) {
	        q.words[j] = qj;
	      }
	    }
	    if (q) {
	      q.strip();
	    }
	    a.strip();

	    // Denormalize
	    if (mode !== 'div' && shift !== 0) {
	      a.iushrn(shift);
	    }

	    return {
	      div: q || null,
	      mod: a
	    };
	  };

	  // NOTE: 1) `mode` can be set to `mod` to request mod only,
	  //       to `div` to request div only, or be absent to
	  //       request both div & mod
	  //       2) `positive` is true if unsigned mod is requested
	  BN.prototype.divmod = function divmod (num, mode, positive) {
	    assert(!num.isZero());

	    if (this.isZero()) {
	      return {
	        div: new BN(0),
	        mod: new BN(0)
	      };
	    }

	    var div, mod, res;
	    if (this.negative !== 0 && num.negative === 0) {
	      res = this.neg().divmod(num, mode);

	      if (mode !== 'mod') {
	        div = res.div.neg();
	      }

	      if (mode !== 'div') {
	        mod = res.mod.neg();
	        if (positive && mod.negative !== 0) {
	          mod.iadd(num);
	        }
	      }

	      return {
	        div: div,
	        mod: mod
	      };
	    }

	    if (this.negative === 0 && num.negative !== 0) {
	      res = this.divmod(num.neg(), mode);

	      if (mode !== 'mod') {
	        div = res.div.neg();
	      }

	      return {
	        div: div,
	        mod: res.mod
	      };
	    }

	    if ((this.negative & num.negative) !== 0) {
	      res = this.neg().divmod(num.neg(), mode);

	      if (mode !== 'div') {
	        mod = res.mod.neg();
	        if (positive && mod.negative !== 0) {
	          mod.isub(num);
	        }
	      }

	      return {
	        div: res.div,
	        mod: mod
	      };
	    }

	    // Both numbers are positive at this point

	    // Strip both numbers to approximate shift value
	    if (num.length > this.length || this.cmp(num) < 0) {
	      return {
	        div: new BN(0),
	        mod: this
	      };
	    }

	    // Very short reduction
	    if (num.length === 1) {
	      if (mode === 'div') {
	        return {
	          div: this.divn(num.words[0]),
	          mod: null
	        };
	      }

	      if (mode === 'mod') {
	        return {
	          div: null,
	          mod: new BN(this.modn(num.words[0]))
	        };
	      }

	      return {
	        div: this.divn(num.words[0]),
	        mod: new BN(this.modn(num.words[0]))
	      };
	    }

	    return this._wordDiv(num, mode);
	  };

	  // Find `this` / `num`
	  BN.prototype.div = function div (num) {
	    return this.divmod(num, 'div', false).div;
	  };

	  // Find `this` % `num`
	  BN.prototype.mod = function mod (num) {
	    return this.divmod(num, 'mod', false).mod;
	  };

	  BN.prototype.umod = function umod (num) {
	    return this.divmod(num, 'mod', true).mod;
	  };

	  // Find Round(`this` / `num`)
	  BN.prototype.divRound = function divRound (num) {
	    var dm = this.divmod(num);

	    // Fast case - exact division
	    if (dm.mod.isZero()) return dm.div;

	    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

	    var half = num.ushrn(1);
	    var r2 = num.andln(1);
	    var cmp = mod.cmp(half);

	    // Round down
	    if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

	    // Round up
	    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
	  };

	  BN.prototype.modn = function modn (num) {
	    assert(num <= 0x3ffffff);
	    var p = (1 << 26) % num;

	    var acc = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      acc = (p * acc + (this.words[i] | 0)) % num;
	    }

	    return acc;
	  };

	  // In-place division by number
	  BN.prototype.idivn = function idivn (num) {
	    assert(num <= 0x3ffffff);

	    var carry = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      var w = (this.words[i] | 0) + carry * 0x4000000;
	      this.words[i] = (w / num) | 0;
	      carry = w % num;
	    }

	    return this.strip();
	  };

	  BN.prototype.divn = function divn (num) {
	    return this.clone().idivn(num);
	  };

	  BN.prototype.egcd = function egcd (p) {
	    assert(p.negative === 0);
	    assert(!p.isZero());

	    var x = this;
	    var y = p.clone();

	    if (x.negative !== 0) {
	      x = x.umod(p);
	    } else {
	      x = x.clone();
	    }

	    // A * x + B * y = x
	    var A = new BN(1);
	    var B = new BN(0);

	    // C * x + D * y = y
	    var C = new BN(0);
	    var D = new BN(1);

	    var g = 0;

	    while (x.isEven() && y.isEven()) {
	      x.iushrn(1);
	      y.iushrn(1);
	      ++g;
	    }

	    var yp = y.clone();
	    var xp = x.clone();

	    while (!x.isZero()) {
	      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
	      if (i > 0) {
	        x.iushrn(i);
	        while (i-- > 0) {
	          if (A.isOdd() || B.isOdd()) {
	            A.iadd(yp);
	            B.isub(xp);
	          }

	          A.iushrn(1);
	          B.iushrn(1);
	        }
	      }

	      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
	      if (j > 0) {
	        y.iushrn(j);
	        while (j-- > 0) {
	          if (C.isOdd() || D.isOdd()) {
	            C.iadd(yp);
	            D.isub(xp);
	          }

	          C.iushrn(1);
	          D.iushrn(1);
	        }
	      }

	      if (x.cmp(y) >= 0) {
	        x.isub(y);
	        A.isub(C);
	        B.isub(D);
	      } else {
	        y.isub(x);
	        C.isub(A);
	        D.isub(B);
	      }
	    }

	    return {
	      a: C,
	      b: D,
	      gcd: y.iushln(g)
	    };
	  };

	  // This is reduced incarnation of the binary EEA
	  // above, designated to invert members of the
	  // _prime_ fields F(p) at a maximal speed
	  BN.prototype._invmp = function _invmp (p) {
	    assert(p.negative === 0);
	    assert(!p.isZero());

	    var a = this;
	    var b = p.clone();

	    if (a.negative !== 0) {
	      a = a.umod(p);
	    } else {
	      a = a.clone();
	    }

	    var x1 = new BN(1);
	    var x2 = new BN(0);

	    var delta = b.clone();

	    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
	      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
	      if (i > 0) {
	        a.iushrn(i);
	        while (i-- > 0) {
	          if (x1.isOdd()) {
	            x1.iadd(delta);
	          }

	          x1.iushrn(1);
	        }
	      }

	      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
	      if (j > 0) {
	        b.iushrn(j);
	        while (j-- > 0) {
	          if (x2.isOdd()) {
	            x2.iadd(delta);
	          }

	          x2.iushrn(1);
	        }
	      }

	      if (a.cmp(b) >= 0) {
	        a.isub(b);
	        x1.isub(x2);
	      } else {
	        b.isub(a);
	        x2.isub(x1);
	      }
	    }

	    var res;
	    if (a.cmpn(1) === 0) {
	      res = x1;
	    } else {
	      res = x2;
	    }

	    if (res.cmpn(0) < 0) {
	      res.iadd(p);
	    }

	    return res;
	  };

	  BN.prototype.gcd = function gcd (num) {
	    if (this.isZero()) return num.abs();
	    if (num.isZero()) return this.abs();

	    var a = this.clone();
	    var b = num.clone();
	    a.negative = 0;
	    b.negative = 0;

	    // Remove common factor of two
	    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
	      a.iushrn(1);
	      b.iushrn(1);
	    }

	    do {
	      while (a.isEven()) {
	        a.iushrn(1);
	      }
	      while (b.isEven()) {
	        b.iushrn(1);
	      }

	      var r = a.cmp(b);
	      if (r < 0) {
	        // Swap `a` and `b` to make `a` always bigger than `b`
	        var t = a;
	        a = b;
	        b = t;
	      } else if (r === 0 || b.cmpn(1) === 0) {
	        break;
	      }

	      a.isub(b);
	    } while (true);

	    return b.iushln(shift);
	  };

	  // Invert number in the field F(num)
	  BN.prototype.invm = function invm (num) {
	    return this.egcd(num).a.umod(num);
	  };

	  BN.prototype.isEven = function isEven () {
	    return (this.words[0] & 1) === 0;
	  };

	  BN.prototype.isOdd = function isOdd () {
	    return (this.words[0] & 1) === 1;
	  };

	  // And first word and num
	  BN.prototype.andln = function andln (num) {
	    return this.words[0] & num;
	  };

	  // Increment at the bit position in-line
	  BN.prototype.bincn = function bincn (bit) {
	    assert(typeof bit === 'number');
	    var r = bit % 26;
	    var s = (bit - r) / 26;
	    var q = 1 << r;

	    // Fast case: bit is much higher than all existing words
	    if (this.length <= s) {
	      this._expand(s + 1);
	      this.words[s] |= q;
	      return this;
	    }

	    // Add bit and propagate, if needed
	    var carry = q;
	    for (var i = s; carry !== 0 && i < this.length; i++) {
	      var w = this.words[i] | 0;
	      w += carry;
	      carry = w >>> 26;
	      w &= 0x3ffffff;
	      this.words[i] = w;
	    }
	    if (carry !== 0) {
	      this.words[i] = carry;
	      this.length++;
	    }
	    return this;
	  };

	  BN.prototype.isZero = function isZero () {
	    return this.length === 1 && this.words[0] === 0;
	  };

	  BN.prototype.cmpn = function cmpn (num) {
	    var negative = num < 0;

	    if (this.negative !== 0 && !negative) return -1;
	    if (this.negative === 0 && negative) return 1;

	    this.strip();

	    var res;
	    if (this.length > 1) {
	      res = 1;
	    } else {
	      if (negative) {
	        num = -num;
	      }

	      assert(num <= 0x3ffffff, 'Number is too big');

	      var w = this.words[0] | 0;
	      res = w === num ? 0 : w < num ? -1 : 1;
	    }
	    if (this.negative !== 0) return -res | 0;
	    return res;
	  };

	  // Compare two numbers and return:
	  // 1 - if `this` > `num`
	  // 0 - if `this` == `num`
	  // -1 - if `this` < `num`
	  BN.prototype.cmp = function cmp (num) {
	    if (this.negative !== 0 && num.negative === 0) return -1;
	    if (this.negative === 0 && num.negative !== 0) return 1;

	    var res = this.ucmp(num);
	    if (this.negative !== 0) return -res | 0;
	    return res;
	  };

	  // Unsigned comparison
	  BN.prototype.ucmp = function ucmp (num) {
	    // At this point both numbers have the same sign
	    if (this.length > num.length) return 1;
	    if (this.length < num.length) return -1;

	    var res = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      var a = this.words[i] | 0;
	      var b = num.words[i] | 0;

	      if (a === b) continue;
	      if (a < b) {
	        res = -1;
	      } else if (a > b) {
	        res = 1;
	      }
	      break;
	    }
	    return res;
	  };

	  BN.prototype.gtn = function gtn (num) {
	    return this.cmpn(num) === 1;
	  };

	  BN.prototype.gt = function gt (num) {
	    return this.cmp(num) === 1;
	  };

	  BN.prototype.gten = function gten (num) {
	    return this.cmpn(num) >= 0;
	  };

	  BN.prototype.gte = function gte (num) {
	    return this.cmp(num) >= 0;
	  };

	  BN.prototype.ltn = function ltn (num) {
	    return this.cmpn(num) === -1;
	  };

	  BN.prototype.lt = function lt (num) {
	    return this.cmp(num) === -1;
	  };

	  BN.prototype.lten = function lten (num) {
	    return this.cmpn(num) <= 0;
	  };

	  BN.prototype.lte = function lte (num) {
	    return this.cmp(num) <= 0;
	  };

	  BN.prototype.eqn = function eqn (num) {
	    return this.cmpn(num) === 0;
	  };

	  BN.prototype.eq = function eq (num) {
	    return this.cmp(num) === 0;
	  };

	  //
	  // A reduce context, could be using montgomery or something better, depending
	  // on the `m` itself.
	  //
	  BN.red = function red (num) {
	    return new Red(num);
	  };

	  BN.prototype.toRed = function toRed (ctx) {
	    assert(!this.red, 'Already a number in reduction context');
	    assert(this.negative === 0, 'red works only with positives');
	    return ctx.convertTo(this)._forceRed(ctx);
	  };

	  BN.prototype.fromRed = function fromRed () {
	    assert(this.red, 'fromRed works only with numbers in reduction context');
	    return this.red.convertFrom(this);
	  };

	  BN.prototype._forceRed = function _forceRed (ctx) {
	    this.red = ctx;
	    return this;
	  };

	  BN.prototype.forceRed = function forceRed (ctx) {
	    assert(!this.red, 'Already a number in reduction context');
	    return this._forceRed(ctx);
	  };

	  BN.prototype.redAdd = function redAdd (num) {
	    assert(this.red, 'redAdd works only with red numbers');
	    return this.red.add(this, num);
	  };

	  BN.prototype.redIAdd = function redIAdd (num) {
	    assert(this.red, 'redIAdd works only with red numbers');
	    return this.red.iadd(this, num);
	  };

	  BN.prototype.redSub = function redSub (num) {
	    assert(this.red, 'redSub works only with red numbers');
	    return this.red.sub(this, num);
	  };

	  BN.prototype.redISub = function redISub (num) {
	    assert(this.red, 'redISub works only with red numbers');
	    return this.red.isub(this, num);
	  };

	  BN.prototype.redShl = function redShl (num) {
	    assert(this.red, 'redShl works only with red numbers');
	    return this.red.shl(this, num);
	  };

	  BN.prototype.redMul = function redMul (num) {
	    assert(this.red, 'redMul works only with red numbers');
	    this.red._verify2(this, num);
	    return this.red.mul(this, num);
	  };

	  BN.prototype.redIMul = function redIMul (num) {
	    assert(this.red, 'redMul works only with red numbers');
	    this.red._verify2(this, num);
	    return this.red.imul(this, num);
	  };

	  BN.prototype.redSqr = function redSqr () {
	    assert(this.red, 'redSqr works only with red numbers');
	    this.red._verify1(this);
	    return this.red.sqr(this);
	  };

	  BN.prototype.redISqr = function redISqr () {
	    assert(this.red, 'redISqr works only with red numbers');
	    this.red._verify1(this);
	    return this.red.isqr(this);
	  };

	  // Square root over p
	  BN.prototype.redSqrt = function redSqrt () {
	    assert(this.red, 'redSqrt works only with red numbers');
	    this.red._verify1(this);
	    return this.red.sqrt(this);
	  };

	  BN.prototype.redInvm = function redInvm () {
	    assert(this.red, 'redInvm works only with red numbers');
	    this.red._verify1(this);
	    return this.red.invm(this);
	  };

	  // Return negative clone of `this` % `red modulo`
	  BN.prototype.redNeg = function redNeg () {
	    assert(this.red, 'redNeg works only with red numbers');
	    this.red._verify1(this);
	    return this.red.neg(this);
	  };

	  BN.prototype.redPow = function redPow (num) {
	    assert(this.red && !num.red, 'redPow(normalNum)');
	    this.red._verify1(this);
	    return this.red.pow(this, num);
	  };

	  // Prime numbers with efficient reduction
	  var primes = {
	    k256: null,
	    p224: null,
	    p192: null,
	    p25519: null
	  };

	  // Pseudo-Mersenne prime
	  function MPrime (name, p) {
	    // P = 2 ^ N - K
	    this.name = name;
	    this.p = new BN(p, 16);
	    this.n = this.p.bitLength();
	    this.k = new BN(1).iushln(this.n).isub(this.p);

	    this.tmp = this._tmp();
	  }

	  MPrime.prototype._tmp = function _tmp () {
	    var tmp = new BN(null);
	    tmp.words = new Array(Math.ceil(this.n / 13));
	    return tmp;
	  };

	  MPrime.prototype.ireduce = function ireduce (num) {
	    // Assumes that `num` is less than `P^2`
	    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
	    var r = num;
	    var rlen;

	    do {
	      this.split(r, this.tmp);
	      r = this.imulK(r);
	      r = r.iadd(this.tmp);
	      rlen = r.bitLength();
	    } while (rlen > this.n);

	    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
	    if (cmp === 0) {
	      r.words[0] = 0;
	      r.length = 1;
	    } else if (cmp > 0) {
	      r.isub(this.p);
	    } else {
	      if (r.strip !== undefined) {
	        // r is BN v4 instance
	        r.strip();
	      } else {
	        // r is BN v5 instance
	        r._strip();
	      }
	    }

	    return r;
	  };

	  MPrime.prototype.split = function split (input, out) {
	    input.iushrn(this.n, 0, out);
	  };

	  MPrime.prototype.imulK = function imulK (num) {
	    return num.imul(this.k);
	  };

	  function K256 () {
	    MPrime.call(
	      this,
	      'k256',
	      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
	  }
	  inherits(K256, MPrime);

	  K256.prototype.split = function split (input, output) {
	    // 256 = 9 * 26 + 22
	    var mask = 0x3fffff;

	    var outLen = Math.min(input.length, 9);
	    for (var i = 0; i < outLen; i++) {
	      output.words[i] = input.words[i];
	    }
	    output.length = outLen;

	    if (input.length <= 9) {
	      input.words[0] = 0;
	      input.length = 1;
	      return;
	    }

	    // Shift by 9 limbs
	    var prev = input.words[9];
	    output.words[output.length++] = prev & mask;

	    for (i = 10; i < input.length; i++) {
	      var next = input.words[i] | 0;
	      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
	      prev = next;
	    }
	    prev >>>= 22;
	    input.words[i - 10] = prev;
	    if (prev === 0 && input.length > 10) {
	      input.length -= 10;
	    } else {
	      input.length -= 9;
	    }
	  };

	  K256.prototype.imulK = function imulK (num) {
	    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
	    num.words[num.length] = 0;
	    num.words[num.length + 1] = 0;
	    num.length += 2;

	    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
	    var lo = 0;
	    for (var i = 0; i < num.length; i++) {
	      var w = num.words[i] | 0;
	      lo += w * 0x3d1;
	      num.words[i] = lo & 0x3ffffff;
	      lo = w * 0x40 + ((lo / 0x4000000) | 0);
	    }

	    // Fast length reduction
	    if (num.words[num.length - 1] === 0) {
	      num.length--;
	      if (num.words[num.length - 1] === 0) {
	        num.length--;
	      }
	    }
	    return num;
	  };

	  function P224 () {
	    MPrime.call(
	      this,
	      'p224',
	      'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
	  }
	  inherits(P224, MPrime);

	  function P192 () {
	    MPrime.call(
	      this,
	      'p192',
	      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
	  }
	  inherits(P192, MPrime);

	  function P25519 () {
	    // 2 ^ 255 - 19
	    MPrime.call(
	      this,
	      '25519',
	      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
	  }
	  inherits(P25519, MPrime);

	  P25519.prototype.imulK = function imulK (num) {
	    // K = 0x13
	    var carry = 0;
	    for (var i = 0; i < num.length; i++) {
	      var hi = (num.words[i] | 0) * 0x13 + carry;
	      var lo = hi & 0x3ffffff;
	      hi >>>= 26;

	      num.words[i] = lo;
	      carry = hi;
	    }
	    if (carry !== 0) {
	      num.words[num.length++] = carry;
	    }
	    return num;
	  };

	  // Exported mostly for testing purposes, use plain name instead
	  BN._prime = function prime (name) {
	    // Cached version of prime
	    if (primes[name]) return primes[name];

	    var prime;
	    if (name === 'k256') {
	      prime = new K256();
	    } else if (name === 'p224') {
	      prime = new P224();
	    } else if (name === 'p192') {
	      prime = new P192();
	    } else if (name === 'p25519') {
	      prime = new P25519();
	    } else {
	      throw new Error('Unknown prime ' + name);
	    }
	    primes[name] = prime;

	    return prime;
	  };

	  //
	  // Base reduction engine
	  //
	  function Red (m) {
	    if (typeof m === 'string') {
	      var prime = BN._prime(m);
	      this.m = prime.p;
	      this.prime = prime;
	    } else {
	      assert(m.gtn(1), 'modulus must be greater than 1');
	      this.m = m;
	      this.prime = null;
	    }
	  }

	  Red.prototype._verify1 = function _verify1 (a) {
	    assert(a.negative === 0, 'red works only with positives');
	    assert(a.red, 'red works only with red numbers');
	  };

	  Red.prototype._verify2 = function _verify2 (a, b) {
	    assert((a.negative | b.negative) === 0, 'red works only with positives');
	    assert(a.red && a.red === b.red,
	      'red works only with red numbers');
	  };

	  Red.prototype.imod = function imod (a) {
	    if (this.prime) return this.prime.ireduce(a)._forceRed(this);
	    return a.umod(this.m)._forceRed(this);
	  };

	  Red.prototype.neg = function neg (a) {
	    if (a.isZero()) {
	      return a.clone();
	    }

	    return this.m.sub(a)._forceRed(this);
	  };

	  Red.prototype.add = function add (a, b) {
	    this._verify2(a, b);

	    var res = a.add(b);
	    if (res.cmp(this.m) >= 0) {
	      res.isub(this.m);
	    }
	    return res._forceRed(this);
	  };

	  Red.prototype.iadd = function iadd (a, b) {
	    this._verify2(a, b);

	    var res = a.iadd(b);
	    if (res.cmp(this.m) >= 0) {
	      res.isub(this.m);
	    }
	    return res;
	  };

	  Red.prototype.sub = function sub (a, b) {
	    this._verify2(a, b);

	    var res = a.sub(b);
	    if (res.cmpn(0) < 0) {
	      res.iadd(this.m);
	    }
	    return res._forceRed(this);
	  };

	  Red.prototype.isub = function isub (a, b) {
	    this._verify2(a, b);

	    var res = a.isub(b);
	    if (res.cmpn(0) < 0) {
	      res.iadd(this.m);
	    }
	    return res;
	  };

	  Red.prototype.shl = function shl (a, num) {
	    this._verify1(a);
	    return this.imod(a.ushln(num));
	  };

	  Red.prototype.imul = function imul (a, b) {
	    this._verify2(a, b);
	    return this.imod(a.imul(b));
	  };

	  Red.prototype.mul = function mul (a, b) {
	    this._verify2(a, b);
	    return this.imod(a.mul(b));
	  };

	  Red.prototype.isqr = function isqr (a) {
	    return this.imul(a, a.clone());
	  };

	  Red.prototype.sqr = function sqr (a) {
	    return this.mul(a, a);
	  };

	  Red.prototype.sqrt = function sqrt (a) {
	    if (a.isZero()) return a.clone();

	    var mod3 = this.m.andln(3);
	    assert(mod3 % 2 === 1);

	    // Fast case
	    if (mod3 === 3) {
	      var pow = this.m.add(new BN(1)).iushrn(2);
	      return this.pow(a, pow);
	    }

	    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
	    //
	    // Find Q and S, that Q * 2 ^ S = (P - 1)
	    var q = this.m.subn(1);
	    var s = 0;
	    while (!q.isZero() && q.andln(1) === 0) {
	      s++;
	      q.iushrn(1);
	    }
	    assert(!q.isZero());

	    var one = new BN(1).toRed(this);
	    var nOne = one.redNeg();

	    // Find quadratic non-residue
	    // NOTE: Max is such because of generalized Riemann hypothesis.
	    var lpow = this.m.subn(1).iushrn(1);
	    var z = this.m.bitLength();
	    z = new BN(2 * z * z).toRed(this);

	    while (this.pow(z, lpow).cmp(nOne) !== 0) {
	      z.redIAdd(nOne);
	    }

	    var c = this.pow(z, q);
	    var r = this.pow(a, q.addn(1).iushrn(1));
	    var t = this.pow(a, q);
	    var m = s;
	    while (t.cmp(one) !== 0) {
	      var tmp = t;
	      for (var i = 0; tmp.cmp(one) !== 0; i++) {
	        tmp = tmp.redSqr();
	      }
	      assert(i < m);
	      var b = this.pow(c, new BN(1).iushln(m - i - 1));

	      r = r.redMul(b);
	      c = b.redSqr();
	      t = t.redMul(c);
	      m = i;
	    }

	    return r;
	  };

	  Red.prototype.invm = function invm (a) {
	    var inv = a._invmp(this.m);
	    if (inv.negative !== 0) {
	      inv.negative = 0;
	      return this.imod(inv).redNeg();
	    } else {
	      return this.imod(inv);
	    }
	  };

	  Red.prototype.pow = function pow (a, num) {
	    if (num.isZero()) return new BN(1).toRed(this);
	    if (num.cmpn(1) === 0) return a.clone();

	    var windowSize = 4;
	    var wnd = new Array(1 << windowSize);
	    wnd[0] = new BN(1).toRed(this);
	    wnd[1] = a;
	    for (var i = 2; i < wnd.length; i++) {
	      wnd[i] = this.mul(wnd[i - 1], a);
	    }

	    var res = wnd[0];
	    var current = 0;
	    var currentLen = 0;
	    var start = num.bitLength() % 26;
	    if (start === 0) {
	      start = 26;
	    }

	    for (i = num.length - 1; i >= 0; i--) {
	      var word = num.words[i];
	      for (var j = start - 1; j >= 0; j--) {
	        var bit = (word >> j) & 1;
	        if (res !== wnd[0]) {
	          res = this.sqr(res);
	        }

	        if (bit === 0 && current === 0) {
	          currentLen = 0;
	          continue;
	        }

	        current <<= 1;
	        current |= bit;
	        currentLen++;
	        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

	        res = this.mul(res, wnd[current]);
	        currentLen = 0;
	        current = 0;
	      }
	      start = 26;
	    }

	    return res;
	  };

	  Red.prototype.convertTo = function convertTo (num) {
	    var r = num.umod(this.m);

	    return r === num ? r.clone() : r;
	  };

	  Red.prototype.convertFrom = function convertFrom (num) {
	    var res = num.clone();
	    res.red = null;
	    return res;
	  };

	  //
	  // Montgomery method engine
	  //

	  BN.mont = function mont (num) {
	    return new Mont(num);
	  };

	  function Mont (m) {
	    Red.call(this, m);

	    this.shift = this.m.bitLength();
	    if (this.shift % 26 !== 0) {
	      this.shift += 26 - (this.shift % 26);
	    }

	    this.r = new BN(1).iushln(this.shift);
	    this.r2 = this.imod(this.r.sqr());
	    this.rinv = this.r._invmp(this.m);

	    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
	    this.minv = this.minv.umod(this.r);
	    this.minv = this.r.sub(this.minv);
	  }
	  inherits(Mont, Red);

	  Mont.prototype.convertTo = function convertTo (num) {
	    return this.imod(num.ushln(this.shift));
	  };

	  Mont.prototype.convertFrom = function convertFrom (num) {
	    var r = this.imod(num.mul(this.rinv));
	    r.red = null;
	    return r;
	  };

	  Mont.prototype.imul = function imul (a, b) {
	    if (a.isZero() || b.isZero()) {
	      a.words[0] = 0;
	      a.length = 1;
	      return a;
	    }

	    var t = a.imul(b);
	    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	    var u = t.isub(c).iushrn(this.shift);
	    var res = u;

	    if (u.cmp(this.m) >= 0) {
	      res = u.isub(this.m);
	    } else if (u.cmpn(0) < 0) {
	      res = u.iadd(this.m);
	    }

	    return res._forceRed(this);
	  };

	  Mont.prototype.mul = function mul (a, b) {
	    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

	    var t = a.mul(b);
	    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	    var u = t.isub(c).iushrn(this.shift);
	    var res = u;
	    if (u.cmp(this.m) >= 0) {
	      res = u.isub(this.m);
	    } else if (u.cmpn(0) < 0) {
	      res = u.iadd(this.m);
	    }

	    return res._forceRed(this);
	  };

	  Mont.prototype.invm = function invm (a) {
	    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
	    var res = this.imod(a._invmp(this.m).mul(this.r2));
	    return res._forceRed(this);
	  };
	})(module, commonjsGlobal); 
} (bn));

var bnExports = bn.exports;

var minimalisticAssert = assert$f;

function assert$f(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

assert$f.equal = function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
};

var utils$l = {};

(function (exports) {

	var utils = exports;

	function toArray(msg, enc) {
	  if (Array.isArray(msg))
	    return msg.slice();
	  if (!msg)
	    return [];
	  var res = [];
	  if (typeof msg !== 'string') {
	    for (var i = 0; i < msg.length; i++)
	      res[i] = msg[i] | 0;
	    return res;
	  }
	  if (enc === 'hex') {
	    msg = msg.replace(/[^a-z0-9]+/ig, '');
	    if (msg.length % 2 !== 0)
	      msg = '0' + msg;
	    for (var i = 0; i < msg.length; i += 2)
	      res.push(parseInt(msg[i] + msg[i + 1], 16));
	  } else {
	    for (var i = 0; i < msg.length; i++) {
	      var c = msg.charCodeAt(i);
	      var hi = c >> 8;
	      var lo = c & 0xff;
	      if (hi)
	        res.push(hi, lo);
	      else
	        res.push(lo);
	    }
	  }
	  return res;
	}
	utils.toArray = toArray;

	function zero2(word) {
	  if (word.length === 1)
	    return '0' + word;
	  else
	    return word;
	}
	utils.zero2 = zero2;

	function toHex(msg) {
	  var res = '';
	  for (var i = 0; i < msg.length; i++)
	    res += zero2(msg[i].toString(16));
	  return res;
	}
	utils.toHex = toHex;

	utils.encode = function encode(arr, enc) {
	  if (enc === 'hex')
	    return toHex(arr);
	  else
	    return arr;
	}; 
} (utils$l));

(function (exports) {

	var utils = exports;
	var BN = bnExports;
	var minAssert = minimalisticAssert;
	var minUtils = utils$l;

	utils.assert = minAssert;
	utils.toArray = minUtils.toArray;
	utils.zero2 = minUtils.zero2;
	utils.toHex = minUtils.toHex;
	utils.encode = minUtils.encode;

	// Represent num in a w-NAF form
	function getNAF(num, w, bits) {
	  var naf = new Array(Math.max(num.bitLength(), bits) + 1);
	  var i;
	  for (i = 0; i < naf.length; i += 1) {
	    naf[i] = 0;
	  }

	  var ws = 1 << (w + 1);
	  var k = num.clone();

	  for (i = 0; i < naf.length; i++) {
	    var z;
	    var mod = k.andln(ws - 1);
	    if (k.isOdd()) {
	      if (mod > (ws >> 1) - 1)
	        z = (ws >> 1) - mod;
	      else
	        z = mod;
	      k.isubn(z);
	    } else {
	      z = 0;
	    }

	    naf[i] = z;
	    k.iushrn(1);
	  }

	  return naf;
	}
	utils.getNAF = getNAF;

	// Represent k1, k2 in a Joint Sparse Form
	function getJSF(k1, k2) {
	  var jsf = [
	    [],
	    [],
	  ];

	  k1 = k1.clone();
	  k2 = k2.clone();
	  var d1 = 0;
	  var d2 = 0;
	  var m8;
	  while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {
	    // First phase
	    var m14 = (k1.andln(3) + d1) & 3;
	    var m24 = (k2.andln(3) + d2) & 3;
	    if (m14 === 3)
	      m14 = -1;
	    if (m24 === 3)
	      m24 = -1;
	    var u1;
	    if ((m14 & 1) === 0) {
	      u1 = 0;
	    } else {
	      m8 = (k1.andln(7) + d1) & 7;
	      if ((m8 === 3 || m8 === 5) && m24 === 2)
	        u1 = -m14;
	      else
	        u1 = m14;
	    }
	    jsf[0].push(u1);

	    var u2;
	    if ((m24 & 1) === 0) {
	      u2 = 0;
	    } else {
	      m8 = (k2.andln(7) + d2) & 7;
	      if ((m8 === 3 || m8 === 5) && m14 === 2)
	        u2 = -m24;
	      else
	        u2 = m24;
	    }
	    jsf[1].push(u2);

	    // Second phase
	    if (2 * d1 === u1 + 1)
	      d1 = 1 - d1;
	    if (2 * d2 === u2 + 1)
	      d2 = 1 - d2;
	    k1.iushrn(1);
	    k2.iushrn(1);
	  }

	  return jsf;
	}
	utils.getJSF = getJSF;

	function cachedProperty(obj, name, computer) {
	  var key = '_' + name;
	  obj.prototype[name] = function cachedProperty() {
	    return this[key] !== undefined ? this[key] :
	      this[key] = computer.call(this);
	  };
	}
	utils.cachedProperty = cachedProperty;

	function parseBytes(bytes) {
	  return typeof bytes === 'string' ? utils.toArray(bytes, 'hex') :
	    bytes;
	}
	utils.parseBytes = parseBytes;

	function intFromLE(bytes) {
	  return new BN(bytes, 'hex', 'le');
	}
	utils.intFromLE = intFromLE; 
} (utils$m));

var brorand = {exports: {}};

var r$1;

brorand.exports = function rand(len) {
  if (!r$1)
    r$1 = new Rand(null);

  return r$1.generate(len);
};

function Rand(rand) {
  this.rand = rand;
}
brorand.exports.Rand = Rand;

Rand.prototype.generate = function generate(len) {
  return this._rand(len);
};

// Emulate crypto API using randy
Rand.prototype._rand = function _rand(n) {
  if (this.rand.getBytes)
    return this.rand.getBytes(n);

  var res = new Uint8Array(n);
  for (var i = 0; i < res.length; i++)
    res[i] = this.rand.getByte();
  return res;
};

if (typeof self === 'object') {
  if (self.crypto && self.crypto.getRandomValues) {
    // Modern browsers
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      self.crypto.getRandomValues(arr);
      return arr;
    };
  } else if (self.msCrypto && self.msCrypto.getRandomValues) {
    // IE
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      self.msCrypto.getRandomValues(arr);
      return arr;
    };

  // Safari's WebWorkers do not have `crypto`
  } else if (typeof window === 'object') {
    // Old junk
    Rand.prototype._rand = function() {
      throw new Error('Not implemented yet');
    };
  }
} else {
  // Node.js or Web worker with no crypto support
  try {
    var crypto$1 = require('crypto');
    if (typeof crypto$1.randomBytes !== 'function')
      throw new Error('Not supported');

    Rand.prototype._rand = function _rand(n) {
      return crypto$1.randomBytes(n);
    };
  } catch (e) {
  }
}

var brorandExports = brorand.exports;

var curve = {};

var BN$7 = bnExports;
var utils$k = utils$m;
var getNAF = utils$k.getNAF;
var getJSF = utils$k.getJSF;
var assert$e = utils$k.assert;

function BaseCurve(type, conf) {
  this.type = type;
  this.p = new BN$7(conf.p, 16);

  // Use Montgomery, when there is no fast reduction for the prime
  this.red = conf.prime ? BN$7.red(conf.prime) : BN$7.mont(this.p);

  // Useful for many curves
  this.zero = new BN$7(0).toRed(this.red);
  this.one = new BN$7(1).toRed(this.red);
  this.two = new BN$7(2).toRed(this.red);

  // Curve configuration, optional
  this.n = conf.n && new BN$7(conf.n, 16);
  this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed);

  // Temporary arrays
  this._wnafT1 = new Array(4);
  this._wnafT2 = new Array(4);
  this._wnafT3 = new Array(4);
  this._wnafT4 = new Array(4);

  this._bitLength = this.n ? this.n.bitLength() : 0;

  // Generalized Greg Maxwell's trick
  var adjustCount = this.n && this.p.div(this.n);
  if (!adjustCount || adjustCount.cmpn(100) > 0) {
    this.redN = null;
  } else {
    this._maxwellTrick = true;
    this.redN = this.n.toRed(this.red);
  }
}
var base = BaseCurve;

BaseCurve.prototype.point = function point() {
  throw new Error('Not implemented');
};

BaseCurve.prototype.validate = function validate() {
  throw new Error('Not implemented');
};

BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
  assert$e(p.precomputed);
  var doubles = p._getDoubles();

  var naf = getNAF(k, 1, this._bitLength);
  var I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1);
  I /= 3;

  // Translate into more windowed form
  var repr = [];
  var j;
  var nafW;
  for (j = 0; j < naf.length; j += doubles.step) {
    nafW = 0;
    for (var l = j + doubles.step - 1; l >= j; l--)
      nafW = (nafW << 1) + naf[l];
    repr.push(nafW);
  }

  var a = this.jpoint(null, null, null);
  var b = this.jpoint(null, null, null);
  for (var i = I; i > 0; i--) {
    for (j = 0; j < repr.length; j++) {
      nafW = repr[j];
      if (nafW === i)
        b = b.mixedAdd(doubles.points[j]);
      else if (nafW === -i)
        b = b.mixedAdd(doubles.points[j].neg());
    }
    a = a.add(b);
  }
  return a.toP();
};

BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
  var w = 4;

  // Precompute window
  var nafPoints = p._getNAFPoints(w);
  w = nafPoints.wnd;
  var wnd = nafPoints.points;

  // Get NAF form
  var naf = getNAF(k, w, this._bitLength);

  // Add `this`*(N+1) for every w-NAF index
  var acc = this.jpoint(null, null, null);
  for (var i = naf.length - 1; i >= 0; i--) {
    // Count zeroes
    for (var l = 0; i >= 0 && naf[i] === 0; i--)
      l++;
    if (i >= 0)
      l++;
    acc = acc.dblp(l);

    if (i < 0)
      break;
    var z = naf[i];
    assert$e(z !== 0);
    if (p.type === 'affine') {
      // J +- P
      if (z > 0)
        acc = acc.mixedAdd(wnd[(z - 1) >> 1]);
      else
        acc = acc.mixedAdd(wnd[(-z - 1) >> 1].neg());
    } else {
      // J +- J
      if (z > 0)
        acc = acc.add(wnd[(z - 1) >> 1]);
      else
        acc = acc.add(wnd[(-z - 1) >> 1].neg());
    }
  }
  return p.type === 'affine' ? acc.toP() : acc;
};

BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW,
  points,
  coeffs,
  len,
  jacobianResult) {
  var wndWidth = this._wnafT1;
  var wnd = this._wnafT2;
  var naf = this._wnafT3;

  // Fill all arrays
  var max = 0;
  var i;
  var j;
  var p;
  for (i = 0; i < len; i++) {
    p = points[i];
    var nafPoints = p._getNAFPoints(defW);
    wndWidth[i] = nafPoints.wnd;
    wnd[i] = nafPoints.points;
  }

  // Comb small window NAFs
  for (i = len - 1; i >= 1; i -= 2) {
    var a = i - 1;
    var b = i;
    if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
      naf[a] = getNAF(coeffs[a], wndWidth[a], this._bitLength);
      naf[b] = getNAF(coeffs[b], wndWidth[b], this._bitLength);
      max = Math.max(naf[a].length, max);
      max = Math.max(naf[b].length, max);
      continue;
    }

    var comb = [
      points[a], /* 1 */
      null, /* 3 */
      null, /* 5 */
      points[b], /* 7 */
    ];

    // Try to avoid Projective points, if possible
    if (points[a].y.cmp(points[b].y) === 0) {
      comb[1] = points[a].add(points[b]);
      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
    } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
      comb[1] = points[a].toJ().mixedAdd(points[b]);
      comb[2] = points[a].add(points[b].neg());
    } else {
      comb[1] = points[a].toJ().mixedAdd(points[b]);
      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
    }

    var index = [
      -3, /* -1 -1 */
      -1, /* -1 0 */
      -5, /* -1 1 */
      -7, /* 0 -1 */
      0, /* 0 0 */
      7, /* 0 1 */
      5, /* 1 -1 */
      1, /* 1 0 */
      3,  /* 1 1 */
    ];

    var jsf = getJSF(coeffs[a], coeffs[b]);
    max = Math.max(jsf[0].length, max);
    naf[a] = new Array(max);
    naf[b] = new Array(max);
    for (j = 0; j < max; j++) {
      var ja = jsf[0][j] | 0;
      var jb = jsf[1][j] | 0;

      naf[a][j] = index[(ja + 1) * 3 + (jb + 1)];
      naf[b][j] = 0;
      wnd[a] = comb;
    }
  }

  var acc = this.jpoint(null, null, null);
  var tmp = this._wnafT4;
  for (i = max; i >= 0; i--) {
    var k = 0;

    while (i >= 0) {
      var zero = true;
      for (j = 0; j < len; j++) {
        tmp[j] = naf[j][i] | 0;
        if (tmp[j] !== 0)
          zero = false;
      }
      if (!zero)
        break;
      k++;
      i--;
    }
    if (i >= 0)
      k++;
    acc = acc.dblp(k);
    if (i < 0)
      break;

    for (j = 0; j < len; j++) {
      var z = tmp[j];
      if (z === 0)
        continue;
      else if (z > 0)
        p = wnd[j][(z - 1) >> 1];
      else if (z < 0)
        p = wnd[j][(-z - 1) >> 1].neg();

      if (p.type === 'affine')
        acc = acc.mixedAdd(p);
      else
        acc = acc.add(p);
    }
  }
  // Zeroify references
  for (i = 0; i < len; i++)
    wnd[i] = null;

  if (jacobianResult)
    return acc;
  else
    return acc.toP();
};

function BasePoint(curve, type) {
  this.curve = curve;
  this.type = type;
  this.precomputed = null;
}
BaseCurve.BasePoint = BasePoint;

BasePoint.prototype.eq = function eq(/*other*/) {
  throw new Error('Not implemented');
};

BasePoint.prototype.validate = function validate() {
  return this.curve.validate(this);
};

BaseCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
  bytes = utils$k.toArray(bytes, enc);

  var len = this.p.byteLength();

  // uncompressed, hybrid-odd, hybrid-even
  if ((bytes[0] === 0x04 || bytes[0] === 0x06 || bytes[0] === 0x07) &&
      bytes.length - 1 === 2 * len) {
    if (bytes[0] === 0x06)
      assert$e(bytes[bytes.length - 1] % 2 === 0);
    else if (bytes[0] === 0x07)
      assert$e(bytes[bytes.length - 1] % 2 === 1);

    var res =  this.point(bytes.slice(1, 1 + len),
      bytes.slice(1 + len, 1 + 2 * len));

    return res;
  } else if ((bytes[0] === 0x02 || bytes[0] === 0x03) &&
              bytes.length - 1 === len) {
    return this.pointFromX(bytes.slice(1, 1 + len), bytes[0] === 0x03);
  }
  throw new Error('Unknown point format');
};

BasePoint.prototype.encodeCompressed = function encodeCompressed(enc) {
  return this.encode(enc, true);
};

BasePoint.prototype._encode = function _encode(compact) {
  var len = this.curve.p.byteLength();
  var x = this.getX().toArray('be', len);

  if (compact)
    return [ this.getY().isEven() ? 0x02 : 0x03 ].concat(x);

  return [ 0x04 ].concat(x, this.getY().toArray('be', len));
};

BasePoint.prototype.encode = function encode(enc, compact) {
  return utils$k.encode(this._encode(compact), enc);
};

BasePoint.prototype.precompute = function precompute(power) {
  if (this.precomputed)
    return this;

  var precomputed = {
    doubles: null,
    naf: null,
    beta: null,
  };
  precomputed.naf = this._getNAFPoints(8);
  precomputed.doubles = this._getDoubles(4, power);
  precomputed.beta = this._getBeta();
  this.precomputed = precomputed;

  return this;
};

BasePoint.prototype._hasDoubles = function _hasDoubles(k) {
  if (!this.precomputed)
    return false;

  var doubles = this.precomputed.doubles;
  if (!doubles)
    return false;

  return doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step);
};

BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
  if (this.precomputed && this.precomputed.doubles)
    return this.precomputed.doubles;

  var doubles = [ this ];
  var acc = this;
  for (var i = 0; i < power; i += step) {
    for (var j = 0; j < step; j++)
      acc = acc.dbl();
    doubles.push(acc);
  }
  return {
    step: step,
    points: doubles,
  };
};

BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
  if (this.precomputed && this.precomputed.naf)
    return this.precomputed.naf;

  var res = [ this ];
  var max = (1 << wnd) - 1;
  var dbl = max === 1 ? null : this.dbl();
  for (var i = 1; i < max; i++)
    res[i] = res[i - 1].add(dbl);
  return {
    wnd: wnd,
    points: res,
  };
};

BasePoint.prototype._getBeta = function _getBeta() {
  return null;
};

BasePoint.prototype.dblp = function dblp(k) {
  var r = this;
  for (var i = 0; i < k; i++)
    r = r.dbl();
  return r;
};

var inherits$4 = {exports: {}};

var inherits_browser = {exports: {}};

var hasRequiredInherits_browser;

function requireInherits_browser () {
	if (hasRequiredInherits_browser) return inherits_browser.exports;
	hasRequiredInherits_browser = 1;
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	          value: ctor,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	    }
	  };
	} else {
	  // old school shim for old browsers
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      var TempCtor = function () {};
	      TempCtor.prototype = superCtor.prototype;
	      ctor.prototype = new TempCtor();
	      ctor.prototype.constructor = ctor;
	    }
	  };
	}
	return inherits_browser.exports;
}

try {
  var util = require('util');
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  inherits$4.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  inherits$4.exports = requireInherits_browser();
}

var inheritsExports = inherits$4.exports;

var utils$j = utils$m;
var BN$6 = bnExports;
var inherits$3 = inheritsExports;
var Base$2 = base;

var assert$d = utils$j.assert;

function ShortCurve(conf) {
  Base$2.call(this, 'short', conf);

  this.a = new BN$6(conf.a, 16).toRed(this.red);
  this.b = new BN$6(conf.b, 16).toRed(this.red);
  this.tinv = this.two.redInvm();

  this.zeroA = this.a.fromRed().cmpn(0) === 0;
  this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;

  // If the curve is endomorphic, precalculate beta and lambda
  this.endo = this._getEndomorphism(conf);
  this._endoWnafT1 = new Array(4);
  this._endoWnafT2 = new Array(4);
}
inherits$3(ShortCurve, Base$2);
var short = ShortCurve;

ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
  // No efficient endomorphism
  if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)
    return;

  // Compute beta and lambda, that lambda * P = (beta * Px; Py)
  var beta;
  var lambda;
  if (conf.beta) {
    beta = new BN$6(conf.beta, 16).toRed(this.red);
  } else {
    var betas = this._getEndoRoots(this.p);
    // Choose the smallest beta
    beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
    beta = beta.toRed(this.red);
  }
  if (conf.lambda) {
    lambda = new BN$6(conf.lambda, 16);
  } else {
    // Choose the lambda that is matching selected beta
    var lambdas = this._getEndoRoots(this.n);
    if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
      lambda = lambdas[0];
    } else {
      lambda = lambdas[1];
      assert$d(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
    }
  }

  // Get basis vectors, used for balanced length-two representation
  var basis;
  if (conf.basis) {
    basis = conf.basis.map(function(vec) {
      return {
        a: new BN$6(vec.a, 16),
        b: new BN$6(vec.b, 16),
      };
    });
  } else {
    basis = this._getEndoBasis(lambda);
  }

  return {
    beta: beta,
    lambda: lambda,
    basis: basis,
  };
};

ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
  // Find roots of for x^2 + x + 1 in F
  // Root = (-1 +- Sqrt(-3)) / 2
  //
  var red = num === this.p ? this.red : BN$6.mont(num);
  var tinv = new BN$6(2).toRed(red).redInvm();
  var ntinv = tinv.redNeg();

  var s = new BN$6(3).toRed(red).redNeg().redSqrt().redMul(tinv);

  var l1 = ntinv.redAdd(s).fromRed();
  var l2 = ntinv.redSub(s).fromRed();
  return [ l1, l2 ];
};

ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
  // aprxSqrt >= sqrt(this.n)
  var aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2));

  // 3.74
  // Run EGCD, until r(L + 1) < aprxSqrt
  var u = lambda;
  var v = this.n.clone();
  var x1 = new BN$6(1);
  var y1 = new BN$6(0);
  var x2 = new BN$6(0);
  var y2 = new BN$6(1);

  // NOTE: all vectors are roots of: a + b * lambda = 0 (mod n)
  var a0;
  var b0;
  // First vector
  var a1;
  var b1;
  // Second vector
  var a2;
  var b2;

  var prevR;
  var i = 0;
  var r;
  var x;
  while (u.cmpn(0) !== 0) {
    var q = v.div(u);
    r = v.sub(q.mul(u));
    x = x2.sub(q.mul(x1));
    var y = y2.sub(q.mul(y1));

    if (!a1 && r.cmp(aprxSqrt) < 0) {
      a0 = prevR.neg();
      b0 = x1;
      a1 = r.neg();
      b1 = x;
    } else if (a1 && ++i === 2) {
      break;
    }
    prevR = r;

    v = u;
    u = r;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }
  a2 = r.neg();
  b2 = x;

  var len1 = a1.sqr().add(b1.sqr());
  var len2 = a2.sqr().add(b2.sqr());
  if (len2.cmp(len1) >= 0) {
    a2 = a0;
    b2 = b0;
  }

  // Normalize signs
  if (a1.negative) {
    a1 = a1.neg();
    b1 = b1.neg();
  }
  if (a2.negative) {
    a2 = a2.neg();
    b2 = b2.neg();
  }

  return [
    { a: a1, b: b1 },
    { a: a2, b: b2 },
  ];
};

ShortCurve.prototype._endoSplit = function _endoSplit(k) {
  var basis = this.endo.basis;
  var v1 = basis[0];
  var v2 = basis[1];

  var c1 = v2.b.mul(k).divRound(this.n);
  var c2 = v1.b.neg().mul(k).divRound(this.n);

  var p1 = c1.mul(v1.a);
  var p2 = c2.mul(v2.a);
  var q1 = c1.mul(v1.b);
  var q2 = c2.mul(v2.b);

  // Calculate answer
  var k1 = k.sub(p1).sub(p2);
  var k2 = q1.add(q2).neg();
  return { k1: k1, k2: k2 };
};

ShortCurve.prototype.pointFromX = function pointFromX(x, odd) {
  x = new BN$6(x, 16);
  if (!x.red)
    x = x.toRed(this.red);

  var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
  var y = y2.redSqrt();
  if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
    throw new Error('invalid point');

  // XXX Is there any way to tell if the number is odd without converting it
  // to non-red form?
  var isOdd = y.fromRed().isOdd();
  if (odd && !isOdd || !odd && isOdd)
    y = y.redNeg();

  return this.point(x, y);
};

ShortCurve.prototype.validate = function validate(point) {
  if (point.inf)
    return true;

  var x = point.x;
  var y = point.y;

  var ax = this.a.redMul(x);
  var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
  return y.redSqr().redISub(rhs).cmpn(0) === 0;
};

ShortCurve.prototype._endoWnafMulAdd =
    function _endoWnafMulAdd(points, coeffs, jacobianResult) {
      var npoints = this._endoWnafT1;
      var ncoeffs = this._endoWnafT2;
      for (var i = 0; i < points.length; i++) {
        var split = this._endoSplit(coeffs[i]);
        var p = points[i];
        var beta = p._getBeta();

        if (split.k1.negative) {
          split.k1.ineg();
          p = p.neg(true);
        }
        if (split.k2.negative) {
          split.k2.ineg();
          beta = beta.neg(true);
        }

        npoints[i * 2] = p;
        npoints[i * 2 + 1] = beta;
        ncoeffs[i * 2] = split.k1;
        ncoeffs[i * 2 + 1] = split.k2;
      }
      var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult);

      // Clean-up references to points and coefficients
      for (var j = 0; j < i * 2; j++) {
        npoints[j] = null;
        ncoeffs[j] = null;
      }
      return res;
    };

function Point$2(curve, x, y, isRed) {
  Base$2.BasePoint.call(this, curve, 'affine');
  if (x === null && y === null) {
    this.x = null;
    this.y = null;
    this.inf = true;
  } else {
    this.x = new BN$6(x, 16);
    this.y = new BN$6(y, 16);
    // Force redgomery representation when loading from JSON
    if (isRed) {
      this.x.forceRed(this.curve.red);
      this.y.forceRed(this.curve.red);
    }
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.y.red)
      this.y = this.y.toRed(this.curve.red);
    this.inf = false;
  }
}
inherits$3(Point$2, Base$2.BasePoint);

ShortCurve.prototype.point = function point(x, y, isRed) {
  return new Point$2(this, x, y, isRed);
};

ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
  return Point$2.fromJSON(this, obj, red);
};

Point$2.prototype._getBeta = function _getBeta() {
  if (!this.curve.endo)
    return;

  var pre = this.precomputed;
  if (pre && pre.beta)
    return pre.beta;

  var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
  if (pre) {
    var curve = this.curve;
    var endoMul = function(p) {
      return curve.point(p.x.redMul(curve.endo.beta), p.y);
    };
    pre.beta = beta;
    beta.precomputed = {
      beta: null,
      naf: pre.naf && {
        wnd: pre.naf.wnd,
        points: pre.naf.points.map(endoMul),
      },
      doubles: pre.doubles && {
        step: pre.doubles.step,
        points: pre.doubles.points.map(endoMul),
      },
    };
  }
  return beta;
};

Point$2.prototype.toJSON = function toJSON() {
  if (!this.precomputed)
    return [ this.x, this.y ];

  return [ this.x, this.y, this.precomputed && {
    doubles: this.precomputed.doubles && {
      step: this.precomputed.doubles.step,
      points: this.precomputed.doubles.points.slice(1),
    },
    naf: this.precomputed.naf && {
      wnd: this.precomputed.naf.wnd,
      points: this.precomputed.naf.points.slice(1),
    },
  } ];
};

Point$2.fromJSON = function fromJSON(curve, obj, red) {
  if (typeof obj === 'string')
    obj = JSON.parse(obj);
  var res = curve.point(obj[0], obj[1], red);
  if (!obj[2])
    return res;

  function obj2point(obj) {
    return curve.point(obj[0], obj[1], red);
  }

  var pre = obj[2];
  res.precomputed = {
    beta: null,
    doubles: pre.doubles && {
      step: pre.doubles.step,
      points: [ res ].concat(pre.doubles.points.map(obj2point)),
    },
    naf: pre.naf && {
      wnd: pre.naf.wnd,
      points: [ res ].concat(pre.naf.points.map(obj2point)),
    },
  };
  return res;
};

Point$2.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' y: ' + this.y.fromRed().toString(16, 2) + '>';
};

Point$2.prototype.isInfinity = function isInfinity() {
  return this.inf;
};

Point$2.prototype.add = function add(p) {
  // O + P = P
  if (this.inf)
    return p;

  // P + O = P
  if (p.inf)
    return this;

  // P + P = 2P
  if (this.eq(p))
    return this.dbl();

  // P + (-P) = O
  if (this.neg().eq(p))
    return this.curve.point(null, null);

  // P + Q = O
  if (this.x.cmp(p.x) === 0)
    return this.curve.point(null, null);

  var c = this.y.redSub(p.y);
  if (c.cmpn(0) !== 0)
    c = c.redMul(this.x.redSub(p.x).redInvm());
  var nx = c.redSqr().redISub(this.x).redISub(p.x);
  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
  return this.curve.point(nx, ny);
};

Point$2.prototype.dbl = function dbl() {
  if (this.inf)
    return this;

  // 2P = O
  var ys1 = this.y.redAdd(this.y);
  if (ys1.cmpn(0) === 0)
    return this.curve.point(null, null);

  var a = this.curve.a;

  var x2 = this.x.redSqr();
  var dyinv = ys1.redInvm();
  var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);

  var nx = c.redSqr().redISub(this.x.redAdd(this.x));
  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
  return this.curve.point(nx, ny);
};

Point$2.prototype.getX = function getX() {
  return this.x.fromRed();
};

Point$2.prototype.getY = function getY() {
  return this.y.fromRed();
};

Point$2.prototype.mul = function mul(k) {
  k = new BN$6(k, 16);
  if (this.isInfinity())
    return this;
  else if (this._hasDoubles(k))
    return this.curve._fixedNafMul(this, k);
  else if (this.curve.endo)
    return this.curve._endoWnafMulAdd([ this ], [ k ]);
  else
    return this.curve._wnafMul(this, k);
};

Point$2.prototype.mulAdd = function mulAdd(k1, p2, k2) {
  var points = [ this, p2 ];
  var coeffs = [ k1, k2 ];
  if (this.curve.endo)
    return this.curve._endoWnafMulAdd(points, coeffs);
  else
    return this.curve._wnafMulAdd(1, points, coeffs, 2);
};

Point$2.prototype.jmulAdd = function jmulAdd(k1, p2, k2) {
  var points = [ this, p2 ];
  var coeffs = [ k1, k2 ];
  if (this.curve.endo)
    return this.curve._endoWnafMulAdd(points, coeffs, true);
  else
    return this.curve._wnafMulAdd(1, points, coeffs, 2, true);
};

Point$2.prototype.eq = function eq(p) {
  return this === p ||
         this.inf === p.inf &&
             (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
};

Point$2.prototype.neg = function neg(_precompute) {
  if (this.inf)
    return this;

  var res = this.curve.point(this.x, this.y.redNeg());
  if (_precompute && this.precomputed) {
    var pre = this.precomputed;
    var negate = function(p) {
      return p.neg();
    };
    res.precomputed = {
      naf: pre.naf && {
        wnd: pre.naf.wnd,
        points: pre.naf.points.map(negate),
      },
      doubles: pre.doubles && {
        step: pre.doubles.step,
        points: pre.doubles.points.map(negate),
      },
    };
  }
  return res;
};

Point$2.prototype.toJ = function toJ() {
  if (this.inf)
    return this.curve.jpoint(null, null, null);

  var res = this.curve.jpoint(this.x, this.y, this.curve.one);
  return res;
};

function JPoint(curve, x, y, z) {
  Base$2.BasePoint.call(this, curve, 'jacobian');
  if (x === null && y === null && z === null) {
    this.x = this.curve.one;
    this.y = this.curve.one;
    this.z = new BN$6(0);
  } else {
    this.x = new BN$6(x, 16);
    this.y = new BN$6(y, 16);
    this.z = new BN$6(z, 16);
  }
  if (!this.x.red)
    this.x = this.x.toRed(this.curve.red);
  if (!this.y.red)
    this.y = this.y.toRed(this.curve.red);
  if (!this.z.red)
    this.z = this.z.toRed(this.curve.red);

  this.zOne = this.z === this.curve.one;
}
inherits$3(JPoint, Base$2.BasePoint);

ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
  return new JPoint(this, x, y, z);
};

JPoint.prototype.toP = function toP() {
  if (this.isInfinity())
    return this.curve.point(null, null);

  var zinv = this.z.redInvm();
  var zinv2 = zinv.redSqr();
  var ax = this.x.redMul(zinv2);
  var ay = this.y.redMul(zinv2).redMul(zinv);

  return this.curve.point(ax, ay);
};

JPoint.prototype.neg = function neg() {
  return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
};

JPoint.prototype.add = function add(p) {
  // O + P = P
  if (this.isInfinity())
    return p;

  // P + O = P
  if (p.isInfinity())
    return this;

  // 12M + 4S + 7A
  var pz2 = p.z.redSqr();
  var z2 = this.z.redSqr();
  var u1 = this.x.redMul(pz2);
  var u2 = p.x.redMul(z2);
  var s1 = this.y.redMul(pz2.redMul(p.z));
  var s2 = p.y.redMul(z2.redMul(this.z));

  var h = u1.redSub(u2);
  var r = s1.redSub(s2);
  if (h.cmpn(0) === 0) {
    if (r.cmpn(0) !== 0)
      return this.curve.jpoint(null, null, null);
    else
      return this.dbl();
  }

  var h2 = h.redSqr();
  var h3 = h2.redMul(h);
  var v = u1.redMul(h2);

  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
  var nz = this.z.redMul(p.z).redMul(h);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.mixedAdd = function mixedAdd(p) {
  // O + P = P
  if (this.isInfinity())
    return p.toJ();

  // P + O = P
  if (p.isInfinity())
    return this;

  // 8M + 3S + 7A
  var z2 = this.z.redSqr();
  var u1 = this.x;
  var u2 = p.x.redMul(z2);
  var s1 = this.y;
  var s2 = p.y.redMul(z2).redMul(this.z);

  var h = u1.redSub(u2);
  var r = s1.redSub(s2);
  if (h.cmpn(0) === 0) {
    if (r.cmpn(0) !== 0)
      return this.curve.jpoint(null, null, null);
    else
      return this.dbl();
  }

  var h2 = h.redSqr();
  var h3 = h2.redMul(h);
  var v = u1.redMul(h2);

  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
  var nz = this.z.redMul(h);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.dblp = function dblp(pow) {
  if (pow === 0)
    return this;
  if (this.isInfinity())
    return this;
  if (!pow)
    return this.dbl();

  var i;
  if (this.curve.zeroA || this.curve.threeA) {
    var r = this;
    for (i = 0; i < pow; i++)
      r = r.dbl();
    return r;
  }

  // 1M + 2S + 1A + N * (4S + 5M + 8A)
  // N = 1 => 6M + 6S + 9A
  var a = this.curve.a;
  var tinv = this.curve.tinv;

  var jx = this.x;
  var jy = this.y;
  var jz = this.z;
  var jz4 = jz.redSqr().redSqr();

  // Reuse results
  var jyd = jy.redAdd(jy);
  for (i = 0; i < pow; i++) {
    var jx2 = jx.redSqr();
    var jyd2 = jyd.redSqr();
    var jyd4 = jyd2.redSqr();
    var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

    var t1 = jx.redMul(jyd2);
    var nx = c.redSqr().redISub(t1.redAdd(t1));
    var t2 = t1.redISub(nx);
    var dny = c.redMul(t2);
    dny = dny.redIAdd(dny).redISub(jyd4);
    var nz = jyd.redMul(jz);
    if (i + 1 < pow)
      jz4 = jz4.redMul(jyd4);

    jx = nx;
    jz = nz;
    jyd = dny;
  }

  return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
};

JPoint.prototype.dbl = function dbl() {
  if (this.isInfinity())
    return this;

  if (this.curve.zeroA)
    return this._zeroDbl();
  else if (this.curve.threeA)
    return this._threeDbl();
  else
    return this._dbl();
};

JPoint.prototype._zeroDbl = function _zeroDbl() {
  var nx;
  var ny;
  var nz;
  // Z = 1
  if (this.zOne) {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
    //     #doubling-mdbl-2007-bl
    // 1M + 5S + 14A

    // XX = X1^2
    var xx = this.x.redSqr();
    // YY = Y1^2
    var yy = this.y.redSqr();
    // YYYY = YY^2
    var yyyy = yy.redSqr();
    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
    s = s.redIAdd(s);
    // M = 3 * XX + a; a = 0
    var m = xx.redAdd(xx).redIAdd(xx);
    // T = M ^ 2 - 2*S
    var t = m.redSqr().redISub(s).redISub(s);

    // 8 * YYYY
    var yyyy8 = yyyy.redIAdd(yyyy);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    yyyy8 = yyyy8.redIAdd(yyyy8);

    // X3 = T
    nx = t;
    // Y3 = M * (S - T) - 8 * YYYY
    ny = m.redMul(s.redISub(t)).redISub(yyyy8);
    // Z3 = 2*Y1
    nz = this.y.redAdd(this.y);
  } else {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
    //     #doubling-dbl-2009-l
    // 2M + 5S + 13A

    // A = X1^2
    var a = this.x.redSqr();
    // B = Y1^2
    var b = this.y.redSqr();
    // C = B^2
    var c = b.redSqr();
    // D = 2 * ((X1 + B)^2 - A - C)
    var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
    d = d.redIAdd(d);
    // E = 3 * A
    var e = a.redAdd(a).redIAdd(a);
    // F = E^2
    var f = e.redSqr();

    // 8 * C
    var c8 = c.redIAdd(c);
    c8 = c8.redIAdd(c8);
    c8 = c8.redIAdd(c8);

    // X3 = F - 2 * D
    nx = f.redISub(d).redISub(d);
    // Y3 = E * (D - X3) - 8 * C
    ny = e.redMul(d.redISub(nx)).redISub(c8);
    // Z3 = 2 * Y1 * Z1
    nz = this.y.redMul(this.z);
    nz = nz.redIAdd(nz);
  }

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype._threeDbl = function _threeDbl() {
  var nx;
  var ny;
  var nz;
  // Z = 1
  if (this.zOne) {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html
    //     #doubling-mdbl-2007-bl
    // 1M + 5S + 15A

    // XX = X1^2
    var xx = this.x.redSqr();
    // YY = Y1^2
    var yy = this.y.redSqr();
    // YYYY = YY^2
    var yyyy = yy.redSqr();
    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
    s = s.redIAdd(s);
    // M = 3 * XX + a
    var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);
    // T = M^2 - 2 * S
    var t = m.redSqr().redISub(s).redISub(s);
    // X3 = T
    nx = t;
    // Y3 = M * (S - T) - 8 * YYYY
    var yyyy8 = yyyy.redIAdd(yyyy);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    ny = m.redMul(s.redISub(t)).redISub(yyyy8);
    // Z3 = 2 * Y1
    nz = this.y.redAdd(this.y);
  } else {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-dbl-2001-b
    // 3M + 5S

    // delta = Z1^2
    var delta = this.z.redSqr();
    // gamma = Y1^2
    var gamma = this.y.redSqr();
    // beta = X1 * gamma
    var beta = this.x.redMul(gamma);
    // alpha = 3 * (X1 - delta) * (X1 + delta)
    var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
    alpha = alpha.redAdd(alpha).redIAdd(alpha);
    // X3 = alpha^2 - 8 * beta
    var beta4 = beta.redIAdd(beta);
    beta4 = beta4.redIAdd(beta4);
    var beta8 = beta4.redAdd(beta4);
    nx = alpha.redSqr().redISub(beta8);
    // Z3 = (Y1 + Z1)^2 - gamma - delta
    nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
    // Y3 = alpha * (4 * beta - X3) - 8 * gamma^2
    var ggamma8 = gamma.redSqr();
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
  }

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype._dbl = function _dbl() {
  var a = this.curve.a;

  // 4M + 6S + 10A
  var jx = this.x;
  var jy = this.y;
  var jz = this.z;
  var jz4 = jz.redSqr().redSqr();

  var jx2 = jx.redSqr();
  var jy2 = jy.redSqr();

  var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

  var jxd4 = jx.redAdd(jx);
  jxd4 = jxd4.redIAdd(jxd4);
  var t1 = jxd4.redMul(jy2);
  var nx = c.redSqr().redISub(t1.redAdd(t1));
  var t2 = t1.redISub(nx);

  var jyd8 = jy2.redSqr();
  jyd8 = jyd8.redIAdd(jyd8);
  jyd8 = jyd8.redIAdd(jyd8);
  jyd8 = jyd8.redIAdd(jyd8);
  var ny = c.redMul(t2).redISub(jyd8);
  var nz = jy.redAdd(jy).redMul(jz);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.trpl = function trpl() {
  if (!this.curve.zeroA)
    return this.dbl().add(this);

  // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#tripling-tpl-2007-bl
  // 5M + 10S + ...

  // XX = X1^2
  var xx = this.x.redSqr();
  // YY = Y1^2
  var yy = this.y.redSqr();
  // ZZ = Z1^2
  var zz = this.z.redSqr();
  // YYYY = YY^2
  var yyyy = yy.redSqr();
  // M = 3 * XX + a * ZZ2; a = 0
  var m = xx.redAdd(xx).redIAdd(xx);
  // MM = M^2
  var mm = m.redSqr();
  // E = 6 * ((X1 + YY)^2 - XX - YYYY) - MM
  var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
  e = e.redIAdd(e);
  e = e.redAdd(e).redIAdd(e);
  e = e.redISub(mm);
  // EE = E^2
  var ee = e.redSqr();
  // T = 16*YYYY
  var t = yyyy.redIAdd(yyyy);
  t = t.redIAdd(t);
  t = t.redIAdd(t);
  t = t.redIAdd(t);
  // U = (M + E)^2 - MM - EE - T
  var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);
  // X3 = 4 * (X1 * EE - 4 * YY * U)
  var yyu4 = yy.redMul(u);
  yyu4 = yyu4.redIAdd(yyu4);
  yyu4 = yyu4.redIAdd(yyu4);
  var nx = this.x.redMul(ee).redISub(yyu4);
  nx = nx.redIAdd(nx);
  nx = nx.redIAdd(nx);
  // Y3 = 8 * Y1 * (U * (T - U) - E * EE)
  var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
  ny = ny.redIAdd(ny);
  ny = ny.redIAdd(ny);
  ny = ny.redIAdd(ny);
  // Z3 = (Z1 + E)^2 - ZZ - EE
  var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.mul = function mul(k, kbase) {
  k = new BN$6(k, kbase);

  return this.curve._wnafMul(this, k);
};

JPoint.prototype.eq = function eq(p) {
  if (p.type === 'affine')
    return this.eq(p.toJ());

  if (this === p)
    return true;

  // x1 * z2^2 == x2 * z1^2
  var z2 = this.z.redSqr();
  var pz2 = p.z.redSqr();
  if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0)
    return false;

  // y1 * z2^3 == y2 * z1^3
  var z3 = z2.redMul(this.z);
  var pz3 = pz2.redMul(p.z);
  return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
};

JPoint.prototype.eqXToP = function eqXToP(x) {
  var zs = this.z.redSqr();
  var rx = x.toRed(this.curve.red).redMul(zs);
  if (this.x.cmp(rx) === 0)
    return true;

  var xc = x.clone();
  var t = this.curve.redN.redMul(zs);
  for (;;) {
    xc.iadd(this.curve.n);
    if (xc.cmp(this.curve.p) >= 0)
      return false;

    rx.redIAdd(t);
    if (this.x.cmp(rx) === 0)
      return true;
  }
};

JPoint.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC JPoint Infinity>';
  return '<EC JPoint x: ' + this.x.toString(16, 2) +
      ' y: ' + this.y.toString(16, 2) +
      ' z: ' + this.z.toString(16, 2) + '>';
};

JPoint.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.z.cmpn(0) === 0;
};

var BN$5 = bnExports;
var inherits$2 = inheritsExports;
var Base$1 = base;

var utils$i = utils$m;

function MontCurve(conf) {
  Base$1.call(this, 'mont', conf);

  this.a = new BN$5(conf.a, 16).toRed(this.red);
  this.b = new BN$5(conf.b, 16).toRed(this.red);
  this.i4 = new BN$5(4).toRed(this.red).redInvm();
  this.two = new BN$5(2).toRed(this.red);
  this.a24 = this.i4.redMul(this.a.redAdd(this.two));
}
inherits$2(MontCurve, Base$1);
var mont = MontCurve;

MontCurve.prototype.validate = function validate(point) {
  var x = point.normalize().x;
  var x2 = x.redSqr();
  var rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);
  var y = rhs.redSqrt();

  return y.redSqr().cmp(rhs) === 0;
};

function Point$1(curve, x, z) {
  Base$1.BasePoint.call(this, curve, 'projective');
  if (x === null && z === null) {
    this.x = this.curve.one;
    this.z = this.curve.zero;
  } else {
    this.x = new BN$5(x, 16);
    this.z = new BN$5(z, 16);
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.z.red)
      this.z = this.z.toRed(this.curve.red);
  }
}
inherits$2(Point$1, Base$1.BasePoint);

MontCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
  return this.point(utils$i.toArray(bytes, enc), 1);
};

MontCurve.prototype.point = function point(x, z) {
  return new Point$1(this, x, z);
};

MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
  return Point$1.fromJSON(this, obj);
};

Point$1.prototype.precompute = function precompute() {
  // No-op
};

Point$1.prototype._encode = function _encode() {
  return this.getX().toArray('be', this.curve.p.byteLength());
};

Point$1.fromJSON = function fromJSON(curve, obj) {
  return new Point$1(curve, obj[0], obj[1] || curve.one);
};

Point$1.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
};

Point$1.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.z.cmpn(0) === 0;
};

Point$1.prototype.dbl = function dbl() {
  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#doubling-dbl-1987-m-3
  // 2M + 2S + 4A

  // A = X1 + Z1
  var a = this.x.redAdd(this.z);
  // AA = A^2
  var aa = a.redSqr();
  // B = X1 - Z1
  var b = this.x.redSub(this.z);
  // BB = B^2
  var bb = b.redSqr();
  // C = AA - BB
  var c = aa.redSub(bb);
  // X3 = AA * BB
  var nx = aa.redMul(bb);
  // Z3 = C * (BB + A24 * C)
  var nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
  return this.curve.point(nx, nz);
};

Point$1.prototype.add = function add() {
  throw new Error('Not supported on Montgomery curve');
};

Point$1.prototype.diffAdd = function diffAdd(p, diff) {
  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#diffadd-dadd-1987-m-3
  // 4M + 2S + 6A

  // A = X2 + Z2
  var a = this.x.redAdd(this.z);
  // B = X2 - Z2
  var b = this.x.redSub(this.z);
  // C = X3 + Z3
  var c = p.x.redAdd(p.z);
  // D = X3 - Z3
  var d = p.x.redSub(p.z);
  // DA = D * A
  var da = d.redMul(a);
  // CB = C * B
  var cb = c.redMul(b);
  // X5 = Z1 * (DA + CB)^2
  var nx = diff.z.redMul(da.redAdd(cb).redSqr());
  // Z5 = X1 * (DA - CB)^2
  var nz = diff.x.redMul(da.redISub(cb).redSqr());
  return this.curve.point(nx, nz);
};

Point$1.prototype.mul = function mul(k) {
  var t = k.clone();
  var a = this; // (N / 2) * Q + Q
  var b = this.curve.point(null, null); // (N / 2) * Q
  var c = this; // Q

  for (var bits = []; t.cmpn(0) !== 0; t.iushrn(1))
    bits.push(t.andln(1));

  for (var i = bits.length - 1; i >= 0; i--) {
    if (bits[i] === 0) {
      // N * Q + Q = ((N / 2) * Q + Q)) + (N / 2) * Q
      a = a.diffAdd(b, c);
      // N * Q = 2 * ((N / 2) * Q + Q))
      b = b.dbl();
    } else {
      // N * Q = ((N / 2) * Q + Q) + ((N / 2) * Q)
      b = a.diffAdd(b, c);
      // N * Q + Q = 2 * ((N / 2) * Q + Q)
      a = a.dbl();
    }
  }
  return b;
};

Point$1.prototype.mulAdd = function mulAdd() {
  throw new Error('Not supported on Montgomery curve');
};

Point$1.prototype.jumlAdd = function jumlAdd() {
  throw new Error('Not supported on Montgomery curve');
};

Point$1.prototype.eq = function eq(other) {
  return this.getX().cmp(other.getX()) === 0;
};

Point$1.prototype.normalize = function normalize() {
  this.x = this.x.redMul(this.z.redInvm());
  this.z = this.curve.one;
  return this;
};

Point$1.prototype.getX = function getX() {
  // Normalize coordinates
  this.normalize();

  return this.x.fromRed();
};

var utils$h = utils$m;
var BN$4 = bnExports;
var inherits$1 = inheritsExports;
var Base = base;

var assert$c = utils$h.assert;

function EdwardsCurve(conf) {
  // NOTE: Important as we are creating point in Base.call()
  this.twisted = (conf.a | 0) !== 1;
  this.mOneA = this.twisted && (conf.a | 0) === -1;
  this.extended = this.mOneA;

  Base.call(this, 'edwards', conf);

  this.a = new BN$4(conf.a, 16).umod(this.red.m);
  this.a = this.a.toRed(this.red);
  this.c = new BN$4(conf.c, 16).toRed(this.red);
  this.c2 = this.c.redSqr();
  this.d = new BN$4(conf.d, 16).toRed(this.red);
  this.dd = this.d.redAdd(this.d);

  assert$c(!this.twisted || this.c.fromRed().cmpn(1) === 0);
  this.oneC = (conf.c | 0) === 1;
}
inherits$1(EdwardsCurve, Base);
var edwards = EdwardsCurve;

EdwardsCurve.prototype._mulA = function _mulA(num) {
  if (this.mOneA)
    return num.redNeg();
  else
    return this.a.redMul(num);
};

EdwardsCurve.prototype._mulC = function _mulC(num) {
  if (this.oneC)
    return num;
  else
    return this.c.redMul(num);
};

// Just for compatibility with Short curve
EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
  return this.point(x, y, z, t);
};

EdwardsCurve.prototype.pointFromX = function pointFromX(x, odd) {
  x = new BN$4(x, 16);
  if (!x.red)
    x = x.toRed(this.red);

  var x2 = x.redSqr();
  var rhs = this.c2.redSub(this.a.redMul(x2));
  var lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2));

  var y2 = rhs.redMul(lhs.redInvm());
  var y = y2.redSqrt();
  if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
    throw new Error('invalid point');

  var isOdd = y.fromRed().isOdd();
  if (odd && !isOdd || !odd && isOdd)
    y = y.redNeg();

  return this.point(x, y);
};

EdwardsCurve.prototype.pointFromY = function pointFromY(y, odd) {
  y = new BN$4(y, 16);
  if (!y.red)
    y = y.toRed(this.red);

  // x^2 = (y^2 - c^2) / (c^2 d y^2 - a)
  var y2 = y.redSqr();
  var lhs = y2.redSub(this.c2);
  var rhs = y2.redMul(this.d).redMul(this.c2).redSub(this.a);
  var x2 = lhs.redMul(rhs.redInvm());

  if (x2.cmp(this.zero) === 0) {
    if (odd)
      throw new Error('invalid point');
    else
      return this.point(this.zero, y);
  }

  var x = x2.redSqrt();
  if (x.redSqr().redSub(x2).cmp(this.zero) !== 0)
    throw new Error('invalid point');

  if (x.fromRed().isOdd() !== odd)
    x = x.redNeg();

  return this.point(x, y);
};

EdwardsCurve.prototype.validate = function validate(point) {
  if (point.isInfinity())
    return true;

  // Curve: A * X^2 + Y^2 = C^2 * (1 + D * X^2 * Y^2)
  point.normalize();

  var x2 = point.x.redSqr();
  var y2 = point.y.redSqr();
  var lhs = x2.redMul(this.a).redAdd(y2);
  var rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));

  return lhs.cmp(rhs) === 0;
};

function Point(curve, x, y, z, t) {
  Base.BasePoint.call(this, curve, 'projective');
  if (x === null && y === null && z === null) {
    this.x = this.curve.zero;
    this.y = this.curve.one;
    this.z = this.curve.one;
    this.t = this.curve.zero;
    this.zOne = true;
  } else {
    this.x = new BN$4(x, 16);
    this.y = new BN$4(y, 16);
    this.z = z ? new BN$4(z, 16) : this.curve.one;
    this.t = t && new BN$4(t, 16);
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.y.red)
      this.y = this.y.toRed(this.curve.red);
    if (!this.z.red)
      this.z = this.z.toRed(this.curve.red);
    if (this.t && !this.t.red)
      this.t = this.t.toRed(this.curve.red);
    this.zOne = this.z === this.curve.one;

    // Use extended coordinates
    if (this.curve.extended && !this.t) {
      this.t = this.x.redMul(this.y);
      if (!this.zOne)
        this.t = this.t.redMul(this.z.redInvm());
    }
  }
}
inherits$1(Point, Base.BasePoint);

EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
  return Point.fromJSON(this, obj);
};

EdwardsCurve.prototype.point = function point(x, y, z, t) {
  return new Point(this, x, y, z, t);
};

Point.fromJSON = function fromJSON(curve, obj) {
  return new Point(curve, obj[0], obj[1], obj[2]);
};

Point.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' y: ' + this.y.fromRed().toString(16, 2) +
      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
};

Point.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.x.cmpn(0) === 0 &&
    (this.y.cmp(this.z) === 0 ||
    (this.zOne && this.y.cmp(this.curve.c) === 0));
};

Point.prototype._extDbl = function _extDbl() {
  // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
  //     #doubling-dbl-2008-hwcd
  // 4M + 4S

  // A = X1^2
  var a = this.x.redSqr();
  // B = Y1^2
  var b = this.y.redSqr();
  // C = 2 * Z1^2
  var c = this.z.redSqr();
  c = c.redIAdd(c);
  // D = a * A
  var d = this.curve._mulA(a);
  // E = (X1 + Y1)^2 - A - B
  var e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);
  // G = D + B
  var g = d.redAdd(b);
  // F = G - C
  var f = g.redSub(c);
  // H = D - B
  var h = d.redSub(b);
  // X3 = E * F
  var nx = e.redMul(f);
  // Y3 = G * H
  var ny = g.redMul(h);
  // T3 = E * H
  var nt = e.redMul(h);
  // Z3 = F * G
  var nz = f.redMul(g);
  return this.curve.point(nx, ny, nz, nt);
};

Point.prototype._projDbl = function _projDbl() {
  // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
  //     #doubling-dbl-2008-bbjlp
  //     #doubling-dbl-2007-bl
  // and others
  // Generally 3M + 4S or 2M + 4S

  // B = (X1 + Y1)^2
  var b = this.x.redAdd(this.y).redSqr();
  // C = X1^2
  var c = this.x.redSqr();
  // D = Y1^2
  var d = this.y.redSqr();

  var nx;
  var ny;
  var nz;
  var e;
  var h;
  var j;
  if (this.curve.twisted) {
    // E = a * C
    e = this.curve._mulA(c);
    // F = E + D
    var f = e.redAdd(d);
    if (this.zOne) {
      // X3 = (B - C - D) * (F - 2)
      nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));
      // Y3 = F * (E - D)
      ny = f.redMul(e.redSub(d));
      // Z3 = F^2 - 2 * F
      nz = f.redSqr().redSub(f).redSub(f);
    } else {
      // H = Z1^2
      h = this.z.redSqr();
      // J = F - 2 * H
      j = f.redSub(h).redISub(h);
      // X3 = (B-C-D)*J
      nx = b.redSub(c).redISub(d).redMul(j);
      // Y3 = F * (E - D)
      ny = f.redMul(e.redSub(d));
      // Z3 = F * J
      nz = f.redMul(j);
    }
  } else {
    // E = C + D
    e = c.redAdd(d);
    // H = (c * Z1)^2
    h = this.curve._mulC(this.z).redSqr();
    // J = E - 2 * H
    j = e.redSub(h).redSub(h);
    // X3 = c * (B - E) * J
    nx = this.curve._mulC(b.redISub(e)).redMul(j);
    // Y3 = c * E * (C - D)
    ny = this.curve._mulC(e).redMul(c.redISub(d));
    // Z3 = E * J
    nz = e.redMul(j);
  }
  return this.curve.point(nx, ny, nz);
};

Point.prototype.dbl = function dbl() {
  if (this.isInfinity())
    return this;

  // Double in extended coordinates
  if (this.curve.extended)
    return this._extDbl();
  else
    return this._projDbl();
};

Point.prototype._extAdd = function _extAdd(p) {
  // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
  //     #addition-add-2008-hwcd-3
  // 8M

  // A = (Y1 - X1) * (Y2 - X2)
  var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x));
  // B = (Y1 + X1) * (Y2 + X2)
  var b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));
  // C = T1 * k * T2
  var c = this.t.redMul(this.curve.dd).redMul(p.t);
  // D = Z1 * 2 * Z2
  var d = this.z.redMul(p.z.redAdd(p.z));
  // E = B - A
  var e = b.redSub(a);
  // F = D - C
  var f = d.redSub(c);
  // G = D + C
  var g = d.redAdd(c);
  // H = B + A
  var h = b.redAdd(a);
  // X3 = E * F
  var nx = e.redMul(f);
  // Y3 = G * H
  var ny = g.redMul(h);
  // T3 = E * H
  var nt = e.redMul(h);
  // Z3 = F * G
  var nz = f.redMul(g);
  return this.curve.point(nx, ny, nz, nt);
};

Point.prototype._projAdd = function _projAdd(p) {
  // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
  //     #addition-add-2008-bbjlp
  //     #addition-add-2007-bl
  // 10M + 1S

  // A = Z1 * Z2
  var a = this.z.redMul(p.z);
  // B = A^2
  var b = a.redSqr();
  // C = X1 * X2
  var c = this.x.redMul(p.x);
  // D = Y1 * Y2
  var d = this.y.redMul(p.y);
  // E = d * C * D
  var e = this.curve.d.redMul(c).redMul(d);
  // F = B - E
  var f = b.redSub(e);
  // G = B + E
  var g = b.redAdd(e);
  // X3 = A * F * ((X1 + Y1) * (X2 + Y2) - C - D)
  var tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);
  var nx = a.redMul(f).redMul(tmp);
  var ny;
  var nz;
  if (this.curve.twisted) {
    // Y3 = A * G * (D - a * C)
    ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));
    // Z3 = F * G
    nz = f.redMul(g);
  } else {
    // Y3 = A * G * (D - C)
    ny = a.redMul(g).redMul(d.redSub(c));
    // Z3 = c * F * G
    nz = this.curve._mulC(f).redMul(g);
  }
  return this.curve.point(nx, ny, nz);
};

Point.prototype.add = function add(p) {
  if (this.isInfinity())
    return p;
  if (p.isInfinity())
    return this;

  if (this.curve.extended)
    return this._extAdd(p);
  else
    return this._projAdd(p);
};

Point.prototype.mul = function mul(k) {
  if (this._hasDoubles(k))
    return this.curve._fixedNafMul(this, k);
  else
    return this.curve._wnafMul(this, k);
};

Point.prototype.mulAdd = function mulAdd(k1, p, k2) {
  return this.curve._wnafMulAdd(1, [ this, p ], [ k1, k2 ], 2, false);
};

Point.prototype.jmulAdd = function jmulAdd(k1, p, k2) {
  return this.curve._wnafMulAdd(1, [ this, p ], [ k1, k2 ], 2, true);
};

Point.prototype.normalize = function normalize() {
  if (this.zOne)
    return this;

  // Normalize coordinates
  var zi = this.z.redInvm();
  this.x = this.x.redMul(zi);
  this.y = this.y.redMul(zi);
  if (this.t)
    this.t = this.t.redMul(zi);
  this.z = this.curve.one;
  this.zOne = true;
  return this;
};

Point.prototype.neg = function neg() {
  return this.curve.point(this.x.redNeg(),
    this.y,
    this.z,
    this.t && this.t.redNeg());
};

Point.prototype.getX = function getX() {
  this.normalize();
  return this.x.fromRed();
};

Point.prototype.getY = function getY() {
  this.normalize();
  return this.y.fromRed();
};

Point.prototype.eq = function eq(other) {
  return this === other ||
         this.getX().cmp(other.getX()) === 0 &&
         this.getY().cmp(other.getY()) === 0;
};

Point.prototype.eqXToP = function eqXToP(x) {
  var rx = x.toRed(this.curve.red).redMul(this.z);
  if (this.x.cmp(rx) === 0)
    return true;

  var xc = x.clone();
  var t = this.curve.redN.redMul(this.z);
  for (;;) {
    xc.iadd(this.curve.n);
    if (xc.cmp(this.curve.p) >= 0)
      return false;

    rx.redIAdd(t);
    if (this.x.cmp(rx) === 0)
      return true;
  }
};

// Compatibility with BaseCurve
Point.prototype.toP = Point.prototype.normalize;
Point.prototype.mixedAdd = Point.prototype.add;

(function (exports) {

	var curve = exports;

	curve.base = base;
	curve.short = short;
	curve.mont = mont;
	curve.edwards = edwards; 
} (curve));

var curves$2 = {};

var hash$2 = {};

var utils$g = {};

var assert$b = minimalisticAssert;
var inherits = inheritsExports;

utils$g.inherits = inherits;

function isSurrogatePair(msg, i) {
  if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
    return false;
  }
  if (i < 0 || i + 1 >= msg.length) {
    return false;
  }
  return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
}

function toArray(msg, enc) {
  if (Array.isArray(msg))
    return msg.slice();
  if (!msg)
    return [];
  var res = [];
  if (typeof msg === 'string') {
    if (!enc) {
      // Inspired by stringToUtf8ByteArray() in closure-library by Google
      // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
      // Apache License 2.0
      // https://github.com/google/closure-library/blob/master/LICENSE
      var p = 0;
      for (var i = 0; i < msg.length; i++) {
        var c = msg.charCodeAt(i);
        if (c < 128) {
          res[p++] = c;
        } else if (c < 2048) {
          res[p++] = (c >> 6) | 192;
          res[p++] = (c & 63) | 128;
        } else if (isSurrogatePair(msg, i)) {
          c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
          res[p++] = (c >> 18) | 240;
          res[p++] = ((c >> 12) & 63) | 128;
          res[p++] = ((c >> 6) & 63) | 128;
          res[p++] = (c & 63) | 128;
        } else {
          res[p++] = (c >> 12) | 224;
          res[p++] = ((c >> 6) & 63) | 128;
          res[p++] = (c & 63) | 128;
        }
      }
    } else if (enc === 'hex') {
      msg = msg.replace(/[^a-z0-9]+/ig, '');
      if (msg.length % 2 !== 0)
        msg = '0' + msg;
      for (i = 0; i < msg.length; i += 2)
        res.push(parseInt(msg[i] + msg[i + 1], 16));
    }
  } else {
    for (i = 0; i < msg.length; i++)
      res[i] = msg[i] | 0;
  }
  return res;
}
utils$g.toArray = toArray;

function toHex(msg) {
  var res = '';
  for (var i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));
  return res;
}
utils$g.toHex = toHex;

function htonl(w) {
  var res = (w >>> 24) |
            ((w >>> 8) & 0xff00) |
            ((w << 8) & 0xff0000) |
            ((w & 0xff) << 24);
  return res >>> 0;
}
utils$g.htonl = htonl;

function toHex32(msg, endian) {
  var res = '';
  for (var i = 0; i < msg.length; i++) {
    var w = msg[i];
    if (endian === 'little')
      w = htonl(w);
    res += zero8(w.toString(16));
  }
  return res;
}
utils$g.toHex32 = toHex32;

function zero2(word) {
  if (word.length === 1)
    return '0' + word;
  else
    return word;
}
utils$g.zero2 = zero2;

function zero8(word) {
  if (word.length === 7)
    return '0' + word;
  else if (word.length === 6)
    return '00' + word;
  else if (word.length === 5)
    return '000' + word;
  else if (word.length === 4)
    return '0000' + word;
  else if (word.length === 3)
    return '00000' + word;
  else if (word.length === 2)
    return '000000' + word;
  else if (word.length === 1)
    return '0000000' + word;
  else
    return word;
}
utils$g.zero8 = zero8;

function join32(msg, start, end, endian) {
  var len = end - start;
  assert$b(len % 4 === 0);
  var res = new Array(len / 4);
  for (var i = 0, k = start; i < res.length; i++, k += 4) {
    var w;
    if (endian === 'big')
      w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
    else
      w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
    res[i] = w >>> 0;
  }
  return res;
}
utils$g.join32 = join32;

function split32(msg, endian) {
  var res = new Array(msg.length * 4);
  for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
    var m = msg[i];
    if (endian === 'big') {
      res[k] = m >>> 24;
      res[k + 1] = (m >>> 16) & 0xff;
      res[k + 2] = (m >>> 8) & 0xff;
      res[k + 3] = m & 0xff;
    } else {
      res[k + 3] = m >>> 24;
      res[k + 2] = (m >>> 16) & 0xff;
      res[k + 1] = (m >>> 8) & 0xff;
      res[k] = m & 0xff;
    }
  }
  return res;
}
utils$g.split32 = split32;

function rotr32$1(w, b) {
  return (w >>> b) | (w << (32 - b));
}
utils$g.rotr32 = rotr32$1;

function rotl32$2(w, b) {
  return (w << b) | (w >>> (32 - b));
}
utils$g.rotl32 = rotl32$2;

function sum32$3(a, b) {
  return (a + b) >>> 0;
}
utils$g.sum32 = sum32$3;

function sum32_3$1(a, b, c) {
  return (a + b + c) >>> 0;
}
utils$g.sum32_3 = sum32_3$1;

function sum32_4$2(a, b, c, d) {
  return (a + b + c + d) >>> 0;
}
utils$g.sum32_4 = sum32_4$2;

function sum32_5$2(a, b, c, d, e) {
  return (a + b + c + d + e) >>> 0;
}
utils$g.sum32_5 = sum32_5$2;

function sum64$1(buf, pos, ah, al) {
  var bh = buf[pos];
  var bl = buf[pos + 1];

  var lo = (al + bl) >>> 0;
  var hi = (lo < al ? 1 : 0) + ah + bh;
  buf[pos] = hi >>> 0;
  buf[pos + 1] = lo;
}
utils$g.sum64 = sum64$1;

function sum64_hi$1(ah, al, bh, bl) {
  var lo = (al + bl) >>> 0;
  var hi = (lo < al ? 1 : 0) + ah + bh;
  return hi >>> 0;
}
utils$g.sum64_hi = sum64_hi$1;

function sum64_lo$1(ah, al, bh, bl) {
  var lo = al + bl;
  return lo >>> 0;
}
utils$g.sum64_lo = sum64_lo$1;

function sum64_4_hi$1(ah, al, bh, bl, ch, cl, dh, dl) {
  var carry = 0;
  var lo = al;
  lo = (lo + bl) >>> 0;
  carry += lo < al ? 1 : 0;
  lo = (lo + cl) >>> 0;
  carry += lo < cl ? 1 : 0;
  lo = (lo + dl) >>> 0;
  carry += lo < dl ? 1 : 0;

  var hi = ah + bh + ch + dh + carry;
  return hi >>> 0;
}
utils$g.sum64_4_hi = sum64_4_hi$1;

function sum64_4_lo$1(ah, al, bh, bl, ch, cl, dh, dl) {
  var lo = al + bl + cl + dl;
  return lo >>> 0;
}
utils$g.sum64_4_lo = sum64_4_lo$1;

function sum64_5_hi$1(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
  var carry = 0;
  var lo = al;
  lo = (lo + bl) >>> 0;
  carry += lo < al ? 1 : 0;
  lo = (lo + cl) >>> 0;
  carry += lo < cl ? 1 : 0;
  lo = (lo + dl) >>> 0;
  carry += lo < dl ? 1 : 0;
  lo = (lo + el) >>> 0;
  carry += lo < el ? 1 : 0;

  var hi = ah + bh + ch + dh + eh + carry;
  return hi >>> 0;
}
utils$g.sum64_5_hi = sum64_5_hi$1;

function sum64_5_lo$1(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
  var lo = al + bl + cl + dl + el;

  return lo >>> 0;
}
utils$g.sum64_5_lo = sum64_5_lo$1;

function rotr64_hi$1(ah, al, num) {
  var r = (al << (32 - num)) | (ah >>> num);
  return r >>> 0;
}
utils$g.rotr64_hi = rotr64_hi$1;

function rotr64_lo$1(ah, al, num) {
  var r = (ah << (32 - num)) | (al >>> num);
  return r >>> 0;
}
utils$g.rotr64_lo = rotr64_lo$1;

function shr64_hi$1(ah, al, num) {
  return ah >>> num;
}
utils$g.shr64_hi = shr64_hi$1;

function shr64_lo$1(ah, al, num) {
  var r = (ah << (32 - num)) | (al >>> num);
  return r >>> 0;
}
utils$g.shr64_lo = shr64_lo$1;

var common$5 = {};

var utils$f = utils$g;
var assert$a = minimalisticAssert;

function BlockHash$4() {
  this.pending = null;
  this.pendingTotal = 0;
  this.blockSize = this.constructor.blockSize;
  this.outSize = this.constructor.outSize;
  this.hmacStrength = this.constructor.hmacStrength;
  this.padLength = this.constructor.padLength / 8;
  this.endian = 'big';

  this._delta8 = this.blockSize / 8;
  this._delta32 = this.blockSize / 32;
}
common$5.BlockHash = BlockHash$4;

BlockHash$4.prototype.update = function update(msg, enc) {
  // Convert message to array, pad it, and join into 32bit blocks
  msg = utils$f.toArray(msg, enc);
  if (!this.pending)
    this.pending = msg;
  else
    this.pending = this.pending.concat(msg);
  this.pendingTotal += msg.length;

  // Enough data, try updating
  if (this.pending.length >= this._delta8) {
    msg = this.pending;

    // Process pending data in blocks
    var r = msg.length % this._delta8;
    this.pending = msg.slice(msg.length - r, msg.length);
    if (this.pending.length === 0)
      this.pending = null;

    msg = utils$f.join32(msg, 0, msg.length - r, this.endian);
    for (var i = 0; i < msg.length; i += this._delta32)
      this._update(msg, i, i + this._delta32);
  }

  return this;
};

BlockHash$4.prototype.digest = function digest(enc) {
  this.update(this._pad());
  assert$a(this.pending === null);

  return this._digest(enc);
};

BlockHash$4.prototype._pad = function pad() {
  var len = this.pendingTotal;
  var bytes = this._delta8;
  var k = bytes - ((len + this.padLength) % bytes);
  var res = new Array(k + this.padLength);
  res[0] = 0x80;
  for (var i = 1; i < k; i++)
    res[i] = 0;

  // Append length
  len <<= 3;
  if (this.endian === 'big') {
    for (var t = 8; t < this.padLength; t++)
      res[i++] = 0;

    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = len & 0xff;
  } else {
    res[i++] = len & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;

    for (t = 8; t < this.padLength; t++)
      res[i++] = 0;
  }

  return res;
};

var sha = {};

var common$4 = {};

var utils$e = utils$g;
var rotr32 = utils$e.rotr32;

function ft_1$1(s, x, y, z) {
  if (s === 0)
    return ch32$1(x, y, z);
  if (s === 1 || s === 3)
    return p32(x, y, z);
  if (s === 2)
    return maj32$1(x, y, z);
}
common$4.ft_1 = ft_1$1;

function ch32$1(x, y, z) {
  return (x & y) ^ ((~x) & z);
}
common$4.ch32 = ch32$1;

function maj32$1(x, y, z) {
  return (x & y) ^ (x & z) ^ (y & z);
}
common$4.maj32 = maj32$1;

function p32(x, y, z) {
  return x ^ y ^ z;
}
common$4.p32 = p32;

function s0_256$1(x) {
  return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
}
common$4.s0_256 = s0_256$1;

function s1_256$1(x) {
  return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
}
common$4.s1_256 = s1_256$1;

function g0_256$1(x) {
  return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
}
common$4.g0_256 = g0_256$1;

function g1_256$1(x) {
  return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
}
common$4.g1_256 = g1_256$1;

var utils$d = utils$g;
var common$3 = common$5;
var shaCommon$1 = common$4;

var rotl32$1 = utils$d.rotl32;
var sum32$2 = utils$d.sum32;
var sum32_5$1 = utils$d.sum32_5;
var ft_1 = shaCommon$1.ft_1;
var BlockHash$3 = common$3.BlockHash;

var sha1_K = [
  0x5A827999, 0x6ED9EBA1,
  0x8F1BBCDC, 0xCA62C1D6
];

function SHA1() {
  if (!(this instanceof SHA1))
    return new SHA1();

  BlockHash$3.call(this);
  this.h = [
    0x67452301, 0xefcdab89, 0x98badcfe,
    0x10325476, 0xc3d2e1f0 ];
  this.W = new Array(80);
}

utils$d.inherits(SHA1, BlockHash$3);
var _1 = SHA1;

SHA1.blockSize = 512;
SHA1.outSize = 160;
SHA1.hmacStrength = 80;
SHA1.padLength = 64;

SHA1.prototype._update = function _update(msg, start) {
  var W = this.W;

  for (var i = 0; i < 16; i++)
    W[i] = msg[start + i];

  for(; i < W.length; i++)
    W[i] = rotl32$1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

  var a = this.h[0];
  var b = this.h[1];
  var c = this.h[2];
  var d = this.h[3];
  var e = this.h[4];

  for (i = 0; i < W.length; i++) {
    var s = ~~(i / 20);
    var t = sum32_5$1(rotl32$1(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
    e = d;
    d = c;
    c = rotl32$1(b, 30);
    b = a;
    a = t;
  }

  this.h[0] = sum32$2(this.h[0], a);
  this.h[1] = sum32$2(this.h[1], b);
  this.h[2] = sum32$2(this.h[2], c);
  this.h[3] = sum32$2(this.h[3], d);
  this.h[4] = sum32$2(this.h[4], e);
};

SHA1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$d.toHex32(this.h, 'big');
  else
    return utils$d.split32(this.h, 'big');
};

var utils$c = utils$g;
var common$2 = common$5;
var shaCommon = common$4;
var assert$9 = minimalisticAssert;

var sum32$1 = utils$c.sum32;
var sum32_4$1 = utils$c.sum32_4;
var sum32_5 = utils$c.sum32_5;
var ch32 = shaCommon.ch32;
var maj32 = shaCommon.maj32;
var s0_256 = shaCommon.s0_256;
var s1_256 = shaCommon.s1_256;
var g0_256 = shaCommon.g0_256;
var g1_256 = shaCommon.g1_256;

var BlockHash$2 = common$2.BlockHash;

var sha256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function SHA256$1() {
  if (!(this instanceof SHA256$1))
    return new SHA256$1();

  BlockHash$2.call(this);
  this.h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  this.k = sha256_K;
  this.W = new Array(64);
}
utils$c.inherits(SHA256$1, BlockHash$2);
var _256 = SHA256$1;

SHA256$1.blockSize = 512;
SHA256$1.outSize = 256;
SHA256$1.hmacStrength = 192;
SHA256$1.padLength = 64;

SHA256$1.prototype._update = function _update(msg, start) {
  var W = this.W;

  for (var i = 0; i < 16; i++)
    W[i] = msg[start + i];
  for (; i < W.length; i++)
    W[i] = sum32_4$1(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);

  var a = this.h[0];
  var b = this.h[1];
  var c = this.h[2];
  var d = this.h[3];
  var e = this.h[4];
  var f = this.h[5];
  var g = this.h[6];
  var h = this.h[7];

  assert$9(this.k.length === W.length);
  for (i = 0; i < W.length; i++) {
    var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
    var T2 = sum32$1(s0_256(a), maj32(a, b, c));
    h = g;
    g = f;
    f = e;
    e = sum32$1(d, T1);
    d = c;
    c = b;
    b = a;
    a = sum32$1(T1, T2);
  }

  this.h[0] = sum32$1(this.h[0], a);
  this.h[1] = sum32$1(this.h[1], b);
  this.h[2] = sum32$1(this.h[2], c);
  this.h[3] = sum32$1(this.h[3], d);
  this.h[4] = sum32$1(this.h[4], e);
  this.h[5] = sum32$1(this.h[5], f);
  this.h[6] = sum32$1(this.h[6], g);
  this.h[7] = sum32$1(this.h[7], h);
};

SHA256$1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$c.toHex32(this.h, 'big');
  else
    return utils$c.split32(this.h, 'big');
};

var utils$b = utils$g;
var SHA256 = _256;

function SHA224() {
  if (!(this instanceof SHA224))
    return new SHA224();

  SHA256.call(this);
  this.h = [
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
    0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4 ];
}
utils$b.inherits(SHA224, SHA256);
var _224 = SHA224;

SHA224.blockSize = 512;
SHA224.outSize = 224;
SHA224.hmacStrength = 192;
SHA224.padLength = 64;

SHA224.prototype._digest = function digest(enc) {
  // Just truncate output
  if (enc === 'hex')
    return utils$b.toHex32(this.h.slice(0, 7), 'big');
  else
    return utils$b.split32(this.h.slice(0, 7), 'big');
};

var utils$a = utils$g;
var common$1 = common$5;
var assert$8 = minimalisticAssert;

var rotr64_hi = utils$a.rotr64_hi;
var rotr64_lo = utils$a.rotr64_lo;
var shr64_hi = utils$a.shr64_hi;
var shr64_lo = utils$a.shr64_lo;
var sum64 = utils$a.sum64;
var sum64_hi = utils$a.sum64_hi;
var sum64_lo = utils$a.sum64_lo;
var sum64_4_hi = utils$a.sum64_4_hi;
var sum64_4_lo = utils$a.sum64_4_lo;
var sum64_5_hi = utils$a.sum64_5_hi;
var sum64_5_lo = utils$a.sum64_5_lo;

var BlockHash$1 = common$1.BlockHash;

var sha512_K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

function SHA512$1() {
  if (!(this instanceof SHA512$1))
    return new SHA512$1();

  BlockHash$1.call(this);
  this.h = [
    0x6a09e667, 0xf3bcc908,
    0xbb67ae85, 0x84caa73b,
    0x3c6ef372, 0xfe94f82b,
    0xa54ff53a, 0x5f1d36f1,
    0x510e527f, 0xade682d1,
    0x9b05688c, 0x2b3e6c1f,
    0x1f83d9ab, 0xfb41bd6b,
    0x5be0cd19, 0x137e2179 ];
  this.k = sha512_K;
  this.W = new Array(160);
}
utils$a.inherits(SHA512$1, BlockHash$1);
var _512 = SHA512$1;

SHA512$1.blockSize = 1024;
SHA512$1.outSize = 512;
SHA512$1.hmacStrength = 192;
SHA512$1.padLength = 128;

SHA512$1.prototype._prepareBlock = function _prepareBlock(msg, start) {
  var W = this.W;

  // 32 x 32bit words
  for (var i = 0; i < 32; i++)
    W[i] = msg[start + i];
  for (; i < W.length; i += 2) {
    var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);  // i - 2
    var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
    var c1_hi = W[i - 14];  // i - 7
    var c1_lo = W[i - 13];
    var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);  // i - 15
    var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
    var c3_hi = W[i - 32];  // i - 16
    var c3_lo = W[i - 31];

    W[i] = sum64_4_hi(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo);
    W[i + 1] = sum64_4_lo(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo);
  }
};

SHA512$1.prototype._update = function _update(msg, start) {
  this._prepareBlock(msg, start);

  var W = this.W;

  var ah = this.h[0];
  var al = this.h[1];
  var bh = this.h[2];
  var bl = this.h[3];
  var ch = this.h[4];
  var cl = this.h[5];
  var dh = this.h[6];
  var dl = this.h[7];
  var eh = this.h[8];
  var el = this.h[9];
  var fh = this.h[10];
  var fl = this.h[11];
  var gh = this.h[12];
  var gl = this.h[13];
  var hh = this.h[14];
  var hl = this.h[15];

  assert$8(this.k.length === W.length);
  for (var i = 0; i < W.length; i += 2) {
    var c0_hi = hh;
    var c0_lo = hl;
    var c1_hi = s1_512_hi(eh, el);
    var c1_lo = s1_512_lo(eh, el);
    var c2_hi = ch64_hi(eh, el, fh, fl, gh);
    var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
    var c3_hi = this.k[i];
    var c3_lo = this.k[i + 1];
    var c4_hi = W[i];
    var c4_lo = W[i + 1];

    var T1_hi = sum64_5_hi(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo,
      c4_hi, c4_lo);
    var T1_lo = sum64_5_lo(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo,
      c4_hi, c4_lo);

    c0_hi = s0_512_hi(ah, al);
    c0_lo = s0_512_lo(ah, al);
    c1_hi = maj64_hi(ah, al, bh, bl, ch);
    c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);

    var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
    var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);

    hh = gh;
    hl = gl;

    gh = fh;
    gl = fl;

    fh = eh;
    fl = el;

    eh = sum64_hi(dh, dl, T1_hi, T1_lo);
    el = sum64_lo(dl, dl, T1_hi, T1_lo);

    dh = ch;
    dl = cl;

    ch = bh;
    cl = bl;

    bh = ah;
    bl = al;

    ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
    al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
  }

  sum64(this.h, 0, ah, al);
  sum64(this.h, 2, bh, bl);
  sum64(this.h, 4, ch, cl);
  sum64(this.h, 6, dh, dl);
  sum64(this.h, 8, eh, el);
  sum64(this.h, 10, fh, fl);
  sum64(this.h, 12, gh, gl);
  sum64(this.h, 14, hh, hl);
};

SHA512$1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$a.toHex32(this.h, 'big');
  else
    return utils$a.split32(this.h, 'big');
};

function ch64_hi(xh, xl, yh, yl, zh) {
  var r = (xh & yh) ^ ((~xh) & zh);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function ch64_lo(xh, xl, yh, yl, zh, zl) {
  var r = (xl & yl) ^ ((~xl) & zl);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function maj64_hi(xh, xl, yh, yl, zh) {
  var r = (xh & yh) ^ (xh & zh) ^ (yh & zh);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function maj64_lo(xh, xl, yh, yl, zh, zl) {
  var r = (xl & yl) ^ (xl & zl) ^ (yl & zl);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s0_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 28);
  var c1_hi = rotr64_hi(xl, xh, 2);  // 34
  var c2_hi = rotr64_hi(xl, xh, 7);  // 39

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s0_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 28);
  var c1_lo = rotr64_lo(xl, xh, 2);  // 34
  var c2_lo = rotr64_lo(xl, xh, 7);  // 39

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s1_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 14);
  var c1_hi = rotr64_hi(xh, xl, 18);
  var c2_hi = rotr64_hi(xl, xh, 9);  // 41

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s1_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 14);
  var c1_lo = rotr64_lo(xh, xl, 18);
  var c2_lo = rotr64_lo(xl, xh, 9);  // 41

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g0_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 1);
  var c1_hi = rotr64_hi(xh, xl, 8);
  var c2_hi = shr64_hi(xh, xl, 7);

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g0_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 1);
  var c1_lo = rotr64_lo(xh, xl, 8);
  var c2_lo = shr64_lo(xh, xl, 7);

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g1_512_hi(xh, xl) {
  var c0_hi = rotr64_hi(xh, xl, 19);
  var c1_hi = rotr64_hi(xl, xh, 29);  // 61
  var c2_hi = shr64_hi(xh, xl, 6);

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g1_512_lo(xh, xl) {
  var c0_lo = rotr64_lo(xh, xl, 19);
  var c1_lo = rotr64_lo(xl, xh, 29);  // 61
  var c2_lo = shr64_lo(xh, xl, 6);

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

var utils$9 = utils$g;

var SHA512 = _512;

function SHA384() {
  if (!(this instanceof SHA384))
    return new SHA384();

  SHA512.call(this);
  this.h = [
    0xcbbb9d5d, 0xc1059ed8,
    0x629a292a, 0x367cd507,
    0x9159015a, 0x3070dd17,
    0x152fecd8, 0xf70e5939,
    0x67332667, 0xffc00b31,
    0x8eb44a87, 0x68581511,
    0xdb0c2e0d, 0x64f98fa7,
    0x47b5481d, 0xbefa4fa4 ];
}
utils$9.inherits(SHA384, SHA512);
var _384 = SHA384;

SHA384.blockSize = 1024;
SHA384.outSize = 384;
SHA384.hmacStrength = 192;
SHA384.padLength = 128;

SHA384.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$9.toHex32(this.h.slice(0, 12), 'big');
  else
    return utils$9.split32(this.h.slice(0, 12), 'big');
};

sha.sha1 = _1;
sha.sha224 = _224;
sha.sha256 = _256;
sha.sha384 = _384;
sha.sha512 = _512;

var ripemd = {};

var utils$8 = utils$g;
var common = common$5;

var rotl32 = utils$8.rotl32;
var sum32 = utils$8.sum32;
var sum32_3 = utils$8.sum32_3;
var sum32_4 = utils$8.sum32_4;
var BlockHash = common.BlockHash;

function RIPEMD160() {
  if (!(this instanceof RIPEMD160))
    return new RIPEMD160();

  BlockHash.call(this);

  this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
  this.endian = 'little';
}
utils$8.inherits(RIPEMD160, BlockHash);
ripemd.ripemd160 = RIPEMD160;

RIPEMD160.blockSize = 512;
RIPEMD160.outSize = 160;
RIPEMD160.hmacStrength = 192;
RIPEMD160.padLength = 64;

RIPEMD160.prototype._update = function update(msg, start) {
  var A = this.h[0];
  var B = this.h[1];
  var C = this.h[2];
  var D = this.h[3];
  var E = this.h[4];
  var Ah = A;
  var Bh = B;
  var Ch = C;
  var Dh = D;
  var Eh = E;
  for (var j = 0; j < 80; j++) {
    var T = sum32(
      rotl32(
        sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)),
        s[j]),
      E);
    A = E;
    E = D;
    D = rotl32(C, 10);
    C = B;
    B = T;
    T = sum32(
      rotl32(
        sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)),
        sh[j]),
      Eh);
    Ah = Eh;
    Eh = Dh;
    Dh = rotl32(Ch, 10);
    Ch = Bh;
    Bh = T;
  }
  T = sum32_3(this.h[1], C, Dh);
  this.h[1] = sum32_3(this.h[2], D, Eh);
  this.h[2] = sum32_3(this.h[3], E, Ah);
  this.h[3] = sum32_3(this.h[4], A, Bh);
  this.h[4] = sum32_3(this.h[0], B, Ch);
  this.h[0] = T;
};

RIPEMD160.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils$8.toHex32(this.h, 'little');
  else
    return utils$8.split32(this.h, 'little');
};

function f(j, x, y, z) {
  if (j <= 15)
    return x ^ y ^ z;
  else if (j <= 31)
    return (x & y) | ((~x) & z);
  else if (j <= 47)
    return (x | (~y)) ^ z;
  else if (j <= 63)
    return (x & z) | (y & (~z));
  else
    return x ^ (y | (~z));
}

function K(j) {
  if (j <= 15)
    return 0x00000000;
  else if (j <= 31)
    return 0x5a827999;
  else if (j <= 47)
    return 0x6ed9eba1;
  else if (j <= 63)
    return 0x8f1bbcdc;
  else
    return 0xa953fd4e;
}

function Kh(j) {
  if (j <= 15)
    return 0x50a28be6;
  else if (j <= 31)
    return 0x5c4dd124;
  else if (j <= 47)
    return 0x6d703ef3;
  else if (j <= 63)
    return 0x7a6d76e9;
  else
    return 0x00000000;
}

var r = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
];

var rh = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
];

var s = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
];

var sh = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
];

var utils$7 = utils$g;
var assert$7 = minimalisticAssert;

function Hmac(hash, key, enc) {
  if (!(this instanceof Hmac))
    return new Hmac(hash, key, enc);
  this.Hash = hash;
  this.blockSize = hash.blockSize / 8;
  this.outSize = hash.outSize / 8;
  this.inner = null;
  this.outer = null;

  this._init(utils$7.toArray(key, enc));
}
var hmac = Hmac;

Hmac.prototype._init = function init(key) {
  // Shorten key, if needed
  if (key.length > this.blockSize)
    key = new this.Hash().update(key).digest();
  assert$7(key.length <= this.blockSize);

  // Add padding to key
  for (var i = key.length; i < this.blockSize; i++)
    key.push(0);

  for (i = 0; i < key.length; i++)
    key[i] ^= 0x36;
  this.inner = new this.Hash().update(key);

  // 0x36 ^ 0x5c = 0x6a
  for (i = 0; i < key.length; i++)
    key[i] ^= 0x6a;
  this.outer = new this.Hash().update(key);
};

Hmac.prototype.update = function update(msg, enc) {
  this.inner.update(msg, enc);
  return this;
};

Hmac.prototype.digest = function digest(enc) {
  this.outer.update(this.inner.digest());
  return this.outer.digest(enc);
};

(function (exports) {
	var hash = exports;

	hash.utils = utils$g;
	hash.common = common$5;
	hash.sha = sha;
	hash.ripemd = ripemd;
	hash.hmac = hmac;

	// Proxy hash functions to the main object
	hash.sha1 = hash.sha.sha1;
	hash.sha256 = hash.sha.sha256;
	hash.sha224 = hash.sha.sha224;
	hash.sha384 = hash.sha.sha384;
	hash.sha512 = hash.sha.sha512;
	hash.ripemd160 = hash.ripemd.ripemd160; 
} (hash$2));

var secp256k1;
var hasRequiredSecp256k1;

function requireSecp256k1 () {
	if (hasRequiredSecp256k1) return secp256k1;
	hasRequiredSecp256k1 = 1;
	secp256k1 = {
	  doubles: {
	    step: 4,
	    points: [
	      [
	        'e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a',
	        'f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821',
	      ],
	      [
	        '8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508',
	        '11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf',
	      ],
	      [
	        '175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739',
	        'd3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695',
	      ],
	      [
	        '363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640',
	        '4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9',
	      ],
	      [
	        '8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c',
	        '4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36',
	      ],
	      [
	        '723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda',
	        '96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f',
	      ],
	      [
	        'eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa',
	        '5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999',
	      ],
	      [
	        '100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0',
	        'cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09',
	      ],
	      [
	        'e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d',
	        '9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d',
	      ],
	      [
	        'feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d',
	        'e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088',
	      ],
	      [
	        'da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1',
	        '9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d',
	      ],
	      [
	        '53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0',
	        '5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8',
	      ],
	      [
	        '8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047',
	        '10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a',
	      ],
	      [
	        '385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862',
	        '283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453',
	      ],
	      [
	        '6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7',
	        '7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160',
	      ],
	      [
	        '3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd',
	        '56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0',
	      ],
	      [
	        '85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83',
	        '7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6',
	      ],
	      [
	        '948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a',
	        '53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589',
	      ],
	      [
	        '6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8',
	        'bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17',
	      ],
	      [
	        'e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d',
	        '4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda',
	      ],
	      [
	        'e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725',
	        '7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd',
	      ],
	      [
	        '213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754',
	        '4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2',
	      ],
	      [
	        '4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c',
	        '17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6',
	      ],
	      [
	        'fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6',
	        '6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f',
	      ],
	      [
	        '76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39',
	        'c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01',
	      ],
	      [
	        'c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891',
	        '893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3',
	      ],
	      [
	        'd895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b',
	        'febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f',
	      ],
	      [
	        'b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03',
	        '2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7',
	      ],
	      [
	        'e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d',
	        'eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78',
	      ],
	      [
	        'a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070',
	        '7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1',
	      ],
	      [
	        '90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4',
	        'e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150',
	      ],
	      [
	        '8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da',
	        '662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82',
	      ],
	      [
	        'e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11',
	        '1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc',
	      ],
	      [
	        '8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e',
	        'efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b',
	      ],
	      [
	        'e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41',
	        '2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51',
	      ],
	      [
	        'b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef',
	        '67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45',
	      ],
	      [
	        'd68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8',
	        'db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120',
	      ],
	      [
	        '324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d',
	        '648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84',
	      ],
	      [
	        '4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96',
	        '35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d',
	      ],
	      [
	        '9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd',
	        'ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d',
	      ],
	      [
	        '6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5',
	        '9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8',
	      ],
	      [
	        'a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266',
	        '40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8',
	      ],
	      [
	        '7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71',
	        '34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac',
	      ],
	      [
	        '928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac',
	        'c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f',
	      ],
	      [
	        '85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751',
	        '1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962',
	      ],
	      [
	        'ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e',
	        '493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907',
	      ],
	      [
	        '827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241',
	        'c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec',
	      ],
	      [
	        'eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3',
	        'be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d',
	      ],
	      [
	        'e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f',
	        '4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414',
	      ],
	      [
	        '1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19',
	        'aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd',
	      ],
	      [
	        '146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be',
	        'b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0',
	      ],
	      [
	        'fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9',
	        '6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811',
	      ],
	      [
	        'da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2',
	        '8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1',
	      ],
	      [
	        'a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13',
	        '7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c',
	      ],
	      [
	        '174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c',
	        'ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73',
	      ],
	      [
	        '959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba',
	        '2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd',
	      ],
	      [
	        'd2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151',
	        'e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405',
	      ],
	      [
	        '64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073',
	        'd99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589',
	      ],
	      [
	        '8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458',
	        '38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e',
	      ],
	      [
	        '13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b',
	        '69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27',
	      ],
	      [
	        'bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366',
	        'd3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1',
	      ],
	      [
	        '8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa',
	        '40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482',
	      ],
	      [
	        '8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0',
	        '620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945',
	      ],
	      [
	        'dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787',
	        '7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573',
	      ],
	      [
	        'f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e',
	        'ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82',
	      ],
	    ],
	  },
	  naf: {
	    wnd: 7,
	    points: [
	      [
	        'f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
	        '388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672',
	      ],
	      [
	        '2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
	        'd8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6',
	      ],
	      [
	        '5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc',
	        '6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da',
	      ],
	      [
	        'acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe',
	        'cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37',
	      ],
	      [
	        '774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
	        'd984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b',
	      ],
	      [
	        'f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8',
	        'ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81',
	      ],
	      [
	        'd7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e',
	        '581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58',
	      ],
	      [
	        'defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34',
	        '4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77',
	      ],
	      [
	        '2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c',
	        '85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a',
	      ],
	      [
	        '352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5',
	        '321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c',
	      ],
	      [
	        '2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f',
	        '2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67',
	      ],
	      [
	        '9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714',
	        '73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402',
	      ],
	      [
	        'daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729',
	        'a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55',
	      ],
	      [
	        'c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db',
	        '2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482',
	      ],
	      [
	        '6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4',
	        'e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82',
	      ],
	      [
	        '1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5',
	        'b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396',
	      ],
	      [
	        '605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479',
	        '2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49',
	      ],
	      [
	        '62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d',
	        '80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf',
	      ],
	      [
	        '80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f',
	        '1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a',
	      ],
	      [
	        '7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb',
	        'd0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7',
	      ],
	      [
	        'd528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9',
	        'eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933',
	      ],
	      [
	        '49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963',
	        '758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a',
	      ],
	      [
	        '77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74',
	        '958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6',
	      ],
	      [
	        'f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530',
	        'e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37',
	      ],
	      [
	        '463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b',
	        '5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e',
	      ],
	      [
	        'f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247',
	        'cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6',
	      ],
	      [
	        'caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1',
	        'cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476',
	      ],
	      [
	        '2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120',
	        '4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40',
	      ],
	      [
	        '7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435',
	        '91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61',
	      ],
	      [
	        '754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18',
	        '673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683',
	      ],
	      [
	        'e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8',
	        '59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5',
	      ],
	      [
	        '186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb',
	        '3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b',
	      ],
	      [
	        'df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f',
	        '55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417',
	      ],
	      [
	        '5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143',
	        'efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868',
	      ],
	      [
	        '290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba',
	        'e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a',
	      ],
	      [
	        'af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45',
	        'f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6',
	      ],
	      [
	        '766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a',
	        '744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996',
	      ],
	      [
	        '59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e',
	        'c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e',
	      ],
	      [
	        'f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8',
	        'e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d',
	      ],
	      [
	        '7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c',
	        '30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2',
	      ],
	      [
	        '948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519',
	        'e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e',
	      ],
	      [
	        '7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab',
	        '100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437',
	      ],
	      [
	        '3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca',
	        'ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311',
	      ],
	      [
	        'd3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf',
	        '8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4',
	      ],
	      [
	        '1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610',
	        '68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575',
	      ],
	      [
	        '733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4',
	        'f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d',
	      ],
	      [
	        '15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c',
	        'd56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d',
	      ],
	      [
	        'a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940',
	        'edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629',
	      ],
	      [
	        'e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980',
	        'a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06',
	      ],
	      [
	        '311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3',
	        '66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374',
	      ],
	      [
	        '34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf',
	        '9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee',
	      ],
	      [
	        'f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63',
	        '4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1',
	      ],
	      [
	        'd7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448',
	        'fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b',
	      ],
	      [
	        '32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf',
	        '5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661',
	      ],
	      [
	        '7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5',
	        '8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6',
	      ],
	      [
	        'ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6',
	        '8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e',
	      ],
	      [
	        '16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5',
	        '5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d',
	      ],
	      [
	        'eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99',
	        'f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc',
	      ],
	      [
	        '78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51',
	        'f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4',
	      ],
	      [
	        '494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5',
	        '42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c',
	      ],
	      [
	        'a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5',
	        '204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b',
	      ],
	      [
	        'c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997',
	        '4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913',
	      ],
	      [
	        '841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881',
	        '73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154',
	      ],
	      [
	        '5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5',
	        '39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865',
	      ],
	      [
	        '36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66',
	        'd2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc',
	      ],
	      [
	        '336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726',
	        'ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224',
	      ],
	      [
	        '8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede',
	        '6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e',
	      ],
	      [
	        '1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94',
	        '60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6',
	      ],
	      [
	        '85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31',
	        '3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511',
	      ],
	      [
	        '29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51',
	        'b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b',
	      ],
	      [
	        'a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252',
	        'ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2',
	      ],
	      [
	        '4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5',
	        'cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c',
	      ],
	      [
	        'd24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b',
	        '6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3',
	      ],
	      [
	        'ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4',
	        '322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d',
	      ],
	      [
	        'af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f',
	        '6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700',
	      ],
	      [
	        'e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889',
	        '2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4',
	      ],
	      [
	        '591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246',
	        'b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196',
	      ],
	      [
	        '11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984',
	        '998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4',
	      ],
	      [
	        '3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a',
	        'b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257',
	      ],
	      [
	        'cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030',
	        'bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13',
	      ],
	      [
	        'c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197',
	        '6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096',
	      ],
	      [
	        'c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593',
	        'c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38',
	      ],
	      [
	        'a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef',
	        '21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f',
	      ],
	      [
	        '347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38',
	        '60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448',
	      ],
	      [
	        'da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a',
	        '49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a',
	      ],
	      [
	        'c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111',
	        '5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4',
	      ],
	      [
	        '4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502',
	        '7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437',
	      ],
	      [
	        '3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea',
	        'be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7',
	      ],
	      [
	        'cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26',
	        '8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d',
	      ],
	      [
	        'b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986',
	        '39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a',
	      ],
	      [
	        'd4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e',
	        '62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54',
	      ],
	      [
	        '48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4',
	        '25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77',
	      ],
	      [
	        'dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda',
	        'ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517',
	      ],
	      [
	        '6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859',
	        'cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10',
	      ],
	      [
	        'e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f',
	        'f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125',
	      ],
	      [
	        'eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c',
	        '6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e',
	      ],
	      [
	        '13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942',
	        'fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1',
	      ],
	      [
	        'ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a',
	        '1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2',
	      ],
	      [
	        'b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80',
	        '5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423',
	      ],
	      [
	        'ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d',
	        '438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8',
	      ],
	      [
	        '8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1',
	        'cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758',
	      ],
	      [
	        '52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63',
	        'c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375',
	      ],
	      [
	        'e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352',
	        '6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d',
	      ],
	      [
	        '7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193',
	        'ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec',
	      ],
	      [
	        '5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00',
	        '9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0',
	      ],
	      [
	        '32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58',
	        'ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c',
	      ],
	      [
	        'e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7',
	        'd3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4',
	      ],
	      [
	        '8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8',
	        'c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f',
	      ],
	      [
	        '4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e',
	        '67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649',
	      ],
	      [
	        '3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d',
	        'cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826',
	      ],
	      [
	        '674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b',
	        '299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5',
	      ],
	      [
	        'd32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f',
	        'f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87',
	      ],
	      [
	        '30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6',
	        '462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b',
	      ],
	      [
	        'be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297',
	        '62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc',
	      ],
	      [
	        '93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a',
	        '7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c',
	      ],
	      [
	        'b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c',
	        'ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f',
	      ],
	      [
	        'd5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52',
	        '4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a',
	      ],
	      [
	        'd3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb',
	        'bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46',
	      ],
	      [
	        '463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065',
	        'bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f',
	      ],
	      [
	        '7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917',
	        '603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03',
	      ],
	      [
	        '74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9',
	        'cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08',
	      ],
	      [
	        '30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3',
	        '553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8',
	      ],
	      [
	        '9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57',
	        '712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373',
	      ],
	      [
	        '176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66',
	        'ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3',
	      ],
	      [
	        '75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8',
	        '9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8',
	      ],
	      [
	        '809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721',
	        '9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1',
	      ],
	      [
	        '1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180',
	        '4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9',
	      ],
	    ],
	  },
	};
	return secp256k1;
}

(function (exports) {

	var curves = exports;

	var hash = hash$2;
	var curve$1 = curve;
	var utils = utils$m;

	var assert = utils.assert;

	function PresetCurve(options) {
	  if (options.type === 'short')
	    this.curve = new curve$1.short(options);
	  else if (options.type === 'edwards')
	    this.curve = new curve$1.edwards(options);
	  else
	    this.curve = new curve$1.mont(options);
	  this.g = this.curve.g;
	  this.n = this.curve.n;
	  this.hash = options.hash;

	  assert(this.g.validate(), 'Invalid curve');
	  assert(this.g.mul(this.n).isInfinity(), 'Invalid curve, G*N != O');
	}
	curves.PresetCurve = PresetCurve;

	function defineCurve(name, options) {
	  Object.defineProperty(curves, name, {
	    configurable: true,
	    enumerable: true,
	    get: function() {
	      var curve = new PresetCurve(options);
	      Object.defineProperty(curves, name, {
	        configurable: true,
	        enumerable: true,
	        value: curve,
	      });
	      return curve;
	    },
	  });
	}

	defineCurve('p192', {
	  type: 'short',
	  prime: 'p192',
	  p: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',
	  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',
	  b: '64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',
	  n: 'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012',
	    '07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811',
	  ],
	});

	defineCurve('p224', {
	  type: 'short',
	  prime: 'p224',
	  p: 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001',
	  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe',
	  b: 'b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4',
	  n: 'ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    'b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21',
	    'bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34',
	  ],
	});

	defineCurve('p256', {
	  type: 'short',
	  prime: null,
	  p: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff',
	  a: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc',
	  b: '5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b',
	  n: 'ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296',
	    '4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5',
	  ],
	});

	defineCurve('p384', {
	  type: 'short',
	  prime: null,
	  p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
	     'fffffffe ffffffff 00000000 00000000 ffffffff',
	  a: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
	     'fffffffe ffffffff 00000000 00000000 fffffffc',
	  b: 'b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f ' +
	     '5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef',
	  n: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 ' +
	     'f4372ddf 581a0db2 48b0a77a ecec196a ccc52973',
	  hash: hash.sha384,
	  gRed: false,
	  g: [
	    'aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 ' +
	    '5502f25d bf55296c 3a545e38 72760ab7',
	    '3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 ' +
	    '0a60b1ce 1d7e819d 7a431d7c 90ea0e5f',
	  ],
	});

	defineCurve('p521', {
	  type: 'short',
	  prime: null,
	  p: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
	     'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
	     'ffffffff ffffffff ffffffff ffffffff ffffffff',
	  a: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
	     'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
	     'ffffffff ffffffff ffffffff ffffffff fffffffc',
	  b: '00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b ' +
	     '99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd ' +
	     '3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00',
	  n: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
	     'ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 ' +
	     'f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409',
	  hash: hash.sha512,
	  gRed: false,
	  g: [
	    '000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 ' +
	    '053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 ' +
	    'a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66',
	    '00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 ' +
	    '579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 ' +
	    '3fad0761 353c7086 a272c240 88be9476 9fd16650',
	  ],
	});

	defineCurve('curve25519', {
	  type: 'mont',
	  prime: 'p25519',
	  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
	  a: '76d06',
	  b: '1',
	  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '9',
	  ],
	});

	defineCurve('ed25519', {
	  type: 'edwards',
	  prime: 'p25519',
	  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
	  a: '-1',
	  c: '1',
	  // -121665 * (121666^(-1)) (mod P)
	  d: '52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3',
	  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
	  hash: hash.sha256,
	  gRed: false,
	  g: [
	    '216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',

	    // 4/5
	    '6666666666666666666666666666666666666666666666666666666666666658',
	  ],
	});

	var pre;
	try {
	  pre = requireSecp256k1();
	} catch (e) {
	  pre = undefined;
	}

	defineCurve('secp256k1', {
	  type: 'short',
	  prime: 'k256',
	  p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',
	  a: '0',
	  b: '7',
	  n: 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141',
	  h: '1',
	  hash: hash.sha256,

	  // Precomputed endomorphism
	  beta: '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee',
	  lambda: '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72',
	  basis: [
	    {
	      a: '3086d221a7d46bcde86c90e49284eb15',
	      b: '-e4437ed6010e88286f547fa90abfe4c3',
	    },
	    {
	      a: '114ca50f7a8e2f3f657c1108d9d44cfd8',
	      b: '3086d221a7d46bcde86c90e49284eb15',
	    },
	  ],

	  gRed: false,
	  g: [
	    '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
	    '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
	    pre,
	  ],
	}); 
} (curves$2));

var hash$1 = hash$2;
var utils$6 = utils$l;
var assert$6 = minimalisticAssert;

function HmacDRBG$1(options) {
  if (!(this instanceof HmacDRBG$1))
    return new HmacDRBG$1(options);
  this.hash = options.hash;
  this.predResist = !!options.predResist;

  this.outLen = this.hash.outSize;
  this.minEntropy = options.minEntropy || this.hash.hmacStrength;

  this._reseed = null;
  this.reseedInterval = null;
  this.K = null;
  this.V = null;

  var entropy = utils$6.toArray(options.entropy, options.entropyEnc || 'hex');
  var nonce = utils$6.toArray(options.nonce, options.nonceEnc || 'hex');
  var pers = utils$6.toArray(options.pers, options.persEnc || 'hex');
  assert$6(entropy.length >= (this.minEntropy / 8),
         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
  this._init(entropy, nonce, pers);
}
var hmacDrbg = HmacDRBG$1;

HmacDRBG$1.prototype._init = function init(entropy, nonce, pers) {
  var seed = entropy.concat(nonce).concat(pers);

  this.K = new Array(this.outLen / 8);
  this.V = new Array(this.outLen / 8);
  for (var i = 0; i < this.V.length; i++) {
    this.K[i] = 0x00;
    this.V[i] = 0x01;
  }

  this._update(seed);
  this._reseed = 1;
  this.reseedInterval = 0x1000000000000;  // 2^48
};

HmacDRBG$1.prototype._hmac = function hmac() {
  return new hash$1.hmac(this.hash, this.K);
};

HmacDRBG$1.prototype._update = function update(seed) {
  var kmac = this._hmac()
                 .update(this.V)
                 .update([ 0x00 ]);
  if (seed)
    kmac = kmac.update(seed);
  this.K = kmac.digest();
  this.V = this._hmac().update(this.V).digest();
  if (!seed)
    return;

  this.K = this._hmac()
               .update(this.V)
               .update([ 0x01 ])
               .update(seed)
               .digest();
  this.V = this._hmac().update(this.V).digest();
};

HmacDRBG$1.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
  // Optional entropy enc
  if (typeof entropyEnc !== 'string') {
    addEnc = add;
    add = entropyEnc;
    entropyEnc = null;
  }

  entropy = utils$6.toArray(entropy, entropyEnc);
  add = utils$6.toArray(add, addEnc);

  assert$6(entropy.length >= (this.minEntropy / 8),
         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');

  this._update(entropy.concat(add || []));
  this._reseed = 1;
};

HmacDRBG$1.prototype.generate = function generate(len, enc, add, addEnc) {
  if (this._reseed > this.reseedInterval)
    throw new Error('Reseed is required');

  // Optional encoding
  if (typeof enc !== 'string') {
    addEnc = add;
    add = enc;
    enc = null;
  }

  // Optional additional data
  if (add) {
    add = utils$6.toArray(add, addEnc || 'hex');
    this._update(add);
  }

  var temp = [];
  while (temp.length < len) {
    this.V = this._hmac().update(this.V).digest();
    temp = temp.concat(this.V);
  }

  var res = temp.slice(0, len);
  this._update(add);
  this._reseed++;
  return utils$6.encode(res, enc);
};

var BN$3 = bnExports;
var utils$5 = utils$m;
var assert$5 = utils$5.assert;

function KeyPair$3(ec, options) {
  this.ec = ec;
  this.priv = null;
  this.pub = null;

  // KeyPair(ec, { priv: ..., pub: ... })
  if (options.priv)
    this._importPrivate(options.priv, options.privEnc);
  if (options.pub)
    this._importPublic(options.pub, options.pubEnc);
}
var key$1 = KeyPair$3;

KeyPair$3.fromPublic = function fromPublic(ec, pub, enc) {
  if (pub instanceof KeyPair$3)
    return pub;

  return new KeyPair$3(ec, {
    pub: pub,
    pubEnc: enc,
  });
};

KeyPair$3.fromPrivate = function fromPrivate(ec, priv, enc) {
  if (priv instanceof KeyPair$3)
    return priv;

  return new KeyPair$3(ec, {
    priv: priv,
    privEnc: enc,
  });
};

KeyPair$3.prototype.validate = function validate() {
  var pub = this.getPublic();

  if (pub.isInfinity())
    return { result: false, reason: 'Invalid public key' };
  if (!pub.validate())
    return { result: false, reason: 'Public key is not a point' };
  if (!pub.mul(this.ec.curve.n).isInfinity())
    return { result: false, reason: 'Public key * N != O' };

  return { result: true, reason: null };
};

KeyPair$3.prototype.getPublic = function getPublic(compact, enc) {
  // compact is optional argument
  if (typeof compact === 'string') {
    enc = compact;
    compact = null;
  }

  if (!this.pub)
    this.pub = this.ec.g.mul(this.priv);

  if (!enc)
    return this.pub;

  return this.pub.encode(enc, compact);
};

KeyPair$3.prototype.getPrivate = function getPrivate(enc) {
  if (enc === 'hex')
    return this.priv.toString(16, 2);
  else
    return this.priv;
};

KeyPair$3.prototype._importPrivate = function _importPrivate(key, enc) {
  this.priv = new BN$3(key, enc || 16);

  // Ensure that the priv won't be bigger than n, otherwise we may fail
  // in fixed multiplication method
  this.priv = this.priv.umod(this.ec.curve.n);
};

KeyPair$3.prototype._importPublic = function _importPublic(key, enc) {
  if (key.x || key.y) {
    // Montgomery points only have an `x` coordinate.
    // Weierstrass/Edwards points on the other hand have both `x` and
    // `y` coordinates.
    if (this.ec.curve.type === 'mont') {
      assert$5(key.x, 'Need x coordinate');
    } else if (this.ec.curve.type === 'short' ||
               this.ec.curve.type === 'edwards') {
      assert$5(key.x && key.y, 'Need both x and y coordinate');
    }
    this.pub = this.ec.curve.point(key.x, key.y);
    return;
  }
  this.pub = this.ec.curve.decodePoint(key, enc);
};

// ECDH
KeyPair$3.prototype.derive = function derive(pub) {
  if(!pub.validate()) {
    assert$5(pub.validate(), 'public point not validated');
  }
  return pub.mul(this.priv).getX();
};

// ECDSA
KeyPair$3.prototype.sign = function sign(msg, enc, options) {
  return this.ec.sign(msg, this, enc, options);
};

KeyPair$3.prototype.verify = function verify(msg, signature) {
  return this.ec.verify(msg, signature, this);
};

KeyPair$3.prototype.inspect = function inspect() {
  return '<Key priv: ' + (this.priv && this.priv.toString(16, 2)) +
         ' pub: ' + (this.pub && this.pub.inspect()) + ' >';
};

var BN$2 = bnExports;

var utils$4 = utils$m;
var assert$4 = utils$4.assert;

function Signature$3(options, enc) {
  if (options instanceof Signature$3)
    return options;

  if (this._importDER(options, enc))
    return;

  assert$4(options.r && options.s, 'Signature without r or s');
  this.r = new BN$2(options.r, 16);
  this.s = new BN$2(options.s, 16);
  if (options.recoveryParam === undefined)
    this.recoveryParam = null;
  else
    this.recoveryParam = options.recoveryParam;
}
var signature$1 = Signature$3;

function Position() {
  this.place = 0;
}

function getLength(buf, p) {
  var initial = buf[p.place++];
  if (!(initial & 0x80)) {
    return initial;
  }
  var octetLen = initial & 0xf;

  // Indefinite length or overflow
  if (octetLen === 0 || octetLen > 4) {
    return false;
  }

  var val = 0;
  for (var i = 0, off = p.place; i < octetLen; i++, off++) {
    val <<= 8;
    val |= buf[off];
    val >>>= 0;
  }

  // Leading zeroes
  if (val <= 0x7f) {
    return false;
  }

  p.place = off;
  return val;
}

function rmPadding(buf) {
  var i = 0;
  var len = buf.length - 1;
  while (!buf[i] && !(buf[i + 1] & 0x80) && i < len) {
    i++;
  }
  if (i === 0) {
    return buf;
  }
  return buf.slice(i);
}

Signature$3.prototype._importDER = function _importDER(data, enc) {
  data = utils$4.toArray(data, enc);
  var p = new Position();
  if (data[p.place++] !== 0x30) {
    return false;
  }
  var len = getLength(data, p);
  if (len === false) {
    return false;
  }
  if ((len + p.place) !== data.length) {
    return false;
  }
  if (data[p.place++] !== 0x02) {
    return false;
  }
  var rlen = getLength(data, p);
  if (rlen === false) {
    return false;
  }
  var r = data.slice(p.place, rlen + p.place);
  p.place += rlen;
  if (data[p.place++] !== 0x02) {
    return false;
  }
  var slen = getLength(data, p);
  if (slen === false) {
    return false;
  }
  if (data.length !== slen + p.place) {
    return false;
  }
  var s = data.slice(p.place, slen + p.place);
  if (r[0] === 0) {
    if (r[1] & 0x80) {
      r = r.slice(1);
    } else {
      // Leading zeroes
      return false;
    }
  }
  if (s[0] === 0) {
    if (s[1] & 0x80) {
      s = s.slice(1);
    } else {
      // Leading zeroes
      return false;
    }
  }

  this.r = new BN$2(r);
  this.s = new BN$2(s);
  this.recoveryParam = null;

  return true;
};

function constructLength(arr, len) {
  if (len < 0x80) {
    arr.push(len);
    return;
  }
  var octets = 1 + (Math.log(len) / Math.LN2 >>> 3);
  arr.push(octets | 0x80);
  while (--octets) {
    arr.push((len >>> (octets << 3)) & 0xff);
  }
  arr.push(len);
}

Signature$3.prototype.toDER = function toDER(enc) {
  var r = this.r.toArray();
  var s = this.s.toArray();

  // Pad values
  if (r[0] & 0x80)
    r = [ 0 ].concat(r);
  // Pad values
  if (s[0] & 0x80)
    s = [ 0 ].concat(s);

  r = rmPadding(r);
  s = rmPadding(s);

  while (!s[0] && !(s[1] & 0x80)) {
    s = s.slice(1);
  }
  var arr = [ 0x02 ];
  constructLength(arr, r.length);
  arr = arr.concat(r);
  arr.push(0x02);
  constructLength(arr, s.length);
  var backHalf = arr.concat(s);
  var res = [ 0x30 ];
  constructLength(res, backHalf.length);
  res = res.concat(backHalf);
  return utils$4.encode(res, enc);
};

var BN$1 = bnExports;
var HmacDRBG = hmacDrbg;
var utils$3 = utils$m;
var curves$1 = curves$2;
var rand = brorandExports;
var assert$3 = utils$3.assert;

var KeyPair$2 = key$1;
var Signature$2 = signature$1;

function EC(options) {
  if (!(this instanceof EC))
    return new EC(options);

  // Shortcut `elliptic.ec(curve-name)`
  if (typeof options === 'string') {
    assert$3(Object.prototype.hasOwnProperty.call(curves$1, options),
      'Unknown curve ' + options);

    options = curves$1[options];
  }

  // Shortcut for `elliptic.ec(elliptic.curves.curveName)`
  if (options instanceof curves$1.PresetCurve)
    options = { curve: options };

  this.curve = options.curve.curve;
  this.n = this.curve.n;
  this.nh = this.n.ushrn(1);
  this.g = this.curve.g;

  // Point on curve
  this.g = options.curve.g;
  this.g.precompute(options.curve.n.bitLength() + 1);

  // Hash for function for DRBG
  this.hash = options.hash || options.curve.hash;
}
var ec = EC;

EC.prototype.keyPair = function keyPair(options) {
  return new KeyPair$2(this, options);
};

EC.prototype.keyFromPrivate = function keyFromPrivate(priv, enc) {
  return KeyPair$2.fromPrivate(this, priv, enc);
};

EC.prototype.keyFromPublic = function keyFromPublic(pub, enc) {
  return KeyPair$2.fromPublic(this, pub, enc);
};

EC.prototype.genKeyPair = function genKeyPair(options) {
  if (!options)
    options = {};

  // Instantiate Hmac_DRBG
  var drbg = new HmacDRBG({
    hash: this.hash,
    pers: options.pers,
    persEnc: options.persEnc || 'utf8',
    entropy: options.entropy || rand(this.hash.hmacStrength),
    entropyEnc: options.entropy && options.entropyEnc || 'utf8',
    nonce: this.n.toArray(),
  });

  var bytes = this.n.byteLength();
  var ns2 = this.n.sub(new BN$1(2));
  for (;;) {
    var priv = new BN$1(drbg.generate(bytes));
    if (priv.cmp(ns2) > 0)
      continue;

    priv.iaddn(1);
    return this.keyFromPrivate(priv);
  }
};

EC.prototype._truncateToN = function _truncateToN(msg, truncOnly) {
  var delta = msg.byteLength() * 8 - this.n.bitLength();
  if (delta > 0)
    msg = msg.ushrn(delta);
  if (!truncOnly && msg.cmp(this.n) >= 0)
    return msg.sub(this.n);
  else
    return msg;
};

EC.prototype.sign = function sign(msg, key, enc, options) {
  if (typeof enc === 'object') {
    options = enc;
    enc = null;
  }
  if (!options)
    options = {};

  key = this.keyFromPrivate(key, enc);
  msg = this._truncateToN(new BN$1(msg, 16));

  // Zero-extend key to provide enough entropy
  var bytes = this.n.byteLength();
  var bkey = key.getPrivate().toArray('be', bytes);

  // Zero-extend nonce to have the same byte size as N
  var nonce = msg.toArray('be', bytes);

  // Instantiate Hmac_DRBG
  var drbg = new HmacDRBG({
    hash: this.hash,
    entropy: bkey,
    nonce: nonce,
    pers: options.pers,
    persEnc: options.persEnc || 'utf8',
  });

  // Number of bytes to generate
  var ns1 = this.n.sub(new BN$1(1));

  for (var iter = 0; ; iter++) {
    var k = options.k ?
      options.k(iter) :
      new BN$1(drbg.generate(this.n.byteLength()));
    k = this._truncateToN(k, true);
    if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0)
      continue;

    var kp = this.g.mul(k);
    if (kp.isInfinity())
      continue;

    var kpX = kp.getX();
    var r = kpX.umod(this.n);
    if (r.cmpn(0) === 0)
      continue;

    var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg));
    s = s.umod(this.n);
    if (s.cmpn(0) === 0)
      continue;

    var recoveryParam = (kp.getY().isOdd() ? 1 : 0) |
                        (kpX.cmp(r) !== 0 ? 2 : 0);

    // Use complement of `s`, if it is > `n / 2`
    if (options.canonical && s.cmp(this.nh) > 0) {
      s = this.n.sub(s);
      recoveryParam ^= 1;
    }

    return new Signature$2({ r: r, s: s, recoveryParam: recoveryParam });
  }
};

EC.prototype.verify = function verify(msg, signature, key, enc) {
  msg = this._truncateToN(new BN$1(msg, 16));
  key = this.keyFromPublic(key, enc);
  signature = new Signature$2(signature, 'hex');

  // Perform primitive values validation
  var r = signature.r;
  var s = signature.s;
  if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0)
    return false;
  if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0)
    return false;

  // Validate signature
  var sinv = s.invm(this.n);
  var u1 = sinv.mul(msg).umod(this.n);
  var u2 = sinv.mul(r).umod(this.n);
  var p;

  if (!this.curve._maxwellTrick) {
    p = this.g.mulAdd(u1, key.getPublic(), u2);
    if (p.isInfinity())
      return false;

    return p.getX().umod(this.n).cmp(r) === 0;
  }

  // NOTE: Greg Maxwell's trick, inspired by:
  // https://git.io/vad3K

  p = this.g.jmulAdd(u1, key.getPublic(), u2);
  if (p.isInfinity())
    return false;

  // Compare `p.x` of Jacobian point with `r`,
  // this will do `p.x == r * p.z^2` instead of multiplying `p.x` by the
  // inverse of `p.z^2`
  return p.eqXToP(r);
};

EC.prototype.recoverPubKey = function(msg, signature, j, enc) {
  assert$3((3 & j) === j, 'The recovery param is more than two bits');
  signature = new Signature$2(signature, enc);

  var n = this.n;
  var e = new BN$1(msg);
  var r = signature.r;
  var s = signature.s;

  // A set LSB signifies that the y-coordinate is odd
  var isYOdd = j & 1;
  var isSecondKey = j >> 1;
  if (r.cmp(this.curve.p.umod(this.curve.n)) >= 0 && isSecondKey)
    throw new Error('Unable to find sencond key candinate');

  // 1.1. Let x = r + jn.
  if (isSecondKey)
    r = this.curve.pointFromX(r.add(this.curve.n), isYOdd);
  else
    r = this.curve.pointFromX(r, isYOdd);

  var rInv = signature.r.invm(n);
  var s1 = n.sub(e).mul(rInv).umod(n);
  var s2 = s.mul(rInv).umod(n);

  // 1.6.1 Compute Q = r^-1 (sR -  eG)
  //               Q = r^-1 (sR + -eG)
  return this.g.mulAdd(s1, r, s2);
};

EC.prototype.getKeyRecoveryParam = function(e, signature, Q, enc) {
  signature = new Signature$2(signature, enc);
  if (signature.recoveryParam !== null)
    return signature.recoveryParam;

  for (var i = 0; i < 4; i++) {
    var Qprime;
    try {
      Qprime = this.recoverPubKey(e, signature, i);
    } catch (e) {
      continue;
    }

    if (Qprime.eq(Q))
      return i;
  }
  throw new Error('Unable to find valid recovery factor');
};

var utils$2 = utils$m;
var assert$2 = utils$2.assert;
var parseBytes$2 = utils$2.parseBytes;
var cachedProperty$1 = utils$2.cachedProperty;

/**
* @param {EDDSA} eddsa - instance
* @param {Object} params - public/private key parameters
*
* @param {Array<Byte>} [params.secret] - secret seed bytes
* @param {Point} [params.pub] - public key point (aka `A` in eddsa terms)
* @param {Array<Byte>} [params.pub] - public key point encoded as bytes
*
*/
function KeyPair$1(eddsa, params) {
  this.eddsa = eddsa;
  this._secret = parseBytes$2(params.secret);
  if (eddsa.isPoint(params.pub))
    this._pub = params.pub;
  else
    this._pubBytes = parseBytes$2(params.pub);
}

KeyPair$1.fromPublic = function fromPublic(eddsa, pub) {
  if (pub instanceof KeyPair$1)
    return pub;
  return new KeyPair$1(eddsa, { pub: pub });
};

KeyPair$1.fromSecret = function fromSecret(eddsa, secret) {
  if (secret instanceof KeyPair$1)
    return secret;
  return new KeyPair$1(eddsa, { secret: secret });
};

KeyPair$1.prototype.secret = function secret() {
  return this._secret;
};

cachedProperty$1(KeyPair$1, 'pubBytes', function pubBytes() {
  return this.eddsa.encodePoint(this.pub());
});

cachedProperty$1(KeyPair$1, 'pub', function pub() {
  if (this._pubBytes)
    return this.eddsa.decodePoint(this._pubBytes);
  return this.eddsa.g.mul(this.priv());
});

cachedProperty$1(KeyPair$1, 'privBytes', function privBytes() {
  var eddsa = this.eddsa;
  var hash = this.hash();
  var lastIx = eddsa.encodingLength - 1;

  var a = hash.slice(0, eddsa.encodingLength);
  a[0] &= 248;
  a[lastIx] &= 127;
  a[lastIx] |= 64;

  return a;
});

cachedProperty$1(KeyPair$1, 'priv', function priv() {
  return this.eddsa.decodeInt(this.privBytes());
});

cachedProperty$1(KeyPair$1, 'hash', function hash() {
  return this.eddsa.hash().update(this.secret()).digest();
});

cachedProperty$1(KeyPair$1, 'messagePrefix', function messagePrefix() {
  return this.hash().slice(this.eddsa.encodingLength);
});

KeyPair$1.prototype.sign = function sign(message) {
  assert$2(this._secret, 'KeyPair can only verify');
  return this.eddsa.sign(message, this);
};

KeyPair$1.prototype.verify = function verify(message, sig) {
  return this.eddsa.verify(message, sig, this);
};

KeyPair$1.prototype.getSecret = function getSecret(enc) {
  assert$2(this._secret, 'KeyPair is public only');
  return utils$2.encode(this.secret(), enc);
};

KeyPair$1.prototype.getPublic = function getPublic(enc) {
  return utils$2.encode(this.pubBytes(), enc);
};

var key = KeyPair$1;

var BN = bnExports;
var utils$1 = utils$m;
var assert$1 = utils$1.assert;
var cachedProperty = utils$1.cachedProperty;
var parseBytes$1 = utils$1.parseBytes;

/**
* @param {EDDSA} eddsa - eddsa instance
* @param {Array<Bytes>|Object} sig -
* @param {Array<Bytes>|Point} [sig.R] - R point as Point or bytes
* @param {Array<Bytes>|bn} [sig.S] - S scalar as bn or bytes
* @param {Array<Bytes>} [sig.Rencoded] - R point encoded
* @param {Array<Bytes>} [sig.Sencoded] - S scalar encoded
*/
function Signature$1(eddsa, sig) {
  this.eddsa = eddsa;

  if (typeof sig !== 'object')
    sig = parseBytes$1(sig);

  if (Array.isArray(sig)) {
    sig = {
      R: sig.slice(0, eddsa.encodingLength),
      S: sig.slice(eddsa.encodingLength),
    };
  }

  assert$1(sig.R && sig.S, 'Signature without R or S');

  if (eddsa.isPoint(sig.R))
    this._R = sig.R;
  if (sig.S instanceof BN)
    this._S = sig.S;

  this._Rencoded = Array.isArray(sig.R) ? sig.R : sig.Rencoded;
  this._Sencoded = Array.isArray(sig.S) ? sig.S : sig.Sencoded;
}

cachedProperty(Signature$1, 'S', function S() {
  return this.eddsa.decodeInt(this.Sencoded());
});

cachedProperty(Signature$1, 'R', function R() {
  return this.eddsa.decodePoint(this.Rencoded());
});

cachedProperty(Signature$1, 'Rencoded', function Rencoded() {
  return this.eddsa.encodePoint(this.R());
});

cachedProperty(Signature$1, 'Sencoded', function Sencoded() {
  return this.eddsa.encodeInt(this.S());
});

Signature$1.prototype.toBytes = function toBytes() {
  return this.Rencoded().concat(this.Sencoded());
};

Signature$1.prototype.toHex = function toHex() {
  return utils$1.encode(this.toBytes(), 'hex').toUpperCase();
};

var signature = Signature$1;

var hash = hash$2;
var curves = curves$2;
var utils = utils$m;
var assert = utils.assert;
var parseBytes = utils.parseBytes;
var KeyPair = key;
var Signature = signature;

function EDDSA(curve) {
  assert(curve === 'ed25519', 'only tested with ed25519 so far');

  if (!(this instanceof EDDSA))
    return new EDDSA(curve);

  curve = curves[curve].curve;
  this.curve = curve;
  this.g = curve.g;
  this.g.precompute(curve.n.bitLength() + 1);

  this.pointClass = curve.point().constructor;
  this.encodingLength = Math.ceil(curve.n.bitLength() / 8);
  this.hash = hash.sha512;
}

var eddsa = EDDSA;

/**
* @param {Array|String} message - message bytes
* @param {Array|String|KeyPair} secret - secret bytes or a keypair
* @returns {Signature} - signature
*/
EDDSA.prototype.sign = function sign(message, secret) {
  message = parseBytes(message);
  var key = this.keyFromSecret(secret);
  var r = this.hashInt(key.messagePrefix(), message);
  var R = this.g.mul(r);
  var Rencoded = this.encodePoint(R);
  var s_ = this.hashInt(Rencoded, key.pubBytes(), message)
    .mul(key.priv());
  var S = r.add(s_).umod(this.curve.n);
  return this.makeSignature({ R: R, S: S, Rencoded: Rencoded });
};

/**
* @param {Array} message - message bytes
* @param {Array|String|Signature} sig - sig bytes
* @param {Array|String|Point|KeyPair} pub - public key
* @returns {Boolean} - true if public key matches sig of message
*/
EDDSA.prototype.verify = function verify(message, sig, pub) {
  message = parseBytes(message);
  sig = this.makeSignature(sig);
  var key = this.keyFromPublic(pub);
  var h = this.hashInt(sig.Rencoded(), key.pubBytes(), message);
  var SG = this.g.mul(sig.S());
  var RplusAh = sig.R().add(key.pub().mul(h));
  return RplusAh.eq(SG);
};

EDDSA.prototype.hashInt = function hashInt() {
  var hash = this.hash();
  for (var i = 0; i < arguments.length; i++)
    hash.update(arguments[i]);
  return utils.intFromLE(hash.digest()).umod(this.curve.n);
};

EDDSA.prototype.keyFromPublic = function keyFromPublic(pub) {
  return KeyPair.fromPublic(this, pub);
};

EDDSA.prototype.keyFromSecret = function keyFromSecret(secret) {
  return KeyPair.fromSecret(this, secret);
};

EDDSA.prototype.makeSignature = function makeSignature(sig) {
  if (sig instanceof Signature)
    return sig;
  return new Signature(this, sig);
};

/**
* * https://tools.ietf.org/html/draft-josefsson-eddsa-ed25519-03#section-5.2
*
* EDDSA defines methods for encoding and decoding points and integers. These are
* helper convenience methods, that pass along to utility functions implied
* parameters.
*
*/
EDDSA.prototype.encodePoint = function encodePoint(point) {
  var enc = point.getY().toArray('le', this.encodingLength);
  enc[this.encodingLength - 1] |= point.getX().isOdd() ? 0x80 : 0;
  return enc;
};

EDDSA.prototype.decodePoint = function decodePoint(bytes) {
  bytes = utils.parseBytes(bytes);

  var lastIx = bytes.length - 1;
  var normed = bytes.slice(0, lastIx).concat(bytes[lastIx] & ~0x80);
  var xIsOdd = (bytes[lastIx] & 0x80) !== 0;

  var y = utils.intFromLE(normed);
  return this.curve.pointFromY(y, xIsOdd);
};

EDDSA.prototype.encodeInt = function encodeInt(num) {
  return num.toArray('le', this.encodingLength);
};

EDDSA.prototype.decodeInt = function decodeInt(bytes) {
  return utils.intFromLE(bytes);
};

EDDSA.prototype.isPoint = function isPoint(val) {
  return val instanceof this.pointClass;
};

(function (exports) {

	var elliptic = exports;

	elliptic.version = require$$0.version;
	elliptic.utils = utils$m;
	elliptic.rand = brorandExports;
	elliptic.curve = curve;
	elliptic.curves = curves$2;

	// Protocols
	elliptic.ec = ec;
	elliptic.eddsa = eddsa; 
} (elliptic$1));

var elliptic = /*@__PURE__*/getDefaultExportFromCjs(elliptic$1);

/*! typedarray-to-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

/**
 * Convert a typed array to a Buffer without a copy
 *
 * Author:   Feross Aboukhadijeh <https://feross.org>
 * License:  MIT
 *
 * `npm install typedarray-to-buffer`
 */

var typedarrayToBuffer = function typedarrayToBuffer (arr) {
  return ArrayBuffer.isView(arr)
    // To avoid a copy, use the typed array's underlying ArrayBuffer to back
    // new Buffer, respecting the "view", i.e. byteOffset and byteLength
    ? Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
    // Pass through all other types to `Buffer.from`
    : Buffer.from(arr)
};

var toBuffer = /*@__PURE__*/getDefaultExportFromCjs(typedarrayToBuffer);

var Prefix;
(function (Prefix) {
    Prefix["TZ1"] = "tz1";
    Prefix["TZ2"] = "tz2";
    Prefix["TZ3"] = "tz3";
    Prefix["TZ4"] = "tz4";
    Prefix["KT"] = "KT";
    Prefix["KT1"] = "KT1";
    Prefix["EDSK2"] = "edsk2";
    Prefix["SPSK"] = "spsk";
    Prefix["P2SK"] = "p2sk";
    Prefix["EDPK"] = "edpk";
    Prefix["SPPK"] = "sppk";
    Prefix["P2PK"] = "p2pk";
    Prefix["BLPK"] = "BLpk";
    Prefix["EDESK"] = "edesk";
    Prefix["SPESK"] = "spesk";
    Prefix["P2ESK"] = "p2esk";
    Prefix["EDSK"] = "edsk";
    Prefix["EDSIG"] = "edsig";
    Prefix["SPSIG"] = "spsig";
    Prefix["P2SIG"] = "p2sig";
    Prefix["SIG"] = "sig";
    Prefix["NET"] = "Net";
    Prefix["NCE"] = "nce";
    Prefix["B"] = "B";
    Prefix["O"] = "o";
    Prefix["LO"] = "Lo";
    Prefix["LLO"] = "LLo";
    Prefix["P"] = "P";
    Prefix["CO"] = "Co";
    Prefix["ID"] = "id";
    Prefix["EXPR"] = "expr";
    Prefix["TZ"] = "TZ";
    Prefix["VH"] = "vh";
    Prefix["SASK"] = "sask";
    Prefix["ZET1"] = "zet1";
    //rollups
    Prefix["TXR1"] = "txr1";
    Prefix["TXI"] = "txi";
    Prefix["TXM"] = "txm";
    Prefix["TXC"] = "txc";
    Prefix["TXMR"] = "txmr";
    Prefix["TXRL"] = "txM";
    Prefix["TXW"] = "txw";
})(Prefix || (Prefix = {}));
const prefix = {
    [Prefix.TZ1]: new Uint8Array([6, 161, 159]),
    [Prefix.TZ2]: new Uint8Array([6, 161, 161]),
    [Prefix.TZ3]: new Uint8Array([6, 161, 164]),
    [Prefix.TZ4]: new Uint8Array([6, 161, 166]),
    [Prefix.KT]: new Uint8Array([2, 90, 121]),
    [Prefix.KT1]: new Uint8Array([2, 90, 121]),
    [Prefix.EDSK]: new Uint8Array([43, 246, 78, 7]),
    [Prefix.EDSK2]: new Uint8Array([13, 15, 58, 7]),
    [Prefix.SPSK]: new Uint8Array([17, 162, 224, 201]),
    [Prefix.P2SK]: new Uint8Array([16, 81, 238, 189]),
    [Prefix.EDPK]: new Uint8Array([13, 15, 37, 217]),
    [Prefix.SPPK]: new Uint8Array([3, 254, 226, 86]),
    [Prefix.P2PK]: new Uint8Array([3, 178, 139, 127]),
    [Prefix.BLPK]: new Uint8Array([6, 149, 135, 204]),
    [Prefix.EDESK]: new Uint8Array([7, 90, 60, 179, 41]),
    [Prefix.SPESK]: new Uint8Array([0x09, 0xed, 0xf1, 0xae, 0x96]),
    [Prefix.P2ESK]: new Uint8Array([0x09, 0x30, 0x39, 0x73, 0xab]),
    [Prefix.EDSIG]: new Uint8Array([9, 245, 205, 134, 18]),
    [Prefix.SPSIG]: new Uint8Array([13, 115, 101, 19, 63]),
    [Prefix.P2SIG]: new Uint8Array([54, 240, 44, 52]),
    [Prefix.SIG]: new Uint8Array([4, 130, 43]),
    [Prefix.NET]: new Uint8Array([87, 82, 0]),
    [Prefix.NCE]: new Uint8Array([69, 220, 169]),
    [Prefix.B]: new Uint8Array([1, 52]),
    [Prefix.O]: new Uint8Array([5, 116]),
    [Prefix.LO]: new Uint8Array([133, 233]),
    [Prefix.LLO]: new Uint8Array([29, 159, 109]),
    [Prefix.P]: new Uint8Array([2, 170]),
    [Prefix.CO]: new Uint8Array([79, 179]),
    [Prefix.ID]: new Uint8Array([153, 103]),
    [Prefix.EXPR]: new Uint8Array([13, 44, 64, 27]),
    // Legacy prefix
    [Prefix.TZ]: new Uint8Array([2, 90, 121]),
    [Prefix.VH]: new Uint8Array([1, 106, 242]),
    [Prefix.SASK]: new Uint8Array([11, 237, 20, 92]),
    [Prefix.ZET1]: new Uint8Array([18, 71, 40, 223]),
    [Prefix.TXR1]: new Uint8Array([1, 128, 120, 31]),
    [Prefix.TXI]: new Uint8Array([79, 148, 196]),
    [Prefix.TXM]: new Uint8Array([79, 149, 30]),
    [Prefix.TXC]: new Uint8Array([79, 148, 17]),
    [Prefix.TXMR]: new Uint8Array([18, 7, 206, 87]),
    [Prefix.TXRL]: new Uint8Array([79, 146, 82]),
    [Prefix.TXW]: new Uint8Array([79, 150, 72]),
};
const prefixLength = {
    [Prefix.TZ1]: 20,
    [Prefix.TZ2]: 20,
    [Prefix.TZ3]: 20,
    [Prefix.TZ4]: 20,
    [Prefix.KT]: 20,
    [Prefix.KT1]: 20,
    [Prefix.EDPK]: 32,
    [Prefix.SPPK]: 33,
    [Prefix.P2PK]: 33,
    //working with value in comment for base58.ml line 445 but not consistent with the three above
    [Prefix.BLPK]: 48,
    [Prefix.EDSIG]: 64,
    [Prefix.SPSIG]: 64,
    [Prefix.P2SIG]: 64,
    [Prefix.SIG]: 64,
    [Prefix.NET]: 4,
    [Prefix.B]: 32,
    [Prefix.P]: 32,
    [Prefix.O]: 32,
    [Prefix.VH]: 32,
    [Prefix.SASK]: 169,
    [Prefix.ZET1]: 43,
    [Prefix.TXR1]: 20,
    [Prefix.TXI]: 32,
    [Prefix.TXM]: 32,
    [Prefix.TXC]: 32,
    [Prefix.TXMR]: 32,
    [Prefix.TXRL]: 32,
    [Prefix.TXW]: 32,
};
/**
 *  @category Error
 *  @description Error that indicates an Invalid Public Key being passed or used
 */
class InvalidPublicKeyError extends Error {
    constructor(publicKey, errorDetail) {
        super();
        this.publicKey = publicKey;
        this.name = 'InvalidPublicKeyError';
        const baseMessage = `The public key '${publicKey}' is invalid.`;
        this.message = errorDetail ? `${baseMessage} ${errorDetail}` : baseMessage;
    }
}
/**
 *  @category Error
 *  @description Error that indicates an invalid signature being passed or used
 */
class InvalidSignatureError extends Error {
    constructor(signature, errorDetail) {
        super();
        this.signature = signature;
        this.name = 'InvalidSignatureError';
        const baseMessage = `The signature '${signature}' is invalid.`;
        this.message = errorDetail ? `${baseMessage} ${errorDetail}` : baseMessage;
    }
}
/**
 *  @category Error
 *  @description Error that indicates an invalid message being passed or used
 */
class InvalidMessageError extends Error {
    constructor(msg, errorDetail) {
        super();
        this.msg = msg;
        this.errorDetail = errorDetail;
        this.name = 'InvalidMessageError';
        const baseMessage = `The message '${msg}' is invalid.`;
        this.message = errorDetail ? `${baseMessage} ${errorDetail}` : baseMessage;
    }
}
/**
 *  @category Error
 *  @description General error that indicates a failure when trying to convert data from one type to another
 */
class ValueConversionError extends Error {
    constructor(value, desiredType) {
        super(`Unable to convert ${value} to a ${desiredType}`);
        this.value = value;
        this.desiredType = desiredType;
        this.name = 'ValueConversionError';
    }
}

/**
 * @description Verify signature of a payload
 *
 * @param messageBytes The forged message including the magic byte (11 for block,
 *        12 for preendorsement, 13 for endorsement, 3 for generic, 5 for the PACK format of michelson)
 * @param publicKey The public key to verify the signature against
 * @param signature The signature to verify
 * @returns A boolean indicating if the signature matches
 *
 * @example
 * ```
 * const message = '03d0c10e3ed11d7c6e3357f6ef335bab9e8f2bd54d0ce20c482e241191a6e4b8ce6c01be917311d9ac46959750e405d57e268e2ed9e174a80794fbd504e12a4a000141eb3781afed2f69679ff2bbe1c5375950b0e40d00ff000000005e05050505050507070100000024747a32526773486e74516b72794670707352466261313652546656503539684b72654a4d07070100000024747a315a6672455263414c42776d4171776f6e525859565142445439426a4e6a42484a750001';
 * const pk = 'sppk7c7hkPj47yjYFEHX85q46sFJGw6RBrqoVSHwAJAT4e14KJwzoey';
 * const sig = 'spsig1cdLkp1RLgUHAp13aRFkZ6MQDPp7xCnjAExGL3MBSdMDmT6JgQSX8cufyDgJRM3sinFtiCzLbsyP6d365EHoNevxhT47nx'
 *
 * const response = verifySignature(message, pk, sig);
 * ```
 *
 */
function verifySignature$1(messageBytes, publicKey, signature) {
    const pkPrefix = validatePkAndExtractPrefix(publicKey);
    const sigPrefix = validateSigAndExtractPrefix(signature);
    const decodedPublicKey = b58cdecode(publicKey, prefix[pkPrefix]);
    const decodedSig = b58cdecode(signature, prefix[sigPrefix]);
    const bytesHash = blake2b$1.hash(hex2buf(validateMessageNotEmpty(messageBytes)), 32);
    if (pkPrefix === Prefix.EDPK) {
        return verifyEdSignature(decodedSig, bytesHash, decodedPublicKey);
    }
    else if (pkPrefix === Prefix.SPPK) {
        return verifySpSignature(decodedSig, bytesHash, decodedPublicKey);
    }
    else if (pkPrefix === Prefix.P2PK) {
        return verifyP2Signature(decodedSig, bytesHash, decodedPublicKey);
    }
    else {
        return false;
    }
}
function validateMessageNotEmpty(message) {
    if (message === '') {
        throw new InvalidMessageError(message, 'The message provided for verifying signature cannot be empty.');
    }
    return message;
}
function validatePkAndExtractPrefix(publicKey) {
    if (publicKey === '') {
        throw new InvalidPublicKeyError(publicKey, 'Public key cannot be empty');
    }
    const pkPrefix = publicKey.substring(0, 4);
    const validation = validatePublicKey(publicKey);
    if (validation !== ValidationResult.VALID) {
        if (validation === ValidationResult.INVALID_CHECKSUM) {
            throw new InvalidPublicKeyError(publicKey, 'The public key provided has an invalid checksum');
        }
        else if (validation === ValidationResult.INVALID_LENGTH) {
            throw new InvalidPublicKeyError(publicKey, 'The public key provided has an invalid length');
        }
        else if (validation === ValidationResult.NO_PREFIX_MATCHED) {
            throw new InvalidPublicKeyError(publicKey, `The public key provided has an unsupported prefix: ${pkPrefix}`);
        }
    }
    return pkPrefix;
}
function validateSigAndExtractPrefix(signature) {
    const signaturePrefix = signature.startsWith('sig')
        ? signature.substr(0, 3)
        : signature.substr(0, 5);
    const validation = validateSignature(signature);
    if (validation !== ValidationResult.VALID) {
        if (validation === ValidationResult.INVALID_CHECKSUM) {
            throw new InvalidSignatureError(signature, `invalid checksum`);
        }
        else if (validation === ValidationResult.INVALID_LENGTH) {
            throw new InvalidSignatureError(signature, 'invalid length');
        }
        else if (validation === ValidationResult.NO_PREFIX_MATCHED) {
            throw new InvalidSignatureError(signaturePrefix, 'unsupported prefix');
        }
    }
    return signaturePrefix;
}
function verifyEdSignature(decodedSig, bytesHash, decodedPublicKey) {
    try {
        return ed25519.verify(decodedPublicKey, bytesHash, decodedSig);
    }
    catch (e) {
        return false;
    }
}
function verifySpSignature(decodedSig, bytesHash, decodedPublicKey) {
    const key = new elliptic.ec('secp256k1').keyFromPublic(decodedPublicKey);
    return verifySpOrP2Sig(decodedSig, bytesHash, key);
}
function verifyP2Signature(decodedSig, bytesHash, decodedPublicKey) {
    const key = new elliptic.ec('p256').keyFromPublic(decodedPublicKey);
    return verifySpOrP2Sig(decodedSig, bytesHash, key);
}
function verifySpOrP2Sig(decodedSig, bytesHash, key) {
    const hexSig = buf2hex(toBuffer(decodedSig));
    const match = hexSig.match(/([a-f\d]{64})/gi);
    if (match) {
        try {
            const [r, s] = match;
            return key.verify(bytesHash, { r, s });
        }
        catch (e) {
            return false;
        }
    }
    return false;
}

var ValidationResult;
(function (ValidationResult) {
    ValidationResult[ValidationResult["NO_PREFIX_MATCHED"] = 0] = "NO_PREFIX_MATCHED";
    ValidationResult[ValidationResult["INVALID_CHECKSUM"] = 1] = "INVALID_CHECKSUM";
    ValidationResult[ValidationResult["INVALID_LENGTH"] = 2] = "INVALID_LENGTH";
    ValidationResult[ValidationResult["VALID"] = 3] = "VALID";
})(ValidationResult || (ValidationResult = {}));
function isValidPrefix(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return value in prefix;
}
/**
 * @description This function is called by the validation functions ([[validateAddress]], [[validateChain]], [[validateContractAddress]], [[validateKeyHash]], [[validateSignature]], [[validatePublicKey]]).
 * Verify if the value has the right prefix or return `NO_PREFIX_MATCHED`,
 * decode the value using base58 and return `INVALID_CHECKSUM` if it fails,
 * check if the length of the value matches the prefix type or return `INVALID_LENGTH`.
 * If all checks pass, return `VALID`.
 *
 * @param value Value to validate
 * @param prefixes prefix the value should have
 */
function validatePrefixedValue(value, prefixes) {
    const match = new RegExp(`^(${prefixes.join('|')})`).exec(value);
    if (!match || match.length === 0) {
        return ValidationResult.NO_PREFIX_MATCHED;
    }
    const prefixKey = match[0];
    if (!isValidPrefix(prefixKey)) {
        return ValidationResult.NO_PREFIX_MATCHED;
    }
    // Remove annotation from contract address before doing the validation
    const contractAddress = /^(KT1\w{33})(%(.*))?/.exec(value);
    if (contractAddress) {
        value = contractAddress[1];
    }
    // decodeUnsafe return undefined if decoding fail
    let decoded = bs58check$1.decodeUnsafe(value);
    if (!decoded) {
        return ValidationResult.INVALID_CHECKSUM;
    }
    decoded = decoded.slice(prefix[prefixKey].length);
    if (decoded.length !== prefixLength[prefixKey]) {
        return ValidationResult.INVALID_LENGTH;
    }
    return ValidationResult.VALID;
}
const implicitPrefix = [Prefix.TZ1, Prefix.TZ2, Prefix.TZ3, Prefix.TZ4];
const contractPrefix = [Prefix.KT1, Prefix.TXR1];
const signaturePrefix = [Prefix.EDSIG, Prefix.P2SIG, Prefix.SPSIG, Prefix.SIG];
const pkPrefix = [Prefix.EDPK, Prefix.SPPK, Prefix.P2PK, Prefix.BLPK];
[Prefix.O];
[Prefix.P];
[Prefix.B];
/**
 * @description Used to check if an address or a contract address is valid.
 *
 * @returns
 * 0 (NO_PREFIX_MATCHED), 1 (INVALID_CHECKSUM), 2 (INVALID_LENGTH) or 3 (VALID).
 *
 * @example
 * ```
 * import { validateAddress } from '@taquito/utils';
 * const pkh = 'tz1L9r8mWmRPndRhuvMCWESLGSVeFzQ9NAWx'
 * const validation = validateAddress(pkh)
 * console.log(validation)
 * // This example return 3 which correspond to VALID
 * ```
 */
function validateAddress(value) {
    return validatePrefixedValue(value, [...implicitPrefix, ...contractPrefix]);
}
/**
 * @description Used to check if a signature is valid.
 *
 * @returns
 * 0 (NO_PREFIX_MATCHED), 1 (INVALID_CHECKSUM), 2 (INVALID_LENGTH) or 3 (VALID).
 *
 * @example
 * ```
 * import { validateSignature } from '@taquito/utils';
 * const signature = 'edsigtkpiSSschcaCt9pUVrpNPf7TTcgvgDEDD6NCEHMy8NNQJCGnMfLZzYoQj74yLjo9wx6MPVV29CvVzgi7qEcEUok3k7AuMg'
 * const validation = validateSignature(signature)
 * console.log(validation)
 * // This example return 3 which correspond to VALID
 * ```
 */
function validateSignature(value) {
    return validatePrefixedValue(value, signaturePrefix);
}
/**
 * @description Used to check if a public key is valid.
 *
 * @returns
 * 0 (NO_PREFIX_MATCHED), 1 (INVALID_CHECKSUM), 2 (INVALID_LENGTH) or 3 (VALID).
 *
 * @example
 * ```
 * import { validatePublicKey } from '@taquito/utils';
 * const publicKey = 'edpkvS5QFv7KRGfa3b87gg9DBpxSm3NpSwnjhUjNBQrRUUR66F7C9g'
 * const validation = validatePublicKey(publicKey)
 * console.log(validation)
 * // This example return 3 which correspond to VALID
 * ```
 */
function validatePublicKey(value) {
    return validatePrefixedValue(value, pkPrefix);
}
/**
 *
 * @description Base58 decode a string and remove the prefix from it
 *
 * @param value Value to base58 decode
 * @param prefix prefix to remove from the decoded string
 */
const b58cdecode = (enc, prefixArg) => bs58check$1.decode(enc).slice(prefixArg.length);
/**
 *
 * @description Convert an hex string to a Uint8Array
 *
 * @param hex Hex string to convert
 */
const hex2buf = (hex) => {
    const match = hex.match(/[\da-f]{2}/gi);
    if (match) {
        return new Uint8Array(match.map((h) => parseInt(h, 16)));
    }
    else {
        throw new ValueConversionError(hex, 'Uint8Array');
    }
};
/**
 *
 * @description Convert a buffer to an hex string
 *
 * @param buffer Buffer to convert
 */
const buf2hex = (buffer) => {
    const byteArray = new Uint8Array(buffer);
    const hexParts = [];
    byteArray.forEach((byte) => {
        const hex = byte.toString(16);
        const paddedHex = `00${hex}`.slice(-2);
        hexParts.push(paddedHex);
    });
    return hexParts.join('');
};
/**
 *
 * @description Convert a string to bytes
 *
 * @param str String to convert
 */
function char2Bytes(str) {
    return Buffer$2.from(str, 'utf8').toString('hex');
}
/**
 *
 * @description Convert bytes to a string
 *
 * @param str Bytes to convert
 */
function bytes2Char(hex) {
    return Buffer$2.from(hex2buf(hex)).toString('utf8');
}

/**
 * A special placeholder value used to specify "gaps" within curried functions,
 * allowing partial application of any combination of arguments, regardless of
 * their positions.
 *
 * If `g` is a curried ternary function and `_` is `R.__`, the following are
 * equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2, _)(1, 3)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @name __
 * @constant
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @example
 *
 *      const greet = R.replace('{name}', R.__, 'Hello, {name}!');
 *      greet('Alice'); //=> 'Hello, Alice!'
 */
var __ = {
  '@@functional/placeholder': true
};

function _isPlaceholder(a) {
  return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;

      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });

      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}

/**
 * Private `concat` function to merge two array-like objects.
 *
 * @private
 * @param {Array|Arguments} [set1=[]] An array-like object.
 * @param {Array|Arguments} [set2=[]] An array-like object.
 * @return {Array} A new, merged array.
 * @example
 *
 *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 */
function _concat(set1, set2) {
  set1 = set1 || [];
  set2 = set2 || [];
  var idx;
  var len1 = set1.length;
  var len2 = set2.length;
  var result = [];
  idx = 0;

  while (idx < len1) {
    result[result.length] = set1[idx];
    idx += 1;
  }

  idx = 0;

  while (idx < len2) {
    result[result.length] = set2[idx];
    idx += 1;
  }

  return result;
}

function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };

    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };

    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };

    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };

    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };

    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };

    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };

    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };

    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };

    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };

    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };

    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}

/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;

    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;

      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }

      combined[combinedIdx] = result;

      if (!_isPlaceholder(result)) {
        left -= 1;
      }

      combinedIdx += 1;
    }

    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
  };
}

/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      const sumArgs = (...args) => R.sum(args);
 *
 *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */

var curryN =
/*#__PURE__*/
_curry2(function curryN(length, fn) {
  if (length === 1) {
    return _curry1(fn);
  }

  return _arity(length, _curryN(length, [], fn));
});

/**
 * Creates a new list iteration function from an existing one by adding two new
 * parameters to its callback function: the current index, and the entire list.
 *
 * This would turn, for instance, [`R.map`](#map) function into one that
 * more closely resembles `Array.prototype.map`. Note that this will only work
 * for functions in which the iteration callback function is the first
 * parameter, and where the list is the last parameter. (This latter might be
 * unimportant if the list parameter is not used.)
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Function
 * @category List
 * @sig (((a ...) -> b) ... -> [a] -> *) -> (((a ..., Int, [a]) -> b) ... -> [a] -> *)
 * @param {Function} fn A list iteration function that does not pass index or list to its callback
 * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
 * @example
 *
 *      const mapIndexed = R.addIndex(R.map);
 *      mapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
 *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
 */

var addIndex =
/*#__PURE__*/
_curry1(function addIndex(fn) {
  return curryN(fn.length, function () {
    var idx = 0;
    var origFn = arguments[0];
    var list = arguments[arguments.length - 1];
    var args = Array.prototype.slice.call(arguments, 0);

    args[0] = function () {
      var result = origFn.apply(this, _concat(arguments, [idx, list]));
      idx += 1;
      return result;
    };

    return fn.apply(this, args);
  });
});

/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;

      case 1:
        return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        });

      case 2:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _curry1(function (_c) {
          return fn(a, b, _c);
        });

      default:
        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
          return fn(_a, _b, c);
        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b, c);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b, c);
        }) : _isPlaceholder(c) ? _curry1(function (_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}

/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
var _isArray = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

function _isTransformer(obj) {
  return obj != null && typeof obj['@@transducer/step'] === 'function';
}

/**
 * Returns a function that dispatches with different strategies based on the
 * object in list position (last argument). If it is an array, executes [fn].
 * Otherwise, if it has a function with one of the given method names, it will
 * execute that function (functor case). Otherwise, if it is a transformer,
 * uses transducer created by [transducerCreator] to return a new transformer
 * (transducer case).
 * Otherwise, it will default to executing [fn].
 *
 * @private
 * @param {Array} methodNames properties to check for a custom implementation
 * @param {Function} transducerCreator transducer factory if object is transformer
 * @param {Function} fn default ramda implementation
 * @return {Function} A function that dispatches on object in list position
 */

function _dispatchable(methodNames, transducerCreator, fn) {
  return function () {
    if (arguments.length === 0) {
      return fn();
    }

    var obj = arguments[arguments.length - 1];

    if (!_isArray(obj)) {
      var idx = 0;

      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
        }

        idx += 1;
      }

      if (_isTransformer(obj)) {
        var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
        return transducer(obj);
      }
    }

    return fn.apply(this, arguments);
  };
}

var _xfBase = {
  init: function () {
    return this.xf['@@transducer/init']();
  },
  result: function (result) {
    return this.xf['@@transducer/result'](result);
  }
};

function _map(fn, functor) {
  var idx = 0;
  var len = functor.length;
  var result = Array(len);

  while (idx < len) {
    result[idx] = fn(functor[idx]);
    idx += 1;
  }

  return result;
}

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

/**
 * Tests whether or not an object is similar to an array.
 *
 * @private
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      _isArrayLike([]); //=> true
 *      _isArrayLike(true); //=> false
 *      _isArrayLike({}); //=> false
 *      _isArrayLike({length: 10}); //=> false
 *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 *      _isArrayLike({nodeType: 1, length: 1}) // => false
 */

var _isArrayLike =
/*#__PURE__*/
_curry1(function isArrayLike(x) {
  if (_isArray(x)) {
    return true;
  }

  if (!x) {
    return false;
  }

  if (typeof x !== 'object') {
    return false;
  }

  if (_isString(x)) {
    return false;
  }

  if (x.length === 0) {
    return true;
  }

  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }

  return false;
});

var XWrap =
/*#__PURE__*/
function () {
  function XWrap(fn) {
    this.f = fn;
  }

  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };

  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };

  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };

  return XWrap;
}();

function _xwrap(fn) {
  return new XWrap(fn);
}

/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 * @see R.partial
 * @example
 *
 *      const log = R.bind(console.log, console);
 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
 *      // logs {a: 2}
 * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
 */

var bind =
/*#__PURE__*/
_curry2(function bind(fn, thisObj) {
  return _arity(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
});

function _arrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    acc = xf['@@transducer/step'](acc, list[idx]);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    idx += 1;
  }

  return xf['@@transducer/result'](acc);
}

function _iterableReduce(xf, acc, iter) {
  var step = iter.next();

  while (!step.done) {
    acc = xf['@@transducer/step'](acc, step.value);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    step = iter.next();
  }

  return xf['@@transducer/result'](acc);
}

function _methodReduce(xf, acc, obj, methodName) {
  return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
}

var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
function _reduce(fn, acc, list) {
  if (typeof fn === 'function') {
    fn = _xwrap(fn);
  }

  if (_isArrayLike(list)) {
    return _arrayReduce(fn, acc, list);
  }

  if (typeof list['fantasy-land/reduce'] === 'function') {
    return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
  }

  if (list[symIterator] != null) {
    return _iterableReduce(fn, acc, list[symIterator]());
  }

  if (typeof list.next === 'function') {
    return _iterableReduce(fn, acc, list);
  }

  if (typeof list.reduce === 'function') {
    return _methodReduce(fn, acc, list, 'reduce');
  }

  throw new TypeError('reduce: list must be array or iterable');
}

var XMap =
/*#__PURE__*/
function () {
  function XMap(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XMap.prototype['@@transducer/init'] = _xfBase.init;
  XMap.prototype['@@transducer/result'] = _xfBase.result;

  XMap.prototype['@@transducer/step'] = function (result, input) {
    return this.xf['@@transducer/step'](result, this.f(input));
  };

  return XMap;
}();

var _xmap =
/*#__PURE__*/
_curry2(function _xmap(f, xf) {
  return new XMap(f, xf);
});

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var toString$1 = Object.prototype.toString;

var _isArguments =
/*#__PURE__*/
function () {
  return toString$1.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString$1.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return _has('callee', x);
  };
}();

var hasEnumBug = !
/*#__PURE__*/
{
  toString: null
}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

var hasArgsEnumBug =
/*#__PURE__*/
function () {

  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;

  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }

    idx += 1;
  }

  return false;
};
/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values, R.toPairs
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */


var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
/*#__PURE__*/
_curry1(function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
}) :
/*#__PURE__*/
_curry1(function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }

  var prop, nIdx;
  var ks = [];

  var checkArgsLength = hasArgsEnumBug && _isArguments(obj);

  for (prop in obj) {
    if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }

  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;

    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];

      if (_has(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }

      nIdx -= 1;
    }
  }

  return ks;
});

/**
 * Takes a function and
 * a [functor](https://github.com/fantasyland/fantasy-land#functor),
 * applies the function to each of the functor's values, and returns
 * a functor of the same shape.
 *
 * Ramda provides suitable `map` implementations for `Array` and `Object`,
 * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
 *
 * Dispatches to the `map` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * Also treats functions as functors and will compose them together.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => (a -> b) -> f a -> f b
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {Array} list The list to be iterated over.
 * @return {Array} The new list.
 * @see R.transduce, R.addIndex, R.pluck, R.project
 * @example
 *
 *      const double = x => x * 2;
 *
 *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
 *
 *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
 * @symb R.map(f, [a, b]) = [f(a), f(b)]
 * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
 * @symb R.map(f, functor_o) = functor_o.map(f)
 */

var map =
/*#__PURE__*/
_curry2(
/*#__PURE__*/
_dispatchable(['fantasy-land/map', 'map'], _xmap, function map(fn, functor) {
  switch (Object.prototype.toString.call(functor)) {
    case '[object Function]':
      return curryN(functor.length, function () {
        return fn.call(this, functor.apply(this, arguments));
      });

    case '[object Object]':
      return _reduce(function (acc, key) {
        acc[key] = fn(functor[key]);
        return acc;
      }, {}, keys(functor));

    default:
      return _map(fn, functor);
  }
}));

/**
 * Determine if the passed argument is an integer.
 *
 * @private
 * @param {*} n
 * @category Type
 * @return {Boolean}
 */
var _isInteger = Number.isInteger || function _isInteger(n) {
  return n << 0 === n;
};

/**
 * Returns the nth element of the given list or string. If n is negative the
 * element at index length + n is returned.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> a | Undefined
 * @sig Number -> String -> String
 * @param {Number} offset
 * @param {*} list
 * @return {*}
 * @example
 *
 *      const list = ['foo', 'bar', 'baz', 'quux'];
 *      R.nth(1, list); //=> 'bar'
 *      R.nth(-1, list); //=> 'quux'
 *      R.nth(-99, list); //=> undefined
 *
 *      R.nth(2, 'abc'); //=> 'c'
 *      R.nth(3, 'abc'); //=> ''
 * @symb R.nth(-1, [a, b, c]) = c
 * @symb R.nth(0, [a, b, c]) = a
 * @symb R.nth(1, [a, b, c]) = b
 */

var nth =
/*#__PURE__*/
_curry2(function nth(offset, list) {
  var idx = offset < 0 ? list.length + offset : offset;
  return _isString(list) ? list.charAt(idx) : list[idx];
});

/**
 * Returns a function that when supplied an object returns the indicated
 * property of that object, if it exists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @typedefn Idx = String | Int | Symbol
 * @sig Idx -> {s: a} -> a | Undefined
 * @param {String|Number} p The property name or array index
 * @param {Object} obj The object to query
 * @return {*} The value at `obj.p`.
 * @see R.path, R.props, R.pluck, R.project, R.nth
 * @example
 *
 *      R.prop('x', {x: 100}); //=> 100
 *      R.prop('x', {}); //=> undefined
 *      R.prop(0, [100]); //=> 100
 *      R.compose(R.inc, R.prop('x'))({ x: 3 }) //=> 4
 */

var prop =
/*#__PURE__*/
_curry2(function prop(p, obj) {
  if (obj == null) {
    return;
  }

  return _isInteger(p) ? nth(p, obj) : obj[p];
});

var prop$1 = prop;

/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It may use
 * [`R.reduced`](#reduced) to shortcut the iteration.
 *
 * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
 * is *(value, acc)*.
 *
 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduce` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
 *
 * Dispatches to the `reduce` method of the third argument, if present. When
 * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
 * shortcuting, as this is not implemented by `reduce`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduced, R.addIndex, R.reduceRight
 * @example
 *
 *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
 *      //          -               -10
 *      //         / \              / \
 *      //        -   4           -6   4
 *      //       / \              / \
 *      //      -   3   ==>     -3   3
 *      //     / \              / \
 *      //    -   2           -1   2
 *      //   / \              / \
 *      //  0   1            0   1
 *
 * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
 */

var reduce =
/*#__PURE__*/
_curry3(_reduce);

var reduce$1 = reduce;

/**
 * Returns a new list containing the contents of the given list, followed by
 * the given element.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} el The element to add to the end of the new list.
 * @param {Array} list The list of elements to add a new item to.
 *        list.
 * @return {Array} A new list containing the elements of the old list followed by `el`.
 * @see R.prepend
 * @example
 *
 *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
 *      R.append('tests', []); //=> ['tests']
 *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
 */

var append =
/*#__PURE__*/
_curry2(function append(el, list) {
  return _concat(list, [el]);
});

/**
 * Returns a list of all the enumerable own properties of the supplied object.
 * Note that the order of the output array is not guaranteed across different
 * JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [v]
 * @param {Object} obj The object to extract values from
 * @return {Array} An array of the values of the object's own properties.
 * @see R.valuesIn, R.keys, R.toPairs
 * @example
 *
 *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
 */

var values =
/*#__PURE__*/
_curry1(function values(obj) {
  var props = keys(obj);
  var len = props.length;
  var vals = [];
  var idx = 0;

  while (idx < len) {
    vals[idx] = obj[props[idx]];
    idx += 1;
  }

  return vals;
});

/**
 * Makes a shallow clone of an object, setting or overriding the specified
 * property with the given value. Note that this copies and flattens prototype
 * properties onto the new object as well. All non-primitive properties are
 * copied by reference.
 *
 * @private
 * @param {String|Number} prop The property name to set
 * @param {*} val The new value
 * @param {Object|Array} obj The object to clone
 * @return {Object|Array} A new object equivalent to the original except for the changed property.
 */

function _assoc(prop, val, obj) {
  if (_isInteger(prop) && _isArray(obj)) {
    var arr = [].concat(obj);
    arr[prop] = val;
    return arr;
  }

  var result = {};

  for (var p in obj) {
    result[p] = obj[p];
  }

  result[prop] = val;
  return result;
}

/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Type
 * @sig * -> Boolean
 * @param {*} x The value to test.
 * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
 * @example
 *
 *      R.isNil(null); //=> true
 *      R.isNil(undefined); //=> true
 *      R.isNil(0); //=> false
 *      R.isNil([]); //=> false
 */

var isNil =
/*#__PURE__*/
_curry1(function isNil(x) {
  return x == null;
});

/**
 * Makes a shallow clone of an object, setting or overriding the nodes required
 * to create the given path, and placing the specific value at the tail end of
 * that path. Note that this copies and flattens prototype properties onto the
 * new object as well. All non-primitive properties are copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Idx = String | Int | Symbol
 * @sig [Idx] -> a -> {a} -> {a}
 * @param {Array} path the path to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except along the specified path.
 * @see R.dissocPath
 * @example
 *
 *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
 *
 *      // Any missing or non-object keys in path will be overridden
 *      R.assocPath(['a', 'b', 'c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
 */

var assocPath =
/*#__PURE__*/
_curry3(function assocPath(path, val, obj) {
  if (path.length === 0) {
    return val;
  }

  var idx = path[0];

  if (path.length > 1) {
    var nextObj = !isNil(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
    val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj);
  }

  return _assoc(idx, val, obj);
});

/**
 * Makes a shallow clone of an object, setting or overriding the specified
 * property with the given value. Note that this copies and flattens prototype
 * properties onto the new object as well. All non-primitive properties are
 * copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig Idx -> a -> {k: v} -> {k: v}
 * @param {String|Number} prop The property name to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except for the changed property.
 * @see R.dissoc, R.pick
 * @example
 *
 *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
 */

var assoc =
/*#__PURE__*/
_curry3(function assoc(prop, val, obj) {
  return assocPath([prop], val, obj);
});

function _isFunction(x) {
  var type = Object.prototype.toString.call(x);
  return type === '[object Function]' || type === '[object AsyncFunction]' || type === '[object GeneratorFunction]' || type === '[object AsyncGeneratorFunction]';
}

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */

var type =
/*#__PURE__*/
_curry1(function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});

function _pipe(f, g) {
  return function () {
    return g.call(this, f.apply(this, arguments));
  };
}

/**
 * This checks whether a function has a [methodname] function. If it isn't an
 * array it will execute that function otherwise it will default to the ramda
 * implementation.
 *
 * @private
 * @param {Function} fn ramda implementation
 * @param {String} methodname property to check for a custom implementation
 * @return {Object} Whatever the return value of the method is.
 */

function _checkForMethod(methodname, fn) {
  return function () {
    var length = arguments.length;

    if (length === 0) {
      return fn();
    }

    var obj = arguments[length - 1];
    return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
  };
}

/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * Dispatches to the `slice` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */

var slice =
/*#__PURE__*/
_curry3(
/*#__PURE__*/
_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
  return Array.prototype.slice.call(list, fromIndex, toIndex);
}));

var slice$1 = slice;

/**
 * Returns all but the first element of the given list or string (or object
 * with a `tail` method).
 *
 * Dispatches to the `slice` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.head, R.init, R.last
 * @example
 *
 *      R.tail([1, 2, 3]);  //=> [2, 3]
 *      R.tail([1, 2]);     //=> [2]
 *      R.tail([1]);        //=> []
 *      R.tail([]);         //=> []
 *
 *      R.tail('abc');  //=> 'bc'
 *      R.tail('ab');   //=> 'b'
 *      R.tail('a');    //=> ''
 *      R.tail('');     //=> ''
 */

var tail =
/*#__PURE__*/
_curry1(
/*#__PURE__*/
_checkForMethod('tail',
/*#__PURE__*/
slice$1(1, Infinity)));

var tail$1 = tail;

/**
 * Performs left-to-right function composition. The first argument may have
 * any arity; the remaining arguments must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.compose
 * @example
 *
 *      const f = R.pipe(Math.pow, R.negate, R.inc);
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
 * @symb R.pipe(f, g, h)(a)(b) = h(g(f(a)))(b)
 */

function pipe() {
  if (arguments.length === 0) {
    throw new Error('pipe requires at least one argument');
  }

  return _arity(arguments[0].length, reduce$1(_pipe, arguments[0], tail$1(arguments)));
}

function _arrayFromIterator(iter) {
  var list = [];
  var next;

  while (!(next = iter.next()).done) {
    list.push(next.value);
  }

  return list;
}

function _includesWith(pred, x, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }

    idx += 1;
  }

  return false;
}

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}

// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function _objectIs(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
}

var _objectIs$1 = typeof Object.is === 'function' ? Object.is : _objectIs;

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparison of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */

function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = _arrayFromIterator(aIterator);

  var b = _arrayFromIterator(bIterator);

  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  } // if *a* array contains any element that is not included in *b*


  return !_includesWith(function (b, aItem) {
    return !_includesWith(eq, aItem, b);
  }, b, a);
}

function _equals(a, b, stackA, stackB) {
  if (_objectIs$1(a, b)) {
    return true;
  }

  var typeA = type(a);

  if (typeA !== type(b)) {
    return false;
  }

  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
        return a === b;
      }

      break;

    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && _objectIs$1(a.valueOf(), b.valueOf()))) {
        return false;
      }

      break;

    case 'Date':
      if (!_objectIs$1(a.valueOf(), b.valueOf())) {
        return false;
      }

      break;

    case 'Error':
      return a.name === b.name && a.message === b.message;

    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }

      break;
  }

  var idx = stackA.length - 1;

  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }

    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));

    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));

    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;

    default:
      // Values of other types are only equal if identical.
      return false;
  }

  var keysA = keys(a);

  if (keysA.length !== keys(b).length) {
    return false;
  }

  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);
  idx = keysA.length - 1;

  while (idx >= 0) {
    var key = keysA[idx];

    if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }

    idx -= 1;
  }

  return true;
}

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      const a = {}; a.v = a;
 *      const b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */

var equals =
/*#__PURE__*/
_curry2(function equals(a, b) {
  return _equals(a, b, [], []);
});

function _indexOf(list, a, idx) {
  var inf, item; // Array.prototype.indexOf doesn't exist below IE9

  if (typeof list.indexOf === 'function') {
    switch (typeof a) {
      case 'number':
        if (a === 0) {
          // manually crawl the list to distinguish between +0 and -0
          inf = 1 / a;

          while (idx < list.length) {
            item = list[idx];

            if (item === 0 && 1 / item === inf) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } else if (a !== a) {
          // NaN
          while (idx < list.length) {
            item = list[idx];

            if (typeof item === 'number' && item !== item) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } // non-zero numbers can utilise Set


        return list.indexOf(a, idx);
      // all these types can utilise Set

      case 'string':
      case 'boolean':
      case 'function':
      case 'undefined':
        return list.indexOf(a, idx);

      case 'object':
        if (a === null) {
          // null can utilise Set
          return list.indexOf(a, idx);
        }

    }
  } // anything else not covered above, defer to R.equals


  while (idx < list.length) {
    if (equals(list[idx], a)) {
      return idx;
    }

    idx += 1;
  }

  return -1;
}

function _includes(a, list) {
  return _indexOf(list, a, 0) >= 0;
}

function _quote(s) {
  var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b') // \b matches word boundary; [\b] matches backspace
  .replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
  return '"' + escaped.replace(/"/g, '\\"') + '"';
}

/**
 * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
 */
var pad = function pad(n) {
  return (n < 10 ? '0' : '') + n;
};

var _toISOString = typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
  return d.toISOString();
} : function _toISOString(d) {
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
};

function _complement(f) {
  return function () {
    return !f.apply(this, arguments);
  };
}

function _filter(fn, list) {
  var idx = 0;
  var len = list.length;
  var result = [];

  while (idx < len) {
    if (fn(list[idx])) {
      result[result.length] = list[idx];
    }

    idx += 1;
  }

  return result;
}

function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}

var XFilter =
/*#__PURE__*/
function () {
  function XFilter(f, xf) {
    this.xf = xf;
    this.f = f;
  }

  XFilter.prototype['@@transducer/init'] = _xfBase.init;
  XFilter.prototype['@@transducer/result'] = _xfBase.result;

  XFilter.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
  };

  return XFilter;
}();

var _xfilter =
/*#__PURE__*/
_curry2(function _xfilter(f, xf) {
  return new XFilter(f, xf);
});

/**
 * Takes a predicate and a `Filterable`, and returns a new filterable of the
 * same type containing the members of the given filterable which satisfy the
 * given predicate. Filterable objects include plain objects or any object
 * that has a filter method such as `Array`.
 *
 * Dispatches to the `filter` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array} Filterable
 * @see R.reject, R.transduce, R.addIndex
 * @example
 *
 *      const isEven = n => n % 2 === 0;
 *
 *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */

var filter =
/*#__PURE__*/
_curry2(
/*#__PURE__*/
_dispatchable(['fantasy-land/filter', 'filter'], _xfilter, function (pred, filterable) {
  return _isObject(filterable) ? _reduce(function (acc, key) {
    if (pred(filterable[key])) {
      acc[key] = filterable[key];
    }

    return acc;
  }, {}, keys(filterable)) : // else
  _filter(pred, filterable);
}));

/**
 * The complement of [`filter`](#filter).
 *
 * Acts as a transducer if a transformer is given in list position. Filterable
 * objects include plain objects or any object that has a filter method such
 * as `Array`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array}
 * @see R.filter, R.transduce, R.addIndex
 * @example
 *
 *      const isOdd = (n) => n % 2 !== 0;
 *
 *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */

var reject =
/*#__PURE__*/
_curry2(function reject(pred, filterable) {
  return filter(_complement(pred), filterable);
});

function _toString(x, seen) {
  var recur = function recur(y) {
    var xs = seen.concat([x]);
    return _includes(y, xs) ? '<Circular>' : _toString(y, xs);
  }; //  mapPairs :: (Object, [String]) -> [String]


  var mapPairs = function (obj, keys) {
    return _map(function (k) {
      return _quote(k) + ': ' + recur(obj[k]);
    }, keys.slice().sort());
  };

  switch (Object.prototype.toString.call(x)) {
    case '[object Arguments]':
      return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';

    case '[object Array]':
      return '[' + _map(recur, x).concat(mapPairs(x, reject(function (k) {
        return /^\d+$/.test(k);
      }, keys(x)))).join(', ') + ']';

    case '[object Boolean]':
      return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();

    case '[object Date]':
      return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';

    case '[object Null]':
      return 'null';

    case '[object Number]':
      return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);

    case '[object String]':
      return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);

    case '[object Undefined]':
      return 'undefined';

    default:
      if (typeof x.toString === 'function') {
        var repr = x.toString();

        if (repr !== '[object Object]') {
          return repr;
        }
      }

      return '{' + mapPairs(x, keys(x)).join(', ') + '}';
  }
}

/**
 * Returns the string representation of the given value. `eval`'ing the output
 * should result in a value equivalent to the input value. Many of the built-in
 * `toString` methods do not satisfy this requirement.
 *
 * If the given value is an `[object Object]` with a `toString` method other
 * than `Object.prototype.toString`, this method is invoked with no arguments
 * to produce the return value. This means user-defined constructor functions
 * can provide a suitable `toString` method. For example:
 *
 *     function Point(x, y) {
 *       this.x = x;
 *       this.y = y;
 *     }
 *
 *     Point.prototype.toString = function() {
 *       return 'new Point(' + this.x + ', ' + this.y + ')';
 *     };
 *
 *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category String
 * @sig * -> String
 * @param {*} val
 * @return {String}
 * @example
 *
 *      R.toString(42); //=> '42'
 *      R.toString('abc'); //=> '"abc"'
 *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
 *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
 *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
 */

var toString =
/*#__PURE__*/
_curry1(function toString(val) {
  return _toString(val, []);
});

/**
 * Divides two numbers. Equivalent to `a / b`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a / b`.
 * @see R.multiply
 * @example
 *
 *      R.divide(71, 100); //=> 0.71
 *
 *      const half = R.divide(R.__, 2);
 *      half(42); //=> 21
 *
 *      const reciprocal = R.divide(1);
 *      reciprocal(4);   //=> 0.25
 */

var divide =
/*#__PURE__*/
_curry2(function divide(a, b) {
  return a / b;
});

/**
 * Tests whether or not an object is a typed array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is a typed array, `false` otherwise.
 * @example
 *
 *      _isTypedArray(new Uint8Array([])); //=> true
 *      _isTypedArray(new Float32Array([])); //=> true
 *      _isTypedArray([]); //=> false
 *      _isTypedArray(null); //=> false
 *      _isTypedArray({}); //=> false
 */
function _isTypedArray(val) {
  var type = Object.prototype.toString.call(val);
  return type === '[object Uint8ClampedArray]' || type === '[object Int8Array]' || type === '[object Uint8Array]' || type === '[object Int16Array]' || type === '[object Uint16Array]' || type === '[object Int32Array]' || type === '[object Uint32Array]' || type === '[object Float32Array]' || type === '[object Float64Array]' || type === '[object BigInt64Array]' || type === '[object BigUint64Array]';
}

/**
 * Returns the empty value of its argument's type. Ramda defines the empty
 * value of Array (`[]`), Object (`{}`), String (`''`),
 * TypedArray (`Uint8Array []`, `Float32Array []`, etc), and Arguments. Other
 * types are supported if they define `<Type>.empty`,
 * `<Type>.prototype.empty` or implement the
 * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 *
 * Dispatches to the `empty` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> a
 * @param {*} x
 * @return {*}
 * @example
 *
 *      R.empty(Just(42));               //=> Nothing()
 *      R.empty([1, 2, 3]);              //=> []
 *      R.empty('unicorns');             //=> ''
 *      R.empty({x: 1, y: 2});           //=> {}
 *      R.empty(Uint8Array.from('123')); //=> Uint8Array []
 */

var empty =
/*#__PURE__*/
_curry1(function empty(x) {
  return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
    return arguments;
  }() : _isTypedArray(x) ? x.constructor.from('') : void 0 // else
  ;
});

/**
 * Returns whether or not a path exists in an object. Only the object's
 * own properties are checked.
 *
 * @func
 * @memberOf R
 * @since v0.26.0
 * @category Object
 * @typedefn Idx = String | Int | Symbol
 * @sig [Idx] -> {a} -> Boolean
 * @param {Array} path The path to use.
 * @param {Object} obj The object to check the path in.
 * @return {Boolean} Whether the path exists.
 * @see R.has
 * @example
 *
 *      R.hasPath(['a', 'b'], {a: {b: 2}});         // => true
 *      R.hasPath(['a', 'b'], {a: {b: undefined}}); // => true
 *      R.hasPath(['a', 'b'], {a: {c: 2}});         // => false
 *      R.hasPath(['a', 'b'], {});                  // => false
 */

var hasPath =
/*#__PURE__*/
_curry2(function hasPath(_path, obj) {
  if (_path.length === 0 || isNil(obj)) {
    return false;
  }

  var val = obj;
  var idx = 0;

  while (idx < _path.length) {
    if (!isNil(val) && _has(_path[idx], val)) {
      val = val[_path[idx]];
      idx += 1;
    } else {
      return false;
    }
  }

  return true;
});

/**
 * Returns whether or not an object has an own property with the specified name
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Object
 * @sig s -> {s: x} -> Boolean
 * @param {String} prop The name of the property to check for.
 * @param {Object} obj The object to query.
 * @return {Boolean} Whether the property exists.
 * @example
 *
 *      const hasName = R.has('name');
 *      hasName({name: 'alice'});   //=> true
 *      hasName({name: 'bob'});     //=> true
 *      hasName({});                //=> false
 *
 *      const point = {x: 0, y: 0};
 *      const pointHas = R.has(R.__, point);
 *      pointHas('x');  //=> true
 *      pointHas('y');  //=> true
 *      pointHas('z');  //=> false
 */

var has =
/*#__PURE__*/
_curry2(function has(prop, obj) {
  return hasPath([prop], obj);
});

/**
 * Creates a function that will process either the `onTrue` or the `onFalse`
 * function depending upon the result of the `condition` predicate.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
 * @param {Function} condition A predicate function
 * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
 * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
 * @return {Function} A new function that will process either the `onTrue` or the `onFalse`
 *                    function depending upon the result of the `condition` predicate.
 * @see R.unless, R.when, R.cond
 * @example
 *
 *      const incCount = R.ifElse(
 *        R.has('count'),
 *        R.over(R.lensProp('count'), R.inc),
 *        R.assoc('count', 1)
 *      );
 *      incCount({ count: 1 }); //=> { count: 2 }
 *      incCount({});           //=> { count: 1 }
 */

var ifElse =
/*#__PURE__*/
_curry3(function ifElse(condition, onTrue, onFalse) {
  return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
    return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
  });
});

/**
 * Creates an object containing a single key:value pair.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Object
 * @sig String -> a -> {String:a}
 * @param {String} key
 * @param {*} val
 * @return {Object}
 * @see R.pair
 * @example
 *
 *      const matchPhrases = R.compose(
 *        R.objOf('must'),
 *        R.map(R.objOf('match_phrase'))
 *      );
 *      matchPhrases(['foo', 'bar', 'baz']); //=> {must: [{match_phrase: 'foo'}, {match_phrase: 'bar'}, {match_phrase: 'baz'}]}
 */

var objOf =
/*#__PURE__*/
_curry2(function objOf(key, val) {
  var obj = {};
  obj[key] = val;
  return obj;
});

/**
 * Turns a named method with a specified arity into a function that can be
 * called directly supplied with arguments and a target object.
 *
 * The returned function is curried and accepts `arity + 1` parameters where
 * the final parameter is the target object.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
 * @param {Number} arity Number of arguments the returned function should take
 *        before the target object.
 * @param {String} method Name of any of the target object's methods to call.
 * @return {Function} A new curried function.
 * @see R.construct
 * @example
 *
 *      const sliceFrom = R.invoker(1, 'slice');
 *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
 *      const sliceFrom6 = R.invoker(2, 'slice')(6);
 *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
 *
 *      const dog = {
 *        speak: async () => 'Woof!'
 *      };
 *      const speak = R.invoker(0, 'speak');
 *      speak(dog).then(console.log) //~> 'Woof!'
 *
 * @symb R.invoker(0, 'method')(o) = o['method']()
 * @symb R.invoker(1, 'method')(a, o) = o['method'](a)
 * @symb R.invoker(2, 'method')(a, b, o) = o['method'](a, b)
 */

var invoker =
/*#__PURE__*/
_curry2(function invoker(arity, method) {
  return curryN(arity + 1, function () {
    var target = arguments[arity];

    if (target != null && _isFunction(target[method])) {
      return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
    }

    throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
  });
});

/**
 * Returns `true` if the given value is its type's empty value; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> Boolean
 * @param {*} x
 * @return {Boolean}
 * @see R.empty
 * @example
 *
 *      R.isEmpty([1, 2, 3]);           //=> false
 *      R.isEmpty([]);                  //=> true
 *      R.isEmpty('');                  //=> true
 *      R.isEmpty(null);                //=> false
 *      R.isEmpty({});                  //=> true
 *      R.isEmpty({length: 0});         //=> false
 *      R.isEmpty(Uint8Array.from('')); //=> true
 */

var isEmpty =
/*#__PURE__*/
_curry1(function isEmpty(x) {
  return x != null && equals(x, empty(x));
});

/**
 * Returns a string made by inserting the `separator` between each element and
 * concatenating all the elements into a single string.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig String -> [a] -> String
 * @param {Number|String} separator The string used to separate the elements.
 * @param {Array} xs The elements to join into a string.
 * @return {String} str The string made by concatenating `xs` with `separator`.
 * @see R.split
 * @example
 *
 *      const spacer = R.join(' ');
 *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
 *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
 */

var join =
/*#__PURE__*/
invoker(1, 'join');

/**
 * An Object-specific version of [`map`](#map). The function is applied to three
 * arguments: *(value, key, obj)*. If only the value is significant, use
 * [`map`](#map) instead.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig ((*, String, Object) -> *) -> Object -> Object
 * @param {Function} fn
 * @param {Object} obj
 * @return {Object}
 * @see R.map
 * @example
 *
 *      const xyz = { x: 1, y: 2, z: 3 };
 *      const prependKeyAndDouble = (num, key, obj) => key + (num * 2);
 *
 *      R.mapObjIndexed(prependKeyAndDouble, xyz); //=> { x: 'x2', y: 'y4', z: 'z6' }
 */

var mapObjIndexed =
/*#__PURE__*/
_curry2(function mapObjIndexed(fn, obj) {
  return _reduce(function (acc, key) {
    acc[key] = fn(obj[key], key, obj);
    return acc;
  }, {}, keys(obj));
});

/**
 * Returns a new list with the given element at the front, followed by the
 * contents of the list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} el The item to add to the head of the output list.
 * @param {Array} list The array to add to the tail of the output list.
 * @return {Array} A new array.
 * @see R.append
 * @example
 *
 *      R.prepend('fee', ['fi', 'fo', 'fum']); //=> ['fee', 'fi', 'fo', 'fum']
 */

var prepend =
/*#__PURE__*/
_curry2(function prepend(el, list) {
  return _concat([el], list);
});

/**
 * Returns `true` if the specified object property is equal, in
 * [`R.equals`](#equals) terms, to the given value; `false` otherwise.
 * You can test multiple properties with [`R.whereEq`](#whereEq).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig String -> a -> Object -> Boolean
 * @param {String} name
 * @param {*} val
 * @param {*} obj
 * @return {Boolean}
 * @see R.whereEq, R.propSatisfies, R.equals
 * @example
 *
 *      const abby = {name: 'Abby', age: 7, hair: 'blond'};
 *      const fred = {name: 'Fred', age: 12, hair: 'brown'};
 *      const rusty = {name: 'Rusty', age: 10, hair: 'brown'};
 *      const alois = {name: 'Alois', age: 15, disposition: 'surly'};
 *      const kids = [abby, fred, rusty, alois];
 *      const hasBrownHair = R.propEq('hair', 'brown');
 *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
 */

var propEq =
/*#__PURE__*/
_curry3(function propEq(name, val, obj) {
  return equals(val, prop$1(name, obj));
});

/**
 * Replace a substring or regex match in a string with a replacement.
 *
 * The first two parameters correspond to the parameters of the
 * `String.prototype.replace()` function, so the second parameter can also be a
 * function.
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category String
 * @sig RegExp|String -> String -> String -> String
 * @param {RegExp|String} pattern A regular expression or a substring to match.
 * @param {String} replacement The string to replace the matches with.
 * @param {String} str The String to do the search and replacement in.
 * @return {String} The result.
 * @example
 *
 *      R.replace('foo', 'bar', 'foo foo foo'); //=> 'bar foo foo'
 *      R.replace(/foo/, 'bar', 'foo foo foo'); //=> 'bar foo foo'
 *
 *      // Use the "g" (global) flag to replace all occurrences:
 *      R.replace(/foo/g, 'bar', 'foo foo foo'); //=> 'bar bar bar'
 */

var replace$1 =
/*#__PURE__*/
_curry3(function replace(regex, replacement, str) {
  return str.replace(regex, replacement);
});

/**
 * Tests the final argument by passing it to the given predicate function. If
 * the predicate is not satisfied, the function will return the result of
 * calling the `whenFalseFn` function with the same argument. If the predicate
 * is satisfied, the argument is returned as is.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Logic
 * @sig (a -> Boolean) -> (a -> b) -> a -> a | b
 * @param {Function} pred        A predicate function
 * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
 *                               to a falsy value.
 * @param {*}        x           An object to test with the `pred` function and
 *                               pass to `whenFalseFn` if necessary.
 * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
 * @see R.ifElse, R.when, R.cond
 * @example
 *
 *      let safeInc = R.unless(R.isNil, R.inc);
 *      safeInc(null); //=> null
 *      safeInc(1); //=> 2
 */

var unless =
/*#__PURE__*/
_curry3(function unless(pred, whenFalseFn, x) {
  return pred(x) ? x : whenFalseFn(x);
});

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// This module exposes a list of named identifiers, shared across the parser generator
// and the parsers that are generated.

var identifiers = {
  // Identifies the operator type. Used by the generator
  // to indicate operator types in the grammar object.
  // Used by the [parser](./parser.html) when interpreting the grammar object.
  /* the original ABNF operators */
  ALT: 1 /* alternation */,
  CAT: 2 /* concatenation */,
  REP: 3 /* repetition */,
  RNM: 4 /* rule name */,
  TRG: 5 /* terminal range */,
  TBS: 6 /* terminal binary string, case sensitive */,
  TLS: 7 /* terminal literal string, case insensitive */,
  /* the super set, SABNF operators */
  UDT: 11 /* user-defined terminal */,
  AND: 12 /* positive look ahead */,
  NOT: 13 /* negative look ahead */,
  BKR: 14 /* back reference to a previously matched rule name */,
  BKA: 15 /* positive look behind */,
  BKN: 16 /* negative look behind */,
  ABG: 17 /* anchor - begin of string */,
  AEN: 18 /* anchor - end of string */,
  // Used by the parser and the user's `RNM` and `UDT` callback functions.
  // Identifies the parser state as it traverses the parse tree nodes.
  // - *ACTIVE* - indicates the downward direction through the parse tree node.
  // - *MATCH* - indicates the upward direction and a phrase, of length \> 0, has been successfully matched
  // - *EMPTY* - indicates the upward direction and a phrase, of length = 0, has been successfully matched
  // - *NOMATCH* - indicates the upward direction and the parser failed to match any phrase at all
  ACTIVE: 100,
  MATCH: 101,
  EMPTY: 102,
  NOMATCH: 103,
  // Used by [`AST` translator](./ast.html) (semantic analysis) and the user's callback functions
  // to indicate the direction of flow through the `AST` nodes.
  // - *SEM_PRE* - indicates the downward (pre-branch) direction through the `AST` node.
  // - *SEM_POST* - indicates the upward (post-branch) direction through the `AST` node.
  SEM_PRE: 200,
  SEM_POST: 201,
  // Used by the user's callback functions to indicate to the `AST` translator (semantic analysis) how to proceed.
  // - *SEM_OK* - normal return value
  // - *SEM_SKIP* - if a callback function returns this value from the SEM_PRE state,
  // the translator will skip processing all `AST` nodes in the branch below the current node.
  // Ignored if returned from the SEM_POST state.
  SEM_OK: 300,
  SEM_SKIP: 301,
  // Used in attribute generation to distinguish the necessary attribute categories.
  // - *ATTR_N* - non-recursive
  // - *ATTR_R* - recursive
  // - *ATTR_MR* - belongs to a mutually-recursive set
  ATTR_N: 400,
  ATTR_R: 401,
  ATTR_MR: 402,
  // Look around values indicate whether the parser is in look ahead or look behind mode.
  // Used by the tracing facility to indicate the look around mode in the trace records display.
  // - *LOOKAROUND_NONE* - the parser is in normal parsing mode
  // - *LOOKAROUND_AHEAD* - the parse is in look-ahead mode, phrase matching for operator `AND(&)` or `NOT(!)`
  // - *LOOKAROUND_BEHIND* - the parse is in look-behind mode, phrase matching for operator `BKA(&&)` or `BKN(!!)`
  LOOKAROUND_NONE: 500,
  LOOKAROUND_AHEAD: 501,
  LOOKAROUND_BEHIND: 502,
  // Back reference rule mode indicators
  // - *BKR_MODE_UM* - the back reference is using universal mode
  // - *BKR_MODE_PM* - the back reference is using parent frame mode
  // - *BKR_MODE_CS* - the back reference is using case-sensitive phrase matching
  // - *BKR_MODE_CI* - the back reference is using case-insensitive phrase matching
  BKR_MODE_UM: 601,
  BKR_MODE_PM: 602,
  BKR_MODE_CS: 603,
  BKR_MODE_CI: 604,
};

var utilities = {};

var style = {

  // Generated by apglib/style.js 
  CLASS_MONOSPACE: 'apg-mono',
  CLASS_ACTIVE: 'apg-active',
  CLASS_EMPTY: 'apg-empty',
  CLASS_MATCH: 'apg-match',
  CLASS_NOMATCH: 'apg-nomatch',
  CLASS_LOOKAHEAD: 'apg-lh-match',
  CLASS_LOOKBEHIND: 'apg-lb-match',
  CLASS_REMAINDER: 'apg-remainder',
  CLASS_CTRLCHAR: 'apg-ctrl-char',
  CLASS_LINEEND: 'apg-line-end',
  CLASS_ERROR: 'apg-error',
  CLASS_PHRASE: 'apg-phrase',
  CLASS_EMPTYPHRASE: 'apg-empty-phrase',
  CLASS_STATE: 'apg-state',
  CLASS_STATS: 'apg-stats',
  CLASS_TRACE: 'apg-trace',
  CLASS_GRAMMAR: 'apg-grammar',
  CLASS_RULES: 'apg-rules',
  CLASS_RULESLINK: 'apg-rules-link',
  CLASS_ATTRIBUTES: 'apg-attrs',
};

var converter = {};

var transformers = {};

/* eslint-disable prefer-destructuring */

(function (exports) {
	/* eslint-disable no-plusplus */
	/* eslint-disable no-bitwise */
	/*  *************************************************************************************
	 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
	 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
	 *   ********************************************************************************* */
	// This module contains the actual encoding and decoding algorithms.
	// Throws "RangeError" exceptions on characters or bytes out of range for the given encoding.

	'use strict;';

	const { Buffer } = require$$0$1;

	/* decoding error codes */
	const NON_SHORTEST = 0xfffffffc;
	const TRAILING = 0xfffffffd;
	const RANGE = 0xfffffffe;
	const ILL_FORMED = 0xffffffff;

	/* mask[n] = 2**n - 1, ie. mask[n] = n bits on. e.g. mask[6] = %b111111 */
	const mask = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023];

	/* ascii[n] = 'HH', where 0xHH = n, eg. ascii[254] = 'FE' */
	const ascii = [
	  '00',
	  '01',
	  '02',
	  '03',
	  '04',
	  '05',
	  '06',
	  '07',
	  '08',
	  '09',
	  '0A',
	  '0B',
	  '0C',
	  '0D',
	  '0E',
	  '0F',
	  '10',
	  '11',
	  '12',
	  '13',
	  '14',
	  '15',
	  '16',
	  '17',
	  '18',
	  '19',
	  '1A',
	  '1B',
	  '1C',
	  '1D',
	  '1E',
	  '1F',
	  '20',
	  '21',
	  '22',
	  '23',
	  '24',
	  '25',
	  '26',
	  '27',
	  '28',
	  '29',
	  '2A',
	  '2B',
	  '2C',
	  '2D',
	  '2E',
	  '2F',
	  '30',
	  '31',
	  '32',
	  '33',
	  '34',
	  '35',
	  '36',
	  '37',
	  '38',
	  '39',
	  '3A',
	  '3B',
	  '3C',
	  '3D',
	  '3E',
	  '3F',
	  '40',
	  '41',
	  '42',
	  '43',
	  '44',
	  '45',
	  '46',
	  '47',
	  '48',
	  '49',
	  '4A',
	  '4B',
	  '4C',
	  '4D',
	  '4E',
	  '4F',
	  '50',
	  '51',
	  '52',
	  '53',
	  '54',
	  '55',
	  '56',
	  '57',
	  '58',
	  '59',
	  '5A',
	  '5B',
	  '5C',
	  '5D',
	  '5E',
	  '5F',
	  '60',
	  '61',
	  '62',
	  '63',
	  '64',
	  '65',
	  '66',
	  '67',
	  '68',
	  '69',
	  '6A',
	  '6B',
	  '6C',
	  '6D',
	  '6E',
	  '6F',
	  '70',
	  '71',
	  '72',
	  '73',
	  '74',
	  '75',
	  '76',
	  '77',
	  '78',
	  '79',
	  '7A',
	  '7B',
	  '7C',
	  '7D',
	  '7E',
	  '7F',
	  '80',
	  '81',
	  '82',
	  '83',
	  '84',
	  '85',
	  '86',
	  '87',
	  '88',
	  '89',
	  '8A',
	  '8B',
	  '8C',
	  '8D',
	  '8E',
	  '8F',
	  '90',
	  '91',
	  '92',
	  '93',
	  '94',
	  '95',
	  '96',
	  '97',
	  '98',
	  '99',
	  '9A',
	  '9B',
	  '9C',
	  '9D',
	  '9E',
	  '9F',
	  'A0',
	  'A1',
	  'A2',
	  'A3',
	  'A4',
	  'A5',
	  'A6',
	  'A7',
	  'A8',
	  'A9',
	  'AA',
	  'AB',
	  'AC',
	  'AD',
	  'AE',
	  'AF',
	  'B0',
	  'B1',
	  'B2',
	  'B3',
	  'B4',
	  'B5',
	  'B6',
	  'B7',
	  'B8',
	  'B9',
	  'BA',
	  'BB',
	  'BC',
	  'BD',
	  'BE',
	  'BF',
	  'C0',
	  'C1',
	  'C2',
	  'C3',
	  'C4',
	  'C5',
	  'C6',
	  'C7',
	  'C8',
	  'C9',
	  'CA',
	  'CB',
	  'CC',
	  'CD',
	  'CE',
	  'CF',
	  'D0',
	  'D1',
	  'D2',
	  'D3',
	  'D4',
	  'D5',
	  'D6',
	  'D7',
	  'D8',
	  'D9',
	  'DA',
	  'DB',
	  'DC',
	  'DD',
	  'DE',
	  'DF',
	  'E0',
	  'E1',
	  'E2',
	  'E3',
	  'E4',
	  'E5',
	  'E6',
	  'E7',
	  'E8',
	  'E9',
	  'EA',
	  'EB',
	  'EC',
	  'ED',
	  'EE',
	  'EF',
	  'F0',
	  'F1',
	  'F2',
	  'F3',
	  'F4',
	  'F5',
	  'F6',
	  'F7',
	  'F8',
	  'F9',
	  'FA',
	  'FB',
	  'FC',
	  'FD',
	  'FE',
	  'FF',
	];

	/* vector of base 64 characters */
	const base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('');

	/* vector of base 64 character codes */
	const base64codes = [];
	base64chars.forEach((char) => {
	  base64codes.push(char.charCodeAt(0));
	});

	// The UTF8 algorithms.
	exports.utf8 = {
	  encode(chars) {
	    const bytes = [];
	    chars.forEach((char) => {
	      if (char >= 0 && char <= 0x7f) {
	        bytes.push(char);
	      } else if (char <= 0x7ff) {
	        bytes.push(0xc0 + ((char >> 6) & mask[5]));
	        bytes.push(0x80 + (char & mask[6]));
	      } else if (char < 0xd800 || (char > 0xdfff && char <= 0xffff)) {
	        bytes.push(0xe0 + ((char >> 12) & mask[4]));
	        bytes.push(0x80 + ((char >> 6) & mask[6]));
	        bytes.push(0x80 + (char & mask[6]));
	      } else if (char >= 0x10000 && char <= 0x10ffff) {
	        const u = (char >> 16) & mask[5];
	        bytes.push(0xf0 + (u >> 2));
	        bytes.push(0x80 + ((u & mask[2]) << 4) + ((char >> 12) & mask[4]));
	        bytes.push(0x80 + ((char >> 6) & mask[6]));
	        bytes.push(0x80 + (char & mask[6]));
	      } else {
	        throw new RangeError(`utf8.encode: character out of range: char: ${char}`);
	      }
	    });
	    return Buffer.from(bytes);
	  },
	  decode(buf, bom) {
	    /* bytes functions return error for non-shortest forms & values out of range */
	    function bytes2(b1, b2) {
	      /* U+0080..U+07FF */
	      /* 00000000 00000yyy yyxxxxxx | 110yyyyy 10xxxxxx */
	      if ((b2 & 0xc0) !== 0x80) {
	        return TRAILING;
	      }
	      const x = ((b1 & mask[5]) << 6) + (b2 & mask[6]);
	      if (x < 0x80) {
	        return NON_SHORTEST;
	      }
	      return x;
	    }
	    function bytes3(b1, b2, b3) {
	      /* U+0800..U+FFFF */
	      /* 00000000 zzzzyyyy yyxxxxxx | 1110zzzz 10yyyyyy 10xxxxxx */
	      if ((b3 & 0xc0) !== 0x80 || (b2 & 0xc0) !== 0x80) {
	        return TRAILING;
	      }
	      const x = ((b1 & mask[4]) << 12) + ((b2 & mask[6]) << 6) + (b3 & mask[6]);
	      if (x < 0x800) {
	        return NON_SHORTEST;
	      }
	      if (x >= 0xd800 && x <= 0xdfff) {
	        return RANGE;
	      }
	      return x;
	    }
	    function bytes4(b1, b2, b3, b4) {
	      /* U+10000..U+10FFFF */
	      /* 000uuuuu zzzzyyyy yyxxxxxx | 11110uuu 10uuzzzz 10yyyyyy 10xxxxxx */
	      if ((b4 & 0xc0) !== 0x80 || (b3 & 0xc0) !== 0x80 || (b2 & 0xc0) !== 0x80) {
	        return TRAILING;
	      }
	      const x =
	        ((((b1 & mask[3]) << 2) + ((b2 >> 4) & mask[2])) << 16) +
	        ((b2 & mask[4]) << 12) +
	        ((b3 & mask[6]) << 6) +
	        (b4 & mask[6]);
	      if (x < 0x10000) {
	        return NON_SHORTEST;
	      }
	      if (x > 0x10ffff) {
	        return RANGE;
	      }
	      return x;
	    }
	    let c;
	    let b1;
	    let i1;
	    let i2;
	    let i3;
	    let inc;
	    const len = buf.length;
	    let i = bom ? 3 : 0;
	    const chars = [];
	    while (i < len) {
	      b1 = buf[i];
	      c = ILL_FORMED;
	      const TRUE = true;
	      while (TRUE) {
	        if (b1 >= 0 && b1 <= 0x7f) {
	          /* U+0000..U+007F 00..7F */
	          c = b1;
	          inc = 1;
	          break;
	        }
	        i1 = i + 1;
	        if (i1 < len && b1 >= 0xc2 && b1 <= 0xdf) {
	          /* U+0080..U+07FF C2..DF 80..BF */
	          c = bytes2(b1, buf[i1]);
	          inc = 2;
	          break;
	        }
	        i2 = i + 2;
	        if (i2 < len && b1 >= 0xe0 && b1 <= 0xef) {
	          /* U+0800..U+FFFF */
	          c = bytes3(b1, buf[i1], buf[i2]);
	          inc = 3;
	          break;
	        }
	        i3 = i + 3;
	        if (i3 < len && b1 >= 0xf0 && b1 <= 0xf4) {
	          /* U+10000..U+10FFFF */
	          c = bytes4(b1, buf[i1], buf[i2], buf[i3]);
	          inc = 4;
	          break;
	        }
	        /* if we fall through to here, it is an ill-formed sequence */
	        break;
	      }
	      if (c > 0x10ffff) {
	        const at = `byte[${i}]`;
	        if (c === ILL_FORMED) {
	          throw new RangeError(`utf8.decode: ill-formed UTF8 byte sequence found at: ${at}`);
	        }
	        if (c === TRAILING) {
	          throw new RangeError(`utf8.decode: illegal trailing byte found at: ${at}`);
	        }
	        if (c === RANGE) {
	          throw new RangeError(`utf8.decode: code point out of range found at: ${at}`);
	        }
	        if (c === NON_SHORTEST) {
	          throw new RangeError(`utf8.decode: non-shortest form found at: ${at}`);
	        }
	        throw new RangeError(`utf8.decode: unrecognized error found at: ${at}`);
	      }
	      chars.push(c);
	      i += inc;
	    }
	    return chars;
	  },
	};

	// The UTF16BE algorithms.
	exports.utf16be = {
	  encode(chars) {
	    const bytes = [];
	    let char;
	    let h;
	    let l;
	    for (let i = 0; i < chars.length; i += 1) {
	      char = chars[i];
	      if ((char >= 0 && char <= 0xd7ff) || (char >= 0xe000 && char <= 0xffff)) {
	        bytes.push((char >> 8) & mask[8]);
	        bytes.push(char & mask[8]);
	      } else if (char >= 0x10000 && char <= 0x10ffff) {
	        l = char - 0x10000;
	        h = 0xd800 + (l >> 10);
	        l = 0xdc00 + (l & mask[10]);
	        bytes.push((h >> 8) & mask[8]);
	        bytes.push(h & mask[8]);
	        bytes.push((l >> 8) & mask[8]);
	        bytes.push(l & mask[8]);
	      } else {
	        throw new RangeError(`utf16be.encode: UTF16BE value out of range: char[${i}]: ${char}`);
	      }
	    }
	    return Buffer.from(bytes);
	  },
	  decode(buf, bom) {
	    /* assumes caller has insured that buf is a Buffer of bytes */
	    if (buf.length % 2 > 0) {
	      throw new RangeError(`utf16be.decode: data length must be even multiple of 2: length: ${buf.length}`);
	    }
	    const chars = [];
	    const len = buf.length;
	    let i = bom ? 2 : 0;
	    let j = 0;
	    let c;
	    let inc;
	    let i1;
	    let i3;
	    let high;
	    let low;
	    while (i < len) {
	      const TRUE = true;
	      while (TRUE) {
	        i1 = i + 1;
	        if (i1 < len) {
	          high = (buf[i] << 8) + buf[i1];
	          if (high < 0xd800 || high > 0xdfff) {
	            c = high;
	            inc = 2;
	            break;
	          }
	          i3 = i + 3;
	          if (i3 < len) {
	            low = (buf[i + 2] << 8) + buf[i3];
	            if (high <= 0xdbff && low >= 0xdc00 && low <= 0xdfff) {
	              c = 0x10000 + ((high - 0xd800) << 10) + (low - 0xdc00);
	              inc = 4;
	              break;
	            }
	          }
	        }
	        /* if we fall through to here, it is an ill-formed sequence */
	        throw new RangeError(`utf16be.decode: ill-formed UTF16BE byte sequence found: byte[${i}]`);
	      }
	      chars[j++] = c;
	      i += inc;
	    }
	    return chars;
	  },
	};

	// The UTF16LE algorithms.
	exports.utf16le = {
	  encode(chars) {
	    const bytes = [];
	    let char;
	    let h;
	    let l;
	    for (let i = 0; i < chars.length; i += 1) {
	      char = chars[i];
	      if ((char >= 0 && char <= 0xd7ff) || (char >= 0xe000 && char <= 0xffff)) {
	        bytes.push(char & mask[8]);
	        bytes.push((char >> 8) & mask[8]);
	      } else if (char >= 0x10000 && char <= 0x10ffff) {
	        l = char - 0x10000;
	        h = 0xd800 + (l >> 10);
	        l = 0xdc00 + (l & mask[10]);
	        bytes.push(h & mask[8]);
	        bytes.push((h >> 8) & mask[8]);
	        bytes.push(l & mask[8]);
	        bytes.push((l >> 8) & mask[8]);
	      } else {
	        throw new RangeError(`utf16le.encode: UTF16LE value out of range: char[${i}]: ${char}`);
	      }
	    }
	    return Buffer.from(bytes);
	  },
	  decode(buf, bom) {
	    /* assumes caller has insured that buf is a Buffer of bytes */
	    if (buf.length % 2 > 0) {
	      throw new RangeError(`utf16le.decode: data length must be even multiple of 2: length: ${buf.length}`);
	    }
	    const chars = [];
	    const len = buf.length;
	    let i = bom ? 2 : 0;
	    let j = 0;
	    let c;
	    let inc;
	    let i1;
	    let i3;
	    let high;
	    let low;
	    while (i < len) {
	      const TRUE = true;
	      while (TRUE) {
	        i1 = i + 1;
	        if (i1 < len) {
	          high = (buf[i1] << 8) + buf[i];
	          if (high < 0xd800 || high > 0xdfff) {
	            c = high;
	            inc = 2;
	            break;
	          }
	          i3 = i + 3;
	          if (i3 < len) {
	            low = (buf[i3] << 8) + buf[i + 2];
	            if (high <= 0xdbff && low >= 0xdc00 && low <= 0xdfff) {
	              c = 0x10000 + ((high - 0xd800) << 10) + (low - 0xdc00);
	              inc = 4;
	              break;
	            }
	          }
	        }
	        /* if we fall through to here, it is an ill-formed sequence */
	        throw new RangeError(`utf16le.decode: ill-formed UTF16LE byte sequence found: byte[${i}]`);
	      }
	      chars[j++] = c;
	      i += inc;
	    }
	    return chars;
	  },
	};

	// The UTF32BE algorithms.
	exports.utf32be = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length * 4);
	    let i = 0;
	    chars.forEach((char) => {
	      if ((char >= 0xd800 && char <= 0xdfff) || char > 0x10ffff) {
	        throw new RangeError(`utf32be.encode: UTF32BE character code out of range: char[${i / 4}]: ${char}`);
	      }
	      buf[i++] = (char >> 24) & mask[8];
	      buf[i++] = (char >> 16) & mask[8];
	      buf[i++] = (char >> 8) & mask[8];
	      buf[i++] = char & mask[8];
	    });
	    return buf;
	  },
	  decode(buf, bom) {
	    /* caller to insure buf is a Buffer of bytes */
	    if (buf.length % 4 > 0) {
	      throw new RangeError(`utf32be.decode: UTF32BE byte length must be even multiple of 4: length: ${buf.length}`);
	    }
	    const chars = [];
	    let i = bom ? 4 : 0;
	    for (; i < buf.length; i += 4) {
	      const char = (buf[i] << 24) + (buf[i + 1] << 16) + (buf[i + 2] << 8) + buf[i + 3];
	      if ((char >= 0xd800 && char <= 0xdfff) || char > 0x10ffff) {
	        throw new RangeError(`utf32be.decode: UTF32BE character code out of range: char[${i / 4}]: ${char}`);
	      }
	      chars.push(char);
	    }
	    return chars;
	  },
	};

	// The UTF32LE algorithms.
	exports.utf32le = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length * 4);
	    let i = 0;
	    chars.forEach((char) => {
	      if ((char >= 0xd800 && char <= 0xdfff) || char > 0x10ffff) {
	        throw new RangeError(`utf32le.encode: UTF32LE character code out of range: char[${i / 4}]: ${char}`);
	      }
	      buf[i++] = char & mask[8];
	      buf[i++] = (char >> 8) & mask[8];
	      buf[i++] = (char >> 16) & mask[8];
	      buf[i++] = (char >> 24) & mask[8];
	    });
	    return buf;
	  },
	  decode(buf, bom) {
	    /* caller to insure buf is a Buffer of bytes */
	    if (buf.length % 4 > 0) {
	      throw new RangeError(`utf32be.decode: UTF32LE byte length must be even multiple of 4: length: ${buf.length}`);
	    }
	    const chars = [];
	    let i = bom ? 4 : 0;
	    for (; i < buf.length; i += 4) {
	      const char = (buf[i + 3] << 24) + (buf[i + 2] << 16) + (buf[i + 1] << 8) + buf[i];
	      if ((char >= 0xd800 && char <= 0xdfff) || char > 0x10ffff) {
	        throw new RangeError(`utf32le.encode: UTF32LE character code out of range: char[${i / 4}]: ${char}`);
	      }
	      chars.push(char);
	    }
	    return chars;
	  },
	};

	// The UINT7 algorithms. ASCII or 7-bit unsigned integers.
	exports.uint7 = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length);
	    for (let i = 0; i < chars.length; i += 1) {
	      if (chars[i] > 0x7f) {
	        throw new RangeError(`uint7.encode: UINT7 character code out of range: char[${i}]: ${chars[i]}`);
	      }
	      buf[i] = chars[i];
	    }
	    return buf;
	  },
	  decode(buf) {
	    const chars = [];
	    for (let i = 0; i < buf.length; i += 1) {
	      if (buf[i] > 0x7f) {
	        throw new RangeError(`uint7.decode: UINT7 character code out of range: byte[${i}]: ${buf[i]}`);
	      }
	      chars[i] = buf[i];
	    }
	    return chars;
	  },
	};

	// The UINT8 algorithms. BINARY, Latin 1 or 8-bit unsigned integers.
	exports.uint8 = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length);
	    for (let i = 0; i < chars.length; i += 1) {
	      if (chars[i] > 0xff) {
	        throw new RangeError(`uint8.encode: UINT8 character code out of range: char[${i}]: ${chars[i]}`);
	      }
	      buf[i] = chars[i];
	    }
	    return buf;
	  },
	  decode(buf) {
	    const chars = [];
	    for (let i = 0; i < buf.length; i += 1) {
	      chars[i] = buf[i];
	    }
	    return chars;
	  },
	};

	// The UINT16BE algorithms. Big-endian 16-bit unsigned integers.
	exports.uint16be = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length * 2);
	    let i = 0;
	    chars.forEach((char) => {
	      if (char > 0xffff) {
	        throw new RangeError(`uint16be.encode: UINT16BE character code out of range: char[${i / 2}]: ${char}`);
	      }
	      buf[i++] = (char >> 8) & mask[8];
	      buf[i++] = char & mask[8];
	    });
	    return buf;
	  },
	  decode(buf) {
	    if (buf.length % 2 > 0) {
	      throw new RangeError(`uint16be.decode: UINT16BE byte length must be even multiple of 2: length: ${buf.length}`);
	    }
	    const chars = [];
	    for (let i = 0; i < buf.length; i += 2) {
	      chars.push((buf[i] << 8) + buf[i + 1]);
	    }
	    return chars;
	  },
	};

	// The UINT16LE algorithms. Little-endian 16-bit unsigned integers.
	exports.uint16le = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length * 2);
	    let i = 0;
	    chars.forEach((char) => {
	      if (char > 0xffff) {
	        throw new RangeError(`uint16le.encode: UINT16LE character code out of range: char[${i / 2}]: ${char}`);
	      }
	      buf[i++] = char & mask[8];
	      buf[i++] = (char >> 8) & mask[8];
	    });
	    return buf;
	  },
	  decode(buf) {
	    if (buf.length % 2 > 0) {
	      throw new RangeError(`uint16le.decode: UINT16LE byte length must be even multiple of 2: length: ${buf.length}`);
	    }
	    const chars = [];
	    for (let i = 0; i < buf.length; i += 2) {
	      chars.push((buf[i + 1] << 8) + buf[i]);
	    }
	    return chars;
	  },
	};

	// The UINT32BE algorithms. Big-endian 32-bit unsigned integers.
	exports.uint32be = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length * 4);
	    let i = 0;
	    chars.forEach((char) => {
	      buf[i++] = (char >> 24) & mask[8];
	      buf[i++] = (char >> 16) & mask[8];
	      buf[i++] = (char >> 8) & mask[8];
	      buf[i++] = char & mask[8];
	    });
	    return buf;
	  },
	  decode(buf) {
	    if (buf.length % 4 > 0) {
	      throw new RangeError(`uint32be.decode: UINT32BE byte length must be even multiple of 4: length: ${buf.length}`);
	    }
	    const chars = [];
	    for (let i = 0; i < buf.length; i += 4) {
	      chars.push((buf[i] << 24) + (buf[i + 1] << 16) + (buf[i + 2] << 8) + buf[i + 3]);
	    }
	    return chars;
	  },
	};

	// The UINT32LE algorithms. Little-endian 32-bit unsigned integers.
	exports.uint32le = {
	  encode(chars) {
	    const buf = Buffer.alloc(chars.length * 4);
	    let i = 0;
	    chars.forEach((char) => {
	      buf[i++] = char & mask[8];
	      buf[i++] = (char >> 8) & mask[8];
	      buf[i++] = (char >> 16) & mask[8];
	      buf[i++] = (char >> 24) & mask[8];
	    });
	    return buf;
	  },
	  decode(buf) {
	    /* caller to insure buf is a Buffer of bytes */
	    if (buf.length % 4 > 0) {
	      throw new RangeError(`uint32le.decode: UINT32LE byte length must be even multiple of 4: length: ${buf.length}`);
	    }
	    const chars = [];
	    for (let i = 0; i < buf.length; i += 4) {
	      chars.push((buf[i + 3] << 24) + (buf[i + 2] << 16) + (buf[i + 1] << 8) + buf[i]);
	    }
	    return chars;
	  },
	};

	// The STRING algorithms. Converts JavaScript strings to Array of 32-bit integers and vice versa.
	// Uses the node.js Buffer's native "utf16le" capabilites.
	exports.string = {
	  encode(chars) {
	    return exports.utf16le.encode(chars).toString('utf16le');
	  },
	  decode(str) {
	    return exports.utf16le.decode(Buffer.from(str, 'utf16le'), 0);
	  },
	};

	// The ESCAPED algorithms.
	// Note that ESCAPED format contains only ASCII characters.
	// The characters are always in the form of a Buffer of bytes.
	exports.escaped = {
	  // Encodes an Array of 32-bit integers into ESCAPED format.
	  encode(chars) {
	    const bytes = [];
	    for (let i = 0; i < chars.length; i += 1) {
	      const char = chars[i];
	      if (char === 96) {
	        bytes.push(char);
	        bytes.push(char);
	      } else if (char === 10) {
	        bytes.push(char);
	      } else if (char >= 32 && char <= 126) {
	        bytes.push(char);
	      } else {
	        let str = '';
	        if (char >= 0 && char <= 31) {
	          str += `\`x${ascii[char]}`;
	        } else if (char >= 127 && char <= 255) {
	          str += `\`x${ascii[char]}`;
	        } else if (char >= 0x100 && char <= 0xffff) {
	          str += `\`u${ascii[(char >> 8) & mask[8]]}${ascii[char & mask[8]]}`;
	        } else if (char >= 0x10000 && char <= 0xffffffff) {
	          str += '`u{';
	          const digit = (char >> 24) & mask[8];
	          if (digit > 0) {
	            str += ascii[digit];
	          }
	          str += `${ascii[(char >> 16) & mask[8]] + ascii[(char >> 8) & mask[8]] + ascii[char & mask[8]]}}`;
	        } else {
	          throw new Error('escape.encode(char): char > 0xffffffff not allowed');
	        }
	        const buf = Buffer.from(str);
	        buf.forEach((b) => {
	          bytes.push(b);
	        });
	      }
	    }
	    return Buffer.from(bytes);
	  },
	  // Decodes ESCAPED format from a Buffer of bytes to an Array of 32-bit integers.
	  decode(buf) {
	    function isHex(hex) {
	      if ((hex >= 48 && hex <= 57) || (hex >= 65 && hex <= 70) || (hex >= 97 && hex <= 102)) {
	        return true;
	      }
	      return false;
	    }
	    function getx(i, len, bufArg) {
	      const ret = { char: null, nexti: i + 2, error: true };
	      if (i + 1 < len) {
	        if (isHex(bufArg[i]) && isHex(bufArg[i + 1])) {
	          const str = String.fromCodePoint(bufArg[i], bufArg[i + 1]);
	          ret.char = parseInt(str, 16);
	          if (!Number.isNaN(ret.char)) {
	            ret.error = false;
	          }
	        }
	      }
	      return ret;
	    }
	    function getu(i, len, bufArg) {
	      const ret = { char: null, nexti: i + 4, error: true };
	      if (i + 3 < len) {
	        if (isHex(bufArg[i]) && isHex(bufArg[i + 1]) && isHex(bufArg[i + 2]) && isHex(bufArg[i + 3])) {
	          const str = String.fromCodePoint(bufArg[i], bufArg[i + 1], bufArg[i + 2], bufArg[i + 3]);
	          ret.char = parseInt(str, 16);
	          if (!Number.isNaN(ret.char)) {
	            ret.error = false;
	          }
	        }
	      }
	      return ret;
	    }
	    function getU(i, len, bufArg) {
	      const ret = { char: null, nexti: i + 4, error: true };
	      let str = '';
	      while (i < len && isHex(bufArg[i])) {
	        str += String.fromCodePoint(bufArg[i]);
	        // eslint-disable-next-line no-param-reassign
	        i += 1;
	      }
	      ret.char = parseInt(str, 16);
	      if (bufArg[i] === 125 && !Number.isNaN(ret.char)) {
	        ret.error = false;
	      }
	      ret.nexti = i + 1;
	      return ret;
	    }
	    const chars = [];
	    const len = buf.length;
	    let i1;
	    let ret;
	    let error;
	    let i = 0;
	    while (i < len) {
	      const TRUE = true;
	      while (TRUE) {
	        error = true;
	        if (buf[i] !== 96) {
	          /* unescaped character */
	          chars.push(buf[i]);
	          i += 1;
	          error = false;
	          break;
	        }
	        i1 = i + 1;
	        if (i1 >= len) {
	          break;
	        }
	        if (buf[i1] === 96) {
	          /* escaped grave accent */
	          chars.push(96);
	          i += 2;
	          error = false;
	          break;
	        }
	        if (buf[i1] === 120) {
	          ret = getx(i1 + 1, len, buf);
	          if (ret.error) {
	            break;
	          }
	          /* escaped hex */
	          chars.push(ret.char);
	          i = ret.nexti;
	          error = false;
	          break;
	        }
	        if (buf[i1] === 117) {
	          if (buf[i1 + 1] === 123) {
	            ret = getU(i1 + 2, len, buf);
	            if (ret.error) {
	              break;
	            }
	            /* escaped utf-32 */
	            chars.push(ret.char);
	            i = ret.nexti;
	            error = false;
	            break;
	          }
	          ret = getu(i1 + 1, len, buf);
	          if (ret.error) {
	            break;
	          }
	          /* escaped utf-16 */
	          chars.push(ret.char);
	          i = ret.nexti;
	          error = false;
	          break;
	        }
	        break;
	      }
	      if (error) {
	        throw new Error(`escaped.decode: ill-formed escape sequence at buf[${i}]`);
	      }
	    }
	    return chars;
	  },
	};

	// The line end conversion algorigthms.
	const CR = 13;
	const LF = 10;
	exports.lineEnds = {
	  crlf(chars) {
	    const lfchars = [];
	    let i = 0;
	    while (i < chars.length) {
	      switch (chars[i]) {
	        case CR:
	          if (i + 1 < chars.length && chars[i + 1] === LF) {
	            i += 2;
	          } else {
	            i += 1;
	          }
	          lfchars.push(CR);
	          lfchars.push(LF);
	          break;
	        case LF:
	          lfchars.push(CR);
	          lfchars.push(LF);
	          i += 1;
	          break;
	        default:
	          lfchars.push(chars[i]);
	          i += 1;
	          break;
	      }
	    }
	    if (lfchars.length > 0 && lfchars[lfchars.length - 1] !== LF) {
	      lfchars.push(CR);
	      lfchars.push(LF);
	    }
	    return lfchars;
	  },
	  lf(chars) {
	    const lfchars = [];
	    let i = 0;
	    while (i < chars.length) {
	      switch (chars[i]) {
	        case CR:
	          if (i + 1 < chars.length && chars[i + 1] === LF) {
	            i += 2;
	          } else {
	            i += 1;
	          }
	          lfchars.push(LF);
	          break;
	        case LF:
	          lfchars.push(LF);
	          i += 1;
	          break;
	        default:
	          lfchars.push(chars[i]);
	          i += 1;
	          break;
	      }
	    }
	    if (lfchars.length > 0 && lfchars[lfchars.length - 1] !== LF) {
	      lfchars.push(LF);
	    }
	    return lfchars;
	  },
	};

	// The base 64 algorithms.
	exports.base64 = {
	  encode(buf) {
	    if (buf.length === 0) {
	      return Buffer.alloc(0);
	    }
	    let i;
	    let j;
	    let n;
	    let tail = buf.length % 3;
	    tail = tail > 0 ? 3 - tail : 0;
	    let units = (buf.length + tail) / 3;
	    const base64 = Buffer.alloc(units * 4);
	    if (tail > 0) {
	      units -= 1;
	    }
	    i = 0;
	    j = 0;
	    for (let u = 0; u < units; u += 1) {
	      n = buf[i++] << 16;
	      n += buf[i++] << 8;
	      n += buf[i++];
	      base64[j++] = base64codes[(n >> 18) & mask[6]];
	      base64[j++] = base64codes[(n >> 12) & mask[6]];
	      base64[j++] = base64codes[(n >> 6) & mask[6]];
	      base64[j++] = base64codes[n & mask[6]];
	    }
	    if (tail === 0) {
	      return base64;
	    }
	    if (tail === 1) {
	      n = buf[i++] << 16;
	      n += buf[i] << 8;
	      base64[j++] = base64codes[(n >> 18) & mask[6]];
	      base64[j++] = base64codes[(n >> 12) & mask[6]];
	      base64[j++] = base64codes[(n >> 6) & mask[6]];
	      base64[j] = base64codes[64];
	      return base64;
	    }
	    if (tail === 2) {
	      n = buf[i] << 16;
	      base64[j++] = base64codes[(n >> 18) & mask[6]];
	      base64[j++] = base64codes[(n >> 12) & mask[6]];
	      base64[j++] = base64codes[64];
	      base64[j] = base64codes[64];
	      return base64;
	    }
	    return undefined;
	  },
	  decode(codes) {
	    /* remove white space and ctrl characters, validate & translate characters */
	    function validate(buf) {
	      const chars = [];
	      let tail = 0;
	      for (let i = 0; i < buf.length; i += 1) {
	        const char = buf[i];
	        const TRUE = true;
	        while (TRUE) {
	          if (char === 32 || char === 9 || char === 10 || char === 13) {
	            break;
	          }
	          if (char >= 65 && char <= 90) {
	            chars.push(char - 65);
	            break;
	          }
	          if (char >= 97 && char <= 122) {
	            chars.push(char - 71);
	            break;
	          }
	          if (char >= 48 && char <= 57) {
	            chars.push(char + 4);
	            break;
	          }
	          if (char === 43) {
	            chars.push(62);
	            break;
	          }
	          if (char === 47) {
	            chars.push(63);
	            break;
	          }
	          if (char === 61) {
	            chars.push(64);
	            tail += 1;
	            break;
	          }
	          /* invalid character */
	          throw new RangeError(`base64.decode: invalid character buf[${i}]: ${char}`);
	        }
	      }
	      /* validate length */
	      if (chars.length % 4 > 0) {
	        throw new RangeError(`base64.decode: string length not integral multiple of 4: ${chars.length}`);
	      }
	      /* validate tail */
	      switch (tail) {
	        case 0:
	          break;
	        case 1:
	          if (chars[chars.length - 1] !== 64) {
	            throw new RangeError('base64.decode: one tail character found: not last character');
	          }
	          break;
	        case 2:
	          if (chars[chars.length - 1] !== 64 || chars[chars.length - 2] !== 64) {
	            throw new RangeError('base64.decode: two tail characters found: not last characters');
	          }
	          break;
	        default:
	          throw new RangeError(`base64.decode: more than two tail characters found: ${tail}`);
	      }
	      return { tail, buf: Buffer.from(chars) };
	    }

	    if (codes.length === 0) {
	      return Buffer.alloc(0);
	    }
	    const val = validate(codes);
	    const { tail } = val;
	    const base64 = val.buf;
	    let i;
	    let j;
	    let n;
	    let units = base64.length / 4;
	    const buf = Buffer.alloc(units * 3 - tail);
	    if (tail > 0) {
	      units -= 1;
	    }
	    j = 0;
	    i = 0;
	    for (let u = 0; u < units; u += 1) {
	      n = base64[i++] << 18;
	      n += base64[i++] << 12;
	      n += base64[i++] << 6;
	      n += base64[i++];
	      buf[j++] = (n >> 16) & mask[8];
	      buf[j++] = (n >> 8) & mask[8];
	      buf[j++] = n & mask[8];
	    }
	    if (tail === 1) {
	      n = base64[i++] << 18;
	      n += base64[i++] << 12;
	      n += base64[i] << 6;
	      buf[j++] = (n >> 16) & mask[8];
	      buf[j] = (n >> 8) & mask[8];
	    }
	    if (tail === 2) {
	      n = base64[i++] << 18;
	      n += base64[i++] << 12;
	      buf[j] = (n >> 16) & mask[8];
	    }
	    return buf;
	  },
	  // Converts a base 64 Buffer of bytes to a JavaScript string with line breaks.
	  toString(buf) {
	    if (buf.length % 4 > 0) {
	      throw new RangeError(`base64.toString: input buffer length not multiple of 4: ${buf.length}`);
	    }
	    let str = '';
	    let lineLen = 0;
	    function buildLine(c1, c2, c3, c4) {
	      switch (lineLen) {
	        case 76:
	          str += `\r\n${c1}${c2}${c3}${c4}`;
	          lineLen = 4;
	          break;
	        case 75:
	          str += `${c1}\r\n${c2}${c3}${c4}`;
	          lineLen = 3;
	          break;
	        case 74:
	          str += `${c1 + c2}\r\n${c3}${c4}`;
	          lineLen = 2;
	          break;
	        case 73:
	          str += `${c1 + c2 + c3}\r\n${c4}`;
	          lineLen = 1;
	          break;
	        default:
	          str += c1 + c2 + c3 + c4;
	          lineLen += 4;
	          break;
	      }
	    }
	    function validate(c) {
	      if (c >= 65 && c <= 90) {
	        return true;
	      }
	      if (c >= 97 && c <= 122) {
	        return true;
	      }
	      if (c >= 48 && c <= 57) {
	        return true;
	      }
	      if (c === 43) {
	        return true;
	      }
	      if (c === 47) {
	        return true;
	      }
	      if (c === 61) {
	        return true;
	      }
	      return false;
	    }
	    for (let i = 0; i < buf.length; i += 4) {
	      for (let j = i; j < i + 4; j += 1) {
	        if (!validate(buf[j])) {
	          throw new RangeError(`base64.toString: buf[${j}]: ${buf[j]} : not valid base64 character code`);
	        }
	      }
	      buildLine(
	        String.fromCharCode(buf[i]),
	        String.fromCharCode(buf[i + 1]),
	        String.fromCharCode(buf[i + 2]),
	        String.fromCharCode(buf[i + 3])
	      );
	    }
	    return str;
	  },
	}; 
} (transformers));

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

(function (exports) {
	// This module exposes the public encoding, decoding and conversion functions.
	// Its private functions provide the disassembling and interpetation of the source and destination encoding types.
	// In the case of Unicode encodings, private functions determine the presence of Byte Order Marks (BOMs), if any.
	//
	// Throws "TypeError" exceptions on input errors.
	//

	'use strict;';

	const { Buffer } = require$$0$1;

	const trans = transformers;

	/* types */
	const UTF8 = 'UTF8';
	const UTF16 = 'UTF16';
	const UTF16BE = 'UTF16BE';
	const UTF16LE = 'UTF16LE';
	const UTF32 = 'UTF32';
	const UTF32BE = 'UTF32BE';
	const UTF32LE = 'UTF32LE';
	const UINT7 = 'UINT7';
	const ASCII = 'ASCII';
	const BINARY = 'BINARY';
	const UINT8 = 'UINT8';
	const UINT16 = 'UINT16';
	const UINT16LE = 'UINT16LE';
	const UINT16BE = 'UINT16BE';
	const UINT32 = 'UINT32';
	const UINT32LE = 'UINT32LE';
	const UINT32BE = 'UINT32BE';
	const ESCAPED = 'ESCAPED';
	const STRING = 'STRING';

	/* private functions */
	// Find the UTF8 BOM, if any.
	const bom8 = function bom8(src) {
	  src.type = UTF8;
	  const buf = src.data;
	  src.bom = 0;
	  if (buf.length >= 3) {
	    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
	      src.bom = 3;
	    }
	  }
	};
	// Find the UTF16 BOM, if any, and determine the UTF16 type.
	// Defaults to UTF16BE.
	// Throws TypeError exception if BOM does not match the specified type.
	const bom16 = function bom16(src) {
	  const buf = src.data;
	  src.bom = 0;
	  switch (src.type) {
	    case UTF16:
	      src.type = UTF16BE;
	      if (buf.length >= 2) {
	        if (buf[0] === 0xfe && buf[1] === 0xff) {
	          src.bom = 2;
	        } else if (buf[0] === 0xff && buf[1] === 0xfe) {
	          src.type = UTF16LE;
	          src.bom = 2;
	        }
	      }
	      break;
	    case UTF16BE:
	      src.type = UTF16BE;
	      if (buf.length >= 2) {
	        if (buf[0] === 0xfe && buf[1] === 0xff) {
	          src.bom = 2;
	        } else if (buf[0] === 0xff && buf[1] === 0xfe) {
	          throw new TypeError(`src type: "${UTF16BE}" specified but BOM is for "${UTF16LE}"`);
	        }
	      }
	      break;
	    case UTF16LE:
	      src.type = UTF16LE;
	      if (buf.length >= 0) {
	        if (buf[0] === 0xfe && buf[1] === 0xff) {
	          throw new TypeError(`src type: "${UTF16LE}" specified but BOM is for "${UTF16BE}"`);
	        } else if (buf[0] === 0xff && buf[1] === 0xfe) {
	          src.bom = 2;
	        }
	      }
	      break;
	    default:
	      throw new TypeError(`UTF16 BOM: src type "${src.type}" unrecognized`);
	  }
	};
	// Find the UTF32 BOM, if any, and determine the UTF32 type.
	// Defaults to UTF32BE.
	// Throws exception if BOM does not match the specified type.
	const bom32 = function bom32(src) {
	  const buf = src.data;
	  src.bom = 0;
	  switch (src.type) {
	    case UTF32:
	      src.type = UTF32BE;
	      if (buf.length >= 4) {
	        if (buf[0] === 0 && buf[1] === 0 && buf[2] === 0xfe && buf[3] === 0xff) {
	          src.bom = 4;
	        }
	        if (buf[0] === 0xff && buf[1] === 0xfe && buf[2] === 0 && buf[3] === 0) {
	          src.type = UTF32LE;
	          src.bom = 4;
	        }
	      }
	      break;
	    case UTF32BE:
	      src.type = UTF32BE;
	      if (buf.length >= 4) {
	        if (buf[0] === 0 && buf[1] === 0 && buf[2] === 0xfe && buf[3] === 0xff) {
	          src.bom = 4;
	        }
	        if (buf[0] === 0xff && buf[1] === 0xfe && buf[2] === 0 && buf[3] === 0) {
	          throw new TypeError(`src type: ${UTF32BE} specified but BOM is for ${UTF32LE}"`);
	        }
	      }
	      break;
	    case UTF32LE:
	      src.type = UTF32LE;
	      if (buf.length >= 4) {
	        if (buf[0] === 0 && buf[1] === 0 && buf[2] === 0xfe && buf[3] === 0xff) {
	          throw new TypeError(`src type: "${UTF32LE}" specified but BOM is for "${UTF32BE}"`);
	        }
	        if (buf[0] === 0xff && buf[1] === 0xfe && buf[2] === 0 && buf[3] === 0) {
	          src.bom = 4;
	        }
	      }
	      break;
	    default:
	      throw new TypeError(`UTF32 BOM: src type "${src.type}" unrecognized`);
	  }
	};
	// Validates the source encoding type and matching data.
	// If the BASE64: prefix is present, the base 64 decoding is done here as the initial step.
	// - For type STRING, data must be a JavaScript string.
	// - For type BASE64:*, data may be a string or Buffer.
	// - For all other types, data must be a Buffer.
	// - The BASE64: prefix is not allowed for type STRING.
	const validateSrc = function validateSrc(type, data) {
	  function getType(typeArg) {
	    const ret = {
	      type: '',
	      base64: false,
	    };
	    const rx = /^(base64:)?([a-zA-Z0-9]+)$/i;
	    const result = rx.exec(typeArg);
	    if (result) {
	      if (result[2]) {
	        ret.type = result[2].toUpperCase();
	      }
	      if (result[1]) {
	        ret.base64 = true;
	      }
	    }
	    return ret;
	  }
	  const ret = getType(type.toUpperCase());
	  if (ret.base64) {
	    /* handle base 64 */
	    if (ret.type === STRING) {
	      throw new TypeError(`type: "${type} "BASE64:" prefix not allowed with type ${STRING}`);
	    }
	    if (Buffer.isBuffer(data)) {
	      ret.data = trans.base64.decode(data);
	    } else if (typeof data === 'string') {
	      const buf = Buffer.from(data, 'ascii');
	      ret.data = trans.base64.decode(buf);
	    } else {
	      throw new TypeError(`type: "${type} unrecognized data type: typeof(data): ${typeof data}`);
	    }
	  } else {
	    ret.data = data;
	  }
	  switch (ret.type) {
	    case UTF8:
	      bom8(ret);
	      break;
	    case UTF16:
	    case UTF16BE:
	    case UTF16LE:
	      bom16(ret);
	      break;
	    case UTF32:
	    case UTF32BE:
	    case UTF32LE:
	      bom32(ret);
	      break;
	    case UINT16:
	      ret.type = UINT16BE;
	      break;
	    case UINT32:
	      ret.type = UINT32BE;
	      break;
	    case ASCII:
	      ret.type = UINT7;
	      break;
	    case BINARY:
	      ret.type = UINT8;
	      break;
	    case UINT7:
	    case UINT8:
	    case UINT16LE:
	    case UINT16BE:
	    case UINT32LE:
	    case UINT32BE:
	    case STRING:
	    case ESCAPED:
	      break;
	    default:
	      throw new TypeError(`type: "${type}" not recognized`);
	  }
	  if (ret.type === STRING) {
	    if (typeof ret.data !== 'string') {
	      throw new TypeError(`type: "${type}" but data is not a string`);
	    }
	  } else if (!Buffer.isBuffer(ret.data)) {
	    throw new TypeError(`type: "${type}" but data is not a Buffer`);
	  }
	  return ret;
	};
	// Disassembles and validates the destination type.
	// `chars` must be an Array of integers.
	// The :BASE64 suffix is not allowed for type STRING.
	const validateDst = function validateDst(type, chars) {
	  function getType(typeArg) {
	    let fix;
	    let rem;
	    const ret = {
	      crlf: false,
	      lf: false,
	      base64: false,
	      type: '',
	    };
	    /* prefix, if any */
	    const TRUE = true;
	    while (TRUE) {
	      rem = typeArg;
	      fix = typeArg.slice(0, 5);
	      if (fix === 'CRLF:') {
	        ret.crlf = true;
	        rem = typeArg.slice(5);
	        break;
	      }
	      fix = typeArg.slice(0, 3);
	      if (fix === 'LF:') {
	        ret.lf = true;
	        rem = typeArg.slice(3);
	        break;
	      }
	      break;
	    }
	    /* suffix, if any */
	    fix = rem.split(':');
	    if (fix.length === 1) {
	      // eslint-disable-next-line prefer-destructuring
	      ret.type = fix[0];
	    } else if (fix.length === 2 && fix[1] === 'BASE64') {
	      ret.base64 = true;
	      // eslint-disable-next-line prefer-destructuring
	      ret.type = fix[0];
	    }
	    return ret;
	  }
	  if (!Array.isArray(chars)) {
	    throw new TypeError(`dst chars: not array: "${typeof chars}`);
	  }
	  if (typeof type !== 'string') {
	    throw new TypeError(`dst type: not string: "${typeof type}`);
	  }
	  const ret = getType(type.toUpperCase());
	  switch (ret.type) {
	    case UTF8:
	    case UTF16BE:
	    case UTF16LE:
	    case UTF32BE:
	    case UTF32LE:
	    case UINT7:
	    case UINT8:
	    case UINT16LE:
	    case UINT16BE:
	    case UINT32LE:
	    case UINT32BE:
	    case ESCAPED:
	      break;
	    case STRING:
	      if (ret.base64) {
	        throw new TypeError(`":BASE64" suffix not allowed with type ${STRING}`);
	      }
	      break;
	    case ASCII:
	      ret.type = UINT7;
	      break;
	    case BINARY:
	      ret.type = UINT8;
	      break;
	    case UTF16:
	      ret.type = UTF16BE;
	      break;
	    case UTF32:
	      ret.type = UTF32BE;
	      break;
	    case UINT16:
	      ret.type = UINT16BE;
	      break;
	    case UINT32:
	      ret.type = UINT32BE;
	      break;
	    default:
	      throw new TypeError(`dst type unrecognized: "${type}" : must have form [crlf:|lf:]type[:base64]`);
	  }
	  return ret;
	};
	// Select and call the requested encoding function.
	const encode = function encode(type, chars) {
	  switch (type) {
	    case UTF8:
	      return trans.utf8.encode(chars);
	    case UTF16BE:
	      return trans.utf16be.encode(chars);
	    case UTF16LE:
	      return trans.utf16le.encode(chars);
	    case UTF32BE:
	      return trans.utf32be.encode(chars);
	    case UTF32LE:
	      return trans.utf32le.encode(chars);
	    case UINT7:
	      return trans.uint7.encode(chars);
	    case UINT8:
	      return trans.uint8.encode(chars);
	    case UINT16BE:
	      return trans.uint16be.encode(chars);
	    case UINT16LE:
	      return trans.uint16le.encode(chars);
	    case UINT32BE:
	      return trans.uint32be.encode(chars);
	    case UINT32LE:
	      return trans.uint32le.encode(chars);
	    case STRING:
	      return trans.string.encode(chars);
	    case ESCAPED:
	      return trans.escaped.encode(chars);
	    default:
	      throw new TypeError(`encode type "${type}" not recognized`);
	  }
	};
	// Select and call the requested decoding function.
	// `src` contains BOM information as well as the source type and data.
	const decode = function decode(src) {
	  switch (src.type) {
	    case UTF8:
	      return trans.utf8.decode(src.data, src.bom);
	    case UTF16LE:
	      return trans.utf16le.decode(src.data, src.bom);
	    case UTF16BE:
	      return trans.utf16be.decode(src.data, src.bom);
	    case UTF32BE:
	      return trans.utf32be.decode(src.data, src.bom);
	    case UTF32LE:
	      return trans.utf32le.decode(src.data, src.bom);
	    case UINT7:
	      return trans.uint7.decode(src.data);
	    case UINT8:
	      return trans.uint8.decode(src.data);
	    case UINT16BE:
	      return trans.uint16be.decode(src.data);
	    case UINT16LE:
	      return trans.uint16le.decode(src.data);
	    case UINT32BE:
	      return trans.uint32be.decode(src.data);
	    case UINT32LE:
	      return trans.uint32le.decode(src.data);
	    case STRING:
	      return trans.string.decode(src.data);
	    case ESCAPED:
	      return trans.escaped.decode(src.data);
	    default:
	      throw new TypeError(`decode type "${src.type}" not recognized`);
	  }
	};

	// The public decoding function. Returns an array of integers.
	exports.decode = function exportsDecode(type, data) {
	  const src = validateSrc(type, data);
	  return decode(src);
	};
	// The public encoding function. Returns a Buffer-typed byte array.
	exports.encode = function exportsEncode(type, chars) {
	  let c;
	  let buf;
	  const dst = validateDst(type, chars);
	  if (dst.crlf) {
	    /* prefix with CRLF line end conversion, don't contaminate caller's chars array */
	    c = trans.lineEnds.crlf(chars);
	    buf = encode(dst.type, c);
	  } else if (dst.lf) {
	    /* prefix with LF line end conversion, don't contaminate caller's chars array */
	    c = trans.lineEnds.lf(chars);
	    buf = encode(dst.type, c);
	  } else {
	    buf = encode(dst.type, chars);
	  }
	  if (dst.base64) {
	    /* post base 64 encoding */
	    buf = trans.base64.encode(buf);
	  }
	  return buf;
	};
	// Converts data of type `srcType` to data of type `dstType`.
	// `srcData` may be a JavaScript String, or node.js Buffer, depending on the corresponding type.
	const convert = function convert(srcType, srcData, dstType) {
	  return exports.encode(dstType, exports.decode(srcType, srcData));
	};
	exports.convert = convert; 
} (converter));

// This module has been developed programmatically in the `apg-lib` build process.
// It is used to build web pages programatically on the fly without the need for <script> or <style> tags.

var emitcss = function emittcss(){
return '/* This file automatically generated by jsonToless() and LESS. */\n.apg-mono {\n  font-family: monospace;\n}\n.apg-active {\n  font-weight: bold;\n  color: #000000;\n}\n.apg-match {\n  font-weight: bold;\n  color: #264BFF;\n}\n.apg-empty {\n  font-weight: bold;\n  color: #0fbd0f;\n}\n.apg-nomatch {\n  font-weight: bold;\n  color: #FF4000;\n}\n.apg-lh-match {\n  font-weight: bold;\n  color: #1A97BA;\n}\n.apg-lb-match {\n  font-weight: bold;\n  color: #5F1687;\n}\n.apg-remainder {\n  font-weight: bold;\n  color: #999999;\n}\n.apg-ctrl-char {\n  font-weight: bolder;\n  font-style: italic;\n  font-size: 0.6em;\n}\n.apg-line-end {\n  font-weight: bold;\n  color: #000000;\n}\n.apg-error {\n  font-weight: bold;\n  color: #FF4000;\n}\n.apg-phrase {\n  color: #000000;\n  background-color: #8caae6;\n}\n.apg-empty-phrase {\n  color: #0fbd0f;\n}\ntable.apg-state {\n  font-family: monospace;\n  margin-top: 5px;\n  font-size: 11px;\n  line-height: 130%;\n  text-align: left;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-state th,\ntable.apg-state td {\n  text-align: left;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-state th:nth-last-child(2),\ntable.apg-state td:nth-last-child(2) {\n  text-align: right;\n}\ntable.apg-state caption {\n  font-size: 125%;\n  line-height: 130%;\n  font-weight: bold;\n  text-align: left;\n}\ntable.apg-stats {\n  font-family: monospace;\n  margin-top: 5px;\n  font-size: 11px;\n  line-height: 130%;\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-stats th,\ntable.apg-stats td {\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-stats caption {\n  font-size: 125%;\n  line-height: 130%;\n  font-weight: bold;\n  text-align: left;\n}\ntable.apg-trace {\n  font-family: monospace;\n  margin-top: 5px;\n  font-size: 11px;\n  line-height: 130%;\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-trace caption {\n  font-size: 125%;\n  line-height: 130%;\n  font-weight: bold;\n  text-align: left;\n}\ntable.apg-trace th,\ntable.apg-trace td {\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-trace th:last-child,\ntable.apg-trace th:nth-last-child(2),\ntable.apg-trace td:last-child,\ntable.apg-trace td:nth-last-child(2) {\n  text-align: left;\n}\ntable.apg-grammar {\n  font-family: monospace;\n  margin-top: 5px;\n  font-size: 11px;\n  line-height: 130%;\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-grammar caption {\n  font-size: 125%;\n  line-height: 130%;\n  font-weight: bold;\n  text-align: left;\n}\ntable.apg-grammar th,\ntable.apg-grammar td {\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-grammar th:last-child,\ntable.apg-grammar td:last-child {\n  text-align: left;\n}\ntable.apg-rules {\n  font-family: monospace;\n  margin-top: 5px;\n  font-size: 11px;\n  line-height: 130%;\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-rules caption {\n  font-size: 125%;\n  line-height: 130%;\n  font-weight: bold;\n  text-align: left;\n}\ntable.apg-rules th,\ntable.apg-rules td {\n  text-align: right;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-rules a {\n  color: #003399 !important;\n}\ntable.apg-rules a:hover {\n  color: #8caae6 !important;\n}\ntable.apg-attrs {\n  font-family: monospace;\n  margin-top: 5px;\n  font-size: 11px;\n  line-height: 130%;\n  text-align: center;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-attrs caption {\n  font-size: 125%;\n  line-height: 130%;\n  font-weight: bold;\n  text-align: left;\n}\ntable.apg-attrs th,\ntable.apg-attrs td {\n  text-align: center;\n  border: 1px solid black;\n  border-collapse: collapse;\n}\ntable.apg-attrs th:nth-child(1),\ntable.apg-attrs th:nth-child(2),\ntable.apg-attrs th:nth-child(3) {\n  text-align: right;\n}\ntable.apg-attrs td:nth-child(1),\ntable.apg-attrs td:nth-child(2),\ntable.apg-attrs td:nth-child(3) {\n  text-align: right;\n}\ntable.apg-attrs a {\n  color: #003399 !important;\n}\ntable.apg-attrs a:hover {\n  color: #8caae6 !important;\n}\n';
};

/* eslint-disable func-names */

(function (exports) {
	/*  *************************************************************************************
	 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
	 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
	 *   ********************************************************************************* */
	// This module exports a variety of utility functions that support
	// [`apg`](https://github.com/ldthomas/apg-js2), [`apg-lib`](https://github.com/ldthomas/apg-js2-lib)
	// and the generated parser applications.

	const style$1 = style;
	const converter$1 = converter;
	const emitCss = emitcss;
	const id = identifiers;

	const thisFileName = 'utilities.js: ';

	/* translate (implied) phrase beginning character and length to actual first and last character indexes */
	/* used by multiple phrase handling functions */
	const getBounds = function (length, begArg, len) {
	  let end;
	  let beg = begArg;
	  const TRUE = true;
	  while (TRUE) {
	    if (length <= 0) {
	      beg = 0;
	      end = 0;
	      break;
	    }
	    if (typeof beg !== 'number') {
	      beg = 0;
	      end = length;
	      break;
	    }
	    if (beg >= length) {
	      beg = length;
	      end = length;
	      break;
	    }
	    if (typeof len !== 'number') {
	      end = length;
	      break;
	    }
	    end = beg + len;
	    if (end > length) {
	      end = length;
	      break;
	    }
	    break;
	  }
	  return {
	    beg,
	    end,
	  };
	};
	// Generates a complete, minimal HTML5 page, inserting the user's HTML text on the page.
	// - *html* - the page text in HTML format
	// - *title* - the HTML page `<title>` - defaults to `htmlToPage`.
	exports.htmlToPage = function (html, titleArg) {
	  let title;
	  if (typeof html !== 'string') {
	    throw new Error(`${thisFileName}htmlToPage: input HTML is not a string`);
	  }
	  if (typeof titleArg !== 'string') {
	    title = 'htmlToPage';
	  } else {
	    title = titleArg;
	  }
	  let page = '';
	  page += '<!DOCTYPE html>\n';
	  page += '<html lang="en">\n';
	  page += '<head>\n';
	  page += '<meta charset="utf-8">\n';
	  page += `<title>${title}</title>\n`;
	  page += '<style>\n';
	  page += emitCss();
	  page += '</style>\n';
	  page += '</head>\n<body>\n';
	  page += `<p>${new Date()}</p>\n`;
	  page += html;
	  page += '</body>\n</html>\n';
	  return page;
	};
	// Formats the returned object from `parser.parse()`
	// into an HTML table.
	// ```
	// return {
	//   success : sysData.success,
	//   state : sysData.state,
	//   length : charsLength,
	//   matched : sysData.phraseLength,
	//   maxMatched : maxMatched,
	//   maxTreeDepth : maxTreeDepth,
	//   nodeHits : nodeHits,
	//   inputLength : chars.length,
	//   subBegin : charsBegin,
	//   subEnd : charsEnd,
	//   subLength : charsLength
	// };
	// ```
	exports.parserResultToHtml = function (result, caption) {
	  let cap = null;
	  if (typeof caption === 'string' && caption !== '') {
	    cap = caption;
	  }
	  let success;
	  let state;
	  if (result.success === true) {
	    success = `<span class="${style$1.CLASS_MATCH}">true</span>`;
	  } else {
	    success = `<span class="${style$1.CLASS_NOMATCH}">false</span>`;
	  }
	  if (result.state === id.EMPTY) {
	    state = `<span class="${style$1.CLASS_EMPTY}">EMPTY</span>`;
	  } else if (result.state === id.MATCH) {
	    state = `<span class="${style$1.CLASS_MATCH}">MATCH</span>`;
	  } else if (result.state === id.NOMATCH) {
	    state = `<span class="${style$1.CLASS_NOMATCH}">NOMATCH</span>`;
	  } else {
	    state = `<span class="${style$1.CLASS_NOMATCH}">unrecognized</span>`;
	  }
	  let html = '';
	  html += `<table class="${style$1.CLASS_STATE}">\n`;
	  if (cap) {
	    html += `<caption>${cap}</caption>\n`;
	  }
	  html += '<tr><th>state item</th><th>value</th><th>description</th></tr>\n';
	  html += `<tr><td>parser success</td><td>${success}</td>\n`;
	  html += `<td><span class="${style$1.CLASS_MATCH}">true</span> if the parse succeeded,\n`;
	  html += ` <span class="${style$1.CLASS_NOMATCH}">false</span> otherwise`;
	  html += '<br><i>NOTE: for success, entire string must be matched</i></td></tr>\n';
	  html += `<tr><td>parser state</td><td>${state}</td>\n`;
	  html += `<td><span class="${style$1.CLASS_EMPTY}">EMPTY</span>, `;
	  html += `<span class="${style$1.CLASS_MATCH}">MATCH</span> or \n`;
	  html += `<span class="${style$1.CLASS_NOMATCH}">NOMATCH</span></td></tr>\n`;
	  html += `<tr><td>string length</td><td>${result.length}</td><td>length of the input (sub)string</td></tr>\n`;
	  html += `<tr><td>matched length</td><td>${result.matched}</td><td>number of input string characters matched</td></tr>\n`;
	  html += `<tr><td>max matched</td><td>${result.maxMatched}</td><td>maximum number of input string characters matched</td></tr>\n`;
	  html += `<tr><td>max tree depth</td><td>${result.maxTreeDepth}</td><td>maximum depth of the parse tree reached</td></tr>\n`;
	  html += `<tr><td>node hits</td><td>${result.nodeHits}</td><td>number of parse tree node hits (opcode function calls)</td></tr>\n`;
	  html += `<tr><td>input length</td><td>${result.inputLength}</td><td>length of full input string</td></tr>\n`;
	  html += `<tr><td>sub-string begin</td><td>${result.subBegin}</td><td>sub-string first character index</td></tr>\n`;
	  html += `<tr><td>sub-string end</td><td>${result.subEnd}</td><td>sub-string end-of-string index</td></tr>\n`;
	  html += `<tr><td>sub-string length</td><td>${result.subLength}</td><td>sub-string length</td></tr>\n`;
	  html += '</table>\n';
	  return html;
	};
	// Translates a sub-array of integer character codes into a string.
	// Very useful in callback functions to translate the matched phrases into strings.
	exports.charsToString = function (chars, phraseIndex, phraseLength) {
	  let beg;
	  let end;
	  if (typeof phraseIndex === 'number') {
	    if (phraseIndex >= chars.length) {
	      return '';
	    }
	    beg = phraseIndex < 0 ? 0 : phraseIndex;
	  } else {
	    beg = 0;
	  }
	  if (typeof phraseLength === 'number') {
	    if (phraseLength <= 0) {
	      return '';
	    }
	    end = phraseLength > chars.length - beg ? chars.length : beg + phraseLength;
	  } else {
	    end = chars.length;
	  }
	  if (beg < end) {
	    return converter$1.encode('UTF16LE', chars.slice(beg, end)).toString('utf16le');
	  }
	  return '';
	};
	// Translates a string into an array of integer character codes.
	exports.stringToChars = function (string) {
	  return converter$1.decode('STRING', string);
	};
	// Translates an opcode identifier into a human-readable string.
	exports.opcodeToString = function (type) {
	  let ret = 'unknown';
	  switch (type) {
	    case id.ALT:
	      ret = 'ALT';
	      break;
	    case id.CAT:
	      ret = 'CAT';
	      break;
	    case id.RNM:
	      ret = 'RNM';
	      break;
	    case id.UDT:
	      ret = 'UDT';
	      break;
	    case id.AND:
	      ret = 'AND';
	      break;
	    case id.NOT:
	      ret = 'NOT';
	      break;
	    case id.REP:
	      ret = 'REP';
	      break;
	    case id.TRG:
	      ret = 'TRG';
	      break;
	    case id.TBS:
	      ret = 'TBS';
	      break;
	    case id.TLS:
	      ret = 'TLS';
	      break;
	    case id.BKR:
	      ret = 'BKR';
	      break;
	    case id.BKA:
	      ret = 'BKA';
	      break;
	    case id.BKN:
	      ret = 'BKN';
	      break;
	    case id.ABG:
	      ret = 'ABG';
	      break;
	    case id.AEN:
	      ret = 'AEN';
	      break;
	    default:
	      throw new Error('unrecognized opcode');
	  }
	  return ret;
	};
	// Translates an state identifier into a human-readable string.
	exports.stateToString = function (state) {
	  let ret = 'unknown';
	  switch (state) {
	    case id.ACTIVE:
	      ret = 'ACTIVE';
	      break;
	    case id.MATCH:
	      ret = 'MATCH';
	      break;
	    case id.EMPTY:
	      ret = 'EMPTY';
	      break;
	    case id.NOMATCH:
	      ret = 'NOMATCH';
	      break;
	    default:
	      throw new Error('unrecognized state');
	  }
	  return ret;
	};
	// Array which translates all 128, 7-bit ASCII character codes to their respective HTML format.
	exports.asciiChars = [
	  'NUL',
	  'SOH',
	  'STX',
	  'ETX',
	  'EOT',
	  'ENQ',
	  'ACK',
	  'BEL',
	  'BS',
	  'TAB',
	  'LF',
	  'VT',
	  'FF',
	  'CR',
	  'SO',
	  'SI',
	  'DLE',
	  'DC1',
	  'DC2',
	  'DC3',
	  'DC4',
	  'NAK',
	  'SYN',
	  'ETB',
	  'CAN',
	  'EM',
	  'SUB',
	  'ESC',
	  'FS',
	  'GS',
	  'RS',
	  'US',
	  '&nbsp;',
	  '!',
	  '&#34;',
	  '#',
	  '$',
	  '%',
	  '&#38;',
	  '&#39;',
	  '(',
	  ')',
	  '*',
	  '+',
	  ',',
	  '-',
	  '.',
	  '/',
	  '0',
	  '1',
	  '2',
	  '3',
	  '4',
	  '5',
	  '6',
	  '7',
	  '8',
	  '9',
	  ':',
	  ';',
	  '&#60;',
	  '=',
	  '&#62;',
	  '?',
	  '@',
	  'A',
	  'B',
	  'C',
	  'D',
	  'E',
	  'F',
	  'G',
	  'H',
	  'I',
	  'J',
	  'K',
	  'L',
	  'M',
	  'N',
	  'O',
	  'P',
	  'Q',
	  'R',
	  'S',
	  'T',
	  'U',
	  'V',
	  'W',
	  'X',
	  'Y',
	  'Z',
	  '[',
	  '&#92;',
	  ']',
	  '^',
	  '_',
	  '`',
	  'a',
	  'b',
	  'c',
	  'd',
	  'e',
	  'f',
	  'g',
	  'h',
	  'i',
	  'j',
	  'k',
	  'l',
	  'm',
	  'n',
	  'o',
	  'p',
	  'q',
	  'r',
	  's',
	  't',
	  'u',
	  'v',
	  'w',
	  'x',
	  'y',
	  'z',
	  '{',
	  '|',
	  '}',
	  '~',
	  'DEL',
	];
	// Translates a single character to hexadecimal with leading zeros for 2, 4, or 8 digit display.
	exports.charToHex = function (char) {
	  let ch = char.toString(16).toUpperCase();
	  switch (ch.length) {
	    case 1:
	    case 3:
	    case 7:
	      ch = `0${ch}`;
	      break;
	    case 2:
	    case 6:
	      ch = `00${ch}`;
	      break;
	    case 4:
	      break;
	    case 5:
	      ch = `000${ch}`;
	      break;
	    default:
	      throw new Error('unrecognized option');
	  }
	  return ch;
	};
	// Translates a sub-array of character codes to decimal display format.
	exports.charsToDec = function (chars, beg, len) {
	  let ret = '';
	  if (!Array.isArray(chars)) {
	    throw new Error(`${thisFileName}charsToDec: input must be an array of integers`);
	  }
	  const bounds = getBounds(chars.length, beg, len);
	  if (bounds.end > bounds.beg) {
	    ret += chars[bounds.beg];
	    for (let i = bounds.beg + 1; i < bounds.end; i += 1) {
	      ret += `,${chars[i]}`;
	    }
	  }
	  return ret;
	};
	// Translates a sub-array of character codes to hexadecimal display format.
	exports.charsToHex = function (chars, beg, len) {
	  let ret = '';
	  if (!Array.isArray(chars)) {
	    throw new Error(`${thisFileName}charsToHex: input must be an array of integers`);
	  }
	  const bounds = getBounds(chars.length, beg, len);
	  if (bounds.end > bounds.beg) {
	    ret += `\\x${exports.charToHex(chars[bounds.beg])}`;
	    for (let i = bounds.beg + 1; i < bounds.end; i += 1) {
	      ret += `,\\x${exports.charToHex(chars[i])}`;
	    }
	  }
	  return ret;
	};
	exports.charsToHtmlEntities = function (chars, beg, len) {
	  let ret = '';
	  if (!Array.isArray(chars)) {
	    throw new Error(`${thisFileName}charsToHex: input must be an array of integers`);
	  }
	  const bounds = getBounds(chars.length, beg, len);
	  if (bounds.end > bounds.beg) {
	    for (let i = bounds.beg; i < bounds.end; i += 1) {
	      ret += `&#x${chars[i].toString(16)};`;
	    }
	  }
	  return ret;
	};
	// Translates a sub-array of character codes to Unicode display format.
	function isUnicode(char) {
	  if (char >= 0xd800 && char <= 0xdfff) {
	    return false;
	  }
	  if (char > 0x10ffff) {
	    return false;
	  }
	  return true;
	}
	exports.charsToUnicode = function (chars, beg, len) {
	  let ret = '';
	  if (!Array.isArray(chars)) {
	    throw new Error(`${thisFileName}charsToUnicode: input must be an array of integers`);
	  }
	  const bounds = getBounds(chars.length, beg, len);
	  if (bounds.end > bounds.beg) {
	    for (let i = bounds.beg; i < bounds.end; i += 1) {
	      if (isUnicode(chars[i])) {
	        ret += `&#${chars[i]};`;
	      } else {
	        ret += ` U+${exports.charToHex(chars[i])}`;
	      }
	    }
	  }
	  return ret;
	};
	// Translates a sub-array of character codes to JavaScript Unicode display format (`\uXXXX`).
	exports.charsToJsUnicode = function (chars, beg, len) {
	  let ret = '';
	  if (!Array.isArray(chars)) {
	    throw new Error(`${thisFileName}charsToJsUnicode: input must be an array of integers`);
	  }
	  const bounds = getBounds(chars.length, beg, len);
	  if (bounds.end > bounds.beg) {
	    ret += `\\u${exports.charToHex(chars[bounds.beg])}`;
	    for (let i = bounds.beg + 1; i < bounds.end; i += 1) {
	      ret += `,\\u${exports.charToHex(chars[i])}`;
	    }
	  }
	  return ret;
	};
	// Translates a sub-array of character codes to printing ASCII character display format.
	exports.charsToAscii = function (chars, beg, len) {
	  let ret = '';
	  if (!Array.isArray(chars)) {
	    throw new Error(`${thisFileName}charsToAscii: input must be an array of integers`);
	  }
	  const bounds = getBounds(chars.length, beg, len);
	  for (let i = bounds.beg; i < bounds.end; i += 1) {
	    const char = chars[i];
	    if (char >= 32 && char <= 126) {
	      ret += String.fromCharCode(char);
	    } else {
	      ret += `\\x${exports.charToHex(char)}`;
	    }
	  }
	  return ret;
	};
	// Translates a sub-array of character codes to HTML display format.
	exports.charsToAsciiHtml = function (chars, beg, len) {
	  if (!Array.isArray(chars)) {
	    throw new Error(`${thisFileName}charsToAsciiHtml: input must be an array of integers`);
	  }
	  let html = '';
	  let char;
	  const bounds = getBounds(chars.length, beg, len);
	  for (let i = bounds.beg; i < bounds.end; i += 1) {
	    char = chars[i];
	    if (char < 32 || char === 127) {
	      /* control characters */
	      html += `<span class="${style$1.CLASS_CTRLCHAR}">${exports.asciiChars[char]}</span>`;
	    } else if (char > 127) {
	      /* non-ASCII */
	      html += `<span class="${style$1.CLASS_CTRLCHAR}">U+${exports.charToHex(char)}</span>`;
	    } else {
	      /* printing ASCII, 32 <= char <= 126 */
	      html += exports.asciiChars[char];
	    }
	  }
	  return html;
	};
	// Translates a JavaScript string to HTML display format.
	exports.stringToAsciiHtml = function (str) {
	  const chars = converter$1.decode('STRING', str);
	  return this.charsToAsciiHtml(chars);
	}; 
} (utilities));

/* eslint-disable guard-for-in */

/* eslint-disable no-restricted-syntax */
/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */
// This module is used by the parser to build an [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST).
// The AST can be thought of as a subset of the full parse tree.
// Each node of the AST holds the phrase that was matched at the corresponding, named parse tree node.
// It is built as the parser successfully matches phrases to the rule names
// (`RNM` operators) and `UDT`s as it parses an input string.
// The user controls which `RNM` or `UDT` names to keep on the AST.
// The user can also associate callback functions with some or all of the retained
// AST nodes to be used to translate the node phrases. That is, associate semantic
// actions to the matched phrases.
// Translating the AST rather that attempting to apply semantic actions during
// the parsing process, has the advantage that there is no backtracking and that the phrases
// are known while traversing down tree as will as up.
//
// Let `ast` be an `ast.js` object. To identify a node to be kept on the AST:
// ```
// ast.callbacks["rulename"] = true; (all nodes default to false)
// ```
// To associate a callback function with a node:
// ```
// ast.callbacks["rulename"] = fn
// ```
// `rulename` is any `RNM` or `UDT` name defined by the associated grammar
// and `fn` is a user-written callback function.
// (See [`apg-examples`](https://github.com/ldthomas/apg-js2-examples/tree/master/ast) for examples of how to create an AST,
// define the nodes and callback functions and attach it to a parser.)
var ast = function exportsAst() {
  const id = identifiers;
  const utils = utilities;

  const thisFileName = 'ast.js: ';
  const that = this;
  let rules = null;
  let udts = null;
  let chars = null;
  let nodeCount = 0;
  const nodesDefined = [];
  const nodeCallbacks = [];
  const stack = [];
  const records = [];
  this.callbacks = [];
  this.astObject = 'astObject';
  /* called by the parser to initialize the AST with the rules, UDTs and the input characters */
  this.init = function init(rulesIn, udtsIn, charsIn) {
    stack.length = 0;
    records.length = 0;
    nodesDefined.length = 0;
    nodeCount = 0;
    rules = rulesIn;
    udts = udtsIn;
    chars = charsIn;
    let i;
    const list = [];
    for (i = 0; i < rules.length; i += 1) {
      list.push(rules[i].lower);
    }
    for (i = 0; i < udts.length; i += 1) {
      list.push(udts[i].lower);
    }
    nodeCount = rules.length + udts.length;
    for (i = 0; i < nodeCount; i += 1) {
      nodesDefined[i] = false;
      nodeCallbacks[i] = null;
    }
    for (const index in that.callbacks) {
      const lower = index.toLowerCase();
      i = list.indexOf(lower);
      if (i < 0) {
        throw new Error(`${thisFileName}init: node '${index}' not a rule or udt name`);
      }
      if (typeof that.callbacks[index] === 'function') {
        nodesDefined[i] = true;
        nodeCallbacks[i] = that.callbacks[index];
      }
      if (that.callbacks[index] === true) {
        nodesDefined[i] = true;
      }
    }
  };
  /* AST node definitions - called by the parser's `RNM` operator */
  this.ruleDefined = function ruleDefined(index) {
    return nodesDefined[index] !== false;
  };
  /* AST node definitions - called by the parser's `UDT` operator */
  this.udtDefined = function udtDefined(index) {
    return nodesDefined[rules.length + index] !== false;
  };
  /* called by the parser's `RNM` & `UDT` operators */
  /* builds a record for the downward traversal of the node */
  this.down = function down(callbackIndex, name) {
    const thisIndex = records.length;
    stack.push(thisIndex);
    records.push({
      name,
      thisIndex,
      thatIndex: null,
      state: id.SEM_PRE,
      callbackIndex,
      phraseIndex: null,
      phraseLength: null,
      stack: stack.length,
    });
    return thisIndex;
  };
  /* called by the parser's `RNM` & `UDT` operators */
  /* builds a record for the upward traversal of the node */
  this.up = function up(callbackIndex, name, phraseIndex, phraseLength) {
    const thisIndex = records.length;
    const thatIndex = stack.pop();
    records.push({
      name,
      thisIndex,
      thatIndex,
      state: id.SEM_POST,
      callbackIndex,
      phraseIndex,
      phraseLength,
      stack: stack.length,
    });
    records[thatIndex].thatIndex = thisIndex;
    records[thatIndex].phraseIndex = phraseIndex;
    records[thatIndex].phraseLength = phraseLength;
    return thisIndex;
  };
  // Called by the user to translate the AST.
  // Translate means to associate or apply some semantic action to the
  // phrases that were syntactically matched to the AST nodes according
  // to the defining grammar.
  // ```
  // data - optional user-defined data
  //        passed to the callback functions by the translator
  // ```
  this.translate = function translate(data) {
    let ret;
    let callback;
    let record;
    for (let i = 0; i < records.length; i += 1) {
      record = records[i];
      callback = nodeCallbacks[record.callbackIndex];
      if (record.state === id.SEM_PRE) {
        if (callback !== null) {
          ret = callback(id.SEM_PRE, chars, record.phraseIndex, record.phraseLength, data);
          if (ret === id.SEM_SKIP) {
            i = record.thatIndex;
          }
        }
      } else if (callback !== null) {
        callback(id.SEM_POST, chars, record.phraseIndex, record.phraseLength, data);
      }
    }
  };
  /* called by the parser to reset the length of the records array */
  /* necessary on backtracking */
  this.setLength = function setLength(length) {
    records.length = length;
    if (length > 0) {
      stack.length = records[length - 1].stack;
    } else {
      stack.length = 0;
    }
  };
  /* called by the parser to get the length of the records array */
  this.getLength = function getLength() {
    return records.length;
  };
  /* helper for XML display */
  function indent(n) {
    let ret = '';
    for (let i = 0; i < n; i += 1) {
      ret += ' ';
    }
    return ret;
  }
  // Generate an `XML` version of the AST.
  // Useful if you want to use a special or favorite XML parser to translate the
  // AST.
  // ```
  // mode - the display mode of the captured phrases
  //      - default mode is "ascii"
  //      - can be: "ascii"
  //                "decimal"
  //                "hexadecimal"
  //                "unicode"
  // ```
  this.toXml = function toSml(modeArg) {
    let display = utils.charsToDec;
    let caption = 'decimal integer character codes';
    if (typeof modeArg === 'string' && modeArg.length >= 3) {
      const mode = modeArg.slice(0, 3).toLowerCase();
      if (mode === 'asc') {
        display = utils.charsToAscii;
        caption = 'ASCII for printing characters, hex for non-printing';
      } else if (mode === 'hex') {
        display = utils.charsToHex;
        caption = 'hexadecimal integer character codes';
      } else if (mode === 'uni') {
        display = utils.charsToUnicode;
        caption = 'Unicode UTF-32 integer character codes';
      }
    }
    let xml = '';
    let depth = 0;
    xml += '<?xml version="1.0" encoding="utf-8"?>\n';
    xml += `<root nodes="${records.length / 2}" characters="${chars.length}">\n`;
    xml += `<!-- input string, ${caption} -->\n`;
    xml += indent(depth + 2);
    xml += display(chars);
    xml += '\n';
    records.forEach((rec) => {
      if (rec.state === id.SEM_PRE) {
        depth += 1;
        xml += indent(depth);
        xml += `<node name="${rec.name}" index="${rec.phraseIndex}" length="${rec.phraseLength}">\n`;
        xml += indent(depth + 2);
        xml += display(chars, rec.phraseIndex, rec.phraseLength);
        xml += '\n';
      } else {
        xml += indent(depth);
        xml += `</node><!-- name="${rec.name}" -->\n`;
        depth -= 1;
      }
    });

    xml += '</root>\n';
    return xml;
  };
  /* generate a JavaScript object version of the AST */
  /* for the phrase-matching engine apg-exp */
  this.phrases = function phrases() {
    const obj = {};
    let i;
    let record;
    for (i = 0; i < records.length; i += 1) {
      record = records[i];
      if (record.state === id.SEM_PRE) {
        if (!Array.isArray(obj[record.name])) {
          obj[record.name] = [];
        }
        obj[record.name].push({
          index: record.phraseIndex,
          length: record.phraseLength,
        });
      }
    }
    return obj;
  };
};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// This module acts as a "circular buffer". It is used to keep track
// only the last N records in an array of records. If more than N records
// are saved, each additional record overwrites the previously oldest record.
// This module deals only with the record indexes and does not save
// any actual records. It is used by [`trace.js`](./trace.html) for limiting the number of
// trace records saved.
var circularBuffer = function exportsCircularBuffer() {
  'use strict;';

  const thisFileName = 'circular-buffer.js: ';
  let itemIndex = -1;
  let maxListSize = 0;
  // Initialize buffer.<br>
  // *size* is `maxListSize`, the maximum number of records saved before overwriting begins.
  this.init = function init(size) {
    if (typeof size !== 'number' || size <= 0) {
      throw new Error(`${thisFileName}init: circular buffer size must an integer > 0`);
    }
    maxListSize = Math.ceil(size);
    itemIndex = -1;
  };
  // Call this to increment the number of records collected.<br>
  // Returns the array index number to store the next record in.
  this.increment = function increment() {
    itemIndex += 1;
    return (itemIndex + maxListSize) % maxListSize;
  };
  // Returns `maxListSize` - the maximum number of records to keep in the buffer.
  this.maxSize = function maxSize() {
    return maxListSize;
  };
  // Returns the highest number of items saved.<br>
  // (The number of items is the actual number of records processed
  // even though only `maxListSize` records are actually retained.)
  this.items = function items() {
    return itemIndex + 1;
  };
  // Returns the record number associated with this item index.
  this.getListIndex = function getListIndex(item) {
    if (itemIndex === -1) {
      return -1;
    }
    if (item < 0 || item > itemIndex) {
      return -1;
    }
    if (itemIndex - item >= maxListSize) {
      return -1;
    }
    return (item + maxListSize) % maxListSize;
  };
  // The iterator over the circular buffer.
  // The user's function, `fn`, will be called with arguments `fn(listIndex, itemIndex)`
  // where `listIndex` is the saved record index and `itemIndex` is the actual item index.
  this.forEach = function forEach(fn) {
    if (itemIndex === -1) {
      /* no records have been collected */
      return;
    }
    if (itemIndex < maxListSize) {
      /* fewer than maxListSize records have been collected - number of items = number of records */
      for (let i = 0; i <= itemIndex; i += 1) {
        fn(i, i);
      }
      return;
    }
    /* start with the oldest record saved and finish with the most recent record saved */
    for (let i = itemIndex - maxListSize + 1; i <= itemIndex; i += 1) {
      const listIndex = (i + maxListSize) % maxListSize;
      fn(listIndex, i);
    }
  };
};

/* eslint-disable func-names */

/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable guard-for-in */
/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */
// This is the primary object of `apg-lib`. Calling its `parse()` member function
// walks the parse tree of opcodes, matching phrases from the input string as it goes.
// The working code for all of the operators, `ALT`, `CAT`, etc. is in this module.
var parser$1 = function parser() {
  const id = identifiers;
  const utils = utilities;

  const thisFileName = 'parser.js: ';
  const thisThis = this;
  let opExecute;
  this.ast = null;
  this.stats = null;
  this.trace = null;
  this.callbacks = [];
  let opcodes = null;
  let chars = null;
  let charsBegin;
  let charsLength;
  let charsEnd;
  let lookAround;
  let treeDepth = 0;
  let maxTreeDepth = 0;
  let nodeHits = 0;
  let ruleCallbacks = null;
  let udtCallbacks = null;
  let rules = null;
  let udts = null;
  let syntaxData = null;
  let maxMatched = 0;
  let limitTreeDepth = Infinity;
  let limitNodeHits = Infinity;
  // Evaluates any given rule. This can be called from the syntax callback
  // functions to evaluate any rule in the grammar's rule list. Great caution
  // should be used. Use of this function will alter the language that the
  // parser accepts.
  const evaluateRule = function evaluateRule(ruleIndex, phraseIndex, sysData) {
    const functionName = `${thisFileName}evaluateRule(): `;
    if (ruleIndex >= rules.length) {
      throw new Error(`${functionName}rule index: ${ruleIndex} out of range`);
    }
    if (phraseIndex >= charsEnd) {
      throw new Error(`${functionName}phrase index: ${phraseIndex} out of range`);
    }
    const { length } = opcodes;
    opcodes.push({
      type: id.RNM,
      index: ruleIndex,
    });
    opExecute(length, phraseIndex, sysData);
    opcodes.pop();
  };
  // Evaluates any given UDT. This can be called from the syntax callback
  // functions to evaluate any UDT in the grammar's UDT list. Great caution
  // should be used. Use of this function will alter the language that the
  // parser accepts.
  const evaluateUdt = function (udtIndex, phraseIndex, sysData) {
    const functionName = `${thisFileName}evaluateUdt(): `;
    if (udtIndex >= udts.length) {
      throw new Error(`${functionName}udt index: ${udtIndex} out of range`);
    }
    if (phraseIndex >= charsEnd) {
      throw new Error(`${functionName}phrase index: ${phraseIndex} out of range`);
    }
    const { length } = opcodes;
    opcodes.push({
      type: id.UDT,
      empty: udts[udtIndex].empty,
      index: udtIndex,
    });
    opExecute(length, phraseIndex, sysData);
    opcodes.pop();
  };
  /* Clears this object of any/all data that has been initialized or added to it. */
  /* Called by parse() on initialization, allowing this object to be re-used for multiple parsing calls. */
  const clear = function () {
    treeDepth = 0;
    maxTreeDepth = 0;
    nodeHits = 0;
    maxMatched = 0;
    lookAround = [
      {
        lookAround: id.LOOKAROUND_NONE,
        anchor: 0,
        charsEnd: 0,
        charsLength: 0,
      },
    ];
    rules = null;
    udts = null;
    chars = null;
    charsBegin = 0;
    charsLength = 0;
    charsEnd = 0;
    ruleCallbacks = null;
    udtCallbacks = null;
    syntaxData = null;
    opcodes = null;
  };
  /* object for maintaining a stack of back reference frames */
  const backRef = function () {
    const stack = [];
    const init = function () {
      const obj = {};
      rules.forEach((rule) => {
        if (rule.isBkr) {
          obj[rule.lower] = null;
        }
      });
      if (udts.length > 0) {
        udts.forEach((udt) => {
          if (udt.isBkr) {
            obj[udt.lower] = null;
          }
        });
      }
      stack.push(obj);
    };
    const copy = function () {
      const top = stack[stack.length - 1];
      const obj = {};
      /* // eslint-disable-next-line no-restricted-syntax */
      for (const name in top) {
        obj[name] = top[name];
      }
      return obj;
    };
    this.push = function push() {
      stack.push(copy());
    };
    this.pop = function pop(lengthArg) {
      let length = lengthArg;
      if (!length) {
        length = stack.length - 1;
      }
      if (length < 1 || length > stack.length) {
        throw new Error(`${thisFileName}backRef.pop(): bad length: ${length}`);
      }
      stack.length = length;
      return stack[stack.length - 1];
    };
    this.length = function length() {
      return stack.length;
    };
    this.savePhrase = function savePhrase(name, index, length) {
      stack[stack.length - 1][name] = {
        phraseIndex: index,
        phraseLength: length,
      };
    };
    this.getPhrase = function (name) {
      return stack[stack.length - 1][name];
    };
    /* constructor */
    init();
  };
  // The system data structure that relays system information to and from the rule and UDT callback functions.
  // - *state* - the state of the parser, ACTIVE, MATCH, EMPTY or NOMATCH (see the `identifiers` object in
  // [`apg-lib`](https://github.com/ldthomas/apg-js2-lib))
  // - *phraseLength* - the number of characters matched if the state is MATCHED or EMPTY
  // - *lookaround* - the top of the stack holds the current look around state,
  // LOOKAROUND_NONE, LOOKAROUND_AHEAD or LOOKAROUND_BEHIND,
  // - *uFrame* - the "universal" back reference frame.
  // Holds the last matched phrase for each of the back referenced rules and UDTs.
  // - *pFrame* - the stack of "parent" back reference frames.
  // Holds the matched phrase from the parent frame of each back referenced rules and UDTs.
  // - *evaluateRule* - a reference to this object's `evaluateRule()` function.
  // Can be called from a callback function (use with extreme caution!)
  // - *evaluateUdt* - a reference to this object's `evaluateUdt()` function.
  // Can be called from a callback function (use with extreme caution!)
  const systemData = function systemData() {
    const thisData = this;
    this.state = id.ACTIVE;
    this.phraseLength = 0;
    this.ruleIndex = 0;
    this.udtIndex = 0;
    this.lookAround = lookAround[lookAround.length - 1];
    this.uFrame = new backRef();
    this.pFrame = new backRef();
    this.evaluateRule = evaluateRule;
    this.evaluateUdt = evaluateUdt;
    /* refresh the parser state for the next operation */
    this.refresh = function refresh() {
      thisData.state = id.ACTIVE;
      thisData.phraseLength = 0;
      thisData.lookAround = lookAround[lookAround.length - 1];
    };
  };
  /* some look around helper functions */
  const lookAroundValue = function lookAroundValue() {
    return lookAround[lookAround.length - 1];
  };
  /* return true if parser is in look around (ahead or behind) state */
  const inLookAround = function inLookAround() {
    return lookAround.length > 1;
  };
  /* return true if parser is in look behind state */
  const inLookBehind = function () {
    return lookAround[lookAround.length - 1].lookAround === id.LOOKAROUND_BEHIND;
  };
  /* called by parse() to initialize the AST object, if one has been defined */
  const initializeAst = function () {
    const functionName = `${thisFileName}initializeAst(): `;
    const TRUE = true;
    while (TRUE) {
      if (thisThis.ast === undefined) {
        thisThis.ast = null;
        break;
      }
      if (thisThis.ast === null) {
        break;
      }
      if (thisThis.ast.astObject !== 'astObject') {
        throw new Error(`${functionName}ast object not recognized`);
      }
      break;
    }
    if (thisThis.ast !== null) {
      thisThis.ast.init(rules, udts, chars);
    }
  };
  /* called by parse() to initialize the trace object, if one has been defined */
  const initializeTrace = function () {
    const functionName = `${thisFileName}initializeTrace(): `;
    const TRUE = true;
    while (TRUE) {
      if (thisThis.trace === undefined) {
        thisThis.trace = null;
        break;
      }
      if (thisThis.trace === null) {
        break;
      }
      if (thisThis.trace.traceObject !== 'traceObject') {
        throw new Error(`${functionName}trace object not recognized`);
      }
      break;
    }
    if (thisThis.trace !== null) {
      thisThis.trace.init(rules, udts, chars);
    }
  };
  /* called by parse() to initialize the statistics object, if one has been defined */
  const initializeStats = function () {
    const functionName = `${thisFileName}initializeStats(): `;
    const TRUE = true;
    while (TRUE) {
      if (thisThis.stats === undefined) {
        thisThis.stats = null;
        break;
      }
      if (thisThis.stats === null) {
        break;
      }
      if (thisThis.stats.statsObject !== 'statsObject') {
        throw new Error(`${functionName}stats object not recognized`);
      }
      break;
    }
    if (thisThis.stats !== null) {
      thisThis.stats.init(rules, udts);
    }
  };
  /* called by parse() to initialize the rules & udts from the grammar object */
  /* (the grammar object generated previously by apg) */
  const initializeGrammar = function (grammar) {
    const functionName = `${thisFileName}initializeGrammar(): `;
    if (!grammar) {
      throw new Error(`${functionName}grammar object undefined`);
    }
    if (grammar.grammarObject !== 'grammarObject') {
      throw new Error(`${functionName}bad grammar object`);
    }
    rules = grammar.rules;
    udts = grammar.udts;
  };
  /* called by parse() to initialize the start rule */
  const initializeStartRule = function (startRule) {
    const functionName = `${thisFileName}initializeStartRule(): `;
    let start = null;
    if (typeof startRule === 'number') {
      if (startRule >= rules.length) {
        throw new Error(`${functionName}start rule index too large: max: ${rules.length}: index: ${startRule}`);
      }
      start = startRule;
    } else if (typeof startRule === 'string') {
      const lower = startRule.toLowerCase();
      for (let i = 0; i < rules.length; i += 1) {
        if (lower === rules[i].lower) {
          start = rules[i].index;
          break;
        }
      }
      if (start === null) {
        throw new Error(`${functionName}start rule name '${startRule}' not recognized`);
      }
    } else {
      throw new Error(`${functionName}type of start rule '${typeof startRule}' not recognized`);
    }
    return start;
  };
  /* called by parse() to initialize the array of characters codes representing the input string */
  const initializeInputChars = function initializeInputChars(inputArg, begArg, lenArg) {
    const functionName = `${thisFileName}initializeInputChars(): `;
    /* varify and normalize input */
    let input = inputArg;
    let beg = begArg;
    let len = lenArg;
    if (input === undefined) {
      throw new Error(`${functionName}input string is undefined`);
    }
    if (input === null) {
      throw new Error(`${functionName}input string is null`);
    }
    if (typeof input === 'string') {
      input = utils.stringToChars(input);
    } else if (!Array.isArray(input)) {
      throw new Error(`${functionName}input string is not a string or array`);
    }
    if (input.length > 0) {
      if (typeof input[0] !== 'number') {
        throw new Error(`${functionName}input string not an array of integers`);
      }
    }
    /* verify and normalize beginning index */
    if (typeof beg !== 'number') {
      beg = 0;
    } else {
      beg = Math.floor(beg);
      if (beg < 0 || beg > input.length) {
        throw new Error(`${functionName}input beginning index out of range: ${beg}`);
      }
    }
    /* verify and normalize input length */
    if (typeof len !== 'number') {
      len = input.length - beg;
    } else {
      len = Math.floor(len);
      if (len < 0 || len > input.length - beg) {
        throw new Error(`${functionName}input length out of range: ${len}`);
      }
    }
    chars = input;
    charsBegin = beg;
    charsLength = len;
    charsEnd = charsBegin + charsLength;
  };
  /* called by parse() to initialize the user-written, syntax callback functions, if any */
  const initializeCallbacks = function () {
    const functionName = `${thisFileName}initializeCallbacks(): `;
    let i;
    ruleCallbacks = [];
    udtCallbacks = [];
    for (i = 0; i < rules.length; i += 1) {
      ruleCallbacks[i] = null;
    }
    for (i = 0; i < udts.length; i += 1) {
      udtCallbacks[i] = null;
    }
    let func;
    const list = [];
    for (i = 0; i < rules.length; i += 1) {
      list.push(rules[i].lower);
    }
    for (i = 0; i < udts.length; i += 1) {
      list.push(udts[i].lower);
    }
    for (const index in thisThis.callbacks) {
      i = list.indexOf(index.toLowerCase());
      if (i < 0) {
        throw new Error(`${functionName}syntax callback '${index}' not a rule or udt name`);
      }
      func = thisThis.callbacks[index];
      if (!func) {
        func = null;
      }
      if (typeof func === 'function' || func === null) {
        if (i < rules.length) {
          ruleCallbacks[i] = func;
        } else {
          udtCallbacks[i - rules.length] = func;
        }
      } else {
        throw new Error(
          `${functionName}syntax callback[${index}] must be function reference or 'false' (false/null/undefined/etc.)`
        );
      }
    }
    /* make sure all udts have been defined - the parser can't work without them */
    for (i = 0; i < udts.length; i += 1) {
      if (udtCallbacks[i] === null) {
        throw new Error(
          `${functionName}all UDT callbacks must be defined. UDT callback[${udts[i].lower}] not a function reference`
        );
      }
    }
  };
  // Set the maximum parse tree depth allowed. The default is `Infinity`.
  // A limit is not normally needed, but can be used to protect against an
  // exponentual or "catastrophically backtracking" grammar.
  // <ul>
  // <li>
  // depth - max allowed parse tree depth. An exception is thrown if exceeded.
  // </li>
  // </ul>
  this.setMaxTreeDepth = function (depth) {
    if (typeof depth !== 'number') {
      throw new Error(`parser: max tree depth must be integer > 0: ${depth}`);
    }
    limitTreeDepth = Math.floor(depth);
    if (limitTreeDepth <= 0) {
      throw new Error(`parser: max tree depth must be integer > 0: ${depth}`);
    }
  };
  // Set the maximum number of node hits (parser unit steps or opcode function calls) allowed.
  // The default is `Infinity`.
  // A limit is not normally needed, but can be used to protect against an
  // exponentual or "catastrophically backtracking" grammar.
  // <ul>
  // <li>
  // hits - maximum number of node hits or parser unit steps allowed.
  // An exception thrown if exceeded.
  // </li>
  // </ul>
  this.setMaxNodeHits = function (hits) {
    if (typeof hits !== 'number') {
      throw new Error(`parser: max node hits must be integer > 0: ${hits}`);
    }
    limitNodeHits = Math.floor(hits);
    if (limitNodeHits <= 0) {
      throw new Error(`parser: max node hits must be integer > 0: ${hits}`);
    }
  };
  /* the main parser function */
  const privateParse = function (grammar, startRuleArg, callbackData) {
    let success;
    const functionName = `${thisFileName}parse(): `;
    initializeGrammar(grammar);
    const startRule = initializeStartRule(startRuleArg);
    initializeCallbacks();
    initializeTrace();
    initializeStats();
    initializeAst();
    const sysData = new systemData();
    if (!(callbackData === undefined || callbackData === null)) {
      syntaxData = callbackData;
    }
    /* create a dummy opcode for the start rule */
    opcodes = [
      {
        type: id.RNM,
        index: startRule,
      },
    ];
    /* execute the start rule */
    opExecute(0, charsBegin, sysData);
    opcodes = null;
    /* test and return the sysData */
    switch (sysData.state) {
      case id.ACTIVE:
        throw new Error(`${functionName}final state should never be 'ACTIVE'`);
      case id.NOMATCH:
        success = false;
        break;
      case id.EMPTY:
      case id.MATCH:
        if (sysData.phraseLength === charsLength) {
          success = true;
        } else {
          success = false;
        }
        break;
      default:
        throw new Error('unrecognized state');
    }
    return {
      success,
      state: sysData.state,
      length: charsLength,
      matched: sysData.phraseLength,
      maxMatched,
      maxTreeDepth,
      nodeHits,
      inputLength: chars.length,
      subBegin: charsBegin,
      subEnd: charsEnd,
      subLength: charsLength,
    };
  };

  // This form allows parsing of a sub-string of the full input string.
  // <ul>
  // <li>*inputIndex* - index of the first character in the sub-string</li>
  // <li>*inputLength* - length of the sub-string</li>
  // </ul>
  // All other parameters as for the above function `parse()`.
  this.parseSubstring = function parseSubstring(grammar, startRule, inputChars, inputIndex, inputLength, callbackData) {
    clear();
    initializeInputChars(inputChars, inputIndex, inputLength);
    return privateParse(grammar, startRule, callbackData);
  };
  // This is the main function, called to parse an input string.
  // <ul>
  // <li>*grammar* - an instantiated grammar object - the output of `apg` for a
  // specific SABNF grammar</li>
  // <li>*startRule* - the rule name or rule index to be used as the root of the
  // parse tree. This is usually the first rule, index = 0, of the grammar
  // but can be any rule defined in the above grammar object.</li>
  // <li>*inputChars* - the input string. Can be a string or an array of integer character codes representing the
  // string.</li>
  // <li>*callbackData* - user-defined data object to be passed to the user's
  // callback functions.
  // This is not used by the parser in any way, merely passed on to the user.
  // May be `null` or omitted.</li>
  // </ul>
  this.parse = function parse(grammar, startRule, inputChars, callbackData) {
    clear();
    initializeInputChars(inputChars, 0, inputChars.length);
    return privateParse(grammar, startRule, callbackData);
  };
  // The `ALT` operator.<br>
  // Executes its child nodes, from left to right, until it finds a match.
  // Fails if *all* of its child nodes fail.
  const opALT = function (opIndex, phraseIndex, sysData) {
    const op = opcodes[opIndex];
    for (let i = 0; i < op.children.length; i += 1) {
      opExecute(op.children[i], phraseIndex, sysData);
      if (sysData.state !== id.NOMATCH) {
        break;
      }
    }
  };
  // The `CAT` operator.<br>
  // Executes all of its child nodes, from left to right,
  // concatenating the matched phrases.
  // Fails if *any* child nodes fail.
  const opCAT = function (opIndex, phraseIndex, sysData) {
    let success;
    let astLength;
    let catCharIndex;
    let catPhrase;
    const op = opcodes[opIndex];
    const ulen = sysData.uFrame.length();
    const plen = sysData.pFrame.length();
    if (thisThis.ast) {
      astLength = thisThis.ast.getLength();
    }
    success = true;
    catCharIndex = phraseIndex;
    catPhrase = 0;
    for (let i = 0; i < op.children.length; i += 1) {
      opExecute(op.children[i], catCharIndex, sysData);
      if (sysData.state === id.NOMATCH) {
        success = false;
        break;
      } else {
        catCharIndex += sysData.phraseLength;
        catPhrase += sysData.phraseLength;
      }
    }
    if (success) {
      sysData.state = catPhrase === 0 ? id.EMPTY : id.MATCH;
      sysData.phraseLength = catPhrase;
    } else {
      sysData.state = id.NOMATCH;
      sysData.phraseLength = 0;
      /* reset the back referencing frames on failure */
      sysData.uFrame.pop(ulen);
      sysData.pFrame.pop(plen);
      if (thisThis.ast) {
        thisThis.ast.setLength(astLength);
      }
    }
  };
  // The `REP` operator.<br>
  // Repeatedly executes its single child node,
  // concatenating each of the matched phrases found.
  // The number of repetitions executed and its final sysData depends
  // on its `min` & `max` repetition values.
  const opREP = function (opIndex, phraseIndex, sysData) {
    let astLength;
    let repCharIndex;
    let repPhrase;
    let repCount;
    const op = opcodes[opIndex];
    if (op.max === 0) {
      // this is an empty-string acceptor
      // deprecated: use the TLS empty string operator, "", instead
      sysData.state = id.EMPTY;
      sysData.phraseLength = 0;
      return;
    }
    repCharIndex = phraseIndex;
    repPhrase = 0;
    repCount = 0;
    const ulen = sysData.uFrame.length();
    const plen = sysData.pFrame.length();
    if (thisThis.ast) {
      astLength = thisThis.ast.getLength();
    }
    const TRUE = true;
    while (TRUE) {
      if (repCharIndex >= charsEnd) {
        /* exit on end of input string */
        break;
      }
      opExecute(opIndex + 1, repCharIndex, sysData);
      if (sysData.state === id.NOMATCH) {
        /* always end if the child node fails */
        break;
      }
      if (sysData.state === id.EMPTY) {
        /* REP always succeeds when the child node returns an empty phrase */
        /* this may not seem obvious, but that's the way it works out */
        break;
      }
      repCount += 1;
      repPhrase += sysData.phraseLength;
      repCharIndex += sysData.phraseLength;
      if (repCount === op.max) {
        /* end on maxed out reps */
        break;
      }
    }
    /* evaluate the match count according to the min, max values */
    if (sysData.state === id.EMPTY) {
      sysData.state = repPhrase === 0 ? id.EMPTY : id.MATCH;
      sysData.phraseLength = repPhrase;
    } else if (repCount >= op.min) {
      sysData.state = repPhrase === 0 ? id.EMPTY : id.MATCH;
      sysData.phraseLength = repPhrase;
    } else {
      sysData.state = id.NOMATCH;
      sysData.phraseLength = 0;
      /* reset the back referencing frames on failure */
      sysData.uFrame.pop(ulen);
      sysData.pFrame.pop(plen);
      if (thisThis.ast) {
        thisThis.ast.setLength(astLength);
      }
    }
  };
  // Validate the callback function's returned sysData values.
  // It's the user's responsibility to get them right
  // but `RNM` fails if not.
  const validateRnmCallbackResult = function (rule, sysData, charsLeft, down) {
    if (sysData.phraseLength > charsLeft) {
      let str = `${thisFileName}opRNM(${rule.name}): callback function error: `;
      str += `sysData.phraseLength: ${sysData.phraseLength}`;
      str += ` must be <= remaining chars: ${charsLeft}`;
      throw new Error(str);
    }
    switch (sysData.state) {
      case id.ACTIVE:
        if (down !== true) {
          throw new Error(
            `${thisFileName}opRNM(${rule.name}): callback function return error. ACTIVE state not allowed.`
          );
        }
        break;
      case id.EMPTY:
        sysData.phraseLength = 0;
        break;
      case id.MATCH:
        if (sysData.phraseLength === 0) {
          sysData.state = id.EMPTY;
        }
        break;
      case id.NOMATCH:
        sysData.phraseLength = 0;
        break;
      default:
        throw new Error(
          `${thisFileName}opRNM(${rule.name}): callback function return error. Unrecognized return state: ${sysData.state}`
        );
    }
  };
  // The `RNM` operator.<br>
  // This operator will acts as a root node for a parse tree branch below and
  // returns the matched phrase to its parent.
  // However, its larger responsibility is handling user-defined callback functions, back references and `AST` nodes.
  // Note that the `AST` is a separate object, but `RNM` calls its functions to create its nodes.
  // See [`ast.js`](./ast.html) for usage.
  const opRNM = function (opIndex, phraseIndex, sysData) {
    let astLength;
    let astDefined;
    let savedOpcodes;
    let ulen;
    let plen;
    let saveFrame;
    const op = opcodes[opIndex];
    const rule = rules[op.index];
    const callback = ruleCallbacks[rule.index];
    const notLookAround = !inLookAround();
    /* ignore AST and back references in lookaround */
    if (notLookAround) {
      /* begin AST and back references */
      astDefined = thisThis.ast && thisThis.ast.ruleDefined(op.index);
      if (astDefined) {
        astLength = thisThis.ast.getLength();
        thisThis.ast.down(op.index, rules[op.index].name);
      }
      ulen = sysData.uFrame.length();
      plen = sysData.pFrame.length();
      sysData.uFrame.push();
      sysData.pFrame.push();
      saveFrame = sysData.pFrame;
      sysData.pFrame = new backRef();
    }
    if (callback === null) {
      /* no callback - just execute the rule */
      savedOpcodes = opcodes;
      opcodes = rule.opcodes;
      opExecute(0, phraseIndex, sysData);
      opcodes = savedOpcodes;
    } else {
      /* call user's callback */
      const charsLeft = charsEnd - phraseIndex;
      sysData.ruleIndex = rule.index;
      callback(sysData, chars, phraseIndex, syntaxData);
      validateRnmCallbackResult(rule, sysData, charsLeft, true);
      if (sysData.state === id.ACTIVE) {
        savedOpcodes = opcodes;
        opcodes = rule.opcodes;
        opExecute(0, phraseIndex, sysData);
        opcodes = savedOpcodes;
        sysData.ruleIndex = rule.index;
        callback(sysData, chars, phraseIndex, syntaxData);
        validateRnmCallbackResult(rule, sysData, charsLeft, false);
      } /* implied else clause: just accept the callback sysData - RNM acting as UDT */
    }
    if (notLookAround) {
      /* end AST */
      if (astDefined) {
        if (sysData.state === id.NOMATCH) {
          thisThis.ast.setLength(astLength);
        } else {
          thisThis.ast.up(op.index, rule.name, phraseIndex, sysData.phraseLength);
        }
      }
      /* end back reference */
      sysData.pFrame = saveFrame;
      if (sysData.state === id.NOMATCH) {
        sysData.uFrame.pop(ulen);
        sysData.pFrame.pop(plen);
      } else if (rule.isBkr) {
        /* save phrase on both the parent and universal frames */
        /* BKR operator will decide which to use later */
        sysData.pFrame.savePhrase(rule.lower, phraseIndex, sysData.phraseLength);
        sysData.uFrame.savePhrase(rule.lower, phraseIndex, sysData.phraseLength);
      }
    }
  };
  // Validate the callback function's returned sysData values.
  // It's the user's responsibility to get it right but `UDT` fails if not.
  const validateUdtCallbackResult = function (udt, sysData, charsLeft) {
    if (sysData.phraseLength > charsLeft) {
      let str = `${thisFileName}opUDT(${udt.name}): callback function error: `;
      str += `sysData.phraseLength: ${sysData.phraseLength}`;
      str += ` must be <= remaining chars: ${charsLeft}`;
      throw new Error(str);
    }
    switch (sysData.state) {
      case id.ACTIVE:
        throw new Error(`${thisFileName}opUDT(${udt.name}): callback function return error. ACTIVE state not allowed.`);
      case id.EMPTY:
        if (udt.empty === false) {
          throw new Error(`${thisFileName}opUDT(${udt.name}): callback function return error. May not return EMPTY.`);
        } else {
          sysData.phraseLength = 0;
        }
        break;
      case id.MATCH:
        if (sysData.phraseLength === 0) {
          if (udt.empty === false) {
            throw new Error(`${thisFileName}opUDT(${udt.name}): callback function return error. May not return EMPTY.`);
          } else {
            sysData.state = id.EMPTY;
          }
        }
        break;
      case id.NOMATCH:
        sysData.phraseLength = 0;
        break;
      default:
        throw new Error(
          `${thisFileName}opUDT(${udt.name}): callback function return error. Unrecognized return state: ${sysData.state}`
        );
    }
  };
  // The `UDT` operator.<br>
  // Simply calls the user's callback function, but operates like `RNM` with regard to the `AST`
  // and back referencing.
  // There is some ambiguity here. `UDT`s act as terminals for phrase recognition but as named rules
  // for `AST` nodes and back referencing.
  // See [`ast.js`](./ast.html) for usage.
  const opUDT = function (opIndex, phraseIndex, sysData) {
    let astLength;
    let astIndex;
    let astDefined;
    let ulen;
    let plen;
    let saveFrame;
    const op = opcodes[opIndex];
    const udt = udts[op.index];
    sysData.UdtIndex = udt.index;

    const notLookAround = !inLookAround();
    /* ignore AST and back references in lookaround */
    if (notLookAround) {
      /* begin AST and back reference */
      astDefined = thisThis.ast && thisThis.ast.udtDefined(op.index);
      if (astDefined) {
        astIndex = rules.length + op.index;
        astLength = thisThis.ast.getLength();
        thisThis.ast.down(astIndex, udt.name);
      }
      /* NOTE: push and pop of the back reference frame is normally not necessary */
      /* only in the case that the UDT calls evaluateRule() or evaluateUdt() */
      ulen = sysData.uFrame.length();
      plen = sysData.pFrame.length();
      sysData.uFrame.push();
      sysData.pFrame.push();
      saveFrame = sysData.pFrame;
      sysData.pFrame = new backRef();
    }
    /* call the UDT */
    const charsLeft = charsEnd - phraseIndex;
    udtCallbacks[op.index](sysData, chars, phraseIndex, syntaxData);
    validateUdtCallbackResult(udt, sysData, charsLeft);
    if (notLookAround) {
      /* end AST */
      if (astDefined) {
        if (sysData.state === id.NOMATCH) {
          thisThis.ast.setLength(astLength);
        } else {
          thisThis.ast.up(astIndex, udt.name, phraseIndex, sysData.phraseLength);
        }
      }
      /* end back reference */
      sysData.pFrame = saveFrame;
      if (sysData.state === id.NOMATCH) {
        sysData.uFrame.pop(ulen);
        sysData.pFrame.pop(plen);
      } else if (udt.isBkr) {
        /* save phrase on both the parent and universal frames */
        /* BKR operator will decide which to use later */
        sysData.pFrame.savePhrase(udt.lower, phraseIndex, sysData.phraseLength);
        sysData.uFrame.savePhrase(udt.lower, phraseIndex, sysData.phraseLength);
      }
    }
  };
  // The `AND` operator.<br>
  // This is the positive `look ahead` operator.
  // Executes its single child node, returning the EMPTY state
  // if it succeedsand NOMATCH if it fails.
  // *Always* backtracks on any matched phrase and returns EMPTY on success.
  const opAND = function (opIndex, phraseIndex, sysData) {
    lookAround.push({
      lookAround: id.LOOKAROUND_AHEAD,
      anchor: phraseIndex,
      charsEnd,
      charsLength,
    });
    charsEnd = chars.length;
    charsLength = chars.length - charsBegin;
    opExecute(opIndex + 1, phraseIndex, sysData);
    const pop = lookAround.pop();
    charsEnd = pop.charsEnd;
    charsLength = pop.charsLength;
    sysData.phraseLength = 0;
    switch (sysData.state) {
      case id.EMPTY:
        sysData.state = id.EMPTY;
        break;
      case id.MATCH:
        sysData.state = id.EMPTY;
        break;
      case id.NOMATCH:
        sysData.state = id.NOMATCH;
        break;
      default:
        throw new Error(`opAND: invalid state ${sysData.state}`);
    }
  };
  // The `NOT` operator.<br>
  // This is the negative `look ahead` operator.
  // Executes its single child node, returning the EMPTY state
  // if it *fails* and NOMATCH if it succeeds.
  // *Always* backtracks on any matched phrase and returns EMPTY
  // on success (failure of its child node).
  const opNOT = function (opIndex, phraseIndex, sysData) {
    lookAround.push({
      lookAround: id.LOOKAROUND_AHEAD,
      anchor: phraseIndex,
      charsEnd,
      charsLength,
    });
    charsEnd = chars.length;
    charsLength = chars.length - charsBegin;
    opExecute(opIndex + 1, phraseIndex, sysData);
    const pop = lookAround.pop();
    charsEnd = pop.charsEnd;
    charsLength = pop.charsLength;
    sysData.phraseLength = 0;
    switch (sysData.state) {
      case id.EMPTY:
      case id.MATCH:
        sysData.state = id.NOMATCH;
        break;
      case id.NOMATCH:
        sysData.state = id.EMPTY;
        break;
      default:
        throw new Error(`opNOT: invalid state ${sysData.state}`);
    }
  };
  // The `TRG` operator.<br>
  // Succeeds if the single first character of the phrase is
  // within the `min - max` range.
  const opTRG = function (opIndex, phraseIndex, sysData) {
    const op = opcodes[opIndex];
    sysData.state = id.NOMATCH;
    if (phraseIndex < charsEnd) {
      if (op.min <= chars[phraseIndex] && chars[phraseIndex] <= op.max) {
        sysData.state = id.MATCH;
        sysData.phraseLength = 1;
      }
    }
  };
  // The `TBS` operator.<br>
  // Matches its pre-defined phrase against the input string.
  // All characters must match exactly.
  // Case-sensitive literal strings (`'string'` & `%s"string"`) are translated to `TBS`
  // operators by `apg`.
  // Phrase length of zero is not allowed.
  // Empty phrases can only be defined with `TLS` operators.
  const opTBS = function (opIndex, phraseIndex, sysData) {
    let i;
    const op = opcodes[opIndex];
    const len = op.string.length;
    sysData.state = id.NOMATCH;
    if (phraseIndex + len <= charsEnd) {
      for (i = 0; i < len; i += 1) {
        if (chars[phraseIndex + i] !== op.string[i]) {
          return;
        }
      }
      sysData.state = id.MATCH;
      sysData.phraseLength = len;
    } /* implied else NOMATCH */
  };
  // The `TLS` operator.<br>
  // Matches its pre-defined phrase against the input string.
  // A case-insensitive match is attempted for ASCII alphbetical characters.
  // `TLS` is the only operator that explicitly allows empty phrases.
  // `apg` will fail for empty `TBS`, case-sensitive strings (`''`) or
  // zero repetitions (`0*0RuleName` or `0RuleName`).
  const opTLS = function (opIndex, phraseIndex, sysData) {
    let i;
    let code;
    const op = opcodes[opIndex];
    sysData.state = id.NOMATCH;
    const len = op.string.length;
    if (len === 0) {
      /* EMPTY match allowed for TLS */
      sysData.state = id.EMPTY;
      return;
    }
    if (phraseIndex + len <= charsEnd) {
      for (i = 0; i < len; i += 1) {
        code = chars[phraseIndex + i];
        if (code >= 65 && code <= 90) {
          code += 32;
        }
        if (code !== op.string[i]) {
          return;
        }
      }
      sysData.state = id.MATCH;
      sysData.phraseLength = len;
    } /* implied else NOMATCH */
  };
  // The `ABG` operator.<br>
  // This is an "anchor" for the beginning of the string, similar to the familiar regex `^` anchor.
  // An anchor matches a position rather than a phrase.
  // Returns EMPTY if `phraseIndex` is 0, NOMATCH otherwise.
  const opABG = function (opIndex, phraseIndex, sysData) {
    sysData.state = id.NOMATCH;
    sysData.phraseLength = 0;
    sysData.state = phraseIndex === 0 ? id.EMPTY : id.NOMATCH;
  };
  // The `AEN` operator.<br>
  // This is an "anchor" for the end of the string, similar to the familiar regex `$` anchor.
  // An anchor matches a position rather than a phrase.
  // Returns EMPTY if `phraseIndex` equals the input string length, NOMATCH otherwise.
  const opAEN = function (opIndex, phraseIndex, sysData) {
    sysData.state = id.NOMATCH;
    sysData.phraseLength = 0;
    sysData.state = phraseIndex === chars.length ? id.EMPTY : id.NOMATCH;
  };
  // The `BKR` operator.<br>
  // The back reference operator.
  // Matches the last matched phrase of the named rule or UDT against the input string.
  // For ASCII alphbetical characters the match may be case sensitive (`%s`) or insensitive (`%i`),
  // depending on the back reference definition.
  // For `universal` mode (`%u`) matches the last phrase found anywhere in the grammar.
  // For `parent frame` mode (`%p`) matches the last phrase found in the parent rule only.
  const opBKR = function (opIndex, phraseIndex, sysData) {
    let i;
    let code;
    let lmcode;
    let lower;
    const op = opcodes[opIndex];
    sysData.state = id.NOMATCH;
    if (op.index < rules.length) {
      lower = rules[op.index].lower;
    } else {
      lower = udts[op.index - rules.length].lower;
    }
    const frame = op.bkrMode === id.BKR_MODE_PM ? sysData.pFrame.getPhrase(lower) : sysData.uFrame.getPhrase(lower);
    const insensitive = op.bkrCase === id.BKR_MODE_CI;
    if (frame === null) {
      return;
    }
    const lmIndex = frame.phraseIndex;
    const len = frame.phraseLength;
    if (len === 0) {
      sysData.state = id.EMPTY;
      return;
    }
    if (phraseIndex + len <= charsEnd) {
      if (insensitive) {
        /* case-insensitive match */
        for (i = 0; i < len; i += 1) {
          code = chars[phraseIndex + i];
          lmcode = chars[lmIndex + i];
          if (code >= 65 && code <= 90) {
            code += 32;
          }
          if (lmcode >= 65 && lmcode <= 90) {
            lmcode += 32;
          }
          if (code !== lmcode) {
            return;
          }
        }
        sysData.state = id.MATCH;
        sysData.phraseLength = len;
      } else {
        /* case-sensitive match */
        for (i = 0; i < len; i += 1) {
          code = chars[phraseIndex + i];
          lmcode = chars[lmIndex + i];
          if (code !== lmcode) {
            return;
          }
        }
      }
      sysData.state = id.MATCH;
      sysData.phraseLength = len;
    }
  };
  // The `BKA` operator.<br>
  // This is the positive `look behind` operator.
  // It's child node is parsed right-to-left.
  // Returns the EMPTY state if a match is found, NOMATCH otherwise.
  // Like the look ahead operators, it always backtracks to `phraseIndex`.
  const opBKA = function (opIndex, phraseIndex, sysData) {
    lookAround.push({
      lookAround: id.LOOKAROUND_BEHIND,
      anchor: phraseIndex,
    });
    opExecute(opIndex + 1, phraseIndex, sysData);
    lookAround.pop();
    sysData.phraseLength = 0;
    switch (sysData.state) {
      case id.EMPTY:
        sysData.state = id.EMPTY;
        break;
      case id.MATCH:
        sysData.state = id.EMPTY;
        break;
      case id.NOMATCH:
        sysData.state = id.NOMATCH;
        break;
      default:
        throw new Error(`opBKA: invalid state ${sysData.state}`);
    }
  };
  // The `BKN` operator.<br>
  // This is the negative `look behind` operator.
  // It's child node is parsed right-to-left.
  // Returns the EMPTY state if a match is *not* found, NOMATCH otherwise.
  // Like the look ahead operators, it always backtracks to `phraseIndex`.
  const opBKN = function (opIndex, phraseIndex, sysData) {
    // let op;
    // op = opcodes[opIndex];
    lookAround.push({
      lookAround: id.LOOKAROUND_BEHIND,
      anchor: phraseIndex,
    });
    opExecute(opIndex + 1, phraseIndex, sysData);
    lookAround.pop();
    sysData.phraseLength = 0;
    switch (sysData.state) {
      case id.EMPTY:
      case id.MATCH:
        sysData.state = id.NOMATCH;
        break;
      case id.NOMATCH:
        sysData.state = id.EMPTY;
        break;
      default:
        throw new Error(`opBKN: invalid state ${sysData.state}`);
    }
  };
  // The right-to-left `CAT` operator.<br>
  // Called for `CAT` operators when in look behind mode.
  // Calls its child nodes from right to left concatenating matched phrases right to left.
  const opCATBehind = function (opIndex, phraseIndex, sysData) {
    let success;
    let astLength;
    let catCharIndex;
    let catMatched;
    const op = opcodes[opIndex];
    const ulen = sysData.uFrame.length();
    const plen = sysData.pFrame.length();
    if (thisThis.ast) {
      astLength = thisThis.ast.getLength();
    }
    success = true;
    catCharIndex = phraseIndex;
    catMatched = 0;
    // catPhrase = 0;
    for (let i = op.children.length - 1; i >= 0; i -= 1) {
      opExecute(op.children[i], catCharIndex, sysData);
      catCharIndex -= sysData.phraseLength;
      catMatched += sysData.phraseLength;
      // catPhrase += sysData.phraseLength;
      if (sysData.state === id.NOMATCH) {
        success = false;
        break;
      }
    }
    if (success) {
      sysData.state = catMatched === 0 ? id.EMPTY : id.MATCH;
      sysData.phraseLength = catMatched;
    } else {
      sysData.state = id.NOMATCH;
      sysData.phraseLength = 0;
      sysData.uFrame.pop(ulen);
      sysData.pFrame.pop(plen);
      if (thisThis.ast) {
        thisThis.ast.setLength(astLength);
      }
    }
  };
  // The right-to-left `REP` operator.<br>
  // Called for `REP` operators in look behind mode.
  // Makes repeated calls to its child node, concatenating matched phrases right to left.
  const opREPBehind = function (opIndex, phraseIndex, sysData) {
    let astLength;
    let repCharIndex;
    let repPhrase;
    let repCount;
    const op = opcodes[opIndex];
    repCharIndex = phraseIndex;
    repPhrase = 0;
    repCount = 0;
    const ulen = sysData.uFrame.length();
    const plen = sysData.pFrame.length();
    if (thisThis.ast) {
      astLength = thisThis.ast.getLength();
    }
    const TRUE = true;
    while (TRUE) {
      if (repCharIndex <= 0) {
        /* exit on end of input string */
        break;
      }
      opExecute(opIndex + 1, repCharIndex, sysData);
      if (sysData.state === id.NOMATCH) {
        /* always end if the child node fails */
        break;
      }
      if (sysData.state === id.EMPTY) {
        /* REP always succeeds when the child node returns an empty phrase */
        /* this may not seem obvious, but that's the way it works out */
        break;
      }
      repCount += 1;
      repPhrase += sysData.phraseLength;
      repCharIndex -= sysData.phraseLength;
      if (repCount === op.max) {
        /* end on maxed out reps */
        break;
      }
    }
    /* evaluate the match count according to the min, max values */
    if (sysData.state === id.EMPTY) {
      sysData.state = repPhrase === 0 ? id.EMPTY : id.MATCH;
      sysData.phraseLength = repPhrase;
    } else if (repCount >= op.min) {
      sysData.state = repPhrase === 0 ? id.EMPTY : id.MATCH;
      sysData.phraseLength = repPhrase;
    } else {
      sysData.state = id.NOMATCH;
      sysData.phraseLength = 0;
      sysData.uFrame.pop(ulen);
      sysData.pFrame.pop(plen);
      if (thisThis.ast) {
        thisThis.ast.setLength(astLength);
      }
    }
  };
  // The right-to-left `TRG` operator.<br>
  // Called for `TRG` operators in look behind mode.
  // Matches a single character at `phraseIndex - 1` to the `min` - `max` range.
  const opTRGBehind = function (opIndex, phraseIndex, sysData) {
    const op = opcodes[opIndex];
    sysData.state = id.NOMATCH;
    sysData.phraseLength = 0;
    if (phraseIndex > 0) {
      const char = chars[phraseIndex - 1];
      if (op.min <= char && char <= op.max) {
        sysData.state = id.MATCH;
        sysData.phraseLength = 1;
      }
    }
  };
  // The right-to-left `TBS` operator.<br>
  // Called for `TBS` operators in look behind mode.
  // Matches the `TBS` phrase to the left of `phraseIndex`.
  const opTBSBehind = function (opIndex, phraseIndex, sysData) {
    let i;
    const op = opcodes[opIndex];
    sysData.state = id.NOMATCH;
    const len = op.string.length;
    const beg = phraseIndex - len;
    if (beg >= 0) {
      for (i = 0; i < len; i += 1) {
        if (chars[beg + i] !== op.string[i]) {
          return;
        }
      }
      sysData.state = id.MATCH;
      sysData.phraseLength = len;
    }
  };
  // The right-to-left `TLS` operator.<br>
  // Called for `TLS` operators in look behind mode.
  // Matches the `TLS` phrase to the left of `phraseIndex`.
  const opTLSBehind = function (opIndex, phraseIndex, sysData) {
    let char;
    const op = opcodes[opIndex];
    sysData.state = id.NOMATCH;
    const len = op.string.length;
    if (len === 0) {
      /* EMPTY match allowed for TLS */
      sysData.state = id.EMPTY;
      return;
    }
    const beg = phraseIndex - len;
    if (beg >= 0) {
      for (let i = 0; i < len; i += 1) {
        char = chars[beg + i];
        if (char >= 65 && char <= 90) {
          char += 32;
        }
        if (char !== op.string[i]) {
          return;
        }
      }
      sysData.state = id.MATCH;
      sysData.phraseLength = len;
    }
  };
  // The right-to-left back reference operator.<br>
  // Matches the back referenced phrase to the left of `phraseIndex`.
  const opBKRBehind = function (opIndex, phraseIndex, sysData) {
    let i;
    let code;
    let lmcode;
    let lower;
    const op = opcodes[opIndex];
    /* NOMATCH default */
    sysData.state = id.NOMATCH;
    sysData.phraseLength = 0;
    if (op.index < rules.length) {
      lower = rules[op.index].lower;
    } else {
      lower = udts[op.index - rules.length].lower;
    }
    const frame = op.bkrMode === id.BKR_MODE_PM ? sysData.pFrame.getPhrase(lower) : sysData.uFrame.getPhrase(lower);
    const insensitive = op.bkrCase === id.BKR_MODE_CI;
    if (frame === null) {
      return;
    }
    const lmIndex = frame.phraseIndex;
    const len = frame.phraseLength;
    if (len === 0) {
      sysData.state = id.EMPTY;
      sysData.phraseLength = 0;
      return;
    }
    const beg = phraseIndex - len;
    if (beg >= 0) {
      if (insensitive) {
        /* case-insensitive match */
        for (i = 0; i < len; i += 1) {
          code = chars[beg + i];
          lmcode = chars[lmIndex + i];
          if (code >= 65 && code <= 90) {
            code += 32;
          }
          if (lmcode >= 65 && lmcode <= 90) {
            lmcode += 32;
          }
          if (code !== lmcode) {
            return;
          }
        }
        sysData.state = id.MATCH;
        sysData.phraseLength = len;
      } else {
        /* case-sensitive match */
        for (i = 0; i < len; i += 1) {
          code = chars[beg + i];
          lmcode = chars[lmIndex + i];
          if (code !== lmcode) {
            return;
          }
        }
      }
      sysData.state = id.MATCH;
      sysData.phraseLength = len;
    }
  };
  // Generalized execution function.<br>
  // Having a single, generalized function, allows a single location
  // for tracing and statistics gathering functions to be called.
  // Tracing and statistics are handled in separate objects.
  // However, the parser calls their API to build the object data records.
  // See [`trace.js`](./trace.html) and [`stats.js`](./stats.html) for their
  // usage.
  opExecute = function opExecuteFunc(opIndex, phraseIndex, sysData) {
    let ret = true;
    const op = opcodes[opIndex];
    nodeHits += 1;
    if (nodeHits > limitNodeHits) {
      throw new Error(`parser: maximum number of node hits exceeded: ${limitNodeHits}`);
    }
    treeDepth += 1;
    if (treeDepth > maxTreeDepth) {
      maxTreeDepth = treeDepth;
      if (maxTreeDepth > limitTreeDepth) {
        throw new Error(`parser: maximum parse tree depth exceeded: ${limitTreeDepth}`);
      }
    }
    sysData.refresh();
    if (thisThis.trace !== null) {
      /* collect the trace record for down the parse tree */
      const lk = lookAroundValue();
      thisThis.trace.down(op, sysData.state, phraseIndex, sysData.phraseLength, lk.anchor, lk.lookAround);
    }
    if (inLookBehind()) {
      switch (op.type) {
        case id.ALT:
          opALT(opIndex, phraseIndex, sysData);
          break;
        case id.CAT:
          opCATBehind(opIndex, phraseIndex, sysData);
          break;
        case id.REP:
          opREPBehind(opIndex, phraseIndex, sysData);
          break;
        case id.RNM:
          opRNM(opIndex, phraseIndex, sysData);
          break;
        case id.UDT:
          opUDT(opIndex, phraseIndex, sysData);
          break;
        case id.AND:
          opAND(opIndex, phraseIndex, sysData);
          break;
        case id.NOT:
          opNOT(opIndex, phraseIndex, sysData);
          break;
        case id.TRG:
          opTRGBehind(opIndex, phraseIndex, sysData);
          break;
        case id.TBS:
          opTBSBehind(opIndex, phraseIndex, sysData);
          break;
        case id.TLS:
          opTLSBehind(opIndex, phraseIndex, sysData);
          break;
        case id.BKR:
          opBKRBehind(opIndex, phraseIndex, sysData);
          break;
        case id.BKA:
          opBKA(opIndex, phraseIndex, sysData);
          break;
        case id.BKN:
          opBKN(opIndex, phraseIndex, sysData);
          break;
        case id.ABG:
          opABG(opIndex, phraseIndex, sysData);
          break;
        case id.AEN:
          opAEN(opIndex, phraseIndex, sysData);
          break;
        default:
          ret = false;
          break;
      }
    } else {
      switch (op.type) {
        case id.ALT:
          opALT(opIndex, phraseIndex, sysData);
          break;
        case id.CAT:
          opCAT(opIndex, phraseIndex, sysData);
          break;
        case id.REP:
          opREP(opIndex, phraseIndex, sysData);
          break;
        case id.RNM:
          opRNM(opIndex, phraseIndex, sysData);
          break;
        case id.UDT:
          opUDT(opIndex, phraseIndex, sysData);
          break;
        case id.AND:
          opAND(opIndex, phraseIndex, sysData);
          break;
        case id.NOT:
          opNOT(opIndex, phraseIndex, sysData);
          break;
        case id.TRG:
          opTRG(opIndex, phraseIndex, sysData);
          break;
        case id.TBS:
          opTBS(opIndex, phraseIndex, sysData);
          break;
        case id.TLS:
          opTLS(opIndex, phraseIndex, sysData);
          break;
        case id.BKR:
          opBKR(opIndex, phraseIndex, sysData);
          break;
        case id.BKA:
          opBKA(opIndex, phraseIndex, sysData);
          break;
        case id.BKN:
          opBKN(opIndex, phraseIndex, sysData);
          break;
        case id.ABG:
          opABG(opIndex, phraseIndex, sysData);
          break;
        case id.AEN:
          opAEN(opIndex, phraseIndex, sysData);
          break;
        default:
          ret = false;
          break;
      }
    }
    if (!inLookAround() && phraseIndex + sysData.phraseLength > maxMatched) {
      maxMatched = phraseIndex + sysData.phraseLength;
    }
    if (thisThis.stats !== null) {
      /* collect the statistics */
      thisThis.stats.collect(op, sysData);
    }
    if (thisThis.trace !== null) {
      /* collect the trace record for up the parse tree */
      const lk = lookAroundValue();
      thisThis.trace.up(op, sysData.state, phraseIndex, sysData.phraseLength, lk.anchor, lk.lookAround);
    }
    treeDepth -= 1;
    return ret;
  };
};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// This module is the constructor for the statistics gathering object.
// The statistics are nothing more than keeping a count of the
// number of times each node in the parse tree is traversed.
//
// Counts are collected for each of the individual types of operators.
// Additionally, counts are collected for each of the individually named
// `RNM` and `UDT` operators.
var stats = function statsFunc() {
  const id = identifiers;
  const utils = utilities;
  const style$1 = style;

  const thisFileName = 'stats.js: ';
  let rules = [];
  let udts = [];
  const stats = [];
  let totals;
  const ruleStats = [];
  const udtStats = [];
  this.statsObject = 'statsObject';
  const nameId = 'stats';
  /* `Array.sort()` callback function for sorting `RNM` and `UDT` operators alphabetically by name. */
  const sortAlpha = function sortAlpha(lhs, rhs) {
    if (lhs.lower < rhs.lower) {
      return -1;
    }
    if (lhs.lower > rhs.lower) {
      return 1;
    }
    return 0;
  };
  /* `Array.sort()` callback function for sorting `RNM` and `UDT` operators by hit count. */
  const sortHits = function sortHits(lhs, rhs) {
    if (lhs.total < rhs.total) {
      return 1;
    }
    if (lhs.total > rhs.total) {
      return -1;
    }
    return sortAlpha(lhs, rhs);
  };
  /* `Array.sort()` callback function for sorting `RNM` and `UDT` operators by index */
  /* (in the order in which they appear in the SABNF grammar). */
  const sortIndex = function sortIndex(lhs, rhs) {
    if (lhs.index < rhs.index) {
      return -1;
    }
    if (lhs.index > rhs.index) {
      return 1;
    }
    return 0;
  };
  const EmptyStat = function EmptyStat() {
    this.empty = 0;
    this.match = 0;
    this.nomatch = 0;
    this.total = 0;
  };
  /* Zero out all stats */
  const clear = function clear() {
    stats.length = 0;
    totals = new EmptyStat();
    stats[id.ALT] = new EmptyStat();
    stats[id.CAT] = new EmptyStat();
    stats[id.REP] = new EmptyStat();
    stats[id.RNM] = new EmptyStat();
    stats[id.TRG] = new EmptyStat();
    stats[id.TBS] = new EmptyStat();
    stats[id.TLS] = new EmptyStat();
    stats[id.UDT] = new EmptyStat();
    stats[id.AND] = new EmptyStat();
    stats[id.NOT] = new EmptyStat();
    stats[id.BKR] = new EmptyStat();
    stats[id.BKA] = new EmptyStat();
    stats[id.BKN] = new EmptyStat();
    stats[id.ABG] = new EmptyStat();
    stats[id.AEN] = new EmptyStat();
    ruleStats.length = 0;
    for (let i = 0; i < rules.length; i += 1) {
      ruleStats.push({
        empty: 0,
        match: 0,
        nomatch: 0,
        total: 0,
        name: rules[i].name,
        lower: rules[i].lower,
        index: rules[i].index,
      });
    }
    if (udts.length > 0) {
      udtStats.length = 0;
      for (let i = 0; i < udts.length; i += 1) {
        udtStats.push({
          empty: 0,
          match: 0,
          nomatch: 0,
          total: 0,
          name: udts[i].name,
          lower: udts[i].lower,
          index: udts[i].index,
        });
      }
    }
  };
  /* increment the designated operator hit count by one */
  const incStat = function incStat(stat, state) {
    stat.total += 1;
    switch (state) {
      case id.EMPTY:
        stat.empty += 1;
        break;
      case id.MATCH:
        stat.match += 1;
        break;
      case id.NOMATCH:
        stat.nomatch += 1;
        break;
      default:
        throw new Error(`${thisFileName}collect(): incStat(): unrecognized state: ${state}`);
    }
  };
  /* helper for toHtml() */
  const displayRow = function displayRow(name, stat) {
    let html = '';
    html += '<tr>';
    html += `<td class="${style$1.CLASS_ACTIVE}">${name}</td>`;
    html += `<td class="${style$1.CLASS_EMPTY}">${stat.empty}</td>`;
    html += `<td class="${style$1.CLASS_MATCH}">${stat.match}</td>`;
    html += `<td class="${style$1.CLASS_NOMATCH}">${stat.nomatch}</td>`;
    html += `<td class="${style$1.CLASS_ACTIVE}">${stat.total}</td>`;
    html += '</tr>\n';
    return html;
  };
  const displayOpsOnly = function displayOpsOnly() {
    let html = '';
    html += displayRow('ALT', stats[id.ALT]);
    html += displayRow('CAT', stats[id.CAT]);
    html += displayRow('REP', stats[id.REP]);
    html += displayRow('RNM', stats[id.RNM]);
    html += displayRow('TRG', stats[id.TRG]);
    html += displayRow('TBS', stats[id.TBS]);
    html += displayRow('TLS', stats[id.TLS]);
    html += displayRow('UDT', stats[id.UDT]);
    html += displayRow('AND', stats[id.AND]);
    html += displayRow('NOT', stats[id.NOT]);
    html += displayRow('BKR', stats[id.BKR]);
    html += displayRow('BKA', stats[id.BKA]);
    html += displayRow('BKN', stats[id.BKN]);
    html += displayRow('ABG', stats[id.ABG]);
    html += displayRow('AEN', stats[id.AEN]);
    html += displayRow('totals', totals);
    return html;
  };
  /* helper for toHtml() */
  const displayRules = function displayRules() {
    let html = '';
    html += '<tr><th></th><th></th><th></th><th></th><th></th></tr>\n';
    html += '<tr><th>rules</th><th></th><th></th><th></th><th></th></tr>\n';
    for (let i = 0; i < rules.length; i += 1) {
      if (ruleStats[i].total > 0) {
        html += '<tr>';
        html += `<td class="${style$1.CLASS_ACTIVE}">${ruleStats[i].name}</td>`;
        html += `<td class="${style$1.CLASS_EMPTY}">${ruleStats[i].empty}</td>`;
        html += `<td class="${style$1.CLASS_MATCH}">${ruleStats[i].match}</td>`;
        html += `<td class="${style$1.CLASS_NOMATCH}">${ruleStats[i].nomatch}</td>`;
        html += `<td class="${style$1.CLASS_ACTIVE}">${ruleStats[i].total}</td>`;
        html += '</tr>\n';
      }
    }
    if (udts.length > 0) {
      html += '<tr><th></th><th></th><th></th><th></th><th></th></tr>\n';
      html += '<tr><th>udts</th><th></th><th></th><th></th><th></th></tr>\n';
      for (let i = 0; i < udts.length; i += 1) {
        if (udtStats[i].total > 0) {
          html += '<tr>';
          html += `<td class="${style$1.CLASS_ACTIVE}">${udtStats[i].name}</td>`;
          html += `<td class="${style$1.CLASS_EMPTY}">${udtStats[i].empty}</td>`;
          html += `<td class="${style$1.CLASS_MATCH}">${udtStats[i].match}</td>`;
          html += `<td class="${style$1.CLASS_NOMATCH}">${udtStats[i].nomatch}</td>`;
          html += `<td class="${style$1.CLASS_ACTIVE}">${udtStats[i].total}</td>`;
          html += '</tr>\n';
        }
      }
    }
    return html;
  };
  /* called only by the parser to validate a stats object */
  this.validate = function validate(name) {
    let ret = false;
    if (typeof name === 'string' && nameId === name) {
      ret = true;
    }
    return ret;
  };
  /* no verification of input - only called by parser() */
  this.init = function init(inputRules, inputUdts) {
    rules = inputRules;
    udts = inputUdts;
    clear();
  };
  /* This function is the main interaction with the parser. */
  /* The parser calls it after each node has been traversed. */
  this.collect = function collect(op, result) {
    incStat(totals, result.state, result.phraseLength);
    incStat(stats[op.type], result.state, result.phraseLength);
    if (op.type === id.RNM) {
      incStat(ruleStats[op.index], result.state, result.phraseLength);
    }
    if (op.type === id.UDT) {
      incStat(udtStats[op.index], result.state, result.phraseLength);
    }
  };
  // Display the statistics as an HTML table.
  // - *type*
  //   - "ops" - (default) display only the total hit counts for all operator types.
  //   - "index" - additionally, display the hit counts for the individual `RNM` and `UDT` operators ordered by index.
  //   - "hits" - additionally, display the hit counts for the individual `RNM` and `UDT` operators by hit count.
  //   - "alpha" - additionally, display the hit counts for the individual `RNM` and `UDT` operators by name alphabetically.
  // - *caption* - optional caption for the table
  this.toHtml = function toHtml(type, caption) {
    let html = '';
    html += `<table class="${style$1.CLASS_STATS}">\n`;
    if (typeof caption === 'string') {
      html += `<caption>${caption}</caption>\n`;
    }
    html += `<tr><th class="${style$1.CLASS_ACTIVE}">ops</th>\n`;
    html += `<th class="${style$1.CLASS_EMPTY}">EMPTY</th>\n`;
    html += `<th class="${style$1.CLASS_MATCH}">MATCH</th>\n`;
    html += `<th class="${style$1.CLASS_NOMATCH}">NOMATCH</th>\n`;
    html += `<th class="${style$1.CLASS_ACTIVE}">totals</th></tr>\n`;
    const test = true;
    while (test) {
      if (type === undefined) {
        html += displayOpsOnly();
        break;
      }
      if (type === null) {
        html += displayOpsOnly();
        break;
      }
      if (type === 'ops') {
        html += displayOpsOnly();
        break;
      }
      if (type === 'index') {
        ruleStats.sort(sortIndex);
        if (udtStats.length > 0) {
          udtStats.sort(sortIndex);
        }
        html += displayOpsOnly();
        html += displayRules();
        break;
      }
      if (type === 'hits') {
        ruleStats.sort(sortHits);
        if (udtStats.length > 0) {
          udtStats.sort(sortIndex);
        }
        html += displayOpsOnly();
        html += displayRules();
        break;
      }
      if (type === 'alpha') {
        ruleStats.sort(sortAlpha);
        if (udtStats.length > 0) {
          udtStats.sort(sortAlpha);
        }
        html += displayOpsOnly();
        html += displayRules();
        break;
      }
      break;
    }
    html += '</table>\n';
    return html;
  };
  // Display the stats table in a complete HTML5 page.
  this.toHtmlPage = function toHtmlPage(type, caption, title) {
    return utils.htmlToPage(this.toHtml(type, caption), title);
  };
};

/* eslint-disable func-names */

/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */
// This module provides a means of tracing the parser through the parse tree as it goes.
// It is the primary debugging facility for debugging both the SABNF grammar syntax
// and the input strings that are supposed to be valid grammar sentences.
// It is also a very informative and educational tool for understanding
// how a parser actually operates for a given language.
//
// Tracing is the process of generating and saving a record of information for each passage
// of the parser through a parse tree node. And since it traverses each node twice, once down the tree
// and once coming back up, there are two records for each node.
// This, obviously, has the potential of generating lots of records.
// And since these records are normally displayed on a web page
// it is important to have a means to limit the actual number of records generated to
// probably no more that a few thousand. This is almost always enough to find any errors.
// The problem is to get the *right* few thousand records.
// Therefore, this module has a number of ways of limiting and/or filtering, the number and type of records.
// Considerable effort has been made to make this filtering of the trace output as simple
// and intuitive as possible.
//
// However, the ability to filter the trace records, or for that matter even understand what they are
// and the information they contain, does require a minimum amount of understanding of the APG parsing
// method. The parse tree nodes are all represented by APG operators. They break down into two natural groups.
// - The `RNM` operators and `UDT` operators are named phrases.
// These are names chosen by the writer of the SABNF grammar to represent special phrases of interest.
// - All others collect, concatenate and otherwise manipulate various intermediate phrases along the way.
//
// There are separate means of filtering which of these operators in each of these two groups get traced.
// Let `trace` be an instantiated `trace.js` object.
// Prior to parsing the string, filtering the rules and UDTs can be defined as follows:
// ```
// trace.filter.rules["rulename"] = true;
//     /* trace rule name "rulename" */
// trace.filter.rules["udtname"]  = true;
//     /* trace UDT name "udtname" */
// trace.filter.rules["<ALL>"]    = true;
//     /* trace all rules and UDTs (the default) */
// trace.filter.rules["<NONE>"]   = true;
//     /* trace no rules or UDTS */
// ```
// If any rule or UDT name other than "&lt;ALL>" or "&lt;NONE>" is specified, all other names are turned off.
// Therefore, to be selective of rule names, a filter statement is required for each rule/UDT name desired.
//
// Filtering of the other operators follows a similar procedure.
// ```
// trace.filter.operators["TRG"] = true;
//     /* trace the terminal range, TRG, operators */
// trace.filter.operators["CAT"]  = true;
//     /* trace the concatenations, CAT, operators */
// trace.filter.operators["<ALL>"]    = true;
//     /* trace all operators */
// trace.filter.operators["<NONE>"]   = true;
//     /* trace no operators (the default) */
// ```
// If any operator name other than "&lt;ALL>" or "&lt;NONE>" is specified, all other names are turned off.
// Therefore, to be selective of operator names, a filter statement is required for each name desired.
//
// There is, additionally, a means for limiting the total number of filtered or saved trace records.
// See the function, `setMaxRecords(max)` below. This will result in only the last `max` records being saved.
//
// (See [`apg-examples`](https://github.com/ldthomas/apg-js-examples) for examples of using `trace.js`.)
var trace = function exportTrace() {
  const utils = utilities;
  const style$1 = style;
  const circular = new (circularBuffer)();
  const id = identifiers;

  const thisFileName = 'trace.js: ';
  const that = this;
  const MODE_HEX = 16;
  const MODE_DEC = 10;
  const MODE_ASCII = 8;
  const MODE_UNICODE = 32;
  const MAX_PHRASE = 80;
  const MAX_TLS = 5;
  const records = [];
  let maxRecords = 5000;
  let lastRecord = -1;
  let filteredRecords = 0;
  let treeDepth = 0;
  const recordStack = [];
  let chars = null;
  let rules = null;
  let udts = null;
  const operatorFilter = [];
  const ruleFilter = [];
  /* special trace table phrases */
  const PHRASE_END = `<span class="${style$1.CLASS_LINEEND}">&bull;</span>`;
  const PHRASE_CONTINUE = `<span class="${style$1.CLASS_LINEEND}">&hellip;</span>`;
  const PHRASE_EMPTY = `<span class="${style$1.CLASS_EMPTY}">&#120634;</span>`;
  /* filter the non-RNM & non-UDT operators */
  const initOperatorFilter = function () {
    const setOperators = function (set) {
      operatorFilter[id.ALT] = set;
      operatorFilter[id.CAT] = set;
      operatorFilter[id.REP] = set;
      operatorFilter[id.TLS] = set;
      operatorFilter[id.TBS] = set;
      operatorFilter[id.TRG] = set;
      operatorFilter[id.AND] = set;
      operatorFilter[id.NOT] = set;
      operatorFilter[id.BKR] = set;
      operatorFilter[id.BKA] = set;
      operatorFilter[id.BKN] = set;
      operatorFilter[id.ABG] = set;
      operatorFilter[id.AEN] = set;
    };
    let items = 0;
    // eslint-disable-next-line no-unused-vars
    for (const name in that.filter.operators) {
      items += 1;
    }
    if (items === 0) {
      /* case 1: no operators specified: default: do not trace any operators */
      setOperators(false);
      return;
    }
    for (const name in that.filter.operators) {
      const upper = name.toUpperCase();
      if (upper === '<ALL>') {
        /* case 2: <all> operators specified: trace all operators ignore all other operator commands */
        setOperators(true);
        return;
      }
      if (upper === '<NONE>') {
        /* case 3: <none> operators specified: trace NO operators ignore all other operator commands */
        setOperators(false);
        return;
      }
    }
    setOperators(false);
    for (const name in that.filter.operators) {
      const upper = name.toUpperCase();
      /* case 4: one or more individual operators specified: trace 'true' operators only */
      if (upper === 'ALT') {
        operatorFilter[id.ALT] = that.filter.operators[name] === true;
      } else if (upper === 'CAT') {
        operatorFilter[id.CAT] = that.filter.operators[name] === true;
      } else if (upper === 'REP') {
        operatorFilter[id.REP] = that.filter.operators[name] === true;
      } else if (upper === 'AND') {
        operatorFilter[id.AND] = that.filter.operators[name] === true;
      } else if (upper === 'NOT') {
        operatorFilter[id.NOT] = that.filter.operators[name] === true;
      } else if (upper === 'TLS') {
        operatorFilter[id.TLS] = that.filter.operators[name] === true;
      } else if (upper === 'TBS') {
        operatorFilter[id.TBS] = that.filter.operators[name] === true;
      } else if (upper === 'TRG') {
        operatorFilter[id.TRG] = that.filter.operators[name] === true;
      } else if (upper === 'BKR') {
        operatorFilter[id.BKR] = that.filter.operators[name] === true;
      } else if (upper === 'BKA') {
        operatorFilter[id.BKA] = that.filter.operators[name] === true;
      } else if (upper === 'BKN') {
        operatorFilter[id.BKN] = that.filter.operators[name] === true;
      } else if (upper === 'ABG') {
        operatorFilter[id.ABG] = that.filter.operators[name] === true;
      } else if (upper === 'AEN') {
        operatorFilter[id.AEN] = that.filter.operators[name] === true;
      } else {
        throw new Error(
          `${thisFileName}initOpratorFilter: '${name}' not a valid operator name.` +
            ` Must be <all>, <none>, alt, cat, rep, tls, tbs, trg, and, not, bkr, bka or bkn`
        );
      }
    }
  };
  /* filter the rule and `UDT` named operators */
  const initRuleFilter = function () {
    const setRules = function (set) {
      operatorFilter[id.RNM] = set;
      operatorFilter[id.UDT] = set;
      const count = rules.length + udts.length;
      ruleFilter.length = 0;
      for (let i = 0; i < count; i += 1) {
        ruleFilter.push(set);
      }
    };
    let items;
    let i;
    const list = [];
    for (i = 0; i < rules.length; i += 1) {
      list.push(rules[i].lower);
    }
    for (i = 0; i < udts.length; i += 1) {
      list.push(udts[i].lower);
    }
    ruleFilter.length = 0;
    items = 0;
    // eslint-disable-next-line no-unused-vars
    for (const name in that.filter.rules) {
      items += 1;
    }
    if (items === 0) {
      /* case 1: default to all rules & udts */
      setRules(true);
      return;
    }
    for (const name in that.filter.rules) {
      const lower = name.toLowerCase();
      if (lower === '<all>') {
        /* case 2: trace all rules ignore all other rule commands */
        setRules(true);
        return;
      }
      if (lower === '<none>') {
        /* case 3: trace no rules */
        setRules(false);
        return;
      }
    }
    /* case 4: trace only individually specified rules */
    setRules(false);
    operatorFilter[id.RNM] = true;
    operatorFilter[id.UDT] = true;
    for (const name in that.filter.rules) {
      const lower = name.toLowerCase();
      i = list.indexOf(lower);
      if (i < 0) {
        throw new Error(`${thisFileName}initRuleFilter: '${name}' not a valid rule or udt name`);
      }
      ruleFilter[i] = that.filter.rules[name] === true;
    }
  };
  /* used by other APG components to verify that they have a valid trace object */
  this.traceObject = 'traceObject';
  this.filter = {
    operators: [],
    rules: [],
  };
  // Set the maximum number of records to keep (default = 5000).
  // Each record number larger than `maxRecords`
  // will result in deleting the previously oldest record.
  // - `max`: maximum number of records to retain (default = 5000)
  // - `last`: last record number to retain, (default = -1 for (unknown) actual last record)
  this.setMaxRecords = function (max, last) {
    lastRecord = -1;
    if (typeof max === 'number' && max > 0) {
      maxRecords = Math.ceil(max);
    } else {
      maxRecords = 0;
      return;
    }
    if (typeof last === 'number') {
      lastRecord = Math.floor(last);
      if (lastRecord < 0) {
        lastRecord = -1;
      }
    }
  };
  // Returns `maxRecords` to the caller.
  this.getMaxRecords = function () {
    return maxRecords;
  };
  // Returns `lastRecord` to the caller.
  this.getLastRecord = function () {
    return lastRecord;
  };
  /* Called only by the `parser.js` object. No verification of input. */
  this.init = function (rulesIn, udtsIn, charsIn) {
    records.length = 0;
    recordStack.length = 0;
    filteredRecords = 0;
    treeDepth = 0;
    chars = charsIn;
    rules = rulesIn;
    udts = udtsIn;
    initOperatorFilter();
    initRuleFilter();
    circular.init(maxRecords);
  };
  /* returns true if this records passes through the designated filter, false if the record is to be skipped */
  const filterOps = function (op) {
    let ret = false;
    if (op.type === id.RNM) {
      if (operatorFilter[op.type] && ruleFilter[op.index]) {
        ret = true;
      } else {
        ret = false;
      }
    } else if (op.type === id.UDT) {
      if (operatorFilter[op.type] && ruleFilter[rules.length + op.index]) {
        ret = true;
      } else {
        ret = false;
      }
    } else {
      ret = operatorFilter[op.type];
    }
    return ret;
  };
  const filterRecords = function (record) {
    if (lastRecord === -1) {
      return true;
    }
    if (record <= lastRecord) {
      return true;
    }
    return false;
  };
  /* Collect the "down" record. */
  this.down = function (op, state, offset, length, anchor, lookAround) {
    if (filterRecords(filteredRecords) && filterOps(op)) {
      recordStack.push(filteredRecords);
      records[circular.increment()] = {
        dirUp: false,
        depth: treeDepth,
        thisLine: filteredRecords,
        thatLine: undefined,
        opcode: op,
        state,
        phraseIndex: offset,
        phraseLength: length,
        lookAnchor: anchor,
        lookAround,
      };
      filteredRecords += 1;
      treeDepth += 1;
    }
  };
  /* Collect the "up" record. */
  this.up = function (op, state, offset, length, anchor, lookAround) {
    if (filterRecords(filteredRecords) && filterOps(op)) {
      const thisLine = filteredRecords;
      const thatLine = recordStack.pop();
      const thatRecord = circular.getListIndex(thatLine);
      if (thatRecord !== -1) {
        records[thatRecord].thatLine = thisLine;
      }
      treeDepth -= 1;
      records[circular.increment()] = {
        dirUp: true,
        depth: treeDepth,
        thisLine,
        thatLine,
        opcode: op,
        state,
        phraseIndex: offset,
        phraseLength: length,
        lookAnchor: anchor,
        lookAround,
      };
      filteredRecords += 1;
    }
  };
  /* convert the trace records to a tree of nodes */
  const toTreeObj = function () {
    /* private helper functions */
    function nodeOpcode(node, opcode) {
      let name;
      let casetype;
      let modetype;
      if (opcode) {
        node.op = { id: opcode.type, name: utils.opcodeToString(opcode.type) };
        node.opData = undefined;
        switch (opcode.type) {
          case id.RNM:
            node.opData = rules[opcode.index].name;
            break;
          case id.UDT:
            node.opData = udts[opcode.index].name;
            break;
          case id.BKR:
            if (opcode.index < rules.length) {
              name = rules[opcode.index].name;
            } else {
              name = udts[opcode.index - rules.length].name;
            }
            casetype = opcode.bkrCase === id.BKR_MODE_CI ? '%i' : '%s';
            modetype = opcode.bkrMode === id.BKR_MODE_UM ? '%u' : '%p';
            node.opData = `\\\\${casetype}${modetype}${name}`;
            break;
          case id.TLS:
            node.opData = [];
            for (let i = 0; i < opcode.string.length; i += 1) {
              node.opData.push(opcode.string[i]);
            }
            break;
          case id.TBS:
            node.opData = [];
            for (let i = 0; i < opcode.string.length; i += 1) {
              node.opData.push(opcode.string[i]);
            }
            break;
          case id.TRG:
            node.opData = [opcode.min, opcode.max];
            break;
          case id.REP:
            node.opData = [opcode.min, opcode.max];
            break;
          default:
            throw new Error('unrecognized opcode');
        }
      } else {
        node.op = { id: undefined, name: undefined };
        node.opData = undefined;
      }
    }
    function nodePhrase(state, index, length) {
      if (state === id.MATCH) {
        return {
          index,
          length,
        };
      }
      if (state === id.NOMATCH) {
        return {
          index,
          length: 0,
        };
      }
      if (state === id.EMPTY) {
        return {
          index,
          length: 0,
        };
      }
      return null;
    }
    let nodeId = -1;
    function nodeDown(parent, record, depth) {
      const node = {
        // eslint-disable-next-line no-plusplus
        id: nodeId++,
        branch: -1,
        parent,
        up: false,
        down: false,
        depth,
        children: [],
      };
      if (record) {
        node.down = true;
        node.state = { id: record.state, name: utils.stateToString(record.state) };
        node.phrase = null;
        nodeOpcode(node, record.opcode);
      } else {
        node.state = { id: undefined, name: undefined };
        node.phrase = nodePhrase();
        nodeOpcode(node, undefined);
      }
      return node;
    }
    function nodeUp(node, record) {
      if (record) {
        node.up = true;
        node.state = { id: record.state, name: utils.stateToString(record.state) };
        node.phrase = nodePhrase(record.state, record.phraseIndex, record.phraseLength);
        if (!node.down) {
          nodeOpcode(node, record.opcode);
        }
      }
    }
    /* walk the final tree: label branches and count leaf nodes */
    let leafNodes = 0;
    let depth = -1;
    let branchCount = 1;
    function walk(node) {
      depth += 1;
      node.branch = branchCount;
      if (depth > treeDepth) {
        treeDepth = depth;
      }
      if (node.children.length === 0) {
        leafNodes += 1;
      } else {
        for (let i = 0; i < node.children.length; i += 1) {
          if (i > 0) {
            branchCount += 1;
          }
          node.children[i].leftMost = false;
          node.children[i].rightMost = false;
          if (node.leftMost) {
            node.children[i].leftMost = i === 0;
          }
          if (node.rightMost) {
            node.children[i].rightMost = i === node.children.length - 1;
          }
          walk(node.children[i]);
        }
      }
      depth -= 1;
    }
    function display(node, offset) {
      let name;
      const obj = {};
      obj.id = node.id;
      obj.branch = node.branch;
      obj.leftMost = node.leftMost;
      obj.rightMost = node.rightMost;
      name = node.state.name ? node.state.name : 'ACTIVE';
      obj.state = { id: node.state.id, name };
      name = node.op.name ? node.op.name : '?';
      obj.op = { id: node.op.id, name };
      if (typeof node.opData === 'string') {
        obj.opData = node.opData;
      } else if (Array.isArray(node.opData)) {
        obj.opData = [];
        for (let i = 0; i < node.opData.length; i += 1) {
          obj.opData[i] = node.opData[i];
        }
      } else {
        obj.opData = undefined;
      }
      if (node.phrase) {
        obj.phrase = { index: node.phrase.index, length: node.phrase.length };
      } else {
        obj.phrase = null;
      }
      obj.depth = node.depth;
      obj.children = [];
      for (let i = 0; i < node.children.length; i += 1) {
        i !== node.children.length - 1;
        obj.children[i] = display(node.children[i]);
      }
      return obj;
    }

    /* construct the tree beginning here */
    const branch = [];
    let root;
    let node;
    let parent;
    let record;
    let firstRecord = true;
    /* push a dummy node so the root node will have a non-null parent */
    const dummy = nodeDown(null, null, -1);
    branch.push(dummy);
    node = dummy;
    circular.forEach((lineIndex) => {
      record = records[lineIndex];
      if (firstRecord) {
        firstRecord = false;
        if (record.depth > 0) {
          /* push some dummy nodes to fill in for missing records */
          const num = record.dirUp ? record.depth + 1 : record.depth;
          for (let i = 0; i < num; i += 1) {
            parent = node;
            node = nodeDown(node, null, i);
            branch.push(node);
            parent.children.push(node);
          }
        }
      }
      if (record.dirUp) {
        /* handle the next record up */
        node = branch.pop();
        nodeUp(node, record);
        node = branch[branch.length - 1];
      } else {
        /* handle the next record down */
        parent = node;
        node = nodeDown(node, record, record.depth);
        branch.push(node);
        parent.children.push(node);
      }
    });

    /* if not at root, walk it up to root */
    while (branch.length > 1) {
      node = branch.pop();
      nodeUp(node, null);
    }
    /* maybe redundant or paranoid tests: these should never happen */
    if (dummy.children.length === 0) {
      throw new Error('trace.toTree(): parse tree has no nodes');
    }
    if (branch.length === 0) {
      throw new Error('trace.toTree(): integrity check: dummy root node disappeared?');
    }

    /* if no record for start rule: find the pseudo root node (first dummy node above a real node) */
    root = dummy.children[0];
    let prev = root;
    while (root && !root.down && !root.up) {
      prev = root;
      root = root.children[0];
    }
    root = prev;

    /* walk the tree of nodes: label brances and count leaves */
    root.leftMost = true;
    root.rightMost = true;
    walk(root);
    root.branch = 0;

    /* generate the exported object */
    const obj = {};
    obj.string = [];
    for (let i = 0; i < chars.length; i += 1) {
      obj.string[i] = chars[i];
    }
    /* generate the exported rule names */
    obj.rules = [];
    for (let i = 0; i < rules.length; i += 1) {
      obj.rules[i] = rules[i].name;
    }
    /* generate the exported UDT names */
    obj.udts = [];
    for (let i = 0; i < udts.length; i += 1) {
      obj.udts[i] = udts[i].name;
    }
    /* generate the ids */
    obj.id = {};
    obj.id.ALT = { id: id.ALT, name: 'ALT' };
    obj.id.CAT = { id: id.CAT, name: 'CAT' };
    obj.id.REP = { id: id.REP, name: 'REP' };
    obj.id.RNM = { id: id.RNM, name: 'RNM' };
    obj.id.TLS = { id: id.TLS, name: 'TLS' };
    obj.id.TBS = { id: id.TBS, name: 'TBS' };
    obj.id.TRG = { id: id.TRG, name: 'TRG' };
    obj.id.UDT = { id: id.UDT, name: 'UDT' };
    obj.id.AND = { id: id.AND, name: 'AND' };
    obj.id.NOT = { id: id.NOT, name: 'NOT' };
    obj.id.BKR = { id: id.BKR, name: 'BKR' };
    obj.id.BKA = { id: id.BKA, name: 'BKA' };
    obj.id.BKN = { id: id.BKN, name: 'BKN' };
    obj.id.ABG = { id: id.ABG, name: 'ABG' };
    obj.id.AEN = { id: id.AEN, name: 'AEN' };
    obj.id.ACTIVE = { id: id.ACTIVE, name: 'ACTIVE' };
    obj.id.MATCH = { id: id.MATCH, name: 'MATCH' };
    obj.id.EMPTY = { id: id.EMPTY, name: 'EMPTY' };
    obj.id.NOMATCH = { id: id.NOMATCH, name: 'NOMATCH' };
    /* generate the max tree depth */
    obj.treeDepth = treeDepth;
    /* generate the number of leaf nodes (branches) */
    obj.leafNodes = leafNodes;
    /* generate the types of the left- and right-most branches */
    let branchesIncomplete;
    if (root.down) {
      if (root.up) {
        branchesIncomplete = 'none';
      } else {
        branchesIncomplete = 'right';
      }
    } else if (root.up) {
      branchesIncomplete = 'left';
    } else {
      branchesIncomplete = 'both';
    }
    obj.branchesIncomplete = branchesIncomplete;
    obj.tree = display(root, root.depth);
    return obj;
  };
  // Returns the trace records as JSON parse tree object.
  // - stringify: if `true`, the object is 'stringified' before returning, otherwise, the object itself is returned.
  this.toTree = function (stringify) {
    const obj = toTreeObj();
    if (stringify) {
      return JSON.stringify(obj);
    }
    return obj;
  };
  // Translate the trace records to HTML format and create a complete HTML page for browser display.
  this.toHtmlPage = function (mode, caption, title) {
    return utils.htmlToPage(this.toHtml(mode, caption), title);
  };

  /* From here on down, these are just helper functions for `toHtml()`. */
  const htmlHeader = function (mode, caption) {
    /* open the page */
    /* write the HTML5 header with table style */
    /* open the <table> tag */
    let modeName;
    switch (mode) {
      case MODE_HEX:
        modeName = 'hexadecimal';
        break;
      case MODE_DEC:
        modeName = 'decimal';
        break;
      case MODE_ASCII:
        modeName = 'ASCII';
        break;
      case MODE_UNICODE:
        modeName = 'UNICODE';
        break;
      default:
        throw new Error(`${thisFileName}htmlHeader: unrecognized mode: ${mode}`);
    }
    let header = '';
    header += `<p>display mode: ${modeName}</p>\n`;
    header += `<table class="${style$1.CLASS_TRACE}">\n`;
    if (typeof caption === 'string') {
      header += `<caption>${caption}</caption>`;
    }
    return header;
  };
  const htmlFooter = function () {
    let footer = '';
    /* close the </table> tag */
    footer += '</table>\n';
    /* display a table legend */
    footer += `<p class="${style$1.CLASS_MONOSPACE}">legend:<br>\n`;
    footer += '(a)&nbsp;-&nbsp;line number<br>\n';
    footer += '(b)&nbsp;-&nbsp;matching line number<br>\n';
    footer += '(c)&nbsp;-&nbsp;phrase offset<br>\n';
    footer += '(d)&nbsp;-&nbsp;phrase length<br>\n';
    footer += '(e)&nbsp;-&nbsp;tree depth<br>\n';
    footer += '(f)&nbsp;-&nbsp;operator state<br>\n';
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_ACTIVE}">&darr;</span>&nbsp;&nbsp;phrase opened<br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_MATCH}">&uarr;M</span> phrase matched<br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_EMPTY}">&uarr;E</span> empty phrase matched<br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_NOMATCH}">&uarr;N</span> phrase not matched<br>\n`;
    footer +=
      'operator&nbsp;-&nbsp;ALT, CAT, REP, RNM, TRG, TLS, TBS<sup>&dagger;</sup>, UDT, AND, NOT, BKA, BKN, BKR, ABG, AEN<sup>&Dagger;</sup><br>\n';
    footer += `phrase&nbsp;&nbsp;&nbsp;-&nbsp;up to ${MAX_PHRASE} characters of the phrase being matched<br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_MATCH}">matched characters</span><br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_LOOKAHEAD}">matched characters in look ahead mode</span><br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_LOOKBEHIND}">matched characters in look behind mode</span><br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_REMAINDER}">remainder characters(not yet examined by parser)</span><br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;<span class="${style$1.CLASS_CTRLCHAR}">control characters, TAB, LF, CR, etc. (ASCII mode only)</span><br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;${PHRASE_EMPTY} empty string<br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;${PHRASE_END} end of input string<br>\n`;
    footer += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;${PHRASE_CONTINUE} input string display truncated<br>\n`;
    footer += '</p>\n';
    footer += `<p class="${style$1.CLASS_MONOSPACE}">\n`;
    footer += '<sup>&dagger;</sup>original ABNF operators:<br>\n';
    footer += 'ALT - alternation<br>\n';
    footer += 'CAT - concatenation<br>\n';
    footer += 'REP - repetition<br>\n';
    footer += 'RNM - rule name<br>\n';
    footer += 'TRG - terminal range<br>\n';
    footer += 'TLS - terminal literal string (case insensitive)<br>\n';
    footer += 'TBS - terminal binary string (case sensitive)<br>\n';
    footer += '<br>\n';
    footer += '<sup>&Dagger;</sup>super set SABNF operators:<br>\n';
    footer += 'UDT - user-defined terminal<br>\n';
    footer += 'AND - positive look ahead<br>\n';
    footer += 'NOT - negative look ahead<br>\n';
    footer += 'BKA - positive look behind<br>\n';
    footer += 'BKN - negative look behind<br>\n';
    footer += 'BKR - back reference<br>\n';
    footer += 'ABG - anchor - begin of input string<br>\n';
    footer += 'AEN - anchor - end of input string<br>\n';
    footer += '</p>\n';
    return footer;
  };
  this.indent = function (depth) {
    let html = '';
    for (let i = 0; i < depth; i += 1) {
      html += '.';
    }
    return html;
  };
  /* format the TRG operator */
  const displayTrg = function (mode, op) {
    let html = '';
    if (op.type === id.TRG) {
      if (mode === MODE_HEX || mode === MODE_UNICODE) {
        let hex = op.min.toString(16).toUpperCase();
        if (hex.length % 2 !== 0) {
          hex = `0${hex}`;
        }
        html += mode === MODE_HEX ? '%x' : 'U+';
        html += hex;
        hex = op.max.toString(16).toUpperCase();
        if (hex.length % 2 !== 0) {
          hex = `0${hex}`;
        }
        html += `&ndash;${hex}`;
      } else {
        html = `%d${op.min.toString(10)}&ndash;${op.max.toString(10)}`;
      }
    }
    return html;
  };
  /* format the REP operator */
  const displayRep = function (mode, op) {
    let html = '';
    if (op.type === id.REP) {
      if (mode === MODE_HEX) {
        let hex = op.min.toString(16).toUpperCase();
        if (hex.length % 2 !== 0) {
          hex = `0${hex}`;
        }
        html = `x${hex}`;
        if (op.max < Infinity) {
          hex = op.max.toString(16).toUpperCase();
          if (hex.length % 2 !== 0) {
            hex = `0${hex}`;
          }
        } else {
          hex = 'inf';
        }
        html += `&ndash;${hex}`;
      } else if (op.max < Infinity) {
        html = `${op.min.toString(10)}&ndash;${op.max.toString(10)}`;
      } else {
        html = `${op.min.toString(10)}&ndash;inf`;
      }
    }
    return html;
  };
  /* format the TBS operator */
  const displayTbs = function (mode, op) {
    let html = '';
    if (op.type === id.TBS) {
      const len = Math.min(op.string.length, MAX_TLS * 2);
      if (mode === MODE_HEX || mode === MODE_UNICODE) {
        html += mode === MODE_HEX ? '%x' : 'U+';
        for (let i = 0; i < len; i += 1) {
          let hex;
          if (i > 0) {
            html += '.';
          }
          hex = op.string[i].toString(16).toUpperCase();
          if (hex.length % 2 !== 0) {
            hex = `0${hex}`;
          }
          html += hex;
        }
      } else {
        html = '%d';
        for (let i = 0; i < len; i += 1) {
          if (i > 0) {
            html += '.';
          }
          html += op.string[i].toString(10);
        }
      }
      if (len < op.string.length) {
        html += PHRASE_CONTINUE;
      }
    }
    return html;
  };
  /* format the TLS operator */
  const displayTls = function (mode, op) {
    let html = '';
    if (op.type === id.TLS) {
      const len = Math.min(op.string.length, MAX_TLS);
      if (mode === MODE_HEX || mode === MODE_DEC) {
        let charu;
        let charl;
        let base;
        if (mode === MODE_HEX) {
          html = '%x';
          base = 16;
        } else {
          html = '%d';
          base = 10;
        }
        for (let i = 0; i < len; i += 1) {
          if (i > 0) {
            html += '.';
          }
          charl = op.string[i];
          if (charl >= 97 && charl <= 122) {
            charu = charl - 32;
            html += `${charu.toString(base)}/${charl.toString(base)}`.toUpperCase();
          } else if (charl >= 65 && charl <= 90) {
            charu = charl;
            charl += 32;
            html += `${charu.toString(base)}/${charl.toString(base)}`.toUpperCase();
          } else {
            html += charl.toString(base).toUpperCase();
          }
        }
        if (len < op.string.length) {
          html += PHRASE_CONTINUE;
        }
      } else {
        html = '"';
        for (let i = 0; i < len; i += 1) {
          html += utils.asciiChars[op.string[i]];
        }
        if (len < op.string.length) {
          html += PHRASE_CONTINUE;
        }
        html += '"';
      }
    }
    return html;
  };
  const subPhrase = function (mode, charsArg, index, length, prev) {
    if (length === 0) {
      return '';
    }
    let phrase = '';
    const comma = prev ? ',' : '';
    switch (mode) {
      case MODE_HEX:
        phrase = comma + utils.charsToHex(charsArg, index, length);
        break;
      case MODE_DEC:
        if (prev) {
          return `,${utils.charsToDec(charsArg, index, length)}`;
        }
        phrase = comma + utils.charsToDec(charsArg, index, length);
        break;
      case MODE_UNICODE:
        phrase = utils.charsToUnicode(charsArg, index, length);
        break;
      case MODE_ASCII:
      default:
        phrase = utils.charsToAsciiHtml(charsArg, index, length);
        break;
    }
    return phrase;
  };
  /* display phrases matched in look-behind mode */
  const displayBehind = function (mode, charsArg, state, index, length, anchor) {
    let html = '';
    let beg1;
    let len1;
    let beg2;
    let len2;
    let lastchar = PHRASE_END;
    const spanBehind = `<span class="${style$1.CLASS_LOOKBEHIND}">`;
    const spanRemainder = `<span class="${style$1.CLASS_REMAINDER}">`;
    const spanend = '</span>';
    let prev = false;
    switch (state) {
      case id.EMPTY:
        html += PHRASE_EMPTY;
      /* // eslint-disable-next-line no-fallthrough */
      case id.NOMATCH:
      case id.MATCH:
      case id.ACTIVE:
        beg1 = index - length;
        len1 = anchor - beg1;
        beg2 = anchor;
        len2 = charsArg.length - beg2;
        break;
      default:
        throw new Error('unrecognized state');
    }
    lastchar = PHRASE_END;
    if (len1 > MAX_PHRASE) {
      len1 = MAX_PHRASE;
      lastchar = PHRASE_CONTINUE;
      len2 = 0;
    } else if (len1 + len2 > MAX_PHRASE) {
      lastchar = PHRASE_CONTINUE;
      len2 = MAX_PHRASE - len1;
    }
    if (len1 > 0) {
      html += spanBehind;
      html += subPhrase(mode, charsArg, beg1, len1, prev);
      html += spanend;
      prev = true;
    }
    if (len2 > 0) {
      html += spanRemainder;
      html += subPhrase(mode, charsArg, beg2, len2, prev);
      html += spanend;
    }
    return html + lastchar;
  };
  const displayForward = function (mode, charsArg, state, index, length, spanAhead) {
    let html = '';
    let beg1;
    let len1;
    let beg2;
    let len2;
    let lastchar = PHRASE_END;
    const spanRemainder = `<span class="${style$1.CLASS_REMAINDER}">`;
    const spanend = '</span>';
    let prev = false;
    switch (state) {
      case id.EMPTY:
        html += PHRASE_EMPTY;
      /* // eslint-disable-next-line no-fallthrough */
      case id.NOMATCH:
      case id.ACTIVE:
        beg1 = index;
        len1 = 0;
        beg2 = index;
        len2 = charsArg.length - beg2;
        break;
      case id.MATCH:
        beg1 = index;
        len1 = length;
        beg2 = index + len1;
        len2 = charsArg.length - beg2;
        break;
      default:
        throw new Error('unrecognized state');
    }
    lastchar = PHRASE_END;
    if (len1 > MAX_PHRASE) {
      len1 = MAX_PHRASE;
      lastchar = PHRASE_CONTINUE;
      len2 = 0;
    } else if (len1 + len2 > MAX_PHRASE) {
      lastchar = PHRASE_CONTINUE;
      len2 = MAX_PHRASE - len1;
    }
    if (len1 > 0) {
      html += spanAhead;
      html += subPhrase(mode, charsArg, beg1, len1, prev);
      html += spanend;
      prev = true;
    }
    if (len2 > 0) {
      html += spanRemainder;
      html += subPhrase(mode, charsArg, beg2, len2, prev);
      html += spanend;
    }
    return html + lastchar;
  };
  /* display phrases matched in look-ahead mode */
  const displayAhead = function (mode, charsArg, state, index, length) {
    const spanAhead = `<span class="${style$1.CLASS_LOOKAHEAD}">`;
    return displayForward(mode, charsArg, state, index, length, spanAhead);
  };
  /* display phrases matched in normal parsing mode */
  const displayNone = function (mode, charsArg, state, index, length) {
    const spanAhead = `<span class="${style$1.CLASS_MATCH}">`;
    return displayForward(mode, charsArg, state, index, length, spanAhead);
  };
  /* Returns the filtered records, formatted as an HTML table. */
  const htmlTable = function (mode) {
    if (rules === null) {
      return '';
    }
    let html = '';
    let thisLine;
    let thatLine;
    let lookAhead;
    let lookBehind;
    let lookAround;
    let anchor;
    html += '<tr><th>(a)</th><th>(b)</th><th>(c)</th><th>(d)</th><th>(e)</th><th>(f)</th>';
    html += '<th>operator</th><th>phrase</th></tr>\n';
    circular.forEach((lineIndex) => {
      const line = records[lineIndex];
      thisLine = line.thisLine;
      thatLine = line.thatLine !== undefined ? line.thatLine : '--';
      lookAhead = false;
      lookBehind = false;
      lookAround = false;
      if (line.lookAround === id.LOOKAROUND_AHEAD) {
        lookAhead = true;
        lookAround = true;
        anchor = line.lookAnchor;
      }
      if (line.opcode.type === id.AND || line.opcode.type === id.NOT) {
        lookAhead = true;
        lookAround = true;
        anchor = line.phraseIndex;
      }
      if (line.lookAround === id.LOOKAROUND_BEHIND) {
        lookBehind = true;
        lookAround = true;
        anchor = line.lookAnchor;
      }
      if (line.opcode.type === id.BKA || line.opcode.type === id.BKN) {
        lookBehind = true;
        lookAround = true;
        anchor = line.phraseIndex;
      }
      html += '<tr>';
      html += `<td>${thisLine}</td><td>${thatLine}</td>`;
      html += `<td>${line.phraseIndex}</td>`;
      html += `<td>${line.phraseLength}</td>`;
      html += `<td>${line.depth}</td>`;
      html += '<td>';
      switch (line.state) {
        case id.ACTIVE:
          html += `<span class="${style$1.CLASS_ACTIVE}">&darr;&nbsp;</span>`;
          break;
        case id.MATCH:
          html += `<span class="${style$1.CLASS_MATCH}">&uarr;M</span>`;
          break;
        case id.NOMATCH:
          html += `<span class="${style$1.CLASS_NOMATCH}">&uarr;N</span>`;
          break;
        case id.EMPTY:
          html += `<span class="${style$1.CLASS_EMPTY}">&uarr;E</span>`;
          break;
        default:
          html += `<span class="${style$1.CLASS_ACTIVE}">--</span>`;
          break;
      }
      html += '</td>';
      html += '<td>';
      html += that.indent(line.depth);
      if (lookAhead) {
        html += `<span class="${style$1.CLASS_LOOKAHEAD}">`;
      } else if (lookBehind) {
        html += `<span class="${style$1.CLASS_LOOKBEHIND}">`;
      }
      html += utils.opcodeToString(line.opcode.type);
      if (line.opcode.type === id.RNM) {
        html += `(${rules[line.opcode.index].name}) `;
      }
      if (line.opcode.type === id.BKR) {
        const casetype = line.opcode.bkrCase === id.BKR_MODE_CI ? '%i' : '%s';
        const modetype = line.opcode.bkrMode === id.BKR_MODE_UM ? '%u' : '%p';
        html += `(\\${casetype}${modetype}${rules[line.opcode.index].name}) `;
      }
      if (line.opcode.type === id.UDT) {
        html += `(${udts[line.opcode.index].name}) `;
      }
      if (line.opcode.type === id.TRG) {
        html += `(${displayTrg(mode, line.opcode)}) `;
      }
      if (line.opcode.type === id.TBS) {
        html += `(${displayTbs(mode, line.opcode)}) `;
      }
      if (line.opcode.type === id.TLS) {
        html += `(${displayTls(mode, line.opcode)}) `;
      }
      if (line.opcode.type === id.REP) {
        html += `(${displayRep(mode, line.opcode)}) `;
      }
      if (lookAround) {
        html += '</span>';
      }
      html += '</td>';
      html += '<td>';
      if (lookBehind) {
        html += displayBehind(mode, chars, line.state, line.phraseIndex, line.phraseLength, anchor);
      } else if (lookAhead) {
        html += displayAhead(mode, chars, line.state, line.phraseIndex, line.phraseLength);
      } else {
        html += displayNone(mode, chars, line.state, line.phraseIndex, line.phraseLength);
      }
      html += '</td></tr>\n';
    });
    html += '<tr><th>(a)</th><th>(b)</th><th>(c)</th><th>(d)</th><th>(e)</th><th>(f)</th>';
    html += '<th>operator</th><th>phrase</th></tr>\n';
    html += '</table>\n';
    return html;
  };
  // Translate the trace records to HTML format.
  // - *modearg* - can be `"ascii"`, `"decimal"`, `"hexadecimal"` or `"unicode"`.
  // Determines the format of the string character code display.
  // - *caption* - optional caption for the HTML table.
  this.toHtml = function (modearg, caption) {
    /* writes the trace records as a table in a complete html page */
    let mode = MODE_ASCII;
    if (typeof modearg === 'string' && modearg.length >= 3) {
      const modein = modearg.toLowerCase().slice(0, 3);
      if (modein === 'hex') {
        mode = MODE_HEX;
      } else if (modein === 'dec') {
        mode = MODE_DEC;
      } else if (modein === 'uni') {
        mode = MODE_UNICODE;
      }
    }
    let html = '';
    html += htmlHeader(mode, caption);
    html += htmlTable(mode);
    html += htmlFooter();
    return html;
  };
};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// This module serves to export all library objects and object constructors with the `require("apg-lib")` statement.
// For example, to create a new parser in your program,
// ````
// let apglib = require("../apg-lib/node-exports");
// let my-parser = new apglib.parser();
// ````
var nodeExports$1 = {
  ast: ast,
  circular: circularBuffer,
  ids: identifiers,
  parser: parser$1,
  stats: stats,
  trace: trace,
  utils: utilities,
  emitcss: emitcss,
  style: style,
};

var scannerGrammar;
var hasRequiredScannerGrammar;

function requireScannerGrammar () {
	if (hasRequiredScannerGrammar) return scannerGrammar;
	hasRequiredScannerGrammar = 1;
	// copyright: Copyright (c) 2024 Lowell D. Thomas, all rights reserved<br>
	//   license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)<br>
	//
	// Generated by apg-js, Version 4.4.0 [apg-js](https://github.com/ldthomas/apg-js)
	scannerGrammar = function grammar(){
	  // ```
	  // SUMMARY
	  //      rules = 10
	  //       udts = 0
	  //    opcodes = 31
	  //        ---   ABNF original opcodes
	  //        ALT = 5
	  //        CAT = 2
	  //        REP = 4
	  //        RNM = 11
	  //        TLS = 0
	  //        TBS = 4
	  //        TRG = 5
	  //        ---   SABNF superset opcodes
	  //        UDT = 0
	  //        AND = 0
	  //        NOT = 0
	  //        BKA = 0
	  //        BKN = 0
	  //        BKR = 0
	  //        ABG = 0
	  //        AEN = 0
	  // characters = [0 - 4294967295]
	  // ```
	  /* OBJECT IDENTIFIER (for internal parser use) */
	  this.grammarObject = 'grammarObject';

	  /* RULES */
	  this.rules = [];
	  this.rules[0] = { name: 'file', lower: 'file', index: 0, isBkr: false };
	  this.rules[1] = { name: 'line', lower: 'line', index: 1, isBkr: false };
	  this.rules[2] = { name: 'line-text', lower: 'line-text', index: 2, isBkr: false };
	  this.rules[3] = { name: 'last-line', lower: 'last-line', index: 3, isBkr: false };
	  this.rules[4] = { name: 'valid', lower: 'valid', index: 4, isBkr: false };
	  this.rules[5] = { name: 'invalid', lower: 'invalid', index: 5, isBkr: false };
	  this.rules[6] = { name: 'end', lower: 'end', index: 6, isBkr: false };
	  this.rules[7] = { name: 'CRLF', lower: 'crlf', index: 7, isBkr: false };
	  this.rules[8] = { name: 'LF', lower: 'lf', index: 8, isBkr: false };
	  this.rules[9] = { name: 'CR', lower: 'cr', index: 9, isBkr: false };

	  /* UDTS */
	  this.udts = [];

	  /* OPCODES */
	  /* file */
	  this.rules[0].opcodes = [];
	  this.rules[0].opcodes[0] = { type: 2, children: [1,3] };// CAT
	  this.rules[0].opcodes[1] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[0].opcodes[2] = { type: 4, index: 1 };// RNM(line)
	  this.rules[0].opcodes[3] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[0].opcodes[4] = { type: 4, index: 3 };// RNM(last-line)

	  /* line */
	  this.rules[1].opcodes = [];
	  this.rules[1].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[1].opcodes[1] = { type: 4, index: 2 };// RNM(line-text)
	  this.rules[1].opcodes[2] = { type: 4, index: 6 };// RNM(end)

	  /* line-text */
	  this.rules[2].opcodes = [];
	  this.rules[2].opcodes[0] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[2].opcodes[1] = { type: 1, children: [2,3] };// ALT
	  this.rules[2].opcodes[2] = { type: 4, index: 4 };// RNM(valid)
	  this.rules[2].opcodes[3] = { type: 4, index: 5 };// RNM(invalid)

	  /* last-line */
	  this.rules[3].opcodes = [];
	  this.rules[3].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[3].opcodes[1] = { type: 1, children: [2,3] };// ALT
	  this.rules[3].opcodes[2] = { type: 4, index: 4 };// RNM(valid)
	  this.rules[3].opcodes[3] = { type: 4, index: 5 };// RNM(invalid)

	  /* valid */
	  this.rules[4].opcodes = [];
	  this.rules[4].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[4].opcodes[1] = { type: 5, min: 32, max: 126 };// TRG
	  this.rules[4].opcodes[2] = { type: 6, string: [9] };// TBS

	  /* invalid */
	  this.rules[5].opcodes = [];
	  this.rules[5].opcodes[0] = { type: 1, children: [1,2,3,4] };// ALT
	  this.rules[5].opcodes[1] = { type: 5, min: 0, max: 8 };// TRG
	  this.rules[5].opcodes[2] = { type: 5, min: 11, max: 12 };// TRG
	  this.rules[5].opcodes[3] = { type: 5, min: 14, max: 31 };// TRG
	  this.rules[5].opcodes[4] = { type: 5, min: 127, max: 4294967295 };// TRG

	  /* end */
	  this.rules[6].opcodes = [];
	  this.rules[6].opcodes[0] = { type: 1, children: [1,2,3] };// ALT
	  this.rules[6].opcodes[1] = { type: 4, index: 7 };// RNM(CRLF)
	  this.rules[6].opcodes[2] = { type: 4, index: 8 };// RNM(LF)
	  this.rules[6].opcodes[3] = { type: 4, index: 9 };// RNM(CR)

	  /* CRLF */
	  this.rules[7].opcodes = [];
	  this.rules[7].opcodes[0] = { type: 6, string: [13,10] };// TBS

	  /* LF */
	  this.rules[8].opcodes = [];
	  this.rules[8].opcodes[0] = { type: 6, string: [10] };// TBS

	  /* CR */
	  this.rules[9].opcodes = [];
	  this.rules[9].opcodes[0] = { type: 6, string: [13] };// TBS

	  // The `toString()` function will display the original grammar file(s) that produced these opcodes.
	  this.toString = function toString(){
	    let str = "";
	    str += "file = *line [last-line]\n";
	    str += "line = line-text end\n";
	    str += "line-text = *(valid/invalid)\n";
	    str += "last-line = 1*(valid/invalid)\n";
	    str += "valid = %d32-126 / %d9\n";
	    str += "invalid = %d0-8 / %d11-12 /%d14-31 / %x7f-ffffffff\n";
	    str += "end = CRLF / LF / CR\n";
	    str += "CRLF = %d13.10\n";
	    str += "LF = %d10\n";
	    str += "CR = %d13\n";
	    return str;
	  };
	};
	return scannerGrammar;
}

var scannerCallbacks = {};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var hasRequiredScannerCallbacks;

function requireScannerCallbacks () {
	if (hasRequiredScannerCallbacks) return scannerCallbacks;
	hasRequiredScannerCallbacks = 1;
	// These are the AST translation callback functions used by the scanner
	// to analyze the characters and lines.
	const ids = identifiers;
	const utils = utilities;

	function semLine(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_PRE) {
	    data.endLength = 0;
	    data.textLength = 0;
	    data.invalidCount = 0;
	  } else {
	    data.lines.push({
	      lineNo: data.lines.length,
	      beginChar: phraseIndex,
	      length: phraseCount,
	      textLength: data.textLength,
	      endType: data.endType,
	      invalidChars: data.invalidCount,
	    });
	  }
	  return ids.SEM_OK;
	}
	function semLineText(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_PRE) {
	    data.textLength = phraseCount;
	  }
	  return ids.SEM_OK;
	}
	function semLastLine(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_PRE) {
	    data.endLength = 0;
	    data.textLength = 0;
	    data.invalidCount = 0;
	  } else if (data.strict) {
	    data.lines.push({
	      lineNo: data.lines.length,
	      beginChar: phraseIndex,
	      length: phraseCount,
	      textLength: phraseCount,
	      endType: 'none',
	      invalidChars: data.invalidCount,
	    });
	    data.errors.push({
	      line: data.lineNo,
	      char: phraseIndex + phraseCount,
	      msg: 'no line end on last line - strict ABNF specifies CRLF(\\r\\n, \\x0D\\x0A)',
	    });
	  } else {
	    /* add a line ender */
	    chars.push(10);
	    data.lines.push({
	      lineNo: data.lines.length,
	      beginChar: phraseIndex,
	      length: phraseCount + 1,
	      textLength: phraseCount,
	      endType: 'LF',
	      invalidChars: data.invalidCount,
	    });
	  }
	  return ids.SEM_OK;
	}
	function semInvalid(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_PRE) {
	    data.errors.push({
	      line: data.lineNo,
	      char: phraseIndex,
	      msg: `invalid character found '\\x${utils.charToHex(chars[phraseIndex])}'`,
	    });
	  }
	  return ids.SEM_OK;
	}
	function semEnd(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_POST) {
	    data.lineNo += 1;
	  }
	  return ids.SEM_OK;
	}
	function semLF(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_PRE) {
	    data.endType = 'LF';
	    if (data.strict) {
	      data.errors.push({
	        line: data.lineNo,
	        char: phraseIndex,
	        msg: 'line end character LF(\\n, \\x0A) - strict ABNF specifies CRLF(\\r\\n, \\x0D\\x0A)',
	      });
	    }
	  }
	  return ids.SEM_OK;
	}
	function semCR(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_PRE) {
	    data.endType = 'CR';
	    if (data.strict) {
	      data.errors.push({
	        line: data.lineNo,
	        char: phraseIndex,
	        msg: 'line end character CR(\\r, \\x0D) - strict ABNF specifies CRLF(\\r\\n, \\x0D\\x0A)',
	      });
	    }
	  }
	  return ids.SEM_OK;
	}
	function semCRLF(state, chars, phraseIndex, phraseCount, data) {
	  if (state === ids.SEM_PRE) {
	    data.endType = 'CRLF';
	  }
	  return ids.SEM_OK;
	}
	const callbacks = [];
	callbacks.line = semLine;
	callbacks['line-text'] = semLineText;
	callbacks['last-line'] = semLastLine;
	callbacks.invalid = semInvalid;
	callbacks.end = semEnd;
	callbacks.lf = semLF;
	callbacks.cr = semCR;
	callbacks.crlf = semCRLF;
	scannerCallbacks.callbacks = callbacks;
	return scannerCallbacks;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var scanner;
var hasRequiredScanner;

function requireScanner () {
	if (hasRequiredScanner) return scanner;
	hasRequiredScanner = 1;
	// This module reads the input grammar file and does a preliminary analysis
	// before attempting to parse it into a grammar object.
	// See:<br>
	// `./dist/scanner-grammar.bnf`<br>
	// for the grammar file this parser is based on.
	//
	// It has two primary functions.
	// - verify the character codes - no non-printing ASCII characters
	// - catalog the lines - create an array with a line object for each line.
	// The object carries information about the line number and character length which is used
	// by the parser generator primarily for error reporting.
	scanner = function exfn(chars, errors, strict, trace) {
	  const thisFileName = 'scanner.js: ';
	  const apglib = nodeExports$1;
	  const grammar = new (requireScannerGrammar())();
	  const { callbacks } = requireScannerCallbacks();

	  /* Scan the grammar for character code errors and catalog the lines. */
	  const lines = [];
	  // eslint-disable-next-line new-cap
	  const parser = new apglib.parser();
	  // eslint-disable-next-line new-cap
	  parser.ast = new apglib.ast();
	  parser.ast.callbacks = callbacks;
	  if (trace) {
	    if (trace.traceObject !== 'traceObject') {
	      throw new TypeError(`${thisFileName}trace argument is not a trace object`);
	    }
	    parser.trace = trace;
	  }

	  /* parse the input SABNF grammar */
	  const test = parser.parse(grammar, 'file', chars);
	  if (test.success !== true) {
	    errors.push({
	      line: 0,
	      char: 0,
	      msg: 'syntax analysis error analyzing input SABNF grammar',
	    });
	    return;
	  }
	  const data = {
	    lines,
	    lineNo: 0,
	    errors,
	    strict: !!strict,
	  };

	  /* translate (analyze) the input SABNF grammar */
	  parser.ast.translate(data);
	  // eslint-disable-next-line consistent-return
	  return lines;
	};
	return scanner;
}

/* eslint-disable func-names */

var syntaxCallbacks;
var hasRequiredSyntaxCallbacks;

function requireSyntaxCallbacks () {
	if (hasRequiredSyntaxCallbacks) return syntaxCallbacks;
	hasRequiredSyntaxCallbacks = 1;
	/*  *************************************************************************************
	 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
	 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
	 *   ********************************************************************************* */
	// This module has all of the callback functions for the syntax phase of the generation.
	// See:<br>
	// `./dist/abnf-for-sabnf-grammar.bnf`<br>
	// for the grammar file these callback functions are based on.
	syntaxCallbacks = function exfn() {
	  const thisFileName = 'syntax-callbacks.js: ';
	  const apglib = nodeExports$1;
	  const id = apglib.ids;
	  let topAlt;
	  /* syntax, RNM, callback functions */
	  const synFile = function synFile(result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        data.altStack = [];
	        data.repCount = 0;
	        break;
	      case id.EMPTY:
	        data.errors.push({
	          line: 0,
	          char: 0,
	          msg: 'grammar file is empty',
	        });
	        break;
	      case id.MATCH:
	        if (data.ruleCount === 0) {
	          data.errors.push({
	            line: 0,
	            char: 0,
	            msg: 'no rules defined',
	          });
	        }
	        break;
	      case id.NOMATCH:
	        throw new Error(`${thisFileName}synFile: grammar file NOMATCH: design error: should never happen.`);
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  // eslint-disable-next-line func-names
	  const synRule = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        data.altStack.length = 0;
	        topAlt = {
	          groupOpen: null,
	          groupError: false,
	          optionOpen: null,
	          optionError: false,
	          tlsOpen: null,
	          clsOpen: null,
	          prosValOpen: null,
	          basicError: false,
	        };
	        data.altStack.push(topAlt);
	        break;
	      case id.EMPTY:
	        throw new Error(`${thisFileName}synRule: EMPTY: rule cannot be empty`);
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        data.ruleCount += 1;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synRuleError = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, phraseIndex, data.charsLength),
	          char: phraseIndex,
	          msg: 'Unrecognized SABNF line. Invalid rule, comment or blank line.',
	        });
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synRuleNameError = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, phraseIndex, data.charsLength),
	          char: phraseIndex,
	          msg: 'Rule names must be alphanum and begin with alphabetic character.',
	        });
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synDefinedAsError = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, phraseIndex, data.charsLength),
	          char: phraseIndex,
	          msg: "Expected '=' or '=/'. Not found.",
	        });
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synAndOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'AND operator(&) found - strict ABNF specified.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synNotOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'NOT operator(!) found - strict ABNF specified.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synBkaOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'Positive look-behind operator(&&) found - strict ABNF specified.',
	          });
	        } else if (data.lite) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'Positive look-behind operator(&&) found - apg-lite specified.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synBknOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'Negative look-behind operator(!!) found - strict ABNF specified.',
	          });
	        } else if (data.lite) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'Negative look-behind operator(!!) found - apg-lite specified.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synAbgOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'Beginning of string anchor(%^) found - strict ABNF specified.',
	          });
	        } else if (data.lite) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'Beginning of string anchor(%^) found - apg-lite specified.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synAenOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'End of string anchor(%$) found - strict ABNF specified.',
	          });
	        } else if (data.lite) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'End of string anchor(%$) found - apg-lite specified.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synBkrOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          const name = apglib.utils.charsToString(chars, phraseIndex, result.phraseLength);
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: `Back reference operator(${name}) found - strict ABNF specified.`,
	          });
	        } else if (data.lite) {
	          const name = apglib.utils.charsToString(chars, phraseIndex, result.phraseLength);
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: `Back reference operator(${name}) found - apg-lite specified.`,
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synUdtOp = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          const name = apglib.utils.charsToString(chars, phraseIndex, result.phraseLength);
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: `UDT operator found(${name}) - strict ABNF specified.`,
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synTlsOpen = function (result, chars, phraseIndex) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        topAlt.tlsOpen = phraseIndex;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synTlsString = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        data.stringTabChar = false;
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.stringTabChar !== false) {
	          data.errors.push({
	            line: data.findLine(data.lines, data.stringTabChar),
	            char: data.stringTabChar,
	            msg: "Tab character (\\t, x09) not allowed in literal string (see 'quoted-string' definition, RFC 7405.)",
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synStringTab = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        data.stringTabChar = phraseIndex;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synTlsClose = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, topAlt.tlsOpen),
	          char: topAlt.tlsOpen,
	          msg: 'Case-insensitive literal string("...") opened but not closed.',
	        });
	        topAlt.basicError = true;
	        topAlt.tlsOpen = null;
	        break;
	      case id.MATCH:
	        topAlt.tlsOpen = null;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synClsOpen = function (result, chars, phraseIndex) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        topAlt.clsOpen = phraseIndex;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synClsString = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        data.stringTabChar = false;
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.stringTabChar !== false) {
	          data.errors.push({
	            line: data.findLine(data.lines, data.stringTabChar),
	            char: data.stringTabChar,
	            msg: 'Tab character (\\t, x09) not allowed in literal string.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synClsClose = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, topAlt.clsOpen),
	          char: topAlt.clsOpen,
	          msg: "Case-sensitive literal string('...') opened but not closed.",
	        });
	        topAlt.clsOpen = null;
	        topAlt.basicError = true;
	        break;
	      case id.MATCH:
	        if (data.strict) {
	          data.errors.push({
	            line: data.findLine(data.lines, topAlt.clsOpen),
	            char: topAlt.clsOpen,
	            msg: "Case-sensitive string operator('...') found - strict ABNF specified.",
	          });
	        }
	        topAlt.clsOpen = null;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synProsValOpen = function (result, chars, phraseIndex) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        topAlt.prosValOpen = phraseIndex;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synProsValString = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        data.stringTabChar = false;
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (data.stringTabChar !== false) {
	          data.errors.push({
	            line: data.findLine(data.lines, data.stringTabChar),
	            char: data.stringTabChar,
	            msg: 'Tab character (\\t, x09) not allowed in prose value string.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synProsValClose = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, topAlt.prosValOpen),
	          char: topAlt.prosValOpen,
	          msg: 'Prose value operator(<...>) opened but not closed.',
	        });
	        topAlt.basicError = true;
	        topAlt.prosValOpen = null;
	        break;
	      case id.MATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, topAlt.prosValOpen),
	          char: topAlt.prosValOpen,
	          msg: 'Prose value operator(<...>) found. The ABNF syntax is valid, but a parser cannot be generated from this grammar.',
	        });
	        topAlt.prosValOpen = null;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synGroupOpen = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        topAlt = {
	          groupOpen: phraseIndex,
	          groupError: false,
	          optionOpen: null,
	          optionError: false,
	          tlsOpen: null,
	          clsOpen: null,
	          prosValOpen: null,
	          basicError: false,
	        };
	        data.altStack.push(topAlt);
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synGroupClose = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, topAlt.groupOpen),
	          char: topAlt.groupOpen,
	          msg: 'Group "(...)" opened but not closed.',
	        });
	        topAlt = data.altStack.pop();
	        topAlt.groupError = true;
	        break;
	      case id.MATCH:
	        topAlt = data.altStack.pop();
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synOptionOpen = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        topAlt = {
	          groupOpen: null,
	          groupError: false,
	          optionOpen: phraseIndex,
	          optionError: false,
	          tlsOpen: null,
	          clsOpen: null,
	          prosValOpen: null,
	          basicError: false,
	        };
	        data.altStack.push(topAlt);
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synOptionClose = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, topAlt.optionOpen),
	          char: topAlt.optionOpen,
	          msg: 'Option "[...]" opened but not closed.',
	        });
	        topAlt = data.altStack.pop();
	        topAlt.optionError = true;
	        break;
	      case id.MATCH:
	        topAlt = data.altStack.pop();
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synBasicElementError = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (topAlt.basicError === false) {
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: 'Unrecognized SABNF element.',
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synLineEnd = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        if (result.phraseLength === 1 && data.strict) {
	          const end = chars[phraseIndex] === 13 ? 'CR' : 'LF';
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: `Line end '${end}' found - strict ABNF specified, only CRLF allowed.`,
	          });
	        }
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synLineEndError = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        break;
	      case id.MATCH:
	        data.errors.push({
	          line: data.findLine(data.lines, phraseIndex, data.charsLength),
	          char: phraseIndex,
	          msg: 'Unrecognized grammar element or characters.',
	        });
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  const synRepetition = function (result, chars, phraseIndex, data) {
	    switch (result.state) {
	      case id.ACTIVE:
	        break;
	      case id.EMPTY:
	        break;
	      case id.NOMATCH:
	        data.repCount += 1;
	        break;
	      case id.MATCH:
	        data.repCount += 1;
	        break;
	      default:
	        throw new Error(`${thisFileName}synFile: unrecognized case.`);
	    }
	  };
	  // Define the list of callback functions.
	  this.callbacks = [];
	  this.callbacks.andop = synAndOp;
	  this.callbacks.basicelementerr = synBasicElementError;
	  this.callbacks.clsclose = synClsClose;
	  this.callbacks.clsopen = synClsOpen;
	  this.callbacks.clsstring = synClsString;
	  this.callbacks.definedaserror = synDefinedAsError;
	  this.callbacks.file = synFile;
	  this.callbacks.groupclose = synGroupClose;
	  this.callbacks.groupopen = synGroupOpen;
	  this.callbacks.lineenderror = synLineEndError;
	  this.callbacks.lineend = synLineEnd;
	  this.callbacks.notop = synNotOp;
	  this.callbacks.optionclose = synOptionClose;
	  this.callbacks.optionopen = synOptionOpen;
	  this.callbacks.prosvalclose = synProsValClose;
	  this.callbacks.prosvalopen = synProsValOpen;
	  this.callbacks.prosvalstring = synProsValString;
	  this.callbacks.repetition = synRepetition;
	  this.callbacks.rule = synRule;
	  this.callbacks.ruleerror = synRuleError;
	  this.callbacks.rulenameerror = synRuleNameError;
	  this.callbacks.stringtab = synStringTab;
	  this.callbacks.tlsclose = synTlsClose;
	  this.callbacks.tlsopen = synTlsOpen;
	  this.callbacks.tlsstring = synTlsString;
	  this.callbacks.udtop = synUdtOp;
	  this.callbacks.bkaop = synBkaOp;
	  this.callbacks.bknop = synBknOp;
	  this.callbacks.bkrop = synBkrOp;
	  this.callbacks.abgop = synAbgOp;
	  this.callbacks.aenop = synAenOp;
	};
	return syntaxCallbacks;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var semanticCallbacks;
var hasRequiredSemanticCallbacks;

function requireSemanticCallbacks () {
	if (hasRequiredSemanticCallbacks) return semanticCallbacks;
	hasRequiredSemanticCallbacks = 1;
	// This module has all of the AST translation callback functions for the semantic analysis
	// phase of the generator.
	// See:<br>
	// `./dist/abnf-for-sabnf-grammar.bnf`<br>
	// for the grammar file these callback functions are based on.
	semanticCallbacks = function exfn() {
	  const apglib = nodeExports$1;
	  const id = apglib.ids;

	  /* Some helper functions. */
	  const NameList = function NameList() {
	    this.names = [];
	    /* Adds a new rule name object to the list. Returns -1 if the name already exists. */
	    /* Returns the added name object if the name does not already exist. */
	    this.add = function add(name) {
	      let ret = -1;
	      const find = this.get(name);
	      if (find === -1) {
	        ret = {
	          name,
	          lower: name.toLowerCase(),
	          index: this.names.length,
	        };
	        this.names.push(ret);
	      }
	      return ret;
	    };
	    /* Brute-force look up. */
	    this.get = function get(name) {
	      let ret = -1;
	      const lower = name.toLowerCase();
	      for (let i = 0; i < this.names.length; i += 1) {
	        if (this.names[i].lower === lower) {
	          ret = this.names[i];
	          break;
	        }
	      }
	      return ret;
	    };
	  };
	  /* converts text decimal numbers from, e.g. %d99, to an integer */
	  const decnum = function decnum(chars, beg, len) {
	    let num = 0;
	    for (let i = beg; i < beg + len; i += 1) {
	      num = 10 * num + chars[i] - 48;
	    }
	    return num;
	  };
	  /* converts text binary numbers from, e.g. %b10, to an integer */
	  const binnum = function binnum(chars, beg, len) {
	    let num = 0;
	    for (let i = beg; i < beg + len; i += 1) {
	      num = 2 * num + chars[i] - 48;
	    }
	    return num;
	  };
	  /* converts text hexadecimal numbers from, e.g. %xff, to an integer */
	  const hexnum = function hexnum(chars, beg, len) {
	    let num = 0;
	    for (let i = beg; i < beg + len; i += 1) {
	      let digit = chars[i];
	      if (digit >= 48 && digit <= 57) {
	        digit -= 48;
	      } else if (digit >= 65 && digit <= 70) {
	        digit -= 55;
	      } else if (digit >= 97 && digit <= 102) {
	        digit -= 87;
	      } else {
	        throw new Error('hexnum out of range');
	      }
	      num = 16 * num + digit;
	    }
	    return num;
	  };

	  // This is the prototype for all semantic analysis callback functions.
	  // ````
	  // state - the translator state
	  //   id.SEM_PRE for downward (pre-branch) traversal of the AST
	  //   id.SEM_POST for upward (post branch) traversal of the AST
	  // chars - the array of character codes for the input string
	  // phraseIndex - index into the chars array to the first
	  //               character of the phrase
	  // phraseCount - the number of characters in the phrase
	  // data - user-defined data passed to the translator
	  //        for use by the callback functions.
	  // @return id.SEM_OK, normal return.
	  //         id.SEM_SKIP in state id.SEM_PRE will
	  //         skip the branch below.
	  //         Any thing else is an error which will
	  //         stop the translation.
	  // ````
	  /*
	  function semCallbackPrototype(state, chars, phraseIndex, phraseCount, data) {
	    let ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	    } else if (state === id.SEM_POST) {
	    }
	    return ret;
	  }
	  */
	  // The AST callback functions.
	  function semFile(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.ruleNames = new NameList();
	      data.udtNames = new NameList();
	      data.rules = [];
	      data.udts = [];
	      data.rulesLineMap = [];
	      data.opcodes = [];
	      data.altStack = [];
	      data.topStack = null;
	      data.topRule = null;
	    } else if (state === id.SEM_POST) {
	      /* validate RNM rule names and set opcode rule index */
	      let nameObj;
	      data.rules.forEach((rule) => {
	        rule.isBkr = false;
	        rule.opcodes.forEach((op) => {
	          if (op.type === id.RNM) {
	            nameObj = data.ruleNames.get(op.index.name);
	            if (nameObj === -1) {
	              data.errors.push({
	                line: data.findLine(data.lines, op.index.phraseIndex, data.charsLength),
	                char: op.index.phraseIndex,
	                msg: `Rule name '${op.index.name}' used but not defined.`,
	              });
	              op.index = -1;
	            } else {
	              op.index = nameObj.index;
	            }
	          }
	        });
	      });
	      /* validate BKR rule names and set opcode rule index */
	      data.udts.forEach((udt) => {
	        udt.isBkr = false;
	      });
	      data.rules.forEach((rule) => {
	        rule.opcodes.forEach((op) => {
	          if (op.type === id.BKR) {
	            rule.hasBkr = true;
	            nameObj = data.ruleNames.get(op.index.name);
	            if (nameObj !== -1) {
	              data.rules[nameObj.index].isBkr = true;
	              op.index = nameObj.index;
	            } else {
	              nameObj = data.udtNames.get(op.index.name);
	              if (nameObj !== -1) {
	                data.udts[nameObj.index].isBkr = true;
	                op.index = data.rules.length + nameObj.index;
	              } else {
	                data.errors.push({
	                  line: data.findLine(data.lines, op.index.phraseIndex, data.charsLength),
	                  char: op.index.phraseIndex,
	                  msg: `Back reference name '${op.index.name}' refers to undefined rule or unamed UDT.`,
	                });
	                op.index = -1;
	              }
	            }
	          }
	        });
	      });
	    }
	    return ret;
	  }
	  function semRule(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.altStack.length = 0;
	      data.topStack = null;
	      data.rulesLineMap.push({
	        line: data.findLine(data.lines, phraseIndex, data.charsLength),
	        char: phraseIndex,
	      });
	    }
	    return ret;
	  }
	  function semRuleLookup(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.ruleName = '';
	      data.definedas = '';
	    } else if (state === id.SEM_POST) {
	      let ruleName;
	      if (data.definedas === '=') {
	        ruleName = data.ruleNames.add(data.ruleName);
	        if (ruleName === -1) {
	          data.definedas = null;
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: `Rule name '${data.ruleName}' previously defined.`,
	          });
	        } else {
	          /* start a new rule */
	          data.topRule = {
	            name: ruleName.name,
	            lower: ruleName.lower,
	            opcodes: [],
	            index: ruleName.index,
	          };
	          data.rules.push(data.topRule);
	          data.opcodes = data.topRule.opcodes;
	        }
	      } else {
	        ruleName = data.ruleNames.get(data.ruleName);
	        if (ruleName === -1) {
	          data.definedas = null;
	          data.errors.push({
	            line: data.findLine(data.lines, phraseIndex, data.charsLength),
	            char: phraseIndex,
	            msg: `Rule name '${data.ruleName}' for incremental alternate not previously defined.`,
	          });
	        } else {
	          data.topRule = data.rules[ruleName.index];
	          data.opcodes = data.topRule.opcodes;
	        }
	      }
	    }
	    return ret;
	  }
	  function semAlternation(state, chars, phraseIndex, phraseCount, data) {
	    let ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      const TRUE = true;
	      while (TRUE) {
	        if (data.definedas === null) {
	          /* rule error - skip opcode generation */
	          ret = id.SEM_SKIP;
	          break;
	        }
	        if (data.topStack === null) {
	          /* top-level ALT */
	          if (data.definedas === '=') {
	            /* "=" new rule */
	            data.topStack = {
	              alt: {
	                type: id.ALT,
	                children: [],
	              },
	              cat: null,
	            };
	            data.altStack.push(data.topStack);
	            data.opcodes.push(data.topStack.alt);
	            break;
	          }
	          /* "=/" incremental alternate */
	          data.topStack = {
	            alt: data.opcodes[0],
	            cat: null,
	          };
	          data.altStack.push(data.topStack);
	          break;
	        }
	        /* lower-level ALT */
	        data.topStack = {
	          alt: {
	            type: id.ALT,
	            children: [],
	          },
	          cat: null,
	        };
	        data.altStack.push(data.topStack);
	        data.opcodes.push(data.topStack.alt);
	        break;
	      }
	    } else if (state === id.SEM_POST) {
	      data.altStack.pop();
	      if (data.altStack.length > 0) {
	        data.topStack = data.altStack[data.altStack.length - 1];
	      } else {
	        data.topStack = null;
	      }
	    }
	    return ret;
	  }
	  function semConcatenation(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.topStack.alt.children.push(data.opcodes.length);
	      data.topStack.cat = {
	        type: id.CAT,
	        children: [],
	      };
	      data.opcodes.push(data.topStack.cat);
	    } else if (state === id.SEM_POST) {
	      data.topStack.cat = null;
	    }
	    return ret;
	  }
	  function semRepetition(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.topStack.cat.children.push(data.opcodes.length);
	    }
	    return ret;
	  }
	  function semOptionOpen(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.REP,
	        min: 0,
	        max: 1,
	        char: phraseIndex,
	      });
	    }
	    return ret;
	  }
	  function semRuleName(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.ruleName = apglib.utils.charsToString(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semDefined(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.definedas = '=';
	    }
	    return ret;
	  }
	  function semIncAlt(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.definedas = '=/';
	    }
	    return ret;
	  }
	  function semRepOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.min = 0;
	      data.max = Infinity;
	      data.topRep = {
	        type: id.REP,
	        min: 0,
	        max: Infinity,
	      };
	      data.opcodes.push(data.topRep);
	    } else if (state === id.SEM_POST) {
	      if (data.min > data.max) {
	        data.errors.push({
	          line: data.findLine(data.lines, phraseIndex, data.charsLength),
	          char: phraseIndex,
	          msg: `repetition min cannot be greater than max: min: ${data.min}: max: ${data.max}`,
	        });
	      }
	      data.topRep.min = data.min;
	      data.topRep.max = data.max;
	    }
	    return ret;
	  }
	  function semRepMin(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.min = decnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semRepMax(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.max = decnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semRepMinMax(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.max = decnum(chars, phraseIndex, phraseCount);
	      data.min = data.max;
	    }
	    return ret;
	  }
	  function semAndOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.AND,
	      });
	    }
	    return ret;
	  }
	  function semNotOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.NOT,
	      });
	    }
	    return ret;
	  }
	  function semRnmOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.RNM,
	        /* NOTE: this is temporary info, index will be replaced with integer later. */
	        /* Probably not the best coding practice but here you go. */
	        index: {
	          phraseIndex,
	          name: apglib.utils.charsToString(chars, phraseIndex, phraseCount),
	        },
	      });
	    }
	    return ret;
	  }
	  function semAbgOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.ABG,
	      });
	    }
	    return ret;
	  }
	  function semAenOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.AEN,
	      });
	    }
	    return ret;
	  }
	  function semBkaOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.BKA,
	      });
	    }
	    return ret;
	  }
	  function semBknOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.BKN,
	      });
	    }
	    return ret;
	  }
	  function semBkrOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.ci = true; /* default to case insensitive */
	      data.cs = false;
	      data.um = true;
	      data.pm = false;
	    } else if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.BKR,
	        bkrCase: data.cs === true ? id.BKR_MODE_CS : id.BKR_MODE_CI,
	        bkrMode: data.pm === true ? id.BKR_MODE_PM : id.BKR_MODE_UM,
	        /* NOTE: this is temporary info, index will be replaced with integer later. */
	        /* Probably not the best coding practice but here you go. */
	        index: {
	          phraseIndex: data.bkrname.phraseIndex,
	          name: apglib.utils.charsToString(chars, data.bkrname.phraseIndex, data.bkrname.phraseLength),
	        },
	      });
	    }
	    return ret;
	  }
	  function semBkrCi(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.ci = true;
	    }
	    return ret;
	  }
	  function semBkrCs(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.cs = true;
	    }
	    return ret;
	  }
	  function semBkrUm(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.um = true;
	    }
	    return ret;
	  }
	  function semBkrPm(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.pm = true;
	    }
	    return ret;
	  }
	  function semBkrName(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.bkrname = {
	        phraseIndex,
	        phraseLength: phraseCount,
	      };
	    }
	    return ret;
	  }
	  function semUdtEmpty(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      const name = apglib.utils.charsToString(chars, phraseIndex, phraseCount);
	      let udtName = data.udtNames.add(name);
	      if (udtName === -1) {
	        udtName = data.udtNames.get(name);
	        if (udtName === -1) {
	          throw new Error('semUdtEmpty: name look up error');
	        }
	      } else {
	        data.udts.push({
	          name: udtName.name,
	          lower: udtName.lower,
	          index: udtName.index,
	          empty: true,
	        });
	      }
	      data.opcodes.push({
	        type: id.UDT,
	        empty: true,
	        index: udtName.index,
	      });
	    }
	    return ret;
	  }
	  function semUdtNonEmpty(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      const name = apglib.utils.charsToString(chars, phraseIndex, phraseCount);
	      let udtName = data.udtNames.add(name);
	      if (udtName === -1) {
	        udtName = data.udtNames.get(name);
	        if (udtName === -1) {
	          throw new Error('semUdtNonEmpty: name look up error');
	        }
	      } else {
	        data.udts.push({
	          name: udtName.name,
	          lower: udtName.lower,
	          index: udtName.index,
	          empty: false,
	        });
	      }
	      data.opcodes.push({
	        type: id.UDT,
	        empty: false,
	        index: udtName.index,
	        syntax: null,
	        semantic: null,
	      });
	    }
	    return ret;
	  }
	  function semTlsOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.tlscase = true; /* default to case insensitive */
	    }
	    return ret;
	  }
	  function semTlsCase(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      if (phraseCount > 0 && (chars[phraseIndex + 1] === 83 || chars[phraseIndex + 1] === 115)) {
	        data.tlscase = false; /* set to case sensitive */
	      }
	    }
	    return ret;
	  }
	  function semTlsString(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      if (data.tlscase) {
	        const str = chars.slice(phraseIndex, phraseIndex + phraseCount);
	        for (let i = 0; i < str.length; i += 1) {
	          if (str[i] >= 65 && str[i] <= 90) {
	            str[i] += 32;
	          }
	        }
	        data.opcodes.push({
	          type: id.TLS,
	          string: str,
	        });
	      } else {
	        data.opcodes.push({
	          type: id.TBS,
	          string: chars.slice(phraseIndex, phraseIndex + phraseCount),
	        });
	      }
	    }
	    return ret;
	  }
	  function semClsOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      if (phraseCount <= 2) {
	        /* only TLS is allowed to be empty */
	        data.opcodes.push({
	          type: id.TLS,
	          string: [],
	        });
	      } else {
	        data.opcodes.push({
	          type: id.TBS,
	          string: chars.slice(phraseIndex + 1, phraseIndex + phraseCount - 1),
	        });
	      }
	    }
	    return ret;
	  }
	  function semTbsOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.tbsstr = [];
	    } else if (state === id.SEM_POST) {
	      data.opcodes.push({
	        type: id.TBS,
	        string: data.tbsstr,
	      });
	    }
	    return ret;
	  }
	  function semTrgOp(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_PRE) {
	      data.min = 0;
	      data.max = 0;
	    } else if (state === id.SEM_POST) {
	      if (data.min > data.max) {
	        data.errors.push({
	          line: data.findLine(data.lines, phraseIndex, data.charsLength),
	          char: phraseIndex,
	          msg: `TRG, (%dmin-max), min cannot be greater than max: min: ${data.min}: max: ${data.max}`,
	        });
	      }
	      data.opcodes.push({
	        type: id.TRG,
	        min: data.min,
	        max: data.max,
	      });
	    }
	    return ret;
	  }
	  function semDmin(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.min = decnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semDmax(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.max = decnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semBmin(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.min = binnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semBmax(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.max = binnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semXmin(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.min = hexnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semXmax(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.max = hexnum(chars, phraseIndex, phraseCount);
	    }
	    return ret;
	  }
	  function semDstring(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.tbsstr.push(decnum(chars, phraseIndex, phraseCount));
	    }
	    return ret;
	  }
	  function semBstring(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.tbsstr.push(binnum(chars, phraseIndex, phraseCount));
	    }
	    return ret;
	  }
	  function semXstring(state, chars, phraseIndex, phraseCount, data) {
	    const ret = id.SEM_OK;
	    if (state === id.SEM_POST) {
	      data.tbsstr.push(hexnum(chars, phraseIndex, phraseCount));
	    }
	    return ret;
	  }
	  // Define the callback functions to the AST object.
	  this.callbacks = [];
	  this.callbacks.abgop = semAbgOp;
	  this.callbacks.aenop = semAenOp;
	  this.callbacks.alternation = semAlternation;
	  this.callbacks.andop = semAndOp;
	  this.callbacks.bmax = semBmax;
	  this.callbacks.bmin = semBmin;
	  this.callbacks.bkaop = semBkaOp;
	  this.callbacks.bknop = semBknOp;
	  this.callbacks.bkrop = semBkrOp;
	  this.callbacks['bkr-name'] = semBkrName;
	  this.callbacks.bstring = semBstring;
	  this.callbacks.clsop = semClsOp;
	  this.callbacks.ci = semBkrCi;
	  this.callbacks.cs = semBkrCs;
	  this.callbacks.um = semBkrUm;
	  this.callbacks.pm = semBkrPm;
	  this.callbacks.concatenation = semConcatenation;
	  this.callbacks.defined = semDefined;
	  this.callbacks.dmax = semDmax;
	  this.callbacks.dmin = semDmin;
	  this.callbacks.dstring = semDstring;
	  this.callbacks.file = semFile;
	  this.callbacks.incalt = semIncAlt;
	  this.callbacks.notop = semNotOp;
	  this.callbacks.optionopen = semOptionOpen;
	  this.callbacks['rep-max'] = semRepMax;
	  this.callbacks['rep-min'] = semRepMin;
	  this.callbacks['rep-min-max'] = semRepMinMax;
	  this.callbacks.repetition = semRepetition;
	  this.callbacks.repop = semRepOp;
	  this.callbacks.rnmop = semRnmOp;
	  this.callbacks.rule = semRule;
	  this.callbacks.rulelookup = semRuleLookup;
	  this.callbacks.rulename = semRuleName;
	  this.callbacks.tbsop = semTbsOp;
	  this.callbacks.tlscase = semTlsCase;
	  this.callbacks.tlsstring = semTlsString;
	  this.callbacks.tlsop = semTlsOp;
	  this.callbacks.trgop = semTrgOp;
	  this.callbacks['udt-empty'] = semUdtEmpty;
	  this.callbacks['udt-non-empty'] = semUdtNonEmpty;
	  this.callbacks.xmax = semXmax;
	  this.callbacks.xmin = semXmin;
	  this.callbacks.xstring = semXstring;
	};
	return semanticCallbacks;
}

var sabnfGrammar;
var hasRequiredSabnfGrammar;

function requireSabnfGrammar () {
	if (hasRequiredSabnfGrammar) return sabnfGrammar;
	hasRequiredSabnfGrammar = 1;
	// copyright: Copyright (c) 2024 Lowell D. Thomas, all rights reserved<br>
	//   license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)<br>
	//
	// Generated by apg-js, Version 4.4.0 [apg-js](https://github.com/ldthomas/apg-js)
	sabnfGrammar = function grammar(){
	  // ```
	  // SUMMARY
	  //      rules = 95
	  //       udts = 0
	  //    opcodes = 372
	  //        ---   ABNF original opcodes
	  //        ALT = 43
	  //        CAT = 48
	  //        REP = 34
	  //        RNM = 149
	  //        TLS = 2
	  //        TBS = 61
	  //        TRG = 35
	  //        ---   SABNF superset opcodes
	  //        UDT = 0
	  //        AND = 0
	  //        NOT = 0
	  //        BKA = 0
	  //        BKN = 0
	  //        BKR = 0
	  //        ABG = 0
	  //        AEN = 0
	  // characters = [9 - 126]
	  // ```
	  /* OBJECT IDENTIFIER (for internal parser use) */
	  this.grammarObject = 'grammarObject';

	  /* RULES */
	  this.rules = [];
	  this.rules[0] = { name: 'File', lower: 'file', index: 0, isBkr: false };
	  this.rules[1] = { name: 'BlankLine', lower: 'blankline', index: 1, isBkr: false };
	  this.rules[2] = { name: 'Rule', lower: 'rule', index: 2, isBkr: false };
	  this.rules[3] = { name: 'RuleLookup', lower: 'rulelookup', index: 3, isBkr: false };
	  this.rules[4] = { name: 'RuleNameTest', lower: 'rulenametest', index: 4, isBkr: false };
	  this.rules[5] = { name: 'RuleName', lower: 'rulename', index: 5, isBkr: false };
	  this.rules[6] = { name: 'RuleNameError', lower: 'rulenameerror', index: 6, isBkr: false };
	  this.rules[7] = { name: 'DefinedAsTest', lower: 'definedastest', index: 7, isBkr: false };
	  this.rules[8] = { name: 'DefinedAsError', lower: 'definedaserror', index: 8, isBkr: false };
	  this.rules[9] = { name: 'DefinedAs', lower: 'definedas', index: 9, isBkr: false };
	  this.rules[10] = { name: 'Defined', lower: 'defined', index: 10, isBkr: false };
	  this.rules[11] = { name: 'IncAlt', lower: 'incalt', index: 11, isBkr: false };
	  this.rules[12] = { name: 'RuleError', lower: 'ruleerror', index: 12, isBkr: false };
	  this.rules[13] = { name: 'LineEndError', lower: 'lineenderror', index: 13, isBkr: false };
	  this.rules[14] = { name: 'Alternation', lower: 'alternation', index: 14, isBkr: false };
	  this.rules[15] = { name: 'Concatenation', lower: 'concatenation', index: 15, isBkr: false };
	  this.rules[16] = { name: 'Repetition', lower: 'repetition', index: 16, isBkr: false };
	  this.rules[17] = { name: 'Modifier', lower: 'modifier', index: 17, isBkr: false };
	  this.rules[18] = { name: 'Predicate', lower: 'predicate', index: 18, isBkr: false };
	  this.rules[19] = { name: 'BasicElement', lower: 'basicelement', index: 19, isBkr: false };
	  this.rules[20] = { name: 'BasicElementErr', lower: 'basicelementerr', index: 20, isBkr: false };
	  this.rules[21] = { name: 'Group', lower: 'group', index: 21, isBkr: false };
	  this.rules[22] = { name: 'GroupError', lower: 'grouperror', index: 22, isBkr: false };
	  this.rules[23] = { name: 'GroupOpen', lower: 'groupopen', index: 23, isBkr: false };
	  this.rules[24] = { name: 'GroupClose', lower: 'groupclose', index: 24, isBkr: false };
	  this.rules[25] = { name: 'Option', lower: 'option', index: 25, isBkr: false };
	  this.rules[26] = { name: 'OptionError', lower: 'optionerror', index: 26, isBkr: false };
	  this.rules[27] = { name: 'OptionOpen', lower: 'optionopen', index: 27, isBkr: false };
	  this.rules[28] = { name: 'OptionClose', lower: 'optionclose', index: 28, isBkr: false };
	  this.rules[29] = { name: 'RnmOp', lower: 'rnmop', index: 29, isBkr: false };
	  this.rules[30] = { name: 'BkrOp', lower: 'bkrop', index: 30, isBkr: false };
	  this.rules[31] = { name: 'bkrModifier', lower: 'bkrmodifier', index: 31, isBkr: false };
	  this.rules[32] = { name: 'cs', lower: 'cs', index: 32, isBkr: false };
	  this.rules[33] = { name: 'ci', lower: 'ci', index: 33, isBkr: false };
	  this.rules[34] = { name: 'um', lower: 'um', index: 34, isBkr: false };
	  this.rules[35] = { name: 'pm', lower: 'pm', index: 35, isBkr: false };
	  this.rules[36] = { name: 'bkr-name', lower: 'bkr-name', index: 36, isBkr: false };
	  this.rules[37] = { name: 'rname', lower: 'rname', index: 37, isBkr: false };
	  this.rules[38] = { name: 'uname', lower: 'uname', index: 38, isBkr: false };
	  this.rules[39] = { name: 'ename', lower: 'ename', index: 39, isBkr: false };
	  this.rules[40] = { name: 'UdtOp', lower: 'udtop', index: 40, isBkr: false };
	  this.rules[41] = { name: 'udt-non-empty', lower: 'udt-non-empty', index: 41, isBkr: false };
	  this.rules[42] = { name: 'udt-empty', lower: 'udt-empty', index: 42, isBkr: false };
	  this.rules[43] = { name: 'RepOp', lower: 'repop', index: 43, isBkr: false };
	  this.rules[44] = { name: 'AltOp', lower: 'altop', index: 44, isBkr: false };
	  this.rules[45] = { name: 'CatOp', lower: 'catop', index: 45, isBkr: false };
	  this.rules[46] = { name: 'StarOp', lower: 'starop', index: 46, isBkr: false };
	  this.rules[47] = { name: 'AndOp', lower: 'andop', index: 47, isBkr: false };
	  this.rules[48] = { name: 'NotOp', lower: 'notop', index: 48, isBkr: false };
	  this.rules[49] = { name: 'BkaOp', lower: 'bkaop', index: 49, isBkr: false };
	  this.rules[50] = { name: 'BknOp', lower: 'bknop', index: 50, isBkr: false };
	  this.rules[51] = { name: 'AbgOp', lower: 'abgop', index: 51, isBkr: false };
	  this.rules[52] = { name: 'AenOp', lower: 'aenop', index: 52, isBkr: false };
	  this.rules[53] = { name: 'TrgOp', lower: 'trgop', index: 53, isBkr: false };
	  this.rules[54] = { name: 'TbsOp', lower: 'tbsop', index: 54, isBkr: false };
	  this.rules[55] = { name: 'TlsOp', lower: 'tlsop', index: 55, isBkr: false };
	  this.rules[56] = { name: 'TlsCase', lower: 'tlscase', index: 56, isBkr: false };
	  this.rules[57] = { name: 'TlsOpen', lower: 'tlsopen', index: 57, isBkr: false };
	  this.rules[58] = { name: 'TlsClose', lower: 'tlsclose', index: 58, isBkr: false };
	  this.rules[59] = { name: 'TlsString', lower: 'tlsstring', index: 59, isBkr: false };
	  this.rules[60] = { name: 'StringTab', lower: 'stringtab', index: 60, isBkr: false };
	  this.rules[61] = { name: 'ClsOp', lower: 'clsop', index: 61, isBkr: false };
	  this.rules[62] = { name: 'ClsOpen', lower: 'clsopen', index: 62, isBkr: false };
	  this.rules[63] = { name: 'ClsClose', lower: 'clsclose', index: 63, isBkr: false };
	  this.rules[64] = { name: 'ClsString', lower: 'clsstring', index: 64, isBkr: false };
	  this.rules[65] = { name: 'ProsVal', lower: 'prosval', index: 65, isBkr: false };
	  this.rules[66] = { name: 'ProsValOpen', lower: 'prosvalopen', index: 66, isBkr: false };
	  this.rules[67] = { name: 'ProsValString', lower: 'prosvalstring', index: 67, isBkr: false };
	  this.rules[68] = { name: 'ProsValClose', lower: 'prosvalclose', index: 68, isBkr: false };
	  this.rules[69] = { name: 'rep-min', lower: 'rep-min', index: 69, isBkr: false };
	  this.rules[70] = { name: 'rep-min-max', lower: 'rep-min-max', index: 70, isBkr: false };
	  this.rules[71] = { name: 'rep-max', lower: 'rep-max', index: 71, isBkr: false };
	  this.rules[72] = { name: 'rep-num', lower: 'rep-num', index: 72, isBkr: false };
	  this.rules[73] = { name: 'dString', lower: 'dstring', index: 73, isBkr: false };
	  this.rules[74] = { name: 'xString', lower: 'xstring', index: 74, isBkr: false };
	  this.rules[75] = { name: 'bString', lower: 'bstring', index: 75, isBkr: false };
	  this.rules[76] = { name: 'Dec', lower: 'dec', index: 76, isBkr: false };
	  this.rules[77] = { name: 'Hex', lower: 'hex', index: 77, isBkr: false };
	  this.rules[78] = { name: 'Bin', lower: 'bin', index: 78, isBkr: false };
	  this.rules[79] = { name: 'dmin', lower: 'dmin', index: 79, isBkr: false };
	  this.rules[80] = { name: 'dmax', lower: 'dmax', index: 80, isBkr: false };
	  this.rules[81] = { name: 'bmin', lower: 'bmin', index: 81, isBkr: false };
	  this.rules[82] = { name: 'bmax', lower: 'bmax', index: 82, isBkr: false };
	  this.rules[83] = { name: 'xmin', lower: 'xmin', index: 83, isBkr: false };
	  this.rules[84] = { name: 'xmax', lower: 'xmax', index: 84, isBkr: false };
	  this.rules[85] = { name: 'dnum', lower: 'dnum', index: 85, isBkr: false };
	  this.rules[86] = { name: 'bnum', lower: 'bnum', index: 86, isBkr: false };
	  this.rules[87] = { name: 'xnum', lower: 'xnum', index: 87, isBkr: false };
	  this.rules[88] = { name: 'alphanum', lower: 'alphanum', index: 88, isBkr: false };
	  this.rules[89] = { name: 'owsp', lower: 'owsp', index: 89, isBkr: false };
	  this.rules[90] = { name: 'wsp', lower: 'wsp', index: 90, isBkr: false };
	  this.rules[91] = { name: 'space', lower: 'space', index: 91, isBkr: false };
	  this.rules[92] = { name: 'comment', lower: 'comment', index: 92, isBkr: false };
	  this.rules[93] = { name: 'LineEnd', lower: 'lineend', index: 93, isBkr: false };
	  this.rules[94] = { name: 'LineContinue', lower: 'linecontinue', index: 94, isBkr: false };

	  /* UDTS */
	  this.udts = [];

	  /* OPCODES */
	  /* File */
	  this.rules[0].opcodes = [];
	  this.rules[0].opcodes[0] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[0].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
	  this.rules[0].opcodes[2] = { type: 4, index: 1 };// RNM(BlankLine)
	  this.rules[0].opcodes[3] = { type: 4, index: 2 };// RNM(Rule)
	  this.rules[0].opcodes[4] = { type: 4, index: 12 };// RNM(RuleError)

	  /* BlankLine */
	  this.rules[1].opcodes = [];
	  this.rules[1].opcodes[0] = { type: 2, children: [1,5,7] };// CAT
	  this.rules[1].opcodes[1] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[1].opcodes[2] = { type: 1, children: [3,4] };// ALT
	  this.rules[1].opcodes[3] = { type: 6, string: [32] };// TBS
	  this.rules[1].opcodes[4] = { type: 6, string: [9] };// TBS
	  this.rules[1].opcodes[5] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[1].opcodes[6] = { type: 4, index: 92 };// RNM(comment)
	  this.rules[1].opcodes[7] = { type: 4, index: 93 };// RNM(LineEnd)

	  /* Rule */
	  this.rules[2].opcodes = [];
	  this.rules[2].opcodes[0] = { type: 2, children: [1,2,3,4] };// CAT
	  this.rules[2].opcodes[1] = { type: 4, index: 3 };// RNM(RuleLookup)
	  this.rules[2].opcodes[2] = { type: 4, index: 89 };// RNM(owsp)
	  this.rules[2].opcodes[3] = { type: 4, index: 14 };// RNM(Alternation)
	  this.rules[2].opcodes[4] = { type: 1, children: [5,8] };// ALT
	  this.rules[2].opcodes[5] = { type: 2, children: [6,7] };// CAT
	  this.rules[2].opcodes[6] = { type: 4, index: 89 };// RNM(owsp)
	  this.rules[2].opcodes[7] = { type: 4, index: 93 };// RNM(LineEnd)
	  this.rules[2].opcodes[8] = { type: 2, children: [9,10] };// CAT
	  this.rules[2].opcodes[9] = { type: 4, index: 13 };// RNM(LineEndError)
	  this.rules[2].opcodes[10] = { type: 4, index: 93 };// RNM(LineEnd)

	  /* RuleLookup */
	  this.rules[3].opcodes = [];
	  this.rules[3].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
	  this.rules[3].opcodes[1] = { type: 4, index: 4 };// RNM(RuleNameTest)
	  this.rules[3].opcodes[2] = { type: 4, index: 89 };// RNM(owsp)
	  this.rules[3].opcodes[3] = { type: 4, index: 7 };// RNM(DefinedAsTest)

	  /* RuleNameTest */
	  this.rules[4].opcodes = [];
	  this.rules[4].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[4].opcodes[1] = { type: 4, index: 5 };// RNM(RuleName)
	  this.rules[4].opcodes[2] = { type: 4, index: 6 };// RNM(RuleNameError)

	  /* RuleName */
	  this.rules[5].opcodes = [];
	  this.rules[5].opcodes[0] = { type: 4, index: 88 };// RNM(alphanum)

	  /* RuleNameError */
	  this.rules[6].opcodes = [];
	  this.rules[6].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[6].opcodes[1] = { type: 1, children: [2,3] };// ALT
	  this.rules[6].opcodes[2] = { type: 5, min: 33, max: 60 };// TRG
	  this.rules[6].opcodes[3] = { type: 5, min: 62, max: 126 };// TRG

	  /* DefinedAsTest */
	  this.rules[7].opcodes = [];
	  this.rules[7].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[7].opcodes[1] = { type: 4, index: 9 };// RNM(DefinedAs)
	  this.rules[7].opcodes[2] = { type: 4, index: 8 };// RNM(DefinedAsError)

	  /* DefinedAsError */
	  this.rules[8].opcodes = [];
	  this.rules[8].opcodes[0] = { type: 3, min: 1, max: 2 };// REP
	  this.rules[8].opcodes[1] = { type: 5, min: 33, max: 126 };// TRG

	  /* DefinedAs */
	  this.rules[9].opcodes = [];
	  this.rules[9].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[9].opcodes[1] = { type: 4, index: 11 };// RNM(IncAlt)
	  this.rules[9].opcodes[2] = { type: 4, index: 10 };// RNM(Defined)

	  /* Defined */
	  this.rules[10].opcodes = [];
	  this.rules[10].opcodes[0] = { type: 6, string: [61] };// TBS

	  /* IncAlt */
	  this.rules[11].opcodes = [];
	  this.rules[11].opcodes[0] = { type: 6, string: [61,47] };// TBS

	  /* RuleError */
	  this.rules[12].opcodes = [];
	  this.rules[12].opcodes[0] = { type: 2, children: [1,6] };// CAT
	  this.rules[12].opcodes[1] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[12].opcodes[2] = { type: 1, children: [3,4,5] };// ALT
	  this.rules[12].opcodes[3] = { type: 5, min: 32, max: 126 };// TRG
	  this.rules[12].opcodes[4] = { type: 6, string: [9] };// TBS
	  this.rules[12].opcodes[5] = { type: 4, index: 94 };// RNM(LineContinue)
	  this.rules[12].opcodes[6] = { type: 4, index: 93 };// RNM(LineEnd)

	  /* LineEndError */
	  this.rules[13].opcodes = [];
	  this.rules[13].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[13].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
	  this.rules[13].opcodes[2] = { type: 5, min: 32, max: 126 };// TRG
	  this.rules[13].opcodes[3] = { type: 6, string: [9] };// TBS
	  this.rules[13].opcodes[4] = { type: 4, index: 94 };// RNM(LineContinue)

	  /* Alternation */
	  this.rules[14].opcodes = [];
	  this.rules[14].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[14].opcodes[1] = { type: 4, index: 15 };// RNM(Concatenation)
	  this.rules[14].opcodes[2] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[14].opcodes[3] = { type: 2, children: [4,5,6] };// CAT
	  this.rules[14].opcodes[4] = { type: 4, index: 89 };// RNM(owsp)
	  this.rules[14].opcodes[5] = { type: 4, index: 44 };// RNM(AltOp)
	  this.rules[14].opcodes[6] = { type: 4, index: 15 };// RNM(Concatenation)

	  /* Concatenation */
	  this.rules[15].opcodes = [];
	  this.rules[15].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[15].opcodes[1] = { type: 4, index: 16 };// RNM(Repetition)
	  this.rules[15].opcodes[2] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[15].opcodes[3] = { type: 2, children: [4,5] };// CAT
	  this.rules[15].opcodes[4] = { type: 4, index: 45 };// RNM(CatOp)
	  this.rules[15].opcodes[5] = { type: 4, index: 16 };// RNM(Repetition)

	  /* Repetition */
	  this.rules[16].opcodes = [];
	  this.rules[16].opcodes[0] = { type: 2, children: [1,3] };// CAT
	  this.rules[16].opcodes[1] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[16].opcodes[2] = { type: 4, index: 17 };// RNM(Modifier)
	  this.rules[16].opcodes[3] = { type: 1, children: [4,5,6,7] };// ALT
	  this.rules[16].opcodes[4] = { type: 4, index: 21 };// RNM(Group)
	  this.rules[16].opcodes[5] = { type: 4, index: 25 };// RNM(Option)
	  this.rules[16].opcodes[6] = { type: 4, index: 19 };// RNM(BasicElement)
	  this.rules[16].opcodes[7] = { type: 4, index: 20 };// RNM(BasicElementErr)

	  /* Modifier */
	  this.rules[17].opcodes = [];
	  this.rules[17].opcodes[0] = { type: 1, children: [1,5] };// ALT
	  this.rules[17].opcodes[1] = { type: 2, children: [2,3] };// CAT
	  this.rules[17].opcodes[2] = { type: 4, index: 18 };// RNM(Predicate)
	  this.rules[17].opcodes[3] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[17].opcodes[4] = { type: 4, index: 43 };// RNM(RepOp)
	  this.rules[17].opcodes[5] = { type: 4, index: 43 };// RNM(RepOp)

	  /* Predicate */
	  this.rules[18].opcodes = [];
	  this.rules[18].opcodes[0] = { type: 1, children: [1,2,3,4] };// ALT
	  this.rules[18].opcodes[1] = { type: 4, index: 49 };// RNM(BkaOp)
	  this.rules[18].opcodes[2] = { type: 4, index: 50 };// RNM(BknOp)
	  this.rules[18].opcodes[3] = { type: 4, index: 47 };// RNM(AndOp)
	  this.rules[18].opcodes[4] = { type: 4, index: 48 };// RNM(NotOp)

	  /* BasicElement */
	  this.rules[19].opcodes = [];
	  this.rules[19].opcodes[0] = { type: 1, children: [1,2,3,4,5,6,7,8,9,10] };// ALT
	  this.rules[19].opcodes[1] = { type: 4, index: 40 };// RNM(UdtOp)
	  this.rules[19].opcodes[2] = { type: 4, index: 29 };// RNM(RnmOp)
	  this.rules[19].opcodes[3] = { type: 4, index: 53 };// RNM(TrgOp)
	  this.rules[19].opcodes[4] = { type: 4, index: 54 };// RNM(TbsOp)
	  this.rules[19].opcodes[5] = { type: 4, index: 55 };// RNM(TlsOp)
	  this.rules[19].opcodes[6] = { type: 4, index: 61 };// RNM(ClsOp)
	  this.rules[19].opcodes[7] = { type: 4, index: 30 };// RNM(BkrOp)
	  this.rules[19].opcodes[8] = { type: 4, index: 51 };// RNM(AbgOp)
	  this.rules[19].opcodes[9] = { type: 4, index: 52 };// RNM(AenOp)
	  this.rules[19].opcodes[10] = { type: 4, index: 65 };// RNM(ProsVal)

	  /* BasicElementErr */
	  this.rules[20].opcodes = [];
	  this.rules[20].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[20].opcodes[1] = { type: 1, children: [2,3,4,5] };// ALT
	  this.rules[20].opcodes[2] = { type: 5, min: 33, max: 40 };// TRG
	  this.rules[20].opcodes[3] = { type: 5, min: 42, max: 46 };// TRG
	  this.rules[20].opcodes[4] = { type: 5, min: 48, max: 92 };// TRG
	  this.rules[20].opcodes[5] = { type: 5, min: 94, max: 126 };// TRG

	  /* Group */
	  this.rules[21].opcodes = [];
	  this.rules[21].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
	  this.rules[21].opcodes[1] = { type: 4, index: 23 };// RNM(GroupOpen)
	  this.rules[21].opcodes[2] = { type: 4, index: 14 };// RNM(Alternation)
	  this.rules[21].opcodes[3] = { type: 1, children: [4,5] };// ALT
	  this.rules[21].opcodes[4] = { type: 4, index: 24 };// RNM(GroupClose)
	  this.rules[21].opcodes[5] = { type: 4, index: 22 };// RNM(GroupError)

	  /* GroupError */
	  this.rules[22].opcodes = [];
	  this.rules[22].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[22].opcodes[1] = { type: 1, children: [2,3,4,5] };// ALT
	  this.rules[22].opcodes[2] = { type: 5, min: 33, max: 40 };// TRG
	  this.rules[22].opcodes[3] = { type: 5, min: 42, max: 46 };// TRG
	  this.rules[22].opcodes[4] = { type: 5, min: 48, max: 92 };// TRG
	  this.rules[22].opcodes[5] = { type: 5, min: 94, max: 126 };// TRG

	  /* GroupOpen */
	  this.rules[23].opcodes = [];
	  this.rules[23].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[23].opcodes[1] = { type: 6, string: [40] };// TBS
	  this.rules[23].opcodes[2] = { type: 4, index: 89 };// RNM(owsp)

	  /* GroupClose */
	  this.rules[24].opcodes = [];
	  this.rules[24].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[24].opcodes[1] = { type: 4, index: 89 };// RNM(owsp)
	  this.rules[24].opcodes[2] = { type: 6, string: [41] };// TBS

	  /* Option */
	  this.rules[25].opcodes = [];
	  this.rules[25].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
	  this.rules[25].opcodes[1] = { type: 4, index: 27 };// RNM(OptionOpen)
	  this.rules[25].opcodes[2] = { type: 4, index: 14 };// RNM(Alternation)
	  this.rules[25].opcodes[3] = { type: 1, children: [4,5] };// ALT
	  this.rules[25].opcodes[4] = { type: 4, index: 28 };// RNM(OptionClose)
	  this.rules[25].opcodes[5] = { type: 4, index: 26 };// RNM(OptionError)

	  /* OptionError */
	  this.rules[26].opcodes = [];
	  this.rules[26].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[26].opcodes[1] = { type: 1, children: [2,3,4,5] };// ALT
	  this.rules[26].opcodes[2] = { type: 5, min: 33, max: 40 };// TRG
	  this.rules[26].opcodes[3] = { type: 5, min: 42, max: 46 };// TRG
	  this.rules[26].opcodes[4] = { type: 5, min: 48, max: 92 };// TRG
	  this.rules[26].opcodes[5] = { type: 5, min: 94, max: 126 };// TRG

	  /* OptionOpen */
	  this.rules[27].opcodes = [];
	  this.rules[27].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[27].opcodes[1] = { type: 6, string: [91] };// TBS
	  this.rules[27].opcodes[2] = { type: 4, index: 89 };// RNM(owsp)

	  /* OptionClose */
	  this.rules[28].opcodes = [];
	  this.rules[28].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[28].opcodes[1] = { type: 4, index: 89 };// RNM(owsp)
	  this.rules[28].opcodes[2] = { type: 6, string: [93] };// TBS

	  /* RnmOp */
	  this.rules[29].opcodes = [];
	  this.rules[29].opcodes[0] = { type: 4, index: 88 };// RNM(alphanum)

	  /* BkrOp */
	  this.rules[30].opcodes = [];
	  this.rules[30].opcodes[0] = { type: 2, children: [1,2,4] };// CAT
	  this.rules[30].opcodes[1] = { type: 6, string: [92] };// TBS
	  this.rules[30].opcodes[2] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[30].opcodes[3] = { type: 4, index: 31 };// RNM(bkrModifier)
	  this.rules[30].opcodes[4] = { type: 4, index: 36 };// RNM(bkr-name)

	  /* bkrModifier */
	  this.rules[31].opcodes = [];
	  this.rules[31].opcodes[0] = { type: 1, children: [1,7,13,19] };// ALT
	  this.rules[31].opcodes[1] = { type: 2, children: [2,3] };// CAT
	  this.rules[31].opcodes[2] = { type: 4, index: 32 };// RNM(cs)
	  this.rules[31].opcodes[3] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[31].opcodes[4] = { type: 1, children: [5,6] };// ALT
	  this.rules[31].opcodes[5] = { type: 4, index: 34 };// RNM(um)
	  this.rules[31].opcodes[6] = { type: 4, index: 35 };// RNM(pm)
	  this.rules[31].opcodes[7] = { type: 2, children: [8,9] };// CAT
	  this.rules[31].opcodes[8] = { type: 4, index: 33 };// RNM(ci)
	  this.rules[31].opcodes[9] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[31].opcodes[10] = { type: 1, children: [11,12] };// ALT
	  this.rules[31].opcodes[11] = { type: 4, index: 34 };// RNM(um)
	  this.rules[31].opcodes[12] = { type: 4, index: 35 };// RNM(pm)
	  this.rules[31].opcodes[13] = { type: 2, children: [14,15] };// CAT
	  this.rules[31].opcodes[14] = { type: 4, index: 34 };// RNM(um)
	  this.rules[31].opcodes[15] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[31].opcodes[16] = { type: 1, children: [17,18] };// ALT
	  this.rules[31].opcodes[17] = { type: 4, index: 32 };// RNM(cs)
	  this.rules[31].opcodes[18] = { type: 4, index: 33 };// RNM(ci)
	  this.rules[31].opcodes[19] = { type: 2, children: [20,21] };// CAT
	  this.rules[31].opcodes[20] = { type: 4, index: 35 };// RNM(pm)
	  this.rules[31].opcodes[21] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[31].opcodes[22] = { type: 1, children: [23,24] };// ALT
	  this.rules[31].opcodes[23] = { type: 4, index: 32 };// RNM(cs)
	  this.rules[31].opcodes[24] = { type: 4, index: 33 };// RNM(ci)

	  /* cs */
	  this.rules[32].opcodes = [];
	  this.rules[32].opcodes[0] = { type: 6, string: [37,115] };// TBS

	  /* ci */
	  this.rules[33].opcodes = [];
	  this.rules[33].opcodes[0] = { type: 6, string: [37,105] };// TBS

	  /* um */
	  this.rules[34].opcodes = [];
	  this.rules[34].opcodes[0] = { type: 6, string: [37,117] };// TBS

	  /* pm */
	  this.rules[35].opcodes = [];
	  this.rules[35].opcodes[0] = { type: 6, string: [37,112] };// TBS

	  /* bkr-name */
	  this.rules[36].opcodes = [];
	  this.rules[36].opcodes[0] = { type: 1, children: [1,2,3] };// ALT
	  this.rules[36].opcodes[1] = { type: 4, index: 38 };// RNM(uname)
	  this.rules[36].opcodes[2] = { type: 4, index: 39 };// RNM(ename)
	  this.rules[36].opcodes[3] = { type: 4, index: 37 };// RNM(rname)

	  /* rname */
	  this.rules[37].opcodes = [];
	  this.rules[37].opcodes[0] = { type: 4, index: 88 };// RNM(alphanum)

	  /* uname */
	  this.rules[38].opcodes = [];
	  this.rules[38].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[38].opcodes[1] = { type: 6, string: [117,95] };// TBS
	  this.rules[38].opcodes[2] = { type: 4, index: 88 };// RNM(alphanum)

	  /* ename */
	  this.rules[39].opcodes = [];
	  this.rules[39].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[39].opcodes[1] = { type: 6, string: [101,95] };// TBS
	  this.rules[39].opcodes[2] = { type: 4, index: 88 };// RNM(alphanum)

	  /* UdtOp */
	  this.rules[40].opcodes = [];
	  this.rules[40].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[40].opcodes[1] = { type: 4, index: 42 };// RNM(udt-empty)
	  this.rules[40].opcodes[2] = { type: 4, index: 41 };// RNM(udt-non-empty)

	  /* udt-non-empty */
	  this.rules[41].opcodes = [];
	  this.rules[41].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[41].opcodes[1] = { type: 6, string: [117,95] };// TBS
	  this.rules[41].opcodes[2] = { type: 4, index: 88 };// RNM(alphanum)

	  /* udt-empty */
	  this.rules[42].opcodes = [];
	  this.rules[42].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[42].opcodes[1] = { type: 6, string: [101,95] };// TBS
	  this.rules[42].opcodes[2] = { type: 4, index: 88 };// RNM(alphanum)

	  /* RepOp */
	  this.rules[43].opcodes = [];
	  this.rules[43].opcodes[0] = { type: 1, children: [1,5,8,11,12] };// ALT
	  this.rules[43].opcodes[1] = { type: 2, children: [2,3,4] };// CAT
	  this.rules[43].opcodes[2] = { type: 4, index: 69 };// RNM(rep-min)
	  this.rules[43].opcodes[3] = { type: 4, index: 46 };// RNM(StarOp)
	  this.rules[43].opcodes[4] = { type: 4, index: 71 };// RNM(rep-max)
	  this.rules[43].opcodes[5] = { type: 2, children: [6,7] };// CAT
	  this.rules[43].opcodes[6] = { type: 4, index: 69 };// RNM(rep-min)
	  this.rules[43].opcodes[7] = { type: 4, index: 46 };// RNM(StarOp)
	  this.rules[43].opcodes[8] = { type: 2, children: [9,10] };// CAT
	  this.rules[43].opcodes[9] = { type: 4, index: 46 };// RNM(StarOp)
	  this.rules[43].opcodes[10] = { type: 4, index: 71 };// RNM(rep-max)
	  this.rules[43].opcodes[11] = { type: 4, index: 46 };// RNM(StarOp)
	  this.rules[43].opcodes[12] = { type: 4, index: 70 };// RNM(rep-min-max)

	  /* AltOp */
	  this.rules[44].opcodes = [];
	  this.rules[44].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[44].opcodes[1] = { type: 6, string: [47] };// TBS
	  this.rules[44].opcodes[2] = { type: 4, index: 89 };// RNM(owsp)

	  /* CatOp */
	  this.rules[45].opcodes = [];
	  this.rules[45].opcodes[0] = { type: 4, index: 90 };// RNM(wsp)

	  /* StarOp */
	  this.rules[46].opcodes = [];
	  this.rules[46].opcodes[0] = { type: 6, string: [42] };// TBS

	  /* AndOp */
	  this.rules[47].opcodes = [];
	  this.rules[47].opcodes[0] = { type: 6, string: [38] };// TBS

	  /* NotOp */
	  this.rules[48].opcodes = [];
	  this.rules[48].opcodes[0] = { type: 6, string: [33] };// TBS

	  /* BkaOp */
	  this.rules[49].opcodes = [];
	  this.rules[49].opcodes[0] = { type: 6, string: [38,38] };// TBS

	  /* BknOp */
	  this.rules[50].opcodes = [];
	  this.rules[50].opcodes[0] = { type: 6, string: [33,33] };// TBS

	  /* AbgOp */
	  this.rules[51].opcodes = [];
	  this.rules[51].opcodes[0] = { type: 6, string: [37,94] };// TBS

	  /* AenOp */
	  this.rules[52].opcodes = [];
	  this.rules[52].opcodes[0] = { type: 6, string: [37,36] };// TBS

	  /* TrgOp */
	  this.rules[53].opcodes = [];
	  this.rules[53].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[53].opcodes[1] = { type: 6, string: [37] };// TBS
	  this.rules[53].opcodes[2] = { type: 1, children: [3,8,13] };// ALT
	  this.rules[53].opcodes[3] = { type: 2, children: [4,5,6,7] };// CAT
	  this.rules[53].opcodes[4] = { type: 4, index: 76 };// RNM(Dec)
	  this.rules[53].opcodes[5] = { type: 4, index: 79 };// RNM(dmin)
	  this.rules[53].opcodes[6] = { type: 6, string: [45] };// TBS
	  this.rules[53].opcodes[7] = { type: 4, index: 80 };// RNM(dmax)
	  this.rules[53].opcodes[8] = { type: 2, children: [9,10,11,12] };// CAT
	  this.rules[53].opcodes[9] = { type: 4, index: 77 };// RNM(Hex)
	  this.rules[53].opcodes[10] = { type: 4, index: 83 };// RNM(xmin)
	  this.rules[53].opcodes[11] = { type: 6, string: [45] };// TBS
	  this.rules[53].opcodes[12] = { type: 4, index: 84 };// RNM(xmax)
	  this.rules[53].opcodes[13] = { type: 2, children: [14,15,16,17] };// CAT
	  this.rules[53].opcodes[14] = { type: 4, index: 78 };// RNM(Bin)
	  this.rules[53].opcodes[15] = { type: 4, index: 81 };// RNM(bmin)
	  this.rules[53].opcodes[16] = { type: 6, string: [45] };// TBS
	  this.rules[53].opcodes[17] = { type: 4, index: 82 };// RNM(bmax)

	  /* TbsOp */
	  this.rules[54].opcodes = [];
	  this.rules[54].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[54].opcodes[1] = { type: 6, string: [37] };// TBS
	  this.rules[54].opcodes[2] = { type: 1, children: [3,10,17] };// ALT
	  this.rules[54].opcodes[3] = { type: 2, children: [4,5,6] };// CAT
	  this.rules[54].opcodes[4] = { type: 4, index: 76 };// RNM(Dec)
	  this.rules[54].opcodes[5] = { type: 4, index: 73 };// RNM(dString)
	  this.rules[54].opcodes[6] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[54].opcodes[7] = { type: 2, children: [8,9] };// CAT
	  this.rules[54].opcodes[8] = { type: 6, string: [46] };// TBS
	  this.rules[54].opcodes[9] = { type: 4, index: 73 };// RNM(dString)
	  this.rules[54].opcodes[10] = { type: 2, children: [11,12,13] };// CAT
	  this.rules[54].opcodes[11] = { type: 4, index: 77 };// RNM(Hex)
	  this.rules[54].opcodes[12] = { type: 4, index: 74 };// RNM(xString)
	  this.rules[54].opcodes[13] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[54].opcodes[14] = { type: 2, children: [15,16] };// CAT
	  this.rules[54].opcodes[15] = { type: 6, string: [46] };// TBS
	  this.rules[54].opcodes[16] = { type: 4, index: 74 };// RNM(xString)
	  this.rules[54].opcodes[17] = { type: 2, children: [18,19,20] };// CAT
	  this.rules[54].opcodes[18] = { type: 4, index: 78 };// RNM(Bin)
	  this.rules[54].opcodes[19] = { type: 4, index: 75 };// RNM(bString)
	  this.rules[54].opcodes[20] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[54].opcodes[21] = { type: 2, children: [22,23] };// CAT
	  this.rules[54].opcodes[22] = { type: 6, string: [46] };// TBS
	  this.rules[54].opcodes[23] = { type: 4, index: 75 };// RNM(bString)

	  /* TlsOp */
	  this.rules[55].opcodes = [];
	  this.rules[55].opcodes[0] = { type: 2, children: [1,2,3,4] };// CAT
	  this.rules[55].opcodes[1] = { type: 4, index: 56 };// RNM(TlsCase)
	  this.rules[55].opcodes[2] = { type: 4, index: 57 };// RNM(TlsOpen)
	  this.rules[55].opcodes[3] = { type: 4, index: 59 };// RNM(TlsString)
	  this.rules[55].opcodes[4] = { type: 4, index: 58 };// RNM(TlsClose)

	  /* TlsCase */
	  this.rules[56].opcodes = [];
	  this.rules[56].opcodes[0] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[56].opcodes[1] = { type: 1, children: [2,3] };// ALT
	  this.rules[56].opcodes[2] = { type: 7, string: [37,105] };// TLS
	  this.rules[56].opcodes[3] = { type: 7, string: [37,115] };// TLS

	  /* TlsOpen */
	  this.rules[57].opcodes = [];
	  this.rules[57].opcodes[0] = { type: 6, string: [34] };// TBS

	  /* TlsClose */
	  this.rules[58].opcodes = [];
	  this.rules[58].opcodes[0] = { type: 6, string: [34] };// TBS

	  /* TlsString */
	  this.rules[59].opcodes = [];
	  this.rules[59].opcodes[0] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[59].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
	  this.rules[59].opcodes[2] = { type: 5, min: 32, max: 33 };// TRG
	  this.rules[59].opcodes[3] = { type: 5, min: 35, max: 126 };// TRG
	  this.rules[59].opcodes[4] = { type: 4, index: 60 };// RNM(StringTab)

	  /* StringTab */
	  this.rules[60].opcodes = [];
	  this.rules[60].opcodes[0] = { type: 6, string: [9] };// TBS

	  /* ClsOp */
	  this.rules[61].opcodes = [];
	  this.rules[61].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
	  this.rules[61].opcodes[1] = { type: 4, index: 62 };// RNM(ClsOpen)
	  this.rules[61].opcodes[2] = { type: 4, index: 64 };// RNM(ClsString)
	  this.rules[61].opcodes[3] = { type: 4, index: 63 };// RNM(ClsClose)

	  /* ClsOpen */
	  this.rules[62].opcodes = [];
	  this.rules[62].opcodes[0] = { type: 6, string: [39] };// TBS

	  /* ClsClose */
	  this.rules[63].opcodes = [];
	  this.rules[63].opcodes[0] = { type: 6, string: [39] };// TBS

	  /* ClsString */
	  this.rules[64].opcodes = [];
	  this.rules[64].opcodes[0] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[64].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
	  this.rules[64].opcodes[2] = { type: 5, min: 32, max: 38 };// TRG
	  this.rules[64].opcodes[3] = { type: 5, min: 40, max: 126 };// TRG
	  this.rules[64].opcodes[4] = { type: 4, index: 60 };// RNM(StringTab)

	  /* ProsVal */
	  this.rules[65].opcodes = [];
	  this.rules[65].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
	  this.rules[65].opcodes[1] = { type: 4, index: 66 };// RNM(ProsValOpen)
	  this.rules[65].opcodes[2] = { type: 4, index: 67 };// RNM(ProsValString)
	  this.rules[65].opcodes[3] = { type: 4, index: 68 };// RNM(ProsValClose)

	  /* ProsValOpen */
	  this.rules[66].opcodes = [];
	  this.rules[66].opcodes[0] = { type: 6, string: [60] };// TBS

	  /* ProsValString */
	  this.rules[67].opcodes = [];
	  this.rules[67].opcodes[0] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[67].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
	  this.rules[67].opcodes[2] = { type: 5, min: 32, max: 61 };// TRG
	  this.rules[67].opcodes[3] = { type: 5, min: 63, max: 126 };// TRG
	  this.rules[67].opcodes[4] = { type: 4, index: 60 };// RNM(StringTab)

	  /* ProsValClose */
	  this.rules[68].opcodes = [];
	  this.rules[68].opcodes[0] = { type: 6, string: [62] };// TBS

	  /* rep-min */
	  this.rules[69].opcodes = [];
	  this.rules[69].opcodes[0] = { type: 4, index: 72 };// RNM(rep-num)

	  /* rep-min-max */
	  this.rules[70].opcodes = [];
	  this.rules[70].opcodes[0] = { type: 4, index: 72 };// RNM(rep-num)

	  /* rep-max */
	  this.rules[71].opcodes = [];
	  this.rules[71].opcodes[0] = { type: 4, index: 72 };// RNM(rep-num)

	  /* rep-num */
	  this.rules[72].opcodes = [];
	  this.rules[72].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[72].opcodes[1] = { type: 5, min: 48, max: 57 };// TRG

	  /* dString */
	  this.rules[73].opcodes = [];
	  this.rules[73].opcodes[0] = { type: 4, index: 85 };// RNM(dnum)

	  /* xString */
	  this.rules[74].opcodes = [];
	  this.rules[74].opcodes[0] = { type: 4, index: 87 };// RNM(xnum)

	  /* bString */
	  this.rules[75].opcodes = [];
	  this.rules[75].opcodes[0] = { type: 4, index: 86 };// RNM(bnum)

	  /* Dec */
	  this.rules[76].opcodes = [];
	  this.rules[76].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[76].opcodes[1] = { type: 6, string: [68] };// TBS
	  this.rules[76].opcodes[2] = { type: 6, string: [100] };// TBS

	  /* Hex */
	  this.rules[77].opcodes = [];
	  this.rules[77].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[77].opcodes[1] = { type: 6, string: [88] };// TBS
	  this.rules[77].opcodes[2] = { type: 6, string: [120] };// TBS

	  /* Bin */
	  this.rules[78].opcodes = [];
	  this.rules[78].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[78].opcodes[1] = { type: 6, string: [66] };// TBS
	  this.rules[78].opcodes[2] = { type: 6, string: [98] };// TBS

	  /* dmin */
	  this.rules[79].opcodes = [];
	  this.rules[79].opcodes[0] = { type: 4, index: 85 };// RNM(dnum)

	  /* dmax */
	  this.rules[80].opcodes = [];
	  this.rules[80].opcodes[0] = { type: 4, index: 85 };// RNM(dnum)

	  /* bmin */
	  this.rules[81].opcodes = [];
	  this.rules[81].opcodes[0] = { type: 4, index: 86 };// RNM(bnum)

	  /* bmax */
	  this.rules[82].opcodes = [];
	  this.rules[82].opcodes[0] = { type: 4, index: 86 };// RNM(bnum)

	  /* xmin */
	  this.rules[83].opcodes = [];
	  this.rules[83].opcodes[0] = { type: 4, index: 87 };// RNM(xnum)

	  /* xmax */
	  this.rules[84].opcodes = [];
	  this.rules[84].opcodes[0] = { type: 4, index: 87 };// RNM(xnum)

	  /* dnum */
	  this.rules[85].opcodes = [];
	  this.rules[85].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[85].opcodes[1] = { type: 5, min: 48, max: 57 };// TRG

	  /* bnum */
	  this.rules[86].opcodes = [];
	  this.rules[86].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[86].opcodes[1] = { type: 5, min: 48, max: 49 };// TRG

	  /* xnum */
	  this.rules[87].opcodes = [];
	  this.rules[87].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[87].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
	  this.rules[87].opcodes[2] = { type: 5, min: 48, max: 57 };// TRG
	  this.rules[87].opcodes[3] = { type: 5, min: 65, max: 70 };// TRG
	  this.rules[87].opcodes[4] = { type: 5, min: 97, max: 102 };// TRG

	  /* alphanum */
	  this.rules[88].opcodes = [];
	  this.rules[88].opcodes[0] = { type: 2, children: [1,4] };// CAT
	  this.rules[88].opcodes[1] = { type: 1, children: [2,3] };// ALT
	  this.rules[88].opcodes[2] = { type: 5, min: 97, max: 122 };// TRG
	  this.rules[88].opcodes[3] = { type: 5, min: 65, max: 90 };// TRG
	  this.rules[88].opcodes[4] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[88].opcodes[5] = { type: 1, children: [6,7,8,9] };// ALT
	  this.rules[88].opcodes[6] = { type: 5, min: 97, max: 122 };// TRG
	  this.rules[88].opcodes[7] = { type: 5, min: 65, max: 90 };// TRG
	  this.rules[88].opcodes[8] = { type: 5, min: 48, max: 57 };// TRG
	  this.rules[88].opcodes[9] = { type: 6, string: [45] };// TBS

	  /* owsp */
	  this.rules[89].opcodes = [];
	  this.rules[89].opcodes[0] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[89].opcodes[1] = { type: 4, index: 91 };// RNM(space)

	  /* wsp */
	  this.rules[90].opcodes = [];
	  this.rules[90].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
	  this.rules[90].opcodes[1] = { type: 4, index: 91 };// RNM(space)

	  /* space */
	  this.rules[91].opcodes = [];
	  this.rules[91].opcodes[0] = { type: 1, children: [1,2,3,4] };// ALT
	  this.rules[91].opcodes[1] = { type: 6, string: [32] };// TBS
	  this.rules[91].opcodes[2] = { type: 6, string: [9] };// TBS
	  this.rules[91].opcodes[3] = { type: 4, index: 92 };// RNM(comment)
	  this.rules[91].opcodes[4] = { type: 4, index: 94 };// RNM(LineContinue)

	  /* comment */
	  this.rules[92].opcodes = [];
	  this.rules[92].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[92].opcodes[1] = { type: 6, string: [59] };// TBS
	  this.rules[92].opcodes[2] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[92].opcodes[3] = { type: 1, children: [4,5] };// ALT
	  this.rules[92].opcodes[4] = { type: 5, min: 32, max: 126 };// TRG
	  this.rules[92].opcodes[5] = { type: 6, string: [9] };// TBS

	  /* LineEnd */
	  this.rules[93].opcodes = [];
	  this.rules[93].opcodes[0] = { type: 1, children: [1,2,3] };// ALT
	  this.rules[93].opcodes[1] = { type: 6, string: [13,10] };// TBS
	  this.rules[93].opcodes[2] = { type: 6, string: [10] };// TBS
	  this.rules[93].opcodes[3] = { type: 6, string: [13] };// TBS

	  /* LineContinue */
	  this.rules[94].opcodes = [];
	  this.rules[94].opcodes[0] = { type: 2, children: [1,5] };// CAT
	  this.rules[94].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
	  this.rules[94].opcodes[2] = { type: 6, string: [13,10] };// TBS
	  this.rules[94].opcodes[3] = { type: 6, string: [10] };// TBS
	  this.rules[94].opcodes[4] = { type: 6, string: [13] };// TBS
	  this.rules[94].opcodes[5] = { type: 1, children: [6,7] };// ALT
	  this.rules[94].opcodes[6] = { type: 6, string: [32] };// TBS
	  this.rules[94].opcodes[7] = { type: 6, string: [9] };// TBS

	  // The `toString()` function will display the original grammar file(s) that produced these opcodes.
	  this.toString = function toString(){
	    let str = "";
	    str += ";\n";
	    str += "; ABNF for JavaScript APG 2.0 SABNF\n";
	    str += "; RFC 5234 with some restrictions and additions.\n";
	    str += "; Updated 11/24/2015 for RFC 7405 case-sensitive literal string notation\n";
	    str += ";  - accepts %s\"string\" as a case-sensitive string\n";
	    str += ";  - accepts %i\"string\" as a case-insensitive string\n";
	    str += ";  - accepts \"string\" as a case-insensitive string\n";
	    str += ";\n";
	    str += "; Some restrictions:\n";
	    str += ";   1. Rules must begin at first character of each line.\n";
	    str += ";      Indentations on first rule and rules thereafter are not allowed.\n";
	    str += ";   2. Relaxed line endings. CRLF, LF or CR are accepted as valid line ending.\n";
	    str += ";   3. Prose values, i.e. <prose value>, are accepted as valid grammar syntax.\n";
	    str += ";      However, a working parser cannot be generated from them.\n";
	    str += ";\n";
	    str += "; Super set (SABNF) additions:\n";
	    str += ";   1. Look-ahead (syntactic predicate) operators are accepted as element prefixes.\n";
	    str += ";      & is the positive look-ahead operator, succeeds and backtracks if the look-ahead phrase is found\n";
	    str += ";      ! is the negative look-ahead operator, succeeds and backtracks if the look-ahead phrase is NOT found\n";
	    str += ";      e.g. &%d13 or &rule or !(A / B)\n";
	    str += ";   2. User-Defined Terminals (UDT) of the form, u_name and e_name are accepted.\n";
	    str += ";      'name' is alpha followed by alpha/num/hyphen just like a rule name.\n";
	    str += ";      u_name may be used as an element but no rule definition is given.\n";
	    str += ";      e.g. rule = A / u_myUdt\n";
	    str += ";           A = \"a\"\n";
	    str += ";      would be a valid grammar.\n";
	    str += ";   3. Case-sensitive, single-quoted strings are accepted.\n";
	    str += ";      e.g. 'abc' would be equivalent to %d97.98.99\n";
	    str += ";      (kept for backward compatibility, but superseded by %s\"abc\")  \n";
	    str += "; New 12/26/2015\n";
	    str += ";   4. Look-behind operators are accepted as element prefixes.\n";
	    str += ";      && is the positive look-behind operator, succeeds and backtracks if the look-behind phrase is found\n";
	    str += ";      !! is the negative look-behind operator, succeeds and backtracks if the look-behind phrase is NOT found\n";
	    str += ";      e.g. &&%d13 or &&rule or !!(A / B)\n";
	    str += ";   5. Back reference operators, i.e. \\rulename, are accepted.\n";
	    str += ";      A back reference operator acts like a TLS or TBS terminal except that the phrase it attempts\n";
	    str += ";      to match is a phrase previously matched by the rule 'rulename'.\n";
	    str += ";      There are two modes of previous phrase matching - the parent-frame mode and the universal mode.\n";
	    str += ";      In universal mode, \\rulename matches the last match to 'rulename' regardless of where it was found.\n";
	    str += ";      In parent-frame mode, \\rulename matches only the last match found on the parent's frame or parse tree level.\n";
	    str += ";      Back reference modifiers can be used to specify case and mode.\n";
	    str += ";      \\A defaults to case-insensitive and universal mode, e.g. \\A === \\%i%uA\n";
	    str += ";      Modifiers %i and %s determine case-insensitive and case-sensitive mode, respectively.\n";
	    str += ";      Modifiers %u and %p determine universal mode and parent frame mode, respectively.\n";
	    str += ";      Case and mode modifiers can appear in any order, e.g. \\%s%pA === \\%p%sA. \n";
	    str += ";   7. String begin anchor, ABG(%^) matches the beginning of the input string location.\n";
	    str += ";      Returns EMPTY or NOMATCH. Never consumes any characters.\n";
	    str += ";   8. String end anchor, AEN(%$) matches the end of the input string location.\n";
	    str += ";      Returns EMPTY or NOMATCH. Never consumes any characters.\n";
	    str += ";\n";
	    str += "File            = *(BlankLine / Rule / RuleError)\n";
	    str += "BlankLine       = *(%d32/%d9) [comment] LineEnd\n";
	    str += "Rule            = RuleLookup owsp Alternation ((owsp LineEnd)\n";
	    str += "                / (LineEndError LineEnd))\n";
	    str += "RuleLookup      = RuleNameTest owsp DefinedAsTest\n";
	    str += "RuleNameTest    = RuleName/RuleNameError\n";
	    str += "RuleName        = alphanum\n";
	    str += "RuleNameError   = 1*(%d33-60/%d62-126)\n";
	    str += "DefinedAsTest   = DefinedAs / DefinedAsError\n";
	    str += "DefinedAsError  = 1*2%d33-126\n";
	    str += "DefinedAs       = IncAlt / Defined\n";
	    str += "Defined         = %d61\n";
	    str += "IncAlt          = %d61.47\n";
	    str += "RuleError       = 1*(%d32-126 / %d9  / LineContinue) LineEnd\n";
	    str += "LineEndError    = 1*(%d32-126 / %d9  / LineContinue)\n";
	    str += "Alternation     = Concatenation *(owsp AltOp Concatenation)\n";
	    str += "Concatenation   = Repetition *(CatOp Repetition)\n";
	    str += "Repetition      = [Modifier] (Group / Option / BasicElement / BasicElementErr)\n";
	    str += "Modifier        = (Predicate [RepOp])\n";
	    str += "                / RepOp\n";
	    str += "Predicate       = BkaOp\n";
	    str += "                / BknOp\n";
	    str += "                / AndOp\n";
	    str += "                / NotOp\n";
	    str += "BasicElement    = UdtOp\n";
	    str += "                / RnmOp\n";
	    str += "                / TrgOp\n";
	    str += "                / TbsOp\n";
	    str += "                / TlsOp\n";
	    str += "                / ClsOp\n";
	    str += "                / BkrOp\n";
	    str += "                / AbgOp\n";
	    str += "                / AenOp\n";
	    str += "                / ProsVal\n";
	    str += "BasicElementErr = 1*(%d33-40/%d42-46/%d48-92/%d94-126)\n";
	    str += "Group           = GroupOpen  Alternation (GroupClose / GroupError)\n";
	    str += "GroupError      = 1*(%d33-40/%d42-46/%d48-92/%d94-126) ; same as BasicElementErr\n";
	    str += "GroupOpen       = %d40 owsp\n";
	    str += "GroupClose      = owsp %d41\n";
	    str += "Option          = OptionOpen Alternation (OptionClose / OptionError)\n";
	    str += "OptionError     = 1*(%d33-40/%d42-46/%d48-92/%d94-126) ; same as BasicElementErr\n";
	    str += "OptionOpen      = %d91 owsp\n";
	    str += "OptionClose     = owsp %d93\n";
	    str += "RnmOp           = alphanum\n";
	    str += "BkrOp           = %d92 [bkrModifier] bkr-name\n";
	    str += "bkrModifier     = (cs [um / pm]) / (ci [um / pm]) / (um [cs /ci]) / (pm [cs / ci])\n";
	    str += "cs              = '%s'\n";
	    str += "ci              = '%i'\n";
	    str += "um              = '%u'\n";
	    str += "pm              = '%p'\n";
	    str += "bkr-name        = uname / ename / rname\n";
	    str += "rname           = alphanum\n";
	    str += "uname           = %d117.95 alphanum\n";
	    str += "ename           = %d101.95 alphanum\n";
	    str += "UdtOp           = udt-empty\n";
	    str += "                / udt-non-empty\n";
	    str += "udt-non-empty   = %d117.95 alphanum\n";
	    str += "udt-empty       = %d101.95 alphanum\n";
	    str += "RepOp           = (rep-min StarOp rep-max)\n";
	    str += "                / (rep-min StarOp)\n";
	    str += "                / (StarOp rep-max)\n";
	    str += "                / StarOp\n";
	    str += "                / rep-min-max\n";
	    str += "AltOp           = %d47 owsp\n";
	    str += "CatOp           = wsp\n";
	    str += "StarOp          = %d42\n";
	    str += "AndOp           = %d38\n";
	    str += "NotOp           = %d33\n";
	    str += "BkaOp           = %d38.38\n";
	    str += "BknOp           = %d33.33\n";
	    str += "AbgOp           = %d37.94\n";
	    str += "AenOp           = %d37.36\n";
	    str += "TrgOp           = %d37 ((Dec dmin %d45 dmax) / (Hex xmin %d45 xmax) / (Bin bmin %d45 bmax))\n";
	    str += "TbsOp           = %d37 ((Dec dString *(%d46 dString)) / (Hex xString *(%d46 xString)) / (Bin bString *(%d46 bString)))\n";
	    str += "TlsOp           = TlsCase TlsOpen TlsString TlsClose\n";
	    str += "TlsCase         = [\"%i\" / \"%s\"]\n";
	    str += "TlsOpen         = %d34\n";
	    str += "TlsClose        = %d34\n";
	    str += "TlsString       = *(%d32-33/%d35-126/StringTab)\n";
	    str += "StringTab       = %d9\n";
	    str += "ClsOp           = ClsOpen ClsString ClsClose\n";
	    str += "ClsOpen         = %d39\n";
	    str += "ClsClose        = %d39\n";
	    str += "ClsString       = *(%d32-38/%d40-126/StringTab)\n";
	    str += "ProsVal         = ProsValOpen ProsValString ProsValClose\n";
	    str += "ProsValOpen     = %d60\n";
	    str += "ProsValString   = *(%d32-61/%d63-126/StringTab)\n";
	    str += "ProsValClose    = %d62\n";
	    str += "rep-min         = rep-num\n";
	    str += "rep-min-max     = rep-num\n";
	    str += "rep-max         = rep-num\n";
	    str += "rep-num         = 1*(%d48-57)\n";
	    str += "dString         = dnum\n";
	    str += "xString         = xnum\n";
	    str += "bString         = bnum\n";
	    str += "Dec             = (%d68/%d100)\n";
	    str += "Hex             = (%d88/%d120)\n";
	    str += "Bin             = (%d66/%d98)\n";
	    str += "dmin            = dnum\n";
	    str += "dmax            = dnum\n";
	    str += "bmin            = bnum\n";
	    str += "bmax            = bnum\n";
	    str += "xmin            = xnum\n";
	    str += "xmax            = xnum\n";
	    str += "dnum            = 1*(%d48-57)\n";
	    str += "bnum            = 1*%d48-49\n";
	    str += "xnum            = 1*(%d48-57 / %d65-70 / %d97-102)\n";
	    str += ";\n";
	    str += "; Basics\n";
	    str += "alphanum        = (%d97-122/%d65-90) *(%d97-122/%d65-90/%d48-57/%d45)\n";
	    str += "owsp            = *space\n";
	    str += "wsp             = 1*space\n";
	    str += "space           = %d32\n";
	    str += "                / %d9\n";
	    str += "                / comment\n";
	    str += "                / LineContinue\n";
	    str += "comment         = %d59 *(%d32-126 / %d9)\n";
	    str += "LineEnd         = %d13.10\n";
	    str += "                / %d10\n";
	    str += "                / %d13\n";
	    str += "LineContinue    = (%d13.10 / %d10 / %d13) (%d32 / %d9)\n";
	    return str;
	  };
	};
	return sabnfGrammar;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var parser;
var hasRequiredParser;

function requireParser () {
	if (hasRequiredParser) return parser;
	hasRequiredParser = 1;
	// This module converts an input SABNF grammar text file into a
	// grammar object that can be used with `apg-lib` in an application parser.
	// **apg** is, in fact itself, an ABNF parser that generates an SABNF parser.
	// It is based on the grammar<br>
	// `./dist/abnf-for-sabnf-grammar.bnf`.<br>
	// In its syntax phase, **apg** analyzes the user's input SABNF grammar for correct syntax, generating an AST as it goes.
	// In its semantic phase, **apg** translates the AST to generate the parser for the input grammar.
	parser = function exportParser() {
	  const thisFileName = 'parser: ';
	  const ApgLib = nodeExports$1;
	  const id = ApgLib.ids;
	  const syn = new (requireSyntaxCallbacks())();
	  const sem = new (requireSemanticCallbacks())();
	  const sabnfGrammar = new (requireSabnfGrammar())();
	  // eslint-disable-next-line new-cap
	  const parser = new ApgLib.parser();
	  // eslint-disable-next-line new-cap
	  parser.ast = new ApgLib.ast();
	  parser.callbacks = syn.callbacks;
	  parser.ast.callbacks = sem.callbacks;

	  /* find the line containing the given character index */
	  const findLine = function findLine(lines, charIndex, charLength) {
	    if (charIndex < 0 || charIndex >= charLength) {
	      /* return error if out of range */
	      return -1;
	    }
	    for (let i = 0; i < lines.length; i += 1) {
	      if (charIndex >= lines[i].beginChar && charIndex < lines[i].beginChar + lines[i].length) {
	        return i;
	      }
	    }
	    /* should never reach here */
	    return -1;
	  };
	  const translateIndex = function translateIndex(map, index) {
	    let ret = -1;
	    if (index < map.length) {
	      for (let i = index; i < map.length; i += 1) {
	        if (map[i] !== null) {
	          ret = map[i];
	          break;
	        }
	      }
	    }
	    return ret;
	  };
	  /* helper function when removing redundant opcodes */
	  const reduceOpcodes = function reduceOpcodes(rules) {
	    rules.forEach((rule) => {
	      const opcodes = [];
	      const map = [];
	      let reducedIndex = 0;
	      rule.opcodes.forEach((op) => {
	        if (op.type === id.ALT && op.children.length === 1) {
	          map.push(null);
	        } else if (op.type === id.CAT && op.children.length === 1) {
	          map.push(null);
	        } else if (op.type === id.REP && op.min === 1 && op.max === 1) {
	          map.push(null);
	        } else {
	          map.push(reducedIndex);
	          opcodes.push(op);
	          reducedIndex += 1;
	        }
	      });
	      map.push(reducedIndex);
	      /* translate original opcode indexes to the reduced set. */
	      opcodes.forEach((op) => {
	        if (op.type === id.ALT || op.type === id.CAT) {
	          for (let i = 0; i < op.children.length; i += 1) {
	            op.children[i] = translateIndex(map, op.children[i]);
	          }
	        }
	      });
	      rule.opcodes = opcodes;
	    });
	  };
	  /* Parse the grammar - the syntax phase. */
	  /* SABNF grammar syntax errors are caught and reported here. */
	  this.syntax = function syntax(chars, lines, errors, strict, lite, trace) {
	    if (trace) {
	      if (trace.traceObject !== 'traceObject') {
	        throw new TypeError(`${thisFileName}trace argument is not a trace object`);
	      }
	      parser.trace = trace;
	    }
	    const data = {};
	    data.errors = errors;
	    data.strict = !!strict;
	    data.lite = !!lite;
	    data.lines = lines;
	    data.findLine = findLine;
	    data.charsLength = chars.length;
	    data.ruleCount = 0;
	    const result = parser.parse(sabnfGrammar, 'file', chars, data);
	    if (!result.success) {
	      errors.push({
	        line: 0,
	        char: 0,
	        msg: 'syntax analysis of input grammar failed',
	      });
	    }
	  };
	  /* Parse the grammar - the semantic phase, translates the AST. */
	  /* SABNF grammar syntax errors are caught and reported here. */
	  this.semantic = function semantic(chars, lines, errors) {
	    const data = {};
	    data.errors = errors;
	    data.lines = lines;
	    data.findLine = findLine;
	    data.charsLength = chars.length;
	    parser.ast.translate(data);
	    if (errors.length) {
	      return null;
	    }
	    /* Remove unneeded operators. */
	    /* ALT operators with a single alternate */
	    /* CAT operators with a single phrase to concatenate */
	    /* REP(1,1) operators (`1*1RuleName` or `1RuleName` is the same as just `RuleName`.) */
	    reduceOpcodes(data.rules);
	    return {
	      rules: data.rules,
	      udts: data.udts,
	      lineMap: data.rulesLineMap,
	    };
	  };
	  // Generate a grammar constructor function.
	  // An object instantiated from this constructor is used with the `apg-lib` `parser()` function.
	  this.generateSource = function generateSource(chars, lines, rules, udts, config) {
	    let source = '';
	    let typescript = false;
	    let lite = false;
	    // config may have multiple grammar object type options in which case
	    // --typescript > --lite  > no options
	    if (config) {
	      if (config.typescript) {
	        typescript = true;
	        lite = false;
	      } else if (config.lite) {
	        typescript = false;
	        lite = true;
	      }
	    }
	    let i;
	    let bkrname;
	    let bkrlower;
	    let opcodeCount = 0;
	    let charCodeMin = Infinity;
	    let charCodeMax = 0;
	    const ruleNames = [];
	    const udtNames = [];
	    let alt = 0;
	    let cat = 0;
	    let rnm = 0;
	    let udt = 0;
	    let rep = 0;
	    let and = 0;
	    let not = 0;
	    let tls = 0;
	    let tbs = 0;
	    let trg = 0;
	    let bkr = 0;
	    let bka = 0;
	    let bkn = 0;
	    let abg = 0;
	    let aen = 0;
	    rules.forEach((rule) => {
	      ruleNames.push(rule.lower);
	      opcodeCount += rule.opcodes.length;
	      rule.opcodes.forEach((op) => {
	        switch (op.type) {
	          case id.ALT:
	            alt += 1;
	            break;
	          case id.CAT:
	            cat += 1;
	            break;
	          case id.RNM:
	            rnm += 1;
	            break;
	          case id.UDT:
	            udt += 1;
	            break;
	          case id.REP:
	            rep += 1;
	            break;
	          case id.AND:
	            and += 1;
	            break;
	          case id.NOT:
	            not += 1;
	            break;
	          case id.BKA:
	            bka += 1;
	            break;
	          case id.BKN:
	            bkn += 1;
	            break;
	          case id.BKR:
	            bkr += 1;
	            break;
	          case id.ABG:
	            abg += 1;
	            break;
	          case id.AEN:
	            aen += 1;
	            break;
	          case id.TLS:
	            tls += 1;
	            for (i = 0; i < op.string.length; i += 1) {
	              if (op.string[i] < charCodeMin) {
	                charCodeMin = op.string[i];
	              }
	              if (op.string[i] > charCodeMax) {
	                charCodeMax = op.string[i];
	              }
	            }
	            break;
	          case id.TBS:
	            tbs += 1;
	            for (i = 0; i < op.string.length; i += 1) {
	              if (op.string[i] < charCodeMin) {
	                charCodeMin = op.string[i];
	              }
	              if (op.string[i] > charCodeMax) {
	                charCodeMax = op.string[i];
	              }
	            }
	            break;
	          case id.TRG:
	            trg += 1;
	            if (op.min < charCodeMin) {
	              charCodeMin = op.min;
	            }
	            if (op.max > charCodeMax) {
	              charCodeMax = op.max;
	            }
	            break;
	          default:
	            throw new Error('generateSource: unrecognized opcode');
	        }
	      });
	    });
	    ruleNames.sort();
	    if (udts.length > 0) {
	      udts.forEach((udtFunc) => {
	        udtNames.push(udtFunc.lower);
	      });
	      udtNames.sort();
	    }
	    source += '// copyright: Copyright (c) 2024 Lowell D. Thomas, all rights reserved<br>\n';
	    source += '//   license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)<br>\n';
	    source += '//\n';
	    source += '// Generated by apg-js, Version 4.4.0 [apg-js](https://github.com/ldthomas/apg-js)\n';
	    if (config) {
	      if (config.funcName) {
	        source += `const ${config.funcName} = function grammar(){\n`;
	      } else if (typescript) {
	        source += 'export function grammar(){\n';
	      } else if (lite) {
	        source += 'export default function grammar(){\n';
	      } else {
	        source += `module.exports = function grammar(){\n`;
	      }
	    } else {
	      source += `module.exports = function grammar(){\n`;
	    }
	    source += '  // ```\n';
	    source += '  // SUMMARY\n';
	    source += `  //      rules = ${rules.length}\n`;
	    source += `  //       udts = ${udts.length}\n`;
	    source += `  //    opcodes = ${opcodeCount}\n`;
	    source += '  //        ---   ABNF original opcodes\n';
	    source += `  //        ALT = ${alt}\n`;
	    source += `  //        CAT = ${cat}\n`;
	    source += `  //        REP = ${rep}\n`;
	    source += `  //        RNM = ${rnm}\n`;
	    source += `  //        TLS = ${tls}\n`;
	    source += `  //        TBS = ${tbs}\n`;
	    source += `  //        TRG = ${trg}\n`;
	    source += '  //        ---   SABNF superset opcodes\n';
	    source += `  //        UDT = ${udt}\n`;
	    source += `  //        AND = ${and}\n`;
	    source += `  //        NOT = ${not}\n`;
	    if (!lite) {
	      source += `  //        BKA = ${bka}\n`;
	      source += `  //        BKN = ${bkn}\n`;
	      source += `  //        BKR = ${bkr}\n`;
	      source += `  //        ABG = ${abg}\n`;
	      source += `  //        AEN = ${aen}\n`;
	    }
	    source += '  // characters = [';
	    if (tls + tbs + trg === 0) {
	      source += ' none defined ]';
	    } else {
	      source += `${charCodeMin} - ${charCodeMax}]`;
	    }
	    if (udt > 0) {
	      source += ' + user defined';
	    }
	    source += '\n';
	    source += '  // ```\n';
	    source += '  /* OBJECT IDENTIFIER (for internal parser use) */\n';
	    source += "  this.grammarObject = 'grammarObject';\n";
	    source += '\n';
	    source += '  /* RULES */\n';
	    source += '  this.rules = [];\n';
	    rules.forEach((rule, ii) => {
	      let thisRule = '  this.rules[';
	      thisRule += ii;
	      thisRule += "] = { name: '";
	      thisRule += rule.name;
	      thisRule += "', lower: '";
	      thisRule += rule.lower;
	      thisRule += "', index: ";
	      thisRule += rule.index;
	      thisRule += ', isBkr: ';
	      thisRule += rule.isBkr;
	      thisRule += ' };\n';
	      source += thisRule;
	    });
	    source += '\n';
	    source += '  /* UDTS */\n';
	    source += '  this.udts = [];\n';
	    if (udts.length > 0) {
	      udts.forEach((udtFunc, ii) => {
	        let thisUdt = '  this.udts[';
	        thisUdt += ii;
	        thisUdt += "] = { name: '";
	        thisUdt += udtFunc.name;
	        thisUdt += "', lower: '";
	        thisUdt += udtFunc.lower;
	        thisUdt += "', index: ";
	        thisUdt += udtFunc.index;
	        thisUdt += ', empty: ';
	        thisUdt += udtFunc.empty;
	        thisUdt += ', isBkr: ';
	        thisUdt += udtFunc.isBkr;
	        thisUdt += ' };\n';
	        source += thisUdt;
	      });
	    }
	    source += '\n';
	    source += '  /* OPCODES */\n';
	    rules.forEach((rule, ruleIndex) => {
	      if (ruleIndex > 0) {
	        source += '\n';
	      }
	      source += `  /* ${rule.name} */\n`;
	      source += `  this.rules[${ruleIndex}].opcodes = [];\n`;
	      rule.opcodes.forEach((op, opIndex) => {
	        let prefix;
	        switch (op.type) {
	          case id.ALT:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${
	              op.type
	            }, children: [${op.children.toString()}] };// ALT\n`;
	            break;
	          case id.CAT:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${
	              op.type
	            }, children: [${op.children.toString()}] };// CAT\n`;
	            break;
	          case id.RNM:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type}, index: ${
	              op.index
	            } };// RNM(${rules[op.index].name})\n`;
	            break;
	          case id.BKR:
	            if (op.index >= rules.length) {
	              bkrname = udts[op.index - rules.length].name;
	              bkrlower = udts[op.index - rules.length].lower;
	            } else {
	              bkrname = rules[op.index].name;
	              bkrlower = rules[op.index].lower;
	            }
	            prefix = '%i';
	            if (op.bkrCase === id.BKR_MODE_CS) {
	              prefix = '%s';
	            }
	            if (op.bkrMode === id.BKR_MODE_UM) {
	              prefix += '%u';
	            } else {
	              prefix += '%p';
	            }
	            bkrname = prefix + bkrname;
	            source +=
	              `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type}, index: ${op.index}, lower: '${bkrlower}'` +
	              `, bkrCase: ${op.bkrCase}, bkrMode: ${op.bkrMode} };// BKR(\\${bkrname})\n`;
	            break;
	          case id.UDT:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type}, empty: ${
	              op.empty
	            }, index: ${op.index} };// UDT(${udts[op.index].name})\n`;
	            break;
	          case id.REP:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type}, min: ${op.min}, max: ${op.max} };// REP\n`;
	            break;
	          case id.AND:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type} };// AND\n`;
	            break;
	          case id.NOT:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type} };// NOT\n`;
	            break;
	          case id.ABG:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type} };// ABG(%^)\n`;
	            break;
	          case id.AEN:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type} };// AEN(%$)\n`;
	            break;
	          case id.BKA:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type} };// BKA\n`;
	            break;
	          case id.BKN:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type} };// BKN\n`;
	            break;
	          case id.TLS:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${
	              op.type
	            }, string: [${op.string.toString()}] };// TLS\n`;
	            break;
	          case id.TBS:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${
	              op.type
	            }, string: [${op.string.toString()}] };// TBS\n`;
	            break;
	          case id.TRG:
	            source += `  this.rules[${ruleIndex}].opcodes[${opIndex}] = { type: ${op.type}, min: ${op.min}, max: ${op.max} };// TRG\n`;
	            break;
	          default:
	            throw new Error('parser.js: ~143: unrecognized opcode');
	        }
	      });
	    });
	    source += '\n';
	    source += '  // The `toString()` function will display the original grammar file(s) that produced these opcodes.\n';
	    source += '  this.toString = function toString(){\n';
	    source += '    let str = "";\n';
	    let str;
	    lines.forEach((line) => {
	      const end = line.beginChar + line.length;
	      str = '';
	      source += '    str += "';
	      for (let ii = line.beginChar; ii < end; ii += 1) {
	        switch (chars[ii]) {
	          case 9:
	            str = ' ';
	            break;
	          case 10:
	            str = '\\n';
	            break;
	          case 13:
	            str = '\\r';
	            break;
	          case 34:
	            str = '\\"';
	            break;
	          case 92:
	            str = '\\\\';
	            break;
	          default:
	            str = String.fromCharCode(chars[ii]);
	            break;
	        }
	        source += str;
	      }
	      source += '";\n';
	    });
	    source += '    return str;\n';
	    source += '  }\n';
	    source += '}\n';
	    return source;
	  };
	  // Generate a grammar file object.
	  // Returns the same object as instantiating the constructor function returned by<br>
	  // `this.generateSource()`.<br>
	  this.generateObject = function generateObject(stringArg, rules, udts) {
	    const obj = {};
	    const ruleNames = [];
	    const udtNames = [];
	    const string = stringArg.slice(0);
	    obj.grammarObject = 'grammarObject';
	    rules.forEach((rule) => {
	      ruleNames.push(rule.lower);
	    });
	    ruleNames.sort();
	    if (udts.length > 0) {
	      udts.forEach((udtFunc) => {
	        udtNames.push(udtFunc.lower);
	      });
	      udtNames.sort();
	    }
	    obj.callbacks = [];
	    ruleNames.forEach((name) => {
	      obj.callbacks[name] = false;
	    });
	    if (udts.length > 0) {
	      udtNames.forEach((name) => {
	        obj.callbacks[name] = false;
	      });
	    }
	    obj.rules = rules;
	    obj.udts = udts;
	    obj.toString = function toStringFunc() {
	      return string;
	    };
	    return obj;
	  };
	};
	return parser;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var ruleAttributes;
var hasRequiredRuleAttributes;

function requireRuleAttributes () {
	if (hasRequiredRuleAttributes) return ruleAttributes;
	hasRequiredRuleAttributes = 1;
	// This module does the heavy lifting for attribute generation.
	ruleAttributes = (function exportRuleAttributes() {
	  const id = identifiers;
	  const thisFile = 'rule-attributes.js';
	  let state = null;
	  function isEmptyOnly(attr) {
	    if (attr.left || attr.nested || attr.right || attr.cyclic) {
	      return false;
	    }
	    return attr.empty;
	  }
	  function isRecursive(attr) {
	    if (attr.left || attr.nested || attr.right || attr.cyclic) {
	      return true;
	    }
	    return false;
	  }
	  function isCatNested(attrs, count) {
	    let i = 0;
	    let j = 0;
	    let k = 0;
	    /* 1. if any child is nested, CAT is nested */
	    for (i = 0; i < count; i += 1) {
	      if (attrs[i].nested) {
	        return true;
	      }
	    }
	    /* 2.) the left-most right recursive child
	               is followed by at least one non-empty child */
	    for (i = 0; i < count; i += 1) {
	      if (attrs[i].right && !attrs[i].leaf) {
	        for (j = i + 1; j < count; j += 1) {
	          if (!isEmptyOnly(attrs[j])) {
	            return true;
	          }
	        }
	      }
	    }
	    /* 3.) the right-most left recursive child
	               is preceded by at least one non-empty child */
	    for (i = count - 1; i >= 0; i -= 1) {
	      if (attrs[i].left && !attrs[i].leaf) {
	        for (j = i - 1; j >= 0; j -= 1) {
	          if (!isEmptyOnly(attrs[j])) {
	            return true;
	          }
	        }
	      }
	    }
	    /* 4. there is at lease one recursive child between
	              the left-most and right-most non-recursive, non-empty children */
	    for (i = 0; i < count; i += 1) {
	      if (!attrs[i].empty && !isRecursive(attrs[i])) {
	        for (j = i + 1; j < count; j += 1) {
	          if (isRecursive(attrs[j])) {
	            for (k = j + 1; k < count; k += 1) {
	              if (!attrs[k].empty && !isRecursive(attrs[k])) {
	                return true;
	              }
	            }
	          }
	        }
	      }
	    }

	    /* none of the above */
	    return false;
	  }
	  function isCatCyclic(attrs, count) {
	    /* if all children are cyclic, CAT is cyclic */
	    for (let i = 0; i < count; i += 1) {
	      if (!attrs[i].cyclic) {
	        return false;
	      }
	    }
	    return true;
	  }
	  function isCatLeft(attrs, count) {
	    /* if the left-most non-empty is left, CAT is left */
	    for (let i = 0; i < count; i += 1) {
	      if (attrs[i].left) {
	        return true;
	      }
	      if (!attrs[i].empty) {
	        return false;
	      }
	      /* keep looking */
	    }
	    return false; /* all left-most are empty */
	  }
	  function isCatRight(attrs, count) {
	    /* if the right-most non-empty is right, CAT is right */
	    for (let i = count - 1; i >= 0; i -= 1) {
	      if (attrs[i].right) {
	        return true;
	      }
	      if (!attrs[i].empty) {
	        return false;
	      }
	      /* keep looking */
	    }
	    return false;
	  }
	  function isCatEmpty(attrs, count) {
	    /* if all children are empty, CAT is empty */
	    for (let i = 0; i < count; i += 1) {
	      if (!attrs[i].empty) {
	        return false;
	      }
	    }
	    return true;
	  }
	  function isCatFinite(attrs, count) {
	    /* if all children are finite, CAT is finite */
	    for (let i = 0; i < count; i += 1) {
	      if (!attrs[i].finite) {
	        return false;
	      }
	    }
	    return true;
	  }
	  function cat(stateArg, opcodes, opIndex, iAttr) {
	    let i = 0;
	    const opCat = opcodes[opIndex];
	    const count = opCat.children.length;

	    /* generate an empty array of child attributes */
	    const childAttrs = [];
	    for (i = 0; i < count; i += 1) {
	      childAttrs.push(stateArg.attrGen());
	    }
	    for (i = 0; i < count; i += 1) {
	      // eslint-disable-next-line no-use-before-define
	      opEval(stateArg, opcodes, opCat.children[i], childAttrs[i]);
	    }
	    iAttr.left = isCatLeft(childAttrs, count);
	    iAttr.right = isCatRight(childAttrs, count);
	    iAttr.nested = isCatNested(childAttrs, count);
	    iAttr.empty = isCatEmpty(childAttrs, count);
	    iAttr.finite = isCatFinite(childAttrs, count);
	    iAttr.cyclic = isCatCyclic(childAttrs, count);
	  }
	  function alt(stateArg, opcodes, opIndex, iAttr) {
	    let i = 0;
	    const opAlt = opcodes[opIndex];
	    const count = opAlt.children.length;

	    /* generate an empty array of child attributes */
	    const childAttrs = [];
	    for (i = 0; i < count; i += 1) {
	      childAttrs.push(stateArg.attrGen());
	    }
	    for (i = 0; i < count; i += 1) {
	      // eslint-disable-next-line no-use-before-define
	      opEval(stateArg, opcodes, opAlt.children[i], childAttrs[i]);
	    }

	    /* if any child attribute is true, ALT is true */
	    iAttr.left = false;
	    iAttr.right = false;
	    iAttr.nested = false;
	    iAttr.empty = false;
	    iAttr.finite = false;
	    iAttr.cyclic = false;
	    for (i = 0; i < count; i += 1) {
	      if (childAttrs[i].left) {
	        iAttr.left = true;
	      }
	      if (childAttrs[i].nested) {
	        iAttr.nested = true;
	      }
	      if (childAttrs[i].right) {
	        iAttr.right = true;
	      }
	      if (childAttrs[i].empty) {
	        iAttr.empty = true;
	      }
	      if (childAttrs[i].finite) {
	        iAttr.finite = true;
	      }
	      if (childAttrs[i].cyclic) {
	        iAttr.cyclic = true;
	      }
	    }
	  }
	  function bkr(stateArg, opcodes, opIndex, iAttr) {
	    const opBkr = opcodes[opIndex];
	    if (opBkr.index >= stateArg.ruleCount) {
	      /* use UDT values */
	      iAttr.empty = stateArg.udts[opBkr.index - stateArg.ruleCount].empty;
	      iAttr.finite = true;
	    } else {
	      /* use the empty and finite values from the back referenced rule */
	      // eslint-disable-next-line no-use-before-define
	      ruleAttrsEval(stateArg, opBkr.index, iAttr);

	      /* however, this is a terminal node like TLS */
	      iAttr.left = false;
	      iAttr.nested = false;
	      iAttr.right = false;
	      iAttr.cyclic = false;
	    }
	  }

	  function opEval(stateArg, opcodes, opIndex, iAttr) {
	    stateArg.attrInit(iAttr);
	    const opi = opcodes[opIndex];
	    switch (opi.type) {
	      case id.ALT:
	        alt(stateArg, opcodes, opIndex, iAttr);
	        break;
	      case id.CAT:
	        cat(stateArg, opcodes, opIndex, iAttr);
	        break;
	      case id.REP:
	        opEval(stateArg, opcodes, opIndex + 1, iAttr);
	        if (opi.min === 0) {
	          iAttr.empty = true;
	          iAttr.finite = true;
	        }
	        break;
	      case id.RNM:
	        // eslint-disable-next-line no-use-before-define
	        ruleAttrsEval(stateArg, opcodes[opIndex].index, iAttr);
	        break;
	      case id.BKR:
	        bkr(stateArg, opcodes, opIndex, iAttr);
	        break;
	      case id.AND:
	      case id.NOT:
	      case id.BKA:
	      case id.BKN:
	        opEval(stateArg, opcodes, opIndex + 1, iAttr);
	        iAttr.empty = true;
	        break;
	      case id.TLS:
	        iAttr.empty = !opcodes[opIndex].string.length;
	        iAttr.finite = true;
	        iAttr.cyclic = false;
	        break;
	      case id.TBS:
	      case id.TRG:
	        iAttr.empty = false;
	        iAttr.finite = true;
	        iAttr.cyclic = false;
	        break;
	      case id.UDT:
	        iAttr.empty = opi.empty;
	        iAttr.finite = true;
	        iAttr.cyclic = false;
	        break;
	      case id.ABG:
	      case id.AEN:
	        iAttr.empty = true;
	        iAttr.finite = true;
	        iAttr.cyclic = false;
	        break;
	      default:
	        throw new Error(`unknown opcode type: ${opi}`);
	    }
	  }
	  // The main logic for handling rules that:
	  //  - have already be evaluated
	  //  - have not been evaluated and is the first occurrence on this branch
	  //  - second occurrence on this branch for the start rule
	  //  - second occurrence on this branch for non-start rules
	  function ruleAttrsEval(stateArg, ruleIndex, iAttr) {
	    const attri = stateArg.attrsWorking[ruleIndex];
	    if (attri.isComplete) {
	      /* just use the completed values */
	      stateArg.attrCopy(iAttr, attri);
	    } else if (!attri.isOpen) {
	      /* open the rule and traverse it */
	      attri.isOpen = true;
	      opEval(stateArg, attri.rule.opcodes, 0, iAttr);
	      /* complete this rule's attributes */
	      attri.left = iAttr.left;
	      attri.right = iAttr.right;
	      attri.nested = iAttr.nested;
	      attri.empty = iAttr.empty;
	      attri.finite = iAttr.finite;
	      attri.cyclic = iAttr.cyclic;
	      attri.leaf = false;
	      attri.isOpen = false;
	      attri.isComplete = true;
	    } else if (ruleIndex === stateArg.startRule) {
	      /* use recursive leaf values */
	      if (ruleIndex === stateArg.startRule) {
	        iAttr.left = true;
	        iAttr.right = true;
	        iAttr.cyclic = true;
	        iAttr.leaf = true;
	      }
	    } else {
	      /* non-start rule terminal leaf */
	      iAttr.finite = true;
	    }
	  }
	  // The main driver for the attribute generation.
	  const ruleAttributes = (stateArg) => {
	    state = stateArg;
	    let i = 0;
	    let j = 0;
	    const iAttr = state.attrGen();
	    for (i = 0; i < state.ruleCount; i += 1) {
	      /* initialize working attributes */
	      for (j = 0; j < state.ruleCount; j += 1) {
	        state.attrInit(state.attrsWorking[j]);
	      }
	      state.startRule = i;
	      ruleAttrsEval(state, i, iAttr);

	      /* save off the working attributes for this rule */
	      state.attrCopy(state.attrs[i], state.attrsWorking[i]);
	    }
	    state.attributesComplete = true;
	    let attri = null;
	    for (i = 0; i < state.ruleCount; i += 1) {
	      attri = state.attrs[i];
	      if (attri.left || !attri.finite || attri.cyclic) {
	        const temp = state.attrGen(attri.rule);
	        state.attrCopy(temp, attri);
	        state.attrsErrors.push(temp);
	        state.attrsErrorCount += 1;
	      }
	    }
	  };
	  const truth = (val) => (val ? 't' : 'f');
	  const tError = (val) => (val ? 'e' : 'f');
	  const fError = (val) => (val ? 't' : 'e');
	  const showAttr = (seq, index, attr, dep) => {
	    let str = `${seq}:${index}:`;
	    str += `${tError(attr.left)} `;
	    str += `${truth(attr.nested)} `;
	    str += `${truth(attr.right)} `;
	    str += `${tError(attr.cyclic)} `;
	    str += `${fError(attr.finite)} `;
	    str += `${truth(attr.empty)}:`;
	    str += `${state.typeToString(dep.recursiveType)}:`;
	    str += dep.recursiveType === id.ATTR_MR ? dep.groupNumber : '-';
	    str += `:${attr.rule.name}\n`;
	    return str;
	  };

	  const showLegend = () => {
	    let str = 'LEGEND - t=true, f=false, e=error\n';
	    str += 'sequence:rule index:left nested right cyclic finite empty:type:group number:rule name\n';
	    return str;
	  };
	  const showAttributeErrors = () => {
	    let attri = null;
	    let depi = null;
	    let str = '';
	    str += 'RULE ATTRIBUTES WITH ERRORS\n';
	    str += showLegend();
	    if (state.attrsErrorCount) {
	      for (let i = 0; i < state.attrsErrorCount; i += 1) {
	        attri = state.attrsErrors[i];
	        depi = state.ruleDeps[attri.rule.index];
	        str += showAttr(i, attri.rule.index, attri, depi);
	      }
	    } else {
	      str += '<none>\n';
	    }
	    return str;
	  };

	  const show = (type) => {
	    let i = 0;
	    let ii = 0;
	    let attri = null;
	    let depi = null;
	    let str = '';
	    let { ruleIndexes } = state;
	    // let udtIndexes = state.udtIndexes;
	    if (type === 97) {
	      ruleIndexes = state.ruleAlphaIndexes;
	      // udtIndexes = state.udtAlphaIndexes;
	    } else if (type === 116) {
	      ruleIndexes = state.ruleTypeIndexes;
	      // udtIndexes = state.udtAlphaIndexes;
	    }
	    /* show all attributes */
	    for (i = 0; i < state.ruleCount; i += 1) {
	      ii = ruleIndexes[i];
	      attri = state.attrs[ii];
	      depi = state.ruleDeps[ii];
	      str += showAttr(i, ii, attri, depi);
	    }
	    return str;
	  };

	  // Display the rule attributes.
	  // - order
	  //      - "index" or "i", index order (default)
	  //      - "alpha" or "a", alphabetical order
	  //      - "type" or "t", ordered by type (alphabetical within each type/group)
	  //      - none of above, index order (default)
	  const showAttributes = (order = 'index') => {
	    if (!state.attributesComplete) {
	      throw new Error(`${thisFile}:showAttributes: attributes not available`);
	    }
	    let str = '';
	    const leader = 'RULE ATTRIBUTES\n';
	    if (order.charCodeAt(0) === 97) {
	      str += 'alphabetical by rule name\n';
	      str += leader;
	      str += showLegend();
	      str += show(97);
	    } else if (order.charCodeAt(0) === 116) {
	      str += 'ordered by rule type\n';
	      str += leader;
	      str += showLegend();
	      str += show(116);
	    } else {
	      str += 'ordered by rule index\n';
	      str += leader;
	      str += showLegend();
	      str += show();
	    }
	    return str;
	  };

	  /* Destructuring assignment - see MDN Web Docs */
	  return { ruleAttributes, showAttributes, showAttributeErrors };
	})();
	return ruleAttributes;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var ruleDependencies;
var hasRequiredRuleDependencies;

function requireRuleDependencies () {
	if (hasRequiredRuleDependencies) return ruleDependencies;
	hasRequiredRuleDependencies = 1;
	// Determine rule dependencies and types.
	// For each rule, determine which other rules it refers to
	// and which of the other rules refer back to it.
	//
	// Rule types are:
	//  - non-recursive - the rule never refers to itself, even indirectly
	//  - recursive - the rule refers to itself, possibly indirectly
	//  - mutually-recursive - belongs to a group of two or more rules, each of which refers to every other rule in the group, including itself.
	ruleDependencies = (() => {
	  const id = identifiers;
	  let state = null; /* keep a global reference to the state for the show functions */

	  /* scan the opcodes of the indexed rule and discover which rules it references and which rule refer back to it */
	  const scan = (ruleCount, ruleDeps, index, isScanned) => {
	    let i = 0;
	    let j = 0;
	    const rdi = ruleDeps[index];
	    isScanned[index] = true;
	    const op = rdi.rule.opcodes;
	    for (i = 0; i < op.length; i += 1) {
	      const opi = op[i];
	      if (opi.type === id.RNM) {
	        rdi.refersTo[opi.index] = true;
	        if (!isScanned[opi.index]) {
	          scan(ruleCount, ruleDeps, opi.index, isScanned);
	        }
	        for (j = 0; j < ruleCount; j += 1) {
	          if (ruleDeps[opi.index].refersTo[j]) {
	            rdi.refersTo[j] = true;
	          }
	        }
	      } else if (opi.type === id.UDT) {
	        rdi.refersToUdt[opi.index] = true;
	      } else if (opi.type === id.BKR) {
	        if (opi.index < ruleCount) {
	          rdi.refersTo[opi.index] = true;
	          if (!isScanned[opi.index]) {
	            scan(ruleCount, ruleDeps, opi.index, isScanned);
	          }
	        } else {
	          rdi.refersToUdt[ruleCount - opi.index] = true;
	        }
	      }
	    }
	  };
	  // Determine the rule dependencies, types and mutually recursive groups.
	  const ruleDependencies = (stateArg) => {
	    state = stateArg; /* make it global */
	    let i = 0;
	    let j = 0;
	    let groupCount = 0;
	    let rdi = null;
	    let rdj = null;
	    let newGroup = false;
	    state.dependenciesComplete = false;

	    /* make a working array of rule scanned markers */
	    const isScanned = state.falseArray(state.ruleCount);

	    /* discover the rule dependencies */
	    for (i = 0; i < state.ruleCount; i += 1) {
	      state.falsifyArray(isScanned);
	      scan(state.ruleCount, state.ruleDeps, i, isScanned);
	    }
	    /* discover all rules referencing each rule */
	    for (i = 0; i < state.ruleCount; i += 1) {
	      for (j = 0; j < state.ruleCount; j += 1) {
	        if (i !== j) {
	          if (state.ruleDeps[j].refersTo[i]) {
	            state.ruleDeps[i].referencedBy[j] = true;
	          }
	        }
	      }
	    }
	    /* find the non-recursive and recursive types */
	    for (i = 0; i < state.ruleCount; i += 1) {
	      state.ruleDeps[i].recursiveType = id.ATTR_N;
	      if (state.ruleDeps[i].refersTo[i]) {
	        state.ruleDeps[i].recursiveType = id.ATTR_R;
	      }
	    }

	    /* find the mutually-recursive groups, if any */
	    groupCount = -1;
	    for (i = 0; i < state.ruleCount; i += 1) {
	      rdi = state.ruleDeps[i];
	      if (rdi.recursiveType === id.ATTR_R) {
	        newGroup = true;
	        for (j = 0; j < state.ruleCount; j += 1) {
	          if (i !== j) {
	            rdj = state.ruleDeps[j];
	            if (rdj.recursiveType === id.ATTR_R) {
	              if (rdi.refersTo[j] && rdj.refersTo[i]) {
	                if (newGroup) {
	                  groupCount += 1;
	                  rdi.recursiveType = id.ATTR_MR;
	                  rdi.groupNumber = groupCount;
	                  newGroup = false;
	                }
	                rdj.recursiveType = id.ATTR_MR;
	                rdj.groupNumber = groupCount;
	              }
	            }
	          }
	        }
	      }
	    }
	    state.isMutuallyRecursive = groupCount > -1;

	    /* sort the rules/UDTS */
	    state.ruleAlphaIndexes.sort(state.compRulesAlpha);
	    state.ruleTypeIndexes.sort(state.compRulesAlpha);
	    state.ruleTypeIndexes.sort(state.compRulesType);
	    if (state.isMutuallyRecursive) {
	      state.ruleTypeIndexes.sort(state.compRulesGroup);
	    }
	    if (state.udtCount) {
	      state.udtAlphaIndexes.sort(state.compUdtsAlpha);
	    }

	    state.dependenciesComplete = true;
	  };
	  const show = (type = null) => {
	    let i = 0;
	    let j = 0;
	    let count = 0;
	    let startSeg = 0;
	    const maxRule = state.ruleCount - 1;
	    const maxUdt = state.udtCount - 1;
	    const lineLength = 100;
	    let str = '';
	    let pre = '';
	    const toArrow = '=> ';
	    const byArrow = '<= ';
	    let first = false;
	    let rdi = null;
	    let { ruleIndexes } = state;
	    let { udtIndexes } = state;
	    if (type === 97) {
	      ruleIndexes = state.ruleAlphaIndexes;
	      udtIndexes = state.udtAlphaIndexes;
	    } else if (type === 116) {
	      ruleIndexes = state.ruleTypeIndexes;
	      udtIndexes = state.udtAlphaIndexes;
	    }
	    for (i = 0; i < state.ruleCount; i += 1) {
	      rdi = state.ruleDeps[ruleIndexes[i]];
	      pre = `${ruleIndexes[i]}:${state.typeToString(rdi.recursiveType)}:`;
	      if (state.isMutuallyRecursive) {
	        pre += rdi.groupNumber > -1 ? rdi.groupNumber : '-';
	        pre += ':';
	      }
	      pre += ' ';
	      str += `${pre + state.rules[ruleIndexes[i]].name}\n`;
	      first = true;
	      count = 0;
	      startSeg = str.length;
	      str += pre;
	      for (j = 0; j < state.ruleCount; j += 1) {
	        if (rdi.refersTo[ruleIndexes[j]]) {
	          if (first) {
	            str += toArrow;
	            first = false;
	            str += state.ruleDeps[ruleIndexes[j]].rule.name;
	          } else {
	            str += `, ${state.ruleDeps[ruleIndexes[j]].rule.name}`;
	          }
	          count += 1;
	        }
	        if (str.length - startSeg > lineLength && j !== maxRule) {
	          str += `\n${pre}${toArrow}`;
	          startSeg = str.length;
	        }
	      }
	      if (state.udtCount) {
	        for (j = 0; j < state.udtCount; j += 1) {
	          if (rdi.refersToUdt[udtIndexes[j]]) {
	            if (first) {
	              str += toArrow;
	              first = false;
	              str += state.udts[udtIndexes[j]].name;
	            } else {
	              str += `, ${state.udts[udtIndexes[j]].name}`;
	            }
	            count += 1;
	          }
	          if (str.length - startSeg > lineLength && j !== maxUdt) {
	            str += `\n${pre}${toArrow}`;
	            startSeg = str.length;
	          }
	        }
	      }
	      if (count === 0) {
	        str += '=> <none>\n';
	      }
	      if (first === false) {
	        str += '\n';
	      }
	      first = true;
	      count = 0;
	      startSeg = str.length;
	      str += pre;
	      for (j = 0; j < state.ruleCount; j += 1) {
	        if (rdi.referencedBy[ruleIndexes[j]]) {
	          if (first) {
	            str += byArrow;
	            first = false;
	            str += state.ruleDeps[ruleIndexes[j]].rule.name;
	          } else {
	            str += `, ${state.ruleDeps[ruleIndexes[j]].rule.name}`;
	          }
	          count += 1;
	        }
	        if (str.length - startSeg > lineLength && j !== maxRule) {
	          str += `\n${pre}${toArrow}`;
	          startSeg = str.length;
	        }
	      }
	      if (count === 0) {
	        str += '<= <none>\n';
	      }
	      if (first === false) {
	        str += '\n';
	      }
	      str += '\n';
	    }
	    return str;
	  };
	  // Display the rule dependencies.
	  // - order
	  //      - "index" or "i", index order (default)
	  //      - "alpha" or "a", alphabetical order
	  //      - "type" or "t", ordered by type (alphabetical within each type/group)
	  //      - none of above, index order (default)
	  const showRuleDependencies = (order = 'index') => {
	    let str = 'RULE DEPENDENCIES(index:type:[group number:])\n';
	    str += '=> refers to rule names\n';
	    str += '<= referenced by rule names\n';
	    if (!state.dependenciesComplete) {
	      return str;
	    }

	    if (order.charCodeAt(0) === 97) {
	      str += 'alphabetical by rule name\n';
	      str += show(97);
	    } else if (order.charCodeAt(0) === 116) {
	      str += 'ordered by rule type\n';
	      str += show(116);
	    } else {
	      str += 'ordered by rule index\n';
	      str += show(null);
	    }
	    return str;
	  };

	  /* Destructuring assignment - see MDN Web Docs */
	  return { ruleDependencies, showRuleDependencies };
	})();
	return ruleDependencies;
}

/* eslint-disable class-methods-use-this */

var attributes;
var hasRequiredAttributes;

function requireAttributes () {
	if (hasRequiredAttributes) return attributes;
	hasRequiredAttributes = 1;
	/*  *************************************************************************************
	 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
	 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
	 *   ********************************************************************************* */
	// Attributes Validation
	//
	// It is well known that recursive-descent parsers will fail if a rule is left recursive.
	// Besides left recursion, there are a couple of other fatal attributes that need to be disclosed as well.
	// There are several non-fatal attributes that are of interest also.
	// This module will determine six different attributes listed here with simple examples.
	//
	// **fatal attributes**<br>
	// left recursion<br>
	// S = S "x" / "y"
	//
	// cyclic<br>
	// S = S
	//
	// infinite<br>
	// S = "y" S
	//
	// **non-fatal attributes** (but nice to know)<br>
	// nested recursion<br>
	// S = "a" S "b" / "y"
	//
	// right recursion<br>
	// S = "x" S / "y"
	//
	// empty string<br>
	// S = "x" S / ""
	//
	// Note that these are “aggregate” attributes, in that if the attribute is true it only means that it can be true,
	// not that it will always be true for every input string.
	// In the simple examples above the attributes may be obvious and definite – always true or false.
	// However, for a large grammar with possibly hundreds of rules and parse tree branches,
	// it can be obscure which branches lead to which attributes.
	// Furthermore, different input strings will lead the parser down different branches.
	// One input string may parse perfectly while another will hit a left-recursive branch and bottom out the call stack.
	//
	// It is for this reason that the APG parser generator computes these attributes.
	// When using the API the attributes call is optional but generating a parser without checking the attributes - proceed at your own peril.
	//
	// Additionally, the attribute phase will identify rule dependencies and mutually-recursive groups. For example,
	//
	// S = "a" A "b" / "y"<br>
	// A = "x"
	//
	// S is dependent on A but A is not dependent on S.
	//
	// S = "a" A "b" / "c"<br>
	// A = "x" S "y" / "z"
	//
	// S and A are dependent on one another and are mutually recursive.
	attributes = (function exportAttributes() {
	  const id = identifiers;
	  const { ruleAttributes, showAttributes, showAttributeErrors } = requireRuleAttributes();
	  const { ruleDependencies, showRuleDependencies } = requireRuleDependencies();
	  class State {
	    constructor(rules, udts) {
	      this.rules = rules;
	      this.udts = udts;
	      this.ruleCount = rules.length;
	      this.udtCount = udts.length;
	      this.startRule = 0;
	      this.dependenciesComplete = false;
	      this.attributesComplete = false;
	      this.isMutuallyRecursive = false;
	      this.ruleIndexes = this.indexArray(this.ruleCount);
	      this.ruleAlphaIndexes = this.indexArray(this.ruleCount);
	      this.ruleTypeIndexes = this.indexArray(this.ruleCount);
	      this.udtIndexes = this.indexArray(this.udtCount);
	      this.udtAlphaIndexes = this.indexArray(this.udtCount);
	      this.attrsErrorCount = 0;
	      this.attrs = [];
	      this.attrsErrors = [];
	      this.attrsWorking = [];
	      this.ruleDeps = [];
	      for (let i = 0; i < this.ruleCount; i += 1) {
	        this.attrs.push(this.attrGen(this.rules[i]));
	        this.attrsWorking.push(this.attrGen(this.rules[i]));
	        this.ruleDeps.push(this.rdGen(rules[i], this.ruleCount, this.udtCount));
	      }
	      this.compRulesAlpha = this.compRulesAlpha.bind(this);
	      this.compUdtsAlpha = this.compUdtsAlpha.bind(this);
	      this.compRulesType = this.compRulesType.bind(this);
	      this.compRulesGroup = this.compRulesGroup.bind(this);
	    }

	    // eslint-disable-next-line class-methods-use-this
	    attrGen(rule) {
	      return {
	        left: false,
	        nested: false,
	        right: false,
	        empty: false,
	        finite: false,
	        cyclic: false,
	        leaf: false,
	        isOpen: false,
	        isComplete: false,
	        rule,
	      };
	    }

	    // eslint-disable-next-line class-methods-use-this
	    attrInit(attr) {
	      attr.left = false;
	      attr.nested = false;
	      attr.right = false;
	      attr.empty = false;
	      attr.finite = false;
	      attr.cyclic = false;
	      attr.leaf = false;
	      attr.isOpen = false;
	      attr.isComplete = false;
	    }

	    attrCopy(dst, src) {
	      dst.left = src.left;
	      dst.nested = src.nested;
	      dst.right = src.right;
	      dst.empty = src.empty;
	      dst.finite = src.finite;
	      dst.cyclic = src.cyclic;
	      dst.leaf = src.leaf;
	      dst.isOpen = src.isOpen;
	      dst.isComplete = src.isComplete;
	      dst.rule = src.rule;
	    }

	    rdGen(rule, ruleCount, udtCount) {
	      const ret = {
	        rule,
	        recursiveType: id.ATTR_N,
	        groupNumber: -1,
	        refersTo: this.falseArray(ruleCount),
	        refersToUdt: this.falseArray(udtCount),
	        referencedBy: this.falseArray(ruleCount),
	      };
	      return ret;
	    }

	    typeToString(recursiveType) {
	      switch (recursiveType) {
	        case id.ATTR_N:
	          return ' N';
	        case id.ATTR_R:
	          return ' R';
	        case id.ATTR_MR:
	          return 'MR';
	        default:
	          return 'UNKNOWN';
	      }
	    }

	    falseArray(length) {
	      const ret = [];
	      if (length > 0) {
	        for (let i = 0; i < length; i += 1) {
	          ret.push(false);
	        }
	      }
	      return ret;
	    }

	    falsifyArray(a) {
	      for (let i = 0; i < a.length; i += 1) {
	        a[i] = false;
	      }
	    }

	    indexArray(length) {
	      const ret = [];
	      if (length > 0) {
	        for (let i = 0; i < length; i += 1) {
	          ret.push(i);
	        }
	      }
	      return ret;
	    }

	    compRulesAlpha(left, right) {
	      if (this.rules[left].lower < this.rules[right].lower) {
	        return -1;
	      }
	      if (this.rules[left].lower > this.rules[right].lower) {
	        return 1;
	      }
	      return 0;
	    }

	    compUdtsAlpha(left, right) {
	      if (this.udts[left].lower < this.udts[right].lower) {
	        return -1;
	      }
	      if (this.udts[left].lower > this.udts[right].lower) {
	        return 1;
	      }
	      return 0;
	    }

	    compRulesType(left, right) {
	      if (this.ruleDeps[left].recursiveType < this.ruleDeps[right].recursiveType) {
	        return -1;
	      }
	      if (this.ruleDeps[left].recursiveType > this.ruleDeps[right].recursiveType) {
	        return 1;
	      }
	      return 0;
	    }

	    compRulesGroup(left, right) {
	      if (this.ruleDeps[left].recursiveType === id.ATTR_MR && this.ruleDeps[right].recursiveType === id.ATTR_MR) {
	        if (this.ruleDeps[left].groupNumber < this.ruleDeps[right].groupNumber) {
	          return -1;
	        }
	        if (this.ruleDeps[left].groupNumber > this.ruleDeps[right].groupNumber) {
	          return 1;
	        }
	      }
	      return 0;
	    }
	  }
	  // eslint-disable-next-line no-unused-vars
	  const attributes = function attributes(rules = [], udts = [], lineMap = [], errors = []) {
	    // let i = 0;
	    // Initialize the state. The state of the computation get passed around to multiple functions in multiple files.
	    const state = new State(rules, udts);

	    // Determine all rule dependencies
	    //  - which rules each rule refers to
	    //  - which rules reference each rule
	    ruleDependencies(state);

	    // Determine the attributes for each rule.
	    ruleAttributes(state);
	    if (state.attrsErrorCount) {
	      errors.push({ line: 0, char: 0, msg: `${state.attrsErrorCount} attribute errors` });
	    }

	    // Return the number of attribute errors to the caller.
	    return state.attrsErrorCount;
	  };

	  /* Destructuring assignment - see MDN Web Docs */
	  return { attributes, showAttributes, showAttributeErrors, showRuleDependencies };
	})();
	return attributes;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var showRules;
var hasRequiredShowRules;

function requireShowRules () {
	if (hasRequiredShowRules) return showRules;
	hasRequiredShowRules = 1;
	showRules = (function exfn() {
	  const thisFileName = 'show-rules.js';
	  // Display the rules.
	  // This function may be called before the attributes calculation.
	  // Sorting is done independently from the attributes.
	  // - order
	  //      - "index" or "i", index order (default)
	  //      - "alpha" or "a", alphabetical order
	  //      - none of above, index order (default)
	  const showRules = function showRules(rulesIn = [], udtsIn = [], order = 'index') {
	    const thisFuncName = 'showRules';
	    let alphaArray = [];
	    let udtAlphaArray = [];
	    const indexArray = [];
	    const udtIndexArray = [];
	    const rules = rulesIn;
	    const udts = udtsIn;
	    const ruleCount = rulesIn.length;
	    const udtCount = udtsIn.length;
	    let str = 'RULE/UDT NAMES';
	    let i;
	    function compRulesAlpha(left, right) {
	      if (rules[left].lower < rules[right].lower) {
	        return -1;
	      }
	      if (rules[left].lower > rules[right].lower) {
	        return 1;
	      }
	      return 0;
	    }
	    function compUdtsAlpha(left, right) {
	      if (udts[left].lower < udts[right].lower) {
	        return -1;
	      }
	      if (udts[left].lower > udts[right].lower) {
	        return 1;
	      }
	      return 0;
	    }
	    if (!(Array.isArray(rulesIn) && rulesIn.length)) {
	      throw new Error(`${thisFileName}:${thisFuncName}: rules arg must be array with length > 0`);
	    }
	    if (!Array.isArray(udtsIn)) {
	      throw new Error(`${thisFileName}:${thisFuncName}: udts arg must be array`);
	    }

	    for (i = 0; i < ruleCount; i += 1) {
	      indexArray.push(i);
	    }
	    alphaArray = indexArray.slice(0);
	    alphaArray.sort(compRulesAlpha);
	    if (udtCount) {
	      for (i = 0; i < udtCount; i += 1) {
	        udtIndexArray.push(i);
	      }
	      udtAlphaArray = udtIndexArray.slice(0);
	      udtAlphaArray.sort(compUdtsAlpha);
	    }
	    if (order.charCodeAt(0) === 97) {
	      str += ' - alphabetical by rule/UDT name\n';
	      for (i = 0; i < ruleCount; i += 1) {
	        str += `${i}: ${alphaArray[i]}: ${rules[alphaArray[i]].name}\n`;
	      }
	      if (udtCount) {
	        for (i = 0; i < udtCount; i += 1) {
	          str += `${i}: ${udtAlphaArray[i]}: ${udts[udtAlphaArray[i]].name}\n`;
	        }
	      }
	    } else {
	      str += ' - ordered by rule/UDT index\n';
	      for (i = 0; i < ruleCount; i += 1) {
	        str += `${i}: ${rules[i].name}\n`;
	      }
	      if (udtCount) {
	        for (i = 0; i < udtCount; i += 1) {
	          str += `${i}: ${udts[i].name}\n`;
	        }
	      }
	    }
	    return str;
	  };
	  return showRules;
	})();
	return showRules;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// This module is Application Programming Interface (API) for **APG** - the ABNF Parser Generator.
//
// *Note on teminology.*
// APG is a parser generator.
// However, it really only generates a "grammar object" (see below) from the defining SABNF grammar.
// The generated parser is incomplete at this stage.
// Remaining, it is the job of the user to develop the generated parser from the grammar object and the **APG** Library (**apg-lib**).
//
// The following terminology my help clear up any confusion between the idea of a "generated parser" versus a "generated grammar object".

// - The generating parser: **APG** is an **APG** parser (yes, there is a circular dependence between **apg-api** and **apg-lib**). We'll call it the generating parser.
// - The target parser: **APG**'s goal is to generate a parser. We'll call it the target parser.
// - The target grammar: this is the (ASCII) SABNF grammar defining the target parser.
// - The target grammar object: **APG** parses the SABNF grammar and generates the JavaScript source for a target grammar object constructor function
// and/or an actual grammar object.
// - The final target parser: The user then develops the final target parser using the generated target grammar
// object and the **APG** parsing library, **apg-lib**.
// Throws execeptions on fatal errors.
//
// src: the input SABNF grammar<br>
// may be one of:
// - Buffer of bytes
// - JavaScript string
// - Array of integer character codes
var api = function api(src) {
  const { Buffer } = require$$0$1;
  const thisFileName = 'api.js: ';
  const thisObject = this;

  /* PRIVATE PROPERTIES */
  const apglib = nodeExports$1;
  const converter$1 = converter;
  const scanner = requireScanner();
  const parser = new (requireParser())();
  const { attributes, showAttributes, showAttributeErrors, showRuleDependencies } = requireAttributes();
  const showRules = requireShowRules();

  /* PRIVATE MEMBERS (FUNCTIONS) */
  /* Convert a phrase (array of character codes) to HTML. */
  const abnfToHtml = function abnfToHtml(chars, beg, len) {
    const NORMAL = 0;
    const CONTROL = 1;
    const INVALID = 2;
    const CONTROL_BEG = `<span class="${apglib.style.CLASS_CTRLCHAR}">`;
    const CONTROL_END = '</span>';
    const INVALID_BEG = `<span class="${apglib.style.CLASS_NOMATCH}">`;
    const INVALID_END = '</span>';
    let end;
    let html = '';
    const TRUE = true;
    while (TRUE) {
      if (!Array.isArray(chars) || chars.length === 0) {
        break;
      }
      if (typeof beg !== 'number') {
        throw new Error('abnfToHtml: beg must be type number');
      }
      if (beg >= chars.length) {
        break;
      }
      if (typeof len !== 'number' || beg + len >= chars.length) {
        end = chars.length;
      } else {
        end = beg + len;
      }
      let state = NORMAL;
      for (let i = beg; i < end; i += 1) {
        const ch = chars[i];
        if (ch >= 32 && ch <= 126) {
          /* normal - printable ASCII characters */
          if (state === CONTROL) {
            html += CONTROL_END;
            state = NORMAL;
          } else if (state === INVALID) {
            html += INVALID_END;
            state = NORMAL;
          }
          /* handle reserved HTML entity characters */
          switch (ch) {
            case 32:
              html += '&nbsp;';
              break;
            case 60:
              html += '&lt;';
              break;
            case 62:
              html += '&gt;';
              break;
            case 38:
              html += '&amp;';
              break;
            case 34:
              html += '&quot;';
              break;
            case 39:
              html += '&#039;';
              break;
            case 92:
              html += '&#092;';
              break;
            default:
              html += String.fromCharCode(ch);
              break;
          }
        } else if (ch === 9 || ch === 10 || ch === 13) {
          /* control characters */
          if (state === NORMAL) {
            html += CONTROL_BEG;
            state = CONTROL;
          } else if (state === INVALID) {
            html += INVALID_END + CONTROL_BEG;
            state = CONTROL;
          }
          if (ch === 9) {
            html += 'TAB';
          }
          if (ch === 10) {
            html += 'LF';
          }
          if (ch === 13) {
            html += 'CR';
          }
        } else {
          /* invalid characters */
          if (state === NORMAL) {
            html += INVALID_BEG;
            state = INVALID;
          } else if (state === CONTROL) {
            html += CONTROL_END + INVALID_BEG;
            state = INVALID;
          }
          /* display character as hexadecimal value */
          html += `\\x${apglib.utils.charToHex(ch)}`;
        }
      }
      if (state === INVALID) {
        html += INVALID_END;
      }
      if (state === CONTROL) {
        html += CONTROL_END;
      }
      break;
    }
    return html;
  };
  /* Convert a phrase (array of character codes) to ASCII text. */
  const abnfToAscii = function abnfToAscii(chars, beg, len) {
    let str = '';
    for (let i = beg; i < beg + len; i += 1) {
      const ch = chars[i];
      if (ch >= 32 && ch <= 126) {
        str += String.fromCharCode(ch);
      } else {
        switch (ch) {
          case 9:
            str += '\\t';
            break;
          case 10:
            str += '\\n';
            break;
          case 13:
            str += '\\r';
            break;
          default:
            str += '\\unknown';
            break;
        }
      }
    }
    return str;
  };
  /* translate lines (SABNF grammar) to ASCII text */
  const linesToAscii = function linesToAscii(lines) {
    let str = 'Annotated Input Grammar';
    lines.forEach((val) => {
      str += '\n';
      str += `line no: ${val.lineNo}`;
      str += ` : char index: ${val.beginChar}`;
      str += ` : length: ${val.length}`;
      str += ` : abnf: ${abnfToAscii(thisObject.chars, val.beginChar, val.length)}`;
    });
    str += '\n';
    return str;
  };
  /* translate lines (SABNF grammar) to HTML */
  const linesToHtml = function linesToHtml(lines) {
    let html = '';
    html += `<table class="${apglib.style.CLASS_GRAMMAR}">\n`;
    const title = 'Annotated Input Grammar';
    html += `<caption>${title}</caption>\n`;
    html += '<tr>';
    html += '<th>line<br>no.</th><th>first<br>char</th><th><br>length</th><th><br>text</th>';
    html += '</tr>\n';
    lines.forEach((val) => {
      html += '<tr>';
      html += `<td>${val.lineNo}`;
      html += `</td><td>${val.beginChar}`;
      html += `</td><td>${val.length}`;
      html += `</td><td>${abnfToHtml(thisObject.chars, val.beginChar, val.length)}`;
      html += '</td>';
      html += '</tr>\n';
    });

    html += '</table>\n';
    return html;
  };
  /* Format the error messages to HTML, for page display. */
  const errorsToHtml = function errorsToHtml(errors, lines, chars, title) {
    const [style] = apglib;
    let html = '';
    const errorArrow = `<span class="${style.CLASS_NOMATCH}">&raquo;</span>`;
    html += `<p><table class="${style.CLASS_GRAMMAR}">\n`;
    if (title && typeof title === 'string') {
      html += `<caption>${title}</caption>\n`;
    }
    html += '<tr><th>line<br>no.</th><th>line<br>offset</th><th>error<br>offset</th><th><br>text</th></tr>\n';
    errors.forEach((val) => {
      let line;
      let relchar;
      let beg;
      let end;
      let text;
      let prefix = '';
      let suffix = '';
      if (lines.length === 0) {
        text = errorArrow;
        relchar = 0;
      } else {
        line = lines[val.line];
        beg = line.beginChar;
        if (val.char > beg) {
          prefix = abnfToHtml(chars, beg, val.char - beg);
        }
        beg = val.char;
        end = line.beginChar + line.length;
        if (beg < end) {
          suffix = abnfToHtml(chars, beg, end - beg);
        }
        text = prefix + errorArrow + suffix;
        relchar = val.char - line.beginChar;
        html += '<tr>';
        html += `<td>${val.line}</td><td>${line.beginChar}</td><td>${relchar}</td><td>${text}</td>`;
        html += '</tr>\n';
        html += '<tr>';
        html += `<td colspan="3"></td><td>&uarr;:&nbsp;${apglib.utils.stringToAsciiHtml(val.msg)}</td>`;
        html += '</tr>\n';
      }
    });
    html += '</table></p>\n';
    return html;
  };
  /* Display an array of errors in ASCII text */
  const errorsToAscii = function errorsToAscii(errors, lines, chars) {
    let str;
    let line;
    let beg;
    let len;
    str = '';
    errors.forEach((error) => {
      line = lines[error.line];
      str += `${line.lineNo}: `;
      str += `${line.beginChar}: `;
      str += `${error.char - line.beginChar}: `;
      beg = line.beginChar;
      len = error.char - line.beginChar;
      str += abnfToAscii(chars, beg, len);
      str += ' >> ';
      beg = error.char;
      len = line.beginChar + line.length - error.char;
      str += abnfToAscii(chars, beg, len);
      str += '\n';
      str += `${line.lineNo}: `;
      str += `${line.beginChar}: `;
      str += `${error.char - line.beginChar}: `;
      str += 'error: ';
      str += error.msg;
      str += '\n';
    });
    return str;
  };
  let isScanned = false;
  let isParsed = false;
  let isTranslated = false;
  let haveAttributes = false;
  let attributeErrors = 0;
  let lineMap;

  /* PUBLIC PROPERTIES */
  // The input SABNF grammar as a JavaScript string.
  // this.sabnf;
  // The input SABNF grammar as an array of character codes.
  // this.chars;
  // An array of line objects, defining each line of the input SABNF grammar
  // - lineNo : the zero-based line number
  // - beginChar : offset (into `this.chars`) of the first character in the line
  // - length : the number of characters in the line
  // - textLength : the number of characters of text in the line, excluding the line ending characters
  // - endType : "CRLF", "LF", "CR" or "none" if the last line has no line ending characters
  // - invalidChars : `true` if the line contains invalid characters, `false` otherwise
  // this.lines;
  // An array of rule names and data.
  // - name : the rule name
  // - lower : the rule name in lower case
  // - index : the index of the rule (ordered by appearance in SABNF grammar)
  // - isBkr : `true` if this rule has been back referenced, `false` otherwise
  // - opcodes : array of opcodes for this rule
  // - attrs : the rule attributes
  // - ctrl : system data
  // this.rules;
  // An array of UDT names and data.
  // this.udts;
  // An array of errors, if any.
  // - line : the line number containing the error
  // - char : the character offset of the error
  // - msg : the error message
  this.errors = [];

  /* CONSTRUCTOR */
  if (Buffer.isBuffer(src)) {
    this.chars = converter$1.decode('BINARY', src);
  } else if (Array.isArray(src)) {
    this.chars = src.slice();
  } else if (typeof src === 'string') {
    this.chars = converter$1.decode('STRING', src);
  } else {
    throw new Error(`${thisFileName}input source is not a string, byte Buffer or character array`);
  }
  this.sabnf = converter$1.encode('STRING', this.chars);

  /* PUBLIC MEMBERS (FUNCTIONS) */
  // Scan the input SABNF grammar for invalid characters and catalog the lines via `this.lines`.
  // - strict : (optional) if `true`, all lines, including the last must end with CRLF (\r\n),
  // if `false` (in any JavaScript sense) then line endings may be any mix of CRLF, LF, CR, or end-of-file.
  // - trace (*) : (optional) a parser trace object, which will trace the parser that does the scan
  this.scan = function scan(strict, trace) {
    this.lines = scanner(this.chars, this.errors, strict, trace);
    isScanned = true;
  };
  // Parse the input SABNF grammar for correct syntax.
  // - strict : (optional) if `true`, the input grammar must be strict ABNF, conforming to [RFC 5234](https://tools.ietf.org/html/rfc5234)
  // and [RFC 7405](https://tools.ietf.org/html/rfc7405). No superset features allowed.
  // - trace (\*) : (optional) a parser trace object, which will trace the syntax parser
  //
  // <i>(*)NOTE: the trace option was used primarily during development.
  // Error detection and reporting is now fairly robust and tracing should be unnecessary. Use at your own peril.</i>
  this.parse = function parse(strict, lite, trace) {
    if (!isScanned) {
      throw new Error(`${thisFileName}grammar not scanned`);
    }
    parser.syntax(this.chars, this.lines, this.errors, strict, lite, trace);
    isParsed = true;
  };
  // Translate the SABNF grammar syntax into the opcodes that will guide the parser for this grammar.
  this.translate = function translate() {
    if (!isParsed) {
      throw new Error(`${thisFileName}grammar not scanned and parsed`);
    }
    const ret = parser.semantic(this.chars, this.lines, this.errors);
    if (this.errors.length === 0) {
      this.rules = ret.rules;
      this.udts = ret.udts;
      lineMap = ret.lineMap;
      isTranslated = true;
    }
  };
  // Compute the attributes of each rule.
  this.attributes = function attrs() {
    if (!isTranslated) {
      throw new Error(`${thisFileName}grammar not scanned, parsed and translated`);
    }
    attributeErrors = attributes(this.rules, this.udts, lineMap, this.errors);
    haveAttributes = true;
    return attributeErrors;
  };
  // This function will perform the full suite of steps required to generate a parser grammar object
  // from the input SABNF grammar.
  this.generate = function generate(strict) {
    this.lines = scanner(this.chars, this.errors, strict);
    if (this.errors.length) {
      return;
    }
    parser.syntax(this.chars, this.lines, this.errors, strict);
    if (this.errors.length) {
      return;
    }
    const ret = parser.semantic(this.chars, this.lines, this.errors);
    if (this.errors.length) {
      return;
    }
    this.rules = ret.rules;
    this.udts = ret.udts;
    lineMap = ret.lineMap;

    attributeErrors = attributes(this.rules, this.udts, lineMap, this.errors);
    haveAttributes = true;
  };
  // Display the rules.
  // Must scan, parse and translate before calling this function, otherwise there are no rules to display.
  // - order
  //      - "index" or "i", index order (default)
  //      - "alpha" or "a", alphabetical order
  //      - none of above, index order (default)
  this.displayRules = function displayRules(order = 'index') {
    if (!isTranslated) {
      throw new Error(`${thisFileName}grammar not scanned, parsed and translated`);
    }
    return showRules(this.rules, this.udts, order);
  };
  // Display the rule dependencies.
  // Must scan, parse, translate and compute attributes before calling this function.
  // Otherwise the rule dependencies are not known.
  // - order
  //      - "index" or "i", index order (default)
  //      - "alpha" or "a", alphabetical order
  //      - "type" or "t", ordered by type (alphabetical within each type/group)
  //      - none of above, index order (default)
  this.displayRuleDependencies = function displayRuleDependencies(order = 'index') {
    if (!haveAttributes) {
      throw new Error(`${thisFileName}no attributes - must be preceeded by call to attributes()`);
    }
    return showRuleDependencies(order);
  };
  // Display the attributes.
  // Must scan, parse, translate and compute attributes before calling this function.
  // - order
  //      - "index" or "i", index order (default)
  //      - "alpha" or "a", alphabetical order
  //      - "type" or "t", ordered by type (alphabetical within each type/group)
  //      - none of above, type order (default)
  this.displayAttributes = function displayAttributes(order = 'index') {
    if (!haveAttributes) {
      throw new Error(`${thisFileName}no attributes - must be preceeded by call to attributes()`);
    }
    if (attributeErrors) {
      showAttributeErrors(order);
    }
    return showAttributes(order);
  };
  this.displayAttributeErrors = function displayAttributeErrors() {
    if (!haveAttributes) {
      throw new Error(`${thisFileName}no attributes - must be preceeded by call to attributes()`);
    }
    return showAttributeErrors();
  };
  // Returns a parser grammar object constructor function as a JavaScript string.
  // This object can then be used to construct a parser.
  this.toSource = function toSource(config = undefined) {
    if (!haveAttributes) {
      throw new Error(`${thisFileName}can't generate parser source - must be preceeded by call to attributes()`);
    }
    if (attributeErrors) {
      throw new Error(`${thisFileName}can't generate parser source - attributes have ${attributeErrors} errors`);
    }
    return parser.generateSource(this.chars, this.lines, this.rules, this.udts, config);
  };
  // Returns a parser grammar object.
  // This grammar object may be used by the application to construct a parser.
  this.toObject = function toObject() {
    if (!haveAttributes) {
      throw new Error(`${thisFileName}can't generate parser source - must be preceeded by call to attributes()`);
    }
    if (attributeErrors) {
      throw new Error(`${thisFileName}can't generate parser source - attributes have ${attributeErrors} errors`);
    }
    return parser.generateObject(this.sabnf, this.rules, this.udts);
  };
  // Display errors in text format, suitable for `console.log()`.
  this.errorsToAscii = function errorsToAsciiFunc() {
    return errorsToAscii(this.errors, this.lines, this.chars);
  };
  // Display errors in HTML format, suitable for web page display.
  // (`apg-lib.css` required for proper styling)
  this.errorsToHtml = function errorsToHtmlFunc(title) {
    return errorsToHtml(this.errors, this.lines, this.chars, title);
  };
  // Generate an annotated the SABNF grammar display in text format.
  this.linesToAscii = function linesToAsciiFunc() {
    return linesToAscii(this.lines);
  };
  // Generate an annotated the SABNF grammar display in HTML format.
  // (`apg-lib.css` required for proper styling)
  this.linesToHtml = function linesToHtmlFunc() {
    return linesToHtml(this.lines);
  };
  // This function was only used by apg.html which has been abandoned.
  /*
    this.getAttributesObject = function () {
        return null;
    };
    */
};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var commandLine;
var hasRequiredCommandLine;

function requireCommandLine () {
	if (hasRequiredCommandLine) return commandLine;
	hasRequiredCommandLine = 1;
	// This module processes the command line arguments into a completed configuration
	// and returns a `config` object.
	// It takes the  `node` command line arguments less the first two. e.g. `process.argv.slice(2)`
	// and can be a free mix of keys and key/value pairs.
	//
	// Run<br>
	// `npm run apg -- --help`<br>
	// or<br>
	// `./bin/apg.sh -- help`<br>
	// to see all the options.
	commandLine = function commandLine(args) {
	  const fs = require$$0$2;
	  const path = require$$1$1;
	  const { Buffer } = require$$0$1;
	  const converter$1 = converter;
	  const helpScreen = function helpScreen(helpArgs) {
	    let help = 'Usage: apg options\n';
	    let options = '';
	    helpArgs.forEach((arg) => {
	      options += `${arg} `;
	    });
	    help += `options: ${options}\n`;
	    help += '-h, --help                 : print this help screen\n';
	    help += '-v, --version              : display version information\n';
	    help += '-s, --strict               : only ABNF grammar (RFC 5234 & 7405) allowed, no Superset features\n';
	    help += '-l, --lite                 : generate an apg-lite ES Modules grammar object*\n';
	    help += '-t, --typescript           : generate a typescript grammar object*\n';
	    help += '-i <path>[,<path>[,...]]   : input file(s)**\n';
	    help += '--in=<path>[,<path>[,...]] : input file(s)**\n';
	    help += '-o <path>                  : output filename***\n';
	    help += '--out=<path>               : output filename***\n';
	    help += '-n <function name>         : the grammar function name****\n';
	    help += '--name=<function name>     : the grammar function name****\n';
	    help += '--display-rules            : display the rule names\n';
	    help += '--display-rule-dependencies: display => rules referenced <= rules referring to this rule\n';
	    help += '--display-attributes       : display the attributes\n';
	    help += '\n';
	    help += 'Options are case insensitive.\n';
	    help += '*   --typescript - a typescript grammar object is exported with\n';
	    help += '        export function grammar(){}\n';
	    help += '*   --lite - an apg-lite ES Modules grammar object is exported with\n';
	    help += '        export default function grammar(){}\n';
	    help += '    --typescript and --lite are mutually exclusive and\n';
	    help += '    --typescript superceeds --lite if both are specified.\n';
	    help += '    If neither are specified a CommonJS object is exported with.\n';
	    help += '        module.exports = function grammar(){}\n';
	    help += '**  Multiple input files allowed.\n';
	    help += '    Multiple file names must be comma separated with no spaces.\n';
	    help += '    File names from multiple input options are concatenated.\n';
	    help += '    Content of all resulting input files is concatenated.\n';
	    help += '*** Output file name is optional.\n';
	    help += '    If no output file name is given, no parser is generated.\n';
	    help += '    If the output file name is specified, the existing extension,\n';
	    help += '    if any, is stripped and ".js" is added unless the --typescript option\n';
	    help += '    is present in which case ".ts" is added.\n';
	    help += '****If --name=fname is present, a named function is created\n';
	    help += '      const fname = function grammar(){}\n';
	    help += '    typically for scripting directly into a web page.\n';
	    help += '    \n';
	    return help;
	  };
	  const version = function version() {
	    return 'JavaScript APG, version 4.4.0\nCopyright (C) 2024 Lowell D. Thomas, all rights reserved\n';
	  };
	  const STRICTL = '--strict';
	  const STRICTS = '-s';
	  const LITEL = '--lite';
	  const LITES = '-l';
	  const TYPEL = '--typescript';
	  const TYPES = '-t';
	  const HELPL = '--help';
	  const HELPS = '-h';
	  const VERSIONL = '--version';
	  const VERSIONS = '-v';
	  const DISPLAY_RULES = '--display-rules';
	  const DISPLAY_RULE_DEPENDENCIES = '--display-rule-dependencies';
	  const DISPLAY_ATTRIBUTES = '--display-attributes';
	  const INL = '--in';
	  const INS = '-i';
	  const OUTL = '--out';
	  const OUTS = '-o';
	  const NAMEL = '--name';
	  const NAMES = '-n';
	  let inFilenames = [];
	  const config = {
	    help: '',
	    version: '',
	    error: '',
	    strict: false,
	    lite: false,
	    typescript: false,
	    noAttrs: false,
	    displayRules: false,
	    displayRuleDependencies: false,
	    displayAttributes: false,
	    src: null,
	    outFilename: '',
	    outfd: process.stdout.fd,
	    funcName: null,
	  };
	  let key;
	  let value;
	  let i = 0;
	  try {
	    while (i < args.length) {
	      const kv = args[i].split('=');
	      if (kv.length === 2) {
	        key = kv[0].toLowerCase();
	        // eslint-disable-next-line prefer-destructuring
	        value = kv[1];
	      } else if (kv.length === 1) {
	        key = kv[0].toLowerCase();
	        value = i + 1 < args.length ? args[i + 1] : '';
	      } else {
	        throw new Error(`command line error: ill-formed option: ${args[i]}`);
	      }
	      switch (key) {
	        case HELPL:
	        case HELPS:
	          config.help = helpScreen(args);
	          return config;
	        case VERSIONL:
	        case VERSIONS:
	          config.version = version();
	          return config;
	        case DISPLAY_RULES:
	          config.displayRules = true;
	          i += 1;
	          break;
	        case DISPLAY_RULE_DEPENDENCIES:
	          config.displayRuleDependencies = true;
	          i += 1;
	          break;
	        case DISPLAY_ATTRIBUTES:
	          config.displayAttributes = true;
	          i += 1;
	          break;
	        case STRICTL:
	        case STRICTS:
	          config.strict = true;
	          i += 1;
	          break;
	        case LITEL:
	        case LITES:
	          config.lite = true;
	          i += 1;
	          break;
	        case TYPEL:
	        case TYPES:
	          config.typescript = true;
	          i += 1;
	          break;
	        case INL:
	        case INS:
	          if (!value) {
	            throw new Error(`command line error: input file name has no value: ${args[i]}`);
	          }
	          inFilenames = inFilenames.concat(value.split(','));
	          i += key === INL ? 1 : 2;
	          break;
	        case OUTL:
	        case OUTS:
	          if (!value) {
	            throw new Error(`command line error: output file name has no valu: ${args[i]}`);
	          }
	          config.outFilename = value;
	          i += key === OUTL ? 1 : 2;
	          break;
	        case NAMEL:
	        case NAMES:
	          if (!value) {
	            throw new Error(`command line error: output file name has no value: ${args[i]}`);
	          }
	          config.funcName = value;
	          i += key === NAMEL ? 1 : 2;
	          break;
	        default:
	          throw new Error(`command line error: unrecognized arg: ${args[i]}`);
	      }
	    }

	    /* get the SABNF input */
	    if (inFilenames.length === 0) {
	      throw new Error('command line error: no input file(s)');
	    }

	    let buf = Buffer.alloc(0);
	    inFilenames.forEach((name) => {
	      buf = Buffer.concat([buf, fs.readFileSync(name)]);
	    });
	    config.src = converter$1.decode('BINARY', buf);

	    /* validate & open the output file, if any */
	    config.outfd = null;
	    if (config.outFilename) {
	      const info = path.parse(config.outFilename);
	      const ext = config.typescript ? 'ts' : 'js';
	      if (info.dir) {
	        config.outFilename = `${info.dir}/${info.name}.${ext}`;
	      } else {
	        config.outFilename = `${info.name}.${ext}`;
	      }
	      config.outfd = fs.openSync(config.outFilename, 'w');
	    }
	  } catch (e) {
	    config.error = `CONFIG EXCEPTION: ${e.message}`;
	    config.help = helpScreen(args);
	  }
	  return config;
	};
	return commandLine;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// This is the main or driver function for the parser generator.
// It handles:
//    - verification and interpretation of the command line parameters
//    - execution of immediate commands (help, version)
//    - reading and verifying the input SABNF grammar file(s)
//    - parsing the input SABNF grammar and reporting errors, if any
//    - evaluation of the input grammar's attributes
//    - if all is OK, generating the source code for a grammar object
//    - writing the source to a specified file
//
// Note on teminology.
//
// APG is a parser generator.
// However, it really only generates a "grammar object" (see below) from the defining SABNF grammar.
// The generated parser is incomplete at this stage.
// Remaining, it is the job of the user to develop the generated parser from the grammar object and the APG Library (**apg-lib**).
//
// The following terminology my help clear up the confusion between the idea of a "generated parser" versus a "generated grammar object".
// - The generating parser: APG is an APG parser (yes, there is a circular dependence between **apg** and **apg-lib**). We'll call it the generating parser.
// - The target parser: APG's goal is to generate a parser. We'll call it the target parser.
// - The target grammar: this is the (ASCII) SABNF grammar defining the target parser.
// - The target grammar object: APG parses the SABNF grammar and generates the JavaScript source for a target grammar object.
// - The final target parser: The user then develops the final target parser using the generated target grammar
// object and the APG parsing library, **apg-lib**.
var apg = function apg(args) {
  const fs = require$$0$2;
  const ApiCtor = api;
  const getConfig = requireCommandLine();
  const thisFileName = 'apg.js: ';
  const util = require$$3;
  function logErrors(api, header) {
    console.log('\nORIGINAL GRAMMAR:');
    console.log(api.linesToAscii());
    console.log(`\n${header}:`);
    console.log(api.errorsToAscii());
  }
  try {
    /* Get command line parameters and set up the configuration accordingly. */
    const config = getConfig(args);
    if (config.error) {
      console.log(config.error);
      console.log(config.help);
      return;
    }
    if (config.help) {
      console.log(config.help);
      return;
    }
    if (config.version) {
      console.log(config.version);
      return;
    }

    /* Get and validate the input SABNF grammar. */
    const api = new ApiCtor(config.src);

    api.scan(config.strict);
    if (api.errors.length) {
      logErrors(api, 'GRAMMAR CHARACTER ERRORS');
      throw new Error(`${thisFileName}invalid input grammar`);
    }

    /* parse the grammar - the syntax phase */
    api.parse(config.strict, config.lite);
    if (api.errors.length) {
      logErrors(api, 'GRAMMAR SYNTAX ERRORS');
      throw new Error(`${thisFileName}grammar has syntax errors`);
    }

    /* translate the AST - the semantic phase */
    api.translate();
    if (api.errors.length) {
      logErrors(api, 'GRAMMAR SEMANTIC ERRORS');
      throw new Error(`${thisFileName}grammar has semantic errors`);
    }

    if (config.displayRules) {
      console.log(api.displayRules('alpha'));
      console.log();
    }

    /* attribute generation */
    const errorCount = api.attributes();
    if (errorCount > 0) {
      console.log('GRAMMAR ATTRIBUTE ERRORS');
      console.log(api.displayAttributeErrors());
      console.log();
      if (config.displayAttributes) {
        console.log(api.displayAttributes('type'));
        console.log();
      }
      throw new Error(`${thisFileName}grammar has attribute errors`);
    }
    if (config.displayRuleDependencies) {
      console.log(api.displayRuleDependencies('type'));
      console.log();
    }
    if (config.displayAttributes) {
      console.log(api.displayAttributes('type'));
      console.log();
    }

    /* generate a JavaScript parser, if requested */
    if (config.outfd) {
      fs.writeSync(config.outfd, api.toSource(config));
      if (config.lite) {
        console.log(`\napg-lite grammar object generated: ${config.outFilename}`);
      } else {
        console.log(`\napg-js grammar object generated: ${config.outFilename}`);
      }
    }
  } catch (e) {
    let msg = 'EXCEPTION THROWN: ';
    if (e instanceof Error) {
      msg += `${e.name}: ${e.message}`;
    } else if (typeof e === 'string') {
      msg += e;
    } else {
      msg += '\n';
      msg += util.inspect(e, {
        showHidden: true,
        depth: null,
        colors: true,
      });
    }
    console.log(msg);
  }
};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// Exports the converter and transformer objects.
var nodeExports = {
  converter: converter,
  transformers: transformers,
};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var help;
var hasRequiredHelp;

function requireHelp () {
	if (hasRequiredHelp) return help;
	hasRequiredHelp = 1;
	// This module simply houses the help and version text and functions used by `apg-conv`.
	//
	// `module.help()` - returns the help text.
	// Called if the `-h` or `--help` argument is present
	// or if there are any input argument errors.
	//
	// `module.version()` - returns the version text.
	// Called if the `-v` or `--version` argument is present.
	//
	help = {
	  help: function help() {
	    let str = 'Usage:\n';
	    str += 'apg-conv [options]\n';
	    str += '(--help     | -h) display this help screen\n';
	    str += '(--version  | -v) display version number\n';
	    str += '(--src      | -s) <path>, the file to convert, default stdin\n';
	    str += '(--src-type | -st) type, the source file type, default UTF8\n';
	    str += '(--dst      | -d) <path>, the converted file, default stdout\n';
	    str += '(--dst-type | -dt) type, the converted file type, default UTF8\n';
	    str += '(--err      | -e) <path>, the error reporting file, default stderr\n';
	    str += '\n';
	    str += 'type - the byte stream encoding: may be one of:\n';
	    str += 'UTF8\n';
	    str += 'UTF16\n';
	    str += 'UTF16BE\n';
	    str += 'UTF16LE\n';
	    str += 'UTF32\n';
	    str += 'UTF32BE\n';
	    str += 'UTF32LE\n';
	    str += 'UINT7    (7-bit bytes)\n';
	    str += 'ASCII    (alias for UINT7)\n';
	    str += 'UINT8    (8-bit bytes or ISO 8859-1)\n';
	    str += 'BINARY   (alias for UINT8)\n';
	    str += 'UINT16   (alias for UINT16BE)\n';
	    str += 'UINT16BE\n';
	    str += 'UINT16LE\n';
	    str += 'UINT32   (alias for UINT32BE)\n';
	    str += 'UINT32BE\n';
	    str += 'UINT32LE\n';
	    str += 'STRING\n';
	    str += 'ESCAPED\n';
	    str += '\n';
	    str += 'Type notes:\n';
	    str += '- The type names are case insensitive.\n';
	    str += '- Source types may be prefixed with BASE64:.\n';
	    str += '  The input will be treated as base64 encoded.\n';
	    str += '  It will be stripped of white space and control characters (\\t, \\r, \\n),\n';
	    str += '  then base 64 decoded as an initial step.\n';
	    str += '- Destination types may have a :BASE64 suffix.\n';
	    str += '  The output will be base 64 encoded as a final step.\n';
	    str += '- Destination types my be prefixed with CRLF:.\n';
	    str += '  This will cause a line ending transformation prior to decoding.\n';
	    str += '  CRLF(\\r\\n), CR(\\r) or LF(\\n) will be interpreted as line ends and transformed to CRLF.\n';
	    str += '  CRLF will be added to the end if the last line end is missing.\n';
	    str += '- Destination types my be prefixed with LF:.\n';
	    str += '  This will cause a line ending transformation prior to decoding.\n';
	    str += '  CRLF(\\r\\n), CR(\\r) or LF(\\n) will be interpreted as line ends and transformed to LF.\n';
	    str += '  LF will be added to the end if the last line end is missing.\n';
	    str += '- UTF type input data may have an optional Byte Order Mark (BOM)\n';
	    str += '  - [Unicode Standard](http://www.unicode.org/versions/Unicode9.0.0/ch03.pdf#G7404).\n';
	    str += '- UTF output data will not have a BOM.\n';
	    str += '- UTF16 defaults to UTF16BE if there is no BOM.\n';
	    str += '- UTF32 defaults to UTF32BE if there is no BOM.\n';
	    str += "- An exception is thrown if a BOM is present and doesn't match the specified data type.\n";
	    str += '- ASCII is an alias for UINT7, 7-bit unsigned integers.\n';
	    str += '- BINARY is an alias for UINT8, 8-bit unsigned integers.\n';
	    str += '- UINT16 is an alias for UINT16BE, big-endian, 16-bit unsigned integers.\n';
	    str += '- UINT32 is an alias for UINT32BE, big-endian, 32-bit unsigned integers.\n';
	    str += '- STRING is a JavaScript string\n';
	    str += '- The ESCAPED format is identical to JavaScript string escaping except that\n';
	    str += '  the grave accent (`) is used instead of the backslash (\\).\n';
	    str += '  e.g \\xHH -> `xHH, \\uHHHH -> `uHHHH, \\u{HHHHHH} -> `u{HHHHHH}.\n';
	    str += '  Its design is for special use in HTML <textarea> elements.\n';
	    str += '\n';
	    str += 'Examples:\n';
	    str += '\n';
	    str += 'apg-conv -s <inpath> -d <outpath> -st BINARY -dt UTF8\n';
	    str += '  Convert a binary (Latin 1 or UINT8) file to UTF8.\n';
	    str += '  That is, any characters > 0x7f will get two-byte, UTF8 encoding.\n';
	    str += '\n';
	    str += 'apg-conv -s <inpath> -d <outpath> -st ASCII -dt CRLF:ASCII\n';
	    str += '  Convert all line ends(CRLF, LF or CR) of the ASCII file to CRLF(\\r\\n),\n';
	    str += '  including the last even if missing in the input file.\n';
	    str += '\n';
	    str += 'apg-conv -s <inpath> -d <outpath> -st BASE64:UTF8 -dt UTF32\n';
	    str += '  Perform an initial base 64 decoding of the input file,\n';
	    str += '  then convert it from UTF8 to UTF32(BE) encoding.\n';
	    str += '\n';
	    str += 'apg-conv -s <inpath> -d <outpath> -st UTF8 -dt UTF32LE:BASE64\n';
	    str += '  The input file is converted from UTF8 to UTF32LE and base 64 encoded as a final step.\n';
	    str += '\n';
	    str += 'apg-conv -s <inpath> -d <outpath> -st BASE64:UTF8 -dt LF:UTF16:BASE64\n';
	    str += '  The input file is base 64 decoded. All line ends(CRLF, LF or CR) are converted to LF(\\n),\n';
	    str += '  then converted to wide characters (UTF16) and finally base64 encoded.\n';
	    str += '\n';
	    return str;
	  },
	  version: function version() {
	    return 'Version 4.0.0\nCopyright (c) 2021 Lowell D. Thomas, all rights reserved';
	  },
	};
	return help;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

// This module is the main function for command line usage.
// It reads a source file and writes a destination file, converting the source format to the destination format.
// The files are all treated as byte streams.
// `stdin` and `stdout` are the default input and output streams.
//
// Run<br>
// `npm run apg-conv -- --help`<br>
// or<br>
// `./bin/apg-conv.sh --help`<br>
// to see the options.

var apgConv = function exfn() {
  'use strict;';

  const { Buffer } = require$$0$1;
  const SRC_FILEL = '--src';
  const SRC_FILES = '-s';
  const SRC_TYPEL = '--src-type';
  const SRC_TYPES = '-st';
  const DST_FILEL = '--dst';
  const DST_FILES = '-d';
  const DST_TYPEL = '--dst-type';
  const DST_TYPES = '-dt';
  const ERR_FILEL = '--err';
  const ERR_FILES = '-e';
  const HELPL = '--help';
  const HELPS = '-h';
  const VERSIONL = '--version';
  const VERSIONS = '-v';
  let srcType = 'UTF8';
  let dstType = 'UTF8';
  let srcFile = '';
  let dstFile = '';
  let errFile = '';
  const fs = require$$0$2;
  const api = nodeExports;
  const help = requireHelp();
  const { convert } = api.converter;
  let srcStream = process.stdin;
  let dstStream = process.stdout;
  let errStream = process.stderr;
  let srcBuf;
  let dstBuf;
  const args = process.argv.slice(2);
  try {
    /* get the input arguments */
    if (!args || args.length === 0) {
      console.log(help.help());
      return;
    }
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i].toLowerCase();
      if (key === HELPL || key === HELPS) {
        console.log(help.help());
        return;
      }
      if (key === VERSIONL || key === VERSIONS) {
        console.log(help.version());
        return;
      }
      const i1 = i + 1;
      if (i1 >= args.length) {
        throw new TypeError(`no matching value for option: ${key}`);
      }
      const value = args[i1];
      switch (key) {
        case SRC_FILEL:
        case SRC_FILES:
          srcFile = value;
          break;
        case SRC_TYPEL:
        case SRC_TYPES:
          srcType = value;
          break;
        case DST_FILEL:
        case DST_FILES:
          dstFile = value;
          break;
        case DST_TYPEL:
        case DST_TYPES:
          dstType = value;
          break;
        case ERR_FILEL:
        case ERR_FILES:
          errFile = value;
          break;
        default:
          throw new TypeError(`unrecognized option: ${key}`);
      }
    }

    /* disable STRING type, allowed by converter, but not here */
    /* create file streams, if necessary */
    if (srcFile) {
      srcStream = fs.createReadStream(srcFile, { flags: 'r' });
    }
    if (dstFile) {
      dstStream = fs.createWriteStream(dstFile, { flags: 'w' });
    }
    if (errFile) {
      errStream = fs.createWriteStream(errFile, { flags: 'w' });
    }

    /* read the input data */
    srcBuf = Buffer.alloc(0);
    srcStream.on('data', (chunkBuf) => {
      srcBuf = Buffer.concat([srcBuf, chunkBuf]);
    });

    srcStream.on('end', () => {
      try {
        /* translate the data */
        dstBuf = convert(srcType, srcBuf, dstType);

        /* write the translated the data */
        dstStream.write(dstBuf);
        if (dstFile) {
          dstStream.end();
        }
      } catch (e) {
        errStream.write(`EXCEPTION: on srcStream end: ${e.message}\n`);
      }
    });
    srcStream.on('error', (e) => {
      errStream.write(`srcStream error: ${e.message}\n`);
    });
    dstStream.on('error', (e) => {
      errStream.write(`dstStream error: ${e.message}\n`);
    });
  } catch (e) {
    errStream.write(`EXCEPTION: ${e.message}\n`);
    errStream.write(help.help());
  }
  if (errFile) {
    errStream.end();
  }
};

var exec = {};

/* eslint-disable no-underscore-dangle */

var result;
var hasRequiredResult;

function requireResult () {
	if (hasRequiredResult) return result;
	hasRequiredResult = 1;

	const apglib = nodeExports$1;

	// const utils = apglib.utils;
	// const style = apglib.style;
	const { utils, style } = apglib;
	const MODE_HEX = 16;
	const MODE_DEC = 10;
	const MODE_ASCII = 8;
	const MODE_UNICODE = 32;
	/* add style to HTML phrases */
	const phraseStyle = function phraseStyle(phrase, styleArg) {
	  if (phrase === '') {
	    return `<span class="${style.CLASS_EMPTY}">&#120634;</span>`;
	  }
	  if (phrase === undefined) {
	    return `<span class="${style.CLASS_REMAINDER}">undefined</span>`;
	  }
	  let classStyle = style.CLASS_REMAINDER;
	  if (typeof styleArg === 'string') {
	    if (styleArg.toLowerCase() === 'match') {
	      classStyle = style.CLASS_MATCH;
	    } else if (styleArg.toLowerCase() === 'nomatch') {
	      classStyle = style.CLASS_NOMATCH;
	    }
	  }
	  const chars = apglib.utils.stringToChars(phrase);
	  let html = `<span class="${classStyle}">`;
	  html += apglib.utils.charsToAsciiHtml(chars);
	  return `${html}</span>`;
	};
	/* result object - string phrases to ASCII text */
	const sResultToText = function sResultToText(result) {
	  let txt = '';
	  txt += '    result:\n';
	  txt += '       [0]: ';
	  txt += result[0];
	  txt += '\n';
	  txt += `     input: ${result.input}`;
	  txt += '\n';
	  txt += `     index: ${result.index}`;
	  txt += '\n';
	  txt += `    length: ${result.length}`;
	  txt += '\n';
	  txt += `tree depth: ${result.treeDepth}`;
	  txt += '\n';
	  txt += ` node hits: ${result.nodeHits}`;
	  txt += '\n';
	  txt += '     rules: ';
	  let prefix = '';
	  const indent = '          : ';
	  const { rules } = result;
	  // eslint-disable-next-line no-restricted-syntax
	  // eslint-disable-next-line guard-for-in
	  for (const name in rules) {
	    const rule = rules[name];
	    if (rule) {
	      for (let i = 0; i < rule.length; i += 1) {
	        const ruleobj = rule[i];
	        txt += `${prefix + name} : ${ruleobj.index}: `;
	        txt += ruleobj.phrase;
	        txt += '\n';
	        prefix = indent;
	      }
	    } else {
	      txt += `${prefix + name}: `;
	      txt += 'undefined';
	      txt += '\n';
	    }
	    prefix = indent;
	  }
	  return txt;
	};
	/* result object - string to HTML text */
	const sResultToHtml = function sResultToHtml(result) {
	  let html = '';
	  const caption = 'result:';
	  html += `<table class="${style.CLASS_STATE}">\n`;
	  html += `<caption>${caption}</caption>\n`;
	  html += '<tr>';
	  html += '<th>item</th><th>value</th><th>phrase</th>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>[0]</td>';
	  html += `<td>${result.index}</td>`;
	  html += `<td>${phraseStyle(result[0], 'match')}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>input</td>';
	  html += '<td>0</td>';
	  html += `<td>${phraseStyle(result.input)}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>index</td><td>${result.index}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>length</td><td>${result.length}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>tree depth</td><td>${result.treeDepth}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>node hits</td><td>${result.nodeHits}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<th>rules</th><th>index</th><th>phrase</th>';
	  html += '</tr>\n';

	  const { rules } = result;
	  for (const name in rules) {
	    const rule = rules[name];
	    if (rule) {
	      for (let i = 0; i < rule.length; i += 1) {
	        const ruleobj = rule[i];
	        html += '<tr>';
	        html += `<td>${name}</td>`;
	        html += `<td>${ruleobj.index}</td>`;
	        html += `<td>${phraseStyle(ruleobj.phrase, 'match')}</td>`;
	        html += '\n';
	      }
	    } else {
	      html += '<tr>';
	      html += `<td>${name}</td>`;
	      html += '<td></td>';
	      html += `<td>${phraseStyle(undefined)}</td>`;
	      html += '\n';
	    }
	  }
	  html += '</table>\n';
	  return html;
	};
	/* result object - string to HTML page */
	const sResultToHtmlPage = function sResultToHtmlPage(result) {
	  return utils.htmlToPage(sResultToHtml(result), 'apg-exp result');
	};
	/* apg-exp object - string to ASCII text */
	const sLastMatchToText = function sLastMatchToText(exp) {
	  let txt = '';
	  txt += '  last match:\n';
	  txt += '   lastIndex: ';
	  txt += exp.lastIndex;
	  txt += '\n';
	  txt += '       flags: "';
	  txt += `${exp.flags}"`;
	  txt += '\n';
	  txt += '      global: ';
	  txt += exp.global;
	  txt += '\n';
	  txt += '      sticky: ';
	  txt += exp.sticky;
	  txt += '\n';
	  txt += '     unicode: ';
	  txt += exp.unicode;
	  txt += '\n';
	  txt += '       debug: ';
	  txt += exp.debug;
	  txt += '\n';
	  if (exp['$&'] === undefined) {
	    txt += '   last match: undefined';
	    txt += '\n';
	    return txt;
	  }
	  txt += '       input: ';
	  txt += exp.input;
	  txt += '\n';
	  txt += ' leftContext: ';
	  txt += exp.leftContext;
	  txt += '\n';
	  txt += '   lastMatch: ';
	  txt += exp.lastMatch;
	  txt += '\n';
	  txt += 'rightContext: ';
	  txt += exp.rightContext;
	  txt += '\n';
	  txt += '       rules: ';
	  let prefix = '';
	  const indent = '            : ';
	  for (const name in exp.rules) {
	    txt += `${prefix + name} : `;
	    txt += exp.rules[name];
	    txt += '\n';
	    prefix = indent;
	  }
	  txt += '\n';
	  txt += 'alias:\n';
	  txt += ' ["$_"]: ';
	  // eslint-disable-next-line no-underscore-dangle
	  txt += exp.$_;
	  txt += '\n';
	  txt += ' ["$`"]: ';
	  txt += exp['$`'];
	  txt += '\n';
	  txt += ' ["$&"]: ';
	  txt += exp['$&'];
	  txt += '\n';
	  txt += ' ["$\'"]: ';
	  txt += exp["$'"];
	  txt += '\n';
	  for (const name in exp.rules) {
	    txt += ` ["\${${name}}"]: `;
	    txt += exp[`\${${name}}`];
	    txt += '\n';
	  }
	  return txt;
	};
	/* apg-exp object - string to HTML text */
	const sLastMatchToHtml = function sLastMatchToHtml(exp) {
	  let html = '';
	  const caption = 'last match:';
	  html += `<table class="${style.CLASS_STATE}">\n`;
	  html += `<caption>${caption}</caption>\n`;
	  html += '<tr>';
	  html += '<th>item</th><th>value</th>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>lastIndex</td>';
	  html += `<td>${exp.lastIndex}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>flags</td>';
	  html += `<td>&#34;${exp.flags}&#34;</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>global</td>';
	  html += `<td>${exp.global}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>sticky</td>';
	  html += `<td>${exp.sticky}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>unicode</td>';
	  html += `<td>${exp.unicode}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>debug</td>';
	  html += `<td>${exp.debug}</td>`;
	  html += '</tr>\n';

	  if (exp['$&'] === undefined) {
	    html += '<tr>';
	    html += '<td>lastMatch</td>';
	    html += `<td>${phraseStyle(undefined)}</td>`;
	    html += '</tr>\n';
	    html += '</table>\n';
	    return html;
	  }
	  html += '<th>item</th><th>phrase</th>';
	  html += '</tr>\n';
	  html += '<tr>';
	  html += '<td>input</td>';
	  html += `<td>${phraseStyle(exp.input)}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>leftContext</td>';
	  html += `<td>${phraseStyle(exp.leftContext)}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>lastMatch</td>';
	  html += `<td>${phraseStyle(exp.lastMatch, 'match')}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>rightContext</td>';
	  html += `<td>${phraseStyle(exp.rightContext)}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<th>rule</th><th>phrase</th>';
	  html += '</tr>\n';

	  for (const name in exp.rules) {
	    html += '<tr>';
	    html += `<td>${name}</td>`;
	    html += `<td>${phraseStyle(exp.rules[name])}</td>`;
	    html += '</tr>\n';
	  }

	  html += '<tr>';
	  html += '<th>alias</th><th>phrase</th>';
	  html += '</tr>\n';
	  html += '<tr>';
	  html += '<td>["$_"]</td>';
	  // eslint-disable-next-line no-underscore-dangle
	  html += `<td>${phraseStyle(exp.$_)}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>["$`"]</td>';
	  html += `<td>${phraseStyle(exp['$`'])}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>["$&"]</td>';
	  html += `<td>${phraseStyle(exp['$&'], 'match')}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>["$\'"]</td>';
	  html += `<td>${phraseStyle(exp["$'"])}</td>`;
	  html += '</tr>\n';

	  for (const name in exp.rules) {
	    html += '<tr>';
	    html += `<td>["\${${name}}"]</td>`;
	    html += `<td>${phraseStyle(exp[`\${${name}}`])}</td>`;
	    html += '</tr>\n';
	  }
	  html += '</table>\n';
	  return html;
	};
	/* apg-exp object - string to HTML page */
	const sLastMatchToHtmlPage = function sLastMatchToHtmlPage(exp) {
	  return utils.htmlToPage(sLastMatchToHtml(exp), 'apg-exp last result');
	};
	/* translates ASCII string to integer mode identifier - defaults to ASCII */
	const getMode = function getMode(modearg) {
	  let mode = MODE_ASCII;
	  if (typeof modearg === 'string' && modearg.length >= 3) {
	    const modein = modearg.toLowerCase().slice(0, 3);
	    if (modein === 'hex') {
	      mode = MODE_HEX;
	    } else if (modein === 'dec') {
	      mode = MODE_DEC;
	    } else if (modein === 'uni') {
	      mode = MODE_UNICODE;
	    }
	  }
	  return mode;
	};
	/* translate integer mode identifier to standard text string */
	const modeToText = function modeToText(mode) {
	  let txt;
	  switch (mode) {
	    case MODE_ASCII:
	      txt = 'ascii';
	      break;
	    case MODE_HEX:
	      txt = 'hexadecimal';
	      break;
	    case MODE_DEC:
	      txt = 'decimal';
	      break;
	    case MODE_UNICODE:
	      txt = 'Unicode';
	      break;
	    default:
	      throw new Error('recognized mode');
	  }
	  return txt;
	};
	/* convert integer to hex with leading 0 if necessary */
	const charToHex = function charToHex(char) {
	  let ch = char.toString(16);
	  if (ch.length % 2 !== 0) {
	    ch = `0${ch}`;
	  }
	  return ch;
	};
	/* convert integer character code array to formatted text string */
	const charsToMode = function charsToMode(chars, mode) {
	  let txt = '';
	  if (mode === MODE_ASCII) {
	    txt += apglib.utils.charsToString(chars);
	  } else if (mode === MODE_DEC) {
	    txt += '[';
	    if (chars.length > 0) {
	      txt += chars[0];
	      for (let i = 1; i < chars.length; i += 1) {
	        txt += `,${chars[i]}`;
	      }
	    }
	    txt += ']';
	  } else if (mode === MODE_HEX) {
	    txt += '[';
	    if (chars.length > 0) {
	      txt += `\\x${charToHex(chars[0])}`;
	      for (let i = 1; i < chars.length; i += 1) {
	        txt += `,\\x${charToHex(chars[i])}`;
	      }
	    }
	    txt += ']';
	  } else if (mode === MODE_UNICODE) {
	    txt += '[';
	    if (chars.length > 0) {
	      txt += `\\u${charToHex(chars[0])}`;
	      for (let i = 1; i < chars.length; i += 1) {
	        txt += `,\\u${charToHex(chars[i])}`;
	      }
	    }
	    txt += ']';
	  }
	  return txt;
	};
	/* result object - Unicode mode to ASCII text */
	const uResultToText = function uResultToText(result, modeArg) {
	  const mode = getMode(modeArg);
	  let txt = '';
	  txt += `    result(${modeToText(mode)})\n`;
	  txt += '       [0]: ';
	  txt += charsToMode(result[0], mode);
	  txt += '\n';
	  txt += `     input: ${charsToMode(result.input, mode)}`;
	  txt += '\n';
	  txt += `     index: ${result.index}`;
	  txt += '\n';
	  txt += `    length: ${result.length}`;
	  txt += '\n';
	  txt += `tree depth: ${result.treeDepth}`;
	  txt += '\n';
	  txt += ` node hits: ${result.nodeHits}`;
	  txt += '\n';
	  txt += '     rules: ';
	  txt += '\n';
	  const { rules } = result;
	  for (const name in rules) {
	    const rule = rules[name];
	    if (rule) {
	      for (let i = 0; i < rule.length; i += 1) {
	        const ruleobj = rule[i];
	        txt += `          :${name} : ${ruleobj.index}: `;
	        txt += charsToMode(ruleobj.phrase, mode);
	        txt += '\n';
	      }
	    } else {
	      txt += `          :${name}: `;
	      txt += 'undefined';
	      txt += '\n';
	    }
	  }
	  return txt;
	};
	/* result object - Unicode mode to HTML text */
	const uResultToHtml = function uResultToHtml(result, modeArg) {
	  const mode = getMode(modeArg);
	  let html = '';
	  let caption = 'result:';
	  caption += `(${modeToText(mode)})`;
	  html += `<table class="${style.CLASS_STATE}">\n`;
	  html += `<caption>${caption}</caption>\n`;
	  html += '<tr>';
	  html += '<th>item</th><th>value</th><th>phrase</th>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>[0]</td>';
	  html += `<td>${result.index}</td>`;
	  html += `<td>${phraseStyle(charsToMode(result[0], mode), 'match')}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>input</td>';
	  html += '<td>0</td>';
	  html += `<td>${phraseStyle(charsToMode(result.input, mode))}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>index</td><td>${result.index}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>length</td><td>${result.length}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>tree depth</td><td>${result.treeDepth}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += `<td>node hits</td><td>${result.nodeHits}</td>`;
	  html += '<td></td>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<th>rules</th><th>index</th><th>phrase</th>';
	  html += '</tr>\n';

	  const { rules } = result;
	  for (const name in rules) {
	    const rule = rules[name];
	    if (rule) {
	      for (let i = 0; i < rule.length; i += 1) {
	        const ruleobj = rule[i];
	        html += '<tr>';
	        html += `<td>${name}</td>`;
	        html += `<td>${ruleobj.index}</td>`;
	        html += `<td>${phraseStyle(charsToMode(ruleobj.phrase, mode), 'match')}</td>`;
	        html += '\n';
	      }
	    } else {
	      html += '<tr>';
	      html += `<td>${name}</td>`;
	      html += '<td></td>';
	      html += `<td>${phraseStyle(undefined)}</td>`;
	      html += '\n';
	    }
	  }
	  html += '</table>\n';
	  return html;
	};
	/* result object - Unicode mode to HTML page */
	const uResultToHtmlPage = function uResultToHtmlPage(result, mode) {
	  return utils.htmlToPage(uResultToHtml(result, mode));
	};
	/* apg-exp object - Unicode mode to ASCII text */
	const uLastMatchToText = function uLastMatchToText(exp, modeArg) {
	  const mode = getMode(modeArg);
	  let txt = '';
	  txt += `  last match(${modeToText(mode)})\n`;
	  txt += `   lastIndex: ${exp.lastIndex}`;
	  txt += '\n';
	  txt += `       flags: "${exp.flags}"`;
	  txt += '\n';
	  txt += `      global: ${exp.global}`;
	  txt += '\n';
	  txt += `      sticky: ${exp.sticky}`;
	  txt += '\n';
	  txt += `     unicode: ${exp.unicode}`;
	  txt += '\n';
	  txt += `       debug: ${exp.debug}`;
	  txt += '\n';
	  if (exp['$&'] === undefined) {
	    txt += '   lastMatch: undefined';
	    txt += '\n';
	    return txt;
	  }
	  txt += '       input: ';
	  txt += charsToMode(exp.input, mode);
	  txt += '\n';
	  txt += ' leftContext: ';
	  txt += charsToMode(exp.leftContext, mode);
	  txt += '\n';
	  txt += '   lastMatch: ';
	  txt += charsToMode(exp.lastMatch, mode);
	  txt += '\n';
	  txt += 'rightContext: ';
	  txt += charsToMode(exp.rightContext, mode);
	  txt += '\n';

	  txt += '       rules:';
	  let prefix = '';
	  const indent = '            :';
	  for (const name in exp.rules) {
	    txt += `${prefix + name} : `;
	    txt += exp.rules[name] ? charsToMode(exp.rules[name], mode) : 'undefined';
	    txt += '\n';
	    prefix = indent;
	  }
	  txt += '\n';
	  txt += '  alias:\n';
	  txt += '   ["$_"]: ';
	  txt += charsToMode(exp.$_, mode);
	  txt += '\n';
	  txt += '   ["$`"]: ';
	  txt += charsToMode(exp['$`'], mode);
	  txt += '\n';
	  txt += '   ["$&"]: ';
	  txt += charsToMode(exp['$&'], mode);
	  txt += '\n';
	  txt += '   ["$\'"]: ';
	  txt += charsToMode(exp["$'"], mode);
	  txt += '\n';
	  for (const name in exp.rules) {
	    txt += `   ["\${${name}}"]: `;
	    txt += exp[`\${${name}}`] ? charsToMode(exp[`\${${name}}`], mode) : 'undefined';
	    txt += '\n';
	  }
	  return txt;
	};
	/* apg-exp object - Unicode mode to HTML text */
	const uLastMatchToHtml = function uLastMatchToHtml(exp, modeArg) {
	  const mode = getMode(modeArg);
	  let html = '';
	  let caption = 'last match:';
	  caption += `(${modeToText(mode)})`;
	  html += `<table class="${style.CLASS_STATE}">\n`;
	  html += `<caption>${caption}</caption>\n`;
	  html += '<tr>';
	  html += '<th>item</th><th>value</th>';
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>lastIndex</td>';
	  html += `<td>${exp.lastIndex}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>flags</td>';
	  html += `<td>&#34;${exp.flags}&#34;</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>global</td>';
	  html += `<td>${exp.global}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>sticky</td>';
	  html += `<td>${exp.sticky}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>unicode</td>';
	  html += `<td>${exp.unicode}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>debug</td>';
	  html += `<td>${exp.debug}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<th>item</th><th>phrase</th>';
	  html += '</tr>\n';
	  if (exp['$&'] === undefined) {
	    html += '<tr>';
	    html += '<td>lastMatch</td>';
	    html += `<td>${phraseStyle(undefined)}</td>`;
	    html += '</tr>\n';
	    html += '</table>\n';
	    return html;
	  }
	  html += '<tr>';
	  html += '<td>input</td>';
	  html += `<td>${phraseStyle(charsToMode(exp.input, mode))}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>leftContext</td>';
	  html += `<td>${phraseStyle(charsToMode(exp.leftContext, mode))}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>lastMatch</td>';
	  html += `<td>${phraseStyle(charsToMode(exp.lastMatch, mode), 'match')}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>rightContext</td>';
	  html += `<td>${phraseStyle(charsToMode(exp.rightContext, mode))}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<th>rules</th><th>phrase</th>';
	  html += '</tr>\n';

	  for (const name in exp.rules) {
	    html += '<tr>';
	    html += `<td>${name}</td>`;
	    if (exp.rules[name]) {
	      html += `<td>${phraseStyle(charsToMode(exp.rules[name], mode))}</td>`;
	    } else {
	      html += `<td>${phraseStyle(undefined)}</td>`;
	    }
	    html += '</tr>\n';
	  }

	  html += '<tr>';
	  html += '<th>alias</th><th>phrase</th>';
	  html += '</tr>\n';
	  html += '<tr>';
	  html += '<td>["$_"]</td>';
	  html += `<td>${phraseStyle(charsToMode(exp.$_, mode))}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>["$`"]</td>';
	  html += `<td>${phraseStyle(charsToMode(exp['$`'], mode))}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>["$&"]</td>';
	  html += `<td>${phraseStyle(charsToMode(exp['$&'], mode), 'match')}</td>`;
	  html += '</tr>\n';

	  html += '<tr>';
	  html += '<td>["$\'"]</td>';
	  html += `<td>${phraseStyle(charsToMode(exp["$'"], mode))}</td>`;
	  html += '</tr>\n';

	  for (const name in exp.rules) {
	    html += '<tr>';
	    html += `<td>["\${${name}}"]</td>`;
	    if (exp[`\${${name}}`]) {
	      html += `<td>${phraseStyle(charsToMode(exp[`\${${name}}`], mode))}</td>`;
	    } else {
	      html += `<td>${phraseStyle(undefined)}</td>`;
	    }
	    html += '</tr>\n';
	  }
	  html += '</table>\n';
	  return html;
	};
	/* apg-exp object - Unicode mode to HTML page */
	const uLastMatchToHtmlPage = function uLastMatchToHtmlPage(exp, mode) {
	  return utils.htmlToPage(uLastMatchToHtml(exp, mode));
	};
	/* SABNF grammar souce to ASCII text */
	const sourceToText = function sourceToText(exp) {
	  return exp.source;
	};
	/* SABNF grammar souce to HTML */
	const sourceToHtml = function sourceToHtml(exp) {
	  const rx = /.*(\r\n|\n|\r)/g;
	  let result;
	  let chars;
	  let html;
	  html = '<pre>\n';
	  const TRUE = true;
	  while (TRUE) {
	    result = rx.exec(exp.source);
	    if (result === null || result[0] === '') {
	      break;
	    }
	    chars = apglib.utils.stringToChars(result[0]);
	    html += apglib.utils.charsToAsciiHtml(chars);
	    html += '\n';
	  }
	  html += '</pre>\n';
	  return html;
	};
	/* SABNF grammar souce to HTML page */
	const sourceToHtmlPage = function sourceToHtmlPage(exp) {
	  return apglib.utils.htmlToPage(sourceToHtml(exp), 'apg-exp source');
	};
	/* export modules needed by the apg-exp and result objects to display their values */
	result = {
	  s: {
	    resultToText: sResultToText,
	    resultToHtml: sResultToHtml,
	    resultToHtmlPage: sResultToHtmlPage,
	    expToText: sLastMatchToText,
	    expToHtml: sLastMatchToHtml,
	    expToHtmlPage: sLastMatchToHtmlPage,
	    sourceToText,
	    sourceToHtml,
	    sourceToHtmlPage,
	  },
	  u: {
	    resultToText: uResultToText,
	    resultToHtml: uResultToHtml,
	    resultToHtmlPage: uResultToHtmlPage,
	    expToText: uLastMatchToText,
	    expToHtml: uLastMatchToHtml,
	    expToHtmlPage: uLastMatchToHtmlPage,
	  },
	};
	return result;
}

/* eslint-disable guard-for-in */

var hasRequiredExec;

function requireExec () {
	if (hasRequiredExec) return exec;
	hasRequiredExec = 1;

	const funcs = requireResult();

	/* turns on or off the read-only attribute of the `last result` properties of the object */
	const setProperties = function seProperties(p, readonly) {
	  const exp = p.thisThis;
	  const prop = {
	    writable: readonly,
	    enumerable: false,
	    configurable: true,
	  };
	  Object.defineProperty(exp, 'input', prop);
	  Object.defineProperty(exp, 'leftContext', prop);
	  Object.defineProperty(exp, 'lastMatch', prop);
	  Object.defineProperty(exp, 'rightContext', prop);
	  Object.defineProperty(exp, '$_', prop);
	  Object.defineProperty(exp, '$`', prop);
	  Object.defineProperty(exp, '$&', prop);
	  Object.defineProperty(exp, "$'", prop);
	  prop.enumerable = true;
	  Object.defineProperty(exp, 'rules', prop);
	  if (!exp.rules) {
	    exp.rules = [];
	  }
	  for (const name in exp.rules) {
	    const des = `\${${name}}`;
	    Object.defineProperty(exp, des, prop);
	    Object.defineProperty(exp.rules, name, prop);
	  }
	};
	/* generate the results object for JavaScript strings */
	const sResult = function sResult(p) {
	  const ret = {
	    index: p.result.index,
	    length: p.result.length,
	    input: p.charsToString(p.chars, 0),
	    treeDepth: p.result.treeDepth,
	    nodeHits: p.result.nodeHits,
	    rules: [],
	    toText() {
	      return funcs.s.resultToText(this);
	    },
	    toHtml() {
	      return funcs.s.resultToHtml(this);
	    },
	    toHtmlPage() {
	      return funcs.s.resultToHtmlPage(this);
	    },
	  };
	  ret[0] = p.charsToString(p.chars, p.result.index, p.result.length);
	  /* each rule is either 'undefined' or an array of phrases */
	  for (const name in p.result.rules) {
	    const rule = p.result.rules[name];
	    if (rule) {
	      ret.rules[name] = [];
	      for (let i = 0; i < rule.length; i += 1) {
	        ret.rules[name][i] = {
	          index: rule[i].index,
	          phrase: p.charsToString(p.chars, rule[i].index, rule[i].length),
	        };
	      }
	    } else {
	      ret.rules[name] = undefined;
	    }
	  }
	  return ret;
	};
	/* generate the results object for integer arrays of character codes */
	const uResult = function uResult(p) {
	  const { chars } = p;
	  const { result } = p;
	  let beg;
	  let end;
	  const ret = {
	    index: result.index,
	    length: result.length,
	    input: chars.slice(0),
	    treeDepth: result.treeDepth,
	    nodeHits: result.nodeHits,
	    rules: [],
	    toText(mode) {
	      return funcs.u.resultToText(this, mode);
	    },
	    toHtml(mode) {
	      return funcs.u.resultToHtml(this, mode);
	    },
	    toHtmlPage(mode) {
	      return funcs.u.resultToHtmlPage(this, mode);
	    },
	  };
	  beg = result.index;
	  end = beg + result.length;
	  ret[0] = chars.slice(beg, end);
	  /* each rule is either 'undefined' or an array of phrases */
	  for (const name in result.rules) {
	    const rule = result.rules[name];
	    if (rule) {
	      ret.rules[name] = [];
	      for (let i = 0; i < rule.length; i += 1) {
	        beg = rule[i].index;
	        end = beg + rule[i].length;
	        ret.rules[name][i] = {
	          index: beg,
	          phrase: chars.slice(beg, end),
	        };
	      }
	    } else {
	      ret.rules[name] = undefined;
	    }
	  }
	  return ret;
	};
	/* generate the apg-exp properties or "last match" object for JavaScript strings */
	const sLastMatch = function sLastMatch(p, result) {
	  const exp = p.thisThis;
	  let temp;
	  // eslint-disable-next-line prefer-destructuring
	  exp.lastMatch = result[0];
	  temp = p.chars.slice(0, result.index);
	  exp.leftContext = p.charsToString(temp);
	  temp = p.chars.slice(result.index + result.length);
	  exp.rightContext = p.charsToString(temp);
	  exp.input = result.input.slice(0);
	  // eslint-disable-next-line no-underscore-dangle
	  exp.$_ = exp.input;
	  exp['$&'] = exp.lastMatch;
	  exp['$`'] = exp.leftContext;
	  exp["$'"] = exp.rightContext;
	  exp.rules = {};
	  for (const name in result.rules) {
	    const rule = result.rules[name];
	    if (rule) {
	      exp.rules[name] = rule[rule.length - 1].phrase;
	    } else {
	      exp.rules[name] = undefined;
	    }
	    exp[`\${${name}}`] = exp.rules[name];
	  }
	};
	/* generate the apg-exp properties or "last match" object for integer arrays of character codes */
	const uLastMatch = function uLastMatch(p, result) {
	  const exp = p.thisThis;
	  const { chars } = p;
	  let beg;
	  beg = 0;
	  const end = beg + result.index;
	  exp.leftContext = chars.slice(beg, end);
	  exp.lastMatch = result[0].slice(0);
	  beg = result.index + result.length;
	  exp.rightContext = chars.slice(beg);
	  exp.input = result.input.slice(0);
	  // eslint-disable-next-line no-underscore-dangle
	  exp.$_ = exp.input;
	  exp['$&'] = exp.lastMatch;
	  exp['$`'] = exp.leftContext;
	  exp["$'"] = exp.rightContext;
	  exp.rules = {};
	  for (const name in result.rules) {
	    const rule = result.rules[name];
	    if (rule) {
	      exp.rules[name] = rule[rule.length - 1].phrase;
	    } else {
	      exp.rules[name] = undefined;
	    }
	    exp[`\${${name}}`] = exp.rules[name];
	  }
	};
	/* set the returned result properties, and the `last result` properties of the object */
	const setResult = function setResult(p, parserResult) {
	  let result;
	  p.result = {
	    index: parserResult.index,
	    length: parserResult.length,
	    treeDepth: parserResult.treeDepth,
	    nodeHits: parserResult.nodeHits,
	    rules: [],
	  };
	  /* set result in APG phrases {phraseIndex, phraseLength} */
	  /* p.ruleNames are all names in the grammar */
	  /* p.thisThis.ast.callbacks[name] only defined for 'included' rule names */
	  const obj = p.parser.ast.phrases();
	  for (const name in p.thisThis.ast.callbacks) {
	    // const cap = p.ruleNames[name];
	    if (p.thisThis.ast.callbacks[name]) {
	      const cap = p.ruleNames[name];
	      if (Array.isArray(obj[cap])) {
	        p.result.rules[cap] = obj[cap];
	      } else {
	        p.result.rules[cap] = undefined;
	      }
	    }
	  }
	  /* p.result now has everything we need to know about the result of exec() */
	  /* generate the Unicode or JavaScript string version of the result & last match objects */
	  setProperties(p, true);
	  if (p.thisThis.unicode) {
	    result = uResult(p);
	    uLastMatch(p, result);
	  } else {
	    result = sResult(p);
	    sLastMatch(p, result);
	  }
	  setProperties(p, false);
	  return result;
	};

	/* create an unsuccessful parser result object */
	const resultInit = function resultInit() {
	  return {
	    success: false,
	  };
	};

	/* create a successful parser result object */
	const resultSuccess = function resultSuccess(index, parserResult) {
	  return {
	    success: true,
	    index,
	    length: parserResult.matched,
	    treeDepth: parserResult.maxTreeDepth,
	    nodeHits: parserResult.nodeHits,
	  };
	};
	/* search forward from `lastIndex` until a match is found or the end of string is reached */
	const forward = function forward(p) {
	  let result = resultInit();
	  for (let i = p.thisThis.lastIndex; i < p.chars.length; i += 1) {
	    const re = p.parser.parseSubstring(p.grammarObject, 0, p.chars, i, p.chars.length - i);
	    if (p.match(re.state)) {
	      result = resultSuccess(i, re);
	      break;
	    }
	  }
	  return result;
	};
	/* reset lastIndex after a search */
	const setLastIndex = function setLastIndex(lastIndex, flag, parserResult) {
	  if (flag) {
	    if (parserResult.success) {
	      let ret = parserResult.index;
	      /* bump-along mode - increment is never zero */
	      ret += parserResult.length > 0 ? parserResult.length : 1;
	      return ret;
	    }
	    return 0;
	  }
	  return lastIndex;
	};
	/* attempt a match at lastIndex only - does look further if a match is not found */
	const anchor = function anchor(p) {
	  let result = resultInit();
	  if (p.thisThis.lastIndex < p.chars.length) {
	    const re = p.parser.parseSubstring(
	      p.grammarObject,
	      0,
	      p.chars,
	      p.thisThis.lastIndex,
	      p.chars.length - p.thisThis.lastIndex
	    );
	    if (p.match(re.state)) {
	      result = resultSuccess(p.thisThis.lastIndex, re);
	    }
	  }
	  return result;
	};
	/* called by exec() for a forward search */
	exec.execForward = function execForward(p) {
	  const parserResult = forward(p);
	  let result = null;
	  if (parserResult.success) {
	    result = setResult(p, parserResult);
	  }
	  p.thisThis.lastIndex = setLastIndex(p.thisThis.lastIndex, p.thisThis.global, parserResult);
	  return result;
	};
	/* called by exec() for an anchored search */
	exec.execAnchor = function execAnchor(p) {
	  const parserResult = anchor(p);
	  let result = null;
	  if (parserResult.success) {
	    result = setResult(p, parserResult);
	  }
	  p.thisThis.lastIndex = setLastIndex(p.thisThis.lastIndex, p.thisThis.sticky, parserResult);
	  return result;
	};
	/* search forward from lastIndex looking for a match */
	exec.testForward = function testForward(p) {
	  const parserResult = forward(p);
	  p.thisThis.lastIndex = setLastIndex(p.thisThis.lastIndex, p.thisThis.global, parserResult);
	  return parserResult.success;
	};
	/* test for a match at lastIndex only, do not look further if no match is found */
	exec.testAnchor = function testAnchor(p) {
	  const parserResult = anchor(p);
	  p.thisThis.lastIndex = setLastIndex(p.thisThis.lastIndex, p.thisThis.sticky, parserResult);
	  return parserResult.success;
	};
	return exec;
}

var replace = {};

var replaceGrammar;
var hasRequiredReplaceGrammar;

function requireReplaceGrammar () {
	if (hasRequiredReplaceGrammar) return replaceGrammar;
	hasRequiredReplaceGrammar = 1;
	// copyright: Copyright (c) 2024 Lowell D. Thomas, all rights reserved<br>
	//   license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)<br>
	//
	// Generated by apg-js, Version 4.4.0 [apg-js](https://github.com/ldthomas/apg-js)
	replaceGrammar = function grammar(){
	  // ```
	  // SUMMARY
	  //      rules = 11
	  //       udts = 0
	  //    opcodes = 39
	  //        ---   ABNF original opcodes
	  //        ALT = 4
	  //        CAT = 4
	  //        REP = 4
	  //        RNM = 12
	  //        TLS = 7
	  //        TBS = 2
	  //        TRG = 6
	  //        ---   SABNF superset opcodes
	  //        UDT = 0
	  //        AND = 0
	  //        NOT = 0
	  //        BKA = 0
	  //        BKN = 0
	  //        BKR = 0
	  //        ABG = 0
	  //        AEN = 0
	  // characters = [10 - 65535]
	  // ```
	  /* OBJECT IDENTIFIER (for internal parser use) */
	  this.grammarObject = 'grammarObject';

	  /* RULES */
	  this.rules = [];
	  this.rules[0] = { name: 'rule', lower: 'rule', index: 0, isBkr: false };
	  this.rules[1] = { name: 'error', lower: 'error', index: 1, isBkr: false };
	  this.rules[2] = { name: 'escape', lower: 'escape', index: 2, isBkr: false };
	  this.rules[3] = { name: 'match', lower: 'match', index: 3, isBkr: false };
	  this.rules[4] = { name: 'prefix', lower: 'prefix', index: 4, isBkr: false };
	  this.rules[5] = { name: 'suffix', lower: 'suffix', index: 5, isBkr: false };
	  this.rules[6] = { name: 'xname', lower: 'xname', index: 6, isBkr: false };
	  this.rules[7] = { name: 'name', lower: 'name', index: 7, isBkr: false };
	  this.rules[8] = { name: 'alpha', lower: 'alpha', index: 8, isBkr: false };
	  this.rules[9] = { name: 'digit', lower: 'digit', index: 9, isBkr: false };
	  this.rules[10] = { name: 'any-other', lower: 'any-other', index: 10, isBkr: false };

	  /* UDTS */
	  this.udts = [];

	  /* OPCODES */
	  /* rule */
	  this.rules[0].opcodes = [];
	  this.rules[0].opcodes[0] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[0].opcodes[1] = { type: 2, children: [2,4] };// CAT
	  this.rules[0].opcodes[2] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[0].opcodes[3] = { type: 4, index: 10 };// RNM(any-other)
	  this.rules[0].opcodes[4] = { type: 3, min: 0, max: 1 };// REP
	  this.rules[0].opcodes[5] = { type: 1, children: [6,7,8,9,10,11] };// ALT
	  this.rules[0].opcodes[6] = { type: 4, index: 2 };// RNM(escape)
	  this.rules[0].opcodes[7] = { type: 4, index: 3 };// RNM(match)
	  this.rules[0].opcodes[8] = { type: 4, index: 4 };// RNM(prefix)
	  this.rules[0].opcodes[9] = { type: 4, index: 5 };// RNM(suffix)
	  this.rules[0].opcodes[10] = { type: 4, index: 6 };// RNM(xname)
	  this.rules[0].opcodes[11] = { type: 4, index: 1 };// RNM(error)

	  /* error */
	  this.rules[1].opcodes = [];
	  this.rules[1].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[1].opcodes[1] = { type: 7, string: [36] };// TLS
	  this.rules[1].opcodes[2] = { type: 4, index: 10 };// RNM(any-other)

	  /* escape */
	  this.rules[2].opcodes = [];
	  this.rules[2].opcodes[0] = { type: 7, string: [36,36] };// TLS

	  /* match */
	  this.rules[3].opcodes = [];
	  this.rules[3].opcodes[0] = { type: 7, string: [36,38] };// TLS

	  /* prefix */
	  this.rules[4].opcodes = [];
	  this.rules[4].opcodes[0] = { type: 7, string: [36,96] };// TLS

	  /* suffix */
	  this.rules[5].opcodes = [];
	  this.rules[5].opcodes[0] = { type: 7, string: [36,39] };// TLS

	  /* xname */
	  this.rules[6].opcodes = [];
	  this.rules[6].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
	  this.rules[6].opcodes[1] = { type: 7, string: [36,123] };// TLS
	  this.rules[6].opcodes[2] = { type: 4, index: 7 };// RNM(name)
	  this.rules[6].opcodes[3] = { type: 7, string: [125] };// TLS

	  /* name */
	  this.rules[7].opcodes = [];
	  this.rules[7].opcodes[0] = { type: 2, children: [1,2] };// CAT
	  this.rules[7].opcodes[1] = { type: 4, index: 8 };// RNM(alpha)
	  this.rules[7].opcodes[2] = { type: 3, min: 0, max: Infinity };// REP
	  this.rules[7].opcodes[3] = { type: 1, children: [4,5,6,7] };// ALT
	  this.rules[7].opcodes[4] = { type: 4, index: 8 };// RNM(alpha)
	  this.rules[7].opcodes[5] = { type: 4, index: 9 };// RNM(digit)
	  this.rules[7].opcodes[6] = { type: 6, string: [45] };// TBS
	  this.rules[7].opcodes[7] = { type: 6, string: [95] };// TBS

	  /* alpha */
	  this.rules[8].opcodes = [];
	  this.rules[8].opcodes[0] = { type: 1, children: [1,2] };// ALT
	  this.rules[8].opcodes[1] = { type: 5, min: 97, max: 122 };// TRG
	  this.rules[8].opcodes[2] = { type: 5, min: 65, max: 90 };// TRG

	  /* digit */
	  this.rules[9].opcodes = [];
	  this.rules[9].opcodes[0] = { type: 5, min: 48, max: 57 };// TRG

	  /* any-other */
	  this.rules[10].opcodes = [];
	  this.rules[10].opcodes[0] = { type: 1, children: [1,2,3] };// ALT
	  this.rules[10].opcodes[1] = { type: 5, min: 32, max: 35 };// TRG
	  this.rules[10].opcodes[2] = { type: 5, min: 37, max: 65535 };// TRG
	  this.rules[10].opcodes[3] = { type: 5, min: 10, max: 13 };// TRG

	  // The `toString()` function will display the original grammar file(s) that produced these opcodes.
	  this.toString = function toString(){
	    let str = "";
	    str += ";\n";
	    str += "; SABNF grammar for parsing out the replacement string parameters\n";
	    str += ";\n";
	    str += "rule = *(*any-other [(escape / match / prefix/ suffix/ xname / error)])\n";
	    str += "error = \"$\" any-other\n";
	    str += "escape = \"$$\"\n";
	    str += "match  = \"$&\"\n";
	    str += "prefix = \"$`\"\n";
	    str += "suffix = \"$'\"\n";
	    str += "xname = \"${\" name \"}\"\n";
	    str += "name = alpha *(alpha/digit/%d45/%d95)\n";
	    str += "alpha = %d97-122 / %d65-90\n";
	    str += "digit = %d48-57\n";
	    str += "any-other = %x20-23 / %x25-FFFF / %xA-D\n";
	    return str;
	  };
	};
	return replaceGrammar;
}

/* eslint-disable new-cap */

var parseReplacement;
var hasRequiredParseReplacement;

function requireParseReplacement () {
	if (hasRequiredParseReplacement) return parseReplacement;
	hasRequiredParseReplacement = 1;

	const errorName = 'apgex: replace(): ';
	const synError = function synError(result, chars, phraseIndex, data) {
	  if (data.isMatch(result.state)) {
	    const value = data.charsToString(chars, phraseIndex, result.phraseLength);
	    data.items.push({ type: 'error', index: phraseIndex, length: result.phraseLength, error: value });
	    data.errors += 1;
	    data.count += 1;
	  }
	};
	const synEscape = function synExcape(result, chars, phraseIndex, data) {
	  if (data.isMatch(result.state)) {
	    data.items.push({ type: 'escape', index: phraseIndex, length: result.phraseLength });
	    data.escapes += 1;
	    data.count += 1;
	  }
	};
	const synMatch = function synMatch(result, chars, phraseIndex, data) {
	  if (data.isMatch(result.state)) {
	    data.items.push({ type: 'match', index: phraseIndex, length: result.phraseLength });
	    data.matches += 1;
	    data.count += 1;
	  }
	};
	const synPrefix = function synPrefix(result, chars, phraseIndex, data) {
	  if (data.isMatch(result.state)) {
	    data.items.push({ type: 'prefix', index: phraseIndex, length: result.phraseLength });
	    data.prefixes += 1;
	    data.count += 1;
	  }
	};
	const synSuffix = function synSuffix(result, chars, phraseIndex, data) {
	  if (data.isMatch(result.state)) {
	    data.items.push({ type: 'suffix', index: phraseIndex, length: result.phraseLength });
	    data.suffixes += 1;
	    data.count += 1;
	  }
	};
	const synXName = function synXName(result, chars, phraseIndex, data) {
	  if (data.isMatch(result.state)) {
	    data.items.push({ type: 'name', index: phraseIndex, length: result.phraseLength, name: data.name });
	    data.names += 1;
	    data.count += 1;
	  }
	};
	const synName = function synName(result, chars, phraseIndex, data) {
	  if (data.isMatch(result.state)) {
	    const nameStr = data.charsToString(chars, phraseIndex, result.phraseLength);
	    const nameChars = chars.slice(phraseIndex, phraseIndex + result.phraseLength);
	    data.name = { nameString: nameStr, nameChars };
	  }
	};
	parseReplacement = function parseReplacement(p, str) {
	  const grammar = new (requireReplaceGrammar())();
	  const apglib = nodeExports$1;
	  const parser = new apglib.parser();
	  const data = {
	    name: '',
	    count: 0,
	    errors: 0,
	    escapes: 0,
	    prefixes: 0,
	    matches: 0,
	    suffixes: 0,
	    names: 0,
	    isMatch: p.match,
	    charsToString: apglib.utils.charsToString,
	    items: [],
	  };
	  parser.callbacks.error = synError;
	  parser.callbacks.escape = synEscape;
	  parser.callbacks.prefix = synPrefix;
	  parser.callbacks.match = synMatch;
	  parser.callbacks.suffix = synSuffix;
	  parser.callbacks.xname = synXName;
	  parser.callbacks.name = synName;
	  const chars = apglib.utils.stringToChars(str);
	  const result = parser.parse(grammar, 0, chars, data);
	  if (!result.success) {
	    throw new Error(`${errorName}unexpected error parsing replacement string`);
	  }
	  const ret = data.items;
	  if (data.errors > 0) {
	    let msg = '[';
	    let i = 0;
	    let e = 0;
	    for (; i < data.items.length; i += 1) {
	      const item = data.items[i];
	      if (item.type === 'error') {
	        if (e > 0) {
	          msg += `, ${item.error}`;
	        } else {
	          msg += item.error;
	        }
	        e += 1;
	      }
	    }
	    msg += ']';
	    throw new Error(`${errorName}special character sequences ($...) errors: ${msg}`);
	  }
	  if (data.names > 0) {
	    const badNames = [];
	    let i = 0;
	    for (; i < data.items.length; i += 1) {
	      const item = data.items[i];
	      if (item.type === 'name') {
	        const name = item.name.nameString;
	        const lower = name.toLowerCase();
	        if (!p.parser.ast.callbacks[lower]) {
	          /* name not in callback list, either a bad rule name or an excluded rule name */
	          badNames.push(name);
	        }
	        /* convert all item rule names to lower case */
	        item.name.nameString = lower;
	      }
	    }
	    if (badNames.length > 0) {
	      let msg = '[';
	      for (let ii = 0; ii < badNames.length; ii += 1) {
	        if (ii > 0) {
	          msg += `, ${badNames[ii]}`;
	        } else {
	          msg += badNames[ii];
	        }
	      }
	      msg += ']';
	      throw new Error(`${errorName}special character sequences \${name}: names not found: ${msg}`);
	    }
	  }
	  return ret;
	};
	return parseReplacement;
}

/* eslint-disable no-restricted-syntax */

var hasRequiredReplace;

function requireReplace () {
	if (hasRequiredReplace) return replace;
	hasRequiredReplace = 1;

	const errorName = 'apg-exp: replace(): ';
	const parseReplacementString = requireParseReplacement();
	/* replace special replacement patterns, `$&`, etc. */
	const generateReplacementString = function generateReplacementString(p, rstr, items) {
	  const exp = p.thisThis;
	  if (items.length === 0) {
	    /* no special characters in the replacement string */
	    /* just return a copy of the replacement string */
	    return rstr;
	  }
	  let replace = rstr.slice(0);
	  let first;
	  let last;
	  let ruleName;
	  items.reverse();
	  items.forEach((item) => {
	    first = replace.slice(0, item.index);
	    last = replace.slice(item.index + item.length);
	    switch (item.type) {
	      case 'escape':
	        replace = first.concat('$', last);
	        break;
	      case 'prefix':
	        replace = first.concat(exp.leftContext, last);
	        break;
	      case 'match':
	        replace = first.concat(exp.lastMatch, last);
	        break;
	      case 'suffix':
	        replace = first.concat(exp.rightContext, last);
	        break;
	      case 'name':
	        /* If there are multiple matches to this rule name, only the last is used */
	        /* If this is a problem, modify the grammar and use different rule names for the different places. */
	        ruleName = p.ruleNames[item.name.nameString];
	        replace = first.concat(exp.rules[ruleName], last);
	        break;
	      default:
	        throw new Error(`${errorName}generateREplacementString(): unrecognized item type: ${item.type}`);
	    }
	  });
	  return replace;
	};
	/* creates a special object with the apg-exp object's "last match" properites */
	const lastObj = function lastObj(exp) {
	  const obj = {};
	  obj.ast = exp.ast;
	  obj.input = exp.input;
	  obj.leftContext = exp.leftContext;
	  obj.lastMatch = exp.lastMatch;
	  obj.rightContext = exp.rightContext;
	  // eslint-disable-next-line no-underscore-dangle
	  obj.$_ = exp.input;
	  obj['$`'] = exp.leftContext;
	  obj['$&'] = exp.lastMatch;
	  obj["$'"] = exp.rightContext;
	  obj.rules = [];
	  // eslint-disable-next-line no-restricted-syntax
	  // eslint-disable-next-line guard-for-in
	  for (const name in exp.rules) {
	    const el = `\${${name}}`;
	    obj[el] = exp[el];
	    obj.rules[name] = exp.rules[name];
	  }
	  return obj;
	};
	/* call the user's replacement function for a single pattern match */
	const singleReplaceFunction = function singleReplaceFunction(p, ostr, func) {
	  const result = p.thisThis.exec(ostr);
	  if (result === null) {
	    return ostr;
	  }
	  const rstr = func(result, lastObj(p.thisThis));
	  const ret = p.thisThis.leftContext.concat(rstr, p.thisThis.rightContext);
	  return ret;
	};
	/* call the user's replacement function to replace all pattern matches */
	const globalReplaceFunction = function globalReplaceFunction(p, ostr, func) {
	  const exp = p.thisThis;
	  let retstr = ostr.slice(0);
	  const TRUE = true;
	  while (TRUE) {
	    const result = exp.exec(retstr);
	    if (result === null) {
	      break;
	    }
	    const newrstr = func(result, lastObj(exp));
	    retstr = exp.leftContext.concat(newrstr, exp.rightContext);
	    exp.lastIndex = exp.leftContext.length + newrstr.length;
	    if (result[0].length === 0) {
	      /* an empty string IS a match and is replaced */
	      /* but use "bump-along" mode to prevent infinite loop */
	      exp.lastIndex += 1;
	    }
	  }
	  return retstr;
	};
	/* do a single replacement with the caller's replacement string */
	const singleReplaceString = function singleReplaceString(p, ostr, rstr) {
	  const exp = p.thisThis;
	  const result = exp.exec(ostr);
	  if (result === null) {
	    return ostr;
	  }
	  const ritems = parseReplacementString(p, rstr);
	  const rep = generateReplacementString(p, rstr, ritems);
	  const ret = exp.leftContext.concat(rep, exp.rightContext);
	  return ret;
	};
	/* do a global replacement of all matches with the caller's replacement string */
	const globalReplaceString = function globalReplaceString(p, ostr, rstr) {
	  const exp = p.thisThis;
	  let retstr = ostr.slice(0);
	  let ritems = null;
	  const TRUE = true;
	  while (TRUE) {
	    const result = exp.exec(retstr);
	    if (result == null) {
	      break;
	    }
	    if (ritems === null) {
	      ritems = parseReplacementString(p, rstr);
	    }
	    const newrstr = generateReplacementString(p, rstr, ritems);
	    retstr = exp.leftContext.concat(newrstr, exp.rightContext);
	    exp.lastIndex = exp.leftContext.length + newrstr.length;
	    if (result[0].length === 0) {
	      /* an empty string IS a match and is replaced */
	      /* but use "bump-along" mode to prevent infinite loop */
	      exp.lastIndex += 1;
	    }
	  }
	  return retstr;
	};
	/* the replace() function calls this to replace the matched patterns with a string */
	replace.replaceString = function replaceString(p, str, replacement) {
	  if (p.thisThis.global || p.thisThis.sticky) {
	    return globalReplaceString(p, str, replacement);
	  }
	  return singleReplaceString(p, str, replacement);
	};
	/* the replace() function calls this to replace the matched patterns with a function */
	replace.replaceFunction = function replaceFunction(p, str, func) {
	  if (p.thisThis.global || p.thisThis.sticky) {
	    return globalReplaceFunction(p, str, func);
	  }
	  return singleReplaceFunction(p, str, func);
	};
	return replace;
}

var split = {};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var hasRequiredSplit;

function requireSplit () {
	if (hasRequiredSplit) return split;
	hasRequiredSplit = 1;
	// This module implements the `split()` function.
	/* called by split() to split the string */
	split.split = function exportsSplit(p, str, limit) {
	  'use strict;';

	  const exp = p.thisThis;
	  let result;
	  let beg;
	  let end;
	  let last;
	  const phrases = [];
	  const splits = [];
	  let count = 0;
	  exp.lastIndex = 0;
	  const TRUE = true;
	  while (TRUE) {
	    last = exp.lastIndex;
	    result = exp.exec(str);
	    if (result === null) {
	      break;
	    }
	    phrases.push({
	      phrase: result[0],
	      index: result.index,
	    });
	    /* ignore flags, uses bump-along mode (increment one character on empty string matches) */
	    if (result[0].length === 0) {
	      exp.lastIndex = last + 1;
	    } else {
	      exp.lastIndex = result.index + result[0].length;
	    }
	    count += 1;
	    if (count > limit) {
	      break;
	    }
	  }
	  if (phrases.length === 0) {
	    /* no phrases found, return array with the original string */
	    return [str.slice(0)];
	  }
	  if (phrases.length === 1 || phrases[0].phrase.length === str.length) {
	    /* one phrase found and it is the entire string */
	    return [''];
	  }
	  /* first segment, if any */
	  if (phrases[0].index > 0) {
	    beg = 0;
	    end = phrases[0].index;
	    splits.push(str.slice(beg, end));
	  }
	  /* middle segments, if any */
	  const endi = phrases.length - 1;
	  for (let i = 0; i < endi; i += 1) {
	    beg = phrases[i].index + phrases[i].phrase.length;
	    end = phrases[i + 1].index;
	    splits.push(str.slice(beg, end));
	  }
	  /* last segment, if any */
	  last = phrases[phrases.length - 1];
	  beg = last.index + last.phrase.length;
	  if (beg < str.length) {
	    end = str.length;
	    splits.push(str.slice(beg, end));
	  }
	  return splits;
	};
	return split;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var flags;
var hasRequiredFlags;

function requireFlags () {
	if (hasRequiredFlags) return flags;
	hasRequiredFlags = 1;
	// This module analyzes the flags string, setting the true/false flags accordingly.
	flags = function exportFlags(obj, flags) {
	  'use strict;';

	  const errorName = 'apg-exp: constructor: flags: ';
	  let error = null;
	  const readonly = {
	    writable: false,
	    enumerable: false,
	    configurable: true,
	  };
	  /* defaults - all flags default to false */
	  /* set to true only if they appear in the input flags string */
	  obj.flags = '';
	  obj.global = false;
	  obj.sticky = false;
	  obj.unicode = false;
	  obj.debug = false;
	  const TRUE = true;
	  while (TRUE) {
	    /* validation */
	    if (typeof flags === 'undefined' || flags === null) {
	      break;
	    }
	    if (typeof flags !== 'string') {
	      error = `${errorName}Invalid flags supplied to constructor: must be null, undefined or string: '${typeof flags}'`;
	      break;
	    }
	    if (flags === '') {
	      break;
	    }
	    /* set the flags */
	    const f = flags.toLowerCase().split('');
	    for (let i = 0; i < f.length; i += 1) {
	      switch (f[i]) {
	        case 'd':
	          obj.debug = true;
	          break;
	        case 'g':
	          obj.global = true;
	          break;
	        case 'u':
	          obj.unicode = true;
	          break;
	        case 'y':
	          obj.sticky = true;
	          break;
	        default:
	          error = `${errorName}Invalid flags supplied to constructor: '${flags}'`;
	          return error;
	      }
	    }
	    /* alphabetize the existing flags */
	    if (obj.debug) {
	      obj.flags += 'd';
	    }
	    if (obj.global) {
	      obj.flags += 'g';
	    }
	    if (obj.unicode) {
	      obj.flags += 'u';
	    }
	    if (obj.sticky) {
	      obj.flags += 'y';
	    }
	    break;
	  }
	  /* make flag properties read-only */
	  Object.defineProperty(obj, 'flags', readonly);
	  Object.defineProperty(obj, 'global', readonly);
	  Object.defineProperty(obj, 'debug', readonly);
	  Object.defineProperty(obj, 'unicode', readonly);
	  Object.defineProperty(obj, 'sticky', readonly);
	  return error;
	};
	return flags;
}

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var sabnfGenerator;
var hasRequiredSabnfGenerator;

function requireSabnfGenerator () {
	if (hasRequiredSabnfGenerator) return sabnfGenerator;
	hasRequiredSabnfGenerator = 1;
	// This module parses an input SABNF grammar string into a grammar object.
	// Errors are reported as an array of error message strings.
	// To be called only by the `apg-exp` contructor.
	// ```
	// input - required, a string containing the SABNF grammar
	// errors - required, must be an array
	// ```
	sabnfGenerator = function sabnfGenerator(input) {
	  'use strict;';

	  const Api = api;

	  const errorName = 'apg-exp: generator: ';
	  const result = { obj: null, error: null, text: null, html: null };
	  const grammarTextTitle = 'annotated grammar:\n';
	  const textErrorTitle = 'annotated grammar errors:\n';
	  function resultError(api, resultArg, header) {
	    resultArg.error = header;
	    resultArg.text = grammarTextTitle;
	    resultArg.text += api.linesToAscii();
	    resultArg.text += textErrorTitle;
	    resultArg.text += api.errorsToAscii();
	    resultArg.html = api.linesToHtml();
	    resultArg.html += api.errorsToHtml();
	  }

	  let api$1;
	  const TRUE = true;
	  while (TRUE) {
	    /* verify the input string - preliminary analysis */
	    try {
	      api$1 = new Api(input);
	      api$1.scan();
	    } catch (e) {
	      result.error = errorName + e.msg;
	      break;
	    }
	    if (api$1.errors.length) {
	      resultError(api$1, result, 'grammar has validation errors');
	      break;
	    }

	    /* syntax analysis of the grammar */
	    api$1.parse();
	    if (api$1.errors.length) {
	      resultError(api$1, result, 'grammar has syntax errors');
	      break;
	    }

	    /* semantic analysis of the grammar */
	    api$1.translate();
	    if (api$1.errors.length) {
	      resultError(api$1, result, 'grammar has semantic errors');
	      break;
	    }

	    /* attribute analysis of the grammar */
	    api$1.attributes();
	    if (api$1.errors.length) {
	      resultError(api$1, result, 'grammar has attribute errors');
	      break;
	    }

	    /* finally, generate a grammar object */
	    result.obj = api$1.toObject();
	    break;
	  }
	  return result;
	};
	return sabnfGenerator;
}

/* eslint-disable guard-for-in */

/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */
// This is the `apg-exp` object constructor.
// `apg-exp` functions similarly to the built-in JavaScript `RegExp` pattern matching engine.
// However, patterns are described with an [SABNF]()
// syntax and matching is done with an
// [`apg`](https://github.com/ldthomas/apg-js2) parser.
//
// See the user's guide at `./dist/guide/index.html` for complete usage details.
var apgExp = function apgExp(input, flags, nodeHits, treeDepth) {
  'use strict;';

  const apglib = nodeExports$1;
  const execFuncs = requireExec();
  const replaceFuncs = requireReplace();
  const resultFuncs = requireResult();
  const splitFuncs = requireSplit();
  const setFlags = requireFlags();
  const sabnfGenerator = requireSabnfGenerator();

  const thisThis = this;
  const thisFileName = 'apg-exp: ';
  let errorName = thisFileName;
  const readonly = {
    writable: false,
    enumerable: false,
    configurable: true,
  };
  /* private object data that needs to be passed around to supporting modules */
  const priv = {
    thisThis: this,
    grammarObject: null,
    ruleNames: [],
    str: null,
    chars: null,
    parser: null,
    result: null,
    charsToString: null,
    match(state) {
      return state === apglib.ids.MATCH || state === apglib.ids.EMPTY;
    },
  };
  // This is a custom exception object.
  // Derived from Error, it is named `ApgExpError` and in addition to the error `message`
  // it has two functions, `toText()` and `toHtml()` which will display the errors
  // in a user-friendly ASCII text format or HTML format like the formats used by APG.
  // e. g.
  // ```
  // try{
  //   ...
  // }catch(e){
  //   if(e.name === "ApgExpError"){
  //     console.log(e.toText());
  //   }else{
  //     console.log(e.message);
  //   }
  // ```
  // All errors from the constructor and all object functions are reported by throwing an `ApgExpError` Error object.
  const ApgExpError = function ApgExpError(msg, t, h) {
    this.message = msg;
    this.name = 'ApgExpError';
    const text = t;
    const html = h;
    this.toText = function toText() {
      let ret = '';
      ret += this.message;
      ret += '\n';
      if (text) {
        ret += text;
      }
      return ret;
    };
    this.toHtml = function toHtml() {
      let ret = '';
      ret += `<h3>${apglib.utils.stringToAsciiHtml(this.message)}</h3>`;
      ret += '\n';
      if (html) {
        ret += html;
      }
      return ret;
    };
  };
  ApgExpError.prototype = new Error();

  /* verifies that all UDT callback functions have been defined */
  const checkParserUdts = function checkParserUdts() {
    const udterrors = [];
    let error = null;
    for (let i = 0; i < priv.grammarObject.udts.length; i += 1) {
      const { lower } = priv.grammarObject.udts[i];
      if (typeof priv.parser.callbacks[lower] !== 'function') {
        udterrors.push(priv.ruleNames[lower]);
      }
    }
    if (udterrors.length > 0) {
      error = `undefined UDT callback functions: ${udterrors}`;
    }
    return error;
  };

  /* the constructor */
  errorName = `${thisFileName}constructor: `;
  let error = null;
  let result = null;
  try {
    const TRUE = true;
    while (TRUE) {
      /* flags */
      error = setFlags(this, flags);
      if (error) {
        error = new ApgExpError(error);
        break;
      }
      /* grammar object for the defining SABNF grammar */
      if (typeof input === 'string') {
        this.source = input;
        result = sabnfGenerator(input);
        if (result.error) {
          error = new ApgExpError(result.error, result.text, result.html);
          break;
        }
        priv.grammarObject = result.obj;
      } else if (
        typeof input === 'object' &&
        typeof input.grammarObject === 'string' &&
        input.grammarObject === 'grammarObject'
      ) {
        priv.grammarObject = input;
        this.source = priv.grammarObject.toString();
      } else {
        error = new ApgExpError(`${thisFileName}invalid SABNF grammar input`);
        this.source = '';
        break;
      }
      Object.defineProperty(this, 'source', readonly);
      /* the parser & AST */
      priv.charsToString = apglib.utils.charsToString;
      priv.parser = new apglib.parser();
      this.ast = new apglib.ast();
      this.trace = this.debug ? new apglib.trace() : null;
      for (let i = 0; i < priv.grammarObject.rules.length; i += 1) {
        const rule = priv.grammarObject.rules[i];
        priv.ruleNames[rule.lower] = rule.name;
        priv.parser.callbacks[rule.lower] = false;
        this.ast.callbacks[rule.lower] = true;
      }
      for (let i = 0; i < priv.grammarObject.udts.length; i += 1) {
        const rule = priv.grammarObject.udts[i];
        priv.ruleNames[rule.lower] = rule.name;
        priv.parser.callbacks[rule.lower] = false;
        this.ast.callbacks[rule.lower] = true;
      }
      /* nodeHit and treeDepth limits */
      if (typeof nodeHits === 'number') {
        this.nodeHits = Math.floor(nodeHits);
        if (this.nodeHits > 0) {
          priv.parser.setMaxNodeHits(this.nodeHits);
        } else {
          error = new ApgExpError(`${thisFileName}nodeHits must be integer > 0: ${nodeHits}`);
          this.nodeHits = Infinity;
          break;
        }
      } else {
        this.nodeHits = Infinity;
      }
      if (typeof treeDepth === 'number') {
        this.treeDepth = Math.floor(treeDepth);
        if (this.treeDepth > 0) {
          priv.parser.setMaxTreeDepth(this.treeDepth);
        } else {
          error = new ApgExpError(`${thisFileName}treeDepth must be integer > 0: ${treeDepth}`);
          this.treeDepth = Infinity;
          break;
        }
      } else {
        this.treeDepth = Infinity;
      }
      Object.defineProperty(this, 'nodeHits', readonly);
      Object.defineProperty(this, 'treeDepth', readonly);
      /* success */
      this.lastIndex = 0;
      break;
    }
  } catch (e) {
    error = new ApgExpError(`${e.name}: ${e.message}`);
  }
  if (error) {
    throw error;
  }
  // Find the SABNF-defined pattern in the input string.
  // Can be called multiple times with the `g` or `y` flags.
  /* public API */
  this.exec = function exec(str) {
    let execResult = null;
    errorName = `${thisFileName}exec(): `;
    if (typeof str === 'string') {
      priv.str = str;
      priv.chars = apglib.utils.stringToChars(str);
    } else if (Array.isArray(str)) {
      priv.str = null;
      priv.chars = str;
    } else {
      return execResult;
    }
    priv.parser.ast = this.ast;
    priv.parser.trace = this.trace;
    const execError = checkParserUdts();
    if (execError) {
      throw new ApgExpError(errorName + execError);
    }
    if (this.sticky) {
      execResult = execFuncs.execAnchor(priv);
    } else {
      execResult = execFuncs.execForward(priv);
    }
    return execResult;
  };
  // Test for a match of the SABNF-defined pattern in the input string.
  // Can be called multiple times with the `g` or `y` flags.
  this.test = function test(str) {
    let testResult = null;
    errorName = `${thisFileName}test(): `;
    if (typeof str === 'string') {
      priv.str = str;
      priv.chars = apglib.utils.stringToChars(str);
    } else if (Array.isArray(str)) {
      priv.str = null;
      priv.chars = str;
    } else {
      return testResult;
    }
    priv.parser.ast = null;
    priv.parser.trace = null;
    this.ast = null;
    this.trace = null;
    const testError = checkParserUdts();
    if (testError) {
      throw new ApgExpError(errorName + testError);
    }
    if (this.sticky) {
      testResult = execFuncs.testAnchor(priv);
    } else {
      testResult = execFuncs.testForward(priv);
    }
    return testResult;
  };
  // This is roughly equivalent to the JavaScript string replacement function, `str.replace(regex, replacement)`.
  // (It follows closely the
  // [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace) description.)
  // If the global flag `g` is set, all matched phrases will be replaced,
  // otherwise, only the first.
  // If the sticky flag `y` is set, all matched 'consecutive' phrases will be replaced,
  // otherwise, only the first.
  // If the unicode flag `u` is set, an exception will be thrown. `replace()` only works on strings, not character code arrays.
  // The `replacement` string may contain the patterns patterns.
  // <pre>
  // <code>
  // $$ - insert the character $
  // the escape sequence for the $ character
  // $&#96; - insert the prefix to the matched pattern
  // $&#38; - insert the matched pattern
  // $' - insert the suffix of the matched pattern
  // ${name} - insert the last match to the rule "name"
  // </code>
  // </pre>
  // `replacement` may also be a user-written function of the form
  // <pre>
  // <code>
  // let replacement = function(result, exp){}
  // result - the result object from the pattern match
  // exp - the apg-exp object
  // </code>
  // </pre>
  // There is quite a bit of redundancy here with both the `result` object and the `apg-exp` object being passed to the
  // replacement function. However, this provides the user with a great deal of flexibility in what might be the
  // most convenient way to create the replacement. Also, the `apg-exp` object has the AST which is a powerful
  // translation tool for really tough replacement jobs.
  this.replace = function replace(str, replacement) {
    errorName = `${thisFileName}replace(): `;
    if (this.unicode) {
      throw new ApgExpError(
        `${errorName}cannot do string replacement in 'unicode' mode. Insure that 'u' flag is absent.`
      );
    }
    if (typeof str !== 'string') {
      throw new ApgExpError(`${errorName}input type error: str not a string`);
    }
    if (typeof replacement === 'string') {
      return replaceFuncs.replaceString(priv, str, replacement);
    }
    if (typeof replacement === 'function') {
      return replaceFuncs.replaceFunction(priv, str, replacement);
    }
    throw new ApgExpError(`${errorName}input type error: replacement not a string or function`);
  };
  // Mimics the JavaScript `String.split(regexp)` function. That is,
  // `split(str[, limit])` is roughly equivalent to `str.split(regexp[, limit])`
  // Returns an array of strings.
  // If `str` is undefined or empty the returned array
  // contains a single, empty string.
  // Otherwise, `exp.exec(str)` is called in global mode. If a one or more matched phrases are found, they are removed from the
  // string
  // and the substrings are returned in an array.
  // If no matched phrases are found, the array contains one element consisting of the entire string, `["str"]`.
  // Empty string matches will split the string and advance `lastIndex` by one character (bump-along mode).
  // That means, for example, the grammar `rule=""\n` would match the empty string at every character
  // and an array of all characters would be returned. It would be similar to calling the JavaScript function `str.split("")`.
  // Unlike the JavaScript function, capturing parentheses (rules) are not spliced into the output string.
  // An exception is thrown if the unicode flag is set. `split()` works only on strings, not integer arrays of character codes.
  // If the `limit` argument is used, it must be a positive number and no more than `limit` matches will be returned.
  this.split = function split(str, limit) {
    errorName = `${thisFileName}split(): `;
    if (this.unicode) {
      throw new ApgExpError(`${errorName}cannot do string split in 'unicode' mode. Insure that 'u' flag is absent.`);
    }
    if (str === undefined || str === null || str === '') {
      return [''];
    }
    if (typeof str !== 'string') {
      throw new ApgExpError(`${errorName}argument must be a string: typeof(arg): ${typeof str}`);
    }
    if (typeof limit !== 'number') {
      // eslint-disable-next-line no-param-reassign
      limit = Infinity;
    } else {
      // eslint-disable-next-line no-param-reassign
      limit = Math.floor(limit);
      if (limit <= 0) {
        throw new ApgExpError(`${errorName}limit must be >= 0: limit: ${limit}`);
      }
    }
    return splitFuncs.split(priv, str, limit);
  };
  // Select specific rule/UDT names to include in the result object.
  // `list` is an array of rule/UDT names to include.
  // All other names, not in the array, are excluded.
  // Excluding a rule/UDT name does not affect the operation of any functions,
  // it simply excludes its phrases from the results.
  this.include = function include(list) {
    errorName = `${thisFileName}include(): `;
    if (list === undefined || list == null || (typeof list === 'string' && list.toLowerCase() === 'all')) {
      /* set all to true */
      for (const name in priv.grammarObject.callbacks) {
        thisThis.ast.callbacks[name] = true;
      }
      return;
    }
    if (Array.isArray(list)) {
      /* set all to false */
      for (const name in priv.grammarObject.callbacks) {
        thisThis.ast.callbacks[name] = false;
      }
      /* then set those in the list to true */
      for (let i = 0; i < list.length; i += 1) {
        let l = list[i];
        if (typeof l !== 'string') {
          throw new ApgExpError(`${errorName}invalid name type in list`);
        }
        l = l.toLowerCase();
        if (thisThis.ast.callbacks[l] === undefined) {
          throw new ApgExpError(`${errorName}unrecognized name in list: ${list[i]}`);
        }
        thisThis.ast.callbacks[l] = true;
      }
      return;
    }
    throw new ApgExpError(`${errorName}unrecognized list type`);
  };
  // Select specific rule/UDT names to exclude in the result object.
  // `list` is an array of rule/UDT names to exclude.
  // All other names, not in the array, are included.
  // Excluding a rule/UDT name does not affect the operation of any functions,
  // it simply excludes its phrases from the results.
  this.exclude = function exclude(list) {
    errorName = `${thisFileName}exclude(): `;
    if (list === undefined || list == null || (typeof list === 'string' && list.toLowerCase() === 'all')) {
      /* set all to false */
      for (const name in priv.grammarObject.callbacks) {
        thisThis.ast.callbacks[name] = false;
      }
      return;
    }
    if (Array.isArray(list)) {
      /* set all to true */
      for (const name in priv.grammarObject.callbacks) {
        thisThis.ast.callbacks[name] = true;
      }
      /* then set all in list to false */
      for (let i = 0; i < list.length; i += 1) {
        let l = list[i];
        if (typeof l !== 'string') {
          throw new ApgExpError(`${errorName}invalid name type in list`);
        }
        l = l.toLowerCase();
        if (thisThis.ast.callbacks[l] === undefined) {
          throw new ApgExpError(`${errorName}unrecognized name in list: ${list[i]}`);
        }
        thisThis.ast.callbacks[l] = false;
      }
      return;
    }
    throw new ApgExpError(`${errorName}unrecognized list type`);
  };
  // Defines a UDT callback function. *All* UDTs appearing in the SABNF phrase syntax must be defined here.
  // <pre><code>
  // name - the (case-insensitive) name of the UDT
  // func - the UDT callback function
  // </code></pre>
  this.defineUdt = function defineUdt(name, func) {
    errorName = `${thisFileName}defineUdt(): `;
    if (typeof name !== 'string') {
      throw new ApgExpError(`${errorName}'name' must be a string`);
    }
    if (typeof func !== 'function') {
      throw new ApgExpError(`${errorName}'func' must be a function reference`);
    }
    const lowerName = name.toLowerCase();
    for (let i = 0; i < priv.grammarObject.udts.length; i += 1) {
      if (priv.grammarObject.udts[i].lower === lowerName) {
        priv.parser.callbacks[lowerName] = func;
        return;
      }
    }
    throw new ApgExpError(`${errorName}'name' not a UDT name: ${name}`);
  };
  // Estimates the upper bound of the call stack depth for this JavaScript
  // engine. Taken from [here](http://www.2ality.com/2014/04/call-stack-size.html)
  this.maxCallStackDepth = function maxCallStackDepth() {
    try {
      return 1 + this.maxCallStackDepth();
    } catch (e) {
      return 1;
    }
  };
  // Returns the "last match" information in the `apg-exp` object in ASCII text.
  // Patterned after and similar to the JavaScript
  // [`RegExp` properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).
  this.toText = function toText() {
    if (this.unicode) ;
    return resultFuncs.s.expToText(this);
  };
  // Returns the "last match" information in the `apg-exp` object formatted as an HTML table.
  this.toHtml = function toHtml(mode) {
    if (this.unicode) {
      /* *see mode definitions above */
      return resultFuncs.u.expToHtml(this, mode);
    }
    return resultFuncs.s.expToHtml(this);
  };
  // Same as `toHtml()` except the output is a complete HTML page.
  this.toHtmlPage = function toHtmlPage(mode) {
    if (this.unicode) {
      /* *see mode definitions above */
      return resultFuncs.u.expToHtmlPage(this, mode);
    }
    return resultFuncs.s.expToHtmlPage(this);
  };
  /* Returns the SABNF syntax or grammar defining the pattern in ASCII text format. */
  this.sourceToText = function sourceToText() {
    return resultFuncs.s.sourceToText(this);
  };
  /* Returns the SABNF syntax or grammar defining the pattern in HTML format. */
  this.sourceToHtml = function sourceToHtml() {
    return resultFuncs.s.sourceToHtml(this);
  };
  /* Returns the SABNF syntax or grammar defining the pattern as a complete HTML page. */
  this.sourceToHtmlPage = function sourceToHtmlPage() {
    return resultFuncs.s.sourceToHtmlPage(this);
  };
};

/*  *************************************************************************************
 *   copyright: Copyright (c) 2021 Lowell D. Thomas, all rights reserved
 *     license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)
 *   ********************************************************************************* */

var apgJs = {
  apg: apg,
  apgConv: apgConv,
  apgConvApi: nodeExports,
  apgLib: nodeExports$1,
  apgApi: api,
  apgExp: apgExp,
};

/*
 * Copyright (C) 2024, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
// @ts-ignore
const GRAMMAR = `
sign-in-with-tezos =
    domain %s" wants you to sign in with your " namespace %s" account:" LF
    account-address LF
    LF
    [ statement LF ]
    LF
    %s"Uri: " URI LF
    %s"Version: " version LF
    %s"Chain ID: " chain-id LF
    %s"Nonce: " nonce LF
    %s"Issued At: " issued-at
    [ LF %s"Expiration Time: " expiration-time ]
    [ LF %s"Not Before: " not-before ]
    [ LF %s"Request ID: " request-id ]
    [ LF %s"Resources:"
    resources ]
    

domain = authority
  ; From RFC 3986:
  ;     authority     = [ userinfo "@" ] host [ ":" port ]
  ; See RFC 3986 for the fully contextualized
  ; definition of "authority".

namespace = "tezos" / "Tezos"
  ; See README in CANs for Tezos

account-address = "tz" 34*34ALPHADIGIT
  ; Must also conform to capitalization
  ; See CAIP-10 for valid 
  ; where applicable (EOAs).

statement = *( reserved / unreserved / " " )
  ; See RFC 3986 for the definition
  ; of "reserved" and "unreserved".
  ; The purpose is to exclude LF (line break).

version = "1"

chain-id = 15*( ALPHA / DIGIT )
    ; See CAIP-2 for valid CHAIN_IDs.

nonce = 8*( ALPHA / DIGIT )
    ; See RFC 5234 for the definition
    ; of "ALPHA" and "DIGIT".

issued-at = date-time

expiration-time = date-time

not-before = date-time
    ; See RFC 3339 (ISO 8601) for the
    ; definition of "date-time".

request-id = *pchar
    ; See RFC 3986 for the definition of "pchar".

resources = *( LF resource )
resource = "- " URI

; ------------------------------------------------------------------------------
; RFC 3986

URI           = scheme ":" hier-part [ "?" query ] [ "#" fragment ]

hier-part     = "//" authority path-abempty
              / path-absolute
              / path-rootless
              / path-empty

scheme        = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )

authority     = [ userinfo "@" ] host [ ":" port ]
userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
host          = IP-literal / IPv4address / reg-name
port          = *DIGIT

IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"

IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )

IPv6address   =                            6( h16 ":" ) ls32
              /                       "::" 5( h16 ":" ) ls32
              / [               h16 ] "::" 4( h16 ":" ) ls32
              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
              / [ *4( h16 ":" ) h16 ] "::"              ls32
              / [ *5( h16 ":" ) h16 ] "::"              h16
              / [ *6( h16 ":" ) h16 ] "::"

h16           = 1*4HEXDIG
ls32          = ( h16 ":" h16 ) / IPv4address
IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
dec-octet     = DIGIT                 ; 0-9
                 / %x31-39 DIGIT         ; 10-99
                 / "1" 2DIGIT            ; 100-199
                 / "2" %x30-34 DIGIT     ; 200-249
                 / "25" %x30-35          ; 250-255

reg-name      = *( unreserved / pct-encoded / sub-delims )

path-abempty  = *( "/" segment )
path-absolute = "/" [ segment-nz *( "/" segment ) ]
path-rootless = segment-nz *( "/" segment )
path-empty    = 0pchar

segment       = *pchar
segment-nz    = 1*pchar

pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"

query         = *( pchar / "/" / "?" )

fragment      = *( pchar / "/" / "?" )

pct-encoded   = "%" HEXDIG HEXDIG

unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
reserved      = gen-delims / sub-delims
gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
              / "*" / "+" / "," / ";" / "="

; ------------------------------------------------------------------------------
; RFC 3339

date-fullyear   = 4DIGIT
date-month      = 2DIGIT  ; 01-12
date-mday       = 2DIGIT  ; 01-28, 01-29, 01-30, 01-31 based on
                          ; month/year
time-hour       = 2DIGIT  ; 00-23
time-minute     = 2DIGIT  ; 00-59
time-second     = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second
                          ; rules
time-secfrac    = "." 1*DIGIT
time-numoffset  = ("+" / "-") time-hour ":" time-minute
time-offset     = "Z" / time-numoffset

partial-time    = time-hour ":" time-minute ":" time-second
                  [time-secfrac]
full-date       = date-fullyear "-" date-month "-" date-mday
full-time       = partial-time time-offset

date-time       = full-date "T" full-time

; ------------------------------------------------------------------------------
; RFC 5234

ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z
LF             =  %x0A
                  ; linefeed
DIGIT          =  %x30-39
                  ; 0-9
ALPHADIGIT     =  ALPHA / DIGIT
HEXDIG         =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
`;
const astStringProperties = [
    'domain',
    'accountAddress',
    'namespace',
    'statement',
    'uri',
    'version',
    'chainId',
    'nonce',
    'issuedAt',
    'expirationTime',
    'notBefore',
    'requestId',
];
const astStringPropertyNames = {
    domain: 'domain',
    accountAddress: 'account-address',
    namespace: 'namespace',
    statement: 'statement',
    uri: 'uri',
    version: 'version',
    chainId: 'chain-id',
    nonce: 'nonce',
    issuedAt: 'issued-at',
    expirationTime: 'expiration-time',
    notBefore: 'not-before',
    requestId: 'request-id',
};
const generateGrammarApi = (grammar) => {
    const api = new apgJs.apgApi(grammar);
    api.generate();
    if (api.errors.length) {
        console.log(api.errorsToAscii());
        console.log(api.linesToAscii());
        console.log(api.displayAttributeErrors());
        throw new Error(`ABNF grammar has errors`);
    }
    return api.toObject();
};
const astString = (id, property) => (state, chars, phraseIndex, phraseLength, data) => {
    const ret = id.SEM_OK;
    if (state === id.SEM_PRE) {
        data[property] = apgJs.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
    }
    return ret;
};
const astUri = id => (state, chars, phraseIndex, phraseLength, data) => {
    const ret = id.SEM_OK;
    if (state === id.SEM_PRE) {
        if (!data.uri) {
            data.uri = apgJs.apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
        }
    }
    return ret;
};
const astResources = id => (state, chars, phraseIndex, phraseLength, data) => {
    const ret = id.SEM_OK;
    if (state === id.SEM_PRE) {
        data.resources = apgJs.apgLib.utils.charsToString(chars, phraseIndex, phraseLength).slice(3).split('\n- ');
    }
    return ret;
};
const _parseSIWTMessage = (grammarApi) => (message) => {
    const parser = new apgJs.apgLib.parser();
    parser.ast = new apgJs.apgLib.ast();
    const id = apgJs.apgLib.ids;
    map((property) => (parser.ast.callbacks[astStringPropertyNames[property]] = astString(id, property)))(astStringProperties);
    parser.ast.callbacks.uri = astUri(id);
    parser.ast.callbacks.resources = astResources(id);
    const result = parser.parse(grammarApi, 'sign-in-with-tezos', message);
    if (!result.success) {
        throw new Error(`Invalid message: ${JSON.stringify(result)}`);
    }
    const elements = {};
    parser.ast.translate(elements);
    return elements;
};
const parseSIWTMessage = _parseSIWTMessage(generateGrammarApi(GRAMMAR));

/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
const NETWORK_IDS = {
    mainnet: 'NetXdQprcVkpaWU',
    ghostnet: 'NetXnHfVqm9iesp',
};
const TEZOS_SIGNED_MESSAGE_PREFIX = 'Tezos Signed Message: ';
const SIGN_IN_MESSAGE = 'wants you to sign in with your Tezos account:';
const OPTIONAL_MESSAGE_PROPERTIES = {
    uri: 'Uri',
    version: 'Version',
    chainId: 'Chain ID',
    nonce: 'Nonce',
    issuedAt: 'Issued At',
    expirationTime: 'Expiration Time',
    notBefore: 'Not Before',
    requestId: 'Request ID',
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const fetchWithTimeout = (resource_1, ...args_1) => __awaiter(void 0, [resource_1, ...args_1], void 0, function* (resource, userOptions = { timeout: 3000 }) {
    const defaultOptions = {
        timeout: 3000,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const options = Object.assign(Object.assign({}, defaultOptions), userOptions);
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options.timeout);
    try {
        const response = yield fetch(resource, Object.assign(Object.assign({}, options), { signal: controller.signal }));
        const data = yield response.json();
        return { data };
    }
    catch (error) {
        throw new Error('Fetching failed');
    }
    finally {
        clearTimeout(id);
    }
});
const http = fetchWithTimeout;

/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
ifElse(propEq('length', 1), join(''), pipe(join(', '), replace$1(/,([^,]*)$/, ' and$1')));
const generateMessageData = (messageData) => {
    const { domain, address } = messageData;
    if (!(messageData === null || messageData === void 0 ? void 0 : messageData.nonce) && !(messageData === null || messageData === void 0 ? void 0 : messageData.requestId) && !(messageData === null || messageData === void 0 ? void 0 : messageData.issuedAt)) {
        throw new Error('Invalid message format');
    }
    return pipe(mapObjIndexed((value, key) => (messageData[key] ? `${value}: ${messageData[key]}` : null)), values, unless(() => isEmpty(messageData === null || messageData === void 0 ? void 0 : messageData.statement) || isNil(messageData === null || messageData === void 0 ? void 0 : messageData.statement), prepend(`\n${messageData.statement}\n`)), prepend(address), prepend(`${domain} ${SIGN_IN_MESSAGE}`), unless(() => isEmpty(messageData === null || messageData === void 0 ? void 0 : messageData.resources) || isNil(messageData === null || messageData === void 0 ? void 0 : messageData.resources), messageData.resources &&
        append(pipe(addIndex(map)((resource, idx) => idx === 0 ? `Resources:\n- ${resource}` : `- ${resource}`), join('\n'))(messageData.resources))), reject(isNil))(OPTIONAL_MESSAGE_PROPERTIES);
};
const constructSignPayload = ({ payload, pkh }) => ({
    signingType: 'micheline',
    payload,
    sourceAddress: pkh,
});
const calculateLength = pipe(prop$1('length'), divide(__, 2), (length) => length.toString(16), (length) => `00000000${length}`, (length) => slice$1(length.length - 8, length.length)(length));
const packMessagePayload = (messageData) => pipe(prepend(TEZOS_SIGNED_MESSAGE_PREFIX), join('\n'), char2Bytes, (bytes) => ['05', '01', calculateLength(bytes), bytes], join(''))(messageData);
const unpackMessagePayload = (packedMessage) => {
    try {
        const prefix = packedMessage.slice(0, 4);
        const messageLength = parseInt(packedMessage.slice(4, 12), 16);
        const messageBytes = packedMessage.slice(12);
        const message = bytes2Char(packedMessage.slice(12));
        return {
            prefix,
            messageLength,
            message,
            messageBytes,
        };
    }
    catch (error) {
        throw new Error('Invalid message payload');
    }
};

/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
const _signIn = (http) => (apiUrl) => (payload) => http(`${apiUrl}/signin`, {
    method: 'POST',
    body: JSON.stringify(payload),
});
const signIn = _signIn(http);
const createMessagePayload = (signatureRequestData) => pipe(generateMessageData, packMessagePayload, objOf('payload'), assoc('pkh', prop$1('address')(signatureRequestData)), constructSignPayload)(signatureRequestData);
const verifySignature = verifySignature$1;
const parseMessage = pipe(replace$1(`${TEZOS_SIGNED_MESSAGE_PREFIX}\n`, ''), parseSIWTMessage);
const verify = (messagePayload, pk, signature, domain, nonce) => {
    const { message } = unpackMessagePayload(messagePayload);
    // verify signature
    if (!verifySignature(messagePayload, pk, signature)) {
        throw new Error('Invalid signature');
    }
    const parsedMessage = parseMessage(message);
    const { domain: messageDomain, nonce: messageNonce, issuedAt, accountAddress } = parsedMessage;
    // verify account address
    if (!validateAddress(accountAddress)) {
        throw new Error('Invalid account address');
    }
    // check if domain is valid
    if (domain !== messageDomain) {
        throw new Error('Invalid domain');
    }
    // check if nonce is valid
    if (nonce !== messageNonce) {
        throw new Error('Nonce mismatch');
    }
    const issuedAtDate = new Date(issuedAt);
    // check if issued at time is valid
    if (issuedAtDate.getTime() > Date.now()) {
        throw new Error('Invalid issued at time');
    }
    // check if message is expired
    if (has('expirationTime', parsedMessage)) {
        const expirationTime = new Date(prop$1('expirationTime')(parsedMessage));
        if (expirationTime.getTime() < issuedAtDate.getTime()) {
            throw new Error('Message expired');
        }
    }
    // check if message is already valid (not before)
    if (has('notBefore', parsedMessage)) {
        const notBefore = new Date(prop$1('notBefore')(parsedMessage));
        if (notBefore.getTime() > Date.now()) {
            throw new Error('Message not yet valid');
        }
    }
    return true;
};
const verifyLogin = verify;

export { NETWORK_IDS, _signIn, createMessagePayload, parseMessage, signIn, verify, verifyLogin, verifySignature };

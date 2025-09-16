"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.http = exports.fetchWithTimeout = void 0;
const tslib_1 = require("tslib");
const fetchWithTimeout = (resource_1, ...args_1) => tslib_1.__awaiter(void 0, [resource_1, ...args_1], void 0, function* (resource, options = { timeout: 3000 }) {
    const { timeout } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
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
exports.fetchWithTimeout = fetchWithTimeout;
exports.http = exports.fetchWithTimeout;
//# sourceMappingURL=http.js.map
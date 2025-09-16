"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPARISONS = exports.API_URLS = void 0;
/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
const ramda_1 = require("ramda");
const types_1 = require("../types");
exports.API_URLS = {
    mainnet: 'api.tzkt.io',
    ghostnet: 'api.ghostnet.tzkt.io',
};
exports.COMPARISONS = {
    [types_1.Comparator.eq]: ramda_1.equals,
    [types_1.Comparator.gte]: ramda_1.gte,
    [types_1.Comparator.lte]: ramda_1.lte,
    [types_1.Comparator.gt]: ramda_1.gt,
    [types_1.Comparator.lt]: ramda_1.lt,
    [types_1.Comparator.in]: ramda_1.includes,
    [types_1.Comparator.notIn]: (0, ramda_1.complement)(ramda_1.includes),
};
//# sourceMappingURL=index.js.map
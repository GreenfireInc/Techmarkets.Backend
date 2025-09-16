"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAccessControl = exports._queryAccessControl = void 0;
const tslib_1 = require("tslib");
/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
const ramda_1 = require("ramda");
const ts_pattern_1 = require("ts-pattern");
const api_1 = require("./api");
const types_1 = require("./types");
const utils_1 = require("./utils");
const _queryAccessControl = (deps) => (_a) => tslib_1.__awaiter(void 0, [_a], void 0, function* ({ query, allowlist = [], options = { timeout: 3000 }, }) {
    const { network = types_1.Network.ghostnet, parameters: { pkh }, test: { type }, } = query;
    const { getOwnedAssetsForPKH, getBalance, getTokenBalance, getAssetContractTypeByContract } = deps;
    try {
        const testResults = yield (0, ts_pattern_1.match)(type)
            .with(types_1.ConditionType.nft, () => (0, utils_1.validateNFTCondition)(getOwnedAssetsForPKH(options), (0, api_1.getAttributesFromStorage)(options), getAssetContractTypeByContract(options))(query))
            .with(types_1.ConditionType.xtzBalance, () => (0, utils_1.validateXTZBalanceCondition)(getBalance(options))(query))
            .with(types_1.ConditionType.tokenBalance, () => (0, utils_1.validateTokenBalanceCondition)(getTokenBalance(options))(query))
            .with(types_1.ConditionType.allowlist, () => (0, utils_1.validateAllowlistCondition)(allowlist)(query))
            .otherwise((0, ramda_1.always)(Promise.resolve({ passed: false })));
        return {
            network,
            pkh,
            testResults,
        };
    }
    catch (error) {
        console.log(error);
        throw new Error('Querying access failed. Check the logs for more details.');
    }
});
exports._queryAccessControl = _queryAccessControl;
exports.queryAccessControl = (0, exports._queryAccessControl)({
    getOwnedAssetsForPKH: api_1.getOwnedAssetsForPKH,
    getBalance: api_1.getBalance,
    getTokenBalance: api_1.getTokenBalance,
    getAttributesFromStorage: api_1.getAttributesFromStorage,
    getAssetContractTypeByContract: api_1.getAssetContractTypeByContract,
});
//# sourceMappingURL=acq.js.map
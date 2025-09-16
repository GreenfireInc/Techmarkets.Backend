"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatchingElements = exports.hexToAscii = exports.validateTimeConstraint = exports.validateAllowlistCondition = exports.validateTokenBalanceCondition = exports.validateXTZBalanceCondition = exports.validateNFTCondition = exports.denominate = exports.getOwnedAssetIds = exports.filterOwnedAssets = exports.determineContractAssetTypeFromLedger = exports.filterOwnedAssetsFromMultiAssetContract = exports.filterOwnedAssetsFromSingleAssetContract = exports.filterOwnedAssetsFromNFTAssetContract = void 0;
const tslib_1 = require("tslib");
/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
const utils_1 = require("@taquito/utils");
const ramda_1 = require("ramda");
const constants_1 = require("../constants");
const types_1 = require("../types");
const filterOwnedAssetsFromNFTAssetContract = (pkh) => (0, ramda_1.filter)((0, ramda_1.propEq)('value', pkh));
exports.filterOwnedAssetsFromNFTAssetContract = filterOwnedAssetsFromNFTAssetContract;
const filterOwnedAssetsFromSingleAssetContract = (pkh) => (0, ramda_1.filter)((0, ramda_1.propEq)('key', pkh));
exports.filterOwnedAssetsFromSingleAssetContract = filterOwnedAssetsFromSingleAssetContract;
const filterOwnedAssetsFromMultiAssetContract = (pkh, tokenIds) => (0, ramda_1.filter)((0, ramda_1.allPass)([
    (0, ramda_1.pathEq)(pkh, ['key', 'address']),
    (0, ramda_1.pipe)((0, ramda_1.pathOr)('', ['key', 'nat']), (tokenId) => (0, ramda_1.gt)((0, ramda_1.indexOf)(tokenId, tokenIds), -1)),
]));
exports.filterOwnedAssetsFromMultiAssetContract = filterOwnedAssetsFromMultiAssetContract;
exports.determineContractAssetTypeFromLedger = (0, ramda_1.pipe)(ramda_1.head, (0, ramda_1.cond)([
    [(0, ramda_1.pipe)((0, ramda_1.propOr)('', 'key'), utils_1.validateAddress, (0, ramda_1.equals)(3)), (0, ramda_1.always)(types_1.AssetContractType.single)],
    [(0, ramda_1.pipe)((0, ramda_1.propOr)('', 'value'), utils_1.validateAddress, (0, ramda_1.equals)(3)), (0, ramda_1.always)(types_1.AssetContractType.nft)],
    [(0, ramda_1.pipe)((0, ramda_1.pathOr)('', ['key', 'address']), utils_1.validateAddress, (0, ramda_1.equals)(3)), (0, ramda_1.always)(types_1.AssetContractType.multi)],
    [ramda_1.T, (0, ramda_1.always)(types_1.AssetContractType.unknown)],
]));
const filterOwnedAssets = (pkh, tokenIds) => (0, ramda_1.cond)([
    [
        (0, ramda_1.pipe)(exports.determineContractAssetTypeFromLedger, (0, ramda_1.equals)(types_1.AssetContractType.nft)),
        (0, exports.filterOwnedAssetsFromNFTAssetContract)(pkh),
    ],
    [
        (0, ramda_1.pipe)(exports.determineContractAssetTypeFromLedger, (0, ramda_1.equals)(types_1.AssetContractType.multi)),
        (0, exports.filterOwnedAssetsFromMultiAssetContract)(pkh, tokenIds),
    ],
    [
        (0, ramda_1.pipe)(exports.determineContractAssetTypeFromLedger, (0, ramda_1.equals)(types_1.AssetContractType.single)),
        (0, exports.filterOwnedAssetsFromSingleAssetContract)(pkh),
    ],
    [ramda_1.T, (0, ramda_1.always)([])],
]);
exports.filterOwnedAssets = filterOwnedAssets;
exports.getOwnedAssetIds = (0, ramda_1.cond)([
    [(0, ramda_1.pipe)(exports.determineContractAssetTypeFromLedger, (0, ramda_1.equals)(types_1.AssetContractType.nft)), (0, ramda_1.pipe)((0, ramda_1.map)((0, ramda_1.propOr)('', 'key')), ramda_1.uniq)],
    [
        (0, ramda_1.pipe)(exports.determineContractAssetTypeFromLedger, (0, ramda_1.equals)(types_1.AssetContractType.multi)),
        (0, ramda_1.pipe)((0, ramda_1.map)((0, ramda_1.pathOr)('', ['key', 'nat'])), ramda_1.uniq),
    ],
    [(0, ramda_1.pipe)(exports.determineContractAssetTypeFromLedger, (0, ramda_1.equals)(types_1.AssetContractType.single)), (0, ramda_1.pipe)((0, ramda_1.map)((0, ramda_1.propOr)('', 'value')), ramda_1.uniq)],
    [ramda_1.T, (0, ramda_1.always)([])],
]);
const denominate = ([x, y]) => (0, ramda_1.divide)(y, Math.pow(10, x));
exports.denominate = denominate;
const validateNFTCondition = (getOwnedAssetsForPKH, getAttributesFromStorage, getAssetContractTypeByContract) => ({ network = types_1.Network.ghostnet, parameters: { pkh }, test: { contractAddress, comparator, value, checkTimeConstraint = false, tokenIds = ['0'] }, }) => getAssetContractTypeByContract({
    contract: contractAddress,
    network,
}).then(assetContractType => getOwnedAssetsForPKH({
    network,
    contract: contractAddress,
    pkh: pkh,
    contractType: assetContractType,
})
    .then((assets) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (assets.length === 0) {
        return {
            passed: false,
            ownedTokenIds: [],
        };
    }
    const ownedAssetIds = (0, exports.getOwnedAssetIds)(assets);
    if (assetContractType === types_1.AssetContractType.multi) {
        const matchingAssets = (0, exports.findMatchingElements)(tokenIds, ownedAssetIds);
        if (matchingAssets.length === 0 ||
            !constants_1.COMPARISONS[comparator]((0, ramda_1.prop)('length')(matchingAssets))(value)) {
            return {
                passed: false,
                ownedTokenIds: ownedAssetIds,
            };
        }
    }
    if (checkTimeConstraint) {
        const attributes = yield getAttributesFromStorage({
            network,
            contract: contractAddress,
            tokenId: ownedAssetIds[0],
        });
        const validityAttribute = (0, ramda_1.find)(({ name }) => name === 'Valid Until')(attributes);
        if (!attributes.length ||
            !validityAttribute ||
            !(0, exports.validateTimeConstraint)(validityAttribute.value)) {
            return {
                passed: false,
                ownedTokenIds: ownedAssetIds,
            };
        }
    }
    return {
        passed: constants_1.COMPARISONS[comparator]((0, ramda_1.prop)('length')(assets))(value),
        ownedTokenIds: ownedAssetIds,
    };
}))
    .catch(() => ({
    passed: false,
    error: true,
})));
exports.validateNFTCondition = validateNFTCondition;
const validateXTZBalanceCondition = (getBalance) => ({ network = types_1.Network.ghostnet, parameters: { pkh }, test: { comparator, value } }) => getBalance &&
    getBalance({ network, contract: pkh })
        .then((balance) => ({
        balance,
        passed: constants_1.COMPARISONS[comparator](balance)(value),
    }))
        .catch(() => ({
        passed: false,
        error: true,
    }));
exports.validateXTZBalanceCondition = validateXTZBalanceCondition;
const validateTokenBalanceCondition = (getTokenBalance) => ({ network = types_1.Network.ghostnet, test: { contractAddress, comparator, value, tokenId }, parameters: { pkh }, }) => getTokenBalance &&
    getTokenBalance({
        network,
        contract: contractAddress,
        pkh: pkh,
        tokenId: tokenId,
    })
        .then((balance) => ({
        balance,
        passed: constants_1.COMPARISONS[comparator](balance)(value),
    }))
        .catch(() => ({
        passed: false,
        error: true,
    }));
exports.validateTokenBalanceCondition = validateTokenBalanceCondition;
const validateAllowlistCondition = (allowlist) => ({ parameters: { pkh }, test: { comparator } }) => ({
    passed: constants_1.COMPARISONS[comparator](pkh)(allowlist || []),
});
exports.validateAllowlistCondition = validateAllowlistCondition;
const validateTimeConstraint = (timestamp) => Date.now() / 1000 <= timestamp;
exports.validateTimeConstraint = validateTimeConstraint;
const hexToAscii = (hex) => {
    // convert hex to ascii
    let ascii = '';
    for (let n = 0; n < hex.length; n += 2) {
        ascii += String.fromCharCode(parseInt(hex.substring(n, n + 2), 16));
    }
    return ascii;
};
exports.hexToAscii = hexToAscii;
const findMatchingElements = (array1, array2) => (0, ramda_1.filter)((item) => (0, ramda_1.includes)(item, array2))(array1);
exports.findMatchingElements = findMatchingElements;
//# sourceMappingURL=utils.js.map
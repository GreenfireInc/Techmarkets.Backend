"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetContractTypeByContract = exports._getAssetContractTypeByContract = exports.getTokenBalance = exports._getTokenBalance = exports.getBalance = exports._getBalance = exports.getAttributesFromStorage = exports._getAttributesFromStorage = exports.getOwnedAssetsForPKH = exports._getOwnedAssetsForPKH = void 0;
/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
const ramda_1 = require("ramda");
const constants_1 = require("../constants");
const http_1 = require("../http");
const types_1 = require("../types");
const utils_1 = require("../utils");
const _getOwnedAssetsForPKH = (http) => (options) => ({ network, contract, pkh, contractType, }) => {
    let query = `key.address=${pkh}&value.gt=0`;
    if (contractType === types_1.AssetContractType.nft) {
        query = `value=${pkh}`;
    }
    if (contractType === types_1.AssetContractType.single) {
        query = `key=${pkh}`;
    }
    return (http(`https://${constants_1.API_URLS[network]}/v1/contracts/${contract}/bigmaps/ledger/keys?${query}`, options)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .then((0, ramda_1.pipe)((0, ramda_1.prop)('data'), (0, ramda_1.map)((0, ramda_1.pick)(['key', 'value']))))
        .catch(error => error));
};
exports._getOwnedAssetsForPKH = _getOwnedAssetsForPKH;
exports.getOwnedAssetsForPKH = (0, exports._getOwnedAssetsForPKH)(http_1.http);
const _getAttributesFromStorage = (http) => (options) => ({ network, contract, tokenId }) => http(`https://${constants_1.API_URLS[network]}/v1/contracts/${contract}/bigmaps/token_metadata/keys?limit=10000`, options)
    .then(({ data }) => {
    const metaDataUrl = (0, ramda_1.pipe)((0, ramda_1.find)((0, ramda_1.pathEq)(tokenId, ['value', 'token_id'])), (0, ramda_1.propOr)('', ''), utils_1.hexToAscii)(data);
    return http(metaDataUrl)
        .then((0, ramda_1.pathOr)([], ['data', 'attributes']))
        .catch(error => error);
})
    .catch(error => error);
exports._getAttributesFromStorage = _getAttributesFromStorage;
exports.getAttributesFromStorage = (0, exports._getAttributesFromStorage)(http_1.http);
const _getBalance = (http) => (options) => ({ network, contract }) => http(`https://${constants_1.API_URLS[network]}/v1/accounts/${contract}/balance`, options)
    .then((0, ramda_1.prop)('data'))
    .catch(error => error);
exports._getBalance = _getBalance;
exports.getBalance = (0, exports._getBalance)(http_1.http);
const _getTokenBalance = (http) => (options) => ({ network, contract, pkh, tokenId: tokenId = '0', }) => http(`https://${constants_1.API_URLS[network]}/v1/tokens/balances?account.eq=${pkh}&token.contract.eq=${contract}&token.tokenId.eq=${tokenId}`, options)
    .then((0, ramda_1.pipe)((0, ramda_1.pathOr)('0', ['data', 0]), (0, ramda_1.paths)([['metadata', 'decimals'], ['balance']]), (0, ramda_1.map)(parseInt), utils_1.denominate))
    .catch(error => error);
exports._getTokenBalance = _getTokenBalance;
exports.getTokenBalance = (0, exports._getTokenBalance)(http_1.http);
const _getAssetContractTypeByContract = (http) => (options) => ({ contract, network }) => http(`https://${constants_1.API_URLS[network]}/v1/contracts/${contract}/bigmaps/ledger/`, options)
    .then((0, ramda_1.pipe)((0, ramda_1.path)(['data', 'keyType']), (0, ramda_1.cond)([
    [(0, ramda_1.has)('schema:nat'), (0, ramda_1.always)(types_1.AssetContractType.nft)],
    [(0, ramda_1.has)('schema:object'), (0, ramda_1.always)(types_1.AssetContractType.multi)],
    [(0, ramda_1.has)('schema:address'), (0, ramda_1.always)(types_1.AssetContractType.single)],
    [ramda_1.T, (0, ramda_1.always)(types_1.AssetContractType.unknown)],
])))
    .catch(error => error);
exports._getAssetContractTypeByContract = _getAssetContractTypeByContract;
exports.getAssetContractTypeByContract = (0, exports._getAssetContractTypeByContract)(http_1.http);
//# sourceMappingURL=api.js.map
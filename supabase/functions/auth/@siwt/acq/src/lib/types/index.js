"use strict";
/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetContractType = exports.Comparator = exports.ConditionType = exports.Network = void 0;
var Network;
(function (Network) {
    Network["mainnet"] = "mainnet";
    Network["ghostnet"] = "ghostnet";
})(Network || (exports.Network = Network = {}));
var ConditionType;
(function (ConditionType) {
    ConditionType["nft"] = "nft";
    ConditionType["xtzBalance"] = "xtzBalance";
    ConditionType["tokenBalance"] = "tokenBalance";
    ConditionType["allowlist"] = "allowlist";
})(ConditionType || (exports.ConditionType = ConditionType = {}));
var Comparator;
(function (Comparator) {
    Comparator["eq"] = "=";
    Comparator["gte"] = ">=";
    Comparator["lte"] = "<=";
    Comparator["gt"] = ">";
    Comparator["lt"] = "<";
    Comparator["in"] = "IN";
    Comparator["notIn"] = "NOT IN";
})(Comparator || (exports.Comparator = Comparator = {}));
var AssetContractType;
(function (AssetContractType) {
    AssetContractType["single"] = "Single";
    AssetContractType["multi"] = "Multi";
    AssetContractType["nft"] = "Nft";
    AssetContractType["unknown"] = "Unknown";
})(AssetContractType || (exports.AssetContractType = AssetContractType = {}));
//# sourceMappingURL=index.js.map
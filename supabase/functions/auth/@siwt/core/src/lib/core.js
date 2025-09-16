"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siwt = exports._siwt = void 0;
/*
 * Copyright (C) 2022, vDL Digital Ventures GmbH <info@vdl.digital>
 *
 * SPDX-License-Identifier: MIT
 */
const jwt = require("jsonwebtoken");
const constants_1 = require("./constants");
const _siwt = (jwt) => ({ accessTokenSecret, refreshTokenSecret, idTokenSecret, accessTokenExpiration, refreshTokenExpiration, idTokenExpiration, }) => ({
    generateIdToken: ({ pkh, claims = {}, userInfo = {} }) => jwt.sign(Object.assign(Object.assign(Object.assign({}, claims), { pkh }), userInfo), idTokenSecret, { expiresIn: idTokenExpiration || constants_1.ID_TOKEN_EXPIRATION }),
    generateAccessToken: ({ pkh, claims = {} }) => jwt.sign(Object.assign(Object.assign({}, claims), { sub: pkh }), accessTokenSecret, { expiresIn: accessTokenExpiration || constants_1.ACCESS_TOKEN_EXPIRATION }),
    generateRefreshToken: ({ pkh }) => jwt.sign({ pkh }, refreshTokenSecret, { expiresIn: refreshTokenExpiration || constants_1.REFRESH_TOKEN_EXPIRATION }),
    verifyAccessToken: (accessToken) => {
        try {
            const { sub } = jwt.verify(accessToken, accessTokenSecret);
            return sub;
        }
        catch (_a) {
            return false;
        }
    },
    verifyRefreshToken: (refreshToken) => jwt.verify(refreshToken, refreshTokenSecret),
});
exports._siwt = _siwt;
exports.siwt = (0, exports._siwt)(jwt);
//# sourceMappingURL=core.js.map
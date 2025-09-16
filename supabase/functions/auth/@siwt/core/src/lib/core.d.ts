import { SIWTConfig, TokenPayload } from './types';
export declare const _siwt: (jwt: any) => ({ accessTokenSecret, refreshTokenSecret, idTokenSecret, accessTokenExpiration, refreshTokenExpiration, idTokenExpiration, }: SIWTConfig) => {
    generateIdToken: ({ pkh, claims, userInfo }: TokenPayload) => any;
    generateAccessToken: ({ pkh, claims }: TokenPayload) => any;
    generateRefreshToken: ({ pkh }: TokenPayload) => any;
    verifyAccessToken: (accessToken: string) => any;
    verifyRefreshToken: (refreshToken: string) => any;
};
export declare const siwt: ({ accessTokenSecret, refreshTokenSecret, idTokenSecret, accessTokenExpiration, refreshTokenExpiration, idTokenExpiration, }: SIWTConfig) => {
    generateIdToken: ({ pkh, claims, userInfo }: TokenPayload) => any;
    generateAccessToken: ({ pkh, claims }: TokenPayload) => any;
    generateRefreshToken: ({ pkh }: TokenPayload) => any;
    verifyAccessToken: (accessToken: string) => any;
    verifyRefreshToken: (refreshToken: string) => any;
};

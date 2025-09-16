import { AccessControlQuery, AssetContractType, GetAssetContractTypeByContract, GetAttributesFromStorage, GetBalance, GetOwnedAssetsForPKH, GetTokenBalance } from '../types';
export declare const filterOwnedAssetsFromNFTAssetContract: (pkh: string) => <P extends Record<string, string>, C extends readonly P[] | Record<string, P>>(collection: C) => C;
export declare const filterOwnedAssetsFromSingleAssetContract: (pkh: string) => <P extends Record<string, string>, C extends readonly P[] | Record<string, P>>(collection: C) => C;
export declare const filterOwnedAssetsFromMultiAssetContract: (pkh: string, tokenIds: string[]) => <P extends any, C extends readonly P[] | Record<string, P>>(collection: C) => C;
export declare const determineContractAssetTypeFromLedger: (list: readonly unknown[]) => AssetContractType;
export declare const filterOwnedAssets: (pkh: string, tokenIds: string[]) => (list: readonly unknown[]) => never[];
export declare const getOwnedAssetIds: (list: readonly unknown[]) => unknown[];
export declare const denominate: ([x, y]: number[]) => number;
export declare const validateNFTCondition: (getOwnedAssetsForPKH: GetOwnedAssetsForPKH, getAttributesFromStorage: GetAttributesFromStorage, getAssetContractTypeByContract: GetAssetContractTypeByContract) => ({ network, parameters: { pkh }, test: { contractAddress, comparator, value, checkTimeConstraint, tokenIds }, }: AccessControlQuery) => Promise<{
    passed: any;
    ownedTokenIds: unknown[];
} | {
    passed: boolean;
    error: boolean;
}>;
export declare const validateXTZBalanceCondition: (getBalance: GetBalance) => ({ network, parameters: { pkh }, test: { comparator, value } }: AccessControlQuery) => Promise<{
    balance: number;
    passed: any;
} | {
    passed: boolean;
    error: boolean;
}>;
export declare const validateTokenBalanceCondition: (getTokenBalance: GetTokenBalance) => ({ network, test: { contractAddress, comparator, value, tokenId }, parameters: { pkh }, }: AccessControlQuery) => Promise<{
    balance: number;
    passed: any;
} | {
    passed: boolean;
    error: boolean;
}>;
export declare const validateAllowlistCondition: (allowlist: string[]) => ({ parameters: { pkh }, test: { comparator } }: AccessControlQuery) => {
    passed: any;
};
export declare const validateTimeConstraint: (timestamp: number) => boolean;
export declare const hexToAscii: (hex: string) => string;
export declare const findMatchingElements: (array1: unknown[], array2: any[]) => unknown[];

import { AssetContractType, HTTP, Network, Options } from '../types';
export declare const _getOwnedAssetsForPKH: (http: HTTP) => (options?: Options) => ({ network, contract, pkh, contractType, }: {
    network: "mainnet" | "ghostnet";
    contract: string;
    pkh: string;
    contractType: AssetContractType;
}) => Promise<any>;
export declare const getOwnedAssetsForPKH: (options?: Options) => ({ network, contract, pkh, contractType, }: {
    network: "mainnet" | "ghostnet";
    contract: string;
    pkh: string;
    contractType: AssetContractType;
}) => Promise<any>;
export declare const _getAttributesFromStorage: (http: HTTP) => (options?: Options) => ({ network, contract, tokenId }: {
    network: Network;
    contract: string;
    tokenId: string;
}) => Promise<any>;
export declare const getAttributesFromStorage: (options?: Options) => ({ network, contract, tokenId }: {
    network: Network;
    contract: string;
    tokenId: string;
}) => Promise<any>;
export declare const _getBalance: (http: HTTP) => (options?: Options) => ({ network, contract }: {
    network: Network;
    contract: string;
}) => Promise<any>;
export declare const getBalance: (options?: Options) => ({ network, contract }: {
    network: Network;
    contract: string;
}) => Promise<any>;
export declare const _getTokenBalance: (http: HTTP) => (options?: Options) => ({ network, contract, pkh, tokenId: tokenId, }: {
    network: Network;
    contract: string;
    pkh: string;
    tokenId: string;
}) => Promise<any>;
export declare const getTokenBalance: (options?: Options) => ({ network, contract, pkh, tokenId: tokenId, }: {
    network: Network;
    contract: string;
    pkh: string;
    tokenId: string;
}) => Promise<any>;
export declare const _getAssetContractTypeByContract: (http: HTTP) => (options?: Options) => ({ contract, network }: {
    contract: string;
    network: Network;
}) => Promise<any>;
export declare const getAssetContractTypeByContract: (options?: Options) => ({ contract, network }: {
    contract: string;
    network: Network;
}) => Promise<any>;

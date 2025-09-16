import { AccessControlQuery, AccessControlQueryDependencies, Network, Options } from './types';
export declare const _queryAccessControl: (deps: AccessControlQueryDependencies) => ({ query, allowlist, options, }: {
    query: AccessControlQuery;
    allowlist?: string[];
    options?: Options;
}) => Promise<{
    network: Network;
    pkh: string | undefined;
    testResults: {
        passed: any;
        ownedTokenIds: unknown[];
    } | {
        passed: boolean;
        error: boolean;
    } | {
        balance: number;
        passed: any;
    } | {
        passed: boolean;
        error: boolean;
    } | {
        passed: any;
    } | {
        passed: boolean;
    };
}>;
export declare const queryAccessControl: ({ query, allowlist, options, }: {
    query: AccessControlQuery;
    allowlist?: string[];
    options?: Options;
}) => Promise<{
    network: Network;
    pkh: string | undefined;
    testResults: {
        passed: any;
        ownedTokenIds: unknown[];
    } | {
        passed: boolean;
        error: boolean;
    } | {
        balance: number;
        passed: any;
    } | {
        passed: boolean;
        error: boolean;
    } | {
        passed: any;
    } | {
        passed: boolean;
    };
}>;

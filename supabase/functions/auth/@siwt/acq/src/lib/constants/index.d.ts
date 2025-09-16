import { equals, gt, gte, includes, lt, lte } from 'ramda';
export declare const API_URLS: {
    mainnet: string;
    ghostnet: string;
};
export declare const COMPARISONS: {
    "=": typeof equals;
    ">=": typeof gte;
    "<=": typeof lte;
    ">": typeof gt;
    "<": typeof lt;
    IN: typeof includes;
    "NOT IN": (target: unknown, list: readonly unknown[]) => boolean;
};

/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../../sys/sys-internal-api';

export interface ScanMatch<T> {
    readonly index: Integer;
    readonly value: T;
    rankScore: number;
}

export namespace ScanMatch {
    export const enum FieldId {
        Index,
        Value,
        RankScore,
    }
}

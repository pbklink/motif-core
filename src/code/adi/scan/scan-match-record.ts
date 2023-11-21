/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export interface ScanMatchRecord<T> {
    readonly value: T;
    readonly rankScore: number;
}

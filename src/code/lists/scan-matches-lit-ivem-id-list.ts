/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { LockOpenListItem } from '../sys/lock-open-list-item';
import { AssertInternalError } from '../sys/sys-internal-api';
import { Guid } from '../sys/types';
import { LitIvemIdList } from './lit-ivem-id-list';

export class ScanMatchesLitIvemIdList implements LitIvemIdList {
    readonly publicCanModify = false;
    index: number;

    public readonly upperCaseName: string;

    constructor(
        public readonly id: Guid,
        public readonly name: string,
        public readonly scanId: string,
    ) {
        this.upperCaseName = name.toUpperCase();
    }

    equals(other: LockOpenListItem): boolean {
        return this.id === other.id;
    }

    lock(): void {
        // no code
    }
    unlock(): void {
        // no code
    }

    open(): void {
        // subscribe matches dataitem
    }
    close(): void {
        // unsubscribe dataitem
    }

    publicAdd(_litIvemId: LitIvemId): void {
        throw new AssertInternalError('SCLIILPA13988');
    }
    publicAddArray(_litIvemId: LitIvemId[]): void {
        throw new AssertInternalError('SCLIILPAA13988');
    }
    publicRemoveAt(_index: number, _count: number): void {
        throw new AssertInternalError('SCLIILPRA13988');
    }
    publicClear() {
        throw new AssertInternalError('SCLIILPC13988');
    }
}

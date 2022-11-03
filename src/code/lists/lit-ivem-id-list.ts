/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { Integer, LockOpenListItem } from '../sys/sys-internal-api';

export interface LitIvemIdList extends LockOpenListItem {
    readonly publicCanModify: boolean;

    publicAdd(litIvemId: LitIvemId): void;
    publicAddArray(litIvemId: LitIvemId[]): void;
    publicRemoveAt(index: Integer, count: Integer): void;
    publicClear(): void;
}

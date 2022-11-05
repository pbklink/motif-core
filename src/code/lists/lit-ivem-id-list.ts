/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { BadnessList, Integer, JsonElement, LockOpenListItem } from '../sys/sys-internal-api';

export interface LitIvemIdList extends LockOpenListItem, BadnessList<LitIvemId> {
    readonly userCanAdd: boolean;
    readonly userCanRemove: boolean;
    readonly userCanMove: boolean;

    saveToJson(element: JsonElement): void;

    userAdd(litIvemId: LitIvemId): void;
    userAddArray(litIvemId: LitIvemId[]): void;
    userRemoveAt(index: Integer, count: Integer): void;
    userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void;
}

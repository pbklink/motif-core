/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { RankedLitIvemId } from '../adi/scan/ranked-lit-ivem-id';
import { BadnessList, Integer, LockOpenListItem, Result } from '../sys/internal-api';
import { RankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition';

/** @public */
export interface RankedLitIvemIdList extends BadnessList<RankedLitIvemId> {
    readonly typeId: RankedLitIvemIdListDefinition.TypeId;

    readonly name: string;
    readonly description: string;
    readonly category: string;

    readonly userCanAdd: boolean;
    readonly userCanReplace: boolean;
    readonly userCanRemove: boolean;
    readonly userCanMove: boolean;

    createDefinition(): RankedLitIvemIdListDefinition;

    tryLock(_locker: LockOpenListItem.Locker): Promise<Result<void>>;
    unlock(_locker: LockOpenListItem.Locker): void;

    openLocked(opener: LockOpenListItem.Opener): void;
    closeLocked(opener: LockOpenListItem.Opener): void;

    userAdd(litIvemId: LitIvemId): Integer;
    userAddArray(litIvemId: LitIvemId[]): void;
    userReplaceAt(index: Integer, litIvemId: LitIvemId[]): void;
    userRemoveAt(index: Integer, count: Integer): void;
    userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void;
}

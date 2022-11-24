/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { BadnessList, Integer, LockOpenListItem } from '../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition';
import { RankedLitIvemId } from './ranked-lit-ivem-id';

export interface RankedLitIvemIdList extends BadnessList<RankedLitIvemId> {
    readonly definition: RankedLitIvemIdListDefinition;

    readonly userCanAdd: boolean;
    readonly userCanRemove: boolean;
    readonly userCanMove: boolean;

    open(opener: LockOpenListItem.Opener): void;
    close(opener: LockOpenListItem.Opener): void;

    userAdd(litIvemId: LitIvemId): void;
    userAddArray(litIvemId: LitIvemId[]): void;
    userRemoveAt(index: Integer, count: Integer): void;
    userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void;
}

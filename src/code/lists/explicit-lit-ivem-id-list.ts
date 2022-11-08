/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { LockOpenListItem } from '../sys/lock-open-list-item';
import { AssertInternalError, Badness, BadnessList, MultiEvent } from '../sys/sys-internal-api';
import { Guid } from '../sys/types';
import { LitIvemIdList } from './lit-ivem-id-list';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

export class ExplicitLitIvemIdList implements LitIvemIdList {
    index: number;

    public readonly upperCaseName: string;

    private readonly _litIvemIds = new Array<LitIvemId>();

    constructor(
        public readonly id: Guid,
        public readonly name: string,
        public readonly scanId: string,
    ) {
        this.upperCaseName = name.toUpperCase();
    }
    userCanAdd: boolean;
    userCanRemove: boolean;
    userCanMove: boolean;
    createDefinition(): LitIvemIdListDefinition {
        throw new Error('Method not implemented.');
    }
    userMoveAt(fromIndex: number, count: number, toIndex: number): void {
        throw new Error('Method not implemented.');
    }
    open(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    close(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    usable: boolean;
    badness: Badness;
    count: number;
    subscribeBadnessChangeEvent(handler: BadnessList.BadnessChangeEventHandler): number {
        throw new Error('Method not implemented.');
    }
    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        throw new Error('Method not implemented.');
    }
    subscribeListChangeEvent(handler: BadnessList.ListChangeEventHandler): number {
        throw new Error('Method not implemented.');
    }
    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        throw new Error('Method not implemented.');
    }

    getAt(index: number): LitIvemId {
        return this._litIvemIds[index];
    }

    equals(other: LockOpenListItem): boolean {
        return this.id === other.id;
    }

    processFirstLock(): void {
        // no code
    }
    processLastUnlock(): void {
        // no code
    }

    processFirstOpen(): void {
        // no action
    }
    processLastClose(): void {
        // no action
    }

    userAdd(_litIvemId: LitIvemId): void {
        throw new AssertInternalError('SCLIILPA13988');
    }
    userAddArray(_litIvemId: LitIvemId[]): void {
        throw new AssertInternalError('SCLIILPAA13988');
    }
    userRemoveAt(_index: number, _count: number): void {
        throw new AssertInternalError('SCLIILPRA13988');
    }
    userClear() {
        throw new AssertInternalError('SCLIILPC13988');
    }

}

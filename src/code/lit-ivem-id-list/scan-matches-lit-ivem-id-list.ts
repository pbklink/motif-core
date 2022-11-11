/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { LockOpenListItem } from '../sys/lock-open-list-item';
import { AssertInternalError, Badness, BadnessList, MultiEvent } from '../sys/sys-internal-api';
import { Guid } from '../sys/types';
import { LitIvemIdListDefinition } from './definition/lit-ivem-id-list-definition';
import { LitIvemIdList } from './lit-ivem-id-list';

export class ScanMatchesLitIvemIdList implements LitIvemIdList {
    index: number;

    public readonly upperCaseName: string;

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
    badness: Badness;
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
    count: number;
    getAt(index: number): LitIvemId {
        throw new Error('Method not implemented.');
    }
    usable: boolean;

    open(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    close(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    equals(other: LockOpenListItem): boolean {
        return this.id === other.id;
    }

    tryProcessFirstLock() {
        return false;
    }
    processLastUnlock(): void {
        // no code
    }

    processFirstOpen(): void {
        // subscribe matches dataitem
    }
    processLastClose(): void {
        // unsubscribe dataitem
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
}

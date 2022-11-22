/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { Badness, BadnessList, CorrectnessId, CorrectnessRecord, LockOpenListItem, MultiEvent, RecordList, Result } from '../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition';
import { ScanMatchesRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { RankedLitIvemId } from './ranked-lit-ivem-id';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';

export class ScanMatchesRankedLitIvemIdList implements RankedLitIvemIdList {
    readonly mapKey: string;
    index: number;

    public readonly upperCaseName: string;

    constructor(readonly definition: ScanMatchesRankedLitIvemIdListDefinition) {
        this.upperCaseName = definition.scanId.toUpperCase(); // name?
        this.mapKey = definition.scanId;
    }
    userCanAdd: boolean;
    userCanRemove: boolean;
    userCanMove: boolean;
    createDefinition(): RankedLitIvemIdListDefinition {
        throw new Error('Method not implemented.');
    }
    userAdd(litIvemId: LitIvemId): void {
        throw new Error('Method not implemented.');
    }
    userAddArray(litIvemId: LitIvemId[]): void {
        throw new Error('Method not implemented.');
    }
    userRemoveAt(index: number, count: number): void {
        throw new Error('Method not implemented.');
    }
    userMoveAt(fromIndex: number, count: number, toIndex: number): void {
        throw new Error('Method not implemented.');
    }
    openLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void, string> {
        throw new Error('Method not implemented.');
    }
    processLastUnlock(locker: LockOpenListItem.Locker): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstOpen(opener: LockOpenListItem.Opener): Result<void, string> {
        throw new Error('Method not implemented.');
    }
    processLastClose(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    equals(other: LockOpenListItem): boolean {
        throw new Error('Method not implemented.');
    }
    correctnessId: CorrectnessId;
    subscribeCorrectnessChangedEvent(handler: CorrectnessRecord.CorrectnessChangedEventHandler): number {
        throw new Error('Method not implemented.');
    }
    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        throw new Error('Method not implemented.');
    }
    badness: Badness;
    subscribeBadnessChangeEvent(handler: BadnessList.BadnessChangeEventHandler): number {
        throw new Error('Method not implemented.');
    }
    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        throw new Error('Method not implemented.');
    }
    usable: boolean;
    count: number;
    getAt(index: number): RankedLitIvemId {
        throw new Error('Method not implemented.');
    }
    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): number {
        throw new Error('Method not implemented.');
    }
    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        throw new Error('Method not implemented.');
    }
}

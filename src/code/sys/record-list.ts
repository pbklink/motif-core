/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from './multi-event';
import { Integer } from './types';
import { UsableListChangeTypeId } from './usable-list-change-type';

export interface RecordList<Record> {
    readonly count: Integer;

    indexOf(record: Record): Integer;
    getAt(index: Integer): Record;

    toArray(): readonly Record[];

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace RecordList {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) => void;
}

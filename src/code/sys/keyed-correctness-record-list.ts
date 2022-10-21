/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from './badness';
import { CorrectnessId } from './correctness';
import { CorrectnessBadness } from './correctness-badness';
import { KeyedCorrectnessRecord } from './keyed-correctness-record';
import { MultiEvent } from './multi-event';
import { Integer, MapKey, UsableListChangeTypeId } from './types';

export interface KeyedCorrectnessRecordList<Record extends KeyedCorrectnessRecord> {
    readonly usable: boolean;
    readonly correctnessId: CorrectnessId;
    readonly badness: Badness;

    readonly count: Integer;
    readonly records: Record[];

    getRecordByMapKey(key: MapKey): Record | undefined;

    subscribeBadnessChangeEvent(handler: CorrectnessBadness.BadnessChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeListChangeEvent(handler: KeyedCorrectnessRecordList.ListChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeBeforeRecordChangeEvent(handler: KeyedCorrectnessRecordList.BeforeRecordChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBeforeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeAfterRecordChangedEvent(handler: KeyedCorrectnessRecordList.AfterRecordChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeAfterRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace KeyedCorrectnessRecordList {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) => void;
    export type BeforeRecordChangeEventHandler = (this: void, index: Integer) => void;
    export type AfterRecordChangedEventHandler = (this: void, index: Integer) => void;
}

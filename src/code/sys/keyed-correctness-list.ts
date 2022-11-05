/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from './badness-list';
import { CorrectnessId } from './correctness';
import { KeyedCorrectnessListItem } from './keyed-correctness-list-item';
import { MultiEvent } from './multi-event';
import { Integer, MapKey } from './types';

export interface KeyedCorrectnessList<Record extends KeyedCorrectnessListItem> extends BadnessList<Record> {
    readonly correctnessId: CorrectnessId;
    readonly records: Record[];

    getRecordByMapKey(key: MapKey): Record | undefined;

    subscribeBeforeRecordChangeEvent(handler: KeyedCorrectnessList.BeforeRecordChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBeforeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeAfterRecordChangedEvent(handler: KeyedCorrectnessList.AfterRecordChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeAfterRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace KeyedCorrectnessList {
    export type BeforeRecordChangeEventHandler = (this: void, index: Integer) => void;
    export type AfterRecordChangedEventHandler = (this: void, index: Integer) => void;
}

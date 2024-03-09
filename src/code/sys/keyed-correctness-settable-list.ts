/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from './badness-list';
import { KeyedCorrectnessSettableListItem } from './keyed-correctness-settable-list-item';
import { MultiEvent } from './multi-event';
import { Integer, MapKey } from './xiltyix-sysutils';

export interface KeyedCorrectnessSettableList<Record extends KeyedCorrectnessSettableListItem> extends BadnessList<Record> {
    readonly records: Record[];

    getRecordByMapKey(key: MapKey): Record | undefined;

    subscribeBeforeRecordChangeEvent(handler: KeyedCorrectnessSettableList.BeforeRecordChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBeforeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeAfterRecordChangedEvent(handler: KeyedCorrectnessSettableList.AfterRecordChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeAfterRecordChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace KeyedCorrectnessSettableList {
    export type BeforeRecordChangeEventHandler = (this: void, index: Integer) => void;
    export type AfterRecordChangedEventHandler = (this: void, index: Integer) => void;
}

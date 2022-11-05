/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from './badness';
import { MultiEvent } from './multi-event';
import { Integer, UsableListChangeTypeId } from './types';

export interface BadnessList<Record> {
    readonly usable: boolean;
    readonly badness: Badness;
    readonly count: Integer;

    getAt(index: Integer): Record;

    subscribeBadnessChangeEvent(handler: BadnessList.BadnessChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeListChangeEvent(handler: BadnessList.ListChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace BadnessList {
    export type BadnessChangeEventHandler = (this: void) => void;
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) => void;
}

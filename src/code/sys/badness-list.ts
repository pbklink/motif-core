/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from './badness';
import { MultiEvent } from './multi-event';
import { UsableList } from './usable-list';

export interface BadnessList<Record> extends UsableList<Record> {
    readonly badness: Badness;

    subscribeBadnessChangeEvent(handler: BadnessList.BadnessChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace BadnessList {
    export type BadnessChangeEventHandler = (this: void) => void;
}

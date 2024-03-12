/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from './badness';
import { UsableList } from './usable-list';
import { MultiEvent } from './xiltyix-sysutils';

export interface BadnessList<Record> extends UsableList<Record> {
    readonly badness: Badness;

    subscribeBadnessChangeEvent(handler: BadnessList.BadnessChangeEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace BadnessList {
    export type BadnessChangeEventHandler = (this: void) => void;
}

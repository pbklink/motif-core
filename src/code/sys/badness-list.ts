/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from './badness';
import { UsableList } from './usable-list';
import { MultiEvent } from './xilytix-sysutils';

export interface BadnessList<Record> extends UsableList<Record> {
    readonly badness: Badness;

    subscribeBadnessChangedEvent(handler: BadnessList.badnessChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBadnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace BadnessList {
    export type badnessChangedEventHandler = (this: void) => void;
}

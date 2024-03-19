/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from './xilytix-sysutils';

export interface CorrectnessState<Badness> {
    badness: Badness;
    usable: boolean;

    setUsable(badness: Badness): void;
    setUnusable(badness: Badness): void;
    checkSetUnusable(badness: Badness): void;

    subscribeUsableChangedEvent(handler: CorrectnessState.UsableChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeUsableChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeBadnessChangedEvent(handler: CorrectnessState.BadnessChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeBadnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace CorrectnessState {
    export type UsableChangedEventHandler = (this: void) => void;
    export type BadnessChangedEventHandler = (this: void) => void;
}

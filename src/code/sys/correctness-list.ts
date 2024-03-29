/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId } from './correctness';
import { UsableList } from './usable-list';
import { MultiEvent } from './xilytix-sysutils';

/** @public */
export interface CorrectnessList<Record> extends UsableList<Record> {
    readonly correctnessId: CorrectnessId;

    subscribeCorrectnessChangedEvent(handler: CorrectnessList.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

/** @public */
export namespace CorrectnessList {
    export type CorrectnessChangedEventHandler = (this: void) => void;
}

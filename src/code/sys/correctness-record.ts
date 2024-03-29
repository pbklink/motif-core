/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId } from './correctness';
import { MultiEvent } from './xilytix-sysutils';

export interface CorrectnessRecord {
    readonly correctnessId: CorrectnessId;

    subscribeCorrectnessChangedEvent(handler: CorrectnessRecord.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace CorrectnessRecord {
    export type CorrectnessChangedEventHandler = (this: void) => void;
}

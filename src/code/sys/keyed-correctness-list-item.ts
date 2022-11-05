/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId } from './correctness';
import { MultiEvent } from './multi-event';
import { MapKey } from './types';

export interface KeyedCorrectnessListItem {
    readonly correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    createKey(): KeyedCorrectnessListItem.Key;

    dispose(): void;
    setListCorrectness(value: CorrectnessId): void;

    subscribeCorrectnessChangedEvent(handler: KeyedCorrectnessListItem.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace KeyedCorrectnessListItem {
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export interface Key {
        readonly mapKey: MapKey;
        // saveToJson(element: JsonElement): void;
    }
}

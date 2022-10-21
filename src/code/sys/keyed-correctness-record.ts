/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId } from './correctness';
import { JsonElement } from './json-element';
import { MultiEvent } from './multi-event';
import { MapKey } from './types';

export interface KeyedCorrectnessRecord {
    readonly correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    createKey(): KeyedCorrectnessRecord.Key;

    dispose(): void;
    setListCorrectness(value: CorrectnessId): void;

    subscribeCorrectnessChangedEvent(handler: KeyedCorrectnessRecord.CorrectnessChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace KeyedCorrectnessRecord {
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export interface Key {
        readonly mapKey: MapKey;
        saveToJson(element: JsonElement): void;
    }
}

/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId, KeyedCorrectnessRecord, MapKey, MultiEvent } from '../sys/sys-internal-api';
import { LitIvemIdMatchesDataMessage } from './common/adi-common-internal-api';
import { MatchRecord } from './match-record';

/** @public */
export abstract class Match implements MatchRecord {
    abstract readonly mapKey: MapKey;

    private _target: string;
    private _correctnessChangedMultiEvent = new MultiEvent<Match.CorrectnessChangedEventHandler>();

    constructor(
        change: LitIvemIdMatchesDataMessage.AddUpdateChange,
        private _correctnessId: CorrectnessId
    ) {
        this._target = change.target;
    }

    get target() { return this._target; }
    get correctnessId() { return this._correctnessId; }

    dispose() {
        // no resources to release
    }

    abstract createKey(): KeyedCorrectnessRecord.Key;


    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: LitIvemIdMatchesDataMessage.AddUpdateChange) {
        this._target = change.target;
    }

    subscribeCorrectnessChangedEvent(handler: KeyedCorrectnessRecord.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }
}

/** @public */
export namespace Match {
    export type CorrectnessChangedEventHandler = (this: void) => void;
}

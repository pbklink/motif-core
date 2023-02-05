/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId, CorrectnessRecord, KeyedRecord, MapKey, MultiEvent } from '../sys/sys-internal-api';
import { MatchesDataMessage } from './common/adi-common-internal-api';
import { MatchRecord } from './match-record';

/** @public */
export abstract class Match implements MatchRecord {
    readonly target: string;
    rankScore: number;

    private _correctnessChangedMultiEvent = new MultiEvent<CorrectnessRecord.CorrectnessChangedEventHandler>();
    private _rankScoreChangedMultiEvent = new MultiEvent<Match.rankScoreChangedEventHandler>();

    abstract readonly mapKey: MapKey;

    constructor(
        change: MatchesDataMessage.AddUpdateChange,
        private _correctnessId: CorrectnessId
    ) {
        this.target = change.target;
        this.rankScore = change.rankScore;
    }

    get correctnessId(): CorrectnessId { return this._correctnessId; }

    dispose() {
        // no resources to release
    }

    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: MatchesDataMessage.AddUpdateChange) {
        if (change.rankScore !== this.rankScore) {
            this.notifyrankScoreChanged();
        }
    }

    subscriberankScoreChangedEvent(handler: Match.rankScoreChangedEventHandler) {
        return this._rankScoreChangedMultiEvent.subscribe(handler);
    }

    unsubscriberankScoreChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._rankScoreChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Match.rankScoreChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyrankScoreChanged() {
        const handlers = this._rankScoreChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    abstract createKey(): KeyedRecord.Key;
}

/** @public */
export namespace Match {
    export type rankScoreChangedEventHandler = (this: void) => void;
}

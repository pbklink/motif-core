import { CorrectnessId, JsonElement, MapKey, MultiEvent } from '../sys/sys-internal-api';
import { MatchesDataMessage } from './adi-internal-api';
import { DataRecord } from './data-record';
import { MatchRecord } from './match-record';

export class Match implements MatchRecord {
    readonly target: string;

    // DataRecord implementation
    correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    private _changedMultiEvent = new MultiEvent<Match.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Match.CorrectnessChangedEventHandler>();

    constructor(
        change: MatchesDataMessage.AddUpdateChange,
        private _correctnessId: CorrectnessId
    ) {
        this.target = change.target;
    }

    dispose() {
        // no resources to release
    }

    createKey(): Match.Key {
        return new Match.Key(this.mapKey);
    }


    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: MatchesDataMessage.AddUpdateChange) {
        const valueChanges = new Array<Order.ValueChange>(Order.Field.count);
        let changedIdx = 0;
    }

    subscribeCorrectnessChangedEvent(handler: DataRecord.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(valueChanges: Match.ValueChange[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](valueChanges);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }


}

export namespace Match {
    export type ChangedEventHandler = (this: void) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export class Key implements DataRecord.Key {
        constructor(public readonly mapKey: string) {

        }

        saveToJson(element: JsonElement): void {
            // not currently used
        }
    }
}

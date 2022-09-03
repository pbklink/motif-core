import { CorrectnessId } from '../sys/sys-internal-api';
import { LitIvemId, MatchesDataMessage } from './common/adi-common-internal-api';
import { Match } from './match';
import { MatchRecord } from './match-record';

export class SymbolMatch extends Match implements MatchRecord {
    constructor(
        change: MatchesDataMessage.AddUpdateChange,
        correctnessId: CorrectnessId
    ) {
        const symbol = new LitIvemId()
        super(change, correctnessId);
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


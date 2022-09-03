import { CorrectnessId, JsonElement, MapKey, MultiEvent } from '../sys/sys-internal-api';
import { BooleanScanCriteriaNode, LitIvemId, MarketId, ScanMetaData, ScanTargetTypeId } from './common/adi-common-internal-api';
import { DataRecord } from './data-record';

export class Scan implements DataRecord {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly metaData: Scan.MetaData;
    readonly isWritable: boolean;
    readonly criteria: BooleanScanCriteriaNode;
    readonly targetTypeId: ScanTargetTypeId;
    readonly targetMarketIds: readonly MarketId[] | undefined;
    readonly targetLitIvemIds: readonly LitIvemId[] | undefined;

    // DataRecord implementation
    correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    private _changedMultiEvent = new MultiEvent<Scan.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Scan.CorrectnessChangedEventHandler>();

    constructor(
        change: ScansDataMessage.AddChange,
        private _correctnessId: CorrectnessId
    ) {
        this.mapKey = id;
    }

    dispose() {
        // no resources to release
    }

    createKey(): Scan.Key {
        return new Scan.Key(this.id);
    }


    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: OrdersDataMessage.AddUpdateChange) {
        const valueChanges = new Array<Order.ValueChange>(Order.Field.count);
        let changedIdx = 0;
    }

    subscribeCorrectnessChangedEvent(handler: DataRecord.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(valueChanges: Scan.ValueChange[]) {
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

export namespace Scan {
    export type ChangedEventHandler = (this: void) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export type MetaData = ScanMetaData;

    export class Key implements DataRecord.Key {
        constructor(public readonly mapKey: string) {

        }

        saveToJson(element: JsonElement): void {
            // not currently used
        }
    }
}

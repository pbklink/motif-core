/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Correctness, CorrectnessRecord, MultiEvent } from '../../../sys/sys-internal-api';
import { TableValue } from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export abstract class CorrectnessTableValueSource<Record extends CorrectnessRecord> extends TableValueSource {
    private _recordCorrectnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    activate() {
        const record = this.getRecord();
        this._recordCorrectnessChangedEventSubscriptionId = record.subscribeCorrectnessChangedEvent(
            () => { this.handleRecordCorrectnessChangedEvent(); }
        );

        const correctnessId = record.correctnessId;
        const incubated = Correctness.idIsIncubated(correctnessId);
        this.initialiseBeenIncubated(incubated);

        return this.getAllValues();
    }

    deactivate() {
        const record = this.getRecord();
        record.unsubscribeCorrectnessChangedEvent(this._recordCorrectnessChangedEventSubscriptionId);
        this._recordCorrectnessChangedEventSubscriptionId = undefined;
    }

    private handleRecordCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        const correctnessId = this.getRecord().correctnessId;
        const incubated = Correctness.idIsIncubated(correctnessId);
        this.processDataCorrectnessChanged(allValues, incubated);
    }

    abstract override getAllValues(): TableValue[];
    protected abstract getRecord(): Record;
}

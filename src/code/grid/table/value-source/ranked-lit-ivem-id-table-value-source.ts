/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemId } from '../../../adi/adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { RankedLitIvemIdTableFieldSourceDefinition } from '../field-source/definition/grid-table-field-source-definition-internal-api';
import { CorrectnessTableValue, IntegerCorrectnessTableValue, LitIvemIdCorrectnessTableValue, NumberCorrectnessTableValue, TableValue } from '../value/grid-table-value-internal-api';
import { CorrectnessTableValueSource } from './correctness-table-value-source';
import { TableValueSource } from './table-value-source';

export class RankedLitIvemIdTableValueSource extends CorrectnessTableValueSource<RankedLitIvemId> {
    private _rankedLitIvemIdChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        firstFieldIndexOffset: Integer,
        private readonly _rankedLitIvemId: RankedLitIvemId,
    ) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._rankedLitIvemIdChangedSubscriptionId = this._rankedLitIvemId.subscribeChangedEvent(
            (valueChanges) => { this.handleRankedLitIvemIdChangedEvent(valueChanges); }
        );

        return super.activate();
    }

    override deactivate() {
        this._rankedLitIvemId.unsubscribeChangedEvent(this._rankedLitIvemIdChangedSubscriptionId);
        this._rankedLitIvemIdChangedSubscriptionId = undefined;

        super.deactivate();
    }

    getAllValues(): TableValue[] {
        const fieldCount = RankedLitIvemIdTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = RankedLitIvemIdTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._rankedLitIvemId;
    }

    protected getfieldCount(): Integer {
        return RankedLitIvemIdTableFieldSourceDefinition.Field.count;
    }

    private handleRankedLitIvemIdChangedEvent(rankedLitIvemIdValueChanges: RankedLitIvemId.ValueChange[]) {
        const changedFieldCount = rankedLitIvemIdValueChanges.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < rankedLitIvemIdValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = rankedLitIvemIdValueChanges[i];
            const fieldIndex = RankedLitIvemIdTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId };
            }
        }
        if (foundCount < changedFieldCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = RankedLitIvemIdTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: RankedLitIvemId.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._rankedLitIvemId.correctnessId;

        switch (id) {
            case RankedLitIvemId.FieldId.LitIvemId:
                (value as LitIvemIdCorrectnessTableValue).data = this._rankedLitIvemId.litIvemId;
                break;
            case RankedLitIvemId.FieldId.Rank:
                (value as IntegerCorrectnessTableValue).data = this._rankedLitIvemId.rank;
                break;
            case RankedLitIvemId.FieldId.RankScore:
                (value as NumberCorrectnessTableValue).data = this._rankedLitIvemId.rankScore;
                break;
            default:
                throw new UnreachableCaseError('RLIITVSLV12473', id);
        }
    }

}

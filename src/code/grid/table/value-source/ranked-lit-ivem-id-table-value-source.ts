/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemId, RankedLitIvemIdList } from '../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { RankedLitIvemIdTableFieldSourceDefinition } from '../field-source/definition/grid-table-field-source-definition-internal-api';
import { CorrectnessTableValue, IntegerCorrectnessTableValue, NumberCorrectnessTableValue, TableValue } from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class RankedLitIvemIdTableValueSource extends TableValueSource {
    private _statusChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _correctnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        firstFieldIndexOffset: Integer,
        private readonly _rankedLitIvemId: RankedLitIvemId,
        private readonly _rankedLitIvemIdList: RankedLitIvemIdList,
    ) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._correctnessChangedEventSubscriptionId = this._rankedLitIvemIdList.subscribeCorrectnessChangedEvent(
            () => this.handleCorrectnessChangedEvent()
        );

        this.initialiseBeenUsable(this._rankedLitIvemIdList.usable);

        return this.getAllValues();
    }

    deactivate() {
        if (this._correctnessChangedEventSubscriptionId !== undefined) {
            this._rankedLitIvemIdList.unsubscribeCorrectnessChangedEvent(this._correctnessChangedEventSubscriptionId);
            this._correctnessChangedEventSubscriptionId = undefined;
        }
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

    protected getfieldCount(): Integer {
        return RankedLitIvemIdTableFieldSourceDefinition.Field.count;
    }

    private handleCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        this.processDataCorrectnessChange(allValues, this._rankedLitIvemIdList.usable);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = RankedLitIvemIdTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: RankedLitIvemId.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._rankedLitIvemIdList.correctnessId;

        switch (id) {
            case RankedLitIvemId.FieldId.Rank:
                (value as IntegerCorrectnessTableValue).data = this._rankedLitIvemId.rank;
                break;
            case RankedLitIvemId.FieldId.RankKey:
                (value as NumberCorrectnessTableValue).data = this._rankedLitIvemId.rankKey;
                break;
            default:
                throw new UnreachableCaseError('RLIITVSLV12473', id);
        }
    }

}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../adi/adi-internal-api';
import { Integer, UnreachableCaseError } from '../../../sys/internal-api';
import { LitIvemIdTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import { DataEnvironmentIdTableValue, LitIvemIdTableValue, MarketIdTableValue, StringTableValue, TableValue } from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class LitIvemIdTableValueSource extends TableValueSource {
    constructor(
        firstFieldIndexOffset: Integer,
        private readonly _litIvemId: LitIvemId,
    ) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this.initialiseBeenIncubated(true);
        return this.getAllValues();
    }

    override deactivate() {
        // nothing to do
    }

    getAllValues(): TableValue[] {
        const fieldCount = LitIvemIdTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = LitIvemIdTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._litIvemId;
    }

    protected getfieldCount(): Integer {
        return LitIvemIdTableFieldSourceDefinition.Field.count;
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemIdTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LitIvemId.FieldId, value: TableValue) {
        switch (id) {
            case LitIvemId.FieldId.LitIvemId:
                (value as LitIvemIdTableValue).data = this._litIvemId;
                break;
            case LitIvemId.FieldId.Code:
                (value as StringTableValue).data = this._litIvemId.code;
                break;
            case LitIvemId.FieldId.LitId:
                (value as MarketIdTableValue).data = this._litIvemId.litId;
                break;
            case LitIvemId.FieldId.EnvironmentId:
                (value as DataEnvironmentIdTableValue).data = this._litIvemId.environmentId;
                break;
            default:
                throw new UnreachableCaseError('LIITVSLV12473', id);
        }
    }
}

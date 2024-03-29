/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallPut } from '../../../services/internal-api';
import { Integer, UnreachableCaseError } from '../../../sys/internal-api';
import { CallPutTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    BooleanTableValue,
    DateTableValue,
    DecimalTableValue,
    EnumTableValue,
    IvemIdTableValue,
    LitIvemIdTableValue,
    PriceTableValue,
    TableValue
} from '../value/internal-api';
import { TableValueSource } from './table-value-source';

export class CallPutTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private _callPut: CallPut) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        return this.getAllValues();
    }

    deactivate() {
        // nothing to do
    }

    getAllValues(): TableValue[] {
        const fieldCount = CallPutTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = CallPutTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return CallPutTableFieldSourceDefinition.Field.count;
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = CallPutTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: CallPut.FieldId, value: TableValue) {
        switch (id) {
            case CallPut.FieldId.ExercisePrice:
                (value as PriceTableValue).data = this._callPut.exercisePrice;
                break;
            case CallPut.FieldId.ExpiryDate:
                (value as DateTableValue).data = this._callPut.expiryDate;
                break;
            case CallPut.FieldId.LitId:
                (value as EnumTableValue).data = this._callPut.litId;
                break;
            case CallPut.FieldId.CallLitIvemId:
                (value as LitIvemIdTableValue).data = this._callPut.callLitIvemId;
                break;
            case CallPut.FieldId.PutLitIvemId:
                (value as LitIvemIdTableValue).data = this._callPut.putLitIvemId;
                break;
            case CallPut.FieldId.ContractMultiplier:
                (value as DecimalTableValue).data = this._callPut.contractMultiplier;
                break;
            case CallPut.FieldId.ExerciseTypeId:
                (value as EnumTableValue).data = this._callPut.exerciseTypeId;
                break;
            case CallPut.FieldId.UnderlyingIvemId:
                (value as IvemIdTableValue).data = this._callPut.underlyingIvemId;
                break;
            case CallPut.FieldId.UnderlyingIsIndex:
                (value as BooleanTableValue).data = this._callPut.underlyingIsIndex;
                break;
            default:
                throw new UnreachableCaseError('HTVSTVSLV8851', id);
        }
    }
}

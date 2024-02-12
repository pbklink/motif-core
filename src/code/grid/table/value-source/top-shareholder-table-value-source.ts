/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TopShareholder, TopShareholdersDataItem } from '../../../adi/adi-internal-api';
import { Integer, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TopShareholderTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    CorrectnessTableValue,
    IntegerCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from "../value/grid-table-value-internal-api";
import { TableValueSource } from './table-value-source';

export class TopShareholderTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private _topShareholder: TopShareholder,
        private _dataItem: TopShareholdersDataItem) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        return this.getAllValues();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    deactivate() {
    }

    getAllValues(): TableValue[] {
        const fieldCount = TopShareholderTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = TopShareholderTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return TopShareholderTableFieldSourceDefinition.Field.count;
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = TopShareholderTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: TopShareholder.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        switch (id) {
            case TopShareholder.FieldId.Name:
                (value as StringCorrectnessTableValue).data = this._topShareholder.name;
                break;
            case TopShareholder.FieldId.Designation:
                (value as StringCorrectnessTableValue).data = this._topShareholder.designation;
                break;
            case TopShareholder.FieldId.HolderKey:
                (value as StringCorrectnessTableValue).data = this._topShareholder.holderKey;
                break;
            case TopShareholder.FieldId.SharesHeld:
                (value as IntegerCorrectnessTableValue).data = this._topShareholder.sharesHeld;
                break;
            case TopShareholder.FieldId.TotalShareIssue:
                (value as IntegerCorrectnessTableValue).data = this._topShareholder.totalShareIssue;
                break;
            case TopShareholder.FieldId.SharesChanged:
                (value as IntegerCorrectnessTableValue).data = this._topShareholder.sharesChanged;
                break;
            default:
                throw new UnreachableCaseError('TSHTVSLV10094', id);
        }
    }
}

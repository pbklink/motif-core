/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import { GridFieldTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import {
    StringTableValue,
    TableValue
} from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class GridFieldTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private _gridField: GridField) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        return this.getAllValues();
    }

    override deactivate() {
        // nothing to do
    }

    getAllValues(): TableValue[] {
        const fieldCount = GridFieldTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = GridFieldTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return GridFieldTableFieldSourceDefinition.Field.count;
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = GridFieldTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: GridField.FieldId, value: TableValue) {
        switch (id) {
            case GridField.FieldId.Name: {
                (value as StringTableValue).data = this._gridField.name;
                break;
            }
            case GridField.FieldId.Heading: {
                (value as StringTableValue).data = this._gridField.heading;
                break;
            }
            case GridField.FieldId.SourceName: {
                (value as StringTableValue).data = this._gridField.definition.source.name;
                break;
            }
            case GridField.FieldId.DefaultHeading: {
                throw new AssertInternalError('GFTVSLVDH99799');
            }
            case GridField.FieldId.DefaultTextAlign: {
                throw new AssertInternalError('GFTVSLVDT99799');
            }
            case GridField.FieldId.DefaultWidth: {
                throw new AssertInternalError('GFTVSLVDW99799');
            }
            default:
                throw new UnreachableCaseError('GFTVSLVD99799', id);
        }
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedField } from '@xilytix/revgrid';
import { AssertInternalError, Integer, UnreachableCaseError } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { GridFieldTableFieldSourceDefinition } from '../field-source/internal-api';
import {
    StringTableValue,
    TableValue
} from '../value/internal-api';
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

    private loadValue(id: RevSourcedField.FieldId, value: TableValue) {
        switch (id) {
            case RevSourcedField.FieldId.Name: {
                (value as StringTableValue).data = this._gridField.name;
                break;
            }
            case RevSourcedField.FieldId.Heading: {
                (value as StringTableValue).data = this._gridField.heading;
                break;
            }
            case RevSourcedField.FieldId.SourceName: {
                (value as StringTableValue).data = this._gridField.definition.sourceDefinition.name;
                break;
            }
            case RevSourcedField.FieldId.DefaultHeading: {
                throw new AssertInternalError('GFTVSLVDH99799');
            }
            case RevSourcedField.FieldId.DefaultTextAlign: {
                throw new AssertInternalError('GFTVSLVDT99799');
            }
            case RevSourcedField.FieldId.DefaultWidth: {
                throw new AssertInternalError('GFTVSLVDW99799');
            }
            default:
                throw new UnreachableCaseError('GFTVSLVD99799', id);
        }
    }
}

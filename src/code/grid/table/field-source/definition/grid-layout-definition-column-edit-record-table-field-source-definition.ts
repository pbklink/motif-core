import { CommaText, EnumInfoOutOfOrderError, FieldDataType } from '../../../../sys/sys-internal-api';
import {
    GridLayoutDefinitionColumnEditRecord
} from '../../../layout/definition/column-edit-record/grid-layout-definition-column-edit-record';
import {
    BooleanTableField,
    IntegerTableField,
    StringTableField,
    TableField
} from "../../field/grid-table-field-internal-api";
import { IntegerTableValue, StringTableValue, TableValue, VisibleTableValue } from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

/** @public */
export class GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(
            TableFieldSourceDefinition.TypeId.GridLayoutDefinitionColumnEditRecord,
            GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition.name,
        );

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    getFieldNameById(id: GridLayoutDefinitionColumnEditRecord.FieldId) {
        const sourcelessFieldName = GridLayoutDefinitionColumnEditRecord.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(GridLayoutDefinitionColumnEditRecord.Field.count);

        let idx = 0;
        const count = GridLayoutDefinitionColumnEditRecord.Field.count;
        for (let id = 0; id < count; id++) {
            const sourcelessFieldName = GridLayoutDefinitionColumnEditRecord.Field.idToName(id);
            const fieldName = CommaText.from2Values(
                GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition.name,
                sourcelessFieldName
            );
            const heading = GridLayoutDefinitionColumnEditRecord.Field.idToHeading(id);
            const dataTypeId = GridLayoutDefinitionColumnEditRecord.Field.idToDataTypeId(id);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
                GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition.Field.idToTableFieldValueConstructors(id);

            result[idx++] = new TableField.Definition(
                fieldName,
                this,
                heading,
                textAlign,
                sourcelessFieldName,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

/** @public */
export namespace GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition {
    export const name = TableFieldSourceDefinition.Type.gridLayoutDefinitionColumnEditRecordName;

    export namespace Field {
        export type Id = GridLayoutDefinitionColumnEditRecord.FieldId;

        export const count = GridLayoutDefinitionColumnEditRecord.Field.idCount;

        interface Info {
            readonly id: GridLayoutDefinitionColumnEditRecord.FieldId;
            readonly tableFieldValueConstructors: [field: TableField.Constructor, value: TableValue.Constructor];
        }

        type InfosObject = { [id in keyof typeof GridLayoutDefinitionColumnEditRecord.FieldId]: Info };

        const infosObject: InfosObject = {
            FieldName: {
                id: GridLayoutDefinitionColumnEditRecord.FieldId.FieldName,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            FieldSourceName: {
                id: GridLayoutDefinitionColumnEditRecord.FieldId.FieldSourceName,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            FieldHeading: {
                id: GridLayoutDefinitionColumnEditRecord.FieldId.FieldHeading,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            Width: {
                id: GridLayoutDefinitionColumnEditRecord.FieldId.Width,
                tableFieldValueConstructors: [IntegerTableField, IntegerTableValue],
            },
            Visible: {
                id: GridLayoutDefinitionColumnEditRecord.FieldId.Visible,
                tableFieldValueConstructors: [BooleanTableField, VisibleTableValue],
            },
        };

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError(
                        'GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition.Field',
                        id,
                        GridLayoutDefinitionColumnEditRecord.Field.idToName(id)
                    );
                }
            }
        }

        export function idToTableFieldValueConstructors(id: Id) {
            return infos[id].tableFieldValueConstructors;
        }

        export function idToTableValueConstructor(id: Id): TableValue.Constructor {
            const constructors = idToTableFieldValueConstructors(id);
            return constructors[1];
        }
    }
}

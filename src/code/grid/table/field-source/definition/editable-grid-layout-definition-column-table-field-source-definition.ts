import { CommaText, EnumInfoOutOfOrderError, FieldDataType } from '../../../../sys/sys-internal-api';
import {
    BooleanTableField,
    IntegerTableField,
    StringTableField,
    TableField
} from "../../field/grid-table-field-internal-api";
import {
    EditableGridLayoutDefinitionColumn
} from '../../record-definition/grid-table-record-definition-internal-api';
import { IntegerTableValue, StringTableValue, TableValue, VisibleTableValue } from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

/** @public */
export class EditableGridLayoutDefinitionColumnTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    getFieldNameById(id: EditableGridLayoutDefinitionColumn.FieldId) {
        const sourcelessFieldName = EditableGridLayoutDefinitionColumn.Field.idToName(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    private createFieldDefinitions() {
        const count = EditableGridLayoutDefinitionColumn.Field.count;
        const result = new Array<TableField.Definition>(count);

        let idx = 0;
        for (let id = 0; id < count; id++) {
            const sourcelessFieldName = EditableGridLayoutDefinitionColumn.Field.idToName(id);
            const fieldName = CommaText.from2Values(this.name, sourcelessFieldName);
            const heading = EditableGridLayoutDefinitionColumn.Field.idToHeading(id);
            const dataTypeId = EditableGridLayoutDefinitionColumn.Field.idToDataTypeId(id);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
                EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.Field.idToTableFieldValueConstructors(id);

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
export namespace EditableGridLayoutDefinitionColumnTableFieldSourceDefinition {
    export namespace Field {
        export type Id = EditableGridLayoutDefinitionColumn.FieldId;

        export const count = EditableGridLayoutDefinitionColumn.Field.idCount;

        interface Info {
            readonly id: EditableGridLayoutDefinitionColumn.FieldId;
            readonly tableFieldValueConstructors: [field: TableField.Constructor, value: TableValue.Constructor];
        }

        type InfosObject = { [id in keyof typeof EditableGridLayoutDefinitionColumn.FieldId]: Info };

        const infosObject: InfosObject = {
            FieldName: {
                id: EditableGridLayoutDefinitionColumn.FieldId.FieldName,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            FieldSourceName: {
                id: EditableGridLayoutDefinitionColumn.FieldId.FieldSourceName,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            FieldHeading: {
                id: EditableGridLayoutDefinitionColumn.FieldId.FieldHeading,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            Width: {
                id: EditableGridLayoutDefinitionColumn.FieldId.Width,
                tableFieldValueConstructors: [IntegerTableField, IntegerTableValue],
            },
            Visible: {
                id: EditableGridLayoutDefinitionColumn.FieldId.Visible,
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
                        EditableGridLayoutDefinitionColumn.Field.idToName(id)
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

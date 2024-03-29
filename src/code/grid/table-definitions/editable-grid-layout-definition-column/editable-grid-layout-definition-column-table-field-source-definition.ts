/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, FieldDataType } from '../../../sys/internal-api';
import {
    BooleanTableField,
    IntegerTableField,
    IntegerTableValue,
    StringTableField,
    StringTableValue,
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactoryService,
    TableValue,
    VisibleTableValue
} from '../../table/internal-api';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';

/** @public */
export class EditableGridLayoutDefinitionColumnTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    getFieldNameById(id: EditableGridLayoutDefinitionColumn.FieldId) {
        const sourcelessFieldName = EditableGridLayoutDefinitionColumn.Field.idToName(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    private createFieldDefinitions() {
        const count = EditableGridLayoutDefinitionColumn.Field.count;
        const result = new Array<TableField.Definition>(count);

        let idx = 0;
        for (let id = 0; id < count; id++) {
            const sourcelessFieldName = EditableGridLayoutDefinitionColumn.Field.idToName(id);
            const heading = EditableGridLayoutDefinitionColumn.Field.idToHeading(id);
            const dataTypeId = EditableGridLayoutDefinitionColumn.Field.idToDataTypeId(id);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const [fieldConstructor, valueConstructor] =
                EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.Field.idToTableFieldValueConstructors(id);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                heading,
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

/** @public */
export namespace EditableGridLayoutDefinitionColumnTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn;
    export type TypeId = typeof typeId;

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
                if (infos[id].id !== id as EditableGridLayoutDefinitionColumn.FieldId) {
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

    export interface FieldId extends TableFieldSourceDefinition.FieldId {
        sourceTypeId: EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.TypeId;
        id: EditableGridLayoutDefinitionColumn.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactoryService): EditableGridLayoutDefinitionColumnTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as EditableGridLayoutDefinitionColumnTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialise();
    }
}

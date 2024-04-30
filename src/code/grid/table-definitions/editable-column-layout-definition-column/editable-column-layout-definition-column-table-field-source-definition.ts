/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId } from '@xilytix/revgrid';
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
import { EditableColumnLayoutDefinitionColumn } from './editable-column-layout-definition-column';

/** @public */
export class EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition extends TableFieldSourceDefinition {
    declare readonly typeId: EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition.TypeId;

    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    getFieldNameById(id: EditableColumnLayoutDefinitionColumn.FieldId) {
        const sourcelessFieldName = EditableColumnLayoutDefinitionColumn.Field.idToName(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    private createFieldDefinitions() {
        const count = EditableColumnLayoutDefinitionColumn.Field.count;
        const result = new Array<TableField.Definition>(count);

        let idx = 0;
        for (let id = 0; id < count; id++) {
            const sourcelessFieldName = EditableColumnLayoutDefinitionColumn.Field.idToName(id);
            const heading = EditableColumnLayoutDefinitionColumn.Field.idToHeading(id);
            const dataTypeId = EditableColumnLayoutDefinitionColumn.Field.idToDataTypeId(id);
            const textAlignId = FieldDataType.idIsNumber(dataTypeId) ? RevHorizontalAlignId.Right : RevHorizontalAlignId.Left;
            const [fieldConstructor, valueConstructor] =
                EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition.Field.idToTableFieldValueConstructors(id);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                heading,
                textAlignId,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

/** @public */
export namespace EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn;
    export type TypeId = typeof typeId;

    export namespace Field {
        export type Id = EditableColumnLayoutDefinitionColumn.FieldId;

        export const count = EditableColumnLayoutDefinitionColumn.Field.idCount;

        interface Info {
            readonly id: EditableColumnLayoutDefinitionColumn.FieldId;
            readonly tableFieldValueConstructors: [field: TableField.Constructor, value: TableValue.Constructor];
        }

        type InfosObject = { [id in keyof typeof EditableColumnLayoutDefinitionColumn.FieldId]: Info };

        const infosObject: InfosObject = {
            FieldName: {
                id: EditableColumnLayoutDefinitionColumn.FieldId.FieldName,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            FieldSourceName: {
                id: EditableColumnLayoutDefinitionColumn.FieldId.FieldSourceName,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            FieldHeading: {
                id: EditableColumnLayoutDefinitionColumn.FieldId.FieldHeading,
                tableFieldValueConstructors: [StringTableField, StringTableValue],
            },
            Width: {
                id: EditableColumnLayoutDefinitionColumn.FieldId.Width,
                tableFieldValueConstructors: [IntegerTableField, IntegerTableValue],
            },
            Visible: {
                id: EditableColumnLayoutDefinitionColumn.FieldId.Visible,
                tableFieldValueConstructors: [BooleanTableField, VisibleTableValue],
            },
        };

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id as EditableColumnLayoutDefinitionColumn.FieldId) {
                    throw new EnumInfoOutOfOrderError(
                        'ColumnLayoutDefinitionColumnEditRecordTableFieldSourceDefinition.Field',
                        id,
                        EditableColumnLayoutDefinitionColumn.Field.idToName(id)
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
        sourceTypeId: EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition.TypeId;
        id: EditableColumnLayoutDefinitionColumn.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactoryService): EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialise();
    }
}

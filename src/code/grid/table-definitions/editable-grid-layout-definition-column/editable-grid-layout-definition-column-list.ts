/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AnchoredRecordsList } from '@xilytix/sysutils';
import { RevGridLayoutDefinition } from '../../../rev/internal-api';
import { Integer } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';

export class EditableGridLayoutDefinitionColumnList extends AnchoredRecordsList<EditableGridLayoutDefinitionColumn> {
    indexOfGridField(gridField: GridField): Integer {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const record = this.getAt(i);
            if (record.field === gridField) {
                return i;
            }
        }
        return -1;
    }

    load(allowedFields: readonly GridField[], layoutDefinition: RevGridLayoutDefinition, fixedColumnCount: Integer) {
        const definitionColumns = layoutDefinition.columns;
        const maxCount = definitionColumns.length;
        const records = new Array<EditableGridLayoutDefinitionColumn>(maxCount);
        let count = 0;
        for (let i = 0; i < maxCount; i++) {
            const definitionColumn = definitionColumns[i];
            const fieldName = definitionColumn.fieldName;
            const field = allowedFields.find((value) => value.name === fieldName);
            if (field !== undefined) {
                const editableColumn = new EditableGridLayoutDefinitionColumn(field, i < fixedColumnCount, count);
                const visible = definitionColumn.visible;
                if (visible === undefined) {
                    editableColumn.visible = EditableGridLayoutDefinitionColumn.defaultVisible;
                } else {
                    editableColumn.visible = visible;
                }
                editableColumn.width = definitionColumn.autoSizableWidth;
                records[count++] = editableColumn;
            }
        }

        super.assign(records, fixedColumnCount)
    }

    createGridLayoutDefinition() {
        const count = this.count;
        const columns = new Array<RevGridLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const record = this.getAt(i);
            const column: RevGridLayoutDefinition.Column = {
                fieldName: record.fieldName,
                autoSizableWidth: record.width,
                visible: record.visible,
            }
            columns[i] = column;
        }

        return new RevGridLayoutDefinition(columns);
    }

    appendFields(fields: readonly GridField[]) {
        const appendCount = fields.length;
        const appendRecords = new Array<EditableGridLayoutDefinitionColumn>(appendCount);
        for (let i = 0; i < appendCount; i++) {
            const field = fields[i];
            appendRecords[i] = new EditableGridLayoutDefinitionColumn(field, false, -1);
        }

        this.insert(this.count, appendRecords);
    }

    includesField(field: GridField) {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const record = this.getAt(i);
            if (record.field === field) {
                return true;
            }
        }
        return false;
    }
}

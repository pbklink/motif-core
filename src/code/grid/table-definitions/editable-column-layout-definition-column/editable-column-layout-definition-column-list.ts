/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition } from '@xilytix/rev-data-source';
import { AnchoredRecordsList } from '@xilytix/sysutils';
import { Integer } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { EditableColumnLayoutDefinitionColumn } from './editable-column-layout-definition-column';

export class EditableColumnLayoutDefinitionColumnList extends AnchoredRecordsList<EditableColumnLayoutDefinitionColumn> {
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

    load(allowedFields: readonly GridField[], layoutDefinition: RevColumnLayoutDefinition, fixedColumnCount: Integer) {
        const definitionColumns = layoutDefinition.columns;
        const maxCount = definitionColumns.length;
        const records = new Array<EditableColumnLayoutDefinitionColumn>(maxCount);
        let count = 0;
        for (let i = 0; i < maxCount; i++) {
            const definitionColumn = definitionColumns[i];
            const fieldName = definitionColumn.fieldName;
            const field = allowedFields.find((value) => value.name === fieldName);
            if (field !== undefined) {
                const editableColumn = new EditableColumnLayoutDefinitionColumn(field, i < fixedColumnCount, count);
                const visible = definitionColumn.visible;
                if (visible === undefined) {
                    editableColumn.visible = EditableColumnLayoutDefinitionColumn.defaultVisible;
                } else {
                    editableColumn.visible = visible;
                }
                editableColumn.width = definitionColumn.autoSizableWidth;
                records[count++] = editableColumn;
            }
        }

        super.assign(records, fixedColumnCount)
    }

    createColumnLayoutDefinition() {
        const count = this.count;
        const columns = new Array<RevColumnLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const record = this.getAt(i);
            const column: RevColumnLayoutDefinition.Column = {
                fieldName: record.fieldName,
                autoSizableWidth: record.width,
                visible: record.visible,
            }
            columns[i] = column;
        }

        return new RevColumnLayoutDefinition(columns);
    }

    appendFields(fields: readonly GridField[]) {
        const appendCount = fields.length;
        const appendRecords = new Array<EditableColumnLayoutDefinitionColumn>(appendCount);
        for (let i = 0; i < appendCount; i++) {
            const field = fields[i];
            appendRecords[i] = new EditableColumnLayoutDefinitionColumn(field, false, -1);
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

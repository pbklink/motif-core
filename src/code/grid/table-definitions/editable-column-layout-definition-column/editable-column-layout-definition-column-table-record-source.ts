/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { TextFormatter } from '../../../services/internal-api';
import { Badness, CorrectnessBadness, Integer, LockOpenListItem, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from '../../../sys/internal-api';
import {
    TableField,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
    TableRecord,
    TableRecordSource
} from '../../table/internal-api';
import { EditableColumnLayoutDefinitionColumn } from './editable-column-layout-definition-column';
import { EditableColumnLayoutDefinitionColumnList } from './editable-column-layout-definition-column-list';
import { EditableColumnLayoutDefinitionColumnTableRecordDefinition } from './editable-column-layout-definition-column-table-record-definition';
import { EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition } from './editable-column-layout-definition-column-table-record-source-definition';
import { EditableColumnLayoutDefinitionColumnTableValueSource } from './editable-column-layout-definition-column-table-value-source';

/** @public */
export class EditableColumnLayoutDefinitionColumnTableRecordSource extends TableRecordSource {
    private readonly _list: EditableColumnLayoutDefinitionColumnList;
    private readonly _records: readonly EditableColumnLayoutDefinitionColumn[];
    private _listChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        textFormatter: TextFormatter,
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        correctnessBadness: CorrectnessBadness,
        definition: EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition,
    ) {
        super(
            textFormatter,
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            correctnessBadness,
            definition,
            EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._list = definition.list;
        this._records = this._list.records;
    }

    get list() { return this._list; }

    override openLocked(opener: LockOpenListItem.Opener) {
        this._listChangeEventSubscriptionId = this._list.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => { this.notifyListChange(listChangeTypeId, idx, count); }
        );

        super.openLocked(opener);

        this.setUsable(Badness.notBad); // always usable

        const newCount = this._list.count;
        if (newCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
        }
        this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
    }

    override closeLocked(opener: LockOpenListItem.Opener) {
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.count);
        }

        this._list.unsubscribeListChangeEvent(this._listChangeEventSubscriptionId);

        super.closeLocked(opener);
    }

    override getCount() { return this._list.count; }

    override createDefinition(): EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition {
        return new EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this._list,
        );
    }

    override createRecordDefinition(idx: Integer): EditableColumnLayoutDefinitionColumnTableRecordDefinition {
        const record = this._records[idx];
        return {
            typeId: TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn,
            mapKey: record.fieldName,
            record,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const record = this._records[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.EditableColumnLayoutDefinitionColumn: {
                    const valueSource = new EditableColumnLayoutDefinitionColumnTableValueSource(result.fieldCount, record);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('GLDCERTRSCTR77752', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return EditableColumnLayoutDefinitionColumnTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }

    protected override createFields(): TableField[] {
        const fields = super.createFields();
        for (const field of fields) {
            if (field.definition.sourcelessName === EditableColumnLayoutDefinitionColumn.FieldName.visible) {
                field.getEditValueEventer = (tableRecord) => {
                    const index = tableRecord.index;
                    const record = this._records[index];
                    return record.visible;
                }
                field.setEditValueEventer = (tableRecord, value) => {
                    const index = tableRecord.index;
                    const record = this._records[index];
                    record.visible = value as boolean;
                }
            } else {
                if (field.definition.sourcelessName === EditableColumnLayoutDefinitionColumn.FieldName.width) {
                    field.getEditValueEventer = (tableRecord) => {
                        const index = tableRecord.index;
                        const record = this._records[index];
                        return record.width;
                    }
                    field.setEditValueEventer = (tableRecord, value) => {
                        const index = tableRecord.index;
                        const record = this._records[index];
                        record.width = value as Integer | undefined;
                    }
                }
            }
        }
        return fields;
    }
}

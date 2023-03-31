/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, moveElementsInArray, MultiEvent, RecordList, UsableListChangeTypeId } from '../../../../sys/sys-internal-api';
import { EditableGridLayoutDefinitionColumn } from '../../record-definition/editable-grid-layout-definition-column/editable-grid-layout-definition-column';

export class EditableGridLayoutDefinitionColumnList {
    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    constructor(private readonly _records: EditableGridLayoutDefinitionColumn[]) {
        if (this._records.length > 0) {
            this.reindex(0);
        }
    }

    get records(): readonly EditableGridLayoutDefinitionColumn[] { return this._records; }
    get count() { return this._records.length; }

    insert(index: Integer, records: EditableGridLayoutDefinitionColumn[]) {
        this._records.splice(index, 0, ...records);
        this.reindex(index);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, records.length);
    }

    remove(index: Integer, count: Integer) {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
        this._records.splice(index, count);
        this.reindex(index);
    }

    clear() {
        this.notifyListChange(UsableListChangeTypeId.Clear, 0, this.count);
        this._records.length = 0;
    }

    move(fromIndex: Integer, toIndex: Integer, count: Integer) {
        this.notifyListChange(UsableListChangeTypeId.Remove, fromIndex, count);
        moveElementsInArray(this._records, fromIndex, toIndex, count);
        if (fromIndex < toIndex) {
            this.reindex(fromIndex);
        } else {
            this.reindex(toIndex);
        }
        this.notifyListChange(UsableListChangeTypeId.Insert, toIndex, count);
    }

    // createGridLayoutDefinition() {
    //     const count = this._records.length;
    //     const columns = new Array<GridLayoutDefinition.Column>(count);
    //     for (let i = 0; i < count; i++) {
    //         const record = this._records[i];
    //         const column: GridLayoutDefinition.Column = {
    //             fieldName: record.fieldName,
    //             width: record.width,
    //             visible: record.visible,
    //         }
    //         columns[i] = column;
    //     }

    //     return new GridLayoutDefinition(columns);
    // }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private reindex(fromIndex: Integer) {
        const count = this.count;
        const records = this._records;
        for (let i = fromIndex; i < count; i++) {
            const record = records[i];
            record.index = i;
        }
    }
}

export namespace EditableGridLayoutDefinitionColumnList {
    // export function createAvailable(fields: GridField[], definition: GridLayoutDefinition) {
    //     const columns = definition.columns;
    //     const maxCount = fields.length;
    //     const records = new Array<EditableGridLayoutDefinitionColumn>(maxCount);
    //     let count = 0;
    //     for (let i = 0; i < maxCount; i++) {
    //         const field = fields[i];
    //         const fieldName = field.name;
    //         const column = columns.find((value) => value.fieldName === fieldName);
    //         if (column === undefined) {
    //             const record = new EditableGridLayoutDefinitionColumn(field, count++);
    //             record.visible = false;
    //         }
    //     }
    //     records.length = count;
    //     return new EditableGridLayoutDefinitionColumnList(records);
    // }
}

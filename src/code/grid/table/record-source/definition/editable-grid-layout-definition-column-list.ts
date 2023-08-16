/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, moveElementsInArray, MultiEvent, RecordList, UsableListChangeTypeId } from '../../../../sys/sys-internal-api';
import { GridField } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { EditableGridLayoutDefinitionColumn } from '../../record-definition/editable-grid-layout-definition-column/editable-grid-layout-definition-column';

export class EditableGridLayoutDefinitionColumnList implements RecordList<EditableGridLayoutDefinitionColumn> {
    private readonly _records = new Array<EditableGridLayoutDefinitionColumn>();
    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    get records(): readonly EditableGridLayoutDefinitionColumn[] { return this._records; }
    get count() { return this._records.length; }

    getAt(index: number): EditableGridLayoutDefinitionColumn {
        return this._records[index];
    }

    indexOf(record: EditableGridLayoutDefinitionColumn): Integer {
        const count = this._records.length;
        for (let i = 0; i < count; i++) {
            if (this._records[i] === record) {
                return i;
            }
        }
        return -1;
    }

    indexOfGridField(gridField: GridField): Integer {
        const count = this._records.length;
        for (let i = 0; i < count; i++) {
            if (this._records[i].field === gridField) {
                return i;
            }
        }
        return -1;
    }

    load(allowedFields: readonly GridField[], layoutDefinition: GridLayoutDefinition) {
        const oldCount = this._records.length;
        if (oldCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, oldCount);
            this._records.length = 0;
        }

        const records = this._records;

        const definitionColumns = layoutDefinition.columns;
        const maxCount = definitionColumns.length;
        records.length = maxCount;
        let count = 0;
        for (let i = 0; i < maxCount; i++) {
            const definitionColumn = definitionColumns[i];
            const fieldName = definitionColumn.fieldName;
            const field = allowedFields.find((value) => value.name === fieldName);
            if (field !== undefined) {
                const editableColumn = new EditableGridLayoutDefinitionColumn(field, count);
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
        records.length = count;
        this.notifyListChange(UsableListChangeTypeId.Insert, 0, count);
    }

    createGridLayoutDefinition() {
        const count = this._records.length;
        const columns = new Array<GridLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const record = this._records[i];
            const column: GridLayoutDefinition.Column = {
                fieldName: record.fieldName,
                autoSizableWidth: record.width,
                visible: record.visible,
            }
            columns[i] = column;
        }

        return new GridLayoutDefinition(columns);
    }

    insert(index: Integer, records: EditableGridLayoutDefinitionColumn[]) {
        this._records.splice(index, 0, ...records);
        this.reindex(index);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, records.length);
    }

    appendFields(fields: readonly GridField[]) {
        const appendCount = fields.length;
        const appendRecords = new Array<EditableGridLayoutDefinitionColumn>(appendCount);
        for (let i = 0; i < appendCount; i++) {
            const field = fields[i];
            appendRecords[i] = new EditableGridLayoutDefinitionColumn(field, -1);
        }

        this.insert(this._records.length, appendRecords);
    }

    remove(index: Integer, count: Integer) {
        this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
        this._records.splice(index, count);
        this.reindex(index);
    }

    removeIndexedRecords(removeIndices: Integer[]) {
        const removeIndicesCount = removeIndices.length;
        if (removeIndicesCount > 0) {
            removeIndices.sort((left, right) => left - right);
            let rangeStartI = removeIndicesCount - 1;
            let prevRecordIndex = removeIndices[rangeStartI];
            for (let i = rangeStartI - 1; i >= 0; i--) {
                const recordIndex = removeIndices[i];
                if (recordIndex !== --prevRecordIndex) {
                    const rangeCount = rangeStartI - i;
                    this.remove(prevRecordIndex + 1, rangeCount);

                    rangeStartI = i;
                    prevRecordIndex = recordIndex;
                }
            }

            const rangeCount = rangeStartI + 1;
            this.remove(prevRecordIndex, rangeCount);
        }
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

    moveIndexedRecordsToStart(moveIndices: Integer[]) {
        const moveIndicesCount = moveIndices.length;
        if (moveIndicesCount > 0) {
            moveIndices.sort((left, right) => left - right);
            let toRecordIndex = 0;
            let rangeStartI = 0;
            let fromRecordIndex = moveIndices[rangeStartI];
            let prevRecordIndex = fromRecordIndex;
            for (let i = rangeStartI + 1; i < moveIndicesCount; i++) {
                const recordIndex = moveIndices[i];
                if (recordIndex !== ++prevRecordIndex) {
                    const rangeCount = i - rangeStartI;
                    if (fromRecordIndex !== toRecordIndex) {
                        this.move(fromRecordIndex, toRecordIndex, rangeCount);
                    }

                    toRecordIndex += rangeCount;

                    rangeStartI = i;
                    fromRecordIndex = recordIndex;
                    prevRecordIndex = fromRecordIndex;
                }
            }

            if (fromRecordIndex !== toRecordIndex) {
                const rangeCount = moveIndicesCount - rangeStartI;
                this.move(fromRecordIndex, toRecordIndex, rangeCount);
            }
        }
    }

    moveIndexedRecordsToEnd(moveIndices: Integer[]) {
        const moveIndicesCount = moveIndices.length;
        if (moveIndicesCount > 0) {
            moveIndices.sort((left, right) => left - right);
            let toRecordIndex = this._records.length;
            let rangeStartI = moveIndicesCount - 1;
            let prevRecordIndex = moveIndices[rangeStartI];
            for (let i = rangeStartI - 1; i >= 0; i--) {
                const recordIndex = moveIndices[i];
                if (recordIndex !== --prevRecordIndex) {
                    const fromRecordIndex = prevRecordIndex + 1;
                    const rangeCount = rangeStartI - i;
                    toRecordIndex -= rangeCount;
                    if (fromRecordIndex !== toRecordIndex) {
                        this.move(fromRecordIndex, toRecordIndex, rangeCount);
                    }

                    rangeStartI = i;
                    prevRecordIndex = recordIndex;
                }
            }

            const fromRecordIndex = prevRecordIndex;
            if (fromRecordIndex !== toRecordIndex) {
                const rangeCount = rangeStartI + 1;
                toRecordIndex -= rangeCount;
                this.move(fromRecordIndex, toRecordIndex, rangeCount);
            }
        }
    }

    moveIndexedRecordsOnePositionTowardsStartWithSquash(moveIndices: Integer[]) {
        const moveIndicesCount = moveIndices.length;
        if (moveIndicesCount > 0) {
            moveIndices.sort((left, right) => left - right);

            let unavailableRecordCount = 0; // exclude records already moved to at start

            let rangeStartI = 0;
            let fromRecordIndex = moveIndices[rangeStartI];
            let prevRecordIndex = fromRecordIndex;
            for (let i = rangeStartI + 1; i < moveIndicesCount; i++) {
                const recordIndex = moveIndices[i];
                if (recordIndex !== ++prevRecordIndex) {
                    const toRecordIndex = fromRecordIndex - 1;
                    const rangeLength = i - rangeStartI;
                    const atStartUnavailableRecordCount = unavailableRecordCount + rangeLength;

                    if (toRecordIndex < unavailableRecordCount) {
                        unavailableRecordCount = atStartUnavailableRecordCount; // already at start
                    } else {
                        this.move(fromRecordIndex, toRecordIndex, rangeLength);
                        if (toRecordIndex === unavailableRecordCount) {
                            unavailableRecordCount = atStartUnavailableRecordCount; // moved to start
                        }
                    }

                    rangeStartI = i;
                    fromRecordIndex = moveIndices[rangeStartI];
                    prevRecordIndex = fromRecordIndex;
                }
            }

            const toRecordIndex = fromRecordIndex - 1;
            if (toRecordIndex >= unavailableRecordCount) {
                const rangeCount = moveIndicesCount - rangeStartI;
                this.move(fromRecordIndex, toRecordIndex, rangeCount);
            }
        }
    }

    moveIndexedRecordsOnePositionTowardsEndWithSquash(moveIndices: Integer[]) {
        const moveIndicesCount = moveIndices.length;
        if (moveIndicesCount > 0) {
            moveIndices.sort((left, right) => left - right);

            let availableRecordCount = this._records.length; // exclude records already moved to at end

            let rangeStartI = moveIndicesCount - 1;
            let prevRecordIndex = moveIndices[rangeStartI];
            for (let i = rangeStartI - 1; i >= 0; i--) {
                const recordIndex = moveIndices[i];
                if (recordIndex !== --prevRecordIndex) {
                    const fromRecordIndex = prevRecordIndex + 1;
                    const toRecordIndex = fromRecordIndex + 1;
                    const rangeLength = rangeStartI - i;
                    const atEndAvailableRecordCount = availableRecordCount - rangeLength;

                    if (toRecordIndex > atEndAvailableRecordCount) {
                        availableRecordCount = atEndAvailableRecordCount; // already at end
                    } else {
                        this.move(fromRecordIndex, toRecordIndex, rangeLength);
                        if (toRecordIndex === atEndAvailableRecordCount) {
                            availableRecordCount = atEndAvailableRecordCount; // moved to end
                        }
                    }

                    rangeStartI = i;
                    prevRecordIndex = recordIndex;
                }
            }

            const fromRecordIndex = prevRecordIndex;
            const toRecordIndex = fromRecordIndex + 1;
            const rangeLength = rangeStartI + 1;
            const atEndAvailableRecordCount = availableRecordCount - rangeLength;
            if (toRecordIndex <= atEndAvailableRecordCount) {
                this.move(fromRecordIndex, toRecordIndex, rangeLength);
            }
        }
    }

    includesField(field: GridField) {
        for (const record of this._records) {
            if (record.field === field) {
                return true;
            }
        }
        return false;
    }

    areSortedIndexedRecordsAllAtStart(sortedRecordIndices: Integer[]) {
        const recordIndicesCount = sortedRecordIndices.length;
        if (recordIndicesCount === 0) {
            return true; // nonsensical - try to avoid
        } else {
            let prevRecordIndex = sortedRecordIndices[0];
            if (prevRecordIndex !== 0) {
                return false;
            } else {
                for (let i = 1; i < recordIndicesCount; i++) {
                    const recordIndex = sortedRecordIndices[i];
                    if (recordIndex !== ++prevRecordIndex) {
                        return false;
                    }
                }
                return true;
            }
        }
    }

    areSortedIndexedRecordsAllAtEnd(sortedRecordIndices: Integer[]) {
        const recordIndicesCount = sortedRecordIndices.length;
        if (recordIndicesCount === 0) {
            return true; // nonsensical - try to avoid
        } else {
            const sortedRecordIndicesCount = sortedRecordIndices.length;
            let prevRecordIndex = sortedRecordIndices[sortedRecordIndicesCount - 1];
            if (prevRecordIndex !== this._records.length - 1) {
                return false;
            } else {
                for (let i = sortedRecordIndicesCount - 2; i >= 0; i--) {
                    const recordIndex = sortedRecordIndices[i];
                    if (recordIndex !== --prevRecordIndex) {
                        return false;
                    }
                }
                return true;
            }
        }
    }

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

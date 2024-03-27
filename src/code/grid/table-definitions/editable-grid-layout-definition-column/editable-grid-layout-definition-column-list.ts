/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutDefinition } from '../../../rev/internal-api';
import { AssertInternalError, Integer, moveElementsInArray, MultiEvent, RecordList, UsableListChangeTypeId } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { EditableGridLayoutDefinitionColumn } from './editable-grid-layout-definition-column';

export class EditableGridLayoutDefinitionColumnList implements RecordList<EditableGridLayoutDefinitionColumn> {
    private readonly _records = new Array<EditableGridLayoutDefinitionColumn>();
    private _fixedColumnCount: Integer;

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    get records(): readonly EditableGridLayoutDefinitionColumn[] { return this._records; }
    get count() { return this._records.length; }
    get fixedColumnCount() { return this._fixedColumnCount; }

    getAt(index: number): EditableGridLayoutDefinitionColumn {
        return this._records[index];
    }

    toArray(): readonly EditableGridLayoutDefinitionColumn[] {
        return this._records;
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

    load(allowedFields: readonly GridField[], layoutDefinition: RevGridLayoutDefinition, fixedColumnCount: Integer) {
        const oldCount = this._records.length;
        if (oldCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, oldCount);
            this._records.length = 0;
        }

        this._fixedColumnCount = fixedColumnCount;

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
        records.length = count;
        this.notifyListChange(UsableListChangeTypeId.Insert, 0, count);
    }

    createGridLayoutDefinition() {
        const count = this._records.length;
        const columns = new Array<RevGridLayoutDefinition.Column>(count);
        for (let i = 0; i < count; i++) {
            const record = this._records[i];
            const column: RevGridLayoutDefinition.Column = {
                fieldName: record.fieldName,
                autoSizableWidth: record.width,
                visible: record.visible,
            }
            columns[i] = column;
        }

        return new RevGridLayoutDefinition(columns);
    }

    insert(index: Integer, records: EditableGridLayoutDefinitionColumn[]) {
        if (index < this._fixedColumnCount) {
            throw new AssertInternalError('EGLDCLI36081');
        } else {
            this._records.splice(index, 0, ...records);
            this.reindex(index);
            this.notifyListChange(UsableListChangeTypeId.Insert, index, records.length);
        }
    }

    appendFields(fields: readonly GridField[]) {
        const appendCount = fields.length;
        const appendRecords = new Array<EditableGridLayoutDefinitionColumn>(appendCount);
        for (let i = 0; i < appendCount; i++) {
            const field = fields[i];
            appendRecords[i] = new EditableGridLayoutDefinitionColumn(field, false, -1);
        }

        this.insert(this._records.length, appendRecords);
    }

    remove(index: Integer, count: Integer) {
        if (index < this._fixedColumnCount) {
            throw new AssertInternalError('EGLDCLR36081');
        } else {
            this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
            this._records.splice(index, count);
            this.reindex(index);
        }
    }

    removeIndexedRecords(removeIndices: Integer[]) {
        const removeIndicesCount = removeIndices.length;
        if (removeIndicesCount > 0) {
            removeIndices.sort((left, right) => left - right);
            let removeIndicesFixedCount = 0;
            let rangeEndI = removeIndicesCount - 1;
            let rangeExpectedNextRecordIndex = removeIndices[rangeEndI] - 1;
            for (let i = rangeEndI - 1; i >= 0; i--) {
                const recordIndex = removeIndices[i];
                const fixed = recordIndex < this.fixedColumnCount;
                if (fixed) {
                    removeIndicesFixedCount = i + 1;
                    break;
                } else {
                    if (recordIndex === rangeExpectedNextRecordIndex) {
                        rangeExpectedNextRecordIndex -= 1;
                    } else {
                        const rangeLength = rangeEndI - i;
                        const fromRecordIndex = rangeExpectedNextRecordIndex + 1;
                        this.remove(fromRecordIndex, rangeLength);

                        rangeEndI = i;
                        rangeExpectedNextRecordIndex = recordIndex - 1;
                    }
                }
            }

            const rangeLength = rangeEndI + 1 - removeIndicesFixedCount;
            if (rangeLength > 0) {
                const fromRecordIndex = rangeExpectedNextRecordIndex + 1;
                this.remove(fromRecordIndex, rangeLength);
            }
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
            const fixedColumnCount = this._fixedColumnCount;
            moveIndices.sort((left, right) => left - right);
            let toRecordIndex = this._fixedColumnCount;
            let rangeStartI = 0;
            let recordIndex = moveIndices[rangeStartI];
            let rangeExpectedNextRecordIndex = recordIndex + 1;
            for (let i = rangeStartI + 1; i < moveIndicesCount; i++) {
                recordIndex = moveIndices[i];
                const fixed = recordIndex < fixedColumnCount;
                if (recordIndex === rangeExpectedNextRecordIndex && !fixed) {
                    rangeExpectedNextRecordIndex += 1;
                } else {
                    const fromRecordIndex = moveIndices[rangeStartI];
                    if (fromRecordIndex >= fixedColumnCount) { // do not move any fixed columns
                        const rangeLength = i - rangeStartI;
                        if (fromRecordIndex > toRecordIndex) {
                            this.move(fromRecordIndex, toRecordIndex, rangeLength);
                        }
                        toRecordIndex += rangeLength;
                    }

                    rangeStartI = i;
                    rangeExpectedNextRecordIndex = recordIndex + 1;
                }
            }

            const fromRecordIndex = moveIndices[rangeStartI];
            if (fromRecordIndex > toRecordIndex) {
                const rangeLength = moveIndicesCount - rangeStartI;
                this.move(fromRecordIndex, toRecordIndex, rangeLength);
            }
        }
    }

    moveIndexedRecordsToEnd(moveIndices: Integer[]) {
        const moveIndicesCount = moveIndices.length;
        if (moveIndicesCount > 0) {
            moveIndices.sort((left, right) => left - right);
            let removeIndicesFixedCount = 0;
            let toRecordIndex = this._records.length;
            let rangeStartI = moveIndicesCount - 1;
            let recordIndex = moveIndices[rangeStartI];
            let rangeExpectedNextRecordIndex = recordIndex - 1;
            for (let i = rangeStartI - 1; i >= 0; i--) {
                recordIndex = moveIndices[i];
                const fixed = recordIndex < this.fixedColumnCount;
                if (fixed) {
                    removeIndicesFixedCount = i + 1;
                    break;
                } else {
                    if (recordIndex === rangeExpectedNextRecordIndex) {
                        rangeExpectedNextRecordIndex -= 1;
                    } else {
                        const fromRecordIndex = rangeExpectedNextRecordIndex + 1;
                        const rangeLength = rangeStartI - i;
                        toRecordIndex -= rangeLength;
                        if (fromRecordIndex !== toRecordIndex) {
                            this.move(fromRecordIndex, toRecordIndex, rangeLength);
                        }

                        rangeStartI = i;
                        rangeExpectedNextRecordIndex = recordIndex - 1;
                    }
                }
            }

            const rangeLength = rangeStartI + 1 - removeIndicesFixedCount;
            if (rangeLength > 0) {
                const fromRecordIndex = rangeExpectedNextRecordIndex + 1;
                toRecordIndex -= rangeLength;
                if (fromRecordIndex < toRecordIndex) {
                    this.move(fromRecordIndex, toRecordIndex, rangeLength);
                }
            }
        }
    }

    moveIndexedRecordsOnePositionTowardsStartWithSquash(moveIndices: Integer[]) {
        const moveIndicesCount = moveIndices.length;
        if (moveIndicesCount > 0) {
            const fixedColumnCount = this._fixedColumnCount;
            moveIndices.sort((left, right) => left - right);

            let unavailableRecordCount = fixedColumnCount; // exclude fixed records and records already moved to at start

            let rangeStartI = 0;
            let recordIndex = moveIndices[rangeStartI];
            let rangeExpectedNextRecordIndex = recordIndex + 1;
            for (let i = rangeStartI + 1; i < moveIndicesCount; i++) {
                recordIndex = moveIndices[i];
                const fixed = recordIndex < this.fixedColumnCount;
                if (recordIndex === rangeExpectedNextRecordIndex && !fixed) {
                    rangeExpectedNextRecordIndex += 1;
                } else {
                    const fromRecordIndex = moveIndices[rangeStartI];
                    if (fromRecordIndex >= fixedColumnCount) { // do not move any fixed columns
                        const rangeLength = i - rangeStartI;
                        const atStartUnavailableRecordCount = unavailableRecordCount + rangeLength;

                        const toRecordIndex = fromRecordIndex - 1;
                        if (toRecordIndex < unavailableRecordCount) {
                            unavailableRecordCount = atStartUnavailableRecordCount; // already at start
                        } else {
                            this.move(fromRecordIndex, toRecordIndex, rangeLength);
                            if (toRecordIndex === unavailableRecordCount) {
                                unavailableRecordCount = atStartUnavailableRecordCount; // moved to start
                            }
                        }
                    }

                    rangeStartI = i;
                    rangeExpectedNextRecordIndex = recordIndex;
                }
            }

            const fromRecordIndex = moveIndices[rangeStartI];
            const toRecordIndex = fromRecordIndex - 1;
            if (toRecordIndex >= unavailableRecordCount) {
                const rangeLength = moveIndicesCount - rangeStartI;
                this.move(fromRecordIndex, toRecordIndex, rangeLength);
            }
        }
    }

    moveIndexedRecordsOnePositionTowardsEndWithSquash(moveIndices: Integer[]) {
        const moveIndicesCount = moveIndices.length;
        if (moveIndicesCount > 0) {
            moveIndices.sort((left, right) => left - right);

            let availableRecordCount = this._records.length; // exclude records already moved to at end
            let removeIndicesFixedCount = 0;

            let rangeStartI = moveIndicesCount - 1;
            let recordIndex = moveIndices[rangeStartI];
            let rangeExpectedNextRecordIndex = recordIndex - 1;
            for (let i = rangeStartI - 1; i >= 0; i--) {
                recordIndex = moveIndices[i];
                const fixed = recordIndex < this.fixedColumnCount;

                if (fixed) {
                    removeIndicesFixedCount = i + 1;
                    break;
                } else {
                    if (recordIndex === rangeExpectedNextRecordIndex) {
                        rangeExpectedNextRecordIndex -= 1;
                    } else {
                        const fromRecordIndex = rangeExpectedNextRecordIndex + 1;
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
                        rangeExpectedNextRecordIndex = recordIndex - 1;
                    }
                }
            }

            const rangeLength = rangeStartI + 1 - removeIndicesFixedCount;
            if (rangeLength > 0) {
                const fromRecordIndex = rangeExpectedNextRecordIndex + 1;
                const toRecordIndex = fromRecordIndex + 1;
                const atEndAvailableRecordCount = availableRecordCount - rangeLength;
                if (toRecordIndex <= atEndAvailableRecordCount) {
                    this.move(fromRecordIndex, toRecordIndex, rangeLength);
                }
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

    areAllIndexedRecordsFixed(recordIndices: Integer[]) {
        for (const index of recordIndices) {
            const record = this._records[index];
            if (!record.fixed) {
                return false;
            }
        }
        return true; // nonsensical if recordIndices length is 0 - try to avoid
    }

    areSortedIndexedRecordsAllAtStart(sortedRecordIndices: Integer[]) {
        const recordIndicesCount = sortedRecordIndices.length;
        if (recordIndicesCount === 0) {
            return true; // nonsensical - try to avoid
        } else {
            const fixedColumnCount = this._fixedColumnCount;
            let nextAfterFixedExpectedRecordIndex = fixedColumnCount;
            for (let i = 0; i < recordIndicesCount; i++) {
                const recordIndex = sortedRecordIndices[i];
                // ignore records for fixed columns
                if (recordIndex >= fixedColumnCount) {
                    if (recordIndex !== nextAfterFixedExpectedRecordIndex) {
                        return false;
                    } else {
                        nextAfterFixedExpectedRecordIndex += 1;
                    }
                }
            }
            return true;
        }
    }

    areSortedIndexedRecordsAllAtEnd(sortedRecordIndices: Integer[]) {
        const recordIndicesCount = sortedRecordIndices.length;
        if (recordIndicesCount === 0) {
            return true; // nonsensical - try to avoid
        } else {
            const recordCount = this._records.length;
            const sortedRecordIndicesCount = sortedRecordIndices.length;
            const fixedColumnCount = this._fixedColumnCount;
            let nextExpectedRecordIndex = recordCount - 1;
            for (let i = sortedRecordIndicesCount - 1; i >= 0; i--) {
                const recordIndex = sortedRecordIndices[i];
                if (recordIndex < fixedColumnCount) {
                    return true;
                } else {
                    if (recordIndex !== nextExpectedRecordIndex) {
                        return false;
                    } else {
                        nextExpectedRecordIndex -= 1;
                    }
                }
            }
            return true;
        }
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
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

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparableList, GridRecordInvalidatedValue, Integer } from '../../../sys/sys-internal-api';
import { TableValueSource } from '../value-source/table-value-source';
import { TableValuesRecord } from '../value/grid-table-value-internal-api';
import { TableValue } from '../value/table-value';

export class TableRecord extends TableValuesRecord {
    private _sources = new ComparableList<TableValueSource>();
    private _fieldCount = 0;
    private _beenIncubated = false;
    private _beginValuesChangeCount = 0;

    private readonly _valuesChangedEvent: TableRecord.ValuesChangedEventHandler;
    private readonly _sequentialFieldValuesChangedEvent: TableRecord.SequentialFieldValuesChangedEventHandler;
    private readonly _recordChangedEvent: TableRecord.RecordChangedEventHandler;

    constructor(
        index: Integer,
        eventHandlers: TableRecord.EventHandlers,
    ) {
        super(index);

        this._valuesChangedEvent = eventHandlers.valuesChanged;
        this._sequentialFieldValuesChangedEvent = eventHandlers.sequentialfieldValuesChanged;
        this._recordChangedEvent = eventHandlers.recordChanged;
    }

    get fieldCount() { return this._fieldCount; }

    activate() {
        let values: TableValue[] = [];
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            const sourceValues = source.activate();
            values = values.concat(sourceValues);
        }

        this._values = values;
        this._beenIncubated = this.calculateBeenIncubated();
    }

    deactivate() {
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            source.deactivate();
        }
    }

    addSource(source: TableValueSource) {
        source.valueChangesEvent = (valueChanges) => this.handleSourceValueChangesEvent(valueChanges);
        source.allValuesChangeEvent = (idx, newValues) => this.handleSourceAllValuesChangeEvent(idx, newValues);
        source.becomeIncubatedEventer = () => this.handleBecomeIncubatedEvent();

        this._sources.add(source);
        this._fieldCount += source.fieldCount;
    }

    // setRecordDefinition(recordDefinition: TableRecordDefinition, newValueList: TableValueList) {
    //     this._definition = recordDefinition;
    //     this._valueList = newValueList;
    //     this._valueList.valueChangesEvent = (valueChanges) => this.handleValueChangesEvent(valueChanges);
    //     this._valueList.sourceAllValuesChangeEvent =
    //         (firstFieldIdx, newValues) => this.handleSourceAllValuesChangeEvent(firstFieldIdx, newValues);
    //     this._valueList.beenUsableBecameTrueEvent = () => { this._beenUsable = true; };
    // }

    updateAllValues() {
        this._values = this.getAllValues();
    }

    getAllValues(): TableValue[] {
        if (this._sources.count === 1) {
            return this._sources.getItem(0).getAllValues();
        } else {
            const values = new Array<TableValue>(this._fieldCount);
            let idx = 0;
            for (let srcIdx = 0; srcIdx < this._sources.count; srcIdx++) {
                const sourceValues = this._sources.getItem(srcIdx).getAllValues();
                for (let srcValueIdx = 0; srcValueIdx < sourceValues.length; srcValueIdx++) {
                    values[idx++] = sourceValues[srcValueIdx];
                }
            }
            return values;
        }
    }

    clearRendering() {
        for (let i = 0; i < this._values.length; i++) {
            const value = this._values[i];
            value.clearRendering();
        }
    }

    private handleBecomeIncubatedEvent() {
        if (!this._beenIncubated) {

            const beenIncubated = this.calculateBeenIncubated();

            if (beenIncubated) {
                this._beenIncubated = true;
            }
        }
    }

    private handleSourceValueChangesEvent(valueChanges: TableRecord.ValueChange[]) {
        const valueChangesCount = valueChanges.length;
        if (valueChangesCount > 0) {
            const invalidatedValues = new Array<GridRecordInvalidatedValue>(valueChangesCount);

            for (let i = 0; i < valueChangesCount; i++) {
                const { fieldIndex, newValue, recentChangeTypeId } = valueChanges[i];
                this._values[fieldIndex] = newValue;

                invalidatedValues[i] = {
                    fieldIndex,
                    typeId: recentChangeTypeId,
                };
            }

            this._valuesChangedEvent(this.index, invalidatedValues);
        }
    }

    private handleSourceAllValuesChangeEvent(firstFieldIndex: Integer, newValues: TableValue[]) {
        const newValuesCount = newValues.length;
        if (newValuesCount > 0) {
            let fieldIndex = firstFieldIndex;
            for (let i = 0; i < newValuesCount; i++) {
                this._values[fieldIndex++] = newValues[i];
            }

            const recordChange = firstFieldIndex === 0 && newValuesCount === this._values.length;
            if (recordChange) {
                this._recordChangedEvent(this.index);
            } else {
                this._sequentialFieldValuesChangedEvent(this.index, firstFieldIndex, newValuesCount);
            }
        }
    }
    private calculateBeenIncubated() {
        for (let i = 0; i < this._sources.count; i++) {
            const source = this._sources.getItem(i);
            if (!source.beenIncubated) {
                return false;
            }
        }

        return true;
    }

    /*private findValue(idx: Integer): TableValueList.FindValueResult {
        const sourceCount = this.sources.Count;
        if (idx >= 0 && sourceCount > 0) {
            for (let i = 0; i < sourceCount; i++) {
                const source = this.sources.GetItem(i);
                if (idx < source.nextIndexOffset) {
                    return {
                        found: true,
                        sourceIdx: i,
                        sourceFieldIdx: idx - source.firstFieldIndexOffset
                    };
                }
            }
        }

        return {
            found: false,
            sourceIdx: -1,
            sourceFieldIdx: -1
        };
    }*/
}

export namespace TableRecord {
    // export type Sources = ComparableList<TableValueSource>;
    // export type ChangedValue = TableValueSource.ChangedValue;
    export type ValueChange = TableValueSource.ValueChange;
    // export interface FindValueResult {
    //     found: boolean;
    //     sourceIdx: Integer;
    //     sourceFieldIdx: Integer;
    // }
    // export type BeginValuesChangeEvent = (this: void) => void;
    // export type EndValuesChangeEvent = (this: void) => void;
    // export type ValueChangesEvent = (valueChanges: TableValueSource.ValueChange[]) => void;
    // export type AllSourceValuesChangeEvent = (fieldIdx: Integer, newValues: TableValue[]) => void;
    // export type BeenUsableBecameTrueEvent = (this: void) => void;

    export type ValuesChangedEventHandler = (this: void, recordIdx: Integer, invalidatedValues: GridRecordInvalidatedValue[]) => void;
    export type SequentialFieldValuesChangedEventHandler = (this: void, recordIdx: Integer, fieldIdx: Integer, fieldCount: Integer) => void;
    export type RecordChangedEventHandler = (this: void, recordIdx: Integer) => void;

    export interface EventHandlers {
        readonly valuesChanged: ValuesChangedEventHandler;
        readonly sequentialfieldValuesChanged: SequentialFieldValuesChangedEventHandler;
        readonly recordChanged: RecordChangedEventHandler;
    }
}

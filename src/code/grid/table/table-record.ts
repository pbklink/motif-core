/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridRecord, GridRecordInvalidatedValue } from '../../sys/grid-revgrid-types';
import { Integer } from '../../sys/sys-internal-api';
import { TableGridValue } from './table-grid-value';
import { TableValueList } from './table-value-list';

export class TableRecord implements GridRecord {
    // valuesChangedEvent: TableRecord.ValuesChangedEvent;
    // fieldsChangedEvent: TableRecord.FieldsChangedEvent;
    // recordChangedEvent: TableRecord.RecordChangedEvent;
    // firstUsableEvent: TableRecord.FirstUsableEvent; // Not implemented

    // private _definition: TableRecordDefinition;
    private _values: TableGridValue[];
    private _beenUsable = false;

    constructor(
        private readonly _valueList: TableValueList,
        private readonly _valuesChangedEvent: TableRecord.ValuesChangedEvent,
        private readonly _fieldsChangedEvent: TableRecord.FieldsChangedEvent,
        private readonly _recordChangedEvent: TableRecord.RecordChangedEvent,
        private readonly _firstUsableEvent: TableRecord.FirstUsableEvent, // Not implemented
        public index: Integer
    ) {
    }

    // get definition() { return this._definition; }
    get firstUsable() { return this._valueList.beenUsable; }
    get values(): readonly TableGridValue[] { return this._values; }

    // setRecordDefinition(recordDefinition: TableRecordDefinition, newValueList: TableValueList) {
    //     this._definition = recordDefinition;
    //     this._valueList = newValueList;
    //     this._valueList.valueChangesEvent = (valueChanges) => this.handleValueChangesEvent(valueChanges);
    //     this._valueList.sourceAllValuesChangeEvent =
    //         (firstFieldIdx, newValues) => this.handleSourceAllValuesChangeEvent(firstFieldIdx, newValues);
    //     this._valueList.beenUsableBecameTrueEvent = () => { this._beenUsable = true; };
    // }

    activate() {
        this._values = this._valueList.activate();
        this._beenUsable = this._valueList.beenUsable;
    }

    deactivate() {
        this._valueList.deactivate();
    }

    updateAllValues() {
        this._values = this._valueList.getAllValues();
    }

    clearRendering() {
        for (let i = 0; i < this._values.length; i++) {
            const value = this._values[i];
            value.clearRendering();
        }
    }

    private handleValueChangesEvent(valueChanges: TableValueList.ValueChange[]) {
        const valueChangesCount = valueChanges.length;
        if (valueChangesCount > 0) {
            const invalidatedValues = new Array<GridRecordInvalidatedValue>(valueChangesCount);
            let invalidatedValueCount = 0;

            for (let i = 0; i < valueChangesCount; i++) {
                const { fieldIndex, newValue, recentChangeTypeId } = valueChanges[i];
                this._values[fieldIndex] = newValue;

                if (recentChangeTypeId !== undefined && this._beenUsable) {
                    invalidatedValues[invalidatedValueCount++] = {
                        fieldIndex,
                        typeId: recentChangeTypeId,
                    };
                }
            }

            invalidatedValues.length = invalidatedValueCount;
            this._valuesChangedEvent(this.index, invalidatedValues);
        }
    }

    private handleSourceAllValuesChangeEvent(firstFieldIndex: Integer, newValues: TableGridValue[]) {
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

                this._fieldsChangedEvent(this.index, firstFieldIndex, newValuesCount);
            }
        }
    }
}

export namespace TableRecord {
    export type ValuesChangedEvent = (this: void, recordIdx: Integer, invalidatedValues: GridRecordInvalidatedValue[]) => void;
    export type FieldsChangedEvent = (this: void, recordIdx: Integer, fieldIdx: Integer, fieldCount: Integer) => void;
    export type RecordChangedEvent = (this: void, recordIdx: Integer) => void;
    export type FirstUsableEvent = (this: void, recordIdx: Integer) => void;
}

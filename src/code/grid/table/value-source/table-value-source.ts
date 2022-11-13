/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../../adi/adi-internal-api';
import { Integer, ValueRecentChangeTypeId } from '../../../sys/sys-internal-api';
import { TableValue } from '../value/grid-table-value-internal-api';

export abstract class TableValueSource {
    valueChangesEvent: TableValueSource.ValueChangesEvent;
    allValuesChangeEvent: TableValueSource.AllValuesChangeEvent;
    beenUsableBecameTrueEvent: TableValueSource.BeenUsableBecameTrueEvent;

    protected _beenUsable = false;

    constructor(private readonly _firstFieldIndexOffset: Integer ) { }

    get beenUsable(): boolean { return this._beenUsable; }
    get fieldCount() { return this.getfieldCount(); }
    get firstFieldIndexOffset() { return this._firstFieldIndexOffset; }

    protected notifyValueChangesEvent(valueChanges: TableValueSource.ValueChange[]) {
        for (let i = 0; i < valueChanges.length; i++) {
            valueChanges[i].fieldIndex += this._firstFieldIndexOffset;
        }
        this.valueChangesEvent(valueChanges);
    }

    protected notifyAllValuesChangeEvent(newValues: TableValue[]) {
        this.allValuesChangeEvent(this._firstFieldIndexOffset, newValues);
    }

    protected initialiseBeenUsable(value: boolean) {
        this._beenUsable = value;
    }

    protected processDataCorrectnessChange(allValues: TableValue[], isUsable: boolean) {
        this.allValuesChangeEvent(this._firstFieldIndexOffset, allValues);

        if (isUsable) {
            this.checkNotifyBeenUsableBecameTrue();
        }
    }

    private checkNotifyBeenUsableBecameTrue() {
        if (!this._beenUsable) {
            this._beenUsable = true;
            this.beenUsableBecameTrueEvent();
        }
    }

    abstract activate(): TableValue[];
    abstract deactivate(): void;
    abstract getAllValues(): TableValue[];

    protected abstract getfieldCount(): Integer;
}

export namespace TableValueSource {
    export interface ChangedValue {
        fieldIdx: Integer;
        newValue: TableValue;
    }
    export interface ValueChange {
        fieldIndex: Integer;
        newValue: TableValue;
        recentChangeTypeId: ValueRecentChangeTypeId | undefined;
    }
    export type BeginValuesChangeEvent = (this: void) => void;
    export type EndValuesChangeEvent = (this: void) => void;
    export type ValueChangesEvent = (valueChanges: ValueChange[]) => void;
    export type AllValuesChangeEvent = (firstFieldIdxOffset: Integer, newValues: TableValue[]) => void;
    export type BeenUsableBecameTrueEvent = (this: void) => void;
    export type Constructor = new(firstFieldIdxOffset: Integer, recordIdx: Integer, adi: AdiService) => TableValueSource;
}

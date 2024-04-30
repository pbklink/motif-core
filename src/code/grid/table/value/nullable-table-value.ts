/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// We are trying not to use null - only undefined.  If it does become necessary to use null table grid values, then
// the classes below can be used.  However try to avoid this

import {
    BooleanTextFormattableValue,
    DateTextFormattableValue,
    DecimalTextFormattableValue,
    EnumTextFormattableValue,
    IntegerArrayTextFormattableValue,
    IntegerTextFormattableValue,
    NumberTextFormattableValue,
    PriceTextFormattableValue,
    StringTextFormattableValue,
    TextFormattableValue
} from '../../../services/internal-api';
import { Decimal, Integer, newUndefinableDate, newUndefinableDecimal } from '../../../sys/internal-api';
import { CorrectnessTableValue } from './table-value';

export abstract class NullableCorrectnessTableValue extends CorrectnessTableValue {
    abstract isNull(): boolean;
}

export abstract class GenericNullableCorrectnessTableValue<T> extends NullableCorrectnessTableValue {
    private _data: T | null | undefined;
    private _nonNullData: T;

    get nonNullData() { return this._nonNullData; }

    get data(): T | null | undefined {
        return this._data;
    }

    set data(value: T | null | undefined) {
        this._data = value;
        if ((value !== undefined) && (value !== null)) {
            this._nonNullData = value;
        }
    }

    isUndefined() {
        return this.data === undefined;
    }

    clear() {
        this._data = undefined;
    }

    isNull() {
        return this.data === null;
    }
}

export class NullableStringCorrectnessTableValue extends GenericNullableCorrectnessTableValue<string> {
    protected createTextFormattableValue() {
        return new StringTextFormattableValue(this.data === null ? undefined : this.data);
    }
}
export class NullableNumberCorrectnessTableValue extends GenericNullableCorrectnessTableValue<number> {
    protected createTextFormattableValue() {
        return new NumberTextFormattableValue(this.data === null ? undefined : this.data);
    }
}
export class NullableIntegerCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Integer> {
    protected createTextFormattableValue() {
        return new IntegerTextFormattableValue(this.data === null ? undefined : this.data);
    }
}
export class NullableDateCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Date> {
    override get data() { return super.data; }

    override set data(value: Date | null | undefined) {
        super.data = value === null ? null : newUndefinableDate(value);
    }

    protected createTextFormattableValue() {
        return new DateTextFormattableValue(this.data === null ? undefined : this.data);
    }
}

export abstract class BaseNullableDecimalCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Decimal> {
    override get data() { return super.data; }

    override set data(value: Decimal | null | undefined) {
        super.data = value === null ? null : newUndefinableDecimal(value);
    }
}
export class NullableDecimalCorrectnessTableValue extends BaseNullableDecimalCorrectnessTableValue {
    protected createTextFormattableValue() {
        return new DecimalTextFormattableValue(this.data === null ? undefined : this.data);
    }
}
export class NullablePriceCorrectnessTableValue extends BaseNullableDecimalCorrectnessTableValue {
    protected createTextFormattableValue() {
        return new PriceTextFormattableValue(this.data === null ? undefined : this.data);
    }
}

export abstract class NullableBooleanCorrectnessTableValue extends GenericNullableCorrectnessTableValue<boolean> {
    protected textFormattableValueTypeId: TextFormattableValue.TypeId;

    protected createTextFormattableValue() {
        return new BooleanTextFormattableValue(this.data === null ? undefined : this.data, this.textFormattableValueTypeId);
    }
}
export abstract class NullableEnumCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Integer> {
    protected textFormattableValueTypeId: TextFormattableValue.TypeId;

    protected createTextFormattableValue() {
        return new EnumTextFormattableValue(this.data === null ? undefined : this.data, this.textFormattableValueTypeId);
    }
}

export abstract class BaseNullableIntegerCorrectnessArrayTableValue extends GenericNullableCorrectnessTableValue<Integer[]> {
    protected textFormattableValueTypeId: TextFormattableValue.TypeId;

    protected createTextFormattableValue() {
        return new IntegerArrayTextFormattableValue(this.data === null ? undefined : this.data, this.textFormattableValueTypeId);
    }
}

export class NullableIntegerArrayCorrectnessTableValue extends BaseNullableIntegerCorrectnessArrayTableValue {
    constructor() {
        super();
        this.textFormattableValueTypeId = TextFormattableValue.TypeId.IntegerArray;
    }
}

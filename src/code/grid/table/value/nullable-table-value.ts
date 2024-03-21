/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// We are trying not to use null - only undefined.  If it does become necessary to use null table grid values, then
// the classes below can be used.  However try to avoid this

import {
    BooleanRenderValue,
    DateRenderValue,
    DecimalRenderValue,
    EnumRenderValue,
    IntegerArrayRenderValue,
    IntegerRenderValue,
    NumberRenderValue,
    PriceRenderValue,
    RenderValue,
    StringRenderValue
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
    protected createRenderValue() {
        return new StringRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullableNumberCorrectnessTableValue extends GenericNullableCorrectnessTableValue<number> {
    protected createRenderValue() {
        return new NumberRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullableIntegerCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Integer> {
    protected createRenderValue() {
        return new IntegerRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullableDateCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Date> {
    override get data() { return super.data; }

    override set data(value: Date | null | undefined) {
        super.data = value === null ? null : newUndefinableDate(value);
    }

    protected createRenderValue() {
        return new DateRenderValue(this.data === null ? undefined : this.data);
    }
}

export abstract class BaseNullableDecimalCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Decimal> {
    override get data() { return super.data; }

    override set data(value: Decimal | null | undefined) {
        super.data = value === null ? null : newUndefinableDecimal(value);
    }
}
export class NullableDecimalCorrectnessTableValue extends BaseNullableDecimalCorrectnessTableValue {
    protected createRenderValue() {
        return new DecimalRenderValue(this.data === null ? undefined : this.data);
    }
}
export class NullablePriceCorrectnessTableValue extends BaseNullableDecimalCorrectnessTableValue {
    protected createRenderValue() {
        return new PriceRenderValue(this.data === null ? undefined : this.data);
    }
}

export abstract class NullableBooleanCorrectnessTableValue extends GenericNullableCorrectnessTableValue<boolean> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new BooleanRenderValue(this.data === null ? undefined : this.data, this.renderValueTypeId);
    }
}
export abstract class NullableEnumCorrectnessTableValue extends GenericNullableCorrectnessTableValue<Integer> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new EnumRenderValue(this.data === null ? undefined : this.data, this.renderValueTypeId);
    }
}

export abstract class BaseNullableIntegerCorrectnessArrayTableValue extends GenericNullableCorrectnessTableValue<Integer[]> {
    protected renderValueTypeId: RenderValue.TypeId;

    protected createRenderValue() {
        return new IntegerArrayRenderValue(this.data === null ? undefined : this.data, this.renderValueTypeId);
    }
}

export class NullableIntegerArrayCorrectnessTableValue extends BaseNullableIntegerCorrectnessArrayTableValue {
    constructor() {
        super();
        this.renderValueTypeId = RenderValue.TypeId.IntegerArray;
    }
}

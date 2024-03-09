/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// We are trying not to use null - only undefined.  If it does become necessary to use null table grid fields, then
// the classes below can be used.  However try to avoid this

import { compareArray, compareDate, compareDecimal, compareString, compareValue, Integer } from '../../../sys/internal-api';
import {
    GenericNullableCorrectnessTableValue,
    NullableCorrectnessTableValue,
    NullableDateCorrectnessTableValue,
    NullableDecimalCorrectnessTableValue,
    NullableIntegerArrayCorrectnessTableValue,
    NullableIntegerCorrectnessTableValue,
    NullableNumberCorrectnessTableValue,
    NullableStringCorrectnessTableValue,
    TableValue
} from "../value/grid-table-value-internal-api";
import { CorrectnessTableField } from './table-field';

export abstract class NullableDataItemTableField extends CorrectnessTableField {
    protected compareNullToNonNullField(notNullValue: NullableCorrectnessTableValue) {
        // left is null, right is notNull (parameter)
        return -1;
    }

    protected compareDefined(left: TableValue, right: TableValue): number {
        const nullableLeft = left as NullableCorrectnessTableValue;
        const nullableRight = right as NullableCorrectnessTableValue;
        if (nullableLeft.isNull()) {
            if (nullableRight.isNull()) {
                return 0;
            } else {
                return this.compareNullToNonNullField(nullableRight);
            }
        } else {
            if (nullableRight.isNull()) {
                return -this.compareNullToNonNullField(nullableLeft);
            } else {
                return this.compareNonNull(nullableLeft, nullableRight);
            }
        }
    }

    protected abstract compareNonNull(left: NullableCorrectnessTableValue, right: NullableCorrectnessTableValue): number;
}

// eslint-disable-next-line max-len
export class GenericNullableDataItemTableField<
    DataType extends number | string,
    ValueClass extends GenericNullableCorrectnessTableValue<DataType>
> extends NullableDataItemTableField {
    protected compareNonNull(left: NullableCorrectnessTableValue, right: NullableCorrectnessTableValue): number {
        return compareValue<DataType>((left as ValueClass).nonNullData, (right as ValueClass).nonNullData);
    }
}

/* eslint-disable max-len */
export class NullableStringDataItemTableField extends GenericNullableDataItemTableField<string, NullableStringCorrectnessTableValue> { }
export class NullableIntegerDataItemTableField extends GenericNullableDataItemTableField<Integer, NullableIntegerCorrectnessTableValue> { }
export class NullableNumberDataItemTableField extends GenericNullableDataItemTableField<number, NullableNumberCorrectnessTableValue> { }

export class NullableDecimalDataItemTableField extends NullableDataItemTableField {
    protected compareNonNull(left: NullableCorrectnessTableValue, right: NullableCorrectnessTableValue): number {
        return compareDecimal((left as NullableDecimalCorrectnessTableValue).nonNullData,
            (right as NullableDecimalCorrectnessTableValue).nonNullData);
    }
}

export class NullableDateDataItemTableField extends NullableDataItemTableField {
    protected compareNonNull(left: NullableCorrectnessTableValue, right: NullableCorrectnessTableValue): number {
        return compareDate((left as NullableDateCorrectnessTableValue).nonNullData,
            (right as NullableDateCorrectnessTableValue).nonNullData);
    }
}

export abstract class NullableBooleanDataItemTableField extends NullableDataItemTableField {
    protected compareNonNull(left: NullableCorrectnessTableValue, right: NullableCorrectnessTableValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = this._textFormatterService.formatRenderValue(leftRenderValue);
        const rightFormattedText = this._textFormatterService.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}
/* eslint-enable max-len */
export abstract class NullableEnumDataItemTableField extends NullableDataItemTableField {
    protected compareNonNull(left: NullableCorrectnessTableValue, right: NullableCorrectnessTableValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = this._textFormatterService.formatRenderValue(leftRenderValue);
        const rightFormattedText = this._textFormatterService.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}

export abstract class NullableIntegerArrayDataItemTableField extends NullableDataItemTableField {
    protected compareNonNull(left: NullableCorrectnessTableValue, right: NullableCorrectnessTableValue): number {
        return compareArray<Integer>((left as NullableIntegerArrayCorrectnessTableValue).nonNullData,
            (right as NullableIntegerArrayCorrectnessTableValue).nonNullData);
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId, LitIvemId } from '../../../adi/adi-internal-api';
import { RenderValue } from '../../../services/services-internal-api';
import {
    GridFieldHorizontalAlign,
    GridRevRecordField,
    Integer,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime,
    compareArray,
    compareDate,
    compareDecimal,
    compareString,
    compareValue
} from "../../../sys/internal-api";
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridField, GridFieldDefinition, GridFieldSourceDefinition } from '../../field/grid-field-internal-api';
import {
    BaseSourceTzOffsetDateTimeCorrectnessTableValue,
    CorrectnessTableValue,
    DateCorrectnessTableValue,
    DateTableValue,
    DecimalCorrectnessTableValue,
    DecimalTableValue,
    GenericCorrectnessTableValue,
    GenericTableValue,
    IntegerArrayCorrectnessTableValue,
    IntegerArrayTableValue,
    IntegerCorrectnessTableValue,
    IntegerTableValue,
    IvemIdCorrectnessTableValue,
    IvemIdTableValue,
    LitIvemIdCorrectnessTableValue,
    LitIvemIdTableValue,
    NumberCorrectnessTableValue,
    NumberTableValue,
    SourceTzOffsetDateCorrectnessTableValue,
    StringArrayCorrectnessTableValue,
    StringCorrectnessTableValue,
    StringTableValue,
    TableValue,
    TableValuesRecord
} from '../value/grid-table-value-internal-api';

export abstract class TableField extends GridField implements GridRevRecordField {
    private _valueTypeId: RenderValue.TypeId;

    constructor(
        protected readonly _textFormatterService: TextFormatterService,
        definition: TableField.Definition,
        heading: string,
    ) {
        super(definition, heading);
    }

    get valueTypeId() { return this._valueTypeId; }

    compare(left: TableValuesRecord, right: TableValuesRecord): number {
        const leftValue = left.values[this.index];
        const rightValue = right.values[this.index];
        if (leftValue === rightValue) {
            return 0;
        } else {
            if (leftValue.isUndefined()) {
                if (rightValue.isUndefined()) {
                    return 0;
                } else {
                    return this.compareUndefinedToDefinedField(rightValue);
                }
            } else {
                if (rightValue.isUndefined()) {
                    return -this.compareUndefinedToDefinedField(leftValue);
                } else {
                    return this.compareDefined(leftValue, rightValue);
                }
            }
        }
    }

    compareDesc(left: TableValuesRecord, right: TableValuesRecord): number {
        const leftValue = left.values[this.index];
        const rightValue = right.values[this.index];
        if (leftValue === rightValue) {
            return 0;
        } else {
            if (leftValue.isUndefined()) {
                if (rightValue.isUndefined()) {
                    return 0;
                } else {
                    return -this.compareUndefinedToDefinedField(rightValue);
                }
            } else {
                if (rightValue.isUndefined()) {
                    return this.compareUndefinedToDefinedField(leftValue);
                } else {
                    return this.compareDefined(rightValue, leftValue);
                }
            }
        }
    }

    override getViewValue(record: TableValuesRecord): RenderValue {
        const tableGridValue = record.values[this.index];
        return tableGridValue.renderValue;
    }

    protected setValueTypeId(value: RenderValue.TypeId) {
        this._valueTypeId = value;
    }

    protected compareUndefinedToDefinedField(definedValue: TableValue) {
        // left is undefined, right is defined (parameter)
        return -1;
    }

    protected abstract compareDefined(left: TableValue, right: TableValue): number;
}

export namespace TableField {
    export class Definition extends GridFieldDefinition {
        constructor(
            source: GridFieldSourceDefinition,
            sourcelessName: string,
            defaultHeading: string,
            defaultTextAlign: GridFieldHorizontalAlign,
            readonly gridFieldConstructor: TableField.Constructor,
            readonly gridValueConstructor: TableValue.Constructor,

        ) {
            super(source, sourcelessName, defaultHeading, defaultTextAlign);
        }
    }

    export type Constructor = new(
        textFormatterService: TextFormatterService,
        definition: TableField.Definition,
        heading: string,
        index: Integer,
    ) => TableField;
}

// eslint-disable-next-line max-len
export class GenericTableField<DataType extends number | string, ValueClass extends GenericTableValue<DataType>> extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        return compareValue<DataType>((left as ValueClass).definedData, (right as ValueClass).definedData);
    }
}

export class StringTableField extends GenericTableField<string, StringTableValue> { }
export class IntegerTableField extends GenericTableField<Integer, IntegerTableValue> { }
export class NumberTableField extends GenericTableField<number, NumberTableValue> { }

export class DecimalTableField extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        return compareDecimal((left as DecimalTableValue).definedData, (right as DecimalTableValue).definedData);
    }
}
export class DateTableField extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        return compareDate((left as DateTableValue).definedData, (right as DateTableValue).definedData);
    }
}
export class IvemIdTableField extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        const leftIvemId = (left as IvemIdTableValue).definedData;
        const rightIvemId = (right as IvemIdTableValue).definedData;
        return IvemId.compare(leftIvemId, rightIvemId);
    }
}
export class LitIvemIdTableField extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        const leftLitIvemId = (left as LitIvemIdTableValue).definedData;
        const rightLitIvemId = (right as LitIvemIdTableValue).definedData;
        return LitIvemId.compare(leftLitIvemId, rightLitIvemId);
    }
}
export class BooleanTableField extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = this._textFormatterService.formatRenderValue(leftRenderValue);
        const rightFormattedText = this._textFormatterService.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}
export class EnumTableField extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = this._textFormatterService.formatRenderValue(leftRenderValue);
        const rightFormattedText = this._textFormatterService.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}

export abstract class IntegerArrayTableField extends TableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        return compareArray<Integer>((left as IntegerArrayTableValue).definedData,
            (right as IntegerArrayTableValue).definedData);
    }
}

export abstract class CorrectnessTableField extends TableField {
}

export namespace CorrectnessTableField {
    export type Constructor = new(
        textFormatterService: TextFormatterService,
        definition: TableField.Definition,
        heading: string,
    ) => CorrectnessTableField;
}

// eslint-disable-next-line max-len
export class GenericCorrectnessTableField<
    DataType extends number | string,
    ValueClass extends GenericCorrectnessTableValue<DataType>
> extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        return compareValue<DataType>((left as ValueClass).definedData, (right as ValueClass).definedData);
    }
}

export class StringCorrectnessTableField extends GenericCorrectnessTableField<string, StringCorrectnessTableValue> { }
export class IntegerCorrectnessTableField extends GenericCorrectnessTableField<Integer, IntegerCorrectnessTableValue> { }
export class NumberCorrectnessTableField extends GenericCorrectnessTableField<number, NumberCorrectnessTableValue> { }

export class DecimalCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        return compareDecimal((left as DecimalCorrectnessTableValue).definedData,
            (right as DecimalCorrectnessTableValue).definedData);
    }
}
export class DateCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        return compareDate((left as DateCorrectnessTableValue).definedData,
            (right as DateCorrectnessTableValue).definedData);
    }
}
export class SourceTzOffsetDateTimeCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        return SourceTzOffsetDateTime.compare((left as BaseSourceTzOffsetDateTimeCorrectnessTableValue).definedData,
            (right as BaseSourceTzOffsetDateTimeCorrectnessTableValue).definedData);
    }
}
export class SourceTzOffsetDateCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        return SourceTzOffsetDate.compare((left as SourceTzOffsetDateCorrectnessTableValue).definedData,
            (right as SourceTzOffsetDateCorrectnessTableValue).definedData);
    }
}
export class IvemIdCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        const leftIvemId = (left as IvemIdCorrectnessTableValue).definedData;
        const rightIvemId = (right as IvemIdCorrectnessTableValue).definedData;
        return IvemId.compare(leftIvemId, rightIvemId);
    }
}
export class LitIvemIdCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        const leftLitIvemId = (left as LitIvemIdCorrectnessTableValue).definedData;
        const rightLitIvemId = (right as LitIvemIdCorrectnessTableValue).definedData;
        return LitIvemId.compare(leftLitIvemId, rightLitIvemId);
    }
}
export class BooleanCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = this._textFormatterService.formatRenderValue(leftRenderValue);
        const rightFormattedText = this._textFormatterService.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}
export class EnumCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: CorrectnessTableValue, right: CorrectnessTableValue): number {
        const leftRenderValue = left.renderValue;
        const rightRenderValue = right.renderValue;
        const leftFormattedText = this._textFormatterService.formatRenderValue(leftRenderValue);
        const rightFormattedText = this._textFormatterService.formatRenderValue(rightRenderValue);

        return compareString(leftFormattedText, rightFormattedText);
    }
}

export class StringArrayCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        return compareArray<string>((left as StringArrayCorrectnessTableValue).definedData,
            (right as StringArrayCorrectnessTableValue).definedData);
    }
}

export class IntegerArrayCorrectnessTableField extends CorrectnessTableField {
    protected compareDefined(left: TableValue, right: TableValue): number {
        return compareArray<Integer>((left as IntegerArrayCorrectnessTableValue).definedData,
            (right as IntegerArrayCorrectnessTableValue).definedData);
    }
}

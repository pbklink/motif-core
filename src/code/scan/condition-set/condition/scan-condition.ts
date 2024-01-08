/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum, SourceTzOffsetDateTime, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { ScanFormula } from '../../formula/internal-api';

export interface ScanCondition {
    readonly typeId: ScanCondition.TypeId;
    not: boolean;
}

export namespace ScanCondition {
    export const enum TypeId {
        NumericComparison,
        All,
        None,
        FieldHasValue,
        BooleanFieldEquals,
        NumericFieldEquals,
        NumericFieldInRange,
        DateFieldEquals,
        DateFieldInRange,
        TextFieldContains,
        PriceSubFieldHasValue,
        PriceSubFieldEquals,
        PriceSubFieldInRange,
        DateSubFieldHasValue,
        DateSubFieldEquals,
        DateSubFieldInRange,
        AltCodeSubFieldHasValue,
        AltCodeSubFieldContains,
        AttributeSubFieldHasValue,
        AttributeSubFieldContains,
    }

    export type SubFieldTypeId = PickEnum<TypeId,
        TypeId.PriceSubFieldHasValue |
        TypeId.PriceSubFieldEquals |
        TypeId.PriceSubFieldInRange |
        TypeId.DateSubFieldHasValue |
        TypeId.DateSubFieldEquals |
        TypeId.DateSubFieldInRange |
        TypeId.AltCodeSubFieldHasValue |
        TypeId.AltCodeSubFieldContains |
        TypeId.AttributeSubFieldHasValue |
        TypeId.AttributeSubFieldContains
    >;

    export function isEqual(left: ScanCondition, right: ScanCondition) {
        if (left.typeId !== right.typeId) {
            return false;
        } else {
            if (left.not !== right.not) {
                return false;
            } else {
                switch (left.typeId) {
                    case ScanCondition.TypeId.NumericComparison: return NumericComparisonScanCondition.isEqual(left as NumericComparisonScanCondition, right as NumericComparisonScanCondition);
                    case ScanCondition.TypeId.All: return AllScanCondition.isEqual(left as AllScanCondition, right as AllScanCondition);
                    case ScanCondition.TypeId.None: return NoneScanCondition.isEqual(left as NoneScanCondition, right as NoneScanCondition);
                    case ScanCondition.TypeId.FieldHasValue: return FieldHasValueScanCondition.isEqual(left as FieldHasValueScanCondition, right as FieldHasValueScanCondition);
                    case ScanCondition.TypeId.BooleanFieldEquals: return BooleanFieldEqualsScanCondition.isEqual(left as BooleanFieldEqualsScanCondition, right as BooleanFieldEqualsScanCondition);
                    case ScanCondition.TypeId.NumericFieldEquals: return NumericFieldEqualsScanCondition.isEqual(left as NumericFieldEqualsScanCondition, right as NumericFieldEqualsScanCondition);
                    case ScanCondition.TypeId.NumericFieldInRange: return NumericFieldInRangeScanCondition.isEqual(left as NumericFieldInRangeScanCondition, right as NumericFieldInRangeScanCondition);
                    case ScanCondition.TypeId.DateFieldEquals: return DateFieldEqualsScanCondition.isEqual(left as DateFieldEqualsScanCondition, right as DateFieldEqualsScanCondition);
                    case ScanCondition.TypeId.DateFieldInRange: return DateFieldInRangeScanCondition.isEqual(left as DateFieldInRangeScanCondition, right as DateFieldInRangeScanCondition);
                    case ScanCondition.TypeId.TextFieldContains: return TextFieldContainsScanCondition.isEqual(left as TextFieldContainsScanCondition, right as TextFieldContainsScanCondition);
                    case ScanCondition.TypeId.PriceSubFieldHasValue: return PriceSubFieldHasValueScanCondition.isEqual(left as PriceSubFieldHasValueScanCondition, right as PriceSubFieldHasValueScanCondition);
                    case ScanCondition.TypeId.PriceSubFieldEquals: return PriceSubFieldEqualsScanCondition.isEqual(left as PriceSubFieldEqualsScanCondition, right as PriceSubFieldEqualsScanCondition);
                    case ScanCondition.TypeId.PriceSubFieldInRange: return PriceSubFieldInRangeScanCondition.isEqual(left as PriceSubFieldInRangeScanCondition, right as PriceSubFieldInRangeScanCondition);
                    case ScanCondition.TypeId.DateSubFieldHasValue: return DateSubFieldHasValueScanCondition.isEqual(left as DateSubFieldHasValueScanCondition, right as DateSubFieldHasValueScanCondition);
                    case ScanCondition.TypeId.DateSubFieldEquals: return DateSubFieldEqualsScanCondition.isEqual(left as DateSubFieldEqualsScanCondition, right as DateSubFieldEqualsScanCondition);
                    case ScanCondition.TypeId.DateSubFieldInRange: return DateSubFieldInRangeScanCondition.isEqual(left as DateSubFieldInRangeScanCondition, right as DateSubFieldInRangeScanCondition);
                    case ScanCondition.TypeId.AltCodeSubFieldHasValue: return AltCodeSubFieldHasValueScanCondition.isEqual(left as AltCodeSubFieldHasValueScanCondition, right as AltCodeSubFieldHasValueScanCondition);
                    case ScanCondition.TypeId.AltCodeSubFieldContains: return AltCodeSubFieldContainsScanCondition.isEqual(left as AltCodeSubFieldContainsScanCondition, right as AltCodeSubFieldContainsScanCondition);
                    case ScanCondition.TypeId.AttributeSubFieldHasValue: return AttributeSubFieldHasValueScanCondition.isEqual(left as AttributeSubFieldHasValueScanCondition, right as AttributeSubFieldHasValueScanCondition);
                    case ScanCondition.TypeId.AttributeSubFieldContains: return AttributeSubFieldContainsScanCondition.isEqual(left as AttributeSubFieldContainsScanCondition, right as AttributeSubFieldContainsScanCondition);
                }
            }
        }
    }

}

export interface NumericComparisonScanCondition extends ScanCondition {
    readonly operationId: NumericComparisonScanCondition.OperationId;
    readonly leftOperand: NumericComparisonScanCondition.Operand;
    readonly rightOperand: NumericComparisonScanCondition.Operand;
}

export namespace NumericComparisonScanCondition {
    export const enum OperationId {
        Equals,
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual,
    }

    export interface Operand {
        readonly typeId: Operand.TypeId;
    }

    export namespace Operand {
        export const enum TypeId {
            Number,
            NumericFieldValueGet,
            // NumericSubFieldValueGet, // not implemented in ScanFormula
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: Operand, right: Operand) {
            return left.typeId === right.typeId;
        }
    }

    export interface NumberOperand extends Operand {
        readonly value: number;
    }

    export namespace NumberOperand {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: NumberOperand, right: NumberOperand) {
            return Operand.isEqual(left, right) && (left.value === right.value);
        }
    }

    export interface NumericFieldValueGetOperand extends Operand {
        readonly fieldId: ScanFormula.NumericFieldId;
    }

    export namespace NumericFieldValueGetOperand {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: NumericFieldValueGetOperand, right: NumericFieldValueGetOperand) {
            return Operand.isEqual(left, right) && (left.fieldId === right.fieldId);
        }
    }

    export function isOperandEqual(left: Operand, right: Operand) {
        if (left.typeId !== right.typeId) {
            return false;
        } else {
            switch (left.typeId) {
                case Operand.TypeId.Number: return NumberOperand.isEqual(left as NumberOperand, right as NumberOperand);
                case Operand.TypeId.NumericFieldValueGet: return NumericFieldValueGetOperand.isEqual(left as NumericFieldValueGetOperand, right as NumericFieldValueGetOperand);
                default:
                    throw new UnreachableCaseError('SCNCSCIOE44498', left.typeId);
            }
        }
    }

    export function isEqual(left: NumericComparisonScanCondition, right: NumericComparisonScanCondition) {
        if (left.operationId !== right.operationId) {
            return false;
        } else {
            if (!isOperandEqual(left.leftOperand, right.leftOperand)) {
                return false;
            } else {
                return isOperandEqual(left.rightOperand, right.rightOperand);
            }
        }
    }
}

export interface AllScanCondition extends ScanCondition {
    readonly typeId: ScanCondition.TypeId.All;
}

export namespace AllScanCondition {
    export function isEqual(_left: AllScanCondition, _right: AllScanCondition) {
        return true;
    }
}

export interface NoneScanCondition extends ScanCondition {
    readonly typeId: ScanCondition.TypeId.None;
}

export namespace NoneScanCondition {
    export function isEqual(_left: NoneScanCondition, _right: NoneScanCondition) {
        return true;
    }
}

export interface FieldScanCondition extends ScanCondition {
    readonly fieldId: ScanFormula.FieldId;
}

export namespace FieldScanCondition {
    export function isEqual(left: FieldScanCondition, right: FieldScanCondition) {
        return left.fieldId === right.fieldId;
    }
}

export interface FieldHasValueScanCondition extends FieldScanCondition {
    readonly typeId: ScanCondition.TypeId.FieldHasValue;
}

export namespace FieldHasValueScanCondition {
    export function isEqual(left: FieldHasValueScanCondition, right: FieldHasValueScanCondition) {
        return FieldScanCondition.isEqual(left, right);
    }
}

export interface BooleanFieldScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.BooleanFieldId;
}

export interface BooleanFieldEqualsScanCondition extends BooleanFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.BooleanFieldEquals;
    readonly target: boolean;
}

export namespace BooleanFieldEqualsScanCondition {
    export function isEqual(left: BooleanFieldEqualsScanCondition, right: BooleanFieldEqualsScanCondition) {
        return FieldScanCondition.isEqual(left, right) && (left.target === right.target);
    }
}

export interface NumericFieldScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.NumericFieldId;
}

export interface NumericFieldEqualsScanCondition extends NumericFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.NumericFieldEquals;
    readonly target: number;
}

export namespace NumericFieldEqualsScanCondition {
    export function isEqual(left: NumericFieldEqualsScanCondition, right: NumericFieldEqualsScanCondition) {
        return FieldScanCondition.isEqual(left, right) && (left.target === right.target);
    }
}

export interface NumericFieldInRangeScanCondition extends NumericFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.NumericFieldInRange;
    readonly min: number | undefined;
    readonly max: number | undefined;
}

export namespace NumericFieldInRangeScanCondition {
    export function isEqual(left: NumericFieldInRangeScanCondition, right: NumericFieldInRangeScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) &&
            (left.min === right.min) &&
            (left.max === right.max)
        );
    }
}

export interface DateFieldScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.DateFieldId;
}

export interface DateFieldEqualsScanCondition extends DateFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateFieldEquals;
    readonly target: SourceTzOffsetDateTime;
}

export namespace DateFieldEqualsScanCondition {
    export function isEqual(left: DateFieldEqualsScanCondition, right: DateFieldEqualsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDateTime.isEqual(left.target, right.target)
        );
    }
}

export interface DateFieldInRangeScanCondition extends DateFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateFieldInRange;
    readonly min: SourceTzOffsetDateTime | undefined;
    readonly max: SourceTzOffsetDateTime | undefined;
}

export namespace DateFieldInRangeScanCondition {
    export function isEqual(left: DateFieldInRangeScanCondition, right: DateFieldInRangeScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDateTime.isUndefinableEqual(left.min, right.min) &&
            SourceTzOffsetDateTime.isUndefinableEqual(left.max, right.max)
        );
    }
}

export interface TextFieldScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.TextFieldId;
}

export interface TextFieldContainsScanCondition extends TextFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.TextFieldContains;
    readonly value: string;
    readonly asId: ScanFormula.TextContainsAsId;
    readonly ignoreCase: boolean;
}

export namespace TextFieldContainsScanCondition {
    export function isEqual(left: TextFieldContainsScanCondition, right: TextFieldContainsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) &&
            (left.value === right.value) &&
            (left.asId === right.asId) &&
            (left.ignoreCase === right.ignoreCase)
        );
    }
}

export interface SubFieldScanCondition<MySubbedFieldId extends ScanFormula.SubbedFieldId, SubFieldId> extends FieldScanCondition {
    fieldId: MySubbedFieldId;
    subFieldId: SubFieldId;
}

export namespace SubFieldScanCondition {
    export function isEqual<MySubbedFieldId extends ScanFormula.SubbedFieldId, SubFieldId>(
        left: SubFieldScanCondition<MySubbedFieldId, SubFieldId>,
        right: SubFieldScanCondition<MySubbedFieldId, SubFieldId>
    ) {
        return FieldScanCondition.isEqual(left, right) && (left.subFieldId === right.subFieldId);
    }
}

export interface PriceSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.Price, ScanFormula.PriceSubFieldId> {

}

export interface PriceSubFieldHasValueScanCondition extends PriceSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.PriceSubFieldHasValue;
}

export namespace PriceSubFieldHasValueScanCondition {
    export function isEqual(left: PriceSubFieldHasValueScanCondition, right: PriceSubFieldHasValueScanCondition) {
        return SubFieldScanCondition.isEqual(left, right);
    }
}

export interface PriceSubFieldEqualsScanCondition extends PriceSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.PriceSubFieldEquals;
    readonly target: number;
}

export namespace PriceSubFieldEqualsScanCondition {
    export function isEqual(left: PriceSubFieldEqualsScanCondition, right: PriceSubFieldEqualsScanCondition) {
        return left.target === right.target;
    }
}

export interface PriceSubFieldInRangeScanCondition extends PriceSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.PriceSubFieldInRange;
    readonly min: number | undefined;
    readonly max: number | undefined;
}

export namespace PriceSubFieldInRangeScanCondition {
    export function isEqual(left: PriceSubFieldInRangeScanCondition, right: PriceSubFieldInRangeScanCondition) {
        return (
            SubFieldScanCondition.isEqual(left, right) &&
            (left.min === right.min) &&
            (left.max === right.max)
        );
    }
}

export interface DateSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.Date, ScanFormula.DateSubFieldId> {

}

export interface DateSubFieldHasValueScanCondition extends DateSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateSubFieldHasValue;
}

export namespace DateSubFieldHasValueScanCondition {
    export function isEqual(left: DateSubFieldHasValueScanCondition, right: DateSubFieldHasValueScanCondition) {
        return SubFieldScanCondition.isEqual(left, right);
    }
}

export interface DateSubFieldEqualsScanCondition extends DateSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateSubFieldEquals;
    readonly target: SourceTzOffsetDateTime;
}

export namespace DateSubFieldEqualsScanCondition {
    export function isEqual(left: DateSubFieldEqualsScanCondition, right: DateSubFieldEqualsScanCondition) {
        return (
            SubFieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDateTime.isEqual(left.target, right.target)
        );
    }
}

export interface DateSubFieldInRangeScanCondition extends DateSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateSubFieldInRange;
    readonly min: SourceTzOffsetDateTime | undefined;
    readonly max: SourceTzOffsetDateTime | undefined;
}

export namespace DateSubFieldInRangeScanCondition {
    export function isEqual(left: DateSubFieldInRangeScanCondition, right: DateSubFieldInRangeScanCondition) {
        return (
            SubFieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDateTime.isUndefinableEqual(left.min, right.min) &&
            SourceTzOffsetDateTime.isUndefinableEqual(left.max, right.max)
        );
    }
}

export interface AltCodeSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.AltCode, ScanFormula.AltCodeSubFieldId> {

}

export interface AltCodeSubFieldHasValueScanCondition extends AltCodeSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.AltCodeSubFieldHasValue;
}

export namespace AltCodeSubFieldHasValueScanCondition {
    export function isEqual(left: AltCodeSubFieldHasValueScanCondition, right: AltCodeSubFieldHasValueScanCondition) {
        return SubFieldScanCondition.isEqual(left, right);
    }
}

export interface AltCodeSubFieldContainsScanCondition extends AltCodeSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.AltCodeSubFieldContains;
    readonly value: string;
    readonly asId: ScanFormula.TextContainsAsId;
    readonly ignoreCase: boolean;
}

export namespace AltCodeSubFieldContainsScanCondition {
    export function isEqual(left: AltCodeSubFieldContainsScanCondition, right: AltCodeSubFieldContainsScanCondition) {
        return (
            SubFieldScanCondition.isEqual(left, right) &&
            (left.value === right.value) &&
            (left.asId === right.asId) &&
            (left.ignoreCase === right.ignoreCase)
        );
    }
}

export interface AttributeSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.Attribute, ScanFormula.AttributeSubFieldId> {

}

export interface AttributeSubFieldHasValueScanCondition extends AttributeSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.AttributeSubFieldHasValue;
}

export namespace AttributeSubFieldHasValueScanCondition {
    export function isEqual(left: AttributeSubFieldHasValueScanCondition, right: AttributeSubFieldHasValueScanCondition) {
        return SubFieldScanCondition.isEqual(left, right);
    }
}

export interface AttributeSubFieldContainsScanCondition extends AttributeSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.AttributeSubFieldContains;
    readonly value: string;
    readonly asId: ScanFormula.TextContainsAsId;
    readonly ignoreCase: boolean;
}

export namespace AttributeSubFieldContainsScanCondition {
    export function isEqual(left: AttributeSubFieldContainsScanCondition, right: AttributeSubFieldContainsScanCondition) {
        return (
            SubFieldScanCondition.isEqual(left, right) &&
            (left.value === right.value) &&
            (left.asId === right.asId) &&
            (left.ignoreCase === right.ignoreCase)
        );
    }
}

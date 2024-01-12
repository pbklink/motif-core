/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum, SourceTzOffsetDateTime, UnreachableCaseError, isArrayEqualUniquely } from '../../../sys/sys-internal-api';
import { ScanFormula } from '../../formula/internal-api';

export interface ScanCondition {
    readonly typeId: ScanCondition.TypeId;
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
        TextFieldIncludes,
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
                case ScanCondition.TypeId.TextFieldIncludes: return TextFieldIncludesScanCondition.isEqual(left as TextFieldIncludesScanCondition, right as TextFieldIncludesScanCondition);
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
                default:
                    throw new UnreachableCaseError('SCIE78567', left.typeId);
            }
        }
    }
}

export interface NumericComparisonScanCondition extends ScanCondition {
    readonly operationId: NumericComparisonScanCondition.OperationId;
    readonly leftOperand: NumericComparisonScanCondition.FieldOperand; // do not support left and right being a number
    readonly rightOperand: NumericComparisonScanCondition.TypedOperand;
}

export namespace NumericComparisonScanCondition {
    export const enum OperationId {
        Equals,
        NotEquals,
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual,
    }

    export interface FieldOperand {
        readonly fieldId: ScanFormula.NumericFieldId;
    }

    export namespace FieldOperand {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: FieldOperand, right: FieldOperand) {
            return left.fieldId === right.fieldId;
        }
    }

    export interface TypedOperand {
        readonly typeId: TypedOperand.TypeId;
    }

    export namespace TypedOperand {
        export const enum TypeId {
            Number,
            Field,
            // NumericSubFieldValueGet, // not implemented in ScanFormula
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: TypedOperand, right: TypedOperand) {
            if (left.typeId !== right.typeId) {
                return false;
            } else {
                switch (left.typeId) {
                    case TypedOperand.TypeId.Number: return (left as NumberTypedOperand).value === (right as NumberTypedOperand).value;
                    case TypedOperand.TypeId.Field: return (left as FieldTypedOperand).fieldId === (right as FieldTypedOperand).fieldId;
                    default:
                        throw new UnreachableCaseError('SCNCSCIOE44498', left.typeId);
                }
            }
        }
    }

    export interface NumberTypedOperand extends TypedOperand {
        readonly value: number;
    }

    export interface FieldTypedOperand extends TypedOperand {
        readonly fieldId: ScanFormula.NumericFieldId;
    }

    export function isEqual(left: NumericComparisonScanCondition, right: NumericComparisonScanCondition) {
        if (left.operationId !== right.operationId) {
            return false;
        } else {
            if (!FieldOperand.isEqual(left.leftOperand, right.leftOperand)) {
                return false;
            } else {
                return TypedOperand.isEqual(left.rightOperand, right.rightOperand);
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
    not: boolean;
}

export namespace FieldScanCondition {
    export function isEqual(left: FieldScanCondition, right: FieldScanCondition) {
        return (left.fieldId === right.fieldId) && left.not === right.not;
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

export interface TextFieldIncludesScanCondition extends TextFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.TextFieldIncludes;
    readonly values: string[];
}

export namespace TextFieldIncludesScanCondition {
    export function isEqual(left: TextFieldIncludesScanCondition, right: TextFieldIncludesScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) && isArrayEqualUniquely(left.values, right.values)
        );
    }
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

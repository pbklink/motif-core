/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../../adi/adi-internal-api';
import { PickEnum, SourceTzOffsetDate, UnreachableCaseError, isArrayEqualUniquely } from '../../../sys/internal-api';
import { ScanFormula } from '../../formula/internal-api';

export interface ScanCondition {
    readonly typeId: ScanCondition.TypeId;
}

export namespace ScanCondition {
    export const enum TypeId {
        NumericComparison,
        All,
        None,
        Is,
        FieldHasValue,
        // BooleanFieldEquals,
        NumericFieldEquals,
        NumericFieldInRange,
        DateFieldEquals,
        DateFieldInRange,
        StringFieldOverlaps,
        CurrencyFieldOverlaps,
        ExchangeFieldOverlaps,
        MarketFieldOverlaps,
        MarketBoardFieldOverlaps,
        TextFieldEquals,
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
                case ScanCondition.TypeId.Is: return IsScanCondition.isEqual(left as IsScanCondition, right as IsScanCondition);
                case ScanCondition.TypeId.FieldHasValue: return FieldHasValueScanCondition.isEqual(left as FieldHasValueScanCondition, right as FieldHasValueScanCondition);
                // case ScanCondition.TypeId.BooleanFieldEquals: return BooleanFieldEqualsScanCondition.isEqual(left as BooleanFieldEqualsScanCondition, right as BooleanFieldEqualsScanCondition);
                case ScanCondition.TypeId.NumericFieldEquals: return NumericFieldEqualsScanCondition.isEqual(left as NumericFieldEqualsScanCondition, right as NumericFieldEqualsScanCondition);
                case ScanCondition.TypeId.NumericFieldInRange: return NumericFieldInRangeScanCondition.isEqual(left as NumericFieldInRangeScanCondition, right as NumericFieldInRangeScanCondition);
                case ScanCondition.TypeId.DateFieldEquals: return DateFieldEqualsScanCondition.isEqual(left as DateFieldEqualsScanCondition, right as DateFieldEqualsScanCondition);
                case ScanCondition.TypeId.DateFieldInRange: return DateFieldInRangeScanCondition.isEqual(left as DateFieldInRangeScanCondition, right as DateFieldInRangeScanCondition);
                case ScanCondition.TypeId.StringFieldOverlaps: return StringFieldOverlapsScanCondition.isEqual(left as StringFieldOverlapsScanCondition, right as StringFieldOverlapsScanCondition);
                case ScanCondition.TypeId.CurrencyFieldOverlaps: return CurrencyFieldOverlapsScanCondition.isEqual(left as CurrencyFieldOverlapsScanCondition, right as CurrencyFieldOverlapsScanCondition);
                case ScanCondition.TypeId.ExchangeFieldOverlaps: return ExchangeFieldOverlapsScanCondition.isEqual(left as ExchangeFieldOverlapsScanCondition, right as ExchangeFieldOverlapsScanCondition);
                case ScanCondition.TypeId.MarketFieldOverlaps: return MarketFieldOverlapsScanCondition.isEqual(left as MarketFieldOverlapsScanCondition, right as MarketFieldOverlapsScanCondition);
                case ScanCondition.TypeId.MarketBoardFieldOverlaps: return MarketBoardFieldOverlapsScanCondition.isEqual(left as MarketBoardFieldOverlapsScanCondition, right as MarketBoardFieldOverlapsScanCondition);
                case ScanCondition.TypeId.TextFieldEquals: return TextFieldEqualsScanCondition.isEqual(left as TextFieldEqualsScanCondition, right as TextFieldEqualsScanCondition);
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

export interface FieldScanCondition extends ScanCondition {
    readonly fieldId: ScanFormula.FieldId;
    not: boolean;
}

export namespace FieldScanCondition {
    export function isEqual(left: FieldScanCondition, right: FieldScanCondition) {
        return (left.fieldId === right.fieldId) && left.not === right.not;
    }
}

export interface NumericComparisonScanCondition extends ScanCondition {
    readonly leftOperand: ScanFormula.NumericRangeFieldId; // is left operand
    readonly operationId: NumericComparisonScanCondition.OperationId;
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
        readonly fieldId: ScanFormula.NumericRangeFieldId;
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
        readonly fieldId: ScanFormula.NumericRangeFieldId;
    }

    export function isEqual(left: NumericComparisonScanCondition, right: NumericComparisonScanCondition) {
        if (left.operationId !== right.operationId) {
            return false;
        } else {
            if (left.leftOperand !== right.leftOperand) {
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

export interface IsScanCondition extends ScanCondition {
    readonly categoryId: ScanFormula.IsNode.CategoryId;
    not: boolean;
}

export namespace IsScanCondition {
    export function isEqual(left: IsScanCondition, right: IsScanCondition) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return (left.categoryId === right.categoryId) && left.not === right.not;
    }
}

export interface FieldHasValueScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.TextHasValueEqualsFieldId | ScanFormula.NumericRangeFieldId | ScanFormula.DateRangeFieldId;
    readonly typeId: ScanCondition.TypeId.FieldHasValue;
}

export namespace FieldHasValueScanCondition {
    export function isEqual(left: FieldHasValueScanCondition, right: FieldHasValueScanCondition) {
        return FieldScanCondition.isEqual(left, right);
    }
}

// export interface BooleanFieldScanCondition extends NegateableFieldScanCondition {
//     readonly fieldId: ScanFormula.BooleanFieldId;
// }

// export interface BooleanFieldEqualsScanCondition extends BooleanFieldScanCondition {
//     readonly typeId: ScanCondition.TypeId.BooleanFieldEquals;
//     readonly target: boolean;
// }

// export namespace BooleanFieldEqualsScanCondition {
//     export function isEqual(left: BooleanFieldEqualsScanCondition, right: BooleanFieldEqualsScanCondition) {
//         return FieldScanCondition.isEqual(left, right) && (left.target === right.target);
//     }
// }

export interface NumericFieldScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.NumericRangeFieldId;
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
    readonly fieldId: ScanFormula.DateRangeFieldId;
}

export interface DateFieldEqualsScanCondition extends DateFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateFieldEquals;
    readonly target: SourceTzOffsetDate;
}

export namespace DateFieldEqualsScanCondition {
    export function isEqual(left: DateFieldEqualsScanCondition, right: DateFieldEqualsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDate.isEqual(left.target, right.target)
        );
    }
}

export interface DateFieldInRangeScanCondition extends DateFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateFieldInRange;
    readonly min: SourceTzOffsetDate | undefined;
    readonly max: SourceTzOffsetDate | undefined;
}

export namespace DateFieldInRangeScanCondition {
    export function isEqual(left: DateFieldInRangeScanCondition, right: DateFieldInRangeScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDate.isUndefinableEqual(left.min, right.min) &&
            SourceTzOffsetDate.isUndefinableEqual(left.max, right.max)
        );
    }
}

export interface OverlapsFieldScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.TextOverlapFieldId;
}

export interface StringFieldOverlapsScanCondition extends OverlapsFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.StringFieldOverlaps;
    readonly values: string[];
}

export namespace StringFieldOverlapsScanCondition {
    export function isEqual(left: StringFieldOverlapsScanCondition, right: StringFieldOverlapsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) && isArrayEqualUniquely(left.values, right.values)
        );
    }
}

export interface CurrencyFieldOverlapsScanCondition extends OverlapsFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.CurrencyFieldOverlaps;
    readonly values: CurrencyId[];
}

export namespace CurrencyFieldOverlapsScanCondition {
    export function isEqual(left: CurrencyFieldOverlapsScanCondition, right: CurrencyFieldOverlapsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) && isArrayEqualUniquely(left.values, right.values)
        );
    }
}

export interface ExchangeFieldOverlapsScanCondition extends OverlapsFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.ExchangeFieldOverlaps;
    readonly values: ExchangeId[];
}

export namespace ExchangeFieldOverlapsScanCondition {
    export function isEqual(left: ExchangeFieldOverlapsScanCondition, right: ExchangeFieldOverlapsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) && isArrayEqualUniquely(left.values, right.values)
        );
    }
}

export interface MarketFieldOverlapsScanCondition extends OverlapsFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.MarketFieldOverlaps;
    readonly values: MarketId[];
}

export namespace MarketFieldOverlapsScanCondition {
    export function isEqual(left: MarketFieldOverlapsScanCondition, right: MarketFieldOverlapsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) && isArrayEqualUniquely(left.values, right.values)
        );
    }
}

export interface MarketBoardFieldOverlapsScanCondition extends OverlapsFieldScanCondition {
    readonly typeId: ScanCondition.TypeId.MarketBoardFieldOverlaps;
    readonly values: MarketBoardId[];
}

export namespace MarketBoardFieldOverlapsScanCondition {
    export function isEqual(left: MarketBoardFieldOverlapsScanCondition, right: MarketBoardFieldOverlapsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right) && isArrayEqualUniquely(left.values, right.values)
        );
    }
}

export interface TextFieldScanCondition extends FieldScanCondition {
    readonly fieldId: ScanFormula.TextContainsFieldId | ScanFormula.TextEqualsFieldId;
}

export interface TextFieldEqualsScanCondition extends TextFieldScanCondition {
    readonly fieldId: ScanFormula.TextEqualsFieldId;
    readonly typeId: ScanCondition.TypeId.TextFieldEquals;
    readonly target: string;
}

export namespace TextFieldEqualsScanCondition {
    export function isEqual(left: TextFieldEqualsScanCondition, right: TextFieldEqualsScanCondition) {
        return (
            FieldScanCondition.isEqual(left, right)
            &&
            (left.target === right.target)
        );
    }
}

export interface TextFieldContainsScanCondition extends TextFieldScanCondition {
    readonly fieldId: ScanFormula.TextContainsFieldId;
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

export interface PriceSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.PriceSubbed, ScanFormula.PriceSubFieldId> {

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

export interface DateSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.DateSubbed, ScanFormula.DateSubFieldId> {

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
    readonly target: SourceTzOffsetDate;
}

export namespace DateSubFieldEqualsScanCondition {
    export function isEqual(left: DateSubFieldEqualsScanCondition, right: DateSubFieldEqualsScanCondition) {
        return (
            SubFieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDate.isEqual(left.target, right.target)
        );
    }
}

export interface DateSubFieldInRangeScanCondition extends DateSubfieldScanCondition {
    readonly typeId: ScanCondition.TypeId.DateSubFieldInRange;
    readonly min: SourceTzOffsetDate | undefined;
    readonly max: SourceTzOffsetDate | undefined;
}

export namespace DateSubFieldInRangeScanCondition {
    export function isEqual(left: DateSubFieldInRangeScanCondition, right: DateSubFieldInRangeScanCondition) {
        return (
            SubFieldScanCondition.isEqual(left, right) &&
            SourceTzOffsetDate.isUndefinableEqual(left.min, right.min) &&
            SourceTzOffsetDate.isUndefinableEqual(left.max, right.max)
        );
    }
}

export interface AltCodeSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.AltCodeSubbed, ScanFormula.AltCodeSubFieldId> {

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

export interface AttributeSubfieldScanCondition extends SubFieldScanCondition<ScanFormula.FieldId.AttributeSubbed, ScanFormula.AttributeSubFieldId> {

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

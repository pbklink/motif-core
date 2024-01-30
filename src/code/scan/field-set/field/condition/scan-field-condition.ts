/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../../../adi/adi-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, Integer, PickEnum, SourceTzOffsetDateTime, UnreachableCaseError, isArrayEqualUniquely } from '../../../../sys/sys-internal-api';
import { ScanFormula } from '../../../formula/internal-api';

export interface ScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId;
    // readonly typeId: ScanField.TypeId;
    // readonly fieldId: ScanFormula.FieldId;
}

export namespace ScanFieldCondition {
    export const enum TypeId {
        Numeric,
        NumericComparison,
        Date,
        TextEquals, // Single Equals
        TextContains, // Text
        TextHasValueEquals, // Single Exists
        TextHasValueContains, // Subbed Text
        StringOverlaps,
        CurrencyOverlaps,
        ExchangeOverlaps,
        MarketOverlaps,
        MarketBoardOverlaps,
        Is,
    }


    export const enum OperatorId {
        HasValue,
        NotHasValue,
        Equals,
        NotEquals,
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual,
        InRange,
        NotInRange,
        Contains,
        NotContains,
        Overlaps,
        NotOverlaps,
        Is,
        NotIs,
    }

    export function isEqual(left: ScanFieldCondition, right: ScanFieldCondition) {
        return left.typeId === right.typeId;
    }

    export function typedIsEqual(left: ScanFieldCondition, right: ScanFieldCondition) {
        if (left.typeId !== right.typeId) {
            return false;
        } else {
            switch (left.typeId) {
                case ScanFieldCondition.TypeId.Numeric: return NumericScanFieldCondition.isEqual(left as NumericScanFieldCondition, right as NumericScanFieldCondition);
                case ScanFieldCondition.TypeId.NumericComparison: return NumericComparisonScanFieldCondition.isEqual(left as NumericComparisonScanFieldCondition, right as NumericComparisonScanFieldCondition);
                case ScanFieldCondition.TypeId.Date: return DateScanFieldCondition.isEqual(left as DateScanFieldCondition, right as DateScanFieldCondition);
                case ScanFieldCondition.TypeId.TextEquals: return TextEqualsScanFieldCondition.isEqual(left as TextEqualsScanFieldCondition, right as TextEqualsScanFieldCondition);
                case ScanFieldCondition.TypeId.TextContains: return TextContainsScanFieldCondition.isEqual(left as TextContainsScanFieldCondition, right as TextContainsScanFieldCondition);
                case ScanFieldCondition.TypeId.TextHasValueEquals: return TextHasValueEqualsScanFieldCondition.isEqual(left as TextHasValueEqualsScanFieldCondition, right as TextHasValueEqualsScanFieldCondition);
                case ScanFieldCondition.TypeId.TextHasValueContains: return TextHasValueContainsScanFieldCondition.isEqual(left as TextHasValueContainsScanFieldCondition, right as TextHasValueContainsScanFieldCondition);
                case ScanFieldCondition.TypeId.StringOverlaps: return StringOverlapsScanFieldCondition.isEqual(left as StringOverlapsScanFieldCondition, right as StringOverlapsScanFieldCondition);
                case ScanFieldCondition.TypeId.MarketBoardOverlaps: return MarketBoardOverlapsScanFieldCondition.isEqual(left as MarketBoardOverlapsScanFieldCondition, right as MarketBoardOverlapsScanFieldCondition);
                case ScanFieldCondition.TypeId.CurrencyOverlaps: return CurrencyOverlapsScanFieldCondition.isEqual(left as CurrencyOverlapsScanFieldCondition, right as CurrencyOverlapsScanFieldCondition);
                case ScanFieldCondition.TypeId.ExchangeOverlaps: return ExchangeOverlapsScanFieldCondition.isEqual(left as ExchangeOverlapsScanFieldCondition, right as ExchangeOverlapsScanFieldCondition);
                case ScanFieldCondition.TypeId.MarketOverlaps: return MarketOverlapsScanFieldCondition.isEqual(left as MarketOverlapsScanFieldCondition, right as MarketOverlapsScanFieldCondition);
                case ScanFieldCondition.TypeId.Is: return IsScanFieldCondition.isEqual(left as IsScanFieldCondition, right as IsScanFieldCondition);
                default:
                    throw new UnreachableCaseError('SFCSFCTIE50807', left.typeId);
            }
        }
    }


    export function createFormulaNode(
        fieldId: ScanFormula.FieldId,
        subFieldId: Integer | undefined,
        condition: ScanFieldCondition
    ): ScanFormula.BooleanNode {
        switch (condition.typeId) {
            case ScanFieldCondition.TypeId.Numeric:
                return createFormulaNodeForNumeric(fieldId as ScanFormula.NumericRangeSubbedFieldId, subFieldId, condition as NumericScanFieldCondition);
            case ScanFieldCondition.TypeId.NumericComparison:
                // Note that it is correct that type NumericComparison creates NumericFormulaNode (rather than Numeric type creates NumericFormulaNode)
                return createFormulaNodeForNumericComparison(fieldId as ScanFormula.NumericRangeFieldId, condition as NumericComparisonScanFieldCondition);
            case ScanFieldCondition.TypeId.Date:
                return createFormulaNodeForDateAndSubbed(fieldId, subFieldId, condition as DateScanFieldCondition);
            case ScanFieldCondition.TypeId.TextEquals:
                return createFormulaNodeForTextEquals(fieldId as ScanFormula.TextEqualsFieldId, condition as TextEqualsScanFieldCondition);
            case ScanFieldCondition.TypeId.TextContains:
                return createFormulaNodeForTextContains(fieldId as ScanFormula.TextContainsFieldId, condition as TextContainsScanFieldCondition);
            case ScanFieldCondition.TypeId.TextHasValueEquals:
                return createFormulaNodeForTextHasValueEquals(fieldId as ScanFormula.TextHasValueEqualsFieldId, condition as TextHasValueEqualsScanFieldCondition);
            case ScanFieldCondition.TypeId.TextHasValueContains:
                return createFormulaNodeForTextHasValueContains(fieldId as ScanFormula.TextContainsSubbedFieldId, subFieldId, condition as TextHasValueContainsScanFieldCondition);
            case ScanFieldCondition.TypeId.StringOverlaps:
                return createFormulaNodeForStringOverlaps(fieldId as ScanFormula.StringOverlapsFieldId, condition as StringOverlapsScanFieldCondition);
            case ScanFieldCondition.TypeId.CurrencyOverlaps:
                return createFormulaNodeForCurrencyOverlaps(fieldId as ScanFormula.FieldId.Currency, condition as CurrencyOverlapsScanFieldCondition);
            case ScanFieldCondition.TypeId.ExchangeOverlaps:
                return createFormulaNodeForExchangeOverlaps(fieldId as ScanFormula.FieldId.Exchange, condition as ExchangeOverlapsScanFieldCondition);
            case ScanFieldCondition.TypeId.MarketOverlaps:
                return createFormulaNodeForMarketOverlaps(fieldId as ScanFormula.MarketOverlapsFieldId, condition as MarketOverlapsScanFieldCondition);
            case ScanFieldCondition.TypeId.MarketBoardOverlaps:
                return createFormulaNodeForMarketBoardOverlaps(fieldId as ScanFormula.FieldId.MarketBoard, condition as MarketBoardOverlapsScanFieldCondition);
            case ScanFieldCondition.TypeId.Is:
                return createFormulaNodeForIs(condition as IsScanFieldCondition);
            default:
                throw new UnreachableCaseError('SCSCCBN10873', condition.typeId);
        }
    }

    function createFormulaNodeForFieldHasValue(
        fieldId: ScanFormula.NumericRangeFieldId | ScanFormula.TextHasValueEqualsFieldId | ScanFormula.DateRangeFieldId,
        not: boolean
    ): ScanFormula.FieldHasValueNode | ScanFormula.NotNode {
        const fieldHasValueNode = new ScanFormula.FieldHasValueNode();
        fieldHasValueNode.fieldId = fieldId;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = fieldHasValueNode;
            return notNode;
        } else {
            return fieldHasValueNode;
        }
    }

    function createFormulaNodeForNumericComparisonFieldEquals(
        fieldId: ScanFormula.NumericRangeFieldId,
        value: number,
        not: boolean,
    ): ScanFormula.NumericFieldEqualsNode | ScanFormula.NotNode {
        const numericFieldEqualsNode = new ScanFormula.NumericFieldEqualsNode();
        numericFieldEqualsNode.fieldId = fieldId;
        numericFieldEqualsNode.value = value;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = numericFieldEqualsNode;
            return notNode;
        } else {
            return numericFieldEqualsNode;
        }
    }

    function createFormulaNodeForNumericComparisonInRange(
        fieldId: ScanFormula.NumericRangeFieldId,
        min: number | undefined,
        max: number | undefined,
        not: boolean,
    ): ScanFormula.NumericFieldInRangeNode | ScanFormula.NotNode {
        const numericFieldInRangeNode = new ScanFormula.NumericFieldInRangeNode();
        numericFieldInRangeNode.fieldId = fieldId;
        numericFieldInRangeNode.min = min;
        numericFieldInRangeNode.max = max;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = numericFieldInRangeNode;
            return notNode;
        } else {
            return numericFieldInRangeNode;
        }
    }

    function createFormulaNodeForNumericComparisonGreaterLess<T extends ScanFormula.NumericComparisonBooleanNode>(
        nodeConstructor: new() => T,
        fieldId: ScanFormula.NumericRangeFieldId,
        value: number,
    ): T {
        const numericComparisonBooleanNode = new nodeConstructor();
        const numericFieldValueGetNode = new ScanFormula.NumericFieldValueGetNode();
        numericFieldValueGetNode.fieldId = fieldId;
        numericComparisonBooleanNode.leftOperand = numericFieldValueGetNode;
        numericComparisonBooleanNode.rightOperand = value;
        return numericComparisonBooleanNode;
    }

    function createFormulaNodeForNumericComparison(
        fieldId: ScanFormula.NumericRangeFieldId,
        condition: NumericComparisonScanFieldCondition
    ) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case OperatorId.HasValue:
                if (BaseNumericScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForFieldHasValue(fieldId, false);
                } else {
                    throw new AssertInternalError('SFCCNFNHV78134', condition.operatorId.toString());
                }
            case OperatorId.NotHasValue:
                if (BaseNumericScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForFieldHasValue(fieldId, true);
                } else {
                    throw new AssertInternalError('SFCCNFNNHV78134', condition.operatorId.toString());
                }
            case OperatorId.Equals:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonFieldEquals(fieldId, operands.value, false);
                } else {
                    throw new AssertInternalError('SFCCNFNE78134', condition.operatorId.toString());
                }
            case OperatorId.NotEquals:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonFieldEquals(fieldId, operands.value, true);
                } else {
                    throw new AssertInternalError('SFCCNFNNE78134', condition.operatorId.toString());
                }
            case OperatorId.GreaterThan:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonGreaterLess(ScanFormula.NumericGreaterThanNode, fieldId, operands.value);
                } else {
                    throw new AssertInternalError('SFCCNFNGT78134', condition.operatorId.toString());
                }
            case OperatorId.GreaterThanOrEqual:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonGreaterLess(ScanFormula.NumericGreaterThanOrEqualNode, fieldId, operands.value);
                } else {
                    throw new AssertInternalError('SFCCNFNGTE78134', condition.operatorId.toString());
                }
            case OperatorId.LessThan:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonGreaterLess(ScanFormula.NumericLessThanNode, fieldId, operands.value);
                } else {
                    throw new AssertInternalError('SFCCNFNLT78134', condition.operatorId.toString());
                }
            case OperatorId.LessThanOrEqual:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonGreaterLess(ScanFormula.NumericLessThanOrEqualNode, fieldId, operands.value);
                } else {
                    throw new AssertInternalError('SFCCNFNLTE78134', condition.operatorId.toString());
                }
            case OperatorId.InRange:
                if (BaseNumericScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonInRange(fieldId, operands.min, operands.max, false);
                } else {
                    throw new AssertInternalError('SFCCNFNIR78134', condition.operatorId.toString());
                }
            case OperatorId.NotInRange:
                if (BaseNumericScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForNumericComparisonInRange(fieldId, operands.min, operands.max, true);
                } else {
                    throw new AssertInternalError('SFCCNFNIR78134', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNND78134', condition.operatorId)
        }
    }

    function createFormulaNodeForNumeric(
        fieldId: ScanFormula.NumericRangeSubbedFieldId,
        subFieldId: Integer | undefined,
        condition: NumericScanFieldCondition
    ) {
        switch (fieldId) {
            case ScanFormula.FieldId.PriceSubbed:
                return createFormulaNodeForPriceSubField(fieldId as ScanFormula.FieldId.PriceSubbed, subFieldId as ScanFormula.PriceSubFieldId, condition);
            default:
                throw new UnreachableCaseError('SFCCNRSFN78134', fieldId);
        }
    }

    function createFormulaNodeForPriceSubField(
        fieldId: ScanFormula.FieldId.PriceSubbed,
        subFieldId: ScanFormula.PriceSubFieldId,
        condition: NumericScanFieldCondition
    ) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case OperatorId.HasValue:
                if (BaseNumericScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForPriceSubFieldHasValue(fieldId, subFieldId, false);
                } else {
                    throw new AssertInternalError('SFCCPSFNHV78134', condition.operatorId.toString());
                }
            case OperatorId.NotHasValue:
                if (BaseNumericScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForPriceSubFieldHasValue(fieldId, subFieldId, true);
                } else {
                    throw new AssertInternalError('SFCCPSFNNHV78134', condition.operatorId.toString());
                }
            case OperatorId.Equals:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForPriceSubFieldEquals(fieldId, subFieldId, operands.value, false);
                } else {
                    throw new AssertInternalError('SFCCPSFNE78134', condition.operatorId.toString());
                }
            case OperatorId.NotEquals:
                if (BaseNumericScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForPriceSubFieldEquals(fieldId, subFieldId, operands.value, true);
                } else {
                    throw new AssertInternalError('SFCCPSFNNE78134', condition.operatorId.toString());
                }
            case OperatorId.InRange:
                if (BaseNumericScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForPriceSubFieldInRange(fieldId, subFieldId, operands.min, operands.max, false);
                } else {
                    throw new AssertInternalError('SFCCPSFNIR78134', condition.operatorId.toString());
                }
            case OperatorId.NotInRange:
                if (BaseNumericScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForPriceSubFieldInRange(fieldId, subFieldId, operands.min, operands.max, true);
                } else {
                    throw new AssertInternalError('SFCCPSFNIR78134', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCPSFNND78134', condition.operatorId)
        }
    }

    function createFormulaNodeForPriceSubFieldHasValue(
        fieldId: ScanFormula.FieldId.PriceSubbed,
        subFieldId: ScanFormula.PriceSubFieldId,
        not: boolean
    ): ScanFormula.PriceSubFieldHasValueNode | ScanFormula.NotNode {
        const priceSubFieldHasValueNode = new ScanFormula.PriceSubFieldHasValueNode();
        priceSubFieldHasValueNode.fieldId = fieldId;
        priceSubFieldHasValueNode.subFieldId = subFieldId;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = priceSubFieldHasValueNode;
            return notNode;
        } else {
            return priceSubFieldHasValueNode;
        }
    }

    function createFormulaNodeForPriceSubFieldEquals(
        fieldId: ScanFormula.FieldId.PriceSubbed,
        subFieldId: ScanFormula.PriceSubFieldId,
        value: number,
        not: boolean,
    ): ScanFormula.PriceSubFieldEqualsNode | ScanFormula.NotNode {
        const priceSubFieldEqualsNode = new ScanFormula.PriceSubFieldEqualsNode();
        priceSubFieldEqualsNode.fieldId = fieldId;
        priceSubFieldEqualsNode.subFieldId = subFieldId;
        priceSubFieldEqualsNode.value = value;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = priceSubFieldEqualsNode;
            return notNode;
        } else {
            return priceSubFieldEqualsNode;
        }
    }

    function createFormulaNodeForPriceSubFieldInRange(
        fieldId: ScanFormula.FieldId.PriceSubbed,
        subFieldId: ScanFormula.PriceSubFieldId,
        min: number | undefined,
        max: number | undefined,
        not: boolean,
    ): ScanFormula.PriceSubFieldInRangeNode | ScanFormula.NotNode {
        const priceSubFieldInRangeNode = new ScanFormula.PriceSubFieldInRangeNode();
        priceSubFieldInRangeNode.fieldId = fieldId;
        priceSubFieldInRangeNode.subFieldId = subFieldId;
        priceSubFieldInRangeNode.min = min;
        priceSubFieldInRangeNode.max = max;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = priceSubFieldInRangeNode;
            return notNode;
        } else {
            return priceSubFieldInRangeNode;
        }
    }

    function createFormulaNodeForDateAndSubbed(
        fieldId: ScanFormula.FieldId,
        subFieldId: Integer | undefined,
        condition: DateScanFieldCondition
    ) {
        const subbed = ScanFormula.Field.idToSubbed(fieldId);
        if (subbed) {
            return createFormulaNodeForDateSubbed(fieldId as ScanFormula.DateRangeSubbedFieldId, subFieldId, condition);
        } else {
            return createFormulaNodeForDate(fieldId as ScanFormula.DateRangeFieldId, condition);
        }
    }

    function createFormulaNodeForDate(fieldId: ScanFormula.DateRangeFieldId, condition: DateScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case OperatorId.HasValue:
                if (DateScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForFieldHasValue(fieldId, false);
                } else {
                    throw new AssertInternalError('SFCCFNFDHV78134', condition.operatorId.toString());
                }
            case OperatorId.NotHasValue:
                if (DateScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForFieldHasValue(fieldId, true);
                } else {
                    throw new AssertInternalError('SFCCFNFDNHV78134', condition.operatorId.toString());
                }
            case OperatorId.Equals:
                if (DateScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForDateFieldEquals(fieldId, operands.value, false);
                } else {
                    throw new AssertInternalError('SFCCFNFDE78134', condition.operatorId.toString());
                }
            case OperatorId.NotEquals:
                if (DateScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForDateFieldEquals(fieldId, operands.value, true);
                } else {
                    throw new AssertInternalError('SFCCFNFDNE78134', condition.operatorId.toString());
                }
            case OperatorId.InRange:
                if (DateScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForDateFieldInRange(fieldId, operands.min, operands.max, false);
                } else {
                    throw new AssertInternalError('SFCCFNFDIR78134', condition.operatorId.toString());
                }
            case OperatorId.NotInRange:
                if (DateScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForDateFieldInRange(fieldId, operands.min, operands.max, true);
                } else {
                    throw new AssertInternalError('SFCCFNFDIR78134', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNFDD78134', condition.operatorId)
        }
    }

    function createFormulaNodeForDateFieldEquals(
        fieldId: ScanFormula.DateRangeFieldId,
        value: SourceTzOffsetDateTime,
        not: boolean,
    ): ScanFormula.DateFieldEqualsNode | ScanFormula.NotNode {
        const dateFieldEqualsNode = new ScanFormula.DateFieldEqualsNode();
        dateFieldEqualsNode.fieldId = fieldId;
        dateFieldEqualsNode.value = SourceTzOffsetDateTime.createCopy(value);
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = dateFieldEqualsNode;
            return notNode;
        } else {
            return dateFieldEqualsNode;
        }
    }

    function createFormulaNodeForDateFieldInRange(
        fieldId: ScanFormula.DateRangeFieldId,
        min: SourceTzOffsetDateTime | undefined,
        max: SourceTzOffsetDateTime | undefined,
        not: boolean,
    ): ScanFormula.DateFieldInRangeNode | ScanFormula.NotNode {
        const dateFieldInRangeNode = new ScanFormula.DateFieldInRangeNode();
        dateFieldInRangeNode.fieldId = fieldId;
        dateFieldInRangeNode.min = SourceTzOffsetDateTime.newUndefinable(min);
        dateFieldInRangeNode.max = SourceTzOffsetDateTime.newUndefinable(max);
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = dateFieldInRangeNode;
            return notNode;
        } else {
            return dateFieldInRangeNode;
        }
    }

    function createFormulaNodeForDateSubbed(fieldId: ScanFormula.DateRangeSubbedFieldId, subFieldId: Integer | undefined, condition: DateScanFieldCondition) {
        switch (fieldId) {
            case ScanFormula.FieldId.DateSubbed:
                return createFormulaNodeForDateSub(fieldId as ScanFormula.FieldId.DateSubbed, subFieldId as ScanFormula.DateSubFieldId, condition);
            default:
                throw new UnreachableCaseError('SFCCFNFDSBU78134', fieldId);
        }
    }

    function createFormulaNodeForDateSub(
        fieldId: ScanFormula.FieldId.DateSubbed,
        subFieldId: ScanFormula.DateSubFieldId,
        condition: DateScanFieldCondition
    ) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case OperatorId.HasValue:
                if (DateScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForDateSubFieldHasValue(fieldId, subFieldId, false);
                } else {
                    throw new AssertInternalError('SFCCFNFDSHV78134', condition.operatorId.toString());
                }
            case OperatorId.NotHasValue:
                if (DateScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForDateSubFieldHasValue(fieldId, subFieldId, true);
                } else {
                    throw new AssertInternalError('SFCCFNFDSNHV78134', condition.operatorId.toString());
                }
            case OperatorId.Equals:
                if (DateScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForDateSubFieldEquals(fieldId, subFieldId, operands.value, false);
                } else {
                    throw new AssertInternalError('SFCCFNFDSE78134', condition.operatorId.toString());
                }
            case OperatorId.NotEquals:
                if (DateScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForDateSubFieldEquals(fieldId, subFieldId, operands.value, true);
                } else {
                    throw new AssertInternalError('SFCCFNFDSNE78134', condition.operatorId.toString());
                }
            case OperatorId.InRange:
                if (DateScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForDateSubFieldInRange(fieldId, subFieldId, operands.min, operands.max, false);
                } else {
                    throw new AssertInternalError('SFCCFNFDSIR78134', condition.operatorId.toString());
                }
            case OperatorId.NotInRange:
                if (DateScanFieldCondition.RangeOperands.is(operands)) {
                    return createFormulaNodeForDateSubFieldInRange(fieldId, subFieldId, operands.min, operands.max, true);
                } else {
                    throw new AssertInternalError('SFCCFNFDSIR78134', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNFDSND78134', condition.operatorId)
        }
    }

    function createFormulaNodeForDateSubFieldHasValue(
        fieldId: ScanFormula.FieldId.DateSubbed,
        subFieldId: ScanFormula.DateSubFieldId,
        not: boolean
    ): ScanFormula.DateSubFieldHasValueNode | ScanFormula.NotNode {
        const dateSubFieldHasValueNode = new ScanFormula.DateSubFieldHasValueNode();
        dateSubFieldHasValueNode.fieldId = fieldId;
        dateSubFieldHasValueNode.subFieldId = subFieldId;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = dateSubFieldHasValueNode;
            return notNode;
        } else {
            return dateSubFieldHasValueNode;
        }
    }

    function createFormulaNodeForDateSubFieldEquals(
        fieldId: ScanFormula.FieldId.DateSubbed,
        subFieldId: ScanFormula.DateSubFieldId,
        value: SourceTzOffsetDateTime,
        not: boolean,
    ): ScanFormula.DateSubFieldEqualsNode | ScanFormula.NotNode {
        const dateSubFieldEqualsNode = new ScanFormula.DateSubFieldEqualsNode();
        dateSubFieldEqualsNode.fieldId = fieldId;
        dateSubFieldEqualsNode.subFieldId = subFieldId;
        dateSubFieldEqualsNode.value = SourceTzOffsetDateTime.createCopy(value);
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = dateSubFieldEqualsNode;
            return notNode;
        } else {
            return dateSubFieldEqualsNode;
        }
    }

    function createFormulaNodeForDateSubFieldInRange(
        fieldId: ScanFormula.FieldId.DateSubbed,
        subFieldId: ScanFormula.DateSubFieldId,
        min: SourceTzOffsetDateTime | undefined,
        max: SourceTzOffsetDateTime | undefined,
        not: boolean,
    ): ScanFormula.DateSubFieldInRangeNode | ScanFormula.NotNode {
        const dateSubFieldInRangeNode = new ScanFormula.DateSubFieldInRangeNode();
        dateSubFieldInRangeNode.fieldId = fieldId;
        dateSubFieldInRangeNode.subFieldId = subFieldId;
        dateSubFieldInRangeNode.min = SourceTzOffsetDateTime.newUndefinable(min);
        dateSubFieldInRangeNode.max = SourceTzOffsetDateTime.newUndefinable(max);
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = dateSubFieldInRangeNode;
            return notNode;
        } else {
            return dateSubFieldInRangeNode;
        }
    }

    function createFormulaNodeForTextEquals(fieldId: ScanFormula.TextEqualsFieldId, condition: TextEqualsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Equals:
                if (BaseTextScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForTextFieldEquals(fieldId, operands.value, false);
                } else {
                    throw new AssertInternalError('SFCCFNFTEE34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotEquals:
                if (BaseTextScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForTextFieldEquals(fieldId, operands.value, true);
                } else {
                    throw new AssertInternalError('SFCCFNFTENE34444', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNFTED45998', condition.operatorId);
        }
    }

    function createFormulaNodeForTextContains(fieldId: ScanFormula.TextContainsFieldId, condition: TextContainsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Contains:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForTextFieldContains(fieldId, operands.contains, false);
                } else {
                    throw new AssertInternalError('SFCCFNFTCC34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotContains:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForTextFieldContains(fieldId, operands.contains, true);
                } else {
                    throw new AssertInternalError('SFCCFNFTCNC34444', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNFTCD45998', condition.operatorId);
        }
    }

    function createFormulaNodeForTextHasValueEquals(fieldId: ScanFormula.TextHasValueEqualsFieldId, condition: TextHasValueEqualsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
                if (BaseTextScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForFieldHasValue(fieldId, false);
                } else {
                    throw new AssertInternalError('SFCCFNFTHVEHV34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotHasValue:
                if (BaseTextScanFieldCondition.HasValueOperands.is(operands)) {
                    return createFormulaNodeForFieldHasValue(fieldId, true);
                } else {
                    throw new AssertInternalError('SFCCFNFTHVENHV34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.Equals:
                if (BaseTextScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForTextFieldEquals(fieldId as ScanFormula.TextEqualsFieldId, operands.value, false);
                } else {
                    throw new AssertInternalError('SFCCFNFTHVEE34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotEquals:
                if (BaseTextScanFieldCondition.ValueOperands.is(operands)) {
                    return createFormulaNodeForTextFieldEquals(fieldId as ScanFormula.TextEqualsFieldId, operands.value, true);
                } else {
                    throw new AssertInternalError('SFCCFNFTHVENE34444', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNFTHVED45998', condition.operatorId);
        }
    }

    function createFormulaNodeForTextFieldEquals(fieldId: ScanFormula.TextEqualsFieldId, value: string, not: boolean): ScanFormula.TextFieldEqualsNode | ScanFormula.NotNode {
        const textFieldEqualsNode = new ScanFormula.TextFieldEqualsNode();
        textFieldEqualsNode.fieldId = fieldId;
        textFieldEqualsNode.value = value;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = textFieldEqualsNode;
            return notNode;
        } else {
            return textFieldEqualsNode;
        }
    }

    function createFormulaNodeForTextFieldContains(
        fieldId: ScanFormula.TextContainsFieldId,
        containsOperand: BaseTextScanFieldCondition.ContainsOperand,
        not: boolean
    ): ScanFormula.TextFieldContainsNode | ScanFormula.NotNode {
        const textFieldContainsNode = new ScanFormula.TextFieldContainsNode();
        textFieldContainsNode.fieldId = fieldId;
        textFieldContainsNode.value = containsOperand.value;
        textFieldContainsNode.asId = containsOperand.asId;
        textFieldContainsNode.ignoreCase = containsOperand.ignoreCase;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = textFieldContainsNode;
            return notNode;
        } else {
            return textFieldContainsNode;
        }
    }

    function createFormulaNodeForTextHasValueContains(
        fieldId: ScanFormula.TextContainsSubbedFieldId,
        subFieldId: Integer | undefined,
        condition: TextHasValueContainsScanFieldCondition,
    ) {
        switch (fieldId) {
            case ScanFormula.FieldId.AltCodeSubbed:
                return createFormulaNodeForAltCodeSubField(fieldId as ScanFormula.FieldId.AltCodeSubbed, subFieldId as ScanFormula.AltCodeSubFieldId, condition);
            case ScanFormula.FieldId.AttributeSubbed:
                return createFormulaNodeForAttributeSubField(fieldId as ScanFormula.FieldId.AttributeSubbed, subFieldId as ScanFormula.AttributeSubFieldId, condition);
            default:
                throw new UnreachableCaseError('SFCCNFTHVC78134', fieldId);
        }
    }

    function createFormulaNodeForAltCodeSubField(
        fieldId: ScanFormula.FieldId.AltCodeSubbed,
        subFieldId: ScanFormula.AltCodeSubFieldId,
        condition: TextHasValueContainsScanFieldCondition,
    ) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAltCodeSubFieldHasValue(fieldId, subFieldId, false);
                } else {
                    throw new AssertInternalError('SFCCFNFACSFHV34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotHasValue:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAltCodeSubFieldHasValue(fieldId, subFieldId, true);
                } else {
                    throw new AssertInternalError('SFCCFNFACSFNNHV34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.Contains:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAltCodeSubFieldContains(fieldId, subFieldId, operands.contains, false);
                } else {
                    throw new AssertInternalError('SFCCFNFACSFC34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotContains:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAltCodeSubFieldContains(fieldId, subFieldId, operands.contains, true);
                } else {
                    throw new AssertInternalError('SFCCFNFACSFNC34444', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNFACSFD45998', condition.operatorId);
        }
    }

    function createFormulaNodeForAltCodeSubFieldHasValue(
        fieldId: ScanFormula.FieldId.AltCodeSubbed,
        subFieldId: ScanFormula.AltCodeSubFieldId,
        not: boolean
    ): ScanFormula.AltCodeSubFieldHasValueNode | ScanFormula.NotNode {
        const altCodeSubFieldHasValueNode = new ScanFormula.AltCodeSubFieldHasValueNode();
        altCodeSubFieldHasValueNode.fieldId = fieldId;
        altCodeSubFieldHasValueNode.subFieldId = subFieldId;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = altCodeSubFieldHasValueNode;
            return notNode;
        } else {
            return altCodeSubFieldHasValueNode;
        }
    }

    function createFormulaNodeForAltCodeSubFieldContains(
        fieldId: ScanFormula.FieldId.AltCodeSubbed,
        subFieldId: ScanFormula.AltCodeSubFieldId,
        containsOperand: BaseTextScanFieldCondition.ContainsOperand,
        not: boolean
    ): ScanFormula.AltCodeSubFieldContainsNode | ScanFormula.NotNode {
        const altCodeSubFieldContainsNode = new ScanFormula.AltCodeSubFieldContainsNode();
        altCodeSubFieldContainsNode.fieldId = fieldId;
        altCodeSubFieldContainsNode.subFieldId = subFieldId;
        altCodeSubFieldContainsNode.value = containsOperand.value;
        altCodeSubFieldContainsNode.asId = containsOperand.asId;
        altCodeSubFieldContainsNode.ignoreCase = containsOperand.ignoreCase;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = altCodeSubFieldContainsNode;
            return notNode;
        } else {
            return altCodeSubFieldContainsNode;
        }
    }

    function createFormulaNodeForAttributeSubField(
        fieldId: ScanFormula.FieldId.AttributeSubbed,
        subFieldId: ScanFormula.AttributeSubFieldId,
        condition: TextHasValueContainsScanFieldCondition,
    ) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.HasValue:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAttributeSubFieldHasValue(fieldId, subFieldId, false);
                } else {
                    throw new AssertInternalError('SFCCFNFATSFHV34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotHasValue:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAttributeSubFieldHasValue(fieldId, subFieldId, true);
                } else {
                    throw new AssertInternalError('SFCCFNFATSFNNHV34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.Contains:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAttributeSubFieldContains(fieldId, subFieldId, operands.contains, false);
                } else {
                    throw new AssertInternalError('SFCCFNFATSFC34444', condition.operatorId.toString());
                }
            case ScanFieldCondition.OperatorId.NotContains:
                if (BaseTextScanFieldCondition.ContainsOperands.is(operands)) {
                    return createFormulaNodeForAttributeSubFieldContains(fieldId, subFieldId, operands.contains, true);
                } else {
                    throw new AssertInternalError('SFCCFNFATSFNC34444', condition.operatorId.toString());
                }
            default:
                throw new UnreachableCaseError('SFCCFNFATSFD45998', condition.operatorId);
        }
    }

    function createFormulaNodeForAttributeSubFieldHasValue(
        fieldId: ScanFormula.FieldId.AttributeSubbed,
        subFieldId: ScanFormula.AttributeSubFieldId,
        not: boolean
    ): ScanFormula.AttributeSubFieldHasValueNode | ScanFormula.NotNode {
        const attributeSubFieldHasValueNode = new ScanFormula.AttributeSubFieldHasValueNode();
        attributeSubFieldHasValueNode.fieldId = fieldId;
        attributeSubFieldHasValueNode.subFieldId = subFieldId;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = attributeSubFieldHasValueNode;
            return notNode;
        } else {
            return attributeSubFieldHasValueNode;
        }
    }

    function createFormulaNodeForAttributeSubFieldContains(
        fieldId: ScanFormula.FieldId.AttributeSubbed,
        subFieldId: ScanFormula.AttributeSubFieldId,
        containsOperand: BaseTextScanFieldCondition.ContainsOperand,
        not: boolean
    ): ScanFormula.AttributeSubFieldContainsNode | ScanFormula.NotNode {
        const attributeSubFieldContainsNode = new ScanFormula.AttributeSubFieldContainsNode();
        attributeSubFieldContainsNode.fieldId = fieldId;
        attributeSubFieldContainsNode.subFieldId = subFieldId;
        attributeSubFieldContainsNode.value = containsOperand.value;
        attributeSubFieldContainsNode.asId = containsOperand.asId;
        attributeSubFieldContainsNode.ignoreCase = containsOperand.ignoreCase;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = attributeSubFieldContainsNode;
            return notNode;
        } else {
            return attributeSubFieldContainsNode;
        }
    }

    function createFormulaNodeForStringOverlaps(fieldId: ScanFormula.StringOverlapsFieldId, condition: StringOverlapsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
                return createFormulaNodeForStringOverlapsValues(fieldId, operands.values, false);
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return createFormulaNodeForStringOverlapsValues(fieldId, operands.values, true);
            default:
                throw new UnreachableCaseError('SFCCFNFSOD45998', condition.operatorId);
        }

    }

    function createFormulaNodeForStringOverlapsValues(fieldId: ScanFormula.StringOverlapsFieldId, values: string[], not: boolean) {
        return createFormulaNodeForOverlapsValues(ScanFormula.StringFieldOverlapsNode, fieldId, values, not);
    }

    function createFormulaNodeForCurrencyOverlaps(fieldId: ScanFormula.FieldId.Currency, condition: CurrencyOverlapsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
                return createFormulaNodeForCurrencyOverlapsValues(fieldId, operands.values, false);
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return createFormulaNodeForCurrencyOverlapsValues(fieldId, operands.values, true);
            default:
                throw new UnreachableCaseError('SFCCFNFCOD', condition.operatorId);
        }
    }

    function createFormulaNodeForCurrencyOverlapsValues(fieldId: ScanFormula.FieldId.Currency, values: CurrencyId[], not: boolean) {
        return createFormulaNodeForOverlapsValues(ScanFormula.CurrencyFieldOverlapsNode, fieldId, values, not);
    }

    function createFormulaNodeForExchangeOverlaps(fieldId: ScanFormula.FieldId.Exchange, condition: ExchangeOverlapsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
                return createFormulaNodeForExchangeOverlapsValues(fieldId, operands.values, false);
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return createFormulaNodeForExchangeOverlapsValues(fieldId, operands.values, true);
            default:
                throw new UnreachableCaseError('SFCCFNFEOD', condition.operatorId);
        }
    }

    function createFormulaNodeForExchangeOverlapsValues(fieldId: ScanFormula.FieldId.Exchange, values: ExchangeId[], not: boolean) {
        return createFormulaNodeForOverlapsValues(ScanFormula.ExchangeFieldOverlapsNode, fieldId, values, not);
    }

    function createFormulaNodeForMarketOverlaps(fieldId: ScanFormula.MarketOverlapsFieldId, condition: MarketOverlapsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
                return createFormulaNodeForMarketOverlapsValues(fieldId, operands.values, false);
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return createFormulaNodeForMarketOverlapsValues(fieldId, operands.values, true);
            default:
                throw new UnreachableCaseError('SFCCFNFMOD', condition.operatorId);
        }
    }

    function createFormulaNodeForMarketOverlapsValues(fieldId: ScanFormula.MarketOverlapsFieldId, values: MarketId[], not: boolean) {
        return createFormulaNodeForOverlapsValues(ScanFormula.MarketFieldOverlapsNode, fieldId, values, not);
    }

    function createFormulaNodeForMarketBoardOverlaps(fieldId: ScanFormula.FieldId.MarketBoard, condition: MarketBoardOverlapsScanFieldCondition) {
        const operands = condition.operands;
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Overlaps:
                return createFormulaNodeForMarketBoardOverlapsValues(fieldId, operands.values, false);
            case ScanFieldCondition.OperatorId.NotOverlaps:
                return createFormulaNodeForMarketBoardOverlapsValues(fieldId, operands.values, true);
            default:
                throw new UnreachableCaseError('SFCCFNFMBOD', condition.operatorId);
        }
    }

    function createFormulaNodeForMarketBoardOverlapsValues(fieldId: ScanFormula.FieldId.MarketBoard, values: MarketBoardId[], not: boolean) {
        return createFormulaNodeForOverlapsValues(ScanFormula.MarketBoardFieldOverlapsNode, fieldId, values, not);
    }


    function createFormulaNodeForOverlapsValues<FieldId extends ScanFormula.TextOverlapFieldId, DataType> (
        overlapsNodeConstructor: new() => ScanFormula.TypedOverlapsFieldNode<DataType>,
        fieldId: FieldId,
        values: DataType[],
        not: boolean
    ) {
        const overlapsNode = new overlapsNodeConstructor();
        overlapsNode.fieldId = fieldId;
        overlapsNode.values = values;
        if (not) {
            const notNode = new ScanFormula.NotNode();
            notNode.operand = overlapsNode;
            return notNode;
        } else {
            return overlapsNode;
        }
    }

    function createFormulaNodeForIs(condition: IsScanFieldCondition) {
        const isNode = new ScanFormula.IsNode(condition.operands.categoryId);
        switch (condition.operatorId) {
            case ScanFieldCondition.OperatorId.Is: return isNode;
            case ScanFieldCondition.OperatorId.NotIs: {
                const notNode = new ScanFormula.NotNode();
                notNode.operand = isNode;
                return notNode;
            }
            default:
                throw new UnreachableCaseError('SFSCCFNISC45998', condition.operatorId);
        }
    }
}

export interface BaseNumericScanFieldCondition extends ScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.Numeric | ScanFieldCondition.TypeId.NumericComparison;
    // readonly fieldId: ScanFormula.NumericRangeFieldId | ScanFormula.NumericRangeSubbedFieldId,
    operatorId: BaseNumericScanFieldCondition.OperatorId;
    operands: BaseNumericScanFieldCondition.Operands;
}

export namespace BaseNumericScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.GreaterThan |
        ScanFieldCondition.OperatorId.GreaterThanOrEqual |
        ScanFieldCondition.OperatorId.LessThan |
        ScanFieldCondition.OperatorId.LessThanOrEqual |
        ScanFieldCondition.OperatorId.InRange |
        ScanFieldCondition.OperatorId.NotInRange
    >;

    export namespace Operator {
        export type Id = OperatorId;

        interface Info {
            readonly id: ScanFieldCondition.OperatorId;
            readonly operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId | undefined;
        }

        type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
        const infosObject: InfosObject = {
            HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.HasValue },
            NotHasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.HasValue },
            Equals: { id: ScanFieldCondition.OperatorId.Equals, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
            NotEquals: { id: ScanFieldCondition.OperatorId.NotEquals, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
            GreaterThan: { id: ScanFieldCondition.OperatorId.GreaterThan, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
            GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.GreaterThanOrEqual, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
            LessThan: { id: ScanFieldCondition.OperatorId.LessThan, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
            LessThanOrEqual: { id: ScanFieldCondition.OperatorId.LessThanOrEqual, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
            InRange: { id: ScanFieldCondition.OperatorId.InRange, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Range },
            NotInRange: { id: ScanFieldCondition.OperatorId.NotInRange, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Range },
            Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: undefined },
            NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: undefined },
            Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
            NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
            Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
            NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
        } as const;

        const infos = Object.values(infosObject);

        export let allIds: readonly ScanFieldCondition.OperatorId[];
        export let idCount: Integer;

        export function initialise() {
            const infoCount = infos.length;
            const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
            idCount = 0;
            for (let i = 0; i < infoCount; i++) {
                const info = infos[i];
                const id = i as OperatorId;
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('NumericScanFieldCondition.OperatorId', i, i.toString());
                } else {
                    if (info.operandsTypeId !== undefined) {
                        tempAllIds[idCount++] = id;
                    }
                }
            }
            tempAllIds.length = idCount;
            allIds = tempAllIds;
        }

        export function idToOperandsTypeId(id: Id) {
            return infos[id].operandsTypeId;
        }
    }


    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export const enum TypeId {
            HasValue,
            Value,
            Range,
        }
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: Operands.TypeId.HasValue;
    }

    export namespace HasValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is HasValueOperands {
            return operands.typeId === Operands.TypeId.HasValue;
        }
    }

    export interface ValueOperands extends Operands {
        readonly typeId: Operands.TypeId.Value;
        value: number;
    }

    export namespace ValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ValueOperands {
            return operands.typeId === Operands.TypeId.Value;
        }
    }

    export interface RangeOperands extends Operands {
        readonly typeId: Operands.TypeId.Range;
        min: number | undefined;
        max: number | undefined;
    }

    export namespace RangeOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is RangeOperands {
            return operands.typeId === Operands.TypeId.Range;
        }
    }

    export function isEqual(left: BaseNumericScanFieldCondition, right: BaseNumericScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                const leftOperands = left.operands;
                const rightOperands = right.operands;
                if (leftOperands.typeId !== rightOperands.typeId) {
                    return false;
                } else {
                    switch (leftOperands.typeId) {
                        case Operands.TypeId.HasValue: return true;
                        case Operands.TypeId.Value: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return leftValue === rightValue;
                        }
                        case Operands.TypeId.Range: {
                            const leftInRangeOperands = leftOperands as RangeOperands;
                            const rightInRangeOperands = rightOperands as RangeOperands;
                            return leftInRangeOperands.min === rightInRangeOperands.min && leftInRangeOperands.max === rightInRangeOperands.max;
                        }
                        default:
                            throw new UnreachableCaseError('SFCBNSFCIQ23987', leftOperands.typeId);
                    }
                }
            }
        }
    }
}

export interface NumericScanFieldCondition extends BaseNumericScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.Numeric;
    operatorId: NumericScanFieldCondition.OperatorId;
    // readonly fieldId: ScanFormula.NumericRangeFieldId,
}

export namespace NumericScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.InRange |
        ScanFieldCondition.OperatorId.NotInRange
    >;

    export const supportedOperatorIds: readonly OperatorId[] = [
        ScanFieldCondition.OperatorId.HasValue,
        ScanFieldCondition.OperatorId.NotHasValue,
        ScanFieldCondition.OperatorId.Equals,
        ScanFieldCondition.OperatorId.NotEquals,
        ScanFieldCondition.OperatorId.InRange,
        ScanFieldCondition.OperatorId.NotInRange
    ];

    export function is(condition: ScanFieldCondition): condition is NumericScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.Numeric;
    }

    export function isEqual(left: NumericScanFieldCondition, right: NumericScanFieldCondition): boolean {
        return BaseNumericScanFieldCondition.isEqual(left, right);
    }
}

export interface NumericComparisonScanFieldCondition extends BaseNumericScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.NumericComparison;
    operatorId: NumericComparisonScanFieldCondition.OperatorId;
    // readonly fieldId: ScanFormula.NumericRangeFieldId,
}

export namespace NumericComparisonScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.GreaterThan |
        ScanFieldCondition.OperatorId.GreaterThanOrEqual |
        ScanFieldCondition.OperatorId.LessThan |
        ScanFieldCondition.OperatorId.LessThanOrEqual |
        ScanFieldCondition.OperatorId.InRange |
        ScanFieldCondition.OperatorId.NotInRange
    >;

    export const supportedOperatorIds: readonly OperatorId[] = [
        ScanFieldCondition.OperatorId.HasValue,
        ScanFieldCondition.OperatorId.NotHasValue,
        ScanFieldCondition.OperatorId.Equals,
        ScanFieldCondition.OperatorId.NotEquals,
        ScanFieldCondition.OperatorId.GreaterThan,
        ScanFieldCondition.OperatorId.GreaterThanOrEqual,
        ScanFieldCondition.OperatorId.LessThan,
        ScanFieldCondition.OperatorId.LessThanOrEqual,
        ScanFieldCondition.OperatorId.InRange,
        ScanFieldCondition.OperatorId.NotInRange
    ];

    export function is(condition: ScanFieldCondition): condition is NumericComparisonScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.NumericComparison;
    }

    export function isEqual(left: NumericComparisonScanFieldCondition, right: NumericComparisonScanFieldCondition): boolean {
        return BaseNumericScanFieldCondition.isEqual(left, right);
    }
}

export interface DateScanFieldCondition extends ScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.Date;
    // readonly fieldId: ScanFormula.DateRangeFieldId | ScanFormula.DateRangeSubbedFieldId,
    operatorId: DateScanFieldCondition.OperatorId;
    operands: DateScanFieldCondition.Operands;
}

export namespace DateScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.InRange |
        ScanFieldCondition.OperatorId.NotInRange
    >;

    export const supportedOperatorIds: readonly OperatorId[] = [
        ScanFieldCondition.OperatorId.HasValue,
        ScanFieldCondition.OperatorId.NotHasValue,
        ScanFieldCondition.OperatorId.Equals,
        ScanFieldCondition.OperatorId.NotEquals,
        ScanFieldCondition.OperatorId.InRange,
        ScanFieldCondition.OperatorId.NotInRange
    ];

    export namespace Operator {
        export type Id = OperatorId;

        interface Info {
            readonly id: ScanFieldCondition.OperatorId;
            readonly operandsTypeId: Operands.TypeId | undefined;
        }

        type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
        const infosObject: InfosObject = {
            HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            NotHasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            Equals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            NotEquals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            GreaterThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            LessThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            LessThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            InRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Range },
            NotInRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Range },
            Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: undefined },
            NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: undefined },
            Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
            NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
            Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
            NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
        } as const;

        const infos = Object.values(infosObject);

        export let allIds: readonly ScanFieldCondition.OperatorId[];
        export let idCount: Integer;

        export function initialise() {
            const infoCount = infos.length;
            const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
            idCount = 0;
            for (let i = 0; i < infoCount; i++) {
                const info = infos[i];
                const id = i as OperatorId;
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('BaseDateScanFieldCondition.OperatorId', i, i.toString());
                } else {
                    if (info.operandsTypeId !== undefined) {
                        tempAllIds[idCount++] = id;
                    }
                }
            }
            tempAllIds.length = idCount;
            allIds = tempAllIds;
        }

        export function idToOperandsTypeId(id: Id) {
            return infos[id].operandsTypeId;
        }
    }

    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export const enum TypeId {
            HasValue,
            Value,
            Range,
        }
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: Operands.TypeId.HasValue;
    }

    export namespace HasValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is HasValueOperands {
            return operands.typeId === Operands.TypeId.HasValue;
        }
    }

    export interface ValueOperands extends Operands {
        readonly typeId: Operands.TypeId.Value;
        value: SourceTzOffsetDateTime;
    }

    export namespace ValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ValueOperands {
            return operands.typeId === Operands.TypeId.Value;
        }
    }

    export interface RangeOperands extends Operands {
        readonly typeId: Operands.TypeId.Range;
        min: SourceTzOffsetDateTime | undefined;
        max: SourceTzOffsetDateTime | undefined;
    }

    export namespace RangeOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is RangeOperands {
            return operands.typeId === Operands.TypeId.Range;
        }
    }

    export function is(condition: ScanFieldCondition): condition is DateScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.Date;
    }

    export function isEqual(left: DateScanFieldCondition, right: DateScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                const leftOperands = left.operands;
                const rightOperands = right.operands;
                if (leftOperands.typeId !== rightOperands.typeId) {
                    return false;
                } else {
                    switch (leftOperands.typeId) {
                        case Operands.TypeId.HasValue: return true;
                        case Operands.TypeId.Value: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return SourceTzOffsetDateTime.isEqual(leftValue, rightValue);
                        }
                        case Operands.TypeId.Range: {
                            const leftInRangeOperands = leftOperands as RangeOperands;
                            const rightInRangeOperands = rightOperands as RangeOperands;
                            return (
                                SourceTzOffsetDateTime.isUndefinableEqual(leftInRangeOperands.min, rightInRangeOperands.min)
                                &&
                                SourceTzOffsetDateTime.isUndefinableEqual(leftInRangeOperands.max, rightInRangeOperands.max)
                            );
                        }
                        default:
                            throw new UnreachableCaseError('SFCBDSFCIQ23987', leftOperands.typeId);
                    }
                }
            }
        }
    }
}

export interface BaseTextScanFieldCondition extends ScanFieldCondition {
    // readonly fieldId: ScanFormula.TextTextFieldId | ScanFormula.TextTextSubbedFieldId
    operatorId: BaseTextScanFieldCondition.OperatorId;
    operands: BaseTextScanFieldCondition.Operands;
}

export namespace BaseTextScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.Contains |
        ScanFieldCondition.OperatorId.NotContains
    >;

    export namespace Operator {
        export type Id = OperatorId;

        interface Info {
            readonly id: ScanFieldCondition.OperatorId;
            readonly operandsTypeId: Operands.TypeId | undefined;
        }

        type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
        const infosObject: InfosObject = {
            HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            NotHasValue: { id: ScanFieldCondition.OperatorId.NotHasValue, operandsTypeId: Operands.TypeId.HasValue },
            Equals: { id: ScanFieldCondition.OperatorId.Equals, operandsTypeId: Operands.TypeId.Value },
            NotEquals: { id: ScanFieldCondition.OperatorId.NotEquals, operandsTypeId: Operands.TypeId.Value },
            GreaterThan: { id: ScanFieldCondition.OperatorId.GreaterThan, operandsTypeId: undefined },
            GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.GreaterThanOrEqual, operandsTypeId: undefined },
            LessThan: { id: ScanFieldCondition.OperatorId.LessThan, operandsTypeId: undefined },
            LessThanOrEqual: { id: ScanFieldCondition.OperatorId.LessThanOrEqual, operandsTypeId: undefined },
            InRange: { id: ScanFieldCondition.OperatorId.InRange, operandsTypeId: undefined },
            NotInRange: { id: ScanFieldCondition.OperatorId.NotInRange, operandsTypeId: undefined },
            Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: Operands.TypeId.Contains },
            NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: Operands.TypeId.Contains },
            Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
            NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
            Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
            NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
        } as const;

        const infos = Object.values(infosObject);

        export let allIds: readonly ScanFieldCondition.OperatorId[];
        export let idCount: Integer;

        export function initialise() {
            const infoCount = infos.length;
            const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
            idCount = 0;
            for (let i = 0; i < infoCount; i++) {
                const info = infos[i];
                const id = i as OperatorId;
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('BaseDateScanFieldCondition.OperatorId', i, i.toString());
                } else {
                    if (info.operandsTypeId !== undefined) {
                        tempAllIds[idCount++] = id;
                    }
                }
            }
            tempAllIds.length = idCount;
            allIds = tempAllIds;
        }

        export function idToOperandsTypeId(id: Id) {
            return infos[id].operandsTypeId;
        }
    }

    export interface ContainsOperand {
        value: string;
        asId: ScanFormula.TextContainsAsId;
        ignoreCase: boolean;
    }

    export namespace ContainsOperand {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: ContainsOperand, right: ContainsOperand) {
            return left.value === right.value && left.asId === right.asId && left.ignoreCase === right.ignoreCase;
        }
    }

    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export const enum TypeId {
            HasValue,
            Value,
            Contains,
        }
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: Operands.TypeId.HasValue;
    }

    export namespace HasValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is HasValueOperands {
            return operands.typeId === Operands.TypeId.HasValue;
        }
    }

    export interface ValueOperands extends Operands {
        readonly typeId: Operands.TypeId.Value;
        value: string;
    }

    export namespace ValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ValueOperands {
            return operands.typeId === Operands.TypeId.Value;
        }
    }

    export interface ContainsOperands extends Operands {
        readonly typeId: Operands.TypeId.Contains;
        contains: ContainsOperand;
    }

    export namespace ContainsOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ContainsOperands {
            return operands.typeId === Operands.TypeId.Contains;
        }
    }

    export function isEqual(left: BaseTextScanFieldCondition, right: BaseTextScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                const leftOperands = left.operands;
                const rightOperands = right.operands;
                if (leftOperands.typeId !== rightOperands.typeId) {
                    return false;
                } else {
                    switch (leftOperands.typeId) {
                        case Operands.TypeId.HasValue: return true;
                        case Operands.TypeId.Value: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return leftValue === rightValue;
                        }
                        case Operands.TypeId.Contains: {
                            const leftContainsOperands = leftOperands as ContainsOperands;
                            const rightContainsOperands = rightOperands as ContainsOperands;
                            return ContainsOperand.isEqual(leftContainsOperands.contains, rightContainsOperands.contains);
                        }
                        default:
                            throw new UnreachableCaseError('SFCBTSFCIQ23987', leftOperands.typeId);
                    }
                }
            }
        }
    }
}

export interface TextEqualsScanFieldCondition extends BaseTextScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.TextEquals;
    operatorId: TextEqualsScanFieldCondition.OperatorId;
}

export namespace TextEqualsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals
    >;

    export const supportedOperatorIds: readonly OperatorId[] = [
        ScanFieldCondition.OperatorId.Equals,
        ScanFieldCondition.OperatorId.NotEquals,
    ];

    export function is(condition: ScanFieldCondition): condition is TextEqualsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.TextEquals;
    }

    export function isEqual(left: TextEqualsScanFieldCondition, right: TextEqualsScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                return BaseTextScanFieldCondition.isEqual(left, right);
            }
        }
    }
}

export interface TextContainsScanFieldCondition extends BaseTextScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.TextContains,
    // readonly fieldId: ScanFormula.TextTextFieldId,
    operatorId: TextContainsScanFieldCondition.OperatorId;
}

export namespace TextContainsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.Contains |
        ScanFieldCondition.OperatorId.NotContains
    >;

    export const supportedOperatorIds: readonly OperatorId[] = [
        ScanFieldCondition.OperatorId.Contains,
        ScanFieldCondition.OperatorId.NotContains
    ];

    export function is(condition: ScanFieldCondition): condition is TextContainsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.TextContains;
    }

    export function isEqual(left: TextContainsScanFieldCondition, right: TextContainsScanFieldCondition): boolean {
        return BaseTextScanFieldCondition.isEqual(left, right);
    }
}

export interface TextHasValueEqualsScanFieldCondition extends BaseTextScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.TextHasValueEquals;
    // readonly fieldId: ScanFormula.TextExistsSingleFieldId;
    operatorId: TextHasValueEqualsScanFieldCondition.OperatorId;
}

export namespace TextHasValueEqualsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals
    >;

    export const supportedOperatorIds: readonly OperatorId[] = [
        ScanFieldCondition.OperatorId.HasValue,
        ScanFieldCondition.OperatorId.NotHasValue,
        ScanFieldCondition.OperatorId.Equals,
        ScanFieldCondition.OperatorId.NotEquals,
    ];

    export function is(condition: ScanFieldCondition): condition is TextHasValueEqualsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.TextHasValueEquals;
    }

    export function isEqual(left: TextHasValueEqualsScanFieldCondition, right: TextHasValueEqualsScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                return BaseTextScanFieldCondition.isEqual(left, right);
            }
        }
    }
}

export interface TextHasValueContainsScanFieldCondition extends BaseTextScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.TextHasValueContains,
    // readonly fieldId: ScanFormula.TextTextFieldId,
    operatorId: TextHasValueContainsScanFieldCondition.OperatorId;
}

export namespace TextHasValueContainsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Contains |
        ScanFieldCondition.OperatorId.NotContains
    >;

    export const supportedOperatorIds: readonly OperatorId[] = [
        ScanFieldCondition.OperatorId.HasValue,
        ScanFieldCondition.OperatorId.NotHasValue,
        ScanFieldCondition.OperatorId.Contains,
        ScanFieldCondition.OperatorId.NotContains
    ];

    export function is(condition: ScanFieldCondition): condition is TextHasValueContainsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.TextContains;
    }

    export function isEqual(left: TextHasValueContainsScanFieldCondition, right: TextHasValueContainsScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                return BaseTextScanFieldCondition.isEqual(left, right);
            }
        }
    }
}

export interface OverlapsScanFieldCondition extends ScanFieldCondition {
    // readonly fieldId: ScanFormula.TextOverlapFieldId;
    operatorId: OverlapsScanFieldCondition.OperatorId;
}

export namespace OverlapsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.Overlaps |
        ScanFieldCondition.OperatorId.NotOverlaps
    >;

    export function isEqual(left: OverlapsScanFieldCondition, right: OverlapsScanFieldCondition): boolean {
        return (
            ScanFieldCondition.isEqual(left, right)
            &&
            left.operatorId === right.operatorId
        );
    }
}

export interface StringOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.StringOverlaps;
    // readonly fieldId: ScanFormula.StringTextOverlapFieldId;
    operands: StringOverlapsScanFieldCondition.Operands;
}

export namespace StringOverlapsScanFieldCondition {
    export interface Operands {
        values: string[];
    }

    export function is(condition: ScanFieldCondition): condition is StringOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.StringOverlaps;
    }

    export function isEqual(left: StringOverlapsScanFieldCondition, right: StringOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface MarketBoardOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.MarketBoardOverlaps;
    // readonly fieldId: ScanFormula.FieldId.MarketBoard;
    operands: MarketBoardOverlapsScanFieldCondition.Operands;
}

export namespace MarketBoardOverlapsScanFieldCondition {
    export interface Operands {
        values: MarketBoardId[];
    }

    export function is(condition: ScanFieldCondition): condition is MarketBoardOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.MarketBoardOverlaps;
    }

    export function isEqual(left: MarketBoardOverlapsScanFieldCondition, right: MarketBoardOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface CurrencyOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.CurrencyOverlaps;
    // readonly fieldId: ScanFormula.FieldId.Currency;
    operands: CurrencyOverlapsScanFieldCondition.Operands;
}

export namespace CurrencyOverlapsScanFieldCondition {
    export interface Operands {
        values: CurrencyId[];
    }

    export function is(condition: ScanFieldCondition): condition is CurrencyOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.CurrencyOverlaps;
    }

    export function isEqual(left: CurrencyOverlapsScanFieldCondition, right: CurrencyOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface ExchangeOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.ExchangeOverlaps;
    // readonly fieldId: ScanFormula.FieldId.Exchange;
    operands: ExchangeOverlapsScanFieldCondition.Operands;
}

export namespace ExchangeOverlapsScanFieldCondition {
    export interface Operands {
        values: ExchangeId[];
    }

    export function is(condition: ScanFieldCondition): condition is ExchangeOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.ExchangeOverlaps;
    }

    export function isEqual(left: ExchangeOverlapsScanFieldCondition, right: ExchangeOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface MarketOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.MarketOverlaps;
    // readonly fieldId: ScanFormula.MarketOverlapFieldId;
    operands: MarketOverlapsScanFieldCondition.Operands;
}

export namespace MarketOverlapsScanFieldCondition {
    export interface Operands {
        values: MarketId[];
    }

    export function is(condition: ScanFieldCondition): condition is MarketOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.MarketOverlaps;
    }

    export function isEqual(left: MarketOverlapsScanFieldCondition, right: MarketOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface IsScanFieldCondition extends ScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.Is;
    // readonly fieldId: ScanFormula.FieldId.Is;
    operatorId: IsScanFieldCondition.OperatorId;
    operands: IsScanFieldCondition.Operands;
}

export namespace IsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.Is |
        ScanFieldCondition.OperatorId.NotIs
    >;

    export interface Operands {
        categoryId: ScanFormula.IsNode.CategoryId;
    }

    export function is(condition: ScanFieldCondition): condition is IsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.Is;
    }

    export function isEqual(left: IsScanFieldCondition, right: IsScanFieldCondition): boolean {
        return (
            ScanFieldCondition.isEqual(left, right)
            &&
            left.operatorId === right.operatorId
            &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            left.operands.categoryId === right.operands.categoryId
        );
    }
}

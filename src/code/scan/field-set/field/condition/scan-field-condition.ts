/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../../../adi/adi-internal-api';
import { StringId, Strings } from '../../../../res/res-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, Integer, PickEnum, SourceTzOffsetDateTime, UnreachableCaseError, isArrayEqualUniquely } from '../../../../sys/sys-internal-api';
import { ScanFormula } from '../../../formula/internal-api';

export interface ScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId;
    readonly operatorId: ScanFieldCondition.OperatorId;
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

    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export const enum TypeId {
            HasValue,
            NumericComparisonValue,
            NumericValue,
            DateValue,
            NumericRange,
            DateRange,
            TextValue,
            TextContains,
            TextEnum,
            CurrencyEnum,
            ExchangeEnum,
            MarketEnum,
            MarketBoardEnum,
            CategoryValue,
        }
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

    export namespace Operator {
        export type Id = OperatorId;

        interface Info {
            readonly id: Id;
            readonly affirmativeId: Id;
            readonly code: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
            readonly multiLineDisplayId: readonly StringId[] | undefined;
        }

        type InfosObject = { [id in keyof typeof OperatorId]: Info };
        const infosObject: InfosObject = {
            HasValue: { id: OperatorId.HasValue,
                affirmativeId: OperatorId.HasValue,
                code: 'has',
                displayId: StringId.ScanFieldConditionOperatorDisplay_HasValue,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_HasValue,
                multiLineDisplayId: undefined,
            },
            NotHasValue: { id: OperatorId.NotHasValue,
                affirmativeId: OperatorId.HasValue,
                code: '!has',
                displayId: StringId.ScanFieldConditionOperatorDisplay_NotHasValue,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_NotHasValue,
                multiLineDisplayId: undefined,
            },
            Equals: { id: OperatorId.Equals,
                affirmativeId: OperatorId.Equals,
                code: '=',
                displayId: StringId.ScanFieldConditionOperatorDisplay_Equals,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_Equals,
                multiLineDisplayId: undefined,
            },
            NotEquals: { id: OperatorId.NotEquals,
                affirmativeId: OperatorId.Equals,
                code: '!=',
                displayId: StringId.ScanFieldConditionOperatorDisplay_NotEquals,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_NotEquals,
                multiLineDisplayId: undefined,
            },
            GreaterThan: { id: OperatorId.GreaterThan,
                affirmativeId: OperatorId.GreaterThan,
                code: '>',
                displayId: StringId.ScanFieldConditionOperatorDisplay_GreaterThan,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_GreaterThan,
                multiLineDisplayId: undefined,
            },
            GreaterThanOrEqual: { id: OperatorId.GreaterThanOrEqual,
                affirmativeId: OperatorId.GreaterThanOrEqual,
                code: '>=',
                displayId: StringId.ScanFieldConditionOperatorDisplay_GreaterThanOrEqual,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_GreaterThanOrEqual,
                multiLineDisplayId: [StringId.ScanFieldConditionOperatorDisplay_GreaterThan, StringId.ScanFieldConditionOperatorDisplay_OrEqual],
            },
            LessThan: { id: OperatorId.LessThan,
                affirmativeId: OperatorId.LessThan,
                code: '<',
                displayId: StringId.ScanFieldConditionOperatorDisplay_LessThan,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_LessThan,
                multiLineDisplayId: undefined,
            },
            LessThanOrEqual: { id: OperatorId.LessThanOrEqual,
                affirmativeId: OperatorId.LessThanOrEqual,
                code: '<=',
                displayId: StringId.ScanFieldConditionOperatorDisplay_LessThanOrEqual,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_LessThanOrEqual,
                multiLineDisplayId: [StringId.ScanFieldConditionOperatorDisplay_LessThanOrEqual, StringId.ScanFieldConditionOperatorDisplay_OrEqual],
            },
            InRange: { id: OperatorId.InRange,
                affirmativeId: OperatorId.InRange,
                code: 'ir',
                displayId: StringId.ScanFieldConditionOperatorDisplay_InRange,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_InRange,
                multiLineDisplayId: undefined,
            },
            NotInRange: { id: OperatorId.NotInRange,
                affirmativeId: OperatorId.InRange,
                code: '!ir',
                displayId: StringId.ScanFieldConditionOperatorDisplay_NotInRange,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_NotInRange,
                multiLineDisplayId: undefined,
            },
            Contains: { id: OperatorId.Contains,
                affirmativeId: OperatorId.Contains,
                code: 'ctn',
                displayId: StringId.ScanFieldConditionOperatorDisplay_Contains,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_Contains,
                multiLineDisplayId: undefined,
            },
            NotContains: { id: OperatorId.NotContains,
                affirmativeId: OperatorId.Contains,
                code: '!ctn',
                displayId: StringId.ScanFieldConditionOperatorDisplay_NotContains,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_NotContains,
                multiLineDisplayId: undefined,
            },
            Overlaps: { id: OperatorId.Overlaps,
                affirmativeId: OperatorId.Overlaps,
                code: 'ovl',
                displayId: StringId.ScanFieldConditionOperatorDisplay_Overlaps,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_Overlaps,
                multiLineDisplayId: undefined,
            },
            NotOverlaps: { id: OperatorId.NotOverlaps,
                affirmativeId: OperatorId.Overlaps,
                code: '!ovl',
                displayId: StringId.ScanFieldConditionOperatorDisplay_NotOverlaps,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_NotOverlaps,
                multiLineDisplayId: undefined,
            },
            Is: { id: OperatorId.Is,
                affirmativeId: OperatorId.Is,
                code: 'is',
                displayId: StringId.ScanFieldConditionOperatorDisplay_Is,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_Is,
                multiLineDisplayId: undefined,
            },
            NotIs: { id: OperatorId.NotIs,
                affirmativeId: OperatorId.Is,
                code: '!is',
                displayId: StringId.ScanFieldConditionOperatorDisplay_NotIs,
                descriptionId: StringId.ScanFieldConditionOperatorDescription_NotIs,
                multiLineDisplayId: undefined,
            },
        };

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i as Id) {
                    throw new EnumInfoOutOfOrderError('ScanFieldCondition.OperatorId', i, info.code);
                }
            }
        }

        export function idToAffirmativeId(id: Id) {
            return infos[id].affirmativeId;
        }

        export function idToCode(id: Id) {
            return infos[id].code;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id) {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id) {
            return Strings[idToDescriptionId(id)];
        }

        export function idToMultiLineDisplayId(id: Id) {
            return infos[id].multiLineDisplayId;
        }

        export function idToMultiLineDisplay(id: Id): readonly string[] {
            const displayIdArray = idToMultiLineDisplayId(id);
            if (displayIdArray === undefined) {
                return [idToDisplay(id)];
            } else {
                return displayIdArray.map((displayId) => Strings[displayId]);
            }
        }

        export function idToAffirmativeDisplay(id: Id) {
            const affirmativeId = idToAffirmativeId(id);
            return idToDisplay(affirmativeId);
        }

        export function idToAffirmativeMultiLineDisplay(id: Id) {
            const affirmativeId = idToAffirmativeId(id);
            return idToMultiLineDisplay(affirmativeId);
        }

        export function hasValueIsNot(value: OperatorId.HasValue | OperatorId.NotHasValue): value is OperatorId.NotHasValue {
            return value === OperatorId.NotHasValue;
        }
        export function equalsIsNot(value: OperatorId.Equals | OperatorId.NotEquals): value is OperatorId.NotEquals {
            return value === OperatorId.NotEquals;
        }
        export function inRangeIsNot(value: OperatorId.InRange | OperatorId.NotInRange): value is OperatorId.NotInRange {
            return value === OperatorId.NotInRange;
        }
        export function containsIsNot(value: OperatorId.Contains | OperatorId.NotContains): value is OperatorId.NotContains {
            return value === OperatorId.NotContains;
        }
        export function overlapsIsNot(value: OperatorId.Overlaps | OperatorId.NotOverlaps): value is OperatorId.NotOverlaps {
            return value === OperatorId.NotOverlaps;
        }
        export function isIsNot(value: OperatorId.Is | OperatorId.NotIs): value is OperatorId.NotIs {
            return value === OperatorId.NotIs;
        }

        export function negateHasValue(value: OperatorId.HasValue | OperatorId.NotHasValue) {
            return (value ===  OperatorId.HasValue) ? OperatorId.NotHasValue : OperatorId.HasValue;
        }
        export function negateEquals(value: OperatorId.Equals | OperatorId.NotEquals) {
            return (value ===  OperatorId.Equals) ? OperatorId.NotEquals : OperatorId.Equals;
        }
        export function negateInRange(value: OperatorId.InRange | OperatorId.NotInRange) {
            return (value ===  OperatorId.InRange) ? OperatorId.NotInRange : OperatorId.InRange;
        }
        export function negateContains(value: OperatorId.Contains | OperatorId.NotContains) {
            return (value ===  OperatorId.Contains) ? OperatorId.NotContains : OperatorId.Contains;
        }
        export function negateOverlaps(value: OperatorId.Overlaps | OperatorId.NotOverlaps) {
            return (value ===  OperatorId.Overlaps) ? OperatorId.NotOverlaps : OperatorId.Overlaps;
        }
        export function negateIs(value: OperatorId.Is | OperatorId.NotIs) {
            return (value ===  OperatorId.Is) ? OperatorId.NotIs : OperatorId.Is;
        }
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
        const subbed = ScanFormula.Field.idIsSubbed(fieldId);
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
    readonly operands: BaseNumericScanFieldCondition.Operands;
}

export namespace BaseNumericScanFieldCondition {
    // export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
    //     ScanFieldCondition.OperatorId.HasValue |
    //     ScanFieldCondition.OperatorId.NotHasValue |
    //     ScanFieldCondition.OperatorId.Equals |
    //     ScanFieldCondition.OperatorId.NotEquals |
    //     ScanFieldCondition.OperatorId.GreaterThan |
    //     ScanFieldCondition.OperatorId.GreaterThanOrEqual |
    //     ScanFieldCondition.OperatorId.LessThan |
    //     ScanFieldCondition.OperatorId.LessThanOrEqual |
    //     ScanFieldCondition.OperatorId.InRange |
    //     ScanFieldCondition.OperatorId.NotInRange
    // >;

    // export namespace Operator {
    //     export type Id = OperatorId;

    //     interface Info {
    //         readonly id: ScanFieldCondition.OperatorId;
    //         readonly operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId | undefined;
    //     }

    //     type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
    //     const infosObject: InfosObject = {
    //         HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.HasValue },
    //         NotHasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.HasValue },
    //         Equals: { id: ScanFieldCondition.OperatorId.Equals, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
    //         NotEquals: { id: ScanFieldCondition.OperatorId.NotEquals, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
    //         GreaterThan: { id: ScanFieldCondition.OperatorId.GreaterThan, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
    //         GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.GreaterThanOrEqual, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
    //         LessThan: { id: ScanFieldCondition.OperatorId.LessThan, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
    //         LessThanOrEqual: { id: ScanFieldCondition.OperatorId.LessThanOrEqual, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Value },
    //         InRange: { id: ScanFieldCondition.OperatorId.InRange, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Range },
    //         NotInRange: { id: ScanFieldCondition.OperatorId.NotInRange, operandsTypeId: BaseNumericScanFieldCondition.Operands.TypeId.Range },
    //         Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: undefined },
    //         NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: undefined },
    //         Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
    //         NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
    //         Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
    //         NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
    //     } as const;

    //     const infos = Object.values(infosObject);

    //     export let allIds: readonly ScanFieldCondition.OperatorId[];
    //     export let idCount: Integer;

    //     export function initialise() {
    //         const infoCount = infos.length;
    //         const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
    //         idCount = 0;
    //         for (let i = 0; i < infoCount; i++) {
    //             const info = infos[i];
    //             const id = i as OperatorId;
    //             if (info.id !== id) {
    //                 throw new EnumInfoOutOfOrderError('NumericScanFieldCondition.OperatorId', i, i.toString());
    //             } else {
    //                 if (info.operandsTypeId !== undefined) {
    //                     tempAllIds[idCount++] = id;
    //                 }
    //             }
    //         }
    //         tempAllIds.length = idCount;
    //         allIds = tempAllIds;
    //     }

    //     export function idToOperandsTypeId(id: Id) {
    //         return infos[id].operandsTypeId;
    //     }
    // }


    export interface Operands extends ScanFieldCondition.Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export type TypeId = PickEnum<ScanFieldCondition.Operands.TypeId,
            ScanFieldCondition.Operands.TypeId.HasValue |
            ScanFieldCondition.Operands.TypeId.NumericValue |
            ScanFieldCondition.Operands.TypeId.NumericComparisonValue |
            ScanFieldCondition.Operands.TypeId.NumericRange
        >;
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.HasValue;
    }

    export namespace HasValueOperands {
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.HasValue |
            ScanFieldCondition.OperatorId.NotHasValue
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.HasValue,
            ScanFieldCondition.OperatorId.NotHasValue,
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is HasValueOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.HasValue;
        }
    }

    export interface ValueOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.NumericValue | ScanFieldCondition.Operands.TypeId.NumericComparisonValue;
        value: number;
    }

    export namespace ValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ValueOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.NumericValue || operands.typeId === ScanFieldCondition.Operands.TypeId.NumericComparisonValue;
        }
    }

    export interface RangeOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.NumericRange;
        min: number | undefined;
        max: number | undefined;
    }

    export namespace RangeOperands {
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.InRange |
            ScanFieldCondition.OperatorId.NotInRange
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.InRange,
            ScanFieldCondition.OperatorId.NotInRange
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is RangeOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.NumericRange;
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
                        case ScanFieldCondition.Operands.TypeId.HasValue:
                            return true;
                        case ScanFieldCondition.Operands.TypeId.NumericValue:
                        case ScanFieldCondition.Operands.TypeId.NumericComparisonValue: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return leftValue === rightValue;
                        }
                        case ScanFieldCondition.Operands.TypeId.NumericRange: {
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
    readonly operatorId: NumericScanFieldCondition.OperatorId;
}

export namespace NumericScanFieldCondition {
    export type OperatorId = Operands.OperatorId;

    export interface ValueOperands extends BaseNumericScanFieldCondition.ValueOperands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.NumericValue;
    }

    export namespace ValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.Equals |
            ScanFieldCondition.OperatorId.NotEquals
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.Equals,
            ScanFieldCondition.OperatorId.NotEquals,
        ];
    }

    export namespace Operands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = BaseNumericScanFieldCondition.HasValueOperands.OperatorId | ValueOperands.OperatorId | BaseNumericScanFieldCondition.RangeOperands.OperatorId;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ...BaseNumericScanFieldCondition.HasValueOperands.supportedOperatorIds,
            ...ValueOperands.supportedOperatorIds,
            ...BaseNumericScanFieldCondition.RangeOperands.supportedOperatorIds,
        ];
    }

    export function is(condition: ScanFieldCondition): condition is NumericScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.Numeric;
    }

    export function isEqual(left: NumericScanFieldCondition, right: NumericScanFieldCondition): boolean {
        return BaseNumericScanFieldCondition.isEqual(left, right);
    }
}

export interface NumericComparisonScanFieldCondition extends BaseNumericScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.NumericComparison;
    readonly operatorId: NumericComparisonScanFieldCondition.OperatorId;
}

export namespace NumericComparisonScanFieldCondition {
    export type OperatorId = Operands.OperatorId;

    export interface ValueOperands extends BaseNumericScanFieldCondition.ValueOperands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.NumericComparisonValue;
    }

    export namespace ValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.Equals |
            ScanFieldCondition.OperatorId.NotEquals |
            ScanFieldCondition.OperatorId.GreaterThan |
            ScanFieldCondition.OperatorId.GreaterThanOrEqual |
            ScanFieldCondition.OperatorId.LessThan |
            ScanFieldCondition.OperatorId.LessThanOrEqual
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.Equals,
            ScanFieldCondition.OperatorId.NotEquals,
            ScanFieldCondition.OperatorId.GreaterThan,
            ScanFieldCondition.OperatorId.GreaterThanOrEqual,
            ScanFieldCondition.OperatorId.LessThan,
            ScanFieldCondition.OperatorId.LessThanOrEqual,
        ];
    }

    export namespace Operands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId =
            BaseNumericScanFieldCondition.HasValueOperands.OperatorId |
            ValueOperands.OperatorId |
            BaseNumericScanFieldCondition.RangeOperands.OperatorId;

        export const supportedOperatorIds: readonly OperatorId[] = [
            ...BaseNumericScanFieldCondition.HasValueOperands.supportedOperatorIds,
            ...ValueOperands.supportedOperatorIds,
            ...BaseNumericScanFieldCondition.RangeOperands.supportedOperatorIds,
        ];
    }

    export function is(condition: ScanFieldCondition): condition is NumericComparisonScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.NumericComparison;
    }

    export function isEqual(left: NumericComparisonScanFieldCondition, right: NumericComparisonScanFieldCondition): boolean {
        return BaseNumericScanFieldCondition.isEqual(left, right);
    }
}

export interface DateScanFieldCondition extends ScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.Date;
    readonly operatorId: DateScanFieldCondition.OperatorId;
    readonly operands: DateScanFieldCondition.Operands;
}

export namespace DateScanFieldCondition {
    export type OperatorId = Operands.OperatorId;
    // export namespace Operator {
    //     export type Id = OperatorId;

    //     interface Info {
    //         readonly id: ScanFieldCondition.OperatorId;
    //         readonly operandsTypeId: Operands.TypeId | undefined;
    //     }

    //     type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
    //     const infosObject: InfosObject = {
    //         HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
    //         NotHasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
    //         Equals: { id: ScanFieldCondition.OperatorId.Equals, operandsTypeId: Operands.TypeId.Value },
    //         NotEquals: { id: ScanFieldCondition.OperatorId.NotEquals, operandsTypeId: Operands.TypeId.Value },
    //         GreaterThan: { id: ScanFieldCondition.OperatorId.GreaterThan, operandsTypeId: undefined },
    //         GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.GreaterThanOrEqual, operandsTypeId: undefined },
    //         LessThan: { id: ScanFieldCondition.OperatorId.LessThan, operandsTypeId: undefined },
    //         LessThanOrEqual: { id: ScanFieldCondition.OperatorId.LessThanOrEqual, operandsTypeId: undefined },
    //         InRange: { id: ScanFieldCondition.OperatorId.InRange, operandsTypeId: Operands.TypeId.Range },
    //         NotInRange: { id: ScanFieldCondition.OperatorId.NotInRange, operandsTypeId: Operands.TypeId.Range },
    //         Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: undefined },
    //         NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: undefined },
    //         Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
    //         NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
    //         Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
    //         NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
    //     } as const;

    //     const infos = Object.values(infosObject);

    //     export let allIds: readonly ScanFieldCondition.OperatorId[];
    //     export let idCount: Integer;

    //     export function initialise() {
    //         const infoCount = infos.length;
    //         const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
    //         idCount = 0;
    //         for (let i = 0; i < infoCount; i++) {
    //             const info = infos[i];
    //             const id = i as OperatorId;
    //             if (info.id !== id) {
    //                 throw new EnumInfoOutOfOrderError('BaseDateScanFieldCondition.OperatorId', i, i.toString());
    //             } else {
    //                 if (info.operandsTypeId !== undefined) {
    //                     tempAllIds[idCount++] = id;
    //                 }
    //             }
    //         }
    //         tempAllIds.length = idCount;
    //         allIds = tempAllIds;
    //     }

    //     export function idToOperandsTypeId(id: Id) {
    //         return infos[id].operandsTypeId;
    //     }
    // }

    export interface Operands extends ScanFieldCondition.Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export type TypeId = PickEnum<ScanFieldCondition.Operands.TypeId,
            ScanFieldCondition.Operands.TypeId.HasValue |
            ScanFieldCondition.Operands.TypeId.DateValue |
            ScanFieldCondition.Operands.TypeId.DateRange
        >;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = HasValueOperands.OperatorId | ValueOperands.OperatorId | RangeOperands.OperatorId;
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.HasValue;
    }

    export namespace HasValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.HasValue |
            ScanFieldCondition.OperatorId.NotHasValue
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.HasValue,
            ScanFieldCondition.OperatorId.NotHasValue,
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is HasValueOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.HasValue;
        }
    }

    export interface ValueOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.DateValue;
        value: SourceTzOffsetDateTime;
    }

    export namespace ValueOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.Equals |
            ScanFieldCondition.OperatorId.NotEquals
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.Equals,
            ScanFieldCondition.OperatorId.NotEquals,
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ValueOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.DateValue;
        }
    }

    export interface RangeOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.DateRange;
        min: SourceTzOffsetDateTime | undefined;
        max: SourceTzOffsetDateTime | undefined;
    }

    export namespace RangeOperands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.InRange |
            ScanFieldCondition.OperatorId.NotInRange
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.InRange,
            ScanFieldCondition.OperatorId.NotInRange
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is RangeOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.DateRange;
        }
    }

    export namespace Operands {
        export const supportedOperatorIds: readonly OperatorId[] = [
            ...HasValueOperands.supportedOperatorIds,
            ...ValueOperands.supportedOperatorIds,
            ...RangeOperands.supportedOperatorIds,
        ];
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
                        case ScanFieldCondition.Operands.TypeId.HasValue: return true;
                        case ScanFieldCondition.Operands.TypeId.DateValue: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return SourceTzOffsetDateTime.isEqual(leftValue, rightValue);
                        }
                        case ScanFieldCondition.Operands.TypeId.DateRange: {
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
    readonly operands: BaseTextScanFieldCondition.Operands;
}

export namespace BaseTextScanFieldCondition {
    // export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
    //     ScanFieldCondition.OperatorId.HasValue |
    //     ScanFieldCondition.OperatorId.NotHasValue |
    //     ScanFieldCondition.OperatorId.Equals |
    //     ScanFieldCondition.OperatorId.NotEquals |
    //     ScanFieldCondition.OperatorId.Contains |
    //     ScanFieldCondition.OperatorId.NotContains
    // >;

    // export namespace Operator {
    //     export type Id = OperatorId;

    //     interface Info {
    //         readonly id: ScanFieldCondition.OperatorId;
    //         readonly operandsTypeId: Operands.TypeId | undefined;
    //     }

    //     type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
    //     const infosObject: InfosObject = {
    //         HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
    //         NotHasValue: { id: ScanFieldCondition.OperatorId.NotHasValue, operandsTypeId: Operands.TypeId.HasValue },
    //         Equals: { id: ScanFieldCondition.OperatorId.Equals, operandsTypeId: Operands.TypeId.Value },
    //         NotEquals: { id: ScanFieldCondition.OperatorId.NotEquals, operandsTypeId: Operands.TypeId.Value },
    //         GreaterThan: { id: ScanFieldCondition.OperatorId.GreaterThan, operandsTypeId: undefined },
    //         GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.GreaterThanOrEqual, operandsTypeId: undefined },
    //         LessThan: { id: ScanFieldCondition.OperatorId.LessThan, operandsTypeId: undefined },
    //         LessThanOrEqual: { id: ScanFieldCondition.OperatorId.LessThanOrEqual, operandsTypeId: undefined },
    //         InRange: { id: ScanFieldCondition.OperatorId.InRange, operandsTypeId: undefined },
    //         NotInRange: { id: ScanFieldCondition.OperatorId.NotInRange, operandsTypeId: undefined },
    //         Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: Operands.TypeId.Contains },
    //         NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: Operands.TypeId.Contains },
    //         Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
    //         NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
    //         Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
    //         NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
    //     } as const;

    //     const infos = Object.values(infosObject);

    //     export let allIds: readonly ScanFieldCondition.OperatorId[];
    //     export let idCount: Integer;

    //     export function initialise() {
    //         const infoCount = infos.length;
    //         const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
    //         idCount = 0;
    //         for (let i = 0; i < infoCount; i++) {
    //             const info = infos[i];
    //             const id = i as OperatorId;
    //             if (info.id !== id) {
    //                 throw new EnumInfoOutOfOrderError('BaseDateScanFieldCondition.OperatorId', i, i.toString());
    //             } else {
    //                 if (info.operandsTypeId !== undefined) {
    //                     tempAllIds[idCount++] = id;
    //                 }
    //             }
    //         }
    //         tempAllIds.length = idCount;
    //         allIds = tempAllIds;
    //     }

    //     export function idToOperandsTypeId(id: Id) {
    //         return infos[id].operandsTypeId;
    //     }
    // }

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

    export interface Operands extends ScanFieldCondition.Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export type TypeId = PickEnum<ScanFieldCondition.Operands.TypeId,
            ScanFieldCondition.Operands.TypeId.HasValue |
            ScanFieldCondition.Operands.TypeId.TextValue |
            ScanFieldCondition.Operands.TypeId.TextContains
        >;
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.HasValue;
    }

    export namespace HasValueOperands {
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.HasValue |
            ScanFieldCondition.OperatorId.NotHasValue
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.HasValue,
            ScanFieldCondition.OperatorId.NotHasValue,
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is HasValueOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.HasValue;
        }
    }

    export interface ValueOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.TextValue;
        value: string;
    }

    export namespace ValueOperands {
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.Equals |
            ScanFieldCondition.OperatorId.NotEquals
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.Equals,
            ScanFieldCondition.OperatorId.NotEquals,
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ValueOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.TextValue;
        }
    }

    export interface ContainsOperands extends Operands {
        readonly typeId: ScanFieldCondition.Operands.TypeId.TextContains;
        contains: ContainsOperand;
    }

    export namespace ContainsOperands {
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.Contains |
            ScanFieldCondition.OperatorId.NotContains
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.Contains,
            ScanFieldCondition.OperatorId.NotContains,
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function is(operands: Operands): operands is ContainsOperands {
            return operands.typeId === ScanFieldCondition.Operands.TypeId.TextContains;
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
                        case ScanFieldCondition.Operands.TypeId.HasValue: return true;
                        case ScanFieldCondition.Operands.TypeId.TextValue: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return leftValue === rightValue;
                        }
                        case ScanFieldCondition.Operands.TypeId.TextContains: {
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
    readonly operatorId: TextEqualsScanFieldCondition.OperatorId;
}

export namespace TextEqualsScanFieldCondition {
    export type OperatorId = Operands.OperatorId;
    // export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
    //     ScanFieldCondition.OperatorId.Equals |
    //     ScanFieldCondition.OperatorId.NotEquals
    // >;

    // export const supportedOperatorIds: readonly OperatorId[] = [
    //     ScanFieldCondition.OperatorId.Equals,
    //     ScanFieldCondition.OperatorId.NotEquals,
    // ];

    export namespace Operands {
        export type TypeId = ScanFieldCondition.Operands.TypeId.TextValue;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = BaseTextScanFieldCondition.ValueOperands.OperatorId;
        export const supportedOperatorIds: readonly OperatorId[] = BaseTextScanFieldCondition.ValueOperands.supportedOperatorIds;
    }

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
    readonly operatorId: TextContainsScanFieldCondition.OperatorId;
}

export namespace TextContainsScanFieldCondition {
    export type OperatorId = Operands.OperatorId;
    // export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
    //     ScanFieldCondition.OperatorId.Contains |
    //     ScanFieldCondition.OperatorId.NotContains
    // >;

    // export const supportedOperatorIds: readonly OperatorId[] = [
    //     ScanFieldCondition.OperatorId.Contains,
    //     ScanFieldCondition.OperatorId.NotContains
    // ];

    export namespace Operands {
        export type TypeId = ScanFieldCondition.Operands.TypeId.TextContains;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = BaseTextScanFieldCondition.ContainsOperands.OperatorId;
        export const supportedOperatorIds: readonly OperatorId[] = BaseTextScanFieldCondition.ContainsOperands.supportedOperatorIds;
    }

    export function is(condition: ScanFieldCondition): condition is TextContainsScanFieldCondition {
        return condition.typeId === ScanFieldCondition.TypeId.TextContains;
    }

    export function isEqual(left: TextContainsScanFieldCondition, right: TextContainsScanFieldCondition): boolean {
        return BaseTextScanFieldCondition.isEqual(left, right);
    }
}

export interface TextHasValueEqualsScanFieldCondition extends BaseTextScanFieldCondition {
    readonly typeId: ScanFieldCondition.TypeId.TextHasValueEquals;
    readonly operatorId: TextHasValueEqualsScanFieldCondition.OperatorId;
}

export namespace TextHasValueEqualsScanFieldCondition {
    export type OperatorId = Operands.OperatorId;
    // export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
    //     ScanFieldCondition.OperatorId.HasValue |
    //     ScanFieldCondition.OperatorId.NotHasValue |
    //     ScanFieldCondition.OperatorId.Equals |
    //     ScanFieldCondition.OperatorId.NotEquals
    // >;

    // export const supportedOperatorIds: readonly OperatorId[] = [
    //     ScanFieldCondition.OperatorId.HasValue,
    //     ScanFieldCondition.OperatorId.NotHasValue,
    //     ScanFieldCondition.OperatorId.Equals,
    //     ScanFieldCondition.OperatorId.NotEquals,
    // ];

    export namespace Operands {
        export type TypeId = PickEnum<ScanFieldCondition.Operands.TypeId,
            ScanFieldCondition.Operands.TypeId.HasValue |
            ScanFieldCondition.Operands.TypeId.TextValue
        >;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = BaseTextScanFieldCondition.HasValueOperands.OperatorId | BaseTextScanFieldCondition.ValueOperands.OperatorId;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ...BaseTextScanFieldCondition.HasValueOperands.supportedOperatorIds,
            ...BaseTextScanFieldCondition.ValueOperands.supportedOperatorIds
        ];
    }

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
    readonly operatorId: TextHasValueContainsScanFieldCondition.OperatorId;
}

export namespace TextHasValueContainsScanFieldCondition {
    export type OperatorId = Operands.OperatorId;
    // export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
    //     ScanFieldCondition.OperatorId.HasValue |
    //     ScanFieldCondition.OperatorId.NotHasValue |
    //     ScanFieldCondition.OperatorId.Contains |
    //     ScanFieldCondition.OperatorId.NotContains
    // >;

    // export const supportedOperatorIds: readonly OperatorId[] = [
    //     ScanFieldCondition.OperatorId.HasValue,
    //     ScanFieldCondition.OperatorId.NotHasValue,
    //     ScanFieldCondition.OperatorId.Contains,
    //     ScanFieldCondition.OperatorId.NotContains
    // ];

    export namespace Operands {
        export type TypeId = PickEnum<BaseTextScanFieldCondition.Operands.TypeId,
            ScanFieldCondition.Operands.TypeId.HasValue |
            ScanFieldCondition.Operands.TypeId.TextContains
        >;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = BaseTextScanFieldCondition.HasValueOperands.OperatorId | BaseTextScanFieldCondition.ContainsOperands.OperatorId;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ...BaseTextScanFieldCondition.HasValueOperands.supportedOperatorIds,
            ...BaseTextScanFieldCondition.ContainsOperands.supportedOperatorIds
        ];
    }

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
    readonly operatorId: OverlapsScanFieldCondition.OperatorId;
}

export namespace OverlapsScanFieldCondition {
    export type OperatorId = Operands.OperatorId;
    export namespace Operands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.Overlaps |
            ScanFieldCondition.OperatorId.NotOverlaps
        >;
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.Overlaps,
            ScanFieldCondition.OperatorId.NotOverlaps
        ];
    }

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
    readonly operands: StringOverlapsScanFieldCondition.Operands;
}

export namespace StringOverlapsScanFieldCondition {
    export interface Operands extends ScanFieldCondition.Operands {
        typeId: ScanFieldCondition.Operands.TypeId.TextEnum,
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
    readonly operands: MarketBoardOverlapsScanFieldCondition.Operands;
}

export namespace MarketBoardOverlapsScanFieldCondition {
    export interface Operands extends ScanFieldCondition.Operands {
        typeId: ScanFieldCondition.Operands.TypeId.MarketBoardEnum,
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
    readonly operands: CurrencyOverlapsScanFieldCondition.Operands;
}

export namespace CurrencyOverlapsScanFieldCondition {
    export interface Operands extends ScanFieldCondition.Operands {
        typeId: ScanFieldCondition.Operands.TypeId.CurrencyEnum,
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
    readonly operands: ExchangeOverlapsScanFieldCondition.Operands;
}

export namespace ExchangeOverlapsScanFieldCondition {
    export interface Operands extends ScanFieldCondition.Operands {
        typeId: ScanFieldCondition.Operands.TypeId.ExchangeEnum,
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
    readonly operands: MarketOverlapsScanFieldCondition.Operands;
}

export namespace MarketOverlapsScanFieldCondition {
    export interface Operands extends ScanFieldCondition.Operands {
        typeId: ScanFieldCondition.Operands.TypeId.MarketEnum,
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
    readonly operatorId: IsScanFieldCondition.OperatorId;
    readonly operands: IsScanFieldCondition.Operands;
}

export namespace IsScanFieldCondition {
    export type OperatorId = Operands.OperatorId;
    export interface Operands extends ScanFieldCondition.Operands {
        typeId: ScanFieldCondition.Operands.TypeId.CategoryValue,
        categoryId: ScanFormula.IsNode.CategoryId;
    }

    export namespace Operands {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
            ScanFieldCondition.OperatorId.Is |
            ScanFieldCondition.OperatorId.NotIs
        >;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export const supportedOperatorIds: readonly OperatorId[] = [
            ScanFieldCondition.OperatorId.Is,
            ScanFieldCondition.OperatorId.NotIs
        ];
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

export namespace ScanFieldConditionModule {
    export function initialiseStatic() {
        ScanFieldCondition.Operator.initialise();
    }
}

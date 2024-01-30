/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, Result, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { ScanFormula } from '../../formula/scan-formula';
import { ScanFieldSetLoadError } from '../common/internal-api';
import {
    CurrencyOverlapsScanFieldCondition,
    DateScanFieldCondition,
    ExchangeOverlapsScanFieldCondition,
    IsScanFieldCondition,
    MarketBoardOverlapsScanFieldCondition,
    MarketOverlapsScanFieldCondition,
    NumericComparisonScanFieldCondition,
    NumericScanFieldCondition,
    ScanFieldCondition,
    StringOverlapsScanFieldCondition,
    TextContainsScanFieldCondition,
    TextEqualsScanFieldCondition,
    TextHasValueContainsScanFieldCondition,
    TextHasValueEqualsScanFieldCondition,
    OverlapsScanFieldCondition,
} from './condition/internal-api';

export interface ScanField {
    readonly typeId: ScanField.TypeId;
    readonly fieldId: ScanFormula.FieldId;
    readonly subFieldId: Integer | undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId;
    readonly conditions: ScanField.Conditions;

    conditionsOperationId: ScanField.BooleanOperationId;
}

export namespace ScanField {
    export const enum TypeId {
        NumericInRange,
        PriceSubbed,
        DateInRange,
        DateSubbed,
        TextContains,
        AltCodeSubbed,
        AttributeSubbed,
        TextEquals,
        TextHasValueEquals,
        StringOverlaps,
        CurrencyOverlaps,
        ExchangeOverlaps,
        MarketOverlaps,
        MarketBoardOverlaps,
        Is,
    }

    // Implementable by ComparableList
    export interface Conditions {
        readonly count: Integer;
        capacity: Integer;

        getAt(index: Integer): ScanFieldCondition;
        setAt(index: Integer, value: ScanFieldCondition): void;
        clear(): void;
        add(condition: ScanFieldCondition): Integer;
    }

    export interface TypedConditions<T extends ScanFieldCondition> extends Conditions {
        getAt(index: Integer): T;
        setAt(index: Integer, value: T): void;
        add(condition: T): Integer;
    }

    export const enum BooleanOperationId {
        And,
        Or,
        Xor, // only possible if exactly 2 conditions - converted to 'Or' if not 2 conditions
    }

    export namespace BooleanOperation {
        export const defaultId = BooleanOperationId.And;

        export function getAllIds() {
            return [
                BooleanOperationId.Or,
                BooleanOperationId.And,
                BooleanOperationId.Xor,
            ];
        }
    }

    export interface ConditionFactory {
        createNumericComparisonFromNumericComparison(field: ScanField, formulaNode: ScanFormula.NumericComparisonBooleanNode, operatorId: NumericComparisonScanFieldCondition.OperatorId, useRightOperandAsValue: boolean): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
        createNumericComparisonFromFieldHasValue(field: ScanField, formulaNode: ScanFormula.FieldHasValueNode, operatorId: NumericComparisonScanFieldCondition.OperatorId): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
        createNumericComparisonFromNumericFieldEquals(field: ScanField, formulaNode: ScanFormula.NumericFieldEqualsNode, operatorId: NumericComparisonScanFieldCondition.OperatorId): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
        createNumericComparisonFromNumericFieldInRange(field: ScanField, formulaNode: ScanFormula.NumericFieldInRangeNode, operatorId: NumericComparisonScanFieldCondition.OperatorId): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
        createNumericFromPriceSubFieldHasValue(field: ScanField, formulaNode: ScanFormula.PriceSubFieldHasValueNode, operatorId: NumericScanFieldCondition.OperatorId): Result<NumericScanFieldCondition, ScanFieldSetLoadError>;
        createNumericFromPriceSubFieldEquals(field: ScanField, formulaNode: ScanFormula.PriceSubFieldEqualsNode, operatorId: NumericScanFieldCondition.OperatorId): Result<NumericScanFieldCondition, ScanFieldSetLoadError>;
        createNumericFromPriceSubFieldInRange(field: ScanField, formulaNode: ScanFormula.PriceSubFieldInRangeNode, operatorId: NumericScanFieldCondition.OperatorId): Result<NumericScanFieldCondition, ScanFieldSetLoadError>;
        createDateFromFieldHasValue(field: ScanField, formulaNode: ScanFormula.FieldHasValueNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
        createDateFromDateFieldEquals(field: ScanField, formulaNode: ScanFormula.DateFieldEqualsNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
        createDateFromDateFieldInRange(field: ScanField, formulaNode: ScanFormula.DateFieldInRangeNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
        createDateFromDateSubFieldHasValue(field: ScanField, formulaNode: ScanFormula.DateSubFieldHasValueNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
        createDateFromDateSubFieldEquals(field: ScanField, formulaNode: ScanFormula.DateSubFieldEqualsNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
        createDateFromDateSubFieldInRange(field: ScanField, formulaNode: ScanFormula.DateSubFieldInRangeNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
        createTextEqualsFromTextFieldEquals(field: ScanField, formulaNode: ScanFormula.TextFieldEqualsNode, operatorId: TextEqualsScanFieldCondition.OperatorId): Result<TextEqualsScanFieldCondition, ScanFieldSetLoadError>;
        createTextContainsFromTextFieldContains(field: ScanField, formulaNode: ScanFormula.TextFieldContainsNode, operatorId: TextContainsScanFieldCondition.OperatorId): Result<TextContainsScanFieldCondition, ScanFieldSetLoadError>;
        createTextHasValueEqualsFromFieldHasValue(field: ScanField, formulaNode: ScanFormula.FieldHasValueNode, operatorId: TextHasValueEqualsScanFieldCondition.OperatorId): Result<TextHasValueEqualsScanFieldCondition, ScanFieldSetLoadError>;
        createTextHasValueEqualsFromTextFieldEquals(field: ScanField, formulaNode: ScanFormula.TextFieldEqualsNode, operatorId: TextHasValueEqualsScanFieldCondition.OperatorId): Result<TextHasValueEqualsScanFieldCondition, ScanFieldSetLoadError>;
        createTextHasValueContainsFromAltCodeSubFieldHasValue(field: ScanField, formulaNode: ScanFormula.AltCodeSubFieldHasValueNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
        createTextHasValueContainsFromAltCodeSubFieldContains(field: ScanField, formulaNode: ScanFormula.AltCodeSubFieldContainsNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
        createTextHasValueContainsFromAttributeSubFieldHasValue(field: ScanField, formulaNode: ScanFormula.AttributeSubFieldHasValueNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
        createTextHasValueContainsFromAttributeSubFieldContains(field: ScanField, formulaNode: ScanFormula.AttributeSubFieldContainsNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
        createStringOverlapsFromStringFieldOverlaps(field: ScanField, formulaNode: ScanFormula.StringFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<StringOverlapsScanFieldCondition, ScanFieldSetLoadError>;
        createCurrencyOverlapsFromCurrencyFieldOverlaps(field: ScanField, formulaNode: ScanFormula.CurrencyFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<CurrencyOverlapsScanFieldCondition, ScanFieldSetLoadError>;
        createExchangeOverlapsFromExchangeFieldOverlaps(field: ScanField, formulaNode: ScanFormula.ExchangeFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<ExchangeOverlapsScanFieldCondition, ScanFieldSetLoadError>;
        createMarketOverlapsFromMarketFieldOverlaps(field: ScanField, formulaNode: ScanFormula.MarketFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<MarketOverlapsScanFieldCondition, ScanFieldSetLoadError>;
        createMarketBoardOverlapsFromMarketBoardFieldOverlaps(field: ScanField, formulaNode: ScanFormula.MarketBoardFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<MarketBoardOverlapsScanFieldCondition, ScanFieldSetLoadError>;
        createIsFromIs(field: ScanField, formulaNode: ScanFormula.IsNode, operatorId: IsScanFieldCondition.OperatorId): Result<IsScanFieldCondition, ScanFieldSetLoadError>;
    }

    export function isEqual(left: ScanField, right: ScanField) {
        if (left.typeId !== right.typeId) {
            return false; // This will only occur if a Field is not set up correctly
        } else {
            if (left.conditionsOperationId !== right.conditionsOperationId) {
                return false;
            } else {
                const leftConditions = left.conditions;
                const leftConditionCount = leftConditions.count;
                const rightConditions = right.conditions;
                const rightConditionCount = rightConditions.count;
                if (leftConditionCount !== rightConditionCount) {
                    return false;
                } else {
                    for (let i = 0; i < leftConditionCount; i++) {
                        const leftCondition = leftConditions.getAt(i);
                        const rightCondition = rightConditions.getAt(i);
                        if (!ScanFieldCondition.typedIsEqual(leftCondition, rightCondition)) {
                            return false;
                        }
                    }

                    return true;
                }
            }
        }
    }

    export function isAnyConditionEqualTo(field: ScanField, condition: ScanFieldCondition) {
        if (field.conditionTypeId !== condition.typeId) {
            return false;
        } else {
            const fieldConditions = field.conditions;
            const fieldConditionCount = fieldConditions.count;
            for (let i = 0; i < fieldConditionCount; i++) {
                const fieldCondition = fieldConditions.getAt(i);
                if (ScanFieldCondition.typedIsEqual(fieldCondition, condition)) {
                    return true;
                }
            }
            return false;
        }
    }

    export interface AndedOredXorNodes {
        andedNodes: ScanFormula.BooleanNode[]; // all these nodes need to be included in a parent AND node
        orNodes: ScanFormula.OrNode[];
        xorNodes: ScanFormula.XorNode[];
    }

    export function addAndedOredXorNodes(field: ScanField, andedOredXorNodes: AndedOredXorNodes) {
        const conditionsOperationId = field.conditionsOperationId;
        const conditions = field.conditions;
        const conditionCount = conditions.count;
        let orNode: ScanFormula.OrNode | undefined;
        let xorNode: ScanFormula.XorNode | undefined;
        for (let i = 0; i < conditionCount; i++) {
            const condition = conditions.getAt(i);
            const node = ScanFieldCondition.createFormulaNode(field.fieldId, field.subFieldId, condition);
            switch (conditionsOperationId) {
                case BooleanOperationId.And:
                    andedOredXorNodes.andedNodes.push(node);
                    break;
                case BooleanOperationId.Or:
                    if (orNode === undefined) {
                        orNode = new ScanFormula.OrNode();
                        andedOredXorNodes.orNodes.push(orNode);
                    }
                    orNode.operands.push(node);
                    break;
                case BooleanOperationId.Xor: {
                    switch (i) {
                        case 0:
                            if (conditionCount !== 2) {
                                // XOR always needs to conditions
                                throw new AssertInternalError('SFAAOXNXT145135', conditionCount.toString());
                            } else {
                                xorNode = new ScanFormula.XorNode();
                                andedOredXorNodes.xorNodes.push(xorNode);
                                xorNode.leftOperand = node;
                                break;
                            }
                        case 1:
                            if (xorNode === undefined) {
                                throw new AssertInternalError('SFAAOXNXU145135', conditionCount.toString());
                            } else {
                                xorNode.rightOperand = node;
                                break;
                            }
                        default:
                            throw new AssertInternalError('SFAAOXNXD45135', conditionCount.toString());
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('SFAAOXNX45135', conditionsOperationId);
            }
        }
    }
}

export interface NumericInRangeScanField extends ScanField {
    readonly typeId: ScanField.TypeId.NumericInRange;
    readonly fieldId: ScanFormula.NumericRangeFieldId;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.NumericComparison;
    readonly conditions: ScanField.TypedConditions<NumericComparisonScanFieldCondition>;
}

export namespace NumericInRangeScanField {
    export function is(field: ScanField): field is NumericInRangeScanField {
        return field.typeId === ScanField.TypeId.NumericInRange;
    }

    export function isConditionEqual(left: NumericInRangeScanField, right: NumericInRangeScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!NumericComparisonScanFieldCondition.is(leftCondition) || !NumericComparisonScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return NumericComparisonScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface PriceSubbedScanField extends ScanField {
    readonly typeId: ScanField.TypeId.PriceSubbed;
    readonly fieldId: ScanFormula.FieldId.PriceSubbed,
    readonly subFieldId: ScanFormula.PriceSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.Numeric;
    readonly conditions: ScanField.TypedConditions<NumericScanFieldCondition>;
}

export namespace PriceSubbedScanField {
    export function isConditionEqual(left: PriceSubbedScanField, right: PriceSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!NumericScanFieldCondition.is(leftCondition) || !NumericScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return NumericScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface DateInRangeScanField extends ScanField {
    readonly typeId: ScanField.TypeId.DateInRange;
    readonly fieldId: ScanFormula.DateRangeFieldId,
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.Date;
    readonly conditions: ScanField.TypedConditions<DateScanFieldCondition>;
}

export namespace DateInRangeScanField {
    export function isConditionEqual(left: DateInRangeScanField, right: DateInRangeScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!DateScanFieldCondition.is(leftCondition) || !DateScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return DateScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface DateSubbedScanField extends ScanField {
    readonly typeId: ScanField.TypeId.DateSubbed;
    readonly fieldId: ScanFormula.FieldId.DateSubbed;
    readonly subFieldId: ScanFormula.DateSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.Date;
    readonly conditions: ScanField.TypedConditions<DateScanFieldCondition>;
}

export namespace DateSubbedScanField {
    export function isConditionEqual(left: DateSubbedScanField, right: DateSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!DateScanFieldCondition.is(leftCondition) || !DateScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return DateScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextContainsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.TextContains;
    readonly fieldId: ScanFormula.TextContainsFieldId,
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextContains;
    readonly conditions: ScanField.TypedConditions<TextContainsScanFieldCondition>;
}

export namespace TextContainsScanField {
    export function isConditionEqual(left: TextContainsScanField, right: TextContainsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextContainsScanFieldCondition.is(leftCondition) || !TextContainsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextContainsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface AltCodeSubbedScanField extends ScanField {
    readonly typeId: ScanField.TypeId.AltCodeSubbed;
    readonly fieldId: ScanFormula.FieldId.AltCodeSubbed,
    readonly subFieldId: ScanFormula.AltCodeSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextHasValueContains;
    readonly conditions: ScanField.TypedConditions<TextHasValueContainsScanFieldCondition>;
}

export namespace AltCodeSubbedScanField {
    export function isConditionEqual(left: AltCodeSubbedScanField, right: AltCodeSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextHasValueContainsScanFieldCondition.is(leftCondition) || !TextHasValueContainsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextHasValueContainsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface AttributeSubbedScanField extends ScanField {
    readonly typeId: ScanField.TypeId.AttributeSubbed;
    readonly fieldId: ScanFormula.FieldId.AttributeSubbed,
    readonly subFieldId: ScanFormula.AttributeSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextHasValueContains;
    readonly conditions: ScanField.TypedConditions<TextHasValueContainsScanFieldCondition>;
}

export namespace AttributeSubbedScanField {
    export function isConditionEqual(left: AttributeSubbedScanField, right: AttributeSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextHasValueContainsScanFieldCondition.is(leftCondition) || !TextHasValueContainsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextHasValueContainsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextEqualsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.TextEquals;
    readonly fieldId: ScanFormula.TextEqualsFieldId;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextEquals;
    readonly conditions: ScanField.TypedConditions<TextEqualsScanFieldCondition>;
}

export namespace TextEqualsScanField {
    export function isConditionEqual(left: TextEqualsScanField, right: TextEqualsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextEqualsScanFieldCondition.is(leftCondition) || !TextEqualsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextEqualsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextHasValueEqualsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.TextHasValueEquals;
    readonly fieldId: ScanFormula.TextHasValueEqualsFieldId;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextHasValueEquals;
    readonly conditions: ScanField.TypedConditions<TextHasValueEqualsScanFieldCondition>;
}

export namespace TextHasValueEqualsScanField {
    export function isConditionEqual(left: TextHasValueEqualsScanField, right: TextHasValueEqualsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextHasValueEqualsScanFieldCondition.is(leftCondition) || !TextHasValueEqualsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextHasValueEqualsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface StringOverlapsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.StringOverlaps;
    readonly fieldId: ScanFormula.StringOverlapsFieldId;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.StringOverlaps;
    readonly conditions: ScanField.TypedConditions<StringOverlapsScanFieldCondition>;
}

export namespace StringOverlapsScanField {
    export function isConditionEqual(left: StringOverlapsScanField, right: StringOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!StringOverlapsScanFieldCondition.is(leftCondition) || !StringOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return StringOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface CurrencyOverlapsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.CurrencyOverlaps;
    readonly fieldId: ScanFormula.FieldId.Currency;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.CurrencyOverlaps;
    readonly conditions: ScanField.TypedConditions<CurrencyOverlapsScanFieldCondition>;
}

export namespace CurrencyOverlapsScanField {
    export function isConditionEqual(left: CurrencyOverlapsScanField, right: CurrencyOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!CurrencyOverlapsScanFieldCondition.is(leftCondition) || !CurrencyOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return CurrencyOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface ExchangeOverlapsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.ExchangeOverlaps;
    readonly fieldId: ScanFormula.FieldId.Exchange;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.ExchangeOverlaps;
    readonly conditions: ScanField.TypedConditions<ExchangeOverlapsScanFieldCondition>;
}

export namespace ExchangeOverlapsScanField {
    export function isConditionEqual(left: ExchangeOverlapsScanField, right: ExchangeOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!ExchangeOverlapsScanFieldCondition.is(leftCondition) || !ExchangeOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return ExchangeOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface MarketOverlapsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.MarketOverlaps;
    readonly fieldId: ScanFormula.MarketOverlapsFieldId;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.MarketOverlaps;
    readonly conditions: ScanField.TypedConditions<MarketOverlapsScanFieldCondition>;
}

export namespace MarketOverlapsScanField {
    export function isConditionEqual(left: MarketOverlapsScanField, right: MarketOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!MarketOverlapsScanFieldCondition.is(leftCondition) || !MarketOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return MarketOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface MarketBoardOverlapsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.MarketBoardOverlaps;
    readonly fieldId: ScanFormula.FieldId.MarketBoard;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.MarketBoardOverlaps;
    readonly conditions: ScanField.TypedConditions<MarketBoardOverlapsScanFieldCondition>;
}

export namespace MarketBoardOverlapsScanField {
    export function isConditionEqual(left: MarketBoardOverlapsScanField, right: MarketBoardOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!MarketBoardOverlapsScanFieldCondition.is(leftCondition) || !MarketBoardOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return MarketBoardOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface IsScanField extends ScanField {
    readonly typeId: ScanField.TypeId.Is;
    readonly fieldId: ScanFormula.FieldId.Is;
    readonly subFieldId: undefined;
    readonly conditionTypeId: ScanFieldCondition.TypeId.Is;
    readonly conditions: ScanField.TypedConditions<IsScanFieldCondition>;
}

export namespace IsScanField {
    export function isConditionEqual(left: IsScanField, right: IsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!IsScanFieldCondition.is(leftCondition) || !IsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return IsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

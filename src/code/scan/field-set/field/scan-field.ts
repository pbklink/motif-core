/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../../adi/adi-internal-api';
import { StringId, Strings } from '../../../res/res-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, Integer, Result, SourceTzOffsetDateTime, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { ScanFormula } from '../../formula/scan-formula';
import {
    BaseNumericScanFieldCondition,
    BaseTextScanFieldCondition,
    CurrencyOverlapsScanFieldCondition,
    DateScanFieldCondition,
    ExchangeOverlapsScanFieldCondition,
    IsScanFieldCondition,
    MarketBoardOverlapsScanFieldCondition,
    MarketOverlapsScanFieldCondition,
    NumericComparisonScanFieldCondition,
    NumericScanFieldCondition,
    OverlapsScanFieldCondition,
    ScanFieldCondition,
    StringOverlapsScanFieldCondition,
    TextContainsScanFieldCondition,
    TextEqualsScanFieldCondition,
    TextHasValueContainsScanFieldCondition,
    TextHasValueEqualsScanFieldCondition
} from './condition/internal-api';

export interface ScanField<Modifier = void> extends ScanField.Definition<Modifier> {
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

    export interface Definition<IgnoredModifier> {
        readonly typeId: TypeId;
        readonly fieldId: ScanFormula.FieldId;
        readonly subFieldId: Integer | undefined;
    }

    // Implementable by ComparableList
    export interface Conditions<Modifier = void> {
        readonly count: Integer;
        capacity: Integer;

        getAt(index: Integer): ScanFieldCondition<Modifier>;
        setAt(index: Integer, value: ScanFieldCondition<Modifier>): void;
        clear(): void;
        add(condition: ScanFieldCondition<Modifier>): Integer;
    }

    export interface TypedConditions<T extends ScanFieldCondition<Modifier>, Modifier = void> extends Conditions<Modifier> {
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
        export type Id = BooleanOperationId;

        export const defaultId = BooleanOperationId.And;

        interface Info {
            readonly id: Id;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof BooleanOperationId]: Info };
        const infosObject: InfosObject = {
            And: {
                id: BooleanOperationId.And,
                displayId: StringId.ScanField_BooleanOperationDisplay_All,
                descriptionId: StringId.ScanField_BooleanOperationDescription_All,
            },
            Or: {
                id: BooleanOperationId.Or,
                displayId: StringId.ScanField_BooleanOperationDisplay_Any,
                descriptionId: StringId.ScanField_BooleanOperationDescription_Any,
            },
            Xor: {
                id: BooleanOperationId.And,
                displayId: StringId.ScanField_BooleanOperationDisplay_Xor,
                descriptionId: StringId.ScanField_BooleanOperationDescription_Xor,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;
        export const allIds = generateAllIds();

        function generateAllIds(): readonly BooleanOperationId[] {
            const result = new Array<BooleanOperationId>(idCount);
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                const id = info.id;
                if (id !== i as BooleanOperationId) {
                    throw new EnumInfoOutOfOrderError('ScanField.BooleanOperation.Id', i, Strings[info.displayId]);
                } else {
                    result[i] = id;
                }
            }
            return result;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDescription(id: Id) {
            return Strings[idToDescriptionId(id)];
        }
    }

    export interface ConditionFactory<Modifier = void> {
        createNumericComparisonWithHasValue(field: ScanField<Modifier>, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericComparisonScanFieldCondition<Modifier>>;
        createNumericComparisonWithValue(field: ScanField<Modifier>, operatorId: NumericComparisonScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericComparisonScanFieldCondition<Modifier>>;
        createNumericComparisonWithRange(field: ScanField<Modifier>, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericComparisonScanFieldCondition<Modifier>>;
        createNumericWithHasValue(field: ScanField<Modifier>, operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId): Result<NumericScanFieldCondition<Modifier>>;
        createNumericWithValue(field: ScanField<Modifier>, operatorId: NumericScanFieldCondition.ValueOperands.OperatorId, value: number): Result<NumericScanFieldCondition<Modifier>>;
        createNumericWithRange(field: ScanField<Modifier>, operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId, min: number | undefined, max: number | undefined): Result<NumericScanFieldCondition<Modifier>>;
        createDateWithHasValue(field: ScanField<Modifier>, operatorId: DateScanFieldCondition.HasValueOperands.OperatorId): Result<DateScanFieldCondition<Modifier>>;
        createDateWithEquals(field: ScanField<Modifier>, operatorId: DateScanFieldCondition.ValueOperands.OperatorId, value: SourceTzOffsetDateTime): Result<DateScanFieldCondition<Modifier>>;
        createDateWithRange(field: ScanField<Modifier>, operatorId: DateScanFieldCondition.RangeOperands.OperatorId, min: SourceTzOffsetDateTime | undefined, max: SourceTzOffsetDateTime | undefined): Result<DateScanFieldCondition<Modifier>>;
        createTextEquals(field: ScanField<Modifier>, operatorId: TextEqualsScanFieldCondition.Operands.OperatorId, value: string): Result<TextEqualsScanFieldCondition<Modifier>>;
        createTextContains(field: ScanField<Modifier>, operatorId: TextContainsScanFieldCondition.Operands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextContainsScanFieldCondition<Modifier>>;
        createTextHasValueEqualsWithHasValue(field: ScanField<Modifier>, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueEqualsScanFieldCondition<Modifier>>;
        createTextHasValueEqualsWithValue(field: ScanField<Modifier>, operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId, value: string): Result<TextHasValueEqualsScanFieldCondition<Modifier>>;
        createTextHasValueContainsWithHasValue(field: ScanField<Modifier>, operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId): Result<TextHasValueContainsScanFieldCondition<Modifier>>;
        createTextHasValueContainsWithContains(field: ScanField<Modifier>, operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<TextHasValueContainsScanFieldCondition<Modifier>>;
        createStringOverlaps(field: ScanField<Modifier>, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly string[]): Result<StringOverlapsScanFieldCondition<Modifier>>;
        createCurrencyOverlaps(field: ScanField<Modifier>, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly CurrencyId[]): Result<CurrencyOverlapsScanFieldCondition<Modifier>>;
        createExchangeOverlaps(field: ScanField<Modifier>, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly ExchangeId[]): Result<ExchangeOverlapsScanFieldCondition<Modifier>>;
        createMarketOverlaps(field: ScanField<Modifier>, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketId[]): Result<MarketOverlapsScanFieldCondition<Modifier>>;
        createMarketBoardOverlaps(field: ScanField<Modifier>, operatorId: OverlapsScanFieldCondition.Operands.OperatorId, values: readonly MarketBoardId[]): Result<MarketBoardOverlapsScanFieldCondition<Modifier>>;
        createIs(field: ScanField<Modifier>, operatorId: IsScanFieldCondition.Operands.OperatorId, categoryId: ScanFormula.IsNode.CategoryId): Result<IsScanFieldCondition<Modifier>>;
    }

    export function isEqual<Modifier>(left: ScanField<Modifier>, right: ScanField<Modifier>) {
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

    export function isAnyConditionEqualTo<Modifier>(field: ScanField<Modifier>, condition: ScanFieldCondition<Modifier>) {
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

    export function addAndedOredXorNodes<Modifier>(field: ScanField<Modifier>, andedOredXorNodes: AndedOredXorNodes) {
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

export interface NotSubbedScanField<Modifier = void> extends ScanField<Modifier> {
    readonly subFieldId: undefined;
}

export interface NumericInRangeScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.NumericInRange;
    readonly fieldId: ScanFormula.NumericRangeFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.NumericComparison;
    readonly conditions: ScanField.TypedConditions<NumericComparisonScanFieldCondition, Modifier>;
}

export namespace NumericInRangeScanField {
    export function is<Modifier>(field: ScanField<Modifier>): field is NumericInRangeScanField<Modifier> {
        return field.typeId === ScanField.TypeId.NumericInRange;
    }

    export function isConditionEqual<Modifier>(left: NumericInRangeScanField<Modifier>, right: NumericInRangeScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!NumericComparisonScanFieldCondition.is(leftCondition) || !NumericComparisonScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return NumericComparisonScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface PriceSubbedScanField<Modifier = void> extends ScanField<Modifier> {
    readonly typeId: ScanField.TypeId.PriceSubbed;
    readonly fieldId: ScanFormula.FieldId.PriceSubbed,
    readonly subFieldId: ScanFormula.PriceSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.Numeric;
    readonly conditions: ScanField.TypedConditions<NumericScanFieldCondition, Modifier>;
}

export namespace PriceSubbedScanField {
    export function isConditionEqual<Modifier>(left: PriceSubbedScanField<Modifier>, right: PriceSubbedScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!NumericScanFieldCondition.is(leftCondition) || !NumericScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return NumericScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface DateInRangeScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.DateInRange;
    readonly fieldId: ScanFormula.DateRangeFieldId,
    readonly conditionTypeId: ScanFieldCondition.TypeId.Date;
    readonly conditions: ScanField.TypedConditions<DateScanFieldCondition, Modifier>;
}

export namespace DateInRangeScanField {
    export function isConditionEqual<Modifier>(left: DateInRangeScanField<Modifier>, right: DateInRangeScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!DateScanFieldCondition.is(leftCondition) || !DateScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return DateScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface DateSubbedScanField<Modifier = void> extends ScanField<Modifier> {
    readonly typeId: ScanField.TypeId.DateSubbed;
    readonly fieldId: ScanFormula.FieldId.DateSubbed;
    readonly subFieldId: ScanFormula.DateSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.Date;
    readonly conditions: ScanField.TypedConditions<DateScanFieldCondition, Modifier>;
}

export namespace DateSubbedScanField {
    export function isConditionEqual<Modifier>(left: DateSubbedScanField<Modifier>, right: DateSubbedScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!DateScanFieldCondition.is(leftCondition) || !DateScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return DateScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextContainsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.TextContains;
    readonly fieldId: ScanFormula.TextContainsFieldId,
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextContains;
    readonly conditions: ScanField.TypedConditions<TextContainsScanFieldCondition, Modifier>;
}

export namespace TextContainsScanField {
    export function isConditionEqual<Modifier>(left: TextContainsScanField<Modifier>, right: TextContainsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextContainsScanFieldCondition.is(leftCondition) || !TextContainsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextContainsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface AltCodeSubbedScanField<Modifier = void> extends ScanField<Modifier> {
    readonly typeId: ScanField.TypeId.AltCodeSubbed;
    readonly fieldId: ScanFormula.FieldId.AltCodeSubbed,
    readonly subFieldId: ScanFormula.AltCodeSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextHasValueContains;
    readonly conditions: ScanField.TypedConditions<TextHasValueContainsScanFieldCondition, Modifier>;
}

export namespace AltCodeSubbedScanField {
    export function isConditionEqual<Modifier>(left: AltCodeSubbedScanField<Modifier>, right: AltCodeSubbedScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextHasValueContainsScanFieldCondition.is(leftCondition) || !TextHasValueContainsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextHasValueContainsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface AttributeSubbedScanField<Modifier = void> extends ScanField<Modifier> {
    readonly typeId: ScanField.TypeId.AttributeSubbed;
    readonly fieldId: ScanFormula.FieldId.AttributeSubbed,
    readonly subFieldId: ScanFormula.AttributeSubFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextHasValueContains;
    readonly conditions: ScanField.TypedConditions<TextHasValueContainsScanFieldCondition, Modifier>;
}

export namespace AttributeSubbedScanField {
    export function isConditionEqual<Modifier>(left: AttributeSubbedScanField<Modifier>, right: AttributeSubbedScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextHasValueContainsScanFieldCondition.is(leftCondition) || !TextHasValueContainsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextHasValueContainsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextEqualsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.TextEquals;
    readonly fieldId: ScanFormula.TextEqualsFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextEquals;
    readonly conditions: ScanField.TypedConditions<TextEqualsScanFieldCondition, Modifier>;
}

export namespace TextEqualsScanField {
    export function isConditionEqual<Modifier>(left: TextEqualsScanField<Modifier>, right: TextEqualsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextEqualsScanFieldCondition.is(leftCondition) || !TextEqualsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextEqualsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextHasValueEqualsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.TextHasValueEquals;
    readonly fieldId: ScanFormula.TextHasValueEqualsFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.TextHasValueEquals;
    readonly conditions: ScanField.TypedConditions<TextHasValueEqualsScanFieldCondition, Modifier>;
}

export namespace TextHasValueEqualsScanField {
    export function isConditionEqual<Modifier>(left: TextHasValueEqualsScanField<Modifier>, right: TextHasValueEqualsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextHasValueEqualsScanFieldCondition.is(leftCondition) || !TextHasValueEqualsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextHasValueEqualsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface StringOverlapsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.StringOverlaps;
    readonly fieldId: ScanFormula.StringOverlapsFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.StringOverlaps;
    readonly conditions: ScanField.TypedConditions<StringOverlapsScanFieldCondition, Modifier>;
}

export namespace StringOverlapsScanField {
    export function isConditionEqual<Modifier>(left: StringOverlapsScanField<Modifier>, right: StringOverlapsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!StringOverlapsScanFieldCondition.is(leftCondition) || !StringOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return StringOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface CurrencyOverlapsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.CurrencyOverlaps;
    readonly fieldId: ScanFormula.FieldId.Currency;
    readonly conditionTypeId: ScanFieldCondition.TypeId.CurrencyOverlaps;
    readonly conditions: ScanField.TypedConditions<CurrencyOverlapsScanFieldCondition, Modifier>;
}

export namespace CurrencyOverlapsScanField {
    export function isConditionEqual<Modifier>(left: CurrencyOverlapsScanField<Modifier>, right: CurrencyOverlapsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!CurrencyOverlapsScanFieldCondition.is(leftCondition) || !CurrencyOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return CurrencyOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface ExchangeOverlapsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.ExchangeOverlaps;
    readonly fieldId: ScanFormula.FieldId.Exchange;
    readonly conditionTypeId: ScanFieldCondition.TypeId.ExchangeOverlaps;
    readonly conditions: ScanField.TypedConditions<ExchangeOverlapsScanFieldCondition, Modifier>;
}

export namespace ExchangeOverlapsScanField {
    export function isConditionEqual<Modifier>(left: ExchangeOverlapsScanField<Modifier>, right: ExchangeOverlapsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!ExchangeOverlapsScanFieldCondition.is(leftCondition) || !ExchangeOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return ExchangeOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface MarketOverlapsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.MarketOverlaps;
    readonly fieldId: ScanFormula.MarketOverlapsFieldId;
    readonly conditionTypeId: ScanFieldCondition.TypeId.MarketOverlaps;
    readonly conditions: ScanField.TypedConditions<MarketOverlapsScanFieldCondition, Modifier>;
}

export namespace MarketOverlapsScanField {
    export function isConditionEqual<Modifier>(left: MarketOverlapsScanField<Modifier>, right: MarketOverlapsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!MarketOverlapsScanFieldCondition.is(leftCondition) || !MarketOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return MarketOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface MarketBoardOverlapsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.MarketBoardOverlaps;
    readonly fieldId: ScanFormula.FieldId.MarketBoard;
    readonly conditionTypeId: ScanFieldCondition.TypeId.MarketBoardOverlaps;
    readonly conditions: ScanField.TypedConditions<MarketBoardOverlapsScanFieldCondition, Modifier>;
}

export namespace MarketBoardOverlapsScanField {
    export function isConditionEqual<Modifier>(left: MarketBoardOverlapsScanField<Modifier>, right: MarketBoardOverlapsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!MarketBoardOverlapsScanFieldCondition.is(leftCondition) || !MarketBoardOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return MarketBoardOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface IsScanField<Modifier = void> extends NotSubbedScanField<Modifier> {
    readonly typeId: ScanField.TypeId.Is;
    readonly fieldId: ScanFormula.FieldId.Is;
    readonly conditionTypeId: ScanFieldCondition.TypeId.Is;
    readonly conditions: ScanField.TypedConditions<IsScanFieldCondition, Modifier>;
}

export namespace IsScanField {
    export function isConditionEqual<Modifier>(left: IsScanField<Modifier>, right: IsScanField<Modifier>, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!IsScanFieldCondition.is(leftCondition) || !IsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return IsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

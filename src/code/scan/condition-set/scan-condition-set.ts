/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, Integer, Ok, Result, SourceTzOffsetDateTime, UnreachableCaseError } from '../../sys/sys-internal-api';
import { ScanFormula } from '../formula/internal-api';
import { ScanConditionSetLoadError, ScanConditionSetLoadErrorTypeId } from './common/internal-api';
import {
    AltCodeSubFieldContainsScanCondition,
    AltCodeSubFieldHasValueScanCondition,
    AttributeSubFieldContainsScanCondition,
    AttributeSubFieldHasValueScanCondition,
    BooleanFieldEqualsScanCondition,
    DateFieldEqualsScanCondition,
    DateFieldInRangeScanCondition,
    DateSubFieldEqualsScanCondition,
    DateSubFieldHasValueScanCondition,
    DateSubFieldInRangeScanCondition,
    FieldHasValueScanCondition,
    NumericComparisonScanCondition,
    NumericFieldEqualsScanCondition,
    NumericFieldInRangeScanCondition,
    PriceSubFieldEqualsScanCondition,
    PriceSubFieldHasValueScanCondition,
    PriceSubFieldInRangeScanCondition,
    ScanCondition,
    ScanConditionFactory,
    TextFieldContainsScanCondition
} from './condition/internal-api';

export interface ScanConditionSet {
    readonly conditionFactory: ScanConditionFactory;

    setOperationId: ScanConditionSet.SetOperationId;
    notSetOperation: boolean;
    conditions: ScanConditionSet.Conditions;

    loadError: ScanConditionSetLoadError | undefined;

    assign(value: ScanConditionSet): void;
}

export namespace ScanConditionSet {
    export const enum SetOperationId {
        Or,
        And,
    }

    // Implementable by ComparableList
    export interface Conditions {
        readonly count: Integer;
        capacity: Integer;

        getAt(index: Integer): ScanCondition;
        clear(): void;
        add(condition: ScanCondition): Integer;
    }

    export function tryLoadConditionSetFromFormulaNode(conditionSet: ScanConditionSet, rootFormulaBooleanNode: ScanFormula.BooleanNode): boolean {
        let conditionsBooleanNode: ScanFormula.BooleanNode;
        if (ScanFormula.NotNode.is(rootFormulaBooleanNode)) {
            conditionSet.notSetOperation = true;
            conditionsBooleanNode = rootFormulaBooleanNode.operand;
        } else {
            conditionSet.notSetOperation = false;
            conditionsBooleanNode = rootFormulaBooleanNode;
        }

        let conditionsNode: ScanFormula.MultiOperandBooleanNode | undefined;
        switch (conditionsBooleanNode.typeId) {
            case ScanFormula.NodeTypeId.And:
                conditionSet.setOperationId = SetOperationId.And;
                conditionsNode = conditionsBooleanNode as ScanFormula.AndNode;
                break;
            case ScanFormula.NodeTypeId.Or:
                conditionSet.setOperationId = SetOperationId.Or;
                conditionsNode = conditionsBooleanNode as ScanFormula.OrNode;
                break;
        }

        if (conditionsNode === undefined) {
            conditionSet.loadError = { typeId: ScanConditionSetLoadErrorTypeId.UnsupportedConditionsNodeType, extra: conditionsBooleanNode.typeId.toString() };
            return false;
        } else {
            const operandNodes = conditionsNode.operands;
            const count = operandNodes.length;
            const conditions = conditionSet.conditions;
            conditions.clear();
            conditions.capacity = count;
            for (let i = 0; i < count; i++) {
                const operandNode = operandNodes[i]

                const createConditionResult = createCondition(operandNode, conditionSet.conditionFactory, false);

                if (createConditionResult.isErr()) {
                    conditionSet.loadError = createConditionResult.error;
                    return false;
                } else {
                    conditions.add(createConditionResult.value);
                }
            }

            conditionSet.loadError = undefined;
            return true;
        }
    }

    export function createFormulaNode(conditionSet: ScanConditionSet): ScanFormula.OrNode | ScanFormula.AndNode | ScanFormula.NotNode {
        const conditionsBooleanNode = createConditionsBooleanNode(conditionSet.setOperationId);

        let result: ScanFormula.OrNode | ScanFormula.AndNode | ScanFormula.NotNode;
        if (conditionSet.notSetOperation) {
            result = new ScanFormula.NotNode();
            result.operand = conditionsBooleanNode;
        } else {
            result = conditionsBooleanNode;
        }

        const conditions = conditionSet.conditions;
        const conditionCount = conditions.count;
        const operands = new Array<ScanFormula.BooleanNode>(conditionCount);

        for (let i = 0; i < conditionCount; i++) {
            const condition = conditions.getAt(i);
            const operandBooleanNode = createConditionBooleanNode(condition);
            if (condition.not) {
                const notNode = new ScanFormula.NotNode();
                notNode.operand = operandBooleanNode;
                operands[i] = notNode;
            } else {
                operands[i] = operandBooleanNode;
            }
        }

        conditionsBooleanNode.operands = operands;

        return result;
    }

    export function isEqual(left: ScanConditionSet, right: ScanConditionSet) {
        if (left.setOperationId !== right.setOperationId) {
            return false;
        } else {
            if (left.notSetOperation !== right.notSetOperation) {
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
                        if (!ScanCondition.isEqual(leftCondition, rightCondition)) {
                            return false;
                        }
                    }

                    return true;
                }
            }
        }
    }

    function createCondition(operandNode: ScanFormula.BooleanNode, factory: ScanConditionFactory, not: boolean): Result<ScanCondition, ScanConditionSetLoadError> {
        switch (operandNode.typeId) {
            case ScanFormula.NodeTypeId.Not: {
                const notNode = operandNode as ScanFormula.NotNode;
                const createResult = createCondition(notNode.operand, factory, !not);
                if (createResult.isErr()) {
                    return createResult;
                } else {
                    const condition = createResult.value;
                    condition.not = !condition.not;
                    return new Ok(condition);
                }
            }
            case ScanFormula.NodeTypeId.Xor:
            case ScanFormula.NodeTypeId.And:
            case ScanFormula.NodeTypeId.Or:
                return new Err({ typeId: ScanConditionSetLoadErrorTypeId.UnsupportedConditionNodeType, extra: operandNode.typeId.toString() })
            case ScanFormula.NodeTypeId.NumericEquals: {
                const numericComparisonBooleanNode = operandNode as ScanFormula.NumericComparisonBooleanNode;
                return factory.createNumericComparison(numericComparisonBooleanNode, not, NumericComparisonScanCondition.OperationId.Equals);
            }
            case ScanFormula.NodeTypeId.NumericGreaterThan: {
                const numericComparisonBooleanNode = operandNode as ScanFormula.NumericComparisonBooleanNode;
                return factory.createNumericComparison(numericComparisonBooleanNode, not, NumericComparisonScanCondition.OperationId.GreaterThan);
            }
            case ScanFormula.NodeTypeId.NumericGreaterThanOrEqual: {
                const numericComparisonBooleanNode = operandNode as ScanFormula.NumericComparisonBooleanNode;
                return factory.createNumericComparison(numericComparisonBooleanNode, not, NumericComparisonScanCondition.OperationId.GreaterThanOrEqual);
            }
            case ScanFormula.NodeTypeId.NumericLessThan: {
                const numericComparisonBooleanNode = operandNode as ScanFormula.NumericComparisonBooleanNode;
                return factory.createNumericComparison(numericComparisonBooleanNode, not, NumericComparisonScanCondition.OperationId.LessThan);
            }
            case ScanFormula.NodeTypeId.NumericLessThanOrEqual: {
                const numericComparisonBooleanNode = operandNode as ScanFormula.NumericComparisonBooleanNode;
                return factory.createNumericComparison(numericComparisonBooleanNode, not, NumericComparisonScanCondition.OperationId.LessThanOrEqual);
            }
            case ScanFormula.NodeTypeId.All:
                return factory.createAll(operandNode as ScanFormula.AllNode, not);
            case ScanFormula.NodeTypeId.None:
                return factory.createNone(operandNode as ScanFormula.NoneNode, not);
            case ScanFormula.NodeTypeId.FieldHasValue: {
                const fieldHasValueNode = operandNode as ScanFormula.FieldHasValueNode;
                return factory.createFieldHasValue(fieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.BooleanFieldEquals: {
                const booleanFieldEqualsNode = operandNode as ScanFormula.BooleanFieldEqualsNode;
                return factory.createBooleanFieldEquals(booleanFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.NumericFieldEquals: {
                const numericFieldEqualsNode = operandNode as ScanFormula.NumericFieldEqualsNode;
                return factory.createNumericFieldEquals(numericFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.NumericFieldInRange: {
                const numericFieldInRangeNode = operandNode as ScanFormula.NumericFieldInRangeNode;
                return factory.createNumericFieldInRange(numericFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.DateFieldEquals: {
                const dateFieldEqualsNode = operandNode as ScanFormula.DateFieldEqualsNode;
                return factory.createDateFieldEquals(dateFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.DateFieldInRange: {
                const dateFieldInRangeNode = operandNode as ScanFormula.DateFieldInRangeNode;
                return factory.createDateFieldInRange(dateFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.TextFieldContains: {
                const textFieldContainsNode = operandNode as ScanFormula.TextFieldContainsNode;
                return factory.createTextFieldContains(textFieldContainsNode, not);
            }
            case ScanFormula.NodeTypeId.PriceSubFieldHasValue: {
                const priceSubFieldHasValueNode = operandNode as ScanFormula.PriceSubFieldHasValueNode;
                return factory.createPriceSubFieldHasValue(priceSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.PriceSubFieldEquals: {
                const priceSubFieldEqualsNode = operandNode as ScanFormula.PriceSubFieldEqualsNode;
                return factory.createPriceSubFieldEquals(priceSubFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.PriceSubFieldInRange: {
                const priceSubFieldInRangeNode = operandNode as ScanFormula.PriceSubFieldInRangeNode;
                return factory.createPriceSubFieldInRange(priceSubFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.DateSubFieldHasValue: {
                const dateSubFieldHasValueNode = operandNode as ScanFormula.DateSubFieldHasValueNode;
                return factory.createDateSubFieldHasValue(dateSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.DateSubFieldEquals: {
                const dateSubFieldEqualsNode = operandNode as ScanFormula.DateSubFieldEqualsNode;
                return factory.createDateSubFieldEquals(dateSubFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.DateSubFieldInRange: {
                const dateSubFieldInRangeNode = operandNode as ScanFormula.DateSubFieldInRangeNode;
                return factory.createDateSubFieldInRange(dateSubFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.AltCodeSubFieldHasValue: {
                const altCodeSubFieldHasValueNode = operandNode as ScanFormula.AltCodeSubFieldHasValueNode;
                return factory.createAltCodeSubFieldHasValue(altCodeSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.AltCodeSubFieldContains: {
                const altCodeSubFieldContainsNode = operandNode as ScanFormula.AltCodeSubFieldContainsNode;
                return factory.createAltCodeSubFieldContains(altCodeSubFieldContainsNode, not);
            }
            case ScanFormula.NodeTypeId.AttributeSubFieldHasValue: {
                const attributeSubFieldHasValueNode = operandNode as ScanFormula.AttributeSubFieldHasValueNode;
                return factory.createAttributeSubFieldHasValue(attributeSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.AttributeSubFieldContains: {
                const attributeSubFieldContainsNode = operandNode as ScanFormula.AttributeSubFieldContainsNode;
                return factory.createAttributeSubFieldContains(attributeSubFieldContainsNode, not);
            }
            default:
                throw new UnreachableCaseError('SCSCC44991', operandNode.typeId);
        }

    }

    function createConditionsBooleanNode(setOperationId: ScanConditionSet.SetOperationId) {
        switch (setOperationId)  {
            case SetOperationId.Or: return new ScanFormula.OrNode();
            case SetOperationId.And: return new ScanFormula.AndNode();
            default:
                throw new UnreachableCaseError('SCSCCBN20198', setOperationId);
        }
    }

    function createConditionBooleanNode(condition: ScanCondition): ScanFormula.BooleanNode {
        switch (condition.typeId) {
            case ScanCondition.TypeId.NumericComparison: {
                const numericComparisonCondition  = condition as NumericComparisonScanCondition;
                return createNumericComparisonBooleanNode(numericComparisonCondition);
            }
            case ScanCondition.TypeId.All: {
                return new ScanFormula.AllNode();
            }
            case ScanCondition.TypeId.None: {
                return new ScanFormula.NoneNode();
            }
            case ScanCondition.TypeId.FieldHasValue: {
                const fieldHasValueCondition  = condition as FieldHasValueScanCondition;
                const fieldHasValueNode = new ScanFormula.FieldHasValueNode();
                fieldHasValueNode.fieldId = fieldHasValueCondition.fieldId;
                return fieldHasValueNode;
            }
            case ScanCondition.TypeId.BooleanFieldEquals: {
                const booleanFieldEqualsCondition  = condition as BooleanFieldEqualsScanCondition;
                const booleanFieldEqualsNode = new ScanFormula.BooleanFieldEqualsNode();
                booleanFieldEqualsNode.fieldId = booleanFieldEqualsCondition.fieldId;
                booleanFieldEqualsNode.target = booleanFieldEqualsCondition.target;
                return booleanFieldEqualsNode;
            }
            case ScanCondition.TypeId.NumericFieldEquals: {
                const numericFieldEqualsCondition  = condition as NumericFieldEqualsScanCondition;
                const numericFieldEqualsNode = new ScanFormula.NumericFieldEqualsNode();
                numericFieldEqualsNode.fieldId = numericFieldEqualsCondition.fieldId;
                numericFieldEqualsNode.target = numericFieldEqualsCondition.target;
                return numericFieldEqualsNode;
            }
            case ScanCondition.TypeId.NumericFieldInRange: {
                const numericFieldInRangeCondition  = condition as NumericFieldInRangeScanCondition;
                const numericFieldInRangeNode = new ScanFormula.NumericFieldInRangeNode();
                numericFieldInRangeNode.fieldId = numericFieldInRangeCondition.fieldId;
                numericFieldInRangeNode.min = numericFieldInRangeCondition.min;
                numericFieldInRangeNode.max = numericFieldInRangeCondition.max;
                return numericFieldInRangeNode;
            }
            case ScanCondition.TypeId.DateFieldEquals: {
                const dateFieldEqualsCondition  = condition as DateFieldEqualsScanCondition;
                const dateFieldEqualsNode = new ScanFormula.DateFieldEqualsNode();
                dateFieldEqualsNode.fieldId = dateFieldEqualsCondition.fieldId;
                dateFieldEqualsNode.target = SourceTzOffsetDateTime.createCopy(dateFieldEqualsCondition.target);
                return dateFieldEqualsNode;
            }
            case ScanCondition.TypeId.DateFieldInRange: {
                const dateFieldInRangeCondition  = condition as DateFieldInRangeScanCondition;
                const dateFieldInRangeNode = new ScanFormula.DateFieldInRangeNode();
                dateFieldInRangeNode.fieldId = dateFieldInRangeCondition.fieldId;
                dateFieldInRangeNode.min = SourceTzOffsetDateTime.newUndefinable(dateFieldInRangeCondition.min);
                dateFieldInRangeNode.max = SourceTzOffsetDateTime.newUndefinable(dateFieldInRangeCondition.max);
                return dateFieldInRangeNode;
            }
            case ScanCondition.TypeId.TextFieldContains: {
                const textFieldContainsCondition  = condition as TextFieldContainsScanCondition;
                const textFieldContainsNode = new ScanFormula.TextFieldContainsNode();
                textFieldContainsNode.fieldId = textFieldContainsCondition.fieldId;
                textFieldContainsNode.value = textFieldContainsCondition.value;
                textFieldContainsNode.asId = textFieldContainsCondition.asId;
                textFieldContainsNode.ignoreCase = textFieldContainsCondition.ignoreCase;
                return textFieldContainsNode;
            }
            case ScanCondition.TypeId.PriceSubFieldHasValue: {
                const priceSubFieldHasValueCondition  = condition as PriceSubFieldHasValueScanCondition;
                const priceSubFieldHasValueNode = new ScanFormula.PriceSubFieldHasValueNode();
                priceSubFieldHasValueNode.fieldId = priceSubFieldHasValueCondition.fieldId;
                priceSubFieldHasValueNode.subFieldId = priceSubFieldHasValueCondition.subFieldId;
                return priceSubFieldHasValueNode;
            }
            case ScanCondition.TypeId.PriceSubFieldEquals: {
                const priceSubFieldEqualsCondition  = condition as PriceSubFieldEqualsScanCondition;
                const priceSubFieldEqualsNode = new ScanFormula.PriceSubFieldEqualsNode();
                priceSubFieldEqualsNode.fieldId = priceSubFieldEqualsCondition.fieldId;
                priceSubFieldEqualsNode.subFieldId = priceSubFieldEqualsCondition.subFieldId;
                priceSubFieldEqualsNode.target = priceSubFieldEqualsCondition.target;
                return priceSubFieldEqualsNode;
            }
            case ScanCondition.TypeId.PriceSubFieldInRange: {
                const pricesubFieldInRangeCondition  = condition as PriceSubFieldInRangeScanCondition;
                const pricesubFieldInRangeNode = new ScanFormula.PriceSubFieldInRangeNode();
                pricesubFieldInRangeNode.fieldId = pricesubFieldInRangeCondition.fieldId;
                pricesubFieldInRangeNode.subFieldId = pricesubFieldInRangeCondition.subFieldId;
                pricesubFieldInRangeNode.min = pricesubFieldInRangeCondition.min;
                pricesubFieldInRangeNode.max = pricesubFieldInRangeCondition.max;
                return pricesubFieldInRangeNode;
            }
            case ScanCondition.TypeId.DateSubFieldHasValue: {
                const dateSubFieldHasValueCondition  = condition as DateSubFieldHasValueScanCondition;
                const dateSubFieldHasValueNode = new ScanFormula.DateSubFieldHasValueNode();
                dateSubFieldHasValueNode.fieldId = dateSubFieldHasValueCondition.fieldId;
                dateSubFieldHasValueNode.subFieldId = dateSubFieldHasValueCondition.subFieldId;
                return dateSubFieldHasValueNode;
            }
            case ScanCondition.TypeId.DateSubFieldEquals: {
                const dateSubFieldEqualsCondition  = condition as DateSubFieldEqualsScanCondition;
                const dateSubFieldEqualsNode = new ScanFormula.DateSubFieldEqualsNode();
                dateSubFieldEqualsNode.fieldId = dateSubFieldEqualsCondition.fieldId;
                dateSubFieldEqualsNode.subFieldId = dateSubFieldEqualsCondition.subFieldId;
                dateSubFieldEqualsNode.target = SourceTzOffsetDateTime.createCopy(dateSubFieldEqualsCondition.target);
                return dateSubFieldEqualsNode;
            }
            case ScanCondition.TypeId.DateSubFieldInRange: {
                const datesubFieldInRangeCondition  = condition as DateSubFieldInRangeScanCondition;
                const datesubFieldInRangeNode = new ScanFormula.DateSubFieldInRangeNode();
                datesubFieldInRangeNode.fieldId = datesubFieldInRangeCondition.fieldId;
                datesubFieldInRangeNode.subFieldId = datesubFieldInRangeCondition.subFieldId;
                datesubFieldInRangeNode.min = SourceTzOffsetDateTime.newUndefinable(datesubFieldInRangeCondition.min);
                datesubFieldInRangeNode.max = SourceTzOffsetDateTime.newUndefinable(datesubFieldInRangeCondition.max);
                return datesubFieldInRangeNode;
            }
            case ScanCondition.TypeId.AltCodeSubFieldHasValue: {
                const altcodeSubFieldHasValueCondition  = condition as AltCodeSubFieldHasValueScanCondition;
                const altcodeSubFieldHasValueNode = new ScanFormula.AltCodeSubFieldHasValueNode();
                altcodeSubFieldHasValueNode.fieldId = altcodeSubFieldHasValueCondition.fieldId;
                altcodeSubFieldHasValueNode.subFieldId = altcodeSubFieldHasValueCondition.subFieldId;
                return altcodeSubFieldHasValueNode;
            }
            case ScanCondition.TypeId.AltCodeSubFieldContains: {
                const altCodeSubFieldContainsCondition  = condition as AltCodeSubFieldContainsScanCondition;
                const altCodeSubFieldContainsNode = new ScanFormula.AltCodeSubFieldContainsNode();
                altCodeSubFieldContainsNode.fieldId = altCodeSubFieldContainsCondition.fieldId;
                altCodeSubFieldContainsNode.subFieldId = altCodeSubFieldContainsCondition.subFieldId;
                altCodeSubFieldContainsNode.value = altCodeSubFieldContainsCondition.value;
                altCodeSubFieldContainsNode.asId = altCodeSubFieldContainsCondition.asId;
                altCodeSubFieldContainsNode.ignoreCase = altCodeSubFieldContainsCondition.ignoreCase;
                return altCodeSubFieldContainsNode;
            }
            case ScanCondition.TypeId.AttributeSubFieldHasValue: {
                const attributeSubFieldHasValueCondition  = condition as AttributeSubFieldHasValueScanCondition;
                const attributeSubFieldHasValueNode = new ScanFormula.AttributeSubFieldHasValueNode();
                attributeSubFieldHasValueNode.fieldId = attributeSubFieldHasValueCondition.fieldId;
                attributeSubFieldHasValueNode.subFieldId = attributeSubFieldHasValueCondition.subFieldId;
                return attributeSubFieldHasValueNode;
            }
            case ScanCondition.TypeId.AttributeSubFieldContains: {
                const attributeSubFieldContainsCondition  = condition as AttributeSubFieldContainsScanCondition;
                const attributeSubFieldContainsNode = new ScanFormula.AttributeSubFieldContainsNode();
                attributeSubFieldContainsNode.fieldId = attributeSubFieldContainsCondition.fieldId;
                attributeSubFieldContainsNode.subFieldId = attributeSubFieldContainsCondition.subFieldId;
                attributeSubFieldContainsNode.value = attributeSubFieldContainsCondition.value;
                attributeSubFieldContainsNode.asId = attributeSubFieldContainsCondition.asId;
                attributeSubFieldContainsNode.ignoreCase = attributeSubFieldContainsCondition.ignoreCase;
                return attributeSubFieldContainsNode;
            }
            default:
                throw new UnreachableCaseError('SCSCCBN10873', condition.typeId);
        }
    }

    function createNumericComparisonBooleanNode(condition: NumericComparisonScanCondition): ScanFormula.NumericComparisonBooleanNode {
        const result = createEmptyNumericComparisonBooleanNode(condition);
        result.leftOperand = createNumericComparisonBooleanNodeOperand(condition.leftOperand);
        result.rightOperand = createNumericComparisonBooleanNodeOperand(condition.rightOperand);
        return result;
    }

    function createEmptyNumericComparisonBooleanNode(condition: NumericComparisonScanCondition): ScanFormula.NumericComparisonBooleanNode {
        switch (condition.operationId) {
            case NumericComparisonScanCondition.OperationId.Equals: return new ScanFormula.NumericEqualsNode();
            case NumericComparisonScanCondition.OperationId.GreaterThan: return new ScanFormula.NumericGreaterThanNode();
            case NumericComparisonScanCondition.OperationId.GreaterThanOrEqual: return new ScanFormula.NumericGreaterThanOrEqualNode();
            case NumericComparisonScanCondition.OperationId.LessThan: return new ScanFormula.NumericLessThanNode();
            case NumericComparisonScanCondition.OperationId.LessThanOrEqual: return new ScanFormula.NumericLessThanOrEqualNode();
            default:
                throw new UnreachableCaseError('SCSCENCBN40812', condition.operationId);
        }
    }

    function createNumericComparisonBooleanNodeOperand(operand: NumericComparisonScanCondition.Operand): ScanFormula.NumericNode | number {
        switch (operand.typeId) {
            case NumericComparisonScanCondition.Operand.TypeId.Number: {
                const numberOperand = operand as NumericComparisonScanCondition.NumberOperand;
                return numberOperand.value;
            }
            case NumericComparisonScanCondition.Operand.TypeId.NumericFieldValueGet: {
                const numericFieldValueGetOperand = operand as NumericComparisonScanCondition.NumericFieldValueGetOperand;
                const node = new ScanFormula.NumericFieldValueGetNode();
                node.fieldId = numericFieldValueGetOperand.fieldId;
                return node;
            }
        }
    }
}

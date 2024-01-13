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
    IsScanCondition,
    NumericComparisonScanCondition,
    NumericFieldEqualsScanCondition,
    NumericFieldInRangeScanCondition,
    PriceSubFieldEqualsScanCondition,
    PriceSubFieldHasValueScanCondition,
    PriceSubFieldInRangeScanCondition,
    ScanCondition,
    ScanConditionFactory,
    TextFieldContainsScanCondition,
    TextFieldIncludesScanCondition
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
            conditionSet.loadError = { typeId: ScanConditionSetLoadErrorTypeId.ConditionsNodeTypeNotSupported, extra: conditionsBooleanNode.typeId.toString() };
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
            const createdOperandBooleanNode = createBooleanNodeForCondition(condition);
            if (createdOperandBooleanNode.requiresNot) {
                const notNode = new ScanFormula.NotNode();
                notNode.operand = createdOperandBooleanNode.node;
                operands[i] = notNode;
            } else {
                operands[i] = createdOperandBooleanNode.node;
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

    function createCondition(node: ScanFormula.BooleanNode, factory: ScanConditionFactory, not: boolean): Result<ScanCondition, ScanConditionSetLoadError> {
        switch (node.typeId) {
            case ScanFormula.NodeTypeId.Not: {
                const notNode = node as ScanFormula.NotNode;
                const createResult = createCondition(notNode.operand, factory, !not);
                if (createResult.isErr()) {
                    return createResult;
                } else {
                    const condition = createResult.value;
                    return new Ok(condition);
                }
            }
            case ScanFormula.NodeTypeId.Xor:
            case ScanFormula.NodeTypeId.And:
            case ScanFormula.NodeTypeId.Or:
                return new Err({ typeId: ScanConditionSetLoadErrorTypeId.ConditionNodeTypeIsNotSupported, extra: node.typeId.toString() })
            case ScanFormula.NodeTypeId.NumericEquals: {
                const numericComparisonBooleanNode = node as ScanFormula.NumericComparisonBooleanNode;
                const operationId = not ? NumericComparisonScanCondition.OperationId.NotEquals : NumericComparisonScanCondition.OperationId.Equals;
                return factory.createNumericComparison(numericComparisonBooleanNode, operationId);
            }
            case ScanFormula.NodeTypeId.NumericGreaterThan: {
                const numericComparisonBooleanNode = node as ScanFormula.NumericComparisonBooleanNode;
                const operationId = not ? NumericComparisonScanCondition.OperationId.LessThanOrEqual : NumericComparisonScanCondition.OperationId.GreaterThan;
                return factory.createNumericComparison(numericComparisonBooleanNode, operationId);
            }
            case ScanFormula.NodeTypeId.NumericGreaterThanOrEqual: {
                const numericComparisonBooleanNode = node as ScanFormula.NumericComparisonBooleanNode;
                const operationId = not ? NumericComparisonScanCondition.OperationId.LessThan : NumericComparisonScanCondition.OperationId.GreaterThanOrEqual;
                return factory.createNumericComparison(numericComparisonBooleanNode, operationId);
            }
            case ScanFormula.NodeTypeId.NumericLessThan: {
                const numericComparisonBooleanNode = node as ScanFormula.NumericComparisonBooleanNode;
                const operationId = not ? NumericComparisonScanCondition.OperationId.GreaterThanOrEqual : NumericComparisonScanCondition.OperationId.LessThan;
                return factory.createNumericComparison(numericComparisonBooleanNode, operationId);
            }
            case ScanFormula.NodeTypeId.NumericLessThanOrEqual: {
                const numericComparisonBooleanNode = node as ScanFormula.NumericComparisonBooleanNode;
                const operationId = not ? NumericComparisonScanCondition.OperationId.GreaterThan : NumericComparisonScanCondition.OperationId.LessThanOrEqual;
                return factory.createNumericComparison(numericComparisonBooleanNode, operationId);
            }
            case ScanFormula.NodeTypeId.All:
                if (not) {
                    return new Err({ typeId: ScanConditionSetLoadErrorTypeId.NotOfAllNotSupported, extra: '' })
                } else {
                    return factory.createAll(node as ScanFormula.AllNode);
                }
            case ScanFormula.NodeTypeId.None:
                if (not) {
                    return new Err({ typeId: ScanConditionSetLoadErrorTypeId.NotOfNoneNotSupported, extra: '' })
                } else {
                    return factory.createNone(node as ScanFormula.NoneNode);
                }
            case ScanFormula.NodeTypeId.Is: {
                const isNode = node as ScanFormula.IsNode;
                return factory.createIs(isNode, not);
            }
            case ScanFormula.NodeTypeId.FieldHasValue: {
                const fieldHasValueNode = node as ScanFormula.FieldHasValueNode;
                return factory.createFieldHasValue(fieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.BooleanFieldEquals: {
                const booleanFieldEqualsNode = node as ScanFormula.BooleanFieldEqualsNode;
                return factory.createBooleanFieldEquals(booleanFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.NumericFieldEquals: {
                const numericFieldEqualsNode = node as ScanFormula.NumericFieldEqualsNode;
                return factory.createNumericFieldEquals(numericFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.NumericFieldInRange: {
                const numericFieldInRangeNode = node as ScanFormula.NumericFieldInRangeNode;
                return factory.createNumericFieldInRange(numericFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.DateFieldEquals: {
                const dateFieldEqualsNode = node as ScanFormula.DateFieldEqualsNode;
                return factory.createDateFieldEquals(dateFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.DateFieldInRange: {
                const dateFieldInRangeNode = node as ScanFormula.DateFieldInRangeNode;
                return factory.createDateFieldInRange(dateFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.TextFieldIncludes: {
                const textFieldIncludesNode = node as ScanFormula.TextFieldIncludesNode;
                return factory.createTextFieldIncludes(textFieldIncludesNode, not);
            }
            case ScanFormula.NodeTypeId.TextFieldContains: {
                const textFieldContainsNode = node as ScanFormula.TextFieldContainsNode;
                return factory.createTextFieldContains(textFieldContainsNode, not);
            }
            case ScanFormula.NodeTypeId.PriceSubFieldHasValue: {
                const priceSubFieldHasValueNode = node as ScanFormula.PriceSubFieldHasValueNode;
                return factory.createPriceSubFieldHasValue(priceSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.PriceSubFieldEquals: {
                const priceSubFieldEqualsNode = node as ScanFormula.PriceSubFieldEqualsNode;
                return factory.createPriceSubFieldEquals(priceSubFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.PriceSubFieldInRange: {
                const priceSubFieldInRangeNode = node as ScanFormula.PriceSubFieldInRangeNode;
                return factory.createPriceSubFieldInRange(priceSubFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.DateSubFieldHasValue: {
                const dateSubFieldHasValueNode = node as ScanFormula.DateSubFieldHasValueNode;
                return factory.createDateSubFieldHasValue(dateSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.DateSubFieldEquals: {
                const dateSubFieldEqualsNode = node as ScanFormula.DateSubFieldEqualsNode;
                return factory.createDateSubFieldEquals(dateSubFieldEqualsNode, not);
            }
            case ScanFormula.NodeTypeId.DateSubFieldInRange: {
                const dateSubFieldInRangeNode = node as ScanFormula.DateSubFieldInRangeNode;
                return factory.createDateSubFieldInRange(dateSubFieldInRangeNode, not);
            }
            case ScanFormula.NodeTypeId.AltCodeSubFieldHasValue: {
                const altCodeSubFieldHasValueNode = node as ScanFormula.AltCodeSubFieldHasValueNode;
                return factory.createAltCodeSubFieldHasValue(altCodeSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.AltCodeSubFieldContains: {
                const altCodeSubFieldContainsNode = node as ScanFormula.AltCodeSubFieldContainsNode;
                return factory.createAltCodeSubFieldContains(altCodeSubFieldContainsNode, not);
            }
            case ScanFormula.NodeTypeId.AttributeSubFieldHasValue: {
                const attributeSubFieldHasValueNode = node as ScanFormula.AttributeSubFieldHasValueNode;
                return factory.createAttributeSubFieldHasValue(attributeSubFieldHasValueNode, not);
            }
            case ScanFormula.NodeTypeId.AttributeSubFieldContains: {
                const attributeSubFieldContainsNode = node as ScanFormula.AttributeSubFieldContainsNode;
                return factory.createAttributeSubFieldContains(attributeSubFieldContainsNode, not);
            }
            default:
                throw new UnreachableCaseError('SCSCC44991', node.typeId);
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

    interface CreatedBooleanNode {
        node: ScanFormula.BooleanNode;
        requiresNot: boolean;
    }

    function createBooleanNodeForCondition(condition: ScanCondition): CreatedBooleanNode {
        switch (condition.typeId) {
            case ScanCondition.TypeId.NumericComparison: {
                const numericComparisonCondition  = condition as NumericComparisonScanCondition;
                return createNumericComparisonBooleanNode(numericComparisonCondition);
            }
            case ScanCondition.TypeId.All: {
                return {
                    node: new ScanFormula.AllNode(),
                    requiresNot: false,
                };
            }
            case ScanCondition.TypeId.None: {
                return {
                    node: new ScanFormula.NoneNode(),
                    requiresNot: false,
                };
            }
            case ScanCondition.TypeId.Is: {
                const isCondition  = condition as IsScanCondition;
                const isNode = new ScanFormula.IsNode();
                isNode.categoryId = isCondition.categoryId;
                isNode.trueFalse = !isCondition.not;
                return {
                    node: isNode,
                    requiresNot: false,
                };
            }
            case ScanCondition.TypeId.FieldHasValue: {
                const fieldHasValueCondition  = condition as FieldHasValueScanCondition;
                const fieldHasValueNode = new ScanFormula.FieldHasValueNode();
                fieldHasValueNode.fieldId = fieldHasValueCondition.fieldId;
                return {
                    node: fieldHasValueNode,
                    requiresNot: fieldHasValueCondition.not,
                };
            }
            case ScanCondition.TypeId.BooleanFieldEquals: {
                const booleanFieldEqualsCondition  = condition as BooleanFieldEqualsScanCondition;
                const booleanFieldEqualsNode = new ScanFormula.BooleanFieldEqualsNode();
                booleanFieldEqualsNode.fieldId = booleanFieldEqualsCondition.fieldId;
                booleanFieldEqualsNode.target = booleanFieldEqualsCondition.target;
                return {
                    node: booleanFieldEqualsNode,
                    requiresNot: booleanFieldEqualsCondition.not,
                };
            }
            case ScanCondition.TypeId.NumericFieldEquals: {
                const numericFieldEqualsCondition  = condition as NumericFieldEqualsScanCondition;
                const numericFieldEqualsNode = new ScanFormula.NumericFieldEqualsNode();
                numericFieldEqualsNode.fieldId = numericFieldEqualsCondition.fieldId;
                numericFieldEqualsNode.target = numericFieldEqualsCondition.target;
                return {
                    node: numericFieldEqualsNode,
                    requiresNot: numericFieldEqualsCondition.not,
                };
            }
            case ScanCondition.TypeId.NumericFieldInRange: {
                const numericFieldInRangeCondition  = condition as NumericFieldInRangeScanCondition;
                const numericFieldInRangeNode = new ScanFormula.NumericFieldInRangeNode();
                numericFieldInRangeNode.fieldId = numericFieldInRangeCondition.fieldId;
                numericFieldInRangeNode.min = numericFieldInRangeCondition.min;
                numericFieldInRangeNode.max = numericFieldInRangeCondition.max;
                return {
                    node: numericFieldInRangeNode,
                    requiresNot: numericFieldInRangeCondition.not,
                };
            }
            case ScanCondition.TypeId.DateFieldEquals: {
                const dateFieldEqualsCondition  = condition as DateFieldEqualsScanCondition;
                const dateFieldEqualsNode = new ScanFormula.DateFieldEqualsNode();
                dateFieldEqualsNode.fieldId = dateFieldEqualsCondition.fieldId;
                dateFieldEqualsNode.target = SourceTzOffsetDateTime.createCopy(dateFieldEqualsCondition.target);
                return {
                    node: dateFieldEqualsNode,
                    requiresNot: dateFieldEqualsCondition.not,
                };
            }
            case ScanCondition.TypeId.DateFieldInRange: {
                const dateFieldInRangeCondition  = condition as DateFieldInRangeScanCondition;
                const dateFieldInRangeNode = new ScanFormula.DateFieldInRangeNode();
                dateFieldInRangeNode.fieldId = dateFieldInRangeCondition.fieldId;
                dateFieldInRangeNode.min = SourceTzOffsetDateTime.newUndefinable(dateFieldInRangeCondition.min);
                dateFieldInRangeNode.max = SourceTzOffsetDateTime.newUndefinable(dateFieldInRangeCondition.max);
                return {
                    node: dateFieldInRangeNode,
                    requiresNot: dateFieldInRangeCondition.not,
                };
            }
            case ScanCondition.TypeId.TextFieldIncludes: {
                const textFieldIncludesCondition  = condition as TextFieldIncludesScanCondition;
                const textFieldIncludesNode = new ScanFormula.TextFieldIncludesNode();
                textFieldIncludesNode.fieldId = textFieldIncludesCondition.fieldId;
                textFieldIncludesNode.values = textFieldIncludesCondition.values.slice();
                return {
                    node: textFieldIncludesNode,
                    requiresNot: textFieldIncludesCondition.not,
                };
            }
            case ScanCondition.TypeId.TextFieldContains: {
                const textFieldContainsCondition  = condition as TextFieldContainsScanCondition;
                const textFieldContainsNode = new ScanFormula.TextFieldContainsNode();
                textFieldContainsNode.fieldId = textFieldContainsCondition.fieldId;
                textFieldContainsNode.value = textFieldContainsCondition.value;
                textFieldContainsNode.asId = textFieldContainsCondition.asId;
                textFieldContainsNode.ignoreCase = textFieldContainsCondition.ignoreCase;
                return {
                    node: textFieldContainsNode,
                    requiresNot: textFieldContainsCondition.not,
                };
            }
            case ScanCondition.TypeId.PriceSubFieldHasValue: {
                const priceSubFieldHasValueCondition  = condition as PriceSubFieldHasValueScanCondition;
                const priceSubFieldHasValueNode = new ScanFormula.PriceSubFieldHasValueNode();
                priceSubFieldHasValueNode.fieldId = priceSubFieldHasValueCondition.fieldId;
                priceSubFieldHasValueNode.subFieldId = priceSubFieldHasValueCondition.subFieldId;
                return {
                    node: priceSubFieldHasValueNode,
                    requiresNot: priceSubFieldHasValueCondition.not,
                };
            }
            case ScanCondition.TypeId.PriceSubFieldEquals: {
                const priceSubFieldEqualsCondition  = condition as PriceSubFieldEqualsScanCondition;
                const priceSubFieldEqualsNode = new ScanFormula.PriceSubFieldEqualsNode();
                priceSubFieldEqualsNode.fieldId = priceSubFieldEqualsCondition.fieldId;
                priceSubFieldEqualsNode.subFieldId = priceSubFieldEqualsCondition.subFieldId;
                priceSubFieldEqualsNode.target = priceSubFieldEqualsCondition.target;
                return {
                    node: priceSubFieldEqualsNode,
                    requiresNot: priceSubFieldEqualsCondition.not,
                };
            }
            case ScanCondition.TypeId.PriceSubFieldInRange: {
                const pricesubFieldInRangeCondition  = condition as PriceSubFieldInRangeScanCondition;
                const pricesubFieldInRangeNode = new ScanFormula.PriceSubFieldInRangeNode();
                pricesubFieldInRangeNode.fieldId = pricesubFieldInRangeCondition.fieldId;
                pricesubFieldInRangeNode.subFieldId = pricesubFieldInRangeCondition.subFieldId;
                pricesubFieldInRangeNode.min = pricesubFieldInRangeCondition.min;
                pricesubFieldInRangeNode.max = pricesubFieldInRangeCondition.max;
                return {
                    node: pricesubFieldInRangeNode,
                    requiresNot: pricesubFieldInRangeCondition.not,
                };
            }
            case ScanCondition.TypeId.DateSubFieldHasValue: {
                const dateSubFieldHasValueCondition  = condition as DateSubFieldHasValueScanCondition;
                const dateSubFieldHasValueNode = new ScanFormula.DateSubFieldHasValueNode();
                dateSubFieldHasValueNode.fieldId = dateSubFieldHasValueCondition.fieldId;
                dateSubFieldHasValueNode.subFieldId = dateSubFieldHasValueCondition.subFieldId;
                return {
                    node: dateSubFieldHasValueNode,
                    requiresNot: dateSubFieldHasValueCondition.not,
                };
            }
            case ScanCondition.TypeId.DateSubFieldEquals: {
                const dateSubFieldEqualsCondition  = condition as DateSubFieldEqualsScanCondition;
                const dateSubFieldEqualsNode = new ScanFormula.DateSubFieldEqualsNode();
                dateSubFieldEqualsNode.fieldId = dateSubFieldEqualsCondition.fieldId;
                dateSubFieldEqualsNode.subFieldId = dateSubFieldEqualsCondition.subFieldId;
                dateSubFieldEqualsNode.target = SourceTzOffsetDateTime.createCopy(dateSubFieldEqualsCondition.target);
                return {
                    node: dateSubFieldEqualsNode,
                    requiresNot: dateSubFieldEqualsCondition.not,
                };
            }
            case ScanCondition.TypeId.DateSubFieldInRange: {
                const datesubFieldInRangeCondition  = condition as DateSubFieldInRangeScanCondition;
                const datesubFieldInRangeNode = new ScanFormula.DateSubFieldInRangeNode();
                datesubFieldInRangeNode.fieldId = datesubFieldInRangeCondition.fieldId;
                datesubFieldInRangeNode.subFieldId = datesubFieldInRangeCondition.subFieldId;
                datesubFieldInRangeNode.min = SourceTzOffsetDateTime.newUndefinable(datesubFieldInRangeCondition.min);
                datesubFieldInRangeNode.max = SourceTzOffsetDateTime.newUndefinable(datesubFieldInRangeCondition.max);
                return {
                    node: datesubFieldInRangeNode,
                    requiresNot: datesubFieldInRangeCondition.not,
                };
            }
            case ScanCondition.TypeId.AltCodeSubFieldHasValue: {
                const altcodeSubFieldHasValueCondition  = condition as AltCodeSubFieldHasValueScanCondition;
                const altcodeSubFieldHasValueNode = new ScanFormula.AltCodeSubFieldHasValueNode();
                altcodeSubFieldHasValueNode.fieldId = altcodeSubFieldHasValueCondition.fieldId;
                altcodeSubFieldHasValueNode.subFieldId = altcodeSubFieldHasValueCondition.subFieldId;
                return {
                    node: altcodeSubFieldHasValueNode,
                    requiresNot: altcodeSubFieldHasValueCondition.not,
                };
            }
            case ScanCondition.TypeId.AltCodeSubFieldContains: {
                const altCodeSubFieldContainsCondition  = condition as AltCodeSubFieldContainsScanCondition;
                const altCodeSubFieldContainsNode = new ScanFormula.AltCodeSubFieldContainsNode();
                altCodeSubFieldContainsNode.fieldId = altCodeSubFieldContainsCondition.fieldId;
                altCodeSubFieldContainsNode.subFieldId = altCodeSubFieldContainsCondition.subFieldId;
                altCodeSubFieldContainsNode.value = altCodeSubFieldContainsCondition.value;
                altCodeSubFieldContainsNode.asId = altCodeSubFieldContainsCondition.asId;
                altCodeSubFieldContainsNode.ignoreCase = altCodeSubFieldContainsCondition.ignoreCase;
                return {
                    node: altCodeSubFieldContainsNode,
                    requiresNot: altCodeSubFieldContainsCondition.not,
                };
            }
            case ScanCondition.TypeId.AttributeSubFieldHasValue: {
                const attributeSubFieldHasValueCondition  = condition as AttributeSubFieldHasValueScanCondition;
                const attributeSubFieldHasValueNode = new ScanFormula.AttributeSubFieldHasValueNode();
                attributeSubFieldHasValueNode.fieldId = attributeSubFieldHasValueCondition.fieldId;
                attributeSubFieldHasValueNode.subFieldId = attributeSubFieldHasValueCondition.subFieldId;
                return {
                    node: attributeSubFieldHasValueNode,
                    requiresNot: attributeSubFieldHasValueCondition.not,
                };
            }
            case ScanCondition.TypeId.AttributeSubFieldContains: {
                const attributeSubFieldContainsCondition  = condition as AttributeSubFieldContainsScanCondition;
                const attributeSubFieldContainsNode = new ScanFormula.AttributeSubFieldContainsNode();
                attributeSubFieldContainsNode.fieldId = attributeSubFieldContainsCondition.fieldId;
                attributeSubFieldContainsNode.subFieldId = attributeSubFieldContainsCondition.subFieldId;
                attributeSubFieldContainsNode.value = attributeSubFieldContainsCondition.value;
                attributeSubFieldContainsNode.asId = attributeSubFieldContainsCondition.asId;
                attributeSubFieldContainsNode.ignoreCase = attributeSubFieldContainsCondition.ignoreCase;
                return {
                    node: attributeSubFieldContainsNode,
                    requiresNot: attributeSubFieldContainsCondition.not,
                };
            }
            default:
                throw new UnreachableCaseError('SCSCCBN10873', condition.typeId);
        }
    }

    interface CreatedNumericComparisonBooleanNode {
        node: ScanFormula.NumericComparisonBooleanNode;
        requiresNot: boolean;
    }


    function createNumericComparisonBooleanNode(condition: NumericComparisonScanCondition): CreatedNumericComparisonBooleanNode {
        const resultLeftOperand = new ScanFormula.NumericFieldValueGetNode();
        resultLeftOperand.fieldId = condition.leftOperand.fieldId;

        let resultRightOperand: ScanFormula.NumericFieldValueGetNode | number;
        const conditionRightOperand = condition.rightOperand;
        switch (conditionRightOperand.typeId) {
            case NumericComparisonScanCondition.TypedOperand.TypeId.Number: {
                resultRightOperand = (conditionRightOperand as NumericComparisonScanCondition.NumberTypedOperand).value;
                break;
            }
            case NumericComparisonScanCondition.TypedOperand.TypeId.Field: {
                resultRightOperand = new ScanFormula.NumericFieldValueGetNode();
                resultRightOperand.fieldId = (conditionRightOperand as NumericComparisonScanCondition.FieldTypedOperand).fieldId;
                break;
            }
            default:
                throw new UnreachableCaseError('SCSCNCBN34316', conditionRightOperand.typeId);
        }

        const result = createEmptyNumericComparisonBooleanNode(condition);
        const resultNode = result.node;
        resultNode.leftOperand = resultLeftOperand;
        resultNode.rightOperand = resultRightOperand;
        return result;
    }

    function createEmptyNumericComparisonBooleanNode(condition: NumericComparisonScanCondition): CreatedNumericComparisonBooleanNode {
        switch (condition.operationId) {
            case NumericComparisonScanCondition.OperationId.Equals: return {
                node: new ScanFormula.NumericEqualsNode(),
                requiresNot: false,
            }
            case NumericComparisonScanCondition.OperationId.NotEquals: return {
                node: new ScanFormula.NumericEqualsNode(),
                requiresNot: true,
            }
            case NumericComparisonScanCondition.OperationId.GreaterThan: return {
                node: new ScanFormula.NumericGreaterThanNode(),
                requiresNot: false,
            }
            case NumericComparisonScanCondition.OperationId.GreaterThanOrEqual: return {
                node: new ScanFormula.NumericGreaterThanOrEqualNode(),
                requiresNot: false,
            }
            case NumericComparisonScanCondition.OperationId.LessThan: return {
                node: new ScanFormula.NumericLessThanNode(),
                requiresNot: false,
            }
            case NumericComparisonScanCondition.OperationId.LessThanOrEqual: return {
                node: new ScanFormula.NumericLessThanOrEqualNode(),
                requiresNot: false,
            }
            default:
                throw new UnreachableCaseError('SCSCENCBN40812', condition.operationId);
        }
    }
}

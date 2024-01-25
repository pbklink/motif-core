/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, Integer, Ok, Result, SourceTzOffsetDateTime, UnreachableCaseError } from '../../sys/sys-internal-api';
import { ScanFormula } from '../formula/internal-api';
import { ScanFieldSetLoadError, ScanFieldSetLoadErrorTypeId } from './common/internal-api';
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
    ScanConditionFactory,
    ScanField,
    ScanFieldConditionFactory,
    ScanFieldFactory,
    TextFieldContainsScanCondition,
    TextFieldIncludesScanCondition
} from './field/internal-api';

export interface ScanFieldSet {
    readonly conditionFactory: ScanFieldConditionFactory;
    readonly fieldFactory: ScanFieldFactory;

    fields: ScanFieldSet.Fields;

    loadError: ScanFieldSetLoadError | undefined;

    assign(value: ScanFieldSet): void;
}

export namespace ScanFieldSet {
    // Implementable by ComparableList
    export interface Fields {
        readonly count: Integer;
        capacity: Integer;

        getAt(index: Integer): ScanField;
        clear(): void;
        add(field: ScanField): Integer;
        remove(field: ScanField): void;
    }

    /**
     * @param fieldSet - ConditionSet to be loaded.  All fields except setOperandTypeId will be cleared prior to loading.
     * conditionSet.setOperandTypeId can be optionally defined. If conditionSet.setOperandTypeId is defined and the loaded setOperandTypeId is different, then a load error is flagged.
     */
    export function tryLoadFromFormulaNode(fieldSet: ScanFieldSet, rootFormulaBooleanNode: ScanFormula.BooleanNode): boolean {
        const fieldNodes = ScanFormula.AndNode.is(rootFormulaBooleanNode) ? rootFormulaBooleanNode.operands : [rootFormulaBooleanNode];
        switch (fieldSetOperatorNode.typeId) {
            case ScanFormula.NodeTypeId.And: {
                fieldSet.setOperationId = BooleanOperationId.And;
                const andNode = fieldSetOperatorNode as ScanFormula.AndNode;
                operandNodes = andNode.operands;
                break;
            }
            case ScanFormula.NodeTypeId.Or: {
                fieldSet.setOperationId = BooleanOperationId.Or;
                const orNode = fieldSetOperatorNode as ScanFormula.OrNode;
                operandNodes = orNode.operands;
                break;
            }
            case ScanFormula.NodeTypeId.Xor: {
                fieldSet.loadError = { typeId: ScanFieldSetLoadErrorTypeId.XorSetOperationNotSupported, extra: '' };
                break;
            }
            default:
                fieldSet.setOperationId = ScanFieldSet.defaultSetBooleanOperationId;
                operandNodes = [fieldSetOperatorNode];
        }

        if (operandNodes === undefined) {
            // conditionSet.loadError should already be set
            return false;
        } else {
            fieldSet.loadError = undefined;

            const count = operandNodes.length;
            const conditions = fieldSet.conditions;
            const fields = fieldSet.fields;
            conditions.clear();
            fields.clear();
            conditions.capacity = count;
            fields.capacity = count;
            if (count === 0) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (fieldSet.setOperandTypeId === undefined) {
                    fieldSet.setOperandTypeId = defaultSetOperandTypeId;
                }
                return true;
            } else {
                // If using ConditionSet boolean operation is on fields, then first field must specify its `and` or `or` operation even if the first field only has one condition

                const firstOperandNode = operandNodes[0];
                const firstOperandNodeTypeId = firstOperandNode.typeId;
                if (firstOperandNodeTypeId !== ScanFormula.NodeTypeId.And && firstOperandNodeTypeId !== ScanFormula.NodeTypeId.Or) {
                    // Is not an And or Or so we must be working on conditions.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (fieldSet.setOperandTypeId === undefined) {
                        fieldSet.setOperandTypeId = SetOperandTypeId.Condition;
                    } else {
                        if (fieldSet.setOperandTypeId !== SetOperandTypeId.Condition) {
                            fieldSet.loadError = { typeId: ScanFieldSetLoadErrorTypeId.UnexpectedConditionSetOperandTypeId, extra: firstOperandNodeTypeId.toString() };
                            return false;
                        }
                    }
                    return loadConditions(fieldSet, operandNodes);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (fieldSet.setOperandTypeId === undefined) {
                        fieldSet.setOperandTypeId = SetOperandTypeId.Field;
                    } else {
                        if (fieldSet.setOperandTypeId !== SetOperandTypeId.Field) {
                            fieldSet.loadError = { typeId: ScanFieldSetLoadErrorTypeId.UnexpectedFieldSetOperandTypeId, extra: firstOperandNodeTypeId.toString() };
                            return false;
                        }
                    }
                    return loadFields(fieldSet, operandNodes);
                }
            }
        }
    }

    export function createFormulaNode(fieldSet: ScanFieldSet): ScanFormula.BooleanNode {
        let setOperands: ScanFormula.BooleanNode[];
        switch (fieldSet.setOperandTypeId) {
            case SetOperandTypeId.Condition:
                setOperands = createConditionFormulaNodes(fieldSet);
                break;
            case SetOperandTypeId.Field:
                setOperands = createFieldFormulaNodes(fieldSet);
                break;
            default:
                throw new UnreachableCaseError('SCSCFNTI40789', fieldSet.setOperandTypeId);
        }

        const setOperandsCount = setOperands.length;
        if (setOperandsCount === 0) {
            return new ScanFormula.AndNode();
        } else {
            let fieldsOrConditionsBooleanNode: ScanFormula.BooleanNode;
            switch (fieldSet.setOperationId) {
                case BooleanOperationId.Or: {
                    const orNode = new ScanFormula.OrNode();
                    orNode.operands = setOperands;
                    fieldsOrConditionsBooleanNode = orNode;
                    break;
                }

                case BooleanOperationId.And: {// defaultSetBooleanOperationId
                    if (setOperands.length === 1) {
                        fieldsOrConditionsBooleanNode = setOperands[0];
                    } else {
                        const andNode = new ScanFormula.AndNode();
                        andNode.operands = setOperands;
                        fieldsOrConditionsBooleanNode = andNode;
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('SCSCFN40789I', fieldSet.setOperationId);
            }

            if (fieldSet.notSetOperation) {
                const notNode = new ScanFormula.NotNode();
                notNode.operand = fieldsOrConditionsBooleanNode;
                return notNode;
            } else {
                return fieldsOrConditionsBooleanNode;
            }
        }
    }

    export function isEqual(left: ScanFieldSet, right: ScanFieldSet) {
        const leftFields = left.fields;
        const leftFieldCount = leftFields.count;
        const rightFields = right.fields;
        const rightFieldCount = rightFields.count;
        if (leftFieldCount !== rightFieldCount) {
            return false;
        } else {
            for (let i = 0; i < leftFieldCount; i++) {
                const leftField = leftFields.getAt(i);
                const rightField = rightFields.getAt(i);
                if (!ScanField.isEqual(leftField, rightField)) {
                    return false;
                }
            }

            return true;
        }
    }

    // tryLoadConditionSetFromFormulaNode private functions

    function loadConditions(conditionSet: ScanFieldSet, nodes: ScanFormula.BooleanNode[]) {
        const nodeCount = nodes.length;
        for (let i = 0; i < nodeCount; i++) {
            const operandNode = nodes[i];
            if (!loadCondition(conditionSet, operandNode, undefined)) {
                return false;
            }
        }
        return true;
    }

    function loadCondition(conditionSet: ScanFieldSet, node: ScanFormula.BooleanNode, requiredFieldBooleanOperationId: BooleanOperationId | undefined): boolean {
        const createConditionResult = createCondition(node, conditionSet.conditionFactory, false);

        if (createConditionResult.isErr()) {
            conditionSet.loadError = createConditionResult.error;
            return false;
        } else {
            const condition = createConditionResult.value;
            conditionSet.conditions.add(condition);

            const fieldId = condition.fieldId;
            if (fieldId !== undefined) {
                if (!addFieldUniquely(conditionSet, fieldId, requiredFieldBooleanOperationId)) {
                    return false;
                }
            }

            return true;
        }
    }

    function loadFields(conditionSet: ScanFieldSet, nodes: ScanFormula.BooleanNode[]) {
        const count = nodes.length;

        for (let i = 0; i < count; i++) {
            const node = nodes[i];
            if (!loadField(conditionSet, node)) {
                return false;
            }
        }
        return true;
    }

    export function loadField(conditionSet: ScanFieldSet, node: ScanFormula.BooleanNode): boolean {
        let operationId: BooleanOperationId | undefined;
        let operandNodes: ScanFormula.BooleanNode[] | undefined;
        switch (node.typeId) {
            case ScanFormula.NodeTypeId.And: {
                operationId = BooleanOperationId.And;
                const andNode = node as ScanFormula.AndNode;
                operandNodes = andNode.operands;
                break;
            }
            case ScanFormula.NodeTypeId.Or: {
                operationId = BooleanOperationId.Or;
                const orNode = node as ScanFormula.OrNode;
                operandNodes = orNode.operands;
                break;
            }
            case ScanFormula.NodeTypeId.Xor: {
                conditionSet.loadError = { typeId: ScanFieldSetLoadErrorTypeId.XorFieldBooleanOperationNotSupported, extra: '' };
                break;
            }
            default:
                operationId = BooleanOperationId.And;
                operandNodes = [node];
        }

        if (operationId === undefined || operandNodes === undefined) {
            // conditionSet.loadError should already be set
            return false;
        } else {
            const operandCount = operandNodes.length;
            if (operandCount === 0) {
                // no conditions - ignore
                return true;
            } else {
                for (let i = 0; i < operandCount; i++) {
                    const operandNode = operandNodes[i];
                    if (!loadCondition(conditionSet, operandNode, operationId)) {
                        return false;
                    }
                }
                return true;
            }
        }
    }

    function createCondition(node: ScanFormula.BooleanNode, factory: ScanConditionFactory, not: boolean): Result<ScanField, ScanFieldSetLoadError> {
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
                return new Err({ typeId: ScanFieldSetLoadErrorTypeId.ConditionNodeTypeIsNotSupported, extra: node.typeId.toString() })
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
                    return new Err({ typeId: ScanFieldSetLoadErrorTypeId.NotOfAllNotSupported, extra: '' })
                } else {
                    return factory.createAll(node as ScanFormula.AllNode);
                }
            case ScanFormula.NodeTypeId.None:
                if (not) {
                    return new Err({ typeId: ScanFieldSetLoadErrorTypeId.NotOfNoneNotSupported, extra: '' })
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
            case ScanFormula.NodeTypeId.EnumFieldIncludes: {
                const textFieldIncludesNode = node as ScanFormula.TypedOverlapsFieldNode;
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

    function addFieldUniquely(conditionSet: ScanFieldSet, fieldId: ScanFormula.FieldId, requiredBooleanOperationId: BooleanOperationId | undefined) {
        const fields = conditionSet.fields;
        const fieldCount = fields.count;
        for (let i = 0; i < fieldCount; i++) {
            const field = fields.getAt(i);
            if (field.fieldId === fieldId) {
                if (requiredBooleanOperationId === undefined || requiredBooleanOperationId === field.booleanOperationId) {
                    return true;
                } else {
                    conditionSet.loadError = { typeId: ScanFieldSetLoadErrorTypeId.FieldDoesNotHaveRequiredBooleanOperationId, extra: fieldId.toString() };
                    return false;
                }
            }
        }
        const field = conditionSet.fieldFactory.createField(fieldId);
        field.booleanOperationId = requiredBooleanOperationId;
        fields.add(field);
        return true;
    }

    // createFormulaNode private functions

    function createConditionFormulaNodes(conditionSet: ScanFieldSet) {
        const conditions = conditionSet.conditions;
        const conditionCount = conditions.count;
        const operands = new Array<ScanFormula.BooleanNode>(conditionCount);

        for (let i = 0; i < conditionCount; i++) {
            const condition = conditions.getAt(i);
            const createdOperandBooleanNode = createConditionFormulaNode(condition);
            if (createdOperandBooleanNode.requiresNot) {
                const notNode = new ScanFormula.NotNode();
                notNode.operand = createdOperandBooleanNode.node;
                operands[i] = notNode;
            } else {
                operands[i] = createdOperandBooleanNode.node;
            }
        }
        return operands;
    }

    function createFieldFormulaNodes(conditionSet: ScanFieldSet) {
        const fields = conditionSet.fields;
        const fieldCount = fields.count;
        const operands = new Array<ScanFormula.BooleanNode>(fieldCount);

        for (let i = 0; i < fieldCount; i++) {
            // const condition = fields.getAt(i);
            // const createdOperandBooleanNode = createConditionFormulaNode(condition);
            // if (createdOperandBooleanNode.requiresNot) {
            //     const notNode = new ScanFormula.NotNode();
            //     notNode.operand = createdOperandBooleanNode.node;
            //     operands[i] = notNode;
            // } else {
            //     operands[i] = createdOperandBooleanNode.node;
            // }
        }
        return operands;
    }

    interface CreatedBooleanNode {
        node: ScanFormula.BooleanNode;
        requiresNot: boolean;
    }

    function createConditionFormulaNode(condition: ScanField): CreatedBooleanNode {
        switch (condition.typeId) {
            case ScanField.TypeId.NumericComparison: {
                const numericComparisonCondition  = condition as NumericComparisonScanCondition;
                return createNumericComparisonBooleanNode(numericComparisonCondition);
            }
            case ScanField.TypeId.All: {
                return {
                    node: new ScanFormula.AllNode(),
                    requiresNot: false,
                };
            }
            case ScanField.TypeId.None: {
                return {
                    node: new ScanFormula.NoneNode(),
                    requiresNot: false,
                };
            }
            case ScanField.TypeId.Is: {
                const isCondition  = condition as IsScanCondition;
                const isNode = new ScanFormula.IsNode(isCondition.categoryId);
                isNode.trueFalse = !isCondition.not;
                return {
                    node: isNode,
                    requiresNot: false,
                };
            }
            case ScanField.TypeId.FieldHasValue: {
                const fieldHasValueCondition  = condition as FieldHasValueScanCondition;
                const fieldHasValueNode = new ScanFormula.FieldHasValueNode();
                fieldHasValueNode.fieldId = fieldHasValueCondition.fieldId;
                return {
                    node: fieldHasValueNode,
                    requiresNot: fieldHasValueCondition.not,
                };
            }
            case ScanField.TypeId.BooleanFieldEquals: {
                const booleanFieldEqualsCondition  = condition as BooleanFieldEqualsScanCondition;
                const booleanFieldEqualsNode = new ScanFormula.BooleanFieldEqualsNode();
                booleanFieldEqualsNode.fieldId = booleanFieldEqualsCondition.fieldId;
                booleanFieldEqualsNode.target = booleanFieldEqualsCondition.target;
                return {
                    node: booleanFieldEqualsNode,
                    requiresNot: booleanFieldEqualsCondition.not,
                };
            }
            case ScanField.TypeId.NumericFieldEquals: {
                const numericFieldEqualsCondition  = condition as NumericFieldEqualsScanCondition;
                const numericFieldEqualsNode = new ScanFormula.NumericFieldEqualsNode();
                numericFieldEqualsNode.fieldId = numericFieldEqualsCondition.fieldId;
                numericFieldEqualsNode.target = numericFieldEqualsCondition.target;
                return {
                    node: numericFieldEqualsNode,
                    requiresNot: numericFieldEqualsCondition.not,
                };
            }
            case ScanField.TypeId.NumericFieldInRange: {
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
            case ScanField.TypeId.DateFieldEquals: {
                const dateFieldEqualsCondition  = condition as DateFieldEqualsScanCondition;
                const dateFieldEqualsNode = new ScanFormula.DateFieldEqualsNode();
                dateFieldEqualsNode.fieldId = dateFieldEqualsCondition.fieldId;
                dateFieldEqualsNode.target = SourceTzOffsetDateTime.createCopy(dateFieldEqualsCondition.target);
                return {
                    node: dateFieldEqualsNode,
                    requiresNot: dateFieldEqualsCondition.not,
                };
            }
            case ScanField.TypeId.DateFieldInRange: {
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
            case ScanField.TypeId.TextFieldIncludes: {
                const textFieldIncludesCondition  = condition as TextFieldIncludesScanCondition;
                const textFieldIncludesNode = new ScanFormula.TypedOverlapsFieldNode();
                textFieldIncludesNode.fieldId = textFieldIncludesCondition.fieldId;
                textFieldIncludesNode.values = textFieldIncludesCondition.values.slice();
                return {
                    node: textFieldIncludesNode,
                    requiresNot: textFieldIncludesCondition.not,
                };
            }
            case ScanField.TypeId.TextFieldContains: {
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
            case ScanField.TypeId.PriceSubFieldHasValue: {
                const priceSubFieldHasValueCondition  = condition as PriceSubFieldHasValueScanCondition;
                const priceSubFieldHasValueNode = new ScanFormula.PriceSubFieldHasValueNode();
                priceSubFieldHasValueNode.fieldId = priceSubFieldHasValueCondition.fieldId;
                priceSubFieldHasValueNode.subFieldId = priceSubFieldHasValueCondition.subFieldId;
                return {
                    node: priceSubFieldHasValueNode,
                    requiresNot: priceSubFieldHasValueCondition.not,
                };
            }
            case ScanField.TypeId.PriceSubFieldEquals: {
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
            case ScanField.TypeId.PriceSubFieldInRange: {
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
            case ScanField.TypeId.DateSubFieldHasValue: {
                const dateSubFieldHasValueCondition  = condition as DateSubFieldHasValueScanCondition;
                const dateSubFieldHasValueNode = new ScanFormula.DateSubFieldHasValueNode();
                dateSubFieldHasValueNode.fieldId = dateSubFieldHasValueCondition.fieldId;
                dateSubFieldHasValueNode.subFieldId = dateSubFieldHasValueCondition.subFieldId;
                return {
                    node: dateSubFieldHasValueNode,
                    requiresNot: dateSubFieldHasValueCondition.not,
                };
            }
            case ScanField.TypeId.DateSubFieldEquals: {
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
            case ScanField.TypeId.DateSubFieldInRange: {
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
            case ScanField.TypeId.AltCodeSubFieldHasValue: {
                const altcodeSubFieldHasValueCondition  = condition as AltCodeSubFieldHasValueScanCondition;
                const altcodeSubFieldHasValueNode = new ScanFormula.AltCodeSubFieldHasValueNode();
                altcodeSubFieldHasValueNode.fieldId = altcodeSubFieldHasValueCondition.fieldId;
                altcodeSubFieldHasValueNode.subFieldId = altcodeSubFieldHasValueCondition.subFieldId;
                return {
                    node: altcodeSubFieldHasValueNode,
                    requiresNot: altcodeSubFieldHasValueCondition.not,
                };
            }
            case ScanField.TypeId.AltCodeSubFieldContains: {
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
            case ScanField.TypeId.AttributeSubFieldHasValue: {
                const attributeSubFieldHasValueCondition  = condition as AttributeSubFieldHasValueScanCondition;
                const attributeSubFieldHasValueNode = new ScanFormula.AttributeSubFieldHasValueNode();
                attributeSubFieldHasValueNode.fieldId = attributeSubFieldHasValueCondition.fieldId;
                attributeSubFieldHasValueNode.subFieldId = attributeSubFieldHasValueCondition.subFieldId;
                return {
                    node: attributeSubFieldHasValueNode,
                    requiresNot: attributeSubFieldHasValueCondition.not,
                };
            }
            case ScanField.TypeId.AttributeSubFieldContains: {
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
        resultLeftOperand.fieldId = condition.fieldId;

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

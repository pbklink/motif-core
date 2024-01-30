/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, Result, UnreachableCaseError } from '../../sys/sys-internal-api';
import { ScanFormula } from '../formula/internal-api';
import { ScanFieldSetLoadError, ScanFieldSetLoadErrorTypeId } from './common/internal-api';
import {
    NumericComparisonScanFieldCondition,
    ScanField,
    ScanFieldCondition,
    ScanFieldConditionFactory,
    ScanFieldFactory
} from './field/internal-api';

export interface ScanFieldSet {
    readonly conditionFactory: ScanFieldConditionFactory;
    readonly fieldFactory: ScanFieldFactory;

    fields: ScanFieldSet.Fields;

    loadError: ScanFieldSetLoadError | undefined;

    // assign(value: ScanFieldSet): void;
}

export namespace ScanFieldSet {
    // Implementable by ComparableList
    export interface Fields {
        readonly count: Integer;
        capacity: Integer;

        getAt(index: Integer): ScanField;
        setAt(index: Integer, value: ScanField): void;
        clear(): void;
        add(field: ScanField): Integer;
        remove(field: ScanField): void;
    }

    type LevelNode = ScanFormula.AndNode | ScanFormula.OrNode | ScanFormula.XorNode;

    // export namespace Fields {
    //     Fields.
    // }

    /**
     * @param fieldSet - ConditionSet to be loaded.  All fields except setOperandTypeId will be cleared prior to loading.
     * conditionSet.setOperandTypeId can be optionally defined. If conditionSet.setOperandTypeId is defined and the loaded setOperandTypeId is different, then a load error is flagged.
     */
    export function tryLoadFromFormulaNode(fieldSet: ScanFieldSet, rootFormulaBooleanNode: ScanFormula.BooleanNode): boolean {
        const fields = fieldSet.fields;
        fields.clear();
        fieldSet.loadError = undefined;

        if (ScanFormula.NoneNode.is(rootFormulaBooleanNode)) {
            return true; // empty FieldSet
        } else {
            let levelNodes: LevelNode[];
            if (ScanFormula.AndNode.is(rootFormulaBooleanNode)) {
                levelNodes = [rootFormulaBooleanNode];
            } else {
                const rootAndNode = new ScanFormula.AndNode();
                rootAndNode.operands = [rootFormulaBooleanNode];
                levelNodes = [rootAndNode];
            }

            let levelNodeCount =  levelNodes.length;
            let isInFieldLevel = false;

            // Examines the tree of nodes one level at a time
            // At each level, all nodes not under an AND, OR or XOR node are converted to a FieldCondition. This condition is added to a corresponding AND field (which is created if necessary)
            // Nodes under an AND node are added to the next level
            // The above is repeated until the next level is empty.
            // If a level contains an OR of XOR node, then subsequent levels are flagged as 'inField'.
            // An OR node cannot have AND or XOR children.
            // Any child OR node of an OR node is moved to next level. Other child nodes of OR nodes are coverted to conditions and the condition is added to a corresponding OR field (which is created if necessary)
            // An XOR node cannot have AND or OR or XOR children.  Other child nodes of XOR nodes are coverted to conditions and the condition is added to a corresponding XOR field (which is created if necessary)
            // Once we are at an 'inField' level, then an AND node can no longer have OR or XOR children
            // You cannot create one field of any type. For example, you cannot create an OR field of a type if an AND field of that type already exists.
            while (levelNodeCount > 0) {
                for (let i = 0; i < levelNodeCount; i++) {
                    const levelNode = levelNodes[i];
                    const levelNodesAndInField = processLevelNode(fieldSet, levelNode, isInFieldLevel);
                    if (levelNodesAndInField === undefined) {
                        return false;
                    } else {
                        levelNodes = levelNodesAndInField.levelNodes;
                        levelNodeCount = levelNodes.length;
                        isInFieldLevel = levelNodesAndInField.inField;
                    }
                }
            }
            return true;
        }
    }

    export function createFormulaNode(fieldSet: ScanFieldSet): ScanFormula.BooleanNode {
        const andedOredXorNodes = createAndedOredXorNodes(fieldSet);

        const andedNodes = andedOredXorNodes.andedNodes;
        const andedNodeCount = andedNodes.length;
        const orNodes = andedOredXorNodes.orNodes;
        const orNodeCount = orNodes.length;
        const xorNodes = andedOredXorNodes.xorNodes;
        const xorNodeCount = xorNodes.length;

        if (xorNodeCount === 0 && orNodeCount === 0) {
            if (andedNodeCount === 0) {
                return new ScanFormula.NoneNode();
            } else {
                if (andedNodeCount === 1) {
                    return andedNodes[0];
                } else {
                    const andNode = new ScanFormula.AndNode();
                    andNode.operands = andedNodes;
                    return andNode;
                }
            }
        } else {
            const andNode = new ScanFormula.AndNode();
            andNode.operands = [...andedNodes, ...orNodes, ...xorNodes];
            return andNode;
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

    // createFormulaNode functions

    function createAndedOredXorNodes(conditionSet: ScanFieldSet): ScanField.AndedOredXorNodes {
        const nodes: ScanField.AndedOredXorNodes = {
            andedNodes: new Array<ScanFormula.BooleanNode>(),
            orNodes: new Array<ScanFormula.OrNode>(),
            xorNodes: new Array<ScanFormula.XorNode>(),
        };

        const fields = conditionSet.fields;
        const fieldCount = fields.count;
        for (let i = 0; i < fieldCount; i++) {
            const field = fields.getAt(i);
            ScanField.addAndedOredXorNodes(field, nodes);
        }
        return nodes;
    }

    // tryLoadFromFormulaNode private functions

    interface LevelNodesAndInField {
        levelNodes: LevelNode[];
        inField: boolean;
    }

    function processLevelNode(fieldSet: ScanFieldSet, node: LevelNode, inField: boolean): LevelNodesAndInField | undefined {
        switch (node.typeId) {
            case ScanFormula.NodeTypeId.And: {
                const operands = node.operands;
                const operandCount = operands.length;
                const childLevelNodes = new Array<LevelNode>(operandCount);
                let childLevelNodeCount = 0;
                for (const operand of operands) {
                    switch (operand.typeId) {
                        case ScanFormula.NodeTypeId.And:
                            childLevelNodes[childLevelNodeCount++] = operand as ScanFormula.AndNode;
                            break;
                        case ScanFormula.NodeTypeId.Or:
                            if (inField) {
                                loadError(fieldSet, ScanFieldSetLoadErrorTypeId.AndFieldHasOrChild);
                                return undefined;
                            } else {
                                inField = true;
                                childLevelNodes[childLevelNodeCount++] = operand as ScanFormula.OrNode;
                            }
                            break;
                        case ScanFormula.NodeTypeId.Xor:
                            if (inField) {
                                loadError(fieldSet, ScanFieldSetLoadErrorTypeId.AndFieldHasXorChild);
                                return undefined;
                            } else {
                                inField = true;
                                childLevelNodes[childLevelNodeCount++] = operand as ScanFormula.XorNode;
                            }
                            break;
                        default: {
                            const success = processConditionNode(fieldSet, node, ScanField.BooleanOperationId.And, false);
                            if (!success) {
                                return undefined;
                            }
                        }
                    }
                }

                childLevelNodes.length = childLevelNodeCount;
                return { levelNodes: childLevelNodes, inField };
            }
            case ScanFormula.NodeTypeId.Or: {
                const operands = node.operands;
                const operandCount = operands.length;
                const childLevelNodes = new Array<LevelNode>(operandCount);
                let childLevelNodeCount = 0;
                for (const operand of operands) {
                    switch (operand.typeId) {
                        case ScanFormula.NodeTypeId.And:
                            loadError(fieldSet, ScanFieldSetLoadErrorTypeId.OrFieldHasAndChild);
                            return undefined;
                        case ScanFormula.NodeTypeId.Or:
                            childLevelNodes[childLevelNodeCount++] = operand as ScanFormula.OrNode;
                            break;
                        case ScanFormula.NodeTypeId.Xor:
                            loadError(fieldSet, ScanFieldSetLoadErrorTypeId.OrFieldHasXorChild);
                            return undefined;
                        default: {
                            const success = processConditionNode(fieldSet, node, ScanField.BooleanOperationId.Or, false);
                            if (!success) {
                                return undefined;
                            }
                        }
                    }
                }

                childLevelNodes.length = childLevelNodeCount;
                return { levelNodes: childLevelNodes, inField };
            }
            case ScanFormula.NodeTypeId.Xor: {
                const leftSuccess = processXorLevelNodeOperand(fieldSet, node, node.leftOperand);
                if (!leftSuccess) {
                    return undefined;
                } else {
                    const rightSuccess = processXorLevelNodeOperand(fieldSet, node, node.rightOperand);
                    if (!rightSuccess) {
                        return undefined;
                    } else {
                        return { levelNodes: [], inField };
                    }
                }
            }
            default:
                throw new UnreachableCaseError('SFSPLN34445', node);
        }
    }

    function processXorLevelNodeOperand(fieldSet: ScanFieldSet, node: ScanFormula.XorNode, operand: ScanFormula.BooleanNode) {
        switch (operand.typeId) {
            case ScanFormula.NodeTypeId.And:
                return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.XorFieldHasAndChild);
            case ScanFormula.NodeTypeId.Or:
                return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.XorFieldHasOrChild);
            case ScanFormula.NodeTypeId.Xor:
                return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.XorFieldHasXorChild);
            default: {
                return processConditionNode(fieldSet, node, ScanField.BooleanOperationId.Xor, false);
            }
        }
    }

    function processConditionNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.BooleanNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): boolean {
        switch (node.typeId) {
            case ScanFormula.NodeTypeId.And:
                if (not) {
                    return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.AndFieldOperatorCannotBeNegated);
                } else {
                    throw new AssertInternalError('SFSPCNA55598', node.typeId.toString());
                }
            case ScanFormula.NodeTypeId.Or:
                if (not) {
                    return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.OrFieldOperatorCannotBeNegated);
                } else {
                    throw new AssertInternalError('SFSPCNO55598', node.typeId.toString());
                }
            case ScanFormula.NodeTypeId.Not:
                return processConditionNode(fieldSet, (node as ScanFormula.NotNode).operand, fieldOperationId, not);
            case ScanFormula.NodeTypeId.Xor:
                if (not) {
                    return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.XorFieldOperatorCannotBeNegated);
                } else {
                    throw new AssertInternalError('SFSPCNX55598', node.typeId.toString());
                }
            case ScanFormula.NodeTypeId.NumericEquals: {
                const numericOperatorId = not ? ScanFieldCondition.OperatorId.NotEquals : ScanFieldCondition.OperatorId.Equals;
                return processNumericComparisonBooleanNode(fieldSet, node as ScanFormula.NumericComparisonBooleanNode, fieldOperationId, numericOperatorId);
            }
            case ScanFormula.NodeTypeId.NumericGreaterThan: {
                const numericOperatorId = not ? ScanFieldCondition.OperatorId.LessThanOrEqual : ScanFieldCondition.OperatorId.GreaterThan;
                return processNumericComparisonBooleanNode(fieldSet, node as ScanFormula.NumericComparisonBooleanNode, fieldOperationId, numericOperatorId);
            }
            case ScanFormula.NodeTypeId.NumericGreaterThanOrEqual: {
                const numericOperatorId = not ? ScanFieldCondition.OperatorId.LessThan : ScanFieldCondition.OperatorId.GreaterThanOrEqual;
                return processNumericComparisonBooleanNode(fieldSet, node as ScanFormula.NumericComparisonBooleanNode, fieldOperationId, numericOperatorId);
            }
            case ScanFormula.NodeTypeId.NumericLessThan: {
                const numericOperatorId = not ? ScanFieldCondition.OperatorId.GreaterThanOrEqual : ScanFieldCondition.OperatorId.LessThan;
                return processNumericComparisonBooleanNode(fieldSet, node as ScanFormula.NumericComparisonBooleanNode, fieldOperationId, numericOperatorId);
            }
            case ScanFormula.NodeTypeId.NumericLessThanOrEqual: {
                const numericOperatorId = not ? ScanFieldCondition.OperatorId.GreaterThan : ScanFieldCondition.OperatorId.LessThanOrEqual;
                return processNumericComparisonBooleanNode(fieldSet, node as ScanFormula.NumericComparisonBooleanNode, fieldOperationId, numericOperatorId);
            }
            case ScanFormula.NodeTypeId.All:
                return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.AllConditionNotSupported);
            case ScanFormula.NodeTypeId.None:
                return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.NoneConditionNotSupported);
            case ScanFormula.NodeTypeId.Is:
                return processIsNode(fieldSet, node as ScanFormula.IsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.FieldHasValue:
                return processFieldHasValueNode(fieldSet, node as ScanFormula.FieldHasValueNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.NumericFieldEquals:
                return processNumericFieldEqualsNode(fieldSet, node as ScanFormula.NumericFieldEqualsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.NumericFieldInRange:
                return processNumericFieldInRangeNode(fieldSet, node as ScanFormula.NumericFieldInRangeNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.DateFieldEquals:
                return processDateFieldEqualsNode(fieldSet, node as ScanFormula.DateFieldEqualsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.DateFieldInRange:
                return processDateFieldInRangeNode(fieldSet, node as ScanFormula.DateFieldInRangeNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.StringFieldOverlaps:
                return processStringFieldOverlapsNode(fieldSet, node as ScanFormula.StringFieldOverlapsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.CurrencyFieldOverlaps:
                return processCurrencyFieldOverlapsNode(fieldSet, node as ScanFormula.CurrencyFieldOverlapsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.ExchangeFieldOverlaps:
                return processExchangeFieldOverlapsNode(fieldSet, node as ScanFormula.ExchangeFieldOverlapsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.MarketFieldOverlaps:
                return processMarketFieldOverlapsNode(fieldSet, node as ScanFormula.MarketFieldOverlapsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.MarketBoardFieldOverlaps:
                return processMarketBoardFieldOverlapsNode(fieldSet, node as ScanFormula.MarketBoardFieldOverlapsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.TextFieldEquals:
                return processTextFieldEqualsNode(fieldSet, node as ScanFormula.TextFieldEqualsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.TextFieldContains:
                return processTextFieldContainsNode(fieldSet, node as ScanFormula.TextFieldContainsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.PriceSubFieldHasValue:
                return processPriceSubFieldHasValueNode(fieldSet, node as ScanFormula.PriceSubFieldHasValueNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.PriceSubFieldEquals:
                return processPriceSubFieldEqualsNode(fieldSet, node as ScanFormula.PriceSubFieldEqualsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.PriceSubFieldInRange:
                return processPriceSubFieldInRangeNode(fieldSet, node as ScanFormula.PriceSubFieldInRangeNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.DateSubFieldHasValue:
                return processDateSubFieldHasValueNode(fieldSet, node as ScanFormula.DateSubFieldHasValueNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.DateSubFieldEquals:
                return processDateSubFieldEqualsNode(fieldSet, node as ScanFormula.DateSubFieldEqualsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.DateSubFieldInRange:
                return processDateSubFieldInRangeNode(fieldSet, node as ScanFormula.DateSubFieldInRangeNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.AltCodeSubFieldHasValue:
                return processAltCodeSubFieldHasValueNode(fieldSet, node as ScanFormula.AltCodeSubFieldHasValueNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.AltCodeSubFieldContains:
                return processAltCodeSubFieldContainsNode(fieldSet, node as ScanFormula.AltCodeSubFieldContainsNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.AttributeSubFieldHasValue:
                return processAttributeSubFieldHasValueNode(fieldSet, node as ScanFormula.AttributeSubFieldHasValueNode, fieldOperationId, not);
            case ScanFormula.NodeTypeId.AttributeSubFieldContains:
                return processAttributeSubFieldContainsNode(fieldSet, node as ScanFormula.AttributeSubFieldContainsNode, fieldOperationId, not);
            default:
                throw new UnreachableCaseError('SFSPCN69211', node.typeId);
        }
    }

    function processCreateConditionResult(
        fieldSet: ScanFieldSet,
        fieldTypeId: ScanField.TypeId,
        fieldId: ScanFormula.FieldId,
        subFieldId: Integer | undefined,
        conditionsOperationId: ScanField.BooleanOperationId,
        createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>,
    ): boolean {
        if (createConditionResult.isErr()) {
            const error = createConditionResult.error;
            return loadErrorReturnFalse(fieldSet, error.typeId, error.extra);
        } else {
            const condition = createConditionResult.value;
            const fields = fieldSet.fields;
            let field = tryFindField(fields, fieldId);
            if (field === undefined) {
                const fieldCreateResult = tryCreateField(fieldSet.fieldFactory, fieldTypeId, fieldId, subFieldId);
                if (fieldCreateResult.isErr()) {
                    const error = fieldCreateResult.error;
                    return loadErrorReturnFalse(fieldSet, error.typeId, error.extra);
                } else {
                    field = fieldCreateResult.value;
                    field.conditionsOperationId = conditionsOperationId;
                    fields.add(field);
                    field.conditions.add(condition);
                    return true;
                }
            } else {
                if (field.conditionsOperationId !== conditionsOperationId) {
                    return loadErrorReturnFalse(fieldSet, ScanFieldSetLoadErrorTypeId.fieldConditionsOperationIdMismatch, field.typeId.toString());
                } else {
                    if (!ScanField.isAnyConditionEqualTo(field, condition)) {
                        field.conditions.add(condition);
                    }
                    return true;
                }
            }
        }
    }

    function tryFindField(fields: ScanFieldSet.Fields, fieldId: ScanFormula.FieldId): ScanField | undefined {
        const count = fields.count;
        for (let i = 0; i < count; i++) {
            const field = fields.getAt(i);
            if (field.fieldId === fieldId) {
                return field;
            }
        }
        return undefined;
    }

    function tryCreateField(factory: ScanFieldFactory, fieldTypeId: ScanField.TypeId, fieldId: ScanFormula.FieldId, subFieldId: Integer | undefined): Result<ScanField, ScanFieldSetLoadError> {
        switch (fieldTypeId) {
            case ScanField.TypeId.NumericInRange: return factory.createNumericInRange(fieldId as ScanFormula.NumericRangeFieldId);
            case ScanField.TypeId.PriceSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.PriceSubbed) {
                        throw new AssertInternalError('SFSTCFPS67631', fieldId.toString());
                    } else {
                        return factory.createPriceSubbed(subFieldId as ScanFormula.PriceSubFieldId);
                    }
                }
            case ScanField.TypeId.DateInRange: return factory.createDateInRange(fieldId as ScanFormula.DateRangeFieldId);
            case ScanField.TypeId.DateSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.DateSubbed) {
                        throw new AssertInternalError('SFSTCFDS67631', fieldId.toString());
                    } else {
                        return factory.createDateSubbed(subFieldId as ScanFormula.DateSubFieldId);
                    }
                }
            case ScanField.TypeId.TextContains: return factory.createTextContains(fieldId as ScanFormula.TextContainsFieldId);
            case ScanField.TypeId.AltCodeSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.AltCodeSubbed) {
                        throw new AssertInternalError('SFSTCFACS67631', fieldId.toString());
                    } else {
                        return factory.createAltCodeSubbed(subFieldId as ScanFormula.AltCodeSubFieldId);
                    }
                }
            case ScanField.TypeId.AttributeSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.AttributeSubbed) {
                        throw new AssertInternalError('SFSTCFACS67631', fieldId.toString());
                    } else {
                        return factory.createAttributeSubbed(subFieldId as ScanFormula.AttributeSubFieldId);
                    }
                }
            case ScanField.TypeId.TextEquals: return factory.createTextEquals(fieldId as ScanFormula.TextEqualsFieldId);
            case ScanField.TypeId.TextHasValueEquals: return factory.createTextHasValueEquals(fieldId as ScanFormula.TextHasValueEqualsFieldId);
            case ScanField.TypeId.StringOverlaps: return factory.createStringOverlaps(fieldId as ScanFormula.StringOverlapsFieldId);
            case ScanField.TypeId.MarketBoardOverlaps: return factory.createMarketBoardOverlaps(fieldId as ScanFormula.FieldId.MarketBoard);
            case ScanField.TypeId.CurrencyOverlaps: return factory.createCurrencyOverlaps(fieldId as ScanFormula.FieldId.Currency);
            case ScanField.TypeId.ExchangeOverlaps: return factory.createExchangeOverlaps(fieldId as ScanFormula.FieldId.Exchange);
            case ScanField.TypeId.MarketOverlaps: return factory.createMarketOverlaps(fieldId as ScanFormula.MarketOverlapsFieldId);
            case ScanField.TypeId.Is: return factory.createIs(fieldId as ScanFormula.FieldId.Is);
            default:
                throw new UnreachableCaseError('SFSTCFFC29287', fieldTypeId);
        }
    }

    function loadErrorReturnFalse(fieldSet: ScanFieldSet, typeId: ScanFieldSetLoadErrorTypeId, extra?: string): boolean {
        loadError(fieldSet, typeId, extra);
        return false;
    }

    function loadError(fieldSet: ScanFieldSet, typeId: ScanFieldSetLoadErrorTypeId, extra?: string) {
        fieldSet.loadError = { typeId, extra };
    }

    // processConditionNode cases

    function processFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.FieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        const fieldId = node.fieldId;
        const styleId = ScanFormula.Field.idToStyleId(fieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        let fieldTypeId: ScanField.TypeId;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        switch (styleId) {
            case ScanFormula.Field.StyleId.InRange: {
                switch (dataTypeId) {
                    case ScanFormula.Field.DataTypeId.Numeric: {
                        fieldTypeId = ScanField.TypeId.NumericInRange;
                        if (not) {
                            createConditionResult = conditionFactory.createNumericComparisonFromFieldHasValue(node, ScanFieldCondition.OperatorId.NotHasValue);
                        } else {
                            createConditionResult = conditionFactory.createNumericComparisonFromFieldHasValue(node, ScanFieldCondition.OperatorId.HasValue);
                        }
                        break;
                    }
                    case ScanFormula.Field.DataTypeId.Date:
                        fieldTypeId = ScanField.TypeId.DateInRange;
                        if (not) {
                            createConditionResult = conditionFactory.createDateFromFieldHasValue(node, ScanFieldCondition.OperatorId.NotHasValue);
                        } else {
                            createConditionResult = conditionFactory.createDateFromFieldHasValue(node, ScanFieldCondition.OperatorId.HasValue);
                        }
                        break;
                    case ScanFormula.Field.DataTypeId.Text:
                        throw new AssertInternalError('SFSPFHVNRT50718');
                    case ScanFormula.Field.DataTypeId.Boolean:
                        throw new AssertInternalError('SFSPFHVNRB50718');
                    default:
                        throw new UnreachableCaseError('SFSPFHVNRD50718', dataTypeId);
                }
                break;
            }
            case ScanFormula.Field.StyleId.Overlaps:
                throw new AssertInternalError('SFSPFHVNM50718');
            case ScanFormula.Field.StyleId.Equals:
                throw new AssertInternalError('SFSPFHVNES50718');
            case ScanFormula.Field.StyleId.HasValueEquals:
                if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
                    throw new AssertInternalError('SFSPFHVNESNT50718');
                } else {
                    fieldTypeId = ScanField.TypeId.TextHasValueEquals;
                    if (not) {
                        createConditionResult = conditionFactory.createTextHasValueEqualsFromFieldHasValue(node, ScanFieldCondition.OperatorId.NotHasValue);
                    } else {
                        createConditionResult = conditionFactory.createTextHasValueEqualsFromFieldHasValue(node, ScanFieldCondition.OperatorId.HasValue);
                    }
                    break;
                }
            case ScanFormula.Field.StyleId.Contains:
                throw new AssertInternalError('SFSPFHVNT50718');
            default:
                throw new UnreachableCaseError('SFSPFHVND50718', styleId);
        }
        return processCreateConditionResult(fieldSet, fieldTypeId, fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processNumericComparisonBooleanNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.NumericComparisonBooleanNode,
        fieldOperationId: ScanField.BooleanOperationId,
        conditionOperatorId: NumericComparisonScanFieldCondition.OperatorId,
    ): boolean {
        let fieldId: ScanFormula.FieldId;
        let useRightOperandAsValue: boolean;
        const leftOperand = node.leftOperand;
        const leftIsField = ScanFormula.NumericComparisonBooleanNode.isOperandNumericFieldValueGet(leftOperand);
        const rightOperand = node.rightOperand;
        const rightIsField = ScanFormula.NumericComparisonBooleanNode.isOperandNumericFieldValueGet(rightOperand);
        if (leftIsField) {
            const rightIsNumber = ScanFormula.NumericComparisonBooleanNode.isOperandValue(rightOperand);
            if (rightIsNumber) {
                fieldId = leftOperand.fieldId;
                useRightOperandAsValue = true;
            } else {
                return loadErrorReturnFalse(
                    fieldSet,
                    ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
                    leftOperand.fieldId.toString(),
                );
            }
        } else {
            if (rightIsField) {
                const leftIsNumber = ScanFormula.NumericComparisonBooleanNode.isOperandValue(leftOperand);
                if (leftIsNumber) {
                    fieldId = rightOperand.fieldId;
                    useRightOperandAsValue = false;
                } else {
                    return loadErrorReturnFalse(
                        fieldSet,
                        ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
                        rightOperand.fieldId.toString(),
                    );
                }
            } else {
                return loadErrorReturnFalse(
                    fieldSet,
                    ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumericFieldValueGetOperand,
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    `{${leftOperand.toString()}, ${rightOperand.toString()}}`
                );
            }
        }
        const createConditionResult = fieldSet.conditionFactory.createNumericComparisonFromNumericComparison(node, conditionOperatorId, useRightOperandAsValue);
        return processCreateConditionResult(fieldSet, ScanField.TypeId.NumericInRange, fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processNumericFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.NumericFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createNumericComparisonFromNumericFieldEquals(node, ScanFieldCondition.OperatorId.NotEquals);
        } else {
            createConditionResult = conditionFactory.createNumericComparisonFromNumericFieldEquals(node, ScanFieldCondition.OperatorId.Equals);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.NumericInRange, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processNumericFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.NumericFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createNumericComparisonFromNumericFieldInRange(node, ScanFieldCondition.OperatorId.NotInRange);
        } else {
            createConditionResult = conditionFactory.createNumericComparisonFromNumericFieldInRange(node, ScanFieldCondition.OperatorId.InRange);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.NumericInRange, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processPriceSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.PriceSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createNumericFromPriceSubFieldHasValue(node, ScanFieldCondition.OperatorId.NotHasValue);
        } else {
            createConditionResult = conditionFactory.createNumericFromPriceSubFieldHasValue(node, ScanFieldCondition.OperatorId.HasValue);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.PriceSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processPriceSubFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.PriceSubFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createNumericFromPriceSubFieldEquals(node, ScanFieldCondition.OperatorId.NotEquals);
        } else {
            createConditionResult = conditionFactory.createNumericFromPriceSubFieldEquals(node, ScanFieldCondition.OperatorId.Equals);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.PriceSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processPriceSubFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.PriceSubFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createNumericFromPriceSubFieldInRange(node, ScanFieldCondition.OperatorId.NotInRange);
        } else {
            createConditionResult = conditionFactory.createNumericFromPriceSubFieldInRange(node, ScanFieldCondition.OperatorId.InRange);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.PriceSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processDateFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createDateFromDateFieldEquals(node, ScanFieldCondition.OperatorId.NotEquals);
        } else {
            createConditionResult = conditionFactory.createDateFromDateFieldEquals(node, ScanFieldCondition.OperatorId.Equals);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.DateInRange, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processDateFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createDateFromDateFieldInRange(node, ScanFieldCondition.OperatorId.NotInRange);
        } else {
            createConditionResult = conditionFactory.createDateFromDateFieldInRange(node, ScanFieldCondition.OperatorId.InRange);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.DateInRange, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processDateSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createDateFromDateSubFieldHasValue(node, ScanFieldCondition.OperatorId.NotHasValue);
        } else {
            createConditionResult = conditionFactory.createDateFromDateSubFieldHasValue(node, ScanFieldCondition.OperatorId.HasValue);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.DateSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processDateSubFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateSubFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createDateFromDateSubFieldEquals(node, ScanFieldCondition.OperatorId.NotEquals);
        } else {
            createConditionResult = conditionFactory.createDateFromDateSubFieldEquals(node, ScanFieldCondition.OperatorId.Equals);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.DateSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processDateSubFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateSubFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createDateFromDateSubFieldInRange(node, ScanFieldCondition.OperatorId.NotInRange);
        } else {
            createConditionResult = conditionFactory.createDateFromDateSubFieldInRange(node, ScanFieldCondition.OperatorId.InRange);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.DateSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processTextFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.TextFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createTextEqualsFromTextFieldEquals(node, ScanFieldCondition.OperatorId.NotEquals);
        } else {
            createConditionResult = conditionFactory.createTextEqualsFromTextFieldEquals(node, ScanFieldCondition.OperatorId.Equals);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.TextEquals, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processTextFieldContainsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.TextFieldContainsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createTextContainsFromTextFieldContains(node, ScanFieldCondition.OperatorId.NotContains);
        } else {
            createConditionResult = conditionFactory.createTextContainsFromTextFieldContains(node, ScanFieldCondition.OperatorId.Contains);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.TextContains, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processAltCodeSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AltCodeSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAltCodeSubFieldHasValue(node, ScanFieldCondition.OperatorId.NotHasValue);
        } else {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAltCodeSubFieldHasValue(node, ScanFieldCondition.OperatorId.HasValue);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.AltCodeSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processAltCodeSubFieldContainsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AltCodeSubFieldContainsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAltCodeSubFieldContains(node, ScanFieldCondition.OperatorId.NotContains);
        } else {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAltCodeSubFieldContains(node, ScanFieldCondition.OperatorId.Contains);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.AltCodeSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processAttributeSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AttributeSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAttributeSubFieldHasValue(node, ScanFieldCondition.OperatorId.NotHasValue);
        } else {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAttributeSubFieldHasValue(node, ScanFieldCondition.OperatorId.HasValue);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.AttributeSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processAttributeSubFieldContainsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AttributeSubFieldContainsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAttributeSubFieldContains(node, ScanFieldCondition.OperatorId.NotContains);
        } else {
            createConditionResult = conditionFactory.createTextHasValueContainsFromAttributeSubFieldContains(node, ScanFieldCondition.OperatorId.Contains);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.AttributeSubbed, node.fieldId, node.subFieldId, fieldOperationId, createConditionResult);
    }

    function processStringFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.StringFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createStringOverlapsFromStringFieldOverlaps(node, ScanFieldCondition.OperatorId.NotOverlaps);
        } else {
            createConditionResult = conditionFactory.createStringOverlapsFromStringFieldOverlaps(node, ScanFieldCondition.OperatorId.Overlaps);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.StringOverlaps, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processCurrencyFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.CurrencyFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createCurrencyOverlapsFromCurrencyFieldOverlaps(node, ScanFieldCondition.OperatorId.NotOverlaps);
        } else {
            createConditionResult = conditionFactory.createCurrencyOverlapsFromCurrencyFieldOverlaps(node, ScanFieldCondition.OperatorId.Overlaps);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.CurrencyOverlaps, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processExchangeFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.ExchangeFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createExchangeOverlapsFromExchangeFieldOverlaps(node, ScanFieldCondition.OperatorId.NotOverlaps);
        } else {
            createConditionResult = conditionFactory.createExchangeOverlapsFromExchangeFieldOverlaps(node, ScanFieldCondition.OperatorId.Overlaps);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.ExchangeOverlaps, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processMarketFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.MarketFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createMarketOverlapsFromMarketFieldOverlaps(node, ScanFieldCondition.OperatorId.NotOverlaps);
        } else {
            createConditionResult = conditionFactory.createMarketOverlapsFromMarketFieldOverlaps(node, ScanFieldCondition.OperatorId.Overlaps);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.MarketOverlaps, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processMarketBoardFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.MarketBoardFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createMarketBoardOverlapsFromMarketBoardFieldOverlaps(node, ScanFieldCondition.OperatorId.NotOverlaps);
        } else {
            createConditionResult = conditionFactory.createMarketBoardOverlapsFromMarketBoardFieldOverlaps(node, ScanFieldCondition.OperatorId.Overlaps);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.MarketBoardOverlaps, node.fieldId, undefined, fieldOperationId, createConditionResult);
    }

    function processIsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.IsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): boolean {
        const conditionFactory = fieldSet.conditionFactory;
        let createConditionResult: Result<ScanFieldCondition, ScanFieldSetLoadError>;
        if (not) {
            createConditionResult = conditionFactory.createIsFromIs(node, ScanFieldCondition.OperatorId.NotIs);
        } else {
            createConditionResult = conditionFactory.createIsFromIs(node, ScanFieldCondition.OperatorId.Is);
        }
        return processCreateConditionResult(fieldSet, ScanField.TypeId.Is, ScanFormula.FieldId.Is, undefined, fieldOperationId, createConditionResult);
    }


    // function loadCondition(conditionSet: ScanFieldSet, node: ScanFormula.BooleanNode, requiredFieldBooleanOperationId: BooleanOperationId | undefined): boolean {
    //     const createConditionResult = createCondition(node, conditionSet.conditionFactory, false);

    //     if (createConditionResult.isErr()) {
    //         conditionSet.loadError = createConditionResult.error;
    //         return false;
    //     } else {
    //         const condition = createConditionResult.value;
    //         conditionSet.conditions.add(condition);

    //         const fieldId = condition.fieldId;
    //         if (fieldId !== undefined) {
    //             if (!addFieldUniquely(conditionSet, fieldId, requiredFieldBooleanOperationId)) {
    //                 return false;
    //             }
    //         }

    //         return true;
    //     }
    // }

    // export function loadField(conditionSet: ScanFieldSet, node: ScanFormula.BooleanNode): boolean {
    //     let operationId: BooleanOperationId | undefined;
    //     let operandNodes: ScanFormula.BooleanNode[] | undefined;
    //     switch (node.typeId) {
    //         case ScanFormula.NodeTypeId.And: {
    //             operationId = BooleanOperationId.And;
    //             const andNode = node as ScanFormula.AndNode;
    //             operandNodes = andNode.operands;
    //             break;
    //         }
    //         case ScanFormula.NodeTypeId.Or: {
    //             operationId = BooleanOperationId.Or;
    //             const orNode = node as ScanFormula.OrNode;
    //             operandNodes = orNode.operands;
    //             break;
    //         }
    //         case ScanFormula.NodeTypeId.Xor: {
    //             conditionSet.loadError = { typeId: ScanFieldSetLoadErrorTypeId.XorFieldBooleanOperationNotSupported, extra: '' };
    //             break;
    //         }
    //         default:
    //             operationId = BooleanOperationId.And;
    //             operandNodes = [node];
    //     }

    //     if (operationId === undefined || operandNodes === undefined) {
    //         // conditionSet.loadError should already be set
    //         return false;
    //     } else {
    //         const operandCount = operandNodes.length;
    //         if (operandCount === 0) {
    //             // no conditions - ignore
    //             return true;
    //         } else {
    //             for (let i = 0; i < operandCount; i++) {
    //                 const operandNode = operandNodes[i];
    //                 if (!loadCondition(conditionSet, operandNode, operationId)) {
    //                     return false;
    //                 }
    //             }
    //             return true;
    //         }
    //     }
    // }

    // function addFieldUniquely(conditionSet: ScanFieldSet, fieldId: ScanFormula.FieldId, requiredBooleanOperationId: BooleanOperationId | undefined) {
    //     const fields = conditionSet.fields;
    //     const fieldCount = fields.count;
    //     for (let i = 0; i < fieldCount; i++) {
    //         const field = fields.getAt(i);
    //         if (field.fieldId === fieldId) {
    //             if (requiredBooleanOperationId === undefined || requiredBooleanOperationId === field.booleanOperationId) {
    //                 return true;
    //             } else {
    //                 conditionSet.loadError = { typeId: ScanFieldSetLoadErrorTypeId.FieldDoesNotHaveRequiredBooleanOperationId, extra: fieldId.toString() };
    //                 return false;
    //             }
    //         }
    //     }
    //     const field = conditionSet.fieldFactory.createField(fieldId);
    //     field.booleanOperationId = requiredBooleanOperationId;
    //     fields.add(field);
    //     return true;
    // }

    // // createFormulaNode private functions

    // function createConditionFormulaNodes(conditionSet: ScanFieldSet) {
    //     const conditions = conditionSet.conditions;
    //     const conditionCount = conditions.count;
    //     const operands = new Array<ScanFormula.BooleanNode>(conditionCount);

    //     for (let i = 0; i < conditionCount; i++) {
    //         const condition = conditions.getAt(i);
    //         const createdOperandBooleanNode = createConditionFormulaNode(condition);
    //         if (createdOperandBooleanNode.requiresNot) {
    //             const notNode = new ScanFormula.NotNode();
    //             notNode.operand = createdOperandBooleanNode.node;
    //             operands[i] = notNode;
    //         } else {
    //             operands[i] = createdOperandBooleanNode.node;
    //         }
    //     }
    //     return operands;
    // }
}

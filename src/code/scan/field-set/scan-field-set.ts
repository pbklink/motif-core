/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, Integer, Ok, Result, SourceTzOffsetDateTime, UnreachableCaseError } from '../../sys/sys-internal-api';
import { ScanFormula } from '../formula/internal-api';
import { ScanFieldSetLoadError, ScanFieldSetLoadErrorTypeId } from './common/internal-api';
import {
    AltCodeSubbedScanField,
    AttributeSubbedScanField,
    CurrencyOverlapsScanField,
    DateInRangeScanField,
    DateSubbedScanField,
    ExchangeOverlapsScanField,
    IsScanField,
    MarketBoardOverlapsScanField,
    MarketOverlapsScanField,
    NumericComparisonScanFieldCondition,
    NumericInRangeScanField,
    PriceSubbedScanField,
    ScanField,
    ScanFieldCondition,
    StringOverlapsScanField,
    TextContainsScanField,
    TextEqualsScanField,
    TextHasValueEqualsScanField
} from './field/internal-api';

export interface ScanFieldSet {
    readonly conditionFactory: ScanField.ConditionFactory;
    readonly fieldFactory: ScanFieldSet.FieldFactory;

    readonly fields: ScanFieldSet.Fields;

    readonly valid: boolean;
    readonly loadError: ScanFieldSetLoadError | undefined;

    beginLoad: () => void; // make sure this sets loadError to undefined
    endLoad: (loadError: ScanFieldSetLoadError | undefined) => void
    // assign(value: ScanFieldSet): void;
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

    export interface FieldFactory {
        createNumericInRange(fieldSet: ScanFieldSet, fieldId: ScanFormula.NumericRangeFieldId): Result<NumericInRangeScanField>;
        createPriceSubbed(fieldSet: ScanFieldSet, subFieldId: ScanFormula.PriceSubFieldId): Result<PriceSubbedScanField>;
        createDateInRange(fieldSet: ScanFieldSet, fieldId: ScanFormula.DateRangeFieldId): Result<DateInRangeScanField>;
        createDateSubbed(fieldSet: ScanFieldSet, subFieldId: ScanFormula.DateSubFieldId): Result<DateSubbedScanField>;
        createTextContains(fieldSet: ScanFieldSet, fieldId: ScanFormula.TextContainsFieldId): Result<TextContainsScanField>;
        createAltCodeSubbed(fieldSet: ScanFieldSet, subFieldId: ScanFormula.AltCodeSubFieldId): Result<AltCodeSubbedScanField>;
        createAttributeSubbed(fieldSet: ScanFieldSet, subFieldId: ScanFormula.AttributeSubFieldId): Result<AttributeSubbedScanField>;
        createTextEquals(fieldSet: ScanFieldSet, fieldId: ScanFormula.TextEqualsFieldId): Result<TextEqualsScanField>;
        createTextHasValueEquals(fieldSet: ScanFieldSet, fieldId: ScanFormula.TextHasValueEqualsFieldId): Result<TextHasValueEqualsScanField>;
        createStringOverlaps(fieldSet: ScanFieldSet, fieldId: ScanFormula.StringOverlapsFieldId): Result<StringOverlapsScanField>;
        createMarketBoardOverlaps(fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.MarketBoard): Result<MarketBoardOverlapsScanField>;
        createCurrencyOverlaps(fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Currency): Result<CurrencyOverlapsScanField>;
        createExchangeOverlaps(fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Exchange): Result<ExchangeOverlapsScanField>;
        createMarketOverlaps(fieldSet: ScanFieldSet, fieldId: ScanFormula.MarketOverlapsFieldId): Result<MarketOverlapsScanField>;
        createIs(fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Is): Result<IsScanField>;
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
        fieldSet.beginLoad();

        let error: ScanFieldSetLoadError | undefined
        if (!ScanFormula.NoneNode.is(rootFormulaBooleanNode)) { // if None then ScanFieldSet is empty
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
                    const processResult = processLevelNode(fieldSet, levelNode, isInFieldLevel);
                    if (processResult.isErr()) {
                        error = processResult.error;
                        break;
                    } else {
                        const levelNodesAndInField = processResult.value;
                        levelNodes = levelNodesAndInField.levelNodes;
                        levelNodeCount = levelNodes.length;
                        isInFieldLevel = levelNodesAndInField.inField;
                    }
                }
            }
        }

        fieldSet.endLoad(error);
        return error === undefined;
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

    function processLevelNode(fieldSet: ScanFieldSet, node: LevelNode, inField: boolean): Result<LevelNodesAndInField, ScanFieldSetLoadError> {
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
                                return createErrResult(ScanFieldSetLoadErrorTypeId.AndFieldHasOrChild);
                            } else {
                                inField = true;
                                childLevelNodes[childLevelNodeCount++] = operand as ScanFormula.OrNode;
                            }
                            break;
                        case ScanFormula.NodeTypeId.Xor:
                            if (inField) {
                                return createErrResult(ScanFieldSetLoadErrorTypeId.AndFieldHasXorChild);
                            } else {
                                inField = true;
                                childLevelNodes[childLevelNodeCount++] = operand as ScanFormula.XorNode;
                            }
                            break;
                        default: {
                            const error = processConditionNode(fieldSet, node, ScanField.BooleanOperationId.And, false);
                            if (error !== undefined) {
                                return new Err(error);
                            }
                        }
                    }
                }

                childLevelNodes.length = childLevelNodeCount;
                return new Ok({ levelNodes: childLevelNodes, inField });
            }
            case ScanFormula.NodeTypeId.Or: {
                const operands = node.operands;
                const operandCount = operands.length;
                const childLevelNodes = new Array<LevelNode>(operandCount);
                let childLevelNodeCount = 0;
                for (const operand of operands) {
                    switch (operand.typeId) {
                        case ScanFormula.NodeTypeId.And:
                            return createErrResult(ScanFieldSetLoadErrorTypeId.OrFieldHasAndChild);
                        case ScanFormula.NodeTypeId.Or:
                            childLevelNodes[childLevelNodeCount++] = operand as ScanFormula.OrNode;
                            break;
                        case ScanFormula.NodeTypeId.Xor:
                            return createErrResult(ScanFieldSetLoadErrorTypeId.OrFieldHasXorChild);
                        default: {
                            const error = processConditionNode(fieldSet, node, ScanField.BooleanOperationId.Or, false);
                            if (error !== undefined) {
                                return new Err(error);
                            }
                        }
                    }
                }

                childLevelNodes.length = childLevelNodeCount;
                return new Ok({ levelNodes: childLevelNodes, inField });
            }
            case ScanFormula.NodeTypeId.Xor: {
                const leftError = processXorLevelNodeOperand(fieldSet, node, node.leftOperand);
                if (leftError !== undefined) {
                    return new Err(leftError);
                } else {
                    const rightError = processXorLevelNodeOperand(fieldSet, node, node.rightOperand);
                    if (rightError !== undefined) {
                        return new Err(rightError);
                    } else {
                        return new Ok({ levelNodes: [], inField });
                    }
                }
            }
            default:
                throw new UnreachableCaseError('SFSPLN34445', node);
        }
    }

    function processXorLevelNodeOperand(fieldSet: ScanFieldSet, node: ScanFormula.XorNode, operand: ScanFormula.BooleanNode): ScanFieldSetLoadError | undefined {
        switch (operand.typeId) {
            case ScanFormula.NodeTypeId.And:
                return createError(ScanFieldSetLoadErrorTypeId.XorFieldHasAndChild);
            case ScanFormula.NodeTypeId.Or:
                return createError(ScanFieldSetLoadErrorTypeId.XorFieldHasOrChild);
            case ScanFormula.NodeTypeId.Xor:
                return createError(ScanFieldSetLoadErrorTypeId.XorFieldHasXorChild);
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
    ): ScanFieldSetLoadError | undefined {
        switch (node.typeId) {
            case ScanFormula.NodeTypeId.And:
                if (not) {
                    return createError(ScanFieldSetLoadErrorTypeId.AndFieldOperatorCannotBeNegated);
                } else {
                    throw new AssertInternalError('SFSPCNA55598', node.typeId.toString());
                }
            case ScanFormula.NodeTypeId.Or:
                if (not) {
                    return createError(ScanFieldSetLoadErrorTypeId.OrFieldOperatorCannotBeNegated);
                } else {
                    throw new AssertInternalError('SFSPCNO55598', node.typeId.toString());
                }
            case ScanFormula.NodeTypeId.Not:
                return processConditionNode(fieldSet, (node as ScanFormula.NotNode).operand, fieldOperationId, not);
            case ScanFormula.NodeTypeId.Xor:
                if (not) {
                    return createError(ScanFieldSetLoadErrorTypeId.XorFieldOperatorCannotBeNegated);
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
                return createError(ScanFieldSetLoadErrorTypeId.AllConditionNotSupported);
            case ScanFormula.NodeTypeId.None:
                return createError(ScanFieldSetLoadErrorTypeId.NoneConditionNotSupported);
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
        field: ScanField,
        createConditionResult: Result<ScanFieldCondition>,
    ): ScanFieldSetLoadError | undefined {
        if (createConditionResult.isErr()) {
            return createError(ScanFieldSetLoadErrorTypeId.FactoryCreateFieldConditionError, createConditionResult.error);
        } else {
            const condition = createConditionResult.value;

            if (field.conditionTypeId !== condition.typeId) {
                throw new AssertInternalError('SFSPCCR30812');
            } else {
                const conditions = field.conditions;
                if (conditions.count === 0) {
                    conditions.add(condition);
                } else {
                    if (!ScanField.isAnyConditionEqualTo(field, condition)) {
                        field.conditions.add(condition);
                    }
                }
                return undefined;
            }
        }
    }

    function tryGetField(
        fieldSet: ScanFieldSet,
        fieldTypeId: ScanField.TypeId,
        fieldId: ScanFormula.FieldId,
        subFieldId: Integer | undefined,
        conditionsOperationId: ScanField.BooleanOperationId,
    ): Result<ScanField, ScanFieldSetLoadError> {
        const fields = fieldSet.fields;
        let field = tryFindField(fields, fieldId);
        if (field === undefined) {
            const fieldCreateResult = tryCreateField(fieldSet, fieldTypeId, fieldId, subFieldId);
            if (fieldCreateResult.isErr()) {
                const error = fieldCreateResult.error;
                return createErrResult(ScanFieldSetLoadErrorTypeId.FactoryCreateFieldError, error);
            } else {
                field = fieldCreateResult.value;
                fields.add(field);
                return new Ok(field);
            }
        } else {
            if (field.conditionsOperationId !== conditionsOperationId) {
                return createErrResult(ScanFieldSetLoadErrorTypeId.fieldConditionsOperationIdMismatch, field.typeId.toString());
            } else {
                return new Ok(field);
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

    function tryCreateField(fieldSet: ScanFieldSet, fieldTypeId: ScanField.TypeId, fieldId: ScanFormula.FieldId, subFieldId: Integer | undefined): Result<ScanField> {
        const factory = fieldSet.fieldFactory;
        switch (fieldTypeId) {
            case ScanField.TypeId.NumericInRange: return factory.createNumericInRange(fieldSet, fieldId as ScanFormula.NumericRangeFieldId);
            case ScanField.TypeId.PriceSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.PriceSubbed) {
                        throw new AssertInternalError('SFSTCFPS67631', fieldId.toString());
                    } else {
                        return factory.createPriceSubbed(fieldSet, subFieldId as ScanFormula.PriceSubFieldId);
                    }
                }
            case ScanField.TypeId.DateInRange: return factory.createDateInRange(fieldSet, fieldId as ScanFormula.DateRangeFieldId);
            case ScanField.TypeId.DateSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.DateSubbed) {
                        throw new AssertInternalError('SFSTCFDS67631', fieldId.toString());
                    } else {
                        return factory.createDateSubbed(fieldSet, subFieldId as ScanFormula.DateSubFieldId);
                    }
                }
            case ScanField.TypeId.TextContains: return factory.createTextContains(fieldSet, fieldId as ScanFormula.TextContainsFieldId);
            case ScanField.TypeId.AltCodeSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.AltCodeSubbed) {
                        throw new AssertInternalError('SFSTCFACS67631', fieldId.toString());
                    } else {
                        return factory.createAltCodeSubbed(fieldSet, subFieldId as ScanFormula.AltCodeSubFieldId);
                    }
                }
            case ScanField.TypeId.AttributeSubbed:
                if (subFieldId === undefined) {
                    throw new AssertInternalError('SFSTCFS67631', fieldId.toString());
                } else {
                    if (fieldId !== ScanFormula.FieldId.AttributeSubbed) {
                        throw new AssertInternalError('SFSTCFACS67631', fieldId.toString());
                    } else {
                        return factory.createAttributeSubbed(fieldSet, subFieldId as ScanFormula.AttributeSubFieldId);
                    }
                }
            case ScanField.TypeId.TextEquals: return factory.createTextEquals(fieldSet, fieldId as ScanFormula.TextEqualsFieldId);
            case ScanField.TypeId.TextHasValueEquals: return factory.createTextHasValueEquals(fieldSet, fieldId as ScanFormula.TextHasValueEqualsFieldId);
            case ScanField.TypeId.StringOverlaps: return factory.createStringOverlaps(fieldSet, fieldId as ScanFormula.StringOverlapsFieldId);
            case ScanField.TypeId.MarketBoardOverlaps: return factory.createMarketBoardOverlaps(fieldSet, fieldId as ScanFormula.FieldId.MarketBoard);
            case ScanField.TypeId.CurrencyOverlaps: return factory.createCurrencyOverlaps(fieldSet, fieldId as ScanFormula.FieldId.Currency);
            case ScanField.TypeId.ExchangeOverlaps: return factory.createExchangeOverlaps(fieldSet, fieldId as ScanFormula.FieldId.Exchange);
            case ScanField.TypeId.MarketOverlaps: return factory.createMarketOverlaps(fieldSet, fieldId as ScanFormula.MarketOverlapsFieldId);
            case ScanField.TypeId.Is: return factory.createIs(fieldSet, fieldId as ScanFormula.FieldId.Is);
            default:
                throw new UnreachableCaseError('SFSTCFFC29287', fieldTypeId);
        }
    }

    function createErrResult<T>(typeId: ScanFieldSetLoadErrorTypeId, extra?: string): Result<T, ScanFieldSetLoadError> {
        const error = createError(typeId, extra);
        return new Err<T, ScanFieldSetLoadError>(error);
    }

    function createError(typeId: ScanFieldSetLoadErrorTypeId, extra?: string): ScanFieldSetLoadError {
        return {
            typeId,
            extra,
        };
    }

    // processConditionNode cases

    function processFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.FieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const conditionFactory = fieldSet.conditionFactory;
        const fieldId = node.fieldId;
        const styleId = ScanFormula.Field.idToStyleId(fieldId);
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        switch (styleId) {
            case ScanFormula.Field.StyleId.InRange: {
                switch (dataTypeId) {
                    case ScanFormula.Field.DataTypeId.Numeric: {
                        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.NumericInRange, fieldId, undefined, fieldOperationId);
                        if (tryGetFieldResult.isErr()) {
                            return tryGetFieldResult.error;
                        } else {
                            const scanField = tryGetFieldResult.value;
                            let createConditionResult: Result<ScanFieldCondition>;
                            if (not) {
                                createConditionResult = conditionFactory.createNumericComparisonWithHasValue(scanField, ScanFieldCondition.OperatorId.NotHasValue);
                            } else {
                                createConditionResult = conditionFactory.createNumericComparisonWithHasValue(scanField, ScanFieldCondition.OperatorId.HasValue);
                            }
                            return processCreateConditionResult(fieldSet, scanField, createConditionResult);
                        }
                    }
                    case ScanFormula.Field.DataTypeId.Date: {
                        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.DateInRange, fieldId, undefined, fieldOperationId);
                        if (tryGetFieldResult.isErr()) {
                            return tryGetFieldResult.error;
                        } else {
                            const scanField = tryGetFieldResult.value;
                            let createConditionResult: Result<ScanFieldCondition>;
                            if (not) {
                                createConditionResult = conditionFactory.createDateWithHasValue(scanField, ScanFieldCondition.OperatorId.NotHasValue);
                            } else {
                                createConditionResult = conditionFactory.createDateWithHasValue(scanField, ScanFieldCondition.OperatorId.HasValue);
                            }
                            return processCreateConditionResult(fieldSet, scanField, createConditionResult);
                        }
                    }
                    case ScanFormula.Field.DataTypeId.Text:
                        throw new AssertInternalError('SFSPFHVNRT50718');
                    case ScanFormula.Field.DataTypeId.Boolean:
                        throw new AssertInternalError('SFSPFHVNRB50718');
                    default:
                        throw new UnreachableCaseError('SFSPFHVNRD50718', dataTypeId);
                }
            }
            case ScanFormula.Field.StyleId.Overlaps:
                throw new AssertInternalError('SFSPFHVNM50718');
            case ScanFormula.Field.StyleId.Equals:
                throw new AssertInternalError('SFSPFHVNES50718');
            case ScanFormula.Field.StyleId.HasValueEquals: {
                if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
                    throw new AssertInternalError('SFSPFHVNESNT50718');
                } else {
                    const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.TextHasValueEquals, fieldId, undefined, fieldOperationId);
                    if (tryGetFieldResult.isErr()) {
                        return tryGetFieldResult.error;
                    } else {
                        const scanField = tryGetFieldResult.value;
                        let createConditionResult: Result<ScanFieldCondition>;
                        if (not) {
                            createConditionResult = conditionFactory.createTextHasValueEqualsWithHasValue(scanField, ScanFieldCondition.OperatorId.NotHasValue);
                        } else {
                            createConditionResult = conditionFactory.createTextHasValueEqualsWithHasValue(scanField, ScanFieldCondition.OperatorId.HasValue);
                        }
                        return processCreateConditionResult(fieldSet, scanField, createConditionResult);
                    }
                }
            }
            case ScanFormula.Field.StyleId.Contains:
                throw new AssertInternalError('SFSPFHVNT50718');
            default:
                throw new UnreachableCaseError('SFSPFHVND50718', styleId);
        }
    }

    function processNumericComparisonBooleanNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.NumericComparisonBooleanNode,
        fieldOperationId: ScanField.BooleanOperationId,
        conditionOperatorId: NumericComparisonScanFieldCondition.ValueOperands.OperatorId,
    ): ScanFieldSetLoadError | undefined {
        let fieldId: ScanFormula.FieldId;
        let value: number;
        const leftOperand = node.leftOperand;
        const leftIsField = ScanFormula.NumericComparisonBooleanNode.isOperandNumericFieldValueGet(leftOperand);
        const rightOperand = node.rightOperand;
        const rightIsField = ScanFormula.NumericComparisonBooleanNode.isOperandNumericFieldValueGet(rightOperand);
        if (leftIsField) {
            const rightIsNumber = ScanFormula.NumericComparisonBooleanNode.isOperandValue(rightOperand);
            if (rightIsNumber) {
                fieldId = leftOperand.fieldId;
                value = rightOperand;
            } else {
                return createError(ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
                    leftOperand.fieldId.toString(),
                );
            }
        } else {
            if (rightIsField) {
                const leftIsNumber = ScanFormula.NumericComparisonBooleanNode.isOperandValue(leftOperand);
                if (leftIsNumber) {
                    fieldId = rightOperand.fieldId;
                    value = leftOperand;
                } else {
                    return createError(
                        ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
                        rightOperand.fieldId.toString(),
                    );
                }
            } else {
                return createError(
                    ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumericFieldValueGetOperand,
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    `{${leftOperand.toString()}, ${rightOperand.toString()}}`
                );
            }
        }
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.NumericInRange, fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const createConditionResult = fieldSet.conditionFactory.createNumericComparisonWithValue(field, conditionOperatorId, value);
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processNumericFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.NumericFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.NumericInRange, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const value = node.value;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createNumericComparisonWithValue(field, ScanFieldCondition.OperatorId.NotEquals, value);
            } else {
                createConditionResult = conditionFactory.createNumericComparisonWithValue(field, ScanFieldCondition.OperatorId.Equals, value);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processNumericFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.NumericFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.NumericInRange, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const min = node.min;
            const max = node.max;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createNumericComparisonWithRange(field, ScanFieldCondition.OperatorId.NotInRange, min, max);
            } else {
                createConditionResult = conditionFactory.createNumericComparisonWithRange(field, ScanFieldCondition.OperatorId.InRange, min, max);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processPriceSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.PriceSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.PriceSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createNumericWithHasValue(field, ScanFieldCondition.OperatorId.NotHasValue);
            } else {
                createConditionResult = conditionFactory.createNumericWithHasValue(field, ScanFieldCondition.OperatorId.HasValue);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processPriceSubFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.PriceSubFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.PriceSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const value = node.value;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createNumericWithValue(field, ScanFieldCondition.OperatorId.NotEquals, value);
            } else {
                createConditionResult = conditionFactory.createNumericWithValue(field, ScanFieldCondition.OperatorId.Equals, value);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processPriceSubFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.PriceSubFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.PriceSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const min = node.min;
            const max = node.max;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createNumericWithRange(field, ScanFieldCondition.OperatorId.NotInRange, min, max);
            } else {
                createConditionResult = conditionFactory.createNumericWithRange(field, ScanFieldCondition.OperatorId.InRange, min, max);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processDateFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.DateInRange, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const value = SourceTzOffsetDateTime.createCopy(node.value);
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createDateWithEquals(field, ScanFieldCondition.OperatorId.NotEquals, value);
            } else {
                createConditionResult = conditionFactory.createDateWithEquals(field, ScanFieldCondition.OperatorId.Equals, value);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processDateFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.DateInRange, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const min = SourceTzOffsetDateTime.newUndefinable(node.min);
            const max = SourceTzOffsetDateTime.newUndefinable(node.max);
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createDateWithRange(field, ScanFieldCondition.OperatorId.NotInRange, min, max);
            } else {
                createConditionResult = conditionFactory.createDateWithRange(field, ScanFieldCondition.OperatorId.InRange, min, max);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processDateSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.DateSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createDateWithHasValue(field, ScanFieldCondition.OperatorId.NotHasValue);
            } else {
                createConditionResult = conditionFactory.createDateWithHasValue(field, ScanFieldCondition.OperatorId.HasValue);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processDateSubFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateSubFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.DateSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const value = SourceTzOffsetDateTime.createCopy(node.value);
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createDateWithEquals(field, ScanFieldCondition.OperatorId.NotEquals, value);
            } else {
                createConditionResult = conditionFactory.createDateWithEquals(field, ScanFieldCondition.OperatorId.Equals, value);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processDateSubFieldInRangeNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.DateSubFieldInRangeNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.DateSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const min = SourceTzOffsetDateTime.newUndefinable(node.min);
            const max = SourceTzOffsetDateTime.newUndefinable(node.max);
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createDateWithRange(field, ScanFieldCondition.OperatorId.NotInRange, min, max);
            } else {
                createConditionResult = conditionFactory.createDateWithRange(field, ScanFieldCondition.OperatorId.InRange, min, max);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processTextFieldEqualsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.TextFieldEqualsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): ScanFieldSetLoadError | undefined {
        const fieldId = node.fieldId;
        const conditionFactory = fieldSet.conditionFactory;
        const styleId = ScanFormula.Field.idToStyleId(fieldId);
        switch (styleId) {
            case ScanFormula.Field.StyleId.InRange:
                throw new AssertInternalError('SFSPTFENIR50718');
            case ScanFormula.Field.StyleId.Overlaps:
                throw new AssertInternalError('SFSPTFENO50718');
            case ScanFormula.Field.StyleId.Equals: {
                const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.TextEquals, fieldId, undefined, fieldOperationId);
                if (tryGetFieldResult.isErr()) {
                    return tryGetFieldResult.error;
                } else {
                    const field = tryGetFieldResult.value;
                    const value = node.value;
                    let createConditionResult: Result<ScanFieldCondition>;
                    if (not) {
                        createConditionResult = conditionFactory.createTextEquals(field, ScanFieldCondition.OperatorId.NotEquals, value);
                    } else {
                        createConditionResult = conditionFactory.createTextEquals(field, ScanFieldCondition.OperatorId.Equals, value);
                    }
                    return processCreateConditionResult(fieldSet, field, createConditionResult);
                }
            }
            case ScanFormula.Field.StyleId.HasValueEquals: {
                const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.TextHasValueEquals, fieldId, undefined, fieldOperationId);
                if (tryGetFieldResult.isErr()) {
                    return tryGetFieldResult.error;
                } else {
                    const field = tryGetFieldResult.value;
                    const value = node.value;
                    let createConditionResult: Result<ScanFieldCondition>;
                    if (not) {
                        createConditionResult = conditionFactory.createTextHasValueEqualsWithValue(field, ScanFieldCondition.OperatorId.NotEquals, value);
                    } else {
                        createConditionResult = conditionFactory.createTextHasValueEqualsWithValue(field, ScanFieldCondition.OperatorId.Equals, value);
                    }
                    return processCreateConditionResult(fieldSet, field, createConditionResult);
                }
            }
            case ScanFormula.Field.StyleId.Contains:
                throw new AssertInternalError('SFSPTFENC50718');
            default:
                throw new UnreachableCaseError('SFSPTFEND50718', styleId);
        }
    }

    function processTextFieldContainsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.TextFieldContainsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.TextContains, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const value = node.value;
            const asId = node.asId;
            const ignoreCase = node.ignoreCase;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createTextContains(field, ScanFieldCondition.OperatorId.NotContains, value, asId, ignoreCase);
            } else {
                createConditionResult = conditionFactory.createTextContains(field, ScanFieldCondition.OperatorId.Contains, value, asId, ignoreCase);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processAltCodeSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AltCodeSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.AltCodeSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createTextHasValueContainsWithHasValue(field, ScanFieldCondition.OperatorId.NotHasValue);
            } else {
                createConditionResult = conditionFactory.createTextHasValueContainsWithHasValue(field, ScanFieldCondition.OperatorId.HasValue);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processAltCodeSubFieldContainsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AltCodeSubFieldContainsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.AltCodeSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const value = node.value;
            const asId = node.asId;
            const ignoreCase = node.ignoreCase;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createTextHasValueContainsWithContains(field, ScanFieldCondition.OperatorId.NotContains, value, asId, ignoreCase);
            } else {
                createConditionResult = conditionFactory.createTextHasValueContainsWithContains(field, ScanFieldCondition.OperatorId.Contains, value, asId, ignoreCase);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processAttributeSubFieldHasValueNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AttributeSubFieldHasValueNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.AttributeSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createTextHasValueContainsWithHasValue(field, ScanFieldCondition.OperatorId.NotHasValue);
            } else {
                createConditionResult = conditionFactory.createTextHasValueContainsWithHasValue(field, ScanFieldCondition.OperatorId.HasValue);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processAttributeSubFieldContainsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.AttributeSubFieldContainsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.AttributeSubbed, node.fieldId, node.subFieldId, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const value = node.value;
            const asId = node.asId;
            const ignoreCase = node.ignoreCase;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createTextHasValueContainsWithContains(field, ScanFieldCondition.OperatorId.NotContains, value, asId, ignoreCase);
            } else {
                createConditionResult = conditionFactory.createTextHasValueContainsWithContains(field, ScanFieldCondition.OperatorId.Contains, value, asId, ignoreCase);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processStringFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.StringFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.StringOverlaps, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const values = node.values;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createStringOverlaps(field, ScanFieldCondition.OperatorId.NotOverlaps, values);
            } else {
                createConditionResult = conditionFactory.createStringOverlaps(field, ScanFieldCondition.OperatorId.Overlaps, values);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processCurrencyFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.CurrencyFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.CurrencyOverlaps, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const values = node.values;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createCurrencyOverlaps(field, ScanFieldCondition.OperatorId.NotOverlaps, values);
            } else {
                createConditionResult = conditionFactory.createCurrencyOverlaps(field, ScanFieldCondition.OperatorId.Overlaps, values);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processExchangeFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.ExchangeFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.ExchangeOverlaps, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const values = node.values;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createExchangeOverlaps(field, ScanFieldCondition.OperatorId.NotOverlaps, values);
            } else {
                createConditionResult = conditionFactory.createExchangeOverlaps(field, ScanFieldCondition.OperatorId.Overlaps, values);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processMarketFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.MarketFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.MarketOverlaps, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const values = node.values;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createMarketOverlaps(field, ScanFieldCondition.OperatorId.NotOverlaps, values);
            } else {
                createConditionResult = conditionFactory.createMarketOverlaps(field, ScanFieldCondition.OperatorId.Overlaps, values);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processMarketBoardFieldOverlapsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.MarketBoardFieldOverlapsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.MarketBoardOverlaps, node.fieldId, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const values = node.values;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createMarketBoardOverlaps(field, ScanFieldCondition.OperatorId.NotOverlaps, values);
            } else {
                createConditionResult = conditionFactory.createMarketBoardOverlaps(field, ScanFieldCondition.OperatorId.Overlaps, values);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
    }

    function processIsNode(
        fieldSet: ScanFieldSet,
        node: ScanFormula.IsNode,
        fieldOperationId: ScanField.BooleanOperationId,
        not: boolean,
    ): ScanFieldSetLoadError | undefined {
        const tryGetFieldResult = tryGetField(fieldSet, ScanField.TypeId.Is, ScanFormula.FieldId.Is, undefined, fieldOperationId);
        if (tryGetFieldResult.isErr()) {
            return tryGetFieldResult.error;
        } else {
            const field = tryGetFieldResult.value;
            const categoryId = node.categoryId;
            const conditionFactory = fieldSet.conditionFactory;
            let createConditionResult: Result<ScanFieldCondition>;
            if (not) {
                createConditionResult = conditionFactory.createIs(field, ScanFieldCondition.OperatorId.NotIs, categoryId);
            } else {
                createConditionResult = conditionFactory.createIs(field, ScanFieldCondition.OperatorId.Is, categoryId);
            }
            return processCreateConditionResult(fieldSet, field, createConditionResult);
        }
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

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Zenith, ZenithConvert, ZenithScanCriteria } from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import {
    AssertInternalError,
    BaseZenithDataError,
    Err,
    ExternalError,
    Integer,
    Ok,
    Result,
    SourceTzOffsetDateTime,
    UnreachableCaseError
} from "../sys/sys-internal-api";
import { ScanCriteria } from './scan-criteria';

export namespace ZenithScanCriteriaConvert {
    export class ParseProgress {
        private _nodeCount = 0;
        private _nodeDepth = 0;
        private _parsedNodes = new Array<ParseProgress.ParsedNode>(0);

        get tupleNodeCount() { return this._nodeCount; }
        get tupleNodeDepth() { return this._nodeDepth; }
        get parsedNodes(): readonly ParseProgress.ParsedNode[] { return this._parsedNodes; }

        enterTupleNode() {
            this._nodeDepth++;
            this._nodeCount++;
        }

        addParsedNode(nodeType: ZenithScanCriteria.TupleNodeType): ParseProgress.ParsedNode {
            const parsedNode: ParseProgress.ParsedNode = {
                nodeDepth: this._nodeDepth,
                tupleNodeType: nodeType,
                nodeTypeId: undefined,
            }
            this._parsedNodes.push(parsedNode);

            return parsedNode;
        }

        exitTupleNode(parsedNode: ParseProgress.ParsedNode, nodeTypeId: ScanCriteria.NodeTypeId) {
            parsedNode.nodeTypeId = nodeTypeId;
            this._nodeDepth--;
        }
    }

    export namespace ParseProgress {
        export interface ParsedNode {
            nodeDepth: number;
            tupleNodeType: ZenithScanCriteria.TupleNodeType;
            nodeTypeId: ScanCriteria.NodeTypeId | undefined;
        }
    }

    export interface ParsedBoolean {
        node: ScanCriteria.BooleanNode;
        progress: ParseProgress;
    }

    export class ZenithScanCriteriaParseError extends BaseZenithDataError {
        constructor(code: ExternalError.Code, message: string) {
            super(StringId.ZenithScanCriteriaParseError, code, message);
        }

        parseProgress: ParseProgress;
    }

    export function fromBooleanNode(node: ScanCriteria.BooleanNode): ZenithScanCriteria.BooleanTupleNode {
        switch (node.typeId) {
            case ScanCriteria.NodeTypeId.And: return fromMultiOperandBooleanNode(ZenithScanCriteria.AndTupleNodeType, node as ScanCriteria.MultiOperandBooleanNode);
            case ScanCriteria.NodeTypeId.Or: return fromMultiOperandBooleanNode(ZenithScanCriteria.OrTupleNodeType, node as ScanCriteria.MultiOperandBooleanNode);
            case ScanCriteria.NodeTypeId.Not: return fromSingleOperandBooleanNode(ZenithScanCriteria.NotTupleNodeType, node as ScanCriteria.SingleOperandBooleanNode);
            case ScanCriteria.NodeTypeId.NumericEquals: return fromNumericComparisonNode(ZenithScanCriteria.EqualTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericGreaterThan: return fromNumericComparisonNode(ZenithScanCriteria.GreaterThanTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericGreaterThanOrEqual: return fromNumericComparisonNode(ZenithScanCriteria.GreaterThanOrEqualTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericLessThan: return fromNumericComparisonNode(ZenithScanCriteria.LessThanTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericLessThanOrEqual: return fromNumericComparisonNode(ZenithScanCriteria.LessThanOrEqualTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.All: return [ZenithScanCriteria.AllTupleNodeType];
            case ScanCriteria.NodeTypeId.None: return [ZenithScanCriteria.NoneTupleNodeType];
            case ScanCriteria.NodeTypeId.FieldHasValue: return fromFieldHasValueNode(node as ScanCriteria.FieldHasValueNode);
            case ScanCriteria.NodeTypeId.BooleanFieldEquals: return fromBooleanFieldEqualsNode(node as ScanCriteria.BooleanFieldEqualsNode);
            case ScanCriteria.NodeTypeId.NumericFieldEquals: return fromNumericFieldEqualsNode(node as ScanCriteria.NumericFieldEqualsNode);
            case ScanCriteria.NodeTypeId.NumericFieldInRange: return fromNumericFieldInRangeNode(node as ScanCriteria.NumericFieldInRangeNode);
            case ScanCriteria.NodeTypeId.DateFieldEquals: return fromDateFieldEqualsNode(node as ScanCriteria.DateFieldEqualsNode);
            case ScanCriteria.NodeTypeId.DateFieldInRange: return fromDateFieldInRangeNode(node as ScanCriteria.DateFieldInRangeNode);
            case ScanCriteria.NodeTypeId.TextFieldContains: return fromTextFieldContainsNode(node as ScanCriteria.TextFieldContainsNode);
            case ScanCriteria.NodeTypeId.SubFieldHasValue: return fromSubFieldHasValueNode(node as ScanCriteria.SubFieldHasValueNode);
            case ScanCriteria.NodeTypeId.PriceSubFieldHasValue: return fromPriceSubFieldHasValueNode(node as ScanCriteria.PriceSubFieldHasValueNode);
            case ScanCriteria.NodeTypeId.PriceSubFieldEquals: return fromPriceSubFieldEqualsNode(node as ScanCriteria.PriceSubFieldEqualsNode);
            case ScanCriteria.NodeTypeId.PriceSubFieldInRange: return fromPriceSubFieldInRangeNode(node as ScanCriteria.PriceSubFieldInRangeNode);
            case ScanCriteria.NodeTypeId.DateSubFieldHasValue: return fromDateSubFieldHasValueNode(node as ScanCriteria.DateSubFieldHasValueNode);
            case ScanCriteria.NodeTypeId.DateSubFieldEquals: return fromDateSubFieldEqualsNode(node as ScanCriteria.DateSubFieldEqualsNode);
            case ScanCriteria.NodeTypeId.DateSubFieldInRange: return fromDateSubFieldInRangeNode(node as ScanCriteria.DateSubFieldInRangeNode);
            case ScanCriteria.NodeTypeId.AltCodeSubFieldHasValue: return fromAltCodeSubFieldHasValueNode(node as ScanCriteria.AltCodeSubFieldHasValueNode);
            case ScanCriteria.NodeTypeId.AltCodeSubFieldContains: return fromAltCodeSubFieldContainsNode(node as ScanCriteria.AltCodeSubFieldContainsNode);
            case ScanCriteria.NodeTypeId.AttributeSubFieldHasValue: return fromAttributeSubFieldHasValueNode(node as ScanCriteria.AttributeSubFieldHasValueNode);
            case ScanCriteria.NodeTypeId.AttributeSubFieldContains: return fromAttributeSubFieldContainsNode(node as ScanCriteria.AttributeSubFieldContainsNode);
            default:
                throw new UnreachableCaseError('ZSCCFBN90042', node.typeId)
        }
    }

    export function parseBoolean(node: ZenithScanCriteria.BooleanTupleNode): Result<ParsedBoolean, ZenithScanCriteriaParseError> {
        const parseProgress = new ParseProgress();

        const toResult = tryToExpectedBooleanNode(node, parseProgress);

        if (toResult.isOk()) {
            const parsedBoolean: ParsedBoolean = {
                node: toResult.value,
                progress: parseProgress,
            }
            return new Ok(parsedBoolean);
        } else {
            toResult.error.parseProgress = parseProgress;
            return toResult;
        }
    }

    function fromMultiOperandBooleanNode(
        type: typeof ZenithScanCriteria.AndTupleNodeType | typeof ZenithScanCriteria.OrTupleNodeType,
        node: ScanCriteria.MultiOperandBooleanNode
    ): ZenithScanCriteria.LogicalTupleNode {
        const operands = node.operands;
        const count = operands.length;
        const params = new Array<ZenithScanCriteria.BooleanParam>(count);
        for (let i = 0; i < count; i++) {
            const operand = operands[i];
            const tupleNode = fromBooleanNode(operand);
            params[i] = tupleNode;
        }

        return [type, ...params];
    }

    function fromSingleOperandBooleanNode(type: typeof ZenithScanCriteria.NotTupleNodeType, node: ScanCriteria.SingleOperandBooleanNode): ZenithScanCriteria.LogicalTupleNode {
        const param = fromBooleanNode(node);
        return [type, param];
    }

    function fromNumericComparisonNode(
        type:
            typeof ZenithScanCriteria.EqualTupleNodeType |
            typeof ZenithScanCriteria.GreaterThanTupleNodeType |
            typeof ZenithScanCriteria.GreaterThanOrEqualTupleNodeType |
            typeof ZenithScanCriteria.LessThanTupleNodeType |
            typeof ZenithScanCriteria.LessThanOrEqualTupleNodeType,
        node: ScanCriteria.NumericComparisonBooleanNode
    ): ZenithScanCriteria.ComparisonTupleNode {
        const leftOperand = fromNumericOperand(node.leftOperand);
        const rightOperand = fromNumericOperand(node.leftOperand);
        return [type, leftOperand, rightOperand];
    }

    function fromNumericOperand(operand: ScanCriteria.NumericNode | number): ZenithScanCriteria.NumericParam {
        if (operand instanceof ScanCriteria.NumericNode) {
            return fromNumericNodeParam(operand)
        } else {
            return operand;
        }
    }

    function fromNumericNodeParam(node: ScanCriteria.NumericNode): ZenithScanCriteria.NumericParam {
        switch (node.typeId) {
            case ScanCriteria.NodeTypeId.NumericAdd: return fromLeftRightArithmeticNumericNodeParam(ZenithScanCriteria.AddTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericDiv: return fromLeftRightArithmeticNumericNodeParam(ZenithScanCriteria.DivTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericMod: return fromLeftRightArithmeticNumericNodeParam(ZenithScanCriteria.ModTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericMul: return fromLeftRightArithmeticNumericNodeParam(ZenithScanCriteria.MulTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericSub: return fromLeftRightArithmeticNumericNodeParam(ZenithScanCriteria.SubTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericNeg: return fromUnaryArithmeticNumericNodeParam(ZenithScanCriteria.NegTupleNodeType, node as ScanCriteria.UnaryArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericPos: return fromUnaryArithmeticNumericNodeParam(ZenithScanCriteria.PosTupleNodeType, node as ScanCriteria.UnaryArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericAbs: return fromUnaryArithmeticNumericNodeParam(ZenithScanCriteria.AbsTupleNodeType, node as ScanCriteria.UnaryArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericFieldValueGet: return fromNumericFieldValueGetNode(node as ScanCriteria.NumericFieldValueGetNode);
            case ScanCriteria.NodeTypeId.NumericIf: return fromNumericIfNode(node as ScanCriteria.NumericIfNode);
            default:
                throw new UnreachableCaseError('ZSCCFNNPU', node.typeId);
        }
    }

    function fromUnaryArithmeticNumericNodeParam(
        type:
            typeof ZenithScanCriteria.NegTupleNodeType |
            typeof ZenithScanCriteria.PosTupleNodeType |
            typeof ZenithScanCriteria.AbsTupleNodeType,
        node: ScanCriteria.UnaryArithmeticNumericNode
    ): ZenithScanCriteria.UnaryExpressionTupleNode {
        const operand = node.operand;
        let param: ZenithScanCriteria.NumericParam;
        if (operand instanceof ScanCriteria.NumericNode) {
            param = fromNumericNodeParam(operand);
        } else {
            param = operand;
        }

        return [type, param];
    }

    function fromLeftRightArithmeticNumericNodeParam(
        type:
            typeof ZenithScanCriteria.AddTupleNodeType |
            typeof ZenithScanCriteria.DivTupleNodeType |
            typeof ZenithScanCriteria.ModTupleNodeType |
            typeof ZenithScanCriteria.MulTupleNodeType |
            typeof ZenithScanCriteria.SubTupleNodeType,
        node: ScanCriteria.LeftRightArithmeticNumericNode
    ): ZenithScanCriteria.BinaryExpressionTupleNode {
        const leftOperand = node.leftOperand;
        let leftParam: ZenithScanCriteria.NumericParam;
        if (leftOperand instanceof ScanCriteria.NumericNode) {
            leftParam = fromNumericNodeParam(leftOperand);
        } else {
            leftParam = leftOperand;
        }

        const rightOperand = node.rightOperand;
        let rightParam: ZenithScanCriteria.NumericParam;
        if (rightOperand instanceof ScanCriteria.NumericNode) {
            rightParam = fromNumericNodeParam(rightOperand);
        } else {
            rightParam = rightOperand;
        }

        return [type, leftParam, rightParam];
    }

    function fromNumericFieldValueGetNode(node: ScanCriteria.NumericFieldValueGetNode): ZenithScanCriteria.NumericField {
        return Field.numericFromId(node.fieldId);
    }

    function fromNumericIfNode(node: ScanCriteria.NumericIfNode): ZenithScanCriteria.NumericIfTupleNode {
        const tupleLength = 3 + node.trueArms.length * 2; // 1 (type) + 2 * trueArms + 2 (falseArm)
        const tupleNode = new Array<unknown>(tupleLength);
        tupleNode[0] = ZenithScanCriteria.IfTupleNodeType;

        let index = 1;
        for (const arm of node.trueArms) {
            tupleNode[index++] = fromBooleanNode(arm.condition);
            tupleNode[index++] = fromNumericOperand(arm.value);
        }

        tupleNode[index++] = fromBooleanNode(node.falseArm.condition);
        tupleNode[index] = fromNumericOperand(node.falseArm.value);

        return tupleNode as ZenithScanCriteria.NumericIfTupleNode;
    }

    function fromBooleanFieldEqualsNode(node: ScanCriteria.BooleanFieldEqualsNode): ZenithScanCriteria.BooleanSingleMatchingTupleNode {
        const field = Field.booleanFromId(node.fieldId);
        const target = node.target;
        return [field, target];
    }

    function fromFieldHasValueNode(node: ScanCriteria.FieldHasValueNode):
            ZenithScanCriteria.NumericRangeMatchingTupleNode |
            ZenithScanCriteria.DateRangeMatchingTupleNode |
            ZenithScanCriteria.TextMatchingTupleNode {

        const fieldId = node.fieldId;
        const fieldDataTypeId = ScanCriteria.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanCriteria.FieldDataTypeId.Numeric: return [Field.numericFromId(fieldId as ScanCriteria.NumericFieldId)];
            case ScanCriteria.FieldDataTypeId.Text: return [Field.textFromId(fieldId as ScanCriteria.TextFieldId)];
            case ScanCriteria.FieldDataTypeId.Date: return [Field.dateFromId(fieldId as ScanCriteria.DateFieldId)];
            case ScanCriteria.FieldDataTypeId.Boolean: throw new AssertInternalError('ZSCCFFHVNB50916', `${fieldId}`); // No boolean field supports HasValue
            default:
                throw new UnreachableCaseError('ZSCCFFHVND50916', fieldDataTypeId);
        }
    }

    function fromNumericFieldEqualsNode(node: ScanCriteria.NumericFieldEqualsNode): ZenithScanCriteria.NumericRangeMatchingTupleNode {
        const field = Field.numericFromId(node.fieldId);
        const target = node.target;
        return [field, target];
    }

    function fromNumericFieldInRangeNode(node: ScanCriteria.NumericFieldInRangeNode): ZenithScanCriteria.NumericRangeMatchingTupleNode {
        const field = Field.numericFromId(node.fieldId);
        const namedParameters: ZenithScanCriteria.NumericNamedParameters = {
            Min: node.min,
            Max: node.max,
        }
        return [field, namedParameters];
    }

    function fromDateFieldEqualsNode(node: ScanCriteria.DateFieldEqualsNode): ZenithScanCriteria.DateRangeMatchingTupleNode {
        const field = Field.dateFromId(node.fieldId);
        const target = DateValue.fromDate(node.target.utcDate);
        return [field, target];
    }

    function fromDateFieldInRangeNode(node: ScanCriteria.DateFieldInRangeNode): ZenithScanCriteria.DateRangeMatchingTupleNode {
        const field = Field.dateFromId(node.fieldId);
        const nodeMin = node.min;
        const nodeMax = node.max;
        const namedParameters: ZenithScanCriteria.DateNamedParameters = {
            Min: nodeMin === undefined ? undefined: DateValue.fromDate(nodeMin.utcDate),
            Max: nodeMax === undefined ? undefined: DateValue.fromDate(nodeMax.utcDate),
        }
        return [field, namedParameters];
    }

    function fromTextFieldContainsNode(node: ScanCriteria.TextFieldContainsNode): ZenithScanCriteria.TextMatchingTupleNode {
        const field = Field.textFromId(node.fieldId);
        const value = node.value;
        const as = TextContainsAs.fromId(node.asId);
        const namedParameters: ZenithScanCriteria.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, value, namedParameters];
    }

    function fromSubFieldHasValueNode(node: ScanCriteria.SubFieldHasValueNode):
            ZenithScanCriteria.NumericNamedRangeMatchingTupleNode |
            ZenithScanCriteria.DateNamedRangeMatchingTupleNode |
            ZenithScanCriteria.NamedTextMatchingTupleNode {
        const fieldId = node.fieldId;
        switch (fieldId) {
            case ScanCriteria.FieldId.Price: return fromPriceSubFieldHasValue(node.subFieldId as ScanCriteria.PriceSubFieldId);
            case ScanCriteria.FieldId.Date: return fromDateSubFieldHasValue(node.subFieldId as ScanCriteria.DateSubFieldId);
            case ScanCriteria.FieldId.AltCode: return fromAltCodeSubFieldHasValue(node.subFieldId as ScanCriteria.AltCodeSubFieldId);
            case ScanCriteria.FieldId.Attribute: return fromAttributeSubFieldHasValue(node.subFieldId as ScanCriteria.AttributeSubFieldId);
            default:
                throw new UnreachableCaseError('ZSCCFSFHVN55592', fieldId);
        }
    }

    function fromPriceSubFieldHasValueNode(node: ScanCriteria.PriceSubFieldHasValueNode): ZenithScanCriteria.NumericNamedRangeMatchingTupleNode {
        return fromPriceSubFieldHasValue(node.subFieldId);
    }

    function fromPriceSubFieldHasValue(subFieldId: ScanCriteria.PriceSubFieldId): ZenithScanCriteria.NumericNamedRangeMatchingTupleNode {
        const field = ZenithScanCriteria.PriceTupleNodeType;
        const subField = PriceSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromPriceSubFieldEqualsNode(node: ScanCriteria.PriceSubFieldEqualsNode): ZenithScanCriteria.NumericNamedRangeMatchingTupleNode {
        const field = ZenithScanCriteria.PriceTupleNodeType;
        const subField = PriceSubField.fromId(node.subFieldId);
        const target = node.target;
        return [field, subField, target];
    }

    function fromPriceSubFieldInRangeNode(node: ScanCriteria.PriceSubFieldInRangeNode): ZenithScanCriteria.NumericNamedRangeMatchingTupleNode {
        const field = ZenithScanCriteria.PriceTupleNodeType;
        const subField = PriceSubField.fromId(node.subFieldId);
        const namedParameters: ZenithScanCriteria.NumericNamedParameters = {
            Min: node.min,
            Max: node.max,
        }
        return [field, subField, namedParameters];
    }

    function fromDateSubFieldHasValueNode(node: ScanCriteria.DateSubFieldHasValueNode): ZenithScanCriteria.DateNamedRangeMatchingTupleNode {
        return fromDateSubFieldHasValue(node.subFieldId);
    }

    function fromDateSubFieldHasValue(subFieldId: ScanCriteria.DateSubFieldId): ZenithScanCriteria.DateNamedRangeMatchingTupleNode {
        const field = ZenithScanCriteria.DateTupleNodeType;
        const subField = DateSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromDateSubFieldEqualsNode(node: ScanCriteria.DateSubFieldEqualsNode): ZenithScanCriteria.DateNamedRangeMatchingTupleNode {
        const field = ZenithScanCriteria.DateTupleNodeType;
        const subField = DateSubField.fromId(node.subFieldId);
        const target = DateValue.fromDate(node.target.utcDate);
        return [field, subField, target];
    }

    function fromDateSubFieldInRangeNode(node: ScanCriteria.DateSubFieldInRangeNode): ZenithScanCriteria.DateNamedRangeMatchingTupleNode {
        const field = ZenithScanCriteria.DateTupleNodeType;
        const subField = DateSubField.fromId(node.subFieldId);
        const nodeMin = node.min;
        const nodeMax = node.max;
        const namedParameters: ZenithScanCriteria.DateNamedParameters = {
            Min: nodeMin === undefined ? undefined: DateValue.fromDate(nodeMin.utcDate),
            Max: nodeMax === undefined ? undefined: DateValue.fromDate(nodeMax.utcDate),
        }
        return [field, subField, namedParameters];
    }

    function fromAltCodeSubFieldHasValueNode(node: ScanCriteria.AltCodeSubFieldHasValueNode): ZenithScanCriteria.NamedTextMatchingTupleNode {
        return fromAltCodeSubFieldHasValue(node.subFieldId);
    }

    function fromAltCodeSubFieldHasValue(subFieldId: ScanCriteria.AltCodeSubFieldId): ZenithScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithScanCriteria.AltCodeTupleNodeType;
        const subField = AltCodeSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromAltCodeSubFieldContainsNode(node: ScanCriteria.AltCodeSubFieldContainsNode): ZenithScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithScanCriteria.AltCodeTupleNodeType;
        const subField = AltCodeSubField.fromId(node.subFieldId);
        const value = node.value;
        const as = TextContainsAs.fromId(node.asId);
        const namedParameters: ZenithScanCriteria.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, subField, value, namedParameters];
    }

    function fromAttributeSubFieldHasValueNode(node: ScanCriteria.AttributeSubFieldHasValueNode): ZenithScanCriteria.NamedTextMatchingTupleNode {
        return fromAttributeSubFieldHasValue(node.subFieldId);
    }

    function fromAttributeSubFieldHasValue(subFieldId: ScanCriteria.AttributeSubFieldId): ZenithScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithScanCriteria.AttributeTupleNodeType;
        const subField = AttributeSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromAttributeSubFieldContainsNode(node: ScanCriteria.AttributeSubFieldContainsNode): ZenithScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithScanCriteria.AttributeTupleNodeType;
        const subField = AttributeSubField.fromId(node.subFieldId);
        const value = node.value;
        const as = TextContainsAs.fromId(node.asId);
        const namedParameters: ZenithScanCriteria.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, subField, value, namedParameters];
    }

    function tryToExpectedBooleanNode(node: ZenithScanCriteria.BooleanTupleNode, toProgress: ParseProgress): Result<ScanCriteria.BooleanNode, ZenithScanCriteriaParseError> {
        toProgress.enterTupleNode();
        if (!Array.isArray(node)) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_BooleanTupleNodeIsNotAnArray, ''))
        } else {
            if (node.length === 0) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_BooleanTupleNodeArrayIsZeroLength, ''))
            } else {
                const nodeType = node[0];
                if (typeof nodeType !== 'string') {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_BooleanTupleNodeTypeIsNotString, `${nodeType}`));
                } else {
                    const parsedNode = toProgress.addParsedNode(nodeType);

                    const result = tryToBooleanNode(node, toProgress)

                    if (result.isOk()) {
                        toProgress.exitTupleNode(parsedNode, result.value.typeId);
                    }

                    return result;
                }
            }
        }
    }

    function tryToBooleanNode(typleNode: ZenithScanCriteria.BooleanTupleNode, toProgress: ParseProgress): Result<ScanCriteria.BooleanNode, ZenithScanCriteriaParseError> {
        const nodeType = typleNode[0] as ZenithScanCriteria.BooleanTupleNodeType;

        switch (nodeType) {
            // Logical
            case ZenithScanCriteria.AndTupleNodeType: return tryToMultiOperandLogicalBooleanNode(typleNode as ZenithScanCriteria.LogicalTupleNode, ScanCriteria.AndNode, toProgress);
            case ZenithScanCriteria.OrTupleNodeType: return tryToMultiOperandLogicalBooleanNode(typleNode as ZenithScanCriteria.LogicalTupleNode, ScanCriteria.OrNode, toProgress);
            case ZenithScanCriteria.NotTupleNodeType: return tryToSingleOperandLogicalBooleanNode(typleNode as ZenithScanCriteria.LogicalTupleNode, ScanCriteria.NotNode, toProgress);

            // Comparison
            case ZenithScanCriteria.EqualTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithScanCriteria.ComparisonTupleNode, ScanCriteria.NumericEqualsNode, toProgress);
            case ZenithScanCriteria.GreaterThanTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithScanCriteria.ComparisonTupleNode, ScanCriteria.NumericGreaterThanNode, toProgress);
            case ZenithScanCriteria.GreaterThanOrEqualTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithScanCriteria.ComparisonTupleNode, ScanCriteria.NumericGreaterThanOrEqualNode, toProgress);
            case ZenithScanCriteria.LessThanTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithScanCriteria.ComparisonTupleNode, ScanCriteria.NumericLessThanNode, toProgress);
            case ZenithScanCriteria.LessThanOrEqualTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithScanCriteria.ComparisonTupleNode, ScanCriteria.NumericLessThanOrEqualNode, toProgress);
            case ZenithScanCriteria.AllTupleNodeType: return new Ok(new ScanCriteria.AllNode());
            case ZenithScanCriteria.NoneTupleNodeType: return new Ok(new ScanCriteria.NoneNode());

            // Matching
            case ZenithScanCriteria.AltCodeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.AltCode, toProgress);
            case ZenithScanCriteria.AttributeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Attribute, toProgress);
            case ZenithScanCriteria.AuctionTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Auction, toProgress);
            case ZenithScanCriteria.AuctionLastTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Auction, toProgress);
            case ZenithScanCriteria.AuctionQuantityTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.AuctionQuantity, toProgress);
            case ZenithScanCriteria.BestAskCountTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestAskCount, toProgress);
            case ZenithScanCriteria.BestAskPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestAskPrice, toProgress);
            case ZenithScanCriteria.BestAskQuantityTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestAskQuantity, toProgress);
            case ZenithScanCriteria.BestBidCountTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestBidCount, toProgress);
            case ZenithScanCriteria.BestBidPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestBidPrice, toProgress);
            case ZenithScanCriteria.BestBidQuantityTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestBidQuantity, toProgress);
            case ZenithScanCriteria.BoardTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Board, toProgress);
            case ZenithScanCriteria.CallOrPutTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.CallOrPut, toProgress);
            case ZenithScanCriteria.CategoryTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Category, toProgress);
            case ZenithScanCriteria.CfiTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Cfi, toProgress);
            case ZenithScanCriteria.ClassTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Class, toProgress);
            case ZenithScanCriteria.ClosePriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ClosePrice, toProgress);
            case ZenithScanCriteria.CodeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Code, toProgress);
            case ZenithScanCriteria.ContractSizeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ContractSize, toProgress);
            case ZenithScanCriteria.CurrencyTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Currency, toProgress);
            case ZenithScanCriteria.DataTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Data, toProgress);
            case ZenithScanCriteria.DateTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Date, toProgress);
            case ZenithScanCriteria.ExerciseTypeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ExerciseType, toProgress);
            case ZenithScanCriteria.ExchangeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Exchange, toProgress);
            case ZenithScanCriteria.ExpiryDateTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ExpiryDate, toProgress);
            case ZenithScanCriteria.HighPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.HighPrice, toProgress);
            case ZenithScanCriteria.IsIndexTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.IsIndex, toProgress);
            case ZenithScanCriteria.LegTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Leg, toProgress);
            case ZenithScanCriteria.LastPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.LastPrice, toProgress);
            case ZenithScanCriteria.LotSizeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.LotSize, toProgress);
            case ZenithScanCriteria.LowPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.LowPrice, toProgress);
            case ZenithScanCriteria.MarketTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Market, toProgress);
            case ZenithScanCriteria.NameTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Name, toProgress);
            case ZenithScanCriteria.OpenInterestTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.OpenInterest, toProgress);
            case ZenithScanCriteria.OpenPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.OpenPrice, toProgress);
            case ZenithScanCriteria.PriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Price, toProgress);
            case ZenithScanCriteria.PreviousCloseTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.PreviousClose, toProgress);
            case ZenithScanCriteria.QuotationBasisTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.QuotationBasis, toProgress);
            case ZenithScanCriteria.RemainderTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Remainder, toProgress);
            case ZenithScanCriteria.ShareIssueTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ShareIssue, toProgress);
            case ZenithScanCriteria.StateTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.State, toProgress);
            case ZenithScanCriteria.StateAllowsTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.StateAllows, toProgress);
            case ZenithScanCriteria.StatusNoteTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.StatusNote, toProgress);
            case ZenithScanCriteria.StrikePriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.StrikePrice, toProgress);
            case ZenithScanCriteria.TradesTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Trades, toProgress);
            case ZenithScanCriteria.TradingMarketTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.TradingMarket, toProgress);
            case ZenithScanCriteria.ValueTradedTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ValueTraded, toProgress);
            case ZenithScanCriteria.VolumeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Volume, toProgress);
            case ZenithScanCriteria.VwapTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Vwap, toProgress);

            default:
                const neverTupleNodeType: never = nodeType;
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_UnknownBooleanTupleNodeType, `${neverTupleNodeType}`));
        }
    }

    function tryToMultiOperandLogicalBooleanNode(
        tulipNode: ZenithScanCriteria.LogicalTupleNode,
        nodeConstructor: new() => ScanCriteria.MultiOperandBooleanNode,
        toProgress: ParseProgress,
    ): Result<ScanCriteria.MultiOperandBooleanNode, ZenithScanCriteriaParseError> {
        const tulipNodeLength = tulipNode.length;
        if (tulipNodeLength < 2) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_LogicalBooleanMissingOperands, tulipNode[0]))
        } else {
            const operands = new Array<ScanCriteria.BooleanNode>(tulipNodeLength - 1);
            for (let i = 1; i < tulipNodeLength; i++) {
                const tulipParam = tulipNode[i] as ZenithScanCriteria.BooleanParam; // Need to cast as (skipped) first element in array is LogicalTupleNodeType
                const operandResult = tryToExpectedBooleanOperand(tulipParam, toProgress);
                if (operandResult.isErr()) {
                    return operandResult;
                } else {
                    operands[i - 1] = operandResult.value;
                }
            }

            const resultNode = new nodeConstructor();
            resultNode.operands = operands;
            return new Ok(resultNode);
        }
    }

    function tryToSingleOperandLogicalBooleanNode(
        tulipNode: ZenithScanCriteria.LogicalTupleNode,
        nodeConstructor: new() => ScanCriteria.SingleOperandBooleanNode,
        toProgress: ParseProgress,
    ): Result<ScanCriteria.SingleOperandBooleanNode, ZenithScanCriteriaParseError> {
        if (tulipNode.length !== 2) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_LogicalBooleanMissingOperand, tulipNode[0]))
        } else {
            const tupleNodeResult = tryToExpectedBooleanOperand(tulipNode[1], toProgress);
            if (tupleNodeResult.isErr()) {
                return tupleNodeResult;
            } else {
                const resultNode = new nodeConstructor();
                resultNode.operand = tupleNodeResult.value;
                return new Ok(resultNode);
            }
        }
    }

    function tryToExpectedBooleanOperand(
        param: ZenithScanCriteria.BooleanParam,
        toProgress: ParseProgress
    ): Result<ScanCriteria.BooleanNode, ZenithScanCriteriaParseError> {
        if (Array.isArray(param)) {
            return tryToExpectedBooleanNode(param, toProgress);
        } else {
            if (typeof param !== 'string') {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_UnexpectedBooleanParamType, `${param}`));
            } else {
                const fieldId = Field.tryMatchingToId(param);
                if (fieldId === undefined) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_UnknownFieldBooleanParam, `${param}`));
                } else {
                    return new Ok(toFieldHasValueNode(fieldId));
                }
            }
        }
    }

    // function tryToFieldBooleanNode(value: ZenithScanCriteria.MatchingField): Result<ScanCriteria.FieldBooleanNode, ZenithScanCriteriaParseError> {
    //     switch (value) {

    //     }
    // }

    function tryToFieldBooleanNode(
        node: ZenithScanCriteria.MatchingTupleNode,
        fieldId: ScanCriteria.FieldId,
        toProgress: ParseProgress
    ): Result<ScanCriteria.FieldBooleanNode, ZenithScanCriteriaParseError> {
        const paramCount = node.length - 1;
        switch (paramCount) {
            case 0: {
                if (fieldId === ScanCriteria.FieldId.IsIndex) {
                    return tryToBooleanFieldEqualsNode(fieldId, ZenithScanCriteria.SingleDefault_IsIndex);
                } else {
                    return new Ok(toFieldHasValueNode(fieldId));
                }
            }
            case 1: {
                const param1 = node[1];
                const fieldSubbed = ScanCriteria.Field.isSubbed(fieldId);
                if (fieldSubbed) {
                    return tryToSubFieldHasValueNode(fieldId as ScanCriteria.SubbedFieldId, param1);
                } else {
                    if (typeof param1 === 'object') {
                        return tryNamedParametersToFieldEqualsOrInRangeNode(fieldId, param1);
                    } else {
                        return tryToFieldEqualsOrContainsNode(fieldId, param1);
                    }
                }
            }
            case 2: {
                const param1 = node[1];
                const param2 = node[2];
                const fieldSubbed = ScanCriteria.Field.isSubbed(fieldId);
                if (fieldSubbed) {
                    if (typeof param2 === 'object') {
                        return tryNamedParametersToSubFieldEqualsOrInRangeNode(fieldId as ScanCriteria.SubbedFieldId, param1, param2);
                    } else {
                        return tryToSubFieldEqualsOrContainsNode(fieldId as ScanCriteria.SubbedFieldId, param1, param2);
                    }
                } else {
                    return tryToFieldContainsOrInRangeNode(fieldId as ScanCriteria.SubbedFieldId, param1, param2);
                }
            }
            case 3: {
                const param1 = node[1];
                const param2 = node[2];
                const param3 = node[3];
                const fieldSubbed = ScanCriteria.Field.isSubbed(fieldId);
                if (fieldSubbed) {
                    return tryToSubFieldContainsOrInRangeNode(fieldId as ScanCriteria.SubbedFieldId, param1, param2, param3);
                } else {
                    if (ScanCriteria.Field.idToDataTypeId(fieldId) === ScanCriteria.FieldDataTypeId.Text) {
                        return tryToTextFieldContainsNode(fieldId as ScanCriteria.TextFieldId, param1, param2, param3);
                    } else {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_OnlySubFieldOrTextFieldNodesCanHave3Parameters, paramCount.toString()));
                    }
                }
                break;
            }
            case 4: {
                if (!ScanCriteria.Field.isSubbed(fieldId)) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_OnlySubFieldNodeCanHave4Parameters, paramCount.toString()));
                } else {
                    const param1 = node[1];
                    const param2 = node[2];
                    const param3 = node[3];
                    const param4 = node[4];
                    return tryToTextSubFieldContainsNode(fieldId as ScanCriteria.SubbedFieldId, param1, param2, param3, param4);
                }
            }
            default:
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_FieldBooleanNodeHasTooManyParameters, paramCount.toString()));
        }
    }

    function toFieldHasValueNode(fieldId: ScanCriteria.FieldId): ScanCriteria.FieldHasValueNode {
        const hasValueNode = new ScanCriteria.FieldHasValueNode();
        hasValueNode.fieldId = fieldId;
        return hasValueNode;
    }

    function tryToSubFieldHasValueNode(fieldId: ScanCriteria.SubbedFieldId, subField: unknown):
            Result<
                ScanCriteria.PriceSubFieldHasValueNode |
                ScanCriteria.DateSubFieldHasValueNode |
                ScanCriteria.AltCodeSubFieldHasValueNode |
                ScanCriteria.AttributeSubFieldHasValueNode,
                ZenithScanCriteriaParseError
            > {
        if (typeof subField !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`));
        } else {
            switch (fieldId) {
                case ScanCriteria.FieldId.Price: {
                    const subFieldId = PriceSubField.tryToId(subField as ZenithScanCriteria.PriceSubFieldEnum);
                    if (subFieldId === undefined) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_PriceSubFieldHasValueSubFieldIsUnknown, `${subField}`));
                    } else {
                        const node = new ScanCriteria.PriceSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                case ScanCriteria.FieldId.Date: {
                    const subFieldId = DateSubField.tryToId(subField as ZenithScanCriteria.DateSubFieldEnum);
                    if (subFieldId === undefined) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_PriceSubFieldHasValueSubFieldIsUnknown, `${subField}`));
                    } else {
                        const node = new ScanCriteria.DateSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                case ScanCriteria.FieldId.AltCode: {
                    const subFieldId = AltCodeSubField.tryToId(subField as ZenithScanCriteria.AltCodeSubField);
                    if (subFieldId === undefined) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_AltCodeSubFieldHasValueSubFieldIsUnknown, `${subField}`));
                    } else {
                        const node = new ScanCriteria.AltCodeSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                case ScanCriteria.FieldId.Attribute: {
                    const subFieldId = AttributeSubField.tryToId(subField as ZenithScanCriteria.AttributeSubField);
                    if (subFieldId === undefined) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_AttributeSubFieldHasValueSubFieldIsUnknown, `${subField}`));
                    } else {
                        const node = new ScanCriteria.AttributeSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                default:
                    throw new UnreachableCaseError('ZSCCTTSFHVN66674', fieldId);
            }
        }
    }

    function tryToFieldEqualsOrContainsNode(fieldId: ScanCriteria.FieldId, param1: unknown) {
        const fieldDataTypeId = ScanCriteria.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanCriteria.FieldDataTypeId.Numeric: return tryToNumericFieldEqualsNode(fieldId as ScanCriteria.NumericFieldId, param1);
            case ScanCriteria.FieldDataTypeId.Date: return tryToDateFieldEqualsNode(fieldId as ScanCriteria.DateFieldId, param1);
            case ScanCriteria.FieldDataTypeId.Text: { return tryToTextFieldContainsNode(fieldId as ScanCriteria.TextFieldId, param1, undefined, undefined);
            }
            case ScanCriteria.FieldDataTypeId.Boolean: {
                return tryToBooleanFieldEqualsNode(fieldId as ScanCriteria.BooleanFieldId, param1);
            }
            default:
                throw new UnreachableCaseError('ZSCCTTFEOCN10008', fieldDataTypeId);
        }
    }

    function tryNamedParametersToFieldEqualsOrInRangeNode(fieldId: ScanCriteria.FieldId, namedParameters: object | null) {
        const fieldDataTypeId = ScanCriteria.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanCriteria.FieldDataTypeId.Numeric: {
                if (namedParameters === null) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NamedParametersCannotBeNull, `${namedParameters}`));
                } else {
                    const numericFieldId = fieldId as ScanCriteria.NumericFieldId;
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithScanCriteria.NumericNamedParameters;
                    if (at !== undefined) {
                        return tryToNumericFieldEqualsNode(numericFieldId, at);
                    } else {
                        return tryToNumericFieldInRangeNode(numericFieldId, min, max);
                    }
                }
            }
            case ScanCriteria.FieldDataTypeId.Date: {
                if (namedParameters === null) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NamedParametersCannotBeNull, `${namedParameters}`));
                } else {
                    const dateFieldId = fieldId as ScanCriteria.DateFieldId;
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithScanCriteria.DateNamedParameters;
                    if (at !== undefined) {
                        return tryToDateFieldEqualsNode(dateFieldId, at);
                    } else {
                        return tryToDateFieldInRangeNode(dateFieldId, min, max);
                    }
                }
            }
            case ScanCriteria.FieldDataTypeId.Text: {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_FirstParameterCannotBeObjectOrNull, `${namedParameters}`));
            }
            case ScanCriteria.FieldDataTypeId.Boolean: {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_FirstParameterCannotBeObjectOrNull, `${namedParameters}`));
            }
            default:
                throw new UnreachableCaseError('ZSCCTNPTFEOIRN10008', fieldDataTypeId);
        }
    }

    function tryToFieldContainsOrInRangeNode(fieldId: ScanCriteria.FieldId, param1: unknown, param2: unknown) {
        const fieldDataTypeId = ScanCriteria.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanCriteria.FieldDataTypeId.Numeric: return tryToNumericFieldInRangeNode(fieldId as ScanCriteria.NumericFieldId, param1, param2);
            case ScanCriteria.FieldDataTypeId.Date: return tryToDateFieldInRangeNode(fieldId as ScanCriteria.DateFieldId, param1, param2);
            case ScanCriteria.FieldDataTypeId.Text: {
                if (typeof param2 === 'object') {
                    if (param2 === null) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NamedParametersCannotBeNull, `${param2}`));
                    } else {
                        const { As: as, IgnoreCase: ignoreCase } = param2 as ZenithScanCriteria.TextNamedParameters;
                        return tryToTextFieldContainsNode(fieldId as ScanCriteria.TextFieldId, param1, as, ignoreCase);
                    }
                } else {
                    return tryToTextFieldContainsNode(fieldId as ScanCriteria.TextFieldId, param1, param2, undefined);
                }
            }
            case ScanCriteria.FieldDataTypeId.Boolean: {
                return new Err(
                    new ZenithScanCriteriaParseError(
                        ExternalError.Code.ZenithScanCriteriaParse_BooleanFieldCanOnlyHaveOneParameter,
                        Field.booleanFromId(fieldId as ScanCriteria.BooleanFieldId))
                );
            }
            default:
                throw new UnreachableCaseError('ZSCCTTFCOIRN10008', fieldDataTypeId);
        }
    }

    function tryToNumericFieldEqualsNode(fieldId: ScanCriteria.NumericFieldId, target: unknown): Result<ScanCriteria.NumericFieldEqualsNode, ZenithScanCriteriaParseError> {
        if (typeof target !== 'number') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TargetIsNotNumber, `${target}`));
        } else {
            const node = new ScanCriteria.NumericFieldEqualsNode();
            node.fieldId = fieldId;
            node.target = target;
            return new Ok(node);
        }
    }

    function tryToNumericFieldInRangeNode(fieldId: ScanCriteria.NumericFieldId, min: unknown, max: unknown): Result<ScanCriteria.NumericFieldInRangeNode, ZenithScanCriteriaParseError> {
        const minUndefined = min === undefined;
        if (!minUndefined && typeof min !== 'number') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinIsDefinedButNotNumber, `${min}`));
        } else {
            const maxUndefined = max === undefined;
            if (!maxUndefined && typeof max !== 'number') {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotNumber, `${max}`));
            } else {
                if (minUndefined && maxUndefined) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, ''));
                } else {
                    const node = new ScanCriteria.NumericFieldInRangeNode();
                    node.fieldId = fieldId;
                    node.min = min;
                    node.max = max;
                    return new Ok(node);
                }
            }
        }
    }

    function tryToDateFieldEqualsNode(fieldId: ScanCriteria.DateFieldId, targetAsString: unknown): Result<ScanCriteria.DateFieldEqualsNode, ZenithScanCriteriaParseError> {
        if (typeof targetAsString !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_DateFieldEqualsTargetIsNotString, `${targetAsString}`));
        } else {
            const target = DateValue.tryToDate(targetAsString);
            if (target === undefined) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TargetHasInvalidDateFormat, `${targetAsString}`));
            } else {
                const node = new ScanCriteria.DateFieldEqualsNode();
                node.fieldId = fieldId;
                node.target = target;
                return new Ok(node);
            }
        }
    }

    function tryToDateFieldInRangeNode(fieldId: ScanCriteria.DateFieldId, min: unknown, max: unknown): Result<ScanCriteria.DateFieldInRangeNode, ZenithScanCriteriaParseError> {
        let minDate: SourceTzOffsetDateTime | undefined;
        if (min === undefined) {
            minDate = undefined;
        } else {
            if (typeof min !== 'string') {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinIsDefinedButNotString, `${min}`));
            } else {
                minDate = DateValue.tryToDate(min);
                if (minDate === undefined) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinHasInvalidDateFormat, `${min}`));
                }
            }
        }

        let maxDate: SourceTzOffsetDateTime | undefined;
        if (max === undefined) {
            maxDate = undefined;
        } else {
            if (typeof max !== 'string') {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotString, `${max}`));
            } else {
                maxDate = DateValue.tryToDate(max);
                if (maxDate === undefined) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMaxHasInvalidDateFormat, `${max}`));
                }
            }
        }

        if (minDate === undefined && maxDate === undefined) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, ''));
        } else {
            const node = new ScanCriteria.DateFieldInRangeNode();
            node.fieldId = fieldId;
            node.min = minDate;
            node.max = maxDate;
            return new Ok(node);
        }
    }

    function tryToTextFieldContainsNode(fieldId: ScanCriteria.TextFieldId, value: unknown, as: unknown, ignoreCase: unknown):
            Result<ScanCriteria.TextFieldContainsNode, ZenithScanCriteriaParseError> {
        const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
        if (propertiesResult.isErr()) {
            return new Err(propertiesResult.error);
        } else {
            const properties = propertiesResult.value;
            const node = new ScanCriteria.TextFieldContainsNode();
            node.fieldId = fieldId;
            node.value = properties.value;
            node.asId = properties.asId;
            node.ignoreCase = properties.ignoreCase;
            return new Ok(node);
        }
    }

    function tryToBooleanFieldEqualsNode(fieldId: ScanCriteria.BooleanFieldId, param1: unknown): Result<ScanCriteria.BooleanFieldEqualsNode, ZenithScanCriteriaParseError> {
        if (typeof param1 !== 'boolean') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_BooleanFieldEqualsTargetIsNotBoolean, `${param1}`));
        } else {
            const node = new ScanCriteria.BooleanFieldEqualsNode();
            node.fieldId = fieldId;
            node.target = param1;
            return new Ok(node);
        }
    }

    function tryToSubFieldEqualsOrContainsNode(fieldId: ScanCriteria.SubbedFieldId, subField: unknown, param2: unknown) {
        switch (fieldId) {
            case ScanCriteria.FieldId.Price: return tryToPriceSubFieldEqualsNode(subField, param2);
            case ScanCriteria.FieldId.Date: return tryToDateSubFieldEqualsNode(subField, param2);
            case ScanCriteria.FieldId.AltCode: return tryToAltCodeSubFieldContains(subField, param2, undefined, undefined);
            case ScanCriteria.FieldId.Attribute: return tryToAttributeSubFieldContains(subField, param2, undefined, undefined);
            default:
                throw new UnreachableCaseError('ZSCCTTSFEOCN10008', fieldId);
        }
    }

    function tryToSubFieldContainsOrInRangeNode(fieldId: ScanCriteria.SubbedFieldId, subField: unknown, param2: unknown, param3: unknown) {
        switch (fieldId) {
            case ScanCriteria.FieldId.Price: return tryToPriceSubFieldInRangeNode(subField, param2, param3);
            case ScanCriteria.FieldId.Date: return tryToDateSubFieldInRangeNode(subField, param2, param3);
            case ScanCriteria.FieldId.AltCode: return tryToAltCodeSubFieldContains(subField, param2, param3, undefined);
            case ScanCriteria.FieldId.Attribute: return tryToAttributeSubFieldContains(subField, param2, param3, undefined);
            default:
                throw new UnreachableCaseError('ZSCCTTSFCOIRN10008', fieldId);
        }
    }

    function tryToTextSubFieldContainsNode(fieldId: ScanCriteria.SubbedFieldId, subField: unknown, value: unknown, as: unknown, ignoreCase: unknown) {
        switch (fieldId) {
            case ScanCriteria.FieldId.Price:
            case ScanCriteria.FieldId.Date: {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_OnlyTextSubFieldContainsNodeCanHave4Parameters, Field.matchingFromId(fieldId)));
            }
            case ScanCriteria.FieldId.AltCode: return tryToAltCodeSubFieldContains(subField, value, as, ignoreCase);
            case ScanCriteria.FieldId.Attribute: return tryToAttributeSubFieldContains(subField, value, as, ignoreCase);
            default:
                throw new UnreachableCaseError('ZSCCTTTSFCN10008', fieldId);
        }
    }

    function tryNamedParametersToSubFieldEqualsOrInRangeNode(fieldId: ScanCriteria.SubbedFieldId, subField: unknown, namedParameters: object | null) {
        switch (fieldId) {
            case ScanCriteria.FieldId.Price: {
                if (namedParameters === null) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NamedParametersCannotBeNull, `${namedParameters}`));
                } else {
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithScanCriteria.NumericNamedParameters;
                    if (at !== undefined) {
                        return tryToPriceSubFieldEqualsNode(subField, at);
                    } else {
                        return tryToPriceSubFieldInRangeNode(subField, min, max);
                    }
                }
            }
            case ScanCriteria.FieldId.Date: {
                if (namedParameters === null) {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NamedParametersCannotBeNull, `${namedParameters}`));
                } else {
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithScanCriteria.DateNamedParameters;
                    if (at !== undefined) {
                        return tryToDateSubFieldEqualsNode(subField, at);
                    } else {
                        return tryToDateSubFieldInRangeNode(subField, min, max);
                    }
                }
            }
            case ScanCriteria.FieldId.AltCode: {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SecondParameterCannotBeObjectOrNull, `${namedParameters}`));
            }
            case ScanCriteria.FieldId.Attribute: {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SecondParameterCannotBeObjectOrNull, `${namedParameters}`));
            }
            default:
                throw new UnreachableCaseError('ZSCCTNPTSFEOIE10008', fieldId);
        }
    }

    function tryToPriceSubFieldEqualsNode(subField: unknown, target: unknown): Result<ScanCriteria.PriceSubFieldEqualsNode, ZenithScanCriteriaParseError> {
        if (typeof subField !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`));
        } else {
            const subFieldId = PriceSubField.tryToId(subField as ZenithScanCriteria.PriceSubFieldEnum);
            if (subFieldId === undefined) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`));
            } else {
                if (typeof target !== 'number') {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TargetIsNotNumber, `${target}`));
                } else {
                    const node = new ScanCriteria.PriceSubFieldEqualsNode();
                    node.fieldId = ScanCriteria.FieldId.Price;
                    node.subFieldId = subFieldId;
                    node.target = target;
                    return new Ok(node);
                }
            }
        }
    }

    function tryToPriceSubFieldInRangeNode(subField: unknown, min: unknown, max: unknown): Result<ScanCriteria.PriceSubFieldInRangeNode, ZenithScanCriteriaParseError> {
        if (typeof subField !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`));
        } else {
            const subFieldId = PriceSubField.tryToId(subField as ZenithScanCriteria.PriceSubFieldEnum);
            if (subFieldId === undefined) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`));
            } else {
                const minUndefined = min === undefined;
                if (!minUndefined && typeof min !== 'number') {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinIsDefinedButNotNumber, `${min}`));
                } else {
                    const maxUndefined = max === undefined;
                    if (!maxUndefined && typeof max !== 'number') {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotNumber, `${max}`));
                    } else {
                        if (minUndefined && maxUndefined) {
                            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, ''));
                        } else {
                            const node = new ScanCriteria.PriceSubFieldInRangeNode();
                            node.fieldId = ScanCriteria.FieldId.Price;
                            node.subFieldId = subFieldId;
                            node.min = min;
                            node.max = max;
                            return new Ok(node);
                        }
                    }
                }
            }
        }
    }

    function tryToDateSubFieldEqualsNode(subField: unknown, target: unknown): Result<ScanCriteria.DateSubFieldEqualsNode, ZenithScanCriteriaParseError> {
        if (typeof subField !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`));
        } else {
            const subFieldId = DateSubField.tryToId(subField as ZenithScanCriteria.DateSubFieldEnum);
            if (subFieldId === undefined) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_DateSubFieldEqualsSubFieldIsUnknown, `${subField}`));
            } else {
                if (typeof target !== 'string') {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_DateSubFieldEqualsTargetIsNotString, `${target}`));
                } else {
                    const targetAsDate = DateValue.tryToDate(target);
                    if (targetAsDate === undefined) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TargetHasInvalidDateFormat, `${target}`));
                    } else {
                        const node = new ScanCriteria.DateSubFieldEqualsNode();
                        node.fieldId = ScanCriteria.FieldId.Date;
                        node.subFieldId = subFieldId;
                        node.target = targetAsDate;
                        return new Ok(node);
                    }
                }
            }
        }
    }

    function tryToDateSubFieldInRangeNode(subField: unknown, min: unknown, max: unknown): Result<ScanCriteria.DateSubFieldInRangeNode, ZenithScanCriteriaParseError> {
        if (typeof subField !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`));
        } else {
            let minDate: SourceTzOffsetDateTime | undefined;
            if (min === undefined) {
                minDate = undefined;
            } else {
                if (typeof min !== 'string') {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinIsDefinedButNotString, `${min}`));
                } else {
                    minDate = DateValue.tryToDate(min);
                    if (minDate === undefined) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinHasInvalidDateFormat, `${min}`));
                    }
                }
            }

            let maxDate: SourceTzOffsetDateTime | undefined;
            if (max === undefined) {
                maxDate = undefined;
            } else {
                if (typeof max !== 'string') {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotString, `${max}`));
                } else {
                    maxDate = DateValue.tryToDate(max);
                    if (maxDate === undefined) {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMaxHasInvalidDateFormat, `${max}`));
                    }
                }
            }

            if (minDate === undefined && maxDate === undefined) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, ''));
            } else {
                const node = new ScanCriteria.DateSubFieldInRangeNode();
                node.fieldId = ScanCriteria.FieldId.Date;
                node.min = minDate;
                node.max = maxDate;
                return new Ok(node);
            }
        }
    }



    function tryToAltCodeSubFieldContains(subField: unknown, value: unknown, as: unknown, ignoreCase: unknown): Result<ScanCriteria.AltCodeSubFieldContainsNode, ZenithScanCriteriaParseError> {
        if (typeof subField !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`));
        } else {
            const subFieldId = AltCodeSubField.tryToId(subField as ZenithScanCriteria.AltCodeSubField);
            if (subFieldId === undefined) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_AltCodeSubFieldContainsSubFieldIsUnknown, `${subField}`));
            } else {
                const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
                if (propertiesResult.isErr()) {
                    return propertiesResult;
                } else {
                    const properties = propertiesResult.value;
                    const node = new ScanCriteria.AltCodeSubFieldContainsNode();
                    node.fieldId = ScanCriteria.FieldId.AltCode;
                    node.subFieldId = subFieldId;
                    node.value = properties.value;
                    node.asId = properties.asId;
                    node.ignoreCase = properties.ignoreCase;
                    return new Ok(node);
                }
            }
        }
    }

    function tryToAttributeSubFieldContains(subField: unknown, value: unknown, as: unknown, ignoreCase: unknown): Result<ScanCriteria.AttributeSubFieldContainsNode, ZenithScanCriteriaParseError> {
        if (typeof subField !== 'string') {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`));
        } else {
            const subFieldId = AttributeSubField.tryToId(subField as ZenithScanCriteria.AttributeSubField);
            if (subFieldId === undefined) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_AttributeSubFieldContainsSubFieldIsUnknown, `${subField}`));
            } else {
                const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
                if (propertiesResult.isErr()) {
                    return propertiesResult;
                } else {
                    const properties = propertiesResult.value;
                    const node = new ScanCriteria.AttributeSubFieldContainsNode();
                    node.fieldId = ScanCriteria.FieldId.Attribute;
                    node.subFieldId = subFieldId;
                    node.value = properties.value;
                    node.asId = properties.asId;
                    node.ignoreCase = properties.ignoreCase;
                    return new Ok(node);
                }
            }
        }
    }

    function tryToNumericComparisonNode(
        tulipNode: ZenithScanCriteria.ComparisonTupleNode,
        nodeConstructor: new() => ScanCriteria.NumericComparisonBooleanNode,
        toProgress: ParseProgress,
    ): Result<ScanCriteria.NumericComparisonBooleanNode, ZenithScanCriteriaParseError> {
        const nodeType = tulipNode[0];
        if (tulipNode.length !== 3) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NumericComparisonDoesNotHave2Operands, nodeType))
        } else {
            const leftParam = tulipNode[1] as ZenithScanCriteria.NumericParam;
            const leftOperandResult = tryToExpectedNumericOperand(leftParam, `${nodeType}/${Strings[StringId.Left]}`, toProgress);
            if (leftOperandResult.isErr()) {
                return leftOperandResult;
            } else {
                const rightParam = tulipNode[2] as ZenithScanCriteria.NumericParam;
                const rightOperandResult = tryToExpectedNumericOperand(rightParam, `${nodeType}/${Strings[StringId.Right]}`, toProgress);
                if (rightOperandResult.isErr()) {
                    return rightOperandResult;
                } else {
                    const resultNode = new nodeConstructor();
                    resultNode.leftOperand = leftOperandResult.value;
                    resultNode.rightOperand = rightOperandResult.value;
                    return new Ok(resultNode);
                }
            }
        }
    }

    function tryToExpectedNumericOperand(
        numericParam: unknown, // ZenithScanCriteria.NumericParam,
        paramId: string,
        toProgress: ParseProgress,
    ): Result<ScanCriteria.NumericNode | number, ZenithScanCriteriaParseError> {
        if (typeof numericParam === 'number') {
            return new Ok(numericParam);
        } else {
            if (typeof numericParam === 'string') {
                return tryToNumericFieldValueGet(numericParam as ZenithScanCriteria.NumericField);
            } else {
                if (Array.isArray(numericParam)) {
                    return tryToExpectedArithmeticNumericNode(numericParam as ZenithScanCriteria.NumericTupleNode, toProgress);
                } else {
                    return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NumericParameterIsNotNumberOrComparableFieldOrArray, `${paramId}`));
                }
            }
        }
    }

    function tryToExpectedArithmeticNumericNode(
        numericTupleNode: ZenithScanCriteria.NumericTupleNode,
        toProgress: ParseProgress
    ): Result<ScanCriteria.NumericNode, ZenithScanCriteriaParseError> {
        const tupleNodeLength = numericTupleNode.length;
        if (tupleNodeLength < 1 ) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NumericTupleNodeIsZeroLength, ''));
        } else {
            const nodeType = numericTupleNode[0];
            if (typeof nodeType !== 'string') {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NumericTupleNodeTypeIsNotString, `${nodeType}`));
            } else {
                const parsedNode = toProgress.addParsedNode(nodeType);

                const result = tryToNumericNode(numericTupleNode, toProgress)

                if (result.isOk()) {
                    toProgress.exitTupleNode(parsedNode, result.value.typeId);
                }

                return result;
            }
        }
    }

    function tryToNumericNode(
        numericTupleNode: ZenithScanCriteria.NumericTupleNode,
        toProgress: ParseProgress
    ): Result<ScanCriteria.NumericNode, ZenithScanCriteriaParseError> {
        const tupleNodetype = numericTupleNode[0] as ZenithScanCriteria.ExpressionTupleNodeType;
        switch (tupleNodetype) {
            // Binary
            case ZenithScanCriteria.AddTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericAddNode, toProgress);
            case ZenithScanCriteria.DivSymbolTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericDivNode, toProgress);
            case ZenithScanCriteria.DivTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericDivNode, toProgress);
            case ZenithScanCriteria.ModSymbolTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericModNode, toProgress);
            case ZenithScanCriteria.ModTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericModNode, toProgress);
            case ZenithScanCriteria.MulSymbolTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericMulNode, toProgress);
            case ZenithScanCriteria.MulTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericMulNode, toProgress);
            case ZenithScanCriteria.SubTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, ScanCriteria.NumericSubNode, toProgress);

            // Unary
            case ZenithScanCriteria.NegTupleNodeType:
                return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.UnaryExpressionTupleNode, ScanCriteria.NumericNegNode, toProgress);
            case ZenithScanCriteria.PosTupleNodeType:
                return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.UnaryExpressionTupleNode, ScanCriteria.NumericPosNode, toProgress);
            case ZenithScanCriteria.AbsTupleNodeType:
                return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.UnaryExpressionTupleNode, ScanCriteria.NumericAbsNode, toProgress);

            // Unary or Binary (depending on number of params)
            case ZenithScanCriteria.SubOrNegSymbolTupleNodeType:
                return tryToUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithScanCriteria.UnaryExpressionTupleNode | ZenithScanCriteria.BinaryExpressionTupleNode,
                    ScanCriteria.NumericNegNode,
                    ScanCriteria.NumericSubNode,
                    toProgress);
            case ZenithScanCriteria.AddOrPosSymbolTupleNodeType:
                return tryToUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithScanCriteria.UnaryExpressionTupleNode | ZenithScanCriteria.BinaryExpressionTupleNode,
                    ScanCriteria.NumericPosNode,
                    ScanCriteria.NumericAddNode,
                    toProgress);

            case ZenithScanCriteria.IfTupleNodeType:
                return tryToNumericIfNode(numericTupleNode as ZenithScanCriteria.IfTupleNode, toProgress);

            default:
                const neverTupleNodeType: never = tupleNodetype;
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_UnknownNumericTupleNodeType, `${neverTupleNodeType}`));
            }
    }

    function tryToUnaryArithmeticNumericNode(
        numericTupleNode: ZenithScanCriteria.UnaryExpressionTupleNode,
        nodeConstructor: new() => ScanCriteria.UnaryArithmeticNumericNode,
        toProgress: ParseProgress
    ): Result<ScanCriteria.NumericNode, ZenithScanCriteriaParseError> {
        const nodeLength = numericTupleNode.length;
        if (nodeLength !== 2) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_UnaryArithmeticNumericTupleNodeRequires2Parameters, `${numericTupleNode}`));
        } else {
            const param = numericTupleNode[1];
            const operandResult = tryToExpectedNumericOperand(param, '', toProgress);
            if (operandResult.isErr()) {
                return operandResult;
            } else {
                const node = new nodeConstructor();
                node.operand = operandResult.value;
                return new Ok(node);
            }
        }
    }

    function tryToLeftRightArithmeticNumericNode(
        numericTupleNode: ZenithScanCriteria.BinaryExpressionTupleNode,
        nodeConstructor: new() => ScanCriteria.LeftRightArithmeticNumericNode,
        toProgress: ParseProgress
    ): Result<ScanCriteria.NumericNode, ZenithScanCriteriaParseError> {
        const nodeLength = numericTupleNode.length;
        if (nodeLength !== 3) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_LeftRightArithmeticNumericTupleNodeRequires3Parameters, `${numericTupleNode}`));
        } else {
            const leftParam = numericTupleNode[1];
            const leftResult = tryToExpectedNumericOperand(leftParam, Strings[StringId.Left], toProgress);
            if (leftResult.isErr()) {
                return leftResult;
            } else {
                const rightParam = numericTupleNode[1];
                const rightResult = tryToExpectedNumericOperand(rightParam, Strings[StringId.Right], toProgress);
                if (rightResult.isErr()) {
                    return rightResult;
                } else {
                    const node = new nodeConstructor();
                    node.leftOperand = leftResult.value;
                    node.rightOperand = rightResult.value;
                    return new Ok(node);
                }
            }
        }
    }

    function tryToUnaryOrLeftRightArithmeticNumericNode(
        numericTupleNode: ZenithScanCriteria.UnaryExpressionTupleNode | ZenithScanCriteria.BinaryExpressionTupleNode,
        unaryNodeConstructor: new() => ScanCriteria.UnaryArithmeticNumericNode,
        leftRightNodeConstructor: new() => ScanCriteria.LeftRightArithmeticNumericNode,
        toProgress: ParseProgress
    ): Result<ScanCriteria.NumericNode, ZenithScanCriteriaParseError> {
        const nodeLength = numericTupleNode.length;
        switch (nodeLength) {
            case 2: return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.UnaryExpressionTupleNode, unaryNodeConstructor, toProgress);
            case 3: return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithScanCriteria.BinaryExpressionTupleNode, leftRightNodeConstructor, toProgress);
            default:
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_NumericTupleNodeRequires2Or3Parameters, `${numericTupleNode}`));
        }
    }

    function tryToNumericIfNode(tupleNode: ZenithScanCriteria.IfTupleNode, toProgress: ParseProgress): Result<ScanCriteria.NumericIfNode, ZenithScanCriteriaParseError> {
        const tupleLength = tupleNode.length;
        if (tupleLength < 5) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_IfTupleNodeRequiresAtLeast4Parameters, `${tupleNode}`));
        } else {
            const armParameters = tupleLength - 1;
            const armsRemainder = armParameters % 2;
            if (armsRemainder !== 0) {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_IfTupleNodeRequiresAnEvenNumberOfParameters, `${tupleNode}`));
            } else {
                const armCount = armParameters / 2;
                const trueArmCount = armCount - 1;
                const trueArms = new Array<ScanCriteria.NumericIfNode.Arm>(trueArmCount);
                let tupleIndex = 1;
                for (let i = 0; i < trueArmCount; i++) {
                    const armResult = tryToNumericIfArm(tupleNode, tupleIndex, toProgress);
                    if (armResult.isErr()) {
                        return new Err(armResult.error);
                    } else {
                        trueArms[i] = armResult.value;
                    }
                    tupleIndex += 2;
                }

                const armResult = tryToNumericIfArm(tupleNode, tupleIndex, toProgress);
                if (armResult.isErr()) {
                    return new Err(armResult.error);
                } else {
                    const falseArm = armResult.value;

                    const node = new ScanCriteria.NumericIfNode();
                    node.trueArms = trueArms;
                    node.falseArm = falseArm;
                    return new Ok(node);
                }
            }
        }
    }

    function tryToNumericIfArm(tupleNode: ZenithScanCriteria.IfTupleNode, tupleIndex: Integer, toProgress: ParseProgress): Result<ScanCriteria.NumericIfNode.Arm, ZenithScanCriteriaParseError> {
        const conditionElement = tupleNode[tupleIndex++] as ZenithScanCriteria.BooleanParam;
        const conditionResult = tryToExpectedBooleanOperand(conditionElement, toProgress);
        if (conditionResult.isErr()) {
            return new Err(conditionResult.error);
        } else {
            const valueElement = tupleNode[tupleIndex++] as ZenithScanCriteria.NumericParam;
            const valueResult = tryToExpectedNumericOperand(valueElement, tupleIndex.toString(), toProgress);
            if (valueResult.isErr()) {
                return new Err(valueResult.error);
            } else {
                const arm: ScanCriteria.NumericIfNode.Arm = {
                    condition: conditionResult.value,
                    value: valueResult.value,
                };
                return new Ok(arm);
            }
        }
    }

    function tryToNumericFieldValueGet(field: ZenithScanCriteria.NumericField): Result<ScanCriteria.NumericFieldValueGetNode, ZenithScanCriteriaParseError> {
        const fieldId = Field.tryNumericToId(field);
        if (fieldId === undefined) {
            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_UnknownNumericField, field));
        } else {
            const node = new ScanCriteria.NumericFieldValueGetNode();
            node.fieldId = fieldId;
            return new Ok(node);
        }
    }

    interface TextFieldContainsProperties {
        readonly value: string;
        readonly asId: ScanCriteria.TextContainsAsId;
        readonly ignoreCase: boolean;
    }

    namespace TextFieldContainsProperties {
        export function resolveFromUnknown(value: unknown, as: unknown, ignoreCase: unknown): Result<TextFieldContainsProperties, ZenithScanCriteriaParseError> {
            if (typeof value !== 'string') {
                return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TextFieldContainsValueIsNotString, `${value}`));
            } else {
                let resolvedAsId: ScanCriteria.TextContainsAsId;
                if (as === undefined) {
                    resolvedAsId = ScanCriteria.TextContainsAsId.None;
                } else {
                    if (typeof as !== 'string') {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TextFieldContainsAsIsNotString, `${as}`));
                    } else {
                        const asId = TextContainsAs.tryToId(as as ZenithScanCriteria.TextContainsAsEnum);
                        if (asId === undefined) {
                            return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TextFieldContainsAsHasInvalidFormat, `${as}`));
                        } else {
                            resolvedAsId = asId;
                        }
                    }
                }

                let resolvedIgnoreCase: boolean;
                if (ignoreCase === undefined) {
                    resolvedIgnoreCase = false;
                } else {
                    if (typeof ignoreCase !== 'boolean') {
                        return new Err(new ZenithScanCriteriaParseError(ExternalError.Code.ZenithScanCriteriaParse_TextFieldContainsAsIsNotBoolean, `${ignoreCase}`));
                    } else {
                        resolvedIgnoreCase = ignoreCase;
                    }
                }

                const properties: TextFieldContainsProperties = {
                    value,
                    asId: resolvedAsId,
                    ignoreCase: resolvedIgnoreCase,
                }
                return new Ok(properties);
            }
        }
    }
    namespace Field {
        export function tryMatchingToId(value: ZenithScanCriteria.MatchingField): ScanCriteria.FieldId | undefined {
            let fieldId: ScanCriteria.FieldId | undefined = tryNumericToId(value as ZenithScanCriteria.NumericField);
            if (fieldId === undefined) {
                fieldId = tryTextToId(value as ZenithScanCriteria.TextField);
                if (fieldId === undefined) {
                    fieldId = tryDateToId(value as ZenithScanCriteria.DateField);
                    if (fieldId === undefined) {
                        fieldId = tryBooleanToId(value as ZenithScanCriteria.BooleanField); // fieldId is left undefined if this try fails
                    }
                }
            }

            return fieldId;
        }

        export function matchingFromId(value: ScanCriteria.FieldId): ZenithScanCriteria.MatchingField {
            let field: ZenithScanCriteria.MatchingField | undefined = tryNumericFromId(value as ScanCriteria.NumericFieldId);
            if (field === undefined) {
                field = tryTextFromId(value as ScanCriteria.TextFieldId);
                if (field === undefined) {
                    field = tryDateFromId(value as ScanCriteria.DateFieldId);
                    if (field === undefined) {
                        field = tryBooleanFromId(value as ScanCriteria.BooleanFieldId);
                        if (field === undefined) {
                            throw new AssertInternalError('ZSCCFMFI16179', `${value}`)
                        }
                    }
                }
            }

            return field;
        }

        export function tryDateToId(value: ZenithScanCriteria.DateField): ScanCriteria.DateFieldId | undefined {
            switch (value) {
                case ZenithScanCriteria.ExpiryDateTupleNodeType: return ScanCriteria.FieldId.ExpiryDate;
                default:
                    return undefined;
            }
        }

        export function dateFromId(value: ScanCriteria.DateFieldId): ZenithScanCriteria.DateField {
            const result = tryDateFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFDFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryDateFromId(value: ScanCriteria.DateFieldId): ZenithScanCriteria.DateField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.ExpiryDate: return ZenithScanCriteria.ExpiryDateTupleNodeType;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }

        export function tryNumericToId(value: ZenithScanCriteria.NumericField): ScanCriteria.NumericFieldId | undefined {
            switch (value) {
                case ZenithScanCriteria.AuctionTupleNodeType: return ScanCriteria.FieldId.Auction;
                case ZenithScanCriteria.AuctionLastTupleNodeType: return ScanCriteria.FieldId.AuctionLast;
                case ZenithScanCriteria.AuctionQuantityTupleNodeType: return ScanCriteria.FieldId.AuctionQuantity;
                case ZenithScanCriteria.BestAskCountTupleNodeType: return ScanCriteria.FieldId.BestAskCount;
                case ZenithScanCriteria.BestAskPriceTupleNodeType: return ScanCriteria.FieldId.BestAskPrice;
                case ZenithScanCriteria.BestAskQuantityTupleNodeType: return ScanCriteria.FieldId.BestAskQuantity;
                case ZenithScanCriteria.BestBidCountTupleNodeType: return ScanCriteria.FieldId.BestBidCount;
                case ZenithScanCriteria.BestBidPriceTupleNodeType: return ScanCriteria.FieldId.BestBidPrice;
                case ZenithScanCriteria.BestBidQuantityTupleNodeType: return ScanCriteria.FieldId.BestBidQuantity;
                case ZenithScanCriteria.ClosePriceTupleNodeType: return ScanCriteria.FieldId.ClosePrice;
                case ZenithScanCriteria.ContractSizeTupleNodeType: return ScanCriteria.FieldId.ContractSize;
                case ZenithScanCriteria.HighPriceTupleNodeType: return ScanCriteria.FieldId.HighPrice;
                case ZenithScanCriteria.LastPriceTupleNodeType: return ScanCriteria.FieldId.LastPrice;
                case ZenithScanCriteria.LotSizeTupleNodeType: return ScanCriteria.FieldId.LotSize;
                case ZenithScanCriteria.LowPriceTupleNodeType: return ScanCriteria.FieldId.LowPrice;
                case ZenithScanCriteria.OpenInterestTupleNodeType: return ScanCriteria.FieldId.OpenInterest;
                case ZenithScanCriteria.OpenPriceTupleNodeType: return ScanCriteria.FieldId.OpenPrice;
                case ZenithScanCriteria.PreviousCloseTupleNodeType: return ScanCriteria.FieldId.PreviousClose;
                case ZenithScanCriteria.RemainderTupleNodeType: return ScanCriteria.FieldId.Remainder;
                case ZenithScanCriteria.ShareIssueTupleNodeType: return ScanCriteria.FieldId.ShareIssue;
                case ZenithScanCriteria.StrikePriceTupleNodeType: return ScanCriteria.FieldId.StrikePrice;
                case ZenithScanCriteria.TradesTupleNodeType: return ScanCriteria.FieldId.Trades;
                case ZenithScanCriteria.ValueTradedTupleNodeType: return ScanCriteria.FieldId.ValueTraded;
                case ZenithScanCriteria.VolumeTupleNodeType: return ScanCriteria.FieldId.Volume;
                case ZenithScanCriteria.VwapTupleNodeType: return ScanCriteria.FieldId.Vwap;
                default:
                    return undefined;
            }
        }

        export function numericFromId(value: ScanCriteria.NumericFieldId): ZenithScanCriteria.NumericField {
            const result = tryNumericFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFNFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryNumericFromId(value: ScanCriteria.NumericFieldId): ZenithScanCriteria.NumericField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.Auction: return ZenithScanCriteria.AuctionTupleNodeType;
                case ScanCriteria.FieldId.AuctionLast: return ZenithScanCriteria.AuctionLastTupleNodeType;
                case ScanCriteria.FieldId.AuctionQuantity: return ZenithScanCriteria.AuctionQuantityTupleNodeType;
                case ScanCriteria.FieldId.BestAskCount: return ZenithScanCriteria.BestAskCountTupleNodeType;
                case ScanCriteria.FieldId.BestAskPrice: return ZenithScanCriteria.BestAskPriceTupleNodeType;
                case ScanCriteria.FieldId.BestAskQuantity: return ZenithScanCriteria.BestAskQuantityTupleNodeType;
                case ScanCriteria.FieldId.BestBidCount: return ZenithScanCriteria.BestBidCountTupleNodeType;
                case ScanCriteria.FieldId.BestBidPrice: return ZenithScanCriteria.BestBidPriceTupleNodeType;
                case ScanCriteria.FieldId.BestBidQuantity: return ZenithScanCriteria.BestBidQuantityTupleNodeType;
                case ScanCriteria.FieldId.ClosePrice: return ZenithScanCriteria.ClosePriceTupleNodeType;
                case ScanCriteria.FieldId.ContractSize: return ZenithScanCriteria.ContractSizeTupleNodeType;
                case ScanCriteria.FieldId.HighPrice: return ZenithScanCriteria.HighPriceTupleNodeType;
                case ScanCriteria.FieldId.LastPrice: return ZenithScanCriteria.LastPriceTupleNodeType;
                case ScanCriteria.FieldId.LotSize: return ZenithScanCriteria.LotSizeTupleNodeType;
                case ScanCriteria.FieldId.LowPrice: return ZenithScanCriteria.LowPriceTupleNodeType;
                case ScanCriteria.FieldId.OpenInterest: return ZenithScanCriteria.OpenInterestTupleNodeType;
                case ScanCriteria.FieldId.OpenPrice: return ZenithScanCriteria.OpenPriceTupleNodeType;
                case ScanCriteria.FieldId.PreviousClose: return ZenithScanCriteria.PreviousCloseTupleNodeType;
                case ScanCriteria.FieldId.Remainder: return ZenithScanCriteria.RemainderTupleNodeType;
                case ScanCriteria.FieldId.ShareIssue: return ZenithScanCriteria.ShareIssueTupleNodeType;
                case ScanCriteria.FieldId.StrikePrice: return ZenithScanCriteria.StrikePriceTupleNodeType;
                case ScanCriteria.FieldId.Trades: return ZenithScanCriteria.TradesTupleNodeType;
                case ScanCriteria.FieldId.ValueTraded: return ZenithScanCriteria.ValueTradedTupleNodeType;
                case ScanCriteria.FieldId.Volume: return ZenithScanCriteria.VolumeTupleNodeType;
                case ScanCriteria.FieldId.Vwap: return ZenithScanCriteria.VwapTupleNodeType;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }

        export function tryTextToId(value: ZenithScanCriteria.TextField): ScanCriteria.TextFieldId | undefined {
            switch (value) {
                case ZenithScanCriteria.BoardTupleNodeType: return ScanCriteria.FieldId.Board;
                case ZenithScanCriteria.CallOrPutTupleNodeType: return ScanCriteria.FieldId.CallOrPut;
                case ZenithScanCriteria.CategoryTupleNodeType: return ScanCriteria.FieldId.Category;
                case ZenithScanCriteria.CfiTupleNodeType: return ScanCriteria.FieldId.Cfi;
                case ZenithScanCriteria.ClassTupleNodeType: return ScanCriteria.FieldId.Class;
                case ZenithScanCriteria.CodeTupleNodeType: return ScanCriteria.FieldId.Code;
                case ZenithScanCriteria.CurrencyTupleNodeType: return ScanCriteria.FieldId.Currency;
                case ZenithScanCriteria.DataTupleNodeType: return ScanCriteria.FieldId.Data;
                case ZenithScanCriteria.ExchangeTupleNodeType: return ScanCriteria.FieldId.Exchange;
                case ZenithScanCriteria.ExerciseTypeTupleNodeType: return ScanCriteria.FieldId.ExerciseType;
                case ZenithScanCriteria.LegTupleNodeType: return ScanCriteria.FieldId.Leg;
                case ZenithScanCriteria.MarketTupleNodeType: return ScanCriteria.FieldId.Market;
                case ZenithScanCriteria.NameTupleNodeType: return ScanCriteria.FieldId.Name;
                case ZenithScanCriteria.QuotationBasisTupleNodeType: return ScanCriteria.FieldId.QuotationBasis;
                case ZenithScanCriteria.StateTupleNodeType: return ScanCriteria.FieldId.State;
                case ZenithScanCriteria.StateAllowsTupleNodeType: return ScanCriteria.FieldId.StateAllows;
                case ZenithScanCriteria.StatusNoteTupleNodeType: return ScanCriteria.FieldId.StatusNote;
                case ZenithScanCriteria.TradingMarketTupleNodeType: return ScanCriteria.FieldId.TradingMarket;
                default:
                    return undefined;
            }
        }

        export function textFromId(value: ScanCriteria.TextFieldId): ZenithScanCriteria.TextField {
            const result = tryTextFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFTFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryTextFromId(value: ScanCriteria.TextFieldId): ZenithScanCriteria.TextField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.Board: return ZenithScanCriteria.BoardTupleNodeType;
                case ScanCriteria.FieldId.CallOrPut: return ZenithScanCriteria.CallOrPutTupleNodeType;
                case ScanCriteria.FieldId.Category: return ZenithScanCriteria.CategoryTupleNodeType;
                case ScanCriteria.FieldId.Cfi: return ZenithScanCriteria.CfiTupleNodeType;
                case ScanCriteria.FieldId.Class: return ZenithScanCriteria.ClassTupleNodeType;
                case ScanCriteria.FieldId.Code: return ZenithScanCriteria.CodeTupleNodeType;
                case ScanCriteria.FieldId.Currency: return ZenithScanCriteria.CurrencyTupleNodeType;
                case ScanCriteria.FieldId.Data: return ZenithScanCriteria.DataTupleNodeType;
                case ScanCriteria.FieldId.Exchange: return ZenithScanCriteria.ExchangeTupleNodeType;
                case ScanCriteria.FieldId.ExerciseType: return ZenithScanCriteria.ExerciseTypeTupleNodeType;
                case ScanCriteria.FieldId.Leg: return ZenithScanCriteria.LegTupleNodeType;
                case ScanCriteria.FieldId.Market: return ZenithScanCriteria.MarketTupleNodeType;
                case ScanCriteria.FieldId.Name: return ZenithScanCriteria.NameTupleNodeType;
                case ScanCriteria.FieldId.QuotationBasis: return ZenithScanCriteria.QuotationBasisTupleNodeType;
                case ScanCriteria.FieldId.State: return ZenithScanCriteria.StateTupleNodeType;
                case ScanCriteria.FieldId.StateAllows: return ZenithScanCriteria.StateAllowsTupleNodeType;
                case ScanCriteria.FieldId.StatusNote: return ZenithScanCriteria.StatusNoteTupleNodeType;
                case ScanCriteria.FieldId.TradingMarket: return ZenithScanCriteria.TradingMarketTupleNodeType;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }

        export function tryBooleanToId(value: ZenithScanCriteria.BooleanField): ScanCriteria.BooleanFieldId | undefined {
            switch (value) {
                case ZenithScanCriteria.IsIndexTupleNodeType: return ScanCriteria.FieldId.IsIndex;
                default:
                    return undefined;
            }
        }

        export function booleanFromId(value: ScanCriteria.BooleanFieldId): ZenithScanCriteria.BooleanField {
            const result = tryBooleanFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFBFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryBooleanFromId(value: ScanCriteria.BooleanFieldId): ZenithScanCriteria.BooleanField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.IsIndex: return ZenithScanCriteria.IsIndexTupleNodeType;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }
    }

    namespace PriceSubField {
        export function toId(value: ZenithScanCriteria.PriceSubFieldEnum): ScanCriteria.PriceSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCPSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: ZenithScanCriteria.PriceSubFieldEnum): ScanCriteria.PriceSubFieldId | undefined {
            switch (value) {
                case ZenithScanCriteria.PriceSubFieldEnum.LastPrice: return ScanCriteria.PriceSubFieldId.Last;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }

        export function fromId(value: ScanCriteria.PriceSubFieldId): ZenithScanCriteria.PriceSubFieldEnum {
            switch (value) {
                case ScanCriteria.PriceSubFieldId.Last: return ZenithScanCriteria.PriceSubFieldEnum.LastPrice;
                default:
                    throw new UnreachableCaseError('ZSCCPSFFI16179', value);
            }
        }
    }

    namespace DateSubField {
        export function toId(value: ZenithScanCriteria.DateSubFieldEnum): ScanCriteria.DateSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCDSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: ZenithScanCriteria.DateSubFieldEnum): ScanCriteria.DateSubFieldId | undefined {
            switch (value) {
                case ZenithScanCriteria.DateSubFieldEnum.Dividend: return ScanCriteria.DateSubFieldId.Dividend;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }

        export function fromId(value: ScanCriteria.DateSubFieldId): ZenithScanCriteria.DateSubFieldEnum {
            switch (value) {
                case ScanCriteria.DateSubFieldId.Dividend: return ZenithScanCriteria.DateSubFieldEnum.Dividend;
                default:
                    throw new UnreachableCaseError('ZSCCDSFFI16179', value);
            }
        }
    }

    namespace AltCodeSubField {
        export function toId(value: Zenith.MarketController.SearchSymbols.AlternateKey): ScanCriteria.AltCodeSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCACSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: Zenith.MarketController.SearchSymbols.AlternateKey): ScanCriteria.AltCodeSubFieldId | undefined {
            switch (value) {
                case Zenith.MarketController.SearchSymbols.AlternateKey.Ticker: return ScanCriteria.AltCodeSubFieldId.Ticker;
                case Zenith.MarketController.SearchSymbols.AlternateKey.Isin: return ScanCriteria.AltCodeSubFieldId.Isin;
                case Zenith.MarketController.SearchSymbols.AlternateKey.Base: return ScanCriteria.AltCodeSubFieldId.Base;
                case Zenith.MarketController.SearchSymbols.AlternateKey.Gics: return ScanCriteria.AltCodeSubFieldId.Gics;
                case Zenith.MarketController.SearchSymbols.AlternateKey.Ric: return ScanCriteria.AltCodeSubFieldId.Ric;
                case Zenith.MarketController.SearchSymbols.AlternateKey.Short: return ScanCriteria.AltCodeSubFieldId.Short;
                case Zenith.MarketController.SearchSymbols.AlternateKey.Long: return ScanCriteria.AltCodeSubFieldId.Long;
                case Zenith.MarketController.SearchSymbols.AlternateKey.Uid: return ScanCriteria.AltCodeSubFieldId.Uid;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }

        export function fromId(value: ScanCriteria.AltCodeSubFieldId): Zenith.MarketController.SearchSymbols.AlternateKey {
            switch (value) {
                case ScanCriteria.AltCodeSubFieldId.Ticker: return Zenith.MarketController.SearchSymbols.AlternateKey.Ticker;
                case ScanCriteria.AltCodeSubFieldId.Isin: return Zenith.MarketController.SearchSymbols.AlternateKey.Isin;
                case ScanCriteria.AltCodeSubFieldId.Base: return Zenith.MarketController.SearchSymbols.AlternateKey.Base;
                case ScanCriteria.AltCodeSubFieldId.Gics: return Zenith.MarketController.SearchSymbols.AlternateKey.Gics;
                case ScanCriteria.AltCodeSubFieldId.Ric: return Zenith.MarketController.SearchSymbols.AlternateKey.Ric;
                case ScanCriteria.AltCodeSubFieldId.Short: return Zenith.MarketController.SearchSymbols.AlternateKey.Short;
                case ScanCriteria.AltCodeSubFieldId.Long: return Zenith.MarketController.SearchSymbols.AlternateKey.Long;
                case ScanCriteria.AltCodeSubFieldId.Uid: return Zenith.MarketController.SearchSymbols.AlternateKey.Uid;
                default:
                    throw new UnreachableCaseError('ZSCCACSFFI16179', value);
            }
        }
    }

    namespace AttributeSubField {
        export function toId(value: Zenith.MarketController.SearchSymbols.KnownAttributeKey): ScanCriteria.AttributeSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCATSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: Zenith.MarketController.SearchSymbols.KnownAttributeKey): ScanCriteria.AttributeSubFieldId | undefined {
            switch (value) {
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.Category: return ScanCriteria.AttributeSubFieldId.Category;
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.Class: return ScanCriteria.AttributeSubFieldId.Class;
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.Delivery: return ScanCriteria.AttributeSubFieldId.Delivery;
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.Sector: return ScanCriteria.AttributeSubFieldId.Sector;
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.Short: return ScanCriteria.AttributeSubFieldId.Short;
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.ShortSuspended: return ScanCriteria.AttributeSubFieldId.ShortSuspended;
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.SubSector: return ScanCriteria.AttributeSubFieldId.SubSector;
                case Zenith.MarketController.SearchSymbols.KnownAttributeKey.MaxRss: return ScanCriteria.AttributeSubFieldId.MaxRss;
                default:
                    const neverValueIgnored: never = value;
                    return undefined;
            }
        }

        export function fromId(value: ScanCriteria.AttributeSubFieldId): Zenith.MarketController.SearchSymbols.KnownAttributeKey {
            switch (value) {
                case ScanCriteria.AttributeSubFieldId.Category: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.Category;
                case ScanCriteria.AttributeSubFieldId.Class: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.Class;
                case ScanCriteria.AttributeSubFieldId.Delivery: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.Delivery;
                case ScanCriteria.AttributeSubFieldId.Sector: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.Sector;
                case ScanCriteria.AttributeSubFieldId.Short: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.Short;
                case ScanCriteria.AttributeSubFieldId.ShortSuspended: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.ShortSuspended;
                case ScanCriteria.AttributeSubFieldId.SubSector: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.SubSector;
                case ScanCriteria.AttributeSubFieldId.MaxRss: return Zenith.MarketController.SearchSymbols.KnownAttributeKey.MaxRss;
                default:
                    throw new UnreachableCaseError('ZSCCATSFFI16179', value);
            }
        }
    }

    namespace DateValue {
        export function fromDate(value: Date): ZenithScanCriteria.DateString {
            return ZenithConvert.Date.DateTimeIso8601.fromDate(value);
        }

        export function tryToDate(value: ZenithScanCriteria.DateString): SourceTzOffsetDateTime | undefined {
            return ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(value);
        }
    }

    namespace TextContainsAs {
        export function fromId(value: ScanCriteria.TextContainsAsId): ZenithScanCriteria.TextContainsAsEnum {
            switch (value) {
                case ScanCriteria.TextContainsAsId.None: return ZenithScanCriteria.TextContainsAsEnum.None;
                case ScanCriteria.TextContainsAsId.FromStart: return ZenithScanCriteria.TextContainsAsEnum.FromStart;
                case ScanCriteria.TextContainsAsId.FromEnd: return ZenithScanCriteria.TextContainsAsEnum.FromEnd;
                case ScanCriteria.TextContainsAsId.Exact: return ZenithScanCriteria.TextContainsAsEnum.Exact;
                default:
                    throw new UnreachableCaseError('ZSCCTCAFI51423', value);
            }
        }

        export function tryToId(value: ZenithScanCriteria.TextContainsAsEnum): ScanCriteria.TextContainsAsId | undefined {
            switch (value) {
                case ZenithScanCriteria.TextContainsAsEnum.None: return ScanCriteria.TextContainsAsId.None;
                case ZenithScanCriteria.TextContainsAsEnum.FromStart: return ScanCriteria.TextContainsAsId.FromStart;
                case ZenithScanCriteria.TextContainsAsEnum.FromEnd: return ScanCriteria.TextContainsAsId.FromEnd;
                case ZenithScanCriteria.TextContainsAsEnum.Exact: return ScanCriteria.TextContainsAsId.Exact;
                default:
                    return undefined;
            }
        }
    }
}

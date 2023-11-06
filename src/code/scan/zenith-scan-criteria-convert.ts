/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ZenithConvert, ZenithProtocol, ZenithProtocolCommon, ZenithProtocolScanCriteria } from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import {
    AssertInternalError,
    BaseZenithDataError,
    ErrorCode,
    Integer,
    SourceTzOffsetDateTime,
    ThrowableOk,
    ThrowableResult,
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

        addParsedNode(nodeType: ZenithProtocolScanCriteria.TupleNodeType): ParseProgress.ParsedNode {
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
            tupleNodeType: ZenithProtocolScanCriteria.TupleNodeType;
            nodeTypeId: ScanCriteria.NodeTypeId | undefined;
        }
    }

    export interface ParsedBoolean {
        node: ScanCriteria.BooleanNode;
        progress: ParseProgress;
    }

    export class ParseError extends BaseZenithDataError {
        progress: ParseProgress;

        constructor(code: ErrorCode, message: string) {
            super(StringId.ZenithScanCriteriaParseError, code, message);
        }
    }

    export function fromBooleanNode(node: ScanCriteria.BooleanNode): ZenithProtocolScanCriteria.BooleanTupleNode {
        switch (node.typeId) {
            case ScanCriteria.NodeTypeId.And: return fromMultiOperandBooleanNode(ZenithProtocolScanCriteria.AndTupleNodeType, node as ScanCriteria.MultiOperandBooleanNode);
            case ScanCriteria.NodeTypeId.Or: return fromMultiOperandBooleanNode(ZenithProtocolScanCriteria.OrTupleNodeType, node as ScanCriteria.MultiOperandBooleanNode);
            case ScanCriteria.NodeTypeId.Not: return fromSingleOperandBooleanNode(ZenithProtocolScanCriteria.NotTupleNodeType, node as ScanCriteria.SingleOperandBooleanNode);
            case ScanCriteria.NodeTypeId.NumericEquals: return fromNumericComparisonNode(ZenithProtocolScanCriteria.EqualTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericGreaterThan: return fromNumericComparisonNode(ZenithProtocolScanCriteria.GreaterThanTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericGreaterThanOrEqual: return fromNumericComparisonNode(ZenithProtocolScanCriteria.GreaterThanOrEqualTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericLessThan: return fromNumericComparisonNode(ZenithProtocolScanCriteria.LessThanTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.NumericLessThanOrEqual: return fromNumericComparisonNode(ZenithProtocolScanCriteria.LessThanOrEqualTupleNodeType, node as ScanCriteria.NumericComparisonBooleanNode);
            case ScanCriteria.NodeTypeId.All: return [ZenithProtocolScanCriteria.AllTupleNodeType];
            case ScanCriteria.NodeTypeId.None: return [ZenithProtocolScanCriteria.NoneTupleNodeType];
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

    export function parseBoolean(node: ZenithProtocolScanCriteria.BooleanTupleNode): ThrowableResult<ParsedBoolean> {
        const parseProgress = new ParseProgress();

        const toResult = tryToExpectedBooleanNode(node, parseProgress);

        if (toResult.isOk()) {
            const parsedBoolean: ParsedBoolean = {
                node: toResult.value,
                progress: parseProgress,
            }
            return new ThrowableOk(parsedBoolean);
        } else {
            if (toResult instanceof ParseError) {
                toResult.progress = parseProgress;
            }
            return toResult;
        }
    }

    function fromMultiOperandBooleanNode(
        type: typeof ZenithProtocolScanCriteria.AndTupleNodeType | typeof ZenithProtocolScanCriteria.OrTupleNodeType,
        node: ScanCriteria.MultiOperandBooleanNode
    ): ZenithProtocolScanCriteria.LogicalTupleNode {
        const operands = node.operands;
        const count = operands.length;
        const params = new Array<ZenithProtocolScanCriteria.BooleanParam>(count);
        for (let i = 0; i < count; i++) {
            const operand = operands[i];
            const tupleNode = fromBooleanNode(operand);
            params[i] = tupleNode;
        }

        return [type, ...params];
    }

    function fromSingleOperandBooleanNode(type: typeof ZenithProtocolScanCriteria.NotTupleNodeType, node: ScanCriteria.SingleOperandBooleanNode): ZenithProtocolScanCriteria.LogicalTupleNode {
        const param = fromBooleanNode(node);
        return [type, param];
    }

    function fromNumericComparisonNode(
        type:
            typeof ZenithProtocolScanCriteria.EqualTupleNodeType |
            typeof ZenithProtocolScanCriteria.GreaterThanTupleNodeType |
            typeof ZenithProtocolScanCriteria.GreaterThanOrEqualTupleNodeType |
            typeof ZenithProtocolScanCriteria.LessThanTupleNodeType |
            typeof ZenithProtocolScanCriteria.LessThanOrEqualTupleNodeType,
        node: ScanCriteria.NumericComparisonBooleanNode
    ): ZenithProtocolScanCriteria.ComparisonTupleNode {
        const leftOperand = fromNumericOperand(node.leftOperand);
        const rightOperand = fromNumericOperand(node.leftOperand);
        return [type, leftOperand, rightOperand];
    }

    function fromNumericOperand(operand: ScanCriteria.NumericNode | number): ZenithProtocolScanCriteria.NumericParam {
        if (operand instanceof ScanCriteria.NumericNode) {
            return fromNumericNodeParam(operand)
        } else {
            return operand;
        }
    }

    function fromNumericNodeParam(node: ScanCriteria.NumericNode): ZenithProtocolScanCriteria.NumericParam {
        switch (node.typeId) {
            case ScanCriteria.NodeTypeId.NumericAdd: return fromLeftRightArithmeticNumericNodeParam(ZenithProtocolScanCriteria.AddTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericDiv: return fromLeftRightArithmeticNumericNodeParam(ZenithProtocolScanCriteria.DivTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericMod: return fromLeftRightArithmeticNumericNodeParam(ZenithProtocolScanCriteria.ModTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericMul: return fromLeftRightArithmeticNumericNodeParam(ZenithProtocolScanCriteria.MulTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericSub: return fromLeftRightArithmeticNumericNodeParam(ZenithProtocolScanCriteria.SubTupleNodeType, node as ScanCriteria.LeftRightArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericNeg: return fromUnaryArithmeticNumericNodeParam(ZenithProtocolScanCriteria.NegTupleNodeType, node as ScanCriteria.UnaryArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericPos: return fromUnaryArithmeticNumericNodeParam(ZenithProtocolScanCriteria.PosTupleNodeType, node as ScanCriteria.UnaryArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericAbs: return fromUnaryArithmeticNumericNodeParam(ZenithProtocolScanCriteria.AbsTupleNodeType, node as ScanCriteria.UnaryArithmeticNumericNode);
            case ScanCriteria.NodeTypeId.NumericFieldValueGet: return fromNumericFieldValueGetNode(node as ScanCriteria.NumericFieldValueGetNode);
            case ScanCriteria.NodeTypeId.NumericIf: return fromNumericIfNode(node as ScanCriteria.NumericIfNode);
            default:
                throw new UnreachableCaseError('ZSCCFNNPU', node.typeId);
        }
    }

    function fromUnaryArithmeticNumericNodeParam(
        type:
            typeof ZenithProtocolScanCriteria.NegTupleNodeType |
            typeof ZenithProtocolScanCriteria.PosTupleNodeType |
            typeof ZenithProtocolScanCriteria.AbsTupleNodeType,
        node: ScanCriteria.UnaryArithmeticNumericNode
    ): ZenithProtocolScanCriteria.UnaryExpressionTupleNode {
        const operand = node.operand;
        let param: ZenithProtocolScanCriteria.NumericParam;
        if (operand instanceof ScanCriteria.NumericNode) {
            param = fromNumericNodeParam(operand);
        } else {
            param = operand;
        }

        return [type, param];
    }

    function fromLeftRightArithmeticNumericNodeParam(
        type:
            typeof ZenithProtocolScanCriteria.AddTupleNodeType |
            typeof ZenithProtocolScanCriteria.DivTupleNodeType |
            typeof ZenithProtocolScanCriteria.ModTupleNodeType |
            typeof ZenithProtocolScanCriteria.MulTupleNodeType |
            typeof ZenithProtocolScanCriteria.SubTupleNodeType,
        node: ScanCriteria.LeftRightArithmeticNumericNode
    ): ZenithProtocolScanCriteria.BinaryExpressionTupleNode {
        const leftOperand = node.leftOperand;
        let leftParam: ZenithProtocolScanCriteria.NumericParam;
        if (leftOperand instanceof ScanCriteria.NumericNode) {
            leftParam = fromNumericNodeParam(leftOperand);
        } else {
            leftParam = leftOperand;
        }

        const rightOperand = node.rightOperand;
        let rightParam: ZenithProtocolScanCriteria.NumericParam;
        if (rightOperand instanceof ScanCriteria.NumericNode) {
            rightParam = fromNumericNodeParam(rightOperand);
        } else {
            rightParam = rightOperand;
        }

        return [type, leftParam, rightParam];
    }

    function fromNumericFieldValueGetNode(node: ScanCriteria.NumericFieldValueGetNode): ZenithProtocolScanCriteria.NumericField {
        return Field.numericFromId(node.fieldId);
    }

    function fromNumericIfNode(node: ScanCriteria.NumericIfNode): ZenithProtocolScanCriteria.NumericIfTupleNode {
        const tupleLength = 3 + node.trueArms.length * 2; // 1 (type) + 2 * trueArms + 2 (falseArm)
        const tupleNode = new Array<unknown>(tupleLength);
        tupleNode[0] = ZenithProtocolScanCriteria.IfTupleNodeType;

        let index = 1;
        for (const arm of node.trueArms) {
            tupleNode[index++] = fromBooleanNode(arm.condition);
            tupleNode[index++] = fromNumericOperand(arm.value);
        }

        tupleNode[index++] = fromBooleanNode(node.falseArm.condition);
        tupleNode[index] = fromNumericOperand(node.falseArm.value);

        return tupleNode as ZenithProtocolScanCriteria.NumericIfTupleNode;
    }

    function fromBooleanFieldEqualsNode(node: ScanCriteria.BooleanFieldEqualsNode): ZenithProtocolScanCriteria.BooleanSingleMatchingTupleNode {
        const field = Field.booleanFromId(node.fieldId);
        const target = node.target;
        return [field, target];
    }

    function fromFieldHasValueNode(node: ScanCriteria.FieldHasValueNode):
            ZenithProtocolScanCriteria.NumericRangeMatchingTupleNode |
            ZenithProtocolScanCriteria.DateRangeMatchingTupleNode |
            ZenithProtocolScanCriteria.TextMatchingTupleNode {

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

    function fromNumericFieldEqualsNode(node: ScanCriteria.NumericFieldEqualsNode): ZenithProtocolScanCriteria.NumericRangeMatchingTupleNode {
        const field = Field.numericFromId(node.fieldId);
        const target = node.target;
        return [field, target];
    }

    function fromNumericFieldInRangeNode(node: ScanCriteria.NumericFieldInRangeNode): ZenithProtocolScanCriteria.NumericRangeMatchingTupleNode {
        const field = Field.numericFromId(node.fieldId);
        const namedParameters: ZenithProtocolScanCriteria.NumericNamedParameters = {
            Min: node.min,
            Max: node.max,
        }
        return [field, namedParameters];
    }

    function fromDateFieldEqualsNode(node: ScanCriteria.DateFieldEqualsNode): ZenithProtocolScanCriteria.DateRangeMatchingTupleNode {
        const field = Field.dateFromId(node.fieldId);
        const target = DateValue.fromDate(node.target.utcDate);
        return [field, target];
    }

    function fromDateFieldInRangeNode(node: ScanCriteria.DateFieldInRangeNode): ZenithProtocolScanCriteria.DateRangeMatchingTupleNode {
        const field = Field.dateFromId(node.fieldId);
        const nodeMin = node.min;
        const nodeMax = node.max;
        const namedParameters: ZenithProtocolScanCriteria.DateNamedParameters = {
            Min: nodeMin === undefined ? undefined: DateValue.fromDate(nodeMin.utcDate),
            Max: nodeMax === undefined ? undefined: DateValue.fromDate(nodeMax.utcDate),
        }
        return [field, namedParameters];
    }

    function fromTextFieldContainsNode(node: ScanCriteria.TextFieldContainsNode): ZenithProtocolScanCriteria.TextMatchingTupleNode {
        const field = Field.textFromId(node.fieldId);
        const value = node.value;
        const as = TextContainsAs.fromId(node.asId);
        const namedParameters: ZenithProtocolScanCriteria.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, value, namedParameters];
    }

    function fromSubFieldHasValueNode(node: ScanCriteria.SubFieldHasValueNode):
            ZenithProtocolScanCriteria.NumericNamedRangeMatchingTupleNode |
            ZenithProtocolScanCriteria.DateNamedRangeMatchingTupleNode |
            ZenithProtocolScanCriteria.NamedTextMatchingTupleNode {
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

    function fromPriceSubFieldHasValueNode(node: ScanCriteria.PriceSubFieldHasValueNode): ZenithProtocolScanCriteria.NumericNamedRangeMatchingTupleNode {
        return fromPriceSubFieldHasValue(node.subFieldId);
    }

    function fromPriceSubFieldHasValue(subFieldId: ScanCriteria.PriceSubFieldId): ZenithProtocolScanCriteria.NumericNamedRangeMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.PriceTupleNodeType;
        const subField = PriceSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromPriceSubFieldEqualsNode(node: ScanCriteria.PriceSubFieldEqualsNode): ZenithProtocolScanCriteria.NumericNamedRangeMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.PriceTupleNodeType;
        const subField = PriceSubField.fromId(node.subFieldId);
        const target = node.target;
        return [field, subField, target];
    }

    function fromPriceSubFieldInRangeNode(node: ScanCriteria.PriceSubFieldInRangeNode): ZenithProtocolScanCriteria.NumericNamedRangeMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.PriceTupleNodeType;
        const subField = PriceSubField.fromId(node.subFieldId);
        const namedParameters: ZenithProtocolScanCriteria.NumericNamedParameters = {
            Min: node.min,
            Max: node.max,
        }
        return [field, subField, namedParameters];
    }

    function fromDateSubFieldHasValueNode(node: ScanCriteria.DateSubFieldHasValueNode): ZenithProtocolScanCriteria.DateNamedRangeMatchingTupleNode {
        return fromDateSubFieldHasValue(node.subFieldId);
    }

    function fromDateSubFieldHasValue(subFieldId: ScanCriteria.DateSubFieldId): ZenithProtocolScanCriteria.DateNamedRangeMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.DateTupleNodeType;
        const subField = DateSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromDateSubFieldEqualsNode(node: ScanCriteria.DateSubFieldEqualsNode): ZenithProtocolScanCriteria.DateNamedRangeMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.DateTupleNodeType;
        const subField = DateSubField.fromId(node.subFieldId);
        const target = DateValue.fromDate(node.target.utcDate);
        return [field, subField, target];
    }

    function fromDateSubFieldInRangeNode(node: ScanCriteria.DateSubFieldInRangeNode): ZenithProtocolScanCriteria.DateNamedRangeMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.DateTupleNodeType;
        const subField = DateSubField.fromId(node.subFieldId);
        const nodeMin = node.min;
        const nodeMax = node.max;
        const namedParameters: ZenithProtocolScanCriteria.DateNamedParameters = {
            Min: nodeMin === undefined ? undefined: DateValue.fromDate(nodeMin.utcDate),
            Max: nodeMax === undefined ? undefined: DateValue.fromDate(nodeMax.utcDate),
        }
        return [field, subField, namedParameters];
    }

    function fromAltCodeSubFieldHasValueNode(node: ScanCriteria.AltCodeSubFieldHasValueNode): ZenithProtocolScanCriteria.NamedTextMatchingTupleNode {
        return fromAltCodeSubFieldHasValue(node.subFieldId);
    }

    function fromAltCodeSubFieldHasValue(subFieldId: ScanCriteria.AltCodeSubFieldId): ZenithProtocolScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.AltCodeTupleNodeType;
        const subField = AltCodeSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromAltCodeSubFieldContainsNode(node: ScanCriteria.AltCodeSubFieldContainsNode): ZenithProtocolScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.AltCodeTupleNodeType;
        const subField = AltCodeSubField.fromId(node.subFieldId);
        const value = node.value;
        const as = TextContainsAs.fromId(node.asId);
        const namedParameters: ZenithProtocolScanCriteria.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, subField, value, namedParameters];
    }

    function fromAttributeSubFieldHasValueNode(node: ScanCriteria.AttributeSubFieldHasValueNode): ZenithProtocolScanCriteria.NamedTextMatchingTupleNode {
        return fromAttributeSubFieldHasValue(node.subFieldId);
    }

    function fromAttributeSubFieldHasValue(subFieldId: ScanCriteria.AttributeSubFieldId): ZenithProtocolScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.AttributeTupleNodeType;
        const subField = AttributeSubField.fromId(subFieldId);
        return [field, subField];
    }

    function fromAttributeSubFieldContainsNode(node: ScanCriteria.AttributeSubFieldContainsNode): ZenithProtocolScanCriteria.NamedTextMatchingTupleNode {
        const field = ZenithProtocolScanCriteria.AttributeTupleNodeType;
        const subField = AttributeSubField.fromId(node.subFieldId);
        const value = node.value;
        const as = TextContainsAs.fromId(node.asId);
        const namedParameters: ZenithProtocolScanCriteria.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, subField, value, namedParameters];
    }

    function tryToExpectedBooleanNode(node: ZenithProtocolScanCriteria.BooleanTupleNode, toProgress: ParseProgress): ThrowableResult<ScanCriteria.BooleanNode> {
        toProgress.enterTupleNode();
        if (!Array.isArray(node)) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_BooleanTupleNodeIsNotAnArray, '');
        } else {
            if (node.length === 0) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_BooleanTupleNodeArrayIsZeroLength, '');
            } else {
                const nodeType = node[0];
                if (typeof nodeType !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_BooleanTupleNodeTypeIsNotString, `${nodeType}`);
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

    function tryToBooleanNode(typleNode: ZenithProtocolScanCriteria.BooleanTupleNode, toProgress: ParseProgress): ThrowableResult<ScanCriteria.BooleanNode> {
        const nodeType = typleNode[0] as ZenithProtocolScanCriteria.BooleanTupleNodeType;

        switch (nodeType) {
            // Logical
            case ZenithProtocolScanCriteria.AndTupleNodeType: return tryToMultiOperandLogicalBooleanNode(typleNode as ZenithProtocolScanCriteria.LogicalTupleNode, ScanCriteria.AndNode, toProgress);
            case ZenithProtocolScanCriteria.OrTupleNodeType: return tryToMultiOperandLogicalBooleanNode(typleNode as ZenithProtocolScanCriteria.LogicalTupleNode, ScanCriteria.OrNode, toProgress);
            case ZenithProtocolScanCriteria.NotTupleNodeType: return tryToSingleOperandLogicalBooleanNode(typleNode as ZenithProtocolScanCriteria.LogicalTupleNode, ScanCriteria.NotNode, toProgress);

            // Comparison
            case ZenithProtocolScanCriteria.EqualTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithProtocolScanCriteria.ComparisonTupleNode, ScanCriteria.NumericEqualsNode, toProgress);
            case ZenithProtocolScanCriteria.GreaterThanTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithProtocolScanCriteria.ComparisonTupleNode, ScanCriteria.NumericGreaterThanNode, toProgress);
            case ZenithProtocolScanCriteria.GreaterThanOrEqualTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithProtocolScanCriteria.ComparisonTupleNode, ScanCriteria.NumericGreaterThanOrEqualNode, toProgress);
            case ZenithProtocolScanCriteria.LessThanTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithProtocolScanCriteria.ComparisonTupleNode, ScanCriteria.NumericLessThanNode, toProgress);
            case ZenithProtocolScanCriteria.LessThanOrEqualTupleNodeType: return tryToNumericComparisonNode(typleNode as ZenithProtocolScanCriteria.ComparisonTupleNode, ScanCriteria.NumericLessThanOrEqualNode, toProgress);
            case ZenithProtocolScanCriteria.AllTupleNodeType: return new ThrowableOk(new ScanCriteria.AllNode());
            case ZenithProtocolScanCriteria.NoneTupleNodeType: return new ThrowableOk(new ScanCriteria.NoneNode());

            // Matching
            case ZenithProtocolScanCriteria.AltCodeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.AltCode, toProgress);
            case ZenithProtocolScanCriteria.AttributeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Attribute, toProgress);
            case ZenithProtocolScanCriteria.AuctionTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Auction, toProgress);
            case ZenithProtocolScanCriteria.AuctionLastTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Auction, toProgress);
            case ZenithProtocolScanCriteria.AuctionQuantityTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.AuctionQuantity, toProgress);
            case ZenithProtocolScanCriteria.BestAskCountTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestAskCount, toProgress);
            case ZenithProtocolScanCriteria.BestAskPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestAskPrice, toProgress);
            case ZenithProtocolScanCriteria.BestAskQuantityTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestAskQuantity, toProgress);
            case ZenithProtocolScanCriteria.BestBidCountTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestBidCount, toProgress);
            case ZenithProtocolScanCriteria.BestBidPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestBidPrice, toProgress);
            case ZenithProtocolScanCriteria.BestBidQuantityTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.BestBidQuantity, toProgress);
            case ZenithProtocolScanCriteria.BoardTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Board, toProgress);
            case ZenithProtocolScanCriteria.CallOrPutTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.CallOrPut, toProgress);
            case ZenithProtocolScanCriteria.CategoryTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Category, toProgress);
            case ZenithProtocolScanCriteria.CfiTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Cfi, toProgress);
            case ZenithProtocolScanCriteria.ClassTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Class, toProgress);
            case ZenithProtocolScanCriteria.ClosePriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ClosePrice, toProgress);
            case ZenithProtocolScanCriteria.CodeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Code, toProgress);
            case ZenithProtocolScanCriteria.ContractSizeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ContractSize, toProgress);
            case ZenithProtocolScanCriteria.CurrencyTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Currency, toProgress);
            case ZenithProtocolScanCriteria.DataTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Data, toProgress);
            case ZenithProtocolScanCriteria.DateTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Date, toProgress);
            case ZenithProtocolScanCriteria.ExerciseTypeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ExerciseType, toProgress);
            case ZenithProtocolScanCriteria.ExchangeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Exchange, toProgress);
            case ZenithProtocolScanCriteria.ExpiryDateTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ExpiryDate, toProgress);
            case ZenithProtocolScanCriteria.HighPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.HighPrice, toProgress);
            case ZenithProtocolScanCriteria.IsIndexTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.IsIndex, toProgress);
            case ZenithProtocolScanCriteria.LegTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Leg, toProgress);
            case ZenithProtocolScanCriteria.LastPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.LastPrice, toProgress);
            case ZenithProtocolScanCriteria.LotSizeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.LotSize, toProgress);
            case ZenithProtocolScanCriteria.LowPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.LowPrice, toProgress);
            case ZenithProtocolScanCriteria.MarketTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Market, toProgress);
            case ZenithProtocolScanCriteria.NameTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Name, toProgress);
            case ZenithProtocolScanCriteria.OpenInterestTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.OpenInterest, toProgress);
            case ZenithProtocolScanCriteria.OpenPriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.OpenPrice, toProgress);
            case ZenithProtocolScanCriteria.PriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Price, toProgress);
            case ZenithProtocolScanCriteria.PreviousCloseTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.PreviousClose, toProgress);
            case ZenithProtocolScanCriteria.QuotationBasisTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.QuotationBasis, toProgress);
            case ZenithProtocolScanCriteria.RemainderTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Remainder, toProgress);
            case ZenithProtocolScanCriteria.ShareIssueTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ShareIssue, toProgress);
            case ZenithProtocolScanCriteria.StateTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.State, toProgress);
            case ZenithProtocolScanCriteria.StateAllowsTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.StateAllows, toProgress);
            case ZenithProtocolScanCriteria.StatusNoteTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.StatusNote, toProgress);
            case ZenithProtocolScanCriteria.StrikePriceTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.StrikePrice, toProgress);
            case ZenithProtocolScanCriteria.TradesTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Trades, toProgress);
            case ZenithProtocolScanCriteria.TradingMarketTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.TradingMarket, toProgress);
            case ZenithProtocolScanCriteria.ValueTradedTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.ValueTraded, toProgress);
            case ZenithProtocolScanCriteria.VolumeTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Volume, toProgress);
            case ZenithProtocolScanCriteria.VwapTupleNodeType: return tryToFieldBooleanNode(typleNode as ZenithProtocolScanCriteria.MatchingTupleNode, ScanCriteria.FieldId.Vwap, toProgress);

            default: {
                const neverTupleNodeType: never = nodeType;
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_UnknownBooleanTupleNodeType, `${neverTupleNodeType as string}`);
            }
        }
    }

    function tryToMultiOperandLogicalBooleanNode(
        tulipNode: ZenithProtocolScanCriteria.LogicalTupleNode,
        nodeConstructor: new() => ScanCriteria.MultiOperandBooleanNode,
        toProgress: ParseProgress,
    ): ThrowableResult<ScanCriteria.MultiOperandBooleanNode> {
        const tulipNodeLength = tulipNode.length;
        if (tulipNodeLength < 2) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_LogicalBooleanMissingOperands, tulipNode[0]);
        } else {
            const operands = new Array<ScanCriteria.BooleanNode>(tulipNodeLength - 1);
            for (let i = 1; i < tulipNodeLength; i++) {
                const tulipParam = tulipNode[i] as ZenithProtocolScanCriteria.BooleanParam; // Need to cast as (skipped) first element in array is LogicalTupleNodeType
                const operandResult = tryToExpectedBooleanOperand(tulipParam, toProgress);
                if (operandResult.isErr()) {
                    return operandResult;
                } else {
                    operands[i - 1] = operandResult.value;
                }
            }

            const resultNode = new nodeConstructor();
            resultNode.operands = operands;
            return new ThrowableOk(resultNode);
        }
    }

    function tryToSingleOperandLogicalBooleanNode(
        tulipNode: ZenithProtocolScanCriteria.LogicalTupleNode,
        nodeConstructor: new() => ScanCriteria.SingleOperandBooleanNode,
        toProgress: ParseProgress,
    ): ThrowableResult<ScanCriteria.SingleOperandBooleanNode> {
        if (tulipNode.length !== 2) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_LogicalBooleanMissingOperand, tulipNode[0]);
        } else {
            const tupleNodeResult = tryToExpectedBooleanOperand(tulipNode[1], toProgress);
            if (tupleNodeResult.isErr()) {
                return tupleNodeResult;
            } else {
                const resultNode = new nodeConstructor();
                resultNode.operand = tupleNodeResult.value;
                return new ThrowableOk(resultNode);
            }
        }
    }

    function tryToExpectedBooleanOperand(
        param: ZenithProtocolScanCriteria.BooleanParam,
        toProgress: ParseProgress
    ): ThrowableResult<ScanCriteria.BooleanNode> {
        if (Array.isArray(param)) {
            return tryToExpectedBooleanNode(param, toProgress);
        } else {
            if (typeof param !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_UnexpectedBooleanParamType, `${param}`);
            } else {
                const fieldId = Field.tryMatchingToId(param);
                if (fieldId === undefined) {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_UnknownFieldBooleanParam, `${param}`);
                } else {
                    return new ThrowableOk(toFieldHasValueNode(fieldId));
                }
            }
        }
    }

    // function tryToFieldBooleanNode(value: ZenithScanCriteria.MatchingField): Result<ScanCriteria.FieldBooleanNode, ZenithScanCriteriaParseError> {
    //     switch (value) {

    //     }
    // }

    function tryToFieldBooleanNode(
        node: ZenithProtocolScanCriteria.MatchingTupleNode,
        fieldId: ScanCriteria.FieldId,
        toProgress: ParseProgress
    ): ThrowableResult<ScanCriteria.FieldBooleanNode> {
        const paramCount = node.length - 1;
        switch (paramCount) {
            case 0: {
                if (fieldId === ScanCriteria.FieldId.IsIndex) {
                    return tryToBooleanFieldEqualsNode(fieldId, ZenithProtocolScanCriteria.SingleDefault_IsIndex);
                } else {
                    return new ThrowableOk(toFieldHasValueNode(fieldId));
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
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_OnlySubFieldOrTextFieldNodesCanHave3Parameters, paramCount.toString());
                    }
                }
                break;
            }
            case 4: {
                if (!ScanCriteria.Field.isSubbed(fieldId)) {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_OnlySubFieldNodeCanHave4Parameters, paramCount.toString());
                } else {
                    const param1 = node[1];
                    const param2 = node[2];
                    const param3 = node[3];
                    const param4 = node[4];
                    return tryToTextSubFieldContainsNode(fieldId as ScanCriteria.SubbedFieldId, param1, param2, param3, param4);
                }
            }
            default:
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_FieldBooleanNodeHasTooManyParameters, paramCount.toString());
        }
    }

    function toFieldHasValueNode(fieldId: ScanCriteria.FieldId): ScanCriteria.FieldHasValueNode {
        const hasValueNode = new ScanCriteria.FieldHasValueNode();
        hasValueNode.fieldId = fieldId;
        return hasValueNode;
    }

    function tryToSubFieldHasValueNode(fieldId: ScanCriteria.SubbedFieldId, subField: unknown):
            ThrowableResult<
                ScanCriteria.PriceSubFieldHasValueNode |
                ScanCriteria.DateSubFieldHasValueNode |
                ScanCriteria.AltCodeSubFieldHasValueNode |
                ScanCriteria.AttributeSubFieldHasValueNode
            > {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`);
        } else {
            switch (fieldId) {
                case ScanCriteria.FieldId.Price: {
                    const subFieldId = PriceSubField.tryToId(subField as ZenithProtocolScanCriteria.PriceSubFieldEnum);
                    if (subFieldId === undefined) {
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_PriceSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanCriteria.PriceSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new ThrowableOk(node);
                    }
                }
                case ScanCriteria.FieldId.Date: {
                    const subFieldId = DateSubField.tryToId(subField as ZenithProtocolScanCriteria.DateSubFieldEnum);
                    if (subFieldId === undefined) {
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_PriceSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanCriteria.DateSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new ThrowableOk(node);
                    }
                }
                case ScanCriteria.FieldId.AltCode: {
                    const subFieldId = AltCodeSubField.tryToId(subField as ZenithProtocolScanCriteria.AltCodeSubField);
                    if (subFieldId === undefined) {
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_AltCodeSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanCriteria.AltCodeSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new ThrowableOk(node);
                    }
                }
                case ScanCriteria.FieldId.Attribute: {
                    const subFieldId = AttributeSubField.tryToId(subField as ZenithProtocolScanCriteria.AttributeSubField);
                    if (subFieldId === undefined) {
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_AttributeSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanCriteria.AttributeSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new ThrowableOk(node);
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
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_NamedParametersCannotBeNull, 'null');
                } else {
                    const numericFieldId = fieldId as ScanCriteria.NumericFieldId;
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithProtocolScanCriteria.NumericNamedParameters;
                    if (at !== undefined) {
                        return tryToNumericFieldEqualsNode(numericFieldId, at);
                    } else {
                        return tryToNumericFieldInRangeNode(numericFieldId, min, max);
                    }
                }
            }
            case ScanCriteria.FieldDataTypeId.Date: {
                if (namedParameters === null) {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_NamedParametersCannotBeNull, 'null');
                } else {
                    const dateFieldId = fieldId as ScanCriteria.DateFieldId;
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithProtocolScanCriteria.DateNamedParameters;
                    if (at !== undefined) {
                        return tryToDateFieldEqualsNode(dateFieldId, at);
                    } else {
                        return tryToDateFieldInRangeNode(dateFieldId, min, max);
                    }
                }
            }
            case ScanCriteria.FieldDataTypeId.Text: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_FirstParameterCannotBeObjectOrNull, `${namedParameters}`);
            }
            case ScanCriteria.FieldDataTypeId.Boolean: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_FirstParameterCannotBeObjectOrNull, `${namedParameters}`);
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
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_NamedParametersCannotBeNull, '<null>');
                    } else {
                        const { As: as, IgnoreCase: ignoreCase } = param2 as ZenithProtocolScanCriteria.TextNamedParameters;
                        return tryToTextFieldContainsNode(fieldId as ScanCriteria.TextFieldId, param1, as, ignoreCase);
                    }
                } else {
                    return tryToTextFieldContainsNode(fieldId as ScanCriteria.TextFieldId, param1, param2, undefined);
                }
            }
            case ScanCriteria.FieldDataTypeId.Boolean: {
                return new ParseError(
                    ErrorCode.ZenithScanCriteriaParse_BooleanFieldCanOnlyHaveOneParameter,
                    Field.booleanFromId(fieldId as ScanCriteria.BooleanFieldId)
                );
            }
            default:
                throw new UnreachableCaseError('ZSCCTTFCOIRN10008', fieldDataTypeId);
        }
    }

    function tryToNumericFieldEqualsNode(fieldId: ScanCriteria.NumericFieldId, target: unknown): ThrowableResult<ScanCriteria.NumericFieldEqualsNode> {
        if (typeof target !== 'number') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_TargetIsNotNumber, `${target}`);
        } else {
            const node = new ScanCriteria.NumericFieldEqualsNode();
            node.fieldId = fieldId;
            node.target = target;
            return new ThrowableOk(node);
        }
    }

    function tryToNumericFieldInRangeNode(fieldId: ScanCriteria.NumericFieldId, min: unknown, max: unknown): ThrowableResult<ScanCriteria.NumericFieldInRangeNode> {
        const minUndefined = min === undefined;
        if (!minUndefined && typeof min !== 'number') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinIsDefinedButNotNumber, `${min}`);
        } else {
            const maxUndefined = max === undefined;
            if (!maxUndefined && typeof max !== 'number') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotNumber, `${max}`);
            } else {
                if (minUndefined && maxUndefined) {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, '');
                } else {
                    const node = new ScanCriteria.NumericFieldInRangeNode();
                    node.fieldId = fieldId;
                    node.min = min;
                    node.max = max;
                    return new ThrowableOk(node);
                }
            }
        }
    }

    function tryToDateFieldEqualsNode(fieldId: ScanCriteria.DateFieldId, targetAsString: unknown): ThrowableResult<ScanCriteria.DateFieldEqualsNode> {
        if (typeof targetAsString !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_DateFieldEqualsTargetIsNotString, `${targetAsString}`);
        } else {
            const target = DateValue.tryToDate(targetAsString);
            if (target === undefined) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_TargetHasInvalidDateFormat, `${targetAsString}`);
            } else {
                const node = new ScanCriteria.DateFieldEqualsNode();
                node.fieldId = fieldId;
                node.target = target;
                return new ThrowableOk(node);
            }
        }
    }

    function tryToDateFieldInRangeNode(fieldId: ScanCriteria.DateFieldId, min: unknown, max: unknown): ThrowableResult<ScanCriteria.DateFieldInRangeNode> {
        let minDate: SourceTzOffsetDateTime | undefined;
        if (min === undefined) {
            minDate = undefined;
        } else {
            if (typeof min !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinIsDefinedButNotString, `${min}`);
            } else {
                minDate = DateValue.tryToDate(min);
                if (minDate === undefined) {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinHasInvalidDateFormat, `${min}`);
                }
            }
        }

        let maxDate: SourceTzOffsetDateTime | undefined;
        if (max === undefined) {
            maxDate = undefined;
        } else {
            if (typeof max !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotString, `${max}`);
            } else {
                maxDate = DateValue.tryToDate(max);
                if (maxDate === undefined) {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMaxHasInvalidDateFormat, `${max}`);
                }
            }
        }

        if (minDate === undefined && maxDate === undefined) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, '');
        } else {
            const node = new ScanCriteria.DateFieldInRangeNode();
            node.fieldId = fieldId;
            node.min = minDate;
            node.max = maxDate;
            return new ThrowableOk(node);
        }
    }

    function tryToTextFieldContainsNode(fieldId: ScanCriteria.TextFieldId, value: unknown, as: unknown, ignoreCase: unknown):
            ThrowableResult<ScanCriteria.TextFieldContainsNode> {
        const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
        if (propertiesResult.isErr()) {
            return propertiesResult;
        } else {
            const properties = propertiesResult.value;
            const node = new ScanCriteria.TextFieldContainsNode();
            node.fieldId = fieldId;
            node.value = properties.value;
            node.asId = properties.asId;
            node.ignoreCase = properties.ignoreCase;
            return new ThrowableOk(node);
        }
    }

    function tryToBooleanFieldEqualsNode(fieldId: ScanCriteria.BooleanFieldId, param1: unknown): ThrowableResult<ScanCriteria.BooleanFieldEqualsNode> {
        if (typeof param1 !== 'boolean') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_BooleanFieldEqualsTargetIsNotBoolean, `${param1}`);
        } else {
            const node = new ScanCriteria.BooleanFieldEqualsNode();
            node.fieldId = fieldId;
            node.target = param1;
            return new ThrowableOk(node);
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
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_OnlyTextSubFieldContainsNodeCanHave4Parameters, Field.matchingFromId(fieldId));
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
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_NamedParametersCannotBeNull, 'null');
                } else {
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithProtocolScanCriteria.NumericNamedParameters;
                    if (at !== undefined) {
                        return tryToPriceSubFieldEqualsNode(subField, at);
                    } else {
                        return tryToPriceSubFieldInRangeNode(subField, min, max);
                    }
                }
            }
            case ScanCriteria.FieldId.Date: {
                if (namedParameters === null) {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_NamedParametersCannotBeNull, 'null');
                } else {
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithProtocolScanCriteria.DateNamedParameters;
                    if (at !== undefined) {
                        return tryToDateSubFieldEqualsNode(subField, at);
                    } else {
                        return tryToDateSubFieldInRangeNode(subField, min, max);
                    }
                }
            }
            case ScanCriteria.FieldId.AltCode: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_SecondParameterCannotBeObjectOrNull, `${namedParameters}`);
            }
            case ScanCriteria.FieldId.Attribute: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_SecondParameterCannotBeObjectOrNull, `${namedParameters}`);
            }
            default:
                throw new UnreachableCaseError('ZSCCTNPTSFEOIE10008', fieldId);
        }
    }

    function tryToPriceSubFieldEqualsNode(subField: unknown, target: unknown): ThrowableResult<ScanCriteria.PriceSubFieldEqualsNode> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = PriceSubField.tryToId(subField as ZenithProtocolScanCriteria.PriceSubFieldEnum);
            if (subFieldId === undefined) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`);
            } else {
                if (typeof target !== 'number') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_TargetIsNotNumber, `${target}`);
                } else {
                    const node = new ScanCriteria.PriceSubFieldEqualsNode();
                    node.fieldId = ScanCriteria.FieldId.Price;
                    node.subFieldId = subFieldId;
                    node.target = target;
                    return new ThrowableOk(node);
                }
            }
        }
    }

    function tryToPriceSubFieldInRangeNode(subField: unknown, min: unknown, max: unknown): ThrowableResult<ScanCriteria.PriceSubFieldInRangeNode> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = PriceSubField.tryToId(subField as ZenithProtocolScanCriteria.PriceSubFieldEnum);
            if (subFieldId === undefined) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`);
            } else {
                const minUndefined = min === undefined;
                if (!minUndefined && typeof min !== 'number') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinIsDefinedButNotNumber, `${min}`);
                } else {
                    const maxUndefined = max === undefined;
                    if (!maxUndefined && typeof max !== 'number') {
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotNumber, `${max}`);
                    } else {
                        if (minUndefined && maxUndefined) {
                            return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, '');
                        } else {
                            const node = new ScanCriteria.PriceSubFieldInRangeNode();
                            node.fieldId = ScanCriteria.FieldId.Price;
                            node.subFieldId = subFieldId;
                            node.min = min;
                            node.max = max;
                            return new ThrowableOk(node);
                        }
                    }
                }
            }
        }
    }

    function tryToDateSubFieldEqualsNode(subField: unknown, target: unknown): ThrowableResult<ScanCriteria.DateSubFieldEqualsNode> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = DateSubField.tryToId(subField as ZenithProtocolScanCriteria.DateSubFieldEnum);
            if (subFieldId === undefined) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_DateSubFieldEqualsSubFieldIsUnknown, `${subField}`);
            } else {
                if (typeof target !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_DateSubFieldEqualsTargetIsNotString, `${target}`);
                } else {
                    const targetAsDate = DateValue.tryToDate(target);
                    if (targetAsDate === undefined) {
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_TargetHasInvalidDateFormat, `${target}`);
                    } else {
                        const node = new ScanCriteria.DateSubFieldEqualsNode();
                        node.fieldId = ScanCriteria.FieldId.Date;
                        node.subFieldId = subFieldId;
                        node.target = targetAsDate;
                        return new ThrowableOk(node);
                    }
                }
            }
        }
    }

    function tryToDateSubFieldInRangeNode(subField: unknown, min: unknown, max: unknown): ThrowableResult<ScanCriteria.DateSubFieldInRangeNode> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`);
        } else {
            let minDate: SourceTzOffsetDateTime | undefined;
            if (min === undefined) {
                minDate = undefined;
            } else {
                if (typeof min !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinIsDefinedButNotString, `${min}`);
                } else {
                    minDate = DateValue.tryToDate(min);
                    if (minDate === undefined) {
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinHasInvalidDateFormat, `${min}`);
                    }
                }
            }

            let maxDate: SourceTzOffsetDateTime | undefined;
            if (max === undefined) {
                maxDate = undefined;
            } else {
                if (typeof max !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMaxIsDefinedButNotString, `${max}`);
                } else {
                    maxDate = DateValue.tryToDate(max);
                    if (maxDate === undefined) {
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMaxHasInvalidDateFormat, `${max}`);
                    }
                }
            }

            if (minDate === undefined && maxDate === undefined) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_RangeMinAndMaxAreBothUndefined, '');
            } else {
                const node = new ScanCriteria.DateSubFieldInRangeNode();
                node.fieldId = ScanCriteria.FieldId.Date;
                node.min = minDate;
                node.max = maxDate;
                return new ThrowableOk(node);
            }
        }
    }



    function tryToAltCodeSubFieldContains(subField: unknown, value: unknown, as: unknown, ignoreCase: unknown): ThrowableResult<ScanCriteria.AltCodeSubFieldContainsNode> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = AltCodeSubField.tryToId(subField as ZenithProtocolScanCriteria.AltCodeSubField);
            if (subFieldId === undefined) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_AltCodeSubFieldContainsSubFieldIsUnknown, `${subField}`);
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
                    return new ThrowableOk(node);
                }
            }
        }
    }

    function tryToAttributeSubFieldContains(subField: unknown, value: unknown, as: unknown, ignoreCase: unknown): ThrowableResult<ScanCriteria.AttributeSubFieldContainsNode> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = AttributeSubField.tryToId(subField as ZenithProtocolScanCriteria.AttributeSubField);
            if (subFieldId === undefined) {
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_AttributeSubFieldContainsSubFieldIsUnknown, `${subField}`);
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
                    return new ThrowableOk(node);
                }
            }
        }
    }

    function tryToNumericComparisonNode(
        tulipNode: ZenithProtocolScanCriteria.ComparisonTupleNode,
        nodeConstructor: new() => ScanCriteria.NumericComparisonBooleanNode,
        toProgress: ParseProgress,
    ): ThrowableResult<ScanCriteria.NumericComparisonBooleanNode> {
        const nodeType = tulipNode[0];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (tulipNode.length !== 3) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_NumericComparisonDoesNotHave2Operands, nodeType);
        } else {
            const leftParam = tulipNode[1] as ZenithProtocolScanCriteria.NumericParam;
            const leftOperandResult = tryToExpectedNumericOperand(leftParam, `${nodeType}/${Strings[StringId.Left]}`, toProgress);
            if (leftOperandResult.isErr()) {
                return leftOperandResult;
            } else {
                const rightParam = tulipNode[2] as ZenithProtocolScanCriteria.NumericParam;
                const rightOperandResult = tryToExpectedNumericOperand(rightParam, `${nodeType}/${Strings[StringId.Right]}`, toProgress);
                if (rightOperandResult.isErr()) {
                    return rightOperandResult;
                } else {
                    const resultNode = new nodeConstructor();
                    resultNode.leftOperand = leftOperandResult.value;
                    resultNode.rightOperand = rightOperandResult.value;
                    return new ThrowableOk(resultNode);
                }
            }
        }
    }

    function tryToExpectedNumericOperand(
        numericParam: unknown, // ZenithScanCriteria.NumericParam,
        paramId: string,
        toProgress: ParseProgress,
    ): ThrowableResult<ScanCriteria.NumericNode | number> {
        if (typeof numericParam === 'number') {
            return new ThrowableOk(numericParam);
        } else {
            if (typeof numericParam === 'string') {
                return tryToNumericFieldValueGet(numericParam as ZenithProtocolScanCriteria.NumericField);
            } else {
                if (Array.isArray(numericParam)) {
                    return tryToExpectedArithmeticNumericNode(numericParam as ZenithProtocolScanCriteria.NumericTupleNode, toProgress);
                } else {
                    return new ParseError(ErrorCode.ZenithScanCriteriaParse_NumericParameterIsNotNumberOrComparableFieldOrArray, `${paramId}`);
                }
            }
        }
    }

    function tryToExpectedArithmeticNumericNode(
        numericTupleNode: ZenithProtocolScanCriteria.NumericTupleNode,
        toProgress: ParseProgress
    ): ThrowableResult<ScanCriteria.NumericNode> {
        const tupleNodeLength = numericTupleNode.length;
        if (tupleNodeLength < 1 ) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_NumericTupleNodeIsZeroLength, '');
        } else {
            const nodeType = numericTupleNode[0];
            if (typeof nodeType !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_NumericTupleNodeTypeIsNotString, `${nodeType}`);
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
        numericTupleNode: ZenithProtocolScanCriteria.NumericTupleNode,
        toProgress: ParseProgress
    ): ThrowableResult<ScanCriteria.NumericNode> {
        const tupleNodetype = numericTupleNode[0] as ZenithProtocolScanCriteria.ExpressionTupleNodeType;
        switch (tupleNodetype) {
            // Binary
            case ZenithProtocolScanCriteria.AddTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericAddNode, toProgress);
            case ZenithProtocolScanCriteria.DivSymbolTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericDivNode, toProgress);
            case ZenithProtocolScanCriteria.DivTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericDivNode, toProgress);
            case ZenithProtocolScanCriteria.ModSymbolTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericModNode, toProgress);
            case ZenithProtocolScanCriteria.ModTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericModNode, toProgress);
            case ZenithProtocolScanCriteria.MulSymbolTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericMulNode, toProgress);
            case ZenithProtocolScanCriteria.MulTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericMulNode, toProgress);
            case ZenithProtocolScanCriteria.SubTupleNodeType:
                return tryToLeftRightArithmeticNumericNode(numericTupleNode, ScanCriteria.NumericSubNode, toProgress);

            // Unary
            case ZenithProtocolScanCriteria.NegTupleNodeType:
                return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithProtocolScanCriteria.UnaryExpressionTupleNode, ScanCriteria.NumericNegNode, toProgress);
            case ZenithProtocolScanCriteria.PosTupleNodeType:
                return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithProtocolScanCriteria.UnaryExpressionTupleNode, ScanCriteria.NumericPosNode, toProgress);
            case ZenithProtocolScanCriteria.AbsTupleNodeType:
                return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithProtocolScanCriteria.UnaryExpressionTupleNode, ScanCriteria.NumericAbsNode, toProgress);

            // Unary or Binary (depending on number of params)
            case ZenithProtocolScanCriteria.SubOrNegSymbolTupleNodeType:
                return tryToUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithProtocolScanCriteria.UnaryExpressionTupleNode | ZenithProtocolScanCriteria.BinaryExpressionTupleNode,
                    ScanCriteria.NumericNegNode,
                    ScanCriteria.NumericSubNode,
                    toProgress
                );
            case ZenithProtocolScanCriteria.AddOrPosSymbolTupleNodeType:
                return tryToUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithProtocolScanCriteria.UnaryExpressionTupleNode | ZenithProtocolScanCriteria.BinaryExpressionTupleNode,
                    ScanCriteria.NumericPosNode,
                    ScanCriteria.NumericAddNode,
                    toProgress
                );

            case ZenithProtocolScanCriteria.IfTupleNodeType:
                return tryToNumericIfNode(numericTupleNode as ZenithProtocolScanCriteria.IfTupleNode, toProgress);

            default: {
                const neverTupleNodeType: never = tupleNodetype;
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_UnknownNumericTupleNodeType, `${neverTupleNodeType}`);
            }
        }
    }

    function tryToUnaryArithmeticNumericNode(
        numericTupleNode: ZenithProtocolScanCriteria.UnaryExpressionTupleNode,
        nodeConstructor: new() => ScanCriteria.UnaryArithmeticNumericNode,
        toProgress: ParseProgress
    ): ThrowableResult<ScanCriteria.NumericNode> {
        const nodeLength = numericTupleNode.length;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (nodeLength !== 2) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_UnaryArithmeticNumericTupleNodeRequires2Parameters, `${numericTupleNode}`);
        } else {
            const param = numericTupleNode[1];
            const operandResult = tryToExpectedNumericOperand(param, '', toProgress);
            if (operandResult.isErr()) {
                return operandResult;
            } else {
                const node = new nodeConstructor();
                node.operand = operandResult.value;
                return new ThrowableOk(node);
            }
        }
    }

    function tryToLeftRightArithmeticNumericNode(
        numericTupleNode: ZenithProtocolScanCriteria.NumericTupleNode,
        nodeConstructor: new() => ScanCriteria.LeftRightArithmeticNumericNode,
        toProgress: ParseProgress
    ): ThrowableResult<ScanCriteria.NumericNode> {
        const nodeLength = numericTupleNode.length;
        if (nodeLength !== 3) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_LeftRightArithmeticNumericTupleNodeRequires3Parameters, nodeLength.toString());
        } else {
            const binaryExpressionTupleNode = numericTupleNode as ZenithProtocolScanCriteria.BinaryExpressionTupleNode
            const leftParam = binaryExpressionTupleNode[1];
            const leftResult = tryToExpectedNumericOperand(leftParam, Strings[StringId.Left], toProgress);
            if (leftResult.isErr()) {
                return leftResult;
            } else {
                const rightParam = binaryExpressionTupleNode[2];
                const rightResult = tryToExpectedNumericOperand(rightParam, Strings[StringId.Right], toProgress);
                if (rightResult.isErr()) {
                    return rightResult;
                } else {
                    const node = new nodeConstructor();
                    node.leftOperand = leftResult.value;
                    node.rightOperand = rightResult.value;
                    return new ThrowableOk(node);
                }
            }
        }
    }

    function tryToUnaryOrLeftRightArithmeticNumericNode(
        numericTupleNode: ZenithProtocolScanCriteria.UnaryExpressionTupleNode | ZenithProtocolScanCriteria.BinaryExpressionTupleNode,
        unaryNodeConstructor: new() => ScanCriteria.UnaryArithmeticNumericNode,
        leftRightNodeConstructor: new() => ScanCriteria.LeftRightArithmeticNumericNode,
        toProgress: ParseProgress
    ): ThrowableResult<ScanCriteria.NumericNode> {
        const nodeLength = numericTupleNode.length;
        switch (nodeLength) {
            case 2: return tryToUnaryArithmeticNumericNode(numericTupleNode as ZenithProtocolScanCriteria.UnaryExpressionTupleNode, unaryNodeConstructor, toProgress);
            case 3: return tryToLeftRightArithmeticNumericNode(numericTupleNode as ZenithProtocolScanCriteria.BinaryExpressionTupleNode, leftRightNodeConstructor, toProgress);
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_NumericTupleNodeRequires2Or3Parameters, `${numericTupleNode}`);
        }
    }

    function tryToNumericIfNode(tupleNode: ZenithProtocolScanCriteria.IfTupleNode, toProgress: ParseProgress): ThrowableResult<ScanCriteria.NumericIfNode> {
        const tupleLength = tupleNode.length;
        if (tupleLength < 5) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_IfTupleNodeRequiresAtLeast4Parameters, `${tupleNode}`);
        } else {
            const armParameters = tupleLength - 1;
            const armsRemainder = armParameters % 2;
            if (armsRemainder !== 0) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_IfTupleNodeRequiresAnEvenNumberOfParameters, `${tupleNode}`);
            } else {
                const armCount = armParameters / 2;
                const trueArmCount = armCount - 1;
                const trueArms = new Array<ScanCriteria.NumericIfNode.Arm>(trueArmCount);
                let tupleIndex = 1;
                for (let i = 0; i < trueArmCount; i++) {
                    const armResult = tryToNumericIfArm(tupleNode, tupleIndex, toProgress);
                    if (armResult.isErr()) {
                        return armResult;
                    } else {
                        trueArms[i] = armResult.value;
                    }
                    tupleIndex += 2;
                }

                const armResult = tryToNumericIfArm(tupleNode, tupleIndex, toProgress);
                if (armResult.isErr()) {
                    return armResult;
                } else {
                    const falseArm = armResult.value;

                    const node = new ScanCriteria.NumericIfNode();
                    node.trueArms = trueArms;
                    node.falseArm = falseArm;
                    return new ThrowableOk(node);
                }
            }
        }
    }

    function tryToNumericIfArm(tupleNode: ZenithProtocolScanCriteria.IfTupleNode, tupleIndex: Integer, toProgress: ParseProgress): ThrowableResult<ScanCriteria.NumericIfNode.Arm> {
        const conditionElement = tupleNode[tupleIndex++] as ZenithProtocolScanCriteria.BooleanParam;
        const conditionResult = tryToExpectedBooleanOperand(conditionElement, toProgress);
        if (conditionResult.isErr()) {
            return conditionResult;
        } else {
            const valueElement = tupleNode[tupleIndex++] as ZenithProtocolScanCriteria.NumericParam;
            const valueResult = tryToExpectedNumericOperand(valueElement, tupleIndex.toString(), toProgress);
            if (valueResult.isErr()) {
                return valueResult;
            } else {
                const arm: ScanCriteria.NumericIfNode.Arm = {
                    condition: conditionResult.value,
                    value: valueResult.value,
                };
                return new ThrowableOk(arm);
            }
        }
    }

    function tryToNumericFieldValueGet(field: ZenithProtocolScanCriteria.NumericField): ThrowableResult<ScanCriteria.NumericFieldValueGetNode> {
        const fieldId = Field.tryNumericToId(field);
        if (fieldId === undefined) {
            return new ParseError(ErrorCode.ZenithScanCriteriaParse_UnknownNumericField, field);
        } else {
            const node = new ScanCriteria.NumericFieldValueGetNode();
            node.fieldId = fieldId;
            return new ThrowableOk(node);
        }
    }

    interface TextFieldContainsProperties {
        readonly value: string;
        readonly asId: ScanCriteria.TextContainsAsId;
        readonly ignoreCase: boolean;
    }

    namespace TextFieldContainsProperties {
        export function resolveFromUnknown(value: unknown, as: unknown, ignoreCase: unknown): ThrowableResult<TextFieldContainsProperties> {
            if (typeof value !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return new ParseError(ErrorCode.ZenithScanCriteriaParse_TextFieldContainsValueIsNotString, `${value}`);
            } else {
                let resolvedAsId: ScanCriteria.TextContainsAsId;
                if (as === undefined) {
                    resolvedAsId = ScanCriteria.TextContainsAsId.None;
                } else {
                    if (typeof as !== 'string') {
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_TextFieldContainsAsIsNotString, `${as}`);
                    } else {
                        const asId = TextContainsAs.tryToId(as as ZenithProtocolScanCriteria.TextContainsAsEnum);
                        if (asId === undefined) {
                            return new ParseError(ErrorCode.ZenithScanCriteriaParse_TextFieldContainsAsHasInvalidFormat, `${as}`);
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
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        return new ParseError(ErrorCode.ZenithScanCriteriaParse_TextFieldContainsAsIsNotBoolean, `${ignoreCase}`);
                    } else {
                        resolvedIgnoreCase = ignoreCase;
                    }
                }

                const properties: TextFieldContainsProperties = {
                    value,
                    asId: resolvedAsId,
                    ignoreCase: resolvedIgnoreCase,
                }
                return new ThrowableOk(properties);
            }
        }
    }
    namespace Field {
        export function tryMatchingToId(value: ZenithProtocolScanCriteria.MatchingField): ScanCriteria.FieldId | undefined {
            let fieldId: ScanCriteria.FieldId | undefined = tryNumericToId(value as ZenithProtocolScanCriteria.NumericField);
            if (fieldId === undefined) {
                fieldId = tryTextToId(value as ZenithProtocolScanCriteria.TextField);
                if (fieldId === undefined) {
                    fieldId = tryDateToId(value as ZenithProtocolScanCriteria.DateField);
                    if (fieldId === undefined) {
                        fieldId = tryBooleanToId(value as ZenithProtocolScanCriteria.BooleanField); // fieldId is left undefined if this try fails
                    }
                }
            }

            return fieldId;
        }

        export function matchingFromId(value: ScanCriteria.FieldId): ZenithProtocolScanCriteria.MatchingField {
            let field: ZenithProtocolScanCriteria.MatchingField | undefined = tryNumericFromId(value as ScanCriteria.NumericFieldId);
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

        export function tryDateToId(value: ZenithProtocolScanCriteria.DateField): ScanCriteria.DateFieldId | undefined {
            switch (value) {
                case ZenithProtocolScanCriteria.ExpiryDateTupleNodeType: return ScanCriteria.FieldId.ExpiryDate;
                default:
                    return undefined;
            }
        }

        export function dateFromId(value: ScanCriteria.DateFieldId): ZenithProtocolScanCriteria.DateField {
            const result = tryDateFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFDFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryDateFromId(value: ScanCriteria.DateFieldId): ZenithProtocolScanCriteria.DateField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.ExpiryDate: return ZenithProtocolScanCriteria.ExpiryDateTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function tryNumericToId(value: ZenithProtocolScanCriteria.NumericField): ScanCriteria.NumericFieldId | undefined {
            switch (value) {
                case ZenithProtocolScanCriteria.AuctionTupleNodeType: return ScanCriteria.FieldId.Auction;
                case ZenithProtocolScanCriteria.AuctionLastTupleNodeType: return ScanCriteria.FieldId.AuctionLast;
                case ZenithProtocolScanCriteria.AuctionQuantityTupleNodeType: return ScanCriteria.FieldId.AuctionQuantity;
                case ZenithProtocolScanCriteria.BestAskCountTupleNodeType: return ScanCriteria.FieldId.BestAskCount;
                case ZenithProtocolScanCriteria.BestAskPriceTupleNodeType: return ScanCriteria.FieldId.BestAskPrice;
                case ZenithProtocolScanCriteria.BestAskQuantityTupleNodeType: return ScanCriteria.FieldId.BestAskQuantity;
                case ZenithProtocolScanCriteria.BestBidCountTupleNodeType: return ScanCriteria.FieldId.BestBidCount;
                case ZenithProtocolScanCriteria.BestBidPriceTupleNodeType: return ScanCriteria.FieldId.BestBidPrice;
                case ZenithProtocolScanCriteria.BestBidQuantityTupleNodeType: return ScanCriteria.FieldId.BestBidQuantity;
                case ZenithProtocolScanCriteria.ClosePriceTupleNodeType: return ScanCriteria.FieldId.ClosePrice;
                case ZenithProtocolScanCriteria.ContractSizeTupleNodeType: return ScanCriteria.FieldId.ContractSize;
                case ZenithProtocolScanCriteria.HighPriceTupleNodeType: return ScanCriteria.FieldId.HighPrice;
                case ZenithProtocolScanCriteria.LastPriceTupleNodeType: return ScanCriteria.FieldId.LastPrice;
                case ZenithProtocolScanCriteria.LotSizeTupleNodeType: return ScanCriteria.FieldId.LotSize;
                case ZenithProtocolScanCriteria.LowPriceTupleNodeType: return ScanCriteria.FieldId.LowPrice;
                case ZenithProtocolScanCriteria.OpenInterestTupleNodeType: return ScanCriteria.FieldId.OpenInterest;
                case ZenithProtocolScanCriteria.OpenPriceTupleNodeType: return ScanCriteria.FieldId.OpenPrice;
                case ZenithProtocolScanCriteria.PreviousCloseTupleNodeType: return ScanCriteria.FieldId.PreviousClose;
                case ZenithProtocolScanCriteria.RemainderTupleNodeType: return ScanCriteria.FieldId.Remainder;
                case ZenithProtocolScanCriteria.ShareIssueTupleNodeType: return ScanCriteria.FieldId.ShareIssue;
                case ZenithProtocolScanCriteria.StrikePriceTupleNodeType: return ScanCriteria.FieldId.StrikePrice;
                case ZenithProtocolScanCriteria.TradesTupleNodeType: return ScanCriteria.FieldId.Trades;
                case ZenithProtocolScanCriteria.ValueTradedTupleNodeType: return ScanCriteria.FieldId.ValueTraded;
                case ZenithProtocolScanCriteria.VolumeTupleNodeType: return ScanCriteria.FieldId.Volume;
                case ZenithProtocolScanCriteria.VwapTupleNodeType: return ScanCriteria.FieldId.Vwap;
                default:
                    return undefined;
            }
        }

        export function numericFromId(value: ScanCriteria.NumericFieldId): ZenithProtocolScanCriteria.NumericField {
            const result = tryNumericFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFNFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryNumericFromId(value: ScanCriteria.NumericFieldId): ZenithProtocolScanCriteria.NumericField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.Auction: return ZenithProtocolScanCriteria.AuctionTupleNodeType;
                case ScanCriteria.FieldId.AuctionLast: return ZenithProtocolScanCriteria.AuctionLastTupleNodeType;
                case ScanCriteria.FieldId.AuctionQuantity: return ZenithProtocolScanCriteria.AuctionQuantityTupleNodeType;
                case ScanCriteria.FieldId.BestAskCount: return ZenithProtocolScanCriteria.BestAskCountTupleNodeType;
                case ScanCriteria.FieldId.BestAskPrice: return ZenithProtocolScanCriteria.BestAskPriceTupleNodeType;
                case ScanCriteria.FieldId.BestAskQuantity: return ZenithProtocolScanCriteria.BestAskQuantityTupleNodeType;
                case ScanCriteria.FieldId.BestBidCount: return ZenithProtocolScanCriteria.BestBidCountTupleNodeType;
                case ScanCriteria.FieldId.BestBidPrice: return ZenithProtocolScanCriteria.BestBidPriceTupleNodeType;
                case ScanCriteria.FieldId.BestBidQuantity: return ZenithProtocolScanCriteria.BestBidQuantityTupleNodeType;
                case ScanCriteria.FieldId.ClosePrice: return ZenithProtocolScanCriteria.ClosePriceTupleNodeType;
                case ScanCriteria.FieldId.ContractSize: return ZenithProtocolScanCriteria.ContractSizeTupleNodeType;
                case ScanCriteria.FieldId.HighPrice: return ZenithProtocolScanCriteria.HighPriceTupleNodeType;
                case ScanCriteria.FieldId.LastPrice: return ZenithProtocolScanCriteria.LastPriceTupleNodeType;
                case ScanCriteria.FieldId.LotSize: return ZenithProtocolScanCriteria.LotSizeTupleNodeType;
                case ScanCriteria.FieldId.LowPrice: return ZenithProtocolScanCriteria.LowPriceTupleNodeType;
                case ScanCriteria.FieldId.OpenInterest: return ZenithProtocolScanCriteria.OpenInterestTupleNodeType;
                case ScanCriteria.FieldId.OpenPrice: return ZenithProtocolScanCriteria.OpenPriceTupleNodeType;
                case ScanCriteria.FieldId.PreviousClose: return ZenithProtocolScanCriteria.PreviousCloseTupleNodeType;
                case ScanCriteria.FieldId.Remainder: return ZenithProtocolScanCriteria.RemainderTupleNodeType;
                case ScanCriteria.FieldId.ShareIssue: return ZenithProtocolScanCriteria.ShareIssueTupleNodeType;
                case ScanCriteria.FieldId.StrikePrice: return ZenithProtocolScanCriteria.StrikePriceTupleNodeType;
                case ScanCriteria.FieldId.Trades: return ZenithProtocolScanCriteria.TradesTupleNodeType;
                case ScanCriteria.FieldId.ValueTraded: return ZenithProtocolScanCriteria.ValueTradedTupleNodeType;
                case ScanCriteria.FieldId.Volume: return ZenithProtocolScanCriteria.VolumeTupleNodeType;
                case ScanCriteria.FieldId.Vwap: return ZenithProtocolScanCriteria.VwapTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function tryTextToId(value: ZenithProtocolScanCriteria.TextField): ScanCriteria.TextFieldId | undefined {
            switch (value) {
                case ZenithProtocolScanCriteria.BoardTupleNodeType: return ScanCriteria.FieldId.Board;
                case ZenithProtocolScanCriteria.CallOrPutTupleNodeType: return ScanCriteria.FieldId.CallOrPut;
                case ZenithProtocolScanCriteria.CategoryTupleNodeType: return ScanCriteria.FieldId.Category;
                case ZenithProtocolScanCriteria.CfiTupleNodeType: return ScanCriteria.FieldId.Cfi;
                case ZenithProtocolScanCriteria.ClassTupleNodeType: return ScanCriteria.FieldId.Class;
                case ZenithProtocolScanCriteria.CodeTupleNodeType: return ScanCriteria.FieldId.Code;
                case ZenithProtocolScanCriteria.CurrencyTupleNodeType: return ScanCriteria.FieldId.Currency;
                case ZenithProtocolScanCriteria.DataTupleNodeType: return ScanCriteria.FieldId.Data;
                case ZenithProtocolScanCriteria.ExchangeTupleNodeType: return ScanCriteria.FieldId.Exchange;
                case ZenithProtocolScanCriteria.ExerciseTypeTupleNodeType: return ScanCriteria.FieldId.ExerciseType;
                case ZenithProtocolScanCriteria.LegTupleNodeType: return ScanCriteria.FieldId.Leg;
                case ZenithProtocolScanCriteria.MarketTupleNodeType: return ScanCriteria.FieldId.Market;
                case ZenithProtocolScanCriteria.NameTupleNodeType: return ScanCriteria.FieldId.Name;
                case ZenithProtocolScanCriteria.QuotationBasisTupleNodeType: return ScanCriteria.FieldId.QuotationBasis;
                case ZenithProtocolScanCriteria.StateTupleNodeType: return ScanCriteria.FieldId.State;
                case ZenithProtocolScanCriteria.StateAllowsTupleNodeType: return ScanCriteria.FieldId.StateAllows;
                case ZenithProtocolScanCriteria.StatusNoteTupleNodeType: return ScanCriteria.FieldId.StatusNote;
                case ZenithProtocolScanCriteria.TradingMarketTupleNodeType: return ScanCriteria.FieldId.TradingMarket;
                default:
                    return undefined;
            }
        }

        export function textFromId(value: ScanCriteria.TextFieldId): ZenithProtocolScanCriteria.TextField {
            const result = tryTextFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFTFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryTextFromId(value: ScanCriteria.TextFieldId): ZenithProtocolScanCriteria.TextField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.Board: return ZenithProtocolScanCriteria.BoardTupleNodeType;
                case ScanCriteria.FieldId.CallOrPut: return ZenithProtocolScanCriteria.CallOrPutTupleNodeType;
                case ScanCriteria.FieldId.Category: return ZenithProtocolScanCriteria.CategoryTupleNodeType;
                case ScanCriteria.FieldId.Cfi: return ZenithProtocolScanCriteria.CfiTupleNodeType;
                case ScanCriteria.FieldId.Class: return ZenithProtocolScanCriteria.ClassTupleNodeType;
                case ScanCriteria.FieldId.Code: return ZenithProtocolScanCriteria.CodeTupleNodeType;
                case ScanCriteria.FieldId.Currency: return ZenithProtocolScanCriteria.CurrencyTupleNodeType;
                case ScanCriteria.FieldId.Data: return ZenithProtocolScanCriteria.DataTupleNodeType;
                case ScanCriteria.FieldId.Exchange: return ZenithProtocolScanCriteria.ExchangeTupleNodeType;
                case ScanCriteria.FieldId.ExerciseType: return ZenithProtocolScanCriteria.ExerciseTypeTupleNodeType;
                case ScanCriteria.FieldId.Leg: return ZenithProtocolScanCriteria.LegTupleNodeType;
                case ScanCriteria.FieldId.Market: return ZenithProtocolScanCriteria.MarketTupleNodeType;
                case ScanCriteria.FieldId.Name: return ZenithProtocolScanCriteria.NameTupleNodeType;
                case ScanCriteria.FieldId.QuotationBasis: return ZenithProtocolScanCriteria.QuotationBasisTupleNodeType;
                case ScanCriteria.FieldId.State: return ZenithProtocolScanCriteria.StateTupleNodeType;
                case ScanCriteria.FieldId.StateAllows: return ZenithProtocolScanCriteria.StateAllowsTupleNodeType;
                case ScanCriteria.FieldId.StatusNote: return ZenithProtocolScanCriteria.StatusNoteTupleNodeType;
                case ScanCriteria.FieldId.TradingMarket: return ZenithProtocolScanCriteria.TradingMarketTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function tryBooleanToId(value: ZenithProtocolScanCriteria.BooleanField): ScanCriteria.BooleanFieldId | undefined {
            switch (value) {
                case ZenithProtocolScanCriteria.IsIndexTupleNodeType: return ScanCriteria.FieldId.IsIndex;
                default:
                    return undefined;
            }
        }

        export function booleanFromId(value: ScanCriteria.BooleanFieldId): ZenithProtocolScanCriteria.BooleanField {
            const result = tryBooleanFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFBFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryBooleanFromId(value: ScanCriteria.BooleanFieldId): ZenithProtocolScanCriteria.BooleanField | undefined {
            switch (value) {
                case ScanCriteria.FieldId.IsIndex: return ZenithProtocolScanCriteria.IsIndexTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }
    }

    namespace PriceSubField {
        export function toId(value: ZenithProtocolScanCriteria.PriceSubFieldEnum): ScanCriteria.PriceSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCPSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: ZenithProtocolScanCriteria.PriceSubFieldEnum): ScanCriteria.PriceSubFieldId | undefined {
            switch (value) {
                case ZenithProtocolScanCriteria.PriceSubFieldEnum.LastPrice: return ScanCriteria.PriceSubFieldId.Last;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function fromId(value: ScanCriteria.PriceSubFieldId): ZenithProtocolScanCriteria.PriceSubFieldEnum {
            switch (value) {
                case ScanCriteria.PriceSubFieldId.Last: return ZenithProtocolScanCriteria.PriceSubFieldEnum.LastPrice;
                default:
                    throw new UnreachableCaseError('ZSCCPSFFI16179', value);
            }
        }
    }

    namespace DateSubField {
        export function toId(value: ZenithProtocolScanCriteria.DateSubFieldEnum): ScanCriteria.DateSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCDSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: ZenithProtocolScanCriteria.DateSubFieldEnum): ScanCriteria.DateSubFieldId | undefined {
            switch (value) {
                case ZenithProtocolScanCriteria.DateSubFieldEnum.Dividend: return ScanCriteria.DateSubFieldId.Dividend;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function fromId(value: ScanCriteria.DateSubFieldId): ZenithProtocolScanCriteria.DateSubFieldEnum {
            switch (value) {
                case ScanCriteria.DateSubFieldId.Dividend: return ZenithProtocolScanCriteria.DateSubFieldEnum.Dividend;
                default:
                    throw new UnreachableCaseError('ZSCCDSFFI16179', value);
            }
        }
    }

    namespace AltCodeSubField {
        export function toId(value: ZenithProtocolCommon.Symbol.AlternateKey): ScanCriteria.AltCodeSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCACSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: ZenithProtocolCommon.Symbol.AlternateKey): ScanCriteria.AltCodeSubFieldId | undefined {
            switch (value) {
                case ZenithProtocolCommon.Symbol.AlternateKey.Ticker: return ScanCriteria.AltCodeSubFieldId.Ticker;
                case ZenithProtocolCommon.Symbol.AlternateKey.Isin: return ScanCriteria.AltCodeSubFieldId.Isin;
                case ZenithProtocolCommon.Symbol.AlternateKey.Base: return ScanCriteria.AltCodeSubFieldId.Base;
                case ZenithProtocolCommon.Symbol.AlternateKey.Gics: return ScanCriteria.AltCodeSubFieldId.Gics;
                case ZenithProtocolCommon.Symbol.AlternateKey.Ric: return ScanCriteria.AltCodeSubFieldId.Ric;
                case ZenithProtocolCommon.Symbol.AlternateKey.Short: return ScanCriteria.AltCodeSubFieldId.Short;
                case ZenithProtocolCommon.Symbol.AlternateKey.Long: return ScanCriteria.AltCodeSubFieldId.Long;
                case ZenithProtocolCommon.Symbol.AlternateKey.Uid: return ScanCriteria.AltCodeSubFieldId.Uid;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function fromId(value: ScanCriteria.AltCodeSubFieldId): ZenithProtocolCommon.Symbol.AlternateKey {
            switch (value) {
                case ScanCriteria.AltCodeSubFieldId.Ticker: return ZenithProtocolCommon.Symbol.AlternateKey.Ticker;
                case ScanCriteria.AltCodeSubFieldId.Isin: return ZenithProtocolCommon.Symbol.AlternateKey.Isin;
                case ScanCriteria.AltCodeSubFieldId.Base: return ZenithProtocolCommon.Symbol.AlternateKey.Base;
                case ScanCriteria.AltCodeSubFieldId.Gics: return ZenithProtocolCommon.Symbol.AlternateKey.Gics;
                case ScanCriteria.AltCodeSubFieldId.Ric: return ZenithProtocolCommon.Symbol.AlternateKey.Ric;
                case ScanCriteria.AltCodeSubFieldId.Short: return ZenithProtocolCommon.Symbol.AlternateKey.Short;
                case ScanCriteria.AltCodeSubFieldId.Long: return ZenithProtocolCommon.Symbol.AlternateKey.Long;
                case ScanCriteria.AltCodeSubFieldId.Uid: return ZenithProtocolCommon.Symbol.AlternateKey.Uid;
                default:
                    throw new UnreachableCaseError('ZSCCACSFFI16179', value);
            }
        }
    }

    namespace AttributeSubField {
        export function toId(value: ZenithProtocolCommon.Symbol.KnownAttributeKey): ScanCriteria.AttributeSubFieldId {
            const fieldId = tryToId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCATSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryToId(value: ZenithProtocolCommon.Symbol.KnownAttributeKey): ScanCriteria.AttributeSubFieldId | undefined {
            switch (value) {
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Category: return ScanCriteria.AttributeSubFieldId.Category;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Class: return ScanCriteria.AttributeSubFieldId.Class;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Delivery: return ScanCriteria.AttributeSubFieldId.Delivery;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Sector: return ScanCriteria.AttributeSubFieldId.Sector;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Short: return ScanCriteria.AttributeSubFieldId.Short;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.ShortSuspended: return ScanCriteria.AttributeSubFieldId.ShortSuspended;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.SubSector: return ScanCriteria.AttributeSubFieldId.SubSector;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.MaxRss: return ScanCriteria.AttributeSubFieldId.MaxRss;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function fromId(value: ScanCriteria.AttributeSubFieldId): ZenithProtocolCommon.Symbol.KnownAttributeKey {
            switch (value) {
                case ScanCriteria.AttributeSubFieldId.Category: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Category;
                case ScanCriteria.AttributeSubFieldId.Class: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Class;
                case ScanCriteria.AttributeSubFieldId.Delivery: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Delivery;
                case ScanCriteria.AttributeSubFieldId.Sector: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Sector;
                case ScanCriteria.AttributeSubFieldId.Short: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Short;
                case ScanCriteria.AttributeSubFieldId.ShortSuspended: return ZenithProtocolCommon.Symbol.KnownAttributeKey.ShortSuspended;
                case ScanCriteria.AttributeSubFieldId.SubSector: return ZenithProtocolCommon.Symbol.KnownAttributeKey.SubSector;
                case ScanCriteria.AttributeSubFieldId.MaxRss: return ZenithProtocolCommon.Symbol.KnownAttributeKey.MaxRss;
                default:
                    throw new UnreachableCaseError('ZSCCATSFFI16179', value);
            }
        }
    }

    namespace DateValue {
        export function fromDate(value: Date): ZenithProtocolScanCriteria.DateString {
            return ZenithConvert.Date.DateTimeIso8601.fromDate(value);
        }

        export function tryToDate(value: ZenithProtocolScanCriteria.DateString): SourceTzOffsetDateTime | undefined {
            return ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(value);
        }
    }

    namespace TextContainsAs {
        export function fromId(value: ScanCriteria.TextContainsAsId): ZenithProtocolScanCriteria.TextContainsAsEnum {
            switch (value) {
                case ScanCriteria.TextContainsAsId.None: return ZenithProtocolScanCriteria.TextContainsAsEnum.None;
                case ScanCriteria.TextContainsAsId.FromStart: return ZenithProtocolScanCriteria.TextContainsAsEnum.FromStart;
                case ScanCriteria.TextContainsAsId.FromEnd: return ZenithProtocolScanCriteria.TextContainsAsEnum.FromEnd;
                case ScanCriteria.TextContainsAsId.Exact: return ZenithProtocolScanCriteria.TextContainsAsEnum.Exact;
                default:
                    throw new UnreachableCaseError('ZSCCTCAFI51423', value);
            }
        }

        export function tryToId(value: ZenithProtocolScanCriteria.TextContainsAsEnum): ScanCriteria.TextContainsAsId | undefined {
            switch (value) {
                case ZenithProtocolScanCriteria.TextContainsAsEnum.None: return ScanCriteria.TextContainsAsId.None;
                case ZenithProtocolScanCriteria.TextContainsAsEnum.FromStart: return ScanCriteria.TextContainsAsId.FromStart;
                case ZenithProtocolScanCriteria.TextContainsAsEnum.FromEnd: return ScanCriteria.TextContainsAsId.FromEnd;
                case ZenithProtocolScanCriteria.TextContainsAsEnum.Exact: return ScanCriteria.TextContainsAsId.Exact;
                default:
                    return undefined;
            }
        }
    }
}

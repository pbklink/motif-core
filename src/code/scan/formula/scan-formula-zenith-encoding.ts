/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ZenithConvert, ZenithEncodedScanFormula, ZenithProtocolCommon } from '../../adi/adi-internal-api';
import { StringId, Strings } from '../../res/res-internal-api';
import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    Err,
    Integer,
    Ok,
    Result,
    SourceTzOffsetDateTime,
    UnreachableCaseError
} from "../../sys/sys-internal-api";
import { ScanFormula } from './scan-formula';

export namespace ScanFormulaZenithEncoding {
    export class DecodeProgress {
        private _nodeCount = 0;
        private _nodeDepth = 0;
        private _decodedNodes = new Array<DecodeProgress.DecodedNode>(0);

        get tupleNodeCount() { return this._nodeCount; }
        get tupleNodeDepth() { return this._nodeDepth; }
        get decodedNodes(): readonly DecodeProgress.DecodedNode[] { return this._decodedNodes; }

        enterTupleNode() {
            this._nodeDepth++;
            this._nodeCount++;
        }

        addDecodedNode(nodeType: ZenithEncodedScanFormula.TupleNodeType): DecodeProgress.DecodedNode {
            const decodedNode: DecodeProgress.DecodedNode = {
                nodeDepth: this._nodeDepth,
                tupleNodeType: nodeType,
                nodeTypeId: undefined,
            }
            this._decodedNodes.push(decodedNode);

            return decodedNode;
        }

        exitTupleNode(decodedNode: DecodeProgress.DecodedNode, nodeTypeId: ScanFormula.NodeTypeId) {
            decodedNode.nodeTypeId = nodeTypeId;
            this._nodeDepth--;
        }
    }

    export namespace DecodeProgress {
        export interface DecodedNode {
            nodeDepth: number;
            tupleNodeType: ZenithEncodedScanFormula.TupleNodeType;
            nodeTypeId: ScanFormula.NodeTypeId | undefined;
        }
    }

    export interface DecodeError {
        errorId: ErrorId;
        extraErrorText: string | undefined;
    }

    export interface DecodedError {
        error: DecodeError;
        progress: DecodeProgress;
    }

    export interface DecodedBoolean {
        node: ScanFormula.BooleanNode;
        progress: DecodeProgress;
    }

    export interface DecodedNumeric {
        node: ScanFormula.NumericNode;
        progress: DecodeProgress;
    }

    export function encodeBoolean(node: ScanFormula.BooleanNode): ZenithEncodedScanFormula.BooleanTupleNode {
        return encodeBooleanNode(node);
    }

    export function tryDecodeBoolean(node: ZenithEncodedScanFormula.BooleanTupleNode): Result<DecodedBoolean, DecodedError> {
        const progress = new DecodeProgress();

        const tryResult = tryDecodeExpectedBooleanNode(node, progress);

        if (tryResult.isOk()) {
            const decodedBoolean: DecodedBoolean = {
                node: tryResult.value,
                progress,
            };
            return new Ok(decodedBoolean);
        } else {
            const decodedError: DecodedError = {
                error: tryResult.error,
                progress,
            }
            return new Err(decodedError);
        }
    }

    export function encodeNumeric(node: ScanFormula.NumericNode): ZenithEncodedScanFormula.NumericTupleNode | ZenithEncodedScanFormula.NumericField {
        return encodeNumericNode(node);
    }

    export function tryDecodeNumeric(node: ZenithEncodedScanFormula.NumericTupleNode): Result<DecodedNumeric, DecodedError> {
        const progress = new DecodeProgress();

        const tryResult = tryDecodeExpectedArithmeticNumericNode(node, progress);

        if (tryResult.isOk()) {
            const decodedNumeric: DecodedNumeric = {
                node: tryResult.value,
                progress,
            };
            return new Ok(decodedNumeric);
        } else {
            const decodedError: DecodedError = {
                error: tryResult.error,
                progress,
            }
            return new Err(decodedError);
        }
    }

    function encodeBooleanNode(node: ScanFormula.BooleanNode): ZenithEncodedScanFormula.BooleanTupleNode {
        switch (node.typeId) {
            case ScanFormula.NodeTypeId.And: return encodeMultiOperandBooleanNode(ZenithEncodedScanFormula.AndTupleNodeType, node as ScanFormula.MultiOperandBooleanNode);
            case ScanFormula.NodeTypeId.Or: return encodeMultiOperandBooleanNode(ZenithEncodedScanFormula.OrTupleNodeType, node as ScanFormula.MultiOperandBooleanNode);
            case ScanFormula.NodeTypeId.Not: return encodeSingleOperandBooleanNode(ZenithEncodedScanFormula.NotTupleNodeType, node as ScanFormula.SingleOperandBooleanNode);
            case ScanFormula.NodeTypeId.NumericEquals: return encodeNumericComparisonNode(ZenithEncodedScanFormula.EqualTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericGreaterThan: return encodeNumericComparisonNode(ZenithEncodedScanFormula.GreaterThanTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericGreaterThanOrEqual: return encodeNumericComparisonNode(ZenithEncodedScanFormula.GreaterThanOrEqualTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericLessThan: return encodeNumericComparisonNode(ZenithEncodedScanFormula.LessThanTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericLessThanOrEqual: return encodeNumericComparisonNode(ZenithEncodedScanFormula.LessThanOrEqualTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.All: return [ZenithEncodedScanFormula.AllTupleNodeType];
            case ScanFormula.NodeTypeId.None: return [ZenithEncodedScanFormula.NoneTupleNodeType];
            case ScanFormula.NodeTypeId.FieldHasValue: return encodeFieldHasValueNode(node as ScanFormula.FieldHasValueNode);
            case ScanFormula.NodeTypeId.BooleanFieldEquals: return encodeBooleanFieldEqualsNode(node as ScanFormula.BooleanFieldEqualsNode);
            case ScanFormula.NodeTypeId.NumericFieldEquals: return encodeNumericFieldEqualsNode(node as ScanFormula.NumericFieldEqualsNode);
            case ScanFormula.NodeTypeId.NumericFieldInRange: return encodeNumericFieldInRangeNode(node as ScanFormula.NumericFieldInRangeNode);
            case ScanFormula.NodeTypeId.DateFieldEquals: return encodeDateFieldEqualsNode(node as ScanFormula.DateFieldEqualsNode);
            case ScanFormula.NodeTypeId.DateFieldInRange: return encodeDateFieldInRangeNode(node as ScanFormula.DateFieldInRangeNode);
            case ScanFormula.NodeTypeId.TextFieldContains: return encodeTextFieldContainsNode(node as ScanFormula.TextFieldContainsNode);
            case ScanFormula.NodeTypeId.PriceSubFieldHasValue: return encodePriceSubFieldHasValueNode(node as ScanFormula.PriceSubFieldHasValueNode);
            case ScanFormula.NodeTypeId.PriceSubFieldEquals: return encodePriceSubFieldEqualsNode(node as ScanFormula.PriceSubFieldEqualsNode);
            case ScanFormula.NodeTypeId.PriceSubFieldInRange: return encodePriceSubFieldInRangeNode(node as ScanFormula.PriceSubFieldInRangeNode);
            case ScanFormula.NodeTypeId.DateSubFieldHasValue: return encodeDateSubFieldHasValueNode(node as ScanFormula.DateSubFieldHasValueNode);
            case ScanFormula.NodeTypeId.DateSubFieldEquals: return encodeDateSubFieldEqualsNode(node as ScanFormula.DateSubFieldEqualsNode);
            case ScanFormula.NodeTypeId.DateSubFieldInRange: return encodeDateSubFieldInRangeNode(node as ScanFormula.DateSubFieldInRangeNode);
            case ScanFormula.NodeTypeId.AltCodeSubFieldHasValue: return encodeAltCodeSubFieldHasValueNode(node as ScanFormula.AltCodeSubFieldHasValueNode);
            case ScanFormula.NodeTypeId.AltCodeSubFieldContains: return encodeAltCodeSubFieldContainsNode(node as ScanFormula.AltCodeSubFieldContainsNode);
            case ScanFormula.NodeTypeId.AttributeSubFieldHasValue: return encodeAttributeSubFieldHasValueNode(node as ScanFormula.AttributeSubFieldHasValueNode);
            case ScanFormula.NodeTypeId.AttributeSubFieldContains: return encodeAttributeSubFieldContainsNode(node as ScanFormula.AttributeSubFieldContainsNode);
            default:
                throw new UnreachableCaseError('ZSCCFBN90042', node.typeId)
        }
    }

    function encodeMultiOperandBooleanNode(
        type: typeof ZenithEncodedScanFormula.AndTupleNodeType | typeof ZenithEncodedScanFormula.OrTupleNodeType,
        node: ScanFormula.MultiOperandBooleanNode
    ): ZenithEncodedScanFormula.LogicalTupleNode {
        const operands = node.operands;
        const count = operands.length;
        const params = new Array<ZenithEncodedScanFormula.BooleanParam>(count);
        for (let i = 0; i < count; i++) {
            const operand = operands[i];
            const tupleNode = encodeBooleanNode(operand);
            params[i] = tupleNode;
        }

        return [type, ...params];
    }

    function encodeSingleOperandBooleanNode(type: typeof ZenithEncodedScanFormula.NotTupleNodeType, node: ScanFormula.SingleOperandBooleanNode): ZenithEncodedScanFormula.LogicalTupleNode {
        const param = encodeBooleanNode(node);
        return [type, param];
    }

    function encodeNumericNode(node: ScanFormula.NumericNode): ZenithEncodedScanFormula.NumericTupleNode | ZenithEncodedScanFormula.NumericField {
        switch (node.typeId) {
            case ScanFormula.NodeTypeId.NumericAdd: return encodeLeftRightArithmeticNumericNode(ZenithEncodedScanFormula.AddTupleNodeType, node as ScanFormula.LeftRightArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericDiv: return encodeLeftRightArithmeticNumericNode(ZenithEncodedScanFormula.DivTupleNodeType, node as ScanFormula.LeftRightArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericMod: return encodeLeftRightArithmeticNumericNode(ZenithEncodedScanFormula.ModTupleNodeType, node as ScanFormula.LeftRightArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericMul: return encodeLeftRightArithmeticNumericNode(ZenithEncodedScanFormula.MulTupleNodeType, node as ScanFormula.LeftRightArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericSub: return encodeLeftRightArithmeticNumericNode(ZenithEncodedScanFormula.SubTupleNodeType, node as ScanFormula.LeftRightArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericNeg: return encodeUnaryArithmeticNumericNode(ZenithEncodedScanFormula.NegTupleNodeType, node as ScanFormula.UnaryArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericPos: return encodeUnaryArithmeticNumericNode(ZenithEncodedScanFormula.PosTupleNodeType, node as ScanFormula.UnaryArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericAbs: return encodeUnaryArithmeticNumericNode(ZenithEncodedScanFormula.AbsTupleNodeType, node as ScanFormula.UnaryArithmeticNumericNode);
            case ScanFormula.NodeTypeId.NumericFieldValueGet: return encodeNumericFieldValueGetNode(node as ScanFormula.NumericFieldValueGetNode);
            case ScanFormula.NodeTypeId.NumericIf: return encodeNumericIfNode(node as ScanFormula.NumericIfNode);
            default:
                throw new UnreachableCaseError('ZSCCFNNPU', node.typeId);
        }
    }

    function encodeNumericComparisonNode(
        type:
            typeof ZenithEncodedScanFormula.EqualTupleNodeType |
            typeof ZenithEncodedScanFormula.GreaterThanTupleNodeType |
            typeof ZenithEncodedScanFormula.GreaterThanOrEqualTupleNodeType |
            typeof ZenithEncodedScanFormula.LessThanTupleNodeType |
            typeof ZenithEncodedScanFormula.LessThanOrEqualTupleNodeType,
        node: ScanFormula.NumericComparisonBooleanNode
    ): ZenithEncodedScanFormula.ComparisonTupleNode {
        const leftOperand = encodeNumericOperand(node.leftOperand);
        const rightOperand = encodeNumericOperand(node.leftOperand);
        return [type, leftOperand, rightOperand];
    }

    function encodeNumericOperand(operand: ScanFormula.NumericNode | number): ZenithEncodedScanFormula.NumericParam {
        if (operand instanceof ScanFormula.NumericNode) {
            return encodeNumericNode(operand)
        } else {
            return operand;
        }
    }

    function encodeUnaryArithmeticNumericNode(
        type:
            typeof ZenithEncodedScanFormula.NegTupleNodeType |
            typeof ZenithEncodedScanFormula.PosTupleNodeType |
            typeof ZenithEncodedScanFormula.AbsTupleNodeType,
        node: ScanFormula.UnaryArithmeticNumericNode
    ): ZenithEncodedScanFormula.UnaryExpressionTupleNode {
        const operand = node.operand;
        let param: ZenithEncodedScanFormula.NumericParam;
        if (operand instanceof ScanFormula.NumericNode) {
            param = encodeNumericNode(operand);
        } else {
            param = operand;
        }

        return [type, param];
    }

    function encodeLeftRightArithmeticNumericNode(
        type:
            typeof ZenithEncodedScanFormula.AddTupleNodeType |
            typeof ZenithEncodedScanFormula.DivTupleNodeType |
            typeof ZenithEncodedScanFormula.ModTupleNodeType |
            typeof ZenithEncodedScanFormula.MulTupleNodeType |
            typeof ZenithEncodedScanFormula.SubTupleNodeType,
        node: ScanFormula.LeftRightArithmeticNumericNode
    ): ZenithEncodedScanFormula.BinaryExpressionTupleNode {
        const leftOperand = node.leftOperand;
        let leftParam: ZenithEncodedScanFormula.NumericParam;
        if (leftOperand instanceof ScanFormula.NumericNode) {
            leftParam = encodeNumericNode(leftOperand);
        } else {
            leftParam = leftOperand;
        }

        const rightOperand = node.rightOperand;
        let rightParam: ZenithEncodedScanFormula.NumericParam;
        if (rightOperand instanceof ScanFormula.NumericNode) {
            rightParam = encodeNumericNode(rightOperand);
        } else {
            rightParam = rightOperand;
        }

        return [type, leftParam, rightParam];
    }

    function encodeNumericFieldValueGetNode(node: ScanFormula.NumericFieldValueGetNode): ZenithEncodedScanFormula.NumericField {
        return Field.numericFromId(node.fieldId);
    }

    function encodeNumericIfNode(node: ScanFormula.NumericIfNode): ZenithEncodedScanFormula.NumericIfTupleNode {
        const tupleLength = 3 + node.trueArms.length * 2; // 1 (type) + 2 * trueArms + 2 (falseArm)
        const tupleNode = new Array<unknown>(tupleLength);
        tupleNode[0] = ZenithEncodedScanFormula.IfTupleNodeType;

        let index = 1;
        for (const arm of node.trueArms) {
            tupleNode[index++] = encodeBooleanNode(arm.condition);
            tupleNode[index++] = encodeNumericOperand(arm.value);
        }

        tupleNode[index++] = encodeBooleanNode(node.falseArm.condition);
        tupleNode[index] = encodeNumericOperand(node.falseArm.value);

        return tupleNode as ZenithEncodedScanFormula.NumericIfTupleNode;
    }

    function encodeBooleanFieldEqualsNode(node: ScanFormula.BooleanFieldEqualsNode): ZenithEncodedScanFormula.BooleanSingleMatchingTupleNode {
        const field = Field.booleanFromId(node.fieldId);
        const target = node.target;
        return [field, target];
    }

    function encodeFieldHasValueNode(node: ScanFormula.FieldHasValueNode):
            ZenithEncodedScanFormula.NumericRangeMatchingTupleNode |
            ZenithEncodedScanFormula.DateRangeMatchingTupleNode |
            ZenithEncodedScanFormula.TextMatchingTupleNode {

        const fieldId = node.fieldId;
        const fieldDataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanFormula.FieldDataTypeId.Numeric: return [Field.numericFromId(fieldId as ScanFormula.NumericFieldId)];
            case ScanFormula.FieldDataTypeId.Text: return [Field.textFromId(fieldId as ScanFormula.TextFieldId)];
            case ScanFormula.FieldDataTypeId.Date: return [Field.dateFromId(fieldId as ScanFormula.DateFieldId)];
            case ScanFormula.FieldDataTypeId.Boolean: throw new AssertInternalError('ZSCCFFHVNB50916', `${fieldId}`); // No boolean field supports HasValue
            default:
                throw new UnreachableCaseError('ZSCCFFHVND50916', fieldDataTypeId);
        }
    }

    function encodeNumericFieldEqualsNode(node: ScanFormula.NumericFieldEqualsNode): ZenithEncodedScanFormula.NumericRangeMatchingTupleNode {
        const field = Field.numericFromId(node.fieldId);
        const target = node.target;
        return [field, target];
    }

    function encodeNumericFieldInRangeNode(node: ScanFormula.NumericFieldInRangeNode): ZenithEncodedScanFormula.NumericRangeMatchingTupleNode {
        const field = Field.numericFromId(node.fieldId);
        const namedParameters: ZenithEncodedScanFormula.NumericNamedParameters = {
            Min: node.min,
            Max: node.max,
        }
        return [field, namedParameters];
    }

    function encodeDateFieldEqualsNode(node: ScanFormula.DateFieldEqualsNode): ZenithEncodedScanFormula.DateRangeMatchingTupleNode {
        const field = Field.dateFromId(node.fieldId);
        const target = DateValue.encodeDate(node.target.utcDate);
        return [field, target];
    }

    function encodeDateFieldInRangeNode(node: ScanFormula.DateFieldInRangeNode): ZenithEncodedScanFormula.DateRangeMatchingTupleNode {
        const field = Field.dateFromId(node.fieldId);
        const nodeMin = node.min;
        const nodeMax = node.max;
        const namedParameters: ZenithEncodedScanFormula.DateNamedParameters = {
            Min: nodeMin === undefined ? undefined: DateValue.encodeDate(nodeMin.utcDate),
            Max: nodeMax === undefined ? undefined: DateValue.encodeDate(nodeMax.utcDate),
        }
        return [field, namedParameters];
    }

    function encodeTextFieldContainsNode(node: ScanFormula.TextFieldContainsNode): ZenithEncodedScanFormula.TextMatchingTupleNode {
        const field = Field.textFromId(node.fieldId);
        const value = node.value;
        const as = TextContainsAs.encodeId(node.asId);
        const namedParameters: ZenithEncodedScanFormula.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, value, namedParameters];
    }

    function encodePriceSubFieldHasValueNode(node: ScanFormula.PriceSubFieldHasValueNode): ZenithEncodedScanFormula.NumericNamedRangeMatchingTupleNode {
        return encodePriceSubFieldHasValue(node.subFieldId);
    }

    function encodePriceSubFieldHasValue(subFieldId: ScanFormula.PriceSubFieldId): ZenithEncodedScanFormula.NumericNamedRangeMatchingTupleNode {
        const field = ZenithEncodedScanFormula.PriceTupleNodeType;
        const subField = PriceSubField.encodeId(subFieldId);
        return [field, subField];
    }

    function encodePriceSubFieldEqualsNode(node: ScanFormula.PriceSubFieldEqualsNode): ZenithEncodedScanFormula.NumericNamedRangeMatchingTupleNode {
        const field = ZenithEncodedScanFormula.PriceTupleNodeType;
        const subField = PriceSubField.encodeId(node.subFieldId);
        const target = node.target;
        return [field, subField, target];
    }

    function encodePriceSubFieldInRangeNode(node: ScanFormula.PriceSubFieldInRangeNode): ZenithEncodedScanFormula.NumericNamedRangeMatchingTupleNode {
        const field = ZenithEncodedScanFormula.PriceTupleNodeType;
        const subField = PriceSubField.encodeId(node.subFieldId);
        const namedParameters: ZenithEncodedScanFormula.NumericNamedParameters = {
            Min: node.min,
            Max: node.max,
        }
        return [field, subField, namedParameters];
    }

    function encodeDateSubFieldHasValueNode(node: ScanFormula.DateSubFieldHasValueNode): ZenithEncodedScanFormula.DateNamedRangeMatchingTupleNode {
        return encodeDateSubFieldHasValue(node.subFieldId);
    }

    function encodeDateSubFieldHasValue(subFieldId: ScanFormula.DateSubFieldId): ZenithEncodedScanFormula.DateNamedRangeMatchingTupleNode {
        const field = ZenithEncodedScanFormula.DateTupleNodeType;
        const subField = DateSubField.encodeId(subFieldId);
        return [field, subField];
    }

    function encodeDateSubFieldEqualsNode(node: ScanFormula.DateSubFieldEqualsNode): ZenithEncodedScanFormula.DateNamedRangeMatchingTupleNode {
        const field = ZenithEncodedScanFormula.DateTupleNodeType;
        const subField = DateSubField.encodeId(node.subFieldId);
        const target = DateValue.encodeDate(node.target.utcDate);
        return [field, subField, target];
    }

    function encodeDateSubFieldInRangeNode(node: ScanFormula.DateSubFieldInRangeNode): ZenithEncodedScanFormula.DateNamedRangeMatchingTupleNode {
        const field = ZenithEncodedScanFormula.DateTupleNodeType;
        const subField = DateSubField.encodeId(node.subFieldId);
        const nodeMin = node.min;
        const nodeMax = node.max;
        const namedParameters: ZenithEncodedScanFormula.DateNamedParameters = {
            Min: nodeMin === undefined ? undefined: DateValue.encodeDate(nodeMin.utcDate),
            Max: nodeMax === undefined ? undefined: DateValue.encodeDate(nodeMax.utcDate),
        }
        return [field, subField, namedParameters];
    }

    function encodeAltCodeSubFieldHasValueNode(node: ScanFormula.AltCodeSubFieldHasValueNode): ZenithEncodedScanFormula.NamedTextMatchingTupleNode {
        return encodeAltCodeSubFieldHasValue(node.subFieldId);
    }

    function encodeAltCodeSubFieldHasValue(subFieldId: ScanFormula.AltCodeSubFieldId): ZenithEncodedScanFormula.NamedTextMatchingTupleNode {
        const field = ZenithEncodedScanFormula.AltCodeTupleNodeType;
        const subField = AltCodeSubField.encodeId(subFieldId);
        return [field, subField];
    }

    function encodeAltCodeSubFieldContainsNode(node: ScanFormula.AltCodeSubFieldContainsNode): ZenithEncodedScanFormula.NamedTextMatchingTupleNode {
        const field = ZenithEncodedScanFormula.AltCodeTupleNodeType;
        const subField = AltCodeSubField.encodeId(node.subFieldId);
        const value = node.value;
        const as = TextContainsAs.encodeId(node.asId);
        const namedParameters: ZenithEncodedScanFormula.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, subField, value, namedParameters];
    }

    function encodeAttributeSubFieldHasValueNode(node: ScanFormula.AttributeSubFieldHasValueNode): ZenithEncodedScanFormula.NamedTextMatchingTupleNode {
        return encodeAttributeSubFieldHasValue(node.subFieldId);
    }

    function encodeAttributeSubFieldHasValue(subFieldId: ScanFormula.AttributeSubFieldId): ZenithEncodedScanFormula.NamedTextMatchingTupleNode {
        const field = ZenithEncodedScanFormula.AttributeTupleNodeType;
        const subField = AttributeSubField.encodeId(subFieldId);
        return [field, subField];
    }

    function encodeAttributeSubFieldContainsNode(node: ScanFormula.AttributeSubFieldContainsNode): ZenithEncodedScanFormula.NamedTextMatchingTupleNode {
        const field = ZenithEncodedScanFormula.AttributeTupleNodeType;
        const subField = AttributeSubField.encodeId(node.subFieldId);
        const value = node.value;
        const as = TextContainsAs.encodeId(node.asId);
        const namedParameters: ZenithEncodedScanFormula.TextNamedParameters = {
            As: as,
            IgnoreCase: node.ignoreCase,
        }
        return [field, subField, value, namedParameters];
    }

    function tryDecodeExpectedBooleanNode(node: ZenithEncodedScanFormula.BooleanTupleNode, toProgress: DecodeProgress): Result<ScanFormula.BooleanNode, DecodeError> {
        toProgress.enterTupleNode();
        if (!Array.isArray(node)) {
            return createDecodeErrorResult(ErrorId.BooleanTupleNodeIsNotAnArray, undefined);
        } else {
            if (node.length === 0) {
                return createDecodeErrorResult(ErrorId.BooleanTupleNodeArrayIsZeroLength, undefined);
            } else {
                const nodeType = node[0];
                if (typeof nodeType !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return createDecodeErrorResult(ErrorId.BooleanTupleNodeTypeIsNotString, `${nodeType}`);
                } else {
                    const decodedNode = toProgress.addDecodedNode(nodeType);

                    const result = tryDecodeBooleanNode(node, toProgress)

                    if (result.isOk()) {
                        toProgress.exitTupleNode(decodedNode, result.value.typeId);
                    }

                    return result;
                }
            }
        }
    }

    function tryDecodeBooleanNode(tupleNode: ZenithEncodedScanFormula.BooleanTupleNode, toProgress: DecodeProgress): Result<ScanFormula.BooleanNode, DecodeError> {
        const nodeType = tupleNode[0] as ZenithEncodedScanFormula.BooleanTupleNodeType;

        switch (nodeType) {
            // Logical
            case ZenithEncodedScanFormula.AndTupleNodeType: return tryDecodeMultiOperandLogicalBooleanNode(tupleNode as ZenithEncodedScanFormula.LogicalTupleNode, ScanFormula.AndNode, toProgress);
            case ZenithEncodedScanFormula.OrTupleNodeType: return tryDecodeMultiOperandLogicalBooleanNode(tupleNode as ZenithEncodedScanFormula.LogicalTupleNode, ScanFormula.OrNode, toProgress);
            case ZenithEncodedScanFormula.NotTupleNodeType: return tryDecodeSingleOperandLogicalBooleanNode(tupleNode as ZenithEncodedScanFormula.LogicalTupleNode, ScanFormula.NotNode, toProgress);

            // Comparison
            case ZenithEncodedScanFormula.EqualTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericEqualsNode, toProgress);
            case ZenithEncodedScanFormula.GreaterThanTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericGreaterThanNode, toProgress);
            case ZenithEncodedScanFormula.GreaterThanOrEqualTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericGreaterThanOrEqualNode, toProgress);
            case ZenithEncodedScanFormula.LessThanTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericLessThanNode, toProgress);
            case ZenithEncodedScanFormula.LessThanOrEqualTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericLessThanOrEqualNode, toProgress);
            case ZenithEncodedScanFormula.AllTupleNodeType: return new Ok(new ScanFormula.AllNode());
            case ZenithEncodedScanFormula.NoneTupleNodeType: return new Ok(new ScanFormula.NoneNode());

            // Matching
            case ZenithEncodedScanFormula.AltCodeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.AltCode, toProgress);
            case ZenithEncodedScanFormula.AttributeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Attribute, toProgress);
            case ZenithEncodedScanFormula.AuctionTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Auction, toProgress);
            case ZenithEncodedScanFormula.AuctionLastTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Auction, toProgress);
            case ZenithEncodedScanFormula.AuctionQuantityTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.AuctionQuantity, toProgress);
            case ZenithEncodedScanFormula.BestAskCountTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestAskCount, toProgress);
            case ZenithEncodedScanFormula.BestAskPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestAskPrice, toProgress);
            case ZenithEncodedScanFormula.BestAskQuantityTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestAskQuantity, toProgress);
            case ZenithEncodedScanFormula.BestBidCountTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestBidCount, toProgress);
            case ZenithEncodedScanFormula.BestBidPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestBidPrice, toProgress);
            case ZenithEncodedScanFormula.BestBidQuantityTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestBidQuantity, toProgress);
            case ZenithEncodedScanFormula.BoardTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Board, toProgress);
            case ZenithEncodedScanFormula.CallOrPutTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.CallOrPut, toProgress);
            case ZenithEncodedScanFormula.CategoryTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Category, toProgress);
            case ZenithEncodedScanFormula.CfiTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Cfi, toProgress);
            case ZenithEncodedScanFormula.ClassTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Class, toProgress);
            case ZenithEncodedScanFormula.ClosePriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ClosePrice, toProgress);
            case ZenithEncodedScanFormula.CodeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Code, toProgress);
            case ZenithEncodedScanFormula.ContractSizeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ContractSize, toProgress);
            case ZenithEncodedScanFormula.CurrencyTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Currency, toProgress);
            case ZenithEncodedScanFormula.DataTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Data, toProgress);
            case ZenithEncodedScanFormula.DateTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Date, toProgress);
            case ZenithEncodedScanFormula.ExerciseTypeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ExerciseType, toProgress);
            case ZenithEncodedScanFormula.ExchangeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Exchange, toProgress);
            case ZenithEncodedScanFormula.ExpiryDateTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ExpiryDate, toProgress);
            case ZenithEncodedScanFormula.HighPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.HighPrice, toProgress);
            case ZenithEncodedScanFormula.IsIndexTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.IsIndex, toProgress);
            case ZenithEncodedScanFormula.LegTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Leg, toProgress);
            case ZenithEncodedScanFormula.LastPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.LastPrice, toProgress);
            case ZenithEncodedScanFormula.LotSizeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.LotSize, toProgress);
            case ZenithEncodedScanFormula.LowPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.LowPrice, toProgress);
            case ZenithEncodedScanFormula.MarketTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Market, toProgress);
            case ZenithEncodedScanFormula.NameTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Name, toProgress);
            case ZenithEncodedScanFormula.OpenInterestTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.OpenInterest, toProgress);
            case ZenithEncodedScanFormula.OpenPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.OpenPrice, toProgress);
            case ZenithEncodedScanFormula.PriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Price, toProgress);
            case ZenithEncodedScanFormula.PreviousCloseTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.PreviousClose, toProgress);
            case ZenithEncodedScanFormula.QuotationBasisTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.QuotationBasis, toProgress);
            case ZenithEncodedScanFormula.RemainderTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Remainder, toProgress);
            case ZenithEncodedScanFormula.ShareIssueTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ShareIssue, toProgress);
            case ZenithEncodedScanFormula.StateTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.State, toProgress);
            case ZenithEncodedScanFormula.StateAllowsTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.StateAllows, toProgress);
            case ZenithEncodedScanFormula.StatusNoteTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.StatusNote, toProgress);
            case ZenithEncodedScanFormula.StrikePriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.StrikePrice, toProgress);
            case ZenithEncodedScanFormula.TradesTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Trades, toProgress);
            case ZenithEncodedScanFormula.TradingMarketTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.TradingMarket, toProgress);
            case ZenithEncodedScanFormula.ValueTradedTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ValueTraded, toProgress);
            case ZenithEncodedScanFormula.VolumeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Volume, toProgress);
            case ZenithEncodedScanFormula.VwapTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Vwap, toProgress);

            default: {
                const neverTupleNodeType: never = nodeType;
                return createDecodeErrorResult(ErrorId.UnknownBooleanTupleNodeType, `${neverTupleNodeType as string}`);
            }
        }
    }

    function tryDecodeMultiOperandLogicalBooleanNode(
        tulipNode: ZenithEncodedScanFormula.LogicalTupleNode,
        nodeConstructor: new() => ScanFormula.MultiOperandBooleanNode,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.MultiOperandBooleanNode, DecodeError> {
        const tulipNodeLength = tulipNode.length;
        if (tulipNodeLength < 2) {
            return createDecodeErrorResult(ErrorId.LogicalBooleanMissingOperands, tulipNode[0]);
        } else {
            const operands = new Array<ScanFormula.BooleanNode>(tulipNodeLength - 1);
            for (let i = 1; i < tulipNodeLength; i++) {
                const tulipParam = tulipNode[i] as ZenithEncodedScanFormula.BooleanParam; // Need to cast as (skipped) first element in array is LogicalTupleNodeType
                const operandResult = tryDecodeExpectedBooleanOperand(tulipParam, toProgress);
                if (operandResult.isErr()) {
                    return operandResult.createType();
                } else {
                    operands[i - 1] = operandResult.value;
                }
            }

            const resultNode = new nodeConstructor();
            resultNode.operands = operands;
            return new Ok(resultNode);
        }
    }

    function tryDecodeSingleOperandLogicalBooleanNode(
        tulipNode: ZenithEncodedScanFormula.LogicalTupleNode,
        nodeConstructor: new() => ScanFormula.SingleOperandBooleanNode,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.SingleOperandBooleanNode, DecodeError> {
        if (tulipNode.length !== 2) {
            return createDecodeErrorResult(ErrorId.LogicalBooleanMissingOperand, tulipNode[0]);
        } else {
            const tupleNodeResult = tryDecodeExpectedBooleanOperand(tulipNode[1], toProgress);
            if (tupleNodeResult.isErr()) {
                return tupleNodeResult.createType();
            } else {
                const resultNode = new nodeConstructor();
                resultNode.operand = tupleNodeResult.value;
                return new Ok(resultNode);
            }
        }
    }

    function tryDecodeExpectedBooleanOperand(
        param: ZenithEncodedScanFormula.BooleanParam,
        toProgress: DecodeProgress
    ): Result<ScanFormula.BooleanNode, DecodeError> {
        if (Array.isArray(param)) {
            return tryDecodeExpectedBooleanNode(param, toProgress);
        } else {
            if (typeof param !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.UnexpectedBooleanParamType, `${param}`);
            } else {
                const fieldId = Field.tryMatchingToId(param);
                if (fieldId === undefined) {
                    return createDecodeErrorResult(ErrorId.UnknownFieldBooleanParam, `${param}`);
                } else {
                    return new Ok(toFieldHasValueNode(fieldId));
                }
            }
        }
    }

    // function tryDecodeFieldBooleanNode(value: ZenithScanCriteria.MatchingField): Result<ScanCriteria.FieldBooleanNode, ZenithScanCriteriaParseError> {
    //     switch (value) {

    //     }
    // }

    function tryDecodeFieldBooleanNode(
        node: ZenithEncodedScanFormula.MatchingTupleNode,
        fieldId: ScanFormula.FieldId,
        toProgress: DecodeProgress
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const paramCount = node.length - 1;
        switch (paramCount) {
            case 0: {
                if (fieldId === ScanFormula.FieldId.IsIndex) {
                    return tryDecodeBooleanFieldEqualsNode(fieldId, ZenithEncodedScanFormula.SingleDefault_IsIndex);
                } else {
                    return new Ok(toFieldHasValueNode(fieldId));
                }
            }
            case 1: {
                const param1 = node[1];
                const fieldSubbed = ScanFormula.Field.isSubbed(fieldId);
                if (fieldSubbed) {
                    return tryDecodeSubFieldHasValueNode(fieldId as ScanFormula.SubbedFieldId, param1);
                } else {
                    if (typeof param1 === 'object') {
                        return tryNamedParametersToFieldEqualsOrInRangeNode(fieldId, param1);
                    } else {
                        return tryDecodeFieldEqualsOrContainsNode(fieldId, param1);
                    }
                }
            }
            case 2: {
                const param1 = node[1];
                const param2 = node[2];
                const fieldSubbed = ScanFormula.Field.isSubbed(fieldId);
                if (fieldSubbed) {
                    if (typeof param2 === 'object') {
                        return tryNamedParametersToSubFieldEqualsOrInRangeNode(fieldId as ScanFormula.SubbedFieldId, param1, param2);
                    } else {
                        return tryDecodeSubFieldEqualsOrContainsNode(fieldId as ScanFormula.SubbedFieldId, param1, param2);
                    }
                } else {
                    return tryDecodeFieldContainsOrInRangeNode(fieldId as ScanFormula.SubbedFieldId, param1, param2);
                }
            }
            case 3: {
                const param1 = node[1];
                const param2 = node[2];
                const param3 = node[3];
                const fieldSubbed = ScanFormula.Field.isSubbed(fieldId);
                if (fieldSubbed) {
                    return tryDecodeSubFieldContainsOrInRangeNode(fieldId as ScanFormula.SubbedFieldId, param1, param2, param3);
                } else {
                    if (ScanFormula.Field.idToDataTypeId(fieldId) === ScanFormula.FieldDataTypeId.Text) {
                        return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextFieldId, param1, param2, param3);
                    } else {
                        return createDecodeErrorResult(ErrorId.OnlySubFieldOrTextFieldNodesCanHave3Parameters, paramCount.toString());
                    }
                }
                break;
            }
            case 4: {
                if (!ScanFormula.Field.isSubbed(fieldId)) {
                    return createDecodeErrorResult(ErrorId.OnlySubFieldNodeCanHave4Parameters, paramCount.toString());
                } else {
                    const param1 = node[1];
                    const param2 = node[2];
                    const param3 = node[3];
                    const param4 = node[4];
                    return tryDecodeTextSubFieldContainsNode(fieldId as ScanFormula.SubbedFieldId, param1, param2, param3, param4);
                }
            }
            default:
                return createDecodeErrorResult(ErrorId.FieldBooleanNodeHasTooManyParameters, paramCount.toString());
        }
    }

    function toFieldHasValueNode(fieldId: ScanFormula.FieldId): ScanFormula.FieldHasValueNode {
        const hasValueNode = new ScanFormula.FieldHasValueNode();
        hasValueNode.fieldId = fieldId;
        return hasValueNode;
    }

    function tryDecodeSubFieldHasValueNode(fieldId: ScanFormula.SubbedFieldId, subField: unknown):
            Result<
                ScanFormula.PriceSubFieldHasValueNode |
                ScanFormula.DateSubFieldHasValueNode |
                ScanFormula.AltCodeSubFieldHasValueNode |
                ScanFormula.AttributeSubFieldHasValueNode,
                DecodeError
            > {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            switch (fieldId) {
                case ScanFormula.FieldId.Price: {
                    const subFieldId = PriceSubField.tryDecodeId(subField as ZenithEncodedScanFormula.PriceSubFieldEnum);
                    if (subFieldId === undefined) {
                        return createDecodeErrorResult(ErrorId.PriceSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanFormula.PriceSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                case ScanFormula.FieldId.Date: {
                    const subFieldId = DateSubField.tryDecodeId(subField as ZenithEncodedScanFormula.DateSubFieldEnum);
                    if (subFieldId === undefined) {
                        return createDecodeErrorResult(ErrorId.PriceSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanFormula.DateSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                case ScanFormula.FieldId.AltCode: {
                    const subFieldId = AltCodeSubField.tryDecodeId(subField as ZenithEncodedScanFormula.AltCodeSubField);
                    if (subFieldId === undefined) {
                        return createDecodeErrorResult(ErrorId.AltCodeSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanFormula.AltCodeSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                case ScanFormula.FieldId.Attribute: {
                    const subFieldId = AttributeSubField.tryDecodeId(subField as ZenithEncodedScanFormula.AttributeSubField);
                    if (subFieldId === undefined) {
                        return createDecodeErrorResult(ErrorId.AttributeSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanFormula.AttributeSubFieldHasValueNode();
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

    function tryDecodeFieldEqualsOrContainsNode(fieldId: ScanFormula.FieldId, param1: unknown) {
        const fieldDataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanFormula.FieldDataTypeId.Numeric: return tryDecodeNumericFieldEqualsNode(fieldId as ScanFormula.NumericFieldId, param1);
            case ScanFormula.FieldDataTypeId.Date: return tryDecodeDateFieldEqualsNode(fieldId as ScanFormula.DateFieldId, param1);
            case ScanFormula.FieldDataTypeId.Text: { return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextFieldId, param1, undefined, undefined);
            }
            case ScanFormula.FieldDataTypeId.Boolean: {
                return tryDecodeBooleanFieldEqualsNode(fieldId as ScanFormula.BooleanFieldId, param1);
            }
            default:
                throw new UnreachableCaseError('ZSCCTTFEOCN10008', fieldDataTypeId);
        }
    }

    function tryNamedParametersToFieldEqualsOrInRangeNode<T>(fieldId: ScanFormula.FieldId, namedParameters: object | null) {
        const fieldDataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanFormula.FieldDataTypeId.Numeric: {
                if (namedParameters === null) {
                    return createDecodeErrorResult<T>(ErrorId.NamedParametersCannotBeNull, 'null');
                } else {
                    const numericFieldId = fieldId as ScanFormula.NumericFieldId;
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithEncodedScanFormula.NumericNamedParameters;
                    if (at !== undefined) {
                        return tryDecodeNumericFieldEqualsNode(numericFieldId, at);
                    } else {
                        return tryDecodeNumericFieldInRangeNode(numericFieldId, min, max);
                    }
                }
            }
            case ScanFormula.FieldDataTypeId.Date: {
                if (namedParameters === null) {
                    return createDecodeErrorResult<T>(ErrorId.NamedParametersCannotBeNull, 'null');
                } else {
                    const dateFieldId = fieldId as ScanFormula.DateFieldId;
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithEncodedScanFormula.DateNamedParameters;
                    if (at !== undefined) {
                        return tryDecodeDateFieldEqualsNode(dateFieldId, at);
                    } else {
                        return tryDecodeDateFieldInRangeNode(dateFieldId, min, max);
                    }
                }
            }
            case ScanFormula.FieldDataTypeId.Text: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult<T>(ErrorId.FirstParameterCannotBeObjectOrNull, `${namedParameters}`);
            }
            case ScanFormula.FieldDataTypeId.Boolean: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult<T>(ErrorId.FirstParameterCannotBeObjectOrNull, `${namedParameters}`);
            }
            default:
                throw new UnreachableCaseError('ZSCCTNPTFEOIRN10008', fieldDataTypeId);
        }
    }

    function tryDecodeFieldContainsOrInRangeNode(fieldId: ScanFormula.FieldId, param1: unknown, param2: unknown): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const fieldDataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanFormula.FieldDataTypeId.Numeric: return tryDecodeNumericFieldInRangeNode(fieldId as ScanFormula.NumericFieldId, param1, param2);
            case ScanFormula.FieldDataTypeId.Date: return tryDecodeDateFieldInRangeNode(fieldId as ScanFormula.DateFieldId, param1, param2);
            case ScanFormula.FieldDataTypeId.Text: {
                if (typeof param2 === 'object') {
                    if (param2 === null) {
                        return createDecodeErrorResult(ErrorId.NamedParametersCannotBeNull, '<null>');
                    } else {
                        const { As: as, IgnoreCase: ignoreCase } = param2 as ZenithEncodedScanFormula.TextNamedParameters;
                        return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextFieldId, param1, as, ignoreCase);
                    }
                } else {
                    return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextFieldId, param1, param2, undefined);
                }
            }
            case ScanFormula.FieldDataTypeId.Boolean: {
                return createDecodeErrorResult(
                    ErrorId.BooleanFieldCanOnlyHaveOneParameter,
                    Field.booleanFromId(fieldId as ScanFormula.BooleanFieldId)
                );
            }
            default:
                throw new UnreachableCaseError('ZSCCTTFCOIRN10008', fieldDataTypeId);
        }
    }

    function tryDecodeNumericFieldEqualsNode(fieldId: ScanFormula.NumericFieldId, target: unknown): Result<ScanFormula.NumericFieldEqualsNode, DecodeError> {
        if (typeof target !== 'number') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.TargetIsNotNumber, `${target}`);
        } else {
            const node = new ScanFormula.NumericFieldEqualsNode();
            node.fieldId = fieldId;
            node.target = target;
            return new Ok(node);
        }
    }

    function tryDecodeNumericFieldInRangeNode(fieldId: ScanFormula.NumericFieldId, min: unknown, max: unknown): Result<ScanFormula.NumericFieldInRangeNode, DecodeError> {
        const minUndefined = min === undefined;
        if (!minUndefined && typeof min !== 'number') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.RangeMinIsDefinedButNotNumber, `${min}`);
        } else {
            const maxUndefined = max === undefined;
            if (!maxUndefined && typeof max !== 'number') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.RangeMaxIsDefinedButNotNumber, `${max}`);
            } else {
                if (minUndefined && maxUndefined) {
                    return createDecodeErrorResult(ErrorId.RangeMinAndMaxAreBothUndefined, undefined);
                } else {
                    const node = new ScanFormula.NumericFieldInRangeNode();
                    node.fieldId = fieldId;
                    node.min = min;
                    node.max = max;
                    return new Ok(node);
                }
            }
        }
    }

    function tryDecodeDateFieldEqualsNode(fieldId: ScanFormula.DateFieldId, targetAsString: unknown): Result<ScanFormula.DateFieldEqualsNode, DecodeError> {
        if (typeof targetAsString !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.DateFieldEqualsTargetIsNotString, `${targetAsString}`);
        } else {
            const target = DateValue.tryDecodeDate(targetAsString);
            if (target === undefined) {
                return createDecodeErrorResult(ErrorId.TargetHasInvalidDateFormat, `${targetAsString}`);
            } else {
                const node = new ScanFormula.DateFieldEqualsNode();
                node.fieldId = fieldId;
                node.target = target;
                return new Ok(node);
            }
        }
    }

    function tryDecodeDateFieldInRangeNode(fieldId: ScanFormula.DateFieldId, min: unknown, max: unknown): Result<ScanFormula.DateFieldInRangeNode, DecodeError> {
        let minDate: SourceTzOffsetDateTime | undefined;
        if (min === undefined) {
            minDate = undefined;
        } else {
            if (typeof min !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.RangeMinIsDefinedButNotString, `${min}`);
            } else {
                minDate = DateValue.tryDecodeDate(min);
                if (minDate === undefined) {
                    return createDecodeErrorResult(ErrorId.RangeMinHasInvalidDateFormat, `${min}`);
                }
            }
        }

        let maxDate: SourceTzOffsetDateTime | undefined;
        if (max === undefined) {
            maxDate = undefined;
        } else {
            if (typeof max !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.RangeMaxIsDefinedButNotString, `${max}`);
            } else {
                maxDate = DateValue.tryDecodeDate(max);
                if (maxDate === undefined) {
                    return createDecodeErrorResult(ErrorId.RangeMaxHasInvalidDateFormat, `${max}`);
                }
            }
        }

        if (minDate === undefined && maxDate === undefined) {
            return createDecodeErrorResult(ErrorId.RangeMinAndMaxAreBothUndefined, undefined);
        } else {
            const node = new ScanFormula.DateFieldInRangeNode();
            node.fieldId = fieldId;
            node.min = minDate;
            node.max = maxDate;
            return new Ok(node);
        }
    }

    function tryDecodeTextFieldContainsNode(fieldId: ScanFormula.TextFieldId, value: unknown, as: unknown, ignoreCase: unknown):
            Result<ScanFormula.TextFieldContainsNode, DecodeError> {
        const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
        if (propertiesResult.isErr()) {
            return propertiesResult.createType();
        } else {
            const properties = propertiesResult.value;
            const node = new ScanFormula.TextFieldContainsNode();
            node.fieldId = fieldId;
            node.value = properties.value;
            node.asId = properties.asId;
            node.ignoreCase = properties.ignoreCase;
            return new Ok(node);
        }
    }

    function tryDecodeBooleanFieldEqualsNode(fieldId: ScanFormula.BooleanFieldId, param1: unknown): Result<ScanFormula.BooleanFieldEqualsNode, DecodeError> {
        if (typeof param1 !== 'boolean') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.BooleanFieldEqualsTargetIsNotBoolean, `${param1}`);
        } else {
            const node = new ScanFormula.BooleanFieldEqualsNode();
            node.fieldId = fieldId;
            node.target = param1;
            return new Ok(node);
        }
    }

    function tryDecodeSubFieldEqualsOrContainsNode(fieldId: ScanFormula.SubbedFieldId, subField: unknown, param2: unknown) {
        switch (fieldId) {
            case ScanFormula.FieldId.Price: return tryDecodePriceSubFieldEqualsNode(subField, param2);
            case ScanFormula.FieldId.Date: return tryDecodeDateSubFieldEqualsNode(subField, param2);
            case ScanFormula.FieldId.AltCode: return tryDecodeAltCodeSubFieldContains(subField, param2, undefined, undefined);
            case ScanFormula.FieldId.Attribute: return tryDecodeAttributeSubFieldContains(subField, param2, undefined, undefined);
            default:
                throw new UnreachableCaseError('ZSCCTTSFEOCN10008', fieldId);
        }
    }

    function tryDecodeSubFieldContainsOrInRangeNode(fieldId: ScanFormula.SubbedFieldId, subField: unknown, param2: unknown, param3: unknown) {
        switch (fieldId) {
            case ScanFormula.FieldId.Price: return tryDecodePriceSubFieldInRangeNode(subField, param2, param3);
            case ScanFormula.FieldId.Date: return tryDecodeDateSubFieldInRangeNode(subField, param2, param3);
            case ScanFormula.FieldId.AltCode: return tryDecodeAltCodeSubFieldContains(subField, param2, param3, undefined);
            case ScanFormula.FieldId.Attribute: return tryDecodeAttributeSubFieldContains(subField, param2, param3, undefined);
            default:
                throw new UnreachableCaseError('ZSCCTTSFCOIRN10008', fieldId);
        }
    }

    function tryDecodeTextSubFieldContainsNode<T>(fieldId: ScanFormula.SubbedFieldId, subField: unknown, value: unknown, as: unknown, ignoreCase: unknown) {
        switch (fieldId) {
            case ScanFormula.FieldId.Price:
            case ScanFormula.FieldId.Date: {
                return createDecodeErrorResult<T>(ErrorId.OnlyTextSubFieldContainsNodeCanHave4Parameters, Field.matchingFromId(fieldId));
            }
            case ScanFormula.FieldId.AltCode: return tryDecodeAltCodeSubFieldContains(subField, value, as, ignoreCase);
            case ScanFormula.FieldId.Attribute: return tryDecodeAttributeSubFieldContains(subField, value, as, ignoreCase);
            default:
                throw new UnreachableCaseError('ZSCCTTTSFCN10008', fieldId);
        }
    }

    function tryNamedParametersToSubFieldEqualsOrInRangeNode<T>(fieldId: ScanFormula.SubbedFieldId, subField: unknown, namedParameters: object | null) {
        switch (fieldId) {
            case ScanFormula.FieldId.Price: {
                if (namedParameters === null) {
                    return createDecodeErrorResult<T>(ErrorId.NamedParametersCannotBeNull, 'null');
                } else {
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithEncodedScanFormula.NumericNamedParameters;
                    if (at !== undefined) {
                        return tryDecodePriceSubFieldEqualsNode(subField, at);
                    } else {
                        return tryDecodePriceSubFieldInRangeNode(subField, min, max);
                    }
                }
            }
            case ScanFormula.FieldId.Date: {
                if (namedParameters === null) {
                    return createDecodeErrorResult<T>(ErrorId.NamedParametersCannotBeNull, 'null');
                } else {
                    const { At: at, Min: min, Max: max } = namedParameters as ZenithEncodedScanFormula.DateNamedParameters;
                    if (at !== undefined) {
                        return tryDecodeDateSubFieldEqualsNode(subField, at);
                    } else {
                        return tryDecodeDateSubFieldInRangeNode(subField, min, max);
                    }
                }
            }
            case ScanFormula.FieldId.AltCode: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult<T>(ErrorId.SecondParameterCannotBeObjectOrNull, `${namedParameters}`);
            }
            case ScanFormula.FieldId.Attribute: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult<T>(ErrorId.SecondParameterCannotBeObjectOrNull, `${namedParameters}`);
            }
            default:
                throw new UnreachableCaseError('ZSCCTNPTSFEOIE10008', fieldId);
        }
    }

    function tryDecodePriceSubFieldEqualsNode(subField: unknown, target: unknown): Result<ScanFormula.PriceSubFieldEqualsNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = PriceSubField.tryDecodeId(subField as ZenithEncodedScanFormula.PriceSubFieldEnum);
            if (subFieldId === undefined) {
                return createDecodeErrorResult(ErrorId.PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`);
            } else {
                if (typeof target !== 'number') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return createDecodeErrorResult(ErrorId.TargetIsNotNumber, `${target}`);
                } else {
                    const node = new ScanFormula.PriceSubFieldEqualsNode();
                    node.fieldId = ScanFormula.FieldId.Price;
                    node.subFieldId = subFieldId;
                    node.target = target;
                    return new Ok(node);
                }
            }
        }
    }

    function tryDecodePriceSubFieldInRangeNode(subField: unknown, min: unknown, max: unknown): Result<ScanFormula.PriceSubFieldInRangeNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = PriceSubField.tryDecodeId(subField as ZenithEncodedScanFormula.PriceSubFieldEnum);
            if (subFieldId === undefined) {
                return createDecodeErrorResult(ErrorId.PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`);
            } else {
                const minUndefined = min === undefined;
                if (!minUndefined && typeof min !== 'number') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return createDecodeErrorResult(ErrorId.RangeMinIsDefinedButNotNumber, `${min}`);
                } else {
                    const maxUndefined = max === undefined;
                    if (!maxUndefined && typeof max !== 'number') {
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        return createDecodeErrorResult(ErrorId.RangeMaxIsDefinedButNotNumber, `${max}`);
                    } else {
                        if (minUndefined && maxUndefined) {
                            return createDecodeErrorResult(ErrorId.RangeMinAndMaxAreBothUndefined, undefined);
                        } else {
                            const node = new ScanFormula.PriceSubFieldInRangeNode();
                            node.fieldId = ScanFormula.FieldId.Price;
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

    function tryDecodeDateSubFieldEqualsNode(subField: unknown, target: unknown): Result<ScanFormula.DateSubFieldEqualsNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = DateSubField.tryDecodeId(subField as ZenithEncodedScanFormula.DateSubFieldEnum);
            if (subFieldId === undefined) {
                return createDecodeErrorResult(ErrorId.DateSubFieldEqualsSubFieldIsUnknown, `${subField}`);
            } else {
                if (typeof target !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return createDecodeErrorResult(ErrorId.DateSubFieldEqualsTargetIsNotString, `${target}`);
                } else {
                    const targetAsDate = DateValue.tryDecodeDate(target);
                    if (targetAsDate === undefined) {
                        return createDecodeErrorResult(ErrorId.TargetHasInvalidDateFormat, `${target}`);
                    } else {
                        const node = new ScanFormula.DateSubFieldEqualsNode();
                        node.fieldId = ScanFormula.FieldId.Date;
                        node.subFieldId = subFieldId;
                        node.target = targetAsDate;
                        return new Ok(node);
                    }
                }
            }
        }
    }

    function tryDecodeDateSubFieldInRangeNode(subField: unknown, min: unknown, max: unknown): Result<ScanFormula.DateSubFieldInRangeNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            let minDate: SourceTzOffsetDateTime | undefined;
            if (min === undefined) {
                minDate = undefined;
            } else {
                if (typeof min !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return createDecodeErrorResult(ErrorId.RangeMinIsDefinedButNotString, `${min}`);
                } else {
                    minDate = DateValue.tryDecodeDate(min);
                    if (minDate === undefined) {
                        return createDecodeErrorResult(ErrorId.RangeMinHasInvalidDateFormat, `${min}`);
                    }
                }
            }

            let maxDate: SourceTzOffsetDateTime | undefined;
            if (max === undefined) {
                maxDate = undefined;
            } else {
                if (typeof max !== 'string') {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return createDecodeErrorResult(ErrorId.RangeMaxIsDefinedButNotString, `${max}`);
                } else {
                    maxDate = DateValue.tryDecodeDate(max);
                    if (maxDate === undefined) {
                        return createDecodeErrorResult(ErrorId.RangeMaxHasInvalidDateFormat, `${max}`);
                    }
                }
            }

            if (minDate === undefined && maxDate === undefined) {
                return createDecodeErrorResult(ErrorId.RangeMinAndMaxAreBothUndefined, undefined);
            } else {
                const node = new ScanFormula.DateSubFieldInRangeNode();
                node.fieldId = ScanFormula.FieldId.Date;
                node.min = minDate;
                node.max = maxDate;
                return new Ok(node);
            }
        }
    }



    function tryDecodeAltCodeSubFieldContains(subField: unknown, value: unknown, as: unknown, ignoreCase: unknown): Result<ScanFormula.AltCodeSubFieldContainsNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = AltCodeSubField.tryDecodeId(subField as ZenithEncodedScanFormula.AltCodeSubField);
            if (subFieldId === undefined) {
                return createDecodeErrorResult(ErrorId.AltCodeSubFieldContainsSubFieldIsUnknown, `${subField}`);
            } else {
                const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
                if (propertiesResult.isErr()) {
                    return propertiesResult.createType();
                } else {
                    const properties = propertiesResult.value;
                    const node = new ScanFormula.AltCodeSubFieldContainsNode();
                    node.fieldId = ScanFormula.FieldId.AltCode;
                    node.subFieldId = subFieldId;
                    node.value = properties.value;
                    node.asId = properties.asId;
                    node.ignoreCase = properties.ignoreCase;
                    return new Ok(node);
                }
            }
        }
    }

    function tryDecodeAttributeSubFieldContains(subField: unknown, value: unknown, as: unknown, ignoreCase: unknown): Result<ScanFormula.AttributeSubFieldContainsNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            const subFieldId = AttributeSubField.tryDecodeId(subField as ZenithEncodedScanFormula.AttributeSubField);
            if (subFieldId === undefined) {
                return createDecodeErrorResult(ErrorId.AttributeSubFieldContainsSubFieldIsUnknown, `${subField}`);
            } else {
                const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
                if (propertiesResult.isErr()) {
                    return propertiesResult.createType();
                } else {
                    const properties = propertiesResult.value;
                    const node = new ScanFormula.AttributeSubFieldContainsNode();
                    node.fieldId = ScanFormula.FieldId.Attribute;
                    node.subFieldId = subFieldId;
                    node.value = properties.value;
                    node.asId = properties.asId;
                    node.ignoreCase = properties.ignoreCase;
                    return new Ok(node);
                }
            }
        }
    }

    function tryDecodeNumericComparisonNode(
        tulipNode: ZenithEncodedScanFormula.ComparisonTupleNode,
        nodeConstructor: new() => ScanFormula.NumericComparisonBooleanNode,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.NumericComparisonBooleanNode, DecodeError> {
        const nodeType = tulipNode[0];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (tulipNode.length !== 3) {
            return createDecodeErrorResult(ErrorId.NumericComparisonDoesNotHave2Operands, nodeType);
        } else {
            const leftParam = tulipNode[1] as ZenithEncodedScanFormula.NumericParam;
            const leftOperandResult = tryDecodeExpectedNumericOperand(leftParam, `${nodeType}/${Strings[StringId.Left]}`, toProgress);
            if (leftOperandResult.isErr()) {
                return leftOperandResult.createType();
            } else {
                const rightParam = tulipNode[2] as ZenithEncodedScanFormula.NumericParam;
                const rightOperandResult = tryDecodeExpectedNumericOperand(rightParam, `${nodeType}/${Strings[StringId.Right]}`, toProgress);
                if (rightOperandResult.isErr()) {
                    return rightOperandResult.createType();
                } else {
                    const resultNode = new nodeConstructor();
                    resultNode.leftOperand = leftOperandResult.value;
                    resultNode.rightOperand = rightOperandResult.value;
                    return new Ok(resultNode);
                }
            }
        }
    }

    function tryDecodeExpectedNumericOperand(
        numericParam: unknown, // ZenithScanCriteria.NumericParam,
        paramId: string,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.NumericNode | number, DecodeError> {
        if (typeof numericParam === 'number') {
            return new Ok(numericParam);
        } else {
            if (typeof numericParam === 'string') {
                return tryDecodeNumericFieldValueGet(numericParam as ZenithEncodedScanFormula.NumericField);
            } else {
                if (Array.isArray(numericParam)) {
                    return tryDecodeExpectedArithmeticNumericNode(numericParam as ZenithEncodedScanFormula.NumericTupleNode, toProgress);
                } else {
                    return createDecodeErrorResult(ErrorId.NumericParameterIsNotNumberOrComparableFieldOrArray, `${paramId}`);
                }
            }
        }
    }

    function tryDecodeExpectedArithmeticNumericNode(
        numericTupleNode: ZenithEncodedScanFormula.NumericTupleNode,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        toProgress.enterTupleNode();
        const tupleNodeLength = numericTupleNode.length;
        if (tupleNodeLength < 1 ) {
            return createDecodeErrorResult(ErrorId.NumericTupleNodeIsZeroLength, undefined);
        } else {
            const nodeType = numericTupleNode[0];
            if (typeof nodeType !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.NumericTupleNodeTypeIsNotString, `${nodeType}`);
            } else {
                const decodedNode = toProgress.addDecodedNode(nodeType);

                const result = tryDecodeNumericNode(numericTupleNode, toProgress)

                if (result.isOk()) {
                    toProgress.exitTupleNode(decodedNode, result.value.typeId);
                }

                return result;
            }
        }
    }

    function tryDecodeNumericNode(
        numericTupleNode: ZenithEncodedScanFormula.NumericTupleNode,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const tupleNodetype = numericTupleNode[0] as ZenithEncodedScanFormula.ExpressionTupleNodeType;
        switch (tupleNodetype) {
            // Binary
            case ZenithEncodedScanFormula.AddTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericAddNode, toProgress);
            case ZenithEncodedScanFormula.DivSymbolTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericDivNode, toProgress);
            case ZenithEncodedScanFormula.DivTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericDivNode, toProgress);
            case ZenithEncodedScanFormula.ModSymbolTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericModNode, toProgress);
            case ZenithEncodedScanFormula.ModTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericModNode, toProgress);
            case ZenithEncodedScanFormula.MulSymbolTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericMulNode, toProgress);
            case ZenithEncodedScanFormula.MulTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericMulNode, toProgress);
            case ZenithEncodedScanFormula.SubTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericSubNode, toProgress);

            // Unary
            case ZenithEncodedScanFormula.NegTupleNodeType:
                return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, ScanFormula.NumericNegNode, toProgress);
            case ZenithEncodedScanFormula.PosTupleNodeType:
                return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, ScanFormula.NumericPosNode, toProgress);
            case ZenithEncodedScanFormula.AbsTupleNodeType:
                return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, ScanFormula.NumericAbsNode, toProgress);

            // Unary or Binary (depending on number of params)
            case ZenithEncodedScanFormula.SubOrNegSymbolTupleNodeType:
                return tryDecodeUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode | ZenithEncodedScanFormula.BinaryExpressionTupleNode,
                    ScanFormula.NumericNegNode,
                    ScanFormula.NumericSubNode,
                    toProgress
                );
            case ZenithEncodedScanFormula.AddOrPosSymbolTupleNodeType:
                return tryDecodeUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode | ZenithEncodedScanFormula.BinaryExpressionTupleNode,
                    ScanFormula.NumericPosNode,
                    ScanFormula.NumericAddNode,
                    toProgress
                );

            case ZenithEncodedScanFormula.IfTupleNodeType:
                return tryDecodeNumericIfNode(numericTupleNode as ZenithEncodedScanFormula.IfTupleNode, toProgress);

            default: {
                const neverTupleNodeType: never = tupleNodetype;
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.UnknownNumericTupleNodeType, `${neverTupleNodeType}`);
            }
        }
    }

    function tryDecodeUnaryArithmeticNumericNode(
        numericTupleNode: ZenithEncodedScanFormula.UnaryExpressionTupleNode,
        nodeConstructor: new() => ScanFormula.UnaryArithmeticNumericNode,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const nodeLength = numericTupleNode.length;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (nodeLength !== 2) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.UnaryArithmeticNumericTupleNodeRequires2Parameters, `${numericTupleNode}`);
        } else {
            const param = numericTupleNode[1];
            const operandResult = tryDecodeExpectedNumericOperand(param, '', toProgress);
            if (operandResult.isErr()) {
                return operandResult.createType();
            } else {
                const node = new nodeConstructor();
                node.operand = operandResult.value;
                return new Ok(node);
            }
        }
    }

    function tryDecodeLeftRightArithmeticNumericNode(
        numericTupleNode: ZenithEncodedScanFormula.NumericTupleNode,
        nodeConstructor: new() => ScanFormula.LeftRightArithmeticNumericNode,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const nodeLength = numericTupleNode.length;
        if (nodeLength !== 3) {
            return createDecodeErrorResult(ErrorId.LeftRightArithmeticNumericTupleNodeRequires3Parameters, nodeLength.toString());
        } else {
            const binaryExpressionTupleNode = numericTupleNode as ZenithEncodedScanFormula.BinaryExpressionTupleNode
            const leftParam = binaryExpressionTupleNode[1];
            const leftResult = tryDecodeExpectedNumericOperand(leftParam, Strings[StringId.Left], toProgress);
            if (leftResult.isErr()) {
                return leftResult.createType();
            } else {
                const rightParam = binaryExpressionTupleNode[2];
                const rightResult = tryDecodeExpectedNumericOperand(rightParam, Strings[StringId.Right], toProgress);
                if (rightResult.isErr()) {
                    return rightResult.createType();
                } else {
                    const node = new nodeConstructor();
                    node.leftOperand = leftResult.value;
                    node.rightOperand = rightResult.value;
                    return new Ok(node);
                }
            }
        }
    }

    function tryDecodeUnaryOrLeftRightArithmeticNumericNode(
        numericTupleNode: ZenithEncodedScanFormula.UnaryExpressionTupleNode | ZenithEncodedScanFormula.BinaryExpressionTupleNode,
        unaryNodeConstructor: new() => ScanFormula.UnaryArithmeticNumericNode,
        leftRightNodeConstructor: new() => ScanFormula.LeftRightArithmeticNumericNode,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const nodeLength = numericTupleNode.length;
        switch (nodeLength) {
            case 2: return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, unaryNodeConstructor, toProgress);
            case 3: return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.BinaryExpressionTupleNode, leftRightNodeConstructor, toProgress);
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.NumericTupleNodeRequires2Or3Parameters, `${numericTupleNode}`);
        }
    }

    function tryDecodeNumericIfNode(tupleNode: ZenithEncodedScanFormula.IfTupleNode, toProgress: DecodeProgress): Result<ScanFormula.NumericIfNode, DecodeError> {
        const tupleLength = tupleNode.length;
        if (tupleLength < 5) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.IfTupleNodeRequiresAtLeast4Parameters, `${tupleNode}`);
        } else {
            const armParameters = tupleLength - 1;
            const armsRemainder = armParameters % 2;
            if (armsRemainder !== 0) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.IfTupleNodeRequiresAnEvenNumberOfParameters, `${tupleNode}`);
            } else {
                const armCount = armParameters / 2;
                const trueArmCount = armCount - 1;
                const trueArms = new Array<ScanFormula.NumericIfNode.Arm>(trueArmCount);
                let tupleIndex = 1;
                for (let i = 0; i < trueArmCount; i++) {
                    const armResult = tryDecodeNumericIfArm(tupleNode, tupleIndex, toProgress);
                    if (armResult.isErr()) {
                        return armResult.createType();
                    } else {
                        trueArms[i] = armResult.value;
                    }
                    tupleIndex += 2;
                }

                const armResult = tryDecodeNumericIfArm(tupleNode, tupleIndex, toProgress);
                if (armResult.isErr()) {
                    return armResult.createType();
                } else {
                    const falseArm = armResult.value;

                    const node = new ScanFormula.NumericIfNode();
                    node.trueArms = trueArms;
                    node.falseArm = falseArm;
                    return new Ok(node);
                }
            }
        }
    }

    function tryDecodeNumericIfArm(tupleNode: ZenithEncodedScanFormula.IfTupleNode, tupleIndex: Integer, toProgress: DecodeProgress): Result<ScanFormula.NumericIfNode.Arm, DecodeError> {
        const conditionElement = tupleNode[tupleIndex++] as ZenithEncodedScanFormula.BooleanParam;
        const conditionResult = tryDecodeExpectedBooleanOperand(conditionElement, toProgress);
        if (conditionResult.isErr()) {
            return conditionResult.createType();
        } else {
            const valueElement = tupleNode[tupleIndex++] as ZenithEncodedScanFormula.NumericParam;
            const valueResult = tryDecodeExpectedNumericOperand(valueElement, tupleIndex.toString(), toProgress);
            if (valueResult.isErr()) {
                return valueResult.createType();
            } else {
                const arm: ScanFormula.NumericIfNode.Arm = {
                    condition: conditionResult.value,
                    value: valueResult.value,
                };
                return new Ok(arm);
            }
        }
    }

    function tryDecodeNumericFieldValueGet(field: ZenithEncodedScanFormula.NumericField): Result<ScanFormula.NumericFieldValueGetNode, DecodeError> {
        const fieldId = Field.tryNumericToId(field);
        if (fieldId === undefined) {
            return createDecodeErrorResult(ErrorId.UnknownNumericField, field);
        } else {
            const node = new ScanFormula.NumericFieldValueGetNode();
            node.fieldId = fieldId;
            return new Ok(node);
        }
    }

    interface TextFieldContainsProperties {
        readonly value: string;
        readonly asId: ScanFormula.TextContainsAsId;
        readonly ignoreCase: boolean;
    }

    namespace TextFieldContainsProperties {
        export function resolveFromUnknown(value: unknown, as: unknown, ignoreCase: unknown): Result<TextFieldContainsProperties, DecodeError> {
            if (typeof value !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.TextFieldContainsValueIsNotString, `${value}`);
            } else {
                let resolvedAsId: ScanFormula.TextContainsAsId;
                if (as === undefined) {
                    resolvedAsId = ScanFormula.TextContainsAsId.None;
                } else {
                    if (typeof as !== 'string') {
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        return createDecodeErrorResult(ErrorId.TextFieldContainsAsIsNotString, `${as}`);
                    } else {
                        const asId = TextContainsAs.tryDecodeId(as as ZenithEncodedScanFormula.TextContainsAsEnum);
                        if (asId === undefined) {
                            return createDecodeErrorResult(ErrorId.TextFieldContainsAsHasInvalidFormat, `${as}`);
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
                        return createDecodeErrorResult(ErrorId.TextFieldContainsAsIsNotBoolean, `${ignoreCase}`);
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
        export function tryMatchingToId(value: ZenithEncodedScanFormula.MatchingField): ScanFormula.FieldId | undefined {
            let fieldId: ScanFormula.FieldId | undefined = tryNumericToId(value as ZenithEncodedScanFormula.NumericField);
            if (fieldId === undefined) {
                fieldId = tryTextToId(value as ZenithEncodedScanFormula.TextField);
                if (fieldId === undefined) {
                    fieldId = tryDateToId(value as ZenithEncodedScanFormula.DateField);
                    if (fieldId === undefined) {
                        fieldId = tryBooleanToId(value as ZenithEncodedScanFormula.BooleanField); // fieldId is left undefined if this try fails
                    }
                }
            }

            return fieldId;
        }

        export function matchingFromId(value: ScanFormula.FieldId): ZenithEncodedScanFormula.MatchingField {
            let field: ZenithEncodedScanFormula.MatchingField | undefined = tryNumericFromId(value as ScanFormula.NumericFieldId);
            if (field === undefined) {
                field = tryTextFromId(value as ScanFormula.TextFieldId);
                if (field === undefined) {
                    field = tryDateFromId(value as ScanFormula.DateFieldId);
                    if (field === undefined) {
                        field = tryBooleanFromId(value as ScanFormula.BooleanFieldId);
                        if (field === undefined) {
                            throw new AssertInternalError('ZSCCFMFI16179', `${value}`)
                        }
                    }
                }
            }

            return field;
        }

        export function tryDateToId(value: ZenithEncodedScanFormula.DateField): ScanFormula.DateFieldId | undefined {
            switch (value) {
                case ZenithEncodedScanFormula.ExpiryDateTupleNodeType: return ScanFormula.FieldId.ExpiryDate;
                default:
                    return undefined;
            }
        }

        export function dateFromId(value: ScanFormula.DateFieldId): ZenithEncodedScanFormula.DateField {
            const result = tryDateFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFDFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryDateFromId(value: ScanFormula.DateFieldId): ZenithEncodedScanFormula.DateField | undefined {
            switch (value) {
                case ScanFormula.FieldId.ExpiryDate: return ZenithEncodedScanFormula.ExpiryDateTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function tryNumericToId(value: ZenithEncodedScanFormula.NumericField): ScanFormula.NumericFieldId | undefined {
            switch (value) {
                case ZenithEncodedScanFormula.AuctionTupleNodeType: return ScanFormula.FieldId.Auction;
                case ZenithEncodedScanFormula.AuctionLastTupleNodeType: return ScanFormula.FieldId.AuctionLast;
                case ZenithEncodedScanFormula.AuctionQuantityTupleNodeType: return ScanFormula.FieldId.AuctionQuantity;
                case ZenithEncodedScanFormula.BestAskCountTupleNodeType: return ScanFormula.FieldId.BestAskCount;
                case ZenithEncodedScanFormula.BestAskPriceTupleNodeType: return ScanFormula.FieldId.BestAskPrice;
                case ZenithEncodedScanFormula.BestAskQuantityTupleNodeType: return ScanFormula.FieldId.BestAskQuantity;
                case ZenithEncodedScanFormula.BestBidCountTupleNodeType: return ScanFormula.FieldId.BestBidCount;
                case ZenithEncodedScanFormula.BestBidPriceTupleNodeType: return ScanFormula.FieldId.BestBidPrice;
                case ZenithEncodedScanFormula.BestBidQuantityTupleNodeType: return ScanFormula.FieldId.BestBidQuantity;
                case ZenithEncodedScanFormula.ClosePriceTupleNodeType: return ScanFormula.FieldId.ClosePrice;
                case ZenithEncodedScanFormula.ContractSizeTupleNodeType: return ScanFormula.FieldId.ContractSize;
                case ZenithEncodedScanFormula.HighPriceTupleNodeType: return ScanFormula.FieldId.HighPrice;
                case ZenithEncodedScanFormula.LastPriceTupleNodeType: return ScanFormula.FieldId.LastPrice;
                case ZenithEncodedScanFormula.LotSizeTupleNodeType: return ScanFormula.FieldId.LotSize;
                case ZenithEncodedScanFormula.LowPriceTupleNodeType: return ScanFormula.FieldId.LowPrice;
                case ZenithEncodedScanFormula.OpenInterestTupleNodeType: return ScanFormula.FieldId.OpenInterest;
                case ZenithEncodedScanFormula.OpenPriceTupleNodeType: return ScanFormula.FieldId.OpenPrice;
                case ZenithEncodedScanFormula.PreviousCloseTupleNodeType: return ScanFormula.FieldId.PreviousClose;
                case ZenithEncodedScanFormula.RemainderTupleNodeType: return ScanFormula.FieldId.Remainder;
                case ZenithEncodedScanFormula.ShareIssueTupleNodeType: return ScanFormula.FieldId.ShareIssue;
                case ZenithEncodedScanFormula.StrikePriceTupleNodeType: return ScanFormula.FieldId.StrikePrice;
                case ZenithEncodedScanFormula.TradesTupleNodeType: return ScanFormula.FieldId.Trades;
                case ZenithEncodedScanFormula.ValueTradedTupleNodeType: return ScanFormula.FieldId.ValueTraded;
                case ZenithEncodedScanFormula.VolumeTupleNodeType: return ScanFormula.FieldId.Volume;
                case ZenithEncodedScanFormula.VwapTupleNodeType: return ScanFormula.FieldId.Vwap;
                default:
                    return undefined;
            }
        }

        export function numericFromId(value: ScanFormula.NumericFieldId): ZenithEncodedScanFormula.NumericField {
            const result = tryNumericFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFNFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryNumericFromId(value: ScanFormula.NumericFieldId): ZenithEncodedScanFormula.NumericField | undefined {
            switch (value) {
                case ScanFormula.FieldId.Auction: return ZenithEncodedScanFormula.AuctionTupleNodeType;
                case ScanFormula.FieldId.AuctionLast: return ZenithEncodedScanFormula.AuctionLastTupleNodeType;
                case ScanFormula.FieldId.AuctionQuantity: return ZenithEncodedScanFormula.AuctionQuantityTupleNodeType;
                case ScanFormula.FieldId.BestAskCount: return ZenithEncodedScanFormula.BestAskCountTupleNodeType;
                case ScanFormula.FieldId.BestAskPrice: return ZenithEncodedScanFormula.BestAskPriceTupleNodeType;
                case ScanFormula.FieldId.BestAskQuantity: return ZenithEncodedScanFormula.BestAskQuantityTupleNodeType;
                case ScanFormula.FieldId.BestBidCount: return ZenithEncodedScanFormula.BestBidCountTupleNodeType;
                case ScanFormula.FieldId.BestBidPrice: return ZenithEncodedScanFormula.BestBidPriceTupleNodeType;
                case ScanFormula.FieldId.BestBidQuantity: return ZenithEncodedScanFormula.BestBidQuantityTupleNodeType;
                case ScanFormula.FieldId.ClosePrice: return ZenithEncodedScanFormula.ClosePriceTupleNodeType;
                case ScanFormula.FieldId.ContractSize: return ZenithEncodedScanFormula.ContractSizeTupleNodeType;
                case ScanFormula.FieldId.HighPrice: return ZenithEncodedScanFormula.HighPriceTupleNodeType;
                case ScanFormula.FieldId.LastPrice: return ZenithEncodedScanFormula.LastPriceTupleNodeType;
                case ScanFormula.FieldId.LotSize: return ZenithEncodedScanFormula.LotSizeTupleNodeType;
                case ScanFormula.FieldId.LowPrice: return ZenithEncodedScanFormula.LowPriceTupleNodeType;
                case ScanFormula.FieldId.OpenInterest: return ZenithEncodedScanFormula.OpenInterestTupleNodeType;
                case ScanFormula.FieldId.OpenPrice: return ZenithEncodedScanFormula.OpenPriceTupleNodeType;
                case ScanFormula.FieldId.PreviousClose: return ZenithEncodedScanFormula.PreviousCloseTupleNodeType;
                case ScanFormula.FieldId.Remainder: return ZenithEncodedScanFormula.RemainderTupleNodeType;
                case ScanFormula.FieldId.ShareIssue: return ZenithEncodedScanFormula.ShareIssueTupleNodeType;
                case ScanFormula.FieldId.StrikePrice: return ZenithEncodedScanFormula.StrikePriceTupleNodeType;
                case ScanFormula.FieldId.Trades: return ZenithEncodedScanFormula.TradesTupleNodeType;
                case ScanFormula.FieldId.ValueTraded: return ZenithEncodedScanFormula.ValueTradedTupleNodeType;
                case ScanFormula.FieldId.Volume: return ZenithEncodedScanFormula.VolumeTupleNodeType;
                case ScanFormula.FieldId.Vwap: return ZenithEncodedScanFormula.VwapTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function tryTextToId(value: ZenithEncodedScanFormula.TextField): ScanFormula.TextFieldId | undefined {
            switch (value) {
                case ZenithEncodedScanFormula.BoardTupleNodeType: return ScanFormula.FieldId.Board;
                case ZenithEncodedScanFormula.CallOrPutTupleNodeType: return ScanFormula.FieldId.CallOrPut;
                case ZenithEncodedScanFormula.CategoryTupleNodeType: return ScanFormula.FieldId.Category;
                case ZenithEncodedScanFormula.CfiTupleNodeType: return ScanFormula.FieldId.Cfi;
                case ZenithEncodedScanFormula.ClassTupleNodeType: return ScanFormula.FieldId.Class;
                case ZenithEncodedScanFormula.CodeTupleNodeType: return ScanFormula.FieldId.Code;
                case ZenithEncodedScanFormula.CurrencyTupleNodeType: return ScanFormula.FieldId.Currency;
                case ZenithEncodedScanFormula.DataTupleNodeType: return ScanFormula.FieldId.Data;
                case ZenithEncodedScanFormula.ExchangeTupleNodeType: return ScanFormula.FieldId.Exchange;
                case ZenithEncodedScanFormula.ExerciseTypeTupleNodeType: return ScanFormula.FieldId.ExerciseType;
                case ZenithEncodedScanFormula.LegTupleNodeType: return ScanFormula.FieldId.Leg;
                case ZenithEncodedScanFormula.MarketTupleNodeType: return ScanFormula.FieldId.Market;
                case ZenithEncodedScanFormula.NameTupleNodeType: return ScanFormula.FieldId.Name;
                case ZenithEncodedScanFormula.QuotationBasisTupleNodeType: return ScanFormula.FieldId.QuotationBasis;
                case ZenithEncodedScanFormula.StateTupleNodeType: return ScanFormula.FieldId.State;
                case ZenithEncodedScanFormula.StateAllowsTupleNodeType: return ScanFormula.FieldId.StateAllows;
                case ZenithEncodedScanFormula.StatusNoteTupleNodeType: return ScanFormula.FieldId.StatusNote;
                case ZenithEncodedScanFormula.TradingMarketTupleNodeType: return ScanFormula.FieldId.TradingMarket;
                default:
                    return undefined;
            }
        }

        export function textFromId(value: ScanFormula.TextFieldId): ZenithEncodedScanFormula.TextField {
            const result = tryTextFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFTFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryTextFromId(value: ScanFormula.TextFieldId): ZenithEncodedScanFormula.TextField | undefined {
            switch (value) {
                case ScanFormula.FieldId.Board: return ZenithEncodedScanFormula.BoardTupleNodeType;
                case ScanFormula.FieldId.CallOrPut: return ZenithEncodedScanFormula.CallOrPutTupleNodeType;
                case ScanFormula.FieldId.Category: return ZenithEncodedScanFormula.CategoryTupleNodeType;
                case ScanFormula.FieldId.Cfi: return ZenithEncodedScanFormula.CfiTupleNodeType;
                case ScanFormula.FieldId.Class: return ZenithEncodedScanFormula.ClassTupleNodeType;
                case ScanFormula.FieldId.Code: return ZenithEncodedScanFormula.CodeTupleNodeType;
                case ScanFormula.FieldId.Currency: return ZenithEncodedScanFormula.CurrencyTupleNodeType;
                case ScanFormula.FieldId.Data: return ZenithEncodedScanFormula.DataTupleNodeType;
                case ScanFormula.FieldId.Exchange: return ZenithEncodedScanFormula.ExchangeTupleNodeType;
                case ScanFormula.FieldId.ExerciseType: return ZenithEncodedScanFormula.ExerciseTypeTupleNodeType;
                case ScanFormula.FieldId.Leg: return ZenithEncodedScanFormula.LegTupleNodeType;
                case ScanFormula.FieldId.Market: return ZenithEncodedScanFormula.MarketTupleNodeType;
                case ScanFormula.FieldId.Name: return ZenithEncodedScanFormula.NameTupleNodeType;
                case ScanFormula.FieldId.QuotationBasis: return ZenithEncodedScanFormula.QuotationBasisTupleNodeType;
                case ScanFormula.FieldId.State: return ZenithEncodedScanFormula.StateTupleNodeType;
                case ScanFormula.FieldId.StateAllows: return ZenithEncodedScanFormula.StateAllowsTupleNodeType;
                case ScanFormula.FieldId.StatusNote: return ZenithEncodedScanFormula.StatusNoteTupleNodeType;
                case ScanFormula.FieldId.TradingMarket: return ZenithEncodedScanFormula.TradingMarketTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function tryBooleanToId(value: ZenithEncodedScanFormula.BooleanField): ScanFormula.BooleanFieldId | undefined {
            switch (value) {
                case ZenithEncodedScanFormula.IsIndexTupleNodeType: return ScanFormula.FieldId.IsIndex;
                default:
                    return undefined;
            }
        }

        export function booleanFromId(value: ScanFormula.BooleanFieldId): ZenithEncodedScanFormula.BooleanField {
            const result = tryBooleanFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFBFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryBooleanFromId(value: ScanFormula.BooleanFieldId): ZenithEncodedScanFormula.BooleanField | undefined {
            switch (value) {
                case ScanFormula.FieldId.IsIndex: return ZenithEncodedScanFormula.IsIndexTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }
    }

    namespace PriceSubField {
        export function toId(value: ZenithEncodedScanFormula.PriceSubFieldEnum): ScanFormula.PriceSubFieldId {
            const fieldId = tryDecodeId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCPSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryDecodeId(value: ZenithEncodedScanFormula.PriceSubFieldEnum): ScanFormula.PriceSubFieldId | undefined {
            switch (value) {
                case ZenithEncodedScanFormula.PriceSubFieldEnum.LastPrice: return ScanFormula.PriceSubFieldId.Last;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function encodeId(value: ScanFormula.PriceSubFieldId): ZenithEncodedScanFormula.PriceSubFieldEnum {
            switch (value) {
                case ScanFormula.PriceSubFieldId.Last: return ZenithEncodedScanFormula.PriceSubFieldEnum.LastPrice;
                default:
                    throw new UnreachableCaseError('ZSCCPSFFI16179', value);
            }
        }
    }

    namespace DateSubField {
        export function toId(value: ZenithEncodedScanFormula.DateSubFieldEnum): ScanFormula.DateSubFieldId {
            const fieldId = tryDecodeId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCDSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryDecodeId(value: ZenithEncodedScanFormula.DateSubFieldEnum): ScanFormula.DateSubFieldId | undefined {
            switch (value) {
                case ZenithEncodedScanFormula.DateSubFieldEnum.Dividend: return ScanFormula.DateSubFieldId.Dividend;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function encodeId(value: ScanFormula.DateSubFieldId): ZenithEncodedScanFormula.DateSubFieldEnum {
            switch (value) {
                case ScanFormula.DateSubFieldId.Dividend: return ZenithEncodedScanFormula.DateSubFieldEnum.Dividend;
                default:
                    throw new UnreachableCaseError('ZSCCDSFFI16179', value);
            }
        }
    }

    namespace AltCodeSubField {
        export function toId(value: ZenithProtocolCommon.Symbol.AlternateKey): ScanFormula.AltCodeSubFieldId {
            const fieldId = tryDecodeId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCACSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryDecodeId(value: ZenithProtocolCommon.Symbol.AlternateKey): ScanFormula.AltCodeSubFieldId | undefined {
            switch (value) {
                case ZenithProtocolCommon.Symbol.AlternateKey.Ticker: return ScanFormula.AltCodeSubFieldId.Ticker;
                case ZenithProtocolCommon.Symbol.AlternateKey.Isin: return ScanFormula.AltCodeSubFieldId.Isin;
                case ZenithProtocolCommon.Symbol.AlternateKey.Base: return ScanFormula.AltCodeSubFieldId.Base;
                case ZenithProtocolCommon.Symbol.AlternateKey.Gics: return ScanFormula.AltCodeSubFieldId.Gics;
                case ZenithProtocolCommon.Symbol.AlternateKey.Ric: return ScanFormula.AltCodeSubFieldId.Ric;
                case ZenithProtocolCommon.Symbol.AlternateKey.Short: return ScanFormula.AltCodeSubFieldId.Short;
                case ZenithProtocolCommon.Symbol.AlternateKey.Long: return ScanFormula.AltCodeSubFieldId.Long;
                case ZenithProtocolCommon.Symbol.AlternateKey.Uid: return ScanFormula.AltCodeSubFieldId.Uid;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function encodeId(value: ScanFormula.AltCodeSubFieldId): ZenithProtocolCommon.Symbol.AlternateKey {
            switch (value) {
                case ScanFormula.AltCodeSubFieldId.Ticker: return ZenithProtocolCommon.Symbol.AlternateKey.Ticker;
                case ScanFormula.AltCodeSubFieldId.Isin: return ZenithProtocolCommon.Symbol.AlternateKey.Isin;
                case ScanFormula.AltCodeSubFieldId.Base: return ZenithProtocolCommon.Symbol.AlternateKey.Base;
                case ScanFormula.AltCodeSubFieldId.Gics: return ZenithProtocolCommon.Symbol.AlternateKey.Gics;
                case ScanFormula.AltCodeSubFieldId.Ric: return ZenithProtocolCommon.Symbol.AlternateKey.Ric;
                case ScanFormula.AltCodeSubFieldId.Short: return ZenithProtocolCommon.Symbol.AlternateKey.Short;
                case ScanFormula.AltCodeSubFieldId.Long: return ZenithProtocolCommon.Symbol.AlternateKey.Long;
                case ScanFormula.AltCodeSubFieldId.Uid: return ZenithProtocolCommon.Symbol.AlternateKey.Uid;
                default:
                    throw new UnreachableCaseError('ZSCCACSFFI16179', value);
            }
        }
    }

    namespace AttributeSubField {
        export function toId(value: ZenithProtocolCommon.Symbol.KnownAttributeKey): ScanFormula.AttributeSubFieldId {
            const fieldId = tryDecodeId(value);
            if (fieldId === undefined) {
                throw new AssertInternalError('ZSCCATSFTI16179', value);
            } else {
                return fieldId;
            }
        }

        export function tryDecodeId(value: ZenithProtocolCommon.Symbol.KnownAttributeKey): ScanFormula.AttributeSubFieldId | undefined {
            switch (value) {
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Category: return ScanFormula.AttributeSubFieldId.Category;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Class: return ScanFormula.AttributeSubFieldId.Class;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Delivery: return ScanFormula.AttributeSubFieldId.Delivery;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Sector: return ScanFormula.AttributeSubFieldId.Sector;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.Short: return ScanFormula.AttributeSubFieldId.Short;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.ShortSuspended: return ScanFormula.AttributeSubFieldId.ShortSuspended;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.SubSector: return ScanFormula.AttributeSubFieldId.SubSector;
                case ZenithProtocolCommon.Symbol.KnownAttributeKey.MaxRss: return ScanFormula.AttributeSubFieldId.MaxRss;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function encodeId(value: ScanFormula.AttributeSubFieldId): ZenithProtocolCommon.Symbol.KnownAttributeKey {
            switch (value) {
                case ScanFormula.AttributeSubFieldId.Category: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Category;
                case ScanFormula.AttributeSubFieldId.Class: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Class;
                case ScanFormula.AttributeSubFieldId.Delivery: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Delivery;
                case ScanFormula.AttributeSubFieldId.Sector: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Sector;
                case ScanFormula.AttributeSubFieldId.Short: return ZenithProtocolCommon.Symbol.KnownAttributeKey.Short;
                case ScanFormula.AttributeSubFieldId.ShortSuspended: return ZenithProtocolCommon.Symbol.KnownAttributeKey.ShortSuspended;
                case ScanFormula.AttributeSubFieldId.SubSector: return ZenithProtocolCommon.Symbol.KnownAttributeKey.SubSector;
                case ScanFormula.AttributeSubFieldId.MaxRss: return ZenithProtocolCommon.Symbol.KnownAttributeKey.MaxRss;
                default:
                    throw new UnreachableCaseError('ZSCCATSFFI16179', value);
            }
        }
    }

    namespace DateValue {
        export function encodeDate(value: Date): ZenithEncodedScanFormula.DateString {
            return ZenithConvert.Date.DateTimeIso8601.fromDate(value);
        }

        export function tryDecodeDate(value: ZenithEncodedScanFormula.DateString): SourceTzOffsetDateTime | undefined {
            return ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(value);
        }
    }

    namespace TextContainsAs {
        export function encodeId(value: ScanFormula.TextContainsAsId): ZenithEncodedScanFormula.TextContainsAsEnum {
            switch (value) {
                case ScanFormula.TextContainsAsId.None: return ZenithEncodedScanFormula.TextContainsAsEnum.None;
                case ScanFormula.TextContainsAsId.FromStart: return ZenithEncodedScanFormula.TextContainsAsEnum.FromStart;
                case ScanFormula.TextContainsAsId.FromEnd: return ZenithEncodedScanFormula.TextContainsAsEnum.FromEnd;
                case ScanFormula.TextContainsAsId.Exact: return ZenithEncodedScanFormula.TextContainsAsEnum.Exact;
                default:
                    throw new UnreachableCaseError('ZSCCTCAFI51423', value);
            }
        }

        export function tryDecodeId(value: ZenithEncodedScanFormula.TextContainsAsEnum): ScanFormula.TextContainsAsId | undefined {
            switch (value) {
                case ZenithEncodedScanFormula.TextContainsAsEnum.None: return ScanFormula.TextContainsAsId.None;
                case ZenithEncodedScanFormula.TextContainsAsEnum.FromStart: return ScanFormula.TextContainsAsId.FromStart;
                case ZenithEncodedScanFormula.TextContainsAsEnum.FromEnd: return ScanFormula.TextContainsAsId.FromEnd;
                case ZenithEncodedScanFormula.TextContainsAsEnum.Exact: return ScanFormula.TextContainsAsId.Exact;
                default:
                    return undefined;
            }
        }
    }

    function createDecodeErrorResult<T>(errorId: ErrorId, extraErrorText: string | undefined): Err<T, DecodeError> {
        const decodeError: DecodeError = {
            errorId,
            extraErrorText
        };
        return new Err(decodeError);
    }

    export const enum ErrorId {
        InvalidJson, // Set externally
        BooleanTupleNodeIsNotAnArray,
        BooleanTupleNodeArrayIsZeroLength,
        BooleanTupleNodeTypeIsNotString,
        LogicalBooleanMissingOperands,
        LogicalBooleanMissingOperand,
        NumericComparisonDoesNotHave2Operands,
        NumericParameterIsNotNumberOrComparableFieldOrArray,
        UnexpectedBooleanParamType,
        UnknownFieldBooleanParam,
        SubFieldIsNotString,
        PriceSubFieldHasValueSubFieldIsUnknown,
        DateSubFieldHasValueSubFieldIsUnknown,
        AltCodeSubFieldHasValueSubFieldIsUnknown,
        AttributeSubFieldHasValueSubFieldIsUnknown,
        TargetIsNotNumber,
        RangeMinIsDefinedButNotNumber,
        RangeMaxIsDefinedButNotNumber,
        RangeMinAndMaxAreBothUndefined,
        DateFieldEqualsTargetIsNotString,
        TextFieldContainsValueIsNotString,
        TextFieldContainsAsIsNotString,
        TextFieldContainsAsHasInvalidFormat,
        TextFieldContainsAsIsNotBoolean,
        BooleanFieldEqualsTargetIsNotBoolean,
        PriceSubFieldEqualsSubFieldIsUnknown,
        DateSubFieldEqualsSubFieldIsUnknown,
        DateSubFieldEqualsTargetIsNotString,
        AltCodeSubFieldContainsSubFieldIsUnknown,
        AttributeSubFieldContainsSubFieldIsUnknown,
        TargetHasInvalidDateFormat,
        RangeMinIsDefinedButNotString,
        RangeMinHasInvalidDateFormat,
        RangeMaxIsDefinedButNotString,
        RangeMaxHasInvalidDateFormat,
        NamedParametersCannotBeNull,
        FirstParameterCannotBeObjectOrNull,
        SecondParameterCannotBeObjectOrNull,
        BooleanFieldCanOnlyHaveOneParameter,
        OnlySubFieldOrTextFieldNodesCanHave3Parameters,
        OnlySubFieldNodeCanHave4Parameters,
        OnlyTextSubFieldContainsNodeCanHave4Parameters,
        FieldBooleanNodeHasTooManyParameters,
        NumericTupleNodeIsZeroLength,
        NumericTupleNodeTypeIsNotString,
        NumericTupleNodeRequires2Or3Parameters,
        UnaryArithmeticNumericTupleNodeRequires2Parameters,
        LeftRightArithmeticNumericTupleNodeRequires3Parameters,
        UnknownBooleanTupleNodeType,
        UnknownNumericTupleNodeType,
        UnknownNumericField,
        IfTupleNodeRequiresAtLeast4Parameters,
        IfTupleNodeRequiresAnEvenNumberOfParameters,
    }

    export namespace Error {
        export type Id = ErrorId;

        interface Info {
            readonly id: Id;
            readonly summaryId: StringId;
        }

        type InfosObject = { [id in keyof typeof ErrorId]: Info };
        const infosObject: InfosObject = {
            InvalidJson: {
                id: ErrorId.InvalidJson,
                summaryId: StringId.ScanFormulaZenithEncodingError_InvalidJson,
            },
            BooleanTupleNodeIsNotAnArray: {
                id: ErrorId.BooleanTupleNodeIsNotAnArray,
                summaryId: StringId.ScanFormulaZenithEncodingError_BooleanTupleNodeIsNotAnArray,
            },
            BooleanTupleNodeArrayIsZeroLength: {
                id: ErrorId.BooleanTupleNodeArrayIsZeroLength,
                summaryId: StringId.ScanFormulaZenithEncodingError_BooleanTupleNodeArrayIsZeroLength
            },
            BooleanTupleNodeTypeIsNotString: {
                id: ErrorId.BooleanTupleNodeTypeIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_BooleanTupleNodeTypeIsNotString
            },
            LogicalBooleanMissingOperands: {
                id: ErrorId.LogicalBooleanMissingOperands,
                summaryId: StringId.ScanFormulaZenithEncodingError_LogicalBooleanMissingOperands
            },
            LogicalBooleanMissingOperand: {
                id: ErrorId.LogicalBooleanMissingOperand,
                summaryId: StringId.ScanFormulaZenithEncodingError_LogicalBooleanMissingOperand
            },
            NumericComparisonDoesNotHave2Operands: {
                id: ErrorId.NumericComparisonDoesNotHave2Operands,
                summaryId: StringId.ScanFormulaZenithEncodingError_NumericComparisonDoesNotHave2Operands
            },
            NumericParameterIsNotNumberOrComparableFieldOrArray: {
                id: ErrorId.NumericParameterIsNotNumberOrComparableFieldOrArray,
                summaryId: StringId.ScanFormulaZenithEncodingError_NumericParameterIsNotNumberOrComparableFieldOrArray
            },
            UnexpectedBooleanParamType: {
                id: ErrorId.UnexpectedBooleanParamType,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnexpectedBooleanParamType
            },
            UnknownFieldBooleanParam: {
                id: ErrorId.UnknownFieldBooleanParam,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnknownFieldBooleanParam
            },
            SubFieldIsNotString: {
                id: ErrorId.SubFieldIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_SubFieldIsNotString
            },
            PriceSubFieldHasValueSubFieldIsUnknown: {
                id: ErrorId.PriceSubFieldHasValueSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_PriceSubFieldHasValueSubFieldIsUnknown
            },
            DateSubFieldHasValueSubFieldIsUnknown: {
                id: ErrorId.DateSubFieldHasValueSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_DateSubFieldHasValueSubFieldIsUnknown
            },
            AltCodeSubFieldHasValueSubFieldIsUnknown: {
                id: ErrorId.AltCodeSubFieldHasValueSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_AltCodeSubFieldHasValueSubFieldIsUnknown
            },
            AttributeSubFieldHasValueSubFieldIsUnknown: {
                id: ErrorId.AttributeSubFieldHasValueSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_AttributeSubFieldHasValueSubFieldIsUnknown
            },
            TargetIsNotNumber: {
                id: ErrorId.TargetIsNotNumber,
                summaryId: StringId.ScanFormulaZenithEncodingError_TargetIsNotNumber
            },
            RangeMinIsDefinedButNotNumber: {
                id: ErrorId.RangeMinIsDefinedButNotNumber,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeMinIsDefinedButNotNumber
            },
            RangeMaxIsDefinedButNotNumber: {
                id: ErrorId.RangeMaxIsDefinedButNotNumber,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeMaxIsDefinedButNotNumber
            },
            RangeMinAndMaxAreBothUndefined: {
                id: ErrorId.RangeMinAndMaxAreBothUndefined,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeMinAndMaxAreBothUndefined
            },
            DateFieldEqualsTargetIsNotString: {
                id: ErrorId.DateFieldEqualsTargetIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_DateFieldEqualsTargetIsNotString
            },
            TextFieldContainsValueIsNotString: {
                id: ErrorId.TextFieldContainsValueIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextFieldContainsValueIsNotString
            },
            TextFieldContainsAsIsNotString: {
                id: ErrorId.TextFieldContainsAsIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextFieldContainsAsIsNotString
            },
            TextFieldContainsAsHasInvalidFormat: {
                id: ErrorId.TextFieldContainsAsHasInvalidFormat,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextFieldContainsAsHasInvalidFormat
            },
            TextFieldContainsAsIsNotBoolean: {
                id: ErrorId.TextFieldContainsAsIsNotBoolean,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextFieldContainsAsIsNotBoolean
            },
            BooleanFieldEqualsTargetIsNotBoolean: {
                id: ErrorId.BooleanFieldEqualsTargetIsNotBoolean,
                summaryId: StringId.ScanFormulaZenithEncodingError_BooleanFieldEqualsTargetIsNotBoolean
            },
            PriceSubFieldEqualsSubFieldIsUnknown: {
                id: ErrorId.PriceSubFieldEqualsSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_PriceSubFieldEqualsSubFieldIsUnknown
            },
            DateSubFieldEqualsSubFieldIsUnknown: {
                id: ErrorId.DateSubFieldEqualsSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_DateSubFieldEqualsSubFieldIsUnknown
            },
            DateSubFieldEqualsTargetIsNotString: {
                id: ErrorId.DateSubFieldEqualsTargetIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_DateSubFieldEqualsTargetIsNotString
            },
            AltCodeSubFieldContainsSubFieldIsUnknown: {
                id: ErrorId.AltCodeSubFieldContainsSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_AltCodeSubFieldContainsSubFieldIsUnknown
            },
            AttributeSubFieldContainsSubFieldIsUnknown: {
                id: ErrorId.AttributeSubFieldContainsSubFieldIsUnknown,
                summaryId: StringId.ScanFormulaZenithEncodingError_AttributeSubFieldContainsSubFieldIsUnknown
            },
            TargetHasInvalidDateFormat: {
                id: ErrorId.TargetHasInvalidDateFormat,
                summaryId: StringId.ScanFormulaZenithEncodingError_TargetHasInvalidDateFormat
            },
            RangeMinIsDefinedButNotString: {
                id: ErrorId.RangeMinIsDefinedButNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeMinIsDefinedButNotString
            },
            RangeMinHasInvalidDateFormat: {
                id: ErrorId.RangeMinHasInvalidDateFormat,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeMinHasInvalidDateFormat
            },
            RangeMaxIsDefinedButNotString: {
                id: ErrorId.RangeMaxIsDefinedButNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeMaxIsDefinedButNotString
            },
            RangeMaxHasInvalidDateFormat: {
                id: ErrorId.RangeMaxHasInvalidDateFormat,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeMaxHasInvalidDateFormat
            },
            NamedParametersCannotBeNull: {
                id: ErrorId.NamedParametersCannotBeNull,
                summaryId: StringId.ScanFormulaZenithEncodingError_NamedParametersCannotBeNull
            },
            FirstParameterCannotBeObjectOrNull: {
                id: ErrorId.FirstParameterCannotBeObjectOrNull,
                summaryId: StringId.ScanFormulaZenithEncodingError_FirstParameterCannotBeObjectOrNull
            },
            SecondParameterCannotBeObjectOrNull: {
                id: ErrorId.SecondParameterCannotBeObjectOrNull,
                summaryId: StringId.ScanFormulaZenithEncodingError_SecondParameterCannotBeObjectOrNull
            },
            BooleanFieldCanOnlyHaveOneParameter: {
                id: ErrorId.BooleanFieldCanOnlyHaveOneParameter,
                summaryId: StringId.ScanFormulaZenithEncodingError_BooleanFieldCanOnlyHaveOneParameter
            },
            OnlySubFieldOrTextFieldNodesCanHave3Parameters: {
                id: ErrorId.OnlySubFieldOrTextFieldNodesCanHave3Parameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_OnlySubFieldOrTextFieldNodesCanHave3Parameters
            },
            OnlySubFieldNodeCanHave4Parameters: {
                id: ErrorId.OnlySubFieldNodeCanHave4Parameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_OnlySubFieldNodeCanHave4Parameters
            },
            OnlyTextSubFieldContainsNodeCanHave4Parameters: {
                id: ErrorId.OnlyTextSubFieldContainsNodeCanHave4Parameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_OnlyTextSubFieldContainsNodeCanHave4Parameters
            },
            FieldBooleanNodeHasTooManyParameters: {
                id: ErrorId.FieldBooleanNodeHasTooManyParameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_FieldBooleanNodeHasTooManyParameters
            },
            NumericTupleNodeIsZeroLength: {
                id: ErrorId.NumericTupleNodeIsZeroLength,
                summaryId: StringId.ScanFormulaZenithEncodingError_NumericTupleNodeIsZeroLength
            },
            NumericTupleNodeTypeIsNotString: {
                id: ErrorId.NumericTupleNodeTypeIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_NumericTupleNodeTypeIsNotString
            },
            NumericTupleNodeRequires2Or3Parameters: {
                id: ErrorId.NumericTupleNodeRequires2Or3Parameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_NumericTupleNodeRequires2Or3Parameters
            },
            UnaryArithmeticNumericTupleNodeRequires2Parameters: {
                id: ErrorId.UnaryArithmeticNumericTupleNodeRequires2Parameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnaryArithmeticNumericTupleNodeRequires2Parameters
            },
            LeftRightArithmeticNumericTupleNodeRequires3Parameters: {
                id: ErrorId.LeftRightArithmeticNumericTupleNodeRequires3Parameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_LeftRightArithmeticNumericTupleNodeRequires3Parameters
            },
            UnknownBooleanTupleNodeType: {
                id: ErrorId.UnknownBooleanTupleNodeType,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnknownBooleanTupleNodeType
            },
            UnknownNumericTupleNodeType: {
                id: ErrorId.UnknownNumericTupleNodeType,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnknownNumericTupleNodeType
            },
            UnknownNumericField: {
                id: ErrorId.UnknownNumericField,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnknownNumericField
            },
            IfTupleNodeRequiresAtLeast4Parameters: {
                id: ErrorId.IfTupleNodeRequiresAtLeast4Parameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_IfTupleNodeRequiresAtLeast4Parameters
            },
            IfTupleNodeRequiresAnEvenNumberOfParameters: {
                id: ErrorId.IfTupleNodeRequiresAnEvenNumberOfParameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_IfTupleNodeRequiresAnEvenNumberOfParameters
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id as Id) {
                    throw new EnumInfoOutOfOrderError('ScanFormulaZenithEncoding.Error', id, Strings[infos[id].summaryId]);
                }
            }
        }

        export function idToSummaryId(id: Id) {
            return infos[id].summaryId;
        }

        export function idToSummary(id: Id) {
            return Strings[idToSummaryId(id)];
        }
    }
}

export namespace ScanFormulaZenithEncodingModule {
    export function initialiseStatic() {
        ScanFormulaZenithEncoding.Error.initialise();
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Currency, CurrencyId, ExchangeId, MarketBoardId, MarketId, ZenithConvert, ZenithEncodedScanFormula, ZenithProtocolCommon } from '../../adi/adi-internal-api';
import { StringId, Strings } from '../../res/res-internal-api';
import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    Err,
    ErrorCodeWithExtra,
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

    export function tryDecodeBoolean(node: ZenithEncodedScanFormula.BooleanTupleNode, strict: boolean): Result<DecodedBoolean, DecodedError> {
        const progress = new DecodeProgress();

        const tryResult = tryDecodeExpectedBooleanNode(node, strict, progress);

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

    export function encodeNumeric(node: ScanFormula.NumericNode): ZenithEncodedScanFormula.NumericTupleNode | ZenithEncodedScanFormula.NumericRangeFieldTupleNodeType {
        return encodeNumericNode(node);
    }

    export function tryDecodeNumeric(node: ZenithEncodedScanFormula.NumericTupleNode, strict: boolean): Result<DecodedNumeric, DecodedError> {
        const progress = new DecodeProgress();

        const tryResult = tryDecodeExpectedArithmeticNumericNode(node, strict, progress);

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
            case ScanFormula.NodeTypeId.Not: return encodeSingleOperandBooleanNode(ZenithEncodedScanFormula.NotTupleNodeType, node as ScanFormula.SingleOperandBooleanNode);
            case ScanFormula.NodeTypeId.Xor: return encodeLeftRightOperandBooleanNode(ZenithEncodedScanFormula.NotTupleNodeType, node as ScanFormula.LeftRightOperandBooleanNode);
            case ScanFormula.NodeTypeId.And: return encodeMultiOperandBooleanNode(ZenithEncodedScanFormula.AndTupleNodeType, node as ScanFormula.MultiOperandBooleanNode);
            case ScanFormula.NodeTypeId.Or: return encodeMultiOperandBooleanNode(ZenithEncodedScanFormula.OrTupleNodeType, node as ScanFormula.MultiOperandBooleanNode);
            case ScanFormula.NodeTypeId.NumericEquals: return encodeNumericComparisonNode(ZenithEncodedScanFormula.EqualTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericGreaterThan: return encodeNumericComparisonNode(ZenithEncodedScanFormula.GreaterThanTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericGreaterThanOrEqual: return encodeNumericComparisonNode(ZenithEncodedScanFormula.GreaterThanOrEqualTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericLessThan: return encodeNumericComparisonNode(ZenithEncodedScanFormula.LessThanTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.NumericLessThanOrEqual: return encodeNumericComparisonNode(ZenithEncodedScanFormula.LessThanOrEqualTupleNodeType, node as ScanFormula.NumericComparisonBooleanNode);
            case ScanFormula.NodeTypeId.All: return [ZenithEncodedScanFormula.AllTupleNodeType];
            case ScanFormula.NodeTypeId.None: return [ZenithEncodedScanFormula.NoneTupleNodeType];
            case ScanFormula.NodeTypeId.Is: return encodeIsNode(node as ScanFormula.IsNode);
            case ScanFormula.NodeTypeId.FieldHasValue: return encodeFieldHasValueNode(node as ScanFormula.FieldHasValueNode);
            // case ScanFormula.NodeTypeId.BooleanFieldEquals: return encodeBooleanFieldEqualsNode(node as ScanFormula.BooleanFieldEqualsNode);
            case ScanFormula.NodeTypeId.NumericFieldEquals: return encodeNumericFieldEqualsNode(node as ScanFormula.NumericFieldEqualsNode);
            case ScanFormula.NodeTypeId.NumericFieldInRange: return encodeNumericFieldInRangeNode(node as ScanFormula.NumericFieldInRangeNode);
            case ScanFormula.NodeTypeId.DateFieldEquals: return encodeDateFieldEqualsNode(node as ScanFormula.DateFieldEqualsNode);
            case ScanFormula.NodeTypeId.DateFieldInRange: return encodeDateFieldInRangeNode(node as ScanFormula.DateFieldInRangeNode);
            case ScanFormula.NodeTypeId.StringFieldOverlaps: return encodeStringFieldOverlapsNode(node as ScanFormula.StringFieldOverlapsNode);
            case ScanFormula.NodeTypeId.CurrencyFieldOverlaps: return encodeCurrencyFieldOverlapsNode(node as ScanFormula.CurrencyFieldOverlapsNode);
            case ScanFormula.NodeTypeId.ExchangeFieldOverlaps: return encodeExchangeFieldOverlapsNode(node as ScanFormula.ExchangeFieldOverlapsNode);
            case ScanFormula.NodeTypeId.MarketFieldOverlaps: return encodeMarketFieldOverlapsNode(node as ScanFormula.MarketFieldOverlapsNode);
            case ScanFormula.NodeTypeId.MarketBoardFieldOverlaps: return encodeMarketBoardFieldOverlapsNode(node as ScanFormula.MarketBoardFieldOverlapsNode);
            case ScanFormula.NodeTypeId.TextFieldEquals: return encodeTextFieldEqualsNode(node as ScanFormula.TextFieldEqualsNode);
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

    function encodeLeftRightOperandBooleanNode(type: typeof ZenithEncodedScanFormula.NotTupleNodeType, node: ScanFormula.LeftRightOperandBooleanNode): ZenithEncodedScanFormula.LogicalTupleNode {
        const leftParam = encodeBooleanNode(node.leftOperand);
        const rightParam = encodeBooleanNode(node.rightOperand);
        return [type, leftParam, rightParam];
    }

    function encodeNumericNode(node: ScanFormula.NumericNode): ZenithEncodedScanFormula.NumericTupleNode | ZenithEncodedScanFormula.NumericRangeFieldTupleNodeType {
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
        const rightOperand = encodeNumericOperand(node.rightOperand);
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

    function encodeNumericFieldValueGetNode(node: ScanFormula.NumericFieldValueGetNode): ZenithEncodedScanFormula.NumericRangeFieldTupleNodeType {
        return Field.numericRangeFromId(node.fieldId);
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

    function encodeIsNode(node: ScanFormula.IsNode): ZenithEncodedScanFormula.BooleanSingleMatchingTupleNode {
        const tupleNodeType = Is.Category.idToTupleNodeType(node.categoryId);
        return [tupleNodeType, node.trueFalse]
    }

    // function encodeBooleanFieldEqualsNode(node: ScanFormula.BooleanFieldEqualsNode): ZenithEncodedScanFormula.BooleanSingleMatchingTupleNode {
    //     const field = Field.booleanFromId(node.fieldId);
    //     const target = node.target;
    //     return [field, target];
    // }

    function encodeFieldHasValueNode(node: ScanFormula.FieldHasValueNode):
            ZenithEncodedScanFormula.NumericRangeMatchingTupleNode |
            ZenithEncodedScanFormula.DateRangeMatchingTupleNode |
            ZenithEncodedScanFormula.TextMatchingTupleNode |
            ZenithEncodedScanFormula.MultipleMatchingTupleNode {

        const fieldId = node.fieldId;
        const fieldDataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        switch (fieldDataTypeId) {
            case ScanFormula.Field.DataTypeId.Numeric: return [Field.numericRangeFromId(fieldId as ScanFormula.NumericRangeFieldId)];
            case ScanFormula.Field.DataTypeId.Text: return [Field.textTextFromId(fieldId as ScanFormula.TextContainsFieldId)];
            case ScanFormula.Field.DataTypeId.Date: return [Field.dateRangeFromId(fieldId as ScanFormula.DateRangeFieldId)];
            case ScanFormula.Field.DataTypeId.Boolean: throw new AssertInternalError('ZSCCFFHVNB50916', `${fieldId}`); // No boolean field supports HasValue
            default:
                throw new UnreachableCaseError('ZSCCFFHVND50916', fieldDataTypeId);
        }
    }

    function encodeNumericFieldEqualsNode(node: ScanFormula.NumericFieldEqualsNode): ZenithEncodedScanFormula.NumericRangeMatchingTupleNode {
        const field = Field.numericRangeFromId(node.fieldId);
        const target = node.value;
        return [field, target];
    }

    function encodeNumericFieldInRangeNode(node: ScanFormula.NumericFieldInRangeNode): ZenithEncodedScanFormula.NumericRangeMatchingTupleNode {
        const field = Field.numericRangeFromId(node.fieldId);
        const namedParameters: ZenithEncodedScanFormula.NumericNamedParameters = {
            Min: node.min,
            Max: node.max,
        }
        return [field, namedParameters];
    }

    function encodeDateFieldEqualsNode(node: ScanFormula.DateFieldEqualsNode): ZenithEncodedScanFormula.DateRangeMatchingTupleNode {
        const field = Field.dateRangeFromId(node.fieldId);
        const target = DateValue.encodeDate(node.value.utcDate);
        return [field, target];
    }

    function encodeDateFieldInRangeNode(node: ScanFormula.DateFieldInRangeNode): ZenithEncodedScanFormula.DateRangeMatchingTupleNode {
        const field = Field.dateRangeFromId(node.fieldId);
        const nodeMin = node.min;
        const nodeMax = node.max;
        const namedParameters: ZenithEncodedScanFormula.DateNamedParameters = {
            Min: nodeMin === undefined ? undefined: DateValue.encodeDate(nodeMin.utcDate),
            Max: nodeMax === undefined ? undefined: DateValue.encodeDate(nodeMax.utcDate),
        }
        return [field, namedParameters];
    }

    function encodeStringFieldOverlapsNode(node: ScanFormula.StringFieldOverlapsNode): ZenithEncodedScanFormula.MultipleMatchingTupleNode {
        const field = Field.textOverlapFromId(node.fieldId);
        const values = node.values;
        return [field, ...values];
    }

    function encodeCurrencyFieldOverlapsNode(node: ScanFormula.CurrencyFieldOverlapsNode): ZenithEncodedScanFormula.MultipleMatchingTupleNode {
        const field = Field.textOverlapFromId(node.fieldId);
        const ids = node.values;
        const count = ids.length;
        const values = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const id = ids[i];
            const value = ZenithConvert.Currency.fromId(id);
            values[i] = value;
        }
        return [field, ...values];
    }

    function encodeExchangeFieldOverlapsNode(node: ScanFormula.ExchangeFieldOverlapsNode): ZenithEncodedScanFormula.MultipleMatchingTupleNode {
        const field = Field.textOverlapFromId(node.fieldId);
        const ids = node.values;
        const count = ids.length;
        const values = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const id = ids[i];
            const value = ZenithConvert.EnvironmentedExchange.fromId(id);
            values[i] = value;
        }
        return [field, ...values];
    }

    function encodeMarketFieldOverlapsNode(node: ScanFormula.MarketFieldOverlapsNode): ZenithEncodedScanFormula.MultipleMatchingTupleNode {
        const field = Field.textOverlapFromId(node.fieldId);
        const ids = node.values;
        const count = ids.length;
        const values = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const id = ids[i];
            const value = ZenithConvert.EnvironmentedMarket.fromId(id);
            values[i] = value;
        }
        return [field, ...values];
    }

    function encodeMarketBoardFieldOverlapsNode(node: ScanFormula.MarketBoardFieldOverlapsNode): ZenithEncodedScanFormula.MultipleMatchingTupleNode {
        const field = Field.textOverlapFromId(node.fieldId);
        const ids = node.values;
        const count = ids.length;
        const values = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const id = ids[i];
            const value = ZenithConvert.EnvironmentedMarketBoard.fromId(id);
            values[i] = value;
        }
        return [field, ...values];
    }

    function encodeTextFieldEqualsNode(node: ScanFormula.TextFieldEqualsNode): ZenithEncodedScanFormula.TextSingleMatchingTupleNode {
        const field = Field.textSingleFromId(node.fieldId);
        const value = node.value;
        return [field, value];
    }

    function encodeTextFieldContainsNode(node: ScanFormula.TextFieldContainsNode): ZenithEncodedScanFormula.TextMatchingTupleNode {
        const field = Field.textTextFromId(node.fieldId);
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
        const target = node.value;
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
        const target = DateValue.encodeDate(node.value.utcDate);
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

    function tryDecodeExpectedBooleanNode(node: ZenithEncodedScanFormula.BooleanTupleNode, strict: boolean, toProgress: DecodeProgress): Result<ScanFormula.BooleanNode, DecodeError> {
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

                    const result = tryDecodeBooleanNode(node, strict, toProgress)

                    if (result.isOk()) {
                        toProgress.exitTupleNode(decodedNode, result.value.typeId);
                    }

                    return result;
                }
            }
        }
    }

    function tryDecodeBooleanNode(tupleNode: ZenithEncodedScanFormula.BooleanTupleNode, strict: boolean, toProgress: DecodeProgress): Result<ScanFormula.BooleanNode, DecodeError> {
        const nodeType = tupleNode[0] as ZenithEncodedScanFormula.BooleanTupleNodeType;

        switch (nodeType) {
            // Logical
            case ZenithEncodedScanFormula.NotTupleNodeType: return tryDecodeSingleOperandLogicalBooleanNode(tupleNode as ZenithEncodedScanFormula.LogicalTupleNode, ScanFormula.NotNode, strict, toProgress);
            case ZenithEncodedScanFormula.XorTupleNodeType: return tryDecodeLeftRightOperandLogicalBooleanNode(tupleNode as ZenithEncodedScanFormula.LogicalTupleNode, ScanFormula.XorNode, strict, toProgress);
            case ZenithEncodedScanFormula.AndTupleNodeType: return tryDecodeMultiOperandLogicalBooleanNode(tupleNode as ZenithEncodedScanFormula.LogicalTupleNode, ScanFormula.AndNode, strict, toProgress);
            case ZenithEncodedScanFormula.OrTupleNodeType: return tryDecodeMultiOperandLogicalBooleanNode(tupleNode as ZenithEncodedScanFormula.LogicalTupleNode, ScanFormula.OrNode, strict, toProgress);

            // Comparison
            case ZenithEncodedScanFormula.EqualTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericEqualsNode, strict, toProgress);
            case ZenithEncodedScanFormula.GreaterThanTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericGreaterThanNode, strict, toProgress);
            case ZenithEncodedScanFormula.GreaterThanOrEqualTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericGreaterThanOrEqualNode, strict, toProgress);
            case ZenithEncodedScanFormula.LessThanTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericLessThanNode, strict, toProgress);
            case ZenithEncodedScanFormula.LessThanOrEqualTupleNodeType: return tryDecodeNumericComparisonNode(tupleNode as ZenithEncodedScanFormula.ComparisonTupleNode, ScanFormula.NumericLessThanOrEqualNode, strict, toProgress);
            case ZenithEncodedScanFormula.AllTupleNodeType: return new Ok(new ScanFormula.AllNode());
            case ZenithEncodedScanFormula.NoneTupleNodeType: return new Ok(new ScanFormula.NoneNode());

            // Matching
            case ZenithEncodedScanFormula.AltCodeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.AltCodeSubbed, strict);
            case ZenithEncodedScanFormula.AttributeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.AttributeSubbed, strict);
            case ZenithEncodedScanFormula.AuctionTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Auction, strict);
            case ZenithEncodedScanFormula.AuctionLastTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Auction, strict);
            case ZenithEncodedScanFormula.AuctionQuantityTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.AuctionQuantity, strict);
            case ZenithEncodedScanFormula.BestAskCountTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestAskCount, strict);
            case ZenithEncodedScanFormula.BestAskPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestAskPrice, strict);
            case ZenithEncodedScanFormula.BestAskQuantityTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestAskQuantity, strict);
            case ZenithEncodedScanFormula.BestBidCountTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestBidCount, strict);
            case ZenithEncodedScanFormula.BestBidPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestBidPrice, strict);
            case ZenithEncodedScanFormula.BestBidQuantityTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.BestBidQuantity, strict);
            case ZenithEncodedScanFormula.BoardTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.MarketBoard, strict);
            case ZenithEncodedScanFormula.CallOrPutTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.CallOrPut, strict);
            case ZenithEncodedScanFormula.CategoryTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Category, strict);
            case ZenithEncodedScanFormula.CfiTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Cfi, strict);
            case ZenithEncodedScanFormula.ClassTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Class, strict);
            case ZenithEncodedScanFormula.ClosePriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ClosePrice, strict);
            case ZenithEncodedScanFormula.CodeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Code, strict);
            case ZenithEncodedScanFormula.ContractSizeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ContractSize, strict);
            case ZenithEncodedScanFormula.CurrencyTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Currency, strict);
            case ZenithEncodedScanFormula.DataTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Data, strict);
            case ZenithEncodedScanFormula.DateTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.DateSubbed, strict);
            case ZenithEncodedScanFormula.ExerciseTypeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ExerciseType, strict);
            case ZenithEncodedScanFormula.ExchangeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Exchange, strict);
            case ZenithEncodedScanFormula.ExpiryDateTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ExpiryDate, strict);
            case ZenithEncodedScanFormula.HighPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.HighPrice, strict);
            case ZenithEncodedScanFormula.IsIndexTupleNodeType: return tryDecodeIsBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.IsNode.CategoryId.Index);
            case ZenithEncodedScanFormula.LegTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Leg, strict);
            case ZenithEncodedScanFormula.LastPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.LastPrice, strict);
            case ZenithEncodedScanFormula.LotSizeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.LotSize, strict);
            case ZenithEncodedScanFormula.LowPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.LowPrice, strict);
            case ZenithEncodedScanFormula.MarketTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Market, strict);
            case ZenithEncodedScanFormula.NameTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Name, strict);
            case ZenithEncodedScanFormula.OpenInterestTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.OpenInterest, strict);
            case ZenithEncodedScanFormula.OpenPriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.OpenPrice, strict);
            case ZenithEncodedScanFormula.PriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.PriceSubbed, strict);
            case ZenithEncodedScanFormula.PreviousCloseTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.PreviousClose, strict);
            case ZenithEncodedScanFormula.QuotationBasisTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.QuotationBasis, strict);
            case ZenithEncodedScanFormula.RemainderTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Remainder, strict);
            case ZenithEncodedScanFormula.ShareIssueTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ShareIssue, strict);
            case ZenithEncodedScanFormula.StateTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.TradingStateName, strict);
            case ZenithEncodedScanFormula.StateAllowsTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.TradingStateAllows, strict);
            case ZenithEncodedScanFormula.StatusNoteTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.StatusNote, strict);
            case ZenithEncodedScanFormula.StrikePriceTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.StrikePrice, strict);
            case ZenithEncodedScanFormula.TradesTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Trades, strict);
            case ZenithEncodedScanFormula.TradingMarketTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.TradingMarket, strict);
            case ZenithEncodedScanFormula.ValueTradedTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.ValueTraded, strict);
            case ZenithEncodedScanFormula.VolumeTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Volume, strict);
            case ZenithEncodedScanFormula.VwapTupleNodeType: return tryDecodeFieldBooleanNode(tupleNode as ZenithEncodedScanFormula.MatchingTupleNode, ScanFormula.FieldId.Vwap, strict);

            default: {
                const neverTupleNodeType: never = nodeType;
                return createDecodeErrorResult(ErrorId.UnknownBooleanTupleNodeType, `${neverTupleNodeType as string}`);
            }
        }
    }

    function tryDecodeSingleOperandLogicalBooleanNode(
        tulipNode: ZenithEncodedScanFormula.LogicalTupleNode,
        nodeConstructor: new() => ScanFormula.SingleOperandBooleanNode,
        strict: boolean,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.SingleOperandBooleanNode, DecodeError> {
        if (tulipNode.length !== 2) {
            return createDecodeErrorResult(ErrorId.SingleOperandLogicalBooleanDoesNotHaveOneOperand, tulipNode[0]);
        } else {
            const tupleNodeResult = tryDecodeExpectedBooleanOperand(tulipNode[1], strict, toProgress);
            if (tupleNodeResult.isErr()) {
                return tupleNodeResult.createType();
            } else {
                const resultNode = new nodeConstructor();
                resultNode.operand = tupleNodeResult.value;
                return new Ok(resultNode);
            }
        }
    }

    function tryDecodeLeftRightOperandLogicalBooleanNode(
        tulipNode: ZenithEncodedScanFormula.LogicalTupleNode,
        nodeConstructor: new() => ScanFormula.LeftRightOperandBooleanNode,
        strict: boolean,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.LeftRightOperandBooleanNode, DecodeError> {
        const tulipNodeLength = tulipNode.length;
        if (tulipNodeLength !== 3) {
            return createDecodeErrorResult(ErrorId.LeftRightOperandLogicalBooleanDoesNotHaveTwoOperands, tulipNode[0]);
        } else {
            const leftOperandResult = tryDecodeExpectedBooleanOperand(tulipNode[1], strict, toProgress);
            if (leftOperandResult.isErr()) {
                return leftOperandResult.createType();
            } else {
                const leftOperand = leftOperandResult.value;
                const rightOperandResult = tryDecodeExpectedBooleanOperand(tulipNode[2], strict, toProgress);
                if (rightOperandResult.isErr()) {
                    return rightOperandResult.createType();
                } else {
                    const rightOperand = rightOperandResult.value;
                    const resultNode = new nodeConstructor();
                    resultNode.leftOperand = leftOperand;
                    resultNode.rightOperand = rightOperand;
                    return new Ok(resultNode);
                }
            }
        }
    }

    function tryDecodeMultiOperandLogicalBooleanNode(
        tulipNode: ZenithEncodedScanFormula.LogicalTupleNode,
        nodeConstructor: new() => ScanFormula.MultiOperandBooleanNode,
        strict: boolean,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.MultiOperandBooleanNode, DecodeError> {
        const tulipNodeLength = tulipNode.length;
        if (tulipNodeLength < 2) {
            return createDecodeErrorResult(ErrorId.MultiOperandLogicalBooleanMissingOperands, tulipNode[0]);
        } else {
            const operands = new Array<ScanFormula.BooleanNode>(tulipNodeLength - 1);
            for (let i = 1; i < tulipNodeLength; i++) {
                const tulipParam = tulipNode[i] as ZenithEncodedScanFormula.BooleanParam; // Need to cast as (skipped) first element in array is LogicalTupleNodeType
                const operandResult = tryDecodeExpectedBooleanOperand(tulipParam, strict, toProgress);
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

    function tryDecodeExpectedBooleanOperand(
        param: ZenithEncodedScanFormula.BooleanParam,
        strict: boolean,
        toProgress: DecodeProgress
    ): Result<ScanFormula.BooleanNode, DecodeError> {
        if (Array.isArray(param)) {
            return tryDecodeExpectedBooleanNode(param, strict, toProgress);
        } else {
            if (typeof param !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.UnexpectedBooleanParamType, `${param}`);
            } else {
                const fieldId = Field.tryToId(param as ZenithEncodedScanFormula.FieldTupleNodeType);
                if (fieldId !== undefined) {
                    if (ScanFormula.Field.idIsSubbed(fieldId)) {
                        return createDecodeErrorResult(ErrorId.FieldBooleanParamCannotBeSubbedField, `${param}`);
                    } else {
                        const styleId = ScanFormula.Field.idToStyleId(fieldId);
                        switch (styleId) {
                            case ScanFormula.Field.StyleId.InRange: return new Ok(createFieldHasValueNode(fieldId as ScanFormula.NumericRangeFieldId));
                            case ScanFormula.Field.StyleId.HasValueEquals: return new Ok(createFieldHasValueNode(fieldId as ScanFormula.TextHasValueEqualsFieldId));
                            case ScanFormula.Field.StyleId.Overlaps:
                            case ScanFormula.Field.StyleId.Equals:
                            case ScanFormula.Field.StyleId.Contains:
                                return createDecodeErrorResult(ErrorId.FieldBooleanParamMustBeRangeOrExistsSingle, `${param}`);
                            default:
                                throw new UnreachableCaseError('SFZETDEBOSU44498', styleId);
                        }
                    }
                } else {
                    const categoryId = Is.Category.tryTupleNodeTypeToId(param as ZenithEncodedScanFormula.BooleanSingleFieldTupleNodeType);
                    if (categoryId !== undefined) {
                        return new Ok(createIsNode(categoryId, undefined));
                    } else {
                        return createDecodeErrorResult(ErrorId.UnknownFieldBooleanParam, `${param}`);
                    }
                }
            }
        }
    }

    // function tryDecodeFieldBooleanNode(value: ZenithScanCriteria.MatchingField): Result<ScanCriteria.FieldBooleanNode, ZenithScanCriteriaParseError> {
    //     switch (value) {

    //     }
    // }

    function tryDecodeIsBooleanNode(
        node: ZenithEncodedScanFormula.MatchingTupleNode,
        categoryId: ScanFormula.IsNode.CategoryId,
    ): Result<ScanFormula.IsNode, DecodeError> {
        const paramCount = node.length - 1;
        switch (paramCount) {
            case 0: {
                return new Ok(createIsNode(categoryId, undefined));
            }
            case 1: {
                const param = node[1];
                if (typeof param === 'boolean') {
                    return new Ok(createIsNode(categoryId, param));
                } else {
                    return createDecodeErrorResult(ErrorId.IsBooleanTupleNodeParameterIsNotBoolean, typeof param);
                }
            }
            default:
                return createDecodeErrorResult(ErrorId.IsBooleanTupleNodeHasTooManyParameters, paramCount.toString());
            }
    }

    function tryDecodeFieldBooleanNode(
        node: ZenithEncodedScanFormula.MatchingTupleNode,
        fieldId: ScanFormula.FieldId,
        strict: boolean,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const styleId = ScanFormula.Field.idToStyleId(fieldId);

        switch (styleId) {
            case ScanFormula.Field.StyleId.InRange: {
                return tryDecodeRangeMatchingTupleNode(node as ZenithEncodedScanFormula.RangeMatchingTupleNode, fieldId);
            }
            case ScanFormula.Field.StyleId.Overlaps: {
                return tryDecodeMultipleMatchingTupleNode(node as ZenithEncodedScanFormula.MultipleMatchingTupleNode, fieldId, strict);
            }
            case ScanFormula.Field.StyleId.Equals: {
                return tryDecodeEqualsSingleMatchingTupleNode(node, fieldId);
            }
            case ScanFormula.Field.StyleId.HasValueEquals: {
                return tryDecodeExistsSingleMatchingTupleNode(node, fieldId);
            }
            case ScanFormula.Field.StyleId.Contains: {
                return tryDecodeTextMatchingTupleNode(node as ZenithEncodedScanFormula.TextMatchingTupleNode, fieldId);
            }
            default:
                throw new UnreachableCaseError('SFZETDFBN40971', styleId);
        }
    }

    function tryDecodeRangeMatchingTupleNode(
        node: ZenithEncodedScanFormula.RangeMatchingTupleNode,
        fieldId: ScanFormula.FieldId,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const subbed = ScanFormula.Field.idIsSubbed(fieldId);
        const nodeCount = node.length;

        let paramCount: Integer;
        let firstParamIndex: Integer;
        if (!subbed) {
            paramCount = nodeCount - 1;
            firstParamIndex = 1;
        } else {
            paramCount = nodeCount - 2;
            firstParamIndex = 2;
            if (paramCount < 0) {
                return createDecodeErrorResult(ErrorId.RangeSubFieldIsMissing, paramCount.toString());
            }
        }

        switch (paramCount) {
            case 0: {
                if (subbed) {
                    return tryDecodeSubbedFieldHasValueNode(fieldId, node[1]);
                } else {
                    return new Ok(createFieldHasValueNode(fieldId as ScanFormula.NumericRangeFieldId));
                }
            }
            case 1: {
                const param1 = node[firstParamIndex];
                const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
                switch (dataTypeId) {
                    case ScanFormula.Field.DataTypeId.Numeric: {
                        const param1Type = typeof param1;
                        switch (param1Type) {
                            case 'number': {
                                if (!subbed) {
                                    return tryDecodeNumericFieldEqualsNode(fieldId as ScanFormula.NumericRangeFieldId, param1);
                                } else {
                                    return tryDecodeNumericRangeSubbedFieldEqualsNode(fieldId as ScanFormula.NumericRangeSubbedFieldId, node[1], param1);
                                }
                            }
                            case 'object': {
                                if (param1 === null) {
                                    return createDecodeErrorResult(ErrorId.NamedParametersCannotBeNull, '');
                                } else {
                                    const { At: at, Min: min, Max: max } = param1 as ZenithEncodedScanFormula.NumericNamedParameters
                                    if (at !== undefined) {
                                        if (!subbed) {
                                            return tryDecodeNumericFieldEqualsNode(fieldId as ScanFormula.NumericRangeFieldId, at);
                                        } else {
                                            return tryDecodeNumericRangeSubbedFieldEqualsNode(fieldId as ScanFormula.NumericRangeSubbedFieldId, node[1], at);
                                        }
                                    } else {
                                        if (!subbed) {
                                            return tryDecodeNumericFieldInRangeNode(fieldId as ScanFormula.NumericRangeFieldId, min, max);
                                        } else {
                                            return tryDecodeNumericSubbedFieldInRangeNode(fieldId as ScanFormula.NumericRangeSubbedFieldId, node[1], min, max);
                                        }
                                    }
                                }
                            }
                            default:
                                return createDecodeErrorResult(ErrorId.NumericRangeFirstParameterMustBeNumberOrNamed, param1Type);
                        }
                    }
                    case ScanFormula.Field.DataTypeId.Date: {
                        const param1Type = typeof param1;
                        switch (param1Type) {
                            case 'string': {
                                if (!subbed) {
                                    return tryDecodeDateFieldEqualsNode(fieldId as ScanFormula.DateRangeFieldId, param1);
                                } else {
                                    return tryDecodeDateRangeSubbedFieldEqualsNode(fieldId as ScanFormula.DateRangeSubbedFieldId, node[1], param1);
                                }
                            }
                            case 'object': {
                                if (param1 === null) {
                                    return createDecodeErrorResult(ErrorId.NamedParametersCannotBeNull, '');
                                } else {
                                    const { At: at, Min: min, Max: max } = param1 as ZenithEncodedScanFormula.NumericNamedParameters
                                    if (at !== undefined) {
                                        if (!subbed) {
                                            return tryDecodeDateFieldEqualsNode(fieldId as ScanFormula.DateRangeFieldId, at);
                                        } else {
                                            return tryDecodeDateRangeSubbedFieldEqualsNode(fieldId as ScanFormula.DateRangeSubbedFieldId, node[1], at);
                                        }
                                    } else {
                                        if (!subbed) {
                                            return tryDecodeDateFieldInRangeNode(fieldId as ScanFormula.DateRangeFieldId, min, max);
                                        } else {
                                            return tryDecodeDateSubbedFieldInRangeNode(fieldId as ScanFormula.DateRangeSubbedFieldId, node[1], min, max);
                                        }
                                    }
                                }
                            }
                            default:
                                return createDecodeErrorResult(ErrorId.DateRangeFirstParameterMustBeStringOrNamed, param1Type);
                        }
                    }
                    case ScanFormula.Field.DataTypeId.Text:
                    case ScanFormula.Field.DataTypeId.Boolean:
                        throw new AssertInternalError('SFZETDRMTN1U55098', dataTypeId.toString());
                    default:
                        throw new UnreachableCaseError('SFZETDRMTN1D55098', dataTypeId);
                }
            }
            case 2: {
                const param1 = node[firstParamIndex];
                const param2 = node[firstParamIndex + 1];
                const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
                switch (dataTypeId) {
                    case ScanFormula.Field.DataTypeId.Numeric: {
                        if (!subbed) {
                            return tryDecodeNumericFieldInRangeNode(fieldId as ScanFormula.NumericRangeFieldId, param1, param2);
                        } else {
                            return tryDecodeNumericSubbedFieldInRangeNode(fieldId as ScanFormula.NumericRangeSubbedFieldId, node[1], param1, param2);
                        }
                    }
                    case ScanFormula.Field.DataTypeId.Date:
                        if (!subbed) {
                            return tryDecodeDateFieldInRangeNode(fieldId as ScanFormula.DateRangeFieldId, param1, param2);
                        } else {
                            return tryDecodeDateSubbedFieldInRangeNode(fieldId as ScanFormula.DateRangeSubbedFieldId, node[1], param1, param2);
                        }
                    case ScanFormula.Field.DataTypeId.Text:
                    case ScanFormula.Field.DataTypeId.Boolean:
                        throw new AssertInternalError('SFZETDRMTN2U55098', dataTypeId.toString());
                    default:
                        throw new UnreachableCaseError('SFZETDRMTN2D55098', dataTypeId);
                }
            }
            default:
                return createDecodeErrorResult(ErrorId.RangeFieldBooleanTupleNodeHasTooManyParameters, paramCount.toString());
        }
    }

    function tryDecodeTextMatchingTupleNode(
        node: ZenithEncodedScanFormula.MatchingTupleNode,
        fieldId: ScanFormula.FieldId,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const subbed = ScanFormula.Field.idIsSubbed(fieldId);
        const nodeCount = node.length;

        let paramCount: Integer;
        let firstParamIndex: Integer;
        if (!subbed) {
            paramCount = nodeCount - 1;
            firstParamIndex = 1;
        } else {
            paramCount = nodeCount - 2;
            firstParamIndex = 2;
            if (paramCount < 0) {
                return createDecodeErrorResult(ErrorId.TextSubFieldIsMissing, paramCount.toString());
            }
        }

        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
            throw new AssertInternalError('SFZETDTMTN1U55098', dataTypeId.toString());
        } else {
            switch (paramCount) {
                case 0: {
                    if (subbed) {
                        return tryDecodeSubbedFieldHasValueNode(fieldId, node[1]);
                    } else {
                        return createDecodeErrorResult(ErrorId.TextFieldMustHaveAtLeastOneParameter, '');
                    }
                }
                case 1: {
                    const param1 = node[firstParamIndex];
                    if (!subbed) {
                        return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextContainsFieldId, param1, undefined, undefined);
                    } else {
                        return tryDecodeTextSubbedFieldContainsNode(fieldId as ScanFormula.TextContainsSubbedFieldId, node[1], param1, undefined, undefined);
                    }
                }
                case 2: {
                    const param1 = node[firstParamIndex];
                    const param2 = node[firstParamIndex + 1];
                    const param2Type = typeof param2;
                    switch (param2Type) {
                        case 'string': {
                            if (!subbed) {
                                return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextContainsFieldId, param1, param2, undefined);
                            } else {
                                return tryDecodeTextSubbedFieldContainsNode(fieldId as ScanFormula.TextContainsSubbedFieldId, node[1], param1, param2, undefined);
                            }
                        }
                        case 'object': {
                            if (param1 === null) {
                                return createDecodeErrorResult(ErrorId.NamedParametersCannotBeNull, '');
                            } else {
                                const { As: as, IgnoreCase: ignoreCase } = param1 as ZenithEncodedScanFormula.TextNamedParameters
                                if (!subbed) {
                                    return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextContainsFieldId, param1, as, ignoreCase);
                                } else {
                                    return tryDecodeTextSubbedFieldContainsNode(fieldId as ScanFormula.TextContainsSubbedFieldId, node[1], param1, as, ignoreCase);
                                }
                            }
                        }
                        default:
                            return createDecodeErrorResult(ErrorId.TextRangeSecondParameterMustBeStringOrNamed, param2Type);
                    }
                }
                case 3: {
                    const param1 = node[firstParamIndex];
                    const param2 = node[firstParamIndex + 1];
                    const param3 = node[firstParamIndex + 2];

                    if (!subbed) {
                        return tryDecodeTextFieldContainsNode(fieldId as ScanFormula.TextContainsFieldId, param1, param2, param3);
                    } else {
                        return tryDecodeTextSubbedFieldContainsNode(fieldId as ScanFormula.TextContainsSubbedFieldId, node[1], param1, param2, param3);
                    }
                }
                default:
                    return createDecodeErrorResult(ErrorId.TextFieldBooleanTupleNodeHasTooManyParameters, paramCount.toString());
            }
        }
    }

    function tryDecodeEqualsSingleMatchingTupleNode(
        node: ZenithEncodedScanFormula.MatchingTupleNode,
        fieldId: ScanFormula.FieldId,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const paramCount = node.length - 1;
        if (paramCount !== 1) {
            return createDecodeErrorResult(ErrorId.SingleFieldMustHaveOneParameter, paramCount.toString());
        } else {
            const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
            if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
                throw new AssertInternalError('SFZETDSMTN43087', dataTypeId.toString());
            } else {
                return tryDecodeTextEqualsSingleMatchingTupleNode(fieldId as ScanFormula.TextEqualsFieldId, node[1]);
            }
        }
    }

    function tryDecodeExistsSingleMatchingTupleNode(
        node: ZenithEncodedScanFormula.MatchingTupleNode,
        fieldId: ScanFormula.FieldId,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const paramCount = node.length - 1;
        switch (paramCount) {
            case 0: return new Ok(createFieldHasValueNode(fieldId as ScanFormula.TextHasValueEqualsFieldId));
            case 1: return tryDecodeEqualsSingleMatchingTupleNode(node, fieldId);
            default:
                return createDecodeErrorResult(ErrorId.ExistsSingleFieldMustNotHaveMoreThan1Parameter, paramCount.toString());
        }
    }

    function tryDecodeTextEqualsSingleMatchingTupleNode(
        fieldId: ScanFormula.TextEqualsFieldId,
        param: unknown,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        if (typeof param !== 'string') {
            return createDecodeErrorResult(ErrorId.SingleFieldParameterIsNotString, typeof param);
        } else {
            const node = new ScanFormula.TextFieldEqualsNode();
            node.fieldId = fieldId;
            node.value = param;
            return new Ok(node);
        }
    }

    function tryDecodeMultipleMatchingTupleNode(
        node: ZenithEncodedScanFormula.MultipleMatchingTupleNode,
        fieldId: ScanFormula.FieldId,
        strict: boolean,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const dataTypeId = ScanFormula.Field.idToDataTypeId(fieldId);
        if (node.length <= 1) {
            return createDecodeErrorResult(ErrorId.MultipleMatchingTupleNodeMissingParameters, node[0]);
        } else {
            if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
                throw new AssertInternalError('SFZETDFBN20987', dataTypeId.toString());
            } else {
                const params: unknown[] = node.slice(1);
                return tryDecodeTextMultipleMatchingTupleNode(fieldId as ScanFormula.TextOverlapFieldId, params, strict);
            }
        }
    }

    function tryDecodeTextMultipleMatchingTupleNode(
        fieldId: ScanFormula.TextOverlapFieldId,
        params: unknown[],
        strict: boolean,
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        const count = params.length;
        const values = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const param = params[i];
            if (typeof param !== 'string') {
                return createDecodeErrorResult(ErrorId.TextMultipleMatchingTupleNodeParameterIsNotString, i.toString());
            } else {
                values[i] = param;
            }
        }

        switch (fieldId) {
            case ScanFormula.FieldId.MarketBoard: return tryDecodeBoardMultipleMatchingTupleNode(fieldId, values, strict)
            case ScanFormula.FieldId.Category: return tryDecodeStringMultipleMatchingTupleNode(fieldId, values);
            case ScanFormula.FieldId.Currency: return tryDecodeCurrencyMultipleMatchingTupleNode(fieldId, values, strict);
            case ScanFormula.FieldId.Exchange: return tryDecodeExchangeMultipleMatchingTupleNode(fieldId, values, strict);
            case ScanFormula.FieldId.Market: return tryDecodeMarketMultipleMatchingTupleNode(fieldId, values, strict);
            case ScanFormula.FieldId.QuotationBasis: return tryDecodeStringMultipleMatchingTupleNode(fieldId, values);
            case ScanFormula.FieldId.TradingStateName: return tryDecodeStringMultipleMatchingTupleNode(fieldId, values);
            case ScanFormula.FieldId.StatusNote: return tryDecodeStringMultipleMatchingTupleNode(fieldId, values);
            case ScanFormula.FieldId.TradingMarket: return tryDecodeMarketMultipleMatchingTupleNode(fieldId, values, strict);
            default:
                throw new UnreachableCaseError('SFZETDTMMTN49843', fieldId);
        }
    }

    function tryDecodeBoardMultipleMatchingTupleNode(fieldId: ScanFormula.TextOverlapFieldId, stringValues: string[], strict: boolean): Result<ScanFormula.MarketBoardFieldOverlapsNode, DecodeError> {
        const count = stringValues.length;
        const values = new Array<MarketBoardId>(count);
        let valueCount = 0;
        for (let i = 0; i < count; i++) {
            const stringValue = stringValues[i];
            const marketBoardIdResult = ZenithConvert.EnvironmentedMarketBoard.tryToId(stringValue, false);
            if (marketBoardIdResult.isErr()) {
                if (strict) {
                    return createDecodeErrorResultFromErrorCodeWithExtra(marketBoardIdResult.error);
                }
            } else {
                const environmentedMarketBoardId = marketBoardIdResult.value;
                values[valueCount++] = environmentedMarketBoardId.marketBoardId;
            }
        }
        values.length = valueCount;

        const node = new ScanFormula.MarketBoardFieldOverlapsNode();
        node.fieldId = fieldId;
        node.values = values;
        return new Ok(node);
    }

    function tryDecodeCurrencyMultipleMatchingTupleNode(fieldId: ScanFormula.TextOverlapFieldId, stringValues: string[], strict: boolean): Result<ScanFormula.CurrencyFieldOverlapsNode, DecodeError> {
        const count = stringValues.length;
        const values = new Array<CurrencyId>(count);
        let valueCount = 0;
        for (let i = 0; i < count; i++) {
            const stringValue = stringValues[i];
            const currencyId = Currency.tryDisplayToId(stringValue);
            if (currencyId === undefined) {
                if (strict) {
                    return createDecodeErrorResult(ErrorId.UnknownCurrency, stringValue);
                }
            } else {
                values[valueCount++] = currencyId;
            }
        }
        values.length = valueCount;

        const node = new ScanFormula.CurrencyFieldOverlapsNode();
        node.fieldId = fieldId;
        node.values = values;
        return new Ok(node);
    }

    function tryDecodeExchangeMultipleMatchingTupleNode(fieldId: ScanFormula.TextOverlapFieldId, stringValues: string[], strict: boolean): Result<ScanFormula.ExchangeFieldOverlapsNode, DecodeError> {
        const count = stringValues.length;
        const values = new Array<ExchangeId>(count);
        let valueCount = 0;
        for (let i = 0; i < count; i++) {
            const stringValue = stringValues[i];
            const exchangeIdResult = ZenithConvert.EnvironmentedExchange.tryToId(stringValue, false);
            if (exchangeIdResult.isErr()) {
                if (strict) {
                    return createDecodeErrorResultFromErrorCodeWithExtra(exchangeIdResult.error);
                }
            } else {
                const environmentedExchangeId = exchangeIdResult.value;
                values[valueCount++] = environmentedExchangeId.exchangeId;
            }
        }
        values.length = valueCount;

        const node = new ScanFormula.ExchangeFieldOverlapsNode();
        node.fieldId = fieldId;
        node.values = values;
        return new Ok(node);
    }

    function tryDecodeMarketMultipleMatchingTupleNode(fieldId: ScanFormula.TextOverlapFieldId, stringValues: string[], strict: boolean): Result<ScanFormula.MarketFieldOverlapsNode, DecodeError> {
        const count = stringValues.length;
        const values = new Array<MarketId>(count);
        let valueCount = 0;
        for (let i = 0; i < count; i++) {
            const stringValue = stringValues[i];
            const marketIdResult = ZenithConvert.EnvironmentedMarket.tryToId(stringValue, false);
            if (marketIdResult.isErr()) {
                if (strict) {
                    return createDecodeErrorResultFromErrorCodeWithExtra(marketIdResult.error);
                }
            } else {
                const environmentedMarketId = marketIdResult.value;
                values[valueCount++] = environmentedMarketId.marketId;
            }
        }
        values.length = valueCount;

        const node = new ScanFormula.MarketFieldOverlapsNode();
        node.fieldId = fieldId;
        node.values = values;
        return new Ok(node);
    }

    function tryDecodeStringMultipleMatchingTupleNode(fieldId: ScanFormula.TextOverlapFieldId, stringValues: string[]): Result<ScanFormula.StringFieldOverlapsNode, DecodeError> {
        const node = new ScanFormula.StringFieldOverlapsNode();
        node.fieldId = fieldId;
        node.values = stringValues.slice();
        return new Ok(node);
    }

    function createIsNode(categoryId: ScanFormula.IsNode.CategoryId, trueFalse: boolean | undefined): ScanFormula.IsNode {
        const isNode = new ScanFormula.IsNode(categoryId);
        if (trueFalse !== undefined) {
            isNode.trueFalse = trueFalse;
        } else {
            isNode.trueFalse = Is.Category.idToDefaultTrueFalse(categoryId);
        }
        return isNode;
    }

    function createFieldHasValueNode(fieldId: ScanFormula.TextHasValueEqualsFieldId | ScanFormula.NumericRangeFieldId | ScanFormula.DateRangeFieldId): ScanFormula.FieldHasValueNode {
        const hasValueNode = new ScanFormula.FieldHasValueNode();
        hasValueNode.fieldId = fieldId;
        return hasValueNode;
    }

    function tryDecodeSubbedFieldHasValueNode(fieldId: ScanFormula.SubbedFieldId, subField: unknown):
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
                case ScanFormula.FieldId.PriceSubbed: {
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
                case ScanFormula.FieldId.DateSubbed: {
                    const subFieldId = DateSubField.tryDecodeId(subField as ZenithEncodedScanFormula.DateSubFieldEnum);
                    if (subFieldId === undefined) {
                        return createDecodeErrorResult(ErrorId.DateSubFieldHasValueSubFieldIsUnknown, `${subField}`);
                    } else {
                        const node = new ScanFormula.DateSubFieldHasValueNode();
                        node.fieldId = fieldId;
                        node.subFieldId = subFieldId;
                        return new Ok(node);
                    }
                }
                case ScanFormula.FieldId.AltCodeSubbed: {
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
                case ScanFormula.FieldId.AttributeSubbed: {
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

    function tryDecodeNumericFieldEqualsNode(fieldId: ScanFormula.NumericRangeFieldId, target: unknown): Result<ScanFormula.NumericFieldEqualsNode, DecodeError> {
        if (typeof target !== 'number') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.TargetIsNotNumber, `${target}`);
        } else {
            const node = new ScanFormula.NumericFieldEqualsNode();
            node.fieldId = fieldId;
            node.value = target;
            return new Ok(node);
        }
    }

    function tryDecodeNumericFieldInRangeNode(fieldId: ScanFormula.NumericRangeFieldId, min: unknown, max: unknown): Result<ScanFormula.NumericFieldInRangeNode, DecodeError> {
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

    function tryDecodeDateFieldEqualsNode(fieldId: ScanFormula.DateRangeFieldId, targetAsString: unknown): Result<ScanFormula.DateFieldEqualsNode, DecodeError> {
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
                node.value = target;
                return new Ok(node);
            }
        }
    }

    function tryDecodeDateFieldInRangeNode(fieldId: ScanFormula.DateRangeFieldId, min: unknown, max: unknown): Result<ScanFormula.DateFieldInRangeNode, DecodeError> {
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

    function tryDecodeTextFieldContainsNode(fieldId: ScanFormula.TextContainsFieldId, value: unknown, as: unknown, ignoreCase: unknown):
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

    // function tryDecodeBooleanFieldEqualsNode(fieldId: ScanFormula.BooleanFieldId, param1: unknown): Result<ScanFormula.BooleanFieldEqualsNode, DecodeError> {
    //     if (typeof param1 !== 'boolean') {
    //         // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    //         return createDecodeErrorResult(ErrorId.BooleanFieldEqualsTargetIsNotBoolean, `${param1}`);
    //     } else {
    //         const node = new ScanFormula.BooleanFieldEqualsNode();
    //         node.fieldId = fieldId;
    //         node.target = param1;
    //         return new Ok(node);
    //     }
    // }

    function tryDecodeNumericRangeSubbedFieldEqualsNode(
        fieldId: ScanFormula.NumericRangeSubbedFieldId,
        subField: unknown,
        param2: unknown
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            if (typeof param2 !== 'number') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.TargetIsNotNumber, `${param2}`);
            } else {
                switch (fieldId) {
                    case ScanFormula.FieldId.PriceSubbed: return tryDecodePriceSubFieldEqualsNode(subField, param2);
                    default:
                        throw new UnreachableCaseError('ZSTDNRSFEN10008', fieldId);
                }
            }
        }
    }

    function tryDecodeDateRangeSubbedFieldEqualsNode(
        fieldId: ScanFormula.DateRangeSubbedFieldId,
        subField: unknown,
        param2: unknown
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            if (typeof param2 !== 'string') {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.DateSubFieldEqualsTargetIsNotString, `${param2}`);
            } else {
                const targetAsDate = DateValue.tryDecodeDate(param2);
                if (targetAsDate === undefined) {
                    return createDecodeErrorResult(ErrorId.TargetHasInvalidDateFormat, `${param2}`);
                } else {
                    switch (fieldId) {
                        case ScanFormula.FieldId.DateSubbed: return tryDecodeDateSubFieldEqualsNode(subField, targetAsDate);
                        default:
                            throw new UnreachableCaseError('ZSCCTTSFEOCN10008', fieldId);
                    }
                }
            }
        }
    }


    function tryDecodeTextSubbedFieldContainsNode(
        fieldId: ScanFormula.TextContainsSubbedFieldId,
        subField: unknown,
        value: unknown,
        as: unknown,
        ignoreCase: unknown
    ): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
        } else {
            const propertiesResult = TextFieldContainsProperties.resolveFromUnknown(value, as, ignoreCase);
            if (propertiesResult.isErr()) {
                return propertiesResult.createType();
            } else {
                const properties = propertiesResult.value;
                switch (fieldId) {
                    case ScanFormula.FieldId.AltCodeSubbed: return tryDecodeAltCodeSubFieldContains(subField, properties.value, properties.asId, properties.ignoreCase);
                    case ScanFormula.FieldId.AttributeSubbed: return tryDecodeAttributeSubFieldContains(subField, properties.value, properties.asId, properties.ignoreCase);
                    default:
                        throw new UnreachableCaseError('ZSCCTTTSFCN10008', fieldId);
                }
            }
        }
    }

    function tryDecodePriceSubFieldEqualsNode(subField: string, target: number): Result<ScanFormula.PriceSubFieldEqualsNode, DecodeError> {
        const subFieldId = PriceSubField.tryDecodeId(subField as ZenithEncodedScanFormula.PriceSubFieldEnum);
        if (subFieldId === undefined) {
            return createDecodeErrorResult(ErrorId.PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`);
        } else {
            const node = new ScanFormula.PriceSubFieldEqualsNode();
            node.fieldId = ScanFormula.FieldId.PriceSubbed;
            node.subFieldId = subFieldId;
            node.value = target;
            return new Ok(node);
        }
    }

    function tryDecodeNumericSubbedFieldInRangeNode(fieldId: ScanFormula.NumericRangeSubbedFieldId, subField: unknown, min: unknown, max: unknown): Result<ScanFormula.FieldBooleanNode, DecodeError> {
        if (typeof subField !== 'string') {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.SubFieldIsNotString, `${subField}`);
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
                        switch (fieldId) {
                            case ScanFormula.FieldId.PriceSubbed: return tryDecodePriceSubFieldInRangeNode(subField, min, max);
                            default:
                                throw new UnreachableCaseError('SFZETDNSFIRN43210', fieldId);
                        }
                    }
                }
            }
        }
    }

    function tryDecodePriceSubFieldInRangeNode(subField: string, min: number | undefined, max: number | undefined): Result<ScanFormula.PriceSubFieldInRangeNode, DecodeError> {
        const subFieldId = PriceSubField.tryDecodeId(subField as ZenithEncodedScanFormula.PriceSubFieldEnum);
        if (subFieldId === undefined) {
            return createDecodeErrorResult(ErrorId.PriceSubFieldEqualsSubFieldIsUnknown, `${subField}`);
        } else {
            const node = new ScanFormula.PriceSubFieldInRangeNode();
            node.fieldId = ScanFormula.FieldId.PriceSubbed;
            node.subFieldId = subFieldId;
            node.min = min;
            node.max = max;
            return new Ok(node);
        }
    }

    function tryDecodeDateSubFieldEqualsNode(subField: string, target: SourceTzOffsetDateTime): Result<ScanFormula.DateSubFieldEqualsNode, DecodeError> {
        const subFieldId = DateSubField.tryDecodeId(subField as ZenithEncodedScanFormula.DateSubFieldEnum);
        if (subFieldId === undefined) {
            return createDecodeErrorResult(ErrorId.DateSubFieldEqualsSubFieldIsUnknown, `${subField}`);
        } else {
            const node = new ScanFormula.DateSubFieldEqualsNode();
            node.fieldId = ScanFormula.FieldId.DateSubbed;
            node.subFieldId = subFieldId;
            node.value = target;
            return new Ok(node);
        }
    }

    function tryDecodeDateSubbedFieldInRangeNode(
        fieldId: ScanFormula.DateRangeSubbedFieldId,
        subField: unknown,
        min: unknown,
        max: unknown
    ): Result<ScanFormula.DateSubFieldInRangeNode, DecodeError> {
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
                switch (fieldId) {
                    case ScanFormula.FieldId.DateSubbed: return tryDecodeDateSubFieldInRangeNode(subField, minDate, maxDate);
                    default:
                        throw new UnreachableCaseError('SFZETDNSFIRN43210', fieldId);
                }
            }
        }
    }

    function tryDecodeDateSubFieldInRangeNode(
        subField: string,
        min: SourceTzOffsetDateTime | undefined,
        max: SourceTzOffsetDateTime | undefined
    ): Result<ScanFormula.DateSubFieldInRangeNode, DecodeError> {
        const subFieldId = DateSubField.tryDecodeId(subField as ZenithEncodedScanFormula.DateSubFieldEnum);
        if (subFieldId === undefined) {
            return createDecodeErrorResult(ErrorId.DateSubFieldEqualsSubFieldIsUnknown, `${subField}`);
        } else {
            const node = new ScanFormula.DateSubFieldInRangeNode();
            node.fieldId = ScanFormula.FieldId.DateSubbed;
            node.subFieldId = subFieldId;
            node.min = min;
            node.max = max;
            return new Ok(node);
        }
    }

    function tryDecodeAltCodeSubFieldContains(subField: string, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<ScanFormula.AltCodeSubFieldContainsNode, DecodeError> {
        const subFieldId = AltCodeSubField.tryDecodeId(subField as ZenithEncodedScanFormula.AltCodeSubField);
        if (subFieldId === undefined) {
            return createDecodeErrorResult(ErrorId.AltCodeSubFieldContainsSubFieldIsUnknown, `${subField}`);
        } else {
            const node = new ScanFormula.AltCodeSubFieldContainsNode();
            node.fieldId = ScanFormula.FieldId.AltCodeSubbed;
            node.subFieldId = subFieldId;
            node.value = value;
            node.asId = asId;
            node.ignoreCase = ignoreCase;
            return new Ok(node);
        }
    }

    function tryDecodeAttributeSubFieldContains(subField: string, value: string, asId: ScanFormula.TextContainsAsId, ignoreCase: boolean): Result<ScanFormula.AttributeSubFieldContainsNode, DecodeError> {
        const subFieldId = AttributeSubField.tryDecodeId(subField as ZenithEncodedScanFormula.AttributeSubField);
        if (subFieldId === undefined) {
            return createDecodeErrorResult(ErrorId.AttributeSubFieldContainsSubFieldIsUnknown, `${subField}`);
        } else {
            const node = new ScanFormula.AttributeSubFieldContainsNode();
            node.fieldId = ScanFormula.FieldId.AttributeSubbed;
            node.subFieldId = subFieldId;
            node.value = value;
            node.asId = asId;
            node.ignoreCase = ignoreCase;
            return new Ok(node);
        }
    }

    function tryDecodeNumericComparisonNode(
        tulipNode: ZenithEncodedScanFormula.ComparisonTupleNode,
        nodeConstructor: new() => ScanFormula.NumericComparisonBooleanNode,
        strict: boolean,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.NumericComparisonBooleanNode, DecodeError> {
        const nodeType = tulipNode[0];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (tulipNode.length !== 3) {
            return createDecodeErrorResult(ErrorId.NumericComparisonDoesNotHave2Operands, nodeType);
        } else {
            const leftParam = tulipNode[1] as ZenithEncodedScanFormula.NumericParam;
            const leftOperandResult = tryDecodeExpectedNumericOperand(leftParam, `${nodeType}/${Strings[StringId.Left]}`, strict, toProgress);
            if (leftOperandResult.isErr()) {
                return leftOperandResult.createType();
            } else {
                const rightParam = tulipNode[2] as ZenithEncodedScanFormula.NumericParam;
                const rightOperandResult = tryDecodeExpectedNumericOperand(rightParam, `${nodeType}/${Strings[StringId.Right]}`, strict, toProgress);
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
        strict: boolean,
        toProgress: DecodeProgress,
    ): Result<ScanFormula.NumericNode | number, DecodeError> {
        if (typeof numericParam === 'number') {
            return new Ok(numericParam);
        } else {
            if (typeof numericParam === 'string') {
                return tryDecodeNumericFieldValueGet(numericParam as ZenithEncodedScanFormula.FieldTupleNodeType);
            } else {
                if (Array.isArray(numericParam)) {
                    return tryDecodeExpectedArithmeticNumericNode(numericParam as ZenithEncodedScanFormula.NumericTupleNode, strict, toProgress);
                } else {
                    return createDecodeErrorResult(ErrorId.NumericParameterIsNotNumberOrComparableFieldOrArray, `${paramId}`);
                }
            }
        }
    }

    function tryDecodeExpectedArithmeticNumericNode(
        numericTupleNode: ZenithEncodedScanFormula.NumericTupleNode,
        strict: boolean,
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

                const result = tryDecodeNumericNode(numericTupleNode, strict, toProgress)

                if (result.isOk()) {
                    toProgress.exitTupleNode(decodedNode, result.value.typeId);
                }

                return result;
            }
        }
    }

    function tryDecodeNumericNode(
        numericTupleNode: ZenithEncodedScanFormula.NumericTupleNode,
        strict: boolean,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const tupleNodetype = numericTupleNode[0] as ZenithEncodedScanFormula.ExpressionTupleNodeType;
        switch (tupleNodetype) {
            // Binary
            case ZenithEncodedScanFormula.AddTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericAddNode, strict, toProgress);
            case ZenithEncodedScanFormula.DivSymbolTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericDivNode, strict, toProgress);
            case ZenithEncodedScanFormula.DivTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericDivNode, strict, toProgress);
            case ZenithEncodedScanFormula.ModSymbolTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericModNode, strict, toProgress);
            case ZenithEncodedScanFormula.ModTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericModNode, strict, toProgress);
            case ZenithEncodedScanFormula.MulSymbolTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericMulNode, strict, toProgress);
            case ZenithEncodedScanFormula.MulTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericMulNode, strict, toProgress);
            case ZenithEncodedScanFormula.SubTupleNodeType:
                return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode, ScanFormula.NumericSubNode, strict, toProgress);

            // Unary
            case ZenithEncodedScanFormula.NegTupleNodeType:
                return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, ScanFormula.NumericNegNode, strict, toProgress);
            case ZenithEncodedScanFormula.PosTupleNodeType:
                return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, ScanFormula.NumericPosNode, strict, toProgress);
            case ZenithEncodedScanFormula.AbsTupleNodeType:
                return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, ScanFormula.NumericAbsNode, strict, toProgress);

            // Unary or Binary (depending on number of params)
            case ZenithEncodedScanFormula.SubOrNegSymbolTupleNodeType:
                return tryDecodeUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode | ZenithEncodedScanFormula.BinaryExpressionTupleNode,
                    ScanFormula.NumericNegNode,
                    ScanFormula.NumericSubNode,
                    strict,
                    toProgress
                );
            case ZenithEncodedScanFormula.AddOrPosSymbolTupleNodeType:
                return tryDecodeUnaryOrLeftRightArithmeticNumericNode(
                    numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode | ZenithEncodedScanFormula.BinaryExpressionTupleNode,
                    ScanFormula.NumericPosNode,
                    ScanFormula.NumericAddNode,
                    strict,
                    toProgress
                );

            case ZenithEncodedScanFormula.IfTupleNodeType:
                return tryDecodeNumericIfNode(numericTupleNode as ZenithEncodedScanFormula.IfTupleNode, strict, toProgress);

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
        strict: boolean,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const nodeLength = numericTupleNode.length;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (nodeLength !== 2) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return createDecodeErrorResult(ErrorId.UnaryArithmeticNumericTupleNodeRequires2Parameters, `${numericTupleNode}`);
        } else {
            const param = numericTupleNode[1];
            const operandResult = tryDecodeExpectedNumericOperand(param, '', strict, toProgress);
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
        strict: boolean,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const nodeLength = numericTupleNode.length;
        if (nodeLength !== 3) {
            return createDecodeErrorResult(ErrorId.LeftRightArithmeticNumericTupleNodeRequires3Parameters, nodeLength.toString());
        } else {
            const binaryExpressionTupleNode = numericTupleNode as ZenithEncodedScanFormula.BinaryExpressionTupleNode
            const leftParam = binaryExpressionTupleNode[1];
            const leftResult = tryDecodeExpectedNumericOperand(leftParam, Strings[StringId.Left], strict, toProgress);
            if (leftResult.isErr()) {
                return leftResult.createType();
            } else {
                const rightParam = binaryExpressionTupleNode[2];
                const rightResult = tryDecodeExpectedNumericOperand(rightParam, Strings[StringId.Right], strict, toProgress);
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
        strict: boolean,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericNode, DecodeError> {
        const nodeLength = numericTupleNode.length;
        switch (nodeLength) {
            case 2: return tryDecodeUnaryArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.UnaryExpressionTupleNode, unaryNodeConstructor, strict, toProgress);
            case 3: return tryDecodeLeftRightArithmeticNumericNode(numericTupleNode as ZenithEncodedScanFormula.BinaryExpressionTupleNode, leftRightNodeConstructor, strict, toProgress);
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return createDecodeErrorResult(ErrorId.NumericTupleNodeRequires2Or3Parameters, `${numericTupleNode}`);
        }
    }

    function tryDecodeNumericIfNode(
        tupleNode: ZenithEncodedScanFormula.IfTupleNode,
        strict: boolean,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericIfNode, DecodeError> {
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
                    const armResult = tryDecodeNumericIfArm(tupleNode, tupleIndex, strict, toProgress);
                    if (armResult.isErr()) {
                        return armResult.createType();
                    } else {
                        trueArms[i] = armResult.value;
                    }
                    tupleIndex += 2;
                }

                const armResult = tryDecodeNumericIfArm(tupleNode, tupleIndex, strict, toProgress);
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

    function tryDecodeNumericIfArm(
        tupleNode: ZenithEncodedScanFormula.IfTupleNode,
        tupleIndex: Integer,
        strict: boolean,
        toProgress: DecodeProgress
    ): Result<ScanFormula.NumericIfNode.Arm, DecodeError> {
        const conditionElement = tupleNode[tupleIndex++] as ZenithEncodedScanFormula.BooleanParam;
        const conditionResult = tryDecodeExpectedBooleanOperand(conditionElement, strict, toProgress);
        if (conditionResult.isErr()) {
            return conditionResult.createType();
        } else {
            const valueElement = tupleNode[tupleIndex++] as ZenithEncodedScanFormula.NumericParam;
            const valueResult = tryDecodeExpectedNumericOperand(valueElement, tupleIndex.toString(), strict, toProgress);
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

    function tryDecodeNumericFieldValueGet(field: ZenithEncodedScanFormula.FieldTupleNodeType): Result<ScanFormula.NumericFieldValueGetNode, DecodeError> {
        const fieldId = Field.tryToId(field);
        if (fieldId === undefined) {
            return createDecodeErrorResult(ErrorId.UnknownField, field);
        } else {
            if (ScanFormula.Field.idToDataTypeId(fieldId) !== ScanFormula.Field.DataTypeId.Numeric) {
                return createDecodeErrorResult(ErrorId.UnknownNumericField, field);
            } else {
                const node = new ScanFormula.NumericFieldValueGetNode();
                node.fieldId = fieldId as ScanFormula.NumericRangeFieldId;
                return new Ok(node);
            }
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
        export function tryToId(value: ZenithEncodedScanFormula.FieldTupleNodeType): ScanFormula.FieldId | undefined {
            switch (value) {
                // Numeric
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
                // Numeric Subbed
                case ZenithEncodedScanFormula.PriceTupleNodeType: return ScanFormula.FieldId.PriceSubbed;
                // Date
                case ZenithEncodedScanFormula.ExpiryDateTupleNodeType: return ScanFormula.FieldId.ExpiryDate;
                // Date Subbed
                case ZenithEncodedScanFormula.DateTupleNodeType: return ScanFormula.FieldId.DateSubbed;
                // Text
                case ZenithEncodedScanFormula.BoardTupleNodeType: return ScanFormula.FieldId.MarketBoard;
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
                case ZenithEncodedScanFormula.StateTupleNodeType: return ScanFormula.FieldId.TradingStateName;
                case ZenithEncodedScanFormula.StateAllowsTupleNodeType: return ScanFormula.FieldId.TradingStateAllows;
                case ZenithEncodedScanFormula.StatusNoteTupleNodeType: return ScanFormula.FieldId.StatusNote;
                case ZenithEncodedScanFormula.TradingMarketTupleNodeType: return ScanFormula.FieldId.TradingMarket;
                // Text Subbed
                case ZenithEncodedScanFormula.AltCodeTupleNodeType: return ScanFormula.FieldId.AltCodeSubbed;
                case ZenithEncodedScanFormula.AttributeTupleNodeType: return ScanFormula.FieldId.AttributeSubbed;
                // Boolean
                case ZenithEncodedScanFormula.IsIndexTupleNodeType: return undefined;
                default: {
                    const ignoredValue: never = value;
                    return undefined;
                }
            }
        }

        export function fromId(value: ScanFormula.FieldId): ZenithEncodedScanFormula.MatchingFieldTupleNodeType {
            const styleId = ScanFormula.Field.idToStyleId(value);
            const dataTypeId = ScanFormula.Field.idToDataTypeId(value);
            switch (styleId) {
                case ScanFormula.Field.StyleId.InRange:
                    switch (dataTypeId) {
                        case ScanFormula.Field.DataTypeId.Numeric: return numericRangeFromId(value as ScanFormula.NumericRangeFieldId);
                        case ScanFormula.Field.DataTypeId.Date: return dateRangeFromId(value as ScanFormula.DateRangeFieldId);
                        case ScanFormula.Field.DataTypeId.Text:
                        case ScanFormula.Field.DataTypeId.Boolean:
                            throw new AssertInternalError('SCZEFFIRTB69871', dataTypeId.toString());
                        default:
                            throw new UnreachableCaseError('SCZEFFIRD69871', dataTypeId);
                    }
                case ScanFormula.Field.StyleId.Overlaps: {
                    if (dataTypeId !== ScanFormula.Field.DataTypeId.Text) {
                        throw new AssertInternalError('SCZEFFIM69871', dataTypeId.toString());
                    } else {
                        return textOverlapFromId(value as ScanFormula.TextOverlapFieldId);
                    }
                }
                case ScanFormula.Field.StyleId.Equals:
                    switch (dataTypeId) {
                        case ScanFormula.Field.DataTypeId.Text: return textSingleFromId(value as ScanFormula.TextSingleFieldId);
                        case ScanFormula.Field.DataTypeId.Numeric:
                        case ScanFormula.Field.DataTypeId.Date:
                        case ScanFormula.Field.DataTypeId.Boolean:
                            throw new AssertInternalError('SCZEFFISU69871', dataTypeId.toString());
                        default:
                            throw new UnreachableCaseError('SCZEFFISD69871', dataTypeId);
                    }
                case ScanFormula.Field.StyleId.HasValueEquals:
                    throw new AssertInternalError('SFZEFFISE', 'not implemented');
                case ScanFormula.Field.StyleId.Contains:
                    switch (dataTypeId) {
                        case ScanFormula.Field.DataTypeId.Text: return textTextFromId(value as ScanFormula.TextContainsFieldId);
                        case ScanFormula.Field.DataTypeId.Numeric:
                        case ScanFormula.Field.DataTypeId.Date:
                        case ScanFormula.Field.DataTypeId.Boolean:
                            throw new AssertInternalError('SCZEFFITU69871', dataTypeId.toString());
                        default:
                            throw new UnreachableCaseError('SCZEFFITD69871', dataTypeId);
                    }
            }
        }

        export function dateRangeFromId(value: ScanFormula.DateRangeFieldId): ZenithEncodedScanFormula.DateRangeFieldTupleNodeType {
            const result = tryDateFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFDFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryDateFromId(value: ScanFormula.DateRangeFieldId): ZenithEncodedScanFormula.DateRangeFieldTupleNodeType | undefined {
            switch (value) {
                case ScanFormula.FieldId.ExpiryDate: return ZenithEncodedScanFormula.ExpiryDateTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function numericRangeFromId(value: ScanFormula.NumericRangeFieldId): ZenithEncodedScanFormula.NumericRangeFieldTupleNodeType {
            const result = tryNumericRangeFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFNFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryNumericRangeFromId(value: ScanFormula.NumericRangeFieldId): ZenithEncodedScanFormula.NumericRangeFieldTupleNodeType | undefined {
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

        export function textTextFromId(value: ScanFormula.TextContainsFieldId): ZenithEncodedScanFormula.TextTextFieldTupleNodeType {
            const result = tryTextTextFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFTTFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryTextTextFromId(value: ScanFormula.TextContainsFieldId): ZenithEncodedScanFormula.TextTextFieldTupleNodeType | undefined {
            switch (value) {
                case ScanFormula.FieldId.Code: return ZenithEncodedScanFormula.CodeTupleNodeType;
                case ScanFormula.FieldId.Name: return ZenithEncodedScanFormula.NameTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function textSingleFromId(value: ScanFormula.TextSingleFieldId): ZenithEncodedScanFormula.TextSingleFieldTupleNodeType {
            const result = tryTextSingleFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFTSFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryTextSingleFromId(value: ScanFormula.TextSingleFieldId): ZenithEncodedScanFormula.TextSingleFieldTupleNodeType | undefined {
            switch (value) {
                case ScanFormula.FieldId.CallOrPut: return ZenithEncodedScanFormula.CallOrPutTupleNodeType;
                case ScanFormula.FieldId.Cfi: return ZenithEncodedScanFormula.CfiTupleNodeType;
                case ScanFormula.FieldId.Class: return ZenithEncodedScanFormula.ClassTupleNodeType;
                case ScanFormula.FieldId.Data: return ZenithEncodedScanFormula.DataTupleNodeType;
                case ScanFormula.FieldId.ExerciseType: return ZenithEncodedScanFormula.ExerciseTypeTupleNodeType;
                case ScanFormula.FieldId.Leg: return ZenithEncodedScanFormula.LegTupleNodeType;
                case ScanFormula.FieldId.TradingStateAllows: return ZenithEncodedScanFormula.StateAllowsTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        export function textOverlapFromId(value: ScanFormula.TextOverlapFieldId): ZenithEncodedScanFormula.TextMultipleFieldTupleNodeType {
            const result = tryMultipleFromId(value);
            if (result === undefined) {
                throw new AssertInternalError('ZSCCFMFI16179', `${value}`);
            } else {
                return result;
            }
        }

        function tryMultipleFromId(value: ScanFormula.TextOverlapFieldId): ZenithEncodedScanFormula.TextMultipleFieldTupleNodeType | undefined {
            switch (value) {
                case ScanFormula.FieldId.MarketBoard: return ZenithEncodedScanFormula.BoardTupleNodeType;
                case ScanFormula.FieldId.Category: return ZenithEncodedScanFormula.CategoryTupleNodeType;
                case ScanFormula.FieldId.Currency: return ZenithEncodedScanFormula.CurrencyTupleNodeType;
                case ScanFormula.FieldId.Exchange: return ZenithEncodedScanFormula.ExchangeTupleNodeType;
                case ScanFormula.FieldId.Market: return ZenithEncodedScanFormula.MarketTupleNodeType;
                case ScanFormula.FieldId.QuotationBasis: return ZenithEncodedScanFormula.QuotationBasisTupleNodeType;
                case ScanFormula.FieldId.TradingStateName: return ZenithEncodedScanFormula.StateTupleNodeType;
                case ScanFormula.FieldId.StatusNote: return ZenithEncodedScanFormula.StatusNoteTupleNodeType;
                case ScanFormula.FieldId.TradingMarket: return ZenithEncodedScanFormula.TradingMarketTupleNodeType;
                default: {
                    const neverValueIgnored: never = value;
                    return undefined;
                }
            }
        }

        // export function tryBooleanToId(value: ZenithEncodedScanFormula.BooleanFieldTupleNodeType): ScanFormula.BooleanFieldId | undefined {
        //     switch (value) {
        //         case ZenithEncodedScanFormula.IsIndexTupleNodeType: return ScanFormula.FieldId.IsIndex;
        //         default:
        //             return undefined;
        //     }
        // }

        // export function booleanFromId(value: ScanFormula.BooleanFieldId): ZenithEncodedScanFormula.BooleanFieldTupleNodeType {
        //     const result = tryBooleanFromId(value);
        //     if (result === undefined) {
        //         throw new AssertInternalError('ZSCCFBFI16179', `${value}`);
        //     } else {
        //         return result;
        //     }
        // }

        // function tryBooleanFromId(value: ScanFormula.BooleanFieldId): ZenithEncodedScanFormula.BooleanFieldTupleNodeType | undefined {
        //     switch (value) {
        //         case ScanFormula.FieldId.IsIndex: return ZenithEncodedScanFormula.IsIndexTupleNodeType;
        //         default: {
        //             const neverValueIgnored: never = value;
        //             return undefined;
        //         }
        //     }
        // }
    }

    namespace Is {
        export namespace Category {
            export function idToDefaultTrueFalse(categoryId: ScanFormula.IsNode.CategoryId) {
                switch (categoryId) {
                    case ScanFormula.IsNode.CategoryId.Index: return ZenithEncodedScanFormula.SingleDefault_IsIndex;
                    default:
                        throw new UnreachableCaseError('SFZEICITD69312', categoryId);
                }
            }

            export function idToTupleNodeType(categoryId: ScanFormula.IsNode.CategoryId): ZenithEncodedScanFormula.BooleanSingleFieldTupleNodeType {
                switch (categoryId) {
                    case ScanFormula.IsNode.CategoryId.Index: return ZenithEncodedScanFormula.IsIndexTupleNodeType;
                    default:
                        throw new UnreachableCaseError('SFZEEIN50502', categoryId);
                }
            }

            export function tryTupleNodeTypeToId(tupleNodeType: ZenithEncodedScanFormula.BooleanSingleFieldTupleNodeType): ScanFormula.IsNode.CategoryId | undefined {
                switch (tupleNodeType) {
                    case ZenithEncodedScanFormula.IsIndexTupleNodeType: return ScanFormula.IsNode.CategoryId.Index;
                    default: {
                        const ignoredValue: never = tupleNodeType;
                        return undefined;
                    }
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

    function createDecodeErrorResultFromErrorCodeWithExtra<T>(errorCodeWithExtra: ErrorCodeWithExtra): Err<T, DecodeError> {
        const code = errorCodeWithExtra.code;
        const extra = errorCodeWithExtra.extra;
        const extraErrorText = extra === '' ? code : `${code}: ${extra}`;
        return createDecodeErrorResult<T>(ErrorId.ErrorCode, extraErrorText);
    }

    export const enum ErrorId {
        InvalidJson, // Set externally
        ErrorCode, // Too be phased out
        BooleanTupleNodeIsNotAnArray,
        BooleanTupleNodeArrayIsZeroLength,
        BooleanTupleNodeTypeIsNotString,
        UnknownField,
        SingleOperandLogicalBooleanDoesNotHaveOneOperand,
        LeftRightOperandLogicalBooleanDoesNotHaveTwoOperands,
        MultiOperandLogicalBooleanMissingOperands,
        MultipleMatchingTupleNodeMissingParameters,
        TextMultipleMatchingTupleNodeParameterIsNotString,
        NumericComparisonDoesNotHave2Operands,
        NumericParameterIsNotNumberOrComparableFieldOrArray,
        UnexpectedBooleanParamType,
        UnknownFieldBooleanParam,
        FieldBooleanParamCannotBeSubbedField,
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
        TextSubFieldIsMissing,
        TextFieldContainsValueIsNotString,
        TextFieldContainsAsIsNotString,
        TextFieldContainsAsHasInvalidFormat,
        TextFieldContainsAsIsNotBoolean,
        SingleFieldMustHaveOneParameter,
        PriceSubFieldEqualsSubFieldIsUnknown,
        DateSubFieldEqualsSubFieldIsUnknown,
        DateSubFieldEqualsTargetIsNotString,
        AltCodeSubFieldContainsSubFieldIsUnknown,
        AttributeSubFieldContainsSubFieldIsUnknown,
        TargetHasInvalidDateFormat,
        RangeSubFieldIsMissing,
        RangeMinIsDefinedButNotString,
        RangeMinHasInvalidDateFormat,
        RangeMaxIsDefinedButNotString,
        RangeMaxHasInvalidDateFormat,
        NamedParametersCannotBeNull,
        RangeFieldBooleanTupleNodeHasTooManyParameters,
        IsBooleanTupleNodeParameterIsNotBoolean,
        IsBooleanTupleNodeHasTooManyParameters,
        NumericTupleNodeIsZeroLength,
        NumericTupleNodeTypeIsNotString,
        NumericTupleNodeRequires2Or3Parameters,
        UnaryArithmeticNumericTupleNodeRequires2Parameters,
        LeftRightArithmeticNumericTupleNodeRequires3Parameters,
        UnknownBooleanTupleNodeType,
        UnknownNumericTupleNodeType,
        UnknownNumericField,
        FieldBooleanParamMustBeRangeOrExistsSingle,
        NumericRangeFirstParameterMustBeNumberOrNamed,
        DateRangeFirstParameterMustBeStringOrNamed,
        TextFieldMustHaveAtLeastOneParameter,
        TextRangeSecondParameterMustBeStringOrNamed,
        ExistsSingleFieldMustNotHaveMoreThan1Parameter,
        SingleFieldParameterIsNotString,
        TextFieldBooleanTupleNodeHasTooManyParameters,
        UnknownCurrency,
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
            ErrorCode: { // to be phased out
                id: ErrorId.ErrorCode,
                summaryId: StringId.ScanFormulaZenithEncodingError_ErrorCode,
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
            UnknownField: {
                id: ErrorId.UnknownField,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnknownField
            },
            SingleOperandLogicalBooleanDoesNotHaveOneOperand: {
                id: ErrorId.SingleOperandLogicalBooleanDoesNotHaveOneOperand,
                summaryId: StringId.ScanFormulaZenithEncodingError_SingleOperandLogicalBooleanDoesNotHaveOneOperand
            },
            LeftRightOperandLogicalBooleanDoesNotHaveTwoOperands: {
                id: ErrorId.LeftRightOperandLogicalBooleanDoesNotHaveTwoOperands,
                summaryId: StringId.ScanFormulaZenithEncodingError_LeftRightOperandLogicalBooleanDoesNotHaveTwoOperands
            },
            MultiOperandLogicalBooleanMissingOperands: {
                id: ErrorId.MultiOperandLogicalBooleanMissingOperands,
                summaryId: StringId.ScanFormulaZenithEncodingError_MultiOperandLogicalBooleanMissingOperands
            },
            MultipleMatchingTupleNodeMissingParameters: {
                id: ErrorId.MultipleMatchingTupleNodeMissingParameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_MultipleMatchingTupleNodeMissingParameters,
            },
            TextMultipleMatchingTupleNodeParameterIsNotString: {
                id: ErrorId.TextMultipleMatchingTupleNodeParameterIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextMultipleMatchingTupleNodeParameterIsNotString,
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
            FieldBooleanParamCannotBeSubbedField: {
                id: ErrorId.FieldBooleanParamCannotBeSubbedField,
                summaryId: StringId.ScanFormulaZenithEncodingError_FieldBooleanParamCannotBeSubbedField
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
            TextSubFieldIsMissing: {
                id: ErrorId.TextSubFieldIsMissing,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextSubFieldIsMissing
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
            SingleFieldMustHaveOneParameter: {
                id: ErrorId.SingleFieldMustHaveOneParameter,
                summaryId: StringId.ScanFormulaZenithEncodingError_SingleFieldMustHaveOneParameter
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
            RangeSubFieldIsMissing: {
                id: ErrorId.RangeSubFieldIsMissing,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeSubFieldIsMissing
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
            RangeFieldBooleanTupleNodeHasTooManyParameters: {
                id: ErrorId.RangeFieldBooleanTupleNodeHasTooManyParameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_RangeFieldBooleanTupleNodeHasTooManyParameters
            },
            IsBooleanTupleNodeParameterIsNotBoolean: {
                id: ErrorId.IsBooleanTupleNodeParameterIsNotBoolean,
                summaryId: StringId.ScanFormulaZenithEncodingError_IsBooleanTupleNodeParameterIsNotBoolean,
            },
            IsBooleanTupleNodeHasTooManyParameters: {
                id: ErrorId.IsBooleanTupleNodeHasTooManyParameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_IsBooleanTupleNodeHasTooManyParameters,
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
            FieldBooleanParamMustBeRangeOrExistsSingle: {
                id: ErrorId.FieldBooleanParamMustBeRangeOrExistsSingle,
                summaryId: StringId.ScanFormulaZenithEncodingError_FieldBooleanParamMustBeRangeOrExistsSingle
            },
            NumericRangeFirstParameterMustBeNumberOrNamed: {
                id: ErrorId.NumericRangeFirstParameterMustBeNumberOrNamed,
                summaryId: StringId.ScanFormulaZenithEncodingError_NumericRangeFirstParameterMustBeNumberOrNamed
            },
            DateRangeFirstParameterMustBeStringOrNamed: {
                id: ErrorId.DateRangeFirstParameterMustBeStringOrNamed,
                summaryId: StringId.ScanFormulaZenithEncodingError_DateRangeFirstParameterMustBeStringOrNamed
            },
            TextFieldMustHaveAtLeastOneParameter: {
                id: ErrorId.TextFieldMustHaveAtLeastOneParameter,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextFieldMustHaveAtLeastOneParameter
            },
            TextRangeSecondParameterMustBeStringOrNamed: {
                id: ErrorId.TextRangeSecondParameterMustBeStringOrNamed,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextRangeSecondParameterMustBeStringOrNamed
            },
            ExistsSingleFieldMustNotHaveMoreThan1Parameter: {
                id: ErrorId.ExistsSingleFieldMustNotHaveMoreThan1Parameter,
                summaryId: StringId.ScanFormulaZenithEncodingError_ExistsSingleFieldMustNotHaveMoreThan1Parameter
            },
            SingleFieldParameterIsNotString: {
                id: ErrorId.SingleFieldParameterIsNotString,
                summaryId: StringId.ScanFormulaZenithEncodingError_SingleFieldParameterIsNotString
            },
            TextFieldBooleanTupleNodeHasTooManyParameters: {
                id: ErrorId.TextFieldBooleanTupleNodeHasTooManyParameters,
                summaryId: StringId.ScanFormulaZenithEncodingError_TextFieldBooleanTupleNodeHasTooManyParameters
            },
            UnknownCurrency: {
                id: ErrorId.UnknownCurrency,
                summaryId: StringId.ScanFormulaZenithEncodingError_UnknownCurrency
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

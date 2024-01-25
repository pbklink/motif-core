/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../adi/adi-internal-api';
import { EnumInfoOutOfOrderError, PickEnum, SourceTzOffsetDateTime } from '../../sys/sys-internal-api';

export namespace ScanFormula {
    export const enum NodeTypeId {
        // Boolean
        And,
        Or,
        Not,
        Xor,

        // Comparison
        NumericEquals,
        NumericGreaterThan,
        NumericGreaterThanOrEqual,
        NumericLessThan,
        NumericLessThanOrEqual,
        All,
        None,

        // Binary arithmetic operations
        NumericAdd,
        NumericDiv,
        NumericMod,
        NumericMul,
        NumericSub,

        // Unary arithmetic operations
        NumericNeg,
        NumericPos,
        NumericAbs,

        NumericIf,

        // Get Field Value
        NumericFieldValueGet,
        // DateFieldValueGet,

        // Type
        Is,

        // Field
        FieldHasValue,
        // BooleanFieldEquals,
        NumericFieldEquals,
        NumericFieldInRange,
        DateFieldEquals,
        DateFieldInRange,
        StringFieldOverlaps,
        CurrencyFieldOverlaps,
        ExchangeFieldOverlaps,
        MarketFieldOverlaps,
        MarketBoardFieldOverlaps,
        TextFieldEquals,
        TextFieldContains,
        PriceSubFieldHasValue,
        PriceSubFieldEquals,
        PriceSubFieldInRange,
        DateSubFieldHasValue,
        DateSubFieldEquals,
        DateSubFieldInRange,
        AltCodeSubFieldHasValue,
        AltCodeSubFieldContains,
        AttributeSubFieldHasValue,
        AttributeSubFieldContains,
    }

    export type BooleanNodeTypeId = PickEnum<NodeTypeId,
        NodeTypeId.And |
        NodeTypeId.Or |
        NodeTypeId.Not |
        NodeTypeId.Xor |
        NodeTypeId.NumericEquals |
        NodeTypeId.NumericGreaterThan |
        NodeTypeId.NumericGreaterThanOrEqual |
        NodeTypeId.NumericLessThan |
        NodeTypeId.NumericLessThanOrEqual |
        NodeTypeId.All |
        NodeTypeId.None |
        NodeTypeId.Is |
        NodeTypeId.FieldHasValue |
        // NodeTypeId.BooleanFieldEquals |
        NodeTypeId.NumericFieldEquals |
        NodeTypeId.NumericFieldInRange |
        NodeTypeId.DateFieldEquals |
        NodeTypeId.DateFieldInRange |
        NodeTypeId.StringFieldOverlaps |
        NodeTypeId.CurrencyFieldOverlaps |
        NodeTypeId.ExchangeFieldOverlaps |
        NodeTypeId.MarketFieldOverlaps |
        NodeTypeId.MarketBoardFieldOverlaps |
        NodeTypeId.TextFieldEquals |
        NodeTypeId.TextFieldContains |
        NodeTypeId.PriceSubFieldHasValue |
        NodeTypeId.PriceSubFieldEquals |
        NodeTypeId.PriceSubFieldInRange |
        NodeTypeId.DateSubFieldHasValue |
        NodeTypeId.DateSubFieldEquals |
        NodeTypeId.DateSubFieldInRange |
        NodeTypeId.AltCodeSubFieldHasValue |
        NodeTypeId.AltCodeSubFieldContains |
        NodeTypeId.AttributeSubFieldHasValue |
        NodeTypeId.AttributeSubFieldContains
    >;

    export type NumericNodeTypeId = PickEnum<NodeTypeId,
        NodeTypeId.NumericAdd |
        NodeTypeId.NumericDiv |
        NodeTypeId.NumericMod |
        NodeTypeId.NumericMul |
        NodeTypeId.NumericSub |
        NodeTypeId.NumericNeg |
        NodeTypeId.NumericPos |
        NodeTypeId.NumericAbs |
        NodeTypeId.NumericIf |
        NodeTypeId.NumericFieldValueGet
    >;

    // export type DateNodeTypeId = PickEnum<NodeTypeId,
    //     NodeTypeId.DateFieldValueGet |
    //     NodeTypeId.DateSubFieldValueGet
    // >;

    export abstract class Node {
        readonly typeId: NodeTypeId;

        constructor(typeId: NodeTypeId) {
            this.typeId = typeId;
        }
    }

    // All scan criteria which return a boolean descend from this
    export abstract class BooleanNode extends Node {
        declare readonly typeId: BooleanNodeTypeId;
    }

    export abstract class ZeroOperandBooleanNode extends BooleanNode {
    }

    export abstract class SingleOperandBooleanNode extends BooleanNode {
        operand: BooleanNode;
    }

    export abstract class LeftRightOperandBooleanNode extends BooleanNode {
        leftOperand: BooleanNode;
        rightOperand: BooleanNode;
    }

    export abstract class NumericComparisonBooleanNode extends BooleanNode {
        leftOperand: NumericNode | number;
        rightOperand: NumericNode | number;
    }

    export abstract class MultiOperandBooleanNode extends BooleanNode {
        operands: BooleanNode[];
    }

    export class NoneNode extends ZeroOperandBooleanNode {
        declare readonly typeId: NodeTypeId.None;

        constructor() {
            super(NodeTypeId.None);
        }
    }

    export class AllNode extends ZeroOperandBooleanNode {
        declare readonly typeId: NodeTypeId.All;

        constructor() {
            super(NodeTypeId.All);
        }
    }

    export class NotNode extends SingleOperandBooleanNode {
        declare readonly typeId: NodeTypeId.Not;

        constructor() {
            super(NodeTypeId.Not);
        }
    }

    export namespace NotNode {
        export function is(node: Node): node is NotNode {
            return node.typeId === NodeTypeId.Not;
        }
    }

    export class XorNode extends LeftRightOperandBooleanNode {
        declare readonly typeId: NodeTypeId.Xor;

        constructor() {
            super(NodeTypeId.Xor);
        }
    }

    export namespace XorNode {
        export function is(node: Node): node is XorNode {
            return node.typeId === NodeTypeId.Xor;
        }
    }

    export class AndNode extends MultiOperandBooleanNode {
        declare readonly typeId: NodeTypeId.And;

        constructor() {
            super(NodeTypeId.And);
        }
    }

    export namespace AndNode {
        export function is(node: Node): node is AndNode {
            return node.typeId === NodeTypeId.And;
        }
    }

    export class OrNode extends MultiOperandBooleanNode {
        declare readonly typeId: NodeTypeId.Or;

        constructor() {
            super(NodeTypeId.Or);
        }
    }

    export class IsNode extends BooleanNode {
        declare readonly typeId: NodeTypeId.Is;

        trueFalse: boolean;

        constructor(readonly categoryId: IsNode.CategoryId) {
            super(NodeTypeId.Is);
        }
    }

    export namespace IsNode {
        export const enum CategoryId {
            Index,
        }
    }

    export abstract class FieldBooleanNode extends BooleanNode {
        fieldId: FieldId;
    }

    export class FieldHasValueNode extends FieldBooleanNode {
        declare readonly typeId: NodeTypeId.FieldHasValue;
        declare fieldId: ScanFormula.NumericRangeFieldId | ScanFormula.TextExistsSingleFieldId | ScanFormula.DateRangeFieldId;

        constructor() {
            super(NodeTypeId.FieldHasValue);
        }
    }

    // export abstract class BooleanFieldNode extends FieldBooleanNode {
    //     declare fieldId: BooleanFieldId;
    // }

    // export class BooleanFieldEqualsNode extends BooleanFieldNode {
    //     declare readonly typeId: NodeTypeId.BooleanFieldEquals;
    //     target: boolean; // | BooleanNode;

    //     constructor() {
    //         super(NodeTypeId.BooleanFieldEquals);
    //     }
    // }

    export abstract class NumericFieldNode extends FieldBooleanNode {
        declare fieldId: NumericRangeFieldId;
    }

    export class NumericFieldEqualsNode extends NumericFieldNode {
        declare readonly typeId: NodeTypeId.NumericFieldEquals;
        target: number; // | NumericNode;

        constructor() {
            super(NodeTypeId.NumericFieldEquals);
        }
    }

    export class NumericFieldInRangeNode extends NumericFieldNode {
        declare readonly typeId: NodeTypeId.NumericFieldInRange;
        min: number | undefined; // | NumericNode;
        max: number | undefined; // | NumericNode;

        constructor() {
            super(NodeTypeId.NumericFieldInRange);
        }
    }

    export abstract class DateFieldNode extends FieldBooleanNode {
        declare fieldId: DateRangeFieldId;
    }

    export class DateFieldEqualsNode extends DateFieldNode {
        declare readonly typeId: NodeTypeId.DateFieldEquals;
        target: SourceTzOffsetDateTime;

        constructor() {
            super(NodeTypeId.DateFieldEquals);
        }
    }

    export class DateFieldInRangeNode extends DateFieldNode {
        declare readonly typeId: NodeTypeId.DateFieldInRange;
        min: SourceTzOffsetDateTime | undefined;
        max: SourceTzOffsetDateTime | undefined;

        constructor() {
            super(NodeTypeId.DateFieldInRange);
        }
    }

    export abstract class OverlapsFieldNode extends FieldBooleanNode {
        declare fieldId: TextOverlapFieldId;
    }

    export abstract class TypedOverlapsFieldNode<T> extends OverlapsFieldNode {
        values: T[];
    }

    export abstract class BaseStringFieldOverlapsNode extends TypedOverlapsFieldNode<string> {
    }

    export class StringFieldOverlapsNode extends BaseStringFieldOverlapsNode {
        declare readonly typeId: NodeTypeId.StringFieldOverlaps;

        constructor() {
            super(NodeTypeId.StringFieldOverlaps);
        }
    }

    export class CurrencyFieldOverlapsNode extends TypedOverlapsFieldNode<CurrencyId> {
        declare readonly typeId: NodeTypeId.CurrencyFieldOverlaps;

        constructor() {
            super(NodeTypeId.CurrencyFieldOverlaps);
        }
    }

    export class ExchangeFieldOverlapsNode extends TypedOverlapsFieldNode<ExchangeId> {
        declare readonly typeId: NodeTypeId.ExchangeFieldOverlaps;

        constructor() {
            super(NodeTypeId.ExchangeFieldOverlaps);
        }
    }

    export class MarketFieldOverlapsNode extends TypedOverlapsFieldNode<MarketId> {
        declare readonly typeId: NodeTypeId.MarketFieldOverlaps;

        constructor() {
            super(NodeTypeId.MarketFieldOverlaps);
        }
    }

    export class MarketBoardFieldOverlapsNode extends TypedOverlapsFieldNode<MarketBoardId> {
        declare readonly typeId: NodeTypeId.MarketBoardFieldOverlaps;

        constructor() {
            super(NodeTypeId.MarketBoardFieldOverlaps);
        }
    }

    export abstract class TextFieldNode extends FieldBooleanNode {
        declare fieldId: TextTextFieldId | TextSingleFieldId;
    }

    export class TextFieldEqualsNode extends TextFieldNode {
        declare readonly typeId: NodeTypeId.TextFieldEquals;
        declare fieldId: TextSingleFieldId;

        target: string;

        constructor() {
            super(NodeTypeId.TextFieldEquals);
        }
    }

    export class TextFieldContainsNode extends TextFieldNode {
        declare readonly typeId: NodeTypeId.TextFieldContains;
        declare fieldId: TextTextFieldId;

        value: string;
        asId: TextContainsAsId;
        ignoreCase: boolean;

        constructor() {
            super(NodeTypeId.TextFieldContains);
        }
    }

    export abstract class SubFieldNode<MySubbedFieldId extends SubbedFieldId, SubFieldId> extends FieldBooleanNode {
        declare fieldId: MySubbedFieldId;
        subFieldId: SubFieldId;
    }

    export abstract class PriceSubFieldNode extends SubFieldNode<FieldId.Price, PriceSubFieldId> {
    }

    export class PriceSubFieldHasValueNode extends PriceSubFieldNode {
        declare readonly typeId: NodeTypeId.PriceSubFieldHasValue;

        constructor() {
            super(NodeTypeId.PriceSubFieldHasValue);
        }
    }

    export class PriceSubFieldEqualsNode extends PriceSubFieldNode {
        declare readonly typeId: NodeTypeId.PriceSubFieldEquals;
        target: number; // | NumericNode;

        constructor() {
            super(NodeTypeId.PriceSubFieldEquals);
        }
    }

    export class PriceSubFieldInRangeNode extends PriceSubFieldNode {
        declare readonly typeId: NodeTypeId.PriceSubFieldInRange;
        min: number | undefined; // | NumericNode;
        max: number | undefined; // | NumericNode;

        constructor() {
            super(NodeTypeId.PriceSubFieldInRange);
        }
    }

    // There is only one Subbed field which works with date fields.
    export abstract class DateSubFieldNode extends SubFieldNode<FieldId.Date, DateSubFieldId> {
    }

    export class DateSubFieldHasValueNode extends DateSubFieldNode {
        declare readonly typeId: NodeTypeId.DateSubFieldHasValue;

        constructor() {
            super(NodeTypeId.DateSubFieldHasValue);
        }
    }

    export class DateSubFieldEqualsNode extends DateSubFieldNode {
        declare readonly typeId: NodeTypeId.DateSubFieldEquals;
        target: SourceTzOffsetDateTime;

        constructor() {
            super(NodeTypeId.DateSubFieldEquals);
        }
    }

    export class DateSubFieldInRangeNode extends DateSubFieldNode {
        declare readonly typeId: NodeTypeId.DateSubFieldInRange;
        min: SourceTzOffsetDateTime | undefined; // | DateNode;
        max: SourceTzOffsetDateTime | undefined; // | DateNode;

        constructor() {
            super(NodeTypeId.DateSubFieldInRange);
        }
    }

    export abstract class AltCodeSubFieldNode extends SubFieldNode<FieldId.AltCode, AltCodeSubFieldId> {
    }

    export class AltCodeSubFieldHasValueNode extends AltCodeSubFieldNode {
        declare readonly typeId: NodeTypeId.AltCodeSubFieldHasValue;

        constructor() {
            super(NodeTypeId.AltCodeSubFieldHasValue);
        }
    }

    export class AltCodeSubFieldContainsNode extends AltCodeSubFieldNode {
        declare readonly typeId: NodeTypeId.AltCodeSubFieldContains;
        value: string;
        asId: TextContainsAsId;
        ignoreCase: boolean;

        constructor() {
            super(NodeTypeId.AltCodeSubFieldContains);
        }
    }

    export abstract class AttributeSubFieldNode extends SubFieldNode<FieldId.Attribute, AttributeSubFieldId> {
    }

    export class AttributeSubFieldHasValueNode extends AttributeSubFieldNode {
        declare readonly typeId: NodeTypeId.AttributeSubFieldHasValue;

        constructor() {
            super(NodeTypeId.AttributeSubFieldHasValue);
        }
    }

    export class AttributeSubFieldContainsNode extends AttributeSubFieldNode {
        declare readonly typeId: NodeTypeId.AttributeSubFieldContains;
        value: string;
        asId: TextContainsAsId;
        ignoreCase: boolean;

        constructor() {
            super(NodeTypeId.AttributeSubFieldContains);
        }
    }

    export class NumericEqualsNode extends NumericComparisonBooleanNode {
        declare readonly typeId: NodeTypeId.NumericEquals;

        constructor() {
            super(NodeTypeId.NumericEquals);
        }
    }

    export class NumericGreaterThanNode extends NumericComparisonBooleanNode {
        declare readonly typeId: NodeTypeId.NumericGreaterThan;

        constructor() {
            super(NodeTypeId.NumericGreaterThan);
        }
    }

    export class NumericGreaterThanOrEqualNode extends NumericComparisonBooleanNode {
        declare readonly typeId: NodeTypeId.NumericGreaterThanOrEqual;

        constructor() {
            super(NodeTypeId.NumericGreaterThanOrEqual);
        }
    }

    export class NumericLessThanNode extends NumericComparisonBooleanNode {
        declare readonly typeId: NodeTypeId.NumericLessThan;

        constructor() {
            super(NodeTypeId.NumericLessThan);
        }
    }

    export class NumericLessThanOrEqualNode extends NumericComparisonBooleanNode {
        declare readonly typeId: NodeTypeId.NumericLessThanOrEqual;

        constructor() {
            super(NodeTypeId.NumericLessThanOrEqual);
        }
    }

    // All scan criteria which return a number descend from this
    export abstract class NumericNode extends Node {
        declare typeId: NumericNodeTypeId;
    }

    export abstract class UnaryArithmeticNumericNode extends NumericNode {
        operand: number | NumericNode;
    }

    export class NumericNegNode extends UnaryArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericNeg;

        constructor() {
            super(NodeTypeId.NumericNeg);
        }
    }

    export class NumericPosNode extends UnaryArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericPos;

        constructor() {
            super(NodeTypeId.NumericPos);
        }
    }

    export class NumericAbsNode extends UnaryArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericAbs;

        constructor() {
            super(NodeTypeId.NumericAbs);
        }
    }

    export abstract class LeftRightArithmeticNumericNode extends NumericNode {
        leftOperand: number | NumericNode;
        rightOperand: number | NumericNode;
    }

    export class NumericAddNode extends LeftRightArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericAdd;

        constructor() {
            super(NodeTypeId.NumericAdd);
        }
    }

    export class NumericDivNode extends LeftRightArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericDiv;

        constructor() {
            super(NodeTypeId.NumericDiv);
        }
    }

    export class NumericModNode extends LeftRightArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericMod;

        constructor() {
            super(NodeTypeId.NumericMod);
        }
    }

    export class NumericMulNode extends LeftRightArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericMul;

        constructor() {
            super(NodeTypeId.NumericMul);
        }
    }

    export class NumericSubNode extends LeftRightArithmeticNumericNode {
        declare readonly typeId: NodeTypeId.NumericSub;

        constructor() {
            super(NodeTypeId.NumericSub);
        }
    }

    export class NumericIfNode extends NumericNode {
        declare readonly typeId: NodeTypeId.NumericIf;
        trueArms: NumericIfNode.Arm[];
        falseArm: NumericIfNode.Arm;

        constructor() {
            super(NodeTypeId.NumericIf);
        }
    }

    export namespace NumericIfNode {
        export interface Arm {
            condition: BooleanNode,
            value: number | NumericNode,
        }
    }

    export class NumericFieldValueGetNode extends NumericNode {
        declare readonly typeId: NodeTypeId.NumericFieldValueGet;
        fieldId: NumericRangeFieldId;

        constructor() {
            super(NodeTypeId.NumericFieldValueGet);
        }
    }

    export namespace NumericFieldValueGetNode {
        export function is(node: NumericNode): node is NumericFieldValueGetNode {
            return node.typeId === NodeTypeId.NumericFieldValueGet;
        }
    }

    // export class NumericSubFieldValueGetNode extends NumericNode {
    //     declare readonly typeId: NodeTypeId.NumericSubFieldValueGet;
    //     fieldId: NumericFieldId;
    //     subFieldId: PriceSubFieldId;
    // }

    // All scan criteria which return a Date descend from this
    // export abstract class DateNode extends Node {
    //     override typeId: DateNodeTypeId;
    // }

    // export class DateFieldValueGetNode extends DateNode {
    //     declare readonly typeId: NodeTypeId.DateFieldValueGet;
    //     fieldId: DateFieldId;
    // }

    // export class DateSubFieldValueGetNode extends DateNode {
    //     declare readonly typeId: NodeTypeId.DateSubFieldValueGet;
    //     fieldId: DateFieldId;
    //     subFieldId: DateSubFieldId;
    // }

    export const enum TextContainsAsId {
        None,
        FromStart,
        FromEnd,
        Exact,
    }

    export const enum FieldId {
        AltCode,
        Attribute,
        Auction,
        AuctionLast,
        AuctionQuantity,
        BestAskCount,
        BestAskPrice,
        BestAskQuantity,
        BestBidCount,
        BestBidPrice,
        BestBidQuantity,
        Board,
        CallOrPut,
        Category, // Corresponds to Symbol.Categories
        Cfi,
        Class,
        ClosePrice,
        Code,
        ContractSize,
        Currency,
        Data,
        Date,
        Exchange,
        ExerciseType,
        ExpiryDate,
        HighPrice,
        Is, // Dummy field that allows IsNode to be treated as a field
        LastPrice,
        Leg,
        LotSize,
        LowPrice,
        Market,
        Name,
        OpenInterest,
        OpenPrice,
        Price,
        PreviousClose,
        QuotationBasis,
        Remainder,
        ShareIssue,
        TradingStateName, // Corresponds to TradingState.name  Each market supports a fixed number of trading states.  They are available at Market.tradingStates. These are fetched when Motif Core is started.
        TradingStateAllows,  // Corresponds to TradingState.AllowId
        StatusNote,
        StrikePrice,
        Trades,
        TradingMarket,
        ValueTraded,
        Volume,
        Vwap,
    }

    export namespace Field {
        export type Id = FieldId;

        export const enum StyleId {
            Range,
            Multiple,
            EqualsSingle,
            ExistsSingle,
            Text,
        }

        export const enum DataTypeId {
            Numeric,
            Date,
            Text,
            Boolean,
        }

        interface Info {
            readonly id: Id;
            readonly styleId: StyleId;
            readonly dataTypeId: DataTypeId;
            readonly named: boolean;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            AltCode: {
                id: FieldId.AltCode,
                styleId: StyleId.Text,
                dataTypeId: DataTypeId.Text,
                named: true,
            },
            Attribute: {
                id: FieldId.Attribute,
                styleId: StyleId.Text,
                dataTypeId: DataTypeId.Text,
                named: true,
            },
            Auction: {
                id: FieldId.Auction,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            AuctionLast: {
                id: FieldId.AuctionLast,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            AuctionQuantity: {
                id: FieldId.AuctionQuantity,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            BestAskCount: {
                id: FieldId.BestAskCount,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            BestAskPrice: {
                id: FieldId.BestAskPrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            BestAskQuantity: {
                id: FieldId.BestAskQuantity,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            BestBidCount: {
                id: FieldId.BestBidCount,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            BestBidPrice: {
                id: FieldId.BestBidPrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            BestBidQuantity: {
                id: FieldId.BestBidQuantity,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Board: {
                id: FieldId.Board,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            CallOrPut: {
                id: FieldId.CallOrPut,
                styleId: StyleId.ExistsSingle,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            Category: {
                id: FieldId.Category,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            Cfi: {
                id: FieldId.Cfi,
                styleId: StyleId.EqualsSingle,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            Class: {
                id: FieldId.Class,
                styleId: StyleId.EqualsSingle,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            ClosePrice: {
                id: FieldId.ClosePrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Code: {
                id: FieldId.Code,
                styleId: StyleId.Text,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            ContractSize: {
                id: FieldId.ContractSize,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Currency: {
                id: FieldId.Currency,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            Data: {
                id: FieldId.Data,
                styleId: StyleId.EqualsSingle,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            Date: {
                id: FieldId.Date,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Date,
                named: true,
            },
            Exchange: {
                id: FieldId.Exchange,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            ExerciseType: {
                id: FieldId.ExerciseType,
                styleId: StyleId.ExistsSingle,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            ExpiryDate: {
                id: FieldId.ExpiryDate,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Date,
                named: false,
            },
            HighPrice: {
                id: FieldId.HighPrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Is: { // Dummy field which allows IsNode to be treated like a field
                id: FieldId.Is,
                styleId: StyleId.EqualsSingle,
                dataTypeId: DataTypeId.Boolean,
                named: false,
            },
            LastPrice: {
                id: FieldId.LastPrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Leg: {
                id: FieldId.Leg,
                styleId: StyleId.EqualsSingle,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            LotSize: {
                id: FieldId.LotSize,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            LowPrice: {
                id: FieldId.LowPrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Market: {
                id: FieldId.Market,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            Name: {
                id: FieldId.Name,
                styleId: StyleId.Text,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            OpenInterest: {
                id: FieldId.OpenInterest,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            OpenPrice: {
                id: FieldId.OpenPrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Price: {
                id: FieldId.Price,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: true,
            },
            PreviousClose: {
                id: FieldId.PreviousClose,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            QuotationBasis: {
                id: FieldId.QuotationBasis,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            Remainder: {
                id: FieldId.Remainder,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            ShareIssue: {
                id: FieldId.ShareIssue,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            TradingStateName: {
                id: FieldId.TradingStateName,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            TradingStateAllows: {
                id: FieldId.TradingStateAllows,
                styleId: StyleId.EqualsSingle,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            StatusNote: {
                id: FieldId.StatusNote,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            StrikePrice: {
                id: FieldId.StrikePrice,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Trades: {
                id: FieldId.Trades,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            TradingMarket: {
                id: FieldId.TradingMarket,
                styleId: StyleId.Multiple,
                dataTypeId: DataTypeId.Text,
                named: false,
            },
            ValueTraded: {
                id: FieldId.ValueTraded,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Volume: {
                id: FieldId.Volume,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
            Vwap: {
                id: FieldId.Vwap,
                styleId: StyleId.Range,
                dataTypeId: DataTypeId.Numeric,
                named: false,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (id as FieldId !== infosObject[id].id) {
                    throw new EnumInfoOutOfOrderError('ScanCriteria.Field', id, `${id}`);
                }
            }
        }

        export function idToStyleId(id: Id) {
            return infos[id].styleId;
        }

        export function idToDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToSubbed(id: Id) {
            return infos[id].named;
        }
    }

    export type NumericRangeFieldId = PickEnum<FieldId,
        FieldId.Auction |
        FieldId.AuctionLast |
        FieldId.AuctionQuantity |
        FieldId.BestAskCount |
        FieldId.BestAskPrice |
        FieldId.BestAskQuantity |
        FieldId.BestBidCount |
        FieldId.BestBidPrice |
        FieldId.BestBidQuantity |
        FieldId.ClosePrice |
        FieldId.ContractSize |
        FieldId.HighPrice |
        FieldId.LastPrice |
        FieldId.LotSize |
        FieldId.LowPrice |
        FieldId.OpenInterest |
        FieldId.OpenPrice |
        FieldId.PreviousClose |
        FieldId.Remainder |
        FieldId.ShareIssue |
        FieldId.StrikePrice |
        FieldId.Trades |
        FieldId.ValueTraded |
        FieldId.Volume |
        FieldId.Vwap
    >;

    export type DateRangeFieldId = PickEnum<FieldId,
        FieldId.ExpiryDate
    >;

    export type TextTextFieldId = PickEnum<FieldId,
        FieldId.Code |
        FieldId.Name
    >;

    export type TextSingleFieldId = PickEnum<FieldId,
        FieldId.Cfi |
        FieldId.Class |
        FieldId.Data |
        FieldId.Leg |
        FieldId.TradingStateAllows |
        // Exists
        FieldId.CallOrPut |
        FieldId.ExerciseType
    >;

    export type TextEqualsSingleFieldId = PickEnum<FieldId,
        FieldId.Cfi |
        FieldId.Class |
        FieldId.Data |
        FieldId.Leg |
        FieldId.TradingStateAllows
    >;

    export type TextExistsSingleFieldId = PickEnum<FieldId,
        FieldId.CallOrPut |
        FieldId.ExerciseType
    >;

    export type TextOverlapFieldId = PickEnum<FieldId,
        FieldId.Board |
        FieldId.Category |
        FieldId.Currency |
        FieldId.Exchange |
        FieldId.Market |
        FieldId.QuotationBasis |
        FieldId.TradingStateName |
        FieldId.StatusNote |
        FieldId.TradingMarket
    >;

    export type StringTextOverlapFieldId = PickEnum<FieldId,
        FieldId.Category |
        FieldId.QuotationBasis |
        FieldId.TradingStateName |
        FieldId.StatusNote
    >;

    export type MarketOverlapFieldId = PickEnum<FieldId,
        FieldId.Market |
        FieldId.TradingMarket
    >;

    export type SubbedFieldId = PickEnum<FieldId,
        FieldId.Price |
        FieldId.Date |
        FieldId.AltCode |
        FieldId.Attribute
    >;

    export type NumericRangeSubbedFieldId = PickEnum<FieldId,
        FieldId.Price
    >;

    export type DateRangeSubbedFieldId = PickEnum<FieldId,
        FieldId.Date
    >;

    export type TextTextSubbedFieldId = PickEnum<FieldId,
        FieldId.AltCode |
        FieldId.Attribute
    >;

    export const enum PriceSubFieldId {
        Last,
    }

    export const enum DateSubFieldId {
        Dividend,
    }

    export const enum AltCodeSubFieldId {
        Ticker,
        Isin,
        Base,
        Gics,
        Ric,
        Short,
        Long,
        Uid,
    }

    export const enum AttributeSubFieldId {
        Category,
        Class,
        Delivery,
        MaxRss,
        Sector,
        Short,
        ShortSuspended,
        SubSector,
    }
}

export namespace ScanFormulaModule {
    export function initialiseStatic() {
        ScanFormula.Field.initialise();
    }
}

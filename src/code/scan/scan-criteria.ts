/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, PickEnum, SourceTzOffsetDateTime } from '../sys/sys-internal-api';

export namespace ScanCriteria {
    export const enum NodeTypeId {
        // Boolean
        And,
        Or,
        Not,

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

        // Field Comparison
        FieldHasValue,
        BooleanFieldEquals,
        NumericFieldEquals,
        NumericFieldInRange,
        DateFieldEquals,
        DateFieldInRange,
        TextFieldContains,
        SubFieldHasValue,
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
        NodeTypeId.NumericEquals |
        NodeTypeId.NumericGreaterThan |
        NodeTypeId.NumericGreaterThanOrEqual |
        NodeTypeId.NumericLessThan |
        NodeTypeId.NumericLessThanOrEqual |
        NodeTypeId.All |
        NodeTypeId.None |
        NodeTypeId.FieldHasValue |
        NodeTypeId.BooleanFieldEquals |
        NodeTypeId.NumericFieldEquals |
        NodeTypeId.NumericFieldInRange |
        NodeTypeId.DateFieldEquals |
        NodeTypeId.DateFieldInRange |
        NodeTypeId.TextFieldContains |
        NodeTypeId.SubFieldHasValue |
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
        override readonly typeId: BooleanNodeTypeId;
    }

    export abstract class ZeroOperandBooleanNode extends BooleanNode {
    }

    export abstract class SingleOperandBooleanNode extends BooleanNode {
        operand: BooleanNode;
    }

    export abstract class NumericComparisonBooleanNode extends BooleanNode {
        leftOperand: NumericNode | number;
        rightOperand: NumericNode | number;
    }

    export abstract class MultiOperandBooleanNode extends BooleanNode {
        operands: BooleanNode[];
    }

    export class NoneNode extends ZeroOperandBooleanNode {
        override readonly typeId: NodeTypeId.None;

        constructor() {
            super(NodeTypeId.None);
        }
    }

    export class AllNode extends ZeroOperandBooleanNode {
        override readonly typeId: NodeTypeId.All;

        constructor() {
            super(NodeTypeId.All);
        }
    }

    export class NotNode extends SingleOperandBooleanNode {
        override readonly typeId: NodeTypeId.Not;

        constructor() {
            super(NodeTypeId.Not);
        }
    }

    export class AndNode extends MultiOperandBooleanNode {
        override readonly typeId: NodeTypeId.And;

        constructor() {
            super(NodeTypeId.And);
        }
    }

    export class OrNode extends MultiOperandBooleanNode {
        override readonly typeId: NodeTypeId.Or;

        constructor() {
            super(NodeTypeId.Or);
        }
    }

    export abstract class FieldBooleanNode extends BooleanNode {
        fieldId: FieldId;
    }

    export class FieldHasValueNode extends FieldBooleanNode {
        override readonly typeId: NodeTypeId.FieldHasValue;

        constructor() {
            super(NodeTypeId.FieldHasValue);
        }
    }

    export abstract class BooleanFieldNode extends FieldBooleanNode {
        override fieldId: BooleanFieldId;
    }

    export class BooleanFieldEqualsNode extends BooleanFieldNode {
        override readonly typeId: NodeTypeId.BooleanFieldEquals;
        target: boolean; // | BooleanNode;

        constructor() {
            super(NodeTypeId.BooleanFieldEquals);
        }
    }

    export abstract class NumericFieldNode extends FieldBooleanNode {
        override fieldId: NumericFieldId;
    }

    export class NumericFieldEqualsNode extends NumericFieldNode {
        override readonly typeId: NodeTypeId.NumericFieldEquals;
        target: number; // | NumericNode;

        constructor() {
            super(NodeTypeId.NumericFieldEquals);
        }
    }

    export class NumericFieldInRangeNode extends NumericFieldNode {
        override readonly typeId: NodeTypeId.NumericFieldInRange;
        min: number | undefined; // | NumericNode;
        max: number | undefined; // | NumericNode;

        constructor() {
            super(NodeTypeId.NumericFieldInRange);
        }
    }

    export abstract class DateFieldNode extends FieldBooleanNode {
        override fieldId: DateFieldId;
    }

    export class DateFieldEqualsNode extends DateFieldNode {
        override readonly typeId: NodeTypeId.DateFieldEquals;
        target: SourceTzOffsetDateTime;

        constructor() {
            super(NodeTypeId.DateFieldEquals);
        }
    }

    export class DateFieldInRangeNode extends DateFieldNode {
        override readonly typeId: NodeTypeId.DateFieldInRange;
        min: SourceTzOffsetDateTime | undefined;
        max: SourceTzOffsetDateTime | undefined;

        constructor() {
            super(NodeTypeId.DateFieldInRange);
        }
    }

    export abstract class TextFieldNode extends FieldBooleanNode {
        override fieldId: TextFieldId;
    }

    export class TextFieldContainsNode extends TextFieldNode {
        override readonly typeId: NodeTypeId.TextFieldContains;
        value: string;
        asId: TextContainsAsId;
        ignoreCase: boolean;

        constructor() {
            super(NodeTypeId.TextFieldContains);
        }
    }

    export abstract class SubFieldNode<TypeId extends BooleanNodeTypeId, MySubbedFieldId extends SubbedFieldId, SubFieldId> extends FieldBooleanNode {
        override typeId: TypeId;
        override fieldId: MySubbedFieldId;
        subFieldId: SubFieldId;
    }

    export class SubFieldHasValueNode extends SubFieldNode<NodeTypeId.SubFieldHasValue,
        FieldId.AltCode | FieldId.Attribute | FieldId.Date | FieldId.Price,
        AltCodeSubFieldId | AttributeSubFieldId | DateSubFieldId | PriceSubFieldId
    > {
        constructor() {
            super(NodeTypeId.SubFieldHasValue);
        }
    }

    export abstract class PriceSubFieldNode<TypeId extends BooleanNodeTypeId> extends SubFieldNode<TypeId, FieldId.Price, PriceSubFieldId> {
    }

    export class PriceSubFieldHasValueNode extends PriceSubFieldNode<NodeTypeId.PriceSubFieldHasValue> {
        constructor() {
            super(NodeTypeId.PriceSubFieldHasValue);
        }
    }

    export class PriceSubFieldEqualsNode extends PriceSubFieldNode<NodeTypeId.PriceSubFieldEquals> {
        target: number; // | NumericNode;

        constructor() {
            super(NodeTypeId.PriceSubFieldEquals);
        }
    }

    export class PriceSubFieldInRangeNode extends PriceSubFieldNode<NodeTypeId.PriceSubFieldInRange> {
        min: number | undefined; // | NumericNode;
        max: number | undefined; // | NumericNode;

        constructor() {
            super(NodeTypeId.PriceSubFieldInRange);
        }
    }

    // There is only one Subbed field which works with date fields.
    export abstract class DateSubFieldNode<TypeId extends BooleanNodeTypeId> extends SubFieldNode<TypeId, FieldId.Date, DateSubFieldId> {
    }

    export class DateSubFieldHasValueNode extends DateSubFieldNode<NodeTypeId.DateSubFieldHasValue> {
        constructor() {
            super(NodeTypeId.DateSubFieldHasValue);
        }
    }

    export class DateSubFieldEqualsNode extends DateSubFieldNode<NodeTypeId.DateSubFieldEquals> {
        target: SourceTzOffsetDateTime;

        constructor() {
            super(NodeTypeId.DateSubFieldEquals);
        }
    }

    export class DateSubFieldInRangeNode extends DateSubFieldNode<NodeTypeId.DateSubFieldInRange> {
        min: SourceTzOffsetDateTime | undefined; // | DateNode;
        max: SourceTzOffsetDateTime | undefined; // | DateNode;

        constructor() {
            super(NodeTypeId.DateSubFieldInRange);
        }
    }

    export abstract class AltCodeSubFieldNode<TypeId extends BooleanNodeTypeId> extends SubFieldNode<TypeId, FieldId.AltCode, AltCodeSubFieldId> {
    }

    export class AltCodeSubFieldHasValueNode extends AltCodeSubFieldNode<NodeTypeId.AltCodeSubFieldHasValue> {
        constructor() {
            super(NodeTypeId.AltCodeSubFieldHasValue);
        }
    }

    export class AltCodeSubFieldContainsNode extends AltCodeSubFieldNode<NodeTypeId.AltCodeSubFieldContains> {
        value: string;
        asId: TextContainsAsId;
        ignoreCase: boolean;

        constructor() {
            super(NodeTypeId.AltCodeSubFieldContains);
        }
    }

    export abstract class AttributeSubFieldNode<TypeId extends BooleanNodeTypeId> extends SubFieldNode<TypeId, FieldId.Attribute, AttributeSubFieldId> {
    }

    export class AttributeSubFieldHasValueNode extends AttributeSubFieldNode<NodeTypeId.AttributeSubFieldHasValue> {
        constructor() {
            super(NodeTypeId.AttributeSubFieldHasValue);
        }
    }

    export class AttributeSubFieldContainsNode extends AttributeSubFieldNode<NodeTypeId.AttributeSubFieldContains> {
        value: string;
        asId: TextContainsAsId;
        ignoreCase: boolean;

        constructor() {
            super(NodeTypeId.AttributeSubFieldContains);
        }
    }

    export class NumericEqualsNode extends NumericComparisonBooleanNode {
        override readonly typeId: NodeTypeId.NumericEquals;

        constructor() {
            super(NodeTypeId.NumericEquals);
        }
    }

    export class NumericGreaterThanNode extends NumericComparisonBooleanNode {
        override readonly typeId: NodeTypeId.NumericGreaterThan;

        constructor() {
            super(NodeTypeId.NumericGreaterThan);
        }
    }

    export class NumericGreaterThanOrEqualNode extends NumericComparisonBooleanNode {
        override readonly typeId: NodeTypeId.NumericGreaterThanOrEqual;

        constructor() {
            super(NodeTypeId.NumericGreaterThanOrEqual);
        }
    }

    export class NumericLessThanNode extends NumericComparisonBooleanNode {
        override readonly typeId: NodeTypeId.NumericLessThan;

        constructor() {
            super(NodeTypeId.NumericLessThan);
        }
    }

    export class NumericLessThanOrEqualNode extends NumericComparisonBooleanNode {
        override readonly typeId: NodeTypeId.NumericLessThanOrEqual;

        constructor() {
            super(NodeTypeId.NumericLessThanOrEqual);
        }
    }

    // All scan criteria which return a number descend from this
    export abstract class NumericNode extends Node {
        override typeId: NumericNodeTypeId;
    }

    export abstract class UnaryArithmeticNumericNode extends NumericNode {
        operand: number | NumericNode;
    }

    export class NumericNegNode extends UnaryArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericNeg;

        constructor() {
            super(NodeTypeId.NumericNeg);
        }
    }

    export class NumericPosNode extends UnaryArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericPos;

        constructor() {
            super(NodeTypeId.NumericPos);
        }
    }

    export class NumericAbsNode extends UnaryArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericAbs;

        constructor() {
            super(NodeTypeId.NumericAbs);
        }
    }

    export abstract class LeftRightArithmeticNumericNode extends NumericNode {
        leftOperand: number | NumericNode;
        rightOperand: number | NumericNode;
    }

    export class NumericAddNode extends LeftRightArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericAdd;

        constructor() {
            super(NodeTypeId.NumericAdd);
        }
    }

    export class NumericDivNode extends LeftRightArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericDiv;

        constructor() {
            super(NodeTypeId.NumericDiv);
        }
    }

    export class NumericModNode extends LeftRightArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericMod;

        constructor() {
            super(NodeTypeId.NumericMod);
        }
    }

    export class NumericMulNode extends LeftRightArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericMul;

        constructor() {
            super(NodeTypeId.NumericMul);
        }
    }

    export class NumericSubNode extends LeftRightArithmeticNumericNode {
        override readonly typeId: NodeTypeId.NumericSub;

        constructor() {
            super(NodeTypeId.NumericSub);
        }
    }

    export class NumericIfNode extends NumericNode {
        override readonly typeId: NodeTypeId.NumericIf;
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
        override readonly typeId: NodeTypeId.NumericFieldValueGet;
        fieldId: NumericFieldId;

        constructor() {
            super(NodeTypeId.NumericFieldValueGet);
        }
    }

    // export class NumericSubFieldValueGetNode extends NumericNode {
    //     override readonly typeId: NodeTypeId.NumericSubFieldValueGet;
    //     fieldId: NumericFieldId;
    //     subFieldId: PriceSubFieldId;
    // }

    // All scan criteria which return a Date descend from this
    // export abstract class DateNode extends Node {
    //     override typeId: DateNodeTypeId;
    // }

    // export class DateFieldValueGetNode extends DateNode {
    //     override readonly typeId: NodeTypeId.DateFieldValueGet;
    //     fieldId: DateFieldId;
    // }

    // export class DateSubFieldValueGetNode extends DateNode {
    //     override readonly typeId: NodeTypeId.DateSubFieldValueGet;
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
        AltCode, // Text, Subbed
        Attribute, // Text, Subbed
        Auction, // Numeric
        AuctionLast, // Numeric
        AuctionQuantity, // Numeric
        BestAskCount, // Numeric
        BestAskPrice, // Numeric
        BestAskQuantity, // Numeric
        BestBidCount, // Numeric
        BestBidPrice, // Numeric
        BestBidQuantity, // Numeric
        Board, // Text
        CallOrPut, // Text
        Category, // Text
        Cfi, // Text
        Class, // Text
        ClosePrice, // Numeric
        Code, // Text
        ContractSize, // Numeric
        Currency, // Text
        Data, // Text
        Date, // Date, Subbed
        Exchange, // Text
        ExerciseType, // Text
        ExpiryDate, // Date
        HighPrice, // Numeric
        IsIndex, // Boolean
        LastPrice, // Numeric
        Leg, // Text
        LotSize, // Numeric
        LowPrice, // Numeric
        Market, // Text
        Name, // Text
        OpenInterest, // Numeric
        OpenPrice, // Numeric
        Price, // Numeric, Subbed
        PreviousClose, // Numeric
        QuotationBasis, // Text
        Remainder, // Numeric
        ShareIssue, // Numeric
        State, // Text
        StateAllows, // Text
        StatusNote, // Text
        StrikePrice, // Numeric
        Trades, // Numeric
        TradingMarket, // Text
        ValueTraded, // Numeric
        Volume, // Numeric
        Vwap, // Numeric
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            readonly id: Id;
            readonly dataTypeId: FieldDataTypeId;
            readonly subbed: boolean;
            readonly comparable: boolean;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            AltCode: {
                id: FieldId.AltCode,
                dataTypeId: FieldDataTypeId.Text,
                subbed: true,
                comparable: false,
            },
            Attribute: {
                id: FieldId.Attribute,
                dataTypeId: FieldDataTypeId.Text,
                subbed: true,
                comparable: false,
            },
            Auction: {
                id: FieldId.Auction,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            AuctionLast: {
                id: FieldId.AuctionLast,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            AuctionQuantity: {
                id: FieldId.AuctionQuantity,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            BestAskCount: {
                id: FieldId.BestAskCount,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            BestAskPrice: {
                id: FieldId.BestAskPrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            BestAskQuantity: {
                id: FieldId.BestAskQuantity,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            BestBidCount: {
                id: FieldId.BestBidCount,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            BestBidPrice: {
                id: FieldId.BestBidPrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            BestBidQuantity: {
                id: FieldId.BestBidQuantity,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Board: {
                id: FieldId.Board,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            CallOrPut: {
                id: FieldId.CallOrPut,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            Category: {
                id: FieldId.Category,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            Cfi: {
                id: FieldId.Cfi,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            Class: {
                id: FieldId.Class,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            ClosePrice: {
                id: FieldId.ClosePrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Code: {
                id: FieldId.Code,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            ContractSize: {
                id: FieldId.ContractSize,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Currency: {
                id: FieldId.Currency,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            Data: {
                id: FieldId.Data,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            Date: {
                id: FieldId.Date,
                dataTypeId: FieldDataTypeId.Date,
                subbed: true,
                comparable: false,
            },
            Exchange: {
                id: FieldId.Exchange,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            ExerciseType: {
                id: FieldId.ExerciseType,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            ExpiryDate: {
                id: FieldId.ExpiryDate,
                dataTypeId: FieldDataTypeId.Date,
                subbed: false,
                comparable: false,
            },
            HighPrice: {
                id: FieldId.HighPrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            IsIndex: {
                id: FieldId.IsIndex,
                dataTypeId: FieldDataTypeId.Boolean,
                subbed: false,
                comparable: false,
            },
            LastPrice: {
                id: FieldId.LastPrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Leg: {
                id: FieldId.Leg,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            LotSize: {
                id: FieldId.LotSize,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            LowPrice: {
                id: FieldId.LowPrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Market: {
                id: FieldId.Market,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            Name: {
                id: FieldId.Name,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            OpenInterest: {
                id: FieldId.OpenInterest,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            OpenPrice: {
                id: FieldId.OpenPrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Price: {
                id: FieldId.Price,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: true,
                comparable: true,
            },
            PreviousClose: {
                id: FieldId.PreviousClose,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            QuotationBasis: {
                id: FieldId.QuotationBasis,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            Remainder: {
                id: FieldId.Remainder,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            ShareIssue: {
                id: FieldId.ShareIssue,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            State: {
                id: FieldId.State,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            StateAllows: {
                id: FieldId.StateAllows,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            StatusNote: {
                id: FieldId.StatusNote,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            StrikePrice: {
                id: FieldId.StrikePrice,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Trades: {
                id: FieldId.Trades,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            TradingMarket: {
                id: FieldId.TradingMarket,
                dataTypeId: FieldDataTypeId.Text,
                subbed: false,
                comparable: false,
            },
            ValueTraded: {
                id: FieldId.ValueTraded,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Volume: {
                id: FieldId.Volume,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
            Vwap: {
                id: FieldId.Vwap,
                dataTypeId: FieldDataTypeId.Numeric,
                subbed: false,
                comparable: true,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (id !== infosObject[id].id) {
                    throw new EnumInfoOutOfOrderError('ScanCriteria.Field', id, `${id}`);
                }
            }
        }

        export function idToDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function isSubbed(id: Id) {
            return infos[id].subbed;
        }

        export function isComparable(id: Id) {
            return infos[id].comparable;
        }
    }

    export type BooleanFieldId = PickEnum<FieldId,
        FieldId.IsIndex
    >;

    export type NumericFieldId = PickEnum<FieldId,
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

    export type SubbedFieldId = PickEnum<FieldId,
        FieldId.Price |
        FieldId.Date |
        FieldId.AltCode |
        FieldId.Attribute
    >;

    export type DateFieldId = PickEnum<FieldId,
        FieldId.ExpiryDate
    >;

    export type TextFieldId = PickEnum<FieldId,
        FieldId.Board |
        FieldId.CallOrPut |
        FieldId.Category |
        FieldId.Cfi |
        FieldId.Class |
        FieldId.Code |
        FieldId.Currency |
        FieldId.Data |
        FieldId.Exchange |
        FieldId.ExerciseType |
        FieldId.Leg |
        FieldId.Market |
        FieldId.Name |
        FieldId.QuotationBasis |
        FieldId.State |
        FieldId.StateAllows |
        FieldId.StatusNote |
        FieldId.TradingMarket
    >;

    export const enum FieldDataTypeId {
        Numeric,
        Date,
        Text,
        Boolean,
    }

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

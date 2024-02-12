/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../adi/adi-internal-api';
import { StringId, Strings } from '../../res/res-internal-api';
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

    export namespace NumericComparisonBooleanNode {
        export function isOperandNumericFieldValueGet(operand: NumericNode | number): operand is NumericFieldValueGetNode {
            return typeof operand === 'object' && operand.typeId === NodeTypeId.NumericFieldValueGet;
        }

        export function isOperandValue(operand: NumericNode | number): operand is number {
            return typeof operand === 'number';
        }
    }

    export abstract class MultiOperandBooleanNode extends BooleanNode {
        operands: BooleanNode[];
    }

    export class NoneNode extends ZeroOperandBooleanNode {
        declare readonly typeId: NoneNode.TypeId;

        constructor() {
            super(NoneNode.typeId);
        }
    }

    export namespace NoneNode {
        export type TypeId = NodeTypeId.None;
        export const typeId: TypeId = NodeTypeId.None;

        export function is(node: ScanFormula.Node): node is NoneNode {
            return node.typeId === typeId;
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

        export namespace Category {
            export type Id = CategoryId;

            interface Info {
                readonly id: CategoryId;
                readonly captionId: StringId;
                readonly titleId: StringId;
            }

            type InfosObject = { [id in keyof typeof CategoryId]: Info };
            const infosObject: InfosObject = {
                Index: { id: CategoryId.Index,
                    captionId: StringId.ScanFormulaIsNodeCategoryCaption_Index,
                    titleId: StringId.ScanFormulaIsNodeCategoryTitle_Index,
                }
            }

            const infos = Object.values(infosObject);
            export const idCount = infos.length;
            export const allIds: readonly CategoryId[] = infos.map((info) => info.id);

            export function initialise() {
                for (let i = 0; i < idCount; i++) {
                    const info = infos[i];
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (info.id !== i as Id) {
                        throw new EnumInfoOutOfOrderError('ScanFormula.IsNode.CategoryId', i, Strings[info.captionId]);
                    }
                }
            }

            export function idToCaptionId(id: Id) {
                return infos[id].captionId;
            }

            export function idToCaption(id: Id) {
                return Strings[idToCaptionId(id)];
            }

            export function idToTitleId(id: Id) {
                return infos[id].titleId;
            }

            export function idToTitle(id: Id) {
                return Strings[idToTitleId(id)];
            }
        }
    }

    export abstract class FieldBooleanNode extends BooleanNode {
        fieldId: FieldId;
    }

    export class FieldHasValueNode extends FieldBooleanNode {
        declare readonly typeId: NodeTypeId.FieldHasValue;
        declare fieldId: ScanFormula.NumericRangeFieldId | ScanFormula.TextHasValueEqualsFieldId | ScanFormula.DateRangeFieldId;

        constructor() {
            super(NodeTypeId.FieldHasValue);
        }
    }

    // export abstract class BooleanFieldNode extends FieldBooleanNode {
    //     declare fieldId: BooleanFieldId;
    // }

    // export class BooleanFieldEqualsNode extends BooleanFieldNode {
    //     declare readonly typeId: NodeTypeId.BooleanFieldEquals;
    //     value: boolean; // | BooleanNode;

    //     constructor() {
    //         super(NodeTypeId.BooleanFieldEquals);
    //     }
    // }

    export abstract class NumericFieldNode extends FieldBooleanNode {
        declare fieldId: NumericRangeFieldId;
    }

    export class NumericFieldEqualsNode extends NumericFieldNode {
        declare readonly typeId: NodeTypeId.NumericFieldEquals;
        value: number; // | NumericNode;

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
        value: SourceTzOffsetDateTime;

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
        declare fieldId: TextContainsFieldId | TextSingleFieldId;
    }

    export class TextFieldEqualsNode extends TextFieldNode {
        declare readonly typeId: NodeTypeId.TextFieldEquals;
        declare fieldId: TextEqualsFieldId;

        value: string;

        constructor() {
            super(NodeTypeId.TextFieldEquals);
        }
    }

    export class TextFieldContainsNode extends TextFieldNode {
        declare readonly typeId: NodeTypeId.TextFieldContains;
        declare fieldId: TextContainsFieldId;

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

    export abstract class PriceSubFieldNode extends SubFieldNode<FieldId.PriceSubbed, PriceSubFieldId> {
    }

    export class PriceSubFieldHasValueNode extends PriceSubFieldNode {
        declare readonly typeId: NodeTypeId.PriceSubFieldHasValue;

        constructor() {
            super(NodeTypeId.PriceSubFieldHasValue);
        }
    }

    export class PriceSubFieldEqualsNode extends PriceSubFieldNode {
        declare readonly typeId: NodeTypeId.PriceSubFieldEquals;
        value: number; // | NumericNode;

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
    export abstract class DateSubFieldNode extends SubFieldNode<FieldId.DateSubbed, DateSubFieldId> {
    }

    export class DateSubFieldHasValueNode extends DateSubFieldNode {
        declare readonly typeId: NodeTypeId.DateSubFieldHasValue;

        constructor() {
            super(NodeTypeId.DateSubFieldHasValue);
        }
    }

    export class DateSubFieldEqualsNode extends DateSubFieldNode {
        declare readonly typeId: NodeTypeId.DateSubFieldEquals;
        value: SourceTzOffsetDateTime;

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

    export abstract class AltCodeSubFieldNode extends SubFieldNode<FieldId.AltCodeSubbed, AltCodeSubFieldId> {
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

    export abstract class AttributeSubFieldNode extends SubFieldNode<FieldId.AttributeSubbed, AttributeSubFieldId> {
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
        AltCodeSubbed,
        AttributeSubbed,
        Auction,
        AuctionLast,
        AuctionQuantity,
        BestAskCount,
        BestAskPrice,
        BestAskQuantity,
        BestBidCount,
        BestBidPrice,
        BestBidQuantity,
        CallOrPut,
        Category, // Corresponds to Symbol.Categories
        Cfi,
        Class,
        ClosePrice,
        Code,
        ContractSize,
        Currency,
        Data,
        DateSubbed,
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
        MarketBoard,
        Name,
        OpenInterest,
        OpenPrice,
        PriceSubbed,
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
            InRange, // Range and Named Range
            Overlaps, // Multiple
            Equals, // Single but not Single Exists
            HasValueEquals, // Single Exists
            Contains, // Text and Named Text
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
            readonly subbed: boolean; // Named
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            AltCodeSubbed: {
                id: FieldId.AltCodeSubbed,
                styleId: StyleId.Contains,
                dataTypeId: DataTypeId.Text,
                subbed: true,
                name: 'AltCode-Subbed',
            },
            AttributeSubbed: {
                id: FieldId.AttributeSubbed,
                styleId: StyleId.Contains,
                dataTypeId: DataTypeId.Text,
                subbed: true,
                name: 'Attribute-Subbed',
            },
            Auction: {
                id: FieldId.Auction,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Auction',
            },
            AuctionLast: {
                id: FieldId.AuctionLast,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Auction: Last',
            },
            AuctionQuantity: {
                id: FieldId.AuctionQuantity,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Auction: Quantity',
            },
            BestAskCount: {
                id: FieldId.BestAskCount,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Best ask count',
            },
            BestAskPrice: {
                id: FieldId.BestAskPrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Best ask price',
            },
            BestAskQuantity: {
                id: FieldId.BestAskQuantity,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Best ask quantity',
            },
            BestBidCount: {
                id: FieldId.BestBidCount,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Best bid count',
            },
            BestBidPrice: {
                id: FieldId.BestBidPrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Best bid price',
            },
            BestBidQuantity: {
                id: FieldId.BestBidQuantity,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Best bid quantity',
            },
            CallOrPut: {
                id: FieldId.CallOrPut,
                styleId: StyleId.HasValueEquals,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Call/Put',
            },
            Category: {
                id: FieldId.Category,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Category',
            },
            Cfi: {
                id: FieldId.Cfi,
                styleId: StyleId.Equals,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'CFI',
            },
            Class: {
                id: FieldId.Class,
                styleId: StyleId.Equals,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Class',
            },
            ClosePrice: {
                id: FieldId.ClosePrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Close price',
            },
            Code: {
                id: FieldId.Code,
                styleId: StyleId.Contains,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Code',
            },
            ContractSize: {
                id: FieldId.ContractSize,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Contract size',
            },
            Currency: {
                id: FieldId.Currency,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Currency',
            },
            Data: {
                id: FieldId.Data,
                styleId: StyleId.Equals,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Data',
            },
            DateSubbed: {
                id: FieldId.DateSubbed,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Date,
                subbed: true,
                name: 'Date-Subbed',
            },
            Exchange: {
                id: FieldId.Exchange,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Exchange',
            },
            ExerciseType: {
                id: FieldId.ExerciseType,
                styleId: StyleId.HasValueEquals,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Exercise type',
            },
            ExpiryDate: {
                id: FieldId.ExpiryDate,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Date,
                subbed: false,
                name: 'Expiry date',
            },
            HighPrice: {
                id: FieldId.HighPrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'High price',
            },
            Is: { // Dummy field which allows IsNode to be treated like a field
                id: FieldId.Is,
                styleId: StyleId.Equals,
                dataTypeId: DataTypeId.Boolean,
                subbed: false,
                name: 'Is',
            },
            LastPrice: {
                id: FieldId.LastPrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Last price',
            },
            Leg: {
                id: FieldId.Leg,
                styleId: StyleId.Equals,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Leg',
            },
            LotSize: {
                id: FieldId.LotSize,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Lot size',
            },
            LowPrice: {
                id: FieldId.LowPrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Low price',
            },
            Market: {
                id: FieldId.Market,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Market',
            },
            MarketBoard: {
                id: FieldId.MarketBoard,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Market board',
            },
            Name: {
                id: FieldId.Name,
                styleId: StyleId.Contains,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Name',
            },
            OpenInterest: {
                id: FieldId.OpenInterest,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Open interest',
            },
            OpenPrice: {
                id: FieldId.OpenPrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Open price',
            },
            PriceSubbed: {
                id: FieldId.PriceSubbed,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: true,
                name: 'Price-Subbed',
            },
            PreviousClose: {
                id: FieldId.PreviousClose,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Previous close',
            },
            QuotationBasis: {
                id: FieldId.QuotationBasis,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Quotation basis',
            },
            Remainder: {
                id: FieldId.Remainder,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Remainder',
            },
            ShareIssue: {
                id: FieldId.ShareIssue,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Share issue',
            },
            TradingStateName: {
                id: FieldId.TradingStateName,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Trading state name',
            },
            TradingStateAllows: {
                id: FieldId.TradingStateAllows,
                styleId: StyleId.Equals,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Trading state allows',
            },
            StatusNote: {
                id: FieldId.StatusNote,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Status note',
            },
            StrikePrice: {
                id: FieldId.StrikePrice,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Strike price',
            },
            Trades: {
                id: FieldId.Trades,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Trades',
            },
            TradingMarket: {
                id: FieldId.TradingMarket,
                styleId: StyleId.Overlaps,
                dataTypeId: DataTypeId.Text,
                subbed: false,
                name: 'Trading market',
            },
            ValueTraded: {
                id: FieldId.ValueTraded,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Value traded',
            },
            Volume: {
                id: FieldId.Volume,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'Volume',
            },
            Vwap: {
                id: FieldId.Vwap,
                styleId: StyleId.InRange,
                dataTypeId: DataTypeId.Numeric,
                subbed: false,
                name: 'VWAP',
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (id as FieldId !== infos[id].id) {
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

        export function idIsSubbed(id: Id): id is SubbedFieldId {
            return infos[id].subbed;
        }

        export function idToName(id: Id) {
            return infos[id].name;
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

    export type TextContainsFieldId = PickEnum<FieldId,
        FieldId.Code |
        FieldId.Name
    >;

    export type TextSingleFieldId = PickEnum<FieldId,
        // Equals (Single but not Single Exists)
        FieldId.Cfi |
        FieldId.Class |
        FieldId.Data |
        FieldId.Leg |
        FieldId.TradingStateAllows |
        // HasValueEquals (Single Exists)
        FieldId.CallOrPut |
        FieldId.ExerciseType
    >;

    export type TextEqualsFieldId = PickEnum<FieldId, // Single but not Single Exists
        FieldId.Cfi |
        FieldId.Class |
        FieldId.Data |
        FieldId.Leg |
        FieldId.TradingStateAllows
    >;

    export type TextHasValueEqualsFieldId = PickEnum<FieldId, // Single Exists
        FieldId.CallOrPut |
        FieldId.ExerciseType
    >;

    export type TextOverlapFieldId = PickEnum<FieldId,
        FieldId.Category |
        FieldId.Currency |
        FieldId.Exchange |
        FieldId.Market |
        FieldId.MarketBoard |
        FieldId.QuotationBasis |
        FieldId.TradingStateName |
        FieldId.StatusNote |
        FieldId.TradingMarket
    >;

    export type StringOverlapsFieldId = PickEnum<FieldId,
        FieldId.Category |
        FieldId.QuotationBasis |
        FieldId.TradingStateName |
        FieldId.StatusNote
    >;

    export type MarketOverlapsFieldId = PickEnum<FieldId,
        FieldId.Market |
        FieldId.TradingMarket
    >;

    export type SubbedFieldId = PickEnum<FieldId,
        FieldId.PriceSubbed |
        FieldId.DateSubbed |
        FieldId.AltCodeSubbed |
        FieldId.AttributeSubbed
    >;

    export type NumericRangeSubbedFieldId = PickEnum<FieldId,
        FieldId.PriceSubbed
    >;

    export type DateRangeSubbedFieldId = PickEnum<FieldId,
        FieldId.DateSubbed
    >;

    export type TextContainsSubbedFieldId = PickEnum<FieldId,
        FieldId.AltCodeSubbed |
        FieldId.AttributeSubbed
    >;

    export const maxSubFieldIdCount = 100000; // Make sure number of subfields in each subfield type does not exceed this

    export const enum PriceSubFieldId {
        Last,
    }

    export namespace PriceSubField {
        export type Id = PriceSubFieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof PriceSubFieldId]: Info };
        const infosObject: InfosObject = {
            Last: {
                id: PriceSubFieldId.Last,
                name: 'Last',
            }
        }

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (info.id !== i as PriceSubFieldId) {
                    throw new EnumInfoOutOfOrderError('ScanFormula.PriceSubFieldId', i, infos[i].name);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function tryNameToId(name: string): PriceSubFieldId | undefined {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name === name) {
                    return info.id;
                }
            }
            return undefined;
        }

        export function tryIgnoreCaseNameToId(name: string): PriceSubFieldId | undefined {
            const upperCaseName = name.toUpperCase();
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name.toUpperCase() === upperCaseName) {
                    return info.id;
                }
            }
            return undefined;
        }
    }

    export const enum DateSubFieldId {
        Dividend,
    }

    export namespace DateSubField {
        export type Id = DateSubFieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof DateSubFieldId]: Info };
        const infosObject: InfosObject = {
            Dividend: {
                id: DateSubFieldId.Dividend,
                name: 'Last',
            }
        }

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (info.id !== i as DateSubFieldId) {
                    throw new EnumInfoOutOfOrderError('ScanFormula.DateSubFieldId', i, infos[i].name);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function tryNameToId(name: string): DateSubFieldId | undefined {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name === name) {
                    return info.id;
                }
            }
            return undefined;
        }

        export function tryIgnoreCaseNameToId(name: string): DateSubFieldId | undefined {
            const upperCaseName = name.toUpperCase();
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name.toUpperCase() === upperCaseName) {
                    return info.id;
                }
            }
            return undefined;
        }
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

    export namespace AltCodeSubField {
        export type Id = AltCodeSubFieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof AltCodeSubFieldId]: Info };
        const infosObject: InfosObject = {
            Ticker: {
                id: AltCodeSubFieldId.Ticker,
                name: 'Ticker',
            },
            Isin: {
                id: AltCodeSubFieldId.Isin,
                name: 'ISIN',
            },
            Base: {
                id: AltCodeSubFieldId.Base,
                name: 'Base',
            },
            Gics: {
                id: AltCodeSubFieldId.Gics,
                name: 'GICS',
            },
            Ric: {
                id: AltCodeSubFieldId.Ric,
                name: 'RIC',
            },
            Short: {
                id: AltCodeSubFieldId.Short,
                name: 'Short',
            },
            Long: {
                id: AltCodeSubFieldId.Long,
                name: 'Long',
            },
            Uid: {
                id: AltCodeSubFieldId.Uid,
                name: 'UID',
            },
        }

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (info.id !== i as AltCodeSubFieldId) {
                    throw new EnumInfoOutOfOrderError('ScanFormula.AltCodeSubFieldId', i, infos[i].name);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function tryNameToId(name: string): AltCodeSubFieldId | undefined {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name === name) {
                    return info.id;
                }
            }
            return undefined;
        }

        export function tryIgnoreCaseNameToId(name: string): AltCodeSubFieldId | undefined {
            const upperCaseName = name.toUpperCase();
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name.toUpperCase() === upperCaseName) {
                    return info.id;
                }
            }
            return undefined;
        }
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

    export namespace AttributeSubField {
        export type Id = AttributeSubFieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof AttributeSubFieldId]: Info };
        const infosObject: InfosObject = {
            Category: {
                id: AttributeSubFieldId.Category,
                name: 'Category',
            },
            Class: {
                id: AttributeSubFieldId.Class,
                name: 'Class',
            },
            Delivery: {
                id: AttributeSubFieldId.Delivery,
                name: 'Delivery',
            },
            MaxRss: {
                id: AttributeSubFieldId.MaxRss,
                name: 'MaxRss',
            },
            Sector: {
                id: AttributeSubFieldId.Sector,
                name: 'Sector',
            },
            Short: {
                id: AttributeSubFieldId.Short,
                name: 'Short',
            },
            ShortSuspended: {
                id: AttributeSubFieldId.ShortSuspended,
                name: 'Short suspended',
            },
            SubSector: {
                id: AttributeSubFieldId.SubSector,
                name: 'Sub-sector',
            },
        }

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (info.id !== i as AttributeSubFieldId) {
                    throw new EnumInfoOutOfOrderError('ScanFormula.AttributeSubFieldId', i, infos[i].name);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function tryNameToId(name: string): AttributeSubFieldId | undefined {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name === name) {
                    return info.id;
                }
            }
            return undefined;
        }

        export function tryIgnoreCaseNameToId(name: string): AttributeSubFieldId | undefined {
            const upperCaseName = name.toUpperCase();
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.name.toUpperCase() === upperCaseName) {
                    return info.id;
                }
            }
            return undefined;
        }
    }

    export type TextContainsSubFieldId =
        FieldId.AltCodeSubbed |
        FieldId.AttributeSubbed;
}

export namespace ScanFormulaModule {
    export function initialiseStatic() {
        ScanFormula.Field.initialise();
        ScanFormula.PriceSubField.initialise();
        ScanFormula.DateSubField.initialise();
        ScanFormula.AltCodeSubField.initialise();
        ScanFormula.AttributeSubField.initialise();
        ScanFormula.IsNode.Category.initialise();
    }
}

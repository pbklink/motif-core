import { PickEnum } from '../../../../sys/sys-internal-api';
import { Zenith } from './zenith';

export namespace ZenithScanCriteria {
    // Due to TypeScript not supporting Circular References in some scenarios, we need 2 types of
    // Node declarations.  Unions which exactly define possible node types but cannot be used
    // in circular references and more general declarations.

    export type DateString = string;

    export type TupleNodeType = keyof ParamTupleMap;

    export type TupleNode<T extends TupleNodeType> = [T, ...ParamTupleMap[T]];

    // Logical Criteria Nodes
    export type AndTupleNode = TupleNode<typeof AndTupleNodeType>;
    export type OrTupleNode = TupleNode<typeof OrTupleNodeType>;
    export type NotTupleNode = TupleNode<typeof NotTupleNodeType>;

    // Matching
    export type AltCodeTupleNode = TupleNode<typeof AltCodeTupleNodeType>;
    export type AttributeTupleNode = TupleNode<typeof AttributeTupleNodeType>;
    export type AuctionTupleNode = TupleNode<typeof AuctionTupleNodeType>;
    export type AuctionLastTupleNode = TupleNode<typeof AuctionLastTupleNodeType>;
    export type AuctionQuantityTupleNode = TupleNode<typeof AuctionQuantityTupleNodeType>;
    export type BestAskCountTupleNode = TupleNode<typeof BestAskCountTupleNodeType>;
    export type BestAskPriceTupleNode = TupleNode<typeof BestAskPriceTupleNodeType>;
    export type BestAskQuantityTupleNode = TupleNode<typeof BestAskQuantityTupleNodeType>;
    export type BestBidCountTupleNode = TupleNode<typeof BestBidCountTupleNodeType>;
    export type BestBidPriceTupleNode = TupleNode<typeof BestBidPriceTupleNodeType>;
    export type BestBidQuantityTupleNode = TupleNode<typeof BestBidQuantityTupleNodeType>;
    export type BoardTupleNode = TupleNode<typeof BoardTupleNodeType>;
    export type CallOrPutTupleNode = TupleNode<typeof CallOrPutTupleNodeType>;
    export type CategoryTupleNode = TupleNode<typeof CategoryTupleNodeType>;
    export type CfiTupleNode = TupleNode<typeof CfiTupleNodeType>;
    export type ClassTupleNode = TupleNode<typeof ClassTupleNodeType>;
    export type ClosePriceTupleNode = TupleNode<typeof ClosePriceTupleNodeType>;
    export type CodeTupleNode = TupleNode<typeof CodeTupleNodeType>;
    export type ContractSizeTupleNode = TupleNode<typeof ContractSizeTupleNodeType>;
    export type CurrencyTupleNode = TupleNode<typeof CurrencyTupleNodeType>;
    export type DataTupleNode = TupleNode<typeof DataTupleNodeType>;
    export type DateTupleNode = TupleNode<typeof DateTupleNodeType>;
    export type ExerciseTypeTupleNode = TupleNode<typeof ExerciseTypeTupleNodeType>;
    export type ExchangeTupleNode = TupleNode<typeof ExchangeTupleNodeType>;
    export type ExpiryDateTupleNode = TupleNode<typeof ExpiryDateTupleNodeType>;
    export type HighPriceTupleNode = TupleNode<typeof HighPriceTupleNodeType>;
    export type IsIndexTupleNode = TupleNode<typeof IsIndexTupleNodeType>;
    export type LegTupleNode = TupleNode<typeof LegTupleNodeType>;
    export type LastPriceTupleNode = TupleNode<typeof LastPriceTupleNodeType>;
    export type LotSizeTupleNode = TupleNode<typeof LotSizeTupleNodeType>;
    export type LowPriceTupleNode = TupleNode<typeof LowPriceTupleNodeType>;
    export type MarketTupleNode = TupleNode<typeof MarketTupleNodeType>;
    export type NameTupleNode = TupleNode<typeof NameTupleNodeType>;
    export type OpenInterestTupleNode = TupleNode<typeof OpenInterestTupleNodeType>;
    export type OpenPriceTupleNode = TupleNode<typeof OpenPriceTupleNodeType>;
    export type PriceTupleNode = TupleNode<typeof PriceTupleNodeType>;
    export type PreviousCloseTupleNode = TupleNode<typeof PreviousCloseTupleNodeType>;
    export type QuotationBasisTupleNode = TupleNode<typeof QuotationBasisTupleNodeType>;
    export type RemainderTupleNode = TupleNode<typeof RemainderTupleNodeType>;
    export type ShareIssueTupleNode = TupleNode<typeof ShareIssueTupleNodeType>;
    export type StateTupleNode = TupleNode<typeof StateTupleNodeType>;
    export type StateAllowsTupleNode = TupleNode<typeof StateAllowsTupleNodeType>;
    export type StatusNoteTupleNode = TupleNode<typeof StatusNoteTupleNodeType>;
    export type StrikePriceTupleNode = TupleNode<typeof StrikePriceTupleNodeType>;
    export type TradesTupleNode = TupleNode<typeof TradesTupleNodeType>;
    export type TradingMarketTupleNode = TupleNode<typeof TradingMarketTupleNodeType>;
    export type ValueTradedTupleNode = TupleNode<typeof ValueTradedTupleNodeType>;
    export type VolumeTupleNode = TupleNode<typeof VolumeTupleNodeType>;
    export type VwapTupleNode = TupleNode<typeof VwapTupleNodeType>;

    // Comparison
    export type EqualTupleNode = TupleNode<typeof EqualTupleNodeType>;
    export type GreaterThanTupleNode = TupleNode<typeof GreaterThanTupleNodeType>;
    export type GreaterThanOrEqualTupleNode = TupleNode<typeof GreaterThanOrEqualTupleNodeType>;
    export type LessThanTupleNode = TupleNode<typeof LessThanTupleNodeType>;
    export type LessThanOrEqualTupleNode = TupleNode<typeof LessThanOrEqualTupleNodeType>;
    export type AllTupleNode = TupleNode<typeof AllTupleNodeType>;
    export type NoneTupleNode = TupleNode<typeof NoneTupleNodeType>;

    // Binary
    export type AddTupleNode = TupleNode<typeof AddTupleNodeType>;
    export type DivSymbolTupleNode = TupleNode<typeof DivSymbolTupleNodeType>;
    export type DivTupleNode = TupleNode<typeof DivTupleNodeType>;
    export type ModSymbolTupleNode = TupleNode<typeof ModSymbolTupleNodeType>;
    export type ModTupleNode = TupleNode<typeof ModTupleNodeType>;
    export type MulSymbolTupleNode = TupleNode<typeof MulSymbolTupleNodeType>;
    export type MulTupleNode = TupleNode<typeof MulTupleNodeType>;
    export type SubTupleNode = TupleNode<typeof SubTupleNodeType>;

    // Unary
    export type NegTupleNode = TupleNode<typeof NegTupleNodeType>;
    export type PosTupleNode = TupleNode<typeof PosTupleNodeType>;
    export type AbsTupleNode = TupleNode<typeof AbsTupleNodeType>;

    // Unary or Binary (depending on number of params)
    export type SubOrNegSymbolTupleNode = TupleNode<typeof SubOrNegSymbolTupleNodeType>;
    export type AddOrPosSymbolTupleNode = TupleNode<typeof AddOrPosSymbolTupleNodeType>;

    // If
    export type IfTupleNode = TupleNode<typeof IfTupleNodeType>;

    export type LogicalTupleNodeType = PickEnum<TupleNodeType,
        typeof AndTupleNodeType |
        typeof OrTupleNodeType |
        typeof NotTupleNodeType
    >;

    export type NumericField = PickEnum<TupleNodeType,
        typeof AuctionTupleNodeType |
        typeof AuctionLastTupleNodeType |
        typeof AuctionQuantityTupleNodeType |
        typeof BestAskCountTupleNodeType |
        typeof BestAskPriceTupleNodeType |
        typeof BestAskQuantityTupleNodeType |
        typeof BestBidCountTupleNodeType |
        typeof BestBidPriceTupleNodeType |
        typeof BestBidQuantityTupleNodeType |
        typeof ClosePriceTupleNodeType |
        typeof ContractSizeTupleNodeType |
        typeof HighPriceTupleNodeType |
        typeof LastPriceTupleNodeType |
        typeof LotSizeTupleNodeType |
        typeof LowPriceTupleNodeType |
        typeof OpenInterestTupleNodeType |
        typeof OpenPriceTupleNodeType |
        typeof PriceTupleNodeType |
        typeof PreviousCloseTupleNodeType |
        typeof RemainderTupleNodeType |
        typeof ShareIssueTupleNodeType |
        typeof StrikePriceTupleNodeType |
        typeof TradesTupleNodeType |
        typeof ValueTradedTupleNodeType |
        typeof VolumeTupleNodeType |
        typeof VwapTupleNodeType
    >;

    export type DateField = PickEnum<TupleNodeType,
        typeof DateTupleNodeType |
        typeof ExpiryDateTupleNodeType
    >;

    export type BooleanField = PickEnum<TupleNodeType,
        typeof IsIndexTupleNodeType
    >;

    export type TextField = PickEnum<TupleNodeType,
        typeof AltCodeTupleNodeType |
        typeof AttributeTupleNodeType |
        typeof BoardTupleNodeType |
        typeof CallOrPutTupleNodeType |
        typeof CategoryTupleNodeType |
        typeof CfiTupleNodeType |
        typeof ClassTupleNodeType |
        typeof CodeTupleNodeType |
        typeof CurrencyTupleNodeType |
        typeof DataTupleNodeType |
        typeof ExchangeTupleNodeType |
        typeof ExerciseTypeTupleNodeType |
        typeof LegTupleNodeType |
        typeof MarketTupleNodeType |
        typeof NameTupleNodeType |
        typeof QuotationBasisTupleNodeType |
        typeof StateTupleNodeType |
        typeof StateAllowsTupleNodeType |
        typeof StatusNoteTupleNodeType |
        typeof TradingMarketTupleNodeType
    >;

    export type PriceSubbedField = typeof PriceTupleNodeType;
    export type NumericSubbedField = PriceSubbedField;
    export type DateSubbedField = typeof DateTupleNodeType;
    export type AltCodeSubbedField = typeof AltCodeTupleNodeType;
    export type AttributeSubbedField = typeof AttributeTupleNodeType;
    export type TextSubbedField = AltCodeSubbedField | AttributeSubbedField;

    export type MatchingField =
        NumericField |
        DateField |
        BooleanField |
        TextField |
        NumericSubbedField |
        DateSubbedField |
        TextSubbedField;

    export const enum PriceSubFieldEnum {
        LastPrice = 'LastPrice',
    }
    export type PriceSubField = PriceSubFieldEnum;

    export const enum DateSubFieldEnum {
        Dividend = 'Dividend',
    }
    export type DateSubField = DateSubFieldEnum;

    export type AltCodeSubField = Zenith.MarketController.SearchSymbols.AlternateKey;
    export type AttributeSubField = Zenith.MarketController.SearchSymbols.KnownAttributeKey;
    export type TextSubField = AltCodeSubField | AttributeSubField;
    // export type MatchingSubField = MatchingPriceSubField | MatchingDateSubField | MatchingTextSubField;

    export type ComparisonTupleNodeType = PickEnum<TupleNodeType,
        typeof EqualTupleNodeType |
        typeof GreaterThanTupleNodeType |
        typeof GreaterThanOrEqualTupleNodeType |
        typeof LessThanTupleNodeType |
        typeof LessThanOrEqualTupleNodeType |
        typeof AllTupleNodeType |
        typeof NoneTupleNodeType
    >;

    export type BinaryTupleNodeType = PickEnum<TupleNodeType,
        typeof AddTupleNodeType |
        typeof DivSymbolTupleNodeType |
        typeof DivTupleNodeType |
        typeof ModSymbolTupleNodeType |
        typeof ModTupleNodeType |
        typeof MulSymbolTupleNodeType |
        typeof MulTupleNodeType |
        typeof SubTupleNodeType
    >;

    export type UnaryTupleNodeType = PickEnum<TupleNodeType,
        typeof NegTupleNodeType |
        typeof PosTupleNodeType |
        typeof AbsTupleNodeType
    >;

    export type UnaryOrBinaryTupleNodeType = PickEnum<TupleNodeType,
        typeof SubOrNegSymbolTupleNodeType |
        typeof AddOrPosSymbolTupleNodeType
    >;

    export type BooleanTupleNodeType = LogicalTupleNodeType | MatchingField | ComparisonTupleNodeType;
    export type ExpressionTupleNodeType = BinaryTupleNodeType | UnaryTupleNodeType | UnaryOrBinaryTupleNodeType | typeof IfTupleNodeType;

    export type LogicalTupleNodeUnion = AndTupleNode | OrTupleNode | NotTupleNode;
    export type LogicalTupleNode = [nodeType: LogicalTupleNodeType, ...params: BooleanParam[]];

    export type MatchingTupleNodeUnion =
        AltCodeTupleNode |
        AttributeTupleNode |
        AuctionTupleNode |
        AuctionLastTupleNode |
        AuctionQuantityTupleNode |
        BestAskCountTupleNode |
        BestAskPriceTupleNode |
        BestAskQuantityTupleNode |
        BestBidCountTupleNode |
        BestBidPriceTupleNode |
        BestBidQuantityTupleNode |
        BoardTupleNode |
        CallOrPutTupleNode |
        CategoryTupleNode |
        CfiTupleNode |
        ClassTupleNode |
        ClosePriceTupleNode |
        CodeTupleNode |
        ContractSizeTupleNode |
        CurrencyTupleNode |
        DataTupleNode |
        DateTupleNode |
        ExerciseTypeTupleNode |
        ExchangeTupleNode |
        ExpiryDateTupleNode |
        HighPriceTupleNode |
        IsIndexTupleNode |
        LegTupleNode |
        LastPriceTupleNode |
        LotSizeTupleNode |
        LowPriceTupleNode |
        MarketTupleNode |
        NameTupleNode |
        OpenInterestTupleNode |
        OpenPriceTupleNode |
        PriceTupleNode |
        PreviousCloseTupleNode |
        QuotationBasisTupleNode |
        RemainderTupleNode |
        ShareIssueTupleNode |
        StateTupleNode |
        StateAllowsTupleNode |
        StatusNoteTupleNode |
        StrikePriceTupleNode |
        TradesTupleNode |
        TradingMarketTupleNode |
        ValueTradedTupleNode |
        VolumeTupleNode |
        VwapTupleNode;

    export type NumericRangeMatchingTupleNode = [nodeType: NumericField, ...params: NumericRangeParams];
    export type NumericNamedRangeMatchingTupleNode = [nodeType: NumericField, ...params: NumericNamedRangeParams];
    export type DateRangeMatchingTupleNode = [nodeType: DateField, ...params: DateRangeParams];
    export type DateNamedRangeMatchingTupleNode = [nodeType: DateField, ...params: DateNamedRangeParams];
    export type TextMatchingTupleNode = [nodeType: TextField, ...params: TextParams];
    export type NamedTextMatchingTupleNode = [nodeType: TextField, ...params: NamedTextParams];
    export type BooleanSingleMatchingTupleNode = [nodeType: BooleanField, ...params: BooleanSingleParam];
    export type BooleanSingle_DefaultMatchingTupleNode = [nodeType: BooleanField, ...params: BooleanSingleParam_Default];
    export type BooleanSingle_ExistsMatchingTupleNode = [nodeType: BooleanField, ...params: BooleanSingleParam_Exists];
    export type NumericSingleMatchingTupleNode = [nodeType: NumericField, ...params: NumericSingleParam];
    export type NumericSingle_DefaultMatchingTupleNode = [nodeType: NumericField, ...params: NumericSingleParam_Default];
    export type NumericSingle_ExistsMatchingTupleNode = [nodeType: NumericField, ...params: NumericSingleParam_Exists];
    export type TextSingleMatchingTupleNode = [nodeType: TextField, ...params: TextSingleParam];
    export type TextSingle_DefaultMatchingTupleNode = [nodeType: TextField, ...params: TextSingleParam_Default];
    export type TextSingle_ExistsMatchingTupleNode = [nodeType: TextField, ...params: TextSingleParam_Exists];

    export type MatchingTupleNode =
        NumericRangeMatchingTupleNode |
        NumericNamedRangeMatchingTupleNode |
        DateRangeMatchingTupleNode |
        DateNamedRangeMatchingTupleNode |
        TextMatchingTupleNode |
        NamedTextMatchingTupleNode |
        BooleanSingleMatchingTupleNode |
        BooleanSingle_DefaultMatchingTupleNode |
        BooleanSingle_ExistsMatchingTupleNode |
        NumericSingleMatchingTupleNode |
        NumericSingle_DefaultMatchingTupleNode |
        NumericSingle_ExistsMatchingTupleNode |
        TextSingleMatchingTupleNode |
        TextSingle_DefaultMatchingTupleNode |
        TextSingle_ExistsMatchingTupleNode;

    export type ComparisonTupleNodeUnion =
        EqualTupleNode |
        GreaterThanTupleNode |
        GreaterThanOrEqualTupleNode |
        LessThanTupleNode |
        LessThanOrEqualTupleNode;

    export type ComparisonTupleNode = [nodeType: TupleNodeType, leftParam: unknown, rightParam: unknown];

    export type AllNoneTupleNodeUnion =
        AllTupleNode |
        NoneTupleNode;

    export type AllNoneTupleNode = [nodeType: TupleNodeType];

    export type BinaryExpressionTupleNodeUnion =
        AddTupleNode |
        DivSymbolTupleNode |
        DivTupleNode |
        ModSymbolTupleNode |
        ModTupleNode |
        MulSymbolTupleNode |
        MulTupleNode |
        SubTupleNode;

    export type BinaryExpressionTupleNode = [nodeType: BinaryTupleNodeType, leftParam: unknown, rightParam: unknown];

    export type UnaryExpressionTupleNodeUnion =
        NegTupleNode |
        PosTupleNode |
        AbsTupleNode;

    export type UnaryExpressionTupleNode = [nodeType: UnaryTupleNodeType, param: unknown];

    export type UnaryOrBinaryExpressionTupleNodeUnion =
        SubOrNegSymbolTupleNode |
        AddOrPosSymbolTupleNode;

    export type UnaryOrBinaryExpressionTupleNode = [nodeType: UnaryOrBinaryTupleNodeType, leftOrUnaryparam: unknown, rightParam?: unknown];

    export type NumericIfTupleArm = [condition: unknown, value: unknown];
    export type NumericIfTupleNode = [nodeType: typeof IfTupleNodeType, ...conditionAndValues: unknown[]];

    export type BooleanTupleNodeUnion = LogicalTupleNodeUnion | MatchingTupleNodeUnion | ComparisonTupleNodeUnion | AllNoneTupleNodeUnion;
    export type BooleanTupleNode = LogicalTupleNode | MatchingTupleNode | ComparisonTupleNode | AllNoneTupleNode;

    export type NumericTupleNodeUnion = UnaryExpressionTupleNodeUnion | BinaryExpressionTupleNodeUnion | UnaryOrBinaryExpressionTupleNodeUnion;
    export type NumericTupleNode = UnaryExpressionTupleNode | BinaryExpressionTupleNode | UnaryOrBinaryExpressionTupleNode | NumericIfTupleNode;

    export interface TextNamedParameters {
        As?: TextContainsAsEnum;
        IgnoreCase?: boolean;
    }
    export interface NumericNamedParameters {
        At?: number; // Set for equals
        Min?: number; // Set for "in range (inclusive)" or "greater than or equal"
        Max?: number; // Set for "in range (inclusive)" or "less than or equal"
    }
    export interface DateNamedParameters {
        At?: DateString; // Set for equals
        Min?: DateString; // Set for "in range (inclusive)" or "greater than or equal"
        Max?: DateString; // Set for "in range (inclusive)" or "less than or equal"
    }


    export type NoParams = [];
    export type LogicalParams = (BooleanParam)[];
    export type BooleanParam = LogicalTupleNode | MatchingTupleNode | ComparisonTupleNode | AllNoneTupleNode | MatchingField;
    export type NumericUnion = number | NumericTupleNodeUnion;
    export type NumericParam = number | NumericTupleNode | NumericField;
    export type SingleNumericUnionParams = [value: NumericUnion];
    export type SingleNumericParams = [value: NumericParam];
    export type LeftRightNumericUnionParams = [left: NumericUnion, right: NumericUnion];
    export type LeftRightNumericParams = [left: NumericParam, right: NumericParam];
    export type SingleOrLeftRightNumericUnionParams = SingleNumericUnionParams | LeftRightNumericUnionParams;
    export type SingleOrLeftRightNumericParams = SingleNumericParams | LeftRightNumericParams;
    export type NumericParams = SingleNumericParams | LeftRightNumericParams;

    export type TextParams_FirstForm = []; // exists
    export type TextParams_SecondForm = [value: string]; // Contains
    export type TextParams_ThirdForm = [value: string, as?: TextContainsAsEnum, ignoreCase?: boolean]; // Advanced contains
    export type TextParams_FourthForm = [value: string, namedParameters: TextNamedParameters];
    export type TextParams = TextParams_FirstForm | TextParams_SecondForm | TextParams_ThirdForm | TextParams_FourthForm;

    export type NamedTextParams_FirstForm = [subField: TextSubField]; // exists
    export type NamedTextParams_SecondForm = [subField: TextSubField, value: string]; // Contains
    export type NamedTextParams_ThirdForm = [subField: TextSubField, value: string, as?: TextContainsAsEnum, ignoreCase?: boolean]; // Advanced contains
    export type NamedTextParams_FourthForm = [subField: TextSubField, value: string, namedParameters: TextNamedParameters];
    export type NamedTextParams = NamedTextParams_FirstForm | NamedTextParams_SecondForm | NamedTextParams_ThirdForm | NamedTextParams_FourthForm;

    export type NumericRangeParams_FirstForm = []; // exists
    export type NumericRangeParams_SecondForm = [value: number]; // equals
    export type NumericRangeParams_ThirdForm = [min: number | null, max: number | null]; // in range
    export type NumericRangeParams_FourthForm = [namedParameters: NumericNamedParameters];
    export type NumericRangeParams =
        NumericRangeParams_FirstForm |
        NumericRangeParams_SecondForm |
        NumericRangeParams_ThirdForm |
        NumericRangeParams_FourthForm;

    export type NumericNamedRangeParams_FirstForm = [subField: PriceSubField]; // exists
    export type NumericNamedRangeParams_SecondForm = [subField: PriceSubField, value: number]; // equals
    export type NumericNamedRangeParams_ThirdForm = [subField: PriceSubField, min: number | null, max: number | null]; // in range
    export type NumericNamedRangeParams_FourthForm = [subField: PriceSubField, namedParameters: NumericNamedParameters];
    export type NumericNamedRangeParams =
        NumericNamedRangeParams_FirstForm |
        NumericNamedRangeParams_SecondForm |
        NumericNamedRangeParams_ThirdForm |
        NumericNamedRangeParams_FourthForm;

    export type DateRangeParams_FirstForm = []; // exists
    export type DateRangeParams_SecondForm = [value: DateString]; // equals
    export type DateRangeParams_ThirdForm = [min: DateString | null, max: DateString | null]; // in range
    export type DateRangeParams_FourthForm = [namedParameters: DateNamedParameters]; // equals
    export type DateRangeParams =
        DateRangeParams_FirstForm |
        DateRangeParams_SecondForm |
        DateRangeParams_ThirdForm |
        DateRangeParams_FourthForm;

    export type DateNamedRangeParams_FirstForm = [subField: DateSubField]; // exists
    export type DateNamedRangeParams_SecondForm = [subField: DateSubField, value: DateString]; // equals
    export type DateNamedRangeParams_ThirdForm = [subField: DateSubField, min: DateString | null, max: DateString | null]; // in range
    export type DateNamedRangeParams_FourthForm = [subField: DateSubField, namedParameters: DateNamedParameters];
    export type DateNamedRangeParams =
        DateNamedRangeParams_FirstForm |
        DateNamedRangeParams_SecondForm |
        DateNamedRangeParams_ThirdForm |
        DateNamedRangeParams_FourthForm;

    export type SingleParam_EqualsDefault = []; // equals default
    export type SingleParam_IsSet = []; // is set
    export type BooleanSingleParam_EqualsValue = [value: boolean]; // equals
    export type BooleanSingleParam = BooleanSingleParam_EqualsValue; // equals value
    export type BooleanSingleParam_Default = BooleanSingleParam_EqualsValue | SingleParam_EqualsDefault; // equals value or equals default
    export type BooleanSingleParam_Exists = BooleanSingleParam_EqualsValue | SingleParam_IsSet; // equals value or is set
    export type NumericSingleParam_EqualsValue = [value: number]; // equals
    export type NumericSingleParam = NumericSingleParam_EqualsValue; // equals
    export type NumericSingleParam_Default = NumericSingleParam_EqualsValue | SingleParam_EqualsDefault; // equals value or equals default
    export type NumericSingleParam_Exists = NumericSingleParam_EqualsValue | SingleParam_IsSet; // equals value or is set
    export type TextSingleParam_EqualsValue = [value: string]; // equals
    export type TextSingleParam = TextSingleParam_EqualsValue; // equals
    export type TextSingleParam_Default = TextSingleParam_EqualsValue | SingleParam_EqualsDefault; // equals value or equals default
    export type TextSingleParam_Exists = TextSingleParam_EqualsValue | SingleParam_IsSet; // equals value or is set

    export type ConditionalArm = [condition: BooleanParam, value: NumericParam];
    // It is not possible to nest rest operators to properly represent If parameters as follows:
    // export type ConditionalParams = [...trueArms: (...ConditionalArm)[], ...falseArm: ConditionalArm]
    // Instead, approximate with up to 3 true arms.
    export type ConditionalParams_1True = [...trueArm1: ConditionalArm, ...falseArm: ConditionalArm];
    export type ConditionalParams_2True = [...trueArm1: ConditionalArm, ...trueArm2: ConditionalArm, ...falseArm: ConditionalArm];
    export type ConditionalParams_3True = [...trueArm1: ConditionalArm, ...trueArm2: ConditionalArm, ...trueArm3: ConditionalArm, ...falseArm: ConditionalArm];
    export type ConditionalParams = ConditionalParams_1True | ConditionalParams_2True | ConditionalParams_3True;

    export const SingleDefault_IsIndex = true;

    export const AndTupleNodeType = 'And';
    export const NotTupleNodeType = 'Not';
    export const OrTupleNodeType = 'Or';
    export const AltCodeTupleNodeType = 'AltCode';
    export const AttributeTupleNodeType = 'Attribute';
    export const AuctionTupleNodeType = 'Auction';
    export const AuctionLastTupleNodeType = 'AuctionLast';
    export const AuctionQuantityTupleNodeType = 'AuctionQuantity';
    export const BestAskCountTupleNodeType = 'BestAskCount';
    export const BestAskPriceTupleNodeType = 'BestAskPrice';
    export const BestAskQuantityTupleNodeType = 'BestAskQuantity';
    export const BestBidCountTupleNodeType = 'BestBidCount';
    export const BestBidPriceTupleNodeType = 'BestBidPrice';
    export const BestBidQuantityTupleNodeType = 'BestBidQuantity';
    export const BoardTupleNodeType = 'Board';
    export const CallOrPutTupleNodeType = 'CallOrPut';
    export const CategoryTupleNodeType = 'Category';
    export const CfiTupleNodeType = 'CFI';
    export const ClassTupleNodeType = 'Class';
    export const ClosePriceTupleNodeType = 'ClosePrice';
    export const CodeTupleNodeType = 'Code';
    export const ContractSizeTupleNodeType = 'ContractSize';
    export const CurrencyTupleNodeType = 'Currency';
    export const DataTupleNodeType = 'Data';
    export const DateTupleNodeType = 'Date';
    export const ExerciseTypeTupleNodeType = 'ExerciseType';
    export const ExchangeTupleNodeType = 'Exchange';
    export const ExpiryDateTupleNodeType = 'ExpiryDate';
    export const HighPriceTupleNodeType = 'HighPrice';
    export const IsIndexTupleNodeType = 'IsIndex';
    export const LegTupleNodeType = 'Leg';
    export const LastPriceTupleNodeType = 'LastPrice';
    export const LotSizeTupleNodeType = 'LotSize';
    export const LowPriceTupleNodeType = 'LowPrice';
    export const MarketTupleNodeType = 'Market';
    export const NameTupleNodeType = 'Name';
    export const OpenInterestTupleNodeType = 'OpenInterest';
    export const OpenPriceTupleNodeType = 'OpenPrice';
    export const PriceTupleNodeType = 'Price';
    export const PreviousCloseTupleNodeType = 'PreviousClose';
    export const QuotationBasisTupleNodeType = 'QuotationBasis';
    export const RemainderTupleNodeType = 'Remainder';
    export const ShareIssueTupleNodeType = 'ShareIssue';
    export const StateTupleNodeType = 'State';
    export const StateAllowsTupleNodeType = 'StateAllows';
    export const StatusNoteTupleNodeType = 'StatusNote';
    export const StrikePriceTupleNodeType = 'StrikePrice';
    export const TradesTupleNodeType = 'Trades';
    export const TradingMarketTupleNodeType = 'TradingMarket';
    export const ValueTradedTupleNodeType = 'ValueTraded';
    export const VolumeTupleNodeType = 'Volume';
    export const VwapTupleNodeType = 'VWAP';
    export const EqualTupleNodeType =  '=';
    export const GreaterThanTupleNodeType =  '>';
    export const GreaterThanOrEqualTupleNodeType =  '>=';
    export const LessThanTupleNodeType =  '<';
    export const LessThanOrEqualTupleNodeType =  '<=';
    export const AllTupleNodeType = 'All';
    export const NoneTupleNodeType = 'None';
    export const AddTupleNodeType = 'Add';
    export const DivSymbolTupleNodeType =  '/';
    export const DivTupleNodeType = 'Div';
    export const ModSymbolTupleNodeType =  '%';
    export const ModTupleNodeType = 'Mod';
    export const MulSymbolTupleNodeType =  '*';
    export const MulTupleNodeType = 'Mul';
    export const SubTupleNodeType = 'Sub';
    export const NegTupleNodeType = 'Neg';
    export const PosTupleNodeType = 'Pos';
    export const AbsTupleNodeType = 'Abs';
    export const SubOrNegSymbolTupleNodeType =  '-';
    export const AddOrPosSymbolTupleNodeType =  '+';
    export const IfTupleNodeType = 'If';


    export interface ParamTupleMap {
        // Logical
        'And': LogicalParams;
        'Not': LogicalParams;
        'Or': LogicalParams;

        // Matching
        'AltCode': NamedTextParams;
        'Attribute': NamedTextParams;
        'Auction': NumericRangeParams;
        'AuctionLast': NumericRangeParams;
        'AuctionQuantity': NumericRangeParams;
        'BestAskCount': NumericRangeParams;
        'BestAskPrice': NumericRangeParams;
        'BestAskQuantity': NumericRangeParams;
        'BestBidCount': NumericRangeParams;
        'BestBidPrice': NumericRangeParams;
        'BestBidQuantity': NumericRangeParams;
        'Board': TextSingleParam;
        'CallOrPut': TextSingleParam_Exists;
        'Category': TextSingleParam;
        'CFI': TextSingleParam;
        'Class': TextSingleParam;
        'ClosePrice': NumericRangeParams;
        'Code': TextParams;
        'ContractSize': NumericRangeParams;
        'Currency': TextSingleParam;
        'Data': TextSingleParam;
        'Date': DateNamedRangeParams;
        'ExerciseType': TextSingleParam_Exists;
        'Exchange': TextSingleParam;
        'ExpiryDate': DateRangeParams;
        'HighPrice': NumericRangeParams;
        'IsIndex': BooleanSingleParam_Default;
        'Leg': TextSingleParam;
        'LastPrice': NumericRangeParams;
        'LotSize': NumericRangeParams;
        'LowPrice': NumericRangeParams;
        'Market': TextSingleParam;
        'Name': TextParams;
        'OpenInterest': NumericRangeParams;
        'OpenPrice': NumericRangeParams;
        'Price': NumericNamedRangeParams;
        'PreviousClose': NumericRangeParams;
        'QuotationBasis': TextSingleParam;
        'Remainder': NumericRangeParams;
        'ShareIssue': NumericRangeParams;
        'State': TextSingleParam;
        'StateAllows': TextSingleParam;
        'StatusNote': TextSingleParam;
        'StrikePrice': NumericRangeParams;
        'Trades': NumericRangeParams;
        'TradingMarket': TextSingleParam;
        'ValueTraded': NumericRangeParams;
        'Volume': NumericRangeParams;
        'VWAP': NumericRangeParams;

        // Comparison
        '=': LeftRightNumericParams;
        '>': LeftRightNumericParams;
        '>=': LeftRightNumericParams;
        '<': LeftRightNumericParams;
        '<=': LeftRightNumericParams;
        'All': NoParams;
        'None': NoParams;

        // Binary
        'Add': LeftRightNumericParams;
        '/': LeftRightNumericParams;
        'Div': LeftRightNumericParams;
        '%': LeftRightNumericParams;
        'Mod': LeftRightNumericParams;
        '*': LeftRightNumericParams;
        'Mul': LeftRightNumericParams;
        'Sub': LeftRightNumericParams;

        // Unary
        'Neg': SingleNumericParams;
        'Pos': SingleNumericParams;
        'Abs': SingleNumericParams;

        // Unary or Binary (depending on number of params)
        '-': SingleOrLeftRightNumericParams;
        '+': SingleOrLeftRightNumericParams;

        // Conditional
        'If': ConditionalParams;
    }

    // export const enum ComparableFieldEnum {
    //     Auction = 'Auction',
    //     AuctionLast = 'AuctionLast',
    //     AuctionQuantity = 'AuctionQuantity',
    //     BestAskCount = 'BestAskCount',
    //     BestAskPrice = 'BestAskPrice',
    //     BestAskQuantity = 'BestAskQuantity',
    //     BestBidCount = 'BestBidCount',
    //     BestBidPrice = 'BestBidPrice',
    //     BestBidQuantity = 'BestBidQuantity',
    //     ClosePrice = 'ClosePrice',
    //     ContractSize = 'ContractSize',
    //     HighPrice = 'HighPrice',
    //     LastPrice = 'LastPrice',
    //     LotSize = 'LotSize',
    //     LowPrice = 'LowPrice',
    //     OpenInterest = 'OpenInterest',
    //     OpenPrice = 'OpenPrice',
    //     PreviousClose = 'PreviousClose',
    //     Price = 'Price',
    //     Remainder = 'Remainder',
    //     ShareIssue = 'ShareIssue',
    //     StrikePrice = 'StrikePrice',
    //     Trades = 'Trades',
    //     ValueTraded = 'ValueTraded',
    //     Volume = 'Volume',
    //     VWAP = 'VWAP',
    // }

    // export type ComparableField = keyof typeof ComparableFieldEnum;

    export const enum TextContainsAsEnum {
        None = 'None',
        FromStart = 'FromStart',
        FromEnd = 'FromEnd',
        Exact = 'Exact',
    }
}

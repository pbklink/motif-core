export namespace ZenithScanCriteria {
    export interface NodeNamedParameters {
        readonly [key: string]: (string | number | boolean)
    }
    // export type Node<T> = [NodeType, ...(string | number | boolean | NodeNamedParameters | Node<T>)[]];

    export interface TypeMap {

    }

    export type Node<NodeType extends keyof ParamTupleMap> = [NodeType, ...ParamTupleMap[NodeType]];
    // export interface CriteriaNode<K extends keyof ParamMap> {
    //     type: K;
    //     params: ParamMap[K];
    // }

    // Logical Criteria Nodes
    export type AndNode = Node<"And">;
    export type OrNode = Node<"Or">;
    export type NotNode = Node<"Not">;

    // Matching
    export type AltCodeNode = Node<"AltCode">;
    export type AttributeNode = Node<"Attribute">;
    export type AuctionNode = Node<"Auction">;
    export type AuctionLastNode = Node<"AuctionLast">;
    export type AuctionQuantityNode = Node<"AuctionQuantity">;
    export type BestAskCountNode = Node<"BestAskCount">;
    export type BestAskPriceNode = Node<"BestAskPrice">;
    export type BestAskQuantityNode = Node<"BestAskQuantity">;
    export type BestBidCountNode = Node<"BestBidCount">;
    export type BestBidPriceNode = Node<"BestBidPrice">;
    export type BestBidQuantityNode = Node<"BestBidQuantity">;
    export type BoardNode = Node<"Board">;
    export type CallOrPutNode = Node<"CallOrPut">;
    export type CategoryNode = Node<"Category">;
    export type CFINode = Node<"CFI">;
    export type ClassNode = Node<"Class">;
    export type ClosePriceNode = Node<"ClosePrice">;
    export type CodeNode = Node<"Code">;
    export type ContractSizeNode = Node<"ContractSize">;
    export type CurrencyNode = Node<"Currency">;
    export type DataNode = Node<"Data">;
    export type DateNode = Node<"Date">;
    export type ExerciseTypeNode = Node<"ExerciseType">;
    export type ExchangeNode = Node<"Exchange">;
    export type ExpiryDateNode = Node<"ExpiryDate">;
    export type HighPriceNode = Node<"HighPrice">;
    export type IsIndexNode = Node<"IsIndex">;
    export type LegNode = Node<"Leg">;
    export type LastPriceNode = Node<"LastPrice">;
    export type LotSizeNode = Node<"LotSize">;
    export type LowPriceNode = Node<"LowPrice">;
    export type MarketNode = Node<"Market">;
    export type NameNode = Node<"Name">;
    export type OpenInterestNode = Node<"OpenInterest">;
    export type OpenPriceNode = Node<"OpenPrice">;
    export type PriceNode = Node<"Price">;
    export type PreviousCloseNode = Node<"PreviousClose">;
    export type QuotationBasisNode = Node<"QuotationBasis">;
    export type RemainderNode = Node<"Remainder">;
    export type ShareIssueNode = Node<"ShareIssue">;
    export type StateNode = Node<"State">;
    export type StateAllowsNode = Node<"StateAllows">;
    export type StatusNoteNode = Node<"StatusNote">;
    export type StrikePriceNode = Node<"StrikePrice">;
    export type TradesNode = Node<"Trades">;
    export type TradingMarketNode = Node<"TradingMarket">;
    export type ValueTradedNode = Node<"ValueTraded">;
    export type VolumeNode = Node<"Volume">;
    export type VWAPNode = Node<"VWAP">;

    // Comparison
    export type EqualNode = Node<"=">;
    export type GreaterThanNode = Node<">">;
    export type GreaterThanOrEqualNode = Node<">=">;
    export type LessThanNode = Node<"<">;
    export type LessThanOrEqualNode = Node<"<=">;
    export type AllNode = Node<"All">;
    export type NoneNode = Node<"None">;

    // Binary
    export type AddNode = Node<"Add">;
    export type SymbolDivNode = Node<"/">;
    export type DivNode = Node<"Div">;
    export type SymbolModNode = Node<"%">;
    export type ModNode = Node<"Mod">;
    export type SymbolMulNode = Node<"*">;
    export type MulNode = Node<"Mul">;
    export type SubNode = Node<"Sub">;

    // Unary
    export type NegNode = Node<"Neg">;
    export type PosNode = Node<"Pos">;
    export type AbsNode = Node<"Abs">;

    // Unary or Binary (depending on number of params)
    export type SymbolSubNegNode = Node<"-">;
    export type SymbolAddPosNode = Node<"+">;

    export type LogicalNode =
        AndNode | OrNode | NotNode;

    export type PretendLogicalNode = [type: string, ...params: boolean[]];

    export type MatchingNode =
        AltCodeNode |
        AttributeNode |
        AuctionNode |
        AuctionLastNode |
        AuctionQuantityNode |
        BestAskCountNode |
        BestAskPriceNode |
        BestAskQuantityNode |
        BestBidCountNode |
        BestBidPriceNode |
        BestBidQuantityNode |
        BoardNode |
        CallOrPutNode |
        CategoryNode |
        CFINode |
        ClassNode |
        ClosePriceNode |
        CodeNode |
        ContractSizeNode |
        CurrencyNode |
        DataNode |
        DateNode |
        ExerciseTypeNode |
        ExchangeNode |
        ExpiryDateNode |
        HighPriceNode |
        IsIndexNode |
        LegNode |
        LastPriceNode |
        LotSizeNode |
        LowPriceNode |
        MarketNode |
        NameNode |
        OpenInterestNode |
        OpenPriceNode |
        PriceNode |
        PreviousCloseNode |
        QuotationBasisNode |
        RemainderNode |
        ShareIssueNode |
        StateNode |
        StateAllowsNode |
        StatusNoteNode |
        StrikePriceNode |
        TradesNode |
        TradingMarketNode |
        ValueTradedNode |
        VolumeNode |
        VWAPNode;

    export type PretendMatchingNode = [type: string, ...params: unknown[]];

    export type ComparisonNode =
        EqualNode |
        GreaterThanNode |
        GreaterThanOrEqualNode |
        LessThanNode |
        LessThanOrEqualNode |
        AllNode |
        NoneNode;

    export type PretendComparisonNode = [type: string, leftParam: number, rightParam: number];

    export type BinaryExpressionNode =
        AddNode |
        SymbolDivNode |
        DivNode |
        SymbolModNode |
        ModNode |
        SymbolMulNode |
        MulNode |
        SubNode;

    export type PretendBinaryExpressionNode = [type: string, leftParam: number, rightParam: number];

    export type UnaryExpressionNode =
        NegNode |
        PosNode |
        AbsNode;

    export type PretendUnaryExpressionNode = [type: string, param: number];

    export type UnaryOrBinaryExpressionNode =
        SymbolSubNegNode |
        SymbolAddPosNode;

    export type PretendUnaryOrBinaryExpressionNode = [type: string, param: number, param?: number];

    export type SymbolFieldNode = string;

    export type BooleanNode = PretendLogicalNode | PretendMatchingNode | PretendComparisonNode;

    export type NumericNode = PretendUnaryExpressionNode | PretendBinaryExpressionNode | SymbolFieldNode;

    export type NumericParam = number | NumericNode;

    export type NoParams = [];
    // export type UnlimitedBooleanParam = [... (boolean | LogicalCriteriaNode)[]];
    // export type SingleBooleanParam = [boolean | LogicalCriteriaNode];
    export type SingleNumericParam = [left: number | NumericNode];
    export type LeftRightNumericParams = [left: number | NumericNode, right: number | NumericNode];
    export type SingleOrLeftRightNumericParams = SingleNumericParam | LeftRightNumericParams;

    // export type LogicalParam = boolean | BooleanNode;
    // export interface LogicalParamArray extends Array<LogicalParam> {}
    // export type LogicalParams = [...LogicalParamArray[]];
    export type LogicalParams = [...(boolean | BooleanNode)[]];
    export type NamedTextParams = [];
    export type NumericRangeParams = [];
    export type NumericNamedRangeParams = [];
    export type DateRangeParams = [];
    export type DateNamedRangeParams = [];
    export type TextSingleParams = [];
    export type TextDefaultSingleParams = [];
    export type TextExistsSingleParams = [];
    export type TextParams = [];

    export interface ParamTupleMap {
        // Logical
        "And": LogicalParams;
        "Not": LogicalParams;
        "Or": LogicalParams;

        // Matching
        "AltCode": NamedTextParams;
        "Attribute": NamedTextParams;
        "Auction": NumericRangeParams;
        "AuctionLast": NumericRangeParams;
        "AuctionQuantity": NumericRangeParams;
        "BestAskCount": NumericRangeParams;
        "BestAskPrice": NumericRangeParams;
        "BestAskQuantity": NumericRangeParams;
        "BestBidCount": NumericRangeParams;
        "BestBidPrice": NumericRangeParams;
        "BestBidQuantity": NumericRangeParams;
        "Board": TextSingleParams;
        "CallOrPut": TextExistsSingleParams;
        "Category": TextSingleParams;
        "CFI": TextSingleParams;
        "Class": TextSingleParams;
        "ClosePrice": NumericRangeParams;
        "Code": TextParams;
        "ContractSize": NumericRangeParams;
        "Currency": TextSingleParams;
        "Data": TextSingleParams;
        "Date": DateNamedRangeParams;
        "ExerciseType": TextExistsSingleParams;
        "Exchange": TextSingleParams;
        "ExpiryDate": DateRangeParams;
        "HighPrice": NumericRangeParams;
        "IsIndex": TextDefaultSingleParams;
        "Leg": TextSingleParams;
        "LastPrice": NumericRangeParams;
        "LotSize": NumericRangeParams;
        "LowPrice": NumericRangeParams;
        "Market": TextSingleParams;
        "Name": TextParams;
        "OpenInterest": NumericRangeParams;
        "OpenPrice": NumericRangeParams;
        "Price": NumericNamedRangeParams;
        "PreviousClose": NumericRangeParams;
        "QuotationBasis": TextSingleParams;
        "Remainder": NumericRangeParams;
        "ShareIssue": NumericRangeParams;
        "State": TextSingleParams;
        "StateAllows": TextSingleParams;
        "StatusNote": TextSingleParams;
        "StrikePrice": NumericRangeParams;
        "Trades": NumericRangeParams;
        "TradingMarket": TextSingleParams;
        "ValueTraded": NumericRangeParams;
        "Volume": NumericRangeParams;
        "VWAP": NumericRangeParams;

        // Comparison
        "=": LeftRightNumericParams;
        ">": LeftRightNumericParams;
        ">=": LeftRightNumericParams;
        "<": LeftRightNumericParams;
        "<=": LeftRightNumericParams;
        "All": NoParams;
        "None": NoParams;

        // Binary
        "Add": LeftRightNumericParams;
        "/": LeftRightNumericParams;
        "Div": LeftRightNumericParams;
        "%": LeftRightNumericParams;
        "Mod": LeftRightNumericParams;
        "*": LeftRightNumericParams;
        "Mul": LeftRightNumericParams;
        "Sub": LeftRightNumericParams;

        // Unary
        "Neg": SingleNumericParam;
        "Pos": SingleNumericParam;
        "Abs": SingleNumericParam;

        // Unary or Binary (depending on number of params)
        "-": SingleOrLeftRightNumericParams;
        "+": SingleOrLeftRightNumericParams;
    }
}


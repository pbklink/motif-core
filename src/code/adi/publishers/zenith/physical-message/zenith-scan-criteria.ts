export namespace ZenithScanCriteria {
    // Due to TypeScript not supporting Circular References in some scenarios, we need a hack types to
    // work around this issue.  The hack types can be cast to their actual types at run time

    export type DateString = string;

    export type Node<NodeType extends keyof ParamTupleMap> = [NodeType, ...ParamTupleMap[NodeType]];

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

    export const enum NoParamNode {
        // AltCode = "AltCode",
        // Attribute = "Attribute",
        // Auction = "Auction",
        AuctionLast = "AuctionLast",
        AuctionQuantity = "AuctionQuantity",
        BestAskCount = "BestAskCount",
        BestAskPrice = "BestAskPrice",
        BestAskQuantity = "BestAskQuantity",
        BestBidCount = "BestBidCount",
        BestBidPrice = "BestBidPrice",
        BestBidQuantity = "BestBidQuantity",
        Board = "Board",
        CallOrPut = "CallOrPut",
        Category = "Category",
        CFI = "CFI",
        Class = "Class",
        ClosePrice = "ClosePrice",
        Code = "Code",
        ContractSize = "ContractSize",
        Currency = "Currency",
        Data = "Data",
        // Date = "Date",
        ExerciseType = "ExerciseType",
        Exchange = "Exchange",
        ExpiryDate = "ExpiryDate",
        HighPrice = "HighPrice",
        IsIndex = "IsIndex",
        Leg = "Leg",
        LastPrice = "LastPrice",
        LotSize = "LotSize",
        LowPrice = "LowPrice",
        Market = "Market",
        Name = "Name",
        OpenInterest = "OpenInterest",
        OpenPrice = "OpenPrice",
        // Price = "Price",
        PreviousClose = "PreviousClose",
        QuotationBasis = "QuotationBasis",
        Remainder = "Remainder",
        ShareIssue = "ShareIssue",
        State = "State",
        StateAllows = "StateAllows",
        StatusNote = "StatusNote",
        StrikePrice = "StrikePrice",
        Trades = "Trades",
        TradingMarket = "TradingMarket",
        ValueTraded = "ValueTraded",
        Volume = "Volume",
        VWAP = "VWAP",
    }

    export type LogicalNode = AndNode | OrNode | NotNode;
    export type HackLogicalNode = [type: string, ...params: unknown[]];

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

    export type HackMatchingNode = [type: string, param1?: unknown, param2?: unknown, param3?: unknown, param4?: unknown, param5?: unknown];

    export type ComparisonNode =
        EqualNode |
        GreaterThanNode |
        GreaterThanOrEqualNode |
        LessThanNode |
        LessThanOrEqualNode;

    export type HackComparisonNode = [type: string, leftParam: unknown, rightParam: unknown];

    export type AllNoneNode =
        AllNode |
        NoneNode;

    export type BinaryExpressionNode =
        AddNode |
        SymbolDivNode |
        DivNode |
        SymbolModNode |
        ModNode |
        SymbolMulNode |
        MulNode |
        SubNode;

    export type HackBinaryExpressionNode = [type: string, leftParam: unknown, rightParam: unknown];

    export type UnaryExpressionNode =
        NegNode |
        PosNode |
        AbsNode;

    export type HackUnaryExpressionNode = [type: string, param: unknown];

    export type UnaryOrBinaryExpressionNode =
        SymbolSubNegNode |
        SymbolAddPosNode;

    export type HackUnaryOrBinaryExpressionNode = [type: string, param: unknown, param?: unknown];

    export type BooleanNode = LogicalNode | MatchingNode | ComparisonNode | AllNoneNode| NoParamNode;
    export type HackBooleanNode = HackLogicalNode | HackMatchingNode | HackComparisonNode | AllNoneNode| NoParamNode;
    export type NumericNode = UnaryExpressionNode | BinaryExpressionNode | UnaryOrBinaryExpressionNode | NoParamNode;
    export type HackNumericNode = HackUnaryExpressionNode | HackBinaryExpressionNode | HackUnaryOrBinaryExpressionNode | NoParamNode;

    export type NoParams = [];
    export type LogicalParams = (boolean | BooleanNode)[];
    export type HackLogicalParams = (boolean | HackBooleanNode)[];

    export type NumericParam = number | NumericNode;
    export type HackNumericParam = number | HackNumericNode;
    export type SingleNumericParam = [value: NumericParam];
    export type HackSingleNumericParam = [value: HackNumericParam];
    export type LeftRightNumericParams = [left: NumericParam, right: NumericParam];
    export type HackLeftRightNumericParams = [left: HackNumericParam, right: HackNumericParam];
    export type SingleOrLeftRightNumericParams = SingleNumericParam | LeftRightNumericParams;
    export type HackSingleOrLeftRightNumericParams = HackSingleNumericParam | HackLeftRightNumericParams;

    export type TextParams_FirstForm = [name: string]; // exists
    export type TextParams_SecondForm = [name: string, value: string]; // Contains
    export type TextParams_ThirdForm = [name: string, value: string, as?: string, ignoreCase?: boolean]; // Advanced contains
    export type TextParams_FourthForm = [name: string, value: string, namedParameters: { As?: string, IgnoreCase?: boolean}];
    export type TextParams = TextParams_FirstForm | TextParams_SecondForm | TextParams_ThirdForm | TextParams_FourthForm;

    export type NamedTextParams_FirstForm = [name: string, subName: string]; // exists
    export type NamedTextParams_SecondForm = [name: string, subName: string, value: string]; // Contains
    export type NamedTextParams_ThirdForm = [name: string, subName: string, value: string, as?: string, ignoreCase?: boolean]; // Advanced contains
    export type NamedTextParams_FourthForm = [name: string, subName: string, value: string, namedParameters: { As?: string, IgnoreCase?: boolean}];
    export type NamedTextParams = NamedTextParams_FirstForm | NamedTextParams_SecondForm | NamedTextParams_ThirdForm | NamedTextParams_FourthForm;

    export type NumericRangeParams_FirstForm = [name: string]; // exists
    export type NumericRangeParams_SecondForm = [name: string, value: number]; // equals
    export type NumericRangeParams_ThirdForm = [name: string, min: number | null, max: number | null]; // in range
    export type NumericRangeParams_ForthForm_Equals = [name: string, value: { At: number }]; // equals
    export type NumericRangeParams_ForthForm_GreaterThanOrEqual = [name: string, value: { Min: number }]; // greater than or equal
    export type NumericRangeParams_ForthForm_LessThanOrEqual = [name: string, value: { Max: number }]; // less than or equal
    export type NumericRangeParams_ForthForm_InRange = [name: string, value: { Min: number, Max: number }]; // In range
    export type NumericRangeParams =
        NumericRangeParams_FirstForm |
        NumericRangeParams_SecondForm |
        NumericRangeParams_ThirdForm |
        NumericRangeParams_ForthForm_Equals |
        NumericRangeParams_ForthForm_GreaterThanOrEqual |
        NumericRangeParams_ForthForm_LessThanOrEqual |
        NumericRangeParams_ForthForm_InRange;

    export type NumericNamedRangeParams_FirstForm = [name: string, subName: string]; // exists
    export type NumericNamedRangeParams_SecondForm = [name: string, subName: string, value: number]; // equals
    export type NumericNamedRangeParams_ThirdForm = [name: string, subName: string, min: number | null, max: number | null]; // in range
    export type NumericNamedRangeParams_ForthForm_Equals = [name: string, subName: string, value: { At: number }]; // equals
    export type NumericNamedRangeParams_ForthForm_GreaterThanOrEqual = [name: string, subName: string, value: { Min: number }]; // greater than or equal
    export type NumericNamedRangeParams_ForthForm_LessThanOrEqual = [name: string, subName: string, value: { Max: number }]; // less than or equal
    export type NumericNamedRangeParams_ForthForm_InRange = [name: string, subName: string, value: { Min: number, Max: number }]; // In range
    export type NumericNamedRangeParams =
        NumericNamedRangeParams_FirstForm |
        NumericNamedRangeParams_SecondForm |
        NumericNamedRangeParams_ThirdForm |
        NumericNamedRangeParams_ForthForm_Equals |
        NumericNamedRangeParams_ForthForm_GreaterThanOrEqual |
        NumericNamedRangeParams_ForthForm_LessThanOrEqual |
        NumericNamedRangeParams_ForthForm_InRange;

    export type DateRangeParams_FirstForm = [name: string]; // exists
    export type DateRangeParams_SecondForm = [name: string, value: DateString]; // equals
    export type DateRangeParams_ThirdForm = [name: string, min: DateString | null, max: DateString | null]; // in range
    export type DateRangeParams_ForthForm_Equals = [name: string, value: { At: DateString }]; // equals
    export type DateRangeParams_ForthForm_GreaterThanOrEqual = [name: string, value: { Min: DateString }]; // greater than or equal
    export type DateRangeParams_ForthForm_LessThanOrEqual = [name: string, value: { Max: DateString }]; // less than or equal
    export type DateRangeParams_ForthForm_InRange = [name: string, value: { Min: DateString, Max: DateString }]; // In range
    export type DateRangeParams =
        DateRangeParams_FirstForm |
        DateRangeParams_SecondForm |
        DateRangeParams_ThirdForm |
        DateRangeParams_ForthForm_Equals |
        DateRangeParams_ForthForm_GreaterThanOrEqual |
        DateRangeParams_ForthForm_LessThanOrEqual |
        DateRangeParams_ForthForm_InRange;

    export type DateNamedRangeParams_FirstForm = [name: string, subName: string]; // exists
    export type DateNamedRangeParams_SecondForm = [name: string, subName: string, value: DateString]; // equals
    export type DateNamedRangeParams_ThirdForm = [name: string, subName: string, min: DateString | null, max: DateString | null]; // in range
    export type DateNamedRangeParams_ForthForm_Equals = [name: string, subName: string, value: { At: DateString }]; // equals
    export type DateNamedRangeParams_ForthForm_GreaterThanOrEqual = [name: string, subName: string, value: { Min: DateString }]; // greater than or equal
    export type DateNamedRangeParams_ForthForm_LessThanOrEqual = [name: string, subName: string, value: { Max: DateString }]; // less than or equal
    export type DateNamedRangeParams_ForthForm_InRange = [name: string, subName: string, value: { Min: DateString, Max: DateString }]; // In range
    export type DateNamedRangeParams =
        DateNamedRangeParams_FirstForm |
        DateNamedRangeParams_SecondForm |
        DateNamedRangeParams_ThirdForm |
        DateNamedRangeParams_ForthForm_Equals |
        DateNamedRangeParams_ForthForm_GreaterThanOrEqual |
        DateNamedRangeParams_ForthForm_LessThanOrEqual |
        DateNamedRangeParams_ForthForm_InRange;

    export type SingleParam_EqualsValue = [value: boolean | number | string]; // equals
    export type SingleParam_EqualsDefault = []; // equals default
    export type SingleParam_IsSet = []; // is set
    export type SingleParam = SingleParam_EqualsValue; // equals value or equals default
    export type SingleParam_Default = SingleParam_EqualsValue | SingleParam_EqualsDefault; // equals value or equals default
    export type SingleParam_Exists = SingleParam_EqualsValue | SingleParam_IsSet; // equals value or is set

    export interface ParamTupleMap {
        // Logical
        "And": HackLogicalParams;
        "Not": HackLogicalParams;
        "Or": HackLogicalParams;

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
        "Board": SingleParam;
        "CallOrPut": SingleParam_Exists;
        "Category": SingleParam;
        "CFI": SingleParam;
        "Class": SingleParam;
        "ClosePrice": NumericRangeParams;
        "Code": TextParams;
        "ContractSize": NumericRangeParams;
        "Currency": SingleParam;
        "Data": SingleParam;
        "Date": DateNamedRangeParams;
        "ExerciseType": SingleParam_Exists;
        "Exchange": SingleParam;
        "ExpiryDate": DateRangeParams;
        "HighPrice": NumericRangeParams;
        "IsIndex": SingleParam_Default;
        "Leg": SingleParam;
        "LastPrice": NumericRangeParams;
        "LotSize": NumericRangeParams;
        "LowPrice": NumericRangeParams;
        "Market": SingleParam;
        "Name": TextParams;
        "OpenInterest": NumericRangeParams;
        "OpenPrice": NumericRangeParams;
        "Price": NumericNamedRangeParams;
        "PreviousClose": NumericRangeParams;
        "QuotationBasis": SingleParam;
        "Remainder": NumericRangeParams;
        "ShareIssue": NumericRangeParams;
        "State": SingleParam;
        "StateAllows": SingleParam;
        "StatusNote": SingleParam;
        "StrikePrice": NumericRangeParams;
        "Trades": NumericRangeParams;
        "TradingMarket": SingleParam;
        "ValueTraded": NumericRangeParams;
        "Volume": NumericRangeParams;
        "VWAP": NumericRangeParams;

        // Comparison
        "=": HackLeftRightNumericParams;
        ">": HackLeftRightNumericParams;
        ">=": HackLeftRightNumericParams;
        "<": HackLeftRightNumericParams;
        "<=": HackLeftRightNumericParams;
        "All": NoParams;
        "None": NoParams;

        // Binary
        "Add": HackLeftRightNumericParams;
        "/": HackLeftRightNumericParams;
        "Div": HackLeftRightNumericParams;
        "%": HackLeftRightNumericParams;
        "Mod": HackLeftRightNumericParams;
        "*": HackLeftRightNumericParams;
        "Mul": HackLeftRightNumericParams;
        "Sub": HackLeftRightNumericParams;

        // Unary
        "Neg": HackSingleNumericParam;
        "Pos": HackSingleNumericParam;
        "Abs": HackSingleNumericParam;

        // Unary or Binary (depending on number of params)
        "-": HackSingleOrLeftRightNumericParams;
        "+": HackSingleOrLeftRightNumericParams;
    }
}

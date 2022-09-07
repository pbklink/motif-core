/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export namespace ScanCriteria {
    export interface CriteriaNode<K extends keyof ParamMap> {
        type: K;
        params: ParamMap[K];
    }

    // Logical Criteria Nodes
    export type AndCriteriaNode = CriteriaNode<"And">;
    export type OrCriteriaNode = CriteriaNode<"Or">;
    export type NotCriteriaNode = CriteriaNode<"Not">;

    // Unary Expression Criteria Nodes
    export type AddNode = CriteriaNode<"Add">;
    // export type AddNode = CriteriaNode<"+">;

    // Unary Expression Criteria Nodes
    export type NegateNode = CriteriaNode<"-">;
    export type AbsoluteNode = CriteriaNode<"Abs">;

    export type LogicalCriteriaNode = AndCriteriaNode | OrCriteriaNode | NotCriteriaNode;
    export type BinaryExpressionNode = AddNode;
    export type UnaryExpressionNode = NegateNode | AbsoluteNode;


    export type SymbolFieldNode = string;

    export type NumericNode = UnaryExpressionNode | BinaryExpressionNode | SymbolFieldNode;

    export type NumericParam = number | NumericNode;

    export type NoParams = [];
    export type UnlimitedBooleanParam = [... (boolean | LogicalCriteriaNode)[]];
    export type SingleBooleanParam = [boolean | LogicalCriteriaNode];
    export type SingleNumericParam = [left: number | NumericNode];
    export type LeftRightNumericParams = [left: number | NumericNode, right: number | NumericNode];
    export type SingleOrLeftRightNumericParams = SingleNumericParam | LeftRightNumericParams;

    export interface ParamMap {
        // Binary
        "And": UnlimitedBooleanParam;
        "Or": UnlimitedBooleanParam;
        "Not": SingleBooleanParam;
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

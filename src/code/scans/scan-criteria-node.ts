/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';

export const enum ScanCriteriaNodeTypeId {
    // Boolean
    And,
    Or,
    Not,

    // Comparison
    Equals,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    All,
    None,

    // Binary arithmetic operations
    Add,
    Div,
    Mod,
    Mul,
    Sub,

    // Unary arithmetic operations
    Neg,
    Pos,
    Abs,

    // Get Field Value
    GetDecimalFieldValue,
    GetDecimalSubFieldValue,
    GetDateFieldValue,
    GetDateSubFieldValue,

    // Field Comparison
    FieldHasValue,
    BooleanFieldEquals,
    DecimalFieldEquals,
    DecimalFieldInRange,
    DateFieldEquals,
    DateFieldInRange,
    StringFieldContains,
    SubFieldHasValue,
    DecimalSubFieldEquals,
    DecimalSubFieldInRange,
    DateSubFieldEquals,
    DateSubFieldInRange,
    StringSubFieldContains,
}

export abstract class ScanCriteriaNode {
    typeId: ScanCriteriaNodeTypeId;
}

// All scan criteria which return a boolean descend from this
export abstract class BooleanScanCriteriaNode extends ScanCriteriaNode {

}

export abstract class ZeroOperandBooleanScanCriteriaNode extends BooleanScanCriteriaNode {
}

export abstract class SingleOperandBooleanScanCriteriaNode extends BooleanScanCriteriaNode {
    operand: BooleanScanCriteriaNode;
}

export abstract class LeftRightOperandBooleanScanCriteriaNode extends BooleanScanCriteriaNode {
    leftOperand: BooleanScanCriteriaNode;
    rightOperand: BooleanScanCriteriaNode;
}

export abstract class MultiOperandBooleanScanCriteriaNode extends BooleanScanCriteriaNode {
    operands: BooleanScanCriteriaNode[];
}

export class NoneScanCriteriaNode extends ZeroOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.None;
}

export class AllScanCriteriaNode extends ZeroOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.All;
}

export class NotScanCriteriaNode extends SingleOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Not;
}

export class EqualsScanCriteriaNode extends LeftRightOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Equals;
}

export class GreaterThanScanCriteriaNode extends LeftRightOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.GreaterThan;
}

export class GreaterThanOrEqualScanCriteriaNode extends LeftRightOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.GreaterThanOrEqual;
}

export class LessThanScanCriteriaNode extends LeftRightOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.LessThan;
}

export class LessThanOrEqualScanCriteriaNode extends LeftRightOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.LessThanOrEqual;
}

export class AndScanCriteriaNode extends MultiOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.And;
}

export class OrScanCriteriaNode extends MultiOperandBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Or;
}

export abstract class FieldBooleanScanCriteriaNode extends BooleanScanCriteriaNode {
    fieldName: string;
}

export class FieldHasValueScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.FieldHasValue;
}

export class BooleanFieldEqualsScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.BooleanFieldEquals;
    target: boolean | BooleanScanCriteriaNode;
}

export class DecimalFieldEqualsScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DecimalFieldEquals;
    target: Decimal | DecimalScanCriteriaNode;
}

export class DecimalFieldInRangeScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DecimalFieldInRange;
    min: Decimal | null | DecimalScanCriteriaNode;
    max: Decimal | null | DecimalScanCriteriaNode;
}

export class DateFieldEqualsScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DateFieldEquals;
    target: Date | DateScanCriteriaNode;
}

export class DateFieldInRangeScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DateFieldInRange;
    min: Date | null | DateScanCriteriaNode;
    max: Date | null | DateScanCriteriaNode;
}

export class StringFieldContainsScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.StringFieldContains;
    value: string;
    as: StringFieldContainsAs;
    ignoreCase: boolean;
}

export abstract class SubFieldBooleanScanCriteriaNode extends FieldBooleanScanCriteriaNode {
    subFieldName: string;
}

export class SubFieldHasValueScanCriteriaNode extends SubFieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.FieldHasValue;
}

export class DecimalSubFieldEqualsScanCriteriaNode extends SubFieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DecimalSubFieldEquals;
    target: Decimal | DecimalScanCriteriaNode;
}

export class DecimalSubFieldInRangeScanCriteriaNode extends SubFieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DecimalSubFieldInRange;
    min: Decimal | null | DecimalScanCriteriaNode;
    max: Decimal | null | DecimalScanCriteriaNode;
}

export class DateSubFieldEqualsScanCriteriaNode extends SubFieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DateSubFieldEquals;
    target: Date | DateScanCriteriaNode;
}

export class DateSubFieldInRangeScanCriteriaNode extends SubFieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.DateSubFieldInRange;
    min: Date | null | DateScanCriteriaNode;
    max: Date | null | DateScanCriteriaNode;
}

export class StringSubFieldContainsScanCriteriaNode extends SubFieldBooleanScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.StringSubFieldContains;
    value: string;
    as: StringFieldContainsAs;
    ignoreCase: boolean;
}

// All scan criteria which return a Decimal descend from this
export abstract class DecimalScanCriteriaNode extends ScanCriteriaNode {

}

export abstract class UnaryArithmeticScanCriteriaNode extends DecimalScanCriteriaNode {
    operand: Decimal | DecimalScanCriteriaNode;
}

export class NegScanCriteriaNode extends UnaryArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Neg;
}

export class PosScanCriteriaNode extends UnaryArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Pos;
}

export class AbsScanCriteriaNode extends UnaryArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Abs;
}

export abstract class LeftRightArithmeticScanCriteriaNode extends DecimalScanCriteriaNode {
    leftOperand: Decimal | DecimalScanCriteriaNode;
    rightOperand: Decimal | DecimalScanCriteriaNode;
}

export class AddScanCriteriaNode extends LeftRightArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Add;
}

export class DivScanCriteriaNode extends LeftRightArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Div;
}

export class ModScanCriteriaNode extends LeftRightArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Mod;
}

export class MulScanCriteriaNode extends LeftRightArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Mul;
}

export abstract class SubScanCriteriaNode extends LeftRightArithmeticScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.Sub;
}

export class GetDecimalFieldValue extends DecimalScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.GetDecimalFieldValue;
    fieldName: string;
}

export class GetDecimalSubFieldValue extends DecimalScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.GetDecimalSubFieldValue;
    fieldName: string;
    subFieldName: string;
}

// All scan criteria which return a Date descend from this
export abstract class DateScanCriteriaNode extends ScanCriteriaNode {

}

export class GetDateFieldValue extends DateScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.GetDateFieldValue;
    fieldName: string;
}

export class GetDateSubFieldValue extends DateScanCriteriaNode {
    override typeId: ScanCriteriaNodeTypeId.GetDateSubFieldValue;
    fieldName: string;
    subFieldName: string;
}

export const enum StringFieldContainsAs {
    None,
    FromStart,
    FromEnd,
    Exact,
}

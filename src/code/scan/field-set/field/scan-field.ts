/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { ScanFieldTypeId } from '../common/internal-api';
import {
    AltCodeSubbedScanFieldCondition,
    AttributeSubbedScanFieldCondition,
    BoardOverlapsScanFieldCondition,
    CurrencyOverlapsScanFieldCondition,
    DateScanFieldCondition,
    DateSubbedScanFieldCondition,
    ExchangeOverlapsScanFieldCondition,
    IsScanFieldCondition,
    MarketOverlapsScanFieldCondition,
    NumericScanFieldCondition,
    PriceSubbedScanFieldCondition,
    ScanFieldCondition,
    StringOverlapsScanFieldCondition,
    TextEqualsSingleScanFieldCondition,
    TextExistsSingleScanFieldCondition,
    TextScanFieldCondition
} from './condition/internal-api';

export interface ScanField {
    readonly typeId: ScanFieldTypeId;
    readonly conditions: ScanField.Conditions;

    conditionsOperationId: ScanField.BooleanOperationId;
}

export namespace ScanField {
    // Implementable by ComparableList
    export interface Conditions {
        readonly count: Integer;
        capacity: Integer;

        getAt(index: Integer): ScanFieldCondition;
        clear(): void;
        add(condition: ScanFieldCondition): Integer;
    }

    export interface TypedConditions<T extends ScanFieldCondition> extends Conditions {
        getAt(index: Integer): T;
        add(condition: T): Integer;
    }

    export const enum BooleanOperationId {
        Or,
        And,
        Xor, // only possible if exactly 2 conditions - converted to 'Or' if not 2 conditions
    }

    export namespace BooleanOperation {
        export function getAllIds() {
            return [
                BooleanOperationId.Or,
                BooleanOperationId.And,
                BooleanOperationId.Xor,
            ];
        }
    }

    export function isEqual(left: ScanField, right: ScanField) {
        if (left.typeId !== right.typeId) {
            return false; // This will only occur if a Field is not set up correctly
        } else {
            if (left.conditionsOperationId !== right.conditionsOperationId) {
                return false;
            } else {
                const leftConditions = left.conditions;
                const leftConditionCount = leftConditions.count;
                const rightConditions = right.conditions;
                const rightConditionCount = rightConditions.count;
                if (leftConditionCount !== rightConditionCount) {
                    return false;
                } else {
                    for (let i = 0; i < leftConditionCount; i++) {
                        switch (left.typeId) {
                            case ScanFieldTypeId.Numeric: return NumericScanField.isConditionEqual(left as NumericScanField, right as NumericScanField, i);
                            case ScanFieldTypeId.PriceSubbed: return PriceSubbedScanField.isConditionEqual(left as PriceSubbedScanField, right as PriceSubbedScanField, i);
                            case ScanFieldTypeId.Date: return DateScanField.isConditionEqual(left as DateScanField, right as DateScanField, i);
                            case ScanFieldTypeId.DateSubbed: return DateSubbedScanField.isConditionEqual(left as DateSubbedScanField, right as DateSubbedScanField, i);
                            case ScanFieldTypeId.Text: return TextScanField.isConditionEqual(left as TextScanField, right as TextScanField, i);
                            case ScanFieldTypeId.AltCodeSubbed: return AltCodeSubbedScanField.isConditionEqual(left as AltCodeSubbedScanField, right as AltCodeSubbedScanField, i);
                            case ScanFieldTypeId.AttributeSubbed: return AttributeSubbedScanField.isConditionEqual(left as AttributeSubbedScanField, right as AttributeSubbedScanField, i);
                            case ScanFieldTypeId.TextEqualsSingle: return TextEqualsSingleScanField.isConditionEqual(left as TextEqualsSingleScanField, right as TextEqualsSingleScanField, i);
                            case ScanFieldTypeId.TextExistsSingle: return TextExistsSingleScanField.isConditionEqual(left as TextExistsSingleScanField, right as TextExistsSingleScanField, i);
                            case ScanFieldTypeId.StringOverlaps: return StringOverlapsScanField.isConditionEqual(left as StringOverlapsScanField, right as StringOverlapsScanField, i);
                            case ScanFieldTypeId.BoardOverlaps: return BoardOverlapsScanField.isConditionEqual(left as BoardOverlapsScanField, right as BoardOverlapsScanField, i);
                            case ScanFieldTypeId.CurrencyOverlaps: return CurrencyOverlapsScanField.isConditionEqual(left as CurrencyOverlapsScanField, right as CurrencyOverlapsScanField, i);
                            case ScanFieldTypeId.ExchangeOverlaps: return ExchangeOverlapsScanField.isConditionEqual(left as ExchangeOverlapsScanField, right as ExchangeOverlapsScanField, i);
                            case ScanFieldTypeId.MarketOverlaps: return MarketOverlapsScanField.isConditionEqual(left as MarketOverlapsScanField, right as MarketOverlapsScanField, i);
                            case ScanFieldTypeId.Is: return IsScanField.isConditionEqual(left as IsScanField, right as IsScanField, i);
                            default:
                                throw new UnreachableCaseError('SFSFIS45071', left.typeId);
                        }
                    }

                    return true;
                }
            }
        }
    }

}

export interface NumericScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.Numeric;
    readonly conditions: ScanField.TypedConditions<NumericScanFieldCondition>;
}

export namespace NumericScanField {
    export function isConditionEqual(left: NumericScanField, right: NumericScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!NumericScanFieldCondition.is(leftCondition) || !NumericScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return NumericScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface PriceSubbedScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.PriceSubbed;
    readonly conditions: ScanField.TypedConditions<PriceSubbedScanFieldCondition>;
}

export namespace PriceSubbedScanField {
    export function isConditionEqual(left: PriceSubbedScanField, right: PriceSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!PriceSubbedScanFieldCondition.is(leftCondition) || !PriceSubbedScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return PriceSubbedScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface DateScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.Date;
    readonly conditions: ScanField.TypedConditions<DateScanFieldCondition>;
}

export namespace DateScanField {
    export function isConditionEqual(left: DateScanField, right: DateScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!DateScanFieldCondition.is(leftCondition) || !DateScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return DateScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface DateSubbedScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.DateSubbed;
    readonly conditions: ScanField.TypedConditions<DateSubbedScanFieldCondition>;
}

export namespace DateSubbedScanField {
    export function isConditionEqual(left: DateSubbedScanField, right: DateSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!DateSubbedScanFieldCondition.is(leftCondition) || !DateSubbedScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return DateSubbedScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.Text;
    readonly conditions: ScanField.TypedConditions<TextScanFieldCondition>;
}

export namespace TextScanField {
    export function isConditionEqual(left: TextScanField, right: TextScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextScanFieldCondition.is(leftCondition) || !TextScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface AltCodeSubbedScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.AltCodeSubbed;
    readonly conditions: ScanField.TypedConditions<AltCodeSubbedScanFieldCondition>;
}

export namespace AltCodeSubbedScanField {
    export function isConditionEqual(left: AltCodeSubbedScanField, right: AltCodeSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!AltCodeSubbedScanFieldCondition.is(leftCondition) || !AltCodeSubbedScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return AltCodeSubbedScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface AttributeSubbedScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.AttributeSubbed;
    readonly conditions: ScanField.TypedConditions<AttributeSubbedScanFieldCondition>;
}

export namespace AttributeSubbedScanField {
    export function isConditionEqual(left: AttributeSubbedScanField, right: AttributeSubbedScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!AttributeSubbedScanFieldCondition.is(leftCondition) || !AttributeSubbedScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return AttributeSubbedScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextEqualsSingleScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.TextEqualsSingle;
    readonly conditions: ScanField.TypedConditions<TextEqualsSingleScanFieldCondition>;
}

export namespace TextEqualsSingleScanField {
    export function isConditionEqual(left: TextEqualsSingleScanField, right: TextEqualsSingleScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextEqualsSingleScanFieldCondition.is(leftCondition) || !TextEqualsSingleScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextEqualsSingleScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface TextExistsSingleScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.TextExistsSingle;
    readonly conditions: ScanField.TypedConditions<TextExistsSingleScanFieldCondition>;
}

export namespace TextExistsSingleScanField {
    export function isConditionEqual(left: TextExistsSingleScanField, right: TextExistsSingleScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!TextExistsSingleScanFieldCondition.is(leftCondition) || !TextExistsSingleScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return TextExistsSingleScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface StringOverlapsScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.StringOverlaps;
    readonly conditions: ScanField.TypedConditions<StringOverlapsScanFieldCondition>;
}

export namespace StringOverlapsScanField {
    export function isConditionEqual(left: StringOverlapsScanField, right: StringOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!StringOverlapsScanFieldCondition.is(leftCondition) || !StringOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return StringOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface BoardOverlapsScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.BoardOverlaps;
    readonly conditions: ScanField.TypedConditions<BoardOverlapsScanFieldCondition>;
}

export namespace BoardOverlapsScanField {
    export function isConditionEqual(left: BoardOverlapsScanField, right: BoardOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!BoardOverlapsScanFieldCondition.is(leftCondition) || !BoardOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return BoardOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface CurrencyOverlapsScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.CurrencyOverlaps;
    readonly conditions: ScanField.TypedConditions<CurrencyOverlapsScanFieldCondition>;
}

export namespace CurrencyOverlapsScanField {
    export function isConditionEqual(left: CurrencyOverlapsScanField, right: CurrencyOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!CurrencyOverlapsScanFieldCondition.is(leftCondition) || !CurrencyOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return CurrencyOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface ExchangeOverlapsScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.ExchangeOverlaps;
    readonly conditions: ScanField.TypedConditions<ExchangeOverlapsScanFieldCondition>;
}

export namespace ExchangeOverlapsScanField {
    export function isConditionEqual(left: ExchangeOverlapsScanField, right: ExchangeOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!ExchangeOverlapsScanFieldCondition.is(leftCondition) || !ExchangeOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return ExchangeOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface MarketOverlapsScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.MarketOverlaps;
    readonly conditions: ScanField.TypedConditions<MarketOverlapsScanFieldCondition>;
}

export namespace MarketOverlapsScanField {
    export function isConditionEqual(left: MarketOverlapsScanField, right: MarketOverlapsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!MarketOverlapsScanFieldCondition.is(leftCondition) || !MarketOverlapsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return MarketOverlapsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

export interface IsScanField extends ScanField {
    readonly typeId: ScanFieldTypeId.Is;
    readonly conditions: ScanField.TypedConditions<IsScanFieldCondition>;
}

export namespace IsScanField {
    export function isConditionEqual(left: IsScanField, right: IsScanField, index: Integer): boolean {
        const leftCondition = left.conditions.getAt(index);
        const rightCondition = right.conditions.getAt(index);
        if (!IsScanFieldCondition.is(leftCondition) || !IsScanFieldCondition.is(rightCondition)) {
            return false; // only occurs if ScanFieldSet is not correctly set up
        } else {
            return IsScanFieldCondition.isEqual(leftCondition, rightCondition);
        }
    }
}

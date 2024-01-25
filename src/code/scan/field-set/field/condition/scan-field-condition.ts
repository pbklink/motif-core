/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../../../adi/adi-internal-api';
import { EnumInfoOutOfOrderError, Integer, PickEnum, SourceTzOffsetDateTime, UnreachableCaseError, isArrayEqualUniquely } from '../../../../sys/sys-internal-api';
import { ScanFormula } from '../../../formula/internal-api';
import { ScanFieldTypeId } from '../../common/internal-api';

export interface ScanFieldCondition {
    readonly typeId: ScanFieldTypeId;
    readonly fieldId: ScanFormula.FieldId | undefined;
}

export namespace ScanFieldCondition {
    export const enum OperatorId {
        HasValue,
        NotHasValue,
        Equals,
        NotEquals,
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual,
        InRange,
        NotInRange,
        Contains,
        NotContains,
        Overlaps,
        NotOverlaps,
        Is,
        NotIs,
    }

    export function isEqual(left: ScanFieldCondition, right: ScanFieldCondition) {
        return left.typeId === right.typeId && left.fieldId === right.fieldId;
    }
}

export interface BaseNumericScanFieldCondition extends ScanFieldCondition {
    fieldId: ScanFormula.NumericRangeFieldId | ScanFormula.NumericRangeSubbedFieldId,
    operatorId: BaseNumericScanFieldCondition.OperatorId;
    operands: BaseNumericScanFieldCondition.Operands;
}

export namespace BaseNumericScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.GreaterThan |
        ScanFieldCondition.OperatorId.GreaterThanOrEqual |
        ScanFieldCondition.OperatorId.LessThan |
        ScanFieldCondition.OperatorId.LessThanOrEqual |
        ScanFieldCondition.OperatorId.InRange |
        ScanFieldCondition.OperatorId.NotInRange
    >;

    export namespace Operator {
        export type Id = OperatorId;

        interface Info {
            readonly id: ScanFieldCondition.OperatorId;
            readonly operandsTypeId: Operands.TypeId | undefined;
        }

        type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
        const infosObject: InfosObject = {
            HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            NotHasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            Equals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            NotEquals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            GreaterThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            LessThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            LessThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            InRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Range },
            NotInRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Range },
            Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: undefined },
            NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: undefined },
            Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
            NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
            Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
            NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
        } as const;

        const infos = Object.values(infosObject);

        export let allIds: readonly ScanFieldCondition.OperatorId[];
        export let idCount: Integer;

        export function initialise() {
            const infoCount = infos.length;
            const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
            idCount = 0;
            for (let i = 0; i < infoCount; i++) {
                const info = infos[i];
                const id = i as OperatorId;
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('BaseNumericScanFieldCondition.OperatorId', i, i.toString());
                } else {
                    if (info.operandsTypeId !== undefined) {
                        tempAllIds[idCount++] = id;
                    }
                }
            }
            tempAllIds.length = idCount;
            allIds = tempAllIds;
        }

        export function idToOperandsTypeId(id: Id) {
            return infos[id].operandsTypeId;
        }
    }

    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export const enum TypeId {
            HasValue,
            Value,
            Range,
        }
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: Operands.TypeId.HasValue;
    }

    export interface ValueOperands extends Operands {
        readonly typeId: Operands.TypeId.Value;
        value: number;
    }

    export interface InRangeOperands extends Operands {
        readonly typeId: Operands.TypeId.Range;
        min: number | undefined;
        max: number | undefined;
    }

    export function isEqual(left: BaseNumericScanFieldCondition, right: BaseNumericScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                const leftOperands = left.operands;
                const rightOperands = right.operands;
                if (leftOperands.typeId !== rightOperands.typeId) {
                    return false;
                } else {
                    switch (leftOperands.typeId) {
                        case Operands.TypeId.HasValue: return true;
                        case Operands.TypeId.Value: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return leftValue === rightValue;
                        }
                        case Operands.TypeId.Range: {
                            const leftInRangeOperands = leftOperands as InRangeOperands;
                            const rightInRangeOperands = rightOperands as InRangeOperands;
                            return leftInRangeOperands.min === rightInRangeOperands.min && leftInRangeOperands.max === rightInRangeOperands.max;
                        }
                        default:
                            throw new UnreachableCaseError('SFCBNSFCIQ23987', leftOperands.typeId);
                    }
                }
            }
        }
    }
}

export interface NumericScanFieldCondition extends BaseNumericScanFieldCondition {
    readonly typeId: ScanFieldTypeId.Numeric;
    readonly fieldId: ScanFormula.NumericRangeFieldId,
}

export namespace NumericScanFieldCondition {
    export function is(condition: ScanFieldCondition): condition is NumericScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.Numeric;
    }

    export function isEqual(left: NumericScanFieldCondition, right: NumericScanFieldCondition): boolean {
        return BaseNumericScanFieldCondition.isEqual(left, right);
    }
}

export interface SubbedNumericScanFieldCondition extends BaseNumericScanFieldCondition {
    readonly fieldId: ScanFormula.NumericRangeSubbedFieldId,
}

export interface PriceSubbedScanFieldCondition extends SubbedNumericScanFieldCondition {
    readonly typeId: ScanFieldTypeId.PriceSubbed;
    readonly fieldId: ScanFormula.FieldId.Price,
    readonly subFieldId: ScanFormula.PriceSubFieldId;
}

export namespace PriceSubbedScanFieldCondition {
    export function is(condition: ScanFieldCondition): condition is PriceSubbedScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.PriceSubbed;
    }

    export function isEqual(left: PriceSubbedScanFieldCondition, right: PriceSubbedScanFieldCondition): boolean {
        return (
            BaseNumericScanFieldCondition.isEqual(left, right)
            &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            left.subFieldId === right.subFieldId
        );
    }
}

export interface BaseDateScanFieldCondition extends ScanFieldCondition {
    fieldId: ScanFormula.DateRangeFieldId | ScanFormula.DateRangeSubbedFieldId,
    operatorId: BaseDateScanFieldCondition.OperatorId;
    operands: BaseDateScanFieldCondition.Operands;
}

export namespace BaseDateScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.InRange |
        ScanFieldCondition.OperatorId.NotInRange
    >;

    export namespace Operator {
        export type Id = OperatorId;

        interface Info {
            readonly id: ScanFieldCondition.OperatorId;
            readonly operandsTypeId: Operands.TypeId | undefined;
        }

        type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
        const infosObject: InfosObject = {
            HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            NotHasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            Equals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            NotEquals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            GreaterThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            LessThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            LessThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            InRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Range },
            NotInRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Range },
            Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: undefined },
            NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: undefined },
            Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
            NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
            Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
            NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
        } as const;

        const infos = Object.values(infosObject);

        export let allIds: readonly ScanFieldCondition.OperatorId[];
        export let idCount: Integer;

        export function initialise() {
            const infoCount = infos.length;
            const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
            idCount = 0;
            for (let i = 0; i < infoCount; i++) {
                const info = infos[i];
                const id = i as OperatorId;
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('BaseDateScanFieldCondition.OperatorId', i, i.toString());
                } else {
                    if (info.operandsTypeId !== undefined) {
                        tempAllIds[idCount++] = id;
                    }
                }
            }
            tempAllIds.length = idCount;
            allIds = tempAllIds;
        }

        export function idToOperandsTypeId(id: Id) {
            return infos[id].operandsTypeId;
        }
    }

    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export const enum TypeId {
            HasValue,
            Value,
            Range,
        }
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: Operands.TypeId.HasValue;
    }

    export interface ValueOperands extends Operands {
        readonly typeId: Operands.TypeId.Value;
        value: SourceTzOffsetDateTime;
    }

    export interface InRangeOperands extends Operands {
        readonly typeId: Operands.TypeId.Range;
        min: SourceTzOffsetDateTime | undefined;
        max: SourceTzOffsetDateTime | undefined;
    }

    export function isEqual(left: BaseDateScanFieldCondition, right: BaseDateScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                const leftOperands = left.operands;
                const rightOperands = right.operands;
                if (leftOperands.typeId !== rightOperands.typeId) {
                    return false;
                } else {
                    switch (leftOperands.typeId) {
                        case Operands.TypeId.HasValue: return true;
                        case Operands.TypeId.Value: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return SourceTzOffsetDateTime.isEqual(leftValue, rightValue);
                        }
                        case Operands.TypeId.Range: {
                            const leftInRangeOperands = leftOperands as InRangeOperands;
                            const rightInRangeOperands = rightOperands as InRangeOperands;
                            return (
                                SourceTzOffsetDateTime.isUndefinableEqual(leftInRangeOperands.min, rightInRangeOperands.min)
                                &&
                                SourceTzOffsetDateTime.isUndefinableEqual(leftInRangeOperands.max, rightInRangeOperands.max)
                            );
                        }
                        default:
                            throw new UnreachableCaseError('SFCBDSFCIQ23987', leftOperands.typeId);
                    }
                }
            }
        }
    }
}

export interface DateScanFieldCondition extends BaseDateScanFieldCondition {
    readonly typeId: ScanFieldTypeId.Date;
    readonly fieldId: ScanFormula.DateRangeFieldId,
}

export namespace DateScanFieldCondition {
    export function is(condition: ScanFieldCondition): condition is DateScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.Date;
    }

    export function isEqual(left: DateScanFieldCondition, right: DateScanFieldCondition): boolean {
        return BaseDateScanFieldCondition.isEqual(left, right);
    }
}

export interface SubbedDateScanFieldCondition extends BaseDateScanFieldCondition {
    fieldId: ScanFormula.DateRangeSubbedFieldId,
}

export interface DateSubbedScanFieldCondition extends SubbedDateScanFieldCondition {
    readonly typeId: ScanFieldTypeId.DateSubbed;
    readonly fieldId: ScanFormula.FieldId.Date,
    readonly subFieldId: ScanFormula.DateSubFieldId;
}

export namespace DateSubbedScanFieldCondition {
    export function is(condition: ScanFieldCondition): condition is DateSubbedScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.DateSubbed;
    }

    export function isEqual(left: DateSubbedScanFieldCondition, right: DateSubbedScanFieldCondition): boolean {
        return (
            BaseDateScanFieldCondition.isEqual(left, right)
            &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            left.subFieldId === right.subFieldId
        );
    }
}

export interface BaseTextScanFieldCondition extends ScanFieldCondition {
    fieldId: ScanFormula.TextTextFieldId | ScanFormula.TextTextSubbedFieldId
    operatorId: BaseTextScanFieldCondition.OperatorId;
    operands: BaseTextScanFieldCondition.Operands;
}

export namespace BaseTextScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals |
        ScanFieldCondition.OperatorId.Contains |
        ScanFieldCondition.OperatorId.NotContains |
        ScanFieldCondition.OperatorId.Overlaps |
        ScanFieldCondition.OperatorId.NotOverlaps
    >;

    export namespace Operator {
        export type Id = OperatorId;

        interface Info {
            readonly id: ScanFieldCondition.OperatorId;
            readonly operandsTypeId: Operands.TypeId | undefined;
        }

        type InfosObject = { [id in keyof typeof ScanFieldCondition.OperatorId]: Info };
        const infosObject: InfosObject = {
            HasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            NotHasValue: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.HasValue },
            Equals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            NotEquals: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: Operands.TypeId.Value },
            GreaterThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            GreaterThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            LessThan: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            LessThanOrEqual: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            InRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            NotInRange: { id: ScanFieldCondition.OperatorId.HasValue, operandsTypeId: undefined },
            Contains: { id: ScanFieldCondition.OperatorId.Contains, operandsTypeId: undefined },
            NotContains: { id: ScanFieldCondition.OperatorId.NotContains, operandsTypeId: undefined },
            Overlaps: { id: ScanFieldCondition.OperatorId.Overlaps, operandsTypeId: undefined },
            NotOverlaps: { id: ScanFieldCondition.OperatorId.NotOverlaps, operandsTypeId: undefined },
            Is: { id: ScanFieldCondition.OperatorId.Is, operandsTypeId: undefined },
            NotIs: { id: ScanFieldCondition.OperatorId.NotIs, operandsTypeId: undefined },
        } as const;

        const infos = Object.values(infosObject);

        export let allIds: readonly ScanFieldCondition.OperatorId[];
        export let idCount: Integer;

        export function initialise() {
            const infoCount = infos.length;
            const tempAllIds = new Array<ScanFieldCondition.OperatorId>(infoCount);
            idCount = 0;
            for (let i = 0; i < infoCount; i++) {
                const info = infos[i];
                const id = i as OperatorId;
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('BaseDateScanFieldCondition.OperatorId', i, i.toString());
                } else {
                    if (info.operandsTypeId !== undefined) {
                        tempAllIds[idCount++] = id;
                    }
                }
            }
            tempAllIds.length = idCount;
            allIds = tempAllIds;
        }

        export function idToOperandsTypeId(id: Id) {
            return infos[id].operandsTypeId;
        }
    }

    export interface ContainsOperand {
        value: string;
        asId: ScanFormula.TextContainsAsId;
        ignoreCase: boolean;
    }

    export namespace ContainsOperand {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: ContainsOperand, right: ContainsOperand) {
            return left.value === right.value && left.asId === right.asId && left.ignoreCase === right.ignoreCase;
        }
    }

    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export const enum TypeId {
            HasValue,
            Value,
            Contains,
        }
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: Operands.TypeId.HasValue;
    }

    export interface ValueOperands extends Operands {
        readonly typeId: Operands.TypeId.Value;
        value: SourceTzOffsetDateTime;
    }

    export interface ContainsOperands extends Operands {
        readonly typeId: Operands.TypeId.Contains;
        contains: ContainsOperand;
    }

    export function isEqual(left: BaseTextScanFieldCondition, right: BaseTextScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                const leftOperands = left.operands;
                const rightOperands = right.operands;
                if (leftOperands.typeId !== rightOperands.typeId) {
                    return false;
                } else {
                    switch (leftOperands.typeId) {
                        case Operands.TypeId.HasValue: return true;
                        case Operands.TypeId.Value: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return leftValue === rightValue;
                        }
                        case Operands.TypeId.Contains: {
                            const leftContainsOperands = leftOperands as ContainsOperands;
                            const rightContainsOperands = rightOperands as ContainsOperands;
                            return ContainsOperand.isEqual(leftContainsOperands.contains, rightContainsOperands.contains);
                        }
                        default:
                            throw new UnreachableCaseError('SFCBTSFCIQ23987', leftOperands.typeId);
                    }
                }
            }
        }
    }
}

export interface TextScanFieldCondition extends BaseTextScanFieldCondition {
    readonly typeId: ScanFieldTypeId.Text,
    readonly fieldId: ScanFormula.TextTextFieldId,
}

export namespace TextScanFieldCondition {
    export function is(condition: ScanFieldCondition): condition is TextScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.Text;
    }

    export function isEqual(left: TextScanFieldCondition, right: TextScanFieldCondition): boolean {
        return BaseTextScanFieldCondition.isEqual(left, right);
    }
}

export interface SubbedTextScanFieldCondition extends BaseTextScanFieldCondition {
    fieldId: ScanFormula.TextTextSubbedFieldId,
}

export interface AltCodeSubbedScanFieldCondition extends SubbedTextScanFieldCondition {
    readonly typeId: ScanFieldTypeId.AltCodeSubbed,
    readonly fieldId: ScanFormula.FieldId.AltCode,
    readonly subFieldId: ScanFormula.AltCodeSubFieldId;
}

export namespace AltCodeSubbedScanFieldCondition {
    export function is(condition: ScanFieldCondition): condition is AltCodeSubbedScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.AltCodeSubbed;
    }

    export function isEqual(left: AltCodeSubbedScanFieldCondition, right: AltCodeSubbedScanFieldCondition): boolean {
        return (
            BaseTextScanFieldCondition.isEqual(left, right)
            &&
            left.subFieldId === right.subFieldId
        );
    }
}

export interface AttributeSubbedScanFieldCondition extends SubbedTextScanFieldCondition {
    readonly typeId: ScanFieldTypeId.AttributeSubbed,
    readonly fieldId: ScanFormula.FieldId.Attribute,
    readonly subFieldId: ScanFormula.AttributeSubFieldId;
}

export namespace AttributeSubbedScanFieldCondition {
    export function is(condition: ScanFieldCondition): condition is AttributeSubbedScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.AttributeSubbed;
    }

    export function isEqual(left: AttributeSubbedScanFieldCondition, right: AttributeSubbedScanFieldCondition): boolean {
        return (
            BaseTextScanFieldCondition.isEqual(left, right)
            &&
            left.subFieldId === right.subFieldId
        );
    }
}

export interface TextEqualsSingleScanFieldCondition extends ScanFieldCondition {
    readonly typeId: ScanFieldTypeId.TextEqualsSingle;
    readonly fieldId: ScanFormula.TextEqualsSingleFieldId;
    operatorId: TextEqualsSingleScanFieldCondition.OperatorId;
    operands: TextEqualsSingleScanFieldCondition.Operands;
}

export namespace TextEqualsSingleScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals
    >;

    export interface Operands {
        value: string;
    }

    export function is(condition: ScanFieldCondition): condition is TextEqualsSingleScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.TextEqualsSingle;
    }

    export function isEqual(left: TextEqualsSingleScanFieldCondition, right: TextEqualsSingleScanFieldCondition): boolean {
        return (
            ScanFieldCondition.isEqual(left, right)
            &&
            left.operatorId === right.operatorId
            &&
            left.operands.value === right.operands.value
        );
    }
}

export interface TextExistsSingleScanFieldCondition extends ScanFieldCondition {
    readonly typeId: ScanFieldTypeId.TextExistsSingle;
    readonly fieldId: ScanFormula.TextExistsSingleFieldId;
    operatorId: TextExistsSingleScanFieldCondition.OperatorId;
    operands: TextExistsSingleScanFieldCondition.Operands;
}

export namespace TextExistsSingleScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.HasValue |
        ScanFieldCondition.OperatorId.NotHasValue |
        ScanFieldCondition.OperatorId.Equals |
        ScanFieldCondition.OperatorId.NotEquals
    >;

    export interface Operands {
        readonly typeId: Operands.TypeId;
    }

    export namespace Operands {
        export const enum TypeId {
            HasValue,
            Value,
        }
    }

    export interface HasValueOperands extends Operands {
        readonly typeId: Operands.TypeId.HasValue;
    }

    export interface ValueOperands extends Operands {
        readonly typeId: Operands.TypeId.Value;
        value: string;
    }

    export function is(condition: ScanFieldCondition): condition is TextExistsSingleScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.TextExistsSingle;
    }

    export function isEqual(left: TextExistsSingleScanFieldCondition, right: TextExistsSingleScanFieldCondition): boolean {
        if (!ScanFieldCondition.isEqual(left, right)) {
            return false;
        } else {
            if (left.operatorId !== right.operatorId) {
                return false;
            } else {
                const leftOperands = left.operands;
                const rightOperands = right.operands;
                if (leftOperands.typeId !== rightOperands.typeId) {
                    return false;
                } else {
                    switch (leftOperands.typeId) {
                        case Operands.TypeId.HasValue: return true;
                        case Operands.TypeId.Value: {
                            const leftValue = (leftOperands as ValueOperands).value;
                            const rightValue = (rightOperands as ValueOperands).value;
                            return leftValue === rightValue;
                        }
                        default:
                            throw new UnreachableCaseError('SFCTESSFCIQ23987', leftOperands.typeId);
                    }
                }
            }
        }
    }
}

export interface OverlapsScanFieldCondition extends ScanFieldCondition {
    fieldId: ScanFormula.TextOverlapFieldId;
    operatorId: OverlapsScanFieldCondition.OperatorId;
}

export namespace OverlapsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.Overlaps |
        ScanFieldCondition.OperatorId.NotOverlaps
    >;

    export function isEqual(left: OverlapsScanFieldCondition, right: OverlapsScanFieldCondition): boolean {
        return (
            ScanFieldCondition.isEqual(left, right)
            &&
            left.operatorId === right.operatorId
        );
    }
}

export interface StringOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldTypeId.StringOverlaps;
    readonly fieldId: ScanFormula.StringTextOverlapFieldId;
    operands: StringOverlapsScanFieldCondition.Operands;
}

export namespace StringOverlapsScanFieldCondition {
    export interface Operands {
        values: string[];
    }

    export function is(condition: ScanFieldCondition): condition is StringOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.StringOverlaps;
    }

    export function isEqual(left: StringOverlapsScanFieldCondition, right: StringOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface BoardOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldTypeId.BoardOverlaps;
    readonly fieldId: ScanFormula.FieldId.Board;
    operands: BoardOverlapsScanFieldCondition.Operands;
}

export namespace BoardOverlapsScanFieldCondition {
    export interface Operands {
        values: MarketBoardId[];
    }

    export function is(condition: ScanFieldCondition): condition is BoardOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.BoardOverlaps;
    }

    export function isEqual(left: BoardOverlapsScanFieldCondition, right: BoardOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface CurrencyOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldTypeId.CurrencyOverlaps;
    readonly fieldId: ScanFormula.FieldId.Currency;
    operands: CurrencyOverlapsScanFieldCondition.Operands;
}

export namespace CurrencyOverlapsScanFieldCondition {
    export interface Operands {
        values: CurrencyId[];
    }

    export function is(condition: ScanFieldCondition): condition is CurrencyOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.CurrencyOverlaps;
    }

    export function isEqual(left: CurrencyOverlapsScanFieldCondition, right: CurrencyOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface ExchangeOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldTypeId.ExchangeOverlaps;
    readonly fieldId: ScanFormula.FieldId.Exchange;
    operands: ExchangeOverlapsScanFieldCondition.Operands;
}

export namespace ExchangeOverlapsScanFieldCondition {
    export interface Operands {
        values: ExchangeId[];
    }

    export function is(condition: ScanFieldCondition): condition is ExchangeOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.ExchangeOverlaps;
    }

    export function isEqual(left: ExchangeOverlapsScanFieldCondition, right: ExchangeOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface MarketOverlapsScanFieldCondition extends OverlapsScanFieldCondition {
    readonly typeId: ScanFieldTypeId.MarketOverlaps;
    readonly fieldId: ScanFormula.MarketOverlapFieldId;
    operands: MarketOverlapsScanFieldCondition.Operands;
}

export namespace MarketOverlapsScanFieldCondition {
    export interface Operands {
        values: MarketId[];
    }

    export function is(condition: ScanFieldCondition): condition is MarketOverlapsScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.MarketOverlaps;
    }

    export function isEqual(left: MarketOverlapsScanFieldCondition, right: MarketOverlapsScanFieldCondition): boolean {
        return (
            OverlapsScanFieldCondition.isEqual(left, right)
            &&
            isArrayEqualUniquely(left.operands.values, right.operands.values)
        );
    }
}

export interface IsScanFieldCondition extends ScanFieldCondition {
    readonly typeId: ScanFieldTypeId.Is;
    readonly fieldId: ScanFormula.FieldId.Is;
    operatorId: IsScanFieldCondition.OperatorId;
    operands: IsScanFieldCondition.Operands;
}

export namespace IsScanFieldCondition {
    export type OperatorId = PickEnum<ScanFieldCondition.OperatorId,
        ScanFieldCondition.OperatorId.Is |
        ScanFieldCondition.OperatorId.NotIs
    >;

    export interface Operands {
        categoryId: ScanFormula.IsNode.CategoryId;
    }

    export function is(condition: ScanFieldCondition): condition is IsScanFieldCondition {
        return condition.typeId === ScanFieldTypeId.Is;
    }

    export function isEqual(left: IsScanFieldCondition, right: IsScanFieldCondition): boolean {
        return (
            ScanFieldCondition.isEqual(left, right)
            &&
            left.operatorId === right.operatorId
            &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            left.operands.categoryId === right.operands.categoryId
        );
    }
}

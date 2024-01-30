/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ComparableList, Ok, Result, UnreachableCaseError } from '../../sys/sys-internal-api';
import { ScanFormula } from '../formula/internal-api';
import { ScanFieldSetLoadError, ScanFieldSetLoadErrorTypeId } from './common/internal-api';
import {
    AltCodeSubbedScanField,
    AttributeSubbedScanField,
    BaseNumericScanFieldCondition,
    BaseTextScanFieldCondition,
    CurrencyOverlapsScanField,
    CurrencyOverlapsScanFieldCondition,
    DateInRangeScanField,
    DateScanFieldCondition,
    DateSubbedScanField,
    ExchangeOverlapsScanField,
    ExchangeOverlapsScanFieldCondition,
    IsScanField,
    IsScanFieldCondition,
    MarketBoardOverlapsScanField,
    MarketBoardOverlapsScanFieldCondition,
    MarketOverlapsScanField,
    MarketOverlapsScanFieldCondition,
    NumericComparisonScanFieldCondition,
    NumericInRangeScanField,
    NumericScanFieldCondition,
    OverlapsScanFieldCondition,
    PriceSubbedScanField,
    ScanField,
    ScanFieldCondition,
    StringOverlapsScanField,
    StringOverlapsScanFieldCondition,
    TextContainsScanField,
    TextContainsScanFieldCondition,
    TextEqualsScanField,
    TextEqualsScanFieldCondition,
    TextHasValueContainsScanFieldCondition,
    TextHasValueEqualsScanField,
    TextHasValueEqualsScanFieldCondition
} from './field/internal-api';
import { ScanFieldSet } from './scan-field-set';

export class StandAloneScanFieldSet implements ScanFieldSet {
    readonly fieldFactory = new StandAloneScanFieldSet.FieldFactory();
    readonly conditionFactory = new StandAloneScanFieldSet.ConditionFactory();

    readonly fields = new ComparableList<ScanField>();

    loadError: ScanFieldSetLoadError | undefined;

    assign(value: ScanFieldSet): void {
        this.loadError = value.loadError;
        this.fields.clear();

        const valueFields = value.fields;
        const fieldCount = valueFields.count;
        this.fields.capacity = fieldCount;
        for (let i = 0; i < fieldCount; i++) {
            const valueField = valueFields.getAt(i);
            const copiedField = this.cloneField(value, valueField);
            this.fields.add(copiedField);
        }
    }

    private cloneField(fieldSet: ScanFieldSet, field: ScanField): ScanField {
        switch(field.typeId) {
            case ScanField.TypeId.NumericInRange:
                return this.cloneNumericRangeScanField(fieldSet, field as NumericInRangeScanField);
            case ScanField.TypeId.PriceSubbed:
                return this.clonePriceSubbedScanField(fieldSet, field as PriceSubbedScanField);
            case ScanField.TypeId.DateInRange:
                return this.cloneDateInRangeScanField(fieldSet, field as DateInRangeScanField);
            case ScanField.TypeId.DateSubbed:
                return this.cloneDateSubbedScanField(fieldSet, field as DateSubbedScanField);
            case ScanField.TypeId.TextContains:
                return this.cloneTextContainsScanField(fieldSet, field as TextContainsScanField);
            case ScanField.TypeId.AltCodeSubbed:
                return this.cloneAltCodeSubbedScanField(fieldSet, field as AltCodeSubbedScanField);
            case ScanField.TypeId.AttributeSubbed:
                return this.cloneAttributeSubbedScanField(fieldSet, field as AttributeSubbedScanField);
            case ScanField.TypeId.TextEquals:
                return this.cloneTextEqualsScanField(fieldSet, field as TextEqualsScanField);
            case ScanField.TypeId.TextHasValueEquals:
                return this.cloneTextHasValueEqualsScanField(fieldSet, field as TextHasValueEqualsScanField);
            case ScanField.TypeId.StringOverlaps:
                return this.cloneStringOverlapsScanField(fieldSet, field as StringOverlapsScanField);
            case ScanField.TypeId.CurrencyOverlaps:
                return this.cloneCurrencyOverlapsScanField(fieldSet, field as CurrencyOverlapsScanField);
            case ScanField.TypeId.ExchangeOverlaps:
                return this.cloneExchangeOverlapsScanField(fieldSet, field as ExchangeOverlapsScanField);
            case ScanField.TypeId.MarketOverlaps:
                return this.cloneMarketOverlapsScanField(fieldSet, field as MarketOverlapsScanField);
            case ScanField.TypeId.MarketBoardOverlaps:
                return this.cloneMarketBoardOverlapsScanField(fieldSet, field as MarketBoardOverlapsScanField);
            case ScanField.TypeId.Is:
                return this.cloneIsScanField(fieldSet, field as IsScanField);
            default:
                throw new UnreachableCaseError('SASFSCCOF43432', field.typeId);
        }
    }

    private cloneNumericRangeScanField(fieldSet: ScanFieldSet, field: NumericInRangeScanField) {
        const createResult = this.fieldFactory.createNumericInRange(fieldSet, field.fieldId)
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCCOFNIRC54987');
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            clonedConditions.capacity = conditionCount;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneNumericComparisonScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private clonePriceSubbedScanField(fieldSet: ScanFieldSet, field: PriceSubbedScanField) {
        const createResult = this.fieldFactory.createPriceSubbed(fieldSet, field.subFieldId)
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCPSSF54987');
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            clonedConditions.capacity = conditionCount;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneNumericScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneDateInRangeScanField(fieldSet: ScanFieldSet, field: DateInRangeScanField): DateInRangeScanField {
        const createResult = this.fieldFactory.createDateInRange(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCDIRSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneDateScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneDateSubbedScanField(fieldSet: ScanFieldSet, field: DateSubbedScanField): DateSubbedScanField {
        const createResult = this.fieldFactory.createDateSubbed(fieldSet, field.subFieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCDSSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneDateScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneTextContainsScanField(fieldSet: ScanFieldSet, field: TextContainsScanField): TextContainsScanField {
        const createResult = this.fieldFactory.createTextContains(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCTCSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneTextContainsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneAltCodeSubbedScanField(fieldSet: ScanFieldSet, field: AltCodeSubbedScanField): AltCodeSubbedScanField {
        const createResult = this.fieldFactory.createAltCodeSubbed(fieldSet, field.subFieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCACSSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneTextHasValueContainsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneAttributeSubbedScanField(fieldSet: ScanFieldSet, field: AttributeSubbedScanField): AttributeSubbedScanField {
        const createResult = this.fieldFactory.createAttributeSubbed(fieldSet, field.subFieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCASSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneTextHasValueContainsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneTextEqualsScanField(fieldSet: ScanFieldSet, field: TextEqualsScanField): TextEqualsScanField {
        const createResult = this.fieldFactory.createTextEquals(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCTESF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneTextEqualsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneTextHasValueEqualsScanField(fieldSet: ScanFieldSet, field: TextHasValueEqualsScanField): TextHasValueEqualsScanField {
        const createResult = this.fieldFactory.createTextHasValueEquals(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCTHVESF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneTextHasValueEqualsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneStringOverlapsScanField(fieldSet: ScanFieldSet, field: StringOverlapsScanField): StringOverlapsScanField {
        const createResult = this.fieldFactory.createStringOverlaps(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCSOSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneStringOverlapsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneCurrencyOverlapsScanField(fieldSet: ScanFieldSet, field: CurrencyOverlapsScanField): CurrencyOverlapsScanField {
        const createResult = this.fieldFactory.createCurrencyOverlaps(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCCOSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneCurrencyOverlapsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneExchangeOverlapsScanField(fieldSet: ScanFieldSet, field: ExchangeOverlapsScanField): ExchangeOverlapsScanField {
        const createResult = this.fieldFactory.createExchangeOverlaps(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCEOSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneExchangeOverlapsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneMarketOverlapsScanField(fieldSet: ScanFieldSet, field: MarketOverlapsScanField): MarketOverlapsScanField {
        const createResult = this.fieldFactory.createMarketOverlaps(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCMOSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneMarketOverlapsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneMarketBoardOverlapsScanField(fieldSet: ScanFieldSet, field: MarketBoardOverlapsScanField): MarketBoardOverlapsScanField {
        const createResult = this.fieldFactory.createMarketBoardOverlaps(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCMBOSF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneMarketBoardOverlapsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneIsScanField(fieldSet: ScanFieldSet, field: IsScanField): IsScanField {
        const createResult = this.fieldFactory.createIs(fieldSet, field.fieldId);
        if (createResult.isErr()) {
            throw new AssertInternalError('SASFSCISF12123', createResult.error.typeId.toString());
        } else {
            const clonedField = createResult.value;
            clonedField.conditionsOperationId = field.conditionsOperationId;

            const conditions = field.conditions;
            const conditionCount = conditions.count;
            const clonedConditions = clonedField.conditions;
            for (let i = 0; i < conditionCount; i++) {
                const condition = conditions.getAt(i);
                const clonedCondition = this.cloneIsScanFieldCondition(condition);
                clonedConditions.setAt(i, clonedCondition);
            }

            return clonedField;
        }
    }

    private cloneNumericComparisonScanFieldCondition(condition: NumericComparisonScanFieldCondition): NumericComparisonScanFieldCondition {
        const operands = condition.operands;
        return {
            typeId: ScanFieldCondition.TypeId.NumericComparison,
            operatorId: condition.operatorId,
            operands: this.cloneBaseNumericScanFieldConditionOperands(operands),
        };
    }

    private cloneNumericScanFieldCondition(condition: NumericScanFieldCondition): NumericScanFieldCondition {
        const operands = condition.operands;
        return {
            typeId: ScanFieldCondition.TypeId.Numeric,
            operatorId: condition.operatorId,
            operands: this.cloneBaseNumericScanFieldConditionOperands(operands),
        };
    }

    private cloneDateScanFieldCondition(condition: DateScanFieldCondition): DateScanFieldCondition {
        const operands = condition.operands;
        return {
            typeId: ScanFieldCondition.TypeId.Date,
            operatorId: condition.operatorId,
            operands: this.cloneDateScanFieldConditionOperands(operands),
        };
    }

    private cloneTextEqualsScanFieldCondition(condition: TextEqualsScanFieldCondition): TextEqualsScanFieldCondition {
        const operands = condition.operands;
        return {
            typeId: ScanFieldCondition.TypeId.TextEquals,
            operatorId: condition.operatorId,
            operands: this.cloneBaseTextScanFieldConditionOperands(operands),
        };
    }

    private cloneTextContainsScanFieldCondition(condition: TextContainsScanFieldCondition): TextContainsScanFieldCondition {
        const operands = condition.operands;
        return {
            typeId: ScanFieldCondition.TypeId.TextContains,
            operatorId: condition.operatorId,
            operands: this.cloneBaseTextScanFieldConditionOperands(operands),
        };
    }

    private cloneTextHasValueEqualsScanFieldCondition(condition: TextHasValueEqualsScanFieldCondition): TextHasValueEqualsScanFieldCondition {
        const operands = condition.operands;
        return {
            typeId: ScanFieldCondition.TypeId.TextHasValueEquals,
            operatorId: condition.operatorId,
            operands: this.cloneBaseTextScanFieldConditionOperands(operands),
        };
    }

    private cloneTextHasValueContainsScanFieldCondition(condition: TextHasValueContainsScanFieldCondition): TextHasValueContainsScanFieldCondition {
        const operands = condition.operands;
        return {
            typeId: ScanFieldCondition.TypeId.TextHasValueContains,
            operatorId: condition.operatorId,
            operands: this.cloneBaseTextScanFieldConditionOperands(operands),
        };
    }

    private cloneStringOverlapsScanFieldCondition(condition: StringOverlapsScanFieldCondition): StringOverlapsScanFieldCondition {
        const operands = condition.operands;
        const values = operands.values;
        return {
            typeId: ScanFieldCondition.TypeId.StringOverlaps,
            operatorId: condition.operatorId,
            operands: {
                values: values.slice(),
            }
        };
    }

    private cloneCurrencyOverlapsScanFieldCondition(condition: CurrencyOverlapsScanFieldCondition): CurrencyOverlapsScanFieldCondition {
        const operands = condition.operands;
        const values = operands.values;
        return {
            typeId: ScanFieldCondition.TypeId.CurrencyOverlaps,
            operatorId: condition.operatorId,
            operands: {
                values: values.slice(),
            }
        };
    }

    private cloneExchangeOverlapsScanFieldCondition(condition: ExchangeOverlapsScanFieldCondition): ExchangeOverlapsScanFieldCondition {
        const operands = condition.operands;
        const values = operands.values;
        return {
            typeId: ScanFieldCondition.TypeId.ExchangeOverlaps,
            operatorId: condition.operatorId,
            operands: {
                values: values.slice(),
            }
        };
    }

    private cloneMarketOverlapsScanFieldCondition(condition: MarketOverlapsScanFieldCondition): MarketOverlapsScanFieldCondition {
        const operands = condition.operands;
        const values = operands.values;
        return {
            typeId: ScanFieldCondition.TypeId.MarketOverlaps,
            operatorId: condition.operatorId,
            operands: {
                values: values.slice(),
            }
        };
    }

    private cloneMarketBoardOverlapsScanFieldCondition(condition: MarketBoardOverlapsScanFieldCondition): MarketBoardOverlapsScanFieldCondition {
        const operands = condition.operands;
        const values = operands.values;
        return {
            typeId: ScanFieldCondition.TypeId.MarketBoardOverlaps,
            operatorId: condition.operatorId,
            operands: {
                values: values.slice(),
            }
        };
    }

    private cloneIsScanFieldCondition(condition: IsScanFieldCondition): IsScanFieldCondition {
        const operands = condition.operands;
        const categoryId = operands.categoryId;
        return {
            typeId: ScanFieldCondition.TypeId.Is,
            operatorId: condition.operatorId,
            operands: {
                categoryId,
            }
        };
    }

    private cloneBaseNumericScanFieldConditionOperands(operands: BaseNumericScanFieldCondition.Operands): BaseNumericScanFieldCondition.Operands {
        switch (operands.typeId) {
            case BaseNumericScanFieldCondition.Operands.TypeId.HasValue: {
                return {
                    typeId: BaseNumericScanFieldCondition.Operands.TypeId.HasValue,
                };
            }
            case BaseNumericScanFieldCondition.Operands.TypeId.Value: {
                const clonedValueOperands: BaseNumericScanFieldCondition.ValueOperands = {
                    typeId: BaseNumericScanFieldCondition.Operands.TypeId.Value,
                    value: (operands as BaseNumericScanFieldCondition.ValueOperands).value,
                };
                return clonedValueOperands;
            }
            case BaseNumericScanFieldCondition.Operands.TypeId.Range: {
                const rangeOperands = operands as BaseNumericScanFieldCondition.RangeOperands;
                const clonedRangeOperands: BaseNumericScanFieldCondition.RangeOperands = {
                    typeId: BaseNumericScanFieldCondition.Operands.TypeId.Range,
                    min: rangeOperands.min,
                    max: rangeOperands.max,
                };
                return clonedRangeOperands;
            }
            default:
                throw new UnreachableCaseError('SASFSCBNSFCO55598', operands.typeId);
        }
    }

    private cloneDateScanFieldConditionOperands(operands: DateScanFieldCondition.Operands): DateScanFieldCondition.Operands {
        switch (operands.typeId) {
            case DateScanFieldCondition.Operands.TypeId.HasValue: {
                return {
                    typeId: DateScanFieldCondition.Operands.TypeId.HasValue,
                };
            }
            case DateScanFieldCondition.Operands.TypeId.Value: {
                const clonedValueOperands: DateScanFieldCondition.ValueOperands = {
                    typeId: DateScanFieldCondition.Operands.TypeId.Value,
                    value: (operands as DateScanFieldCondition.ValueOperands).value,
                };
                return clonedValueOperands;
            }
            case DateScanFieldCondition.Operands.TypeId.Range: {
                const rangeOperands = operands as DateScanFieldCondition.RangeOperands;
                const clonedRangeOperands: DateScanFieldCondition.RangeOperands = {
                    typeId: DateScanFieldCondition.Operands.TypeId.Range,
                    min: rangeOperands.min,
                    max: rangeOperands.max,
                };
                return clonedRangeOperands;
            }
            default:
                throw new UnreachableCaseError('SASFSCBDSFCO55598', operands.typeId);
        }
    }

    private cloneBaseTextScanFieldConditionOperands(operands: BaseTextScanFieldCondition.Operands): BaseTextScanFieldCondition.Operands {
        switch (operands.typeId) {
            case BaseTextScanFieldCondition.Operands.TypeId.HasValue: {
                return {
                    typeId: BaseTextScanFieldCondition.Operands.TypeId.HasValue,
                };
            }
            case BaseTextScanFieldCondition.Operands.TypeId.Value: {
                const clonedValueOperands: BaseTextScanFieldCondition.ValueOperands = {
                    typeId: BaseTextScanFieldCondition.Operands.TypeId.Value,
                    value: (operands as BaseTextScanFieldCondition.ValueOperands).value,
                };
                return clonedValueOperands;
            }
            case BaseTextScanFieldCondition.Operands.TypeId.Contains: {
                const containsOperands = operands as BaseTextScanFieldCondition.ContainsOperands;
                const contains = containsOperands.contains;
                const clonedRangeOperands: BaseTextScanFieldCondition.ContainsOperands = {
                    typeId: BaseTextScanFieldCondition.Operands.TypeId.Contains,
                    contains: {
                        ...contains
                    },
                };
                return clonedRangeOperands;
            }
            default:
                throw new UnreachableCaseError('SASFSCBTSFCO55598', operands.typeId);
        }
    }
}

export namespace StandAloneScanFieldSet {
    export class FieldFactory implements ScanFieldSet.FieldFactory {
        createNumericInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.NumericRangeFieldId): Result<NumericInRangeScanField, ScanFieldSetLoadError> {
            const field: NumericInRangeScanField = {
                typeId: ScanField.TypeId.NumericInRange,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.NumericComparison,
                conditions: new ComparableList<NumericComparisonScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createPriceSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.PriceSubFieldId): Result<PriceSubbedScanField, ScanFieldSetLoadError> {
            const field: PriceSubbedScanField = {
                typeId: ScanField.TypeId.PriceSubbed,
                fieldId: ScanFormula.FieldId.PriceSubbed,
                subFieldId,
                conditionTypeId: ScanFieldCondition.TypeId.Numeric,
                conditions: new ComparableList<NumericScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createDateInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.DateRangeFieldId): Result<DateInRangeScanField, ScanFieldSetLoadError> {
            const field: DateInRangeScanField = {
                typeId: ScanField.TypeId.DateInRange,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.Date,
                conditions: new ComparableList<DateScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createDateSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.DateSubFieldId): Result<DateSubbedScanField, ScanFieldSetLoadError> {
            const field: DateSubbedScanField = {
                typeId: ScanField.TypeId.DateSubbed,
                fieldId: ScanFormula.FieldId.DateSubbed,
                subFieldId,
                conditionTypeId: ScanFieldCondition.TypeId.Date,
                conditions: new ComparableList<DateScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createTextContains(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextContainsFieldId): Result<TextContainsScanField, ScanFieldSetLoadError> {
            const field: TextContainsScanField = {
                typeId: ScanField.TypeId.TextContains,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.TextContains,
                conditions: new ComparableList<TextContainsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createAltCodeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AltCodeSubFieldId): Result<AltCodeSubbedScanField, ScanFieldSetLoadError> {
            const field: AltCodeSubbedScanField = {
                typeId: ScanField.TypeId.AltCodeSubbed,
                fieldId: ScanFormula.FieldId.AltCodeSubbed,
                subFieldId,
                conditionTypeId: ScanFieldCondition.TypeId.TextHasValueContains,
                conditions: new ComparableList<TextHasValueContainsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createAttributeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AttributeSubFieldId): Result<AttributeSubbedScanField, ScanFieldSetLoadError> {
            const field: AttributeSubbedScanField = {
                typeId: ScanField.TypeId.AttributeSubbed,
                fieldId: ScanFormula.FieldId.AttributeSubbed,
                subFieldId,
                conditionTypeId: ScanFieldCondition.TypeId.TextHasValueContains,
                conditions: new ComparableList<TextHasValueContainsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createTextEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextEqualsFieldId): Result<TextEqualsScanField, ScanFieldSetLoadError> {
            const field: TextEqualsScanField = {
                typeId: ScanField.TypeId.TextEquals,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.TextEquals,
                conditions: new ComparableList<TextEqualsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createTextHasValueEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextHasValueEqualsFieldId): Result<TextHasValueEqualsScanField, ScanFieldSetLoadError> {
            const field: TextHasValueEqualsScanField = {
                typeId: ScanField.TypeId.TextHasValueEquals,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.TextHasValueEquals,
                conditions: new ComparableList<TextHasValueEqualsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createStringOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.StringOverlapsFieldId): Result<StringOverlapsScanField, ScanFieldSetLoadError> {
            const field: StringOverlapsScanField = {
                typeId: ScanField.TypeId.StringOverlaps,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.StringOverlaps,
                conditions: new ComparableList<StringOverlapsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createCurrencyOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Currency): Result<CurrencyOverlapsScanField, ScanFieldSetLoadError> {
            const field: CurrencyOverlapsScanField = {
                typeId: ScanField.TypeId.CurrencyOverlaps,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.CurrencyOverlaps,
                conditions: new ComparableList<CurrencyOverlapsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createExchangeOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Exchange): Result<ExchangeOverlapsScanField, ScanFieldSetLoadError> {
            const field: ExchangeOverlapsScanField = {
                typeId: ScanField.TypeId.ExchangeOverlaps,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.ExchangeOverlaps,
                conditions: new ComparableList<ExchangeOverlapsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createMarketOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.MarketOverlapsFieldId): Result<MarketOverlapsScanField, ScanFieldSetLoadError> {
            const field: MarketOverlapsScanField = {
                typeId: ScanField.TypeId.MarketOverlaps,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.MarketOverlaps,
                conditions: new ComparableList<MarketOverlapsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createMarketBoardOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.MarketBoard): Result<MarketBoardOverlapsScanField, ScanFieldSetLoadError> {
            const field: MarketBoardOverlapsScanField = {
                typeId: ScanField.TypeId.MarketBoardOverlaps,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.MarketBoardOverlaps,
                conditions: new ComparableList<MarketBoardOverlapsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
        createIs(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Is): Result<IsScanField, ScanFieldSetLoadError> {
            const field: IsScanField = {
                typeId: ScanField.TypeId.Is,
                fieldId,
                subFieldId: undefined,
                conditionTypeId: ScanFieldCondition.TypeId.Is,
                conditions: new ComparableList<IsScanFieldCondition>,
                conditionsOperationId: ScanField.BooleanOperation.defaultId,
            }
            return new Ok(field);
        }
    }

    export class ConditionFactory implements ScanField.ConditionFactory {
        createNumericComparisonFromNumericComparison(
            _field: ScanField,
            formulaNode: ScanFormula.NumericComparisonBooleanNode,
            operatorId: NumericComparisonScanFieldCondition.OperatorId,
            useRightOperandAsValue: boolean
        ): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError> {
            const numberOperand = useRightOperandAsValue ? formulaNode.rightOperand : formulaNode.leftOperand;

            if (!ScanFormula.NumericComparisonBooleanNode.isOperandValue(numberOperand)) {
                return ScanFieldSetLoadError.createErr(ScanFieldSetLoadErrorTypeId.SpecifiedNumericComparisonOperandIsNotValue, useRightOperandAsValue ? 'right' : 'left');
            } else {
                const operands: BaseNumericScanFieldCondition.ValueOperands = {
                    typeId: BaseNumericScanFieldCondition.Operands.TypeId.Value,
                    value: numberOperand,
                }
                const result: NumericComparisonScanFieldCondition = {
                    typeId: ScanFieldCondition.TypeId.NumericComparison,
                    operatorId,
                    operands,
                }

                return new Ok(result);
            }
        }

        createNumericComparisonFromFieldHasValue(
            _field: ScanField,
            _formulaNode: ScanFormula.FieldHasValueNode,
            operatorId: NumericComparisonScanFieldCondition.OperatorId,
        ): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseNumericScanFieldCondition.HasValueOperands = {
                typeId: BaseNumericScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: NumericComparisonScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.NumericComparison,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericComparisonFromNumericFieldEquals(
            _field: ScanField,
            formulaNode: ScanFormula.NumericFieldEqualsNode,
            operatorId: NumericComparisonScanFieldCondition.OperatorId,
        ): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseNumericScanFieldCondition.ValueOperands = {
                typeId: BaseNumericScanFieldCondition.Operands.TypeId.Value,
                value: formulaNode.value,
            };

            const condition: NumericComparisonScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.NumericComparison,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericComparisonFromNumericFieldInRange(
            _field: ScanField,
            formulaNode: ScanFormula.NumericFieldInRangeNode,
            operatorId: NumericComparisonScanFieldCondition.OperatorId,
        ): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseNumericScanFieldCondition.RangeOperands = {
                typeId: BaseNumericScanFieldCondition.Operands.TypeId.Range,
                min: formulaNode.min,
                max: formulaNode.max,
            };

            const condition: NumericComparisonScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.NumericComparison,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericFromPriceSubFieldHasValue(
            _field: ScanField,
            _formulaNode: ScanFormula.PriceSubFieldHasValueNode,
            operatorId: NumericScanFieldCondition.OperatorId,
        ): Result<NumericScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseNumericScanFieldCondition.HasValueOperands = {
                typeId: BaseNumericScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: NumericScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Numeric,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericFromPriceSubFieldEquals(
            _field: ScanField,
            formulaNode: ScanFormula.PriceSubFieldEqualsNode,
            operatorId: NumericScanFieldCondition.OperatorId,
        ): Result<NumericScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseNumericScanFieldCondition.ValueOperands = {
                typeId: BaseNumericScanFieldCondition.Operands.TypeId.Value,
                value: formulaNode.value,
            };

            const condition: NumericScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Numeric,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericFromPriceSubFieldInRange(
            _field: ScanField,
            formulaNode: ScanFormula.PriceSubFieldInRangeNode,
            operatorId: NumericScanFieldCondition.OperatorId,
        ): Result<NumericScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseNumericScanFieldCondition.RangeOperands = {
                typeId: BaseNumericScanFieldCondition.Operands.TypeId.Range,
                min: formulaNode.min,
                max: formulaNode.max,
            };

            const condition: NumericScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Numeric,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateFromFieldHasValue(
            _field: ScanField,
            _formulaNode: ScanFormula.FieldHasValueNode,
            operatorId: DateScanFieldCondition.OperatorId,
        ): Result<DateScanFieldCondition, ScanFieldSetLoadError> {
            const operands: DateScanFieldCondition.HasValueOperands = {
                typeId: DateScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateFromDateFieldEquals(
            _field: ScanField,
            formulaNode: ScanFormula.DateFieldEqualsNode,
            operatorId: DateScanFieldCondition.OperatorId,
        ): Result<DateScanFieldCondition, ScanFieldSetLoadError> {
            const operands: DateScanFieldCondition.ValueOperands = {
                typeId: DateScanFieldCondition.Operands.TypeId.Value,
                value: formulaNode.value,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateFromDateFieldInRange(
            _field: ScanField,
            formulaNode: ScanFormula.DateFieldInRangeNode,
            operatorId: DateScanFieldCondition.OperatorId,
        ): Result<DateScanFieldCondition, ScanFieldSetLoadError> {
            const operands: DateScanFieldCondition.RangeOperands = {
                typeId: DateScanFieldCondition.Operands.TypeId.Range,
                min: formulaNode.min,
                max: formulaNode.max,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateFromDateSubFieldHasValue(
            _field: ScanField,
            _formulaNode: ScanFormula.DateSubFieldHasValueNode,
            operatorId: DateScanFieldCondition.OperatorId,
        ): Result<DateScanFieldCondition, ScanFieldSetLoadError> {
            const operands: DateScanFieldCondition.HasValueOperands = {
                typeId: DateScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateFromDateSubFieldEquals(
            _field: ScanField,
            formulaNode: ScanFormula.DateSubFieldEqualsNode,
            operatorId: DateScanFieldCondition.OperatorId,
        ): Result<DateScanFieldCondition, ScanFieldSetLoadError> {
            const operands: DateScanFieldCondition.ValueOperands = {
                typeId: DateScanFieldCondition.Operands.TypeId.Value,
                value: formulaNode.value,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateFromDateSubFieldInRange(
            _field: ScanField,
            formulaNode: ScanFormula.DateSubFieldInRangeNode,
            operatorId: DateScanFieldCondition.OperatorId,
        ): Result<DateScanFieldCondition, ScanFieldSetLoadError> {
            const operands: DateScanFieldCondition.RangeOperands = {
                typeId: DateScanFieldCondition.Operands.TypeId.Range,
                min: formulaNode.min,
                max: formulaNode.max,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextEqualsFromTextFieldEquals(
            _field: ScanField,
            formulaNode: ScanFormula.TextFieldEqualsNode,
            operatorId: TextEqualsScanFieldCondition.OperatorId,
        ): Result<TextEqualsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.ValueOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.Value,
                value: formulaNode.value,
            };

            const condition: TextEqualsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextEquals,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextContainsFromTextFieldContains(
            _field: ScanField,
            formulaNode: ScanFormula.TextFieldContainsNode,
            operatorId: TextContainsScanFieldCondition.OperatorId,
        ): Result<TextContainsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.ContainsOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.Contains,
                contains: {
                    value: formulaNode.value,
                    asId: formulaNode.asId,
                    ignoreCase: formulaNode.ignoreCase,
                }
            };

            const condition: TextContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueEqualsFromFieldHasValue(
            _field: ScanField,
            _formulaNode: ScanFormula.FieldHasValueNode,
            operatorId: TextHasValueEqualsScanFieldCondition.OperatorId,
        ): Result<TextHasValueEqualsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.HasValueOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: TextHasValueEqualsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueEquals,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueEqualsFromTextFieldEquals(
            _field: ScanField,
            formulaNode: ScanFormula.TextFieldEqualsNode,
            operatorId: TextHasValueEqualsScanFieldCondition.OperatorId,
        ): Result<TextHasValueEqualsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.ValueOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.Value,
                value: formulaNode.value,
            };

            const condition: TextHasValueEqualsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueEquals,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueContainsFromAltCodeSubFieldHasValue(
            _field: ScanField,
            _formulaNode: ScanFormula.AltCodeSubFieldHasValueNode,
            operatorId: TextHasValueContainsScanFieldCondition.OperatorId,
        ): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.HasValueOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: TextHasValueContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueContainsFromAltCodeSubFieldContains(
            _field: ScanField,
            formulaNode: ScanFormula.AltCodeSubFieldContainsNode,
            operatorId: TextHasValueContainsScanFieldCondition.OperatorId,
        ): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.ContainsOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.Contains,
                contains: {
                    value: formulaNode.value,
                    asId: formulaNode.asId,
                    ignoreCase: formulaNode.ignoreCase,
                }
            };

            const condition: TextHasValueContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueContainsFromAttributeSubFieldHasValue(
            _field: ScanField,
            _formulaNode: ScanFormula.AttributeSubFieldHasValueNode,
            operatorId: TextHasValueContainsScanFieldCondition.OperatorId,
        ): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.HasValueOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: TextHasValueContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueContainsFromAttributeSubFieldContains(
            _field: ScanField,
            formulaNode: ScanFormula.AttributeSubFieldContainsNode,
            operatorId: TextHasValueContainsScanFieldCondition.OperatorId,
        ): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError> {
            const operands: BaseTextScanFieldCondition.ContainsOperands = {
                typeId: BaseTextScanFieldCondition.Operands.TypeId.Contains,
                contains: {
                    value: formulaNode.value,
                    asId: formulaNode.asId,
                    ignoreCase: formulaNode.ignoreCase,
                }
            };

            const condition: TextHasValueContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createStringOverlapsFromStringFieldOverlaps(
            _field: ScanField,
            formulaNode: ScanFormula.StringFieldOverlapsNode,
            operatorId: OverlapsScanFieldCondition.OperatorId,
        ): Result<StringOverlapsScanFieldCondition, ScanFieldSetLoadError> {
            const condition: StringOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.StringOverlaps,
                operatorId,
                operands: {
                    values: formulaNode.values.slice(),
                }
            };

            return new Ok(condition);
        }

        createCurrencyOverlapsFromCurrencyFieldOverlaps(
            _field: ScanField,
            formulaNode: ScanFormula.CurrencyFieldOverlapsNode,
            operatorId: OverlapsScanFieldCondition.OperatorId,
        ): Result<CurrencyOverlapsScanFieldCondition, ScanFieldSetLoadError> {
            const condition: CurrencyOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.CurrencyOverlaps,
                operatorId,
                operands: {
                    values: formulaNode.values.slice(),
                }
            };

            return new Ok(condition);
        }

        createExchangeOverlapsFromExchangeFieldOverlaps(
            _field: ScanField,
            formulaNode: ScanFormula.ExchangeFieldOverlapsNode,
            operatorId: OverlapsScanFieldCondition.OperatorId,
        ): Result<ExchangeOverlapsScanFieldCondition, ScanFieldSetLoadError> {
            const condition: ExchangeOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.ExchangeOverlaps,
                operatorId,
                operands: {
                    values: formulaNode.values.slice(),
                }
            };

            return new Ok(condition);
        }

        createMarketOverlapsFromMarketFieldOverlaps(
            _field: ScanField,
            formulaNode: ScanFormula.MarketFieldOverlapsNode,
            operatorId: OverlapsScanFieldCondition.OperatorId,
        ): Result<MarketOverlapsScanFieldCondition, ScanFieldSetLoadError> {
            const condition: MarketOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.MarketOverlaps,
                operatorId,
                operands: {
                    values: formulaNode.values.slice(),
                }
            };

            return new Ok(condition);
        }

        createMarketBoardOverlapsFromMarketBoardFieldOverlaps(
            _field: ScanField,
            formulaNode: ScanFormula.MarketBoardFieldOverlapsNode,
            operatorId: OverlapsScanFieldCondition.OperatorId,
        ): Result<MarketBoardOverlapsScanFieldCondition, ScanFieldSetLoadError> {
            const condition: MarketBoardOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.MarketBoardOverlaps,
                operatorId,
                operands: {
                    values: formulaNode.values.slice(),
                }
            };

            return new Ok(condition);
        }

        createIsFromIs(
            _field: ScanField,
            formulaNode: ScanFormula.IsNode,
            operatorId: IsScanFieldCondition.OperatorId,
        ): Result<IsScanFieldCondition, ScanFieldSetLoadError> {
            const condition: IsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Is,
                operatorId,
                operands: {
                    categoryId: formulaNode.categoryId,
                }
            }

            return new Ok(condition);
        }
    }
}

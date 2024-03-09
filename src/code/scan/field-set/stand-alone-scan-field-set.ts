/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CurrencyId, ExchangeId, MarketBoardId, MarketId } from '../../adi/adi-internal-api';
import { AssertInternalError, ComparableList, Ok, Result, SourceTzOffsetDate, UnreachableCaseError } from '../../sys/internal-api';
import { ScanFormula } from '../formula/internal-api';
import { ScanFieldSetLoadError } from './common/internal-api';
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
    readonly valid = true;

    readonly fields = new ComparableList<ScanField>();

    private _loadError: ScanFieldSetLoadError | undefined;

    get loadError() { return this._loadError; }

    beginLoad() {
        this._loadError = undefined;
    }

    endLoad(error: ScanFieldSetLoadError | undefined) {
        this._loadError = error;
    }

    assign(value: ScanFieldSet): void {
        this._loadError = value.loadError;
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
            throw new AssertInternalError('SASFSCDIRSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCDSSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCTCSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCACSSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCASSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCTESF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCTHVESF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCSOSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCCOSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCEOSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCMOSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCMBOSF12123', createResult.error);
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
            throw new AssertInternalError('SASFSCISF12123', createResult.error);
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
                typeId: ScanFieldCondition.Operands.TypeId.TextEnum,
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
                typeId: ScanFieldCondition.Operands.TypeId.CurrencyEnum,
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
                typeId: ScanFieldCondition.Operands.TypeId.ExchangeEnum,
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
                typeId: ScanFieldCondition.Operands.TypeId.MarketEnum,
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
                typeId: ScanFieldCondition.Operands.TypeId.MarketBoardEnum,
                values: values.slice(),
            }
        };
    }

    private cloneIsScanFieldCondition(condition: IsScanFieldCondition): IsScanFieldCondition {
        return condition;
    }

    private cloneBaseNumericScanFieldConditionOperands(operands: BaseNumericScanFieldCondition.Operands): BaseNumericScanFieldCondition.Operands {
        switch (operands.typeId) {
            case ScanFieldCondition.Operands.TypeId.HasValue: {
                return {
                    typeId: ScanFieldCondition.Operands.TypeId.HasValue,
                };
            }
            case ScanFieldCondition.Operands.TypeId.NumericComparisonValue:
            case ScanFieldCondition.Operands.TypeId.NumericValue: {
                const clonedValueOperands: BaseNumericScanFieldCondition.ValueOperands = {
                    typeId: operands.typeId,
                    value: (operands as BaseNumericScanFieldCondition.ValueOperands).value,
                };
                return clonedValueOperands;
            }
            case ScanFieldCondition.Operands.TypeId.NumericRange: {
                const rangeOperands = operands as BaseNumericScanFieldCondition.RangeOperands;
                const clonedRangeOperands: BaseNumericScanFieldCondition.RangeOperands = {
                    typeId: ScanFieldCondition.Operands.TypeId.NumericRange,
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
            case ScanFieldCondition.Operands.TypeId.HasValue: {
                return {
                    typeId: ScanFieldCondition.Operands.TypeId.HasValue,
                };
            }
            case ScanFieldCondition.Operands.TypeId.DateValue: {
                const clonedValueOperands: DateScanFieldCondition.ValueOperands = {
                    typeId: ScanFieldCondition.Operands.TypeId.DateValue,
                    value: (operands as DateScanFieldCondition.ValueOperands).value,
                };
                return clonedValueOperands;
            }
            case ScanFieldCondition.Operands.TypeId.DateRange: {
                const rangeOperands = operands as DateScanFieldCondition.RangeOperands;
                const clonedRangeOperands: DateScanFieldCondition.RangeOperands = {
                    typeId: ScanFieldCondition.Operands.TypeId.DateRange,
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
            case ScanFieldCondition.Operands.TypeId.HasValue: {
                return {
                    typeId: ScanFieldCondition.Operands.TypeId.HasValue,
                };
            }
            case ScanFieldCondition.Operands.TypeId.TextValue: {
                const clonedValueOperands: BaseTextScanFieldCondition.ValueOperands = {
                    typeId: ScanFieldCondition.Operands.TypeId.TextValue,
                    value: (operands as BaseTextScanFieldCondition.ValueOperands).value,
                };
                return clonedValueOperands;
            }
            case ScanFieldCondition.Operands.TypeId.TextContains: {
                const containsOperands = operands as BaseTextScanFieldCondition.ContainsOperands;
                const contains = containsOperands.contains;
                const clonedRangeOperands: BaseTextScanFieldCondition.ContainsOperands = {
                    typeId: ScanFieldCondition.Operands.TypeId.TextContains,
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
        createNumericInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.NumericRangeFieldId): Result<NumericInRangeScanField> {
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
        createPriceSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.PriceSubFieldId): Result<PriceSubbedScanField> {
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
        createDateInRange(_fieldSet: ScanFieldSet, fieldId: ScanFormula.DateRangeFieldId): Result<DateInRangeScanField> {
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
        createDateSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.DateSubFieldId): Result<DateSubbedScanField> {
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
        createTextContains(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextContainsFieldId): Result<TextContainsScanField> {
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
        createAltCodeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AltCodeSubFieldId): Result<AltCodeSubbedScanField> {
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
        createAttributeSubbed(_fieldSet: ScanFieldSet, subFieldId: ScanFormula.AttributeSubFieldId): Result<AttributeSubbedScanField> {
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
        createTextEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextEqualsFieldId): Result<TextEqualsScanField> {
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
        createTextHasValueEquals(_fieldSet: ScanFieldSet, fieldId: ScanFormula.TextHasValueEqualsFieldId): Result<TextHasValueEqualsScanField> {
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
        createStringOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.StringOverlapsFieldId): Result<StringOverlapsScanField> {
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
        createCurrencyOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Currency): Result<CurrencyOverlapsScanField> {
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
        createExchangeOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Exchange): Result<ExchangeOverlapsScanField> {
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
        createMarketOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.MarketOverlapsFieldId): Result<MarketOverlapsScanField> {
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
        createMarketBoardOverlaps(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.MarketBoard): Result<MarketBoardOverlapsScanField> {
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
        createIs(_fieldSet: ScanFieldSet, fieldId: ScanFormula.FieldId.Is): Result<IsScanField> {
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
        createNumericComparisonWithHasValue(
            _field: ScanField,
            operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId,
        ): Result<NumericComparisonScanFieldCondition> {
            const operands: BaseNumericScanFieldCondition.HasValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: NumericComparisonScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.NumericComparison,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericComparisonWithValue(
            _field: ScanField,
            operatorId: NumericComparisonScanFieldCondition.ValueOperands.OperatorId,
            value: number,
        ): Result<NumericComparisonScanFieldCondition> {
            const operands: NumericComparisonScanFieldCondition.ValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.NumericComparisonValue,
                value,
            };

            const condition: NumericComparisonScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.NumericComparison,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericComparisonWithRange(
            _field: ScanField,
            operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId,
            min: number | undefined,
            max: number | undefined,
        ): Result<NumericComparisonScanFieldCondition> {
            const operands: BaseNumericScanFieldCondition.RangeOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.NumericRange,
                min,
                max,
            };

            const condition: NumericComparisonScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.NumericComparison,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericWithHasValue(
            _field: ScanField,
            operatorId: BaseNumericScanFieldCondition.HasValueOperands.OperatorId,
        ): Result<NumericScanFieldCondition> {
            const operands: BaseNumericScanFieldCondition.HasValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: NumericScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Numeric,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericWithValue(
            _field: ScanField,
            operatorId: NumericScanFieldCondition.ValueOperands.OperatorId,
            value: number,
        ): Result<NumericScanFieldCondition> {
            const operands: NumericScanFieldCondition.ValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.NumericValue,
                value,
            };

            const condition: NumericScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Numeric,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createNumericWithRange(
            _field: ScanField,
            operatorId: BaseNumericScanFieldCondition.RangeOperands.OperatorId,
            min: number | undefined,
            max: number | undefined,
        ): Result<NumericScanFieldCondition> {
            const operands: BaseNumericScanFieldCondition.RangeOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.NumericRange,
                min,
                max,
            };

            const condition: NumericScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Numeric,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateWithHasValue(
            _field: ScanField,
            operatorId: DateScanFieldCondition.HasValueOperands.OperatorId,
        ): Result<DateScanFieldCondition> {
            const operands: DateScanFieldCondition.HasValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateWithEquals(
            _field: ScanField,
            operatorId: DateScanFieldCondition.ValueOperands.OperatorId,
            value: SourceTzOffsetDate,
        ): Result<DateScanFieldCondition> {
            const operands: DateScanFieldCondition.ValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.DateValue,
                value,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createDateWithRange(
            _field: ScanField,
            operatorId: DateScanFieldCondition.RangeOperands.OperatorId,
            min: SourceTzOffsetDate | undefined,
            max: SourceTzOffsetDate | undefined,
        ): Result<DateScanFieldCondition> {
            const operands: DateScanFieldCondition.RangeOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.DateRange,
                min,
                max,
            };

            const condition: DateScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.Date,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextEquals(
            _field: ScanField,
            operatorId: TextEqualsScanFieldCondition.Operands.OperatorId,
            value: string,
        ): Result<TextEqualsScanFieldCondition> {
            const operands: BaseTextScanFieldCondition.ValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.TextValue,
                value,
            };

            const condition: TextEqualsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextEquals,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextContains(
            _field: ScanField,
            operatorId: TextContainsScanFieldCondition.Operands.OperatorId,
            value: string,
            asId: ScanFormula.TextContainsAsId,
            ignoreCase: boolean,
        ): Result<TextContainsScanFieldCondition> {
            const operands: BaseTextScanFieldCondition.ContainsOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.TextContains,
                contains: {
                    value,
                    asId,
                    ignoreCase,
                }
            };

            const condition: TextContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueEqualsWithHasValue(
            _field: ScanField,
            operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId,
        ): Result<TextHasValueEqualsScanFieldCondition> {
            const operands: BaseTextScanFieldCondition.HasValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: TextHasValueEqualsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueEquals,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueEqualsWithValue(
            _field: ScanField,
            operatorId: BaseTextScanFieldCondition.ValueOperands.OperatorId,
            value: string,
        ): Result<TextHasValueEqualsScanFieldCondition> {
            const operands: BaseTextScanFieldCondition.ValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.TextValue,
                value,
            };

            const condition: TextHasValueEqualsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueEquals,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueContainsWithHasValue(
            _field: ScanField,
            operatorId: BaseTextScanFieldCondition.HasValueOperands.OperatorId,
        ): Result<TextHasValueContainsScanFieldCondition> {
            const operands: BaseTextScanFieldCondition.HasValueOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.HasValue,
            };

            const condition: TextHasValueContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createTextHasValueContainsWithContains(
            _field: ScanField,
            operatorId: BaseTextScanFieldCondition.ContainsOperands.OperatorId,
            value: string,
            asId: ScanFormula.TextContainsAsId,
            ignoreCase: boolean,
        ): Result<TextHasValueContainsScanFieldCondition> {
            const operands: BaseTextScanFieldCondition.ContainsOperands = {
                typeId: ScanFieldCondition.Operands.TypeId.TextContains,
                contains: {
                    value,
                    asId,
                    ignoreCase,
                }
            };

            const condition: TextHasValueContainsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.TextHasValueContains,
                operatorId,
                operands,
            };

            return new Ok(condition);
        }

        createStringOverlaps(
            _field: ScanField,
            operatorId: OverlapsScanFieldCondition.Operands.OperatorId,
            values: readonly string[],
        ): Result<StringOverlapsScanFieldCondition> {
            const condition: StringOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.StringOverlaps,
                operatorId,
                operands: {
                    typeId: ScanFieldCondition.Operands.TypeId.TextEnum,
                    values: values.slice(),
                }
            };

            return new Ok(condition);
        }

        createCurrencyOverlaps(
            _field: ScanField,
            operatorId: OverlapsScanFieldCondition.Operands.OperatorId,
            values: readonly CurrencyId[],
        ): Result<CurrencyOverlapsScanFieldCondition> {
            const condition: CurrencyOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.CurrencyOverlaps,
                operatorId,
                operands: {
                    typeId: ScanFieldCondition.Operands.TypeId.CurrencyEnum,
                    values: values.slice(),
                }
            };

            return new Ok(condition);
        }

        createExchangeOverlaps(
            _field: ScanField,
            operatorId: OverlapsScanFieldCondition.Operands.OperatorId,
            values: readonly ExchangeId[],
        ): Result<ExchangeOverlapsScanFieldCondition> {
            const condition: ExchangeOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.ExchangeOverlaps,
                operatorId,
                operands: {
                    typeId: ScanFieldCondition.Operands.TypeId.ExchangeEnum,
                    values: values.slice(),
                }
            };

            return new Ok(condition);
        }

        createMarketOverlaps(
            _field: ScanField,
            operatorId: OverlapsScanFieldCondition.Operands.OperatorId,
            values: readonly MarketId[],
        ): Result<MarketOverlapsScanFieldCondition> {
            const condition: MarketOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.MarketOverlaps,
                operatorId,
                operands: {
                    typeId: ScanFieldCondition.Operands.TypeId.MarketEnum,
                    values: values.slice(),
                }
            };

            return new Ok(condition);
        }

        createMarketBoardOverlaps(
            _field: ScanField,
            operatorId: OverlapsScanFieldCondition.Operands.OperatorId,
            values: readonly MarketBoardId[],
        ): Result<MarketBoardOverlapsScanFieldCondition> {
            const condition: MarketBoardOverlapsScanFieldCondition = {
                typeId: ScanFieldCondition.TypeId.MarketBoardOverlaps,
                operatorId,
                operands: {
                    typeId: ScanFieldCondition.Operands.TypeId.MarketBoardEnum,
                    values: values.slice(),
                }
            };

            return new Ok(condition);
        }

        createIs(
            _field: ScanField,
            operatorId: IsScanFieldCondition.Operands.OperatorId,
            categoryId: ScanFormula.IsNode.CategoryId,
        ): Result<IsScanFieldCondition> {
            throw new Error();
        }
    }
}

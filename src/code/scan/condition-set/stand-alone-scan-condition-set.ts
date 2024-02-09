/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, Ok, Result, SourceTzOffsetDateTime, UiComparableList, UnreachableCaseError } from '../../sys/sys-internal-api';
import { ScanFormula } from '../formula/internal-api';
import { ScanConditionSetLoadError, ScanConditionSetLoadErrorTypeId } from './common/internal-api';
import { AllScanCondition, AltCodeSubFieldContainsScanCondition, AltCodeSubFieldHasValueScanCondition, AttributeSubFieldContainsScanCondition, AttributeSubFieldHasValueScanCondition, CurrencyFieldOverlapsScanCondition, DateFieldEqualsScanCondition, DateFieldInRangeScanCondition, DateSubFieldEqualsScanCondition, DateSubFieldHasValueScanCondition, DateSubFieldInRangeScanCondition, ExchangeFieldOverlapsScanCondition, FieldHasValueScanCondition, IsScanCondition, MarketBoardFieldOverlapsScanCondition, MarketFieldOverlapsScanCondition, NoneScanCondition, NumericComparisonScanCondition, NumericFieldEqualsScanCondition, NumericFieldInRangeScanCondition, PriceSubFieldEqualsScanCondition, PriceSubFieldHasValueScanCondition, PriceSubFieldInRangeScanCondition, ScanCondition, ScanConditionFactory, StringFieldOverlapsScanCondition, TextFieldContainsScanCondition, TextFieldEqualsScanCondition } from './condition/internal-api';
import { ScanConditionSet } from './scan-condition-set';

export class StandAloneScanConditionSet implements ScanConditionSet {
    readonly conditionFactory = new StandAloneScanConditionSet.ConditionFactory();

    setOperationId: ScanConditionSet.BooleanOperationId;
    notSetOperation: boolean;
    conditions: UiComparableList<ScanCondition>;
    loadError: ScanConditionSetLoadError | undefined;

    assign(value: ScanConditionSet): void {
        this.setOperationId = value.setOperationId;
        this.notSetOperation = value.notSetOperation;
        this.loadError = value.loadError;
        this.conditions.clear();

        const valueConditions = value.conditions;
        const conditionCount = valueConditions.count;
        this.conditions.capacity = conditionCount;
        for (let i = 0; i < conditionCount; i++) {
            const valueCondition = valueConditions.getAt(i);
            const copiedCondition = this.createCopyOfCondition(valueCondition);
            this.conditions.add(copiedCondition);
        }
    }

    private createCopyOfCondition(condition: ScanCondition): ScanCondition {
        const typeId = condition.typeId;
        switch(condition.typeId) {
            case ScanCondition.TypeId.NumericComparison: {
                const originalCondition = condition as NumericComparisonScanCondition;
                const originalLeftOperand = originalCondition.leftOperand;
                const originalRightOperand = originalCondition.rightOperand;

                let copiedRightOperand: NumericComparisonScanCondition.TypedOperand;
                switch (originalRightOperand.typeId) {
                    case NumericComparisonScanCondition.TypedOperand.TypeId.Number: {
                        const copiedTypedOperand: NumericComparisonScanCondition.NumberTypedOperand = {
                            typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Number,
                            value: (originalRightOperand as NumericComparisonScanCondition.NumberTypedOperand).value,
                        };
                        copiedRightOperand = copiedTypedOperand;
                        break;
                    }
                    case NumericComparisonScanCondition.TypedOperand.TypeId.Field: {
                        const copiedTypedOperand: NumericComparisonScanCondition.FieldTypedOperand = {
                            typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Field,
                            fieldId: (originalRightOperand as NumericComparisonScanCondition.FieldTypedOperand).fieldId,
                        };
                        copiedRightOperand = copiedTypedOperand;
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('SDFCCOCU69111', originalRightOperand.typeId);
                }

                const copiedCondition: NumericComparisonScanCondition = {
                    typeId,
                    operationId: originalCondition.operationId,
                    leftOperand: originalLeftOperand,
                    rightOperand: copiedRightOperand,
                }
                return copiedCondition;
            }
            case ScanCondition.TypeId.All: {
                const originalCondition = condition as AllScanCondition;
                const copiedCondition: AllScanCondition = {
                    typeId: originalCondition.typeId,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.None: {
                const originalCondition = condition as NoneScanCondition;
                const copiedCondition: NoneScanCondition = {
                    typeId: originalCondition.typeId,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.Is: {
                const originalCondition = condition as IsScanCondition;
                const copiedCondition: IsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    categoryId: originalCondition.categoryId,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.FieldHasValue: {
                const originalCondition = condition as FieldHasValueScanCondition;
                const copiedCondition: FieldHasValueScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                };
                return copiedCondition;
            }
            // case ScanCondition.TypeId.BooleanFieldEquals: {
            //     const originalCondition = condition as BooleanFieldEqualsScanCondition;
            //     const copiedCondition: BooleanFieldEqualsScanCondition = {
            //         typeId: originalCondition.typeId,
            //         not: originalCondition.not,
            //         fieldId: originalCondition.fieldId,
            //         target: originalCondition.target,
            //     };
            //     return copiedCondition;
            // }
            case ScanCondition.TypeId.NumericFieldEquals: {
                const originalCondition = condition as NumericFieldEqualsScanCondition;
                const copiedCondition: NumericFieldEqualsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    target: originalCondition.target,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.NumericFieldInRange: {
                const originalCondition = condition as NumericFieldInRangeScanCondition;
                const copiedCondition: NumericFieldInRangeScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    min: originalCondition.min,
                    max: originalCondition.max,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.DateFieldEquals: {
                const originalCondition = condition as DateFieldEqualsScanCondition;
                const copiedCondition: DateFieldEqualsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    target: SourceTzOffsetDateTime.createCopy(originalCondition.target),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.DateFieldInRange: {
                const originalCondition = condition as DateFieldInRangeScanCondition;
                const copiedCondition: DateFieldInRangeScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    min: SourceTzOffsetDateTime.newUndefinable(originalCondition.min),
                    max: SourceTzOffsetDateTime.newUndefinable(originalCondition.max),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.StringFieldOverlaps: {
                const originalCondition = condition as StringFieldOverlapsScanCondition;
                const copiedCondition: StringFieldOverlapsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    values: originalCondition.values.slice(),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.CurrencyFieldOverlaps: {
                const originalCondition = condition as CurrencyFieldOverlapsScanCondition;
                const copiedCondition: CurrencyFieldOverlapsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    values: originalCondition.values.slice(),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.ExchangeFieldOverlaps: {
                const originalCondition = condition as ExchangeFieldOverlapsScanCondition;
                const copiedCondition: ExchangeFieldOverlapsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    values: originalCondition.values.slice(),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.MarketFieldOverlaps: {
                const originalCondition = condition as MarketFieldOverlapsScanCondition;
                const copiedCondition: MarketFieldOverlapsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    values: originalCondition.values.slice(),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.MarketBoardFieldOverlaps: {
                const originalCondition = condition as MarketBoardFieldOverlapsScanCondition;
                const copiedCondition: MarketBoardFieldOverlapsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    values: originalCondition.values.slice(),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.TextFieldEquals: {
                const originalCondition = condition as TextFieldEqualsScanCondition;
                const copiedCondition: TextFieldEqualsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    target: originalCondition.target,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.TextFieldContains: {
                const originalCondition = condition as TextFieldContainsScanCondition;
                const copiedCondition: TextFieldContainsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    value: originalCondition.value,
                    asId: originalCondition.asId,
                    ignoreCase: originalCondition.ignoreCase,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.PriceSubFieldHasValue: {
                const originalCondition = condition as PriceSubFieldHasValueScanCondition;
                const copiedCondition: PriceSubFieldHasValueScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.PriceSubFieldEquals: {
                const originalCondition = condition as PriceSubFieldEqualsScanCondition;
                const copiedCondition: PriceSubFieldEqualsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    subFieldId: originalCondition.subFieldId,
                    fieldId: originalCondition.fieldId,
                    target: originalCondition.target,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.PriceSubFieldInRange: {
                const originalCondition = condition as PriceSubFieldInRangeScanCondition;
                const copiedCondition: PriceSubFieldInRangeScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                    min: originalCondition.min,
                    max: originalCondition.max,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.DateSubFieldHasValue: {
                const originalCondition = condition as DateSubFieldHasValueScanCondition;
                const copiedCondition: DateSubFieldHasValueScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.DateSubFieldEquals: {
                const originalCondition = condition as DateSubFieldEqualsScanCondition;
                const copiedCondition: DateSubFieldEqualsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    subFieldId: originalCondition.subFieldId,
                    fieldId: originalCondition.fieldId,
                    target: SourceTzOffsetDateTime.createCopy(originalCondition.target),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.DateSubFieldInRange: {
                const originalCondition = condition as DateSubFieldInRangeScanCondition;
                const copiedCondition: DateSubFieldInRangeScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                    min: SourceTzOffsetDateTime.newUndefinable(originalCondition.min),
                    max: SourceTzOffsetDateTime.newUndefinable(originalCondition.max),
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.AltCodeSubFieldHasValue: {
                const originalCondition = condition as AltCodeSubFieldHasValueScanCondition;
                const copiedCondition: AltCodeSubFieldHasValueScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.AltCodeSubFieldContains: {
                const originalCondition = condition as AltCodeSubFieldContainsScanCondition;
                const copiedCondition: AltCodeSubFieldContainsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                    value: originalCondition.value,
                    asId: originalCondition.asId,
                    ignoreCase: originalCondition.ignoreCase,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.AttributeSubFieldHasValue: {
                const originalCondition = condition as AttributeSubFieldHasValueScanCondition;
                const copiedCondition: AttributeSubFieldHasValueScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                };
                return copiedCondition;
            }
            case ScanCondition.TypeId.AttributeSubFieldContains: {
                const originalCondition = condition as AttributeSubFieldContainsScanCondition;
                const copiedCondition: AttributeSubFieldContainsScanCondition = {
                    typeId: originalCondition.typeId,
                    not: originalCondition.not,
                    fieldId: originalCondition.fieldId,
                    subFieldId: originalCondition.subFieldId,
                    value: originalCondition.value,
                    asId: originalCondition.asId,
                    ignoreCase: originalCondition.ignoreCase,
                };
                return copiedCondition;
            }
            default:
                throw new UnreachableCaseError('STSCSCCOC58887', condition.typeId)
        }
    }
}

export namespace StandAloneScanConditionSet {
    export class ConditionFactory implements ScanConditionFactory {
        createNumericComparison(
            formulaNode: ScanFormula.NumericComparisonBooleanNode,
            operationId: NumericComparisonScanCondition.OperationId
        ): Result<NumericComparisonScanCondition, ScanConditionSetLoadError> {
            const formulaLeftOperand = formulaNode.leftOperand;
            const formulaRightOperand = formulaNode.rightOperand;
            let possiblySwitchedFormulaLeftOperand: ScanFormula.NumericNode;
            let possiblySwitchedFormulaRightOperand: number | ScanFormula.NumericNode;
            let leftRightOperandsSwitched: boolean;

            if (typeof formulaLeftOperand !== 'number') {
                possiblySwitchedFormulaLeftOperand = formulaLeftOperand;
                possiblySwitchedFormulaRightOperand = formulaRightOperand;
                leftRightOperandsSwitched = false;
            } else {
                if (typeof formulaRightOperand !== 'number') {
                    possiblySwitchedFormulaLeftOperand = formulaRightOperand;
                    possiblySwitchedFormulaRightOperand = formulaLeftOperand;
                    leftRightOperandsSwitched = true;
                } else {
                    return new Err( { typeId: ScanConditionSetLoadErrorTypeId.LeftAndRightNumericComparisonOperandTypesAreBothNumber, extra: '' });
                }
            }

            if (!ScanFormula.NumericFieldValueGetNode.is(possiblySwitchedFormulaLeftOperand)) {
                const errorTypeId = leftRightOperandsSwitched ?
                    ScanConditionSetLoadErrorTypeId.RightNumericComparisonOperandTypeIsNotSupported :
                    ScanConditionSetLoadErrorTypeId.LeftNumericComparisonOperandTypeIsNotSupported;
                return new Err( { typeId: errorTypeId, extra: possiblySwitchedFormulaLeftOperand.typeId.toString() } );
            } else {
                const conditionLeftOperand = possiblySwitchedFormulaLeftOperand.fieldId;

                let conditionRightOperand: NumericComparisonScanCondition.TypedOperand;
                if (typeof possiblySwitchedFormulaRightOperand === 'number') {
                    const numberTypedOperand: NumericComparisonScanCondition.NumberTypedOperand = {
                        typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Number,
                        value: possiblySwitchedFormulaRightOperand,
                    }
                    conditionRightOperand = numberTypedOperand;
                } else {
                    if (!ScanFormula.NumericFieldValueGetNode.is(possiblySwitchedFormulaRightOperand)) {
                        const errorTypeId = leftRightOperandsSwitched ?
                            ScanConditionSetLoadErrorTypeId.LeftNumericComparisonOperandTypeIsNotSupported :
                            ScanConditionSetLoadErrorTypeId.RightNumericComparisonOperandTypeIsNotSupported;
                        return new Err( { typeId: errorTypeId, extra: possiblySwitchedFormulaRightOperand.typeId.toString() } );
                    } else {
                        const fieldTypedOperand: NumericComparisonScanCondition.FieldTypedOperand = {
                            typeId: NumericComparisonScanCondition.TypedOperand.TypeId.Field,
                            fieldId: possiblySwitchedFormulaRightOperand.fieldId,
                        }
                        conditionRightOperand = fieldTypedOperand;
                    }
                }

                return new Ok({
                    typeId: ScanCondition.TypeId.NumericComparison,
                    operationId,
                    leftOperand: conditionLeftOperand,
                    rightOperand: conditionRightOperand,
                });
            }
        }
        createAll(_formulaNode: ScanFormula.AllNode): Result<AllScanCondition, ScanConditionSetLoadError> {
            return new Ok({ typeId: ScanCondition.TypeId.All });
        }
        createNone(_formulaNode: ScanFormula.NoneNode): Result<NoneScanCondition, ScanConditionSetLoadError> {
            return new Ok({ typeId: ScanCondition.TypeId.None });
        }
        createIs(formulaNode: ScanFormula.IsNode, not: boolean): Result<IsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.Is,
                not: formulaNode.trueFalse === not, // condition can be not if either trueFalse is false or not is true or vice versa.  Cannot be not if both the same
                categoryId: formulaNode.categoryId,
            });
        }
        createFieldHasValue(formulaNode: ScanFormula.FieldHasValueNode, not: boolean): Result<FieldHasValueScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.FieldHasValue,
                not,
                fieldId: formulaNode.fieldId,
            });
        }
        // createBooleanFieldEquals(formulaNode: ScanFormula.BooleanFieldEqualsNode, not: boolean): Result<BooleanFieldEqualsScanCondition, ScanConditionSetLoadError> {
        //     return new Ok({
        //         typeId: ScanCondition.TypeId.BooleanFieldEquals,
        //         not,
        //         fieldId: formulaNode.fieldId,
        //         target: formulaNode.target,
        //     });
        // }
        createNumericFieldEquals(formulaNode: ScanFormula.NumericFieldEqualsNode, not: boolean): Result<NumericFieldEqualsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.NumericFieldEquals,
                not,
                fieldId: formulaNode.fieldId,
                target: formulaNode.value,
            });
        }
        createNumericFieldInRange(formulaNode: ScanFormula.NumericFieldInRangeNode, not: boolean): Result<NumericFieldInRangeScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.NumericFieldInRange,
                not,
                fieldId: formulaNode.fieldId,
                min: formulaNode.min,
                max: formulaNode.max,
            });
        }
        createDateFieldEquals(formulaNode: ScanFormula.DateFieldEqualsNode, not: boolean): Result<DateFieldEqualsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.DateFieldEquals,
                not,
                fieldId: formulaNode.fieldId,
                target: SourceTzOffsetDateTime.createCopy(formulaNode.value),
            });
        }
        createDateFieldInRange(formulaNode: ScanFormula.DateFieldInRangeNode, not: boolean): Result<DateFieldInRangeScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.DateFieldInRange,
                not,
                fieldId: formulaNode.fieldId,
                min: SourceTzOffsetDateTime.newUndefinable(formulaNode.min),
                max: SourceTzOffsetDateTime.newUndefinable(formulaNode.max),
            });
        }
        createStringFieldOverlaps(formulaNode: ScanFormula.StringFieldOverlapsNode, not: boolean): Result<StringFieldOverlapsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.StringFieldOverlaps,
                not,
                fieldId: formulaNode.fieldId,
                values: formulaNode.values.slice(),
            });
        }
        createCurrencyFieldOverlaps(formulaNode: ScanFormula.CurrencyFieldOverlapsNode, not: boolean): Result<CurrencyFieldOverlapsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.CurrencyFieldOverlaps,
                not,
                fieldId: formulaNode.fieldId,
                values: formulaNode.values.slice(),
            });
        }
        createExchangeFieldOverlaps(formulaNode: ScanFormula.ExchangeFieldOverlapsNode, not: boolean): Result<ExchangeFieldOverlapsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.ExchangeFieldOverlaps,
                not,
                fieldId: formulaNode.fieldId,
                values: formulaNode.values.slice(),
            });
        }
        createMarketFieldOverlaps(formulaNode: ScanFormula.MarketFieldOverlapsNode, not: boolean): Result<MarketFieldOverlapsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.MarketFieldOverlaps,
                not,
                fieldId: formulaNode.fieldId,
                values: formulaNode.values.slice(),
            });
        }
        createMarketBoardFieldOverlaps(formulaNode: ScanFormula.MarketBoardFieldOverlapsNode, not: boolean): Result<MarketBoardFieldOverlapsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.MarketBoardFieldOverlaps,
                not,
                fieldId: formulaNode.fieldId,
                values: formulaNode.values.slice(),
            });
        }
        createTextFieldEquals(formulaNode: ScanFormula.TextFieldEqualsNode, not: boolean): Result<TextFieldEqualsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.TextFieldEquals,
                not,
                fieldId: formulaNode.fieldId,
                target: formulaNode.value,
            });
        }
        createTextFieldContains(formulaNode: ScanFormula.TextFieldContainsNode, not: boolean): Result<TextFieldContainsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.TextFieldContains,
                not,
                fieldId: formulaNode.fieldId,
                value: formulaNode.value,
                asId: formulaNode.asId,
                ignoreCase: formulaNode.ignoreCase,
            });
        }
        createPriceSubFieldHasValue(formulaNode: ScanFormula.PriceSubFieldHasValueNode, not: boolean): Result<PriceSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.PriceSubFieldHasValue,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
            });
        }
        createPriceSubFieldEquals(formulaNode: ScanFormula.PriceSubFieldEqualsNode, not: boolean): Result<PriceSubFieldEqualsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.PriceSubFieldEquals,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
                target: formulaNode.value,
            });
        }
        createPriceSubFieldInRange(formulaNode: ScanFormula.PriceSubFieldInRangeNode, not: boolean): Result<PriceSubFieldInRangeScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.PriceSubFieldInRange,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
                min: formulaNode.min,
                max: formulaNode.max,
            });
        }
        createDateSubFieldHasValue(formulaNode: ScanFormula.DateSubFieldHasValueNode, not: boolean): Result<DateSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.DateSubFieldHasValue,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
            });
        }
        createDateSubFieldEquals(formulaNode: ScanFormula.DateSubFieldEqualsNode, not: boolean): Result<DateSubFieldEqualsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.DateSubFieldEquals,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
                target: SourceTzOffsetDateTime.createCopy(formulaNode.value),
            });
        }
        createDateSubFieldInRange(formulaNode: ScanFormula.DateSubFieldInRangeNode, not: boolean): Result<DateSubFieldInRangeScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.DateSubFieldInRange,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
                min: SourceTzOffsetDateTime.newUndefinable(formulaNode.min),
                max: SourceTzOffsetDateTime.newUndefinable(formulaNode.max),
            });
        }
        createAltCodeSubFieldHasValue(formulaNode: ScanFormula.AltCodeSubFieldHasValueNode, not: boolean): Result<AltCodeSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.AltCodeSubFieldHasValue,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
            });
        }
        createAltCodeSubFieldContains(formulaNode: ScanFormula.AltCodeSubFieldContainsNode, not: boolean): Result<AltCodeSubFieldContainsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.AltCodeSubFieldContains,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
                value: formulaNode.value,
                asId: formulaNode.asId,
                ignoreCase: formulaNode.ignoreCase,
            });
        }
        createAttributeSubFieldHasValue(formulaNode: ScanFormula.AttributeSubFieldHasValueNode, not: boolean): Result<AttributeSubFieldHasValueScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.AttributeSubFieldHasValue,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
            });
        }
        createAttributeSubFieldContains(formulaNode: ScanFormula.AttributeSubFieldContainsNode, not: boolean): Result<AttributeSubFieldContainsScanCondition, ScanConditionSetLoadError> {
            return new Ok({
                typeId: ScanCondition.TypeId.AttributeSubFieldContains,
                not,
                fieldId: formulaNode.fieldId,
                subFieldId: formulaNode.subFieldId,
                value: formulaNode.value,
                asId: formulaNode.asId,
                ignoreCase: formulaNode.ignoreCase,
            });
        }
    }
}

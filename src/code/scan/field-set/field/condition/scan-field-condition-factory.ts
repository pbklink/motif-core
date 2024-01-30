/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result } from '../../../../sys/sys-internal-api';
import { ScanFormula } from '../../../formula/internal-api';
import { ScanFieldSetLoadError } from '../../common/internal-api';
import {
    CurrencyOverlapsScanFieldCondition,
    DateScanFieldCondition,
    ExchangeOverlapsScanFieldCondition,
    IsScanFieldCondition,
    MarketBoardOverlapsScanFieldCondition,
    MarketOverlapsScanFieldCondition,
    NumericComparisonScanFieldCondition,
    NumericScanFieldCondition,
    OverlapsScanFieldCondition,
    StringOverlapsScanFieldCondition,
    TextContainsScanFieldCondition,
    TextEqualsScanFieldCondition,
    TextHasValueContainsScanFieldCondition,
    TextHasValueEqualsScanFieldCondition
} from './scan-field-condition';

export interface ScanFieldConditionFactory {
    createNumericComparisonFromNumericComparison(formulaNode: ScanFormula.NumericComparisonBooleanNode, operatorId: NumericComparisonScanFieldCondition.OperatorId, useRightOperandAsValue: boolean): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
    createNumericComparisonFromFieldHasValue(formulaNode: ScanFormula.FieldHasValueNode, operatorId: NumericComparisonScanFieldCondition.OperatorId): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
    createNumericComparisonFromNumericFieldEquals(formulaNode: ScanFormula.NumericFieldEqualsNode, operatorId: NumericComparisonScanFieldCondition.OperatorId): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
    createNumericComparisonFromNumericFieldInRange(formulaNode: ScanFormula.NumericFieldInRangeNode, operatorId: NumericComparisonScanFieldCondition.OperatorId): Result<NumericComparisonScanFieldCondition, ScanFieldSetLoadError>;
    createNumericFromPriceSubFieldHasValue(formulaNode: ScanFormula.PriceSubFieldHasValueNode, operatorId: NumericScanFieldCondition.OperatorId): Result<NumericScanFieldCondition, ScanFieldSetLoadError>;
    createNumericFromPriceSubFieldEquals(formulaNode: ScanFormula.PriceSubFieldEqualsNode, operatorId: NumericScanFieldCondition.OperatorId): Result<NumericScanFieldCondition, ScanFieldSetLoadError>;
    createNumericFromPriceSubFieldInRange(formulaNode: ScanFormula.PriceSubFieldInRangeNode, operatorId: NumericScanFieldCondition.OperatorId): Result<NumericScanFieldCondition, ScanFieldSetLoadError>;
    createDateFromFieldHasValue(formulaNode: ScanFormula.FieldHasValueNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
    createDateFromDateFieldEquals(formulaNode: ScanFormula.DateFieldEqualsNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
    createDateFromDateFieldInRange(formulaNode: ScanFormula.DateFieldInRangeNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
    createDateFromDateSubFieldHasValue(formulaNode: ScanFormula.DateSubFieldHasValueNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
    createDateFromDateSubFieldEquals(formulaNode: ScanFormula.DateSubFieldEqualsNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
    createDateFromDateSubFieldInRange(formulaNode: ScanFormula.DateSubFieldInRangeNode, operatorId: DateScanFieldCondition.OperatorId): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
    createTextEqualsFromTextFieldEquals(formulaNode: ScanFormula.TextFieldEqualsNode, operatorId: TextEqualsScanFieldCondition.OperatorId): Result<TextEqualsScanFieldCondition, ScanFieldSetLoadError>;
    createTextContainsFromTextFieldContains(formulaNode: ScanFormula.TextFieldContainsNode, operatorId: TextContainsScanFieldCondition.OperatorId): Result<TextContainsScanFieldCondition, ScanFieldSetLoadError>;
    createTextHasValueEqualsFromFieldHasValue(formulaNode: ScanFormula.FieldHasValueNode, operatorId: TextHasValueEqualsScanFieldCondition.OperatorId): Result<TextHasValueEqualsScanFieldCondition, ScanFieldSetLoadError>;
    createTextHasValueEqualsFromTextFieldEquals(formulaNode: ScanFormula.TextFieldEqualsNode, operatorId: TextHasValueEqualsScanFieldCondition.OperatorId): Result<TextHasValueEqualsScanFieldCondition, ScanFieldSetLoadError>;
    createTextHasValueContainsFromAltCodeSubFieldHasValue(formulaNode: ScanFormula.AltCodeSubFieldHasValueNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
    createTextHasValueContainsFromAltCodeSubFieldContains(formulaNode: ScanFormula.AltCodeSubFieldContainsNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
    createTextHasValueContainsFromAttributeSubFieldHasValue(formulaNode: ScanFormula.AttributeSubFieldHasValueNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
    createTextHasValueContainsFromAttributeSubFieldContains(formulaNode: ScanFormula.AttributeSubFieldContainsNode, operatorId: TextHasValueContainsScanFieldCondition.OperatorId): Result<TextHasValueContainsScanFieldCondition, ScanFieldSetLoadError>;
    createStringOverlapsFromStringFieldOverlaps(formulaNode: ScanFormula.StringFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<StringOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createCurrencyOverlapsFromCurrencyFieldOverlaps(formulaNode: ScanFormula.CurrencyFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<CurrencyOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createExchangeOverlapsFromExchangeFieldOverlaps(formulaNode: ScanFormula.ExchangeFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<ExchangeOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createMarketOverlapsFromMarketFieldOverlaps(formulaNode: ScanFormula.MarketFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<MarketOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createMarketBoardOverlapsFromMarketBoardFieldOverlaps(formulaNode: ScanFormula.MarketBoardFieldOverlapsNode, operatorId: OverlapsScanFieldCondition.OperatorId): Result<MarketBoardOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createIsFromIs(formulaNode: ScanFormula.IsNode, operatorId: IsScanFieldCondition.OperatorId): Result<IsScanFieldCondition, ScanFieldSetLoadError>;
}

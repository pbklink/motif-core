/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result } from '../../../sys/sys-internal-api';
import { ScanFormula } from '../../formula/internal-api';
import { ScanConditionSetLoadError } from '../common/internal-api';
import {
    AllScanCondition,
    AltCodeSubFieldContainsScanCondition,
    AltCodeSubFieldHasValueScanCondition,
    AttributeSubFieldContainsScanCondition,
    AttributeSubFieldHasValueScanCondition,
    CurrencyFieldOverlapsScanCondition,
    // BooleanFieldEqualsScanCondition,
    DateFieldEqualsScanCondition,
    DateFieldInRangeScanCondition,
    DateSubFieldEqualsScanCondition,
    DateSubFieldHasValueScanCondition,
    DateSubFieldInRangeScanCondition,
    ExchangeFieldOverlapsScanCondition,
    FieldHasValueScanCondition,
    IsScanCondition,
    MarketBoardFieldOverlapsScanCondition,
    MarketFieldOverlapsScanCondition,
    NoneScanCondition,
    NumericComparisonScanCondition,
    NumericFieldEqualsScanCondition,
    NumericFieldInRangeScanCondition,
    PriceSubFieldEqualsScanCondition,
    PriceSubFieldHasValueScanCondition,
    PriceSubFieldInRangeScanCondition,
    StringFieldOverlapsScanCondition,
    TextFieldContainsScanCondition,
    TextFieldEqualsScanCondition
} from './scan-condition';

export interface ScanConditionFactory {
    createNumericComparison(formulaNode: ScanFormula.NumericComparisonBooleanNode, operationId: NumericComparisonScanCondition.OperationId): Result<NumericComparisonScanCondition, ScanConditionSetLoadError>;
    createAll(formulaNode: ScanFormula.AllNode): Result<AllScanCondition, ScanConditionSetLoadError>;
    createNone(formulaNode: ScanFormula.NoneNode): Result<NoneScanCondition, ScanConditionSetLoadError>;
    createIs(formulaNode: ScanFormula.IsNode, not: boolean): Result<IsScanCondition, ScanConditionSetLoadError>;
    createFieldHasValue(formulaNode: ScanFormula.FieldHasValueNode, not: boolean): Result<FieldHasValueScanCondition, ScanConditionSetLoadError>;
    // createBooleanFieldEquals(formulaNode: ScanFormula.BooleanFieldEqualsNode, not: boolean): Result<BooleanFieldEqualsScanCondition, ScanConditionSetLoadError>;
    createNumericFieldEquals(formulaNode: ScanFormula.NumericFieldEqualsNode, not: boolean): Result<NumericFieldEqualsScanCondition, ScanConditionSetLoadError>;
    createNumericFieldInRange(formulaNode: ScanFormula.NumericFieldInRangeNode, not: boolean): Result<NumericFieldInRangeScanCondition, ScanConditionSetLoadError>;
    createDateFieldEquals(formulaNode: ScanFormula.DateFieldEqualsNode, not: boolean): Result<DateFieldEqualsScanCondition, ScanConditionSetLoadError>;
    createDateFieldInRange(formulaNode: ScanFormula.DateFieldInRangeNode, not: boolean): Result<DateFieldInRangeScanCondition, ScanConditionSetLoadError>;
    createStringFieldOverlaps(formulaNode: ScanFormula.StringFieldOverlapsNode, not: boolean): Result<StringFieldOverlapsScanCondition, ScanConditionSetLoadError>;
    createCurrencyFieldOverlaps(formulaNode: ScanFormula.CurrencyFieldOverlapsNode, not: boolean): Result<CurrencyFieldOverlapsScanCondition, ScanConditionSetLoadError>;
    createExchangeFieldOverlaps(formulaNode: ScanFormula.ExchangeFieldOverlapsNode, not: boolean): Result<ExchangeFieldOverlapsScanCondition, ScanConditionSetLoadError>;
    createMarketFieldOverlaps(formulaNode: ScanFormula.MarketFieldOverlapsNode, not: boolean): Result<MarketFieldOverlapsScanCondition, ScanConditionSetLoadError>;
    createMarketBoardFieldOverlaps(formulaNode: ScanFormula.MarketBoardFieldOverlapsNode, not: boolean): Result<MarketBoardFieldOverlapsScanCondition, ScanConditionSetLoadError>;
    createTextFieldEquals(formulaNode: ScanFormula.TextFieldEqualsNode, not: boolean): Result<TextFieldEqualsScanCondition, ScanConditionSetLoadError>;
    createTextFieldContains(formulaNode: ScanFormula.TextFieldContainsNode, not: boolean): Result<TextFieldContainsScanCondition, ScanConditionSetLoadError>;
    createPriceSubFieldHasValue(formulaNode: ScanFormula.PriceSubFieldHasValueNode, not: boolean): Result<PriceSubFieldHasValueScanCondition, ScanConditionSetLoadError>;
    createPriceSubFieldEquals(formulaNode: ScanFormula.PriceSubFieldEqualsNode, not: boolean): Result<PriceSubFieldEqualsScanCondition, ScanConditionSetLoadError>;
    createPriceSubFieldInRange(formulaNode: ScanFormula.PriceSubFieldInRangeNode, not: boolean): Result<PriceSubFieldInRangeScanCondition, ScanConditionSetLoadError>;
    createDateSubFieldHasValue(formulaNode: ScanFormula.DateSubFieldHasValueNode, not: boolean): Result<DateSubFieldHasValueScanCondition, ScanConditionSetLoadError>;
    createDateSubFieldEquals(formulaNode: ScanFormula.DateSubFieldEqualsNode, not: boolean): Result<DateSubFieldEqualsScanCondition, ScanConditionSetLoadError>;
    createDateSubFieldInRange(formulaNode: ScanFormula.DateSubFieldInRangeNode, not: boolean): Result<DateSubFieldInRangeScanCondition, ScanConditionSetLoadError>;
    createAltCodeSubFieldHasValue(formulaNode: ScanFormula.AltCodeSubFieldHasValueNode, not: boolean): Result<AltCodeSubFieldHasValueScanCondition, ScanConditionSetLoadError>;
    createAltCodeSubFieldContains(formulaNode: ScanFormula.AltCodeSubFieldContainsNode, not: boolean): Result<AltCodeSubFieldContainsScanCondition, ScanConditionSetLoadError>;
    createAttributeSubFieldHasValue(formulaNode: ScanFormula.AttributeSubFieldHasValueNode, not: boolean): Result<AttributeSubFieldHasValueScanCondition, ScanConditionSetLoadError>;
    createAttributeSubFieldContains(formulaNode: ScanFormula.AttributeSubFieldContainsNode, not: boolean): Result<AttributeSubFieldContainsScanCondition, ScanConditionSetLoadError>;
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result } from '../../../sys/sys-internal-api';
import { ScanFormula } from '../../formula/internal-api';
import { ScanFieldSetLoadError } from '../common/internal-api';
import {
    AltCodeSubbedScanField,
    AttributeSubbedScanField,
    CurrencyOverlapsScanField,
    DateInRangeScanField,
    DateSubbedScanField,
    ExchangeOverlapsScanField,
    IsScanField,
    MarketBoardOverlapsScanField,
    MarketOverlapsScanField,
    NumericInRangeScanField,
    PriceSubbedScanField,
    StringOverlapsScanField,
    TextContainsScanField,
    TextEqualsScanField,
    TextHasValueEqualsScanField
} from './scan-field';

export interface ScanFieldFactory {
    createNumericInRange(fieldId: ScanFormula.NumericRangeFieldId): Result<NumericInRangeScanField, ScanFieldSetLoadError>;
    createPriceSubbed(subFieldId: ScanFormula.PriceSubFieldId): Result<PriceSubbedScanField, ScanFieldSetLoadError>;
    createDateInRange(fieldId: ScanFormula.DateRangeFieldId): Result<DateInRangeScanField, ScanFieldSetLoadError>;
    createDateSubbed(subFieldId: ScanFormula.DateSubFieldId): Result<DateSubbedScanField, ScanFieldSetLoadError>;
    createTextContains(fieldId: ScanFormula.TextContainsFieldId): Result<TextContainsScanField, ScanFieldSetLoadError>;
    createAltCodeSubbed(subFieldId: ScanFormula.AltCodeSubFieldId): Result<AltCodeSubbedScanField, ScanFieldSetLoadError>;
    createAttributeSubbed(subFieldId: ScanFormula.AttributeSubFieldId): Result<AttributeSubbedScanField, ScanFieldSetLoadError>;
    createTextEquals(fieldId: ScanFormula.TextEqualsFieldId): Result<TextEqualsScanField, ScanFieldSetLoadError>;
    createTextHasValueEquals(fieldId: ScanFormula.TextHasValueEqualsFieldId): Result<TextHasValueEqualsScanField, ScanFieldSetLoadError>;
    createStringOverlaps(fieldId: ScanFormula.StringOverlapsFieldId): Result<StringOverlapsScanField, ScanFieldSetLoadError>;
    createMarketBoardOverlaps(fieldId: ScanFormula.FieldId.MarketBoard): Result<MarketBoardOverlapsScanField, ScanFieldSetLoadError>;
    createCurrencyOverlaps(fieldId: ScanFormula.FieldId.Currency): Result<CurrencyOverlapsScanField, ScanFieldSetLoadError>;
    createExchangeOverlaps(fieldId: ScanFormula.FieldId.Exchange): Result<ExchangeOverlapsScanField, ScanFieldSetLoadError>;
    createMarketOverlaps(fieldId: ScanFormula.MarketOverlapsFieldId): Result<MarketOverlapsScanField, ScanFieldSetLoadError>;
    createIs(fieldId: ScanFormula.FieldId.Is): Result<IsScanField, ScanFieldSetLoadError>;
}

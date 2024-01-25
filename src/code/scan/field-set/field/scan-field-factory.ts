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
    BoardOverlapsScanField,
    CurrencyOverlapsScanField,
    DateScanField,
    DateSubbedScanField,
    ExchangeOverlapsScanField,
    IsScanField,
    MarketOverlapsScanField,
    NumericScanField,
    PriceSubbedScanField,
    StringOverlapsScanField,
    TextEqualsSingleScanField,
    TextExistsSingleScanField,
    TextScanField,
} from './scan-field';

export interface ScanFieldFactory {
    createNumeric(formulaNode: ScanFormula.BooleanNode): Result<NumericScanField, ScanFieldSetLoadError>;
    createPriceSub(formulaNode: ScanFormula.BooleanNode): Result<PriceSubbedScanField, ScanFieldSetLoadError>;
    createDate(formulaNode: ScanFormula.BooleanNode): Result<DateScanField, ScanFieldSetLoadError>;
    createDateSub(formulaNode: ScanFormula.BooleanNode): Result<DateSubbedScanField, ScanFieldSetLoadError>;
    createText(formulaNode: ScanFormula.BooleanNode): Result<TextScanField, ScanFieldSetLoadError>;
    createAltCodeSub(formulaNode: ScanFormula.BooleanNode): Result<AltCodeSubbedScanField, ScanFieldSetLoadError>;
    createAttributeSub(formulaNode: ScanFormula.BooleanNode): Result<AttributeSubbedScanField, ScanFieldSetLoadError>;
    createTextEqualsSingle(formulaNode: ScanFormula.BooleanNode): Result<TextEqualsSingleScanField, ScanFieldSetLoadError>;
    createTextExistsSingle(formulaNode: ScanFormula.BooleanNode): Result<TextExistsSingleScanField, ScanFieldSetLoadError>;
    createStringOverlaps(formulaNode: ScanFormula.BooleanNode): Result<StringOverlapsScanField, ScanFieldSetLoadError>;
    createBoardOverlaps(formulaNode: ScanFormula.BooleanNode): Result<BoardOverlapsScanField, ScanFieldSetLoadError>;
    createCurrencyOverlaps(formulaNode: ScanFormula.BooleanNode): Result<CurrencyOverlapsScanField, ScanFieldSetLoadError>;
    createExchangeOverlaps(formulaNode: ScanFormula.BooleanNode): Result<ExchangeOverlapsScanField, ScanFieldSetLoadError>;
    createMarketOverlaps(formulaNode: ScanFormula.BooleanNode): Result<MarketOverlapsScanField, ScanFieldSetLoadError>;
    createIs(formulaNode: ScanFormula.BooleanNode): Result<IsScanField, ScanFieldSetLoadError>;
}

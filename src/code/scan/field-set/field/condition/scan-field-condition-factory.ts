/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result } from '../../../../sys/sys-internal-api';
import { ScanFormula } from '../../../formula/internal-api';
import { ScanFieldSetLoadError } from '../../common/internal-api';
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
    StringOverlapsScanFieldCondition,
    TextEqualsSingleScanFieldCondition,
    TextExistsSingleScanFieldCondition,
    TextScanFieldCondition,
} from './scan-field-condition';

export interface ScanFieldConditionFactory {
    createNumeric(formulaNode: ScanFormula.BooleanNode): Result<NumericScanFieldCondition, ScanFieldSetLoadError>;
    createPriceSub(formulaNode: ScanFormula.BooleanNode): Result<PriceSubbedScanFieldCondition, ScanFieldSetLoadError>;
    createDate(formulaNode: ScanFormula.BooleanNode): Result<DateScanFieldCondition, ScanFieldSetLoadError>;
    createDateSub(formulaNode: ScanFormula.BooleanNode): Result<DateSubbedScanFieldCondition, ScanFieldSetLoadError>;
    createText(formulaNode: ScanFormula.BooleanNode): Result<TextScanFieldCondition, ScanFieldSetLoadError>;
    createAltCodeSub(formulaNode: ScanFormula.BooleanNode): Result<AltCodeSubbedScanFieldCondition, ScanFieldSetLoadError>;
    createAttributeSub(formulaNode: ScanFormula.BooleanNode): Result<AttributeSubbedScanFieldCondition, ScanFieldSetLoadError>;
    createTextEqualsSingle(formulaNode: ScanFormula.BooleanNode): Result<TextEqualsSingleScanFieldCondition, ScanFieldSetLoadError>;
    createTextExistsSingle(formulaNode: ScanFormula.BooleanNode): Result<TextExistsSingleScanFieldCondition, ScanFieldSetLoadError>;
    createStringOverlaps(formulaNode: ScanFormula.BooleanNode): Result<StringOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createBoardOverlaps(formulaNode: ScanFormula.BooleanNode): Result<BoardOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createCurrencyOverlaps(formulaNode: ScanFormula.BooleanNode): Result<CurrencyOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createExchangeOverlaps(formulaNode: ScanFormula.BooleanNode): Result<ExchangeOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createMarketOverlaps(formulaNode: ScanFormula.BooleanNode): Result<MarketOverlapsScanFieldCondition, ScanFieldSetLoadError>;
    createIs(formulaNode: ScanFormula.BooleanNode): Result<IsScanFieldCondition, ScanFieldSetLoadError>;
}

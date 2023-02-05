import { AssertInternalError, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { LitIvemId, MarketId, ScanTargetTypeId } from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace ZenithNotifyConvert {
    export namespace ScanType {
        export function toId(value: Zenith.NotifyController.ScanType) {
            switch (value) {
                case Zenith.NotifyController.ScanType.MarketSearch: return ScanTargetTypeId.Markets;
                case Zenith.NotifyController.ScanType.MarketMonitor: return ScanTargetTypeId.Symbols;
                default:
                    throw new UnreachableCaseError('ZNCSTTI20008', value);
            }
        }

        export function fromId(value: ScanTargetTypeId) {
            switch (value) {
                case ScanTargetTypeId.Markets: return Zenith.NotifyController.ScanType.MarketSearch;
                case ScanTargetTypeId.Symbols: return Zenith.NotifyController.ScanType.MarketMonitor;
                default:
                    throw new UnreachableCaseError('ZNCSTFI20008', value);
            }
        }
    }

    export namespace Target {
        export function toLitIvemIds(symbols: readonly Zenith.NotifyController.TargetSymbol[]): LitIvemId[] {
            const count = symbols.length;
            const result = new Array<LitIvemId>(count);
            for (let i = 0; i < count; i++) {
                const symbol = symbols[i];
                result[i] = ZenithConvert.Symbol.toId(symbol);
            }
            return result;
        }

        export function toMarketIds(markets: readonly Zenith.NotifyController.TargetMarket[]): MarketId[] {
            const count = markets.length;
            const result = new Array<MarketId>(count);
            for (let i = 0; i < count; i++) {
                const market = markets[i];
                const environmentedMarketId = ZenithConvert.EnvironmentedMarket.toId(market);
                result[i] = environmentedMarketId.marketId;
            }
            return result;
        }

        export function fromId(
            typeId: ScanTargetTypeId,
            targetLitIvemIds: readonly LitIvemId[] | undefined,
            targetMarketIds: readonly MarketId[] | undefined
        ) {
            switch (typeId) {
                case ScanTargetTypeId.Symbols: {
                    if (targetLitIvemIds === undefined) {
                        throw new AssertInternalError('ZNCTFIS44711');
                    } else {
                        const count = targetLitIvemIds.length;
                        const zenithSymbols = new Array<string>(count);
                        for (let i = 0; i < count; i++) {
                            const litItemId = targetLitIvemIds[i];
                            zenithSymbols[i] = ZenithConvert.Symbol.fromId(litItemId);
                        }
                        return zenithSymbols;
                    }
                }
                case ScanTargetTypeId.Markets: {
                    if (targetMarketIds === undefined) {
                        throw new AssertInternalError('ZNCTFIM44711');
                    } else {
                        const count = targetMarketIds.length;
                        const zenithMarkets = new Array<string>(count);
                        for (let i = 0; i < count; i++) {
                            const marketId = targetMarketIds[i];
                            zenithMarkets[i] = ZenithConvert.EnvironmentedMarket.fromId(marketId);
                        }
                        return zenithMarkets;
                    }
                }
                default:
                    throw new UnreachableCaseError('ZNCTFITU53339', typeId);
            }
        }
    }

    export interface ScanMetaData {
        readonly versionId: string | undefined;
        readonly lastSavedTime: Date | undefined;
    }

    export namespace ScanMetaType {
        export function from(value: ScanMetaData): Zenith.NotifyController.MetaData {
            const versionId = value.versionId;
            if (versionId === undefined) {
                throw new AssertInternalError('ZNCSMTFV44498');
            } else {
                const lastSavedTime = value.lastSavedTime;
                if (lastSavedTime === undefined) {
                    throw new AssertInternalError('ZNCSMTFL44498');
                } else {
                    return {
                        versionId,
                        lastSavedTime: ZenithConvert.Date.DateTimeIso8601.fromDate(lastSavedTime),
                    }
                }
            }
        }

        export function to(value: Zenith.NotifyController.MetaData): ScanMetaData {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const versionId: string | undefined  = value.versionId;
            const lastSavedTimeAsString = value.lastSavedTime;
            let lastSavedTime: Date | undefined;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (lastSavedTimeAsString === undefined) {
                lastSavedTime = undefined;
            } else {
                const lastSavedTimeAsSourceTzOffsetDateTime = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(lastSavedTimeAsString);
                if (lastSavedTimeAsSourceTzOffsetDateTime === undefined) {
                    lastSavedTime = undefined;
                } else {
                    lastSavedTime = lastSavedTimeAsSourceTzOffsetDateTime.utcDate;
                }
            }
            return {
                versionId,
                lastSavedTime,
            }
        }
    }
}

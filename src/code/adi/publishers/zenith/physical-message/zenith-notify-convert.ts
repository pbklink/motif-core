import { AssertInternalError, UnreachableCaseError } from '../../../../sys/internal-error';
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
        readonly versionId: string;
    }

    export namespace ScanMetaType {
        export function from(value: ScanMetaData): Zenith.NotifyController.MetaData {
            // const result: Zenith.NotifyController.MetaData = {};
            return {
                versionId: value.versionId,
            }
        }

        export function to(value: Zenith.NotifyController.MetaData): ScanMetaData {
            const versionId = value.versionId ?? '';
            return {
                versionId,
            }
        }
    }
}

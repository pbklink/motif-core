/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { LitIvemId, MarketId, ScanTargetTypeId } from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace ZenithNotifyConvert {
    export namespace ScanType {
        export function toId(value: ZenithProtocol.NotifyController.ScanType) {
            switch (value) {
                case ZenithProtocol.NotifyController.ScanType.MarketSearch: return ScanTargetTypeId.Markets;
                case ZenithProtocol.NotifyController.ScanType.MarketMonitor: return ScanTargetTypeId.Symbols;
                default:
                    throw new UnreachableCaseError('ZNCSTTI20008', value);
            }
        }

        export function fromId(value: ScanTargetTypeId) {
            switch (value) {
                case ScanTargetTypeId.Markets: return ZenithProtocol.NotifyController.ScanType.MarketSearch;
                case ScanTargetTypeId.Symbols: return ZenithProtocol.NotifyController.ScanType.MarketMonitor;
                default:
                    throw new UnreachableCaseError('ZNCSTFI20008', value);
            }
        }
    }

    export namespace Target {
        export function toLitIvemIds(symbols: readonly ZenithProtocol.NotifyController.TargetSymbol[]): LitIvemId[] {
            return ZenithConvert.Symbol.toIdArray(symbols);
        }

        export function toMarketIds(markets: readonly ZenithProtocol.NotifyController.TargetMarket[]): MarketId[] {
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
                        return ZenithConvert.Symbol.fromIdArray(targetLitIvemIds);
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
        export function from(value: ScanMetaData): ZenithProtocol.NotifyController.MetaData {
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

        export function to(value: ZenithProtocol.NotifyController.MetaData): ScanMetaData {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const versionId: string | undefined  = value['versionId'];
            const lastSavedTimeAsString = value['lastSavedTime'];
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

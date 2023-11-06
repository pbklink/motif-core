/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, ZenithProtocolCommon } from '../../../common/adi-common-internal-api';
import { ZenithMarketAsx } from './zenith-market-asx';

export namespace ZenithMarketAsxConvert {
    export namespace Symbols {
        export namespace Alternates {
            export function toAdi(alternates: ZenithMarketAsx.MarketController.Symbols.Alternates) {
                const result: LitIvemAlternateCodes = {};

                for (const [key, value] of Object.entries(alternates)) {
                    switch (key) {
                        case ZenithProtocolCommon.Symbol.AlternateKey.Short: {
                            result.short = value;
                            break;
                        }
                        case ZenithProtocolCommon.Symbol.AlternateKey.Base: {
                            result.base = value;
                            break;
                        }
                        case ZenithProtocolCommon.Symbol.AlternateKey.Long: {
                            result.long = value;
                            break;
                        }
                        case ZenithProtocolCommon.Symbol.AlternateKey.Isin: {
                            result.isin = value;
                            break;
                        }
                        default:
                            result[key] = value;
                    }
                }
                return result;
            }
        }
    }
}

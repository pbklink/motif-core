/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, ZenithProtocolCommon } from '../../../common/internal-api';
import { ZenithMarketNzx } from './zenith-market-nzx';

export namespace ZenithMarketNzxConvert {
    export namespace Symbols {
        export namespace Alternates {
            export function toAdi(alternates: ZenithMarketNzx.MarketController.Symbols.Alternates) {
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
                        default:
                            result[key] = value;
                    }
                }
                return result;
            }
        }
    }
}

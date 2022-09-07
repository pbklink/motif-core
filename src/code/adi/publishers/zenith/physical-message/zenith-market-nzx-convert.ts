/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes } from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithMarketNzx } from './zenith-market-nzx';

export namespace ZenithMarketNzxConvert {
    export namespace Symbols {
        export namespace Alternates {
            export function toAdi(alternates: ZenithMarketNzx.MarketController.Symbols.Alternates) {
                const result: LitIvemAlternateCodes = {};

                for (const [key, value] of Object.entries(alternates)) {
                    switch (key) {
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Short: {
                            result.short = value;
                            break;
                        }
                        case Zenith.MarketController.SearchSymbols.AlternateKey.Base: {
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

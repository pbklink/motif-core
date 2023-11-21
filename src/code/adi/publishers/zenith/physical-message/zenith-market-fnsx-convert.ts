/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, ZenithProtocolCommon } from '../../../common/adi-common-internal-api';
import { ZenithMarketPtx } from './zenith-market-ptx';

export namespace ZenithMarketFnsxConvert {
    export namespace Symbols {
        export namespace Alternates {
            export function toAdi(alternates: ZenithMarketPtx.MarketController.Symbols.Alternates) {
                const result: LitIvemAlternateCodes = {};

                for (const [key, value] of Object.entries(alternates)) {
                    switch (key) {
                        case ZenithProtocolCommon.Symbol.AlternateKey.Uid: {
                            // result.uid = value; // not currently used
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

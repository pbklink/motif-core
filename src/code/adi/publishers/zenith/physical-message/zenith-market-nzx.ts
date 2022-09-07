/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Zenith } from './zenith';

export namespace ZenithMarketNzx {
    export namespace MarketController {
        export namespace Trades {
            export const enum TradeAttribute {
                Multileg = 'L',
            }
        }

        export namespace Symbols {
            export interface Attributes extends Zenith.MarketController.SearchSymbols.Attributes {
            }

            export namespace Attributes {
            }

            export type Alternates = Pick<
                Zenith.MarketController.SearchSymbols.Alternates,
                'Short' | 'Base'
            >;
        }
    }
}

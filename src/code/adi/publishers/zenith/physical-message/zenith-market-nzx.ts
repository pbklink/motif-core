/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ZenithProtocol } from './protocol/zenith-protocol';

export namespace ZenithMarketNzx {
    export namespace MarketController {
        export namespace Trades {
            export const enum TradeAttribute {
                Multileg = 'L',
            }
        }

        export namespace Symbols {
            export interface Attributes extends ZenithProtocol.MarketController.SearchSymbols.Attributes {
            }

            export namespace Attributes {
            }

            export type Alternates = Pick<
                ZenithProtocol.MarketController.SearchSymbols.Alternates,
                'Short' | 'Base'
            >;
        }
    }
}

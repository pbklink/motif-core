/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum } from '../../../../sys/sys-internal-api';
import { ZenithProtocolCommon } from '../../../common/zenith-protocol/internal-api';

export namespace ZenithMarketMyx {
    export namespace MarketController {
        export namespace Symbols {
            export const enum MarketClassification {
                Main = 'MAIN',
                Ace = 'ACE',
                Etf = 'ETF',
                Strw = 'STRW',
                Bond = 'BOND',
                Leap = 'LEAP',
            }

            export const enum ShortSellType {
                RegulatedShortSelling = 'R',
                ProprietaryDayTrading = 'P',
                IntraDayShortSelling = 'I',
                ProprietaryShortSelling = 'V',
            }

            // These are the possible values in the Symbol Categories field
            // These are not relevant to the Category Attribute below
            export const enum CategoryCode {
                Foreign = 'Foreign',
                Sharia = 'Sharia',
            }

            export const enum DeliveryBasis {
                BuyingInT0 = '0',
                DesignatedBasisT1 = '2',
                ReadyBasisT2 = '3',
                ImmediateBasisT1 = '4',
            }

            export interface Attributes extends ZenithProtocolCommon.Symbol.Attributes {
                Category: string;
                Class: MarketClassification;
                Delivery?: DeliveryBasis;
                MaxRSS?: string;
                Sector: string;
                Short?: string;
                ShortSuspended?: string;
                SubSector: string;
            }

            export namespace KnownAttribute {
                export type Key = PickEnum<ZenithProtocolCommon.Symbol.KnownAttributeKey,
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.Category |
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.Class |
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.Delivery |
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.Sector |
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.Short |
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.ShortSuspended |
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.SubSector |
                    ZenithProtocolCommon.Symbol.KnownAttributeKey.MaxRss
                >;
            }

            export interface Alternates extends Pick<
                ZenithProtocolCommon.Symbol.Alternates,
                'Ticker' | 'ISIN' | 'Base' | 'GICS' | 'RIC'
            > {
                // redeclare fields which are not optional
                Ticker: string;
                GICS: string;
                RIC: string;
            }
        }
    }
}

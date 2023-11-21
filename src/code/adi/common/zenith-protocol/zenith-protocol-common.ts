/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export namespace ZenithProtocolCommon {
    export namespace Symbol {
        export interface Alternates {
            Ticker?: string;
            ISIN?: string;
            Base?: string;
            GICS?: string;
            RIC?: string;
            Short?: string;
            Long?: string;
            UID?: string;
        }

        export const enum AlternateKey {
            Ticker = 'Ticker',
            Isin = 'ISIN',
            Base = 'Base',
            Gics = 'GICS',
            Ric = 'RIC',
            Short = 'Short',
            Long = 'Long',
            Uid = 'UID',
        }

        export type Attributes = Record<string, string | undefined>;

        export const enum KnownAttributeKey {
            Category = 'Category',
            Class = 'Class',
            Delivery = 'Delivery',
            Sector = 'Sector',
            Short = 'Short',
            ShortSuspended = 'ShortSuspended',
            SubSector = 'SubSector',
            MaxRss = 'MaxRSS',
        }
    }
}

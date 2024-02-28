/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export namespace ZenithProtocolCommon {
    export type UserMetadata = Record<string, string | undefined>;

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

    // This data is returned by QueryMethod.  For Push.Web type methods, the application should pass it to browser's Notification API
    export interface NotificationDistributionMethodMetadata {
        readonly userVisibleOnly: boolean;
        readonly applicationServerKey: string;
    }

    // The Settings data is included in ChannelParameters.  See below how this is generated
    // Probably a better name for this would be NotificationDistributionMethodSettings as there will probably be a descendant for each NotificationDistributionMethodId however
    // the existing name lines up with Zenith documentation
    export interface NotificationChannelSettings {

    }

    // The WebSettings is used for Push.Web type notifications.  It should be derived from browser's Notification API after passing it the DistributionMethodMetadata.
    // It needs to support the interface below.
    export interface WebNotificationChannelSettings extends NotificationChannelSettings {
        readonly endpoint: string;
        readonly expirationTime?: number; // seconds
        readonly keys?: WebNotificationChannelSettings.PushKeys;
    }

    export namespace WebNotificationChannelSettings {
        export interface PushKeys {
            readonly p256dh: string;
            readonly auth: string;
        }
    }
}

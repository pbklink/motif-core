/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotificationChannel } from "./notification-channel";

// export interface ScanDetails {
//     name?: string;
//     description?: string;
//     metadata: ScanMetadata;
// }

// export interface ScanState extends ScanDetails {
//     id: string;
//     isWritable?: boolean;
// }

export interface ScanNotificationParameters {
    channelId: string;
    cultureCode: string | undefined;
    minimumStable: number | undefined; // milli seconds
    minimumElapsed: number | undefined; // milli seconds
    channelSourceSettings: NotificationChannel.SourceSettings | undefined;
}

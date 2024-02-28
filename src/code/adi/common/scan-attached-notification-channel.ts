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

export interface ScanAttachedNotificationChannel {
    channelId: string;
    cultureCode: string | undefined;
    minimumStable: number | undefined; // milli seconds
    minimumElapsed: number | undefined; // milli seconds
    channelSourceSettings: NotificationChannel.SourceSettings | undefined;
}

export namespace ScanAttachedNotificationChannel {
    export function isUndefinableArrayEqual(left: readonly ScanAttachedNotificationChannel[] | undefined, right: readonly ScanAttachedNotificationChannel[] | undefined): boolean {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return isArrayEqual(left, right);
            }
        }
    }

    export function isArrayEqual(left: readonly ScanAttachedNotificationChannel[], right: readonly ScanAttachedNotificationChannel[]): boolean {
        const count = left.length;
        if (count !== right.length) {
            return false;
        } else {
            for (let i = 0; i < count; i++) {
                const leftElement = left[i];
                const rightElement = right[i];
                if (!isEqual(leftElement, rightElement)) {
                    return false;
                }
            }
            return true;
        }
    }

    export function isEqual(left: ScanAttachedNotificationChannel, right: ScanAttachedNotificationChannel): boolean {
        return (
            left.channelId === right.channelId &&
            left.cultureCode === right.cultureCode &&
            left.minimumStable === right.minimumStable &&
            left.minimumElapsed === right.minimumElapsed &&
            NotificationChannel.SourceSettings.isUndefinableEqual(left.channelSourceSettings, right.channelSourceSettings)
        );
    }
}

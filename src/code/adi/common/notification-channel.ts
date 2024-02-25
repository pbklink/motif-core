/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ActiveFaultedStatusId, NotificationDistributionMethodId } from './data-types';
import { ZenithProtocolCommon } from './zenith-protocol/internal-api';

export interface NotificationChannel {
    readonly channelId: string;
    enabled: boolean;
    channelName: string;
    channelDescription: string | undefined;
    userMetadata: ZenithProtocolCommon.UserMetadata;
    favourite: boolean;
    channelStatusId: ActiveFaultedStatusId;
    distributionMethodId: NotificationDistributionMethodId;
    settings: ZenithProtocolCommon.NotificationChannelSettings | undefined;
    faulted: boolean;
}

export namespace NotificationChannel {
    export interface SourceSettings {
        ttl: number; // seconds
        urgency: SourceSettings.UrgencyId | undefined;
        topic: string | undefined;
    }

    export namespace SourceSettings {
        export const enum UrgencyId {
            VeryLow,
            Low,
            Normal, // default
            High,
        }

        export function isUndefinableEqual(left: SourceSettings | undefined, right: SourceSettings | undefined) {
            if (left === undefined) {
                return right === undefined;
            } else {
                if (right === undefined) {
                    return false;
                } else {
                    return isEqual(left, right);
                }
            }
        }

        export function isEqual(left: SourceSettings, right: SourceSettings) {
            return (
                left.ttl === right.ttl &&
                left.urgency === right.urgency &&
                left.topic === right.topic
            );
        }

        export function createCopy(original: SourceSettings): SourceSettings {
            return {
                ttl: original.ttl,
                urgency: original.urgency,
                topic: original.topic,
            };
        }
    }
}

export interface SettingsedNotificationChannel extends NotificationChannel {
    settings: ZenithProtocolCommon.NotificationChannelSettings;
}

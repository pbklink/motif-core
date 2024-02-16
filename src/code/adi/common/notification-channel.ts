/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ActiveFaultedStatusId, NotificationDistributionMethodId } from './data-types';
import { ZenithProtocolCommon } from './zenith-protocol/internal-api';

export interface NotificationChannel {
    enabled: boolean,
    channelId: string;
    channelName: string;
    channelDescription: string | undefined;
    userMetadata: ZenithProtocolCommon.UserMetadata;
    favourite: boolean;
    channelStatusId: ActiveFaultedStatusId;
    distributionMethodId: NotificationDistributionMethodId;
    settings: ZenithProtocolCommon.NotificationChannelSettings | undefined;
    faulted: boolean;
}

export interface SettingsedNotificationChannel extends NotificationChannel {
    settings: ZenithProtocolCommon.NotificationChannelSettings;
}

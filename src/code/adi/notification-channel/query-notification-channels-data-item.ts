/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId, NotificationChannel, QueryNotificationChannelsDataMessage } from '../common/internal-api';
import { NotificationChannelPublishDataItem } from './notification-channel-publish-data-item';

export class QueryNotificationChannelsDataItem extends NotificationChannelPublishDataItem {
    private _notificationChannels: readonly NotificationChannel[];

    get notificationChannels() { return this._notificationChannels; }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.QueryNotificationChannels) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_QueryNotificationChannelResponse(msg as QueryNotificationChannelsDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_QueryNotificationChannelResponse(msg: QueryNotificationChannelsDataMessage) {
        this._notificationChannels = msg.notificationChannels;
    }
}

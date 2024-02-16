/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId, QueryNotificationChannelDataMessage, SettingsedNotificationChannel } from '../common/adi-common-internal-api';
import { NotificationChannelPublishDataItem } from './notification-channel-publish-data-item';

export class QueryNotificationChannelDataItem extends NotificationChannelPublishDataItem {
    private _notificationChannelStateAndSettings: SettingsedNotificationChannel;

    get notificationChannelStateAndSettings() { return this._notificationChannelStateAndSettings; }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.QueryNotificationChannel) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_QueryNotificationChannelResponse(msg as QueryNotificationChannelDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_QueryNotificationChannelResponse(msg: QueryNotificationChannelDataMessage) {
        this._notificationChannelStateAndSettings = msg.notificationChannel;
    }
}

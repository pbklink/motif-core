/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CreateNotificationChannelDataMessage, DataMessage, DataMessageTypeId } from '../common/internal-api';
import { NotificationChannelPublishDataItem } from './notification-channel-publish-data-item';

export class CreateNotificationChannelDataItem extends NotificationChannelPublishDataItem {
    private _notificationChannelId: string;

    get notificationChannelId() { return this._notificationChannelId; }

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.CreateNotificationChannel) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_CreateNotificationChannel(msg as CreateNotificationChannelDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_CreateNotificationChannel(msg: CreateNotificationChannelDataMessage) {
        this._notificationChannelId = msg.notificationChannelId;
    }
}

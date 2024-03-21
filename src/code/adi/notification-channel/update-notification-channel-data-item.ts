/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId } from '../common/internal-api';
import { NotificationChannelPublishDataItem } from './notification-channel-publish-data-item';

export class UpdateNotificationChannelDataItem extends NotificationChannelPublishDataItem {
    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.UpdateNotificationChannel) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
            } finally {
                this.endUpdate();
            }
        }
    }
}

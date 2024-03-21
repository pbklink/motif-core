/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId, NotificationDistributionMethodId, QueryNotificationDistributionMethodsDataMessage } from '../common/internal-api';
import { NotificationChannelPublishDataItem } from './notification-channel-publish-data-item';

export class QueryNotificationDistributionMethodsDataItem extends NotificationChannelPublishDataItem {
    private _methodIds: readonly NotificationDistributionMethodId[];

    get methodIds() { return this._methodIds; }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.QueryNotificationDistributionMethods) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_QueryNotificationDistributionMethodResponse(msg as QueryNotificationDistributionMethodsDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_QueryNotificationDistributionMethodResponse(msg: QueryNotificationDistributionMethodsDataMessage) {
        this._methodIds = msg.methodIds;
    }
}

/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId, NotificationDistributionMethodId, QueryNotificationDistributionMethodDataMessage, ZenithProtocolCommon } from '../common/internal-api';
import { NotificationChannelPublishDataItem } from './notification-channel-publish-data-item';

export class QueryNotificationDistributionMethodDataItem extends NotificationChannelPublishDataItem {
    private _methodId: NotificationDistributionMethodId;
    private _metadata: ZenithProtocolCommon.NotificationDistributionMethodMetadata

    get methodId() { return this._methodId; }
    get metadata() { return this._metadata; }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.QueryNotificationDistributionMethod) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_QueryNotificationDistributionMethodsResponse(msg as QueryNotificationDistributionMethodDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_QueryNotificationDistributionMethodsResponse(msg: QueryNotificationDistributionMethodDataMessage) {
        this._methodId = msg.methodId;
        this._metadata = msg.metadata;
    }
}

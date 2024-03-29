/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId } from '../common/internal-api';
import { WatchmakerPublishDataItem } from './watchmaker-publish-data-item';

export abstract class RequestAcknowledgeWatchmakerListDataItem extends WatchmakerPublishDataItem {
    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.WatchmakerListRequestAcknowledge) {
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

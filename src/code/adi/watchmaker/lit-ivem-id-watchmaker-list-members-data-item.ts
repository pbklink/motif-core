/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId, WatchmakerListLitIvemIdsDataMessage } from '../common/adi-common-internal-api';
import { LitIvemIdRecord } from '../lit-ivem-id-record';
import { WatchmakerListMembersDataItem } from './watchmaker-list-members-data-item';

export class LitIvemIdWatchmakerListMembersDataItem extends WatchmakerListMembersDataItem<LitIvemIdRecord> {
    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.WatchmakerListLitIvemIds) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const litIvemIdsMsg = msg as WatchmakerListLitIvemIdsDataMessage;
                this.processIrrcChanges(litIvemIdsMsg.changes);
            } finally {
                this.endUpdate();
            }
        }
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../sys/internal-api';
import { CreateOrCopyWatchmakerListDataMessage, DataMessage, DataMessageTypeId } from '../common/adi-common-internal-api';
import { WatchmakerPublishDataItem } from './watchmaker-publish-data-item';

export class CopyWatchmakerListDataItem extends WatchmakerPublishDataItem {
    private _listId: string;

    get listId() { return this._listId; }

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.CreateOrCopyWatchmakerList) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_CreateOrCopyWatchmakerListResponse(msg as CreateOrCopyWatchmakerListDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    protected override processSubscriptionPreOnline() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._listId !== undefined) {
            // We should never get more than one response to a query
            throw new AssertInternalError('CWLDIPSPO43112');
        }
    }

    private processMessage_CreateOrCopyWatchmakerListResponse(msg: CreateOrCopyWatchmakerListDataMessage) {
        this._listId = msg.listId;
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, UnexpectedTypeError } from '../sys/sys-internal-api';
import { DataDefinition, DataMessage, DataMessageTypeId, OrderStatuses, OrderStatusesDataDefinition, OrderStatusesDataMessage } from './common/adi-common-internal-api';
import { FeedStatusSubscriptionDataItem } from './feed-status-subscription-data-item';

export class OrderStatusesDataItem extends FeedStatusSubscriptionDataItem {
    private _orderStatuses: OrderStatuses;

    constructor(definition: DataDefinition) {
        super(definition);

        if (!(definition instanceof OrderStatusesDataDefinition)) {
            throw new AssertInternalError('OSDIC', definition.description);
        } else {
            this.setFeedId(definition.tradingFeedId);
        }
    }

    get orderStatuses() { return this._orderStatuses; }

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.OrderStatuses) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();

                if (msg instanceof OrderStatusesDataMessage) {
                    this.processOrderStatusesDataMessage(msg);
                } else {
                    throw new UnexpectedTypeError('OSDIPM33855', '');
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    findStatus(code: string) {
        for (let i = 0; i < this._orderStatuses.length; i++) {
            const status = this._orderStatuses[i];
            if (status.code === code) {
                return status;
            }
        }
        return undefined;
    }

    protected override processSubscriptionPreOnline() { // virtual
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._orderStatuses !== undefined && this._orderStatuses.length > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this._orderStatuses = [];
            } finally {
                this.endUpdate();
            }
        }
    }

    private processOrderStatusesDataMessage(msg: OrderStatusesDataMessage): void {
        assert(msg instanceof OrderStatusesDataMessage, 'ID:10206103657');
        this._orderStatuses = msg.statuses;
        this.trySetUsable(); // always query
    }
}

export class IncubatedOrderStatusesDataItem extends OrderStatusesDataItem {

}

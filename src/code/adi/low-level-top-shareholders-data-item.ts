/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, Integer } from '../sys/sys-internal-api';
import { DataMessage, DataMessageTypeId, TLowLevelTopShareholdersDataMessage, TopShareholder } from './common/adi-common-internal-api';
import { PublisherSubscriptionDataItem } from './publish-subscribe/internal-api';

export class LowLevelTopShareholdersDataItem extends PublisherSubscriptionDataItem {

    private _topShareholders: TopShareholder[] | undefined;

    get topShareholders(): TopShareholder[] | undefined { return this._topShareholders; }
    get count(): Integer { return (this._topShareholders) ? this._topShareholders.length : 0; }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.TopShareholders) {
            super.processMessage(msg);
        } else {
            assert(msg instanceof TLowLevelTopShareholdersDataMessage, 'ID:7306145629');
            const typedMsg = msg as TLowLevelTopShareholdersDataMessage;

            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this._topShareholders = typedMsg.topShareholdersInfo;
            } finally {
                this.endUpdate();
            }
        }
    }

    protected override processSubscriptionPreOnline() {
        this.beginUpdate();
        try {
            if (this._topShareholders !== undefined) {
                this.notifyUpdateChange();
                this._topShareholders = undefined;
            }
        } finally {
            this.endUpdate();
        }
    }
}

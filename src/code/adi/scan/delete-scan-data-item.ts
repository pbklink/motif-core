/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId } from '../common/adi-common-internal-api';
import { ScanPublishDataItem } from './scan-publish-data-item';

export class DeleteScanDataItem extends ScanPublishDataItem {
    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.DeleteScan) {
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

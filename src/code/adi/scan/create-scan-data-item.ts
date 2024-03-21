/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CreateScanDataMessage, DataMessage, DataMessageTypeId } from '../common/internal-api';
import { ScanPublishDataItem } from './scan-publish-data-item';

export class CreateScanDataItem extends ScanPublishDataItem {
    private _scanId: string;

    get scanId() { return this._scanId; }

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.CreateScan) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_CreateScan(msg as CreateScanDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_CreateScan(msg: CreateScanDataMessage) {
        this._scanId = msg.scanId;
    }
}

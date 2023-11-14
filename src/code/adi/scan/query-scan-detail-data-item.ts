/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId, QueryScanDetailDataMessage } from '../common/adi-common-internal-api';
import { ScanDetail } from './scan-detail';
import { ScanPublishDataItem } from './scan-publish-data-item';

export class QueryScanDetailDataItem extends ScanPublishDataItem {
    private _detail: ScanDetail;

    get detail() { return this._detail; }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.QueryScanDetail) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                this.processMessage_QueryScanDetailResponse(msg as QueryScanDetailDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    private processMessage_QueryScanDetailResponse(msg: QueryScanDetailDataMessage) {
        this._detail = {
            id: msg.scanId,
            name: msg.scanName,
            description: msg.scanDescription,
            readonly: msg.scanReadonly,
            statusId: msg.scanStatusId,
            versionNumber: msg.versionNumber,
            versionId: msg.versionId,
            versioningInterrupted: msg.versioningInterrupted,
            lastSavedTime: msg.lastSavedTime,
            symbolListEnabled: msg.symbolListEnabled,
            zenithCriteria: msg.zenithCriteria,
            zenithRank: msg.zenithRank,
            targetTypeId: msg.targetTypeId,
            targetMarketIds: msg.targetMarketIds,
            targetLitIvemIds: msg.targetLitIvemIds,
            notifications: msg.notifications,
        };
    }
}

/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataMessage, DataMessageTypeId, QueryScanDetailDataMessage } from '../common/adi-common-internal-api';
import { ScanDescriptorAndDetail } from './scan-descriptor-and-detail';
import { ScanPublishDataItem } from './scan-publish-data-item';

export class QueryScanDetailDataItem extends ScanPublishDataItem {
    private _descriptorAndDetail: ScanDescriptorAndDetail;

    get descriptorAndDetail() { return this._descriptorAndDetail; }

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
        this._descriptorAndDetail = {
            id: msg.scanId,
            name: msg.scanName,
            description: msg.scanDescription,
            readonly: msg.scanReadonly,
            statusId: msg.scanStatusId,
            enabled: msg.enabled,
            versionNumber: msg.versionNumber,
            versionId: msg.versionId,
            versioningInterrupted: msg.versioningInterrupted,
            lastSavedTime: msg.lastSavedTime,
            lastEditSessionId: msg.lastEditSessionId,
            symbolListEnabled: msg.symbolListEnabled,
            zenithCriteriaSource: msg.zenithCriteriaSource,
            zenithRankSource: msg.zenithRankSource,
            zenithCriteria: msg.zenithCriteria,
            zenithRank: msg.zenithRank,
            targetTypeId: msg.targetTypeId,
            targetMarketIds: msg.targetMarketIds,
            targetLitIvemIds: msg.targetLitIvemIds,
            maxMatchCount: msg.maxMatchCount,
            attachedNotificationChannels: msg.attachedNotificationChannels,
        };
    }
}

/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, Integer } from '../../sys/sys-internal-api';
import { LitIvemId, MarketId, ScanNotification, ScanStatusId, ScanTargetTypeId, ZenithProtocolScanCriteria } from '../common/adi-common-internal-api';

export interface ScanDetail {
    readonly id: string;
    readonly name: string;
    readonly description: string | undefined;
    readonly readonly: boolean;
    readonly statusId: ScanStatusId;
    readonly versionNumber: Integer | undefined;
    readonly versionId: Guid | undefined;
    readonly versioningInterrupted: boolean;
    readonly lastSavedTime: Date | undefined;
    readonly symbolListEnabled: boolean | undefined;
    readonly zenithCriteria: ZenithProtocolScanCriteria.BooleanTupleNode;
    readonly zenithRank: ZenithProtocolScanCriteria.NumericTupleNode;
    readonly targetTypeId: ScanTargetTypeId;
    readonly targetMarketIds: readonly MarketId[] | undefined;
    readonly targetLitIvemIds: readonly LitIvemId[] | undefined;
    readonly notifications: readonly ScanNotification[] | undefined;
}

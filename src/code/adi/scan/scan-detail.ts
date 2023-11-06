/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, MarketId, ScanNotification, ScanTargetTypeId, ZenithProtocolScanCriteria } from '../common/adi-common-internal-api';

export interface ScanDetail {
    readonly id: string;
    readonly name: string;
    readonly description: string | undefined;
    readonly versionId: string | undefined;
    readonly lastSavedTime: Date | undefined;
    readonly criteria: ZenithProtocolScanCriteria.BooleanTupleNode;
    readonly targetTypeId: ScanTargetTypeId;
    readonly targetMarketIds: readonly MarketId[] | undefined;
    readonly targetLitIvemIds: readonly LitIvemId[] | undefined;
    readonly notifications: readonly ScanNotification[] | undefined;
}

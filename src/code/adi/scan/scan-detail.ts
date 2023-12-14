/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, MarketId, ScanNotification, ScanTargetTypeId, ZenithEncodedScanFormula } from '../common/adi-common-internal-api';

export interface ScanDetail {
    readonly zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode;
    readonly zenithRank: ZenithEncodedScanFormula.NumericTupleNode;
    readonly targetTypeId: ScanTargetTypeId;
    readonly targetMarketIds: readonly MarketId[] | undefined;
    readonly targetLitIvemIds: readonly LitIvemId[] | undefined;
    readonly notifications: readonly ScanNotification[] | undefined;
}

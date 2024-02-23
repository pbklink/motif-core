/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, MarketId, ScanNotificationParameters, ScanTargetTypeId, ZenithEncodedScanFormula } from '../common/adi-common-internal-api';

export interface ScanDetail {
    readonly zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode;
    readonly zenithRank: ZenithEncodedScanFormula.NumericTupleNode | undefined;
    readonly targetTypeId: ScanTargetTypeId;
    readonly targetMarketIds: readonly MarketId[] | undefined;
    readonly targetLitIvemIds: readonly LitIvemId[] | undefined;
    readonly notifications: readonly ScanNotificationParameters[] | undefined;
}

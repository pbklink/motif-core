/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../../sys/types';
import { LitIvemId, MarketId, ScanAttachedNotificationChannel, ScanTargetTypeId, ZenithEncodedScanFormula } from '../common/adi-common-internal-api';

export interface ScanDetail {
    readonly zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode;
    readonly zenithRank: ZenithEncodedScanFormula.NumericTupleNode | undefined;
    readonly targetTypeId: ScanTargetTypeId;
    readonly targetMarketIds: readonly MarketId[] | undefined;
    readonly targetLitIvemIds: readonly LitIvemId[] | undefined;
    readonly maxMatchCount: Integer | undefined;
    readonly attachedNotificationChannels: readonly ScanAttachedNotificationChannel[];
}

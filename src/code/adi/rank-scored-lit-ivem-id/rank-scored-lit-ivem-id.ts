/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../common/adi-common-internal-api';

export interface RankScoredLitIvemId {
    readonly value: LitIvemId;
    readonly rankScore: number;
}

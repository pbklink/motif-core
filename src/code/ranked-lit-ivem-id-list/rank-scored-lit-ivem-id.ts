/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';

export interface RankScoredLitIvemId {
    readonly litIvemId: LitIvemId;
    readonly rankScore: number;
}

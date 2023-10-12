/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList, CorrectnessRecord } from '../../sys/sys-internal-api';
import { RankScoredLitIvemId } from './rank-scored-lit-ivem-id';

export interface RankScoredLitIvemIdList extends CorrectnessRecord, BadnessList<RankScoredLitIvemId> {
}

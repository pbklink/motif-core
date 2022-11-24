/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from '../sys/badness-list';
import { CorrectnessRecord } from '../sys/correctness-record';
import { RankScoredLitIvemId } from './rank-scored-lit-ivem-id';

export interface RankScoredLitIvemIdList extends CorrectnessRecord, BadnessList<RankScoredLitIvemId>{
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from '../sys/badness-list';
import { CorrectnessRecord } from '../sys/correctness-record';
import { RankScoredLitIvemIdSourceListItem } from './rank-scored-lit-ivem-id-source-list-item';

export interface RankScoredLitIvemIdSourceList extends CorrectnessRecord, BadnessList<RankScoredLitIvemIdSourceListItem>{
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid } from '../sys/sys-internal-api';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';

export interface NamedRankedLitIvemIdList extends RankedLitIvemIdList {
    readonly id: Guid;
    readonly name: string;
}

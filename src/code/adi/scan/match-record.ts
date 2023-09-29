/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessListItem } from '../../sys/sys-internal-api';

export interface MatchRecord extends KeyedCorrectnessListItem {
    readonly target: string;
}

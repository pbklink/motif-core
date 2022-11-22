/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessSettableListItem } from '../sys/sys-internal-api';

export interface MatchRecord extends KeyedCorrectnessSettableListItem {
    readonly target: string;
}

/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessRecord } from '../sys/sys-internal-api';

export interface MatchRecord extends KeyedCorrectnessRecord {
    readonly target: string;
}

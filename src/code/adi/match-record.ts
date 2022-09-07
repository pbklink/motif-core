/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecord } from './data-record';

export interface MatchRecord extends DataRecord {
    readonly target: string;
}

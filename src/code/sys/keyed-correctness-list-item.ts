/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessRecord } from './correctness-record';
import { KeyedCorrectnessSettableListItem } from './keyed-correctness-settable-list-item';

export interface KeyedCorrectnessListItem extends KeyedCorrectnessSettableListItem, CorrectnessRecord {
}

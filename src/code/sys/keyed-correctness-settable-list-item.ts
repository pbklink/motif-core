/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessSettableListItem } from './correctness-settable-list-item';
import { DisposableRecord } from './disposable-record';
import { KeyedRecord } from './keyed-record';

export interface KeyedCorrectnessSettableListItem extends DisposableRecord, KeyedRecord, CorrectnessSettableListItem {
}

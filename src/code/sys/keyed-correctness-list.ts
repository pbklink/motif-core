/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessListItem } from './keyed-correctness-list-item';
import { KeyedCorrectnessSettableList } from './keyed-correctness-settable-list';

export interface KeyedCorrectnessList<Record extends KeyedCorrectnessListItem> extends KeyedCorrectnessSettableList<Record> {
}

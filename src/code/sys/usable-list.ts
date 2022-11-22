/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RecordList } from './record-list';

export interface UsableList<Record> extends RecordList<Record> {
    readonly usable: boolean;
}

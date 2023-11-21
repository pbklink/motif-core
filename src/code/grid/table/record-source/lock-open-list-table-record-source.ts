/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from '../../../sys/lock-open-list-item';
import { BadnessList } from '../../../sys/sys-internal-api';
import { BadnessListTableRecordSource } from './badness-list-table-record-source';

export abstract class LockOpenListTableRecordSource<Item extends LockOpenListItem<Item>, List extends BadnessList<Item>>
    extends BadnessListTableRecordSource<LockOpenListItem<Item>, List> {
}

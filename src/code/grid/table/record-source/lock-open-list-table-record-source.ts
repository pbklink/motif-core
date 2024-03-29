/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList, LockOpenListItem } from '../../../sys/internal-api';
import { SubscribeBadnessListTableRecordSource } from './subscribe-badness-list-table-record-source';

export abstract class LockOpenListTableRecordSource<Item extends LockOpenListItem<Item>, List extends BadnessList<Item>>
    extends SubscribeBadnessListTableRecordSource<LockOpenListItem<Item>, List> {
}

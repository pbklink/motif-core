/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecordsFeedSubscriptionDataItem } from './data-records-feed-subscription-data-item';
import { MatchRecord } from './match-record';

export abstract class MatchesDataItem<Record extends MatchRecord> extends DataRecordsFeedSubscriptionDataItem<Record> {
}

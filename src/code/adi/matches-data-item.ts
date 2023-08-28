/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MatchRecord } from './match-record';
import { RecordsFeedSubscriptionDataItem } from './records-feed-subscription-data-item';

export abstract class MatchesDataItem<Record extends MatchRecord> extends RecordsFeedSubscriptionDataItem<Record> {
}

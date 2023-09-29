/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataDefinition, FeedId } from '../common/adi-common-internal-api';
import { RecordsFeedSubscriptionDataItem } from '../feed/internal-api';
import { MatchRecord } from './match-record';

export abstract class MatchesDataItem<Record extends MatchRecord> extends RecordsFeedSubscriptionDataItem<Record> {
    constructor(definition: DataDefinition) {
        super(definition)
        this.setFeedId(FeedId.Scanner);
    }
}

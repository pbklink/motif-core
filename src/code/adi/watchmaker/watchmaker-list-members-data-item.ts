/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataDefinition, FeedId } from '../common/adi-common-internal-api';
import { IrrcFeedSubscriptionDataItem } from '../feed/internal-api';

export abstract class WatchmakerListMembersDataItem<T> extends IrrcFeedSubscriptionDataItem<T> {
    constructor(definition: DataDefinition) {
        super(definition)
        this.setFeedId(FeedId.Watchlist);
    }
}

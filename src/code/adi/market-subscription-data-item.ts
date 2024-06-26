/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    Badness,
    CorrectnessId,
    Integer,
    MultiEvent,
    SourceTzOffsetDate,
    UnreachableCaseError,
    UsableListChangeTypeId
} from '../sys/internal-api';
import {
    MarketId,
    MarketInfo,
    MarketsDataDefinition
} from './common/internal-api';
import { FeedStatusSubscriptionDataItem } from './feed/internal-api';
import { Market } from './market';
import { MarketsDataItem } from './markets-data-item';

export abstract class MarketSubscriptionDataItem extends FeedStatusSubscriptionDataItem {
    private _marketId: MarketId;

    private _marketsDataItem: MarketsDataItem;
    private _marketsCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _marketsListChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _market: Market | undefined;
    private _marketFeedStatusChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _marketCorrectnessChangedSubscriptionId: MultiEvent.SubscriptionId;

    get marketId() {
        return this._marketId;
    }
    get market() {
        return this._market;
    } // not to be cached
    get marketTradingDate(): SourceTzOffsetDate | undefined {
        return this._market?.tradingDate;
    }

    protected setMarketId(value: MarketId) {
        this._marketId = value;

        const feedId = MarketInfo.idToFeedId(value);
        this.setFeedId(feedId);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-optional-chain
        if (this._marketsDataItem !== undefined && this._marketsDataItem.usable) {
            this.checkMarket();
        }
    }

    protected override start() {
        const marketsDataDefinition = new MarketsDataDefinition();
        this._marketsDataItem = this.subscribeDataItem(
            marketsDataDefinition
        ) as MarketsDataItem;

        this._marketsCorrectnessChangeSubscriptionId = this._marketsDataItem.subscribeCorrectnessChangedEvent(
            () => { this.handleMarketsCorrectnessChangedEvent(); }
        );

        this._marketsListChangeSubscriptionId = this._marketsDataItem.subscribeListChangeEvent(
            (listChangeType, index, count) => { this.handleMarketsListChangeEvent(listChangeType, index, count); }
        );

        super.start();

        if (this._marketsDataItem.usable) {
            this.checkMarket();
        } else {
            this.setMarketsUnusableBadness();
        }
    }

    protected override stop() {
        super.stop();

        this.clearMarket();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._marketsDataItem !== undefined) {
            this._marketsDataItem.unsubscribeListChangeEvent(
                this._marketsListChangeSubscriptionId
            );
            this._marketsDataItem.unsubscribeCorrectnessChangedEvent(
                this._marketsCorrectnessChangeSubscriptionId
            );
            this.unsubscribeDataItem(this._marketsDataItem);
            this._marketsDataItem = undefined as unknown as MarketsDataItem;
        }
    }

    /** Give descendants an opportunity to initialise data using Market */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected processMarketBecameAvailable() {

    }

    protected override calculateUsabilityBadness() {
        // Normally would priortise badness from base class.  However subscription cannot come online without Market or Feed Data
        // So if Market or Feed Data not available, prioritise this badness
        if (this._market === undefined) {
            if (!this._marketsDataItem.usable) {
                return this.calculateMarketsUnusableBadness();
            } else {
                return {
                    reasonId: Badness.ReasonId.MarketNotAvailable,
                    reasonExtra: MarketInfo.idToDisplay(this._marketId),
                };
            }
        } else {
            if (!this._market.usable) {
                return this.calculateMarketUnusableBadness(this._market);
            } else {
                return super.calculateUsabilityBadness();
            }
        }
    }

    private handleMarketsCorrectnessChangedEvent() {
        if (!this._marketsDataItem.usable) {
            this.setMarketsUnusableBadness();
        }
    }

    private handleMarketsListChangeEvent(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        this.processMarketsListChange(listChangeTypeId, index, count);
    }

    private processMarketsListChange(
        listChangeTypeId: UsableListChangeTypeId,
        index: Integer,
        count: Integer
    ) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._marketsDataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.clearMarket();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                // no action
                break;
            case UsableListChangeTypeId.Usable:
                this.checkMarket();
                break;
            case UsableListChangeTypeId.Insert:
                this.checkMarket();
                break;
            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('MSDIPMLCBR19662', this.definition.description);
            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('MSDIPMLCAR19662', this.definition.description);
            case UsableListChangeTypeId.BeforeMove:
                throw new AssertInternalError('MSDIPMLCBM19662', this.definition.description);
            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('MSDIPMLCAM19662', this.definition.description);
            case UsableListChangeTypeId.Remove:
                this.checkClearMarket(index, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.clearMarket();
                break;
            default:
                throw new UnreachableCaseError('MSDIPMLCDU19662', listChangeTypeId);
        }
    }

    private checkMarket() {
        if (this._market === undefined) {
            this._market = this._marketsDataItem.getMarket(this.marketId);
            if (this._market !== undefined) {
                this._marketCorrectnessChangedSubscriptionId = this._market.subscribeCorrectnessChangedEvent(
                    () => { this.updateFeedStatusId(); }
                );
                this._marketFeedStatusChangeSubscriptionId = this._market.subscribeFeedStatusChangeEvent(
                    () => { this.updateFeedStatusId(); }
                );
                this.updateFeedStatusId();
                this.processMarketBecameAvailable();
            }
        }
    }

    private clearMarket() {
        if (this._market !== undefined) {
            this._market.unsubscribeCorrectnessChangedEvent(
                this._marketCorrectnessChangedSubscriptionId
            );
            this._marketCorrectnessChangedSubscriptionId = undefined;
            this._market.unsubscribeFeedStatusChangeEvent(
                this._marketFeedStatusChangeSubscriptionId
            );
            this._marketFeedStatusChangeSubscriptionId = undefined;
            this._market = undefined;
            this.setFeedStatusId(undefined);
        }
    }

    private checkClearMarket(index: Integer, count: Integer) {
        if (this._market !== undefined) {
            for (let i = index; i < index + count; i++) {
                const market = this._marketsDataItem.records[i];
                if (market === this._market) {
                    this.clearMarket();
                    return;
                }
            }
        }
    }

    private updateFeedStatusId() {
        if (this._market === undefined || !this._market.usable) {
            this.setFeedStatusId(undefined);
        } else {
            this.setFeedStatusId(this._market.feedStatusId);
        }
    }

    private setMarketsUnusableBadness() {
        const badness = this.calculateMarketsUnusableBadness();
        this.setUnusable(badness);
    }

    private calculateMarketsUnusableBadness() {
        if (this._marketsDataItem.error) {
            return {
                reasonId: Badness.ReasonId.MarketsError,
                reasonExtra: '',
            };
        } else {
            return {
                reasonId: Badness.ReasonId.MarketsWaiting,
                reasonExtra: '',
            };
        }
    }

    private calculateMarketUnusableBadness(market: Market) {
        if (market.correctnessId === CorrectnessId.Error) {
            return {
                reasonId: Badness.ReasonId.MarketError,
                reasonExtra: market.name,
            };
        } else {
            return {
                reasonId: Badness.ReasonId.MarketWaiting,
                reasonExtra: market.name,
            };
        }
    }
}

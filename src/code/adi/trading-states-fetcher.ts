/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, Correctness, CorrectnessId, MultiEvent } from '../sys/internal-api';
import { MarketId, MarketInfo, TradingStates, TradingStatesDataDefinition } from './common/internal-api';
import { DataItem } from './data-item/internal-api';
import { TradingStatesDataItem } from './trading-states-data-item';

export class TradingStatesFetcher {
    correctnessChangedEvent: TradingStatesFetcher.CorrectnessChangedEventHandler;

    private _dataItem: TradingStatesDataItem;
    private _correctnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _unsubscribeDateItemFtn: DataItem.UnsubscribeDataItemFtn;

    constructor(marketId: MarketId, subscribeDateItemFtn: DataItem.SubscribeDataItemFtn,
        unsubscribeDateItemFtn: DataItem.UnsubscribeDataItemFtn
    ) {
        this._unsubscribeDateItemFtn = unsubscribeDateItemFtn;

        const TradingStatesDefinition = new TradingStatesDataDefinition();
        TradingStatesDefinition.marketId = marketId;
        this._dataItem = subscribeDateItemFtn(TradingStatesDefinition) as TradingStatesDataItem;
        this._dataItem.setFeedId(MarketInfo.idToFeedId(marketId));
        if (!this.completed) {
            this._correctnessChangeSubscriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
                () => this.handleCorrectnessChangedEvent()
            );
        }
    }

    get badness(): Badness { return this._dataItem.badness; }
    get completed() { return Correctness.idIsIncubated(this.correctnessId); }
    get correctnessId(): CorrectnessId { return this._dataItem.correctnessId; }
    get states(): TradingStates { return this._dataItem.states; }

    finalise() {
        this._dataItem.unsubscribeCorrectnessChangedEvent(this._correctnessChangeSubscriptionId);
        this._unsubscribeDateItemFtn(this._dataItem);
    }

    private handleCorrectnessChangedEvent() {
        this.correctnessChangedEvent();
    }
}

export namespace TradingStatesFetcher {
    export type CorrectnessChangedEventHandler = (this: void) => void;
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MarketId, MarketInfo } from '../adi/adi-internal-api';
import { SymbolsService } from '../services/services-internal-api';
import { Integer, MultiEvent } from '../sys/sys-internal-api';
import { EnumExplicitElementsArrayUiAction } from './enum-explicit-elements-array-ui-action';
import { TypedExplicitElementsArrayUiAction } from './typed-explicit-elements-array-ui-action';

export class AllowedMarketsExplicitElementsArrayUiAction extends EnumExplicitElementsArrayUiAction {
    private _allowedMarketIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _symbolsService: SymbolsService, valueRequired: boolean | undefined = true) {
        super(valueRequired);

        this._allowedMarketIdsChangedSubscriptionId = this._symbolsService.subscribeAllowedMarketIdsChangedEvent(
            () => this.handleAllowedMarketIdsChanged()
        );
    }

    override finalise() {
        this._symbolsService.unsubscribeAllowedMarketIdsChangedEvent(this._allowedMarketIdsChangedSubscriptionId);
        this._allowedMarketIdsChangedSubscriptionId = undefined;
    }

    getElementProperties(element: Integer) {
        const marketIds = this._symbolsService.allowedMarketIds;
        if (marketIds.includes(element)) {
            return this.createElementProperties(element);
        } else {
            return undefined;
        }
    }

    getElementPropertiesArray() {
        const marketIds = this._symbolsService.allowedMarketIds;
        const count = marketIds.length;
        const result = new Array<TypedExplicitElementsArrayUiAction.ElementProperties<MarketId>>(count);
        for (let i = 0; i < count; i++) {
            const marketId = marketIds[i];
            result[i] = this.createElementProperties(marketId);
        }
        return result;
    }

    private handleAllowedMarketIdsChanged() {
        this.notifyElementsPush(undefined);
    }

    private createElementProperties(marketId: MarketId) {
        const result: TypedExplicitElementsArrayUiAction.ElementProperties<MarketId> = {
            element: marketId,
            caption: this._symbolsService.getMarketGlobalCode(marketId),
            title: MarketInfo.idToDisplay(marketId),
        };
        return result;
    }
}

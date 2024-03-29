/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumUiAction } from '@xilytix/ui-action';
import { MarketId, MarketInfo } from '../adi/internal-api';
import { SymbolsService } from '../services/internal-api';
import { Integer, MultiEvent } from '../sys/internal-api';

export class AllowedMarketsEnumUiAction extends EnumUiAction<Integer> {
    private _allowedMarketIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _symbolsService: SymbolsService, valueRequired: boolean | undefined = true) {
        super(EnumUiAction.integerUndefinedValue, valueRequired);

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
            return this.createEnumUiActionElementProperties(element);
        } else {
            return undefined;
        }
    }

    getElementPropertiesArray() {
        const marketIds = this._symbolsService.allowedMarketIds;
        const count = marketIds.length;
        const result = new Array<EnumUiAction.ElementProperties<Integer>>(count);
        for (let i = 0; i < count; i++) {
            const marketId = marketIds[i];
            result[i] = this.createEnumUiActionElementProperties(marketId);
        }
        return result;
    }

    private handleAllowedMarketIdsChanged() {
        this.notifyElementsPush(undefined);
    }

    private createEnumUiActionElementProperties(marketId: MarketId) {
        const result: EnumUiAction.ElementProperties<Integer> = {
            element: marketId,
            caption: this._symbolsService.getMarketGlobalCode(marketId),
            title: MarketInfo.idToDisplay(marketId),
        };
        return result;
    }
}

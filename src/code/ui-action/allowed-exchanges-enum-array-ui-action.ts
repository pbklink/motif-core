/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, ExchangeInfo } from '../adi/adi-internal-api';
import { SymbolsService } from '../services/services-internal-api';
import { Integer, MultiEvent } from '../sys/sys-internal-api';
import { ArrayUiAction } from './array-ui-action';
import { EnumArrayUiAction } from './enum-array-ui-action';

export class AllowedExchangesEnumArrayUiAction extends EnumArrayUiAction {
    private _allowedExchangeIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _symbolsService: SymbolsService, valueRequired: boolean | undefined = true) {
        super(valueRequired);

        this._allowedExchangeIdsChangedSubscriptionId = this._symbolsService.subscribeAllowedExchangeIdsChangedEvent(
            () => this.handleAllowedExchangeIdsChanged()
        );
    }

    override finalise() {
        this._symbolsService.unsubscribeAllowedExchangeIdsChangedEvent(this._allowedExchangeIdsChangedSubscriptionId);
        this._allowedExchangeIdsChangedSubscriptionId = undefined;
    }

    getElementProperties(element: Integer) {
        const exchangeIds = this._symbolsService.allowedExchangeIds;
        if (exchangeIds.includes(element)) {
            return this.createEnumArrayUiActionElementProperties(element);
        } else {
            return undefined;
        }
    }

    getElementPropertiesArray() {
        const exchangeIds = this._symbolsService.allowedExchangeIds;
        const count = exchangeIds.length;
        const result = new Array<ArrayUiAction.ElementProperties<ExchangeId>>(count);
        for (let i = 0; i < count; i++) {
            const exchangeId = exchangeIds[i];
            result[i] = this.createEnumArrayUiActionElementProperties(exchangeId);
        }
        return result;
    }

    private handleAllowedExchangeIdsChanged() {
        this.notifyElementsPush(undefined);
    }

    private createEnumArrayUiActionElementProperties(exchangeId: ExchangeId) {
        const result: ArrayUiAction.ElementProperties<ExchangeId> = {
            element: exchangeId,
            caption: ExchangeInfo.idToAbbreviatedDisplay(exchangeId),
            title: ExchangeInfo.idToFullDisplay(exchangeId),
        };
        return result;
    }
}

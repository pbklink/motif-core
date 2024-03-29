/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumUiAction } from '@xilytix/ui-action';
import { ExchangeId, ExchangeInfo } from '../adi/internal-api';
import { SymbolsService } from '../services/internal-api';
import { Integer, MultiEvent } from '../sys/internal-api';

export class AllowedExchangesEnumUiAction extends EnumUiAction<Integer> {
    private _allowedExchangeIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _symbolsService: SymbolsService, valueRequired: boolean | undefined = true) {
        super(EnumUiAction.integerUndefinedValue, valueRequired);

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
            return this.createEnumUiActionElementProperties(element);
        } else {
            return undefined;
        }
    }

    getElementPropertiesArray() {
        const exchangeIds = this._symbolsService.allowedExchangeIds;
        const count = exchangeIds.length;
        const result = new Array<EnumUiAction.ElementProperties<Integer>>(count);
        for (let i = 0; i < count; i++) {
            const exchangeId = exchangeIds[i];
            result[i] = this.createEnumUiActionElementProperties(exchangeId);
        }
        return result;
    }

    private handleAllowedExchangeIdsChanged() {
        this.notifyElementsPush(undefined);
    }

    private createEnumUiActionElementProperties(exchangeId: ExchangeId) {
        const result: EnumUiAction.ElementProperties<Integer> = {
            element: exchangeId,
            caption: ExchangeInfo.idToAbbreviatedDisplay(exchangeId),
            title: ExchangeInfo.idToFullDisplay(exchangeId),
        };
        return result;
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironment, LitIvemId, MarketInfo } from '../adi/adi-internal-api';
import { SymbolsService } from '../services/services-internal-api';
import { MultiEvent } from '../sys/sys-internal-api';
import { UiAction } from './ui-action';

export class LitIvemIdUiAction extends UiAction {
    private _value: LitIvemId | undefined;
    private _definedValue: LitIvemId = LitIvemIdUiAction.undefinedLitIvemId;
    private _parseDetails: SymbolsService.LitIvemIdParseDetails;

    private _litIvemIdPushMultiEvent = new MultiEvent<LitIvemIdUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get parseDetails() { return this._parseDetails; }

    commitValue(parseDetails: SymbolsService.LitIvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this._parseDetails = parseDetails;
        this._value = parseDetails.litIvemId; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: LitIvemId | undefined, selectAll = true) {
        this.pushValueWithoutAutoAcceptance(value, this.edited, selectAll);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: LitIvemIdUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._litIvemIdPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._litIvemIdPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected override repushValue(newEdited: boolean) {
        this.pushValueWithoutAutoAcceptance(this._value, newEdited, true);
    }

    private notifyValuePush(edited: boolean, selectAll: boolean) {
        const handlersInterfaces = this._litIvemIdPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value, edited, selectAll);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = LitIvemIdUiAction.undefinedLitIvemId;
        }
    }

    private pushValueWithoutAutoAcceptance(value: LitIvemId | undefined, edited: boolean, selectAll: boolean) {
        this._value = value === undefined ? undefined : value.createCopy();
        this.setDefinedValue();
        this.notifyValuePush(edited, selectAll);
    }
}

export namespace LitIvemIdUiAction {
    export const undefinedLitIvemId = new LitIvemId('', MarketInfo.nullId, DataEnvironment.nullId); // should never be used

    export type ValuePushEventHander = (this: void, value: LitIvemId | undefined, edited: boolean, selectAll: boolean) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}

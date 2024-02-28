/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from '../sys/sys-internal-api';
import { UiAction } from './ui-action';

export abstract class EnumUiAction<T> extends UiAction {
    private readonly _undefinedValue: T;

    private _value: T | undefined;
    private _definedValue: T;
    private _filter: readonly T[] | undefined;

    private _enumPushMultiEvent = new MultiEvent<EnumUiAction.PushEventHandlersInterface<T>>();

    constructor(undefinedValue: T, valueRequired: boolean) {
        super(valueRequired);

        this._undefinedValue = undefinedValue;
        this._definedValue = undefinedValue;
    }

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }
    get filter() { return this._filter; }

    commitValue(value: T | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: T | undefined) {
        this.pushValueWithoutAutoAcceptance(value, this.edited);
        this.pushAutoAcceptance();
    }

    pushFilter(value: readonly T[] | undefined) {
        this._filter = value;
        this.notifyFilterPush();
    }

    override subscribePushEvents(handlersInterface: EnumUiAction.PushEventHandlersInterface<T>) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._enumPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._enumPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected override repushValue(newEdited: boolean) {
        this.pushValueWithoutAutoAcceptance(this._value, newEdited);
    }

    protected notifyElementPush(element: T, caption: string, title: string) {
        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.element !== undefined) {
                handlersInterface.element(element, caption, title);
            }
        }
    }

    protected notifyElementsPush(filter: T[] | undefined | null) {
        if (filter !== null) {
            if (filter === undefined) {
                this._filter = undefined;
            } else {
                this._filter = filter.slice();
            }
        }

        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.elements !== undefined) {
                handlersInterface.elements();
            }
        }
    }

    private notifyValuePush(edited: boolean) {
        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value, edited);
            }
        }
    }

    private notifyFilterPush() {
        const handlersInterfaces = this._enumPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.filter !== undefined) {
                handlersInterface.filter(this._filter);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = this._undefinedValue;
        }
    }

    private pushValueWithoutAutoAcceptance(value: T | undefined, edited: boolean) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }

    abstract getElementProperties(element: T): EnumUiAction.ElementProperties<T> | undefined;
    abstract getElementPropertiesArray(): EnumUiAction.ElementProperties<T>[];
}

export namespace EnumUiAction {
    export const integerUndefinedValue = -99999;
    export const stringUndefinedValue = '';

    export interface ElementProperties<T> {
        element: T;
        caption: string;
        title: string;
    }

    export type ElementPushEventHandler<T> = (this: void, element: T, caption: string, title: string) => void;
    export type ElementsPushEventHandler = (this: void) => void;
    export type ValuePushEventHandler<T> = (this: void, value: T | undefined, edited: boolean) => void;
    export type FilterPushEventHandler<T> = (this: void, value: readonly T[] | undefined) => void;

    export interface PushEventHandlersInterface<T> extends UiAction.PushEventHandlersInterface {
        element?: ElementPushEventHandler<T>;
        elements?: ElementsPushEventHandler;
        value?: ValuePushEventHandler<T>;
        filter?: FilterPushEventHandler<T>;
    }
}

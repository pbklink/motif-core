/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent } from '../sys/sys-internal-api';
import { TypedArrayUiAction } from './typed-array-ui-action';

export abstract class TypedExplicitElementsArrayUiAction<T> extends TypedArrayUiAction<T> {

    private _filter: readonly T[] | undefined;

    private _typedExplicitElementsArrayPushMultiEvent = new MultiEvent<TypedExplicitElementsArrayUiAction.PushEventHandlersInterface<T>>();

    get filter() { return this._filter; }

    pushFilter(value: readonly T[] | undefined) {
        this._filter = value;
        this.notifyFilterPush();
    }

    override subscribePushEvents(handlersInterface: TypedExplicitElementsArrayUiAction.PushEventHandlersInterface<T>) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._typedExplicitElementsArrayPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._typedExplicitElementsArrayPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected notifyElementPush(element: T, caption: string, title: string) {
        const handlersInterfaces = this._typedExplicitElementsArrayPushMultiEvent.copyHandlers();
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

        const handlersInterfaces = this._typedExplicitElementsArrayPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.elements !== undefined) {
                handlersInterface.elements();
            }
        }
    }

    private notifyFilterPush() {
        const handlersInterfaces = this._typedExplicitElementsArrayPushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.filter !== undefined) {
                handlersInterface.filter(this._filter);
            }
        }
    }

    abstract getElementProperties(element: T): TypedExplicitElementsArrayUiAction.ElementProperties<T> | undefined;
    abstract getElementPropertiesArray(): TypedExplicitElementsArrayUiAction.ElementProperties<T>[];
}

export namespace TypedExplicitElementsArrayUiAction {
    export interface ElementProperties<T> {
        element: T;
        caption: string;
        title: string;
    }

    export type ElementPushEventHandler<T> = (this: void, element: T, caption: string, title: string) => void;
    export type ElementsPushEventHandler = (this: void) => void;
    export type FilterPushEventHandler<T> = (this: void, value: readonly T[] | undefined) => void;

    export interface PushEventHandlersInterface<T> extends TypedArrayUiAction.PushEventHandlersInterface<T> {
        element?: ElementPushEventHandler<T>;
        elements?: ElementsPushEventHandler;
        filter?: FilterPushEventHandler<T>;
    }
}

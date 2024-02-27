/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumUiAction } from './enum-ui-action';

export abstract class ExplicitElementsEnumUiAction<T> extends EnumUiAction<T> {
    private _elementPropertiesMap = new Map<T, EnumUiAction.ElementProperties<T>>();

    getElementProperties(element: T) {
        return this._elementPropertiesMap.get(element);
    }

    getElementPropertiesArray() {
        const result = new Array<EnumUiAction.ElementProperties<T>>(this._elementPropertiesMap.size);
        let idx = 0;
        for (const value of this._elementPropertiesMap.values()) {
            result[idx++] = value;
        }
        return result;
    }

    pushElement(element: T, caption: string, title: string) {
        const elementProperties: EnumUiAction.ElementProperties<T> = {
            element,
            caption,
            title,
        };
        this._elementPropertiesMap.set(element, elementProperties);
        this.notifyElementPush(element, caption, title);
    }

    pushElements(elementPropertiesArray: EnumUiAction.ElementProperties<T>[],
        filter: T[] | undefined | null = null) {
        this._elementPropertiesMap.clear();
        for (const elementProperties of elementPropertiesArray) {
            this._elementPropertiesMap.set(elementProperties.element, elementProperties);
        }
        this.notifyElementsPush(filter);
    }
}

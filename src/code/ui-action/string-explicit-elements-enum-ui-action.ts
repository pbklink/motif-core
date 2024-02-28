/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumUiAction } from './enum-ui-action';
import { ExplicitElementsEnumUiAction } from './explicit-elements-enum-ui-action';

export class StringExplicitElementsEnumUiAction extends ExplicitElementsEnumUiAction<string> {
    constructor(valueRequired = true) {
        super(EnumUiAction.stringUndefinedValue, valueRequired);
    }
}

export namespace StringExplicitElementsEnumUiAction {
    export interface ElementProperties {
        element: string;
        caption: string;
        title: string;
    }
}

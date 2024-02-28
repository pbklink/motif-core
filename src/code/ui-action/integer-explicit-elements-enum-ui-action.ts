/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../sys/sys-internal-api';
import { EnumUiAction } from './enum-ui-action';
import { ExplicitElementsEnumUiAction } from './explicit-elements-enum-ui-action';

export class IntegerExplicitElementsEnumUiAction extends ExplicitElementsEnumUiAction<Integer> {
    constructor(valueRequired = true) {
        super(EnumUiAction.integerUndefinedValue, valueRequired);
    }
}

export namespace IntegerExplicitElementsEnumUiAction {
    export interface ElementProperties {
        element: Integer;
        caption: string;
        title: string;
    }
}

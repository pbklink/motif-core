/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridFieldDefinition } from './grid-field-definition';

export abstract class GridField {
    readonly name: string;
    constructor(readonly definition: GridFieldDefinition) {
        this.name = definition.name;
    }
}

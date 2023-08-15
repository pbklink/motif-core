/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllowedGridField } from '../../field/grid-field-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

export class AllowedFieldsGridLayoutDefinition extends GridLayoutDefinition {
    // Uses AllowedGridField instead of GridFieldDefinition as heading can be changed at runtime
    constructor(columns: readonly GridLayoutDefinition.Column[], readonly allowedFields: readonly AllowedGridField[]) {
        super(columns);
    }
}

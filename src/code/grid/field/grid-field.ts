/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RenderValue } from '../../services/services-internal-api';
import { GridRevRecordField } from '../../sys/grid-revgrid-types';
import { IndexedRecord } from '../../sys/types';
import { GridFieldDefinition } from './grid-field-definition';

export abstract class GridField implements GridRevRecordField {
    readonly name: string;
    constructor(readonly definition: GridFieldDefinition) {
        this.name = definition.name;
    }
    abstract getValue(record: IndexedRecord): RenderValue;
}

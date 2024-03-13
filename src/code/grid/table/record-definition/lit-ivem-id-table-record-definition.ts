/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../adi/adi-internal-api';
import { TableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemIdTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableFieldSourceDefinition.TypeId.LitIvemId;
    readonly litIvemId: LitIvemId;
}

export namespace LitIvemIdTableRecordDefinition {
    export function createMapKey(litIvemId: LitIvemId) {
        return LitIvemId.createMapKey(litIvemId);
    }
}

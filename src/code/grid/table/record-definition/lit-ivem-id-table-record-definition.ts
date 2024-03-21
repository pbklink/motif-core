/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../adi/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface LitIvemIdTableRecordDefinition extends TypedTableRecordDefinition {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.LitIvemId;
    readonly litIvemId: LitIvemId;
}

export namespace LitIvemIdTableRecordDefinition {
    export function createMapKey(litIvemId: LitIvemId) {
        return LitIvemId.createMapKey(litIvemId);
    }
}

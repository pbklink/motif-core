/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../adi/adi-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemIdTableRecordDefinition extends TableRecordDefinition {
    readonly litIvemId: LitIvemId;
}

export namespace LitIvemIdTableRecordDefinition {
    export function createMapKey(litIvemId: LitIvemId) {
        return LitIvemId.createMapKey(litIvemId);
    }
}

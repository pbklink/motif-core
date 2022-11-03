/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemIdTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableRecordDefinition.TypeId.LitIvemId;
    readonly litIvemId: LitIvemId;
}

export namespace LitIvemIdTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LitIvemIdTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.LitIvemId;
    }

    export function createKey(definition: LitIvemIdTableRecordDefinition) {
        return LitIvemId.generatePersistKey(definition.litIvemId);
    }
}


/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, RankedLitIvemId } from '../../../adi/internal-api';
import { TableFieldSourceDefinition } from '../field-source/internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface RankedLitIvemIdTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableFieldSourceDefinition.TypeId.RankedLitIvemId;
    readonly rankedLitIvemId: RankedLitIvemId;
}

export namespace RankedLitIvemIdTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is RankedLitIvemIdTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.RankedLitIvemId;
    }

    export function createMapKey(rankedLitIvemId: RankedLitIvemId) {
        return LitIvemId.createMapKey(rankedLitIvemId.litIvemId);
    }
}


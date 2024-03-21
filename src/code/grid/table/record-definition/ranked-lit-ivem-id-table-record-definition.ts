/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, RankedLitIvemId } from '../../../adi/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface RankedLitIvemIdTableRecordDefinition extends TypedTableRecordDefinition {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId;
    readonly rankedLitIvemId: RankedLitIvemId;
}

export namespace RankedLitIvemIdTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is RankedLitIvemIdTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId;
    }

    export function createMapKey(rankedLitIvemId: RankedLitIvemId) {
        return LitIvemId.createMapKey(rankedLitIvemId.litIvemId);
    }
}


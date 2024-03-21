/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectoryItem } from '../../../services/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface RankedLitIvemIdListDirectoryItemTableRecordDefinition extends PayloadTableRecordDefinition<RankedLitIvemIdListDirectoryItem> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem;
}

export namespace RankedLitIvemIdListDirectoryItemTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is RankedLitIvemIdListDirectoryItemTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem;
    }
}

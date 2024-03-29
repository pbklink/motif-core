/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectoryItem } from '../../../services/internal-api';
import { TableFieldSourceDefinition } from '../field-source/internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface RankedLitIvemIdListDirectoryItemTableRecordDefinition extends PayloadTableRecordDefinition<RankedLitIvemIdListDirectoryItem> {
    readonly typeId: TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem;
}

export namespace RankedLitIvemIdListDirectoryItemTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is RankedLitIvemIdListDirectoryItemTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem;
    }
}

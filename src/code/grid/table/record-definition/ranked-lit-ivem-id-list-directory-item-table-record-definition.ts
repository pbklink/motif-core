/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectoryItem } from '../../../services/services-internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface RankedLitIvemIdListDirectoryItemTableRecordDefinition extends PayloadTableRecordDefinition<RankedLitIvemIdListDirectoryItem> {
    readonly typeId: TableRecordDefinition.TypeId.RankedLitIvemIdListDirectoryItem;
}

export namespace RankedLitIvemIdListDirectoryItemTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is RankedLitIvemIdListDirectoryItemTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.RankedLitIvemIdListDirectoryItem;
    }
}

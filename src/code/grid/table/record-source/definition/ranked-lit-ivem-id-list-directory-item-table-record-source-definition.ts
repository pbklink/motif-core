/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { RankedLitIvemIdListDirectory } from '../../../../ranked-lit-ivem-id-list/internal-api';
import { RankedLitIvemIdListDirectoryItem } from '../../../../services/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import {
    RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
} from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        readonly listDirectory: RankedLitIvemIdListDirectory,
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
            RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition() {
        const rankedLitIvemIdListDirectoryItemFieldSourceDefinition = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(rankedLitIvemIdListDirectoryItemFieldSourceDefinition.getSupportedFieldNameById(RankedLitIvemIdListDirectoryItem.FieldId.Name));
        fieldNames.push(rankedLitIvemIdListDirectoryItemFieldSourceDefinition.getSupportedFieldNameById(RankedLitIvemIdListDirectoryItem.FieldId.TypeId));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
    ];
}

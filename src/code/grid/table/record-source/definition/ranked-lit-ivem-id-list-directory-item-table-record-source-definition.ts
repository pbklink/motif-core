/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldCustomHeadingsService, RevGridLayoutDefinition } from '@xilytix/rev-data-source';
import { RankedLitIvemIdListDirectory } from '../../../../ranked-lit-ivem-id-list/internal-api';
import { RankedLitIvemIdListDirectoryItem } from '../../../../services/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import {
    RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactoryService,
} from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        readonly listDirectory: RankedLitIvemIdListDirectory,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
            RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition() {
        const rankedLitIvemIdListDirectoryItemFieldSourceDefinition = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(rankedLitIvemIdListDirectoryItemFieldSourceDefinition.getSupportedFieldNameById(RankedLitIvemIdListDirectoryItem.FieldId.Name));
        fieldNames.push(rankedLitIvemIdListDirectoryItemFieldSourceDefinition.getSupportedFieldNameById(RankedLitIvemIdListDirectoryItem.FieldId.TypeId));

        return RevGridLayoutDefinition.createFromFieldNames(fieldNames);
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

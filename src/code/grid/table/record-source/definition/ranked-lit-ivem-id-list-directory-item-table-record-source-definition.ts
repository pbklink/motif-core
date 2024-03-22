/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectory } from '../../../../ranked-lit-ivem-id-list/internal-api';
import { RankedLitIvemIdListDirectoryItem } from '../../../../services/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import { RevFieldCustomHeadingsService } from '../../../field/internal-api';
import { GridLayoutDefinition } from '../../../layout/internal-api';
import {
    RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService,
} from '../../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export class RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        readonly listDirectory: RankedLitIvemIdListDirectory,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
            RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition() {
        const rankedLitIvemIdListDirectoryItemFieldSourceDefinition = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(rankedLitIvemIdListDirectoryItemFieldSourceDefinition.getSupportedFieldNameById(RankedLitIvemIdListDirectoryItem.FieldId.Name));
        fieldNames.push(rankedLitIvemIdListDirectoryItemFieldSourceDefinition.getSupportedFieldNameById(RankedLitIvemIdListDirectoryItem.FieldId.TypeId));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
    ];
}

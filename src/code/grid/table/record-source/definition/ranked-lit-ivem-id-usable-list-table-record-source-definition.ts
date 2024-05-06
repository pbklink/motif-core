/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { RankedLitIvemId } from '../../../../adi/internal-api';
import { PickEnum, UsableList } from '../../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';
import { UsableListTableRecordSourceDefinition } from './usable-list-table-record-source-definition';

/** @public */
export abstract class RankedLitIvemIdUsableListTableRecordSourceDefinition extends UsableListTableRecordSourceDefinition<RankedLitIvemId> {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        typeId: TableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdUsableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[],
        list: UsableList<RankedLitIvemId>,
    ) {
        super(customHeadings, tableFieldSourceDefinitionCachingFactory, typeId, allowedFieldSourceDefinitionTypeIds, list);
    }

    abstract get defaultFieldSourceDefinitionTypeIds(): RankedLitIvemIdUsableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[];
}


/** @public */
export namespace RankedLitIvemIdUsableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.RankedLitIvemId |
        TableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
        TableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];
}

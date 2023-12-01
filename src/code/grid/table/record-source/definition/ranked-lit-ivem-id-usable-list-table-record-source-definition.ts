/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PickEnum, UsableList } from '../../../../sys/sys-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { UsableListTableRecordSourceDefinition } from './usable-list-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';
import { RankedLitIvemId } from '../../../../adi/adi-internal-api';

/** @public */
export abstract class RankedLitIvemIdUsableListTableRecordSourceDefinition extends UsableListTableRecordSourceDefinition<RankedLitIvemId> {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        typeId: TableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdUsableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[],
        list: UsableList<RankedLitIvemId>,
    ) {
        super(customHeadingsService, tableFieldSourceDefinitionRegistryService, typeId, allowedFieldSourceDefinitionTypeIds, list);
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
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
        TableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];
}

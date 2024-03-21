/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemId } from '../../../../adi/adi-internal-api';
import { PickEnum, UsableList } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../../field-source/grid-table-field-source-internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';
import { UsableListTableRecordSourceDefinition } from './usable-list-table-record-source-definition';

/** @public */
export abstract class RankedLitIvemIdUsableListTableRecordSourceDefinition extends UsableListTableRecordSourceDefinition<RankedLitIvemId> {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        typeId: TypedTableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdUsableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[],
        list: UsableList<RankedLitIvemId>,
    ) {
        super(customHeadingsService, tableFieldSourceDefinitionCachingFactoryService, typeId, allowedFieldSourceDefinitionTypeIds, list);
    }

    abstract get defaultFieldSourceDefinitionTypeIds(): RankedLitIvemIdUsableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[];
}


/** @public */
export namespace RankedLitIvemIdUsableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId |
        TypedTableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId,
        TypedTableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];
}

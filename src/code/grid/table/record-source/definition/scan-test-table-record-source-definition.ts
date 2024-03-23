/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail, RankedLitIvemId } from '../../../../adi/internal-api';
import { LitIvemIdExecuteScanRankedLitIvemIdListDefinition } from '../../../../ranked-lit-ivem-id-list/internal-api';
import { RevFieldCustomHeadingsService } from '../../../field/internal-api';
import { RevGridLayoutDefinition } from '../../../layout/internal-api';
import {
    LitIvemBaseDetailTableFieldSourceDefinition,
    RankedLitIvemIdTableFieldSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService,
} from '../../field-source/internal-api';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-table-record-source-definition';

/** @public */
export class ScanTestTableRecordSourceDefinition extends RankedLitIvemIdListTableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        rankedLitIvemIdListDefinition: LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            ScanTestTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            rankedLitIvemIdListDefinition,
        );
    }

    override get defaultFieldSourceDefinitionTypeIds() { return ScanTestTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds; }

    override createDefaultLayoutDefinition(): RevGridLayoutDefinition {
        const rankedLitIvemIdFieldSourceDefinition = RankedLitIvemIdTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);
        const litIvemBaseDetailFieldSourceDefinition = LitIvemBaseDetailTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.LitIvemId));
        fieldNames.push(litIvemBaseDetailFieldSourceDefinition.getFieldNameById(LitIvemBaseDetail.Field.Id.Name));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.RankScore));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.Rank));

        return RevGridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanTestTableRecordSourceDefinition {
    export const allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId,
    ];
}

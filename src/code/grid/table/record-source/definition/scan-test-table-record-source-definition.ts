/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { LitIvemBaseDetail, RankedLitIvemId } from '../../../../adi/internal-api';
import { LitIvemIdExecuteScanRankedLitIvemIdListDefinition } from '../../../../ranked-lit-ivem-id-list/internal-api';
import {
    LitIvemBaseDetailTableFieldSourceDefinition,
    RankedLitIvemIdTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
} from '../../field-source/internal-api';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-table-record-source-definition';

/** @public */
export class ScanTestTableRecordSourceDefinition extends RankedLitIvemIdListTableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        rankedLitIvemIdListDefinition: LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            ScanTestTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            rankedLitIvemIdListDefinition,
        );
    }

    override get defaultFieldSourceDefinitionTypeIds() { return ScanTestTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds; }

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const rankedLitIvemIdFieldSourceDefinition = RankedLitIvemIdTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);
        const litIvemBaseDetailFieldSourceDefinition = LitIvemBaseDetailTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.LitIvemId));
        fieldNames.push(litIvemBaseDetailFieldSourceDefinition.getFieldNameById(LitIvemBaseDetail.Field.Id.Name));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.RankScore));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.Rank));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanTestTableRecordSourceDefinition {
    export const allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
    ];
}

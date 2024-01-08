/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail, RankedLitIvemId } from '../../../../adi/adi-internal-api';
import { LitIvemIdExecuteScanRankedLitIvemIdListDefinition } from '../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class ScanTestTableRecordSourceDefinition extends RankedLitIvemIdListTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        rankedLitIvemIdListDefinition: LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.ScanTest,
            ScanTestTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            rankedLitIvemIdListDefinition,
        );
    }

    override get defaultFieldSourceDefinitionTypeIds() { return ScanTestTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds; }

    override createDefaultLayoutDefinition(): GridLayoutDefinition {
        const rankedLitIvemIdFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.rankedLitIvemId;
        const litIvemBaseDetailFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.litIvemBaseDetail;

        const fieldNames = new Array<string>();

        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.LitIvemId));
        fieldNames.push(litIvemBaseDetailFieldSourceDefinition.getFieldNameById(LitIvemBaseDetail.Field.Id.Name));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.RankScore));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.Rank));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanTestTableRecordSourceDefinition {
    export const allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
    ];
}

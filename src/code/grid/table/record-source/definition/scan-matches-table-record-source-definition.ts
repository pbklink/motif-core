/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail, RankedLitIvemId } from '../../../../adi/adi-internal-api';
import { ChangeSubscribableComparableList, PickEnum } from '../../../../sys/sys-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { RankedLitIvemIdUsableListTableRecordSourceDefinition } from './ranked-lit-ivem-id-usable-list-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class ScanMatchesTableRecordSourceDefinition extends RankedLitIvemIdUsableListTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        list: ChangeSubscribableComparableList<RankedLitIvemId>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.ScanMatches,
            ScanMatchesTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list
        );
    }

    override get defaultFieldSourceDefinitionTypeIds(): RankedLitIvemIdUsableListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] {
        return [
            TableFieldSourceDefinition.TypeId.RankedLitIvemId,
            TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        ];
    }

    override createDefaultLayoutDefinition(): GridLayoutDefinition {
        const rankedLitIvemIdFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.rankedLitIvemId;
        const litIvemBaseDetailFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.litIvemBaseDetail;

        const fieldNames = new Array<string>();

        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.LitIvemId));
        fieldNames.push(litIvemBaseDetailFieldSourceDefinition.getFieldNameById(LitIvemBaseDetail.Field.Id.Name));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.RankScore));
        fieldNames.push(rankedLitIvemIdFieldSourceDefinition.getFieldNameById(RankedLitIvemId.FieldId.Rank));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace ScanMatchesTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
    ];

    export namespace JsonName {
        export const list = 'list';
    }
}

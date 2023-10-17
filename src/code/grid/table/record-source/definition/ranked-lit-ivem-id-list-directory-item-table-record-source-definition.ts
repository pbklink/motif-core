/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectory } from '../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api';
import { Scan } from '../../../../scan/scan-internal-api';
import { PickEnum } from '../../../../sys/sys-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        readonly listDirectory: RankedLitIvemIdListDirectory,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
            RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition() {
        const scanFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.;

        const fieldNames = new Array<string>();

        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.Name));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.TargetTypeId));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.Enabled));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.SymbolListEnabled));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.RankedLitIvemIdDirectoryItem
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Scan,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Scan,
    ];

    export namespace JsonName {
        export const scanId = 'scanId';
    }
}

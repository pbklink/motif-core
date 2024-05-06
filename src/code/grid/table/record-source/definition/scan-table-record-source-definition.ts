/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { Scan } from '../../../../scan/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import { ScanTableFieldSourceDefinition, TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class ScanTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.Scan,
            ScanTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition() {
        const scanFieldSourceDefinition = ScanTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.Name));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.TargetTypeId));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.Enabled));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.StatusId));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.SymbolListEnabled));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Scan
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

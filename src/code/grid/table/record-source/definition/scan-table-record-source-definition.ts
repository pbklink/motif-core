/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan } from '../../../../scan/scan-internal-api';
import { JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class ScanTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService) {
        super(
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.Scan,
            ScanTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition() {
        const scanFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.scan;

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

    export function tryCreateFromJson(
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        element: JsonElement
    ): Result<ScanTableRecordSourceDefinition> {
        const definition = new ScanTableRecordSourceDefinition(tableFieldSourceDefinitionRegistryService);
        return new Ok(definition);
    }
}

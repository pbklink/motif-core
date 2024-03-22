/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan } from '../../../../scan/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import { RevFieldCustomHeadingsService } from '../../../field/internal-api';
import { GridLayoutDefinition } from '../../../layout/internal-api';
import { ScanTableFieldSourceDefinition, TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export class ScanTableRecordSourceDefinition extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.Scan,
            ScanTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefaultLayoutDefinition() {
        const scanFieldSourceDefinition = ScanTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.Name));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.TargetTypeId));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.Enabled));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.StatusId));
        fieldNames.push(scanFieldSourceDefinition.getSupportedFieldNameById(Scan.FieldId.SymbolListEnabled));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace ScanTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.Scan
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.Scan,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.Scan,
    ];

    export namespace JsonName {
        export const scanId = 'scanId';
    }
}

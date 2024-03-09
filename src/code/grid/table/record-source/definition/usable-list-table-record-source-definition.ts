/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UsableList } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachedFactoryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export abstract class UsableListTableRecordSourceDefinition<T> extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService,
        typeId: TableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
        readonly list: UsableList<T>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachedFactoryService,
            typeId,
            allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

}

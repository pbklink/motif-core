/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { BadnessList } from '../../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export abstract class BadnessListTableRecordSourceDefinition<T> extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        typeId: TableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
        readonly list: BadnessList<T>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            typeId,
            allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

}

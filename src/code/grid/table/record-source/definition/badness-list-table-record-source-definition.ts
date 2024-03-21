/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export abstract class BadnessListTableRecordSourceDefinition<T> extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        typeId: TypedTableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: TypedTableFieldSourceDefinition.TypeId[],
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

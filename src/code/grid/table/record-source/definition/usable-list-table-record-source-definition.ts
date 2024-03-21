/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UsableList } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export abstract class UsableListTableRecordSourceDefinition<T> extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        typeId: TypedTableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: TypedTableFieldSourceDefinition.TypeId[],
        readonly list: UsableList<T>,
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

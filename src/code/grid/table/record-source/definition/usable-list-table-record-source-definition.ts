/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { UsableList } from '../../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export abstract class UsableListTableRecordSourceDefinition<T> extends TableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        typeId: TableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
        readonly list: UsableList<T>,
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            typeId,
            allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

}

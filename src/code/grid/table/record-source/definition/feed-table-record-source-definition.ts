/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { Feed } from '../../../../adi/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import { FeedTableFieldSourceDefinition, TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class FeedTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.Feed,
            FeedTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const feedFieldSourceDefinition = FeedTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.Name));
        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.ClassId));
        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.StatusId));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace FeedTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Feed
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Feed,
    ];
}

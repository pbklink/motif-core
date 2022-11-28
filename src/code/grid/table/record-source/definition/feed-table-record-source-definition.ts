/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from '../../../../adi/adi-internal-api';
import { JsonElement, PickEnum } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionsService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class FeedTableRecordSourceDefinition extends TableRecordSourceDefinition {
    protected override readonly allowedFieldDefinitionSourceTypeIds: FeedTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    constructor(tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.Feed);
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const feedFieldSourceDefinition = this.tableFieldSourceDefinitionsService.feed;

        const fieldNames = new Array<string>();

        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.Name));
        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.ClassId));
        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.StatusId));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace FeedTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Feed
    >;

    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function createFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        _element: JsonElement
    ): FeedTableRecordSourceDefinition {
        return new FeedTableRecordSourceDefinition(tableFieldSourceDefinitionsService);
    }
}

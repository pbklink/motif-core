/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, Feed, FeedsDataDefinition, FeedsDataItem } from '../../../adi/adi-internal-api';
import { Integer, KeyedCorrectnessList, PickEnum, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridLayout } from '../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionsService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { FeedTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableValueList } from '../record/grid-table-record-internal-api';
import { FeedTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { FeedTableRecordSourceDefinition } from './definition/feed-table-record-source-definition';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

export class FeedTableRecordSource extends SingleDataItemRecordTableRecordSource<Feed, KeyedCorrectnessList<Feed>> {

    protected override readonly allowedFieldDefinitionSourceTypeIds: FeedTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        definition: FeedTableRecordSourceDefinition,
    ) {
        super(definition);
    }

    override createRecordDefinition(idx: Integer): FeedTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableRecordDefinition.TypeId.Feed,
            mapKey: record.mapKey,
            record,
        };
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
        const feed = this.recordList.records[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId = fieldDefinitionSource.typeId as FeedTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.Feed: {
                    const valueSource = new FeedTableValueSource(result.fieldCount, feed);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('FTRSCTVL77752', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createDefaultLayout() {
        const result = new GridLayout();

        const feedFieldSourceDefinition = this._tableFieldSourceDefinitionsService.feed;

        result.addField(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.Name));
        result.addField(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.ClassId));
        result.addField(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.StatusId));

        return result;
    }

    protected subscribeList() {
        const definition = new FeedsDataDefinition();
        const dataItem = this._adiService.subscribe(definition) as FeedsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(list: KeyedCorrectnessList<Feed>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }
}

export namespace FeedTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Feed
    >;
}

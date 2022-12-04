/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, Feed, FeedsDataDefinition, FeedsDataItem } from '../../../adi/adi-internal-api';
import { Integer, KeyedCorrectnessList, LockOpenListItem, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { FeedTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { FeedTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { FeedTableRecordSourceDefinition } from './definition/feed-table-record-source-definition';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

/** @public */
export class FeedTableRecordSource extends SingleDataItemRecordTableRecordSource<Feed, KeyedCorrectnessList<Feed>> {
    constructor(
        private readonly _adiService: AdiService,
        textFormatterService: TextFormatterService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        definition: FeedTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableFieldSourceDefinitionRegistryService,
            definition.typeId,
            FeedTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds
        );
    }

    override createDefinition(): FeedTableRecordSourceDefinition {
        return new FeedTableRecordSourceDefinition(this.tableFieldSourceDefinitionRegistryService);
    }

    override createRecordDefinition(idx: Integer): FeedTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableRecordDefinition.TypeId.Feed,
            mapKey: record.mapKey,
            record,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const feed = this.recordList.records[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as FeedTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.Feed: {
                    const valueSource = new FeedTableValueSource(result.fieldCount, feed);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('FTRSCTVL77752', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected subscribeList(_opener: LockOpenListItem.Opener) {
        const definition = new FeedsDataDefinition();
        const dataItem = this._adiService.subscribe(definition) as FeedsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(_opener: LockOpenListItem.Opener, _list: KeyedCorrectnessList<Feed>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return FeedTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}

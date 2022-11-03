/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from '../../adi/adi-internal-api';
import { AssertInternalError, LockOpenListItem, Logger } from '../../sys/sys-internal-api';
import { FeedTableFieldSourceDefinition } from './feed-table-field-source-definition';
import { FeedTableRecordDefinition } from './feed-table-record-definition';
import { FeedTableRecordSource } from './feed-table-record-source';
import { FeedTableValueSource } from './feed-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';

export class FeedTableDefinition extends SingleDataItemTableDefinition {

    private _feedTableRecordDefinitionList: FeedTableRecordSource;

    override lockRecordDefinitionList(locker: LockOpenListItem.Locker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof FeedTableRecordSource)) {
            throw new AssertInternalError('FTDLRDL87875340', list.name);
        } else {
            this._feedTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const feedTableRecordDefinition = tableRecordDefinition as FeedTableRecordDefinition;
        let feed = feedTableRecordDefinition.record;

        if (feed === undefined) {
            const mapKey = feedTableRecordDefinition.mapKey;
            feed = this._feedTableRecordDefinitionList.recordList.getRecordByMapKey(mapKey);
        }

        if (feed === undefined) {
            feed = Feed.createNotFoundFeed(feedTableRecordDefinition.key as Feed.Key);
        }

        const feedSource = new FeedTableValueSource(result.fieldCount, feed);
        result.addSource(feedSource);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const feedsDefinitionSource =
            new FeedTableFieldSourceDefinition(this._textFormatterService, TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(feedsDefinitionSource);

        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.Name);
        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.ClassId);
        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.StatusId);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addFeedFieldToDefaultLayout(definitionSource: FeedTableFieldSourceDefinition,
        fieldId: Feed.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Feed layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}

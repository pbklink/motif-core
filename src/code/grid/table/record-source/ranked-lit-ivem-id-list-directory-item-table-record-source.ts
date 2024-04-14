/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { RankedLitIvemIdListDirectory } from '../../../ranked-lit-ivem-id-list/internal-api';
import { RankedLitIvemIdListDirectoryItem } from '../../../services/internal-api';
import { CorrectnessBadness, Integer, LockOpenListItem, UnreachableCaseError } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService
} from "../field-source/internal-api";
import { RankedLitIvemIdListDirectoryItemTableRecordDefinition } from '../record-definition/internal-api';
import { TableRecord } from '../record/internal-api';
import { RankedLitIvemIdListDirectoryItemTableValueSource } from '../value-source/internal-api';
import { RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition } from './definition/internal-api';
import { SubscribeBadnessListTableRecordSource } from './subscribe-badness-list-table-record-source';

export class RankedLitIvemIdListDirectoryItemTableRecordSource extends SubscribeBadnessListTableRecordSource<RankedLitIvemIdListDirectoryItem, RankedLitIvemIdListDirectory> {
    private readonly _listDirectory: RankedLitIvemIdListDirectory;

    constructor(
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._listDirectory = definition.listDirectory;
    }

    override createDefinition(): RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition {
        return new RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition(
            this._gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachingFactoryService,
            this._listDirectory,
        );
    }

    override createRecordDefinition(idx: Integer): RankedLitIvemIdListDirectoryItemTableRecordDefinition {
        const rankedLitIvemIdListDirectoryItem = this._listDirectory.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
            mapKey: RankedLitIvemIdListDirectoryItem.createMapKey(rankedLitIvemIdListDirectoryItem),
            record: rankedLitIvemIdListDirectoryItem,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const rankedLitIvemIdListDirectoryItem = this._listDirectory.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem: {
                    const valueSource = new RankedLitIvemIdListDirectoryItemTableValueSource(result.fieldCount, rankedLitIvemIdListDirectoryItem);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('RLIILDITRSCTR30361', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected override getCount() { return this._listDirectory.count; }
    protected override subscribeList(opener: LockOpenListItem.Opener) {
        return this._listDirectory;
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener) {
        // nothing to do
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}

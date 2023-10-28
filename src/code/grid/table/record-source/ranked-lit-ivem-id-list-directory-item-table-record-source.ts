/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectory } from '../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api';
import { RankedLitIvemIdListDirectoryItem } from '../../../services/services-internal-api';
import { Integer, LockOpenListItem, Ok, Result, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { RankedLitIvemIdListDirectoryItemTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { BadnessListTableRecordSource } from './badness-list-table-record-source';
import { RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';

export class RankedLitIvemIdListDirectoryItemTableRecordSource extends BadnessListTableRecordSource<RankedLitIvemIdListDirectoryItem, RankedLitIvemIdListDirectory> {
    private readonly _listDirectory: RankedLitIvemIdListDirectory;

    constructor(
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._listDirectory = definition.listDirectory;
    }

    override createDefinition(): RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition {
        return this.tableRecordSourceDefinitionFactoryService.createRankedLitIvemIdListDirectoryItem(this._listDirectory);
    }

    override tryLock(_locker: LockOpenListItem.Locker): Promise<Result<void>> {
        return Ok.createResolvedPromise(undefined);
    }

    override unlock(_locker: LockOpenListItem.Locker) {
        // nothing to do
    }


    override openLocked(_opener: LockOpenListItem.Opener) {
        this._listDirectory.open();
    }

    override closeLocked(_opener: LockOpenListItem.Opener) {
        this._listDirectory.close();
    }

    override createRecordDefinition(idx: Integer): RankedLitIvemIdListDirectoryItemTableRecordDefinition {
        const rankedLitIvemIdListDirectoryItem = this._listDirectory.getAt(idx);
        return {
            typeId: TableRecordDefinition.TypeId.RankedLitIvemIdListDirectoryItem,
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

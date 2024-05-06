/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { Scan, ScanList, ScansService } from '../../../scan/internal-api';
import { TextFormatter } from '../../../services/internal-api';
import { CorrectnessBadness, Integer, LockOpenListItem, UnreachableCaseError } from '../../../sys/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory
} from "../field-source/internal-api";
import { ScanTableRecordDefinition } from '../record-definition/internal-api';
import { TableRecord } from '../record/internal-api';
import { ScanTableValueSource } from '../value-source/internal-api';
import { ScanTableRecordSourceDefinition } from './definition/internal-api';
import { LockOpenListTableRecordSource } from './lock-open-list-table-record-source';

export class ScanTableRecordSource extends LockOpenListTableRecordSource<Scan, ScanList> {
    private readonly _scanList: ScanList;

    constructor(
        private readonly _scansService: ScansService,
        textFormatter: TextFormatter,
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        correctnessBadness: CorrectnessBadness,
        definition: ScanTableRecordSourceDefinition,
    ) {
        super(
            textFormatter,
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            correctnessBadness,
            definition,
            ScanTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
        this._scanList = this._scansService.scanList;
    }

    override createDefinition(): ScanTableRecordSourceDefinition {
        return new ScanTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
        );
    }

    override createRecordDefinition(idx: Integer): ScanTableRecordDefinition {
        const scan = this._scanList.getAt(idx);
        return {
            typeId: TableFieldSourceDefinition.TypeId.Scan,
            mapKey: scan.mapKey,
            record: scan,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const scan = this._scanList.getAt(recordIndex);

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as ScanTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.Scan: {
                    const valueSource = new ScanTableValueSource(result.fieldCount, scan);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('STRSCTVK19909', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected override getCount() { return this._scanList.count; }

    protected override subscribeList(opener: LockOpenListItem.Opener) {
        return this._scanList;
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener) {
        // nothing to do
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return ScanTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}

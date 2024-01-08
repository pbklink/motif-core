/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Scan, ScanList, ScansService } from '../../../scan/internal-api';
import { Integer, LockOpenListItem, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { ScanTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { ScanTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { ScanTableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';
import { LockOpenListTableRecordSource } from './lock-open-list-table-record-source';

export class ScanTableRecordSource extends LockOpenListTableRecordSource<Scan, ScanList> {
    private readonly _scanList: ScanList;

    constructor(
        private readonly _scansService: ScansService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: ScanTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            ScanTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
        this._scanList = this._scansService.scanList;
    }

    override createDefinition(): ScanTableRecordSourceDefinition {
        return this.tableRecordSourceDefinitionFactoryService.createScan();
    }

    override createRecordDefinition(idx: Integer): ScanTableRecordDefinition {
        const scan = this._scanList.getAt(idx);
        return {
            typeId: TableRecordDefinition.TypeId.Scan,
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

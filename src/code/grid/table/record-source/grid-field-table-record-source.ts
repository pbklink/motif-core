/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, Integer, LockOpenListItem, Ok, Result, UnreachableCaseError, UsableListChangeTypeId } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { GridFieldTableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { GridFieldTableValueSource } from '../value-source/internal-api';
import { GridFieldTableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';
import { TableRecordSource } from './table-record-source';

/** @public */
export class GridFieldTableRecordSource extends TableRecordSource {
    private readonly _records: GridField[];

    constructor(
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: GridFieldTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            GridFieldTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._records = definition.gridFieldArray;
    }

    get records(): readonly GridField[] { return this._records; }

    override createDefinition(): GridFieldTableRecordSourceDefinition {
        return this.tableRecordSourceDefinitionFactoryService.createGridField(this._records.slice());
    }

    override tryLock(_locker: LockOpenListItem.Locker): Promise<Result<void>> {
        return Ok.createResolvedPromise(undefined);
    }

    override unlock(_locker: LockOpenListItem.Locker) {
        // nothing to do
    }


    override openLocked(opener: LockOpenListItem.Opener) {
        super.openLocked(opener);

        this.setUsable(Badness.notBad); // always usable

        const newCount = this._records.length;
        if (newCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
        }
        this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
    }

    override closeLocked(_opener: LockOpenListItem.Opener) {
        // nothing to do
    }

    override createRecordDefinition(idx: Integer): GridFieldTableRecordDefinition {
        const gridField = this._records[idx];
        return {
            typeId: TableFieldSourceDefinition.TypeId.GridField,
            mapKey: gridField.name,
            record: gridField,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const scan = this._records[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as GridFieldTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.GridField: {
                    const valueSource = new GridFieldTableValueSource(result.fieldCount, scan);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('STRSCTVK19909', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected override getCount() { return this._records.length; }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return GridFieldTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}

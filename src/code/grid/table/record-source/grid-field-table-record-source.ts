/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness, CorrectnessBadness, Integer, LockOpenListItem, Ok, Result, UnreachableCaseError, UsableListChangeTypeId } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import { GridField, RevFieldCustomHeadingsService } from '../../field/internal-api';
import {
    TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService
} from "../field-source/internal-api";
import { GridFieldTableRecordDefinition } from '../record-definition/internal-api';
import { TableRecord } from '../record/internal-api';
import { GridFieldTableValueSource } from '../value-source/internal-api';
import { GridFieldTableRecordSourceDefinition } from './definition/internal-api';
import { TypedTableRecordSource } from './typed-table-record-source';

/** @public */
export class GridFieldTableRecordSource extends TypedTableRecordSource {
    private readonly _records: GridField[];

    constructor(
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: GridFieldTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            GridFieldTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._records = definition.gridFieldArray;
    }

    get records(): readonly GridField[] { return this._records; }

    override createDefinition(): GridFieldTableRecordSourceDefinition {
        return new GridFieldTableRecordSourceDefinition(
            this._gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachingFactoryService,
            this._records.slice(),
        );
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
            typeId: TypedTableFieldSourceDefinition.TypeId.GridField,
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
                case TypedTableFieldSourceDefinition.TypeId.GridField: {
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

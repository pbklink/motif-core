/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, LockOpenListItem, Ok, Result, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import {
    TableFieldCustomHeadingsService,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionRegistryService
} from "../field-source/grid-table-field-source-internal-api";
import { GridFieldTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { GridFieldTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { GridFieldTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { TableRecordSource } from './table-record-source';

export class GridFieldTableRecordSource extends TableRecordSource {
    private readonly _gridFieldArray: readonly GridField[];

    constructor(
        textFormatterService: TextFormatterService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        tableFieldCustomHeadingsService: TableFieldCustomHeadingsService,
        definition: GridFieldTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableFieldSourceDefinitionRegistryService,
            tableFieldCustomHeadingsService,
            definition.typeId,
            GridFieldTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this._gridFieldArray = definition.gridFieldArray;
    }

    override createDefinition(): GridFieldTableRecordSourceDefinition {
        return new GridFieldTableRecordSourceDefinition(this.tableFieldSourceDefinitionRegistryService, this._gridFieldArray);
    }

    override tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined);
    }

    override unlock(_locker: LockOpenListItem.Locker) {
        // nothing to do
    }


    override openLocked(_opener: LockOpenListItem.Opener) {
        return new Ok(undefined);
    }

    override closeLocked(_opener: LockOpenListItem.Opener) {
        // nothing to do
    }

    override createRecordDefinition(idx: Integer): GridFieldTableRecordDefinition {
        const gridField = this._gridFieldArray[idx];
        return {
            typeId: TableRecordDefinition.TypeId.GridField,
            mapKey: gridField.name,
            record: gridField,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const scan = this._gridFieldArray[recordIndex];

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

    protected override getCount() { return this._gridFieldArray.length; }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return GridFieldTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}

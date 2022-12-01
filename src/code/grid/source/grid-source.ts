/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import {
    GridLayout,
    GridLayoutOrNamedReference,
    GridLayoutOrNamedReferenceDefinition,
    NamedGridLayout,
    NamedGridLayoutsService
} from "../layout/grid-layout-internal-api";
import { Table, TableFieldSourceDefinition, TableRecordSource, TableRecordSourceDefinition, TableRecordSourceFactoryService } from '../table/grid-table-internal-api';
import { GridRowOrderDefinition, GridSourceDefinition } from './definition/grid-source-definition-internal-api';

/** @public */
export class GridSource {
    private readonly _tableRecordSourceDefinition: TableRecordSourceDefinition;
    private readonly _gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined;

    private _lockedTableRecordSource: TableRecordSource | undefined;
    private _lockedGridLayout: GridLayout | undefined;
    private _lockedNamedGridLayout: NamedGridLayout | undefined;

    private _openedTable: Table;

    get lockedTableRecordSource() { return this._lockedTableRecordSource; }
    get lockedGridLayout() { return this._lockedGridLayout; }
    get lockedNamedGridLayout() { return this._lockedNamedGridLayout; }

    get openedTable() { return this._openedTable; }

    constructor(
        private readonly _namedGridLayoutsService: NamedGridLayoutsService,
        private readonly _tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        definition: GridSourceDefinition,
    ) {
        this._tableRecordSourceDefinition = definition.tableRecordSourceDefinition;
        this._gridLayoutOrNamedReferenceDefinition = definition.gridLayoutOrNamedReferenceDefinition;
    }

    createDefinition(
        gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined,
        rowOrderDefinition: GridRowOrderDefinition | undefined,
    ): GridSourceDefinition {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();

        return new GridSourceDefinition(
            tableRecordSourceDefinition,
            gridLayoutOrNamedReferenceDefinition,
            rowOrderDefinition,
        );
    }

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const tableRecordSource = this._tableRecordSourceFactoryService.createFromDefinition(this._tableRecordSourceDefinition);
        const tableRecordSourceLockResult = tableRecordSource.tryLock(locker);
        if (tableRecordSourceLockResult.isErr()) {
            return tableRecordSourceLockResult.createOuter(ErrorCode.GridSource_TryLockTableRecordSource);
        } else {
            let gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition;
            if (this._gridLayoutOrNamedReferenceDefinition !== undefined) {
                gridLayoutOrNamedReferenceDefinition = this._gridLayoutOrNamedReferenceDefinition;
            } else {
                const gridLayoutDefinition = this._tableRecordSourceDefinition.createDefaultLayoutDefinition();
                gridLayoutOrNamedReferenceDefinition = new GridLayoutOrNamedReferenceDefinition(gridLayoutDefinition);
            }
            const gridLayoutOrNamedReference = new GridLayoutOrNamedReference(
                this._namedGridLayoutsService,
                gridLayoutOrNamedReferenceDefinition
            );
            const gridLayoutOrNamedReferenceLockResult = gridLayoutOrNamedReference.tryLock(locker);
            if (gridLayoutOrNamedReferenceLockResult.isErr()) {
                tableRecordSource.unlock(locker);
                return gridLayoutOrNamedReferenceLockResult.createOuter(ErrorCode.GridSource_TryLockGridLayout);
            } else {
                this._lockedTableRecordSource = tableRecordSource;
                this._lockedGridLayout = gridLayoutOrNamedReference.lockedGridLayout;
                if (this._lockedGridLayout === undefined) {
                    throw new AssertInternalError('GSTL23008');
                } else {
                    this._lockedNamedGridLayout = gridLayoutOrNamedReference.lockedNamedGridLayout;
                    return new Ok(undefined);
                }
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedTableRecordSource === undefined) {
            throw new AssertInternalError('GSUT23008');
        } else {
            this._lockedTableRecordSource.unlock(locker);
            this._lockedTableRecordSource = undefined;

            if (this._lockedGridLayout === undefined) {
                throw new AssertInternalError('GSUL23008');
            } else {
                this._lockedGridLayout.unlock(locker);
                this._lockedGridLayout = undefined;
                this._lockedNamedGridLayout = undefined;
            }
        }
    }

    openLocked(opener: LockOpenListItem.Opener) {
        if (this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GSOLL23008');
        } else {
            this._lockedGridLayout.openLocked(opener);

            if (this._lockedTableRecordSource === undefined) {
                throw new AssertInternalError('GSOLT23008');
            } else {
                const tableFieldSourceDefinitionTypeIds = this.getTableFieldSourceDefinitionTypeIdsFromLayout(this._lockedGridLayout);
                this._lockedTableRecordSource.setActiveFieldSources(tableFieldSourceDefinitionTypeIds);
                this._openedTable = new Table(this._lockedTableRecordSource)

                this._lockedTableRecordSource.openLocked(opener);
            }
        }
    }

    closeLocked(opener: LockOpenListItem.Opener) {
        if (this._lockedTableRecordSource === undefined) {
            throw new AssertInternalError('GSCLT23008');
        } else {
            this._lockedTableRecordSource.closeLocked(opener);

            if (this._lockedGridLayout === undefined) {
                throw new AssertInternalError('GSCLL23008');
            } else {
                this._lockedGridLayout.closeLocked(opener);
            }
        }
    }

    protected createTableRecordSourceDefinition(): TableRecordSourceDefinition {
        if (this._lockedTableRecordSource === undefined) {
            throw new AssertInternalError('GSCDTR23008');
        } else {
            return this._lockedTableRecordSource.createDefinition();
        }
    }

    private getTableFieldSourceDefinitionTypeIdsFromLayout(layout: GridLayout) {
        const columns = layout.columns;
        const typeIds = new Array<TableFieldSourceDefinition.TypeId>();
        for (const column of columns) {
            const fieldName = column.fieldName;
            const decodeResult = TableFieldSourceDefinition.decodeCommaTextFieldName(fieldName);
            if (decodeResult.isOk()) {
                const typeId = decodeResult.value.sourceTypeId;
                if (!typeIds.includes(typeId)) {
                    typeIds.push(typeId);
                }
            }
        }
        return typeIds;
    }
}

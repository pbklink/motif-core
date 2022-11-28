/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, LockOpenListItem, Result } from '../../sys/sys-internal-api';
import { GridLayout, GridLayoutOrNamedReferenceDefinition } from '../layout/grid-layout-internal-api';
import { Table, TableRecordSource, TableRecordSourceDefinition, TableRecordSourceFactoryService } from '../table/grid-table-internal-api';
import { GridSourceDefinition } from './definition/grid-source-definition-internal-api';

/** @public */
export class GridSource {
    private readonly _tableRecordSourceDefinition: TableRecordSourceDefinition;
    private readonly _gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition;

    private _lockedTableRecordSource: TableRecordSource | undefined;
    private _tableRecordSource: TableRecordSource | undefined;
    private _table: Table | undefined;
    private _gridLayout: GridLayout | undefined;

    get openedTableRecordSource() { return this._tableRecordSource; }
    get openedTable() { return this._table; }
    get openedGridLayout() { return this._gridLayout; }

    constructor(definition: GridSourceDefinition) {
        this._tableRecordSourceDefinition = definition.tableRecordSourceDefinition;
        this._gridLayoutOrNamedReferenceDefinition = definition.gridLayoutOrNamedReferenceDefinition;
    }

    createDefinition() {

    }

    tryLock(tableRecordSourceFactoryService: TableRecordSourceFactoryService, locker: LockOpenListItem.Locker): Result<void> {
        const tableRecordSource = tableRecordSourceFactoryService.createFromDefinition(this._tableRecordSourceDefinition);
        const tableRecordSourceLockResult = tableRecordSource.tryLock()
        const gridLayoutDefinitionResult = this._gridLayoutDefinitionOrNamedReference.tryLock(locker);
        if (gridLayoutDefinitionResult.isErr()) {
            return gridLayoutDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_LockLayout);
        } else {
            this._lockedGridLayoutDefinition = this._gridLayoutDefinitionOrNamedReference.lockedGridLayoutDefinition;

            const lockRecordSourceDefinitionResult = this._tableRecordSourceDefinition.tryLock(locker);
            if (lockRecordSourceDefinitionResult.isErr()) {
                this._gridLayoutDefinitionOrNamedReference.unlock(locker);
                this._lockedGridLayoutDefinition = undefined;
                return lockRecordSourceDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_TryProcessFirstLockRecordSource);
            } else {
                this._lockedTableRecordSourceDefinition = this._tableRecordSourceDefinition;
                return new Ok(undefined);
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedTableRecordSourceDefinition !== undefined) {
            this._lockedTableRecordSourceDefinition.unlock(locker);
            this._lockedTableRecordSourceDefinition = undefined;
        }

        if (this._lockedGridLayoutDefinition !== undefined) {
            this._gridLayoutDefinitionOrNamedReference.unlock(locker);
            this._lockedGridLayoutDefinition = undefined;
        }
    }

    open(tableRecordSourceFactoryService: TableRecordSourceFactoryService, opener: LockOpenListItem.Opener) {
        const lockedTableRecordSourceDefinition = this.lockedDefinition.lockedTableRecordSourceDefinition;
        if (lockedTableRecordSourceDefinition === undefined) {
            throw new AssertInternalError('GSTOT45000');
        } else {
            const tableRecordSource = tableRecordSourceFactoryService.createFromDefinition(lockedTableRecordSourceDefinition);
            tableRecordSource.open(opener);
            this._tableRecordSource = tableRecordSource;

            const lockedGridLayoutDefinition = this.lockedDefinition.lockedGridLayoutDefinition;
            if (lockedGridLayoutDefinition === undefined) {
                throw new AssertInternalError('GSTOL45000');
            } else {
                const gridLayout = new GridLayout(lockedGridLayoutDefinition);
                gridLayout.open(opener, /*tableRecordSource.fieldList*/[]);
                this._tableRecordSource = tableRecordSource;
                this._gridLayout = gridLayout;
                this._table = new Table(tableRecordSource);
            }
        }
    }

    close(opener: LockOpenListItem.Opener) {
        if (this._gridLayout !== undefined) {
            this._gridLayout.close(opener);
            this._gridLayout = undefined;
        }

        this._table = undefined;

        if (this._tableRecordSource !== undefined) {
            this._tableRecordSource.close(opener);
            this._tableRecordSource = undefined;
        }
    }
}

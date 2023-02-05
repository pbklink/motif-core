/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, LockOpenListItem, MultiEvent, Ok, Result } from '../../sys/sys-internal-api';
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
    private _gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined;
    private _initialRowOrderDefinition: GridRowOrderDefinition | undefined;

    private _lockedTableRecordSource: TableRecordSource | undefined;
    private _lockedGridLayout: GridLayout | undefined;
    private _lockedNamedGridLayout: NamedGridLayout | undefined;

    private _table: Table | undefined;

    private _gridLayoutSetMultiEvent = new MultiEvent<GridSource.GridLayoutSetEventHandler>();

    constructor(
        private readonly _namedGridLayoutsService: NamedGridLayoutsService,
        private readonly _tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        definition: GridSourceDefinition,
    ) {
        this._tableRecordSourceDefinition = definition.tableRecordSourceDefinition;
        this._gridLayoutOrNamedReferenceDefinition = definition.gridLayoutOrNamedReferenceDefinition;
        this._initialRowOrderDefinition = definition.rowOrderDefinition;
    }

    get lockedTableRecordSource() { return this._lockedTableRecordSource; }
    get lockedGridLayout() { return this._lockedGridLayout; }
    get lockedNamedGridLayout() { return this._lockedNamedGridLayout; }
    get initialRowOrderDefinition() { return this._initialRowOrderDefinition; }

    get table() { return this._table; }

    createDefinition(
        rowOrderDefinition: GridRowOrderDefinition | undefined,
    ): GridSourceDefinition {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();
        const gridLayoutOrNamedReferenceDefinition = this.createGridLayoutOrNamedReferenceDefinition();

        return new GridSourceDefinition(
            tableRecordSourceDefinition,
            gridLayoutOrNamedReferenceDefinition,
            rowOrderDefinition,
        );
    }

    createTableRecordSourceDefinition(): TableRecordSourceDefinition {
        if (this._lockedTableRecordSource === undefined) {
            throw new AssertInternalError('GSCDTR23008');
        } else {
            return this._lockedTableRecordSource.createDefinition();
        }
    }

    createGridLayoutOrNamedReferenceDefinition(): GridLayoutOrNamedReferenceDefinition {
        if (this._lockedNamedGridLayout !== undefined) {
            return new GridLayoutOrNamedReferenceDefinition(this._lockedNamedGridLayout.id);
        } else {
            if (this._lockedGridLayout !== undefined) {
                const gridLayoutDefinition = this._lockedGridLayout.createDefinition();
                return new GridLayoutOrNamedReferenceDefinition(gridLayoutDefinition);
            } else {
                throw new AssertInternalError('GSCGLONRD23008');
            }
        }
    }

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const tableRecordSource = this._tableRecordSourceFactoryService.createFromDefinition(this._tableRecordSourceDefinition);
        const tableRecordSourceLockResult = tableRecordSource.tryLock(locker);
        if (tableRecordSourceLockResult.isErr()) {
            return tableRecordSourceLockResult.createOuter(ErrorCode.GridSource_TryLockTableRecordSource);
        } else {
            this._lockedTableRecordSource = tableRecordSource;
            const lockGridLayoutResult = this.tryLockGridLayout(locker);
            if (lockGridLayoutResult.isErr()) {
                this._lockedTableRecordSource.unlock(locker);
                this._lockedTableRecordSource = undefined;
                return new Err(lockGridLayoutResult.error);
            } else {
                const lockedLayouts = lockGridLayoutResult.value;
                this._lockedGridLayout = lockedLayouts.gridLayout;
                this._lockedNamedGridLayout = lockedLayouts.namedGridLayout;
                return new Ok(undefined)
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
                this.unlockGridLayout(locker);
            }
        }
    }

    openLocked(opener: LockOpenListItem.Opener) {
        this.openLockedGridLayout(opener);

        if (this._lockedTableRecordSource === undefined || this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GSOLT23008');
        } else {
            const tableFieldSourceDefinitionTypeIds = GridSource.getTableFieldSourceDefinitionTypeIdsFromLayout(this._lockedGridLayout);
            this._table = new Table(this._lockedTableRecordSource, tableFieldSourceDefinitionTypeIds);
            this._table.open(opener);
        }
    }

    closeLocked(opener: LockOpenListItem.Opener) {
        if (this._table === undefined) {
            throw new AssertInternalError('GSCLT23008');
        } else {
            this._table.close(opener);
            this._table = undefined;
            this.closeLockedGridLayout(opener);
        }
    }

    /** Can only call if a GridSource is already opened */
    openGridLayoutOrNamedReferenceDefinition(
        definition: GridLayoutOrNamedReferenceDefinition,
        opener: LockOpenListItem.Opener
    ): Result<void> {
        if (this._lockedGridLayout !== undefined) {
            throw new AssertInternalError('GSOGLDL23008')
        } else {
            const lockResult = this.tryCreateAndLockGridLayoutFromDefinition(definition, opener);
            if (lockResult.isErr()) {
                return new Err(lockResult.error);
            } else {
                this.closeLockedGridLayout(opener);
                this.unlockGridLayout(opener);

                this._gridLayoutOrNamedReferenceDefinition = definition;

                const lockedLayouts = lockResult.value;
                const layout = lockedLayouts.gridLayout;
                this._lockedGridLayout = layout;
                this._lockedNamedGridLayout = lockedLayouts.namedGridLayout;

                this.openLockedGridLayout(opener);

                if (this._table === undefined) {
                    throw new AssertInternalError('GSOGLDLT23008')
                } else {
                    const tableFieldSourceDefinitionTypeIds = GridSource.getTableFieldSourceDefinitionTypeIdsFromLayout(layout);
                    this._table.setActiveFieldSources(tableFieldSourceDefinitionTypeIds, true);
                    this.notifyGridLayoutSet();
                    return new Ok(undefined);
                }
            }
        }
    }

    subscribeGridLayoutSetEvent(handler: GridSource.GridLayoutSetEventHandler) {
        return this._gridLayoutSetMultiEvent.subscribe(handler);
    }

    unsubscribeGridLayoutSetEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._gridLayoutSetMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyGridLayoutSet() {
        const handlers = this._gridLayoutSetMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private tryLockGridLayout(locker: LockOpenListItem.Locker): Result<GridSource.LockedGridLayouts> {
        let gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition;
        if (this._gridLayoutOrNamedReferenceDefinition !== undefined) {
            gridLayoutOrNamedReferenceDefinition = this._gridLayoutOrNamedReferenceDefinition;
        } else {
            const gridLayoutDefinition = this._tableRecordSourceDefinition.createDefaultLayoutDefinition();
            gridLayoutOrNamedReferenceDefinition = new GridLayoutOrNamedReferenceDefinition(gridLayoutDefinition);
        }
        return this.tryCreateAndLockGridLayoutFromDefinition(gridLayoutOrNamedReferenceDefinition, locker);
    }

    private tryCreateAndLockGridLayoutFromDefinition(
        gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition,
        locker: LockOpenListItem.Locker
    ): Result<GridSource.LockedGridLayouts> {
        const gridLayoutOrNamedReference = new GridLayoutOrNamedReference(
            this._namedGridLayoutsService,
            gridLayoutOrNamedReferenceDefinition
        );
        const gridLayoutOrNamedReferenceLockResult = gridLayoutOrNamedReference.tryLock(locker);
        if (gridLayoutOrNamedReferenceLockResult.isErr()) {
            return gridLayoutOrNamedReferenceLockResult.createOuter(ErrorCode.GridSource_TryLockGridLayout);
        } else {
            const gridLayout = gridLayoutOrNamedReference.lockedGridLayout;
            if (gridLayout === undefined) {
                throw new AssertInternalError('GSTLGL23008');
            } else {
                const namedGridLayout = gridLayoutOrNamedReference.lockedNamedGridLayout;
                const layouts: GridSource.LockedGridLayouts = {
                    gridLayout,
                    namedGridLayout,
                }
                return new Ok(layouts);
            }
        }
    }

    private unlockGridLayout(locker: LockOpenListItem.Locker) {
        if (this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GSUGL23008')
        } else {
            this._lockedGridLayout.unlock(locker);
            this._lockedGridLayout = undefined;
            this._lockedNamedGridLayout = undefined;
        }
    }

    private openLockedGridLayout(opener: LockOpenListItem.Opener) {
        if (this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GSOLGL23008');
        } else {
            this._lockedGridLayout.openLocked(opener);
        }
    }

    private closeLockedGridLayout(opener: LockOpenListItem.Opener) {
        if (this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GSCLGL23008');
        } else {
            this._lockedGridLayout.closeLocked(opener);
        }
    }
}

export namespace GridSource {
    export type GridLayoutSetEventHandler = (this: void) => void;

    export interface LockedGridLayouts {
        readonly gridLayout: GridLayout;
        readonly namedGridLayout: NamedGridLayout | undefined;
    }

    export function getTableFieldSourceDefinitionTypeIdsFromLayout(layout: GridLayout) {
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

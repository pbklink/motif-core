/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldDefinition } from '../../rev/internal-api';
import { AssertInternalError, Err, ErrorCode, Guid, IndexedRecord, LockOpenListItem, LockOpenManager, MapKey, MultiEvent, Ok, Result, newGuid } from '../../sys/internal-api';
import {
    GridLayoutOrReference,
    ReferenceableGridLayout,
    ReferenceableGridLayoutsService,
    RevGridLayout,
    RevGridLayoutOrReferenceDefinition
} from "../layout/internal-api";
import { RevTableFieldSourceDefinitionFactory, RevTableRecordSource, RevTableRecordSourceDefinition, RevTableRecordSourceFactory, Table } from '../table/internal-api';
import { RevGridRowOrderDefinition, RevGridSourceDefinition } from './definition/internal-api';

/** @public */
export class GridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>
    implements LockOpenListItem<GridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>>, IndexedRecord {

    readonly id: Guid;
    readonly mapKey: MapKey;

    public index: number;

    private readonly _lockOpenManager: LockOpenManager<GridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>>;

    private readonly _tableRecordSourceDefinition: RevTableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>;
    private _gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition | undefined;
    private _initialRowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined;

    private _lockedTableRecordSource: RevTableRecordSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness> | undefined;
    private _lockedGridLayout: RevGridLayout | undefined;
    private _lockedReferenceableGridLayout: ReferenceableGridLayout | undefined;

    private _table: Table<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness> | undefined;

    private _gridLayoutSetMultiEvent = new MultiEvent<GridSource.GridLayoutSetEventHandler>();

    constructor(
        private readonly _referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        private readonly _tableFieldSourceDefinitionFactory: RevTableFieldSourceDefinitionFactory<TableFieldSourceDefinitionTypeId>,
        private readonly _tableRecordSourceFactory: RevTableRecordSourceFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>,
        definition: RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        id?: Guid,
        mapKey?: MapKey,
    ) {
        this.id = id ?? newGuid();
        this.mapKey = mapKey ?? this.id;

        this._lockOpenManager = new LockOpenManager<GridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>>(
            (locker) => this.tryProcessFirstLock(locker),
            (locker) => { this.processLastUnlock(locker); },
            (opener) => { this.processFirstOpen(opener); },
            (opener) => { this.processLastClose(opener); },
        );

        this._tableRecordSourceDefinition = definition.tableRecordSourceDefinition;
        this._gridLayoutOrReferenceDefinition = definition.gridLayoutOrReferenceDefinition;
        this._initialRowOrderDefinition = definition.rowOrderDefinition;
    }

    get lockCount() { return this._lockOpenManager.lockCount; }
    get lockers(): readonly LockOpenListItem.Locker[] { return this._lockOpenManager.lockers; }
    get openCount() { return this._lockOpenManager.openCount; }
    get openers(): readonly LockOpenListItem.Opener[] { return this._lockOpenManager.openers; }

    get lockedTableRecordSource() { return this._lockedTableRecordSource; }
    get lockedGridLayout() { return this._lockedGridLayout; }
    get lockedReferenceableGridLayout() { return this._lockedReferenceableGridLayout; }
    get initialRowOrderDefinition() { return this._initialRowOrderDefinition; }

    get table() { return this._table; }

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        return this._lockOpenManager.tryLock(locker);
    }

    unlock(locker: LockOpenListItem.Locker) {
        this._lockOpenManager.unlock(locker);
    }

    openLocked(opener: LockOpenListItem.Opener) {
        this._lockOpenManager.openLocked(opener);
    }

    closeLocked(opener: LockOpenListItem.Opener) {
        this._lockOpenManager.closeLocked(opener);
    }

    isLocked(ignoreOnlyLocker: LockOpenListItem.Locker | undefined) {
        return this._lockOpenManager.isLocked(ignoreOnlyLocker);
    }

    equals(other: GridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>): boolean {
        return this.mapKey === other.mapKey;
    }

    createDefinition(rowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined): RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();
        const gridLayoutOrReferenceDefinition = this.createGridLayoutOrReferenceDefinition();

        return new RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
            tableRecordSourceDefinition,
            gridLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );
    }

    createTableRecordSourceDefinition(): RevTableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
        if (this._lockedTableRecordSource === undefined) {
            throw new AssertInternalError('GSCDTR23008');
        } else {
            return this._lockedTableRecordSource.createDefinition();
        }
    }

    createGridLayoutOrReferenceDefinition(): RevGridLayoutOrReferenceDefinition {
        if (this._lockedReferenceableGridLayout !== undefined) {
            return new RevGridLayoutOrReferenceDefinition(this._lockedReferenceableGridLayout.id);
        } else {
            if (this._lockedGridLayout !== undefined) {
                const gridLayoutDefinition = this._lockedGridLayout.createDefinition();
                return new RevGridLayoutOrReferenceDefinition(gridLayoutDefinition);
            } else {
                throw new AssertInternalError('GSCGLONRD23008');
            }
        }
    }

    /** Can only call if a GridSource is already opened */
    async tryOpenGridLayoutOrReferenceDefinition(
        definition: RevGridLayoutOrReferenceDefinition,
        opener: LockOpenListItem.Opener
    ): Promise<Result<void>> {
        const lockResult = await this.tryCreateAndLockGridLayoutFromDefinition(definition, opener);
        if (lockResult.isErr()) {
            return new Err(lockResult.error);
        } else {
            this.closeLockedGridLayout(opener);
            this.unlockGridLayout(opener);

            this._gridLayoutOrReferenceDefinition = definition;

            const lockedLayouts = lockResult.value;
            const layout = lockedLayouts.gridLayout;
            this._lockedGridLayout = layout;
            this._lockedReferenceableGridLayout = lockedLayouts.referenceableGridLayout;

            this.openLockedGridLayout(opener);

            if (this._table === undefined) {
                throw new AssertInternalError('GSOGLDLT23008')
            } else {
                const tableFieldSourceDefinitionTypeIds = this.getTableFieldSourceDefinitionTypeIdsFromLayout(layout);
                this._table.setActiveFieldSources(tableFieldSourceDefinitionTypeIds, true);
                this.notifyGridLayoutSet();
                return new Ok(undefined);
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

    private async tryLockGridLayout(locker: LockOpenListItem.Locker): Promise<Result<GridSource.LockedGridLayouts>> {
        let gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition;
        if (this._gridLayoutOrReferenceDefinition !== undefined) {
            gridLayoutOrReferenceDefinition = this._gridLayoutOrReferenceDefinition;
        } else {
            const gridLayoutDefinition = this._tableRecordSourceDefinition.createDefaultLayoutDefinition();
            gridLayoutOrReferenceDefinition = new RevGridLayoutOrReferenceDefinition(gridLayoutDefinition);
        }
        const result = await this.tryCreateAndLockGridLayoutFromDefinition(gridLayoutOrReferenceDefinition, locker);
        return result;
    }

    private async tryCreateAndLockGridLayoutFromDefinition(
        gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition,
        locker: LockOpenListItem.Locker
    ): Promise<Result<GridSource.LockedGridLayouts>> {
        const gridLayoutOrReference = new GridLayoutOrReference(
            this._referenceableGridLayoutsService,
            gridLayoutOrReferenceDefinition
        );
        const gridLayoutOrReferenceLockResult = await gridLayoutOrReference.tryLock(locker);
        if (gridLayoutOrReferenceLockResult.isErr()) {
            return gridLayoutOrReferenceLockResult.createOuter(ErrorCode.GridSource_TryLockGridLayout);
        } else {
            const gridLayout = gridLayoutOrReference.lockedGridLayout;
            if (gridLayout === undefined) {
                throw new AssertInternalError('GSTLGL23008');
            } else {
                const referenceableGridLayout = gridLayoutOrReference.lockedReferenceableGridLayout;
                const layouts: GridSource.LockedGridLayouts = {
                    gridLayout,
                    referenceableGridLayout,
                }
                return new Ok(layouts);
            }
        }
    }

    private async tryProcessFirstLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const tableRecordSource = this._tableRecordSourceFactory.create(this._tableRecordSourceDefinition);
        const tableRecordSourceLockResult = await tableRecordSource.tryLock(locker);
        if (tableRecordSourceLockResult.isErr()) {
            return tableRecordSourceLockResult.createOuter(ErrorCode.GridSource_TryLockTableRecordSource);
        } else {
            this._lockedTableRecordSource = tableRecordSource;
            const lockGridLayoutResult = await this.tryLockGridLayout(locker);
            if (lockGridLayoutResult.isErr()) {
                this._lockedTableRecordSource.unlock(locker);
                this._lockedTableRecordSource = undefined;
                return new Err(lockGridLayoutResult.error);
            } else {
                const lockedLayouts = lockGridLayoutResult.value;
                this._lockedGridLayout = lockedLayouts.gridLayout;
                this._lockedReferenceableGridLayout = lockedLayouts.referenceableGridLayout;
                return new Ok(undefined)
            }
        }
    }

    private processLastUnlock(locker: LockOpenListItem.Locker) {
        if (this._lockedTableRecordSource === undefined) {
            throw new AssertInternalError('GSUT23008');
        } else {
            this._lockedTableRecordSource.unlock(locker);
            this._lockedTableRecordSource.finalise();
            this._lockedTableRecordSource = undefined;

            if (this._lockedGridLayout === undefined) {
                throw new AssertInternalError('GSUL23008');
            } else {
                this.unlockGridLayout(locker);
            }
        }
    }

    private processFirstOpen(opener: LockOpenListItem.Opener) {
        this.openLockedGridLayout(opener);

        if (this._lockedTableRecordSource === undefined || this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GSOLT23008');
        } else {
            const tableFieldSourceDefinitionTypeIds = this.getTableFieldSourceDefinitionTypeIdsFromLayout(this._lockedGridLayout);
            this._table = new Table<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>(
                this._lockedTableRecordSource,
                this._tableRecordSourceFactory.createCorrectnessState(),
                tableFieldSourceDefinitionTypeIds
            );
            this._table.open(opener);
        }
    }

    private processLastClose(opener: LockOpenListItem.Opener) {
        if (this._table === undefined) {
            throw new AssertInternalError('GSCLT23008');
        } else {
            this._table.close(opener);
            this._table = undefined;
            this.closeLockedGridLayout(opener);
        }
    }

    private unlockGridLayout(locker: LockOpenListItem.Locker) {
        if (this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GSUGL23008')
        } else {
            this._lockedGridLayout.unlock(locker);
            this._lockedGridLayout = undefined;
            this._lockedReferenceableGridLayout = undefined;
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

    private getTableFieldSourceDefinitionTypeIdsFromLayout(layout: RevGridLayout) {
        const columns = layout.columns;
        const typeIds = new Array<TableFieldSourceDefinitionTypeId>();
        for (const column of columns) {
            const fieldName = column.fieldName;

            const decomposeResult = RevFieldDefinition.Name.tryDecompose(fieldName);
            if (decomposeResult.isOk()) {
                const decomposedFieldName = decomposeResult.value;
                const sourceName = decomposedFieldName[0];
                const sourceTypeId = this._tableFieldSourceDefinitionFactory.tryNameToId(sourceName);
                if (sourceTypeId !== undefined) {
                    if (!typeIds.includes(sourceTypeId)) {
                        typeIds.push(sourceTypeId);
                    }
                }
            }
        }
        return typeIds;
    }
}

export namespace GridSource {
    export type GridLayoutSetEventHandler = (this: void) => void;

    export interface LockedGridLayouts {
        readonly gridLayout: RevGridLayout;
        readonly referenceableGridLayout: ReferenceableGridLayout | undefined;
    }
}

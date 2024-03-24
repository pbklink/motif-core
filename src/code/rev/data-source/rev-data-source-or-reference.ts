/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, Guid, LockOpenListItem, Ok, Result } from '@xilytix/sysutils';
import { ReferenceableGridLayoutsService } from '../grid-layout/internal-api';
import { RevTableFieldSourceDefinitionFactory, RevTableRecordSourceFactory } from '../table/internal-api';
import { RevDataSourceDefinition, RevDataSourceOrReferenceDefinition, RevGridRowOrderDefinition } from './definition/internal-api';
import { RevDataSource } from './rev-data-source';
import { RevReferenceableDataSource } from './rev-referenceable-data-source';
import { RevReferenceableDataSourcesService } from './rev-referenceable-data-sources-service';

/** @public */
export class RevDataSourceOrReference<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness> {
    private readonly _referenceId: Guid | undefined;
    private readonly _gridSourceDefinition: RevDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> | undefined;

    private _lockedGridSource: RevDataSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness> | undefined;
    private _lockedReferenceableGridSource: RevReferenceableDataSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness> | undefined;

    constructor(
        private readonly _referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        private readonly _tableFieldSourceDefinitionFactory: RevTableFieldSourceDefinitionFactory<TableFieldSourceDefinitionTypeId>,
        private readonly _tableRecordSourceFactory: RevTableRecordSourceFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>,
        private readonly _referenceableGridSourcesService: RevReferenceableDataSourcesService<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>,
        definition: RevDataSourceOrReferenceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>
    ) {
        if (definition.referenceId !== undefined ) {
            this._referenceId = definition.referenceId;
        } else {
            if (definition.gridSourceDefinition !== undefined ) {
                this._gridSourceDefinition = definition.gridSourceDefinition;
            } else {
                throw new AssertInternalError('GSONRC59923');
            }
        }
    }

    get lockedGridSource() { return this._lockedGridSource;}
    get lockedReferenceableGridSource() { return this._lockedReferenceableGridSource;}

    createDefinition(rowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined) {
        if (this._lockedReferenceableGridSource !== undefined) {
            return new RevDataSourceOrReferenceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(this._lockedReferenceableGridSource.id);
        } else {
            if (this.lockedGridSource !== undefined) {
                const gridSourceDefinition = this.lockedGridSource.createDefinition(rowOrderDefinition);
                return new RevDataSourceOrReferenceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(gridSourceDefinition);
            } else {
                throw new AssertInternalError('GSONRCDU59923');
            }
        }
    }

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        if (this._gridSourceDefinition !== undefined) {
            const gridSource = new RevDataSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>(
                this._referenceableGridLayoutsService,
                this._tableFieldSourceDefinitionFactory,
                this._tableRecordSourceFactory,
                this._gridSourceDefinition
            );
            const gridSourceLockResult = await gridSource.tryLock(locker);
            if (gridSourceLockResult.isErr()) {
                return gridSourceLockResult.createOuter(ErrorCode.GridSourceOrReference_LockGridSource);
            } else {
                this._lockedGridSource = gridSource;
                this._lockedReferenceableGridSource = undefined;
                return new Ok(undefined);
            }
        } else {
            if (this._referenceId !== undefined) {
                const lockResult = await this._referenceableGridSourcesService.tryLockItemByKey(this._referenceId, locker);
                if (lockResult.isErr()) {
                    return lockResult.createOuter(ErrorCode.GridSourceOrReference_LockReferenceable);
                } else {
                    const referenceableGridSource = lockResult.value;
                    if (referenceableGridSource === undefined) {
                        return new Err(ErrorCode.GridSourceOrReference_ReferenceableNotFound);
                    } else {
                        this._lockedReferenceableGridSource = referenceableGridSource;
                        this._lockedGridSource = referenceableGridSource;
                        return new Ok(undefined);
                    }
                }
            } else {
                throw new AssertInternalError('GSDONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedReferenceableGridSource !== undefined) {
            this._referenceableGridSourcesService.unlockItem(this._lockedReferenceableGridSource, locker);
            this._lockedReferenceableGridSource = undefined;
        } else {
            if (this._lockedGridSource !== undefined) {
                this._lockedGridSource.unlock(locker);
            } else {
                throw new AssertInternalError('GSDONRUU23366');
            }
        }
        this._lockedGridSource = undefined;
    }
}

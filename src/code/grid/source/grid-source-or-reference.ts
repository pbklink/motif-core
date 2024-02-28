/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { ReferenceableGridLayoutsService } from '../layout/grid-layout-internal-api';
import { TableRecordSourceFactory } from '../table/internal-api';
import { GridRowOrderDefinition, GridSourceDefinition, GridSourceOrReferenceDefinition } from './definition/grid-source-definition-internal-api';
import { GridSource } from './grid-source';
import { ReferenceableGridSource } from './referenceable-grid-source';
import { ReferenceableGridSourcesService } from './referenceable-grid-sources-service';

/** @public */
export class GridSourceOrReference {
    private readonly _referenceId: Guid | undefined;
    private readonly _gridSourceDefinition: GridSourceDefinition | undefined;

    private _lockedGridSource: GridSource | undefined;
    private _lockedReferenceableGridSource: ReferenceableGridSource | undefined;

    constructor(
        private readonly _referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        private readonly _tableRecordSourceFactory: TableRecordSourceFactory,
        private readonly _referenceableGridSourcesService: ReferenceableGridSourcesService,
        definition: GridSourceOrReferenceDefinition
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

    createDefinition(rowOrderDefinition: GridRowOrderDefinition | undefined) {
        if (this._lockedReferenceableGridSource !== undefined) {
            return new GridSourceOrReferenceDefinition(this._lockedReferenceableGridSource.id);
        } else {
            if (this.lockedGridSource !== undefined) {
                const gridSourceDefinition = this.lockedGridSource.createDefinition(rowOrderDefinition);
                return new GridSourceOrReferenceDefinition(gridSourceDefinition);
            } else {
                throw new AssertInternalError('GSONRCDU59923');
            }
        }
    }

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        if (this._gridSourceDefinition !== undefined) {
            const gridSource = new GridSource(
                this._referenceableGridLayoutsService,
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

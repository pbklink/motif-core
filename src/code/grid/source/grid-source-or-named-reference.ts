/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { NamedGridLayoutsService } from '../layout/grid-layout-internal-api';
import { TableRecordSourceFactoryService } from '../table/grid-table-internal-api';
import { GridRowOrderDefinition, GridSourceDefinition, GridSourceOrNamedReferenceDefinition } from './definition/grid-source-definition-internal-api';
import { GridSource } from './grid-source';
import { NamedGridSource } from './named-grid-source';
import { NamedGridSourcesService } from './named-grid-sources-service';

/** @public */
export class GridSourceOrNamedReference {
    private readonly _namedReferenceId: Guid | undefined;
    private readonly _gridSourceDefinition: GridSourceDefinition | undefined;

    private _lockedGridSource: GridSource | undefined;
    private _lockedNamedGridSource: NamedGridSource | undefined;

    constructor(
        private readonly _namedGridLayoutsService: NamedGridLayoutsService,
        private readonly _tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        private readonly _namedGridSourcesService: NamedGridSourcesService,
        definition: GridSourceOrNamedReferenceDefinition
    ) {
        if (definition.namedReferenceId !== undefined ) {
            this._namedReferenceId = definition.namedReferenceId;
        } else {
            if (definition.gridSourceDefinition !== undefined ) {
                this._gridSourceDefinition = definition.gridSourceDefinition;
            } else {
                throw new AssertInternalError('GSONRC59923');
            }
        }
    }

    get lockedGridSource() { return this._lockedGridSource;}
    get lockedNamedGridSource() { return this._lockedNamedGridSource;}

    createDefinition(rowOrderDefinition: GridRowOrderDefinition | undefined) {
        if (this._lockedNamedGridSource !== undefined) {
            return new GridSourceOrNamedReferenceDefinition(this._lockedNamedGridSource.id);
        } else {
            if (this.lockedGridSource !== undefined) {
                const gridSourceDefinition = this.lockedGridSource.createDefinition(rowOrderDefinition);
                return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
            } else {
                throw new AssertInternalError('GSONRCDU59923');
            }
        }
    }

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        if (this._gridSourceDefinition !== undefined) {
            const gridSource = new GridSource(
                this._namedGridLayoutsService,
                this._tableRecordSourceFactoryService,
                this._gridSourceDefinition
            );
            const gridSourceLockResult = gridSource.tryLock(locker);
            if (gridSourceLockResult.isErr()) {
                return gridSourceLockResult.createOuter(ErrorCode.GridSourceOrNamedReference_LockGridSource);
            } else {
                this._lockedGridSource = gridSource;
                this._lockedNamedGridSource = undefined;
                return new Ok(undefined);
            }
        } else {
            if (this._namedReferenceId !== undefined) {
                const namedResult = this._namedGridSourcesService.tryLockItemByKey(this._namedReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.GridSourceOrNamedReference_LockNamedReference);
                } else {
                    const namedGridSource = namedResult.value;
                    if (namedGridSource === undefined) {
                        return new Err(ErrorCode.GridSourceOrNamedReference_NamedNotFound);
                    } else {
                        this._lockedNamedGridSource = namedGridSource;
                        this._lockedGridSource = namedGridSource;
                        return new Ok(undefined);
                    }
                }
            } else {
                throw new AssertInternalError('GSDONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedNamedGridSource !== undefined) {
            this._namedGridSourcesService.unlockItem(this._lockedNamedGridSource, locker);
            this._lockedNamedGridSource = undefined;
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

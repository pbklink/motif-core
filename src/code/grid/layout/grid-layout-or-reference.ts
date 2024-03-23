/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    RevGridLayoutDefinition,
    RevGridLayoutOrReferenceDefinition
} from '../../rev/internal-api';
import { AssertInternalError, Err, ErrorCode, Guid, LockOpenListItem, Ok, Result } from '../../sys/internal-api';
import { GridLayout } from './grid-layout';
import { ReferenceableGridLayout } from './referenceable-grid-layout';
import { ReferenceableGridLayoutsService } from './referenceable-grid-layouts-service';

/** @public */
export class GridLayoutOrReference {
    private readonly _referenceId: Guid | undefined;
    private readonly _gridLayoutDefinition: RevGridLayoutDefinition | undefined;

    private _lockedGridLayout: GridLayout | undefined;
    private _lockedReferenceableGridLayout: ReferenceableGridLayout | undefined;

    constructor(
        private readonly _referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        definition: RevGridLayoutOrReferenceDefinition,
    ) {
        if (definition.referenceId !== undefined) {
            this._referenceId = definition.referenceId;
        } else {
            if (definition.gridLayoutDefinition !== undefined ) {
                this._gridLayoutDefinition = definition.gridLayoutDefinition;
            } else {
                throw new AssertInternalError('GLONRC59923');
            }
        }
    }

    get lockedGridLayout() { return this._lockedGridLayout; }
    get lockedReferenceableGridLayout() { return this._lockedReferenceableGridLayout; }

    createDefinition() {
        if (this._lockedReferenceableGridLayout !== undefined) {
            return new RevGridLayoutOrReferenceDefinition(this._lockedReferenceableGridLayout.id);
        } else {
            if (this.lockedGridLayout !== undefined) {
                const gridSourceDefinition = this.lockedGridLayout.createDefinition();
                return new RevGridLayoutOrReferenceDefinition(gridSourceDefinition);
            } else {
                throw new AssertInternalError('GLONRCDU59923');
            }
        }
    }

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        if (this._gridLayoutDefinition !== undefined) {
            const gridLayout = new GridLayout(this._gridLayoutDefinition);
            const lockResult = await gridLayout.tryLock(locker);
            if (lockResult.isErr()) {
                return lockResult.createOuter(ErrorCode.GridLayoutOrReference_TryLockGridLayoutDefinition);
            } else {
                this._lockedGridLayout = gridLayout;
                this._lockedReferenceableGridLayout = undefined;
                return new Ok(undefined);
            }
        } else {
            if (this._referenceId !== undefined) {
                const lockResult = await this._referenceableGridLayoutsService.tryLockItemByKey(this._referenceId, locker);
                if (lockResult.isErr()) {
                    return lockResult.createOuter(ErrorCode.GridLayoutOrReference_LockReference);
                } else {
                    const referenceableGridLayout = lockResult.value;
                    if (referenceableGridLayout === undefined) {
                        return new Err(ErrorCode.GridLayoutOrReference_ReferenceNotFound);
                    } else {
                        this._lockedReferenceableGridLayout = referenceableGridLayout;
                        this._lockedGridLayout = referenceableGridLayout;
                        return new Ok(undefined);
                    }
                }
            } else {
                throw new AssertInternalError('GLDONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedGridLayout === undefined) {
            throw new AssertInternalError('GLDONRUU23366');
        } else {
            this._lockedGridLayout = undefined;
            if (this._lockedReferenceableGridLayout !== undefined) {
                this._referenceableGridLayoutsService.unlockItem(this._lockedReferenceableGridLayout, locker);
                this._lockedReferenceableGridLayout = undefined;
            }
        }
    }
}

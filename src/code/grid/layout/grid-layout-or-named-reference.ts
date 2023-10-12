/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import {
    GridLayoutDefinition,
    GridLayoutOrNamedReferenceDefinition
} from "./definition/grid-layout-definition-internal-api";
import { GridLayout } from './grid-layout';
import { NamedGridLayout } from './named-grid-layout';
import { NamedGridLayoutsService } from './named-grid-layouts-service';

/** @public */
export class GridLayoutOrNamedReference {
    private readonly _namedReferenceId: Guid | undefined;
    private readonly _gridLayoutDefinition: GridLayoutDefinition | undefined;

    private _lockedGridLayout: GridLayout | undefined;
    private _lockedNamedGridLayout: NamedGridLayout | undefined;

    constructor(
        private readonly _namedGridLayoutsService: NamedGridLayoutsService,
        definition: GridLayoutOrNamedReferenceDefinition,
    ) {
        if (definition.namedReferenceId !== undefined) {
            this._namedReferenceId = definition.namedReferenceId;
        } else {
            if (definition.gridLayoutDefinition !== undefined ) {
                this._gridLayoutDefinition = definition.gridLayoutDefinition;
            } else {
                throw new AssertInternalError('GLONRC59923');
            }
        }
    }

    get lockedGridLayout() { return this._lockedGridLayout; }
    get lockedNamedGridLayout() { return this._lockedNamedGridLayout; }

    createDefinition() {
        if (this._lockedNamedGridLayout !== undefined) {
            return new GridLayoutOrNamedReferenceDefinition(this._lockedNamedGridLayout.id);
        } else {
            if (this.lockedGridLayout !== undefined) {
                const gridSourceDefinition = this.lockedGridLayout.createDefinition();
                return new GridLayoutOrNamedReferenceDefinition(gridSourceDefinition);
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
                return lockResult.createOuter(ErrorCode.GridLayoutOrNamedReference_TryLockGridLayoutDefinition);
            } else {
                this._lockedGridLayout = gridLayout;
                this._lockedNamedGridLayout = undefined;
                return new Ok(undefined);
            }
        } else {
            if (this._namedReferenceId !== undefined) {
                const namedResult = await this._namedGridLayoutsService.tryLockItemByKey(this._namedReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.GridLayoutOrNamedReference_LockNamedReference);
                } else {
                    const namedGridLayout = namedResult.value;
                    if (namedGridLayout === undefined) {
                        return new Err(ErrorCode.GridLayoutOrNamedReference_NamedNotFound);
                    } else {
                        this._lockedNamedGridLayout = namedGridLayout;
                        this._lockedGridLayout = namedGridLayout;
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
            if (this._lockedNamedGridLayout !== undefined) {
                this._namedGridLayoutsService.unlockItem(this._lockedNamedGridLayout, locker);
                this._lockedNamedGridLayout = undefined;
            }
        }
    }
}

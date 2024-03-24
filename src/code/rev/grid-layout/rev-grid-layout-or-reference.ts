// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { AssertInternalError, Err, Guid, LockOpenListItem, Ok, Result } from '@xilytix/sysutils';
import {
    RevGridLayoutDefinition,
    RevGridLayoutOrReferenceDefinition
} from './definition/internal-api';
import { RevGridLayout } from './rev-grid-layout';
import { RevReferenceableGridLayout } from './rev-referenceable-grid-layout';
import { RevReferenceableGridLayoutsService } from './rev-referenceable-grid-layouts-service';

/** @public */
export class RevGridLayoutOrReference {
    private readonly _referenceId: Guid | undefined;
    private readonly _gridLayoutDefinition: RevGridLayoutDefinition | undefined;

    private _lockedGridLayout: RevGridLayout | undefined;
    private _lockedReferenceableGridLayout: RevReferenceableGridLayout | undefined;

    constructor(
        private readonly _referenceableGridLayoutsService: RevReferenceableGridLayoutsService,
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

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void, RevGridLayoutOrReference.LockErrorIdPlusTryError>> {
        if (this._gridLayoutDefinition !== undefined) {
            const gridLayout = new RevGridLayout(this._gridLayoutDefinition);
            const lockResult = await gridLayout.tryLock(locker);
            if (lockResult.isErr()) {
                return new Err({ errorId: RevGridLayoutOrReference.LockErrorId.DefinitionTry, tryError: lockResult.error });
            } else {
                this._lockedGridLayout = gridLayout;
                this._lockedReferenceableGridLayout = undefined;
                return new Ok(undefined);
            }
        } else {
            if (this._referenceId !== undefined) {
                const lockResult = await this._referenceableGridLayoutsService.tryLockItemByKey(this._referenceId, locker);
                if (lockResult.isErr()) {
                    return new Err({ errorId: RevGridLayoutOrReference.LockErrorId.ReferenceTry, tryError: lockResult.error });
                } else {
                    const referenceableGridLayout = lockResult.value;
                    if (referenceableGridLayout === undefined) {
                        return new Err({ errorId: RevGridLayoutOrReference.LockErrorId.ReferenceNotFound, tryError: undefined });
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

export namespace RevGridLayoutOrReference {
    export const enum LockErrorId {
        DefinitionTry,
        ReferenceTry,
        ReferenceNotFound,
    }

    export interface LockErrorIdPlusTryError {
        errorId: LockErrorId,
        tryError: string | undefined;
    }
}

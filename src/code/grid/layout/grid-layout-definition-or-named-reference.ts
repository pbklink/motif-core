/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import {
    GridLayoutDefinition,
    NamedGridLayoutDefinition,
    NamedGridLayoutDefinitionsService
} from "./definition/grid-layout-definition-internal-api";

/** @public */
export class GridLayoutDefinitionOrNamedReference {
    private readonly _namedReferenceId: Guid | undefined;
    private readonly _gridLayoutDefinition: GridLayoutDefinition | undefined;

    private _lockedGridLayoutDefinition: GridLayoutDefinition | undefined;
    private _lockedNamedGridLayoutDefinition: NamedGridLayoutDefinition | undefined;

    get lockedGridLayoutDefinition() { return this._lockedGridLayoutDefinition;}

    constructor(
        private readonly _namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        definitionOrReferenceId: GridLayoutDefinition | Guid
    ) {
        if (typeof definitionOrReferenceId === 'string') {
            this._namedReferenceId = definitionOrReferenceId;
        } else {
            this._gridLayoutDefinition = definitionOrReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this._namedReferenceId !== undefined) {
            element.setString(GridLayoutDefinitionOrNamedReference.JsonName.namedReferenceId, this._namedReferenceId);
        } else {
            if (this._gridLayoutDefinition !== undefined) {
                const gridLayoutDefinitionElement = element.newElement(GridLayoutDefinitionOrNamedReference.JsonName.gridLayoutDefinition);
                this._gridLayoutDefinition.saveToJson(gridLayoutDefinitionElement);
            } else {
                throw new AssertInternalError('GLDONRSTJ34445');
            }
        }
    }

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        if (this._gridLayoutDefinition !== undefined) {
            const gridLayoutDefinition = this._gridLayoutDefinition;
            const lockResult = gridLayoutDefinition.tryLock(locker);
            if (lockResult.isErr()) {
                return lockResult.createOuter(ErrorCode.GridLayoutDefinitionOrNamedReference_TryLockGridLayoutDefinition);
            } else {
                this._lockedGridLayoutDefinition = gridLayoutDefinition;
                return new Ok(undefined);
            }
        } else {
            if (this._namedReferenceId !== undefined) {
                const namedResult = this._namedGridLayoutDefinitionsService.tryLockItemByKey(this._namedReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.GridLayoutDefinitionOrNamedReference_LockNamedReference);
                } else {
                    const namedGridLayoutDefinition = namedResult.value;
                    if (namedGridLayoutDefinition === undefined) {
                        return new Err(ErrorCode.GridLayoutDefinitionOrNamedReference_NamedNotFound);
                    } else {
                        this._lockedNamedGridLayoutDefinition = namedGridLayoutDefinition;
                        this._lockedGridLayoutDefinition = namedGridLayoutDefinition;
                        return new Ok(undefined);
                    }
                }
            } else {
                throw new AssertInternalError('GLDONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedGridLayoutDefinition === undefined) {
            throw new AssertInternalError('GLDONRUU23366');
        } else {
            this._lockedNamedGridLayoutDefinition = undefined;
            if (this._lockedNamedGridLayoutDefinition !== undefined) {
                this._namedGridLayoutDefinitionsService.unlockItem(this._lockedNamedGridLayoutDefinition, locker);
                this._lockedNamedGridLayoutDefinition = undefined;
            }
        }
    }
}

/** @public */
export namespace GridLayoutDefinitionOrNamedReference {
    export namespace JsonName {
        export const namedReferenceId = 'namedReferenceId';
        export const gridLayoutDefinition = 'gridLayoutDefinition';
    }

    export function tryCreateFromJson(
        namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        element: JsonElement
    ): Result<GridLayoutDefinitionOrNamedReference> {
        const namedReferenceIdResult = element.tryGetStringType(JsonName.namedReferenceId);
        if (namedReferenceIdResult.isOk()) {
            const namedReferenceId = namedReferenceIdResult.value;
            const definitionOrNamedReference = new GridLayoutDefinitionOrNamedReference(
                namedGridLayoutDefinitionsService, namedReferenceId
            );
            return new Ok(definitionOrNamedReference);
        } else {
            const definitionElementResult = element.tryGetElementType(JsonName.gridLayoutDefinition);
            if (definitionElementResult.isOk()) {
                const definitionElement = definitionElementResult.value;
                const definitionResult = GridLayoutDefinition.tryCreateFromJson(definitionElement);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.GridLayoutDefinitionOrNamedReference_GridLayoutDefinitionIsInvalid);
                } else {
                    const definitionOrNamedReference = new GridLayoutDefinitionOrNamedReference(
                        namedGridLayoutDefinitionsService, definitionResult.value
                    );
                    return new Ok(definitionOrNamedReference);
                }
            } else {
                return new Err(ErrorCode.GridLayoutDefinitionOrNamedReference_BothDefinitionAndNamedReferenceAreNotSpecified);
            }
        }
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { NamedGridLayoutDefinitionsService } from '../layout/grid-layout-internal-api';
import { TableRecordSourceDefinitionFactoryService } from '../table/grid-table-internal-api';
import { GridSourceDefinition } from './definition/grid-source-definition';
import { NamedGridSourceDefinition, NamedGridSourceDefinitionsService } from './grid-source-internal-api';

/** @public */
export class GridSourceDefinitionOrNamedReference {
    private readonly _namedReferenceId: Guid | undefined;
    private readonly _gridSourceDefinition: GridSourceDefinition | undefined;

    private _lockedGridSourceDefinition: GridSourceDefinition | undefined;
    private _lockedNamedGridSourceDefinition: NamedGridSourceDefinition | undefined;

    get lockedGridSourceDefinition() { return this._lockedGridSourceDefinition;}

    constructor(
        private readonly _namedGridSourceDefinitionsService: NamedGridSourceDefinitionsService,
        definitionOrReferenceId: GridSourceDefinition | Guid
    ) {
        if (typeof definitionOrReferenceId === 'string') {
            this._namedReferenceId = definitionOrReferenceId;
        } else {
            this._gridSourceDefinition = definitionOrReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this._namedReferenceId !== undefined) {
            element.setString(GridSourceDefinitionOrNamedReference.JsonName.namedReferenceId, this._namedReferenceId);
        } else {
            if (this._gridSourceDefinition !== undefined) {
                const gridSourceDefinitionElement = element.newElement(GridSourceDefinitionOrNamedReference.JsonName.gridSourceDefinition);
                this._gridSourceDefinition.saveToJson(gridSourceDefinitionElement);
            } else {
                throw new AssertInternalError('GSDONRSTJ34445');
            }
        }
    }

    tryLock(locker: LockOpenListItem.Locker): Result<GridSourceDefinition> {
        if (this._gridSourceDefinition !== undefined) {
            const gridSourceDefinition = this._gridSourceDefinition;
            const lockResult = gridSourceDefinition.tryLock(locker);
            if (lockResult.isErr()) {
                return lockResult.createOuter(ErrorCode.GridSourceDefinitionOrNamedReference_TryLockGridSourceDefinition);
            } else {
                this._lockedGridSourceDefinition = gridSourceDefinition;
                return new Ok(this._lockedGridSourceDefinition);
            }
        } else {
            if (this._namedReferenceId !== undefined) {
                const namedResult = this._namedGridSourceDefinitionsService.tryLockItemByKey(this._namedReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.GridSourceDefinitionOrNamedReference_LockNamedReference);
                } else {
                    const namedGridSourceDefinition = namedResult.value;
                    if (namedGridSourceDefinition === undefined) {
                        return new Err(ErrorCode.GridSourceDefinitionOrNamedReference_NamedNotFound);
                    } else {
                        this._lockedNamedGridSourceDefinition = namedGridSourceDefinition;
                        this._lockedGridSourceDefinition = namedGridSourceDefinition;
                        return new Ok(namedGridSourceDefinition);
                    }
                }
            } else {
                throw new AssertInternalError('GSDONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedGridSourceDefinition === undefined) {
            throw new AssertInternalError('GSDONRUU23366');
        } else {
            this._lockedNamedGridSourceDefinition = undefined;
            if (this._lockedNamedGridSourceDefinition !== undefined) {
                this._namedGridSourceDefinitionsService.unlockItem(this._lockedNamedGridSourceDefinition, locker);
                this._lockedNamedGridSourceDefinition = undefined;
            }
        }
    }
}

/** @public */
export namespace GridSourceDefinitionOrNamedReference {
    export namespace JsonName {
        export const namedReferenceId = 'namedReferenceId';
        export const gridSourceDefinition = 'gridSourceDefinition';
    }

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        namedGridSourceDefinitionsService: NamedGridSourceDefinitionsService,
        element: JsonElement
    ): Result<GridSourceDefinitionOrNamedReference> {
        const namedReferenceIdResult = element.tryGetStringType(JsonName.namedReferenceId);
        if (namedReferenceIdResult.isOk()) {
            const namedReferenceId = namedReferenceIdResult.value;
            const definitionOrNamedReference = new GridSourceDefinitionOrNamedReference(
                namedGridSourceDefinitionsService, namedReferenceId
            );
            return new Ok(definitionOrNamedReference);
        } else {
            const definitionElementResult = element.tryGetElementType(JsonName.gridSourceDefinition);
            if (definitionElementResult.isOk()) {
                const definitionElement = definitionElementResult.value;
                const definitionResult = GridSourceDefinition.tryCreateFromJson(
                    tableRecordSourceDefinitionFactoryService,
                    namedGridLayoutDefinitionsService,
                    definitionElement
                );
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.GridSourceDefinitionOrNamedReference_GridSourceDefinitionIsInvalid);
                } else {
                    const definitionOrNamedReference = new GridSourceDefinitionOrNamedReference(
                        namedGridSourceDefinitionsService, definitionResult.value
                    );
                    return new Ok(definitionOrNamedReference);
                }
            } else {
                return new Err(ErrorCode.GridSourceDefinitionOrNamedReference_BothDefinitionAndNamedReferenceAreNotSpecified);
            }
        }
    }
}

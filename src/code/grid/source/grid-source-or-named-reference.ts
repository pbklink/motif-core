/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { TableRecordSourceDefinitionFactoryService } from '../table/grid-table-internal-api';
import { GridSourceDefinition, GridSourceOrNamedReferenceDefinition } from './definition/grid-source-definition-internal-api';
import { GridSource } from './grid-source';
import { NamedGridSource } from './named-grid-source';
import { NamedGridSourcesService } from './named-grid-sources-service';

/** @public */
export class GridSourceOrNamedReference {
    private readonly _namedReferenceId: Guid | undefined;
    private readonly _gridSourceDefinition: GridSourceDefinition | undefined;

    private _lockedGridSource: GridSource | undefined;
    private _lockedNamedGridSource: NamedGridSource | undefined;

    get lockedGridSource() { return this._lockedGridSource;}

    constructor(
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

    createDefinition() {
        if (this._lockedNamedGridSource !== undefined) {
            return new GridSourceOrNamedReferenceDefinition(this._lockedNamedGridSource.id);
        } else {
            if (this.lockedGridSource !== undefined) {
                const gridSourceDefinition = this.lockedGridSource.createDefinition();
                return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
            } else {
                throw new AssertInternalError('GSONRCDU59923');
            }
        }
    }

    tryLock(locker: LockOpenListItem.Locker): Result<GridSourceDefinition> {
        if (this._gridSourceDefinition !== undefined) {
            const gridSourceDefinition = this._gridSourceDefinition;
            const gridSourceResult = GridSource.tryCreateFromDefinition(gridSourceDefinition);
            if (gridSourceResult.isErr()) {
                gridSourceResult.createOuter();
            } else {
                const lockResult = gridSourceDefinition.tryLock(locker);
                if (lockResult.isErr()) {
                    return lockResult.createOuter(ErrorCode.GridSourceDefinitionOrNamedReference_TryLockGridSourceDefinition);
                } else {
                    this._lockedGridSource = gridSourceDefinition;
                    return new Ok(this._lockedGridSource);
                }
            }
        } else {
            if (this._namedReferenceId !== undefined) {
                const namedResult = this._namedGridSourcesService.tryLockItemByKey(this._namedReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.GridSourceDefinitionOrNamedReference_LockNamedReference);
                } else {
                    const namedGridSourceDefinition = namedResult.value;
                    if (namedGridSourceDefinition === undefined) {
                        return new Err(ErrorCode.GridSourceDefinitionOrNamedReference_NamedNotFound);
                    } else {
                        this._lockedNamedGridSource = namedGridSourceDefinition;
                        this._lockedGridSource = namedGridSourceDefinition;
                        return new Ok(namedGridSourceDefinition);
                    }
                }
            } else {
                throw new AssertInternalError('GSDONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedGridSource === undefined) {
            throw new AssertInternalError('GSDONRUU23366');
        } else {
            this._lockedNamedGridSource = undefined;
            if (this._lockedNamedGridSource !== undefined) {
                this._namedGridSourcesService.unlockItem(this._lockedNamedGridSource, locker);
                this._lockedNamedGridSource = undefined;
            }
        }
    }
}

/** @public */
export namespace GridSourceOrNamedReference {
    export namespace JsonName {
        export const namedReferenceId = 'namedReferenceId';
        export const gridSourceDefinition = 'gridSourceDefinition';
    }

    export function tryCreateFromDefinition(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        namedGridSourceDefinitionsService: NamedGridSourceDefinitionsService,
        element: JsonElement
    ): Result<GridSourceOrNamedReference> {
        const namedReferenceIdResult = element.tryGetStringType(JsonName.namedReferenceId);
        if (namedReferenceIdResult.isOk()) {
            const namedReferenceId = namedReferenceIdResult.value;
            const definitionOrNamedReference = new GridSourceOrNamedReference(
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
                    const definitionOrNamedReference = new GridSourceOrNamedReference(
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

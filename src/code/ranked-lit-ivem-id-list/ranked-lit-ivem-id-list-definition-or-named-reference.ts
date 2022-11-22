/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../sys/sys-internal-api';
import {
    NamedExplicitRankedLitIvemIdListDefinition, NamedExplicitRankedLitIvemIdListDefinitionsService, RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService
} from './definition/ranked-lit-ivem-id-list-definition-internal-api';

/** @public */
export class RankedLitIvemIdListDefinitionOrNamedReference {
    private readonly _namedExplicitReferenceId: Guid | undefined;
    private readonly _litIvemIdListDefinition: RankedLitIvemIdListDefinition | undefined;

    private _lockedLitIvemIdListDefinition: RankedLitIvemIdListDefinition | undefined;
    private _lockedNamedExplicitLitIvemIdListDefinition: NamedExplicitRankedLitIvemIdListDefinition | undefined;

    get lockedLitIvemIdListDefinition() { return this._lockedLitIvemIdListDefinition;}

    constructor(
        private readonly _namedExplicitLitIvemIdListDefinitionsService: NamedExplicitRankedLitIvemIdListDefinitionsService,
        definitionOrNamedExplicitReferenceId: RankedLitIvemIdListDefinition | Guid
    ) {
        if (typeof definitionOrNamedExplicitReferenceId === 'string') {
            this._namedExplicitReferenceId = definitionOrNamedExplicitReferenceId;
        } else {
            this._litIvemIdListDefinition = definitionOrNamedExplicitReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this._namedExplicitReferenceId !== undefined) {
            element.setString(RankedLitIvemIdListDefinitionOrNamedReference.JsonName.namedReferenceId, this._namedExplicitReferenceId);
            const typeJsonValue = RankedLitIvemIdListDefinition.Type.idToJsonValue(RankedLitIvemIdListDefinition.TypeId.Explicit);
            element.setString(RankedLitIvemIdListDefinitionOrNamedReference.JsonName.namedReferenceId, typeJsonValue);
        } else {
            if (this._litIvemIdListDefinition !== undefined) {
                const litIvemIdListDefinitionElement = element.newElement(
                    RankedLitIvemIdListDefinitionOrNamedReference.JsonName.litIvemIdListDefinition
                );
                this._litIvemIdListDefinition.saveToJson(litIvemIdListDefinitionElement);
            } else {
                throw new AssertInternalError('LIILDONRSTJ34445');
            }
        }
    }

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        if (this._lockedLitIvemIdListDefinition !== undefined) {
            const lockedLitIvemIdDefinition = this._lockedLitIvemIdListDefinition;
            const lockResult = lockedLitIvemIdDefinition.tryLock(locker);
            if (lockResult.isErr()) {
                return lockResult.createOuter(ErrorCode.LitIvemIdListDefinitionOrNamedExplicitReference_TryLockDefinition);
            } else {
                this._lockedLitIvemIdListDefinition = lockedLitIvemIdDefinition;
                return new Ok(undefined);
            }
        } else {
            if (this._namedExplicitReferenceId !== undefined) {
                const namedResult = this._namedExplicitLitIvemIdListDefinitionsService.tryLockItemByKey(this._namedExplicitReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.LitIvemIdListDefinitionOrNamedExplicitReference_TryLockReference);
                } else {
                    const namedExplicitLitIvemIdListDefinition = namedResult.value;
                    if (namedExplicitLitIvemIdListDefinition === undefined) {
                        return new Err(ErrorCode.LitIvemIdListDefinitionOrNamedExplicitReference_NamedExplicitNotFound);
                    } else {
                        this._lockedNamedExplicitLitIvemIdListDefinition = namedExplicitLitIvemIdListDefinition;
                        this._lockedLitIvemIdListDefinition = namedExplicitLitIvemIdListDefinition;
                        return new Ok(undefined);
                    }
                }
            } else {
                throw new AssertInternalError('LILDONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedLitIvemIdListDefinition === undefined) {
            throw new AssertInternalError('LILDONRUU23366');
        } else {
            this._lockedNamedExplicitLitIvemIdListDefinition = undefined;
            if (this._lockedNamedExplicitLitIvemIdListDefinition !== undefined) {
                this._namedExplicitLitIvemIdListDefinitionsService.unlockItem(this._lockedNamedExplicitLitIvemIdListDefinition, locker);
                this._lockedNamedExplicitLitIvemIdListDefinition = undefined;
            }
        }
    }
}

/** @public */
export namespace RankedLitIvemIdListDefinitionOrNamedReference {
    export namespace JsonName {
        export const namedReferenceId = 'namedExplicitReferenceId';
        export const namedReferenceType = 'namedReferenceType';
        export const litIvemIdListDefinition = 'litIvemIdListDefinition';
    }

    export function tryCreateFromJson(
        namedExplicitLitIvemIdListDefinitionsService: NamedExplicitRankedLitIvemIdListDefinitionsService,
        litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<RankedLitIvemIdListDefinitionOrNamedReference> {
        const namedReferenceIdResult = element.tryGetStringType(JsonName.namedReferenceId);
        if (namedReferenceIdResult.isOk()) {
            // for now, assume namedReferenceId is for type Explicit as currently no other types are supported
            const namedExplicitReferenceId = namedReferenceIdResult.value;
            const definitionOrNamedExplicitReference = new RankedLitIvemIdListDefinitionOrNamedReference(
                namedExplicitLitIvemIdListDefinitionsService, namedExplicitReferenceId
            );
            return new Ok(definitionOrNamedExplicitReference);
        } else {
            const definitionElementResult = element.tryGetElementType(JsonName.litIvemIdListDefinition);
            if (definitionElementResult.isOk()) {
                const definitionElement = definitionElementResult.value;
                const definitionResult = litIvemIdListDefinitionFactoryService.tryCreateFromJson(definitionElement);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.LitIvemIdListDefinitionOrNamedExplicitReference_DefinitionJsonIsInvalid);
                } else {
                    const definitionOrNamedReference = new RankedLitIvemIdListDefinitionOrNamedReference(
                        namedExplicitLitIvemIdListDefinitionsService, definitionResult.value
                    );
                    return new Ok(definitionOrNamedReference);
                }
            } else {
                return new Err(ErrorCode.LitIvemIdListDefinitionOrNamedReference_BothDefinitionAndNamedExplicitReferenceNotSpecifiedInJson);
            }
        }
    }
}

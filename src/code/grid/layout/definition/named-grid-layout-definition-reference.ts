/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinitionImplementationOrReference } from './grid-layout-definition-implementation-or-reference';
import { NamedGridLayoutDefinition } from './named-grid-layout-definition';
import { NamedGridLayoutDefinitionsService } from './named-grid-layout-definitions-service';

export class NamedGridLayoutDefinitionReference extends GridLayoutDefinitionImplementationOrReference {
    constructor(
        private readonly _namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        private readonly _referenceId: Guid
    ) {
        super(true);
    }

    tryLock(locker: LockOpenListItem.Locker): Result<NamedGridLayoutDefinition, string> {
        throw new Error('Method not implemented.');
    }
    unlock(locker: LockOpenListItem.Locker): void {
        throw new Error('Method not implemented.');
    }
    override saveToJson(element: JsonElement): void {
        element.setString(NamedGridLayoutDefinitionReference.JsonName.referenceId, this._referenceId);
    }
}

export namespace NamedGridLayoutDefinitionReference {
    export namespace JsonName {
        export const referenceId = 'referenceId';
    }

    export function tryCreateFromJson(
        namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        element: JsonElement
    ): Result<NamedGridLayoutDefinitionReference> {
        const referenceIdResult = element.tryGetStringType(JsonName.referenceId);
        if (referenceIdResult.isErr()) {
            return referenceIdResult.createOuter(ErrorCode.NamedGridLayoutDefinitionReference_TryCreateFromJsonGetReferenceId);
        } else {
            const definitionReference = new NamedGridLayoutDefinitionReference(namedGridLayoutDefinitionsService, referenceIdResult.value);
            return new Ok(definitionReference);
        }
    }
}

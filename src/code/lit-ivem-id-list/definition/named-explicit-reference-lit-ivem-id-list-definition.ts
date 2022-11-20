/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../sys/json-element';
import { LockOpenListItem } from '../../sys/lock-open-list-item';
import { Err, Ok, Result } from '../../sys/result';
import { AssertInternalError, ErrorCode, Guid } from '../../sys/sys-internal-api';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';
import { NamedExplicitLitIvemIdListDefinition } from './named-explicit-lit-ivem-id-list-definition';
import { NamedExplicitLitIvemIdListDefinitionsService } from './named-explicit-lit-ivem-id-list-definitions-service';

export class NamedExplicitReferenceLitIvemIdListDefinition extends LitIvemIdListDefinition {
    private _lockedReferencedDefinition: NamedExplicitLitIvemIdListDefinition | undefined;

    constructor(
        private readonly _namedExplicitLitIvemIdListDefinitionsService: NamedExplicitLitIvemIdListDefinitionsService,
        private readonly _referenceId: Guid
    ) {
        super(LitIvemIdListDefinition.TypeId.NamedExplicitReference);
    }

    override saveToJson(element: JsonElement): void {
        super.saveToJson(element);
        element.setString(NamedExplicitReferenceLitIvemIdListDefinition.JsonName.referenceId, this._referenceId);
    }

    tryLock(locker: LockOpenListItem.Locker): Result<LitIvemIdListDefinition> {
        const lockItemResult = this._namedExplicitLitIvemIdListDefinitionsService.tryLockItemByKey(this._referenceId, locker);
        if (lockItemResult.isErr()) {
            return lockItemResult.createOuter(ErrorCode.NamedExplicitReferenceLitIvemIdListDefinition_LockReferencedItem);
        } else {
            const referencedDefinition = lockItemResult.value;
            if (referencedDefinition === undefined) {
                return new Err(ErrorCode.NamedExplicitReferenceLitIvemIdListDefinition_ReferencedNotFound);
            } else {
                this._lockedReferencedDefinition = referencedDefinition;
                return new Ok(referencedDefinition);
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker): void {
        if (this._lockedReferencedDefinition === undefined) {
            throw new AssertInternalError('NERLIILDU67743');
        } else {
            this._namedExplicitLitIvemIdListDefinitionsService.unlockItem(this._lockedReferencedDefinition, locker);
        }
    }
}

export namespace NamedExplicitReferenceLitIvemIdListDefinition {
    export namespace JsonName {
        export const referenceId = 'referenceId';
    }

    export function tryCreateFromJson(
        element: JsonElement,
        namedExplicitLitIvemIdListDefinitionsService: NamedExplicitLitIvemIdListDefinitionsService,
    ): Result<NamedExplicitReferenceLitIvemIdListDefinition> {
        const referenceIdResult = element.tryGetStringType(JsonName.referenceId);
        if (referenceIdResult.isErr()) {
            return referenceIdResult.createOuter(ErrorCode.NamedExplicitReferenceLitIvemIdListDefinition_TryCreateFromJsonGetReferenceId);
        } else {
            const referenceId = referenceIdResult.value;
            if (referenceId.length === 0) {
                return new Err(ErrorCode.NamedExplicitReferenceLitIvemIdListDefinition_TryCreateFromJsonZeroLengthReferenceId);
            } else {
                const definition = new NamedExplicitReferenceLitIvemIdListDefinition(namedExplicitLitIvemIdListDefinitionsService, referenceId);
                return new Ok(definition);
            }
        }
    }
}

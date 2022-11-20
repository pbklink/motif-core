/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { Err, ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { IdLitIvemIdListDefinition } from './id-lit-ivem-id-list-definition';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

export class ExplicitLitIvemIdListDefinition extends IdLitIvemIdListDefinition {
    constructor(
        id: Guid,
        readonly litIvemIds: readonly LitIvemId[],
    ) {
        super(LitIvemIdListDefinition.TypeId.Explicit, id);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementArray = LitIvemId.createJsonElementArray(this.litIvemIds);
        element.setElementArray(ExplicitLitIvemIdListDefinition.JsonName.litIvemIds, elementArray);
    }

    tryLock(_locker: LockOpenListItem.Locker): Result<LitIvemIdListDefinition> {
        return new Ok(this);
    }

    unlock(_locker: LockOpenListItem.Locker) {
        // nothing to do
    }
}

export namespace ExplicitLitIvemIdListDefinition {
    export namespace JsonName {
        export const litIvemIds = 'litIvemIds';
    }

    export function tryCreateFromJson(element: JsonElement): Result<ExplicitLitIvemIdListDefinition> {
        const idResult = IdLitIvemIdListDefinition.tryGetIdFromJson(element);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.ExplicitLitIvemIdListDefinition_IdResult);
        } else {
            const elementArrayResult = element.tryGetElementArray(JsonName.litIvemIds);
            if (elementArrayResult.isErr()) {
                const error = elementArrayResult.error;
                if (error === JsonElement.arrayErrorCode_NotSpecified) {
                    return new Err(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdsNotSpecified);
                } else {
                    return new Err(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdsIsInvalid);
                }
            } else {
                const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
                if (litIvemIdsResult.isErr()) {
                    return litIvemIdsResult.createOuter(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdIsInvalid);
                } else {
                    const definition = new ExplicitLitIvemIdListDefinition(idResult.value, litIvemIdsResult.value);
                    return new Ok(definition);
                }
            }
        }
    }
}

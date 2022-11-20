/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, Result } from '../../sys/sys-internal-api';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

export abstract class IdLitIvemIdListDefinition extends LitIvemIdListDefinition {
    constructor(typeId: LitIvemIdListDefinition.TypeId, readonly id: Guid) {
        super(typeId)
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(IdLitIvemIdListDefinition.idJsonName, this.id);
    }
}

export namespace IdLitIvemIdListDefinition {
    export const idJsonName = 'id'

    export function tryGetIdFromJson(element: JsonElement): Result<Guid> {
        const idResult = element.tryGetGuidType(idJsonName);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.IdLitIvemIdListDefinition_TryGetIdFromJson);
        } else {
            return idResult;
        }
    }
}

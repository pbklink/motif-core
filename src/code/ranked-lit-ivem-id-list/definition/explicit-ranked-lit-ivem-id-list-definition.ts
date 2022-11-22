/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { Err, ErrorCode, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

export class ExplicitRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    litIvemIds: readonly LitIvemId[];

    constructor(initialLitIvemIds?: readonly LitIvemId[]) {
        super(RankedLitIvemIdListDefinition.TypeId.Explicit);

        if (initialLitIvemIds === undefined) {
            this.litIvemIds = [];
        } else {
            this.litIvemIds = initialLitIvemIds;
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementArray = LitIvemId.createJsonElementArray(this.litIvemIds);
        element.setElementArray(ExplicitRankedLitIvemIdListDefinition.litIvemIdsJsonName, elementArray);
    }

    override tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined);
    }

    override unlock(_locker: LockOpenListItem.Locker) {
        // nothing to do
    }

    setLitIvemIds(value: readonly LitIvemId[]) {
        this.litIvemIds = value;
    }
}

export namespace ExplicitRankedLitIvemIdListDefinition {
    export const litIvemIdsJsonName = 'litIvemIds';

    export function tryCreateFromJson(element: JsonElement): Result<ExplicitRankedLitIvemIdListDefinition> {
        const litIvemIdsResult = tryCreateLitIvemIdsFromJson(element);
        if (litIvemIdsResult.isErr()) {
            return litIvemIdsResult.createOuter(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdIsInvalid);
        } else {
            const definition = new ExplicitRankedLitIvemIdListDefinition(litIvemIdsResult.value);
            return new Ok(definition);
        }
    }

    export function tryCreateLitIvemIdsFromJson(element: JsonElement): Result<LitIvemId[]> {
        const elementArrayResult = element.tryGetElementArray(litIvemIdsJsonName);
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
                return new Ok(litIvemIdsResult.value);
            }
        }
    }
}

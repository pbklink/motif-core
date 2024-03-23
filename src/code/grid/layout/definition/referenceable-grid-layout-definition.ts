/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableGridLayoutDefinition } from '../../../rev/internal-api';
import { Err, ErrorCode, Integer, JsonElement, Ok, Result } from '../../../sys/internal-api';

export namespace ReferenceableGridLayoutDefinition {
    export function tryCreateReferenceableFromJson(
        element: JsonElement,
        initialIndex: Integer,
    ): Result<RevReferenceableGridLayoutDefinition> {
        const createResult = RevReferenceableGridLayoutDefinition.tryCreateReferenceableFromJson(element, initialIndex);
        if (createResult.isErr()) {
            const errorIds = createResult.error;
            return new Err(`${ErrorCode.ReferenceableGridLayoutDefinition_TryCreateReferenceableFromJson}: (${errorIds.errorId}, ${errorIds.jsonElementErrorId})`);
        } else {
            return new Ok(createResult.value);
        }
    }
}

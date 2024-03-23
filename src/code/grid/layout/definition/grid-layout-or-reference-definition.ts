/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutOrReferenceDefinition } from '../../../rev/internal-api';
import { Err, ErrorCode, JsonElement, Ok, Result } from '../../../sys/internal-api';

/** @public */
export namespace GridLayoutOrReferenceDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<RevGridLayoutOrReferenceDefinition> {
        const createResult = RevGridLayoutOrReferenceDefinition.tryCreateFromJson(element);
        if (createResult.isErr()) {
            const errorIds = createResult.error;
            return new Err(`${ErrorCode.GridLayoutDefinitionOrReference_TryCreateFromJson}: (${errorIds.errorId}, ${errorIds.jsonElementErrorId})`);
        } else {
            return new Ok(createResult.value);
        }
    }
}

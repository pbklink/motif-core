/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutDefinition } from '../../../rev/internal-api';
import { BidAskPair, Err, ErrorCode, JsonElement, Ok, Result } from '../../../sys/internal-api';

/** @public */
export namespace GridLayoutDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<RevGridLayoutDefinition> {
        const createResult = RevGridLayoutDefinition.tryCreateFromJson(element);
        if (createResult.isErr()) {
            const errorIds = createResult.error;
            return new Err(`${ErrorCode.GridLayoutDefinition_TryCreateFromJson}: (${errorIds.errorId}, ${errorIds.jsonElementErrorId})`);
        } else {
            return new Ok(createResult.value);
        }
    }
}

export type BidAskGridLayoutDefinitions = BidAskPair<RevGridLayoutDefinition>;

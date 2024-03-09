/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, JsonElementErr, Ok, Result } from '../../sys/internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class WatchmakerListIdRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(readonly watchmakerListId: string) {
        super(RankedLitIvemIdListDefinition.TypeId.WatchmakerListId);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(WatchmakerListIdRankedLitIvemIdListDefinition.JsonName.watchmakerListId, this.watchmakerListId);
    }
}

/** @public */
export namespace  WatchmakerListIdRankedLitIvemIdListDefinition {
    export namespace JsonName {
        export const watchmakerListId = 'watchmakerListId';
    }

    export function tryCreateFromJson(element: JsonElement): Result<WatchmakerListIdRankedLitIvemIdListDefinition> {
        const watchlistIdResult = element.tryGetString(JsonName.watchmakerListId);
        if (watchlistIdResult.isErr()) {
            return JsonElementErr.createOuter(watchlistIdResult.error, ErrorCode.WatchmakerListIdRankedLitIvemIdListDefinition_WatchmakerListIdIsInvalid);
        } else {
            const definition = new WatchmakerListIdRankedLitIvemIdListDefinition(watchlistIdResult.value);
            return new Ok(definition);
        }
    }
}

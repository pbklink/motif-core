/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class WatchmakerRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(readonly watchlistId: Guid) {
        super(RankedLitIvemIdListDefinition.TypeId.Watchmaker);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(WatchmakerRankedLitIvemIdListDefinition.JsonName.watchlistId, this.watchlistId);
    }
}

/** @public */
export namespace  WatchmakerRankedLitIvemIdListDefinition {
    export namespace JsonName {
        export const watchlistId = 'watchlistId';
    }

    export function tryCreateFromJson(element: JsonElement): Result<WatchmakerRankedLitIvemIdListDefinition> {
        const watchlistIdResult = element.tryGetString(JsonName.watchlistId);
        if (watchlistIdResult.isErr()) {
            return watchlistIdResult.createOuter(ErrorCode.WatchmakerLitIvemIdListDefinition_WatchlistId);
        } else {
            const definition = new WatchmakerRankedLitIvemIdListDefinition(watchlistIdResult.value);
            return new Ok(definition);
        }
    }
}

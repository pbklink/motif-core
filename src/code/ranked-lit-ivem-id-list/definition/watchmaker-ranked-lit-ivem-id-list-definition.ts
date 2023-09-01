/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class WatchmakerRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(id: Guid, readonly watchlistId: Guid) {
        super(id, RankedLitIvemIdListDefinition.TypeId.Watchmaker);
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
        const idResult = RankedLitIvemIdListDefinition.tryGetIdFromJson(element);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.WatchmakerLitIvemIdListDefinition_IdIsInvalid);
        } else {
            const watchlistIdResult = element.tryGetString(JsonName.watchlistId);
            if (watchlistIdResult.isErr()) {
                return watchlistIdResult.createOuter(ErrorCode.WatchmakerLitIvemIdListDefinition_WatchlistIdIsInvalid);
            } else {
                const definition = new WatchmakerRankedLitIvemIdListDefinition(idResult.value, watchlistIdResult.value);
                return new Ok(definition);
            }
        }
    }
}

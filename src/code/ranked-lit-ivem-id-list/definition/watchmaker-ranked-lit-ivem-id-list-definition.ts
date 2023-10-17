/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class WatchmakerRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(readonly watchmakerListId: string) {
        super(RankedLitIvemIdListDefinition.TypeId.Watchmaker);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(WatchmakerRankedLitIvemIdListDefinition.JsonName.watchmakerListId, this.watchmakerListId);
    }
}

/** @public */
export namespace  WatchmakerRankedLitIvemIdListDefinition {
    export namespace JsonName {
        export const watchmakerListId = 'watchmakerListId';
    }

    export function tryCreateFromJson(element: JsonElement): Result<WatchmakerRankedLitIvemIdListDefinition> {
        const watchlistIdResult = element.tryGetString(JsonName.watchmakerListId);
        if (watchlistIdResult.isErr()) {
            return watchlistIdResult.createOuter(ErrorCode.WatchmakerLitIvemIdListDefinition_WatchmakerListIdIsInvalid);
        } else {
            const definition = new WatchmakerRankedLitIvemIdListDefinition(watchlistIdResult.value);
            return new Ok(definition);
        }
    }
}

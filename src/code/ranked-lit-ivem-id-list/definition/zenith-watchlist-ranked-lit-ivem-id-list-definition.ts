/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class ZenithWatchlistRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(
        readonly watchlistId: Guid
    ) {
        super(RankedLitIvemIdListDefinition.TypeId.ZenithWatchlist);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(ZenithWatchlistRankedLitIvemIdListDefinition.JsonName.watchlistId, this.watchlistId);
    }

    override tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        // lock zenithwatchlist
        return new Ok(undefined);
    }

    override unlock(locker: LockOpenListItem.Locker) {
        // Need to unlock zenithwatchlist
    }
}

/** @public */
export namespace  ZenithWatchlistRankedLitIvemIdListDefinition {
    export namespace JsonName {
        export const watchlistId = 'watchlistId';
    }

    export function tryCreateFromJson(
        element: JsonElement
    ): Result<ZenithWatchlistRankedLitIvemIdListDefinition> {
        const watchlistIdResult = element.tryGetStringType(JsonName.watchlistId);
        if (watchlistIdResult.isErr()) {
            return watchlistIdResult.createOuter(ErrorCode.ZenithWatchlistLitIvemIdListDefinition_WatchlistId);
        } else {
            const definition = new ZenithWatchlistRankedLitIvemIdListDefinition(watchlistIdResult.value);
            return new Ok(definition);
        }
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { IdLitIvemIdListDefinition } from './id-lit-ivem-id-list-definition';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

/** @public */
export class ZenithWatchlistLitIvemIdListDefinition extends IdLitIvemIdListDefinition {
    constructor(
        id: Guid,
        readonly watchlistId: Guid
    ) {
        super(LitIvemIdListDefinition.TypeId.ZenithWatchlist, id);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(ZenithWatchlistLitIvemIdListDefinition.JsonName.watchlistId, this.watchlistId);
    }

    tryLock(_locker: LockOpenListItem.Locker): Result<LitIvemIdListDefinition> {
        // lock zenithwatchlist
        return new Ok(this);
    }

    unlock(locker: LockOpenListItem.Locker) {
        // Need to unlock zenithwatchlist
    }
}

/** @public */
export namespace  ZenithWatchlistLitIvemIdListDefinition {
    export namespace JsonName {
        export const watchlistId = 'watchlistId';
    }

    export function tryCreateFromJson(
        element: JsonElement
    ): Result<ZenithWatchlistLitIvemIdListDefinition> {
        const idResult = IdLitIvemIdListDefinition.tryGetIdFromJson(element);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.ZenithWatchlistLitIvemIdListDefinition_Id);
        } else {
            const watchlistIdResult = element.tryGetStringType(JsonName.watchlistId);
            if (watchlistIdResult.isErr()) {
                return watchlistIdResult.createOuter(ErrorCode.ZenithWatchlistLitIvemIdListDefinition_WatchlistId);
            } else {
                const definition = new ZenithWatchlistLitIvemIdListDefinition(idResult.value, watchlistIdResult.value);
                return new Ok(definition);
            }
        }
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScansService } from '../../scan/scans-service';
import { Err, ErrorCode, JsonElement, Result } from '../../sys/sys-internal-api';
import { ExplicitRankedLitIvemIdListDefinition } from './explicit-ranked-lit-ivem-id-list-definition';
import { NamedExplicitRankedLitIvemIdListDefinitionsService } from './named-explicit-ranked-lit-ivem-id-list-definitions-service';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';
import { ScanMatchesRankedLitIvemIdListDefinition } from './scan-matches-ranked-lit-ivem-id-list-definition';
import { ZenithWatchlistRankedLitIvemIdListDefinition } from './zenith-watchlist-ranked-lit-ivem-id-list-definition';

export class RankedLitIvemIdListDefinitionFactoryService {
    constructor(
        private readonly _scansService: ScansService,
        private readonly _namedExplicitLitIvemIdListDefinitionsService: NamedExplicitRankedLitIvemIdListDefinitionsService,
    ) {
    }
    tryCreateFromJson(element: JsonElement): Result<RankedLitIvemIdListDefinition> {
        const typeIdJsonValueResult = RankedLitIvemIdListDefinition.tryGetTypeIdFromJson(element);
        if (typeIdJsonValueResult.isErr()) {
            return typeIdJsonValueResult.createOuter(ErrorCode.LitIvemIdListDefinitionFactoryService_GetTypeId);
        } else {
            const typeIdJsonValue = typeIdJsonValueResult.value;
            return this.tryCreateFromTypedJson(element, typeIdJsonValue);
        }
    }

    private tryCreateFromTypedJson(element: JsonElement, typeId: RankedLitIvemIdListDefinition.TypeId): Result<RankedLitIvemIdListDefinition> {
        switch (typeId) {
            case RankedLitIvemIdListDefinition.TypeId.Explicit: return ExplicitRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            case RankedLitIvemIdListDefinition.TypeId.ScanMatches: return ScanMatchesRankedLitIvemIdListDefinition.tryCreateFromJson(this._scansService, element);
            case RankedLitIvemIdListDefinition.TypeId.ZenithWatchlist: return ZenithWatchlistRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            default:
                const neverTypeId: never = typeId;
                return new Err(`${ErrorCode.LitIvemIdListDefinitionFactoryService_UnsupportedTypeId} (${neverTypeId})`);
        }
    }
}

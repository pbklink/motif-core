/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScansService } from '../../scan/scans-service';
import { Err, ErrorCode, JsonElement, Result } from '../../sys/sys-internal-api';
import { ExplicitLitIvemIdListDefinition } from './explicit-lit-ivem-id-list-definition';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';
import { NamedExplicitLitIvemIdListDefinitionsService } from './named-explicit-lit-ivem-id-list-definitions-service';
import { NamedExplicitReferenceLitIvemIdListDefinition } from './named-explicit-reference-lit-ivem-id-list-definition';
import { ScanMatchesLitIvemIdListDefinition } from './scan-matches-lit-ivem-id-list-definition';
import { ZenithWatchlistLitIvemIdListDefinition } from './zenith-watchlist-lit-ivem-id-list-definition';

export class LitIvemIdListDefinitionFactoryService {
    constructor(
        private readonly _scansService: ScansService,
        private readonly _namedExplicitLitIvemIdListDefinitionsService: NamedExplicitLitIvemIdListDefinitionsService,
    ) {
    }
    tryCreateFromJson(element: JsonElement): Result<LitIvemIdListDefinition> {
        const typeIdJsonValueResult = LitIvemIdListDefinition.tryGetTypeIdFromJson(element);
        if (typeIdJsonValueResult.isErr()) {
            return typeIdJsonValueResult.createOuter(ErrorCode.LitIvemIdListDefinitionFactoryService_GetTypeId);
        } else {
            const typeIdJsonValue = typeIdJsonValueResult.value;
            return this.tryCreateFromTypedJson(element, typeIdJsonValue);
        }
    }

    private tryCreateFromTypedJson(element: JsonElement, typeId: LitIvemIdListDefinition.TypeId): Result<LitIvemIdListDefinition> {
        switch (typeId) {
            case LitIvemIdListDefinition.TypeId.Explicit: return ExplicitLitIvemIdListDefinition.tryCreateFromJson(element);
            case LitIvemIdListDefinition.TypeId.NamedExplicitReference:
                return NamedExplicitReferenceLitIvemIdListDefinition.tryCreateFromJson(
                    element,
                    this._namedExplicitLitIvemIdListDefinitionsService,
                );
            case LitIvemIdListDefinition.TypeId.ScanMatches: return ScanMatchesLitIvemIdListDefinition.tryCreateFromJson(this._scansService, element);
            case LitIvemIdListDefinition.TypeId.ZenithWatchlist: return ZenithWatchlistLitIvemIdListDefinition.tryCreateFromJson(element);
            default:
                const neverTypeId: never = typeId;
                return new Err(`${ErrorCode.LitIvemIdListDefinitionFactoryService_UnsupportedTypeId} (${neverTypeId})`);
        }
    }
}

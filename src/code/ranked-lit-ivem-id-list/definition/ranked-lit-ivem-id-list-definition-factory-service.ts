/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, ErrorCode, Integer, JsonElement, Result } from '../../sys/sys-internal-api';
import { JsonRankedLitIvemIdListDefinition } from './json-ranked-lit-ivem-id-list-definition';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';
import { ScanRankedLitIvemIdListDefinition } from './scan-ranked-lit-ivem-id-list-definition';
import { WatchmakerRankedLitIvemIdListDefinition } from './watchmaker-ranked-lit-ivem-id-list-definition';

/** @public */
export class RankedLitIvemIdListDefinitionFactoryService {
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
            case RankedLitIvemIdListDefinition.TypeId.Json: return JsonRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            case RankedLitIvemIdListDefinition.TypeId.ScanMatches: return ScanRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            case RankedLitIvemIdListDefinition.TypeId.Watchmaker: return WatchmakerRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            default: {
                const neverTypeId: never = typeId;
                return new Err(`${ErrorCode.LitIvemIdListDefinitionFactoryService_UnsupportedTypeId} (${neverTypeId as Integer})`);
            }
        }
    }
}

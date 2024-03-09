/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, ErrorCode, Integer, JsonElement, Result } from '../../sys/internal-api';
import { LitIvemIdArrayRankedLitIvemIdListDefinition } from './lit-ivem-id-array-ranked-lit-ivem-id-list-definition';
import { LitIvemIdExecuteScanRankedLitIvemIdListDefinition } from './lit-ivem-id-execute-scan-ranked-lit-ivem-id-list-definition';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';
import { ScanIdRankedLitIvemIdListDefinition } from './scan-id-ranked-lit-ivem-id-list-definition';
import { WatchmakerListIdRankedLitIvemIdListDefinition } from './watchmaker-list-id-ranked-lit-ivem-id-list-definition';

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
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray: return LitIvemIdArrayRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            case RankedLitIvemIdListDefinition.TypeId.WatchmakerListId: return WatchmakerListIdRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            case RankedLitIvemIdListDefinition.TypeId.ScanId: return ScanIdRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan: return LitIvemIdExecuteScanRankedLitIvemIdListDefinition.tryCreateFromJson(element);
            default: {
                const neverTypeId: never = typeId;
                return new Err(`${ErrorCode.LitIvemIdListDefinitionFactoryService_UnsupportedTypeId} (${neverTypeId as Integer})`);
            }
        }
    }
}

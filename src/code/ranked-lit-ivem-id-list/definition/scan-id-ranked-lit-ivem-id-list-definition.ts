/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, JsonElementErr, Ok, Result } from '../../sys/internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class ScanIdRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(readonly scanId: Guid,) {
        super(RankedLitIvemIdListDefinition.TypeId.ScanId);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(ScanIdRankedLitIvemIdListDefinition.JsonName.scanId, this.scanId);
    }
}

/** @public */
export namespace ScanIdRankedLitIvemIdListDefinition {
    export namespace JsonName {
        export const scanId = 'scanId';
    }

    export function tryCreateFromJson(element: JsonElement): Result<ScanIdRankedLitIvemIdListDefinition> {
        const scanIdResult = element.tryGetString(JsonName.scanId);
        if (scanIdResult.isErr()) {
            return JsonElementErr.createOuter(scanIdResult.error, ErrorCode.ScanIdRankedLitIvemIdListDefinition_ScanIdIsInvalid);
        } else {
            const definition = new ScanIdRankedLitIvemIdListDefinition(scanIdResult.value);
            return new Ok(definition);
        }
    }
}

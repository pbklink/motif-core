/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class ScanMatchesRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(readonly scanId: Guid,) {
        super(RankedLitIvemIdListDefinition.TypeId.ScanMatches);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setString(ScanMatchesRankedLitIvemIdListDefinition.JsonName.scanId, this.scanId);
    }
}

/** @public */
export namespace ScanMatchesRankedLitIvemIdListDefinition {
    export namespace JsonName {
        export const scanId = 'scanId';
    }

    export function tryCreateFromJson(element: JsonElement): Result<ScanMatchesRankedLitIvemIdListDefinition> {
        const scanIdResult = element.tryGetString(JsonName.scanId);
        if (scanIdResult.isErr()) {
            return scanIdResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_ScanIdIsInvalid);
        } else {
            const definition = new ScanMatchesRankedLitIvemIdListDefinition(scanIdResult.value);
            return new Ok(definition);
        }
    }
}

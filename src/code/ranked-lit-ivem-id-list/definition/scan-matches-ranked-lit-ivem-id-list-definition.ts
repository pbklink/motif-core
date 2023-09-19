/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

/** @public */
export class ScanMatchesRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(id: Guid, readonly scanId: Guid,) {
        super(id, RankedLitIvemIdListDefinition.TypeId.ScanMatches);
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
        const idResult = RankedLitIvemIdListDefinition.tryGetIdFromJson(element);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_IdIsInvalid);
        } else {
            const scanIdResult = element.tryGetString(JsonName.scanId);
            if (scanIdResult.isErr()) {
                return scanIdResult.createOuter(ErrorCode.ScanMatchesLitIvemIdListDefinition_ScanIdIsInvalid);
            } else {
                const definition = new ScanMatchesRankedLitIvemIdListDefinition(idResult.value, scanIdResult.value);
                return new Ok(definition);
            }
        }
    }
}

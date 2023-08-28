/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { Err, ErrorCode, JsonElement, Ok, Result } from "../../sys/sys-internal-api";
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

export class JsonRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(readonly litIvemIds: readonly LitIvemId[]) {
        super(RankedLitIvemIdListDefinition.TypeId.Explicit);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementArray = LitIvemId.createJsonElementArray(this.litIvemIds);
        element.setElementArray(JsonRankedLitIvemIdListDefinition.litIvemIdsJsonName, elementArray);
    }
}

export namespace JsonRankedLitIvemIdListDefinition {
    export const litIvemIdsJsonName = 'litIvemIds';

    export function tryCreateFromJson(element: JsonElement): Result<JsonRankedLitIvemIdListDefinition> {
        const litIvemIdsResult = tryCreateLitIvemIdsFromJson(element);
        if (litIvemIdsResult.isErr()) {
            return litIvemIdsResult.createOuter(ErrorCode.JsonRankedLitIvemIdListDefinition_JsonLitIvemIdIsInvalid);
        } else {
            const definition = new JsonRankedLitIvemIdListDefinition(litIvemIdsResult.value);
            return new Ok(definition);
        }
    }

    export function tryCreateLitIvemIdsFromJson(element: JsonElement): Result<LitIvemId[]> {
        const elementArrayResult = element.tryGetElementArray(litIvemIdsJsonName);
        if (elementArrayResult.isErr()) {
            const error = elementArrayResult.error;
            if (error === JsonElement.arrayErrorCode_NotSpecified) {
                return new Err(ErrorCode.JsonRankedLitIvemIdListDefinition_JsonLitIvemIdsNotSpecified);
            } else {
                return new Err(ErrorCode.JsonRankedLitIvemIdListDefinition_JsonLitIvemIdsIsInvalid);
            }
        } else {
            const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
            if (litIvemIdsResult.isErr()) {
                return litIvemIdsResult.createOuter(ErrorCode.JsonRankedLitIvemIdListDefinition_JsonLitIvemIdArrayIsInvalid);
            } else {
                return new Ok(litIvemIdsResult.value);
            }
        }
    }
}

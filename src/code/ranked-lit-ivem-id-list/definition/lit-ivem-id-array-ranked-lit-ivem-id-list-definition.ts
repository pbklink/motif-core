/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { Err, ErrorCode, JsonElement, Ok, Result } from "../../sys/sys-internal-api";
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

export class LitIvemIdArrayRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    constructor(
        readonly name: string,
        readonly description: string,
        readonly category: string,
        readonly litIvemIds: readonly LitIvemId[]
    ) {
        super(RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementArray = LitIvemId.createJsonElementArray(this.litIvemIds);
        element.setElementArray(LitIvemIdArrayRankedLitIvemIdListDefinition.litIvemIdsJsonName, elementArray);
    }
}

export namespace LitIvemIdArrayRankedLitIvemIdListDefinition {
    export const nameJsonName = 'name';
    export const descriptionJsonName = 'description';
    export const categoryJsonName = 'category';
    export const litIvemIdsJsonName = 'litIvemIds';

    export function tryCreateFromJson(element: JsonElement): Result<LitIvemIdArrayRankedLitIvemIdListDefinition> {
        const litIvemIdsResult = tryCreateLitIvemIdsFromJson(element);
        if (litIvemIdsResult.isErr()) {
            return litIvemIdsResult.createOuter(ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonIsInvalid);
        } else {
            const name = element.getString(nameJsonName, '');
            const description = element.getString(descriptionJsonName, '');
            const category = element.getString(categoryJsonName, '');
            const definition = new LitIvemIdArrayRankedLitIvemIdListDefinition(name, description, category, litIvemIdsResult.value);
            return new Ok(definition);
        }
    }

    export function tryCreateLitIvemIdsFromJson(element: JsonElement): Result<LitIvemId[]> {
        const elementArrayResult = element.tryGetElementArray(litIvemIdsJsonName);
        if (elementArrayResult.isErr()) {
            const error = elementArrayResult.error;
            if (error === JsonElement.arrayErrorCode_NotSpecified) {
                return new Err(ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonArrayNotSpecified);
            } else {
                return new Err(ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonArrayIsInvalid);
            }
        } else {
            const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
            if (litIvemIdsResult.isErr()) {
                return litIvemIdsResult.createOuter(ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonLitIvemIdArrayIsInvalid);
            } else {
                return new Ok(litIvemIdsResult.value);
            }
        }
    }
}

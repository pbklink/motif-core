/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/internal-api';
import { ErrorCode, JsonElement, JsonElementErr, Ok, Result } from "../../sys/internal-api";
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
            const error = litIvemIdsResult.error as ErrorCode;
            if (error === ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonArrayNotSpecified) {
                return litIvemIdsResult.createOuter(ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonNotSpecified);
            } else {
                return litIvemIdsResult.createOuter(ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonIsInvalid);
            }
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
            const errorId = elementArrayResult.error;
            if (errorId === JsonElement.ErrorId.JsonValueIsNotDefined) {
                return JsonElementErr.createOuter(elementArrayResult.error, ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonArrayNotSpecified);
            } else {
                return JsonElementErr.createOuter(elementArrayResult.error, ErrorCode.LitIvemIdArrayRankedLitIvemIdListDefinition_JsonArrayIsInvalid);
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

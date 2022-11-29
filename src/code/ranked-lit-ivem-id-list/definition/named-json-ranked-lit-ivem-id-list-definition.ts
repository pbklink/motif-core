/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { JsonRankedLitIvemIdListDefinition } from './json-ranked-lit-ivem-id-list-definition';

/** @public */
export class NamedJsonRankedLitIvemIdListDefinition extends JsonRankedLitIvemIdListDefinition {
    constructor(
        public id: Guid,
        public name: string,
        litIvemIds: readonly LitIvemId[],
    ) {
        super(litIvemIds);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setGuid(NamedJsonRankedLitIvemIdListDefinition.JsonName.id, this.id);
        element.setString(NamedJsonRankedLitIvemIdListDefinition.JsonName.name, this.name);
    }
}

/** @public */
export namespace NamedJsonRankedLitIvemIdListDefinition {
    export type ModifiedEventHandler = (this: void) => void;

    export namespace JsonName {
        export const id = 'id'
        export const name = 'name';
    }

    export function tryCreateNamedFromJson(element: JsonElement,): Result<NamedJsonRankedLitIvemIdListDefinition> {
        const idResult = element.tryGetGuidType(JsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.NamedJsonRankedLitIvemIdListDefinition_JsonIdNotSpecified);
        } else {
            const nameResult = element.tryGetStringType(JsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.NamedJsonRankedLitIvemIdListDefinition_JsonNameNotSpecified)
            } else {
                const litIvemIdsResult = JsonRankedLitIvemIdListDefinition.tryCreateLitIvemIdsFromJson(element);
                if (litIvemIdsResult.isErr()) {
                    return litIvemIdsResult.createOuter(ErrorCode.NamedJsonRankedLitIvemIdListDefinition_JsonLitIvemIdsIsInvalid);
                } else {
                    const definition = new NamedJsonRankedLitIvemIdListDefinition(
                        idResult.value,
                        nameResult.value,
                        litIvemIdsResult.value
                    );
                    return new Ok(definition);
                }
            }
        }
    }
}

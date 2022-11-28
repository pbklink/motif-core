/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { ExplicitRankedLitIvemIdListDefinition } from './explicit-ranked-lit-ivem-id-list-definition';

/** @public */
export class NamedExplicitRankedLitIvemIdListDefinition extends ExplicitRankedLitIvemIdListDefinition {
    constructor(
        public id: Guid,
        public name: string,
        litIvemIds: readonly LitIvemId[],
    ) {
        super(litIvemIds);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setGuid(NamedExplicitRankedLitIvemIdListDefinition.JsonName.id, this.id);
        element.setString(NamedExplicitRankedLitIvemIdListDefinition.JsonName.name, this.name);
    }
}

/** @public */
export namespace NamedExplicitRankedLitIvemIdListDefinition {
    export type ModifiedEventHandler = (this: void) => void;

    export namespace JsonName {
        export const id = 'id'
        export const name = 'name';
    }

    export function tryCreateNamedFromJson(element: JsonElement,): Result<NamedExplicitRankedLitIvemIdListDefinition> {
        const idResult = element.tryGetGuidType(JsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.NamedExplicitLitIvemIdListDefinition_TryCreateFromJson_Id);
        } else {
            const nameResult = element.tryGetStringType(JsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.NamedExplicitLitIvemIdListDefinition_TryCreateFromJson_Name)
            } else {
                const litIvemIdsResult = ExplicitRankedLitIvemIdListDefinition.tryCreateLitIvemIdsFromJson(element);
                if (litIvemIdsResult.isErr()) {
                    return litIvemIdsResult.createOuter(ErrorCode.NamedExplicitLitIvemIdListDefinition_TryCreateFromJson_LitIvemIds);
                } else {
                    const definition = new NamedExplicitRankedLitIvemIdListDefinition(
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

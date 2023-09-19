/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';
import { RankedLitIvemIdListDefinitionFactoryService } from './ranked-lit-ivem-id-list-definition-factory-service';

/** @public */
export class RankedLitIvemIdListOrReferenceDefinition {
    readonly referenceId: Guid | undefined;
    readonly litIvemIdListDefinition: RankedLitIvemIdListDefinition | undefined;

    constructor(definitionOrReferenceId: RankedLitIvemIdListDefinition | Guid) {
        if (typeof definitionOrReferenceId === 'string') {
            this.referenceId = definitionOrReferenceId;
        } else {
            this.litIvemIdListDefinition = definitionOrReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this.referenceId !== undefined) {
            element.setString(RankedLitIvemIdListOrReferenceDefinition.JsonName.referenceId, this.referenceId);
        } else {
            if (this.litIvemIdListDefinition !== undefined) {
                const litIvemIdListDefinitionElement = element.newElement(
                    RankedLitIvemIdListOrReferenceDefinition.JsonName.litIvemIdListDefinition
                );
                this.litIvemIdListDefinition.saveToJson(litIvemIdListDefinitionElement);
            } else {
                throw new AssertInternalError('RLIILONRDSTJ34445');
            }
        }
    }
}

/** @public */
export namespace RankedLitIvemIdListOrReferenceDefinition {
    export namespace JsonName {
        export const referenceId = 'referenceId';
        export const litIvemIdListDefinition = 'litIvemIdListDefinition';
    }

    export function tryCreateFromJson(
        litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<RankedLitIvemIdListOrReferenceDefinition> {
        const referenceIdResult = element.tryGetString(JsonName.referenceId);
        if (referenceIdResult.isOk()) {
            const definitionOrNamedReference = new RankedLitIvemIdListOrReferenceDefinition(referenceIdResult.value);
            return new Ok(definitionOrNamedReference);
        } else {
            const definitionElementResult = element.tryGetElement(JsonName.litIvemIdListDefinition);
            if (definitionElementResult.isOk()) {
                const definitionElement = definitionElementResult.value;
                const definitionResult = litIvemIdListDefinitionFactoryService.tryCreateFromJson(definitionElement);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.LitIvemIdListOrNamedReferenceDefinition_DefinitionJsonIsInvalid);
                } else {
                    const definitionOrNamedReference = new RankedLitIvemIdListOrReferenceDefinition(
                        definitionResult.value
                    );
                    return new Ok(definitionOrNamedReference);
                }
            } else {
                return new Err(ErrorCode.LitIvemIdListOrNamedReferenceDefinition_BothDefinitionAndNamedReferenceNotSpecifiedInJson);
            }
        }
    }
}

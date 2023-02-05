/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, Ok, Result } from '../../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';
import { RankedLitIvemIdListDefinitionFactoryService } from './ranked-lit-ivem-id-list-definition-factory-service';

/** @public */
export class RankedLitIvemIdListOrNamedReferenceDefinition {
    readonly namedReferenceId: Guid | undefined;
    readonly namedReferenceTypeId: RankedLitIvemIdListDefinition.TypeId | undefined;
    readonly litIvemIdListDefinition: RankedLitIvemIdListDefinition | undefined;

    constructor(definitionOrNamedReferenceId: RankedLitIvemIdListDefinition | Guid) {
        if (typeof definitionOrNamedReferenceId === 'string') {
            this.namedReferenceId = definitionOrNamedReferenceId;
            this.namedReferenceTypeId = RankedLitIvemIdListDefinition.TypeId.Explicit; // only supported named explicit references
        } else {
            this.litIvemIdListDefinition = definitionOrNamedReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this.namedReferenceId !== undefined) {
            element.setString(RankedLitIvemIdListOrNamedReferenceDefinition.JsonName.namedReferenceId, this.namedReferenceId);
            if (this.namedReferenceTypeId === undefined) {
                throw new AssertInternalError('RLIILONRD23331');
            } else {
                const typeJsonValue = RankedLitIvemIdListDefinition.Type.idToJsonValue(this.namedReferenceTypeId);
                element.setString(RankedLitIvemIdListOrNamedReferenceDefinition.JsonName.namedReferenceId, typeJsonValue);
            }
        } else {
            if (this.litIvemIdListDefinition !== undefined) {
                const litIvemIdListDefinitionElement = element.newElement(
                    RankedLitIvemIdListOrNamedReferenceDefinition.JsonName.litIvemIdListDefinition
                );
                this.litIvemIdListDefinition.saveToJson(litIvemIdListDefinitionElement);
            } else {
                throw new AssertInternalError('RLIILONRDSTJ34445');
            }
        }
    }
}

/** @public */
export namespace RankedLitIvemIdListOrNamedReferenceDefinition {
    export namespace JsonName {
        export const namedReferenceId = 'namedReferenceId';
        export const namedReferenceType = 'namedReferenceType';
        export const litIvemIdListDefinition = 'litIvemIdListDefinition';
    }

    export function tryCreateFromJson(
        litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<RankedLitIvemIdListOrNamedReferenceDefinition> {
        const namedReferenceIdResult = element.tryGetString(JsonName.namedReferenceId);
        if (namedReferenceIdResult.isOk()) {
            const namedReferenceTypeResult = element.tryGetString(JsonName.namedReferenceType);
            if (namedReferenceTypeResult.isErr()) {
                const errorCode = ErrorCode.LitIvemIdListOrNamedReferenceDefinition_NamedReferenceTypeNotSpecified;
                return namedReferenceTypeResult.createOuter(errorCode);
            } else {
                const typeJsonValue = namedReferenceTypeResult.value;
                const typeId = RankedLitIvemIdListDefinition.Type.tryJsonValueToId(typeJsonValue);
                if (typeId === undefined) {
                    const errorCode = ErrorCode.LitIvemIdListOrNamedReferenceDefinition_NamedReferenceTypeIsUnknown;
                    return new Err(`${errorCode}: ${typeJsonValue}`);
                } else {
                    if (typeId !== RankedLitIvemIdListDefinition.TypeId.Explicit) {
                        const errorCode = ErrorCode.LitIvemIdListOrNamedReferenceDefinition_OnlyExplicitNamedReferenceTypeIsSupported;
                        return new Err(`${errorCode}: ${typeJsonValue}`);
                    } else {
                        const namedExplicitReferenceId = namedReferenceIdResult.value;
                        const definitionOrNamedReference = new RankedLitIvemIdListOrNamedReferenceDefinition(
                            namedExplicitReferenceId
                        );
                        return new Ok(definitionOrNamedReference);
                    }
                }
            }
        } else {
            const definitionElementResult = element.tryGetElement(JsonName.litIvemIdListDefinition);
            if (definitionElementResult.isOk()) {
                const definitionElement = definitionElementResult.value;
                const definitionResult = litIvemIdListDefinitionFactoryService.tryCreateFromJson(definitionElement);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.LitIvemIdListOrNamedReferenceDefinition_DefinitionJsonIsInvalid);
                } else {
                    const definitionOrNamedReference = new RankedLitIvemIdListOrNamedReferenceDefinition(
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

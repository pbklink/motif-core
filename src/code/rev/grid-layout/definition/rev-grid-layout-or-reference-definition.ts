// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { AssertInternalError, Err, Guid, JsonElement, Ok, Result } from '@xilytix/sysutils';
import { RevGridLayoutDefinition } from './rev-grid-layout-definition';

/** @public */
export class RevGridLayoutOrReferenceDefinition {
    readonly referenceId: Guid | undefined;
    readonly gridLayoutDefinition: RevGridLayoutDefinition | undefined;

    constructor(definitionOrReferenceId: RevGridLayoutDefinition | Guid) {
        if (typeof definitionOrReferenceId === 'string') {
            this.referenceId = definitionOrReferenceId;
        } else {
            this.gridLayoutDefinition = definitionOrReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this.referenceId !== undefined) {
            element.setString(RevGridLayoutOrReferenceDefinition.JsonName.referenceId, this.referenceId);
        } else {
            if (this.gridLayoutDefinition !== undefined) {
                const gridLayoutDefinitionElement = element.newElement(RevGridLayoutOrReferenceDefinition.JsonName.gridLayoutDefinition);
                this.gridLayoutDefinition.saveToJson(gridLayoutDefinitionElement);
            } else {
                throw new AssertInternalError('GLDONRSTJ34445');
            }
        }
    }
}

/** @public */
export namespace RevGridLayoutOrReferenceDefinition {
    export namespace JsonName {
        export const referenceId = 'referenceId';
        export const gridLayoutDefinition = 'gridLayoutDefinition';
    }

    export const enum CreateFromJsonErrorId {
        GetElement,
        CreateDefinition
    }

    export interface CreateFromJsonErrorIds {
        readonly errorId: CreateFromJsonErrorId;
        readonly jsonElementErrorId: JsonElement.ErrorId;
    }

    export function tryCreateFromJson(element: JsonElement): Result<RevGridLayoutOrReferenceDefinition, CreateFromJsonErrorIds> {
        const referenceIdResult = element.tryGetString(JsonName.referenceId);
        if (referenceIdResult.isOk()) {
            const referenceId = referenceIdResult.value;
            const gridLayoutOrReferenceDefinition = new RevGridLayoutOrReferenceDefinition(referenceId);
            return new Ok(gridLayoutOrReferenceDefinition);
        } else {
            const definitionElementResult = element.tryGetElement(JsonName.gridLayoutDefinition);
            if (definitionElementResult.isErr()) {
                return new Err({ errorId: CreateFromJsonErrorId.GetElement, jsonElementErrorId: definitionElementResult.error });
            } else {
                const definitionElement = definitionElementResult.value;
                const definitionResult = RevGridLayoutDefinition.tryCreateFromJson(definitionElement);
                if (definitionResult.isErr()) {
                    return new Err({ errorId: CreateFromJsonErrorId.CreateDefinition, jsonElementErrorId: definitionResult.error.jsonElementErrorId });
                } else {
                    const gridLayoutOrReferenceDefinition = new RevGridLayoutOrReferenceDefinition(definitionResult.value);
                    return new Ok(gridLayoutOrReferenceDefinition);
                }
            }
        }
    }
}

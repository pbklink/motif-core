/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

/** @public */
export class GridLayoutOrReferenceDefinition {
    readonly referenceId: Guid | undefined;
    readonly gridLayoutDefinition: GridLayoutDefinition | undefined;

    constructor(definitionOrReferenceId: GridLayoutDefinition | Guid) {
        if (typeof definitionOrReferenceId === 'string') {
            this.referenceId = definitionOrReferenceId;
        } else {
            this.gridLayoutDefinition = definitionOrReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this.referenceId !== undefined) {
            element.setString(GridLayoutOrReferenceDefinition.JsonName.referenceId, this.referenceId);
        } else {
            if (this.gridLayoutDefinition !== undefined) {
                const gridLayoutDefinitionElement = element.newElement(GridLayoutOrReferenceDefinition.JsonName.gridLayoutDefinition);
                this.gridLayoutDefinition.saveToJson(gridLayoutDefinitionElement);
            } else {
                throw new AssertInternalError('GLDONRSTJ34445');
            }
        }
    }
}

/** @public */
export namespace GridLayoutOrReferenceDefinition {
    export namespace JsonName {
        export const referenceId = 'referenceId';
        export const gridLayoutDefinition = 'gridLayoutDefinition';
    }

    export function tryCreateFromJson(element: JsonElement): Result<GridLayoutOrReferenceDefinition> {
        const referenceIdResult = element.tryGetString(JsonName.referenceId);
        if (referenceIdResult.isOk()) {
            const referenceId = referenceIdResult.value;
            const gridLayoutOrReferenceDefinition = new GridLayoutOrReferenceDefinition(referenceId);
            return new Ok(gridLayoutOrReferenceDefinition);
        } else {
            const definitionElementResult = element.tryGetElement(JsonName.gridLayoutDefinition);
            if (definitionElementResult.isErr()) {
                return new Err(ErrorCode.GridLayoutDefinitionOrReference_BothDefinitionAndReferenceAreNotSpecified);
            } else {
                const definitionElement = definitionElementResult.value;
                const definitionResult = GridLayoutDefinition.tryCreateFromJson(definitionElement);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.GridLayoutDefinitionOrReference_GridLayoutDefinitionIsInvalid);
                } else {
                    const gridLayoutOrReferenceDefinition = new GridLayoutOrReferenceDefinition(definitionResult.value);
                    return new Ok(gridLayoutOrReferenceDefinition);
                }
            }
        }
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

/** @public */
export class GridLayoutOrNamedReferenceDefinition {
    readonly namedReferenceId: Guid | undefined;
    readonly gridLayoutDefinition: GridLayoutDefinition | undefined;

    constructor(definitionOrNamedReferenceId: GridLayoutDefinition | Guid) {
        if (typeof definitionOrNamedReferenceId === 'string') {
            this.namedReferenceId = definitionOrNamedReferenceId;
        } else {
            this.gridLayoutDefinition = definitionOrNamedReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this.namedReferenceId !== undefined) {
            element.setString(GridLayoutOrNamedReferenceDefinition.JsonName.namedReferenceId, this.namedReferenceId);
        } else {
            if (this.gridLayoutDefinition !== undefined) {
                const gridLayoutDefinitionElement = element.newElement(GridLayoutOrNamedReferenceDefinition.JsonName.gridLayoutDefinition);
                this.gridLayoutDefinition.saveToJson(gridLayoutDefinitionElement);
            } else {
                throw new AssertInternalError('GLDONRSTJ34445');
            }
        }
    }
}

/** @public */
export namespace GridLayoutOrNamedReferenceDefinition {
    export namespace JsonName {
        export const namedReferenceId = 'namedReferenceId';
        export const gridLayoutDefinition = 'gridLayoutDefinition';
    }

    export function tryCreateFromJson(element: JsonElement): Result<GridLayoutOrNamedReferenceDefinition> {
        const namedReferenceIdResult = element.tryGetStringType(JsonName.namedReferenceId);
        if (namedReferenceIdResult.isOk()) {
            const namedReferenceId = namedReferenceIdResult.value;
            const gridLayoutOrNamedReferenceDefinition = new GridLayoutOrNamedReferenceDefinition(namedReferenceId);
            return new Ok(gridLayoutOrNamedReferenceDefinition);
        } else {
            const definitionElementResult = element.tryGetElementType(JsonName.gridLayoutDefinition);
            if (definitionElementResult.isErr()) {
                return new Err(ErrorCode.GridLayoutDefinitionOrNamedReference_BothDefinitionAndNamedReferenceAreNotSpecified);
            } else {
                const definitionElement = definitionElementResult.value;
                const definitionResult = GridLayoutDefinition.tryCreateFromJson(definitionElement);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.GridLayoutDefinitionOrNamedReference_GridLayoutDefinitionIsInvalid);
                } else {
                    const gridLayoutOrNamedReferenceDefinition = new GridLayoutOrNamedReferenceDefinition(definitionResult.value);
                    return new Ok(gridLayoutOrNamedReferenceDefinition);
                }
            }
        }
    }
}

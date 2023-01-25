/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrNamedReferenceDefinition } from '../../layout/grid-layout-internal-api';
import { TableRecordSourceDefinitionFactoryService } from '../../table/grid-table-internal-api';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class GridSourceOrNamedReferenceDefinition {
    readonly namedReferenceId: Guid | undefined;
    readonly gridSourceDefinition: GridSourceDefinition | undefined;

    constructor(gridSourceDefinitionOrReferenceId: GridSourceDefinition | Guid) {
        if (typeof gridSourceDefinitionOrReferenceId === 'string') {
            this.namedReferenceId = gridSourceDefinitionOrReferenceId;
        } else {
            this.gridSourceDefinition = gridSourceDefinitionOrReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this.namedReferenceId !== undefined) {
            element.setString(GridSourceOrNamedReferenceDefinition.JsonName.namedReferenceId, this.namedReferenceId);
        } else {
            if (this.gridSourceDefinition !== undefined) {
                const gridSourceDefinitionElement = element.newElement(GridSourceOrNamedReferenceDefinition.JsonName.gridSourceDefinition);
                this.gridSourceDefinition.saveToJson(gridSourceDefinitionElement);
            } else {
                throw new AssertInternalError('GSDONRSTJ34445');
            }
        }
    }

    canUpdateGridLayoutDefinitionOrNamedReference(): boolean {
        return this.gridSourceDefinition !== undefined;
    }

    updateGridLayoutDefinitionOrNamedReference(value: GridLayoutOrNamedReferenceDefinition) {
        if (this.gridSourceDefinition === undefined) {
            throw new AssertInternalError('GSDONRS45000');
        } else {
            this.gridSourceDefinition.gridLayoutOrNamedReferenceDefinition = value;
        }
    }
}

/** @public */
export namespace GridSourceOrNamedReferenceDefinition {
    export namespace JsonName {
        export const namedReferenceId = 'namedReferenceId';
        export const gridSourceDefinition = 'gridSourceDefinition';
    }

    export interface SaveAsDefinition {
        // name undefined => private
        // id defined && name defined => overwrite named
        // id undefined && named defined => new named
        readonly id: string | undefined;
        readonly name: string | undefined;
        readonly tableRecordSourceOnly: boolean;
    }

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<GridSourceOrNamedReferenceDefinition> {
        const namedReferenceIdResult = element.tryGetString(JsonName.namedReferenceId);
        if (namedReferenceIdResult.isOk()) {
            const namedReferenceId = namedReferenceIdResult.value;
            const gridSourceOrNamedReference = new GridSourceOrNamedReferenceDefinition(namedReferenceId);
            return new Ok(gridSourceOrNamedReference);
        } else {
            const definitionElementResult = element.tryGetElement(JsonName.gridSourceDefinition);
            if (definitionElementResult.isErr()) {
                return new Err(ErrorCode.GridSourceOrNamedReferenceDefinition_BothDefinitionAndNamedReferenceAreNotSpecified);
            } else {
                const definitionElement = definitionElementResult.value;
                const definitionResult = GridSourceDefinition.tryCreateFromJson(
                    tableRecordSourceDefinitionFactoryService,
                    definitionElement
                );
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.GridSourceOrNamedReferenceDefinition_GridSourceDefinitionIsInvalid);
                } else {
                    const definitionOrNamedReference = new GridSourceOrNamedReferenceDefinition(definitionResult.value);
                    return new Ok(definitionOrNamedReference);
                }
            }
        }
    }
}

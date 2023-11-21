/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrReferenceDefinition } from '../../layout/grid-layout-internal-api';
import { TableRecordSourceDefinitionFactoryService } from '../../table/grid-table-internal-api';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class GridSourceOrReferenceDefinition {
    readonly referenceId: Guid | undefined;
    readonly gridSourceDefinition: GridSourceDefinition | undefined;

    constructor(gridSourceDefinitionOrReferenceId: GridSourceDefinition | Guid) {
        if (typeof gridSourceDefinitionOrReferenceId === 'string') {
            this.referenceId = gridSourceDefinitionOrReferenceId;
        } else {
            this.gridSourceDefinition = gridSourceDefinitionOrReferenceId;
        }
    }

    saveToJson(element: JsonElement) {
        if (this.referenceId !== undefined) {
            element.setString(GridSourceOrReferenceDefinition.JsonName.referenceId, this.referenceId);
        } else {
            if (this.gridSourceDefinition !== undefined) {
                const gridSourceDefinitionElement = element.newElement(GridSourceOrReferenceDefinition.JsonName.gridSourceDefinition);
                this.gridSourceDefinition.saveToJson(gridSourceDefinitionElement);
            } else {
                throw new AssertInternalError('GSDONRSTJ34445');
            }
        }
    }

    canUpdateGridLayoutDefinitionOrReference(): boolean {
        return this.gridSourceDefinition !== undefined;
    }

    updateGridLayoutDefinitionOrReference(value: GridLayoutOrReferenceDefinition) {
        if (this.gridSourceDefinition === undefined) {
            throw new AssertInternalError('GSDONRS45000');
        } else {
            this.gridSourceDefinition.gridLayoutOrReferenceDefinition = value;
        }
    }
}

/** @public */
export namespace GridSourceOrReferenceDefinition {
    export namespace JsonName {
        export const referenceId = 'referenceId';
        export const gridSourceDefinition = 'gridSourceDefinition';
    }

    export interface SaveAsDefinition {
        // name undefined => private
        // id defined && name defined => overwrite reference
        // id undefined && name defined => new reference
        readonly id: string | undefined;
        readonly name: string | undefined;
        readonly tableRecordSourceOnly: boolean;
    }

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<GridSourceOrReferenceDefinition> {
        const referenceIdResult = element.tryGetString(JsonName.referenceId);
        if (referenceIdResult.isOk()) {
            const referenceId = referenceIdResult.value;
            const gridSourceOrReferenceDefinition = new GridSourceOrReferenceDefinition(referenceId);
            return new Ok(gridSourceOrReferenceDefinition);
        } else {
            const definitionElementResult = element.tryGetElement(JsonName.gridSourceDefinition);
            if (definitionElementResult.isErr()) {
                return new Err(ErrorCode.GridSourceOrReferenceDefinition_BothDefinitionAndReferenceAreNotSpecified);
            } else {
                const definitionElement = definitionElementResult.value;
                const definitionResult = GridSourceDefinition.tryCreateFromJson(
                    tableRecordSourceDefinitionFactoryService,
                    definitionElement
                );
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.GridSourceOrReferenceDefinition_GridSourceDefinitionIsInvalid);
                } else {
                    const gridSourceOrReferenceDefinition = new GridSourceOrReferenceDefinition(definitionResult.value);
                    return new Ok(gridSourceOrReferenceDefinition);
                }
            }
        }
    }
}

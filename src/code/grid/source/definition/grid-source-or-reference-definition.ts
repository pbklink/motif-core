/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, Guid, JsonElement, JsonElementErr, Ok, Result } from '../../../sys/internal-api';
import { RevGridLayoutOrReferenceDefinition } from '../../layout/internal-api';
import { TableRecordSourceDefinitionFromJsonFactory } from '../../table/internal-api';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class GridSourceOrReferenceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
    readonly referenceId: Guid | undefined;
    readonly gridSourceDefinition: GridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> | undefined;

    constructor(gridSourceDefinitionOrReferenceId: GridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> | Guid) {
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

    updateGridLayoutDefinitionOrReference(value: RevGridLayoutOrReferenceDefinition) {
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

    export function tryCreateFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
        tableRecordSourceDefinitionFromJsonFactory: TableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        element: JsonElement
    ): Result<GridSourceOrReferenceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>> {
        const referenceIdResult = element.tryGetString(JsonName.referenceId);
        if (referenceIdResult.isOk()) {
            const referenceId = referenceIdResult.value;
            const gridSourceOrReferenceDefinition = new GridSourceOrReferenceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(referenceId);
            return new Ok(gridSourceOrReferenceDefinition);
        } else {
            const definitionElementResult = element.tryGetElement(JsonName.gridSourceDefinition);
            if (definitionElementResult.isErr()) {
                return JsonElementErr.createOuter(definitionElementResult.error, ErrorCode.GridSourceOrReferenceDefinition_BothDefinitionAndReferenceAreNotSpecified);
            } else {
                const definitionElement = definitionElementResult.value;
                const definitionResult = GridSourceDefinition.tryCreateFromJson(
                    tableRecordSourceDefinitionFromJsonFactory,
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

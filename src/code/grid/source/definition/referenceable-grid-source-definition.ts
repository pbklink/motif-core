/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrReferenceDefinition } from '../../layout/grid-layout-internal-api';
import {
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService
} from "../../table/record-source/internal-api";
import { GridRowOrderDefinition } from './grid-row-order-definition';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class ReferenceableGridSourceDefinition extends GridSourceDefinition {
    constructor(
        readonly id: Guid,
        readonly name: string,
        tableRecordSourceDefinition: TableRecordSourceDefinition,
        gridLayoutDefinitionOrReference: GridLayoutOrReferenceDefinition | undefined,
        rowOrderDefinition: GridRowOrderDefinition | undefined,
    ) {
        super(tableRecordSourceDefinition, gridLayoutDefinitionOrReference, rowOrderDefinition);
    }

    override saveToJson(element: JsonElement): void {
        super.saveToJson(element);
        element.setString(ReferenceableGridSourceDefinition.ReferenceableJsonName.id, this.id);
        element.setString(ReferenceableGridSourceDefinition.ReferenceableJsonName.name, this.name);
    }
}

/** @public */
export namespace ReferenceableGridSourceDefinition {
    export namespace ReferenceableJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement,
    ): Result<ReferenceableGridSourceDefinition> {
        const idResult = element.tryGetString(ReferenceableJsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.ReferenceableGridSourceDefinition_IdNotSpecified);
        } else {
            const nameResult = element.tryGetString(ReferenceableJsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.ReferenceableGridSourceDefinition_NameNotSpecified);
            } else {
                const tableRecordSourceDefinitionResult = GridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
                    tableRecordSourceDefinitionFactoryService,
                    element,
                );
                if (tableRecordSourceDefinitionResult.isErr()) {
                    return tableRecordSourceDefinitionResult.createOuter(ErrorCode.ReferenceableGridSourceDefinition_TableRecordSourceDefinition);
                } else {
                    let gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined;
                    const gridLayoutDefinitionOrReferenceDefinitionResult =
                        GridSourceDefinition.tryGetGridLayoutOrReferenceDefinitionFromJson(element);
                    if (gridLayoutDefinitionOrReferenceDefinitionResult.isErr()) {
                        gridLayoutOrReferenceDefinition = undefined
                    } else {
                        gridLayoutOrReferenceDefinition = gridLayoutDefinitionOrReferenceDefinitionResult.value;
                    }

                    const rowOrderDefinition = GridSourceDefinition.tryGetRowOrderFromJson(element);

                    const referenceableGridSourceDefinition = new ReferenceableGridSourceDefinition(
                        idResult.value,
                        nameResult.value,
                        tableRecordSourceDefinitionResult.value,
                        gridLayoutOrReferenceDefinition,
                        rowOrderDefinition,
                    );
                    return new Ok(referenceableGridSourceDefinition);
                }
            }
        }
    }

    export function is(definition: GridSourceDefinition): definition is ReferenceableGridSourceDefinition {
        return definition instanceof ReferenceableGridSourceDefinition;
    }
}

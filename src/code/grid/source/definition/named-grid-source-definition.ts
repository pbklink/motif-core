/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrNamedReferenceDefinition } from '../../layout/grid-layout-internal-api';
import {
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService
} from "../../table/record-source/grid-table-record-source-internal-api";
import { GridRowOrderDefinition } from './grid-row-order-definition';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class NamedGridSourceDefinition extends GridSourceDefinition {
    constructor(
        readonly id: Guid,
        readonly name: string,
        tableRecordSourceDefinition: TableRecordSourceDefinition,
        gridLayoutDefinitionOrNamedReference: GridLayoutOrNamedReferenceDefinition | undefined,
        rowOrderDefinition: GridRowOrderDefinition | undefined,
    ) {
        super(tableRecordSourceDefinition, gridLayoutDefinitionOrNamedReference, rowOrderDefinition);
    }

    override saveToJson(element: JsonElement): void {
        super.saveToJson(element);
        element.setString(NamedGridSourceDefinition.NamedJsonName.id, this.id);
        element.setString(NamedGridSourceDefinition.NamedJsonName.name, this.name);
    }
}

/** @public */
export namespace NamedGridSourceDefinition {
    export namespace NamedJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement,
    ): Result<NamedGridSourceDefinition> {
        const idResult = element.tryGetString(NamedJsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.NamedGridSourceDefinition_IdNotSpecified);
        } else {
            const nameResult = element.tryGetString(NamedJsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.NamedGridSourceDefinition_NameNotSpecified);
            } else {
                const tableRecordSourceDefinitionResult = GridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
                    tableRecordSourceDefinitionFactoryService,
                    element,
                );
                if (tableRecordSourceDefinitionResult.isErr()) {
                    return tableRecordSourceDefinitionResult.createOuter(ErrorCode.NamedGridSourceDefinition_TableRecordSourceDefinition);
                } else {
                    let gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined;
                    const gridLayoutDefinitionOrNamedReferenceDefinitionResult =
                        GridSourceDefinition.tryGetGridLayoutOrNamedReferenceDefinitionFromJson(element);
                    if (gridLayoutDefinitionOrNamedReferenceDefinitionResult.isErr()) {
                        gridLayoutOrNamedReferenceDefinition = undefined
                    } else {
                        gridLayoutOrNamedReferenceDefinition = gridLayoutDefinitionOrNamedReferenceDefinitionResult.value;
                    }

                    const rowOrderDefinition = GridSourceDefinition.tryGetRowOrderFromJson(element);

                    const namedGridSourceDefinition = new NamedGridSourceDefinition(
                        idResult.value,
                        nameResult.value,
                        tableRecordSourceDefinitionResult.value,
                        gridLayoutOrNamedReferenceDefinition,
                        rowOrderDefinition,
                    );
                    return new Ok(namedGridSourceDefinition);
                }
            }
        }
    }

    export function is(definition: GridSourceDefinition): definition is NamedGridSourceDefinition {
        return definition instanceof NamedGridSourceDefinition;
    }
}

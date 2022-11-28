/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, Integer, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrNamedReferenceDefinition } from '../../layout/grid-layout-internal-api';
import {
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService,
} from "../../table/record-source/grid-table-record-source-internal-api";
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class NamedGridSourceDefinition extends GridSourceDefinition {
    constructor(
        readonly id: Guid,
        readonly name: string,
        public index: number,
        tableRecordSourceDefinition: TableRecordSourceDefinition,
        gridLayoutDefinitionOrNamedReference: GridLayoutOrNamedReferenceDefinition,
    ) {
        super(tableRecordSourceDefinition, gridLayoutDefinitionOrNamedReference);
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
        initialIndex: Integer = -1
    ): Result<NamedGridSourceDefinition> {
        const idResult = element.tryGetStringType(NamedJsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.NamedGridSourceDefinition_IdNotSpecified);
        } else {
            const nameResult = element.tryGetStringType(NamedJsonName.name);
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
                    const gridLayoutDefinitionOrNamedReferenceResult =
                        GridSourceDefinition.tryGetGridLayoutOrNamedReferenceDefinitionFromJson(element);
                    if (gridLayoutDefinitionOrNamedReferenceResult.isErr()) {
                        const errorCode = ErrorCode.NamedGridSourceDefinition_GridLayoutDefinitionOrNamedReference;
                        return gridLayoutDefinitionOrNamedReferenceResult.createOuter(errorCode);
                    } else {
                        const namedGridSourceDefinition = new NamedGridSourceDefinition(
                            idResult.value,
                            nameResult.value,
                            initialIndex,
                            tableRecordSourceDefinitionResult.value,
                            gridLayoutDefinitionOrNamedReferenceResult.value,
                        );
                        return new Ok(namedGridSourceDefinition);
                    }
                }
            }
        }
    }

    export function is(definition: GridSourceDefinition): definition is NamedGridSourceDefinition {
        return definition instanceof NamedGridSourceDefinition;
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, Guid, Integer, JsonElement, LockOpenListItem, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinitionOrNamedReference, NamedGridLayoutDefinitionsService } from '../../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from '../../table/record-source/grid-table-record-source-internal-api';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class NamedGridSourceDefinition extends GridSourceDefinition implements LockOpenListItem {
    readonly mapKey: Guid;
    readonly upperCaseName: string;

    constructor(
        readonly id: Guid,
        readonly name: string,
        public index: number,
        tableRecordSourceDefinition: TableRecordSourceDefinition,
        gridLayoutDefinitionOrNamedReference: GridLayoutDefinitionOrNamedReference,
    ) {
        super(tableRecordSourceDefinition, gridLayoutDefinitionOrNamedReference);
        this.mapKey = id;
        this.upperCaseName = name.toUpperCase();
    }

    override saveToJson(element: JsonElement): void {
        super.saveToJson(element);
        element.setString(NamedGridSourceDefinition.NamedJsonName.id, this.id);
        element.setString(NamedGridSourceDefinition.NamedJsonName.name, this.name);
    }

    openLocked(opener: LockOpenListItem.Opener): void {
        throw new AssertInternalError('NGSDO23309');
    }

    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new AssertInternalError('NGSDO23309');
    }

    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void> {
        return super.tryLock(locker);
    }

    processLastUnlock(locker: LockOpenListItem.Locker) {
        super.unlock(locker);
    }

    tryProcessFirstOpen(_opener: LockOpenListItem.Opener): Result<void> {
        return new Ok(undefined);
    }

    processLastClose(_opener: LockOpenListItem.Opener): void {
        // no code
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
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
        namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
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
                        GridSourceDefinition.tryGetGridLayoutDefinitionOrNamedReferenceFromJson(
                            namedGridLayoutDefinitionsService,
                            element
                        );
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

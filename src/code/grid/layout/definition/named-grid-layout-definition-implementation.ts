/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, LockOpenListItem, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';
import { GridLayoutDefinitionImplementation } from './grid-layout-definition-implementation';
import { NamedGridLayoutDefinition } from './named-grid-layout-definition';

/** @public */
export class NamedGridLayoutDefinitionImplementation
    extends GridLayoutDefinitionImplementation
    implements LockOpenListItem, NamedGridLayoutDefinition {

    mapKey: string;

    constructor(
        public name: string,
        id: Guid,
        columns: GridLayoutDefinition.Column[]
    ) {
        super(id, columns);
    }
    openLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstLock(): Result<void> {
        throw new Error('Method not implemented.');
    }
    processLastUnlock(): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstOpen(): Result<void> {
        throw new Error('Method not implemented.');
    }
    processLastClose(): void {
        throw new Error('Method not implemented.');
    }
    equals(other: LockOpenListItem): boolean {
        throw new Error('Method not implemented.');
    }
    index: number;
}

export namespace NamedGridLayoutDefinitionImplementation {
    export const nameJsonName = 'name';

    export function isJson(element: JsonElement) {
        return element.hasName(nameJsonName);
    }

    export function tryCreateFromJson(element: JsonElement): Result<NamedGridLayoutDefinitionImplementation> {
        const nameResult = element.tryGetStringType(nameJsonName);
        if (nameResult.isErr()) {
            return nameResult.createOuter(ErrorCode.NamedGridLayoutDefinitionImplementation_TryCreateFromJsonColumns)
        } else {
            const idResult = GridLayoutDefinitionImplementation.tryGetIdFromJson(element);
            if (idResult.isErr()) {
                return idResult.createOuter(ErrorCode.NamedGridLayoutDefinitionImplementation_TryCreateFromJsonId);
            } else {
                const columnsResult = GridLayoutDefinitionImplementation.tryCreateColumnsFromJson(element);
                if (columnsResult.isErr()) {
                    return columnsResult.createOuter(ErrorCode.NamedGridLayoutDefinitionImplementation_TryCreateFromJsonColumns);
                } else {
                    const implementation = new NamedGridLayoutDefinitionImplementation(nameResult.value, idResult.value, columnsResult.value);
                    return new Ok(implementation);
                }
            }
        }
    }
}

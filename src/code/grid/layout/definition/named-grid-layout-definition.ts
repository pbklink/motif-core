/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, Integer, JsonElement, LockOpenListItem, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

/** @public */
export class NamedGridLayoutDefinition extends GridLayoutDefinition implements LockOpenListItem {
    mapKey: string;
    readonly upperCaseName: string;

    constructor(
        public id: Guid,
        public name: string,
        public index: number,
        initialColumns?: GridLayoutDefinition.Column[]
    ) {
        super(initialColumns);
        this.mapKey = id;
        this.upperCaseName = name.toUpperCase();
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setGuid(NamedGridLayoutDefinition.NamedJsonName.id, this.id);
        element.setString(NamedGridLayoutDefinition.NamedJsonName.name, this.name);
    }

    openLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }

    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }

    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void> {
        return super.tryLock(locker);
    }

    processLastUnlock(locker: LockOpenListItem.Locker): void {
        super.unlock(locker);
    }

    tryProcessFirstOpen(_opener: LockOpenListItem.Opener): Result<void> {
        return new Ok(undefined);
    }

    processLastClose(): void {
        // no code
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }
}

export namespace NamedGridLayoutDefinition {
    export namespace NamedJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateFromJson(
        element: JsonElement,
        initialIndex: Integer = -1
    ): Result<NamedGridLayoutDefinition> {
        const idResult = element.tryGetGuidType(NamedJsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.NamedGridLayoutDefinition_TryCreateFromJson_Id);
        } else {
            const nameResult = element.tryGetStringType(NamedJsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.NamedGridLayoutDefinition_TryCreateFromJson_Name)
            } else {
                let columns: GridLayoutDefinition.Column[] | undefined;
                const columnsResult = GridLayoutDefinition.tryCreateColumnsFromJson(element);
                if (columnsResult.isErr()) {
                    columns = undefined;
                } else {
                    columns = columnsResult.value;
                }
                const definition = new NamedGridLayoutDefinition(idResult.value, nameResult.value, initialIndex, columns);
                return new Ok(definition);
            }
        }
    }

    export function is(definition: GridLayoutDefinition): definition is NamedGridLayoutDefinition {
        return 'name' in definition;
    }
}

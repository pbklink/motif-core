/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, Integer, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

/** @public */
export class NamedGridLayoutDefinition extends GridLayoutDefinition {
    constructor(
        public id: Guid,
        public name: string,
        initialColumns: GridLayoutDefinition.Column[]
    ) {
        super(initialColumns);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setGuid(NamedGridLayoutDefinition.NamedJsonName.id, this.id);
        element.setString(NamedGridLayoutDefinition.NamedJsonName.name, this.name);
    }
}

export namespace NamedGridLayoutDefinition {
    export namespace NamedJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateNamedFromJson(
        element: JsonElement,
        initialIndex: Integer,
    ): Result<NamedGridLayoutDefinition> {
        const idResult = element.tryGetGuidType(NamedJsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.NamedGridLayoutDefinition_JsonId);
        } else {
            const nameResult = element.tryGetStringType(NamedJsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.NamedGridLayoutDefinition_JsonName)
            } else {
                let columns: GridLayoutDefinition.Column[] | undefined;
                const columnsResult = GridLayoutDefinition.tryCreateColumnsFromJson(element);
                if (columnsResult.isErr()) {
                    return columnsResult.createOuter(ErrorCode.NamedGridLayoutDefinition_JsonColumns);
                } else {
                    columns = columnsResult.value;
                }
                const definition = new NamedGridLayoutDefinition(idResult.value, nameResult.value, columns);
                return new Ok(definition);
            }
        }
    }

    export function is(definition: GridLayoutDefinition): definition is NamedGridLayoutDefinition {
        return 'name' in definition;
    }
}

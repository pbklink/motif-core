/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, Integer, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

/** @public */
export class ReferenceableGridLayoutDefinition extends GridLayoutDefinition {
    constructor(
        public id: Guid,
        public name: string,
        initialColumns: GridLayoutDefinition.Column[]
    ) {
        super(initialColumns);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setGuid(ReferenceableGridLayoutDefinition.ReferenceableJsonName.id, this.id);
        element.setString(ReferenceableGridLayoutDefinition.ReferenceableJsonName.name, this.name);
    }
}

export namespace ReferenceableGridLayoutDefinition {
    export namespace ReferenceableJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateReferenceableFromJson(
        element: JsonElement,
        initialIndex: Integer,
    ): Result<ReferenceableGridLayoutDefinition> {
        const idResult = element.tryGetGuid(ReferenceableJsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.ReferenceableGridLayoutDefinition_JsonId);
        } else {
            const nameResult = element.tryGetString(ReferenceableJsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.ReferenceableGridLayoutDefinition_JsonName)
            } else {
                let columns: GridLayoutDefinition.Column[] | undefined;
                const columnsResult = GridLayoutDefinition.tryCreateColumnsFromJson(element);
                if (columnsResult.isErr()) {
                    return columnsResult.createOuter(ErrorCode.ReferenceableGridLayoutDefinition_JsonColumns);
                } else {
                    columns = columnsResult.value;
                }
                const definition = new ReferenceableGridLayoutDefinition(idResult.value, nameResult.value, columns);
                return new Ok(definition);
            }
        }
    }

    export function is(definition: GridLayoutDefinition): definition is ReferenceableGridLayoutDefinition {
        return 'name' in definition;
    }
}

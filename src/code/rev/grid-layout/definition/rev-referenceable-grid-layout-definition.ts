// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { Err, Guid, Integer, JsonElement, Ok, Result } from '@xilytix/sysutils';
import { RevGridLayoutDefinition } from './rev-grid-layout-definition';

/** @public */
export class RevReferenceableGridLayoutDefinition extends RevGridLayoutDefinition {
    constructor(
        public id: Guid,
        public name: string,
        initialColumns: RevGridLayoutDefinition.Column[]
    ) {
        super(initialColumns);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setGuid(RevReferenceableGridLayoutDefinition.ReferenceableJsonName.id, this.id);
        element.setString(RevReferenceableGridLayoutDefinition.ReferenceableJsonName.name, this.name);
    }
}

export namespace RevReferenceableGridLayoutDefinition {
    export namespace ReferenceableJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export const enum ReferenceableCreateFromJsonErrorId {
        GetId,
        GetName,
        CreateDefinition
    }

    export interface ReferenceableCreateFromJsonErrorIds {
        readonly errorId: ReferenceableCreateFromJsonErrorId;
        readonly jsonElementErrorId: JsonElement.ErrorId;
    }

    export function tryCreateReferenceableFromJson(
        element: JsonElement,
        initialIndex: Integer,
    ): Result<RevReferenceableGridLayoutDefinition, ReferenceableCreateFromJsonErrorIds> {
        const idResult = element.tryGetGuid(ReferenceableJsonName.id);
        if (idResult.isErr()) {
            return new Err({ errorId: ReferenceableCreateFromJsonErrorId.GetId, jsonElementErrorId: idResult.error });
        } else {
            const nameResult = element.tryGetString(ReferenceableJsonName.name);
            if (nameResult.isErr()) {
                return new Err({ errorId: ReferenceableCreateFromJsonErrorId.GetName, jsonElementErrorId: nameResult.error });
            } else {
                let columns: RevGridLayoutDefinition.Column[] | undefined;
                const columnsResult = RevGridLayoutDefinition.tryCreateColumnsFromJson(element);
                if (columnsResult.isErr()) {
                    return new Err({ errorId: ReferenceableCreateFromJsonErrorId.CreateDefinition, jsonElementErrorId: columnsResult.error.jsonElementErrorId });
                } else {
                    columns = columnsResult.value;
                }
                const definition = new RevReferenceableGridLayoutDefinition(idResult.value, nameResult.value, columns);
                return new Ok(definition);
            }
        }
    }

    export function is(definition: RevGridLayoutDefinition): definition is RevReferenceableGridLayoutDefinition {
        return 'name' in definition;
    }
}

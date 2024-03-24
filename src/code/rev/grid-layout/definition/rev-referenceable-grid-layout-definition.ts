// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { AssertInternalError, Err, Guid, Integer, JsonElement, Ok, Result } from '@xilytix/sysutils';
import { RevGridLayoutDefinition } from './rev-grid-layout-definition';

/** @public */
export class RevReferenceableGridLayoutDefinition extends RevGridLayoutDefinition {
    constructor(
        public id: Guid,
        public name: string,
        initialColumns: RevGridLayoutDefinition.Column[],
        columnCreateErrorCount: Integer,
    ) {
        super(initialColumns, columnCreateErrorCount);
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
        IdJsonValueIsNotDefined,
        IdJsonValueIsNotOfTypeString,
        NameJsonValueIsNotDefined,
        NameJsonValueIsNotOfTypeString,
        ColumnsElementIsNotDefined,
        ColumnsElementIsNotAnArray,
        ColumnElementIsNotAnObject,
        AllColumnElementsAreInvalid,
    }

    export interface ReferenceableCreateFromJsonErrorIds {
        readonly errorId: ReferenceableCreateFromJsonErrorId;
        readonly jsonElementErrorId: JsonElement.ErrorId;
    }

    export function tryCreateReferenceableFromJson(element: JsonElement): Result<RevReferenceableGridLayoutDefinition, ReferenceableCreateFromJsonErrorId> {
        const idResult = element.tryGetGuid(ReferenceableJsonName.id);
        if (idResult.isErr()) {
            const idErrorId = idResult.error;
            let referenceableCreateFromJsonErrorId: ReferenceableCreateFromJsonErrorId;
            switch (idErrorId) {
                case JsonElement.ErrorId.JsonValueIsNotDefined:
                    referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.IdJsonValueIsNotDefined;
                    break;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeString:
                    referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.IdJsonValueIsNotOfTypeString;
                    break;
                default:
                    throw new AssertInternalError('RRGLDTCRFJI60872', idErrorId);
            }
            return new Err(referenceableCreateFromJsonErrorId);
        } else {
            const nameResult = element.tryGetString(ReferenceableJsonName.name);
            if (nameResult.isErr()) {
                const nameErrorId = nameResult.error;
                let referenceableCreateFromJsonErrorId: ReferenceableCreateFromJsonErrorId;
                switch (nameErrorId) {
                    case JsonElement.ErrorId.JsonValueIsNotDefined:
                        referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.NameJsonValueIsNotDefined;
                        break;
                    case JsonElement.ErrorId.JsonValueIsNotOfTypeString:
                        referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.NameJsonValueIsNotOfTypeString;
                        break;
                    default:
                        throw new AssertInternalError('RRGLDTCRFJI60872', nameErrorId);
                }
                return new Err(referenceableCreateFromJsonErrorId);
            } else {
                const columnsResult = RevGridLayoutDefinition.tryCreateColumnsFromJson(element);
                if (columnsResult.isErr()) {
                    const columnsErrorId = columnsResult.error;
                    let referenceableCreateFromJsonErrorId: ReferenceableCreateFromJsonErrorId;
                    switch (columnsErrorId) {
                        case RevGridLayoutDefinition.CreateFromJsonErrorId.ColumnsElementIsNotDefined:
                            referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.ColumnsElementIsNotDefined;
                            break;
                        case RevGridLayoutDefinition.CreateFromJsonErrorId.ColumnsElementIsNotAnArray:
                            referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.ColumnsElementIsNotAnArray;
                            break;
                        case RevGridLayoutDefinition.CreateFromJsonErrorId.ColumnElementIsNotAnObject:
                            referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.ColumnElementIsNotAnObject;
                            break;
                        case RevGridLayoutDefinition.CreateFromJsonErrorId.AllColumnElementsAreInvalid:
                            referenceableCreateFromJsonErrorId = ReferenceableCreateFromJsonErrorId.AllColumnElementsAreInvalid;
                            break;
                    }
                    return new Err(referenceableCreateFromJsonErrorId);
                } else {
                    const columnsCreatedFromJson = columnsResult.value;
                    const definition = new RevReferenceableGridLayoutDefinition(idResult.value, nameResult.value, columnsCreatedFromJson.columns, columnsCreatedFromJson.columnCreateErrorCount);
                    return new Ok(definition);
                }
            }
        }
    }

    export function is(definition: RevGridLayoutDefinition): definition is RevReferenceableGridLayoutDefinition {
        return 'name' in definition;
    }
}

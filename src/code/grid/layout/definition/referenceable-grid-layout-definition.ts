/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableGridLayoutDefinition } from '@xilytix/rev-data-source';
import { Err, ErrorCode, JsonElement, Ok, PickEnum, Result, UnreachableCaseError } from '../../../sys/internal-api';

export namespace ReferenceableGridLayoutDefinition {
    export function tryCreateReferenceableFromJson(element: JsonElement): Result<RevReferenceableGridLayoutDefinition> {
        const createResult = RevReferenceableGridLayoutDefinition.tryCreateReferenceableFromJson(element);
        if (createResult.isErr()) {
            const errorId = createResult.error;
            const errorCode = CreateErrorCode.fromErrorId(errorId);
            return new Err(errorCode);
        } else {
            return new Ok(createResult.value);
        }
    }

    export type CreateErrorCode = PickEnum<ErrorCode,
        ErrorCode.ReferenceableGridLayoutDefinition_IdJsonValueIsNotDefined |
        ErrorCode.ReferenceableGridLayoutDefinition_IdJsonValueIsNotOfTypeString |
        ErrorCode.ReferenceableGridLayoutDefinition_NameJsonValueIsNotDefined |
        ErrorCode.ReferenceableGridLayoutDefinition_NameJsonValueIsNotOfTypeString |
        ErrorCode.ReferenceableGridLayoutDefinition_ColumnsElementIsNotDefined |
        ErrorCode.ReferenceableGridLayoutDefinition_ColumnsElementIsNotAnArray |
        ErrorCode.ReferenceableGridLayoutDefinition_ColumnElementIsNotAnObject |
        ErrorCode.ReferenceableGridLayoutDefinition_AllColumnElementsAreInvalid
    >;

    export namespace CreateErrorCode {
        export function fromErrorId(errorId: RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId): CreateErrorCode {
            switch (errorId) {
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.IdJsonValueIsNotDefined:
                    return ErrorCode.ReferenceableGridLayoutDefinition_IdJsonValueIsNotDefined;
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.IdJsonValueIsNotOfTypeString:
                    return ErrorCode.ReferenceableGridLayoutDefinition_IdJsonValueIsNotOfTypeString;
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.NameJsonValueIsNotDefined:
                    return ErrorCode.ReferenceableGridLayoutDefinition_NameJsonValueIsNotDefined;
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.NameJsonValueIsNotOfTypeString:
                    return ErrorCode.ReferenceableGridLayoutDefinition_NameJsonValueIsNotOfTypeString;
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.ColumnsElementIsNotDefined:
                    return ErrorCode.ReferenceableGridLayoutDefinition_ColumnsElementIsNotDefined;
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.ColumnsElementIsNotAnArray:
                    return ErrorCode.ReferenceableGridLayoutDefinition_ColumnsElementIsNotAnArray;
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.ColumnElementIsNotAnObject:
                    return ErrorCode.ReferenceableGridLayoutDefinition_ColumnElementIsNotAnObject;
                case RevReferenceableGridLayoutDefinition.CreateReferenceableFromJsonErrorId.AllColumnElementsAreInvalid:
                    return ErrorCode.ReferenceableGridLayoutDefinition_AllColumnElementsAreInvalid;
                default:
                    throw new UnreachableCaseError('RGLDCECFEI59712', errorId);
            }
        }
    }
}

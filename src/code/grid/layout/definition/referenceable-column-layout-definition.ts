/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableColumnLayoutDefinition } from '@xilytix/rev-data-source';
import { Err, ErrorCode, JsonElement, Ok, PickEnum, Result, UnreachableCaseError } from '../../../sys/internal-api';

export namespace ReferenceableColumnLayoutDefinition {
    export function tryCreateReferenceableFromJson(element: JsonElement): Result<RevReferenceableColumnLayoutDefinition> {
        const createResult = RevReferenceableColumnLayoutDefinition.tryCreateReferenceableFromJson(element);
        if (createResult.isErr()) {
            const errorId = createResult.error;
            const errorCode = CreateErrorCode.fromErrorId(errorId);
            return new Err(errorCode);
        } else {
            return new Ok(createResult.value);
        }
    }

    export type CreateErrorCode = PickEnum<ErrorCode,
        ErrorCode.ReferenceableColumnLayoutDefinition_IdJsonValueIsNotDefined |
        ErrorCode.ReferenceableColumnLayoutDefinition_IdJsonValueIsNotOfTypeString |
        ErrorCode.ReferenceableColumnLayoutDefinition_NameJsonValueIsNotDefined |
        ErrorCode.ReferenceableColumnLayoutDefinition_NameJsonValueIsNotOfTypeString |
        ErrorCode.ReferenceableColumnLayoutDefinition_ColumnsElementIsNotDefined |
        ErrorCode.ReferenceableColumnLayoutDefinition_ColumnsElementIsNotAnArray |
        ErrorCode.ReferenceableColumnLayoutDefinition_ColumnElementIsNotAnObject |
        ErrorCode.ReferenceableColumnLayoutDefinition_AllColumnElementsAreInvalid
    >;

    export namespace CreateErrorCode {
        export function fromErrorId(errorId: RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId): CreateErrorCode {
            switch (errorId) {
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.IdJsonValueIsNotDefined:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_IdJsonValueIsNotDefined;
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.IdJsonValueIsNotOfTypeString:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_IdJsonValueIsNotOfTypeString;
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.NameJsonValueIsNotDefined:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_NameJsonValueIsNotDefined;
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.NameJsonValueIsNotOfTypeString:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_NameJsonValueIsNotOfTypeString;
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.ColumnsElementIsNotDefined:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_ColumnsElementIsNotDefined;
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.ColumnsElementIsNotAnArray:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_ColumnsElementIsNotAnArray;
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.ColumnElementIsNotAnObject:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_ColumnElementIsNotAnObject;
                case RevReferenceableColumnLayoutDefinition.CreateReferenceableFromJsonErrorId.AllColumnElementsAreInvalid:
                    return ErrorCode.ReferenceableColumnLayoutDefinition_AllColumnElementsAreInvalid;
                default:
                    throw new UnreachableCaseError('RGLDCECFEI59712', errorId);
            }
        }
    }
}

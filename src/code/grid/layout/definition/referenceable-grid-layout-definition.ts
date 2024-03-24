/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableGridLayoutDefinition } from '../../../rev/internal-api';
import { Err, ErrorCode, JsonElement, Ok, Result, UnreachableCaseError } from '../../../sys/internal-api';

export namespace ReferenceableGridLayoutDefinition {
    export function tryCreateReferenceableFromJson(element: JsonElement): Result<RevReferenceableGridLayoutDefinition> {
        const createResult = RevReferenceableGridLayoutDefinition.tryCreateReferenceableFromJson(element);
        if (createResult.isErr()) {
            const errorId = createResult.error;
            let errorCode: string;
            switch (errorId) {
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.IdJsonValueIsNotDefined:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_IdJsonValueIsNotDefined;
                    break;
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.IdJsonValueIsNotOfTypeString:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_IdJsonValueIsNotOfTypeString;
                    break;
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.NameJsonValueIsNotDefined:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_NameJsonValueIsNotDefined;
                    break;
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.NameJsonValueIsNotOfTypeString:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_NameJsonValueIsNotOfTypeString;
                    break;
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.ColumnsElementIsNotDefined:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_ColumnsElementIsNotDefined;
                    break;
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.ColumnsElementIsNotAnArray:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_ColumnsElementIsNotAnArray;
                    break;
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.ColumnElementIsNotAnObject:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_ColumnElementIsNotAnObject;
                    break;
                case RevReferenceableGridLayoutDefinition.ReferenceableCreateFromJsonErrorId.AllColumnElementsAreInvalid:
                    errorCode = ErrorCode.ReferenceableGridLayoutDefinition_AllColumnElementsAreInvalid;
                    break;
                default:
                    throw new UnreachableCaseError('RGLDTCRFJ59712', errorId);
            }
            return new Err(errorCode);
        } else {
            return new Ok(createResult.value);
        }
    }
}

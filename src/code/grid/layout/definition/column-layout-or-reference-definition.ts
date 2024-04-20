/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutOrReferenceDefinition } from '@xilytix/revgrid';
import { Err, ErrorCode, JsonElement, Ok, PickEnum, Result, UnreachableCaseError } from '../../../sys/internal-api';

/** @public */
export namespace ColumnLayoutOrReferenceDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<RevColumnLayoutOrReferenceDefinition> {
        const createResult = RevColumnLayoutOrReferenceDefinition.tryCreateFromJson(element);
        if (createResult.isErr()) {
            const errorId = createResult.error;
            const errorCode = LockErrorCode.fromId(errorId);
            return new Err(errorCode);
        } else {
            return new Ok(createResult.value);
        }
    }

    export type LockErrorCode = PickEnum<ErrorCode,
        ErrorCode.ColumnLayoutDefinitionOrReference_NeitherReferenceOrDefinitionJsonValueIsDefined |
        ErrorCode.ColumnLayoutDefinitionOrReference_BothReferenceAndDefinitionJsonValuesAreOfWrongType |
        ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionJsonValueIsNotOfTypeObject |
        ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionColumnsElementIsNotDefined |
        ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionColumnsElementIsNotAnArray |
        ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionColumnElementIsNotAnObject |
        ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionAllColumnElementsAreInvalid
    >;

    export namespace LockErrorCode {
        export function fromId(lockErrorId: RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId): LockErrorCode {
            switch (lockErrorId) {
                case RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId.NeitherReferenceOrDefinitionJsonValueIsDefined:
                    return ErrorCode.ColumnLayoutDefinitionOrReference_NeitherReferenceOrDefinitionJsonValueIsDefined;
                    break;
                case RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId.BothReferenceAndDefinitionJsonValuesAreOfWrongType:
                    return ErrorCode.ColumnLayoutDefinitionOrReference_BothReferenceAndDefinitionJsonValuesAreOfWrongType;
                    break;
                case RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionJsonValueIsNotOfTypeObject:
                    return ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionJsonValueIsNotOfTypeObject;
                    break;
                case RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnsElementIsNotDefined:
                    return ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionColumnsElementIsNotDefined;
                    break;
                case RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnsElementIsNotAnArray:
                    return ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionColumnsElementIsNotAnArray;
                    break;
                case RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnElementIsNotAnObject:
                    return ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionColumnElementIsNotAnObject;
                    break;
                case RevColumnLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionAllColumnElementsAreInvalid:
                    return ErrorCode.ColumnLayoutDefinitionOrReference_DefinitionAllColumnElementsAreInvalid;
                    break;
                default:
                    throw new UnreachableCaseError('GLORDTCFJ59712', lockErrorId);
            }
        }
    }
}

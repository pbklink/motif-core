/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutOrReferenceDefinition } from '@xilytix/rev-data-source';
import { Err, ErrorCode, JsonElement, Ok, PickEnum, Result, UnreachableCaseError } from '../../../sys/internal-api';

/** @public */
export namespace GridLayoutOrReferenceDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<RevGridLayoutOrReferenceDefinition> {
        const createResult = RevGridLayoutOrReferenceDefinition.tryCreateFromJson(element);
        if (createResult.isErr()) {
            const errorId = createResult.error;
            const errorCode = LockErrorCode.fromId(errorId);
            return new Err(errorCode);
        } else {
            return new Ok(createResult.value);
        }
    }

    export type LockErrorCode = PickEnum<ErrorCode,
        ErrorCode.GridLayoutDefinitionOrReference_NeitherReferenceOrDefinitionJsonValueIsDefined |
        ErrorCode.GridLayoutDefinitionOrReference_BothReferenceAndDefinitionJsonValuesAreOfWrongType |
        ErrorCode.GridLayoutDefinitionOrReference_DefinitionJsonValueIsNotOfTypeObject |
        ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnsElementIsNotDefined |
        ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnsElementIsNotAnArray |
        ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnElementIsNotAnObject |
        ErrorCode.GridLayoutDefinitionOrReference_DefinitionAllColumnElementsAreInvalid
    >;

    export namespace LockErrorCode {
        export function fromId(lockErrorId: RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId): LockErrorCode {
            switch (lockErrorId) {
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.NeitherReferenceOrDefinitionJsonValueIsDefined:
                    return ErrorCode.GridLayoutDefinitionOrReference_NeitherReferenceOrDefinitionJsonValueIsDefined;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.BothReferenceAndDefinitionJsonValuesAreOfWrongType:
                    return ErrorCode.GridLayoutDefinitionOrReference_BothReferenceAndDefinitionJsonValuesAreOfWrongType;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionJsonValueIsNotOfTypeObject:
                    return ErrorCode.GridLayoutDefinitionOrReference_DefinitionJsonValueIsNotOfTypeObject;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnsElementIsNotDefined:
                    return ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnsElementIsNotDefined;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnsElementIsNotAnArray:
                    return ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnsElementIsNotAnArray;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnElementIsNotAnObject:
                    return ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnElementIsNotAnObject;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionAllColumnElementsAreInvalid:
                    return ErrorCode.GridLayoutDefinitionOrReference_DefinitionAllColumnElementsAreInvalid;
                    break;
                default:
                    throw new UnreachableCaseError('GLORDTCFJ59712', lockErrorId);
            }
        }
    }
}

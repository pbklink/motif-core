/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutOrReferenceDefinition } from '../../../rev/internal-api';
import { Err, ErrorCode, JsonElement, Ok, Result, UnreachableCaseError } from '../../../sys/internal-api';

/** @public */
export namespace GridLayoutOrReferenceDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<RevGridLayoutOrReferenceDefinition> {
        const createResult = RevGridLayoutOrReferenceDefinition.tryCreateFromJson(element);
        if (createResult.isErr()) {
            const errorId = createResult.error;
            let errorCode: string;
            switch (errorId) {
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.NeitherReferenceOrDefinitionJsonValueIsDefined:
                    errorCode = ErrorCode.GridLayoutDefinitionOrReference_NeitherReferenceOrDefinitionJsonValueIsDefined;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.BothReferenceAndDefinitionJsonValuesAreOfWrongType:
                    errorCode = ErrorCode.GridLayoutDefinitionOrReference_BothReferenceAndDefinitionJsonValuesAreOfWrongType;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionJsonValueIsNotOfTypeObject:
                    errorCode = ErrorCode.GridLayoutDefinitionOrReference_DefinitionJsonValueIsNotOfTypeObject;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnsElementIsNotDefined:
                    errorCode = ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnsElementIsNotDefined;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnsElementIsNotAnArray:
                    errorCode = ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnsElementIsNotAnArray;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionColumnElementIsNotAnObject:
                    errorCode = ErrorCode.GridLayoutDefinitionOrReference_DefinitionColumnElementIsNotAnObject;
                    break;
                case RevGridLayoutOrReferenceDefinition.CreateFromJsonErrorId.DefinitionAllColumnElementsAreInvalid:
                    errorCode = ErrorCode.GridLayoutDefinitionOrReference_DefinitionAllColumnElementsAreInvalid;
                    break;
                default:
                    throw new UnreachableCaseError('GLORDTCFJ59712', errorId);
            }
            return new Err(errorCode);
        } else {
            return new Ok(createResult.value);
        }
    }
}

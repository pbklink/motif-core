/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutDefinition } from '../../../rev/internal-api';
import { BidAskPair, Err, ErrorCode, JsonElement, Ok, Result, UnreachableCaseError } from '../../../sys/internal-api';

/** @public */
export namespace GridLayoutDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<RevGridLayoutDefinition> {
        const createResult = RevGridLayoutDefinition.tryCreateFromJson(element);
        if (createResult.isErr()) {
            const errorId = createResult.error;
            let errorCode: string;
            switch (errorId) {
                case RevGridLayoutDefinition.CreateFromJsonErrorId.ColumnsElementIsNotDefined:
                    errorCode = ErrorCode.GridLayoutDefinition_ColumnsElementIsNotDefined;
                    break;
                case RevGridLayoutDefinition.CreateFromJsonErrorId.ColumnsElementIsNotAnArray:
                    errorCode = ErrorCode.GridLayoutDefinition_ColumnsElementIsNotAnArray;
                    break;
                case RevGridLayoutDefinition.CreateFromJsonErrorId.ColumnElementIsNotAnObject:
                    errorCode = ErrorCode.GridLayoutDefinition_ColumnElementIsNotAnObject;
                    break;
                case RevGridLayoutDefinition.CreateFromJsonErrorId.AllColumnElementsAreInvalid:
                    errorCode = ErrorCode.GridLayoutDefinition_AllColumnElementsAreInvalid;
                    break;
                default:
                    throw new UnreachableCaseError('GLDTCFJ59712', errorId);
            }
            return new Err(errorCode);
        } else {
            return new Ok(createResult.value);
        }
    }
}

export type BidAskGridLayoutDefinitions = BidAskPair<RevGridLayoutDefinition>;

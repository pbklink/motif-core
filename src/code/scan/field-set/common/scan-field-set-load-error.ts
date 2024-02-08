/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, Result } from '../../../sys/sys-internal-api';

export const enum ScanFieldSetLoadErrorTypeId {
    AndFieldHasOrChild,
    AndFieldHasXorChild,
    OrFieldHasAndChild,
    OrFieldHasXorChild,
    XOrFieldDoesNotHave2Children,
    XorFieldHasAndChild,
    XorFieldHasOrChild,
    XorFieldHasXorChild,
    AndFieldOperatorCannotBeNegated,
    OrFieldOperatorCannotBeNegated,
    XorFieldOperatorCannotBeNegated,
    AllConditionNotSupported,
    NoneConditionNotSupported,
    fieldConditionsOperationIdMismatch,
    NumericComparisonBooleanNodeDoesNotHaveANumericFieldValueGetOperand,
    NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
    FactoryCreateFieldError,
    FactoryCreateFieldConditionError,
}

export interface ScanFieldSetLoadError {
    typeId: ScanFieldSetLoadErrorTypeId;
    extra?: string;
}

export namespace ScanFieldSetLoadError {
    export function createErr<T>(typeId: ScanFieldSetLoadErrorTypeId, extra?: string): Result<T, ScanFieldSetLoadError> {
        const error: ScanFieldSetLoadError = {
            typeId,
            extra
        };
        return new Err(error);
    }
}

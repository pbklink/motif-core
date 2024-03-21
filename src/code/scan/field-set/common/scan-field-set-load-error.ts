/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../../res/internal-api';
import { EnumInfoOutOfOrderError, Err, Result } from '../../../sys/internal-api';

export const enum ScanFieldSetLoadErrorTypeId {
    AndFieldHasOrChild,
    AndFieldHasXorChild,
    OrFieldHasAndChild,
    OrFieldHasXorChild,
    XorFieldDoesNotHave2Children,
    XorFieldHasAndChild,
    XorFieldHasOrChild,
    XorFieldHasXorChild,
    AndFieldOperatorCannotBeNegated,
    OrFieldOperatorCannotBeNegated,
    XorFieldOperatorCannotBeNegated,
    AllConditionNotSupported,
    NoneConditionNotSupported,
    FieldConditionsOperationIdMismatch,
    NumericComparisonBooleanNodeDoesNotHaveANumericFieldValueGetOperand,
    NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
    FactoryCreateFieldError,
    FactoryCreateFieldConditionError,
}

export namespace ScanFieldSetLoadErrorType {
    export type Id = ScanFieldSetLoadErrorTypeId;

    interface Info {
        readonly id: Id;
        readonly displayId: StringId;
    }

    type InfosObject = { [id in keyof typeof ScanFieldSetLoadErrorTypeId]: Info };

    const infosObject: InfosObject = {
        AndFieldHasOrChild: {
            id: ScanFieldSetLoadErrorTypeId.AndFieldHasOrChild,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_AndFieldHasOrChild,
        },
        AndFieldHasXorChild: {
            id: ScanFieldSetLoadErrorTypeId.AndFieldHasXorChild,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_AndFieldHasXorChild,
        },
        OrFieldHasAndChild: {
            id: ScanFieldSetLoadErrorTypeId.OrFieldHasAndChild,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_OrFieldHasAndChild,
        },
        OrFieldHasXorChild: {
            id: ScanFieldSetLoadErrorTypeId.OrFieldHasXorChild,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_OrFieldHasXorChild,
        },
        XorFieldDoesNotHave2Children: {
            id: ScanFieldSetLoadErrorTypeId.XorFieldDoesNotHave2Children,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_XorFieldDoesNotHave2Children,
        },
        XorFieldHasAndChild: {
            id: ScanFieldSetLoadErrorTypeId.XorFieldHasAndChild,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_XorFieldHasAndChild,
        },
        XorFieldHasOrChild: {
            id: ScanFieldSetLoadErrorTypeId.XorFieldHasOrChild,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_XorFieldHasOrChild,
        },
        XorFieldHasXorChild: {
            id: ScanFieldSetLoadErrorTypeId.XorFieldHasXorChild,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_XorFieldHasXorChild,
        },
        AndFieldOperatorCannotBeNegated: {
            id: ScanFieldSetLoadErrorTypeId.AndFieldOperatorCannotBeNegated,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_AndFieldOperatorCannotBeNegated,
        },
        OrFieldOperatorCannotBeNegated: {
            id: ScanFieldSetLoadErrorTypeId.OrFieldOperatorCannotBeNegated,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_OrFieldOperatorCannotBeNegated,
        },
        XorFieldOperatorCannotBeNegated: {
            id: ScanFieldSetLoadErrorTypeId.XorFieldOperatorCannotBeNegated,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_XorFieldOperatorCannotBeNegated,
        },
        AllConditionNotSupported: {
            id: ScanFieldSetLoadErrorTypeId.AllConditionNotSupported,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_AllConditionNotSupported,
        },
        NoneConditionNotSupported: {
            id: ScanFieldSetLoadErrorTypeId.NoneConditionNotSupported,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_NoneConditionNotSupported,
        },
        FieldConditionsOperationIdMismatch: {
            id: ScanFieldSetLoadErrorTypeId.FieldConditionsOperationIdMismatch,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_FieldConditionsOperationIdMismatch,
        },
        NumericComparisonBooleanNodeDoesNotHaveANumericFieldValueGetOperand: {
            id: ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumericFieldValueGetOperand,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_NumericComparisonBooleanNodeDoesNotHaveANumericFieldValueGetOperand,
        },
        NumericComparisonBooleanNodeDoesNotHaveANumberOperand: {
            id: ScanFieldSetLoadErrorTypeId.NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_NumericComparisonBooleanNodeDoesNotHaveANumberOperand,
        },
        FactoryCreateFieldError: {
            id: ScanFieldSetLoadErrorTypeId.FactoryCreateFieldError,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_FactoryCreateFieldError,
        },
        FactoryCreateFieldConditionError: {
            id: ScanFieldSetLoadErrorTypeId.FactoryCreateFieldConditionError,
            displayId: StringId.ScanFieldSetLoadErrorTypeDisplay_FactoryCreateFieldConditionError,
        },
    } as const;

    const infos = Object.values(infosObject);
    export const idCount = infos.length;

    export function initialise() {
        for (let id = 0; id < idCount; id++) {
            if (infos[id].id !== id as Id) {
                throw new EnumInfoOutOfOrderError('LitIvemDetail.Field', id, idToDisplay(id));
            }
        }
    }

    export function idToDisplayId(id: Id) {
        return infos[id].displayId;
    }

    export function idToDisplay(id: Id): string {
        return Strings[idToDisplayId(id)];
    }
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

    export function isUndefinableEqual(left: ScanFieldSetLoadError | undefined, right: ScanFieldSetLoadError | undefined): boolean {
        if (left === undefined) {
            return right === undefined;
        } else {
            return right === undefined ? false : isEqual(left, right);
        }
    }

    export function isEqual(left: ScanFieldSetLoadError, right: ScanFieldSetLoadError): boolean {
        return left.typeId === right.typeId && left.extra === right.extra;
    }
}

export namespace ScanFieldSetLoadErrorModule {
    export function initialise() {
        ScanFieldSetLoadErrorType.initialise();
    }
}

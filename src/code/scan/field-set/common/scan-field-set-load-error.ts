/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export const enum ScanFieldSetLoadErrorTypeId {
    // ConditionSet
    XorSetOperationNotSupported,
    UnexpectedConditionSetOperandTypeId,
    UnexpectedFieldSetOperandTypeId,
    ConditionNodeTypeIsNotSupported,
    XorFieldBooleanOperationNotSupported,
    FieldDoesNotHaveRequiredBooleanOperationId,
    // Conditions
    NotOfAllNotSupported,
    NotOfNoneNotSupported,
    LeftAndRightNumericComparisonOperandTypesAreBothNumber,
    LeftNumericComparisonOperandTypeIsNotSupported,
    RightNumericComparisonOperandTypeIsNotSupported,
}

export interface ScanFieldSetLoadError {
    typeId: ScanFieldSetLoadErrorTypeId;
    extra?: string;
}

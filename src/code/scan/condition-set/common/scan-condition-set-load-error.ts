export const enum ScanConditionSetLoadErrorTypeId {
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

export interface ScanConditionSetLoadError {
    typeId: ScanConditionSetLoadErrorTypeId;
    extra: string;
}

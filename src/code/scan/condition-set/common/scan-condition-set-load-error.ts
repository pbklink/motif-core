export const enum ScanConditionSetLoadErrorTypeId {
    // ConditionSet
    ConditionsNodeTypeNotSupported,
    ConditionNodeTypeIsNotSupported,
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

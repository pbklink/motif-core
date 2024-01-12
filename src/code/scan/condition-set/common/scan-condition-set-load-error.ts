export const enum ScanConditionSetLoadErrorTypeId {
    // ConditionSet
    UnsupportedConditionsNodeType,
    UnsupportedConditionNodeType,
    LeftAndRightNumericComparisonOperandTypesAreBothNumber,
    LeftNumericComparisonOperandTypeIsUnsupported,
    RightNumericComparisonOperandTypeIsUnsupported,
}

export interface ScanConditionSetLoadError {
    typeId: ScanConditionSetLoadErrorTypeId;
    extra: string;
}

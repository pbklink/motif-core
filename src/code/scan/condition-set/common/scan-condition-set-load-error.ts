export const enum ScanConditionSetLoadErrorTypeId {
    // ConditionSet
    UnsupportedConditionsNodeType,
    UnsupportedConditionNodeType,
    UnsupportedNumericComparisonOperandType,
}

export interface ScanConditionSetLoadError {
    typeId: ScanConditionSetLoadErrorTypeId;
    extra: string;
}

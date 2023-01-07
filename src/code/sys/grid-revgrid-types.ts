/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Halign,
    HalignEnum,
    RevRecordField,
    RevRecordFieldIndex,
    RevRecordIndex,
    RevRecordInvalidatedValue,
    RevRecordMainAdapter,
    RevRecordStore,
    RevRecordValueRecentChangeTypeId
} from "revgrid";

// Aliases for RevGrid types (so that revgrid is only imported here for grid sub projects)

/**
 * Corresponds to Halign
 * @public
 */
export type GridFieldHAlign = Halign;
/**
 * Corresponds to HalignEnum
 * @public
 */
export namespace GridFieldHAlign {
    export const left = HalignEnum.left;
    export const right = HalignEnum.right;
    export const center = HalignEnum.center;
    export const start = HalignEnum.start;
    export const end = HalignEnum.end;
}

/** @public */
export type ValueRecentChangeTypeId = RevRecordValueRecentChangeTypeId;

/** @public */
export namespace ValueRecentChangeTypeId {
    export const Update = RevRecordValueRecentChangeTypeId.Update;
    export const Increase = RevRecordValueRecentChangeTypeId.Increase;
    export const Decrease = RevRecordValueRecentChangeTypeId.Decrease;
}

/** @internal */
export type GridRecordIndex = RevRecordIndex;
/** @internal */
export type GridRecordFieldIndex = RevRecordFieldIndex;
/** @internal */
export type GridRecordInvalidatedValue = RevRecordInvalidatedValue;
/** @internal */
export type GridSortFieldSpecifier = RevRecordMainAdapter.SortFieldSpecifier;
/** @public */
export type GridRevRecordField = RevRecordField;
/** @internal */
export type GridRecordStore = RevRecordStore;
/** @internal */
export type GridRecordStoreRecordsEventers = RevRecordStore.RecordsEventers;

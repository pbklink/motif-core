/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Halign, RevRecordField,
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
    export const left = 'left';
    export const right = 'right';
    export const center = 'center';
    export const start = 'start';
    export const end = 'end';
}

/** @public */
export type ValueRecentChangeTypeId = RevRecordValueRecentChangeTypeId;

/** @public */
export namespace ValueRecentChangeTypeId {
    export const Update = RevRecordValueRecentChangeTypeId.Update;
    export const Increase = RevRecordValueRecentChangeTypeId.Increase;
    export const Decrease = RevRecordValueRecentChangeTypeId.Decrease;
}

/** @public */
export type GridRecordIndex = RevRecordIndex;
/** @public */
export type GridRecordFieldIndex = RevRecordFieldIndex;
/** @public */
export type GridRecordInvalidatedValue = RevRecordInvalidatedValue;
/** @public */
export type GridSortFieldSpecifier = RevRecordMainAdapter.SortFieldSpecifier;
/** @public */
export type GridRevRecordField = RevRecordField;
/** @public */
export type GridRecordStore = RevRecordStore;
/** @public */
export type GridRecordStoreRecordsEventers = RevRecordStore.RecordsEventers;

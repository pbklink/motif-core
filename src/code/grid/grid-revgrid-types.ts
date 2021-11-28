/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Halign,
    RevRecord,
    RevRecordField,
    RevRecordFieldIndex,
    RevRecordIndex,
    RevRecordInvalidatedValue,
    RevRecordMainAdapter,
    RevRecordStore
} from "revgrid";

// Aliases for RevGrid types (so that revgrid is only imported here for grid sub projects)

export type GridHalign = Halign;
export type GridRecordIndex = RevRecordIndex;
export type GridRecordFieldIndex = RevRecordFieldIndex;
export type GridRecordInvalidatedValue = RevRecordInvalidatedValue;
export type GridSortFieldSpecifier = RevRecordMainAdapter.SortFieldSpecifier;
export type GridRecord = RevRecord;
export type GridRecordField = RevRecordField;
export type GridRecordStore = RevRecordStore;
export type GridRecordStoreFieldsEventers = RevRecordStore.FieldsEventers;
export type GridRecordStoreRecordsEventers = RevRecordStore.RecordsEventers;

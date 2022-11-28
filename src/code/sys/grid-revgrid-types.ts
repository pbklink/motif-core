/**
 * %license Motif
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

/** @public */
export type GridHalign = Halign;
/** @public */
export const enum GridHalignEnum {
    Left = 'left',
    Right = 'right',
    Center = 'center',
    Start = 'start',
    End = 'end'
}

/** @internal */
export type GridRecordIndex = RevRecordIndex;
/** @internal */
export type GridRecordFieldIndex = RevRecordFieldIndex;
/** @internal */
export type GridRecordInvalidatedValue = RevRecordInvalidatedValue;
/** @internal */
export type GridSortFieldSpecifier = RevRecordMainAdapter.SortFieldSpecifier;
/** @internal */
export type GridRecord = RevRecord;
/** @public */
export interface GridRecordField extends RevRecordField {
    readonly initialHeading: string;
    readonly initialTextAlign: GridHalign;
}
/** @internal */
export type GridRecordStore = RevRecordStore;
/** @internal */
export type GridRecordStoreFieldsEventers = RevRecordStore.FieldsEventers;
/** @internal */
export type GridRecordStoreRecordsEventers = RevRecordStore.RecordsEventers;

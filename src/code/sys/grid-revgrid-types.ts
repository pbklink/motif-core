/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    RevRecordDataServer,
    RevRecordField,
    RevRecordFieldIndex,
    RevRecordIndex,
    RevRecordInvalidatedValue,
    RevRecordStore,
    RevRecordValueRecentChangeTypeId
} from '@xilytix/rev-data-source';
import {
    DataServer,
    HorizontalAlign,
} from '@xilytix/revgrid';

// Aliases for RevGrid types (so that revgrid is only imported here for grid sub projects)

/**
 * Corresponds to Halign
 * @public
 */
export type GridFieldHorizontalAlign = HorizontalAlign;
/**
 * Corresponds to HalignEnum
 * @public
 */
export namespace GridFieldHorizontalAlign {
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
export type GridDataEditValue = DataServer.EditValue;

/** @public */
export type GridRecordIndex = RevRecordIndex;
/** @public */
export type GridRecordFieldIndex = RevRecordFieldIndex;
/** @public */
export type GridRecordInvalidatedValue = RevRecordInvalidatedValue;
/** @public */
export type GridSortFieldSpecifier = RevRecordDataServer.SortFieldSpecifier;
/** @public */
export type GridRevRecordField = RevRecordField;
/** @public */
export type GridRecordStore = RevRecordStore;
/** @public */
export type GridRecordStoreRecordsEventers = RevRecordStore.RecordsEventers;

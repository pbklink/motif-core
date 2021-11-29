/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout } from 'grid-layout-internal-api';
import {
    GridRecordField,
    GridRecordIndex,
    GridRecordStore,
    GridRecordStoreFieldsEventers,
    GridRecordStoreRecordsEventers
} from "grid-revgrid-types";
import { IntegerRenderValue, StringRenderValue } from 'services-internal-api';
import { GridRecordFieldState } from './grid-record-field-state';

export class GridLayoutRecordStore implements GridRecordStore {
    fieldsEventers: GridRecordStoreFieldsEventers;
    recordsEventers: GridRecordStoreRecordsEventers;

    private _layout: GridLayout;
    private _headersMap: GridLayoutRecordStore.FieldNameToHeaderMap;

    constructor() { }

    get recordCount(): number {
        return this._layout.columnCount;
    }

    setFieldEventers(fieldsEventers: GridRecordStoreFieldsEventers): void {
        this.fieldsEventers = fieldsEventers;
    }

    setRecordEventers(recordsEventers: GridRecordStoreRecordsEventers): void {
        this.recordsEventers = recordsEventers;
    }

    getLayout() {
        return this._layout;
    }

    setData(layoutWithHeadings: GridLayoutRecordStore.LayoutWithHeadersMap) {
        this._layout = layoutWithHeadings.layout;
        this._layout.reindexColumns();
        this._headersMap = layoutWithHeadings.headersMap;
    }

    clearData() {
        this._layout = new GridLayout(); // replace with empty one
        this._headersMap.clear();
    }

    createPositionField() { return new GridLayoutRecordStore.PositionField(this._layout); }
    createNameField() { return new GridLayoutRecordStore.NameField(); }
    createHeadingField() { return new GridLayoutRecordStore.HeadingField(this._headersMap); }
    createVisibleField() { return new GridLayoutRecordStore.VisibleField(); }
    createWidthField() { return new GridLayoutRecordStore.WidthField(); }
    createSortPriorityField() { return new GridLayoutRecordStore.SortPriorityField(); }
    createSortAscendingField() { return new GridLayoutRecordStore.SortAscendingField(); }

    /*createFields(): GridField[] {
        const result = new Array<GridField>(7);
        result[0] = new GridLayoutDataStore.PositionField(this._layout);
        result[1] = new GridLayoutDataStore.NameField();
        result[2] = new GridLayoutDataStore.HeadingField(this._headingsMap);
        result[3] = new GridLayoutDataStore.VisibleField();
        result[4] = new GridLayoutDataStore.WidthField();
        result[5] = new GridLayoutDataStore.SortPriorityField();
        result[6] = new GridLayoutDataStore.SortAscendingField();

        return result;
    }*/

    getRecord(index: GridRecordIndex) {
        return this._layout.getRecord(index);
    }

    getRecords() {
        return this._layout.getRecords();
    }
}

export namespace GridLayoutRecordStore {
    export type FieldNameToHeaderMap = Map<string, string | undefined>;

    export interface LayoutWithHeadersMap {
        layout: GridLayout;
        headersMap: FieldNameToHeaderMap;
    }

    export namespace FieldName {
        export const position = 'Position';
        export const name = 'Name';
        export const heading = 'Heading';
        export const visible = 'Visible';
        export const width = 'Width';
        export const sortPriority = 'Sort Priority';
        export const sortAscending = 'Sort Ascending';
    }

    export class PositionField implements GridRecordField {
        readonly name = FieldName.position;
        constructor(private _layout: GridLayout) {
        }

        getValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            const index = this._layout.indexOfColumn(record);
            return new IntegerRenderValue(index);
        }
    }

    export class NameField implements GridRecordField {
        readonly name = FieldName.name;

        getValue(record: GridLayout.RecordColumn): StringRenderValue {
            return new StringRenderValue(record.field.name);
        }
    }

    export class HeadingField implements GridRecordField {
        readonly name = FieldName.heading;

        constructor(private _headersMap: GridLayoutRecordStore.FieldNameToHeaderMap) {
        }

        getValue(record: GridLayout.RecordColumn): StringRenderValue {
            const heading = this._headersMap.get(record.field.name);
            return new StringRenderValue(heading === undefined ? record.field.name : heading);
        }
    }

    export class VisibleField implements GridRecordField {
        readonly name = FieldName.visible;

        getValue(record: GridLayout.RecordColumn): StringRenderValue {
            return new StringRenderValue(record.visible ? 'Y' : '');
        }
    }

    export class WidthField implements GridRecordField {
        readonly name = FieldName.width;

        getValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            return new IntegerRenderValue(record.width);
        }
    }

    export class SortPriorityField implements GridRecordField {
        readonly name = FieldName.sortPriority;

        getValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            return new IntegerRenderValue(record.sortPriority);
        }
    }

    export class SortAscendingField implements GridRecordField {
        readonly name = FieldName.sortAscending;

        getValue(record: GridLayout.RecordColumn): StringRenderValue {
            const sortAscending = record.sortAscending;
            let value: string | undefined;
            if (sortAscending === undefined) {
                value = undefined;
            } else {
                value = sortAscending ? '+' : '-';
            }
            return new StringRenderValue(value);
        }
    }

    export const StringGridFieldState: GridRecordFieldState = {
        header: undefined,
        width: undefined,
        alignment: 'left'
    };
    export const IntegerGridFieldState: GridRecordFieldState = {
        header: undefined,
        width: undefined,
        alignment: 'right'
    };
}

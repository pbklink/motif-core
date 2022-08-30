/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout } from '../../grid/layout/grid-layout-internal-api';
import { IntegerRenderValue, RenderValue, StringRenderValue } from '../../services/services-internal-api';
import { Integer, ValueRecentChangeTypeId } from '../../sys/sys-internal-api';
import {
    GridRecordField,
    GridRecordFieldIndex,
    GridRecordIndex,
    GridRecordStore,
    GridRecordStoreFieldsEventers,
    GridRecordStoreRecordsEventers
} from '../grid-revgrid-types';
import { GridRecordFieldState } from './grid-record-field-state';

export class GridLayoutRecordStore implements GridRecordStore {
    private _layout: GridLayout;
    private _headersMap: GridLayoutRecordStore.FieldNameToHeaderMap;

    private _fieldsEventers: GridRecordStoreFieldsEventers;
    private _recordsEventers: GridRecordStoreRecordsEventers;

    get recordCount(): number {
        return this._layout.columnCount;
    }

    setFieldEventers(fieldsEventers: GridRecordStoreFieldsEventers): void {
        this._fieldsEventers = fieldsEventers;
    }

    setRecordEventers(recordsEventers: GridRecordStoreRecordsEventers): void {
        this._recordsEventers = recordsEventers;
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

    addFields(fields: readonly GridLayoutRecordStore.Field[]) {
        this._fieldsEventers.addFields(fields);
    }

    recordsLoaded() {
        this._recordsEventers.recordsLoaded();
    }

    recordsInserted(recordIndex: GridRecordIndex, count: Integer) {
        this._recordsEventers.recordsInserted(recordIndex, count);
    }

    invalidateValue(fieldIndex: GridRecordFieldIndex, recordIndex: GridRecordIndex, valueRecentChangeTypeId?: ValueRecentChangeTypeId) {
        this._recordsEventers.invalidateValue(fieldIndex, recordIndex, valueRecentChangeTypeId);
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

    export abstract class Field implements GridRecordField {
        constructor(readonly name: string) {

        }

        abstract getValue(record: GridLayout.RecordColumn): RenderValue;
    }

    export class PositionField extends Field {
        constructor(private _layout: GridLayout) {
            super(FieldName.position);
        }

        getValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            const index = this._layout.indexOfColumn(record);
            return new IntegerRenderValue(index);
        }
    }

    export class NameField extends Field {
        constructor() {
            super(FieldName.name);
        }

        getValue(record: GridLayout.RecordColumn): StringRenderValue {
            return new StringRenderValue(record.field.name);
        }
    }

    export class HeadingField extends Field {
        constructor(private _headersMap: GridLayoutRecordStore.FieldNameToHeaderMap) {
            super(FieldName.heading);
        }

        getValue(record: GridLayout.RecordColumn): StringRenderValue {
            const heading = this._headersMap.get(record.field.name);
            return new StringRenderValue(heading === undefined ? record.field.name : heading);
        }
    }

    export class VisibleField extends Field {
        constructor() {
            super(FieldName.visible);
        }

        getValue(record: GridLayout.RecordColumn): StringRenderValue {
            return new StringRenderValue(record.visible ? 'Y' : '');
        }
    }

    export class WidthField extends Field {
        constructor() {
            super(FieldName.width);
        }

        getValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            return new IntegerRenderValue(record.width);
        }
    }

    export class SortPriorityField extends Field {
        constructor() {
            super(FieldName.sortPriority);
        }

        getValue(record: GridLayout.RecordColumn): IntegerRenderValue {
            return new IntegerRenderValue(record.sortPriority);
        }
    }

    export class SortAscendingField extends Field {
        constructor() {
            super(FieldName.sortAscending);
        }

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

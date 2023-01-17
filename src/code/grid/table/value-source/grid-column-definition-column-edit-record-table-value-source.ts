/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, MultiEvent, UnreachableCaseError, ValueRecentChangeTypeId } from '../../../sys/sys-internal-api';
import { GridLayoutDefinitionColumnEditRecord } from '../../layout/grid-layout-internal-api';
import { GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { IntegerTableValue, StringTableValue, TableValue, VisibleTableValue } from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class GridLayoutDefinitionColumnEditRecordTableValueSource extends TableValueSource {
    private _widthChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _visibleChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        firstFieldIndexOffset: Integer,
        private readonly _record: GridLayoutDefinitionColumnEditRecord,
    ) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._widthChangedSubscriptionId = this._record.subscribeWidthChangedEvent(
            (changedFieldId) => this.handleWidthChangedEvent(changedFieldId)
        );
        this._visibleChangedSubscriptionId = this._record.subscribeVisibleChangedEvent(
            () => this.handleVisibleChangedEvent()
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._widthChangedSubscriptionId !== undefined) {
            this._record.unsubscribeWidthChangedEvent(this._widthChangedSubscriptionId);
            this._widthChangedSubscriptionId = undefined;
        }
        if (this._visibleChangedSubscriptionId !== undefined) {
            this._record.unsubscribeVisibleChangedEvent(this._visibleChangedSubscriptionId);
            this._visibleChangedSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = GridLayoutDefinitionColumnEditRecord.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldId = 0; fieldId < fieldCount; fieldId++) {
            const value = this.createTableValue(fieldId);
            this.loadValue(fieldId, value);
            result[fieldId] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._record;
    }

    protected getfieldCount(): Integer {
        return GridLayoutDefinitionColumnEditRecord.Field.count;
    }

    private handleWidthChangedEvent(recordValueChange: GridLayoutDefinitionColumnEditRecord.ValueChange) {
        const { fieldId, recentChangeTypeId } = recordValueChange;
        const newValue = this.createTableValue(fieldId);
        this.loadValue(fieldId, newValue);
        const valueChange: TableValueSource.ValueChange = { fieldIndex: fieldId, newValue, recentChangeTypeId };
        this.notifyValueChangesEvent([valueChange]);
    }

    private handleVisibleChangedEvent() {
        const fieldId = GridLayoutDefinitionColumnEditRecord.FieldId.Visible;
        const newValue = this.createTableValue(fieldId);
        this.loadValue(fieldId, newValue);
        const valueChange: TableValueSource.ValueChange = { fieldIndex: fieldId, newValue, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        this.notifyValueChangesEvent([valueChange]);
    }

    private createTableValue(fieldId: GridLayoutDefinitionColumnEditRecord.FieldId) {
        const constructor = GridLayoutDefinitionColumnEditRecordTableFieldSourceDefinition.Field.idToTableValueConstructor(fieldId);
        return new constructor();
    }

    private loadValue(id: GridLayoutDefinitionColumnEditRecord.FieldId, value: TableValue) {
        switch (id) {
            case GridLayoutDefinitionColumnEditRecord.FieldId.FieldName:
                (value as StringTableValue).data = this._record.fieldName;
                break;
            case GridLayoutDefinitionColumnEditRecord.FieldId.FieldSourceName:
                (value as StringTableValue).data = this._record.fieldSourceName;
                break;
            case GridLayoutDefinitionColumnEditRecord.FieldId.FieldHeading:
                (value as StringTableValue).data = this._record.fieldHeading;
                break;
            case GridLayoutDefinitionColumnEditRecord.FieldId.Width:
                (value as IntegerTableValue).data = this._record.width;
                break;
            case GridLayoutDefinitionColumnEditRecord.FieldId.Visible:
                (value as VisibleTableValue).data = this._record.visible;
                break;
            default:
                throw new UnreachableCaseError('GCDCERTVSLVU29922', id);
        }
    }
}

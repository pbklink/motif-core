/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordValueRecentChangeTypeId } from '@xilytix/revgrid';
import { RenderValue } from '../../../services/render-value';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/internal-api';
import { IntegerTableValue, StringTableValue, TableValue, TableValueSource, VisibleTableValue } from '../../table/internal-api';
import { EditableColumnLayoutDefinitionColumn } from './editable-column-layout-definition-column';
import { EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition } from './editable-column-layout-definition-column-table-field-source-definition';

export class EditableColumnLayoutDefinitionColumnTableValueSource extends TableValueSource {
    private _widthChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _visibleChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        firstFieldIndexOffset: Integer,
        private readonly _record: EditableColumnLayoutDefinitionColumn,
    ) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._widthChangedSubscriptionId = this._record.subscribeWidthChangedEvent(
            (changedFieldId) => { this.handleWidthChangedEvent(changedFieldId); }
        );
        this._visibleChangedSubscriptionId = this._record.subscribeVisibleChangedEvent(
            () => { this.handleVisibleChangedEvent(); }
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
        const fieldCount = EditableColumnLayoutDefinitionColumn.Field.count;
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
        return EditableColumnLayoutDefinitionColumn.Field.count;
    }

    private handleWidthChangedEvent(recordValueChange: EditableColumnLayoutDefinitionColumn.ValueChange) {
        const { fieldId, recentChangeTypeId } = recordValueChange;
        const newValue = this.createTableValue(fieldId);
        this.loadValue(fieldId, newValue);
        const valueChange: TableValueSource.ValueChange = { fieldIndex: fieldId, newValue, recentChangeTypeId };
        this.notifyValueChangesEvent([valueChange]);
    }

    private handleVisibleChangedEvent() {
        const fieldId = EditableColumnLayoutDefinitionColumn.FieldId.Visible;
        const newValue = this.createTableValue(fieldId);
        this.loadValue(fieldId, newValue);
        const valueChange: TableValueSource.ValueChange = { fieldIndex: fieldId, newValue, recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update };
        this.notifyValueChangesEvent([valueChange]);
    }

    private createTableValue(fieldId: EditableColumnLayoutDefinitionColumn.FieldId) {
        const constructor = EditableColumnLayoutDefinitionColumnTableFieldSourceDefinition.Field.idToTableValueConstructor(fieldId);
        return new constructor();
    }

    private loadValue(id: EditableColumnLayoutDefinitionColumn.FieldId, value: TableValue) {
        switch (id) {
            case EditableColumnLayoutDefinitionColumn.FieldId.FieldName:
                (value as StringTableValue).data = this._record.fieldName;
                if (this._record.anchored) {
                    value.addRenderAttribute(RenderValue.greyedOutAttribute);
                }
                break;
            case EditableColumnLayoutDefinitionColumn.FieldId.FieldSourceName:
                (value as StringTableValue).data = this._record.fieldSourceName;
                if (this._record.anchored) {
                    value.addRenderAttribute(RenderValue.greyedOutAttribute);
                }
                break;
            case EditableColumnLayoutDefinitionColumn.FieldId.FieldHeading:
                (value as StringTableValue).data = this._record.fieldHeading;
                if (this._record.anchored) {
                    value.addRenderAttribute(RenderValue.greyedOutAttribute);
                }
                break;
            case EditableColumnLayoutDefinitionColumn.FieldId.Width:
                (value as IntegerTableValue).data = this._record.width;
                break;
            case EditableColumnLayoutDefinitionColumn.FieldId.Visible:
                (value as VisibleTableValue).data = this._record.visible;
                break;
            default:
                throw new UnreachableCaseError('GCDCERTVSLVU29922', id);
        }
    }
}

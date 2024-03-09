/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectoryItem } from '../../../services/services-internal-api';
import { Integer, MultiEvent, UnreachableCaseError, ValueRecentChangeTypeId } from '../../../sys/internal-api';
import { RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { CorrectnessTableValue, RankedLitIvemIdListDirectoryItemTypeIdCorrectnessTableValue, ReadonlyCorrectnessTableValue, StringCorrectnessTableValue, TableValue } from '../value/grid-table-value-internal-api';
import { CorrectnessTableValueSource } from './correctness-table-value-source';
import { TableValueSource } from './table-value-source';

export class RankedLitIvemIdListDirectoryItemTableValueSource extends CorrectnessTableValueSource<RankedLitIvemIdListDirectoryItem> {
    private _directoryItemChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        firstFieldIndexOffset: Integer,
        private readonly _directoryItem: RankedLitIvemIdListDirectoryItem,
    ) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._directoryItemChangedSubscriptionId = this._directoryItem.subscribeDirectoryItemChangedEvent(
            (changedFieldId) => { this.handleDirectoryItemChangedEvent(changedFieldId); }
        );

        return super.activate();
    }

    override deactivate() {
        this._directoryItem.unsubscribeDirectoryItemChangedEvent(this._directoryItemChangedSubscriptionId);
        this._directoryItemChangedSubscriptionId = undefined;

        super.deactivate();
    }

    getAllValues(): TableValue[] {
        const fieldCount = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._directoryItem;
    }

    protected getfieldCount(): Integer {
        return RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.count;
    }

    private handleDirectoryItemChangedEvent(changeValueFieldIds: RankedLitIvemIdListDirectoryItem.FieldId[]) {
        const changeValueFieldIdCount = changeValueFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changeValueFieldIdCount);
        let foundCount = 0;
        for (let i = 0; i < changeValueFieldIdCount; i++) {
            const fieldId = changeValueFieldIds[i];
            const fieldIndex = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: ValueRecentChangeTypeId.Update };
            }
        }
        if (foundCount < changeValueFieldIdCount) {
            valueChanges.length = foundCount;
        }
    }

    private createTableValue(fieldIndex: Integer) {
        const constructor = RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIndex);
        return new constructor();
    }

    private loadValue(id: RankedLitIvemIdListDirectoryItem.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._directoryItem.correctnessId;

        switch (id) {
            case RankedLitIvemIdListDirectoryItem.FieldId.TypeId:
                (value as RankedLitIvemIdListDirectoryItemTypeIdCorrectnessTableValue).data = this._directoryItem.directoryItemTypeId;
                break;
            case RankedLitIvemIdListDirectoryItem.FieldId.Id:
                (value as StringCorrectnessTableValue).data = this._directoryItem.id;
                break;
            case RankedLitIvemIdListDirectoryItem.FieldId.Readonly:
                (value as ReadonlyCorrectnessTableValue).data = this._directoryItem.readonly;
                break;
            case RankedLitIvemIdListDirectoryItem.FieldId.Name:
                (value as StringCorrectnessTableValue).data = this._directoryItem.name;
                break;
            case RankedLitIvemIdListDirectoryItem.FieldId.Description:
                (value as StringCorrectnessTableValue).data = this._directoryItem.description;
                break;
            default:
                throw new UnreachableCaseError('RLIILDITVSLV22272', id);
        }
    }
}

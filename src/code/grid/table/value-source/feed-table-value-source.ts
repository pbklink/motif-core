/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from '../../../adi/internal-api';
import { Correctness, Integer, MultiEvent, UnreachableCaseError, ValueRecentChangeTypeId } from '../../../sys/internal-api';
import { FeedTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    CorrectnessTableValue,
    EnumCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from '../value/internal-api';
import { TableValueSource } from './table-value-source';

export class FeedTableValueSource extends TableValueSource {
    private _statusChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _correctnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _feed: Feed) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._statusChangedEventSubscriptionId = this._feed.subscribeStatusChangedEvent(
            () => { this.handleStatusChangedEvent(); }
        );
        this._correctnessChangedEventSubscriptionId = this._feed.subscribeCorrectnessChangedEvent(
            () => { this.handleCorrectnessChangedEvent(); }
        );

        this.initialiseBeenIncubated(Correctness.idIsIncubated(this._feed.correctnessId));

        return this.getAllValues();
    }

    deactivate() {
        if (this._statusChangedEventSubscriptionId !== undefined) {
            this._feed.unsubscribeStatusChangedEvent(this._statusChangedEventSubscriptionId);
            this._statusChangedEventSubscriptionId = undefined;
        }
        if (this._correctnessChangedEventSubscriptionId !== undefined) {
            this._feed.unsubscribeCorrectnessChangedEvent(this._correctnessChangedEventSubscriptionId);
            this._correctnessChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = FeedTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = FeedTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return FeedTableFieldSourceDefinition.Field.count;
    }

    private handleStatusChangedEvent() {
        const fieldId = Feed.FieldId.StatusId;
        const fieldIndex = FeedTableFieldSourceDefinition.Field.indexOfId(fieldId);
        if (fieldIndex >= 0) {
            const newValue = this.createTableValue(fieldIndex);
            this.loadValue(fieldId, newValue);
            const changedValues: TableValueSource.ValueChange[] = [{
                fieldIndex,
                newValue,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            }];
            this.notifyValueChangesEvent(changedValues);
        }
    }

    private handleCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        this.processDataCorrectnessChanged(allValues, Correctness.idIsIncubated(this._feed.correctnessId));
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = FeedTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Feed.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._feed.correctnessId;

        switch (id) {
            case Feed.FieldId.Id:
                (value as IntegerCorrectnessTableValue).data = this._feed.id;
                break;
            case Feed.FieldId.EnvironmentDisplay:
                (value as StringCorrectnessTableValue).data = this._feed.environmentDisplay;
                break;
            case Feed.FieldId.Name:
                (value as StringCorrectnessTableValue).data = this._feed.display;
                break;
            case Feed.FieldId.ClassId:
                (value as EnumCorrectnessTableValue).data = this._feed.classId;
                break;
            case Feed.FieldId.StatusId:
                (value as EnumCorrectnessTableValue).data = this._feed.statusId;
                break;
            default:
                throw new UnreachableCaseError('FTVSLV9112473', id);
        }
    }
}

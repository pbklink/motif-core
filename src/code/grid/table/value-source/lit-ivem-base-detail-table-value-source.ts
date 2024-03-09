/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, LitIvemBaseDetail } from '../../../adi/adi-internal-api';
import { CorrectnessRecord, Integer, MultiEvent, UnreachableCaseError } from '../../../sys/internal-api';
import { LitIvemBaseDetailTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    CorrectnessTableValue,
    ExchangeIdCorrectnessTableValue,
    IvemClassIdCorrectnessTableValue,
    LitIvemIdCorrectnessTableValue,
    MarketIdArrayCorrectnessTableValue,
    MarketIdCorrectnessTableValue,
    PublisherSubscriptionDataTypeIdArrayCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class LitIvemBaseDetailTableValueSource extends TableValueSource {
    private _litIvemDetailBaseChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemBaseDetail: LitIvemBaseDetail, private list: CorrectnessRecord) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._litIvemDetailBaseChangedEventSubscriptionId = this._litIvemBaseDetail.subscribeBaseChangeEvent(
            (changedFieldIds) => { this.handleDetailChangedEvent(changedFieldIds); }
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._litIvemDetailBaseChangedEventSubscriptionId !== undefined) {
            this._litIvemBaseDetail.unsubscribeBaseChangeEvent(this._litIvemDetailBaseChangedEventSubscriptionId);
            this._litIvemDetailBaseChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = LitIvemBaseDetailTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = LitIvemBaseDetailTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LitIvemBaseDetailTableFieldSourceDefinition.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: LitIvemBaseDetail.Field.Id[]) {
        const changedFieldCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < changedFieldIds.length; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = LitIvemBaseDetailTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: undefined };
            }
        }
        if (foundCount < changedFieldCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemBaseDetailTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LitIvemBaseDetail.Field.Id, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this.list.correctnessId;

        switch (id) {
            case LitIvemBaseDetail.Field.Id.Id:
                (value as LitIvemIdCorrectnessTableValue).data = this._litIvemBaseDetail.litIvemId;
                break;
            case LitIvemBaseDetail.Field.Id.Code:
                (value as StringCorrectnessTableValue).data = this._litIvemBaseDetail.code;
                break;
            case LitIvemBaseDetail.Field.Id.MarketId:
                (value as MarketIdCorrectnessTableValue).data = this._litIvemBaseDetail.marketId;
                break;
            case LitIvemBaseDetail.Field.Id.IvemClassId:
                (value as IvemClassIdCorrectnessTableValue).data = this._litIvemBaseDetail.ivemClassId;
                break;
            case LitIvemBaseDetail.Field.Id.SubscriptionDataTypeIds:
                (value as PublisherSubscriptionDataTypeIdArrayCorrectnessTableValue).data = this._litIvemBaseDetail.subscriptionDataTypeIds;
                break;
            case LitIvemBaseDetail.Field.Id.TradingMarketIds:
                (value as MarketIdArrayCorrectnessTableValue).data = this._litIvemBaseDetail.tradingMarketIds;
                break;
            case LitIvemBaseDetail.Field.Id.Name:
                (value as StringCorrectnessTableValue).data = this._litIvemBaseDetail.name;
                break;
            case LitIvemBaseDetail.Field.Id.ExchangeId:
                (value as ExchangeIdCorrectnessTableValue).data = this._litIvemBaseDetail.exchangeId;
                break;
            case LitIvemBaseDetail.Field.Id.AlternateCodes: {
                const alternateCodes = this._litIvemBaseDetail.alternateCodes;
                if (alternateCodes === undefined) {
                    (value as StringCorrectnessTableValue).data = undefined;
                } else {
                    const data = LitIvemAlternateCodes.toDisplay(alternateCodes);
                    (value as StringCorrectnessTableValue).data = data;
                }
                break;
            }
            default:
                throw new UnreachableCaseError('LIBDTVSLV577555493', id);
        }
    }
}

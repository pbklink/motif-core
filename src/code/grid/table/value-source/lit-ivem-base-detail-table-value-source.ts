/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, LitIvemDetail, SymbolsDataItem } from '../../../adi/adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { LitIvemBaseDetailTableFieldSourceDefinition } from '../field-source/definition/grid-table-field-source-definition-internal-api';
import {
    CorrectnessTableValue,
    ExchangeIdCorrectnessTableValue,
    IvemClassIdCorrectnessTableValue,
    LitIvemIdCorrectnessTableValue,
    MarketIdArrayCorrectnessTableValue,
    MarketIdCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue,
    ZenithSubscriptionDataIdArrayCorrectnessTableValue
} from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class LitIvemBaseDetailTableValueSource extends TableValueSource {
    private _litIvemDetailBaseChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemDetail: LitIvemDetail, private _dataItem: SymbolsDataItem) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._litIvemDetailBaseChangedEventSubscriptionId = this._litIvemDetail.subscribeBaseChangeEvent(
            (changedFieldIds) => this.handleDetailChangedEvent(changedFieldIds)
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._litIvemDetailBaseChangedEventSubscriptionId !== undefined) {
            this._litIvemDetail.unsubscribeBaseChangeEvent(this._litIvemDetailBaseChangedEventSubscriptionId);
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

    private handleDetailChangedEvent(changedFieldIds: LitIvemDetail.BaseField.Id[]) {
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

    private loadValue(id: LitIvemDetail.BaseField.Id, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        switch (id) {
            case LitIvemDetail.BaseField.Id.Id:
                (value as LitIvemIdCorrectnessTableValue).data = this._litIvemDetail.litIvemId;
                break;
            case LitIvemDetail.BaseField.Id.Code:
                (value as StringCorrectnessTableValue).data = this._litIvemDetail.code;
                break;
            case LitIvemDetail.BaseField.Id.MarketId:
                (value as MarketIdCorrectnessTableValue).data = this._litIvemDetail.marketId;
                break;
            case LitIvemDetail.BaseField.Id.IvemClassId:
                (value as IvemClassIdCorrectnessTableValue).data = this._litIvemDetail.ivemClassId;
                break;
            case LitIvemDetail.BaseField.Id.SubscriptionDataIds:
                (value as ZenithSubscriptionDataIdArrayCorrectnessTableValue).data = this._litIvemDetail.subscriptionDataIds;
                break;
            case LitIvemDetail.BaseField.Id.TradingMarketIds:
                (value as MarketIdArrayCorrectnessTableValue).data = this._litIvemDetail.tradingMarketIds;
                break;
            case LitIvemDetail.BaseField.Id.Name:
                (value as StringCorrectnessTableValue).data = this._litIvemDetail.name;
                break;
            case LitIvemDetail.BaseField.Id.ExchangeId:
                (value as ExchangeIdCorrectnessTableValue).data = this._litIvemDetail.exchangeId;
                break;
            case LitIvemDetail.BaseField.Id.AlternateCodes:
                const alternateCodes = this._litIvemDetail.alternateCodes;
                const data = (alternateCodes === undefined) ? '' : LitIvemAlternateCodes.toDisplay(alternateCodes);
                (value as StringCorrectnessTableValue).data = data;
                break;
            default:
                throw new UnreachableCaseError('LIBDTVSLV577555493', id);
        }
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Holding } from '../../../adi/adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/internal-api';
import { HoldingTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    CorrectnessTableValue,
    CurrencyIdCorrectnessTableValue,
    ExchangeIdCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    IvemClassIdCorrectnessTableValue,
    PriceCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from '../value/grid-table-value-internal-api';
import { CorrectnessTableValueSource } from './correctness-table-value-source';
import { TableValueSource } from './table-value-source';

export class HoldingTableValueSource extends CorrectnessTableValueSource<Holding> {
    private _holdingChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _holding: Holding) {
        super(firstFieldIndexOffset);
    }

    override activate() {
        this._holdingChangedEventSubscriptionId = this._holding.subscribeChangedEvent(
            (valueChanges) => { this.handleHoldingChangedEvent(valueChanges); }
        );

        return super.activate();
    }

    override deactivate() {
        this._holding.unsubscribeChangedEvent(this._holdingChangedEventSubscriptionId);
        this._holdingChangedEventSubscriptionId = undefined;

        super.deactivate();
    }

    getAllValues(): TableValue[] {
        const fieldCount = HoldingTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = HoldingTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._holding;
    }

    protected getfieldCount(): Integer {
        return HoldingTableFieldSourceDefinition.Field.count;
    }

    private handleHoldingChangedEvent(holdingValueChanges: Holding.ValueChange[]) {
        const changedFieldCount = holdingValueChanges.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < holdingValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = holdingValueChanges[i];
            const fieldIndex = HoldingTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId };
            }
        }
        if (foundCount < changedFieldCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = HoldingTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Holding.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._holding.correctnessId;

        switch (id) {
            case Holding.FieldId.ExchangeId:
                (value as ExchangeIdCorrectnessTableValue).data = this._holding.exchangeId;
                break;
            case Holding.FieldId.Code:
                (value as StringCorrectnessTableValue).data = this._holding.code;
                break;
            case Holding.FieldId.AccountId:
                (value as StringCorrectnessTableValue).data = this._holding.accountId;
                break;
            case Holding.FieldId.StyleId:
                (value as IvemClassIdCorrectnessTableValue).data = this._holding.styleId;
                break;
            case Holding.FieldId.Cost:
                (value as PriceCorrectnessTableValue).data = this._holding.cost;
                break;
            case Holding.FieldId.Currency:
                (value as CurrencyIdCorrectnessTableValue).data = this._holding.currencyId;
                break;
            case Holding.FieldId.TotalQuantity:
                (value as IntegerCorrectnessTableValue).data = this._holding.totalQuantity;
                break;
            case Holding.FieldId.TotalAvailableQuantity:
                (value as IntegerCorrectnessTableValue).data = this._holding.totalAvailableQuantity;
                break;
            case Holding.FieldId.AveragePrice:
                (value as PriceCorrectnessTableValue).data = this._holding.averagePrice;
                break;
            default:
                throw new UnreachableCaseError('HTVSTVSLV8851', id);
        }
    }
}

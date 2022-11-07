/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Holding } from '../../../adi/adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { HoldingTableFieldSourceDefinition } from '../field-source/definition/grid-table-field-source-definition-internal-api';
import {
    CorrectnessTableGridValue,
    CurrencyIdCorrectnessTableGridValue,
    ExchangeIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    IvemClassIdCorrectnessTableGridValue,
    PriceCorrectnessTableGridValue,
    StringCorrectnessTableGridValue,
    TableGridValue
} from '../value/grid-table-value-internal-api';
import { RecordTableValueSource } from './record-table-value-source';
import { TableValueSource } from './table-value-source';

export class HoldingTableValueSource extends RecordTableValueSource<Holding> {
    private _holdingChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _holding: Holding) {
        super(firstFieldIndexOffset);
    }

    override activate() {
        this._holdingChangedEventSubscriptionId = this._holding.subscribeChangedEvent(
            (valueChanges) => this.handleHoldingChangedEvent(valueChanges)
        );

        return super.activate();
    }

    override deactivate() {
        this._holding.unsubscribeChangedEvent(this._holdingChangedEventSubscriptionId);
        this._holdingChangedEventSubscriptionId = undefined;

        super.deactivate();
    }

    getAllValues(): TableGridValue[] {
        const fieldCount = HoldingTableFieldSourceDefinition.Field.count;
        const result = new Array<TableGridValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableGridValue(fieldIdx);
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
                const newValue = this.createTableGridValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId };
            }
        }
        if (foundCount < changedFieldCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableGridValue(fieldIdx: Integer) {
        const valueConstructor = HoldingTableFieldSourceDefinition.Field.getTableGridValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Holding.FieldId, value: CorrectnessTableGridValue) {
        value.dataCorrectnessId = this._holding.correctnessId;

        switch (id) {
            case Holding.FieldId.ExchangeId:
                (value as ExchangeIdCorrectnessTableGridValue).data = this._holding.exchangeId;
                break;
            case Holding.FieldId.Code:
                (value as StringCorrectnessTableGridValue).data = this._holding.code;
                break;
            case Holding.FieldId.AccountId:
                (value as StringCorrectnessTableGridValue).data = this._holding.accountId;
                break;
            case Holding.FieldId.StyleId:
                (value as IvemClassIdCorrectnessTableGridValue).data = this._holding.styleId;
                break;
            case Holding.FieldId.Cost:
                (value as PriceCorrectnessTableGridValue).data = this._holding.cost;
                break;
            case Holding.FieldId.Currency:
                (value as CurrencyIdCorrectnessTableGridValue).data = this._holding.currencyId;
                break;
            case Holding.FieldId.TotalQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this._holding.totalQuantity;
                break;
            case Holding.FieldId.TotalAvailableQuantity:
                (value as IntegerCorrectnessTableGridValue).data = this._holding.totalAvailableQuantity;
                break;
            case Holding.FieldId.AveragePrice:
                (value as PriceCorrectnessTableGridValue).data = this._holding.averagePrice;
                break;
            default:
                throw new UnreachableCaseError('HTVSTVSLV8851', id);
        }
    }
}

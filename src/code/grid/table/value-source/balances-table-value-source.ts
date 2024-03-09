/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances } from '../../../adi/adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/internal-api';
import { BalancesTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    CorrectnessTableValue,
    CurrencyIdCorrectnessTableValue,
    DecimalCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from '../value/grid-table-value-internal-api';
import { CorrectnessTableValueSource } from './correctness-table-value-source';
import { TableValueSource } from './table-value-source';

export class BalancesTableValueSource extends CorrectnessTableValueSource<Balances> {
    private _balancesChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _balances: Balances) {
        super(firstFieldIndexOffset);
    }

    override activate(): TableValue[] {
        this._balancesChangedEventSubscriptionId = this._balances.subscribeChangedEvent(
            (valueChanges) => this.handleBalancesChangedEvent(valueChanges)
        );

        return super.activate();
    }

    override deactivate() {
        this._balances.unsubscribeChangedEvent(this._balancesChangedEventSubscriptionId);
        this._balancesChangedEventSubscriptionId = undefined;

        super.deactivate();
    }

    getAllValues(): TableValue[] {
        const fieldCount = BalancesTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = BalancesTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getRecord() {
        return this._balances;
    }

    protected getfieldCount(): Integer {
        return BalancesTableFieldSourceDefinition.Field.count;
    }

    private handleBalancesChangedEvent(balanceValueChanges: Balances.ValueChange[]) {
        const valueChangeCount = balanceValueChanges.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(valueChangeCount);
        let foundCount = 0;
        for (let i = 0; i < balanceValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = balanceValueChanges[i];
            const fieldIndex = BalancesTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId };
            }
        }
        if (foundCount < valueChangeCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = BalancesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Balances.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._balances.correctnessId;

        switch (id) {
            case Balances.FieldId.AccountId:
                (value as StringCorrectnessTableValue).data = this._balances.accountId;
                break;
            case Balances.FieldId.Currency:
                (value as CurrencyIdCorrectnessTableValue).data = this._balances.currencyId;
                break;
            case Balances.FieldId.NetBalance:
                (value as DecimalCorrectnessTableValue).data = this._balances.netBalance;
                break;
            case Balances.FieldId.Trading:
                (value as DecimalCorrectnessTableValue).data = this._balances.trading;
                break;
            case Balances.FieldId.NonTrading:
                (value as DecimalCorrectnessTableValue).data = this._balances.nonTrading;
                break;
            case Balances.FieldId.UnfilledBuys:
                (value as DecimalCorrectnessTableValue).data = this._balances.unfilledBuys;
                break;
            case Balances.FieldId.Margin:
                (value as DecimalCorrectnessTableValue).data = this._balances.margin;
                break;
            default:
                throw new UnreachableCaseError('ACBTVSTVSLV8851', id);
        }
    }
}

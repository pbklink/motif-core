/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account } from '../../../adi/internal-api';
import { Correctness, Integer, MultiEvent, UnreachableCaseError } from '../../../sys/internal-api';
import { BrokerageAccountTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    CorrectnessTableValue,
    EnumCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from '../value/internal-api';
import { TableValueSource } from './table-value-source';

export class BrokerageAccountTableValueSource extends TableValueSource {
    private _accountChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _accountCorrectnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private readonly _account: Account) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._accountChangeEventSubscriptionId = this._account.subscribeChangeEvent(
            (accountChanges) => { this.handleAccountChangeEvent(accountChanges); }
        );
        this._accountCorrectnessChangedEventSubscriptionId = this._account.subscribeCorrectnessChangedEvent(
            () => { this.handleAccountCorrectnessChangedEvent(); }
        );

        this.initialiseBeenIncubated(Correctness.idIsIncubated(this._account.correctnessId));

        return this.getAllValues();
    }

    deactivate() {
        if (this._accountChangeEventSubscriptionId !== undefined) {
            this._account.unsubscribeChangeEvent(this._accountChangeEventSubscriptionId);
            this._accountChangeEventSubscriptionId = undefined;
        }
        if (this._accountCorrectnessChangedEventSubscriptionId !== undefined) {
            this._account.unsubscribeCorrectnessChangedEvent(this._accountCorrectnessChangedEventSubscriptionId);
            this._accountCorrectnessChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = BrokerageAccountTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);
        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = BrokerageAccountTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return BrokerageAccountTableFieldSourceDefinition.Field.count;
    }

    private handleAccountChangeEvent(accountValueChanges: Account.ValueChange[]) {
        const changedFieldCount = accountValueChanges.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < accountValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = accountValueChanges[i];
            const fieldIndex = BrokerageAccountTableFieldSourceDefinition.Field.indexOfId(fieldId);
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

    private handleAccountCorrectnessChangedEvent() {
        const allValues = this.getAllValues();
        this.processDataCorrectnessChanged(allValues, Correctness.idIsIncubated(this._account.correctnessId));
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = BrokerageAccountTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: Account.FieldId, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._account.correctnessId;

        switch (id) {
            case Account.FieldId.Id:
                (value as StringCorrectnessTableValue).data = this._account.id;
                break;
            case Account.FieldId.EnvironmentId:
                (value as EnumCorrectnessTableValue).data = this._account.environmentId;
                break;
            case Account.FieldId.Name:
                (value as StringCorrectnessTableValue).data = this._account.name;
                break;
            case Account.FieldId.BrokerCode:
                (value as StringCorrectnessTableValue).data = this._account.brokerCode;
                break;
            case Account.FieldId.BranchCode:
                (value as StringCorrectnessTableValue).data = this._account.branchCode;
                break;
            case Account.FieldId.AdvisorCode:
                (value as StringCorrectnessTableValue).data = this._account.advisorCode;
                break;
            default:
                throw new UnreachableCaseError('BATVSLV9473', id);
        }
    }
}

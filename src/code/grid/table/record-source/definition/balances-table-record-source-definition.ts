/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Balances, BrokerageAccountGroup } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionsService
} from "../../field-source/grid-table-field-source-internal-api";
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class BalancesTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.Balances, brokerageAccountGroup);
    }

    protected override readonly allowedFieldDefinitionSourceTypeIds: BalancesTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.BalancesDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        const balancesDataItemFieldSourceDefinition = this.tableFieldSourceDefinitionsService.balances;
        const brokerageAccountsFieldSourceDefinition = this.tableFieldSourceDefinitionsService.brokerageAccounts;

        result.addColumn(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.AccountId));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addColumn(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Currency));
        result.addColumn(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NetBalance));
        result.addColumn(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Trading));
        result.addColumn(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NonTrading));
        result.addColumn(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.UnfilledBuys));
        result.addColumn(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Margin));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }
}

export namespace BalancesTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.BalancesDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;

    export function tryCreateFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): Result<BalancesTableRecordSourceDefinition> {
        const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
        const definition = new BalancesTableRecordSourceDefinition(tableFieldSourceDefinitionsService, group);
        return new Ok(definition);
    }
}

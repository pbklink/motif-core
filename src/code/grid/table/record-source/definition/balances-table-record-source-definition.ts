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
        const balancesDataItemFieldSourceDefinition = this.tableFieldSourceDefinitionsService.balances;
        const brokerageAccountsFieldSourceDefinition = this.tableFieldSourceDefinitionsService.brokerageAccounts;

        const fieldNames = new Array<string>();

        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.AccountId));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Currency));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NetBalance));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Trading));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NonTrading));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.UnfilledBuys));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Margin));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
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

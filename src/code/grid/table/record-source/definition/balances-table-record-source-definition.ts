/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { Account, Balances, BrokerageAccountGroup } from '../../../../adi/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import {
    BalancesTableFieldSourceDefinition,
    BrokerageAccountTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory
} from "../../field-source/internal-api";
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class BalancesTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.Balances,
            BalancesTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            brokerageAccountGroup
        );
    }

    override createDefaultLayoutDefinition() {
        const balancesDataItemFieldSourceDefinition = BalancesTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);
        const brokerageAccountFieldSourceDefinition = BrokerageAccountTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.AccountId));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Currency));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NetBalance));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Trading));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.NonTrading));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.UnfilledBuys));
        fieldNames.push(balancesDataItemFieldSourceDefinition.getSupportedFieldNameById(Balances.FieldId.Margin));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

export namespace BalancesTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Balances |
        TableFieldSourceDefinition.TypeId.BrokerageAccount
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Balances,
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Balances,
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
    ];
}

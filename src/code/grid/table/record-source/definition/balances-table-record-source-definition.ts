/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Balances, BrokerageAccountGroup } from '../../../../adi/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/internal-api';
import { GridLayoutDefinition } from '../../../layout/internal-api';
import {
    BalancesTableFieldSourceDefinition,
    BrokerageAccountTableFieldSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService
} from "../../field-source/internal-api";
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

export class BalancesTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.Balances,
            BalancesTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            brokerageAccountGroup
        );
    }

    override createDefaultLayoutDefinition() {
        const balancesDataItemFieldSourceDefinition = BalancesTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);
        const brokerageAccountFieldSourceDefinition = BrokerageAccountTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

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

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

export namespace BalancesTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.Balances |
        TypedTableFieldSourceDefinition.TypeId.BrokerageAccount
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.Balances,
        TypedTableFieldSourceDefinition.TypeId.BrokerageAccount,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.Balances,
        TypedTableFieldSourceDefinition.TypeId.BrokerageAccount,
    ];
}

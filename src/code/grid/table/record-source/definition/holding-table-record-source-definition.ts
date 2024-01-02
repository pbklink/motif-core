/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, BrokerageAccountGroup, Holding } from '../../../../adi/adi-internal-api';
import { PickEnum } from '../../../../sys/sys-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class HoldingTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.Holding,
            HoldingTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            brokerageAccountGroup
        );
    }

    override createDefaultLayoutDefinition() {
        const holdingsDataItemFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.holdingsDataItem;
        const brokerageAccountFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.brokerageAccounts;

        const fieldNames = new Array<string>();

        fieldNames.push(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.AccountId));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        fieldNames.push(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.ExchangeId));
        fieldNames.push(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.Code));
        fieldNames.push(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.TotalQuantity));
        fieldNames.push(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.TotalAvailableQuantity));
        fieldNames.push(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.AveragePrice));
        fieldNames.push(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.Cost));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace HoldingTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.HoldingsDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts |
        TableFieldSourceDefinition.TypeId.SecurityDataItem
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.HoldingsDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.HoldingsDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];
}

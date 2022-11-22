/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, BrokerageAccountGroup, Holding } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionsService } from '../../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class HoldingTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    protected override readonly allowedFieldDefinitionSourceTypeIds: HoldingTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.HoldingsDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    constructor(tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService, brokerageAccountGroup: BrokerageAccountGroup) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.Holding, brokerageAccountGroup);
    }

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        const holdingsDataItemFieldSourceDefinition = this.tableFieldSourceDefinitionsService.holdingsDataItem;
        const brokerageAccountFieldSourceDefinition = this.tableFieldSourceDefinitionsService.brokerageAccounts;

        result.addColumn(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.AccountId));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addColumn(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.ExchangeId));
        result.addColumn(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.Code));
        result.addColumn(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.TotalQuantity));
        result.addColumn(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.TotalAvailableQuantity));
        result.addColumn(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.AveragePrice));
        result.addColumn(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.Cost));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }
}

/** @public */
export namespace HoldingTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.HoldingsDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;

    export function tryCreateFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): Result<HoldingTableRecordSourceDefinition> {
        const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
        const definition = new HoldingTableRecordSourceDefinition(tableFieldSourceDefinitionsService, group);
        return new Ok(definition);
    }
}

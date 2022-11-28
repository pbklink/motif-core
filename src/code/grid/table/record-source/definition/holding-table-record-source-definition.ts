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
        const holdingsDataItemFieldSourceDefinition = this.tableFieldSourceDefinitionsService.holdingsDataItem;
        const brokerageAccountFieldSourceDefinition = this.tableFieldSourceDefinitionsService.brokerageAccounts;

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

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
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

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { Account, BrokerageAccountGroup, Holding } from '../../../../adi/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import {
    BrokerageAccountTableFieldSourceDefinition,
    HoldingTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory,
} from '../../field-source/internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class HoldingTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.Holding,
            HoldingTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            brokerageAccountGroup
        );
    }

    override createDefaultLayoutDefinition() {
        const holdingsDataItemFieldSourceDefinition = HoldingTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);
        const brokerageAccountFieldSourceDefinition = BrokerageAccountTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

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

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace HoldingTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Holding |
        TableFieldSourceDefinition.TypeId.BrokerageAccount |
        TableFieldSourceDefinition.TypeId.SecurityDataItem
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Holding,
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Holding,
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
    ];
}

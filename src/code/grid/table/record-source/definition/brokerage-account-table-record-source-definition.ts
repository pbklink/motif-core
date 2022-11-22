/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Feed } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionsService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class BrokerageAccountTableRecordSourceDefinition extends TableRecordSourceDefinition {
    protected override readonly allowedFieldDefinitionSourceTypeIds:
        BrokerageAccountTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    constructor(tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.BrokerageAccount);
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        const brokerageAccountFieldSourceDefinition = this.tableFieldSourceDefinitionsService.brokerageAccounts;
        const feedFieldSourceDefinition = this.tableFieldSourceDefinitionsService.feed;

        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Id));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.CurrencyId));
        result.addColumn(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.StatusId));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addColumn(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }
}

/** @public */
export namespace BrokerageAccountTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts |
        TableFieldSourceDefinition.TypeId.Feed
    >;

    export function tryCreateFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        _element: JsonElement
    ): Result<BrokerageAccountTableRecordSourceDefinition> {
        const definition = new BrokerageAccountTableRecordSourceDefinition(tableFieldSourceDefinitionsService);
        return new Ok(definition);
    }
}

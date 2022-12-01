/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Feed } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class BrokerageAccountTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService) {
        super(
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.BrokerageAccount,
            BrokerageAccountTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const brokerageAccountFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.brokerageAccounts;
        const feedFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.feed;

        const fieldNames = new Array<string>();

        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Id));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.CurrencyId));
        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.StatusId));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace BrokerageAccountTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts |
        TableFieldSourceDefinition.TypeId.Feed
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    export function tryCreateFromJson(
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        _element: JsonElement
    ): Result<BrokerageAccountTableRecordSourceDefinition> {
        const definition = new BrokerageAccountTableRecordSourceDefinition(tableFieldSourceDefinitionRegistryService);
        return new Ok(definition);
    }
}

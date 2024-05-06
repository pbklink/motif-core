/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { Account, Feed } from '../../../../adi/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import { BrokerageAccountTableFieldSourceDefinition, FeedTableFieldSourceDefinition, TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class BrokerageAccountTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.BrokerageAccount,
            BrokerageAccountTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds
        );
    }

    // no override for saveToJson()

    override createDefaultLayoutDefinition() {
        const brokerageAccountFieldSourceDefinition = BrokerageAccountTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);
        const feedFieldSourceDefinition = FeedTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Id));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        fieldNames.push(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.StatusId));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        fieldNames.push(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace BrokerageAccountTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.BrokerageAccount |
        TableFieldSourceDefinition.TypeId.Feed
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
        TableFieldSourceDefinition.TypeId.Feed,
    ];
}

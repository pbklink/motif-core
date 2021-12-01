/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BalancesTableFieldDefinitionSource } from './balances-table-field-definition-source';
import { BrokerageAccountTableFieldDefinitionSource } from './brokerage-account-table-field-definition-source';
import { CallPutTableFieldDefinitionSource } from './call-put-table-field-definition-source';
import { FeedTableFieldDefinitionSource } from './feed-table-field-definition-source';
import { HoldingTableFieldDefinitionSource } from './holding-table-field-definition-source';
import { LitIvemAlternateCodesTableFieldDefinitionSource } from './lit-ivem-alternate-codes-table-field-definition-source';
import { LitIvemBaseDetailTableFieldDefinitionSource } from './lit-ivem-base-detail-table-field-definition-source';
import { LitIvemExtendedDetailTableFieldDefinitionSource } from './lit-ivem-extended-detail-table-field-definition-source';
import { MyxLitIvemAttributesTableFieldDefinitionSource } from './myx-lit-ivem-attributes-table-field-definition-source';
import { OrderTableFieldDefinitionSource } from './order-table-field-definition-source';
import { SecurityDataItemTableFieldDefinitionSource } from './security-data-item-table-field-definition-source';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinitionListModule } from './table-record-definition-list';
import { TopShareholderTableFieldDefinitionSource } from './top-shareholder-table-field-definition-source';

/** @internal */
export namespace TableStaticInitialise {
    export function initialise() {
        FeedTableFieldDefinitionSource.initialiseStatic();
        LitIvemBaseDetailTableFieldDefinitionSource.initialiseStatic();
        LitIvemExtendedDetailTableFieldDefinitionSource.initialiseStatic();
        MyxLitIvemAttributesTableFieldDefinitionSource.initialiseStatic();
        LitIvemAlternateCodesTableFieldDefinitionSource.initialiseStatic();
        SecurityDataItemTableFieldDefinitionSource.initialiseStatic();
        BrokerageAccountTableFieldDefinitionSource.initialiseStatic();
        OrderTableFieldDefinitionSource.initialiseStatic();
        HoldingTableFieldDefinitionSource.initialiseStatic();
        BalancesTableFieldDefinitionSource.initialiseStatic();
        TopShareholderTableFieldDefinitionSource.initialiseStatic();
        CallPutTableFieldDefinitionSource.initialiseStatic();
        TableFieldList.initialiseStatic();
        TableRecordDefinitionListModule.initialiseStatic();
    }
}

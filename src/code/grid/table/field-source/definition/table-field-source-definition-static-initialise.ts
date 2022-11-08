/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BalancesTableFieldSourceDefinition } from './balances-table-field-source-definition';
import { BrokerageAccountTableFieldSourceDefinition } from './brokerage-account-table-field-source-definition';
import { CallPutTableFieldSourceDefinition } from './call-put-table-field-source-definition';
import { FeedTableFieldSourceDefinition } from './feed-table-field-source-definition';
import { HoldingTableFieldSourceDefinition } from './holding-table-field-source-definition';
import { LitIvemAlternateCodesTableFieldSourceDefinition } from './lit-ivem-alternate-codes-table-field-source-definition';
import { LitIvemBaseDetailTableFieldSourceDefinition } from './lit-ivem-base-detail-table-field-source-definition';
import { LitIvemExtendedDetailTableFieldSourceDefinition } from './lit-ivem-extended-detail-table-field-source-definition';
import { MyxLitIvemAttributesTableFieldSourceDefinition } from './myx-lit-ivem-attributes-table-field-source-definition';
import { OrderTableFieldSourceDefinition } from './order-table-field-source-definition';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TopShareholderTableFieldSourceDefinition } from './top-shareholder-table-field-source-definition';

/** @internal */
export namespace TableFieldSourceDefinitionStaticInitialise {
    export function initialise() {
        FeedTableFieldSourceDefinition.initialiseStatic();
        LitIvemBaseDetailTableFieldSourceDefinition.initialiseStatic();
        LitIvemExtendedDetailTableFieldSourceDefinition.initialiseStatic();
        MyxLitIvemAttributesTableFieldSourceDefinition.initialiseStatic();
        LitIvemAlternateCodesTableFieldSourceDefinition.initialiseStatic();
        PrefixableSecurityDataItemTableFieldSourceDefinition.initialiseStatic();
        BrokerageAccountTableFieldSourceDefinition.initialiseStatic();
        OrderTableFieldSourceDefinition.initialiseStatic();
        HoldingTableFieldSourceDefinition.initialiseStatic();
        BalancesTableFieldSourceDefinition.initialiseStatic();
        TopShareholderTableFieldSourceDefinition.initialiseStatic();
        CallPutTableFieldSourceDefinition.initialiseStatic();
    }
}

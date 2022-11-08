import { CallOrPutId } from '../../../../adi/adi-internal-api';
import { TextFormatterService } from '../../../../text-format/text-formatter-service';
import { BalancesTableFieldSourceDefinition } from './balances-table-field-source-definition';
import { BrokerageAccountTableFieldSourceDefinition } from './brokerage-account-table-field-source-definition';
import { CallPutSecurityDataItemTableFieldSourceDefinition } from './call-put-security-data-item-table-field-source-definition';
import { CallPutTableFieldSourceDefinition } from './call-put-table-field-source-definition';
import { FeedTableFieldSourceDefinition } from './feed-table-field-source-definition';
import { HoldingTableFieldSourceDefinition } from './holding-table-field-source-definition';
import { LitIvemAlternateCodesTableFieldSourceDefinition } from './lit-ivem-alternate-codes-table-field-source-definition';
import { LitIvemBaseDetailTableFieldSourceDefinition } from './lit-ivem-base-detail-table-field-source-definition';
import { LitIvemExtendedDetailTableFieldSourceDefinition } from './lit-ivem-extended-detail-table-field-source-definition';
import { MyxLitIvemAttributesTableFieldSourceDefinition } from './myx-lit-ivem-attributes-table-field-source-definition';
import { OrderTableFieldSourceDefinition } from './order-table-field-source-definition';
import { SecurityDataItemTableFieldSourceDefinition } from './security-data-item-table-field-source-definition';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TopShareholderTableFieldSourceDefinition } from './top-shareholder-table-field-source-definition';

export class TableFieldSourceDefinitionFactoryService {
    readonly balances: BalancesTableFieldSourceDefinition;
    readonly feed: FeedTableFieldSourceDefinition;
    readonly litIvemBaseDetail: LitIvemBaseDetailTableFieldSourceDefinition;
    readonly litIvemExtendedDetail: LitIvemExtendedDetailTableFieldSourceDefinition;
    readonly litIvemAlternateCodes: LitIvemAlternateCodesTableFieldSourceDefinition;
    readonly myxLitIvemAttributes: MyxLitIvemAttributesTableFieldSourceDefinition;
    readonly securityDataItem: SecurityDataItemTableFieldSourceDefinition;
    readonly brokerageAccounts: BrokerageAccountTableFieldSourceDefinition;
    readonly ordersDataItem: OrderTableFieldSourceDefinition;
    readonly holdingsDataItem: HoldingTableFieldSourceDefinition;
    readonly callPut: CallPutTableFieldSourceDefinition;
    readonly callSecurityDataItem: CallPutSecurityDataItemTableFieldSourceDefinition;
    readonly putSecurityDataItem: CallPutSecurityDataItemTableFieldSourceDefinition;
    readonly topShareholdersDataItem: TopShareholderTableFieldSourceDefinition;

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        this.balances = new BalancesTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.feed = new FeedTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.litIvemBaseDetail = new LitIvemBaseDetailTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.litIvemExtendedDetail = new LitIvemExtendedDetailTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.litIvemAlternateCodes = new LitIvemAlternateCodesTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.myxLitIvemAttributes = new MyxLitIvemAttributesTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.securityDataItem = new SecurityDataItemTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.brokerageAccounts = new BrokerageAccountTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.ordersDataItem = new OrderTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.holdingsDataItem = new HoldingTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.callPut = new CallPutTableFieldSourceDefinition(textFormatterService, customHeadingsService);
        this.callSecurityDataItem = new CallPutSecurityDataItemTableFieldSourceDefinition(textFormatterService, customHeadingsService, CallOrPutId.Call);
        this.putSecurityDataItem = new CallPutSecurityDataItemTableFieldSourceDefinition(textFormatterService, customHeadingsService, CallOrPutId.Put);
        this.topShareholdersDataItem = new TopShareholderTableFieldSourceDefinition(textFormatterService, customHeadingsService);
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/adi-internal-api';
import { UnreachableCaseError } from '../../../../sys/internal-error';
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
import { RankedLitIvemIdTableFieldSourceDefinition } from './ranked-lit-ivem-id-table-field-source-definition';
import { SecurityDataItemTableFieldSourceDefinition } from './security-data-item-table-field-source-definition';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TopShareholderTableFieldSourceDefinition } from './top-shareholder-table-field-source-definition';

export class TableFieldSourceDefinitionRegistryService {
    private readonly _cache = new Map<TableFieldSourceDefinition.TypeId, TableFieldSourceDefinition>();

    constructor(private readonly _customHeadingsService: TableFieldCustomHeadingsService) {

    }

    get feed() { return this.get(TableFieldSourceDefinition.TypeId.Feed) as FeedTableFieldSourceDefinition; }
    get rankedLitIvemId() { return this.get(TableFieldSourceDefinition.TypeId.RankedLitIvemId) as RankedLitIvemIdTableFieldSourceDefinition; }
    get litIvemBaseDetail() { return this.get(TableFieldSourceDefinition.TypeId.LitIvemBaseDetail) as LitIvemBaseDetailTableFieldSourceDefinition; }
    get litIvemExtendedDetail() { return this.get(TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail) as LitIvemExtendedDetailTableFieldSourceDefinition; }
    get litIvemAlternateCodes() { return this.get(TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes) as LitIvemAlternateCodesTableFieldSourceDefinition; }
    get myxLitIvemAttributes() { return this.get(TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes) as MyxLitIvemAttributesTableFieldSourceDefinition; }
    get securityDataItem() { return this.get(TableFieldSourceDefinition.TypeId.SecurityDataItem) as SecurityDataItemTableFieldSourceDefinition; }
    get brokerageAccounts() { return this.get(TableFieldSourceDefinition.TypeId.BrokerageAccounts) as BrokerageAccountTableFieldSourceDefinition; }
    get ordersDataItem() { return this.get(TableFieldSourceDefinition.TypeId.OrdersDataItem) as OrderTableFieldSourceDefinition; }
    get holdingsDataItem() { return this.get(TableFieldSourceDefinition.TypeId.HoldingsDataItem) as HoldingTableFieldSourceDefinition; }
    get balances() { return this.get(TableFieldSourceDefinition.TypeId.BalancesDataItem) as BalancesTableFieldSourceDefinition; }
    get callPut() { return this.get(TableFieldSourceDefinition.TypeId.CallPut) as CallPutTableFieldSourceDefinition; }
    get callSecurityDataItem() { return this.get(TableFieldSourceDefinition.TypeId.CallSecurityDataItem) as CallPutSecurityDataItemTableFieldSourceDefinition; }
    get putSecurityDataItem() { return this.get(TableFieldSourceDefinition.TypeId.PutSecurityDataItem) as CallPutSecurityDataItemTableFieldSourceDefinition; }
    get topShareholdersDataItem() { return this.get(TableFieldSourceDefinition.TypeId.TopShareholdersDataItem) as TopShareholderTableFieldSourceDefinition; }

    get(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition {
        let result = this._cache.get(typeId);
        if (result !== undefined) {
            return result;
        } else {
            result = this.createDefinition(typeId);
            this._cache.set(typeId, result);
            return result;
        }
    }

    private createDefinition(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition {
        switch (typeId) {
            case TableFieldSourceDefinition.TypeId.Feed:
                return new FeedTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.RankedLitIvemId:
                return new RankedLitIvemIdTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail:
                return new LitIvemBaseDetailTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail:
                return new LitIvemExtendedDetailTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes:
                return new LitIvemAlternateCodesTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes:
                return new MyxLitIvemAttributesTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.SecurityDataItem:
                return new SecurityDataItemTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.BrokerageAccounts:
                return new BrokerageAccountTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.OrdersDataItem:
                return new OrderTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.HoldingsDataItem:
                return new HoldingTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.BalancesDataItem:
                return new BalancesTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.CallPut:
                return new CallPutTableFieldSourceDefinition(this._customHeadingsService);
            case TableFieldSourceDefinition.TypeId.CallSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(this._customHeadingsService, CallOrPutId.Call);
            case TableFieldSourceDefinition.TypeId.PutSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(this._customHeadingsService, CallOrPutId.Put);
            case TableFieldSourceDefinition.TypeId.TopShareholdersDataItem:
                return new TopShareholderTableFieldSourceDefinition(this._customHeadingsService);

            default:
                throw new UnreachableCaseError('TFSDRCD25051', typeId);
        }
    }
}

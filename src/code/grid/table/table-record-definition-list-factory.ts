/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../adi/adi-internal-api';
import { SymbolsService } from '../../services/services-internal-api';
import { JsonElement, Logger, NotImplementedError, UnreachableCaseError } from '../../sys/sys-internal-api';
import { BalancesTableRecordDefinitionList } from './balances-table-record-definition-list';
import { BrokerageAccountTableRecordDefinitionList } from './brokerage-account-table-record-definition-list';
import { CallPutFromUnderlyingTableRecordDefinitionList } from './call-put-from-underlying-table-record-definition-list';
import { FeedTableRecordDefinitionList } from './feed-table-record-definition-list';
import { GroupTableRecordDefinitionList } from './group-table-record-definition-list';
import { HoldingTableRecordDefinitionList } from './holding-table-record-definition-list';
import { LitIvemIdTableRecordDefinitionList } from './lit-ivem-id-table-record-definition-list';
import { OrderTableRecordDefinitionList } from './order-table-record-definition-list';
import { PortfolioTableRecordDefinitionList } from './portfolio-table-record-definition-list';
import { SymbolsDataItemTableRecordDefinitionList } from './symbols-data-item-table-record-definition-list';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TopShareholderTableRecordDefinitionList } from './top-shareholder-table-record-definition-list';

export class TableRecordDefinitionListFactory {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService
    ) { }

    createUnloadedFromTypeId(typeId: TableRecordDefinitionList.TypeId): TableRecordDefinitionList | undefined {
        switch (typeId) {
            case TableRecordDefinitionList.TypeId.Null: throw new NotImplementedError('TRDLFCFTIN29984');
            case TableRecordDefinitionList.TypeId.SymbolsDataItem: return this.createUnloadedSymbolsDataItem();
            case TableRecordDefinitionList.TypeId.LitIvemId: return this.createUnloadedLitIvemId();
            case TableRecordDefinitionList.TypeId.Portfolio: return this.createUnloadedPortfolio();
            case TableRecordDefinitionList.TypeId.Group: return this.createUnloadedGroup();
            case TableRecordDefinitionList.TypeId.MarketMovers: throw new NotImplementedError('TRDLFCFTIMM3820');
            case TableRecordDefinitionList.TypeId.IvemIdServer: throw new NotImplementedError('TRDLFCFTII22751');
            case TableRecordDefinitionList.TypeId.Gics: throw new NotImplementedError('TRDLFCFTIG78783');
            case TableRecordDefinitionList.TypeId.ProfitIvemHolding: throw new NotImplementedError('TRDLFCFTIP18885');
            case TableRecordDefinitionList.TypeId.CashItemHolding: throw new NotImplementedError('TRDLFCFTIC20098');
            case TableRecordDefinitionList.TypeId.IntradayProfitLossSymbolRec: throw new NotImplementedError('TRDLFCFTII11198');
            case TableRecordDefinitionList.TypeId.TmcDefinitionLegs: throw new NotImplementedError('TRDLFCFTIT99873');
            case TableRecordDefinitionList.TypeId.TmcLeg: throw new NotImplementedError('TRDLFCFTIT22852');
            case TableRecordDefinitionList.TypeId.TmcWithLegMatchingUnderlying: throw new NotImplementedError('TRDLFCFTIT75557');
            case TableRecordDefinitionList.TypeId.CallPutFromUnderlying: return this.createUnloadedCallPutFromUnderlying();
            case TableRecordDefinitionList.TypeId.HoldingAccountPortfolio: throw new NotImplementedError('TRDLFCFTIH22321');
            case TableRecordDefinitionList.TypeId.Feed: return this.createUnloadedFeed();
            case TableRecordDefinitionList.TypeId.BrokerageAccount: return this.createUnloadedBrokerageAccount();
            case TableRecordDefinitionList.TypeId.Order: return this.createUnloadedOrder();
            case TableRecordDefinitionList.TypeId.Holding: return this.createUnloadedHolding();
            case TableRecordDefinitionList.TypeId.Balances: return this.createUnloadedBalances();
            case TableRecordDefinitionList.TypeId.TopShareholder: return this.createUnloadedTopShareholder();
            default: throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }

    tryCreateFromJson(element: JsonElement) {
        const typeId = TableRecordDefinitionList.getTypeIdFromJson(element);
        if (typeId === undefined) {
            return undefined;
        } else {
            const list = this.createUnloadedFromTypeId(typeId);
            if (list === undefined) {
                return Logger.logPersistError('TRDLFTCFJ11990', TableRecordDefinitionList.Type.idToName(typeId));
            } else {
                list.loadFromJson(element);
                return list;
            }
        }
    }

    createUnloadedSymbolsDataItem() {
        return new SymbolsDataItemTableRecordDefinitionList(this._adiService, this._symbolsService);
    }

    createUnloadedLitIvemId() {
        return new LitIvemIdTableRecordDefinitionList();
    }

    createUnloadedPortfolio() {
        return new PortfolioTableRecordDefinitionList();
    }

    createUnloadedGroup() {
        return new GroupTableRecordDefinitionList();
    }

    createUnloadedFeed() {
        return new FeedTableRecordDefinitionList(this._adiService);
    }

    createUnloadedBrokerageAccount() {
        return new BrokerageAccountTableRecordDefinitionList(this._adiService);
    }

    createUnloadedOrder() {
        return new OrderTableRecordDefinitionList(this._adiService);
    }

    createUnloadedHolding() {
        return new HoldingTableRecordDefinitionList(this._adiService);
    }

    createUnloadedBalances() {
        return new BalancesTableRecordDefinitionList(this._adiService);
    }

    createUnloadedCallPutFromUnderlying() {
        return new CallPutFromUnderlyingTableRecordDefinitionList(this._adiService);
    }

    createUnloadedTopShareholder() {
        return new TopShareholderTableRecordDefinitionList(this._adiService);
    }
}

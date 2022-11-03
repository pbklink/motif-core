/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../adi/adi-internal-api';
import { SymbolsService } from '../../services/services-internal-api';
import { JsonElement, Logger, NotImplementedError, UnreachableCaseError } from '../../sys/sys-internal-api';
import { BalancesTableRecordSource } from './balances-table-record-source';
import { BrokerageAccountTableRecordSource } from './brokerage-account-table-record-source';
import { CallPutFromUnderlyingTableRecordSource } from './call-put-from-underlying-table-record-source';
import { FeedTableRecordSource } from './feed-table-record-source';
import { GroupTableRecordSource } from './group-table-record-source';
import { HoldingTableRecordSource } from './holding-table-record-source';
import { LitIvemIdTableRecordSource } from './lit-ivem-id-table-record-source';
import { OrderTableRecordSource } from './order-table-record-source';
import { PortfolioTableRecordSource } from './portfolio-table-record-source';
import { SymbolsDataItemTableRecordSource } from './symbols-data-item-table-record-source';
import { TableFieldSourceDefinitionsService } from './table-field-source-definitions-service';
import { TableRecordSource } from './table-record-source';
import { TopShareholderTableRecordSource } from './top-shareholder-table-record-source';

export class TableRecordSourceFactory {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
    ) { }

    createUnloadedFromTypeId(typeId: TableRecordSource.TypeId): TableRecordSource | undefined {
        switch (typeId) {
            case TableRecordSource.TypeId.Null: throw new NotImplementedError('TRDLFCFTIN29984');
            case TableRecordSource.TypeId.SymbolsDataItem: return this.createUnloadedSymbolsDataItem();
            case TableRecordSource.TypeId.LitIvemId: return this.createUnloadedLitIvemId();
            case TableRecordSource.TypeId.Portfolio: return this.createUnloadedPortfolio();
            case TableRecordSource.TypeId.Group: return this.createUnloadedGroup();
            case TableRecordSource.TypeId.MarketMovers: throw new NotImplementedError('TRDLFCFTIMM3820');
            case TableRecordSource.TypeId.IvemIdServer: throw new NotImplementedError('TRDLFCFTII22751');
            case TableRecordSource.TypeId.Gics: throw new NotImplementedError('TRDLFCFTIG78783');
            case TableRecordSource.TypeId.ProfitIvemHolding: throw new NotImplementedError('TRDLFCFTIP18885');
            case TableRecordSource.TypeId.CashItemHolding: throw new NotImplementedError('TRDLFCFTIC20098');
            case TableRecordSource.TypeId.IntradayProfitLossSymbolRec: throw new NotImplementedError('TRDLFCFTII11198');
            case TableRecordSource.TypeId.TmcDefinitionLegs: throw new NotImplementedError('TRDLFCFTIT99873');
            case TableRecordSource.TypeId.TmcLeg: throw new NotImplementedError('TRDLFCFTIT22852');
            case TableRecordSource.TypeId.TmcWithLegMatchingUnderlying: throw new NotImplementedError('TRDLFCFTIT75557');
            case TableRecordSource.TypeId.CallPutFromUnderlying: return this.createUnloadedCallPutFromUnderlying();
            case TableRecordSource.TypeId.HoldingAccountPortfolio: throw new NotImplementedError('TRDLFCFTIH22321');
            case TableRecordSource.TypeId.Feed: return this.createUnloadedFeed();
            case TableRecordSource.TypeId.BrokerageAccount: return this.createUnloadedBrokerageAccount();
            case TableRecordSource.TypeId.Order: return this.createUnloadedOrder();
            case TableRecordSource.TypeId.Holding: return this.createUnloadedHolding();
            case TableRecordSource.TypeId.Balances: return this.createUnloadedBalances();
            case TableRecordSource.TypeId.TopShareholder: return this.createUnloadedTopShareholder();
            default: throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }

    tryCreateFromJson(element: JsonElement) {
        const typeId = TableRecordSource.tryGetTypeIdFromJson(element);
        if (typeId === undefined) {
            return undefined;
        } else {
            const list = this.createUnloadedFromTypeId(typeId);
            if (list === undefined) {
                return Logger.logPersistError('TRDLFTCFJ11990', TableRecordSource.Type.idToName(typeId));
            } else {
                list.loadFromJson(element);
                return list;
            }
        }
    }

    createUnloadedSymbolsDataItem() {
        return new SymbolsDataItemTableRecordSource(this._adiService, this._symbolsService);
    }

    createUnloadedLitIvemId() {
        return new LitIvemIdTableRecordSource();
    }

    createUnloadedPortfolio() {
        return new PortfolioTableRecordSource();
    }

    createUnloadedGroup() {
        return new GroupTableRecordSource();
    }

    createUnloadedFeed() {
        return new FeedTableRecordSource(this._adiService);
    }

    createUnloadedBrokerageAccount() {
        return new BrokerageAccountTableRecordSource(this._adiService);
    }

    createUnloadedOrder() {
        return new OrderTableRecordSource(this._adiService);
    }

    createUnloadedHolding() {
        return new HoldingTableRecordSource(this._adiService);
    }

    createUnloadedBalances() {
        return new BalancesTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService);
    }

    createUnloadedCallPutFromUnderlying() {
        return new CallPutFromUnderlyingTableRecordSource(this._adiService);
    }

    createUnloadedTopShareholder() {
        return new TopShareholderTableRecordSource(this._adiService);
    }
}

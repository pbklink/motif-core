/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, BrokerageAccountGroup, IvemId, LitIvemId, SearchSymbolsDataDefinition } from '../../adi/adi-internal-api';
import { AssertInternalError, Guid, Integer, JsonElement, LockOpenListItem, Logger, UnexpectedCaseError, UnreachableCaseError } from '../../sys/sys-internal-api';
import { BalancesTableDefinition } from './balances-table-definition';
import { BalancesTableRecordDefinitionList } from './balances-table-record-definition-list';
import { BrokerageAccountTableDefinition } from './brokerage-account-table-definition';
import { BrokerageAccountTableRecordDefinitionList } from './brokerage-account-table-record-definition-list';
import { CallPutFromUnderlyingTableDefinition } from './call-put-from-underlying-table-definition';
import { CallPutFromUnderlyingTableRecordDefinitionList } from './call-put-from-underlying-table-record-definition-list';
import { FeedTableDefinition } from './feed-table-definition';
import { FeedTableRecordDefinitionList } from './feed-table-record-definition-list';
import { HoldingTableDefinition } from './holding-table-definition';
import { HoldingTableRecordDefinitionList } from './holding-table-record-definition-list';
import { LitIvemIdTableDefinition } from './lit-ivem-id-table-definition';
import { LitIvemIdTableRecordDefinitionList } from './lit-ivem-id-table-record-definition-list';
import { OrderTableDefinition } from './order-table-definition';
import { OrderTableRecordDefinitionList } from './order-table-record-definition-list';
import { PortfolioTableDefinition } from './portfolio-table-definition';
import { PortfolioTableRecordDefinitionList } from './portfolio-table-record-definition-list';
import { SymbolsDataItemTableDefinition } from './symbols-data-item-table-definition';
import { SymbolsDataItemTableRecordDefinitionList } from './symbols-data-item-table-record-definition-list';
import { TableDefinition } from './table-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableRecordDefinitionListFactory } from './table-record-definition-list-factory';
import { TableRecordDefinitionListsService } from './table-record-definition-lists-service';
import { TopShareholderTableDefinition } from './top-shareholder-table-definition';
import { TopShareholderTableRecordDefinitionList } from './top-shareholder-table-record-definition-list';

export class TableDefinitionFactory {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableRecordDefinitionListsService: TableRecordDefinitionListsService,
        private readonly _recordDefinitionListFactory: TableRecordDefinitionListFactory,
    ) {
        // no code
    }

    createFromRecordDefinitionList(list: TableRecordDefinitionList): TableDefinition {
        switch (list.typeId) {
            case TableRecordDefinitionList.TypeId.Null:
                throw new UnexpectedCaseError('TSFCRDLN11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.SymbolsDataItem:
                return this.createSymbolsDataItemFromRecordDefinitionList(list as SymbolsDataItemTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.LitIvemId:
                return this.createLitIvemIdFromRecordDefinitionList(list as LitIvemIdTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Portfolio:
                return this.createPortfolioFromRecordDefinitionList(list as PortfolioTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Group:
            case TableRecordDefinitionList.TypeId.MarketMovers:
            case TableRecordDefinitionList.TypeId.IvemIdServer:
            case TableRecordDefinitionList.TypeId.Gics:
            case TableRecordDefinitionList.TypeId.ProfitIvemHolding:
            case TableRecordDefinitionList.TypeId.CashItemHolding:
            case TableRecordDefinitionList.TypeId.IntradayProfitLossSymbolRec:
            case TableRecordDefinitionList.TypeId.TmcDefinitionLegs:
            case TableRecordDefinitionList.TypeId.TmcLeg:
            case TableRecordDefinitionList.TypeId.TmcWithLegMatchingUnderlying:
            case TableRecordDefinitionList.TypeId.HoldingAccountPortfolio:
                throw new UnexpectedCaseError('TSFCRDLM11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.Feed:
                return this.createFeedFromRecordDefinitionList(list as FeedTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.BrokerageAccount:
                return this.createBrokerageAccountFromRecordDefinitionList(list as BrokerageAccountTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Order:
                return this.createOrderFromRecordDefinitionList(list as OrderTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Holding:
                return this.createHoldingFromRecordDefinitionList(list as HoldingTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Balances:
                return this.createBalancesFromRecordDefinitionList(list as BalancesTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.CallPutFromUnderlying:
                return this.createCallPutFromUnderlyingFromRecordDefinitionList(list as CallPutFromUnderlyingTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.TopShareholder:
                return this.createTopShareholderFromRecordDefinitionList(list as TopShareholderTableRecordDefinitionList);
            default:
                throw new UnreachableCaseError('TSFCFRDLD23236', list.typeId);
        }
    }

    createFromTableRecordDefinitionListDirectoryIndex(id: Guid, idx: Integer): TableDefinition {
        const list = this._tableRecordDefinitionListsService.getItemAtIndex(idx);
        switch (list.typeId) {
            case TableRecordDefinitionList.TypeId.Null:
                throw new UnexpectedCaseError('TSFCRDLN11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.SymbolsDataItem:
                return this.createSymbolsDataItemFromId(id);
            case TableRecordDefinitionList.TypeId.LitIvemId:
                return this.createLitIvemIdFromId(id);
            case TableRecordDefinitionList.TypeId.Portfolio:
                return this.createPortfolioFromId(id);
            case TableRecordDefinitionList.TypeId.Group:
            case TableRecordDefinitionList.TypeId.MarketMovers:
            case TableRecordDefinitionList.TypeId.IvemIdServer:
            case TableRecordDefinitionList.TypeId.Gics:
            case TableRecordDefinitionList.TypeId.ProfitIvemHolding:
            case TableRecordDefinitionList.TypeId.CashItemHolding:
            case TableRecordDefinitionList.TypeId.IntradayProfitLossSymbolRec:
            case TableRecordDefinitionList.TypeId.TmcDefinitionLegs:
            case TableRecordDefinitionList.TypeId.TmcLeg:
            case TableRecordDefinitionList.TypeId.TmcWithLegMatchingUnderlying:
            case TableRecordDefinitionList.TypeId.CallPutFromUnderlying:
            case TableRecordDefinitionList.TypeId.HoldingAccountPortfolio:
                throw new UnexpectedCaseError('TSFCRDLM11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.Feed:
                return this.createFeedFromId(id);
            case TableRecordDefinitionList.TypeId.BrokerageAccount:
                return this.createBrokerageAccountFromId(id);
            case TableRecordDefinitionList.TypeId.Order:
                return this.createOrderFromId(id);
            case TableRecordDefinitionList.TypeId.Holding:
                return this.createHoldingFromId(id);
            case TableRecordDefinitionList.TypeId.Balances:
                return this.createBalancesFromId(id);
            case TableRecordDefinitionList.TypeId.CallPutFromUnderlying:
                return this.createCallPutFromUnderlyingFromId(id);
            case TableRecordDefinitionList.TypeId.TopShareholder:
                return this.createTopShareholderFromId(id);
            default:
                throw new UnreachableCaseError('TSFCFRDLD23236', list.typeId);
        }
    }

    createFromTableRecordDefinitionListDirectoryId(id: Guid, locker: LockOpenListItem.Locker): TableDefinition {
        const idx = this._tableRecordDefinitionListsService.lockItemById(id, locker);
        if (idx === undefined) {
            throw new AssertInternalError('TSFCFTRDLI20091', id);
        } else {
            try {
                return this.createFromTableRecordDefinitionListDirectoryIndex(id, idx);
            } finally {
                this._tableRecordDefinitionListsService.unlockItemAtIndex(idx, locker);
            }
        }
    }

    tryCreateFromJson(element: JsonElement) {
        const privateElement = element.tryGetElement(TableDefinition.jsonTag_PrivateTableRecordDefinitionList, 'TSGTRDLTIFJS87599');

        let definition: TableDefinition | undefined;
        if (privateElement !== undefined) {
            definition = this.tryCreateFromTableRecordDefinitionListJson(privateElement);
        } else {
            definition = this.tryCreateFromDirectoryIdJson(element);
        }

        if (definition !== undefined) {
            definition.loadFromJson(element);
        }

        return definition;
    }

    createSymbolsDataItem(dataDefinition: SearchSymbolsDataDefinition) {
        const list = this._recordDefinitionListFactory.createUnloadedSymbolsDataItem();
        list.load(dataDefinition);
        return this.createSymbolsDataItemFromRecordDefinitionList(list);
    }

    createSymbolsDataItemFromRecordDefinitionList(list: SymbolsDataItemTableRecordDefinitionList) {
        return new SymbolsDataItemTableDefinition(this._tableRecordDefinitionListsService, list);
    }

    createSymbolsDataItemFromId(id: Guid) {
        return new SymbolsDataItemTableDefinition(this._tableRecordDefinitionListsService, id);
    }

    createLitIvemIdFromId(id: Guid) {
        return new LitIvemIdTableDefinition(this._adiService, this._tableRecordDefinitionListsService, id);
    }

    createLitIvemIdFromRecordDefinitionList(list: LitIvemIdTableRecordDefinitionList) {
        return new LitIvemIdTableDefinition(this._adiService, this._tableRecordDefinitionListsService, list);
    }

    createPortfolio() {
        const list = this._recordDefinitionListFactory.createUnloadedPortfolio();
        // nothing to load
        return this.createPortfolioFromRecordDefinitionList(list);
    }

    createPortfolioFromRecordDefinitionList(list: PortfolioTableRecordDefinitionList) {
        return new PortfolioTableDefinition(this._adiService, this._tableRecordDefinitionListsService, list);
    }

    createPortfolioFromId(id: Guid) {
        return new PortfolioTableDefinition(this._adiService, this._tableRecordDefinitionListsService, id);
    }

    createFeed() {
        const list = this._recordDefinitionListFactory.createUnloadedFeed();
        // nothing to load
        return this.createFeedFromRecordDefinitionList(list);
    }

    createFeedFromRecordDefinitionList(list: FeedTableRecordDefinitionList) {
        return new FeedTableDefinition(this._tableRecordDefinitionListsService, list);
    }

    createFeedFromId(id: Guid) {
        return new FeedTableDefinition(this._tableRecordDefinitionListsService, id);
    }

    createBrokerageAccount() {
        const list = this._recordDefinitionListFactory.createUnloadedBrokerageAccount();
        // nothing to load
        return this.createBrokerageAccountFromRecordDefinitionList(list);
    }

    createBrokerageAccountFromRecordDefinitionList(list: BrokerageAccountTableRecordDefinitionList) {
        return new BrokerageAccountTableDefinition(this._tableRecordDefinitionListsService, list);
    }

    createBrokerageAccountFromId(id: Guid) {
        return new BrokerageAccountTableDefinition(this._tableRecordDefinitionListsService, id);
    }

    createOrder(group: BrokerageAccountGroup) {
        const list = this._recordDefinitionListFactory.createUnloadedOrder();
        list.load(group);
        return this.createOrderFromRecordDefinitionList(list);
    }

    createOrderFromRecordDefinitionList(list: OrderTableRecordDefinitionList) {
        return new OrderTableDefinition(this._tableRecordDefinitionListsService, list);
    }

    createOrderFromId(id: Guid) {
        return new OrderTableDefinition(this._tableRecordDefinitionListsService, id);
    }

    createHolding(group: BrokerageAccountGroup) {
        const list = this._recordDefinitionListFactory.createUnloadedHolding();
        list.load(group);
        return this.createHoldingFromRecordDefinitionList(list);
    }

    createHoldingFromRecordDefinitionList(list: HoldingTableRecordDefinitionList) {
        return new HoldingTableDefinition(this._tableRecordDefinitionListsService, list);
    }

    createHoldingFromId(id: Guid) {
        return new HoldingTableDefinition(this._tableRecordDefinitionListsService, id);
    }

    createBalances(group: BrokerageAccountGroup) {
        const list = this._recordDefinitionListFactory.createUnloadedBalances();
        list.load(group);
        return this.createBalancesFromRecordDefinitionList(list);
    }

    createBalancesFromRecordDefinitionList(list: BalancesTableRecordDefinitionList) {
        return new BalancesTableDefinition(this._tableRecordDefinitionListsService, list);
    }

    createBalancesFromId(id: Guid) {
        return new BalancesTableDefinition(this._tableRecordDefinitionListsService, id);
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        const list = this._recordDefinitionListFactory.createUnloadedCallPutFromUnderlying();
        list.load(underlyingIvemId);
        return this.createCallPutFromUnderlyingFromRecordDefinitionList(list);
    }

    createCallPutFromUnderlyingFromRecordDefinitionList(list: CallPutFromUnderlyingTableRecordDefinitionList) {
        return new CallPutFromUnderlyingTableDefinition(this._adiService, this._tableRecordDefinitionListsService, list);
    }

    createCallPutFromUnderlyingFromId(id: Guid) {
        return new CallPutFromUnderlyingTableDefinition(this._adiService, this._tableRecordDefinitionListsService, id);
    }

    createTopShareholder(litIvemId: LitIvemId, tradingDate: Date | undefined, compareToTradingDate: Date | undefined) {
        const list = this._recordDefinitionListFactory.createUnloadedTopShareholder();
        list.load(litIvemId, tradingDate, compareToTradingDate);
        return this.createTopShareholderFromRecordDefinitionList(list);
    }

    createTopShareholderFromRecordDefinitionList(list: TopShareholderTableRecordDefinitionList) {
        return new TopShareholderTableDefinition(this._tableRecordDefinitionListsService, list);
    }

    createTopShareholderFromId(id: Guid) {
        return new TopShareholderTableDefinition(this._tableRecordDefinitionListsService, id);
    }

    private tryCreateFromTableRecordDefinitionListJson(element: JsonElement) {
        const list = this._recordDefinitionListFactory.tryCreateFromJson(element);
        if (list === undefined) {
            return undefined;
        } else {
            return this.createFromRecordDefinitionList(list);
        }
    }

    private tryCreateFromDirectoryIdJson(element: JsonElement) {
        let idx: Integer = -1;
        let id = element.tryGetGuid(TableDefinition.jsonTag_TableRecordDefinitionListId, 'TSFTCFDIJG33389');
        if (id === undefined) {
            Logger.logPersistError('TSFTCFDIJIU39875');
        } else {
            idx = this._tableRecordDefinitionListsService.indexOfId(id);
            if (idx < 0) {
                Logger.logPersistError('TSFTCFDIJII32321');
            }
        }

        if (idx < 0) {
            // could not find via Id - try with Type and Name
            const typeIdJson = element.tryGetString(TableDefinition.jsonTag_TableRecordDefinitionListType, 'TSFTCFDIJS20098');
            if (typeIdJson === undefined) {
                Logger.logPersistError('TSFTCFDIJU39875', element.stringify());
            } else {
                const typeId = TableRecordDefinitionList.Type.tryJsonToId(typeIdJson);
                if (typeId === undefined) {
                    Logger.logPersistError('TSFTCFDIJT78791', typeIdJson);
                } else {
                    const name = element.tryGetString(TableDefinition.jsonTag_TableRecordDefinitionListType, 'TSFTCFDIJJN99872');
                    if (name === undefined) {
                        Logger.logPersistError('TSFTCFDIJU09871', element.stringify());
                    } else {
                        // idx = this._tableRecordDefinitionListsService.indexOfListTypeAndName(typeId, name);
                        // if (idx < 0) {
                        //     Logger.logPersistError('TSFTCFDIJUX21213', `"${typeIdJson}", "${name}"`);
                        // } else {
                            const list = this._tableRecordDefinitionListsService.getItemAtIndex(idx);
                            id = list.id;
                        // }
                    }
                }
            }
        }

        if (idx < 0 || id === undefined) {
            return undefined;
        } else {
            return this.createFromTableRecordDefinitionListDirectoryIndex(id, idx);
        }
    }
}

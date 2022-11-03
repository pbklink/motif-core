/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, BrokerageAccountGroup, IvemId, LitIvemId, SearchSymbolsDataDefinition } from '../../adi/adi-internal-api';
import { AssertInternalError, Guid, Integer, JsonElement, LockOpenListItem, Logger, UnexpectedCaseError, UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { BalancesTableDefinition } from './balances-table-definition';
import { BalancesTableRecordSource } from './balances-table-record-source';
import { BrokerageAccountTableDefinition } from './brokerage-account-table-definition';
import { BrokerageAccountTableRecordSource } from './brokerage-account-table-record-source';
import { CallPutFromUnderlyingTableDefinition } from './call-put-from-underlying-table-definition';
import { CallPutFromUnderlyingTableRecordSource } from './call-put-from-underlying-table-record-source';
import { FeedTableDefinition } from './feed-table-definition';
import { FeedTableRecordSource } from './feed-table-record-source';
import { HoldingTableDefinition } from './holding-table-definition';
import { HoldingTableRecordSource } from './holding-table-record-source';
import { LitIvemIdTableDefinition } from './lit-ivem-id-table-definition';
import { LitIvemIdTableRecordSource } from './lit-ivem-id-table-record-source';
import { OrderTableDefinition } from './order-table-definition';
import { OrderTableRecordSource } from './order-table-record-source';
import { PortfolioTableDefinition } from './portfolio-table-definition';
import { PortfolioTableRecordSource } from './portfolio-table-record-source';
import { SymbolsDataItemTableDefinition } from './symbols-data-item-table-definition';
import { SymbolsDataItemTableRecordSource } from './symbols-data-item-table-record-source';
import { TableDefinition } from './table-definition';
import { TableRecordDefinitionListsService } from './table-record-definition-lists-service';
import { TableRecordSource } from './table-record-source';
import { TableRecordSourceFactory } from './table-record-source-factory';
import { TopShareholderTableDefinition } from './top-shareholder-table-definition';
import { TopShareholderTableRecordSource } from './top-shareholder-table-record-source';

export class TableDefinitionFactory {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _tableRecordDefinitionListsService: TableRecordDefinitionListsService,
        private readonly _recordDefinitionListFactory: TableRecordSourceFactory,
    ) {
        // no code
    }

    createFromRecordDefinitionList(list: TableRecordSource): TableDefinition {
        switch (list.typeId) {
            case TableRecordSource.TypeId.Null:
                throw new UnexpectedCaseError('TSFCRDLN11156', `${list.typeId}`);
            case TableRecordSource.TypeId.SymbolsDataItem:
                return this.createSymbolsDataItemFromRecordDefinitionList(list as SymbolsDataItemTableRecordSource);
            case TableRecordSource.TypeId.LitIvemId:
                return this.createLitIvemIdFromRecordDefinitionList(list as LitIvemIdTableRecordSource);
            case TableRecordSource.TypeId.Portfolio:
                return this.createPortfolioFromRecordDefinitionList(list as PortfolioTableRecordSource);
            case TableRecordSource.TypeId.Group:
            case TableRecordSource.TypeId.MarketMovers:
            case TableRecordSource.TypeId.IvemIdServer:
            case TableRecordSource.TypeId.Gics:
            case TableRecordSource.TypeId.ProfitIvemHolding:
            case TableRecordSource.TypeId.CashItemHolding:
            case TableRecordSource.TypeId.IntradayProfitLossSymbolRec:
            case TableRecordSource.TypeId.TmcDefinitionLegs:
            case TableRecordSource.TypeId.TmcLeg:
            case TableRecordSource.TypeId.TmcWithLegMatchingUnderlying:
            case TableRecordSource.TypeId.HoldingAccountPortfolio:
                throw new UnexpectedCaseError('TSFCRDLM11156', `${list.typeId}`);
            case TableRecordSource.TypeId.Feed:
                return this.createFeedFromRecordDefinitionList(list as FeedTableRecordSource);
            case TableRecordSource.TypeId.BrokerageAccount:
                return this.createBrokerageAccountFromRecordDefinitionList(list as BrokerageAccountTableRecordSource);
            case TableRecordSource.TypeId.Order:
                return this.createOrderFromRecordDefinitionList(list as OrderTableRecordSource);
            case TableRecordSource.TypeId.Holding:
                return this.createHoldingFromRecordDefinitionList(list as HoldingTableRecordSource);
            case TableRecordSource.TypeId.Balances:
                return this.createBalancesFromRecordDefinitionList(list as BalancesTableRecordSource);
            case TableRecordSource.TypeId.CallPutFromUnderlying:
                return this.createCallPutFromUnderlyingFromRecordDefinitionList(list as CallPutFromUnderlyingTableRecordSource);
            case TableRecordSource.TypeId.TopShareholder:
                return this.createTopShareholderFromRecordDefinitionList(list as TopShareholderTableRecordSource);
            default:
                throw new UnreachableCaseError('TSFCFRDLD23236', list.typeId);
        }
    }

    createFromTableRecordDefinitionListDirectoryIndex(id: Guid, idx: Integer): TableDefinition {
        const list = this._tableRecordDefinitionListsService.getItemAtIndex(idx);
        switch (list.typeId) {
            case TableRecordSource.TypeId.Null:
                throw new UnexpectedCaseError('TSFCRDLN11156', `${list.typeId}`);
            case TableRecordSource.TypeId.SymbolsDataItem:
                return this.createSymbolsDataItemFromId(id);
            case TableRecordSource.TypeId.LitIvemId:
                return this.createLitIvemIdFromId(id);
            case TableRecordSource.TypeId.Portfolio:
                return this.createPortfolioFromId(id);
            case TableRecordSource.TypeId.Group:
            case TableRecordSource.TypeId.MarketMovers:
            case TableRecordSource.TypeId.IvemIdServer:
            case TableRecordSource.TypeId.Gics:
            case TableRecordSource.TypeId.ProfitIvemHolding:
            case TableRecordSource.TypeId.CashItemHolding:
            case TableRecordSource.TypeId.IntradayProfitLossSymbolRec:
            case TableRecordSource.TypeId.TmcDefinitionLegs:
            case TableRecordSource.TypeId.TmcLeg:
            case TableRecordSource.TypeId.TmcWithLegMatchingUnderlying:
            case TableRecordSource.TypeId.CallPutFromUnderlying:
            case TableRecordSource.TypeId.HoldingAccountPortfolio:
                throw new UnexpectedCaseError('TSFCRDLM11156', `${list.typeId}`);
            case TableRecordSource.TypeId.Feed:
                return this.createFeedFromId(id);
            case TableRecordSource.TypeId.BrokerageAccount:
                return this.createBrokerageAccountFromId(id);
            case TableRecordSource.TypeId.Order:
                return this.createOrderFromId(id);
            case TableRecordSource.TypeId.Holding:
                return this.createHoldingFromId(id);
            case TableRecordSource.TypeId.Balances:
                return this.createBalancesFromId(id);
            case TableRecordSource.TypeId.CallPutFromUnderlying:
                return this.createCallPutFromUnderlyingFromId(id);
            case TableRecordSource.TypeId.TopShareholder:
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

    createSymbolsDataItemFromRecordDefinitionList(list: SymbolsDataItemTableRecordSource) {
        return new SymbolsDataItemTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createSymbolsDataItemFromId(id: Guid) {
        return new SymbolsDataItemTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createLitIvemIdFromId(id: Guid) {
        return new LitIvemIdTableDefinition(this._adiService, this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createLitIvemIdFromRecordDefinitionList(list: LitIvemIdTableRecordSource) {
        return new LitIvemIdTableDefinition(this._adiService, this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createPortfolio() {
        const list = this._recordDefinitionListFactory.createUnloadedPortfolio();
        // nothing to load
        return this.createPortfolioFromRecordDefinitionList(list);
    }

    createPortfolioFromRecordDefinitionList(list: PortfolioTableRecordSource) {
        return new PortfolioTableDefinition(this._adiService, this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createPortfolioFromId(id: Guid) {
        return new PortfolioTableDefinition(this._adiService, this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createFeed() {
        const list = this._recordDefinitionListFactory.createUnloadedFeed();
        // nothing to load
        return this.createFeedFromRecordDefinitionList(list);
    }

    createFeedFromRecordDefinitionList(list: FeedTableRecordSource) {
        return new FeedTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createFeedFromId(id: Guid) {
        return new FeedTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createBrokerageAccount() {
        const list = this._recordDefinitionListFactory.createUnloadedBrokerageAccount();
        // nothing to load
        return this.createBrokerageAccountFromRecordDefinitionList(list);
    }

    createBrokerageAccountFromRecordDefinitionList(list: BrokerageAccountTableRecordSource) {
        return new BrokerageAccountTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createBrokerageAccountFromId(id: Guid) {
        return new BrokerageAccountTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createOrder(group: BrokerageAccountGroup) {
        const list = this._recordDefinitionListFactory.createUnloadedOrder();
        list.load(group);
        return this.createOrderFromRecordDefinitionList(list);
    }

    createOrderFromRecordDefinitionList(list: OrderTableRecordSource) {
        return new OrderTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createOrderFromId(id: Guid) {
        return new OrderTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createHolding(group: BrokerageAccountGroup) {
        const list = this._recordDefinitionListFactory.createUnloadedHolding();
        list.load(group);
        return this.createHoldingFromRecordDefinitionList(list);
    }

    createHoldingFromRecordDefinitionList(list: HoldingTableRecordSource) {
        return new HoldingTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createHoldingFromId(id: Guid) {
        return new HoldingTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createBalances(group: BrokerageAccountGroup) {
        const list = this._recordDefinitionListFactory.createUnloadedBalances();
        list.load(group);
        return this.createBalancesFromRecordDefinitionList(list);
    }

    createBalancesFromRecordDefinitionList(list: BalancesTableRecordSource) {
        return new BalancesTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createBalancesFromId(id: Guid) {
        return new BalancesTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, id);
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        const list = this._recordDefinitionListFactory.createUnloadedCallPutFromUnderlying();
        list.load(underlyingIvemId);
        return this.createCallPutFromUnderlyingFromRecordDefinitionList(list);
    }

    createCallPutFromUnderlyingFromRecordDefinitionList(list: CallPutFromUnderlyingTableRecordSource) {
        return new CallPutFromUnderlyingTableDefinition(
            this._adiService,
            this._textFormatterService,
            this._tableRecordDefinitionListsService,
            list
        );
    }

    createCallPutFromUnderlyingFromId(id: Guid) {
        return new CallPutFromUnderlyingTableDefinition(
            this._adiService,
            this._textFormatterService,
            this._tableRecordDefinitionListsService,
            id
        );
    }

    createTopShareholder(litIvemId: LitIvemId, tradingDate: Date | undefined, compareToTradingDate: Date | undefined) {
        const list = this._recordDefinitionListFactory.createUnloadedTopShareholder();
        list.load(litIvemId, tradingDate, compareToTradingDate);
        return this.createTopShareholderFromRecordDefinitionList(list);
    }

    createTopShareholderFromRecordDefinitionList(list: TopShareholderTableRecordSource) {
        return new TopShareholderTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, list);
    }

    createTopShareholderFromId(id: Guid) {
        return new TopShareholderTableDefinition(this._textFormatterService, this._tableRecordDefinitionListsService, id);
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
                const typeId = TableRecordSource.Type.tryJsonToId(typeIdJson);
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

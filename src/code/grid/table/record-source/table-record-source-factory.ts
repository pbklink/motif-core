/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../../../adi/adi-internal-api';
import { SymbolsService } from '../../../services/services-internal-api';
import { AssertInternalError, JsonElement, NotImplementedError, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TableFieldSourceDefinitionFactoryService } from '../field-source/definition/grid-table-field-source-definition-internal-api';
import { BalancesTableRecordSource } from './balances-table-record-source';
import { BrokerageAccountTableRecordSource } from './brokerage-account-table-record-source';
import { CallPutFromUnderlyingTableRecordSource } from './call-put-from-underlying-table-record-source';
import {
    BalancesTableRecordSourceDefinition,
    BrokerageAccountTableRecordSourceDefinition,
    CallPutFromUnderlyingTableRecordSourceDefinition,
    FeedTableRecordSourceDefinition,
    HoldingTableRecordSourceDefinition,
    LitIvemIdFromListTableRecordSourceDefinition,
    LitIvemIdFromSearchSymbolsTableRecordSourceDefinition,
    OrderTableRecordSourceDefinition,
    TableRecordSourceDefinition,
    TopShareholderTableRecordSourceDefinition
} from "./definition/grid-table-record-source-definition-internal-api";
import { FeedTableRecordSource } from './feed-table-record-source';
import { HoldingTableRecordSource } from './holding-table-record-source';
import { LitIvemIdFromListTableRecordSource } from './lit-ivem-id-from-list-table-record-source';
import { LitIvemIdFromSearchSymbolsTableRecordSource } from './lit-ivem-id-from-search-symbols-table-record-source';
import { OrderTableRecordSource } from './order-table-record-source';
import { TableRecordSource } from './table-record-source';
import { TopShareholderTableRecordSource } from './top-shareholder-table-record-source';

export class TableRecordSourceFactory {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionFactoryService,
    ) { }

    createFromDefinition(definition: TableRecordSourceDefinition): TableRecordSource {
        switch (definition.typeId) {
            case TableRecordSourceDefinition.TypeId.Null: throw new NotImplementedError('TRSFCFDN29984');
            case TableRecordSourceDefinition.TypeId.LitIvemIdFromSearchSymbols: return this.createLitIvemIdFromSearchSymbols(definition);
            case TableRecordSourceDefinition.TypeId.LitIvemIdFromList: return this.createLitIvemIdFromList(definition);
            case TableRecordSourceDefinition.TypeId.MarketMovers: throw new NotImplementedError('TRSFCFDMM3820');
            case TableRecordSourceDefinition.TypeId.Gics: throw new NotImplementedError('TRSFCFDG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding: throw new NotImplementedError('TRSFCFDP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding: throw new NotImplementedError('TRSFCFDC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec: throw new NotImplementedError('TRSFCFDI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs: throw new NotImplementedError('TRSFCFDT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg: throw new NotImplementedError('TRSFCFDT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying: throw new NotImplementedError('TRSFCFDT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying: return this.createCallPutFromUnderlying(definition);
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio: throw new NotImplementedError('TRSFCFDH22321');
            case TableRecordSourceDefinition.TypeId.Feed: return this.createFeed(definition);
            case TableRecordSourceDefinition.TypeId.BrokerageAccount: return this.createBrokerageAccount(definition);
            case TableRecordSourceDefinition.TypeId.Order: return this.createOrder(definition);
            case TableRecordSourceDefinition.TypeId.Holding: return this.createHolding(definition);
            case TableRecordSourceDefinition.TypeId.Balances: return this.createBalances(definition);
            case TableRecordSourceDefinition.TypeId.TopShareholder: return this.createTopShareholder(definition);
            default: throw new UnreachableCaseError('TDLFCFTID17742', definition.typeId);
        }
    }

    tryCreateFromJson(element: JsonElement) {
        const typeId = TableRecordSourceDefinition.tryGetTypeIdFromJson(element);
        if (typeId === undefined) {
            return undefined;
        } else {
            const definition = this.tryCreateDefinitionFromJson(element, typeId);
            if (definition === undefined) {
                return undefined;
            } else {
                return this.createFromDefinition(definition);
            }
        }
    }

    createLitIvemIdFromSearchSymbols(definition: TableRecordSourceDefinition) {
        if (definition instanceof LitIvemIdFromSearchSymbolsTableRecordSourceDefinition) {
            return new LitIvemIdFromSearchSymbolsTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCLIIFSS21099');
        }
    }

    createLitIvemIdFromList(definition: TableRecordSourceDefinition) {
        if (definition instanceof LitIvemIdFromListTableRecordSourceDefinition) {
            return new LitIvemIdFromListTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCLIIFL21099');
        }
    }

    createFeed(definition: TableRecordSourceDefinition) {
        if (definition instanceof FeedTableRecordSourceDefinition) {
            return new FeedTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCF21099');
        }
    }

    createBrokerageAccount(definition: TableRecordSourceDefinition) {
        if (definition instanceof BrokerageAccountTableRecordSourceDefinition) {
            return new BrokerageAccountTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCBA21099');
        }
    }

    createOrder(definition: TableRecordSourceDefinition) {
        if (definition instanceof OrderTableRecordSourceDefinition) {
            return new OrderTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCO21099');
        }
    }

    createHolding(definition: TableRecordSourceDefinition) {
        if (definition instanceof HoldingTableRecordSourceDefinition) {
            return new HoldingTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCH21099');
        }
    }

    createBalances(definition: TableRecordSourceDefinition) {
        if (definition instanceof BalancesTableRecordSourceDefinition) {
            return new BalancesTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCB21099');
        }
    }

    createCallPutFromUnderlying(definition: TableRecordSourceDefinition) {
        if (definition instanceof CallPutFromUnderlyingTableRecordSourceDefinition) {
            return new CallPutFromUnderlyingTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    createTopShareholder(definition: TableRecordSourceDefinition) {
        if (definition instanceof TopShareholderTableRecordSourceDefinition) {
            return new TopShareholderTableRecordSource(this._adiService, this._tableFieldSourceDefinitionsService, definition);
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    private tryCreateDefinitionFromJson(element: JsonElement, typeId: TableRecordSourceDefinition.TypeId): TableRecordSourceDefinition | undefined {
        switch (typeId) {
            case TableRecordSourceDefinition.TypeId.Null:
                throw new NotImplementedError('TRSFTCDFJN29984');
            case TableRecordSourceDefinition.TypeId.LitIvemIdFromSearchSymbols:
                return LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.LitIvemIdFromList:
                return LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.MarketMovers:
                throw new NotImplementedError('TRSFTCDFJMM3820');
            case TableRecordSourceDefinition.TypeId.Gics:
                throw new NotImplementedError('TRSFTCDFJG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding:
                throw new NotImplementedError('TRSFTCDFJP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding:
                throw new NotImplementedError('TRSFTCDFJC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec:
                throw new NotImplementedError('TRSFTCDFJI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs:
                throw new NotImplementedError('TRSFTCDFJT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg:
                throw new NotImplementedError('TRSFTCDFJT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying:
                throw new NotImplementedError('TRSFTCDFJT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying:
                return CallPutFromUnderlyingTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio:
                throw new NotImplementedError('TRSFTCDFJH22321');
            case TableRecordSourceDefinition.TypeId.Feed:
                return HoldingTableRecordSourceDefinition.createFromJson(element);
            case TableRecordSourceDefinition.TypeId.BrokerageAccount:
                return BrokerageAccountTableRecordSourceDefinition.createFromJson(element);
            case TableRecordSourceDefinition.TypeId.Order:
                return OrderTableRecordSourceDefinition.createFromJson(element);
            case TableRecordSourceDefinition.TypeId.Holding:
                return HoldingTableRecordSourceDefinition.createFromJson(element);
            case TableRecordSourceDefinition.TypeId.Balances:
                return BalancesTableRecordSourceDefinition.createFromJson(element);
            case TableRecordSourceDefinition.TypeId.TopShareholder:
                return TopShareholderTableRecordSourceDefinition.tryCreateFromJson(element);
            default:
                throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }
}

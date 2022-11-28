/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup, IvemId, SearchSymbolsDataDefinition } from '../../../../adi/adi-internal-api';
import {
    NamedExplicitRankedLitIvemIdListDefinitionsService,
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListOrNamedReference
} from "../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { ErrorCode, JsonElement, NotImplementedError, Ok, Result, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { TableFieldSourceDefinitionsService } from '../../field-source/grid-table-field-source-internal-api';
import { BalancesTableRecordSourceDefinition } from './balances-table-record-source-definition';
import { BrokerageAccountTableRecordSourceDefinition } from './brokerage-account-table-record-source-definition';
import { CallPutFromUnderlyingTableRecordSourceDefinition } from './call-put-from-underlying-table-record-source-definition';
import { FeedTableRecordSourceDefinition } from './feed-table-record-source-definition';
import { HoldingTableRecordSourceDefinition } from './holding-table-record-source-definition';
import { LitIvemIdFromSearchSymbolsTableRecordSourceDefinition } from './lit-ivem-id-from-symbol-search-table-record-source-definition';
import { OrderTableRecordSourceDefinition } from './order-table-record-source-definition';
import { RankedLitIvemIdListTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';
import { TopShareholderTableRecordSourceDefinition } from './top-shareholder-table-record-source-definition';

export class TableRecordSourceDefinitionFactoryService {
    constructor(
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        private readonly _namedExplicitLitIvemIdListDefinitionsService: NamedExplicitRankedLitIvemIdListDefinitionsService,
        private readonly _litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
    ) {

    }

    tryCreateFromJson(element: JsonElement): Result<TableRecordSourceDefinition> {
        const typeIdResult = TableRecordSourceDefinition.tryGetTypeIdFromJson(element);
        if (typeIdResult.isErr()) {
            return typeIdResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryCreateFromJson_TypeId);
        } else {
            const definitionResult = this.tryCreateTypedFromJson(element, typeIdResult.value);
            if (definitionResult.isErr()) {
                return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryCreateFromJson_Definition);
            } else {
                const definition = definitionResult.value;
                return new Ok(definition);
            }
        }
    }

    private tryCreateTypedFromJson(element: JsonElement, typeId: TableRecordSourceDefinition.TypeId): Result<TableRecordSourceDefinition> {
        switch (typeId) {
            case TableRecordSourceDefinition.TypeId.Null:
                throw new NotImplementedError('TRSDFTCTFJN29984');
            case TableRecordSourceDefinition.TypeId.LitIvemIdFromSearchSymbols:
                return LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            case TableRecordSourceDefinition.TypeId.RankedLitIvemIdList:
                return RankedLitIvemIdListTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService,
                    this._namedExplicitLitIvemIdListDefinitionsService,
                    this._litIvemIdListDefinitionFactoryService,
                    element
                );
            case TableRecordSourceDefinition.TypeId.MarketMovers:
                throw new NotImplementedError('TRSDFTCTFJMM3820');
            case TableRecordSourceDefinition.TypeId.Gics:
                throw new NotImplementedError('TRSDFTCTFJG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding:
                throw new NotImplementedError('TRSDFTCTFJP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding:
                throw new NotImplementedError('TRSDFTCTFJC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec:
                throw new NotImplementedError('TRSDFTCTFJI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs:
                throw new NotImplementedError('TRSDFTCTFJT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg:
                throw new NotImplementedError('TRSDFTCTFJT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying:
                throw new NotImplementedError('TRSDFTCTFJT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying:
                return CallPutFromUnderlyingTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio:
                throw new NotImplementedError('TRSDFTCTFJH22321');
            case TableRecordSourceDefinition.TypeId.Feed:
                return HoldingTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            case TableRecordSourceDefinition.TypeId.BrokerageAccount:
                return BrokerageAccountTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            case TableRecordSourceDefinition.TypeId.Order:
                return OrderTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            case TableRecordSourceDefinition.TypeId.Holding:
                return HoldingTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            case TableRecordSourceDefinition.TypeId.Balances:
                return BalancesTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            case TableRecordSourceDefinition.TypeId.TopShareholder:
                return TopShareholderTableRecordSourceDefinition.tryCreateFromJson(
                    this._tableFieldSourceDefinitionsService, element
                );
            default:
                throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }

    createLitIvemIdFromSearchSymbols(dataDefinition: SearchSymbolsDataDefinition) {
        return new LitIvemIdFromSearchSymbolsTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
            dataDefinition,
        );
    }

    createRankedLitIvemIdList(rankedLitIvemIdListDefinitionOrNamedReference: RankedLitIvemIdListOrNamedReference) {
        return new RankedLitIvemIdListTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
            rankedLitIvemIdListDefinitionOrNamedReference,
        );
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        return new CallPutFromUnderlyingTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
            underlyingIvemId
        );
    }

    createFeed() {
        return new FeedTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
        );
    }

    createBrokerageAccount() {
        return new BrokerageAccountTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
        );
    }

    createOrder(brokerageAccountGroup: BrokerageAccountGroup) {
        return new OrderTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
            brokerageAccountGroup,
        );
    }

    createHolding(brokerageAccountGroup: BrokerageAccountGroup) {
        return new HoldingTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
            brokerageAccountGroup,
        );
    }

    createBalances(brokerageAccountGroup: BrokerageAccountGroup) {
        return new BalancesTableRecordSourceDefinition(
            this._tableFieldSourceDefinitionsService,
            brokerageAccountGroup,
        );
    }
}

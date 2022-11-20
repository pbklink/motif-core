/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, NotImplementedError, Ok, Result, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { BalancesTableRecordSourceDefinition } from './balances-table-record-source-definition';
import { BrokerageAccountTableRecordSourceDefinition } from './brokerage-account-table-record-source-definition';
import { CallPutFromUnderlyingTableRecordSourceDefinition } from './call-put-from-underlying-table-record-source-definition';
import { HoldingTableRecordSourceDefinition } from './holding-table-record-source-definition';
import { LitIvemIdFromSearchSymbolsTableRecordSourceDefinition } from './lit-ivem-id-from-symbol-search-table-record-source-definition';
import { OrderTableRecordSourceDefinition } from './order-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';
import { TopShareholderTableRecordSourceDefinition } from './top-shareholder-table-record-source-definition';

export class TableRecordSourceDefinitionFactoryService {
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
                return LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.LitIvemIdFromList:
                return LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.tryCreateFromJson(element);
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
                return CallPutFromUnderlyingTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio:
                throw new NotImplementedError('TRSDFTCTFJH22321');
            case TableRecordSourceDefinition.TypeId.Feed:
                return HoldingTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.BrokerageAccount:
                return BrokerageAccountTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.Order:
                return OrderTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.Holding:
                return HoldingTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.Balances:
                return BalancesTableRecordSourceDefinition.tryCreateFromJson(element);
            case TableRecordSourceDefinition.TypeId.TopShareholder:
                return TopShareholderTableRecordSourceDefinition.tryCreateFromJson(element);
            default:
                throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }
}

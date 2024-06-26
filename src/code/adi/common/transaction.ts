/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal, Integer, SourceTzOffsetDateTime } from '../../sys/internal-api';
import { BrokerageAccountId, CurrencyId, DataEnvironmentId, ExchangeId, IvemClassId, MarketId } from './data-types';

export interface Transaction {
    id: string;
    exchangeId: ExchangeId;
    environmentId: DataEnvironmentId;
    code: string;
    tradingMarketId: MarketId;
    accountId: BrokerageAccountId;
    orderStyleId: IvemClassId;
    tradeDate: SourceTzOffsetDateTime;
    settlementDate: SourceTzOffsetDateTime;
    grossAmount: Decimal;
    netAmount: Decimal;
    settlementAmount: Decimal;
    currencyId: CurrencyId | undefined;
    orderId: string;
}

export namespace Transaction {
    export function isMarket(transaction: Transaction): transaction is MarketTransaction {
        return transaction.orderStyleId === IvemClassId.Market;
    }

    export function isManagedFund(transaction: Transaction): transaction is ManagedFundTransaction {
        return transaction.orderStyleId === IvemClassId.ManagedFund;
    }
}

export interface MarketTransaction extends Transaction {
    orderStyleId: IvemClassId.Market;
    totalQuantity: Integer;
    averagePrice: Decimal;
}

export interface ManagedFundTransaction extends Transaction {
    orderStyleId: IvemClassId.ManagedFund;
    totalUnits: Decimal;
    unitValue: Decimal;
}

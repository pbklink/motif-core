/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironmentId, MarketBoardId, TradingState } from './common/adi-common-internal-api';

export interface TradingMarketBoard {
    id: MarketBoardId;
    environmentId: DataEnvironmentId;
    status: string;
    allowIds: TradingState.AllowIds | undefined;
    reasonId: TradingState.ReasonId | undefined;
}

export type TradingMarketBoards = readonly TradingMarketBoard[];

export namespace TradingMarketBoard {

    export function getMarketBoard(boards: TradingMarketBoards, marketBoardId: MarketBoardId, environmentId: DataEnvironmentId) {
        for (const board of boards) {
            if (board.id === marketBoardId && board.environmentId === environmentId) {
                return board;
            }
        }
        return undefined;
    }
}

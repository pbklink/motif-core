/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../common/internal-api';
import { ZenithConvert } from './zenith-convert';

export namespace ZenithWatchlistConvert {
    export namespace Members {
        export function toLitIvemIds(symbols: readonly string[]) {
            return ZenithConvert.Symbol.toIdArray(symbols);
        }

        export function fromLitIvemIds(litIvemIds: readonly LitIvemId[]): readonly string[] {
            return ZenithConvert.Symbol.fromIdArray(litIvemIds);
        }
    }
}

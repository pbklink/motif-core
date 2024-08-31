/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SysDecimal } from '../sys/internal-api';
import { SymbolDetailCacheService } from './symbol-detail-cache-service';

export class SecurityPriceStepper {
    // needs more work
    constructor(private _detail: SymbolDetailCacheService.LitIvemIdDetail) { }

    isOnStep(price: SysDecimal) {
        return true;
    }
}

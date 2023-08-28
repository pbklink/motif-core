/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { SymbolDetailCacheService } from './symbol-detail-cache-service';

export class SecurityPriceStepper {
    // needs more work
    constructor(private _detail: SymbolDetailCacheService.LitIvemIdDetail) { }

    isOnStep(price: Decimal) {
        return true;
    }
}

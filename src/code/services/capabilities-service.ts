/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from '../sys/sys-internal-api';
import { CapabilityId } from './capability';

export class CapabilitiesService {
    private _advertisingEnabled = false;
    private _dtrEnabled = false;

    get advertisingEnabled() { return this._advertisingEnabled; }
    get dtrEnabled() { return this._dtrEnabled; }

    setAdvertisingEnabled(value: boolean) {
        this._advertisingEnabled = value;
    }

    setDtrEnabled(value: boolean) {
        this._dtrEnabled = value;
    }

    isEnabled(id: CapabilityId) {
        switch(id) {
            case CapabilityId.Advertising: return this._advertisingEnabled;
            case CapabilityId.Dtr: return this._dtrEnabled;
            default: throw new UnreachableCaseError('CSISD29963', id);
        }
    }
}

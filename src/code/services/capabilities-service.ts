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

    isEnabled(id: CapabilityId) {
        switch(id) {
            case CapabilityId.Advertising: return this._advertisingEnabled;
            case CapabilityId.Dtr: return this._dtrEnabled;
            default: throw new UnreachableCaseError('CSISD29963', id);
        }
    }
}

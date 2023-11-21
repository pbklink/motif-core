/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Badness } from '../sys/sys-internal-api';
import { DataItem } from './data-item/internal-api';

export abstract class ExtConnectionDataItem extends DataItem {

    private _preOnlined = false;

    get Connected(): boolean { return this.getConnected(); }

    protected calculateUsabilityBadness() {
        return Badness.notBad;
    }

    protected processSubscriptionPreOnline() { // virtual
        // should only get called once
        if (this._preOnlined) {
            throw new AssertInternalError('ECDIPSPO69943437281');
        } else {
            this._preOnlined = true;
        }
    }

    protected abstract getConnected(): boolean;
}

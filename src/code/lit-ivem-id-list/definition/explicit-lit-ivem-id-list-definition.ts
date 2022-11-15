/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

export class ExplicitLitIvemIdListDefinition extends LitIvemIdListDefinition {
    readonly litIvemIds = new Array<LitIvemId>();

    constructor() {
        super(LitIvemIdListDefinition.TypeId.Explicit);
    }

    loadFromJson(element: JsonElement) {

    }

    saveToJson(element: JsonElement) {

    }

    tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined);
    }

    unlock(locker: LockOpenListItem.Locker) {
        // if (this._lockedScan === undefined) {
        //     throw new AssertInternalError('SMLIILU26997');
        // } else {
        //     this._scansService.unlockItem(this._lockedScan, locker);
        // }
    }
}

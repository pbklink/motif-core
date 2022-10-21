/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from '../sys/sys-internal-api';

export abstract class LitIvemIdList implements LockOpenListItem {
    readonly id = '';
    readonly name = '';
    readonly upperCaseName = '';

    open() {
        //
    }
    close() {
        //
    }

    equals(other: LockOpenListItem) {
        return false;
    }
}

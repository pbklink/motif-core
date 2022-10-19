/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from './lock-open-list-item';

export abstract class LitIvemIdList implements LockOpenListItem {
    readonly id = '';
    readonly name = '';
    readonly uppercaseName = '';

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

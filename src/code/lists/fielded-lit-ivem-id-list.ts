/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldedLockOpenListItem } from './fielded-lock-open-list-item';
import { LitIvemIdList } from './lit-ivem-id-list';

export class FieldedLitIvemIdList implements FieldedLockOpenListItem {
    readonly id = '';
    readonly name = '';
    readonly uppercaseName = '';
    readonly litIvemIdList: LitIvemIdList;

    open() {
        //
    }
    close() {
        //
    }

    equals(other: FieldedLockOpenListItem) {
        return false;
    }
}

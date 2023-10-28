/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenList } from '../sys/lock-open-list';
import { ServiceId } from './service';
import { ServiceLockOpenListItem } from './service-lock-open-list-item';

export abstract class ServiceLockOpenList<Item extends ServiceLockOpenListItem> extends LockOpenList<Item> {
    constructor(readonly serviceId: ServiceId) {
        super();
    }
}

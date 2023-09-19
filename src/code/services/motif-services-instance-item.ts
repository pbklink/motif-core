/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Json } from '../sys/sys-internal-api';

export interface MotifServicesInstanceItem extends Json {
    readonly instanceTypeId: MotifServicesInstanceItem.TypeId;
    readonly instanceName: string;
    readonly instanceId: string;
}

export namespace MotifServicesInstanceItem {
    export const enum TypeId {
        Layout,
    }
}

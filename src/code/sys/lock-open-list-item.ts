/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridRecord } from './grid-revgrid-types';
import { Guid } from './types';

export interface LockOpenListItem extends GridRecord {
    readonly id: Guid;
    readonly name: string;
    readonly upperCaseName: string;

    open(): void;
    close(): void;

    equals(other: LockOpenListItem): boolean;
}

export namespace LockOpenListItem {
    export interface Subscriber {
        readonly lockOpenListItemSubscriberName: string;
    }

    export interface Locker extends Subscriber {
    }

    export interface Opener extends Subscriber {
    }
}

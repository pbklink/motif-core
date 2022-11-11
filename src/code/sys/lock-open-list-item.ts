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

    open(opener: LockOpenListItem.Opener): void;
    close(opener: LockOpenListItem.Opener): void;

    tryProcessFirstLock(): boolean;
    processLastUnlock(): void;

    processFirstOpen(): void;
    processLastClose(): void;

    equals(other: LockOpenListItem): boolean;
}

export namespace LockOpenListItem {
    export interface Locker {
        readonly lockerName: string;
    }

    export interface Opener extends Locker {
    }

    export interface ListCallbackEventers {
        readonly open: ListCallbackEvents.OpenEventer;
        readonly close: ListCallbackEvents.CloseEventer;
    }

    export namespace ListCallbackEvents {
        export type OpenEventer = (this: void, item: LockOpenListItem, opener: Opener) => void;
        export type CloseEventer = (this: void, item: LockOpenListItem, opener: Opener) => void;
    }
}

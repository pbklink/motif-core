/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid } from './types';

export interface LockOpenListItem {
    readonly id: Guid;
    readonly name: string;
    readonly upperCaseName: string;

    open(): void;
    close(): void;

    equals(other: LockOpenListItem): boolean;
}

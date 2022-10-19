/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid } from '../sys/sys-internal-api';

export interface LockOpenListItem {
    readonly id: Guid;
    readonly name: string;
    readonly uppercaseName: string;

    open(): void;
    close(): void;

    equals(other: LockOpenListItem): boolean;
}

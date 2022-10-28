/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from '../../sys/lock-open-list-item';
import { GridLayout } from './grid-layout';

export class GridLayoutItem extends GridLayout implements LockOpenListItem {
    id: GridLayoutItem.Id;
    name: string;
    upperCaseName: string;
    lock(): void {
        throw new Error('Method not implemented.');
    }
    unlock(): void {
        throw new Error('Method not implemented.');
    }
    open(): void {
        throw new Error('Method not implemented.');
    }
    close(): void {
        throw new Error('Method not implemented.');
    }
    equals(other: LockOpenListItem): boolean {
        throw new Error('Method not implemented.');
    }
    index: number;
}

export namespace GridLayoutItem {
    export type Id = string;
}

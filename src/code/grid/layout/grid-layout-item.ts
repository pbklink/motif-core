/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from '../../sys/lock-open-list-item';
import { GridLayout } from './grid-layout';

export class GridLayoutItem extends GridLayout implements LockOpenListItem {
    open(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    close(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    id: GridLayoutItem.Id;
    name: string;
    upperCaseName: string;
    processFirstLock(): void {
        throw new Error('Method not implemented.');
    }
    processLastUnlock(): void {
        throw new Error('Method not implemented.');
    }
    processFirstOpen(): void {
        throw new Error('Method not implemented.');
    }
    processLastClose(): void {
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

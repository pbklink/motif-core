/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem, Result } from '../../sys/sys-internal-api';
import { GridLayout } from './grid-layout';

export class GridLayoutItem extends GridLayout implements LockOpenListItem {
    openLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    mapKey: GridLayoutItem.Id;
    tryProcessFirstLock(): Result<void> {
        throw new Error('Method not implemented.');
    }
    processLastUnlock(): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstOpen(): Result<void> {
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

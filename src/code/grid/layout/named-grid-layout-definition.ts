/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem, Result } from '../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';

/** @public */
export class NamedGridLayoutDefinition extends GridLayoutDefinition implements LockOpenListItem {
    mapKey: string;
    openLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    closeLocked(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
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
    name: string;
}

/** @public */
export namespace NamedGridLayoutDefinition {
    export function is(definition: GridLayoutDefinition): definition is NamedGridLayoutDefinition {
        return definition instanceof NamedGridLayoutDefinition;
    }
}

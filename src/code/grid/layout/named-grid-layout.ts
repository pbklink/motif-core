/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { NamedGridLayoutDefinition } from './definition/grid-layout-definition-internal-api';
import { GridLayout } from './grid-layout';

export class NamedGridLayout extends GridLayout implements LockOpenListItem {
    readonly mapKey: string;

    constructor(
        lockedDefinition: NamedGridLayoutDefinition,
        public index: number,
    ) {
        super(lockedDefinition);
        this.mapKey = lockedDefinition.id;
    }

    openLocked(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    closeLocked(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    tryProcessFirstLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined);
    }

    processLastUnlock(_locker: LockOpenListItem.Locker): void {
        // nothing to do
    }

    tryProcessFirstOpen(_opener: LockOpenListItem.Opener): Result<void> {
        return new Ok(undefined);
    }

    processLastClose(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }
}

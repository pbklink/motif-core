/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { NamedGridLayoutDefinition } from './definition/grid-layout-definition-internal-api';
import { GridLayout } from './grid-layout';

/** @public */
export class NamedGridLayout extends GridLayout implements LockOpenListItem {
    readonly id: Guid;
    readonly name: string;

    readonly mapKey: string;
    readonly upperCaseName: string;

    constructor(
        definition: NamedGridLayoutDefinition,
        public index: number,
    ) {
        super(definition);

        this.id = definition.id;
        this.name = definition.name;

        this.mapKey = this.id;
        this.upperCaseName = this.name.toUpperCase();
    }

    override createDefinition(): NamedGridLayoutDefinition {
        const definitionColumns = this.createDefinitionColumns();
        return new NamedGridLayoutDefinition(this.id, this.name, definitionColumns);
    }

    openLocked(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    closeLocked(_opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void> {
        return super.tryLock(locker);
    }

    processLastUnlock(locker: LockOpenListItem.Locker): void {
        super.unlock(locker);
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

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, IndexedRecord, LockOpenListItem, Result } from '../../sys/sys-internal-api';
import { ReferenceableGridLayoutDefinition } from './definition/grid-layout-definition-internal-api';
import { GridLayout } from './grid-layout';

/** @public */
export class ReferenceableGridLayout extends GridLayout implements LockOpenListItem, IndexedRecord {
    readonly id: Guid;
    readonly name: string;

    readonly mapKey: string;
    readonly upperCaseName: string;

    constructor(
        definition: ReferenceableGridLayoutDefinition,
        public index: number,
    ) {
        super(definition);

        this.id = definition.id;
        this.name = definition.name;

        this.mapKey = this.id;
        this.upperCaseName = this.name.toUpperCase();
    }

    override createDefinition(): ReferenceableGridLayoutDefinition {
        const definitionColumns = this.createDefinitionColumns();
        return new ReferenceableGridLayoutDefinition(this.id, this.name, definitionColumns);
    }

    async tryProcessFirstLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const result = await super.tryLock(locker);
        return result
    }

    processLastUnlock(locker: LockOpenListItem.Locker): void {
        super.unlock(locker);
    }

    processFirstOpen(opener: LockOpenListItem.Opener): void {
        this.openLocked(opener);
    }

    processLastClose(opener: LockOpenListItem.Opener): void {
        this.closeLocked(opener);
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, IndexedRecord, LockOpenListItem, Result } from '../../sys/sys-internal-api';
import { NamedGridLayoutsService } from '../layout/grid-layout-internal-api';
import { TableRecordSourceFactoryService } from '../table/grid-table-internal-api';
import { GridRowOrderDefinition, NamedGridSourceDefinition } from './definition/grid-source-definition-internal-api';
import { GridSource } from './grid-source';

export class NamedGridSource extends GridSource implements LockOpenListItem, IndexedRecord {
    readonly id: Guid;
    readonly name: string;

    readonly mapKey: string;
    readonly upperCaseName: string;

    constructor(
        namedGridLayoutsService: NamedGridLayoutsService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        lockedDefinition: NamedGridSourceDefinition,
        public index: number,
    ) {
        super(namedGridLayoutsService, tableRecordSourceFactoryService, lockedDefinition);

        this.id = lockedDefinition.id;
        this.name = lockedDefinition.name;

        this.mapKey = this.id;
        this.upperCaseName = this.name.toUpperCase();
    }

    override createDefinition(
        rowOrderDefinition: GridRowOrderDefinition,
    ): NamedGridSourceDefinition {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();
        const gridLayoutOrNamedReferenceDefinition = this.createGridLayoutOrNamedReferenceDefinition();

        return new NamedGridSourceDefinition(
            this.id,
            this.name,
            tableRecordSourceDefinition,
            gridLayoutOrNamedReferenceDefinition,
            rowOrderDefinition,
        );
    }

    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void> {
        return this.tryLock(locker);
    }

    processLastUnlock(locker: LockOpenListItem.Locker): void {
        this.unlock(locker);
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

export namespace NamedGridSource {

}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, IndexedRecord, LockOpenListItem, Result } from '../../sys/sys-internal-api';
import { ReferenceableGridLayoutsService } from '../layout/grid-layout-internal-api';
import { TableRecordSourceFactoryService } from '../table/grid-table-internal-api';
import { GridRowOrderDefinition, ReferenceableGridSourceDefinition } from './definition/grid-source-definition-internal-api';
import { GridSource } from './grid-source';

export class ReferenceableGridSource extends GridSource implements LockOpenListItem, IndexedRecord {
    readonly id: Guid;
    readonly name: string;

    readonly mapKey: string;
    readonly upperCaseName: string;

    constructor(
        referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        lockedDefinition: ReferenceableGridSourceDefinition,
        public index: number,
    ) {
        super(referenceableGridLayoutsService, tableRecordSourceFactoryService, lockedDefinition);

        this.id = lockedDefinition.id;
        this.name = lockedDefinition.name;

        this.mapKey = this.id;
        this.upperCaseName = this.name.toUpperCase();
    }

    override createDefinition(
        rowOrderDefinition: GridRowOrderDefinition,
    ): ReferenceableGridSourceDefinition {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();
        const gridLayoutOrReferenceDefinition = this.createGridLayoutOrReferenceDefinition();

        return new ReferenceableGridSourceDefinition(
            this.id,
            this.name,
            tableRecordSourceDefinition,
            gridLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );
    }

    async tryProcessFirstLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        const result = await this.tryLock(locker);
        return result;
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

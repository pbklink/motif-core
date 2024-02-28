/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedRecord, LockOpenListItem } from '../../sys/sys-internal-api';
import { ReferenceableGridLayoutsService } from '../layout/grid-layout-internal-api';
import { TableRecordSourceFactory } from '../table/internal-api';
import { GridRowOrderDefinition, ReferenceableGridSourceDefinition } from './definition/grid-source-definition-internal-api';
import { GridSource } from './grid-source';

export class ReferenceableGridSource extends GridSource implements LockOpenListItem<ReferenceableGridSource>, IndexedRecord {
    readonly name: string;
    readonly upperCaseName: string;

    constructor(
        referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        lockedDefinition: ReferenceableGridSourceDefinition,
        index: number,
    ) {
        const id = lockedDefinition.id;
        super(referenceableGridLayoutsService, tableRecordSourceFactory, lockedDefinition, id, id);

        this.name = lockedDefinition.name;
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
}

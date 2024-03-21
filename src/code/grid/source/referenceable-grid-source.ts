/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedRecord, LockOpenListItem } from '../../sys/internal-api';
import { ReferenceableGridLayoutsService } from '../layout/internal-api';
import { TableFieldSourceDefinitionFactory, TableRecordSourceFactory } from '../table/internal-api';
import { GridRowOrderDefinition, ReferenceableGridSourceDefinition } from './definition/internal-api';
import { GridSource } from './grid-source';

export class ReferenceableGridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>
    extends GridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>
    implements LockOpenListItem<ReferenceableGridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>>, IndexedRecord {

    readonly name: string;
    readonly upperCaseName: string;

    constructor(
        referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        tableFieldSourceDefinitionFactory: TableFieldSourceDefinitionFactory<TableFieldSourceDefinitionTypeId>,
        tableRecordSourceFactory: TableRecordSourceFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>,
        lockedDefinition: ReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        index: number,
    ) {
        const id = lockedDefinition.id;
        super(referenceableGridLayoutsService, tableFieldSourceDefinitionFactory, tableRecordSourceFactory, lockedDefinition, id, id);

        this.name = lockedDefinition.name;
        this.upperCaseName = this.name.toUpperCase();
    }

    override createDefinition(rowOrderDefinition: GridRowOrderDefinition<TableFieldSourceDefinitionTypeId>): ReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();
        const gridLayoutOrReferenceDefinition = this.createGridLayoutOrReferenceDefinition();

        return new ReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
            this.id,
            this.name,
            tableRecordSourceDefinition,
            gridLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedRecord, LockOpenListItem } from '@xilytix/sysutils';
import { ReferenceableGridLayoutsService } from '../grid-layout/internal-api';
import { RevTableFieldSourceDefinitionFactory, RevTableRecordSourceFactory } from '../table/internal-api';
import { RevGridRowOrderDefinition, RevReferenceableDataSourceDefinition } from './definition/internal-api';
import { RevDataSource } from './rev-data-source';

export class RevReferenceableDataSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>
    extends RevDataSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>
    implements LockOpenListItem<RevReferenceableDataSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>>, IndexedRecord {

    readonly name: string;
    readonly upperCaseName: string;

    constructor(
        referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        tableFieldSourceDefinitionFactory: RevTableFieldSourceDefinitionFactory<TableFieldSourceDefinitionTypeId>,
        tableRecordSourceFactory: RevTableRecordSourceFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>,
        lockedDefinition: RevReferenceableDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        index: number,
    ) {
        const id = lockedDefinition.id;
        super(referenceableGridLayoutsService, tableFieldSourceDefinitionFactory, tableRecordSourceFactory, lockedDefinition, id, id);

        this.name = lockedDefinition.name;
        this.upperCaseName = this.name.toUpperCase();
    }

    override createDefinition(rowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId>): RevReferenceableDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();
        const gridLayoutOrReferenceDefinition = this.createGridLayoutOrReferenceDefinition();

        return new RevReferenceableDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
            this.id,
            this.name,
            tableRecordSourceDefinition,
            gridLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );
    }
}

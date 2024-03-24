/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedRecord, LockOpenListItem } from '../../sys/internal-api';
import { ReferenceableGridLayoutsService } from '../layout/internal-api';
import { RevTableFieldSourceDefinitionFactory, RevTableRecordSourceFactory } from '../table/internal-api';
import { RevGridRowOrderDefinition, RevReferenceableGridSourceDefinition } from './definition/internal-api';
import { GridSource } from './grid-source';

export class ReferenceableGridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>
    extends GridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>
    implements LockOpenListItem<ReferenceableGridSource<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>>, IndexedRecord {

    readonly name: string;
    readonly upperCaseName: string;

    constructor(
        referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        tableFieldSourceDefinitionFactory: RevTableFieldSourceDefinitionFactory<TableFieldSourceDefinitionTypeId>,
        tableRecordSourceFactory: RevTableRecordSourceFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, Badness>,
        lockedDefinition: RevReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        index: number,
    ) {
        const id = lockedDefinition.id;
        super(referenceableGridLayoutsService, tableFieldSourceDefinitionFactory, tableRecordSourceFactory, lockedDefinition, id, id);

        this.name = lockedDefinition.name;
        this.upperCaseName = this.name.toUpperCase();
    }

    override createDefinition(rowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId>): RevReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
        const tableRecordSourceDefinition = this.createTableRecordSourceDefinition();
        const gridLayoutOrReferenceDefinition = this.createGridLayoutOrReferenceDefinition();

        return new RevReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
            this.id,
            this.name,
            tableRecordSourceDefinition,
            gridLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );
    }
}

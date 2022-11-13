/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { Guid, LockOpenListItem } from '../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition } from '../table/record-source/definition/grid-table-record-source-definition-internal-api';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class NamedGridSourceDefinition extends GridSourceDefinition implements LockOpenListItem {
    readonly upperCaseName: string;

    private readonly locker: LockOpenListItem.Locker;

    constructor(
        // private readonly _namedGridLayoutsService: NamedGridLayoutsService,
        readonly mapKey: string,
        readonly name: string,
        public index: number,
        tableRecordSourceDefinition: TableRecordSourceDefinition,
        gridLayoutDefinitionOrId: GridLayoutDefinition | Guid,
    ) {
        super(tableRecordSourceDefinition, gridLayoutDefinitionOrId);
        this.upperCaseName = name.toUpperCase();
        this.locker = {
            lockerName: `${Strings[StringId.Grid]}: ${name}`
        }
    }

    open(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    close(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstLock(): boolean {
        if (typeof this.gridLayoutDefinitionOrId === 'string') {
            this
        } else {

        }
        return this.tableRecordSourceDefinition.tryLock(this.locker)
    }
    processLastUnlock(): void {
        throw new Error('Method not implemented.');
    }
    processFirstOpen(): void {
        throw new Error('Method not implemented.');
    }
    processLastClose(): void {
        throw new Error('Method not implemented.');
    }
    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }
}

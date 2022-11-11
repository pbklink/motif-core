/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { Guid, LockOpenListItem } from '../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition } from '../table/record-source/definition/grid-table-record-source-definition-internal-api';

export class GridSourceDefinition implements LockOpenListItem {
    readonly upperCaseName: string;
    readonly locker: LockOpenListItem.Locker;
    readonly gridLayoutId: Guid | undefined;

    private _gridLayoutDefinition: GridLayoutDefinition;

    constructor(
        // private readonly _namedGridLayoutsService: NamedGridLayoutsService,
        readonly mapKey: string,
        readonly name: string,
        readonly tableRecordSourceDefinition: TableRecordSourceDefinition,
        public gridLayoutDefinitionOrId: GridLayoutDefinition | Guid,
        public index: number,
    ) {
        this.upperCaseName = name.toUpperCase();
        this.locker = {
            lockerName: `${Strings[StringId.Grid]}: ${name}`
        }
        if (typeof this.gridLayoutDefinitionOrId === 'string') {
            this.gridLayoutId = this.gridLayoutDefinitionOrId;
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

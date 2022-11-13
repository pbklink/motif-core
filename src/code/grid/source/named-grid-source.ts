/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout';
import { TableRecordSource } from '../table/record-source/grid-table-record-source-internal-api';
import { GridSource } from './grid-source';

export class NamedGridSource extends GridSource implements LockOpenListItem {
    readonly mapKey: string;
    readonly upperCaseName: string;

    constructor(
        readonly name: string,
        public index: number,
        tableRecordSource: TableRecordSource,
        layout: GridLayout,
    ) {
        super(tableRecordSource, layout)
        this.mapKey = name;
        this.upperCaseName = name.toUpperCase();

    }

    open(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    close(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    tryProcessFirstLock() {
        return false;
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

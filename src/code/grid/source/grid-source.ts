/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem, MapKey } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout';
import { TableRecordSource } from '../table/record-source/grid-table-record-source-internal-api';

export class GridSource implements LockOpenListItem {
    readonly upperCaseName: string;

    constructor(
        readonly mapKey: MapKey,
        readonly name: string,
        readonly tableRecordSource: TableRecordSource,
        readonly layout: GridLayout,
        public index: number,
    ) {
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

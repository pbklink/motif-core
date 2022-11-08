/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition } from '../table/record-source/definition/grid-table-record-source-definition-internal-api';

export class GridSourceDefinition implements LockOpenListItem {
    id: string;
    name: string;
    upperCaseName: string;
    open(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    close(opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }
    processFirstLock(): void {
        throw new Error('Method not implemented.');
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
        throw new Error('Method not implemented.');
    }
    index: number;
    layout: GridLayout;
    recordSourceDefinition: TableRecordSourceDefinition;
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessBadness, LockOpenListItem } from '../../sys/sys-internal-api';
import { TableRecord } from './table-record';
import { TableRecordSource } from './table-record-source';

export class TableRecordList extends CorrectnessBadness implements LockOpenListItem {
    id: string;
    name: string;
    upperCaseName: string;
    lock(): void {
        throw new Error('Method not implemented.');
    }
    unlock(): void {
        throw new Error('Method not implemented.');
    }
    open(): void {
        throw new Error('Method not implemented.');
    }
    close(): void {
        throw new Error('Method not implemented.');
    }
    equals(other: LockOpenListItem): boolean {
        throw new Error('Method not implemented.');
    }
    index: number;

    private readonly _source: TableRecordSource;

    private _records: TableRecord[] = [];
}

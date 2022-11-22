/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, LockOpenListItem, Ok } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { Table, TableRecordSource, TableRecordSourceFactoryService } from '../table/grid-table-internal-api';
import { GridSourceDefinition } from './definition/grid-source-definition-internal-api';

/** @public */
export class GridSource {
    private _tableRecordSource: TableRecordSource | undefined;
    private _table: Table | undefined;
    private _gridLayout: GridLayout | undefined;

    get openedTableRecordSource() { return this._tableRecordSource; }
    get openedTable() { return this._table; }
    get openedGridLayout() { return this._gridLayout; }

    constructor(readonly lockedDefinition: GridSourceDefinition) {

    }

    open(tableRecordSourceFactoryService: TableRecordSourceFactoryService, opener: LockOpenListItem.Opener) {
        const lockedTableRecordSourceDefinition = this.lockedDefinition.lockedTableRecordSourceDefinition;
        if (lockedTableRecordSourceDefinition === undefined) {
            throw new AssertInternalError('GSTOT45000');
        } else {
            const tableRecordSource = tableRecordSourceFactoryService.createFromDefinition(lockedTableRecordSourceDefinition);
            tableRecordSource.open(opener);
            this._tableRecordSource = tableRecordSource;

            const lockedGridLayoutDefinition = this.lockedDefinition.lockedGridLayoutDefinition;
            if (lockedGridLayoutDefinition === undefined) {
                throw new AssertInternalError('GSTOL45000');
            } else {
                const gridLayout = new GridLayout(lockedGridLayoutDefinition);
                gridLayout.open(opener, /*tableRecordSource.fieldList*/[]);
                this._tableRecordSource = tableRecordSource;
                this._gridLayout = gridLayout;
                this._table = new Table(tableRecordSource);

                return new Ok(undefined);
            }
        }
    }

    close(opener: LockOpenListItem.Opener) {
        if (this._gridLayout !== undefined) {
            this._gridLayout.close(opener);
            this._gridLayout = undefined;
        }

        this._table = undefined;

        if (this._tableRecordSource !== undefined) {
            this._tableRecordSource.close(opener);
            this._tableRecordSource = undefined;
        }
    }
}

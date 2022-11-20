/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem } from '../../sys/lock-open-list-item';
import { AssertInternalError, ErrorCode, Ok, Result } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { TableRecordSource, TableRecordSourceFactoryService } from '../table/grid-table-internal-api';
import { GridSourceDefinition } from './definition/grid-source-definition-internal-api';

/** @public */
export class GridSource {
    private _openedTableRecordSource: TableRecordSource | undefined;
    private _openedGridLayout: GridLayout | undefined;

    get openedTableRecordSource() { return this._openedTableRecordSource; }
    get openedGridLayout() { return this._openedGridLayout; }

    constructor(readonly lockedDefinition: GridSourceDefinition) {

    }

    tryOpen(
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        opener: LockOpenListItem.Opener
    ): Result<void> {
        const lockedTableRecordSourceDefinition = this.lockedDefinition.lockedTableRecordSourceDefinition;
        if (lockedTableRecordSourceDefinition === undefined) {
            throw new AssertInternalError('GSTOT45000');
        } else {
            const tableRecordSource = tableRecordSourceFactoryService.createFromDefinition(lockedTableRecordSourceDefinition);
            const openTableRecordSourceResult = tableRecordSource.tryOpen(opener);
            if (openTableRecordSourceResult.isErr()) {
                return openTableRecordSourceResult.createOuter(ErrorCode.GridSource_OpenTableRecordSource);
            } else {
                this._openedTableRecordSource = tableRecordSource;

                const lockedGridLayoutDefinition = this.lockedDefinition.lockedGridLayoutDefinition;
                if (lockedGridLayoutDefinition === undefined) {
                    throw new AssertInternalError('GSTOL45000');
                } else {
                    const defaultLayout = this._openedTableRecordSource.createDefaultLayout();
                    const gridLayout = new GridLayout(lockedGridLayoutDefinition, defaultLayout);
                    const openGridLayoutResult = gridLayout.tryOpen(opener);
                    if (openGridLayoutResult.isErr()) {
                        this._openedTableRecordSource.close(opener);
                        this._openedTableRecordSource = undefined;
                        return openGridLayoutResult.createOuter(ErrorCode.GridSource_OpenGridLayout);
                    } else {
                        this._openedTableRecordSource = tableRecordSource;
                        this._openedGridLayout = gridLayout;

                        return new Ok(undefined);
                    }
                }
            }
        }
    }

    close(opener: LockOpenListItem.Opener) {
        if (this._openedGridLayout !== undefined) {
            this._openedGridLayout.close(opener);
            this._openedGridLayout = undefined;
        }

        if (this._openedTableRecordSource !== undefined) {
            this._openedTableRecordSource.close(opener);
            this._openedTableRecordSource = undefined;
        }
    }
}

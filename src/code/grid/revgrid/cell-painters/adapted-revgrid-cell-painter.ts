/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// not used
import { CellPainter, DataServer, DatalessViewCell } from '@xilytix/revgrid';
import { GridField } from '../../field/internal-api';
import { AdaptedRevgrid } from '../adapted-revgrid/adapted-revgrid';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';

export abstract class AdaptedRevgridCellPainter implements CellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    constructor(
        protected readonly _grid: AdaptedRevgrid,
        protected readonly _dataServer: DataServer<GridField>,
    ) {
        // const grid = this._grid;
        // this._gridSettings = grid.settings;
        // this._renderingContext = grid.canvas.gc;
    }


    abstract paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined): number | undefined;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// not used
import { RevCellPainter, RevDatalessViewCell, RevDataServer } from '@xilytix/revgrid';
import { GridField } from '../../field/internal-api';
import { SourcedFieldGrid } from '../adapted-revgrid/sourced-field-grid';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';

export abstract class AdaptedRevgridCellPainter implements RevCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    constructor(
        protected readonly _grid: SourcedFieldGrid,
        protected readonly _dataServer: RevDataServer<GridField>,
    ) {
        // const grid = this._grid;
        // this._gridSettings = grid.settings;
        // this._renderingContext = grid.canvas.gc;
    }


    abstract paint(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined): number | undefined;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CachedCanvasRenderingContext2D, CellPainter, DataServer, DatalessViewCell } from 'revgrid';
import { ColorSettings, ScalarSettings, SettingsService } from '../../../../services/services-internal-api';
import { GridField } from '../../../field/grid-field-internal-api';
import { AdaptedRevgrid } from '../../adapted-revgrid/grid-revgrid-adapted-revgrid-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../../settings/adapted-revgrid-behaviored-column-settings';
import { AdaptedRevgridBehavioredGridSettings } from '../../settings/adapted-revgrid-behaviored-grid-settings';

export abstract class HeaderCellPainter implements CellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    protected readonly _gridSettings: AdaptedRevgridBehavioredGridSettings;
    protected readonly _renderingContext: CachedCanvasRenderingContext2D;
    protected readonly _scalarSettings: ScalarSettings;
    protected readonly _colorSettings: ColorSettings;

    constructor(
        settingsService: SettingsService,
        protected readonly grid: AdaptedRevgrid,
        protected readonly dataServer: DataServer<GridField>
    ) {
        this._gridSettings = grid.settings;
        this._renderingContext = grid.canvas.gc;
        this._scalarSettings = settingsService.scalar;
        this._colorSettings = settingsService.color;
    }

    abstract paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, _prefillColor: string | undefined): number | undefined;
}

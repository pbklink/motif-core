/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevCachedCanvasRenderingContext2D, RevCellPainter, RevDatalessViewCell, RevDataServer } from '@xilytix/revgrid';
import { ColorSettings, ScalarSettings, SettingsService } from '../../../../services/internal-api';
import { GridField } from '../../../field/internal-api';
import { SourcedFieldGrid } from '../../adapted-revgrid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../../settings/adapted-revgrid-behaviored-column-settings';
import { AdaptedRevgridBehavioredGridSettings } from '../../settings/adapted-revgrid-behaviored-grid-settings';

export abstract class HeaderCellPainter implements RevCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    protected readonly _gridSettings: AdaptedRevgridBehavioredGridSettings;
    protected readonly _renderingContext: RevCachedCanvasRenderingContext2D;
    protected readonly _scalarSettings: ScalarSettings;
    protected readonly _colorSettings: ColorSettings;

    constructor(
        settingsService: SettingsService,
        protected readonly grid: SourcedFieldGrid,
        protected readonly dataServer: RevDataServer<GridField>
    ) {
        this._gridSettings = grid.settings;
        this._renderingContext = grid.canvas.gc;
        this._scalarSettings = settingsService.scalar;
        this._colorSettings = settingsService.color;
    }

    abstract paint(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, _prefillColor: string | undefined): number | undefined;
}

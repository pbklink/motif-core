import { CachedCanvasRenderingContext2D, DataServer, DatalessViewCell, Revgrid } from 'revgrid';
import { RenderValue } from '../../../../services/services-internal-api';
import { ColorSettings, CoreSettings, SettingsService } from '../../../../settings/settings-internal-api';
import { GridField } from '../../../field/grid-field-internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../../settings/grid-revgrid-settings-internal-api';

/** @public */
export abstract class RenderValueCellPainter {
    protected readonly _gridSettings: AdaptedRevgridBehavioredGridSettings;
    protected readonly _renderingContext: CachedCanvasRenderingContext2D;
    protected readonly _coreSettings: CoreSettings;
    protected readonly _colorSettings: ColorSettings;

    constructor(
        settingsService: SettingsService,
        protected readonly _grid: Revgrid<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField>,
        readonly dataServer: DataServer<GridField>,
    ) {
        const grid = this._grid;
        this._gridSettings = grid.settings;
        this._renderingContext = grid.canvas.gc;
        this._coreSettings = settingsService.core;
        this._colorSettings = settingsService.color;
    }

    abstract paintValue(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined, renderValue: RenderValue): number | undefined;

    protected paintBorder() {

    }
}

export namespace RenderValueCellPainter {
    export interface PaintFingerprintInterface {
        bkgdColor: string;
        foreColor: string;
        internalBorderColor: string | undefined;
        internalBorderRowOnly: boolean;
        focusedCellBorderColor: string | undefined;
    }
}

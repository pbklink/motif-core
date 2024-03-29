/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StandardToggleClickBoxCellEditor } from '@xilytix/revgrid';
import { SettingsService } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { CheckboxRenderValueCellPainter, CheckboxRenderValueRecordGridCellPainter } from '../cell-painters/internal-api';
import { RecordGrid, RecordGridDataServer } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';

export class CheckboxRenderValueRecordGridCellEditor extends StandardToggleClickBoxCellEditor<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> {
    constructor(settingsService: SettingsService, grid: RecordGrid, dataServer: RecordGridDataServer) {
        const valueCellPainter = new CheckboxRenderValueCellPainter(settingsService, grid, dataServer, true);
        const gridCellPainter = new CheckboxRenderValueRecordGridCellPainter(valueCellPainter);
        super(grid, dataServer, gridCellPainter);
    }
}

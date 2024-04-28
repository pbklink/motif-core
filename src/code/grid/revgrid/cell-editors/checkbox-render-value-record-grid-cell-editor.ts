/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevStandardToggleClickBoxCellEditor } from '@xilytix/revgrid';
import { SettingsService } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { SourcedFieldGrid } from '../adapted-revgrid/internal-api';
import { CheckboxRenderValueCellPainter, CheckboxRenderValueRecordGridCellPainter } from '../cell-painters/internal-api';
import { RecordGridDataServer } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';

export class CheckboxRenderValueRecordGridCellEditor extends RevStandardToggleClickBoxCellEditor<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> {
    constructor(settingsService: SettingsService, grid: SourcedFieldGrid, dataServer: RecordGridDataServer) {
        const valueCellPainter = new CheckboxRenderValueCellPainter(settingsService, grid, dataServer, true);
        const gridCellPainter = new CheckboxRenderValueRecordGridCellPainter(valueCellPainter);
        super(grid, dataServer, gridCellPainter);
    }
}

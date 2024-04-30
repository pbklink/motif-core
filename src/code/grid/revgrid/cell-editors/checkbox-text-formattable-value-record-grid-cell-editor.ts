/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevStandardToggleClickBoxCellEditor } from '@xilytix/revgrid';
import { SettingsService } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { SourcedFieldGrid } from '../adapted-revgrid/internal-api';
import { CheckboxTextFormattableValueCellPainter, CheckboxTextFormattableValueRecordGridCellPainter } from '../cell-painters/internal-api';
import { RecordGridDataServer } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';

export class CheckboxTextFormattableValueRecordGridCellEditor extends RevStandardToggleClickBoxCellEditor<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> {
    constructor(settingsService: SettingsService, grid: SourcedFieldGrid, dataServer: RecordGridDataServer) {
        const valueCellPainter = new CheckboxTextFormattableValueCellPainter(settingsService, grid, dataServer, true);
        const gridCellPainter = new CheckboxTextFormattableValueRecordGridCellPainter(valueCellPainter);
        super(grid, dataServer, gridCellPainter);
    }
}

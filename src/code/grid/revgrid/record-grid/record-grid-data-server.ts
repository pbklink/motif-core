/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordDataServer } from '@xilytix/revgrid';
import { ScalarSettings } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';

export class RecordGridDataServer extends RevRecordDataServer<GridField> {
    applySettings(scalarSettings: ScalarSettings) {
        this.allChangedRecentDuration = scalarSettings.grid_AllChangedRecentDuration;
        this.recordInsertedRecentDuration = scalarSettings.grid_RecordInsertedRecentDuration;
        this.recordUpdatedRecentDuration = scalarSettings.grid_RecordUpdatedRecentDuration;
        this.valueChangedRecentDuration = scalarSettings.grid_ValueChangedRecentDuration;
    }
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordSourcedFieldGrid } from '@xilytix/revgrid';
import { TextFormattableValue } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';

export class RecordSourcedFieldGrid extends RevRecordSourcedFieldGrid<
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId,
    AdaptedRevgridBehavioredGridSettings,
    AdaptedRevgridBehavioredColumnSettings,
    GridField
> {

}

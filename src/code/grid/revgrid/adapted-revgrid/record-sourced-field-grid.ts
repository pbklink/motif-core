/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordSourcedFieldGrid } from '@xilytix/revgrid';
import { RenderValue } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';

export class RecordSourcedFieldGrid extends RevRecordSourcedFieldGrid<
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    AdaptedRevgridBehavioredGridSettings,
    AdaptedRevgridBehavioredColumnSettings,
    GridField
> {

}

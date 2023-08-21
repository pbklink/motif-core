import { DatalessViewCell } from 'revgrid';
import { RenderValue } from '../../../../services/services-internal-api';
import { Integer } from '../../../../sys/sys-internal-api';
import { GridField } from '../../../field/grid-field-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../../settings/grid-revgrid-settings-internal-api';
import { RenderValueCellPainter } from './render-value-cell-painter';

export class CheckboxRenderValueCellPainter extends RenderValueCellPainter {

    paintValue(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined, renderValue: RenderValue): Integer | undefined {
        return undefined;
    }
}

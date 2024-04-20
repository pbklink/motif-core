/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableValueSource } from '@xilytix/revgrid';
import { RenderValue } from '../../../services/internal-api';

export abstract class TableValueSource extends RevTableValueSource<RenderValue.TypeId, RenderValue.Attribute.TypeId> {
}

export namespace TableValueSource {
    export type ValueChange = RevTableValueSource.ValueChange<RenderValue.TypeId, RenderValue.Attribute.TypeId>;
}

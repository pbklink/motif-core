/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableValueSource } from '@xilytix/revgrid';
import { TextFormattableValue } from '../../../services/internal-api';

export abstract class TableValueSource extends RevTableValueSource<TextFormattableValue.TypeId, TextFormattableValue.Attribute.TypeId> {
}

export namespace TableValueSource {
    export type ValueChange = RevTableValueSource.ValueChange<TextFormattableValue.TypeId, TextFormattableValue.Attribute.TypeId>;
}

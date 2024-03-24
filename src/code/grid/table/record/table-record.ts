/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecord } from '../../../rev/internal-api';
import { RenderValue } from '../../../services/internal-api';

export class TableRecord extends RevTableRecord<RenderValue.TypeId, RenderValue.Attribute.TypeId> {
}

export namespace TableRecord {
    // export type ValueChange = RevTableValueSource.ValueChange<RenderValue.TypeId, RenderValue.Attribute.TypeId>;

    // export type ValuesChangedEventHandler = (this: void, recordIdx: Integer, invalidatedValues: GridRecordInvalidatedValue[]) => void;
    // export type SequentialFieldValuesChangedEventHandler = (this: void, recordIdx: Integer, fieldIdx: Integer, fieldCount: Integer) => void;
    // export type RecordChangedEventHandler = (this: void, recordIdx: Integer) => void;

    export type EventHandlers = RevTableRecord.EventHandlers;
}

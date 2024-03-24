/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecordStore } from '../../rev/internal-api';
import { RenderValue } from '../../services/internal-api';
import { Badness } from "../../sys/internal-api";
import { TypedTableFieldSourceDefinition } from './field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './record-source/internal-api';

/** @public */
export class TableRecordStore extends RevTableRecordStore<
    TypedTableRecordSourceDefinition.TypeId,
    TypedTableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
}

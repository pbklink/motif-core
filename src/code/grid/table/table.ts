/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTable } from '../../rev/internal-api';
import { RenderValue } from '../../services/internal-api';
import { Badness } from "../../sys/internal-api";
import { TypedTableFieldSourceDefinition } from './field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './record-source/internal-api';

export class Table extends RevTable<
    TypedTableRecordSourceDefinition.TypeId,
    TypedTableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
}

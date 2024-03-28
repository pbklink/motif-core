/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTable } from '@xilytix/rev-data-source';
import { RenderValue } from '../../services/internal-api';
import { Badness } from "../../sys/internal-api";
import { TableFieldSourceDefinition } from './field-source/internal-api';
import { TableRecordSourceDefinition } from './record-source/internal-api';

export class Table extends RevTable<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
}

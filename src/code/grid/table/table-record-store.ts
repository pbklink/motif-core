/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecordStore } from '@xilytix/revgrid';
import { RenderValue } from '../../services/internal-api';
import { Badness } from "../../sys/internal-api";
import { TableFieldSourceDefinition } from './field-source/internal-api';
import { TableRecordSourceDefinition } from './record-source/internal-api';

/** @public */
export class TableRecordStore extends RevTableRecordStore<
    Badness,
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
> {
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableDataSource } from '@xilytix/revgrid';
import { RenderValue } from '../../services/internal-api';
import { Badness } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';

export class ReferenceableDataSource extends RevReferenceableDataSource<
    Badness,
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
> {

}

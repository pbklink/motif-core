/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableDataSourceDefinition } from '@xilytix/revgrid';
import { RenderValue } from '../../services/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';

export class ReferenceableDataSourceDefinition extends RevReferenceableDataSourceDefinition<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
> {

}


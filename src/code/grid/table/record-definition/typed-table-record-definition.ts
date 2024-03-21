/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface TypedTableRecordDefinition extends TableRecordDefinition<TypedTableFieldSourceDefinition.TypeId> {

}

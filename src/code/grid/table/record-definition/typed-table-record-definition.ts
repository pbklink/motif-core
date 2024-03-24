/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecordDefinition } from '../../../rev/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';

export interface TypedTableRecordDefinition extends RevTableRecordDefinition<TypedTableFieldSourceDefinition.TypeId> {

}

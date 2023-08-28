/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountRecord } from '../../../adi/adi-internal-api';
import { KeyedCorrectnessTableRecordDefinition } from './keyed-correctness-table-record-definition';

export interface BrokerageAccountRecordTableRecordDefinition<Record extends BrokerageAccountRecord>
    extends KeyedCorrectnessTableRecordDefinition<Record> {
}

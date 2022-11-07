/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountRecord } from '../../../adi/adi-internal-api';
import { RecordTableRecordDefinition } from './record-table-record-definition';

export interface BrokerageAccountRecordTableRecordDefinition<Record extends BrokerageAccountRecord>
    extends RecordTableRecordDefinition<Record> {
}

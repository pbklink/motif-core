/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountDataRecord } from '../../adi/adi-internal-api';
import { RecordTableRecordDefinition } from './record-table-record-definition';

export abstract class BrokerageAccountDataRecordTableRecordDefinition<Record extends BrokerageAccountDataRecord>
    extends RecordTableRecordDefinition<Record> {

    BrokerageAccountDataRecordInterfaceDescriminator() {
        // no code
    }
}

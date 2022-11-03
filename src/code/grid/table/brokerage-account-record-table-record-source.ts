/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountRecord } from '../../adi/adi-internal-api';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

export abstract class BrokerageAccountRecordTableRecordSource<Record extends BrokerageAccountRecord>
    extends SingleDataItemRecordTableRecordSource<Record> {

}

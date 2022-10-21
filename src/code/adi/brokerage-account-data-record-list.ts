/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessRecordList } from '../sys/sys-internal-api';
import { BrokerageAccountDataRecord } from './brokerage-account-data-record';

export interface BrokerageAccountDataRecordList<Record extends BrokerageAccountDataRecord> extends KeyedCorrectnessRecordList<Record> {
}

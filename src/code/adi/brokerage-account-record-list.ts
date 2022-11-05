/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessList } from '../sys/sys-internal-api';
import { BrokerageAccountRecord } from './brokerage-account-record';

export interface BrokerageAccountRecordList<Record extends BrokerageAccountRecord> extends KeyedCorrectnessList<Record> {
}

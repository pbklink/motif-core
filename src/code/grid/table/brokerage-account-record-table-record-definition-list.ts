/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountRecord } from '../../adi/adi-internal-api';
import { SingleDataItemRecordTableRecordDefinitionList } from './single-data-item-record-table-record-definition-list';

export abstract class BrokerageAccountRecordTableRecordDefinitionList<Record extends BrokerageAccountRecord>
    extends SingleDataItemRecordTableRecordDefinitionList<Record> {

}

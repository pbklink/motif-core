/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountDataRecord } from '../../adi/adi-internal-api';
import { SingleDataItemRecordTableRecordDefinitionList } from './single-data-item-record-table-record-definition-list';

export abstract class BrokerageAccountDataRecordTableRecordDefinitionList<Record extends BrokerageAccountDataRecord>
    extends SingleDataItemRecordTableRecordDefinitionList<Record> {

}

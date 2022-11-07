/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    BrokerageAccountRecord
} from "../../../adi/adi-internal-api";
import { BrokerageAccountGroupTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

export abstract class BrokerageAccountGroupTableRecordSource<
        Record extends BrokerageAccountRecord,
        RecordList extends BrokerageAccountGroupRecordList<Record>
    >
    extends SingleDataItemRecordTableRecordSource<Record, RecordList> {

    protected readonly _brokerageAccountGroup: BrokerageAccountGroup

    constructor(
        definition: BrokerageAccountGroupTableRecordSourceDefinition,
    ) {
        super(definition);
        this._brokerageAccountGroup = definition.brokerageAccountGroup;
    }
}

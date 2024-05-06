/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import {
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    BrokerageAccountRecord
} from "../../../adi/internal-api";
import { TextFormatter } from '../../../services/internal-api';
import { CorrectnessBadness } from '../../../sys/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory
} from "../field-source/internal-api";
import { BrokerageAccountGroupTableRecordSourceDefinition } from './definition/internal-api';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

export abstract class BrokerageAccountGroupTableRecordSource<
        Record extends BrokerageAccountRecord,
        RecordList extends BrokerageAccountGroupRecordList<Record>
    >
    extends SingleDataItemRecordTableRecordSource<Record, RecordList> {

    readonly brokerageAccountGroup: BrokerageAccountGroup

    constructor(
        textFormatter: TextFormatter,
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        correctnessBadness: CorrectnessBadness,
        definition: BrokerageAccountGroupTableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
    ) {
        super(
            textFormatter,
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            correctnessBadness,
            definition,
            allowedFieldSourceDefinitionTypeIds,
        );
        this.brokerageAccountGroup = definition.brokerageAccountGroup;
    }
}

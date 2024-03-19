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
import { CorrectnessBadness } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import { BrokerageAccountGroupTableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

export abstract class BrokerageAccountGroupTableRecordSource<
        Record extends BrokerageAccountRecord,
        RecordList extends BrokerageAccountGroupRecordList<Record>
    >
    extends SingleDataItemRecordTableRecordSource<Record, RecordList> {

    readonly brokerageAccountGroup: BrokerageAccountGroup

    constructor(
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: BrokerageAccountGroupTableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            correctnessBadness,
            definition,
            allowedFieldSourceDefinitionTypeIds,
        );
        this.brokerageAccountGroup = definition.brokerageAccountGroup;
    }
}

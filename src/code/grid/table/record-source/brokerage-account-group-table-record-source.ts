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
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

export abstract class BrokerageAccountGroupTableRecordSource<
        Record extends BrokerageAccountRecord,
        RecordList extends BrokerageAccountGroupRecordList<Record>
    >
    extends SingleDataItemRecordTableRecordSource<Record, RecordList> {

    readonly brokerageAccountGroup: BrokerageAccountGroup

    constructor(
        textFormatterService: TextFormatterService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        definition: BrokerageAccountGroupTableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
    ) {
        super(
            textFormatterService,
            tableFieldSourceDefinitionRegistryService,
            definition.typeId,
            allowedFieldSourceDefinitionTypeIds,
        );
        this.brokerageAccountGroup = definition.brokerageAccountGroup;
    }
}

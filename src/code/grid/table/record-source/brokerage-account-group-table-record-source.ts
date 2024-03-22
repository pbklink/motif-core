/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    BrokerageAccountRecord
} from "../../../adi/internal-api";
import { CorrectnessBadness } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import { RevFieldCustomHeadingsService } from '../../field/internal-api';
import {
    TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService
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
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: BrokerageAccountGroupTableRecordSourceDefinition,
        allowedFieldSourceDefinitionTypeIds: TypedTableFieldSourceDefinition.TypeId[],
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            allowedFieldSourceDefinitionTypeIds,
        );
        this.brokerageAccountGroup = definition.brokerageAccountGroup;
    }
}

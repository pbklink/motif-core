/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessList, CorrectnessBadness, LockOpenListItem } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridFieldCustomHeadingsService } from '../../field/grid-field-internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from '../field-source/grid-table-field-source-internal-api';
import { BadnessListTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { SubscribeBadnessListTableRecordSource } from './subscribe-badness-list-table-record-source';

export abstract class BadnessListTableRecordSource<Record> extends SubscribeBadnessListTableRecordSource<Record, BadnessList<Record>> {
    readonly list: BadnessList<Record>;

    constructor(
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: BadnessListTableRecordSourceDefinition<Record>,
        allowedFieldSourceDefinitionTypeIds: readonly TypedTableFieldSourceDefinition.TypeId[],
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            allowedFieldSourceDefinitionTypeIds,
        );
        this.list = definition.list;
    }

    protected override subscribeList(opener: LockOpenListItem.Opener) {
        return this.list;
    }

    protected override unsubscribeList(opener: LockOpenListItem.Opener) {
        // noting to do
    }
}


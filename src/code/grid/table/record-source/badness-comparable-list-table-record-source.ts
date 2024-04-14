/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { BadnessList, CorrectnessBadness, LockOpenListItem } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService } from '../field-source/internal-api';
import { BadnessListTableRecordSourceDefinition } from './definition/internal-api';
import { SubscribeBadnessListTableRecordSource } from './subscribe-badness-list-table-record-source';

export abstract class BadnessListTableRecordSource<Record> extends SubscribeBadnessListTableRecordSource<Record, BadnessList<Record>> {
    readonly list: BadnessList<Record>;

    constructor(
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: BadnessListTableRecordSourceDefinition<Record>,
        allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
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


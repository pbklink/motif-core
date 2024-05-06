/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { TextFormatter } from '../../../services/internal-api';
import { BadnessList, CorrectnessBadness, LockOpenListItem } from '../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../field-source/internal-api';
import { BadnessListTableRecordSourceDefinition } from './definition/internal-api';
import { SubscribeBadnessListTableRecordSource } from './subscribe-badness-list-table-record-source';

export abstract class BadnessListTableRecordSource<Record> extends SubscribeBadnessListTableRecordSource<Record, BadnessList<Record>> {
    readonly list: BadnessList<Record>;

    constructor(
        textFormatter: TextFormatter,
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        correctnessBadness: CorrectnessBadness,
        definition: BadnessListTableRecordSourceDefinition<Record>,
        allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
    ) {
        super(
            textFormatter,
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
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


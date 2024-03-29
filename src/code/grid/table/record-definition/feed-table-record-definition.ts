/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from '../../../adi/internal-api';
import { TableFieldSourceDefinition } from '../field-source/internal-api';
import { KeyedCorrectnessTableRecordDefinition } from './keyed-correctness-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface FeedTableRecordDefinition extends KeyedCorrectnessTableRecordDefinition<Feed> {
    readonly typeId: TableFieldSourceDefinition.TypeId.Feed;
}

export namespace FeedTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is FeedTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.Feed;
    }
}

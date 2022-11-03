/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from '../../adi/adi-internal-api';
import { RecordTableRecordDefinition } from './record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface FeedTableRecordDefinition extends RecordTableRecordDefinition<Feed> {
    readonly typeId: TableRecordDefinition.TypeId.Feed;
}

export namespace FeedTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is FeedTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.Feed;
    }
}

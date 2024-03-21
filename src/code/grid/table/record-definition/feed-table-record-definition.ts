/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from '../../../adi/adi-internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { KeyedCorrectnessTableRecordDefinition } from './keyed-correctness-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface FeedTableRecordDefinition extends KeyedCorrectnessTableRecordDefinition<Feed> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.Feed;
}

export namespace FeedTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is FeedTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.Feed;
    }
}

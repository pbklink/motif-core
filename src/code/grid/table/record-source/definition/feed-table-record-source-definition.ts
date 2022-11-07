/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class FeedTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor() {
        super(TableRecordSourceDefinition.TypeId.Feed);
    }

    // no override for saveToJson()
}

export namespace FeedTableRecordSourceDefinition {
    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function createFromJson(_element: JsonElement): FeedTableRecordSourceDefinition {
        return new FeedTableRecordSourceDefinition();
    }
}

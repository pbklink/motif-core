/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, JsonElement, KeyedCorrectnessRecord } from '../../sys/sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export abstract class RecordTableRecordDefinition<Record extends KeyedCorrectnessRecord> extends TableRecordDefinition {
    constructor(typeId: TableRecordDefinition.TypeId, readonly record: Record | undefined, private _key: KeyedCorrectnessRecord.Key | undefined) {
        super(typeId);
    }

    get mapKey() {
        if (this.record !== undefined) {
            return this.record.mapKey;
        } else {
            if (this._key !== undefined) {
                return this._key.mapKey;
            } else {
                throw new AssertInternalError('DRTRDGMK66304423');
            }
        }
    }

    get key() {
        if (this._key !== undefined) {
            return this._key;
        } else {
            if (this.record !== undefined) {
                this._key = this.record.createKey();
                return this._key;
            } else {
                throw new AssertInternalError('DRTRDGK66304423');
            }
        }
    }

    saveKeyToJson(element: JsonElement) {
        this.key.saveToJson(element);
    }
}

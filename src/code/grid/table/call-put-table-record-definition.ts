/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallPut } from '../../services/services-internal-api';
import { ExternalError, JsonElement, JsonLoadError, Logger } from '../../sys/sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export class CallPutTableRecordDefinition extends TableRecordDefinition {
    private static readonly JsonTag_CallPutKey = 'CallPutKey';

    private _key: CallPut.Key;

    constructor(private _callPut: CallPut) {
        super(TableRecordDefinition.TypeId.CallPut);
        this._key = this._callPut.createKey();
    }

    get callPut() { return this._callPut; }
    get key() { return this._key; }
    get mapKey() { return this.key.mapKey; }

    callPutInterfaceDescriminator() {
        // no code
    }

    createCopy(): TableRecordDefinition {
        return this.createCallPutCopy();
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!CallPutTableRecordDefinition.is(other)) {
            return false;
        } else {
            return this.sameCallPutAs(other);
        }
    }

    loadFromJson(element: JsonElement) {
        const keyElement = element.tryGetElement(CallPutTableRecordDefinition.JsonTag_CallPutKey, 'CallPut Table Definition Record Key');
        if (keyElement === undefined) {
            throw new JsonLoadError(ExternalError.Code.CallPutTableRecordDefinitionLoadFromJsonKeyUndefined);
        } else {
            const keyOrError = CallPut.Key.tryCreateFromJson(keyElement);
            if (typeof keyOrError === 'object') {
                this._key = keyOrError;
            } else {
                throw new JsonLoadError(ExternalError.Code.CallPutTableRecordDefinitionLoadFromJsonKeyError);
            }
        }
    }

    saveKeyToJson(element: JsonElement) {
        this._key.saveToJson(element);
    }

    createCallPutCopy(): CallPutTableRecordDefinition {
        return new CallPutTableRecordDefinition(this._callPut);
    }

    sameCallPutAs(other: CallPutTableRecordDefinition): boolean {
        return CallPut.Key.isEqual(this._key, other.key);
    }
}

export namespace CallPutTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is CallPutTableRecordDefinition {
        return (definition as CallPutTableRecordDefinition).callPutInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = CallPut.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBCPTRD11198', keyOrError);
            return undefined;
        }
    }

    export function tryCreateStringKeyFromJson(element: JsonElement) {
        const key = tryCreateKeyFromJson(element);
        if (key === undefined) {
            return undefined;
        } else {
            return key.mapKey;
        }
    }
}


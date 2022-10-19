/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TopShareholder } from '../../adi/adi-internal-api';
import { ExternalError, JsonElement, JsonLoadError, Logger } from '../../sys/sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export class TopShareholderTableRecordDefinition extends TableRecordDefinition {

    private static readonly JsonTag_TopShareholderKey = 'TopShareholderKey';

    private _key: TopShareholder.Key;

    constructor(private _topShareholder: TopShareholder) {
        super(TableRecordDefinition.TypeId.TopShareholder);
        this._key = this._topShareholder.createKey();
    }

    get topShareholder() { return this._topShareholder; }
    get key() { return this._key; }
    get mapKey() { return this.key.mapKey; }

    topShareholderInterfaceDescriminator() {
        // no code
    }

    createCopy(): TableRecordDefinition {
        return this.createTopShareholderCopy();
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!TopShareholderTableRecordDefinition.is(other)) {
            return false;
        } else {
            return this.sameTopShareholderAs(other);
        }
    }

    loadFromJson(element: JsonElement) {
        const keyElement = element.tryGetElement(TopShareholderTableRecordDefinition.JsonTag_TopShareholderKey,
            'TopShareholder Table Definition Record Key');
        if (keyElement === undefined) {
            throw new JsonLoadError(ExternalError.Code.TopShareholderTableRecordDefinitionLoadFromJsonKeyUndefined);
        } else {
            const keyOrError = TopShareholder.Key.tryCreateFromJson(keyElement);
            if (typeof keyOrError === 'object') {
                this._key = keyOrError;
            } else {
                throw new JsonLoadError(ExternalError.Code.TopShareholderTableRecordDefinitionLoadFromJsonKeyError);
            }
        }
    }

    saveKeyToJson(element: JsonElement) {
        this._key.saveToJson(element);
    }

    createTopShareholderCopy(): TopShareholderTableRecordDefinition {
        return new TopShareholderTableRecordDefinition(this._topShareholder);
    }

    sameTopShareholderAs(other: TopShareholderTableRecordDefinition): boolean {
        return TopShareholder.Key.isEqual(this._key, other.key);
    }
}

export namespace TopShareholderTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is TopShareholderTableRecordDefinition {
        return (definition as TopShareholderTableRecordDefinition).topShareholderInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = TopShareholder.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBTSTRD73373', keyOrError);
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

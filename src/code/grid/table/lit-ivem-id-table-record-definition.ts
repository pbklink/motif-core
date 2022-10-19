/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { JsonElement } from '../../sys/sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export class LitIvemIdTableRecordDefinition extends TableRecordDefinition {
    constructor(private _litIvemId: LitIvemId) {
        super(TableRecordDefinition.TypeId.LitIvemId);
    }

    get key() { return this._litIvemId; }
    get mapKey() { return this.key.mapKey; }
    get litIvemId() { return this._litIvemId; }

    sameAs(other: TableRecordDefinition): boolean {
        if (!LitIvemIdTableRecordDefinition.is(other)) {
            return false;
        } else {
            return this.sameLitIvemIdAs(other);
        }
    }

    sameLitIvemIdAs(other: LitIvemIdTableRecordDefinition): boolean {
        return LitIvemId.isUndefinableEqual(this._litIvemId, other.litIvemId);
    }

    saveKeyToJson(element: JsonElement) {
        element.setJson(LitIvemIdTableRecordDefinition.jsonTag_LitIvemId, this._litIvemId.toJson());
    }

    litIvemIdInterfaceDescriminator() {
        // no code - descriminator for interface
    }

    createCopy(): TableRecordDefinition {
        return this.createLitIvemIdCopy();
    }

    createLitIvemIdCopy(): LitIvemIdTableRecordDefinition {
        return new LitIvemIdTableRecordDefinition(this._litIvemId);
    }
}

export namespace LitIvemIdTableRecordDefinition {
    export const jsonTag_LitIvemId = 'LitIvemId';

    export function is(definition: TableRecordDefinition): definition is LitIvemIdTableRecordDefinition {
        return (definition as LitIvemIdTableRecordDefinition).litIvemIdInterfaceDescriminator !== undefined;
    }

    export function tryCreateKeyFromJson(element: JsonElement) {
        return LitIvemId.tryGetFromJsonElement(element, jsonTag_LitIvemId);
    }

    export function tryCreateFromJson(element: JsonElement) {
        const litIvemId = tryCreateKeyFromJson(element);
        if (litIvemId === undefined) {
            return undefined;
        } else {
            return new LitIvemIdTableRecordDefinition(litIvemId);
        }
    }
}


/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemDetail, LitIvemId } from '../../adi/adi-internal-api';
import { JsonElement } from '../../sys/sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export class LitIvemDetailTableRecordDefinition extends TableRecordDefinition {
    private readonly _key: LitIvemDetail.Key;

    constructor(private readonly _litIvemDetail: LitIvemDetail) {
        super(TableRecordDefinition.TypeId.LitIvemDetail);
        this._key = this.litIvemDetail.key;
    }

    get key() { return this._key; }
    get mapKey() { return this.key.mapKey; }
    get litIvemDetail() { return this._litIvemDetail; }

    sameAs(other: TableRecordDefinition): boolean {
        if (!LitIvemDetailTableRecordDefinition.is(other)) {
            return false;
        } else {
            return this.sameLitIvemDetailAs(other);
        }
    }

    sameLitIvemDetailAs(other: LitIvemDetailTableRecordDefinition): boolean {
        return LitIvemId.isUndefinableEqual(this._key, other.key);
    }

    saveKeyToJson(element: JsonElement) {
        element.setJson(LitIvemDetailTableRecordDefinition.jsonTag_LitIvemId, this._litIvemDetail.litIvemId.toJson());
    }

    litIvemDetailInterfaceDescriminator() {
        // no code - descriminator for interface
    }

    createCopy(): TableRecordDefinition {
        return this.createLitIvemDetailCopy();
    }

    createLitIvemDetailCopy(): LitIvemDetailTableRecordDefinition {
        return new LitIvemDetailTableRecordDefinition(this._litIvemDetail);
    }
}

export namespace LitIvemDetailTableRecordDefinition {
    export const jsonTag_LitIvemId = 'LitIvemId';

    export function is(definition: TableRecordDefinition): definition is LitIvemDetailTableRecordDefinition {
        return (definition as LitIvemDetailTableRecordDefinition).litIvemDetailInterfaceDescriminator !== undefined;
    }

    // export function tryCreateKeyFromJson(element: JsonElement) {
    //     return element.tryGetLitIvemId(jsonTag_LitIvemId);
    // }

    // export function tryCreateFromJson(element: JsonElement) {
    //     const litIvemId = tryCreateKeyFromJson(element);
    //     if (litIvemId === undefined) {
    //         return undefined;
    //     } else {
    //         return new LitIvemDetailTableRecordDefinition(litIvemId);
    //     }
    // }
}

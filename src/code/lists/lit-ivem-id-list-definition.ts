/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { JsonElement } from '../sys/json-element';
import { Guid } from '../sys/types';

export abstract class LitIvemIdListDefinition {
    constructor(readonly typeId: LitIvemIdListDefinition.TypeId) {

    }

    abstract loadFromJson(element: JsonElement): void;
    abstract saveToJson(element: JsonElement): void;
}

export namespace LitIvemIdListDefinition {
    export const enum TypeId {
        Explicit,
        ZenithWatchlist,
        ScanMatches,
    }
}

export class ExplicitLitIvemIdListDefinition extends LitIvemIdListDefinition {
    readonly litIvemIds = new Array<LitIvemId>();

    constructor() {
        super(LitIvemIdListDefinition.TypeId.Explicit);
    }

    loadFromJson(element: JsonElement) {

    }

    saveToJson(element: JsonElement) {

    }
}

export class ZenithWatchlistLitIvemIdListDefinition extends LitIvemIdListDefinition {
    constructor(readonly watchlistId: string) {
        super(LitIvemIdListDefinition.TypeId.ZenithWatchlist);
    }

    loadFromJson(element: JsonElement) {

    }

    saveToJson(element: JsonElement) {

    }
}


export class ScanMatcheslistLitIvemIdListDefinition extends LitIvemIdListDefinition {
    constructor(readonly scanId: string) {
        super(LitIvemIdListDefinition.TypeId.ScanMatches);
    }

    loadFromJson(element: JsonElement) {

    }

    saveToJson(element: JsonElement) {

    }
}

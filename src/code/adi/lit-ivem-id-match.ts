/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId, KeyedRecord, MapKey } from '../sys/sys-internal-api';
import { LitIvemId, LitIvemIdMatchesDataMessage } from './common/adi-common-internal-api';
import { Match } from './match';

export class LitIvemIdMatch extends Match {
    override readonly mapKey: MapKey;
    readonly litIvemId: LitIvemId;

    constructor(
        change: LitIvemIdMatchesDataMessage.AddUpdateChange,
        correctnessId: CorrectnessId
    ) {
        super(change, correctnessId);
        this.litIvemId = change.symbol;
    }

    createKey(): LitIvemIdMatch.Key {
        return new LitIvemIdMatch.Key(this.mapKey);
    }
}

export namespace LitIvemIdMatch {
    export class Key implements KeyedRecord.Key {
        constructor(public readonly mapKey: string) {

        }
    }
}

/**
 * %license Motif
 * (c) 2022 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId, KeyedCorrectnessListItem, MapKey } from '../sys/sys-internal-api';
import { LitIvemIdMatchesDataMessage } from './common/adi-common-internal-api';
import { Match } from './match';
import { MatchRecord } from './match-record';

export class LitIvemIdMatch extends Match implements MatchRecord {
    override readonly mapKey: MapKey;


    constructor(
        change: LitIvemIdMatchesDataMessage.AddUpdateChange,
        correctnessId: CorrectnessId
    ) {

        super(change, correctnessId);
    }

    createKey(): LitIvemIdMatch.Key {
        return new LitIvemIdMatch.Key(this.mapKey);
    }


    // override update(change: LitIvemIdMatchesDataMessage.AddUpdateChange) {
    //     super.update(change);

    //     if (LitIvemId.isEqual(change.symbol, ))
    //     const valueChanges = new Array<Order.ValueChange>(Order.Field.count);
    //     let changedIdx = 0;
    // }

    // private notifyChanged() {
    //     const handlers = this._changedMultiEvent.copyHandlers();
    //     for (let index = 0; index < handlers.length; index++) {
    //         handlers[index](valueChanges);
    //     }
    // }

}

export namespace LitIvemIdMatch {
    export class Key implements KeyedCorrectnessListItem.Key {
        constructor(public readonly mapKey: string) {

        }

        // saveToJson(element: JsonElement): void {
        //     // not currently used
        // }
    }
}

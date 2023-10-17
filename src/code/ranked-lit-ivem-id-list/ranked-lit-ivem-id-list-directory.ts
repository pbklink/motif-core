/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDirectoryItem } from '../services/services-internal-api';
import { BadnessList, ComparableList } from '../sys/sys-internal-api';

export class RankedLitIvemIdListDirectory {
    readonly items = new ComparableList<RankedLitIvemIdListDirectoryItem>();
    constructor(private readonly _sources: readonly BadnessList<RankedLitIvemIdListDirectoryItem>[]) {
        let itemCount = 0;
        for (const source of this._sources) {
            itemCount += source.count;
        }
        this.items.capacity = itemCount;
        for (const source of this._sources) {
            const sourceCount = source.count;
            for (let i = 0; i < sourceCount; i++)  {
                const item = source.getAt(i);
                this.items.add(item);
            }

            // this._x = source.subscribeListChangeEvent(
            //     (listChangeTypeId, idx, count) => this.handleSourceListChange(source, listChangeTypeId, idx, count)
            // )
        }
    }

    destroy() {
        //
    }
}

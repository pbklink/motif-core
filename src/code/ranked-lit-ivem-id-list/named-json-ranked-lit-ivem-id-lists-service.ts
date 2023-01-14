/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenList } from '../sys/sys-internal-api';
import { NamedJsonRankedLitIvemIdListImplementation } from './named-json-ranked-lit-ivem-id-list-implementation';
import { NamedJsonRankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-internal-api';

export class NamedJsonRankedLitIvemIdListsService extends LockOpenList<NamedJsonRankedLitIvemIdListImplementation> {
    new(definition: NamedJsonRankedLitIvemIdListDefinition): NamedJsonRankedLitIvemIdListImplementation {
        const index = this.count;
        const implementation = new NamedJsonRankedLitIvemIdListImplementation(definition, index, () => this.handleListModified());
        this.addItem(implementation);
        return implementation;
    }

    private handleListModified() {
        // todo
    }
}

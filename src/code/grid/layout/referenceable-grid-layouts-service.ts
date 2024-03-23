/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableGridLayoutDefinition } from '../../rev/internal-api';
import { LockOpenList } from '../../sys/internal-api';
import { ReferenceableGridLayout } from './referenceable-grid-layout';

export class ReferenceableGridLayoutsService extends LockOpenList<ReferenceableGridLayout> {
    getOrNew(definition: RevReferenceableGridLayoutDefinition): ReferenceableGridLayout {
        let source = this.getItemByKey(definition.id);
        if (source === undefined) {
            source = this.createReferenceableGridLayout(definition);
            this.addItem(source);
        }
        return source;
    }

    private createReferenceableGridLayout(definition: RevReferenceableGridLayoutDefinition) {
        const index = this.count;
        const result = new ReferenceableGridLayout(definition, index);
        return result;
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenList } from '../../sys/sys-internal-api';
import { ReferenceableGridLayoutDefinition } from './definition/grid-layout-definition-internal-api';
import { ReferenceableGridLayout } from './referenceable-grid-layout';

export class ReferenceableGridLayoutsService extends LockOpenList<ReferenceableGridLayout> {
    getOrNew(definition: ReferenceableGridLayoutDefinition): ReferenceableGridLayout {
        let source = this.getItemByKey(definition.id);
        if (source === undefined) {
            source = this.createReferenceableGridLayout(definition);
            this.addItem(source);
        }
        return source;
    }

    private createReferenceableGridLayout(definition: ReferenceableGridLayoutDefinition) {
        const index = this.count;
        const result = new ReferenceableGridLayout(definition, index);
        return result;
    }
}

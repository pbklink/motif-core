/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableGridLayout, RevReferenceableGridLayoutDefinition, RevReferenceableGridLayoutsService } from '@xilytix/rev-data-source';
import { LockOpenList } from '../../sys/internal-api';

export class ReferenceableGridLayoutsService extends LockOpenList<RevReferenceableGridLayout> implements RevReferenceableGridLayoutsService {
    getOrNew(definition: RevReferenceableGridLayoutDefinition): RevReferenceableGridLayout {
        let source = this.getItemByKey(definition.id);
        if (source === undefined) {
            source = this.createReferenceableGridLayout(definition);
            this.add(source);
        }
        return source;
    }

    private createReferenceableGridLayout(definition: RevReferenceableGridLayoutDefinition) {
        const index = this.count;
        const result = new RevReferenceableGridLayout(definition, index);
        return result;
    }
}

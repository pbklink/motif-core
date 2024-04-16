/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevReferenceableColumnLayout, RevReferenceableColumnLayoutDefinition, RevReferenceableColumnLayoutsService } from '@xilytix/rev-data-source';
import { LockOpenList } from '../../sys/internal-api';

export class ReferenceableColumnLayoutsService extends LockOpenList<RevReferenceableColumnLayout> implements RevReferenceableColumnLayoutsService {
    getOrNew(definition: RevReferenceableColumnLayoutDefinition): RevReferenceableColumnLayout {
        let source = this.getItemByKey(definition.id);
        if (source === undefined) {
            source = this.createReferenceableColumnLayout(definition);
            this.add(source);
        }
        return source;
    }

    private createReferenceableColumnLayout(definition: RevReferenceableColumnLayoutDefinition) {
        const index = this.count;
        const result = new RevReferenceableColumnLayout(definition, index);
        return result;
    }
}

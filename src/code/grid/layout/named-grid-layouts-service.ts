/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenList } from '../../sys/sys-internal-api';
import { NamedGridLayoutDefinition } from './definition/grid-layout-definition-internal-api';
import { NamedGridLayout } from './named-grid-layout';

export class NamedGridLayoutsService extends LockOpenList<NamedGridLayout> {
    getOrNew(definition: NamedGridLayoutDefinition): NamedGridLayout {
        let source = this.getItemByKey(definition.id);
        if (source === undefined) {
            source = this.createNamedGridLayout(definition);
            this.addItem(source);
        }
        return source;
    }

    private createNamedGridLayout(definition: NamedGridLayoutDefinition) {
        const index = this.count;
        const result = new NamedGridLayout(definition, index);
        return result;
    }
}

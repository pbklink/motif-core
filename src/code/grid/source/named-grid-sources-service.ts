/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenList } from '../../sys/sys-internal-api';
import { NamedGridSourceDefinition } from './definition/grid-source-definition-internal-api';
import { NamedGridSource } from './named-grid-source';

export class NamedGridSourcesService extends LockOpenList<NamedGridSource> {
    getOrNew(definition: NamedGridSourceDefinition): NamedGridSource {
        let source = this.getItemByKey(definition.id);
        if (source === undefined) {
            source = this.createNamedGridSource(definition);
            this.addItem(source);
        }
        return source;
    }

    private createNamedGridSource(definition: NamedGridSourceDefinition) {
        const index = this.count;
        const result = new NamedGridSource(definition, index);
        return result;
    }
}

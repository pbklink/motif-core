/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, LockOpenListItem } from '../../sys/internal-api';
import { ReferenceableGridLayoutDefinition } from './definition/internal-api';
import { GridLayout } from './grid-layout';

/** @public */
export class ReferenceableGridLayout extends GridLayout implements LockOpenListItem<ReferenceableGridLayout> {
    readonly name: string;
    readonly upperCaseName: string;

    constructor(
        definition: ReferenceableGridLayoutDefinition,
        index: Integer,
    ) {
        const id = definition.id;
        super(definition, id, id);

        this.name = definition.name;
        this.upperCaseName = this.name.toUpperCase();
        this.index = index;
    }

    override createDefinition(): ReferenceableGridLayoutDefinition {
        const definitionColumns = this.createDefinitionColumns();
        return new ReferenceableGridLayoutDefinition(this.id, this.name, definitionColumns);
    }
}

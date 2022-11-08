/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../sys/json-element';
import { ExplicitLitIvemIdList } from './explicit-lit-ivem-id-list';
import { LitIvemIdList } from './lit-ivem-id-list';
import { ExplicitLitIvemIdListDefinition, LitIvemIdListDefinition } from './lit-ivem-id-list-definition';

export class LitIvemIdListFactoryService {
    tryCreateDefinitionFromJson(element: JsonElement): LitIvemIdListDefinition {
        return new ExplicitLitIvemIdListDefinition();
    }

    createFromDefinition(definition: LitIvemIdListDefinition): LitIvemIdList {
        return new ExplicitLitIvemIdList('', '', '');
    }
}

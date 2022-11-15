/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../sys/sys-internal-api';
import { ExplicitLitIvemIdListDefinition, LitIvemIdListDefinition } from './definition/lit-ivem-id-list-definition-internal-api';
import { ExplicitLitIvemIdList } from './explicit-lit-ivem-id-list';
import { LitIvemIdList } from './lit-ivem-id-list';

/** @public */
export class LitIvemIdListFactoryService {
    tryCreateDefinitionFromJson(element: JsonElement): LitIvemIdListDefinition {
        return new ExplicitLitIvemIdListDefinition();
    }

    createFromDefinition(definition: LitIvemIdListDefinition): LitIvemIdList {
        return new ExplicitLitIvemIdList('', '', '');
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdListDefinition } from './definition/lit-ivem-id-list-definition-internal-api';
import { ExplicitLitIvemIdList } from './explicit-lit-ivem-id-list';
import { LitIvemIdList } from './lit-ivem-id-list';

/** @public */
export class LitIvemIdListFactoryService {
    createFromDefinition(definition: LitIvemIdListDefinition): LitIvemIdList {
        return new ExplicitLitIvemIdList('', '', '');
    }
}

/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../sys/json-element';
import { LitIvemIdList } from './lit-ivem-id-list';
import { UserLitIvemIdList } from './user-lit-ivem-id-list';

export class LitIvemIdListFactoryService {
    tryCreateFromJson(element: JsonElement): LitIvemIdList {
        return new UserLitIvemIdList('', '', '');
    }
}

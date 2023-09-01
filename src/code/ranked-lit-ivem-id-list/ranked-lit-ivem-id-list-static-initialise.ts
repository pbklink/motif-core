/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdListDefinitionStaticInitialise } from './definition/ranked-lit-ivem-id-list-definition-static-initialise';
import { RankedLitIvemIdModule } from './ranked-lit-ivem-id';

/** @internal */
export namespace RankedLitIvemIdListStaticInitialise {
    export function initialise() {
        RankedLitIvemIdListDefinitionStaticInitialise.initialise();
        RankedLitIvemIdModule.initialiseStatic();
    }
}
